import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../types';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';
import { 
  Users, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Radio, 
  Check, 
  Share2, 
  Heart, 
  ThumbsUp, 
  Zap, 
  Smile,
  ShieldCheck,
  Crown
} from 'lucide-react';

interface FloatingReaction {
  id: string;
  emoji: string;
  userName: string;
  x: number;
}

export const LiveStudyRoom: React.FC = () => {
  const { activeSpace, currentUser, updateStudyProgress } = useApp();

  // Aggregate cards across all modules for study room
  const allCards: Card[] = React.useMemo(() => {
    if (!activeSpace) return [];
    return activeSpace.modules.flatMap((m) => m.cards);
  }, [activeSpace]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

  const currentCard = allCards[currentIndex] || null;

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const handleFlip = () => {
    sound.playFlip();
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < allCards.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      if (activeSpace) {
        updateStudyProgress(activeSpace.id, 10, 0, nextIdx);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      if (activeSpace) {
        updateStudyProgress(activeSpace.id, 0, 0, prevIdx);
      }
    }
  };

  const triggerReaction = (emoji: string) => {
    sound.playFlip();
    const newReaction: FloatingReaction = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      userName: currentUser.name,
      x: 20 + Math.random() * 60,
    };

    setReactions((prev) => [...prev, newReaction]);

    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2000);
  };

  const handleMastery = () => {
    if (!activeSpace) return;
    sound.playCorrect();
    updateStudyProgress(activeSpace.id, 25, 1, currentIndex);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    triggerReaction('🎉');
  };

  if (!activeSpace || allCards.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800">
        <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-slate-400 text-sm">No flashcards available in this CourseSpace yet.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      {/* Live Presence Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>LIVE STUDY ROOM</span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Studying in sync with joined members
          </span>
        </div>

        {/* Online avatars list */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 mr-1">Active Now:</span>
          <div className="flex items-center -space-x-2">
            {activeSpace.members.map((m) => (
              <div key={m.id} className="relative group">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-900"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900" />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-950 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap shadow-lg z-30">
                  {m.name} ({m.role})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Reactions Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {reactions.map((r) => (
          <div
            key={r.id}
            style={{ left: `${r.x}%` }}
            className="absolute bottom-20 flex flex-col items-center animate-out fade-out slide-out-to-top-32 duration-1000"
          >
            <span className="text-3xl">{r.emoji}</span>
            <span className="text-[10px] bg-slate-900/80 px-1.5 py-0.5 rounded text-slate-300 font-medium">
              {r.userName}
            </span>
          </div>
        ))}
      </div>

      {/* Main Flashcard Card */}
      {currentCard && (
        <div className="flex flex-col items-center">
          <div
            onClick={handleFlip}
            className="w-full max-w-2xl min-h-[340px] perspective-1000 cursor-pointer group"
          >
            <div
              className={`relative w-full h-full rounded-3xl p-8 transition-all duration-500 transform-style-preserve-3d flex flex-col justify-between border shadow-2xl select-none ${
                isFlipped
                  ? 'bg-slate-900 border-teal-500/40 text-slate-100'
                  : 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 text-white group-hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-800 text-teal-300 border border-slate-700">
                  {isFlipped ? 'Answer Side' : 'Question Side'}
                </span>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-teal-400 transition-colors">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Click to flip card</span>
                </div>
              </div>

              {/* Main Content */}
              <div className="my-auto py-8 text-center px-4">
                <p className="text-xl sm:text-2xl font-medium leading-relaxed">
                  {isFlipped ? currentCard.back : currentCard.front}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800">
                <span>Card {currentIndex + 1} of {allCards.length}</span>
                {currentCard.hint && (
                  <span className="text-teal-400/90 text-xs">Hint: {currentCard.hint}</span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="w-full max-w-2xl mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === allCards.length - 1}
                className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Live Reaction Emojis */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => triggerReaction('👏')}
                className="p-2 hover:scale-125 transition-transform text-base"
                title="Clap"
              >
                👏
              </button>
              <button
                onClick={() => triggerReaction('🔥')}
                className="p-2 hover:scale-125 transition-transform text-base"
                title="Fire"
              >
                🔥
              </button>
              <button
                onClick={() => triggerReaction('🧠')}
                className="p-2 hover:scale-125 transition-transform text-base"
                title="Big Brain"
              >
                🧠
              </button>
              <button
                onClick={() => triggerReaction('⚡')}
                className="p-2 hover:scale-125 transition-transform text-base"
                title="Electric"
              >
                ⚡
              </button>
            </div>

            <button
              onClick={handleMastery}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>I Got It (+25 XP)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
