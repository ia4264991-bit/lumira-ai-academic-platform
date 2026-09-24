import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Deck } from '../types';
import { Users, X, Sparkles, Layers, ArrowRight, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';

interface CreateCourseSpaceModalProps {
  deck: Deck;
  onClose: () => void;
  onCreated: (spaceId: string) => void;
}

export const CreateCourseSpaceModal: React.FC<CreateCourseSpaceModalProps> = ({
  deck,
  onClose,
  onCreated,
}) => {
  const { createCourseSpaceFromDeck, currentUser } = useApp();
  const [spaceTitle, setSpaceTitle] = useState(`${deck.title} Space`);
  const [description, setDescription] = useState(
    `Official collaborative study space for ${deck.title}. Real-time cards, peer chat, and exclusive quiz checkpoints.`
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceTitle.trim()) return;

    const spaceId = createCourseSpaceFromDeck(deck.id, spaceTitle, description);
    if (spaceId) {
      onCreated(spaceId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                Transform Deck into Space
              </span>
              <h3 className="text-base font-bold text-white">Create CourseSpace from Cards</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/20 space-y-2 text-xs text-teal-200">
            <div className="flex items-center gap-2 font-bold text-teal-300">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Automatic Syllabus & Gated Content Provisioning</span>
            </div>
            <p className="leading-relaxed">
              Your {deck.cards.length} flashcards {deck.materials && deck.materials.length > 0 ? `and ${deck.materials.length} study documents` : ''} will be organized into syllabus modules. When friends join with your code or link, they receive the base study materials immediately, while generated quizzes and summaries stay exclusive until released by you or your admins!
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">CourseSpace Title</label>
            <input
              type="text"
              required
              value={spaceTitle}
              onChange={(e) => setSpaceTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Cohort Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 transition-colors resize-none"
            />
          </div>

          {/* Included Features Checklist */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              CourseSpace Engine Features Included:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Shareable Links & Codes</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Real-Time Group Study</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Integrated Peer Chat</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Leaderboard Gamification</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800 col-span-2">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Gated Quizzes & Summaries</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-teal-500/20"
            >
              <span>Publish CourseSpace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
