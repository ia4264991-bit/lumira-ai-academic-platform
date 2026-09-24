import React, { useState, useEffect } from 'react';
import { Card, Deck } from '../types';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';
import { 
  X, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  HelpCircle, 
  Shuffle, 
  Sparkles,
  Volume2
} from 'lucide-react';

interface DeckStudyModalProps {
  deck: Deck;
  onClose: () => void;
  onToggleMastery: (deckId: string, cardId: string) => void;
  onRecordStudy?: (xp: number, cardsMasteredDelta: number) => void;
}

export const DeckStudyModal: React.FC<DeckStudyModalProps> = ({
  deck,
  onClose,
  onToggleMastery,
  onRecordStudy,
}) => {
  const [cards, setCards] = useState<Card[]>(deck.cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionXP, setSessionXP] = useState(0);

  const currentCard = cards[currentIndex];

  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
  }, [currentIndex]);

  const handleFlip = () => {
    sound.playFlip();
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    sound.playFlip();
  };

  const handleMarkMastered = () => {
    if (!currentCard) return;
    const isNowMastered = !currentCard.mastered;
    onToggleMastery(deck.id, currentCard.id);

    // Update local card state
    setCards((prev) =>
      prev.map((c) => (c.id === currentCard.id ? { ...c, mastered: isNowMastered } : c))
    );

    if (isNowMastered) {
      sound.playCorrect();
      setSessionXP((prev) => prev + 25);
      onRecordStudy?.(25, 1);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    }

    // Auto advance if not at the end
    if (currentIndex < cards.length - 1) {
      setTimeout(() => {
        handleNext();
      }, 300);
    }
  };

  if (!currentCard) {
    return null;
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                {deck.subject}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">
                Card {currentIndex + 1} of {cards.length}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
              {deck.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffle}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Shuffle Cards"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-gradient-to-r from-teal-500 to-emerald-400 h-1 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Card Study Area */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center items-center">
          <div
            onClick={handleFlip}
            className="w-full max-w-xl min-h-[300px] sm:min-h-[340px] perspective-1000 cursor-pointer group"
          >
            <div
              className={`relative w-full h-full rounded-3xl p-8 transition-all duration-500 transform-style-preserve-3d flex flex-col justify-between border shadow-xl select-none ${
                isFlipped
                  ? 'bg-slate-800/90 border-teal-500/40 text-slate-100'
                  : 'bg-gradient-to-b from-slate-900 to-slate-800/90 border-slate-700/80 text-white group-hover:border-slate-600'
              }`}
            >
              {/* Top Tag & Card Meta */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-teal-300">
                    {isFlipped ? 'Answer' : 'Question'}
                  </span>
                  {currentCard.difficulty && (
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800/60 text-slate-400">
                      {currentCard.difficulty}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-teal-400 transition-colors">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Click to flip</span>
                </div>
              </div>

              {/* Main Content */}
              <div className="my-auto py-6 text-center">
                <p className="text-lg sm:text-2xl font-medium leading-relaxed">
                  {isFlipped ? currentCard.back : currentCard.front}
                </p>
              </div>

              {/* Bottom Tags / Hint */}
              <div className="flex items-center justify-between w-full text-xs text-slate-400 pt-4 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {currentCard.tags?.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-slate-800/80 text-[11px] text-slate-400">
                      #{t}
                    </span>
                  ))}
                </div>

                {currentCard.hint && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHint(!showHint);
                    }}
                    className="flex items-center gap-1 text-teal-400 hover:text-teal-300 text-xs font-medium"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Hide hint' : 'Show hint'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Hint Card if revealed */}
          {showHint && currentCard.hint && (
            <div className="w-full max-w-xl mt-3 p-3.5 rounded-2xl bg-teal-950/30 border border-teal-500/30 text-xs text-teal-200 flex items-start gap-2.5 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-teal-300">Study Hint:</span>
                <p className="text-teal-200/90 leading-relaxed">{currentCard.hint}</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation & Controls */}
        <div className="p-4 sm:px-6 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleMarkMastered}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
              currentCard.mastered
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{currentCard.mastered ? 'Mastered (Click to undo)' : 'Mark as Mastered (+25 XP)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
