import React, { useState, useEffect } from "react";
import {
  Plus, Users, Lock, Search as SearchIcon, User as UserIcon, Sparkles,
} from "lucide-react";
import { Card } from "../../types/lumira";
import { LumiraAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { CardWorkspaceModal } from "./CardWorkspaceModal";
import { AuthModal } from "./AuthModal";
import { ThemeToggle } from "./ThemeToggle";

const SWATCHES = ["#5B5FEF", "#F2A93C", "#2FAE8E", "#E8776A", "#8B5CF6", "#0EA5E9"];

// Card colors in stored data may still be legacy Tailwind gradient tokens
// ("from-indigo-600 to-violet-700") from before this redesign. Fall back to a
// flat swatch so every tile renders correctly either way.
function tileBackground(color: string): React.CSSProperties {
  if (color?.startsWith("#")) return { background: color };
  if (color && color.startsWith("from-")) return {}; // let the gradient utility class handle it
  return { background: SWATCHES[0] };
}
function tileClassName(color: string): string {
  if (color && color.startsWith("from-")) return `bg-gradient-to-br ${color} to-black/10`;
  return "";
}

export const HomeTwoTabs: React.FC = () => {
  const [homeTab, setHomeTab] = useState<"cards" | "spaces">("cards");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [newCardColor, setNewCardColor] = useState(SWATCHES[0]);
  const [creating, setCreating] = useState(false);

  const loadCards = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await LumiraAPI.getCards(homeTab === "spaces" ? "shared" : undefined);
      setCards(data);
    } catch (err: any) {
      setLoadError(err?.message || "Couldn't reach the Lumira server.");
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeTab]);

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim() || creating) return;
    setCreating(true);
    try {
      const newCard = await LumiraAPI.createCard(newCardName.trim(), newCardColor);
      if (homeTab === "spaces") {
        await LumiraAPI.convertToCourseSpace(newCard.id);
      }
      setShowCreateModal(false);
      setNewCardName("");
      await loadCards();
      setSelectedCard(newCard);
    } catch (err: any) {
      alert("Couldn't create that: " + (err?.message || "unknown error"));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <div className="max-w-[420px] mx-auto min-h-screen bg-surface flex flex-col relative sm:my-6 sm:min-h-[85vh] sm:rounded-[32px] sm:shadow-xl sm:overflow-hidden">

        {/* App bar */}
        <div className="flex items-center gap-2 px-[18px] pt-4 pb-2">
          <div className="font-display font-bold text-[1.05rem] flex items-center gap-2 text-ink">
            <span className="w-[9px] h-[9px] rounded-full bg-amber shadow-[0_0_8px_2px_rgba(242,169,60,0.5)]" />
            Lumira
          </div>
          <div className="flex-1" />
          <ThemeToggle />
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(v => !v)}
                className="w-9 h-9 rounded-full bg-primary text-white font-display font-bold text-sm flex items-center justify-center"
                title={user.displayName || user.email || "Account"}
              >
                {(user.displayName || user.email || "S")[0].toUpperCase()}
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 top-11 z-30 bg-surface border border-line rounded-xl shadow-lg py-2 w-44 text-sm">
                  <div className="px-3 py-1.5 text-muted truncate">{user.email || "Guest"}</div>
                  <button
                    onClick={() => { setShowProfileMenu(false); signOut(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-canvas text-ink"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-9 h-9 rounded-full bg-[#F1F1F6] flex items-center justify-center text-ink"
              title="Sign in"
            >
              <UserIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Segmented control */}
        <div className="flex bg-[#F1F1F6] rounded-xl mx-[18px] mt-1.5 mb-3 p-[3px]">
          <button
            onClick={() => setHomeTab("cards")}
            className={`flex-1 py-2.5 text-sm font-display font-semibold rounded-[9px] transition ${
              homeTab === "cards" ? "bg-surface text-ink shadow-sm" : "text-muted"
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setHomeTab("spaces")}
            className={`flex-1 py-2.5 text-sm font-display font-semibold rounded-[9px] transition ${
              homeTab === "spaces" ? "bg-surface text-ink shadow-sm" : "text-muted"
            }`}
          >
            Course Spaces
          </button>
        </div>

        <div className="px-[18px] py-1 text-[0.72rem] font-semibold uppercase tracking-wide text-muted">
          {homeTab === "cards" ? "All your Cards" : "Shared with you or by you"}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 px-[18px] py-1.5">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-2xl bg-[#F1F1F6] animate-pulse" />
              ))}
            </div>
          ) : loadError ? (
            <div className="text-center py-10 px-6 text-muted text-sm leading-relaxed">
              <div className="text-2xl mb-2">⚠️</div>
              Couldn't reach the Lumira server.
              <div className="text-xs mt-1 text-muted/80">{loadError}</div>
              <button onClick={loadCards} className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-sm font-display font-semibold">
                Retry
              </button>
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-10 px-6 text-muted text-sm leading-relaxed">
              <div className="text-2xl mb-2">🗂️</div>
              {homeTab === "spaces"
                ? "No Course Spaces yet — share a Card to create one."
                : "No Cards yet — tap + to create your first one."}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 px-[18px] py-1.5">
              {cards.map(card => (
                <button
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  style={tileBackground(card.color)}
                  className={`text-left rounded-[14px] p-4 min-h-[96px] text-white flex flex-col justify-between relative ${tileClassName(card.color)}`}
                >
                  {card.isShared && (
                    <span className="absolute top-2.5 right-2.5 bg-white/25 rounded-full text-[0.62rem] font-semibold px-2 py-0.5">
                      Course Space
                    </span>
                  )}
                  <div className="font-display font-semibold text-[0.92rem] leading-tight pr-2">{card.name}</div>
                  <div className="text-[0.7rem] opacity-85 flex items-center gap-1">
                    {card.isShared ? (
                      <><Users className="w-3 h-3" /> {card.stats ? `${card.stats.resourcesCount || 0} resources` : "Shared"}</>
                    ) : (
                      <><Lock className="w-3 h-3" /> Private</>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* FAB */}
        <button
          onClick={() => { setNewCardColor(SWATCHES[0]); setShowCreateModal(true); }}
          className="absolute right-[18px] bottom-[78px] w-[54px] h-[54px] rounded-full bg-primary text-white flex items-center justify-center shadow-[0_8px_18px_rgba(91,95,239,0.4)]"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Bottom nav */}
        <div className="flex border-t border-line pt-2.5 pb-3.5 px-6 bg-surface">
          <button className="flex-1 flex flex-col items-center gap-0.5 text-primary text-[0.62rem]">
            <span className="text-[1.15rem] leading-none">🏠</span>Home
          </button>
          <button className="flex-1 flex flex-col items-center gap-0.5 text-muted text-[0.62rem]">
            <SearchIcon className="w-[1.15rem] h-[1.15rem]" />Search
          </button>
          <button
            onClick={() => user ? setShowProfileMenu(v => !v) : setShowAuthModal(true)}
            className="flex-1 flex flex-col items-center gap-0.5 text-muted text-[0.62rem]"
          >
            <UserIcon className="w-[1.15rem] h-[1.15rem]" />Profile
          </button>
        </div>
      </div>

      {/* Create Card sheet */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[rgba(15,15,20,0.45)]" onClick={() => setShowCreateModal(false)}>
          <div
            onClick={e => e.stopPropagation()}
            className="bg-surface w-full sm:max-w-md sm:rounded-[20px] rounded-t-[20px] p-5 pb-7"
          >
            <h3 className="font-display font-bold text-[1.05rem] mb-3.5">
              {homeTab === "cards" ? "Create New Card" : "Create New Course Space"}
            </h3>
            <form onSubmit={handleCreateCard}>
              <label className="text-[0.75rem] font-semibold text-muted mb-1.5 block">Card Name</label>
              <input
                autoFocus
                value={newCardName}
                onChange={e => setNewCardName(e.target.value)}
                placeholder="e.g. Physics 101"
                className="w-full px-[13px] py-[11px] rounded-[10px] border-[1.5px] border-line text-[0.9rem] mb-3.5 focus:outline-none focus:border-primary"
              />
              <label className="text-[0.75rem] font-semibold text-muted mb-1.5 block">Choose Color</label>
              <div className="flex gap-2 flex-wrap mb-4">
                {SWATCHES.map(sw => (
                  <button
                    type="button"
                    key={sw}
                    onClick={() => setNewCardColor(sw)}
                    style={{ background: sw }}
                    className={`w-[30px] h-[30px] rounded-[9px] border-2 ${newCardColor === sw ? "border-ink" : "border-transparent"}`}
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full py-2.5 rounded-[10px] bg-primary text-white font-display font-semibold text-[0.82rem] disabled:opacity-60"
              >
                {creating ? "Creating…" : `+ Create ${homeTab === "cards" ? "Card" : "Course Space"}`}
              </button>
            </form>
          </div>
        </div>
      )}

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

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};
