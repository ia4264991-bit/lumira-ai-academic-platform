import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  CourseSpace, 
  Deck, 
  CurrentUser, 
  Member, 
  MemberRole, 
  BroadcastNotification, 
  ChatMessage, 
  Card,
  StudyMaterial,
  ModuleQuiz,
  ModuleSummary,
  ModuleResource
} from '../types';
import { INITIAL_DECKS, INITIAL_SPACES, INITIAL_USER } from '../data/initialData';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface AppContextType {
  decks: Deck[];
  courseSpaces: CourseSpace[];
  activeSpaceId: string | null;
  activeSpace: CourseSpace | null;
  currentUser: CurrentUser;
  availableUsers: CurrentUser[];
  currentRoleInActiveSpace: MemberRole | null;
  unreadNotificationCount: number;
  setActiveSpaceId: (id: string | null) => void;
  switchUser: (userId: string) => void;
  createCourseSpaceFromDeck: (deckId: string, title?: string, description?: string) => string;
  joinCourseSpaceByCode: (code: string) => { success: boolean; message: string; spaceId?: string };
  promoteToAdmin: (spaceId: string, memberId: string) => void;
  demoteToMember: (spaceId: string, memberId: string) => void;
  releaseQuiz: (spaceId: string, moduleId: string, quizId: string) => void;
  lockQuiz: (spaceId: string, moduleId: string, quizId: string) => void;
  releaseSummary: (spaceId: string, moduleId: string, summaryId: string) => void;
  lockSummary: (spaceId: string, moduleId: string, summaryId: string) => void;
  sendChatMessage: (spaceId: string, text: string) => void;
  sendBroadcastNotification: (spaceId: string, title: string, message: string, priority: 'normal' | 'important' | 'urgent') => void;
  markNotificationAsRead: (spaceId: string, notificationId: string) => void;
  updateStudyProgress: (spaceId: string, xpGained: number, cardsMasteredDelta?: number, cardReviewedIndex?: number) => void;
  addNewDeck: (title: string, description: string, subject: string, cards: Card[]) => Deck;
  addNewCardWithMaterials: (
    title: string,
    description: string,
    subject: string,
    color: string,
    materials: StudyMaterial[],
    cards: Card[],
    quizzes?: ModuleQuiz[],
    summaries?: ModuleSummary[]
  ) => Deck;
  addMaterialToCard: (deckId: string, material: StudyMaterial) => void;
  updateDeck: (deck: Deck) => void;
  toggleCardMastery: (deckId: string, cardId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_DECKS = 'studley_decks_v2';
const STORAGE_KEY_SPACES = 'studley_spaces_v2';
const STORAGE_KEY_USER = 'studley_current_user_v2';

const DEMO_PERSONAS: CurrentUser[] = [
  INITIAL_USER, // Sarah Chen (Creator)
  {
    id: 'user-marcus',
    name: 'Marcus Vance',
    email: 'marcus.vance@uni.edu',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    xp: 1180,
    streakDays: 5,
  },
  {
    id: 'user-jordan',
    name: 'Jordan Lee',
    email: 'jordan.lee@uni.edu',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    xp: 850,
    streakDays: 3,
  },
  {
    id: 'user-maya',
    name: 'Maya Patel',
    email: 'maya.patel@uni.edu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    xp: 620,
    streakDays: 2,
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [decks, setDecks] = useState<Deck[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DECKS);
      return saved ? JSON.parse(saved) : INITIAL_DECKS;
    } catch {
      return INITIAL_DECKS;
    }
  });

  const [courseSpaces, setCourseSpaces] = useState<CourseSpace[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SPACES);
      return saved ? JSON.parse(saved) : INITIAL_SPACES;
    } catch {
      return INITIAL_SPACES;
    }
  });

  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [activeSpaceId, setActiveSpaceId] = useState<string | null>('space-bio-cell');

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(decks));
    } catch (e) {
      console.warn('LocalStorage save failed for decks', e);
    }
  }, [decks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SPACES, JSON.stringify(courseSpaces));
    } catch (e) {
      console.warn('LocalStorage save failed for spaces', e);
    }
  }, [courseSpaces]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } catch (e) {
      console.warn('LocalStorage save failed for user', e);
    }
  }, [currentUser]);

  // Cross-tab real-time sync with BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const channel = new BroadcastChannel('studley_realtime_sync');
    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'SYNC_SPACES' && payload) {
        setCourseSpaces(payload);
      } else if (type === 'SYNC_NOTIFICATION' && payload) {
        sound.playNotification();
      }
    };
    return () => {
      channel.close();
    };
  }, []);

  const broadcastSpaces = useCallback((updatedSpaces: CourseSpace[], triggerNotif = false) => {
    setCourseSpaces(updatedSpaces);
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('studley_realtime_sync');
      channel.postMessage({ type: 'SYNC_SPACES', payload: updatedSpaces });
      if (triggerNotif) {
        channel.postMessage({ type: 'SYNC_NOTIFICATION', payload: true });
      }
      channel.close();
    }
  }, []);

  const activeSpace = courseSpaces.find((s) => s.id === activeSpaceId) || null;

  // Find current user's role in active space
  const currentRoleInActiveSpace: MemberRole | null = React.useMemo(() => {
    if (!activeSpace) return null;
    const member = activeSpace.members.find((m) => m.id === currentUser.id);
    return member ? member.role : null;
  }, [activeSpace, currentUser.id]);

  // Unread notifications count in active space
  const unreadNotificationCount = React.useMemo(() => {
    if (!activeSpace) return 0;
    return activeSpace.notifications.filter((n) => !n.readBy.includes(currentUser.id)).length;
  }, [activeSpace, currentUser.id]);

  const switchUser = (userId: string) => {
    const target = DEMO_PERSONAS.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      sound.playFlip();
    }
  };

  // Convert Deck into a collaborative CourseSpace
  const createCourseSpaceFromDeck = (deckId: string, customTitle?: string, customDesc?: string): string => {
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return '';

    const newSpaceId = `space-${Date.now()}`;
    const code = `CS-${deck.subject.slice(0, 3).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;

    // Split cards into 2 logical modules
    const half = Math.ceil(deck.cards.length / 2);
    const mod1Cards = deck.cards.slice(0, half);
    const mod2Cards = deck.cards.slice(half);

    // Build resources from deck materials if any
    const materialResources: ModuleResource[] = (deck.materials || []).map((m, idx) => ({
      id: `res-mat-${Date.now()}-${idx}`,
      moduleId: `mod-${newSpaceId}-1`,
      title: m.name,
      type: 'notes',
      content: m.contentPreview || `Attached material: ${m.name} (${m.size})`,
    }));

    const mod1Quizzes: ModuleQuiz[] = (deck.quizzes && deck.quizzes.length > 0)
      ? [
          {
            ...deck.quizzes[0],
            id: `quiz-${newSpaceId}-1`,
            moduleId: `mod-${newSpaceId}-1`,
            isReleased: true,
            releasedBy: `${currentUser.name} (Creator)`,
            releasedAt: new Date().toISOString(),
          }
        ]
      : [
          {
            id: `quiz-${newSpaceId}-1`,
            moduleId: `mod-${newSpaceId}-1`,
            title: `${deck.subject} Diagnostic Quiz`,
            description: 'Knowledge check on foundational terms.',
            isReleased: true,
            releasedBy: `${currentUser.name} (Creator)`,
            releasedAt: new Date().toISOString(),
            questions: mod1Cards.slice(0, 2).map((c, i) => ({
              id: `q-${i}`,
              question: c.front,
              options: [
                { id: 'opt-1', text: c.back },
                { id: 'opt-2', text: 'Alternative misconception or non-applicable principle.' },
                { id: 'opt-3', text: 'Inverse electrochemical or kinetic relation.' },
              ],
              correctOptionId: 'opt-1',
              explanation: `Verified answer: ${c.back}`,
            })),
          }
        ];

    const mod1Summaries: ModuleSummary[] = (deck.summaries && deck.summaries.length > 0)
      ? [
          {
            ...deck.summaries[0],
            id: `sum-${newSpaceId}-1`,
            moduleId: `mod-${newSpaceId}-1`,
            isReleased: true,
            releasedBy: `${currentUser.name} (Creator)`,
            releasedAt: new Date().toISOString(),
          }
        ]
      : [
          {
            id: `sum-${newSpaceId}-1`,
            moduleId: `mod-${newSpaceId}-1`,
            title: `Module 1 Comprehensive Concept Summary`,
            isReleased: true,
            releasedBy: `${currentUser.name} (Creator)`,
            releasedAt: new Date().toISOString(),
            keyTakeaways: [
              'Fundamental definitions and high-yield cards.',
              'Core concepts organized for fast spaced repetition.',
            ],
            fullMarkdown: `### Module 1 Review\nKey insights curated from ${deck.title}. Master these cards first before proceeding to advanced modules.`,
          }
        ];

    const mod2Quizzes: ModuleQuiz[] = (deck.quizzes && deck.quizzes.length > 1)
      ? [
          {
            ...deck.quizzes[1],
            id: `quiz-${newSpaceId}-2`,
            moduleId: `mod-${newSpaceId}-2`,
            isReleased: false,
          }
        ]
      : [
          {
            id: `quiz-${newSpaceId}-2`,
            moduleId: `mod-${newSpaceId}-2`,
            title: `Module 2 Mastery Challenge`,
            description: 'Exclusive assessment testing advanced card concepts.',
            isReleased: false,
            questions: mod2Cards.map((c, i) => ({
              id: `q2-${i}`,
              question: c.front,
              options: [
                { id: 'opt-1', text: c.back },
                { id: 'opt-2', text: 'Incomplete or approximate formulation.' },
                { id: 'opt-3', text: 'Secondary pathway not directly tied to this question.' },
              ],
              correctOptionId: 'opt-1',
              explanation: `Core principle: ${c.back}`,
            })),
          }
        ];

    const newSpace: CourseSpace = {
      id: newSpaceId,
      code,
      title: customTitle || `${deck.title} Space`,
      description: customDesc || deck.description,
      subject: deck.subject,
      bannerColor: deck.color,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      sourceDeckId: deck.id,
      createdAt: new Date().toISOString(),
      isPublic: true,
      members: [
        {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: 'creator',
          xp: currentUser.xp,
          cardsMastered: deck.cards.filter((c) => c.mastered).length,
          totalCardsStudied: deck.cards.length,
          quizzesCompleted: 0,
          streakDays: currentUser.streakDays,
          status: 'online',
          currentCardIndex: 0,
          joinedAt: new Date().toISOString(),
          lastActive: 'Just now',
        }
      ],
      messages: [
        {
          id: `msg-${Date.now()}`,
          spaceId: newSpaceId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          senderRole: 'creator',
          text: `🚀 Created CourseSpace from card "${deck.title}". Invite friends with code ${code}!`,
          timestamp: new Date().toISOString(),
          isPinned: true,
        }
      ],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          spaceId: newSpaceId,
          title: 'CourseSpace Initialized',
          message: `Welcome to ${deck.title} CourseSpace! Flashcard resources are live. Quizzes & summaries will be released module-by-module.`,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: 'creator',
          createdAt: new Date().toISOString(),
          priority: 'important',
          readBy: [currentUser.id],
        }
      ],
      modules: [
        {
          id: `mod-${newSpaceId}-1`,
          spaceId: newSpaceId,
          title: `Module 1: Foundations of ${deck.subject}`,
          description: `Primary concepts and high-frequency cards from ${deck.title}.`,
          order: 1,
          resources: [
            {
              id: `res-${Date.now()}-1`,
              moduleId: `mod-${newSpaceId}-1`,
              title: 'Module 1 Flashcards',
              type: 'flashcards',
              content: 'Foundational study cards available to all joined members.',
              cardCount: mod1Cards.length,
            },
            ...materialResources,
          ],
          cards: mod1Cards,
          quizzes: mod1Quizzes,
          summaries: mod1Summaries,
        },
        {
          id: `mod-${newSpaceId}-2`,
          spaceId: newSpaceId,
          title: `Module 2: Advanced Applications & Mastery`,
          description: `Deep-dive cards, problem solving, and complex scenarios.`,
          order: 2,
          resources: [
            {
              id: `res-${Date.now()}-2`,
              moduleId: `mod-${newSpaceId}-2`,
              title: 'Module 2 Flashcards',
              type: 'flashcards',
              content: 'Advanced deck cards accessible immediately to members.',
              cardCount: mod2Cards.length,
            }
          ],
          cards: mod2Cards,
          quizzes: mod2Quizzes,
          summaries: [
            {
              id: `sum-${newSpaceId}-2`,
              moduleId: `mod-${newSpaceId}-2`,
              title: `AI Synthesis: Module 2 Mastery Map`,
              isReleased: false, // 🔒 EXCLUSIVE CONTENT: GATED UNTIL CREATOR OR ADMIN RELEASES!
              keyTakeaways: [
                'Complex integration across all second-half flashcards.',
                'Comparative frameworks and common trap questions.',
              ],
              fullMarkdown: `### Exclusive Module 2 Mastery Synthesis\nThis summary provides deep conceptual links between topics once released by the space creator or admin.`,
            }
          ]
        }
      ]
    };

    // Update the deck with linkedSpaceId
    setDecks((prev) =>
      prev.map((d) => (d.id === deckId ? { ...d, linkedSpaceId: newSpaceId } : d))
    );

    const updated = [newSpace, ...courseSpaces];
    broadcastSpaces(updated);
    setActiveSpaceId(newSpaceId);
    sound.playRelease();
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    return newSpaceId;
  };

  const joinCourseSpaceByCode = (code: string): { success: boolean; message: string; spaceId?: string } => {
    const space = courseSpaces.find((s) => s.code.trim().toUpperCase() === code.trim().toUpperCase());
    if (!space) {
      return { success: false, message: `CourseSpace with code "${code}" was not found.` };
    }

    const alreadyMember = space.members.some((m) => m.id === currentUser.id);
    if (alreadyMember) {
      setActiveSpaceId(space.id);
      return { success: true, message: `Welcome back to ${space.title}!`, spaceId: space.id };
    }

    // Add current user as member
    const newMember: Member = {
      id: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar,
      role: 'member',
      xp: currentUser.xp,
      cardsMastered: 0,
      totalCardsStudied: 0,
      quizzesCompleted: 0,
      streakDays: currentUser.streakDays,
      status: 'online',
      currentCardIndex: 0,
      joinedAt: new Date().toISOString(),
      lastActive: 'Just now',
    };

    const joinMessage: ChatMessage = {
      id: `join-${Date.now()}`,
      spaceId: space.id,
      senderId: 'system',
      senderName: 'System',
      senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      senderRole: 'member',
      text: `👋 ${currentUser.name} joined the CourseSpace! All core flashcards are ready. Quizzes will unlock as admins release them.`,
      timestamp: new Date().toISOString(),
      isSystemAnnouncement: true,
    };

    const updatedSpace: CourseSpace = {
      ...space,
      members: [...space.members, newMember],
      messages: [...space.messages, joinMessage],
    };

    const updatedSpaces = courseSpaces.map((s) => (s.id === space.id ? updatedSpace : s));
    broadcastSpaces(updatedSpaces, true);
    setActiveSpaceId(space.id);
    sound.playCorrect();
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });

    return {
      success: true,
      message: `Joined "${space.title}" successfully! Base cards received.`,
      spaceId: space.id,
    };
  };

  // Promote Member to Admin (Creator only)
  const promoteToAdmin = (spaceId: string, memberId: string) => {
    const space = courseSpaces.find((s) => s.id === spaceId);
    if (!space || space.creatorId !== currentUser.id) return;

    const target = space.members.find((m) => m.id === memberId);
    if (!target || target.role === 'creator') return;

    const promotionMsg: ChatMessage = {
      id: `promote-${Date.now()}`,
      spaceId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: 'creator',
      text: `🛡️ Promoted ${target.name} to Space Admin! They now have permission to release exclusive quizzes, broadcast notifications, and manage study materials.`,
      timestamp: new Date().toISOString(),
      isSystemAnnouncement: true,
    };

    const updatedMembers = space.members.map((m) =>
      m.id === memberId ? { ...m, role: 'admin' as MemberRole } : m
    );

    const updatedSpace: CourseSpace = {
      ...space,
      members: updatedMembers,
      messages: [...space.messages, promotionMsg],
    };

    const updated = courseSpaces.map((s) => (s.id === spaceId ? updatedSpace : s));
    broadcastSpaces(updated, true);
    sound.playRelease();
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
  };

  // Demote Admin to Member (Creator only)
  const demoteToMember = (spaceId: string, memberId: string) => {
    const space = courseSpaces.find((s) => s.id === spaceId);
    if (!space || space.creatorId !== currentUser.id) return;

    const target = space.members.find((m) => m.id === memberId);
    if (!target || target.role !== 'admin') return;

    const updatedMembers = space.members.map((m) =>
      m.id === memberId ? { ...m, role: 'member' as MemberRole } : m
    );

    const demotionMsg: ChatMessage = {
      id: `demote-${Date.now()}`,
      spaceId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: 'creator',
      text: `ℹ️ ${target.name}'s role was updated to Member.`,
      timestamp: new Date().toISOString(),
      isSystemAnnouncement: true,
    };

    const updatedSpace: CourseSpace = {
      ...space,
      members: updatedMembers,
      messages: [...space.messages, demotionMsg],
    };

    const updated = courseSpaces.map((s) => (s.id === spaceId ? updatedSpace : s));
    broadcastSpaces(updated);
    sound.playFlip();
  };

  // Release Exclusive Gated Quiz to all members
  const releaseQuiz = (spaceId: string, moduleId: string, quizId: string) => {
    const space = courseSpaces.find((s) => s.id === spaceId);
    if (!space) return;

    // Check permissions: Must be creator or admin
    const callerMember = space.members.find((m) => m.id === currentUser.id);
    if (!callerMember || (callerMember.role !== 'creator' && callerMember.role !== 'admin')) {
      alert('Only the CourseSpace Creator or Admins can release exclusive quizzes.');
      return;
    }

    let quizTitle = '';
    const updatedModules = space.modules.map((mod) => {
      if (mod.id !== moduleId) return mod;
      return {
        ...mod,
        quizzes: mod.quizzes.map((q) => {
          if (q.id !== quizId) return q;
          quizTitle = q.title;
          return {
            ...q,
            isReleased: true,
            releasedBy: `${currentUser.name} (${callerMember.role.toUpperCase()})`,
            releasedAt: new Date().toISOString(),
          };
        }),
      };
    });

    // Auto send announcement to chat
    const releaseMsg: ChatMessage = {
      id: `release-q-${Date.now()}`,
      spaceId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: callerMember.role,
      text: `🎉 UNLOCKED: "${quizTitle}" is now released and open for all members! Take it to test your retention and earn +50 XP.`,
      timestamp: new Date().toISOString(),
      isSystemAnnouncement: true,
    };

    // Auto send broadcast notification
    const newNotif: BroadcastNotification = {
      id: `notif-q-${Date.now()}`,
      spaceId,
      title: `Quiz Released: ${quizTitle}`,
      message: `${currentUser.name} has released a new quiz for your module. Available now!`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: callerMember.role,
      createdAt: new Date().toISOString(),
      priority: 'important',
      readBy: [currentUser.id],
      targetModuleId: moduleId,
    };

    const updatedSpace: CourseSpace = {
      ...space,
      modules: updatedModules,
      messages: [...space.messages, releaseMsg],
      notifications: [newNotif, ...space.notifications],
    };

    const updated = courseSpaces.map((s) => (s.id === spaceId ? updatedSpace : s));
    broadcastSpaces(updated, true);
    sound.playRelease();
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
  };

  // Lock quiz back to draft
  const lockQuiz = (spaceId: string, moduleId: string, quizId: string) => {
    const space = courseSpaces.find((s) => s.id === spaceId);
    if (!space) return;
    const callerMember = space.members.find((m) => m.id === currentUser.id);
    if (!callerMember || (callerMember.role !== 'creator' && callerMember.role !== 'admin')) return;

    const updatedModules = space.modules.map((mod) => {
      if (mod.id !== moduleId) return mod;
      return {
        ...mod,
        quizzes: mod.quizzes.map((q) =>
          q.id === quizId ? { ...q, isReleased: false, releasedBy: undefined, releasedAt: undefined } : q
        ),
      };
    });

    const updatedSpace = { ...space, modules: updatedModules };
    broadcastSpaces(courseSpaces.map((s) => (s.id === spaceId ? updatedSpace : s)));
    sound.playFlip();
  };

  // Release Exclusive Gated Summary to all members
  const releaseSummary = (spaceId: string, moduleId: string, summaryId: string) => {
    const space = courseSpaces.find((s) => s.id === spaceId);
    if (!space) return;
    const callerMember = space.members.find((m) => m.id === currentUser.id);
    if (!callerMember || (callerMember.role !== 'creator' && callerMember.role !== 'admin')) {
      alert('Only the CourseSpace Creator or Admins can release exclusive summaries.');
      return;
    }

    let summaryTitle = '';
    const updatedModules = space.modules.map((mod) => {
      if (mod.id !== moduleId) return mod;
      return {
        ...mod,
        summaries: mod.summaries.map((s) => {
          if (s.id !== summaryId) return s;
          summaryTitle = s.title;
          return {
            ...s,
            isReleased: true,
            releasedBy: `${currentUser.name} (${callerMember.role.toUpperCase()})`,
            releasedAt: new Date().toISOString(),
          };
        }),
      };
    });

    const releaseMsg: ChatMessage = {
      id: `release-s-${Date.now()}`,
      spaceId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: callerMember.role,
      text: `📖 UNLOCKED: "${summaryTitle}" is now released and open for all members to study!`,
      timestamp: new Date().toISOString(),
      isSystemAnnouncement: true,
    };

    const newNotif: BroadcastNotification = {
      id: `notif-s-${Date.now()}`,
      spaceId,
      title: `Summary Released: ${summaryTitle}`,
      message: `${currentUser.name} unlocked the module concept synthesis document.`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: callerMember.role,
      createdAt: new Date().toISOString(),
      priority: 'normal',
      readBy: [currentUser.id],
      targetModuleId: moduleId,
    };

    const updatedSpace: CourseSpace = {
      ...space,
      modules: updatedModules,
      messages: [...space.messages, releaseMsg],
      notifications: [newNotif, ...space.notifications],
    };

    broadcastSpaces(courseSpaces.map((s) => (s.id === spaceId ? updatedSpace : s)), true);
    sound.playRelease();
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
  };

  const lockSummary = (spaceId: string, moduleId: string, summaryId: string) => {
    const space = courseSpaces.find((s) => s.id === spaceId);
    if (!space) return;
    const callerMember = space.members.find((m) => m.id === currentUser.id);
    if (!callerMember || (callerMember.role !== 'creator' && callerMember.role !== 'admin')) return;

    const updatedModules = space.modules.map((mod) => {
      if (mod.id !== moduleId) return mod;
      return {
        ...mod,
        summaries: mod.summaries.map((s) =>
          s.id === summaryId ? { ...s, isReleased: false, releasedBy: undefined, releasedAt: undefined } : s
        ),
      };
    });

    const updatedSpace = { ...space, modules: updatedModules };
    broadcastSpaces(courseSpaces.map((s) => (s.id === spaceId ? updatedSpace : s)));
    sound.playFlip();
  };

  const sendChatMessage = (spaceId: string, text: string) => {
    const space = courseSpaces.find((s) => s.id === spaceId);
    if (!space || !text.trim()) return;

    const callerMember = space.members.find((m) => m.id === currentUser.id);
    const role: MemberRole = callerMember ? callerMember.role : 'member';

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      spaceId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: role,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMembers = space.members.map((m) =>
      m.id === currentUser.id
        ? { ...m, xp: m.xp + 5, lastActive: 'Just now', status: 'online' as const }
        : m
    );

    const updatedSpace: CourseSpace = {
      ...space,
      members: updatedMembers,
      messages: [...space.messages, newMsg],
    };

    broadcastSpaces(courseSpaces.map((s) => (s.id === spaceId ? updatedSpace : s)));
    sound.playFlip();
  };

  // Creator or Admin broadcast notification
  const sendBroadcastNotification = (
    spaceId: string,
    title: string,
    message: string,
    priority: 'normal' | 'important' | 'urgent'
  ) => {
    const space = courseSpaces.find((s) => s.id === spaceId);
    if (!space) return;

    const callerMember = space.members.find((m) => m.id === currentUser.id);
    if (!callerMember || (callerMember.role !== 'creator' && callerMember.role !== 'admin')) {
      alert('Only Creator or Admins can send broadcast notifications.');
      return;
    }

    const newNotif: BroadcastNotification = {
      id: `notif-${Date.now()}`,
      spaceId,
      title: title.trim(),
      message: message.trim(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: callerMember.role,
      createdAt: new Date().toISOString(),
      priority,
      readBy: [currentUser.id],
    };

    // Also notify in chat
    const chatAlert: ChatMessage = {
      id: `chat-alert-${Date.now()}`,
      spaceId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: callerMember.role,
      text: `📢 BROADCAST ANNOUNCEMENT: **${title}**\n${message}`,
      timestamp: new Date().toISOString(),
      isPinned: priority === 'urgent',
      isSystemAnnouncement: true,
    };

    const updatedSpace: CourseSpace = {
      ...space,
      notifications: [newNotif, ...space.notifications],
      messages: [...space.messages, chatAlert],
    };

    broadcastSpaces(courseSpaces.map((s) => (s.id === spaceId ? updatedSpace : s)), true);
    sound.playNotification();
  };

  const markNotificationAsRead = (spaceId: string, notificationId: string) => {
    const space = courseSpaces.find((s) => s.id === spaceId);
    if (!space) return;

    const updatedNotifs = space.notifications.map((n) => {
      if (n.id === notificationId && !n.readBy.includes(currentUser.id)) {
        return { ...n, readBy: [...n.readBy, currentUser.id] };
      }
      return n;
    });

    const updatedSpace = { ...space, notifications: updatedNotifs };
    broadcastSpaces(courseSpaces.map((s) => (s.id === spaceId ? updatedSpace : s)));
  };

  const updateStudyProgress = (
    spaceId: string,
    xpGained: number,
    cardsMasteredDelta: number = 0,
    cardReviewedIndex?: number
  ) => {
    // Update current user XP
    setCurrentUser((prev) => ({ ...prev, xp: prev.xp + xpGained }));

    const space = courseSpaces.find((s) => s.id === spaceId);
    if (!space) return;

    const updatedMembers = space.members.map((m) => {
      if (m.id === currentUser.id) {
        return {
          ...m,
          xp: m.xp + xpGained,
          cardsMastered: Math.max(0, m.cardsMastered + cardsMasteredDelta),
          totalCardsStudied: m.totalCardsStudied + 1,
          status: 'studying' as const,
          currentCardIndex: cardReviewedIndex !== undefined ? cardReviewedIndex : m.currentCardIndex,
          lastActive: 'Just now',
        };
      }
      return m;
    });

    const updatedSpace = { ...space, members: updatedMembers };
    broadcastSpaces(courseSpaces.map((s) => (s.id === spaceId ? updatedSpace : s)));
  };

  const addNewDeck = (title: string, description: string, subject: string, cards: Card[]): Deck => {
    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      title,
      description,
      subject,
      color: 'from-emerald-500 to-teal-700',
      cards,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDecks((prev) => [newDeck, ...prev]);
    sound.playCorrect();
    return newDeck;
  };

  const addNewCardWithMaterials = (
    title: string,
    description: string,
    subject: string,
    color: string,
    materials: StudyMaterial[],
    cards: Card[],
    quizzes?: ModuleQuiz[],
    summaries?: ModuleSummary[]
  ): Deck => {
    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      title,
      description,
      subject,
      color: color || 'from-blue-600 to-cyan-500',
      materials,
      cards,
      quizzes: quizzes || [],
      summaries: summaries || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDecks((prev) => [newDeck, ...prev]);
    sound.playCorrect();
    return newDeck;
  };

  const addMaterialToCard = (deckId: string, material: StudyMaterial) => {
    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== deckId) return d;
        const currentMaterials = d.materials || [];
        return {
          ...d,
          materials: [...currentMaterials, material],
          updatedAt: new Date().toISOString(),
        };
      })
    );
    sound.playCorrect();
  };

  const updateDeck = (updated: Deck) => {
    setDecks((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const toggleCardMastery = (deckId: string, cardId: string) => {
    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== deckId) return d;
        return {
          ...d,
          cards: d.cards.map((c) => (c.id === cardId ? { ...c, mastered: !c.mastered } : c)),
        };
      })
    );
    sound.playCorrect();
  };

  return (
    <AppContext.Provider
      value={{
        decks,
        courseSpaces,
        activeSpaceId,
        activeSpace,
        currentUser,
        availableUsers: DEMO_PERSONAS,
        currentRoleInActiveSpace,
        unreadNotificationCount,
        setActiveSpaceId,
        switchUser,
        createCourseSpaceFromDeck,
        joinCourseSpaceByCode,
        promoteToAdmin,
        demoteToMember,
        releaseQuiz,
        lockQuiz,
        releaseSummary,
        lockSummary,
        sendChatMessage,
        sendBroadcastNotification,
        markNotificationAsRead,
        updateStudyProgress,
        addNewDeck,
        addNewCardWithMaterials,
        addMaterialToCard,
        updateDeck,
        toggleCardMastery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
