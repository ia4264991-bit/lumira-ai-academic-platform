import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../types';
import { Plus, Trash2, X, BookOpen, Sparkles } from 'lucide-react';

interface CreateDeckModalProps {
  onClose: () => void;
}

export const CreateDeckModal: React.FC<CreateDeckModalProps> = ({ onClose }) => {
  const { addNewDeck } = useApp();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Science');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<{ front: string; back: string; hint: string }[]>([
    { front: '', back: '', hint: '' },
    { front: '', back: '', hint: '' },
  ]);

  const handleAddCard = () => {
    setCards([...cards, { front: '', back: '', hint: '' }]);
  };

  const handleRemoveCard = (index: number) => {
    if (cards.length <= 1) return;
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleCardChange = (index: number, field: 'front' | 'back' | 'hint', val: string) => {
    const next = [...cards];
    next[index][field] = val;
    setCards(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const validCards: Card[] = cards
      .filter((c) => c.front.trim() && c.back.trim())
      .map((c, i) => ({
        id: `card-${Date.now()}-${i}`,
        front: c.front.trim(),
        back: c.back.trim(),
        hint: c.hint.trim() || undefined,
        difficulty: 'medium',
        mastered: false,
      }));

    if (validCards.length === 0) {
      alert('Please add at least one complete card (question and answer).');
      return;
    }

    addNewDeck(title, description, subject, validCards);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                New Flashcard Deck
              </span>
              <h3 className="text-base font-bold text-white">Create Deck & Cards</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Deck Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cognitive Psychology 101"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Psychology"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what this deck covers..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Cards list */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Flashcards ({cards.length})
              </span>
              <button
                type="button"
                onClick={handleAddCard}
                className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Card</span>
              </button>
            </div>

            <div className="space-y-3">
              {cards.map((card, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 relative"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
                    <span>Card #{idx + 1}</span>
                    {cards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCard(idx)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={card.front}
                      onChange={(e) => handleCardChange(idx, 'front', e.target.value)}
                      placeholder="Front (Question / Prompt)"
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                    <input
                      type="text"
                      required
                      value={card.back}
                      onChange={(e) => handleCardChange(idx, 'back', e.target.value)}
                      placeholder="Back (Answer / Explanation)"
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={card.hint}
                    onChange={(e) => handleCardChange(idx, 'hint', e.target.value)}
                    placeholder="Optional study hint..."
                    className="w-full bg-slate-900/60 border border-slate-800/60 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md"
            >
              Save Deck
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
