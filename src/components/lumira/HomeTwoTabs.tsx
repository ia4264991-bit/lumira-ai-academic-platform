import React, { useState, useEffect } from "react";
import { 
  Plus, Users, Layers, Sparkles, BookOpen, 
  ArrowRight, LogIn, LogOut, Search, User as UserIcon
} from "lucide-react";
import { Card } from "../../types/lumira";
import { LumiraAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { CardWorkspaceModal } from "./CardWorkspaceModal";
import { AuthModal } from "./AuthModal";

export const HomeTwoTabs: React.FC = () => {
  // Tab state: "cards" (Personal Cards) vs "spaces" (Course Spaces) - AD-019
  const [activeTab, setActiveTab] = useState<"cards" | "spaces">("cards");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Auth state from AuthProvider
  const { user, signOut, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Selected Card for modal workspace
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
    const card = await LumiraAPI.createCard(newCardName, newCardColor);
    setCards(prev => [card, ...prev]);
    setShowCreateModal(false);
    setNewCardName("");
    setSelectedCard(card);
  };

  const filteredCards = cards.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Lumira
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Card-First Academic Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {authLoading ? (
              <span className="text-xs text-slate-500">Checking session...</span>
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                  <span className="font-medium max-w-[120px] sm:max-w-[200px] truncate">
                    {user.displayName || user.email || (user.isAnonymous ? "Guest Scholar" : "Scholar")}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Sign out of Lumira"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab("cards")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "cards"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-4 h-4" />
              Personal Cards
            </button>
            <button
              onClick={() => setActiveTab("spaces")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "spaces"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              Course Spaces
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-600/20 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Create Card
            </button>
          </div>
        </div>

        {/* Workspaces Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading workspaces...</div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
            <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No {activeTab === "cards" ? "personal cards" : "course spaces"} found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {activeTab === "cards" 
                ? "Create a new Card to organize your lecture resources, study notes, quizzes, and Sarah AI assistance."
                : "Enable sharing on any of your Cards to convert it into a collaborative Course Space."}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition"
            >
              <Plus className="w-4 h-4" />
              Create your first Card
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCards.map(card => (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="group cursor-pointer bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col justify-between"
              >
                {/* Card Banner */}
                <div className={`h-24 p-4 bg-gradient-to-r ${card.color} flex flex-col justify-between relative`}>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-black/40 text-white tracking-wider backdrop-blur-sm">
                      {card.isShared ? "Course Space" : "Personal Card"}
                    </span>
                    {card.role && (
                      <span className="text-[11px] font-medium bg-white/20 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                        {card.role}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1 group-hover:underline">
                    {card.name}
                  </h3>
                </div>

                {/* Subsystems Preview */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{card.stats?.resourcesCount ?? 2} Resources</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{card.stats?.flashcardsCount ?? 12} Flashcards</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Sarah AI Enabled
                    </span>
                    <span className="text-indigo-400 group-hover:translate-x-1 transition flex items-center gap-1 font-medium">
                      Open Workspace <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Card Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create Study Card</h3>
            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Card Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry II, Microeconomics"
                  value={newCardName}
                  onChange={e => setNewCardName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Accent Gradient</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    "from-indigo-600 to-violet-700",
                    "from-emerald-600 to-teal-700",
                    "from-blue-600 to-cyan-700",
                    "from-amber-600 to-rose-700",
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
                  Create Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Card Workspace Full Modal */}
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
