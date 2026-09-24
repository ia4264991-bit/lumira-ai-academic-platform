import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Deck, Card, ModuleQuiz, ModuleSummary, StudyMaterial } from '../types';
import { 
  X, 
  Play, 
  HelpCircle, 
  FileText, 
  Folder, 
  Users, 
  Share2, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Plus, 
  ArrowRight,
  ChevronRight,
  Clock,
  Layers,
  FileCheck2,
  Atom,
  Upload
} from 'lucide-react';

interface StudyCardDetailModalProps {
  card: Deck;
  onClose: () => void;
  onStudyFlashcards: (deck: Deck) => void;
  onTakeQuiz: (quiz: ModuleQuiz) => void;
  onViewSummary: (summary: ModuleSummary) => void;
  onOpenConvertModal: (deck: Deck) => void;
  onNavigateToSpace: (spaceId: string) => void;
}

export const StudyCardDetailModal: React.FC<StudyCardDetailModalProps> = ({
  card,
  onClose,
  onStudyFlashcards,
  onTakeQuiz,
  onViewSummary,
  onOpenConvertModal,
  onNavigateToSpace,
}) => {
  const { courseSpaces, addMaterialToCard } = useApp();
  const [activeSubset, setActiveSubset] = useState<'cards' | 'quiz' | 'summary' | 'materials'>('cards');
  const [showUploadInput, setShowUploadInput] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialPreview, setNewMaterialPreview] = useState('');

  const linkedSpace = courseSpaces.find((s) => s.sourceDeckId === card.id || s.id === card.linkedSpaceId);
  const masteredCount = card.cards.filter((c) => c.mastered).length;
  const progress = card.cards.length > 0 ? Math.round((masteredCount / card.cards.length) * 100) : 0;

  const defaultQuiz = card.quizzes && card.quizzes.length > 0 ? card.quizzes[0] : null;
  const defaultSummary = card.summaries && card.summaries.length > 0 ? card.summaries[0] : null;

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialName.trim()) return;

    const newMat: StudyMaterial = {
      id: `mat-${Date.now()}`,
      name: newMaterialName.trim(),
      size: '1.5 MB',
      type: newMaterialName.endsWith('.pdf') ? 'pdf' : newMaterialName.endsWith('.docx') ? 'doc' : 'text',
      uploadedAt: new Date().toISOString(),
      contentPreview: newMaterialPreview.trim() || 'Uploaded study guide and notes.',
    };

    addMaterialToCard(card.id, newMat);
    setNewMaterialName('');
    setNewMaterialPreview('');
    setShowUploadInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Banner */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border-b border-slate-800 overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {card.subject}
                </span>
                {linkedSpace && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Users className="w-3 h-3" />
                    <span>In CourseSpace ({linkedSpace.code})</span>
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {card.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {card.description}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Convert to CourseSpace Prominent Action */}
          <div className="relative z-10 mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-2xl border border-indigo-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Collaborative CourseSpace</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 font-semibold uppercase">Feature</span>
                </h4>
                <p className="text-[11px] text-slate-300">
                  {linkedSpace
                    ? `Live CourseSpace active with code ${linkedSpace.code}. Gated quizzes, live study room, and leaderboard ready.`
                    : 'Convert this card into a shared CourseSpace. Study live with friends & release gated quizzes.'}
                </p>
              </div>
            </div>

            {linkedSpace ? (
              <button
                onClick={() => {
                  onNavigateToSpace(linkedSpace.id);
                  onClose();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 shrink-0"
              >
                <span>Enter CourseSpace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenConvertModal(card);
                  onClose();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-teal-500/20 shrink-0"
              >
                <Share2 className="w-4 h-4" />
                <span>Convert to CourseSpace</span>
              </button>
            )}
          </div>
        </div>

        {/* Subsets Navigation Bar */}
        <div className="px-6 border-b border-slate-800 bg-slate-950/40 flex items-center gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubset('cards')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${
              activeSubset === 'cards'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>⚡ Flashcards ({card.cards.length})</span>
          </button>

          <button
            onClick={() => setActiveSubset('quiz')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${
              activeSubset === 'quiz'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>📝 Practice Quiz ({card.quizzes?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveSubset('summary')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${
              activeSubset === 'summary'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>📖 Summary Guide ({card.summaries?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveSubset('materials')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${
              activeSubset === 'materials'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>📁 Uploaded Materials ({card.materials?.length || 0})</span>
          </button>
        </div>

        {/* Subsets Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* SUBSET 1: FLASHCARDS */}
          {activeSubset === 'cards' && (
            <div className="space-y-6">
              {/* Mastery progress & Study CTA */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1.5 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span className="text-sm font-bold text-white">
                      Mastery Progress: {masteredCount} of {card.cards.length} Mastered ({progress}%)
                    </span>
                  </div>
                  <div className="w-full sm:w-72 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => onStudyFlashcards(card)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Start 3D Flip Card Study Session</span>
                </button>
              </div>

              {/* Cards List Preview */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Card Items in this Subset
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {card.cards.map((c, idx) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2 hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-bold uppercase text-slate-500">
                            Card #{idx + 1}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.mastered ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {c.mastered ? 'Mastered' : 'Reviewing'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
                          {c.front}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-900">
                        <p className="text-xs text-slate-400 line-clamp-2">
                          <strong className="text-slate-300">Answer: </strong>
                          {c.back}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUBSET 2: PRACTICE QUIZ */}
          {activeSubset === 'quiz' && (
            <div className="space-y-6">
              {defaultQuiz ? (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Practice Assessment
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1.5">
                        {defaultQuiz.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        {defaultQuiz.description}
                      </p>
                    </div>

                    <button
                      onClick={() => onTakeQuiz(defaultQuiz)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-colors shadow-lg shadow-indigo-600/20"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Take Practice Quiz</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs text-slate-300">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[11px]">Questions</span>
                      <span className="font-bold text-white text-sm">{defaultQuiz.questions.length} Items</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[11px]">Format</span>
                      <span className="font-bold text-white text-sm">Multiple Choice</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
                      <span className="text-slate-500 block text-[11px]">XP Reward</span>
                      <span className="font-bold text-teal-400 text-sm">+50 XP on completion</span>
                    </div>
                  </div>

                  {/* Sample questions preview */}
                  <div className="space-y-2 pt-2">
                    <h5 className="text-xs font-bold uppercase text-slate-400">Questions in this Quiz:</h5>
                    <div className="space-y-2">
                      {defaultQuiz.questions.map((q, idx) => (
                        <div key={q.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300">
                          <p className="font-semibold text-white">Q{idx + 1}: {q.question}</p>
                          <p className="text-[11px] text-slate-500 mt-1">{q.options.length} answer options provided</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No Quiz Generated Yet</h4>
                  <p className="text-xs text-slate-400">
                    Generate an interactive quiz subset from your uploaded materials to test your active recall.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SUBSET 3: SUMMARY */}
          {activeSubset === 'summary' && (
            <div className="space-y-6">
              {defaultSummary ? (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Executive Study Guide
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1.5">
                        {defaultSummary.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => onViewSummary(defaultSummary)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm transition-colors shadow-lg shadow-cyan-600/20"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Read Full Study Guide</span>
                    </button>
                  </div>

                  {/* Key Takeaways */}
                  <div className="space-y-2 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                    <h5 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Key Takeaways</h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {defaultSummary.keyTakeaways.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Markdown Excerpt */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {defaultSummary.fullMarkdown}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No Summary Generated Yet</h4>
                  <p className="text-xs text-slate-400">
                    AI synthesizes chapter summaries and formula cheat sheets directly from uploaded materials.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SUBSET 4: UPLOADED MATERIALS */}
          {activeSubset === 'materials' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Uploaded Documents & Notes ({card.materials?.length || 0})
                  </h4>
                  <p className="text-xs text-slate-400">
                    Original study files attached to this card.
                  </p>
                </div>

                <button
                  onClick={() => setShowUploadInput(!showUploadInput)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Material</span>
                </button>
              </div>

              {/* Upload Input form */}
              {showUploadInput && (
                <form onSubmit={handleAddMaterial} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h5 className="text-xs font-bold text-white">Attach New Material to {card.title}</h5>
                  <input
                    type="text"
                    required
                    value={newMaterialName}
                    onChange={(e) => setNewMaterialName(e.target.value)}
                    placeholder="Document name (e.g. Physics_Kinematics_Notes.pdf)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                  <textarea
                    rows={2}
                    value={newMaterialPreview}
                    onChange={(e) => setNewMaterialPreview(e.target.value)}
                    placeholder="Brief description or excerpt of content..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-500 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowUploadInput(false)}
                      className="px-3 py-1.5 text-xs text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs"
                    >
                      Add Material
                    </button>
                  </div>
                </form>
              )}

              {/* Materials list */}
              <div className="space-y-2.5">
                {(!card.materials || card.materials.length === 0) ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No materials attached to this card yet.</p>
                ) : (
                  card.materials.map((mat) => (
                    <div
                      key={mat.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-xs sm:text-sm font-bold text-white">{mat.name}</h5>
                          <p className="text-xs text-slate-400">{mat.contentPreview}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                            <span>Size: {mat.size}</span>
                            <span>•</span>
                            <span>Attached: {new Date(mat.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
