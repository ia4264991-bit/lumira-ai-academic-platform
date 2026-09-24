export type MemberRole = 'creator' | 'admin' | 'member';

export interface Card {
  id: string;
  front: string;
  back: string;
  hint?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  mastered?: boolean;
}

export interface StudyMaterial {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'text' | 'image' | 'notes';
  uploadedAt: string;
  contentPreview?: string;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  subject: string;
  color: string;
  cards: Card[];
  materials?: StudyMaterial[];
  quizzes?: ModuleQuiz[];
  summaries?: ModuleSummary[];
  createdAt: string;
  updatedAt: string;
  linkedSpaceId?: string;
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

export interface ModuleQuiz {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  isReleased: boolean;
  releasedBy?: string;
  releasedAt?: string;
}

export interface ModuleSummary {
  id: string;
  moduleId: string;
  title: string;
  keyTakeaways: string[];
  fullMarkdown: string;
  isReleased: boolean;
  releasedBy?: string;
  releasedAt?: string;
}

export interface ModuleResource {
  id: string;
  moduleId: string;
  title: string;
  type: 'flashcards' | 'notes' | 'cheatsheet' | 'link';
  content: string;
  cardCount?: number;
}

export interface CourseModule {
  id: string;
  spaceId: string;
  title: string;
  description: string;
  order: number;
  resources: ModuleResource[];
  cards: Card[];
  quizzes: ModuleQuiz[];
  summaries: ModuleSummary[];
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
  role: MemberRole;
  xp: number;
  cardsMastered: number;
  totalCardsStudied: number;
  quizzesCompleted: number;
  streakDays: number;
  status: 'online' | 'studying' | 'idle';
  currentCardIndex?: number;
  joinedAt: string;
  lastActive: string;
}

export interface ChatReaction {
  emoji: string;
  users: string[]; // userIds
}

export interface ChatMessage {
  id: string;
  spaceId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: MemberRole;
  text: string;
  timestamp: string;
  isPinned?: boolean;
  isSystemAnnouncement?: boolean;
  reactions?: Record<string, string[]>; // emoji -> array of names
}

export interface BroadcastNotification {
  id: string;
  spaceId: string;
  title: string;
  message: string;
  senderId: string;
  senderName: string;
  senderRole: MemberRole;
  createdAt: string;
  priority: 'normal' | 'important' | 'urgent';
  readBy: string[]; // userIds
  targetModuleId?: string;
}

export interface CourseSpace {
  id: string;
  code: string; // e.g. "CS-BIO101"
  title: string;
  description: string;
  subject: string;
  bannerColor: string;
  creatorId: string;
  creatorName: string;
  sourceDeckId?: string;
  modules: CourseModule[];
  members: Member[];
  messages: ChatMessage[];
  notifications: BroadcastNotification[];
  createdAt: string;
  isPublic: boolean;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  xp: number;
  streakDays: number;
}
