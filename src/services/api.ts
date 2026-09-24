// Lumira Client API connecting to Encore Backend / Mock In-Memory Persistence
import { Card, Resource, Note, FlashcardSet, Quiz, CourseSpaceEvent, SarahMessage } from "../types/lumira";

const BASE_URL = "http://localhost:4000";

// Pre-seeded initial data adhering to AD-019, AD-020, AD-026
const INITIAL_CARDS: Card[] = [
  {
    id: "card-1",
    ownerId: "user-1",
    name: "Advanced Cellular & Molecular Biology",
    color: "from-emerald-600 to-teal-700",
    isShared: false,
    requireApproval: false,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    role: "OWNER",
    stats: { resourcesCount: 3, notesCount: 5, quizzesCount: 2, flashcardsCount: 24 }
  },
  {
    id: "card-2",
    ownerId: "user-1",
    name: "Linear Algebra & Vector Calculus",
    color: "from-blue-600 to-indigo-700",
    isShared: true,
    shareToken: "linear-alg-2026",
    requireApproval: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    role: "OWNER",
    stats: { resourcesCount: 2, notesCount: 3, quizzesCount: 1, flashcardsCount: 16 }
  },
  {
    id: "card-3",
    ownerId: "user-2",
    name: "Organic Chemistry II Study Space",
    color: "from-amber-600 to-rose-700",
    isShared: true,
    shareToken: "orgo-chem-study",
    requireApproval: false,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    role: "MEMBER",
    stats: { resourcesCount: 4, notesCount: 7, quizzesCount: 3, flashcardsCount: 32 }
  }
];

const INITIAL_RESOURCES: Record<string, Resource[]> = {
  "card-1": [
    {
      id: "res-1",
      owningCardId: "card-1",
      title: "Mitochondrial Bioenergetics & ATP Synthase.pdf",
      mimeType: "application/pdf",
      sizeBytes: 2450000,
      status: "READY",
      extractedText: "ATP synthase is a protein that catalyzes the formation of the energy storage molecule adenosine triphosphate (ATP) using adenosine diphosphate (ADP) and inorganic phosphate (Pi). The overall reaction sequence is: ADP + Pi + 2H+out ⇌ ATP + H2O + 2H+in.",
      createdAt: new Date().toISOString(),
      isShared: true,
    },
    {
      id: "res-2",
      owningCardId: "card-1",
      title: "Signal Transduction Pathways Lecture 4.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1850000,
      status: "READY",
      extractedText: "G protein-coupled receptors (GPCRs) constitute a large protein family of receptors that detect molecules outside the cell and activate internal signal transduction pathways and, ultimately, cellular responses.",
      createdAt: new Date().toISOString(),
      isShared: true,
    }
  ],
  "card-2": [
    {
      id: "res-3",
      owningCardId: "card-2",
      title: "Eigenvalues, Eigenvectors and Diagonalization.pdf",
      mimeType: "application/pdf",
      sizeBytes: 3100000,
      status: "READY",
      extractedText: "In linear algebra, an eigenvector or characteristic vector of a linear transformation is a nonzero vector that changes at most by a scalar factor when that linear transformation is applied to it.",
      createdAt: new Date().toISOString(),
      isShared: true,
    }
  ]
};

const INITIAL_NOTES: Record<string, Note[]> = {
  "card-1": [
    {
      id: "note-1",
      owningCardId: "card-1",
      title: "Key Takeaways: Complex IV & Cytochrome c",
      content: "Cytochrome c oxidase (Complex IV) is the final enzyme of the electron transport chain. It receives electrons from 4 cytochrome c molecules and transfers them to one oxygen molecule, producing 2 H2O molecules while pumping 4 protons across the inner membrane.",
      isShared: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]
};

const INITIAL_FLASHCARDS: Record<string, FlashcardSet[]> = {
  "card-1": [
    {
      id: "set-1",
      owningCardId: "card-1",
      title: "Electron Transport Chain Core Concepts",
      isShared: false,
      createdAt: new Date().toISOString(),
      cards: [
        { id: "fc-1", front: "What is the primary proton pump in Complex I?", back: "NADH dehydrogenase (Complex I) transfers electrons from NADH to CoQ while pumping 4 H+.", hint: "Complex I cofactor", mastered: true },
        { id: "fc-2", front: "Which complex does NOT pump protons?", back: "Complex II (Succinate dehydrogenase)", hint: "Produces FADH2", mastered: false },
        { id: "fc-3", front: "What is the terminal electron acceptor in aerobic respiration?", back: "Molecular Oxygen (O2), which is reduced to water.", hint: "Essential for breathing", mastered: false }
      ]
    }
  ]
};

const INITIAL_QUIZZES: Record<string, Quiz[]> = {
  "card-1": [
    {
      id: "quiz-1",
      owningCardId: "card-1",
      title: "Cellular Respiration Mastery Assessment",
      description: "Test your understanding of oxidative phosphorylation and proton gradients.",
      isShared: false,
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: "q-1",
          question: "How many protons are pumped across the inner mitochondrial membrane per NADH oxidized?",
          options: [
            { id: "opt-1", text: "4 protons" },
            { id: "opt-2", text: "6 protons" },
            { id: "opt-3", text: "10 protons" },
            { id: "opt-4", text: "12 protons" }
          ],
          correctOptionId: "opt-3",
          explanation: "Complex I pumps 4 H+, Complex III pumps 4 H+, and Complex IV pumps 2 H+ (net), totaling approximately 10 H+ per NADH."
        }
      ]
    }
  ]
};

const INITIAL_EVENTS: Record<string, CourseSpaceEvent[]> = {
  "card-2": [
    {
      id: "ev-1",
      cardId: "card-2",
      type: "COURSE_SPACE_CREATED",
      actorUserId: "user-1",
      actorName: "Dr. Adams",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      payload: { title: "Course Space initiated with shared invite link" }
    },
    {
      id: "ev-2",
      cardId: "card-2",
      type: "RESOURCE_ADDED",
      actorUserId: "user-1",
      actorName: "Dr. Adams",
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      payload: { resourceTitle: "Eigenvalues, Eigenvectors and Diagonalization.pdf" }
    },
    {
      id: "ev-3",
      cardId: "card-2",
      type: "MEMBER_JOINED",
      actorUserId: "user-2",
      actorName: "Alex Rivera",
      createdAt: new Date().toISOString(),
      payload: { note: "Joined via App Link" }
    }
  ]
};

// Local storage backing for instant reactivity
const getStoredCards = (): Card[] => {
  const data = localStorage.getItem("lumira_cards");
  return data ? JSON.parse(data) : INITIAL_CARDS;
};

const saveStoredCards = (cards: Card[]) => {
  localStorage.setItem("lumira_cards", JSON.stringify(cards));
};

export const LumiraAPI = {
  // AD-019: List Cards (mine) vs Course Spaces (scope=shared)
  async getCards(scope?: "shared"): Promise<Card[]> {
    try {
      const res = await fetch(`${BASE_URL}/v1/cards${scope ? `?scope=${scope}` : ""}`);
      if (res.ok) {
        const data = await res.json();
        return data.cards;
      }
    } catch {
      // Fallback to client state
    }
    const cards = getStoredCards();
    if (scope === "shared") {
      return cards.filter(c => c.isShared);
    }
    return cards;
  },

  async createCard(name: string, color: string = "from-indigo-600 to-violet-700"): Promise<Card> {
    try {
      const res = await fetch(`${BASE_URL}/v1/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      if (res.ok) return await res.json();
    } catch {}

    const newCard: Card = {
      id: `card-${Date.now()}`,
      ownerId: "user-1",
      name,
      color,
      isShared: false,
      requireApproval: false,
      createdAt: new Date().toISOString(),
      role: "OWNER",
      stats: { resourcesCount: 0, notesCount: 0, quizzesCount: 0, flashcardsCount: 0 }
    };
    const list = getStoredCards();
    list.unshift(newCard);
    saveStoredCards(list);
    return newCard;
  },

  async convertToCourseSpace(cardId: string): Promise<Card> {
    try {
      const res = await fetch(`${BASE_URL}/v1/cards/${cardId}/share`, { method: "POST" });
      if (res.ok) return await res.json();
    } catch {}

    const list = getStoredCards();
    const idx = list.findIndex(c => c.id === cardId);
    if (idx !== -1) {
      list[idx].isShared = true;
      list[idx].shareToken = `lumira-${Math.random().toString(36).substring(2, 9)}`;
      list[idx].role = "OWNER";
      saveStoredCards(list);
      return list[idx];
    }
    throw new Error("Card not found");
  },

  async getResources(cardId: string): Promise<Resource[]> {
    return INITIAL_RESOURCES[cardId] || [];
  },

  async addResource(cardId: string, title: string, extractedText: string): Promise<Resource> {
    const res: Resource = {
      id: `res-${Date.now()}`,
      owningCardId: cardId,
      title,
      mimeType: "application/pdf",
      sizeBytes: 1500000,
      status: "READY",
      extractedText,
      createdAt: new Date().toISOString(),
      isShared: true,
    };
    if (!INITIAL_RESOURCES[cardId]) INITIAL_RESOURCES[cardId] = [];
    INITIAL_RESOURCES[cardId].unshift(res);
    return res;
  },

  async getNotes(cardId: string): Promise<Note[]> {
    return INITIAL_NOTES[cardId] || [];
  },

  async addNote(cardId: string, title: string, content: string): Promise<Note> {
    const note: Note = {
      id: `note-${Date.now()}`,
      owningCardId: cardId,
      title,
      content,
      isShared: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!INITIAL_NOTES[cardId]) INITIAL_NOTES[cardId] = [];
    INITIAL_NOTES[cardId].unshift(note);
    return note;
  },

  async getFlashcardSets(cardId: string): Promise<FlashcardSet[]> {
    return INITIAL_FLASHCARDS[cardId] || [];
  },

  async getQuizzes(cardId: string): Promise<Quiz[]> {
    return INITIAL_QUIZZES[cardId] || [];
  },

  async getEvents(cardId: string): Promise<CourseSpaceEvent[]> {
    return INITIAL_EVENTS[cardId] || [];
  },

  // AD-027: Workspace Sarah & Contextual Sarah grounded in Card/Resource
  async askSarah(params: {
    cardId: string;
    question: string;
    resourceTitle?: string;
    selectedText?: string;
  }): Promise<string> {
    try {
      const res = await fetch(`${BASE_URL}/v1/cards/${params.cardId}/sarah/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        return data.answer;
      }
    } catch {}

    // In-client Sarah response with pedagogical rigor
    return `### Sarah's Study Guidance:
Regarding **"${params.question}"**:

${params.selectedText ? `> Grounded in passage: *"${params.selectedText}"*\n` : ""}
1. **Core Mechanism**: Let's review the fundamental equilibrium and kinetic pathway involved.
2. **Key Distinction**: Make sure you distinguish between the thermodynamic driving force and the enzymatic regulation.
3. **Practice Question**: How would an uncoupling agent affect this process in a biological cell?`;
  }
};
