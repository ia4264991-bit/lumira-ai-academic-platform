import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { getAuthData } from "~encore/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cardDB } from "../card/card";
import { assertSarahAuthorized, getAuthoritativeUsage, SarahUsageMeter } from "./sarah_security";

export interface ChatMessage {
  role: "user" | "model" | "assistant";
  content: string;
  timestamp?: string;
}

export interface AskSarahRequest {
  cardId: string;
  question: string;
  conversationHistory?: ChatMessage[];
  resourceId?: string;
  selectedText?: string;
}

export interface AskSarahResponse {
  answer: string;
  model: string;
  tokensUsed: number;
  usageMeter: SarahUsageMeter;
}

export interface SarahGenerateRequest {
  cardId: string;
  type: "quiz" | "flashcards" | "summary";
  topic?: string;
  resourceId?: string;
}

// Set with: encore secret set --type dev,prod GeminiApiKey
const geminiApiKey = secret("GeminiApiKey");

let genAI: GoogleGenerativeAI | null = null;
function getGenAI(): GoogleGenerativeAI | null {
  const key = geminiApiKey();
  if (!key) return null;
  if (!genAI) genAI = new GoogleGenerativeAI(key);
  return genAI;
}

// Pulls real workspace context so Sarah is grounded in the caller's own resources,
// not a template. Truncated per-resource to keep prompts a reasonable size (AD-054
// zero-trust note: this authorization was already checked by the caller before this
// runs, since retrieval must never happen before authorization).
async function buildGroundingContext(cardId: string): Promise<string> {
  const rows = await cardDB.query`
    SELECT title, extracted_text as "extractedText"
    FROM resource
    WHERE card_id = ${cardId} AND extracted_text IS NOT NULL AND status = 'READY'
    ORDER BY created_at DESC
    LIMIT 6
  `;
  const chunks: string[] = [];
  for await (const row of rows) {
    if (row.extractedText) {
      chunks.push(`## ${row.title}\n${String(row.extractedText).slice(0, 2000)}`);
    }
  }
  return chunks.join("\n\n");
}

// GET /v1/sarah/usage/me - Server-authoritative usage meter (AD-037)
export const getSarahUsage = api(
  { expose: true, method: "GET", path: "/v1/sarah/usage/me", auth: true },
  async (): Promise<SarahUsageMeter> => {
    const userId = getAuthData()!.userID;
    return getAuthoritativeUsage(userId);
  }
);

// POST /v1/cards/:cardId/sarah/ask - Workspace Sarah (AD-027, AD-054, AD-058)
export const askWorkspaceSarah = api(
  { expose: true, method: "POST", path: "/v1/cards/:cardId/sarah/ask", auth: true },
  async (req: AskSarahRequest): Promise<AskSarahResponse> => {
    const userId = getAuthData()!.userID;

    // AD-054: Authorization determined and enforced before any content enters retrieval
    await assertSarahAuthorized(userId, req.cardId);

    if (!req.question?.trim()) {
      throw APIError.invalidArgument("Question is required");
    }

    const grounding = await buildGroundingContext(req.cardId);
    const historyText = (req.conversationHistory || [])
      .slice(-6)
      .map(m => `${m.role === "user" ? "Student" : "Sarah"}: ${m.content}`)
      .join("\n");

    const prompt = `You are Sarah, an academic tutor grounded ONLY in the workspace resources below.
If the resources don't cover the question, say so plainly rather than inventing facts.

${grounding ? `WORKSPACE RESOURCES:\n${grounding}\n` : "(No workspace resources uploaded yet - answer generally and suggest the student upload lecture materials for grounded answers.)\n"}
${historyText ? `RECENT CONVERSATION:\n${historyText}\n` : ""}
${req.selectedText ? `The student highlighted this passage: "${req.selectedText}"\n` : ""}
STUDENT QUESTION: ${req.question}

Answer in a rigorous, Socratic tutoring style: identify the core principle, break it down step by step, then pose one active-recall follow-up question.`;

    let answer: string;
    let tokens: number;
    let modelUsed: string;

    const ai = getGenAI();
    if (ai) {
      try {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        answer = result.response.text();
        tokens = result.response.usageMetadata?.totalTokenCount || Math.ceil(prompt.length / 4);
        modelUsed = "gemini-1.5-flash";
      } catch (err: any) {
        console.error("Gemini request failed:", err?.message || err);
        throw APIError.unavailable("Sarah's AI service is temporarily unavailable. Please try again shortly.");
      }
    } else {
      throw APIError.failedPrecondition(
        "Sarah's AI backend isn't configured yet - set the GeminiApiKey secret (encore secret set --type dev,prod GeminiApiKey)."
      );
    }

    // Record server-authoritative usage event (AD-026 & AD-037)
    await cardDB.exec`
      INSERT INTO course_space_event (card_id, type, actor_user_id, payload)
      VALUES (${req.cardId}, 'SARAH_QUERY', ${userId}, jsonb_build_object('tokens', ${tokens}, 'model', ${modelUsed}))
    `;

    const usageMeter = await getAuthoritativeUsage(userId);

    return { answer, model: modelUsed, tokensUsed: tokens, usageMeter };
  }
);

interface FlashcardsPayload { type: "flashcards"; title: string; cards: { front: string; back: string; hint?: string }[] }
interface QuizPayload { type: "quiz"; title: string; questions: { id: string; question: string; options: { id: string; text: string }[]; correctOptionId: string; explanation: string }[] }
interface SummaryPayload { type: "summary"; title: string; content: string }

// POST /v1/cards/:cardId/sarah/generate - Artifact Generation (AD-035, AD-036, AD-055)
// Generates real content via Gemini (schema-constrained via response_mime_type: json)
// grounded in the workspace's resources, and persists it to study_artifact so it's
// retrievable afterwards instead of living only in the response body.
export const generateArtifact = api(
  { expose: true, method: "POST", path: "/v1/cards/:cardId/sarah/generate", auth: true },
  async (req: SarahGenerateRequest): Promise<FlashcardsPayload | QuizPayload | SummaryPayload> => {
    const userId = getAuthData()!.userID;
    await assertSarahAuthorized(userId, req.cardId);

    const ai = getGenAI();
    if (!ai) {
      throw APIError.failedPrecondition(
        "Sarah's AI backend isn't configured yet - set the GeminiApiKey secret (encore secret set --type dev,prod GeminiApiKey)."
      );
    }

    const grounding = await buildGroundingContext(req.cardId);
    if (!grounding) {
      throw APIError.failedPrecondition("Upload at least one resource to this workspace before generating study material from it.");
    }

    const schemaHint =
      req.type === "flashcards"
        ? `{"title": string, "cards": [{"front": string, "back": string, "hint": string}] (5-8 cards)}`
        : req.type === "quiz"
        ? `{"title": string, "questions": [{"id": string, "question": string, "options": [{"id": string, "text": string}] (4 options), "correctOptionId": string, "explanation": string}] (4-6 questions)}`
        : `{"title": string, "content": string}`;

    const prompt = `Based ONLY on the following workspace resources, generate ${req.type}${req.topic ? ` focused on "${req.topic}"` : ""}.
Respond with ONLY valid JSON matching this shape (no markdown fences): ${schemaHint}

WORKSPACE RESOURCES:
${grounding}`;

    let parsed: any;
    try {
      const model = ai.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });
      const result = await model.generateContent(prompt);
      parsed = JSON.parse(result.response.text());
    } catch (err: any) {
      console.error("Gemini generation failed:", err?.message || err);
      throw APIError.unavailable("Sarah couldn't generate that right now. Please try again shortly.");
    }

    const payload = { type: req.type === "flashcards" ? "flashcards" : req.type, ...parsed };

    await cardDB.exec`
      INSERT INTO study_artifact (card_id, created_by, type, title, content, source_resource_id)
      VALUES (${req.cardId}, ${userId}, ${req.type === "flashcards" ? "flashcardset" : req.type}, ${parsed.title || req.type}, ${JSON.stringify(payload)}::jsonb, ${req.resourceId || null})
    `;
    await cardDB.exec`
      INSERT INTO course_space_event (card_id, type, actor_user_id, payload)
      VALUES (${req.cardId}, 'STUDY_ARTIFACT_GENERATED', ${userId}, jsonb_build_object('artifactType', ${req.type}))
    `;

    return payload;
  }
);

// GET /v1/cards/:cardId/study-artifacts?type=quiz|flashcardset|summary
export const listStudyArtifacts = api(
  { expose: true, method: "GET", path: "/v1/cards/:cardId/study-artifacts", auth: true },
  async ({ cardId, type }: { cardId: string; type?: string }): Promise<{ artifacts: any[] }> => {
    const userId = getAuthData()!.userID;
    await assertSarahAuthorized(userId, cardId);
    const rows = type
      ? await cardDB.query`SELECT id, type, title, content, created_at as "createdAt" FROM study_artifact WHERE card_id = ${cardId} AND type = ${type} ORDER BY created_at DESC`
      : await cardDB.query`SELECT id, type, title, content, created_at as "createdAt" FROM study_artifact WHERE card_id = ${cardId} ORDER BY created_at DESC`;
    const artifacts: any[] = [];
    for await (const row of rows) artifacts.push({ id: row.id, type: row.type, title: row.title, ...row.content, createdAt: row.createdAt.toISOString() });
    return { artifacts };
  }
);
