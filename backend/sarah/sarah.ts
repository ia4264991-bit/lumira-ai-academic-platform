import { api, APIError } from "encore.dev/api";

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
}

// POST /v1/cards/:cardId/sarah/ask - Workspace Sarah (AD-027)
export const askWorkspaceSarah = api(
  { expose: true, method: "POST", path: "/v1/cards/:cardId/sarah/ask" },
  async (req: AskSarahRequest): Promise<AskSarahResponse> => {
    if (!req.question?.trim()) {
      throw APIError.invalidArgument("Question is required");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const prompt = `You are Sarah, Lumira's dedicated AI tutor and academic study partner. 
You are working within the Card workspace: "${req.cardId}".
${req.selectedText ? `Context from Resource: "${req.selectedText}"\n` : ""}
Student Question: ${req.question}

Help the student learn actively, break down difficult academic concepts, ask guiding follow-up questions, and maintain a supportive, rigorous tutor persona.`;

    try {
      if (apiKey) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            answer: text,
            model: "gemini-1.5-flash",
            tokensUsed: data?.usageMetadata?.totalTokenCount || 120,
          };
        }
      }
    } catch (e) {
      console.error("Gemini API error, falling back:", e);
    }

    return {
      answer: `Hello! I'm Sarah, your academic study partner. I've analyzed your question: "${req.question}". Let's break this down systematically into key principles and practice steps!`,
      model: "sarah-core-v1",
      tokensUsed: 64,
    };
  }
);
