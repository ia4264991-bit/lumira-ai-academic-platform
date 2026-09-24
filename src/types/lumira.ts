// Lumira Domain Types strictly derived from AD-019 through AD-056

export type Role = "OWNER" | "ADMIN" | "MEMBER";
export type MembershipStatus = "ACTIVE" | "INVITED" | "LEFT" | "REMOVED";

export interface Card {
  id: string;
  ownerId: string;
  name: string;
  color: string;
  isShared: boolean;
  shareToken?: string;
  requireApproval: boolean;
  createdAt: string;
  role?: Role;
  stats?: {
    resourcesCount: number;
    notesCount: number;
    quizzesCount: number;
    flashcardsCount: number;
  };
}

export interface Resource {
  id: string;
  owningCardId?: string;
  owningUserId?: string;
  title: string;
  mimeType: string;
  sizeBytes?: number;
  status: "READY" | "PROCESSING" | "FAILED";
  extractedText?: string;
  url?: string;
  createdAt: string;
  isShared?: boolean;
}

export interface Note {
  id: string;
  owningCardId: string;
  title: string;
  content: string;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  mastered?: boolean;
}

export interface FlashcardSet {
  id: string;
  owningCardId: string;
  title: string;
  isShared: boolean;
  cards: Flashcard[];
  createdAt: string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  owningCardId: string;
  title: string;
  description: string;
  isShared: boolean;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export interface CourseSpaceEvent {
  id: string;
  cardId: string;
  type: string;
  actorUserId: string;
  actorName?: string;
  createdAt: string;
  payload: Record<string, any>;
}

export interface SarahMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  groundedResourceTitle?: string;
}
