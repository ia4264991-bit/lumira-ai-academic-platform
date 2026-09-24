import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { AuthModal } from "./AuthModal";
import { CourseSpaceChat } from "./CourseSpaceChat";

export interface ResourceItem {
  id: string;
  name: string;
  status: "PENDING" | "PROCESSING" | "READY";
  size?: string;
  extractedText?: string;
}

export interface GenericItem {
  id: string;
  name: string;
  shared: boolean;
  content?: string;
  questionsCount?: number;
}

export interface MemberItem {
  name: string;
  role: "Owner" | "Admin" | "Member";
}

export interface UpdateEventItem {
  id: string;
  text: string;
  time: string;
}

export interface ChatMsg {
  from: "user" | "sarah" | "context";
  text: string;
}

export interface LumiraCard {
  id: string;
  name: string;
  color: string;
  isShared: boolean;
  myRole: "Owner" | "Admin" | "Member";
  requireApproval: boolean;
  shareLink: string | null;
  members: MemberItem[];
  resources: ResourceItem[];
  notes: GenericItem[];
  quizzes: GenericItem[];
  flashcards: GenericItem[];
  updates: UpdateEventItem[];
  sarahMessages: ChatMsg[];
}

const COLORS = [
  "#5B5FEF", // Indigo / Lumira Violet
  "#F2A93C", // Warm Amber
  "#2FAE8E", // Teal Emerald
  "#E8776A", // Coral Red
  "#8B5CF6", // Purple
  "#0EA5E9"  // Sky Blue
];

const INITIAL_CARDS: LumiraCard[] = [
  {
    id: "os",
    name: "Operating Systems",
    color: "#5B5FEF",
    isShared: true,
    myRole: "Owner",
    requireApproval: false,
    shareLink: "lumira.app/space/os-7f2a",
    members: [
      { name: "You", role: "Owner" },
      { name: "Ama", role: "Admin" },
      { name: "Kwame", role: "Member" }
    ],
    resources: [
      { id: "r1", name: "Lecture 1 — Kernel Architecture.pdf", status: "READY", size: "2.4 MB" },
      { id: "r2", name: "Lecture 2 — Virtual Memory & Paging.pdf", status: "READY", size: "1.8 MB" },
      { id: "r3", name: "Assignment 1 — Concurrency & Semaphores.pdf", status: "READY", size: "850 KB" }
    ],
    notes: [
      { id: "n1", name: "My Midterm Exam Prep & Key Invariants", shared: false, content: "Focus on Peterson's algorithm, TLB miss cycles, and page fault resolution." }
    ],
    quizzes: [
      { id: "q1", name: "Chapter 3 Quiz — Memory Management", shared: false, questionsCount: 5 }
    ],
    flashcards: [
      { id: "fc1", name: "Process Scheduling Algorithms (15 cards)", shared: true }
    ],
    updates: [
      { id: "u1", text: "Lecture 2 — Virtual Memory & Paging.pdf was added by You", time: "2h ago" },
      { id: "u2", text: "Ama joined this Course Space", time: "1d ago" },
      { id: "u3", text: "Course Space invite link was generated", time: "2d ago" }
    ],
    sarahMessages: [
      { from: "user", text: "Explain virtual memory to me." },
      { 
        from: "sarah", 
        text: "Virtual memory gives each process its own isolated 64-bit address space mapped to physical RAM via multi-level page tables and the Translation Lookaside Buffer (TLB). This allows processes to safely exceed physical RAM and provides memory protection." 
      }
    ]
  },
  {
    id: "db",
    name: "Database Systems",
    color: "#F2A93C",
    isShared: false,
    myRole: "Owner",
    requireApproval: false,
    shareLink: null,
    members: [{ name: "You", role: "Owner" }],
    resources: [
      { id: "r4", name: "ER Diagrams & B+ Trees.pdf", status: "READY", size: "3.1 MB" }
    ],
    notes: [
      { id: "n2", name: "ACID Properties & Isolation Levels", shared: false, content: "Read committed vs Serializable; 2-Phase Locking guarantees serializability." }
    ],
    quizzes: [],
    flashcards: [],
    updates: [],
    sarahMessages: []
  },
  {
    id: "ai",
    name: "My AI Notes",
    color: "#2FAE8E",
    isShared: false,
    myRole: "Owner",
    requireApproval: false,
    shareLink: null,
    members: [{ name: "You", role: "Owner" }],
    resources: [],
    notes: [],
    quizzes: [],
    flashcards: [],
    updates: [],
    sarahMessages: []
  }
];

export const LumiraFullApp: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Core navigation & screen state
  const [screen, setScreen] = useState<"home" | "cardDetail" | "comingSoon">("home");
  const [homeTab, setHomeTab] = useState<"cards" | "spaces">("cards");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [cardTab, setCardTab] = useState<"resources" | "notes" | "quizzes" | "flashcards" | "chat" | "updates" | "members" | "shareLink">("resources");

  // Domain state
  const [cards, setCards] = useState<LumiraCard[]>(INITIAL_CARDS);
  const [aiUsageUsed, setAiUsageUsed] = useState(18);
  const aiUsageTotal = 60;

  // Preview & simulation states
  const [viewingAsMember, setViewingAsMember] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Overlays & Sheets
  const [overlay, setOverlay] = useState<"createCard" | "createCourseSpace" | "addResource" | "generate" | "joinPreview" | "sarah" | null>(null);
  const [createCardName, setCreateCardName] = useState("");
  const [createCardColor, setCreateCardColor] = useState(COLORS[0]);

  // Resource upload sheet
  const [uploadResName, setUploadResName] = useState("");

  // Artifact generation sheet
  const [genKey, setGenKey] = useState<"quizzes" | "flashcards">("quizzes");
  const [genPrompt, setGenPrompt] = useState("");

  // Sarah AI Chat sheet
  const [sarahContext, setSarahContext] = useState<{ type: "workspace" | "resource"; resourceName?: string }>({ type: "workspace" });
  const [sarahInput, setSarahInput] = useState("");
  const [isSarahThinking, setIsSarahThinking] = useState(false);

  // Coming soon title & desc
  const [comingSoonInfo, setComingSoonInfo] = useState<{ title: string; desc: string }>({ title: "", desc: "" });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const activeCard = cards.find(c => c.id === activeCardId) || null;

  // Reset entire prototype to seed
  const handleReset = () => {
    setCards(INITIAL_CARDS);
    setScreen("home");
    setHomeTab("cards");
    setActiveCardId(null);
    setViewingAsMember(false);
    setOverlay(null);
    showToast("Workspace reset to initial state");
  };

  // Card creation
  const handleConfirmCreateCard = () => {
    const name = createCardName.trim() || "Untitled Study Card";
    const newCard: LumiraCard = {
      id: "card-" + Date.now(),
      name,
      color: createCardColor,
      isShared: false,
      myRole: "Owner",
      requireApproval: false,
      shareLink: null,
      members: [{ name: user?.displayName || "You", role: "Owner" }],
      resources: [],
      notes: [],
      quizzes: [],
      flashcards: [],
      updates: [],
      sarahMessages: []
    };
    setCards(prev => [newCard, ...prev]);
    setOverlay(null);
    setCreateCardName("");
    showToast(`Card "${name}" created!`);
  };

  // Convert Card to Course Space
  const handleConfirmCreateCourseSpace = (cardId: string) => {
    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        return {
          ...c,
          isShared: true,
          updates: [
            { id: "u-" + Date.now(), text: "You converted this Card into a collaborative Course Space", time: "just now" },
            ...c.updates
          ]
        };
      }
      return c;
    }));
    setOverlay(null);
    setCardTab("shareLink");
    showToast("Course Space enabled — share with your peers!");
  };

  // Upload Resource with realistic PENDING -> PROCESSING -> READY transitions
  const handleConfirmAddResource = (cardId: string) => {
    const name = uploadResName.trim() || `Lecture ${Date.now().toString().slice(-4)}.pdf`;
    const resId = "res-" + Date.now();
    const newRes: ResourceItem = {
      id: resId,
      name,
      status: "PENDING",
      size: "1.5 MB"
    };

    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        return { ...c, resources: [newRes, ...c.resources] };
      }
      return c;
    }));

    setOverlay(null);
    setUploadResName("");

    // Simulate backend extraction pipeline
    setTimeout(() => {
      setCards(prev => prev.map(c => {
        if (c.id === cardId) {
          return {
            ...c,
            resources: c.resources.map(r => r.id === resId ? { ...r, status: "PROCESSING" } : r)
          };
        }
        return c;
      }));
    }, 900);

    setTimeout(() => {
      setCards(prev => prev.map(c => {
        if (c.id === cardId) {
          return {
            ...c,
            resources: c.resources.map(r => r.id === resId ? { ...r, status: "READY" } : r),
            updates: c.isShared ? [
              { id: "u-" + Date.now(), text: `${name} was uploaded and processed by You`, time: "just now" },
              ...c.updates
            ] : c.updates
          };
        }
        return c;
      }));
      showToast(`${name} is ready for study & Sarah grounding`);
    }, 2200);
  };

  // Generate artifacts via Sarah (AD-035)
  const handleConfirmGenerate = (cardId: string) => {
    const lbl = genKey === "quizzes" ? "Diagnostic Quiz" : "Active Recall Flashcards";
    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        const count = c[genKey].length + 1;
        const newItem: GenericItem = {
          id: "gen-" + Date.now(),
          name: `${lbl} #${count}${genPrompt ? ` (${genPrompt})` : ""}`,
          shared: false,
          questionsCount: 5
        };
        return {
          ...c,
          [genKey]: [...c[genKey], newItem]
        };
      }
      return c;
    }));
    setAiUsageUsed(prev => Math.min(aiUsageTotal, prev + 6));
    setOverlay(null);
    setGenPrompt("");
    showToast(`Generated ${lbl} — private to you unless shared`);
  };

  // Share link controls
  const handleGenerateLink = (cardId: string) => {
    const code = Math.random().toString(36).substring(2, 7);
    const link = `lumira.app/space/${cardId}-${code}`;
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, shareLink: link } : c));
    showToast("Revocable share link generated");
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard?.writeText("https://" + link);
    showToast("Link copied to clipboard");
  };

  const handleToggleApproval = (cardId: string) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, requireApproval: !c.requireApproval } : c));
  };

  const handleResetLink = (cardId: string) => {
    const code = Math.random().toString(36).substring(2, 7);
    const link = `lumira.app/space/${cardId}-${code}`;
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, shareLink: link } : c));
    showToast("Old link revoked — new link generated");
  };

  // Preview as joining student (AD-025: member gets own Card with shared resources by reference)
  const handleConfirmJoin = (originCardId: string) => {
    const origin = cards.find(c => c.id === originCardId);
    if (!origin) return;

    const memberCardId = "joined-" + Date.now();
    const sharedResources = origin.resources.map(r => ({ ...r, status: "READY" as const }));
    const newMemberCard: LumiraCard = {
      id: memberCardId,
      name: origin.name,
      color: origin.color,
      isShared: true,
      myRole: "Member",
      requireApproval: origin.requireApproval,
      shareLink: null,
      members: origin.members,
      resources: sharedResources,
      notes: [],
      quizzes: [],
      flashcards: [],
      updates: [{ id: "uj-1", text: "You joined this Course Space", time: "just now" }],
      sarahMessages: []
    };

    setCards(prev => [newMemberCard, ...prev]);
    setOverlay(null);
    setViewingAsMember(true);
    setActiveCardId(memberCardId);
    setCardTab("resources");
    setScreen("cardDetail");
    showToast("Joined! This is a new Card owned by you with shared resources.");
  };

  const handleExitPreview = () => {
    setCards(prev => prev.filter(c => !c.id.startsWith("joined-")));
    setViewingAsMember(false);
    setScreen("home");
  };

  // Toggle item share state (AD-045)
  const handleToggleItemShare = (cardId: string, category: "notes" | "quizzes" | "flashcards", itemId: string) => {
    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        return {
          ...c,
          [category]: c[category].map(item => item.id === itemId ? { ...item, shared: !item.shared } : item)
        };
      }
      return c;
    }));
  };

  // Sarah AI Chat
  const handleOpenSarah = (cardId: string, type: "workspace" | "resource", resourceName?: string) => {
    setActiveCardId(cardId);
    setSarahContext({ type, resourceName });
    setOverlay("sarah");
    if (type === "resource" && resourceName) {
      setCards(prev => prev.map(c => {
        if (c.id === cardId) {
          const last = c.sarahMessages[c.sarahMessages.length - 1];
          if (!last || last.from !== "context" || last.text !== resourceName) {
            return {
              ...c,
              sarahMessages: [...c.sarahMessages, { from: "context", text: resourceName }]
            };
          }
        }
        return c;
      }));
    }
  };

  const handleSendSarah = () => {
    if (!sarahInput.trim() || !activeCard) return;
    const text = sarahInput.trim();
    setSarahInput("");

    // Add user message
    setCards(prev => prev.map(c => {
      if (c.id === activeCard.id) {
        return {
          ...c,
          sarahMessages: [...c.sarahMessages, { from: "user", text }]
        };
      }
      return c;
    }));

    setIsSarahThinking(true);

    setTimeout(() => {
      let reply = "";
      const lower = text.toLowerCase();
      if (lower.includes("quiz")) {
        reply = "I can generate a diagnostic quiz tailored to your notes and lecture materials. Head to the Quizzes tab or tap '+ Generate Quiz'!";
      } else if (lower.includes("summar")) {
        reply = `Here is a conceptual synthesis based on ${activeCard.resources[0]?.name || activeCard.name}: Key focus points center around fundamental principles, state transitions, and exam-tested edge cases.`;
      } else if (sarahContext.type === "resource" && sarahContext.resourceName) {
        reply = `Regarding "${text}" in ${sarahContext.resourceName}: Let's break this down methodically. The passage emphasizes strict boundary invariants and step-by-step verification.`;
      } else {
        reply = `Based on ${activeCard.isShared ? "this Course Space's shared materials" : "your private Card"}: "${text}" connects directly to your core lecture concepts. Would you like me to formulate an active recall drill to test your retention?`;
      }

      setCards(prev => prev.map(c => {
        if (c.id === activeCard.id) {
          return {
            ...c,
            sarahMessages: [...c.sarahMessages, { from: "sarah", text: reply }]
          };
        }
        return c;
      }));
      setIsSarahThinking(false);
    }, 850);
  };

  const filteredCards = cards.filter(c => homeTab === "cards" ? true : c.isShared);

  return (
    <div className="w-full flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 font-sans">
      
      {/* Top Lab Header matching UX Prototype */}
      <div className="max-w-[440px] w-full text-center mb-4 space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-100 flex items-center justify-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(242,169,60,0.8)]" />
          Lumira — Academic Platform
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Card-First workspace architecture adhering strictly to AD-019 through AD-056.
        </p>

        {/* Interactive Scenario Card */}
        <div className="bg-[#181A22] border border-[#262833]/80 rounded-xl p-3 text-left text-xs text-slate-300 space-y-1.5 shadow-lg">
          <p className="font-semibold text-amber-400">⚡ Interactive Prototype Walkthrough:</p>
          <p className="text-slate-400 leading-normal">
            1. Open <strong>"Operating Systems"</strong> (Course Space) → tap the new <strong>"Chat"</strong> tab to message peers in real time using your scholar identity.
          </p>
          <p className="text-slate-400 leading-normal">
            2. Tap 🔗 (Share) → tap <strong>"👀 Preview as joining student"</strong> to verify AD-025 (student receives an independent Card with shared resources by reference).
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-full border border-slate-700/80 hover:border-slate-500 transition"
          >
            ↺ Reset Prototype State
          </button>
          {user ? (
            <button
              onClick={() => signOut()}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Sign Out ({user.displayName || user.email || "Scholar"})
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Scholar Sign In
            </button>
          )}
        </div>
      </div>

      {/* Realistic Mobile Device Frame */}
      <div className="w-full max-w-[400px] bg-white rounded-[40px] border-[8px] border-[#1C1D24] shadow-[0_30px_70px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col h-[740px] relative text-[#1A1B23]">
        
        {/* Device Status Bar */}
        <div className="flex justify-between items-center px-6 pt-3 pb-1 text-[11px] font-semibold text-[#1A1B23]">
          <span>9:41</span>
          <span className="tracking-widest">●●● 5G 100%</span>
        </div>

        {/* Scrollable Screen Body */}
        <div className="flex-1 overflow-y-auto flex flex-col relative bg-white">
          
          {/* SCREEN: HOME */}
          {screen === "home" && (
            <div className="flex-1 flex flex-col">
              {/* Top App Bar */}
              <div className="flex items-center gap-2.5 px-4.5 py-3">
                <div className="font-mono font-bold text-lg flex items-center gap-2 text-[#1A1B23]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F2A93C] shadow-[0_0_8px_2px_rgba(242,169,60,0.5)]" />
                  Lumira
                </div>
                <div className="flex-1" />
                <button
                  onClick={() => {
                    setComingSoonInfo({
                      title: "Community",
                      desc: "Find and join subject-level communities across academic institutions — not tied to any single course. Coming soon."
                    });
                    setScreen("comingSoon");
                  }}
                  className="w-8.5 h-8.5 rounded-full bg-[#F1F1F6] flex items-center justify-center text-sm hover:bg-[#E5E5EB] transition"
                  title="Community"
                >
                  👥
                </button>
                <button
                  onClick={() => {
                    setComingSoonInfo({
                      title: "Buy Course",
                      desc: "Discover and purchase verified masterclasses created by educators directly inside Lumira. Coming soon."
                    });
                    setScreen("comingSoon");
                  }}
                  className="w-8.5 h-8.5 rounded-full bg-[#F1F1F6] flex items-center justify-center text-sm hover:bg-[#E5E5EB] transition"
                  title="Buy Course"
                >
                  🛒
                </button>
              </div>

              {/* Segmented Control (AD-019: Cards vs Course Spaces) */}
              <div className="flex bg-[#F1F1F6] rounded-xl mx-4.5 mb-3 p-1">
                <button
                  onClick={() => setHomeTab("cards")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg font-mono transition ${
                    homeTab === "cards" ? "bg-white text-[#1A1B23] shadow-sm" : "text-[#6E7180]"
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setHomeTab("spaces")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg font-mono transition ${
                    homeTab === "spaces" ? "bg-white text-[#1A1B23] shadow-sm" : "text-[#6E7180]"
                  }`}
                >
                  Course Spaces
                </button>
              </div>

              <div className="px-4.5 text-[11px] text-[#6E7180] font-semibold uppercase tracking-wider mb-2">
                {homeTab === "cards" ? "All your study cards" : "Shared with you or by you"}
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-2 gap-3 px-4.5 pb-24">
                {filteredCards.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveCardId(c.id);
                      setCardTab("resources");
                      setViewingAsMember(false);
                      setScreen("cardDetail");
                    }}
                    style={{ backgroundColor: c.color }}
                    className="rounded-2xl p-4 cursor-pointer relative text-white min-h-[105px] flex flex-col justify-between shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    {c.isShared && (
                      <span className="absolute top-2.5 right-2.5 bg-white/25 rounded-full text-[10px] px-2 py-0.5 font-semibold backdrop-blur-sm">
                        Course Space
                      </span>
                    )}
                    <div className="font-semibold text-sm leading-snug pr-8 mt-1 font-mono">
                      {c.name}
                    </div>
                    <div className="text-[11px] opacity-90 flex items-center gap-1.5 mt-2">
                      {c.isShared ? `👥 ${c.members.length} members` : "🔒 Private Card"}
                    </div>
                  </div>
                ))}

                {filteredCards.length === 0 && (
                  <div className="col-span-2 text-center py-12 px-6 text-[#6E7180] text-xs leading-relaxed border border-dashed border-[#E7E6EE] rounded-2xl">
                    <div className="text-2xl mb-2">🗂️</div>
                    {homeTab === "spaces"
                      ? "No Course Spaces yet — share a Card to create one."
                      : "No Cards yet — tap + to create your first one."}
                  </div>
                )}
              </div>

              {/* FAB: Create Card */}
              <button
                onClick={() => {
                  setCreateCardName("");
                  setCreateCardColor(COLORS[0]);
                  setOverlay("createCard");
                }}
                className="absolute right-5 bottom-20 w-13 h-13 rounded-full bg-[#5B5FEF] text-white text-2xl font-bold shadow-[0_8px_20px_rgba(91,95,239,0.4)] flex items-center justify-center hover:bg-[#4d51e8] active:scale-95 transition"
              >
                +
              </button>

              {/* Bottom Navigation */}
              <div className="mt-auto border-t border-[#E7E6EE] px-6 py-2.5 bg-white flex items-center justify-between text-[10px] text-[#6E7180]">
                <button className="flex-1 flex flex-col items-center gap-1 text-[#5B5FEF] font-semibold">
                  <span className="text-base">🏠</span>
                  Home
                </button>
                <button 
                  onClick={() => showToast("Search is enabled across all Card aggregates")}
                  className="flex-1 flex flex-col items-center gap-1 hover:text-[#1A1B23]"
                >
                  <span className="text-base">🔍</span>
                  Search
                </button>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="flex-1 flex flex-col items-center gap-1 hover:text-[#1A1B23]"
                >
                  <span className="text-base">👤</span>
                  Profile
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: CARD DETAIL / WORKSPACE */}
          {screen === "cardDetail" && activeCard && (
            <div className="flex-1 flex flex-col pb-20">
              
              {/* Back Row */}
              <div className="flex items-center gap-2 px-3 pt-2 pb-1">
                <button
                  onClick={() => setScreen("home")}
                  className="p-1.5 text-xl font-bold hover:bg-slate-100 rounded-lg text-[#1A1B23]"
                >
                  ←
                </button>
                {activeCard.isShared && (
                  <button
                    onClick={() => setCardTab("shareLink")}
                    className="ml-auto w-8 h-8 rounded-full bg-[#F1F1F6] flex items-center justify-center text-sm hover:bg-[#E5E5EB]"
                    title="Share Link & Membership"
                  >
                    🔗
                  </button>
                )}
              </div>

              {/* Joining Student Banner (AD-025 preview) */}
              {viewingAsMember && (
                <div className="mx-4 my-2 px-3 py-2 bg-[#FFF4E0] rounded-xl text-xs text-[#8A5A0F] flex items-center justify-between">
                  <span>👀 Previewing as a joining student</span>
                  <button onClick={handleExitPreview} className="font-bold underline text-[11px]">
                    Exit preview
                  </button>
                </div>
              )}

              {/* Detail Head */}
              <div className="px-4.5 pt-1 pb-3">
                <h2 className="text-xl font-bold font-mono text-[#1A1B23] tracking-tight">{activeCard.name}</h2>
                <div className="flex items-center gap-2 text-xs text-[#6E7180] mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    activeCard.myRole === "Owner" ? "bg-[#EDE9FE] text-[#6D28D9]" :
                    activeCard.myRole === "Admin" ? "bg-[#DBEAFE] text-[#1D4ED8]" :
                    "bg-[#E5F7F1] text-[#0F7A5C]"
                  }`}>
                    {activeCard.myRole}
                  </span>
                  {activeCard.isShared && (
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-1.5">
                        {activeCard.members.slice(0, 3).map((m, i) => (
                          <div key={i} className="w-5 h-5 rounded-full bg-[#5B5FEF] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                            {m.name[0]}
                          </div>
                        ))}
                      </div>
                      <span>{activeCard.members.length} members</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button: Create Course Space */}
              {!activeCard.isShared && (
                <div className="px-4.5 pb-2">
                  <button
                    onClick={() => setOverlay("createCourseSpace")}
                    className="w-full py-2.5 bg-[#5B5FEF] hover:bg-[#4d51e8] text-white rounded-xl text-xs font-semibold font-mono shadow-md shadow-indigo-500/20"
                  >
                    Create Course Space
                  </button>
                </div>
              )}

              {/* Section Tabs (AD-020 + Live Chat Tab for Course Spaces) */}
              <div className="flex gap-1 px-3 border-b border-[#E7E6EE] overflow-x-auto no-scrollbar mb-2">
                {[
                  { id: "resources", label: "Resources" },
                  { id: "notes", label: "Notes" },
                  { id: "quizzes", label: "Quizzes" },
                  { id: "flashcards", label: "Flashcards" },
                  ...(activeCard.isShared ? [
                    { id: "chat", label: "💬 Chat" },
                    { id: "updates", label: "Updates" },
                    { id: "members", label: "Members" }
                  ] : [])
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setCardTab(t.id as any)}
                    className={`px-3.5 py-2 text-xs font-semibold whitespace-nowrap rounded-full transition font-mono ${
                      cardTab === t.id ? "bg-[#1A1B23] text-white" : "text-[#6E7180] hover:text-[#1A1B23]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* SUBSECTION: RESOURCES */}
              {cardTab === "resources" && (
                <div className="px-4.5 space-y-2.5">
                  {(!viewingAsMember || activeCard.myRole !== "Member") && (
                    <button
                      onClick={() => {
                        setUploadResName(`Lecture ${activeCard.resources.length + 1}.pdf`);
                        setOverlay("addResource");
                      }}
                      className="text-xs font-semibold font-mono text-[#5B5FEF] py-2 flex items-center gap-1.5 hover:underline"
                    >
                      + Add Resource
                    </button>
                  )}

                  {activeCard.resources.map(res => (
                    <div key={res.id} className="flex items-center gap-3 py-2.5 border-b border-[#E7E6EE]">
                      <div className="w-9 h-9 rounded-xl bg-[#F1F1F6] flex items-center justify-center text-sm shrink-0">
                        📄
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-[#1A1B23] truncate">{res.name}</div>
                        <div className="text-[10px] text-[#6E7180]">
                          {activeCard.isShared ? "Shared with Course Space" : "Private to Card"}
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenSarah(activeCard.id, "resource", res.name)}
                        className="w-7 h-7 rounded-full bg-[#FFF4E0] text-xs flex items-center justify-center shrink-0 hover:scale-105"
                        title="Ground Sarah on this Resource"
                      >
                        ✨
                      </button>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        res.status === "PENDING" ? "bg-[#FFF4E0] text-[#B7791F]" :
                        res.status === "PROCESSING" ? "bg-[#E5F0FF] text-[#2563EB]" :
                        "bg-[#E5F7F1] text-[#0F7A5C]"
                      }`}>
                        {res.status === "READY" ? "Ready" : res.status === "PROCESSING" ? "Processing" : "Pending"}
                      </span>
                    </div>
                  ))}

                  {activeCard.resources.length === 0 && (
                    <div className="text-center py-10 text-[#6E7180] text-xs">
                      <div className="text-2xl mb-1">📄</div>
                      No resources yet
                    </div>
                  )}
                </div>
              )}

              {/* SUBSECTION: NOTES */}
              {cardTab === "notes" && (
                <div className="px-4.5 space-y-2.5">
                  {activeCard.notes.map(note => (
                    <div key={note.id} className="flex items-center gap-3 py-2.5 border-b border-[#E7E6EE]">
                      <div className="w-9 h-9 rounded-xl bg-[#F1F1F6] flex items-center justify-center text-sm shrink-0">
                        📝
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-[#1A1B23] truncate">{note.name}</div>
                        <div className="text-[10px] text-[#6E7180]">
                          {note.shared ? "Shared to Course Space" : "Private to you"}
                        </div>
                      </div>
                      {activeCard.isShared && activeCard.myRole === "Owner" && (
                        <button
                          onClick={() => handleToggleItemShare(activeCard.id, "notes", note.id)}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition ${
                            note.shared ? "bg-[#EDE9FE] text-[#6D28D9] border-transparent" : "border-[#E7E6EE] text-[#6E7180]"
                          }`}
                        >
                          {note.shared ? "Shared" : "Share"}
                        </button>
                      )}
                    </div>
                  ))}

                  {activeCard.notes.length === 0 && (
                    <div className="text-center py-10 text-[#6E7180] text-xs">
                      <div className="text-2xl mb-1">📝</div>
                      No notes yet — {viewingAsMember ? "create your own from shared materials" : "private to you unless shared"}
                    </div>
                  )}
                </div>
              )}

              {/* SUBSECTION: QUIZZES */}
              {cardTab === "quizzes" && (
                <div className="px-4.5 space-y-2.5">
                  {activeCard.quizzes.map(quiz => (
                    <div key={quiz.id} className="flex items-center gap-3 py-2.5 border-b border-[#E7E6EE]">
                      <div className="w-9 h-9 rounded-xl bg-[#F1F1F6] flex items-center justify-center text-sm shrink-0">
                        ❓
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-[#1A1B23] truncate">{quiz.name}</div>
                        <div className="text-[10px] text-[#6E7180]">
                          {quiz.shared ? "Shared to Course Space" : "Private to you"}
                        </div>
                      </div>
                    </div>
                  ))}

                  {activeCard.quizzes.length === 0 && (
                    <div className="text-center py-8 text-[#6E7180] text-xs">
                      <div className="text-2xl mb-1">❓</div>
                      No quizzes yet
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setGenKey("quizzes");
                        setOverlay("generate");
                      }}
                      className="w-full py-2.5 bg-[#5B5FEF] hover:bg-[#4d51e8] text-white rounded-xl text-xs font-semibold font-mono shadow-sm"
                    >
                      ✨ Generate Quiz with Sarah
                    </button>
                  </div>
                </div>
              )}

              {/* SUBSECTION: FLASHCARDS */}
              {cardTab === "flashcards" && (
                <div className="px-4.5 space-y-2.5">
                  {activeCard.flashcards.map(fc => (
                    <div key={fc.id} className="flex items-center gap-3 py-2.5 border-b border-[#E7E6EE]">
                      <div className="w-9 h-9 rounded-xl bg-[#F1F1F6] flex items-center justify-center text-sm shrink-0">
                        🗂️
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-[#1A1B23] truncate">{fc.name}</div>
                        <div className="text-[10px] text-[#6E7180]">
                          {fc.shared ? "Shared to Course Space" : "Private to you"}
                        </div>
                      </div>
                    </div>
                  ))}

                  {activeCard.flashcards.length === 0 && (
                    <div className="text-center py-8 text-[#6E7180] text-xs">
                      <div className="text-2xl mb-1">🗂️</div>
                      No flashcards yet
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setGenKey("flashcards");
                        setOverlay("generate");
                      }}
                      className="w-full py-2.5 bg-[#5B5FEF] hover:bg-[#4d51e8] text-white rounded-xl text-xs font-semibold font-mono shadow-sm"
                    >
                      ✨ Generate Flashcards with Sarah
                    </button>
                  </div>
                </div>
              )}

              {/* SUBSECTION: LIVE CHAT (NEW) */}
              {cardTab === "chat" && activeCard.isShared && (
                <div className="px-3">
                  <CourseSpaceChat
                    cardId={activeCard.id}
                    cardName={activeCard.name}
                    userRole={activeCard.myRole}
                    membersCount={activeCard.members.length}
                  />
                </div>
              )}

              {/* SUBSECTION: UPDATES */}
              {cardTab === "updates" && (
                <div className="px-4.5 space-y-3">
                  {activeCard.updates.map(u => (
                    <div key={u.id} className="py-2.5 border-b border-[#E7E6EE] text-xs">
                      <div className="text-[#1A1B23]">{u.text}</div>
                      <div className="text-[10px] text-[#6E7180] mt-0.5">{u.time}</div>
                    </div>
                  ))}
                  {activeCard.updates.length === 0 && (
                    <div className="text-center py-10 text-[#6E7180] text-xs">
                      No updates yet
                    </div>
                  )}
                </div>
              )}

              {/* SUBSECTION: MEMBERS */}
              {cardTab === "members" && (
                <div className="px-4.5 space-y-2">
                  {activeCard.members.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-2.5 border-b border-[#E7E6EE]">
                      <div className="w-8 h-8 rounded-full bg-[#5B5FEF] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {m.name[0]}
                      </div>
                      <div className="flex-1 text-xs font-semibold text-[#1A1B23]">{m.name}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.role === "Owner" ? "bg-[#EDE9FE] text-[#6D28D9]" :
                        m.role === "Admin" ? "bg-[#DBEAFE] text-[#1D4ED8]" :
                        "bg-[#E5F7F1] text-[#0F7A5C]"
                      }`}>
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* SUBSECTION: SHARE LINK */}
              {cardTab === "shareLink" && (
                <div className="px-4.5 space-y-3.5 pt-2">
                  {!activeCard.shareLink ? (
                    <div className="text-center py-8 text-[#6E7180] text-xs leading-relaxed">
                      <div className="text-2xl mb-2">🔗</div>
                      No link generated yet — create one to invite students.
                      <div className="mt-3">
                        <button
                          onClick={() => handleGenerateLink(activeCard.id)}
                          className="px-4 py-2 bg-[#5B5FEF] text-white rounded-xl text-xs font-semibold font-mono"
                        >
                          Generate Link
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-[11px] font-semibold text-[#6E7180]">Share Link</div>
                      <div className="bg-[#F1F1F6] rounded-xl p-3 text-xs font-mono text-[#1A1B23] break-all">
                        🔗 {activeCard.shareLink}
                      </div>
                      <button
                        onClick={() => handleCopyLink(activeCard.shareLink!)}
                        className="w-full py-2 bg-[#F1F1F6] hover:bg-[#E5E5EB] text-xs font-semibold rounded-xl text-[#1A1B23] font-mono transition"
                      >
                        Copy Link
                      </button>

                      <div className="flex items-center justify-between py-2 border-t border-[#E7E6EE]">
                        <div>
                          <div className="text-xs font-semibold text-[#1A1B23]">Require approval to join</div>
                          <div className="text-[10px] text-[#6E7180]">You review each request before they enter</div>
                        </div>
                        <button
                          onClick={() => handleToggleApproval(activeCard.id)}
                          className={`w-10 h-6 rounded-full p-0.5 transition ${
                            activeCard.requireApproval ? "bg-[#5B5FEF]" : "bg-[#E7E6EE]"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            activeCard.requireApproval ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleResetLink(activeCard.id)}
                        className="w-full py-2 bg-[#FBEAE7] hover:bg-[#fad8d4] text-[#C24C3B] rounded-xl text-xs font-semibold font-mono transition"
                      >
                        Reset link (invalidate old one)
                      </button>

                      <div className="pt-3 border-t border-dashed border-[#E7E6EE]">
                        <div className="text-[11px] font-semibold text-[#6E7180] mb-2">Test the joining experience</div>
                        <button
                          onClick={() => setOverlay("joinPreview")}
                          className="w-full py-2.5 bg-[#5B5FEF] hover:bg-[#4d51e8] text-white rounded-xl text-xs font-semibold font-mono shadow-md shadow-indigo-500/20"
                        >
                          👀 Preview as joining student
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Persistent Sarah Floating Button (AD-027) */}
              <button
                onClick={() => handleOpenSarah(activeCard.id, "workspace")}
                className="absolute right-5 bottom-6 w-13 h-13 rounded-full bg-[#F2A93C] text-[#3A2A05] text-2xl font-bold shadow-[0_8px_20px_rgba(242,169,60,0.45)] flex items-center justify-center hover:scale-105 active:scale-95 transition z-10"
                title="Ask Sarah AI Tutor"
              >
                ✨
              </button>
            </div>
          )}

          {/* SCREEN: COMING SOON */}
          {screen === "comingSoon" && (
            <div className="flex-1 flex flex-col p-6">
              <button
                onClick={() => setScreen("home")}
                className="self-start text-xl font-bold p-1 text-[#1A1B23]"
              >
                ←
              </button>
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-3">
                <div className="text-4xl">✨</div>
                <h3 className="text-lg font-bold font-mono text-[#1A1B23]">{comingSoonInfo.title}</h3>
                <p className="text-xs text-[#6E7180] leading-relaxed max-w-xs">{comingSoonInfo.desc}</p>
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#E5F7F1] text-[#0F7A5C]">
                  Coming soon
                </span>
              </div>
            </div>
          )}

        </div>

        {/* TOAST POPUP */}
        {toastMessage && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#1A1B23] text-white text-[11px] px-4 py-2 rounded-full shadow-xl pointer-events-none z-50 animate-in fade-in">
            {toastMessage}
          </div>
        )}

        {/* OVERLAY: CREATE CARD */}
        {overlay === "createCard" && (
          <div className="absolute inset-0 bg-black/45 flex items-end z-40">
            <div className="bg-white w-full rounded-t-3xl p-5 space-y-4 shadow-2xl relative">
              <button
                onClick={() => setOverlay(null)}
                className="absolute top-4 right-4 text-[#6E7180] text-sm p-1"
              >
                ✕
              </button>
              <h3 className="text-base font-bold font-mono text-[#1A1B23]">Create New Card</h3>
              <div>
                <label className="text-[11px] font-semibold text-[#6E7180] block mb-1">Card Name</label>
                <input
                  type="text"
                  placeholder="e.g. Physics 101, Discrete Math"
                  value={createCardName}
                  onChange={e => setCreateCardName(e.target.value)}
                  className="w-full p-2.5 border border-[#E7E6EE] rounded-xl text-xs outline-none focus:border-[#5B5FEF]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#6E7180] block mb-1.5">Choose Color</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setCreateCardColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-lg border-2 transition ${
                        createCardColor === c ? "border-[#1A1B23] scale-110" : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={handleConfirmCreateCard}
                className="w-full py-2.5 bg-[#5B5FEF] text-white font-semibold font-mono rounded-xl text-xs shadow-md"
              >
                + Create Card
              </button>
            </div>
          </div>
        )}

        {/* OVERLAY: CREATE COURSE SPACE */}
        {overlay === "createCourseSpace" && activeCard && (
          <div className="absolute inset-0 bg-black/45 flex items-end z-40">
            <div className="bg-white w-full rounded-t-3xl p-5 space-y-3.5 shadow-2xl relative">
              <button
                onClick={() => setOverlay(null)}
                className="absolute top-4 right-4 text-[#6E7180] text-sm p-1"
              >
                ✕
              </button>
              <h3 className="text-base font-bold font-mono text-[#1A1B23]">
                Create Course Space from "{activeCard.name}"?
              </h3>
              <p className="text-xs text-[#6E7180] leading-relaxed">
                Resources are shared with members by default. Your Notes, Quizzes, and Flashcards
                stay private unless you explicitly share them.
              </p>
              <button
                onClick={() => handleConfirmCreateCourseSpace(activeCard.id)}
                className="w-full py-2.5 bg-[#5B5FEF] text-white font-semibold font-mono rounded-xl text-xs"
              >
                Create Course Space
              </button>
              <button
                onClick={() => setOverlay(null)}
                className="w-full py-2 bg-[#F1F1F6] text-[#1A1B23] font-semibold font-mono rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* OVERLAY: ADD RESOURCE */}
        {overlay === "addResource" && activeCard && (
          <div className="absolute inset-0 bg-black/45 flex items-end z-40">
            <div className="bg-white w-full rounded-t-3xl p-5 space-y-3.5 shadow-2xl relative">
              <button
                onClick={() => setOverlay(null)}
                className="absolute top-4 right-4 text-[#6E7180] text-sm p-1"
              >
                ✕
              </button>
              <h3 className="text-base font-bold font-mono text-[#1A1B23]">Add Resource</h3>
              <input
                type="text"
                placeholder="e.g. Lecture 5.pdf"
                value={uploadResName}
                onChange={e => setUploadResName(e.target.value)}
                className="w-full p-2.5 border border-[#E7E6EE] rounded-xl text-xs outline-none focus:border-[#5B5FEF]"
              />
              <button
                onClick={() => handleConfirmAddResource(activeCard.id)}
                className="w-full py-2.5 bg-[#5B5FEF] text-white font-semibold font-mono rounded-xl text-xs"
              >
                Upload Resource
              </button>
            </div>
          </div>
        )}

        {/* OVERLAY: GENERATE QUIZ / FLASHCARDS */}
        {overlay === "generate" && activeCard && (
          <div className="absolute inset-0 bg-black/45 flex items-end z-40">
            <div className="bg-white w-full rounded-t-3xl p-5 space-y-3 shadow-2xl relative">
              <button
                onClick={() => setOverlay(null)}
                className="absolute top-4 right-4 text-[#6E7180] text-sm p-1"
              >
                ✕
              </button>
              <h3 className="text-base font-bold font-mono text-[#1A1B23]">
                Customize {genKey === "quizzes" ? "Quiz" : "Flashcards"}
              </h3>
              <div>
                <label className="text-[11px] font-semibold text-[#6E7180] block mb-1">Sources</label>
                <input
                  type="text"
                  disabled
                  value={`${activeCard.resources.length} resource(s) in this Card`}
                  className="w-full p-2 bg-[#F1F1F6] border border-[#E7E6EE] rounded-xl text-xs text-[#6E7180]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#6E7180] block mb-1">Focus Area</label>
                <input
                  type="text"
                  placeholder="e.g. Virtual memory, Paging algorithms"
                  value={genPrompt}
                  onChange={e => setGenPrompt(e.target.value)}
                  className="w-full p-2 border border-[#E7E6EE] rounded-xl text-xs outline-none focus:border-[#5B5FEF]"
                />
              </div>

              {/* AI Usage Bar (AD-037) */}
              <div className="py-1">
                <div className="flex justify-between text-[11px] font-semibold text-[#6E7180] mb-1">
                  <span>AI Usage</span>
                  <span>{Math.round((aiUsageUsed / aiUsageTotal) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-[#F1F1F6] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.round((aiUsageUsed / aiUsageTotal) * 100)}%` }}
                    className="h-full bg-[#5B5FEF] rounded-full transition-all"
                  />
                </div>
                <div className="flex gap-3 text-[9px] text-[#6E7180] mt-1.5">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5B5FEF]" />
                    Already used ({aiUsageUsed})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D9DAF5]" />
                    Expected use (+6)
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleConfirmGenerate(activeCard.id)}
                className="w-full py-2.5 bg-[#5B5FEF] text-white font-semibold font-mono rounded-xl text-xs"
              >
                Generate Artifact
              </button>
            </div>
          </div>
        )}

        {/* OVERLAY: JOIN PREVIEW */}
        {overlay === "joinPreview" && activeCard && (
          <div className="absolute inset-0 bg-black/45 flex items-end z-40">
            <div className="bg-white w-full rounded-t-3xl p-5 space-y-3.5 shadow-2xl relative">
              <button
                onClick={() => setOverlay(null)}
                className="absolute top-4 right-4 text-[#6E7180] text-sm p-1"
              >
                ✕
              </button>
              <h3 className="text-base font-bold font-mono text-[#1A1B23]">
                Join "{activeCard.name}"?
              </h3>
              <p className="text-xs text-[#6E7180] leading-relaxed">
                {activeCard.members.length} members · You will receive an independent Card with this Course Space's shared
                resources. Your personal notes, quizzes, and study sets stay completely private to you.
              </p>
              {activeCard.requireApproval && (
                <p className="text-xs font-semibold text-amber-700 bg-amber-50 p-2 rounded-lg">
                  ⚠️ This space requires owner approval to join.
                </p>
              )}
              <button
                onClick={() => handleConfirmJoin(activeCard.id)}
                className="w-full py-2.5 bg-[#5B5FEF] text-white font-semibold font-mono rounded-xl text-xs"
              >
                Join Course Space
              </button>
              <button
                onClick={() => setOverlay(null)}
                className="w-full py-2 bg-[#F1F1F6] text-[#1A1B23] font-semibold font-mono rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* OVERLAY: SARAH AI TUTOR (AD-027, AD-054) */}
        {overlay === "sarah" && activeCard && (
          <div className="absolute inset-0 bg-black/45 flex items-end z-40">
            <div className="bg-white w-full rounded-t-3xl p-4 flex flex-col h-[520px] max-h-[85%] shadow-2xl relative">
              <button
                onClick={() => setOverlay(null)}
                className="absolute top-3.5 right-4 text-[#6E7180] text-sm p-1 z-10"
              >
                ✕
              </button>

              {/* Sarah Header */}
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E7E6EE]">
                <div className="w-8 h-8 rounded-full bg-[#F2A93C] text-[#3A2A05] flex items-center justify-center font-bold text-xs shadow-sm">
                  ✨
                </div>
                <div>
                  <div className="font-bold text-xs font-mono text-[#1A1B23]">Sarah AI Tutor</div>
                  <div className="text-[10px] text-[#6E7180]">
                    {sarahContext.type === "resource"
                      ? `Reading in: ${activeCard.name}`
                      : `${activeCard.name}${activeCard.isShared ? " · Course Space" : ""}`}
                  </div>
                </div>
              </div>

              {/* Privacy Notice (AD-028 & AD-054) */}
              <div className="text-[10px] text-[#8A5A0F] bg-[#FFF8EB] rounded-lg p-2 my-2 leading-relaxed">
                {activeCard.isShared
                  ? (viewingAsMember
                      ? "Sarah can see this Course Space's shared resources. Your own notes stay private."
                      : "In a Course Space, Sarah never retrieves another member's private notes or private study sets.")
                  : "Sarah is strictly grounded in this Card's curated resources and your private notes."}
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto space-y-2 py-1 pr-1">
                {activeCard.sarahMessages.map((msg, i) => {
                  if (msg.from === "context") {
                    return (
                      <div key={i} className="flex justify-center my-1">
                        <span className="bg-[#FFF4E0] text-[#8A5A0F] rounded-full px-3 py-1 text-[10px] font-mono">
                          📄 Discussing: {msg.text}
                        </span>
                      </div>
                    );
                  }

                  const isUser = msg.from === "user";
                  return (
                    <div
                      key={i}
                      className={`flex gap-1.5 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isUser && (
                        <div className="w-5 h-5 rounded-full bg-[#F2A93C] text-[#3A2A05] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          ✨
                        </div>
                      )}
                      <div
                        className={`max-w-[82%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                          isUser
                            ? "bg-[#5B5FEF] text-white rounded-br-sm"
                            : "bg-[#F1F1F6] text-[#1A1B23] rounded-bl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}

                {isSarahThinking && (
                  <div className="text-[11px] text-[#6E7180] italic pl-6">
                    Sarah is thinking…
                  </div>
                )}
              </div>

              {/* Sarah Input Bar */}
              <div className="flex gap-2 pt-2 border-t border-[#E7E6EE] mt-1">
                <input
                  type="text"
                  placeholder="Ask Sarah..."
                  value={sarahInput}
                  onChange={e => setSarahInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendSarah()}
                  className="flex-1 px-3 py-2 bg-[#F1F1F6] border border-[#E7E6EE] rounded-full text-xs outline-none focus:border-[#5B5FEF]"
                />
                <button
                  onClick={handleSendSarah}
                  disabled={!sarahInput.trim()}
                  className="w-8 h-8 rounded-full bg-[#F2A93C] text-[#3A2A05] flex items-center justify-center text-xs font-bold disabled:opacity-40"
                >
                  ➤
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Global Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};
