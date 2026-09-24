import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Deck } from '../types';
import { 
  BookOpen, 
  Play, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  Tag, 
  Clock,
  Layers,
  HelpCircle,
  FileText,
  Folder,
  Share2
} from 'lucide-react';

interface DeckListProps {
  onStudyDeck: (deck: Deck) => void;
  onOpenCreateSpaceModal: (deck: Deck) => void;
  onOpenCreateDeckModal: () => void;
  onNavigateToSpace: (spaceId: string) => void;
  onOpenCardDetail: (deck: Deck) => void;
}

export const DeckList: React.FC<DeckListProps> = ({
  onStudyDeck,
  onOpenCreateSpaceModal,
  onOpenCreateDeckModal,
  onNavigateToSpace,
  onOpenCardDetail,
}) => {
  const { decks, courseSpaces } = useApp();
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const subjects = ['all', ...Array.from(new Set(decks.map((d) => d.subject)))];

  const filteredDecks = selectedSubject === 'all'
    ? decks
    : decks.filter((d) => d.subject === selectedSubject);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900/60 via-slate-900 to-indigo-950/60 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studey Card System with CourseSpaces</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Create cards, upload study materials & generate quiz subsets.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Click <strong className="text-teal-300 font-semibold">Create Card</strong> to upload materials (e.g. Physics) and automatically synthesize quizzes, summaries, and flashcards. Then convert your card into a shared <strong className="text-indigo-300 font-semibold">CourseSpace</strong> with real-time peer study, gated content, and leaderboards!
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreateDeckModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Card & Subsets</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                selectedSubject === sub
                  ? 'bg-teal-500 text-slate-950'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {sub === 'all' ? 'All Subjects' : sub}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          {filteredDecks.length} {filteredDecks.length === 1 ? 'card deck' : 'card decks'} available
        </span>
      </div>

      {/* Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDecks.map((deck) => {
          const masteredCount = deck.cards.filter((c) => c.mastered).length;
          const progress = deck.cards.length > 0 ? Math.round((masteredCount / deck.cards.length) * 100) : 0;
          const linkedSpace = courseSpaces.find((s) => s.sourceDeckId === deck.id || s.id === deck.linkedSpaceId);
          const quizCount = deck.quizzes?.length || 0;
          const summaryCount = deck.summaries?.length || 0;
          const materialCount = deck.materials?.length || 0;

          return (
            <div
              key={deck.id}
              className="group relative bg-slate-900/90 rounded-3xl border border-slate-800/90 hover:border-slate-700/80 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-slate-950/60 hover:-translate-y-1 cursor-pointer"
              onClick={() => onOpenCardDetail(deck)}
            >
              <div>
                {/* Subject & Linked Space Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-800 text-teal-300 border border-slate-700/60">
                    {deck.subject}
                  </span>

                  {linkedSpace && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToSpace(linkedSpace.id);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/60 transition-colors"
                      title="View active CourseSpace"
                    >
                      <Users className="w-3 h-3 text-indigo-400" />
                      <span>In CourseSpace</span>
                    </button>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors mb-2 leading-snug">
                  {deck.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {deck.description}
                </p>

                {/* Subsets Indicators (Studey Architecture) */}
                <div className="grid grid-cols-3 gap-1.5 p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 mb-4 text-[11px] text-slate-300 text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-teal-400">{deck.cards.length}</span>
                    <span className="text-[10px] text-slate-400">Cards</span>
                  </div>
                  <div className="flex flex-col items-center border-x border-slate-800">
                    <span className="font-bold text-indigo-400">{quizCount}</span>
                    <span className="text-[10px] text-slate-400">Quizzes</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-cyan-400">{summaryCount}</span>
                    <span className="text-[10px] text-slate-400">Summaries</span>
                  </div>
                </div>

                {/* Mastery Progress */}
                <div className="space-y-1.5 mb-6">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                      <span>{masteredCount} of {deck.cards.length} Mastered</span>
                    </span>
                    <span className="font-semibold text-slate-300">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div 
                className="pt-4 border-t border-slate-800/80 space-y-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onStudyDeck(deck)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors border border-slate-700"
                  >
                    <Play className="w-3.5 h-3.5 text-teal-400 fill-teal-400" />
                    <span>Study Cards</span>
                  </button>

                  <button
                    onClick={() => onOpenCardDetail(deck)}
                    className="py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-slate-800"
                    title="View card subsets & materials"
                  >
                    <span>Subsets</span>
                  </button>
                </div>

                {linkedSpace ? (
                  <button
                    onClick={() => onNavigateToSpace(linkedSpace.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-300 text-xs font-semibold transition-colors border border-indigo-500/30"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Open Space ({linkedSpace.code})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenCreateSpaceModal(deck)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold transition-colors border border-indigo-500/30"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Convert to CourseSpace</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
