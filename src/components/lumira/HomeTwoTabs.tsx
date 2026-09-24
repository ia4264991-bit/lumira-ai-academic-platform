import React, { useState, useEffect } from "react";
import { 
  Plus, Users, Layers, Sparkles, BookOpen, 
  ArrowRight, LogIn, LogOut, Search, User as UserIcon,
  CheckCircle2, FileText, HelpCircle, ShieldCheck
} from "lucide-react";
import { Card } from "../../types/lumira";
import { LumiraAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { CardWorkspaceModal } from "./CardWorkspaceModal";
import { AuthModal } from "./AuthModal";
import { ThemeToggle } from "./ThemeToggle";

export const HomeTwoTabs: React.FC = () => {
  // Tab state: "cards" (Personal Cards) vs "spaces" (Course Spaces) - AD-019
  const [activeTab, setActiveTab] = useState<"cards" | "spaces">("cards");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Auth state from AuthProvider
  const { user, signOut, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Selected Card for full page workspace
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Create Card modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [newCardColor, setNewCardColor] = useState("from-indigo-600 to-violet-700");

  const loadCards = async () => {
    setLoading(true);
    try {
      const data = await LumiraAPI.getCards(activeTab === "spaces" ? "shared" : undefined);
      setCards(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, [activeTab]);

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim()) return;
    try {
      const newCard = await LumiraAPI.createCard(newCardName.trim(), newCardColor);
      setShowCreateModal(false);
      setNewCardName("");
      // If we are on spaces tab, convert it immediately to course space
      if (activeTab === "spaces") {
        await LumiraAPI.convertToCourseSpace(newCard.id);
      }
      loadCards();
      setSelectedCard(newCard);
    } catch (err: any) {
      alert("Failed to create card: " + err.message);
    }
  };

  const filteredCards = cards.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Platform Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Lumira
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                Academic Copilot
              </span>
            </h1>
            <p className="text-xs text-slate-400">Architecture AD-019 • Unified Study Workspaces</p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

          {/* User Auth Info & Controls */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-slate-200">{user.displayName || "Scholar"}</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[120px] font-mono">{user.email || "guest@lumira.edu"}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Guest</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Top Control Bar: Two Tabs (AD-019) + Search & Create */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* AD-019: Filtered read tabs over single Card aggregate */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("cards")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeTab === "cards"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Personal Cards</span>
            </button>
            <button
              onClick={() => setActiveTab("spaces")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeTab === "spaces"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Course Spaces</span>
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={activeTab === "cards" ? "Search your cards..." : "Search course spaces..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 shrink-0 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === "cards" ? "New Card" : "New Course Space"}</span>
            </button>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 space-y-4">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-200">
                {activeTab === "cards" ? "No Personal Cards found" : "No Course Spaces joined yet"}
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {activeTab === "cards" 
                  ? "Create your first private study card to organize lecture slides, generate quizzes, and consult Sarah AI."
                  : "Course spaces allow shared resource collections, collaborative quizzes, and live peer discussion."}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20"
            >
              {activeTab === "cards" ? "Create Study Card" : "Launch Course Space"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map(card => (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="group cursor-pointer bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between"
              >
                <div>
                  {/* Card Gradient Banner */}
                  <div className={`h-28 bg-gradient-to-r ${card.color} p-4 flex flex-col justify-between relative`}>
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20">
                        {card.isShared ? "Course Space" : "Personal Card"}
                      </span>
                      {card.role && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/30 backdrop-blur-md text-white">
                          {card.role}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition line-clamp-2">
                      {card.name}
                    </h3>

                    {/* First-class Subsystem Stats (AD-020) */}
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-slate-500 block text-[10px]">RESOURCES</span>
                        <span className="font-semibold text-slate-300">{card.stats?.resourcesCount || 0}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-500 block text-[10px]">NOTES</span>
                        <span className="font-semibold text-slate-300">{card.stats?.notesCount || 0}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-500 block text-[10px]">QUIZZES</span>
                        <span className="font-semibold text-slate-300">{card.stats?.quizzesCount || 0}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-500 block text-[10px]">CARDS</span>
                        <span className="font-semibold text-slate-300">{card.stats?.flashcardsCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">
                    Created {new Date(card.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                    Enter Workspace
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Card Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {activeTab === "cards" ? "Create Personal Study Card" : "Launch Course Space"}
            </h3>
            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Workspace Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Organic Chemistry II, Machine Learning..."
                  value={newCardName}
                  onChange={e => setNewCardName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Theme Gradient
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    "from-indigo-600 to-violet-700",
                    "from-emerald-600 to-teal-700",
                    "from-blue-600 to-indigo-700",
                    "from-amber-600 to-rose-700",
                    "from-fuchsia-600 to-pink-700",
                    "from-cyan-600 to-blue-700",
                    "from-purple-600 to-indigo-800",
                    "from-rose-600 to-red-800"
                  ].map(grad => (
                    <button
                      type="button"
                      key={grad}
                      onClick={() => setNewCardColor(grad)}
                      className={`h-10 rounded-lg bg-gradient-to-r ${grad} border-2 transition ${
                        newCardColor === grad ? "border-white scale-105" : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Card Workspace Full Page View */}
      {selectedCard && (
        <CardWorkspaceModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdateCard={(updated) => {
            setSelectedCard(updated);
            loadCards();
          }}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};
