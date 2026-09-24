import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CourseModule, ModuleQuiz, ModuleSummary } from '../types';
import { 
  Lock, 
  Unlock, 
  FileText, 
  HelpCircle, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  Play, 
  AlertCircle,
  Clock,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface CourseSpaceGatedContentProps {
  onTakeQuiz: (quiz: ModuleQuiz) => void;
  onStudyModuleCards: (module: CourseModule) => void;
  onViewSummary: (summary: ModuleSummary) => void;
}

export const CourseSpaceGatedContent: React.FC<CourseSpaceGatedContentProps> = ({
  onTakeQuiz,
  onStudyModuleCards,
  onViewSummary,
}) => {
  const { 
    activeSpace, 
    currentRoleInActiveSpace, 
    releaseQuiz, 
    lockQuiz, 
    releaseSummary, 
    lockSummary,
    currentUser
  } = useApp();

  const [activeModuleId, setActiveModuleId] = useState<string>(
    activeSpace?.modules[0]?.id || ''
  );

  if (!activeSpace) return null;

  const isPrivileged = currentRoleInActiveSpace === 'creator' || currentRoleInActiveSpace === 'admin';
  const currentModule = activeSpace.modules.find((m) => m.id === activeModuleId) || activeSpace.modules[0];

  return (
    <div className="space-y-6">
      {/* Role explanation banner for transparency */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
        isPrivileged
          ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
          : 'bg-slate-900/80 border-slate-800 text-slate-300'
      }`}>
        {isPrivileged ? (
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <Lock className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <div className="font-semibold text-sm mb-0.5 flex items-center gap-2">
            <span>
              {isPrivileged 
                ? `Content Release Controls Active (${currentRoleInActiveSpace?.toUpperCase()})` 
                : 'Joined Member View — Exclusive Content Gating Active'}
            </span>
          </div>
          <p>
            {isPrivileged ? (
              <>
                As <strong>{currentRoleInActiveSpace}</strong>, you control when generated quizzes and summaries are shared with members. Unreleased items remain strictly private until you click <strong>Release to Members</strong>.
              </>
            ) : (
              <>
                You have instant access to all core study cards and references. Quizzes and executive summaries remain locked until approved for release by the CourseSpace creator or admins.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Module Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {activeSpace.modules.map((mod, idx) => {
          const isSelected = mod.id === (currentModule?.id || '');
          const unreleasedCount = mod.quizzes.filter((q) => !q.isReleased).length + 
                                  mod.summaries.filter((s) => !s.isReleased).length;

          return (
            <button
              key={mod.id}
              onClick={() => setActiveModuleId(mod.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-lg shadow-teal-500/20 font-bold'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span>Module {idx + 1}</span>
              {unreleasedCount > 0 && isPrivileged && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isSelected ? 'bg-slate-950 text-teal-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {unreleasedCount} locked
                </span>
              )}
            </button>
          );
        })}
      </div>

      {currentModule && (
        <div className="space-y-6">
          {/* Module Header Card */}
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                  Active Syllabus Module
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{currentModule.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                  {currentModule.description}
                </p>
              </div>

              <button
                onClick={() => onStudyModuleCards(currentModule)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs sm:text-sm font-bold shadow-md transition-all self-start sm:self-auto shrink-0"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Study Module Cards ({currentModule.cards.length})</span>
              </button>
            </div>
          </div>

          {/* Section 1: Standard Base Resources (Available to ALL members) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Base Study Resources</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                  Available to Everyone
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Included upon joining
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentModule.resources.map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                        {res.type}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Unlock className="w-3 h-3 text-emerald-400" />
                        <span>Public Resource</span>
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{res.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{res.content}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {res.cardCount ? `${res.cardCount} Flashcards` : 'Study Guide'}
                    </span>
                    {res.type === 'flashcards' ? (
                      <button
                        onClick={() => onStudyModuleCards(currentModule)}
                        className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-teal-400" />
                        <span>Open Deck</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">Self-guided reference</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Generated Quizzes (GATED EXCLUSIVE CONTENT) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-bold text-white">Generated Quizzes & Assessments</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                  Exclusive Gated Content
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {currentModule.quizzes.map((quiz) => {
                const isReleased = quiz.isReleased;

                return (
                  <div
                    key={quiz.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isReleased
                        ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        : isPrivileged
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-slate-900/40 border-slate-800/60 opacity-90'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isReleased ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <Unlock className="w-3 h-3" />
                              <span>Released to Members</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <Lock className="w-3 h-3" />
                              <span>Exclusive — Locked from Members</span>
                            </span>
                          )}

                          <span className="text-xs text-slate-500">
                            {quiz.questions.length} questions • +50 XP
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white">{quiz.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{quiz.description}</p>

                        {isReleased && quiz.releasedBy && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Released by {quiz.releasedBy}</span>
                          </div>
                        )}

                        {!isReleased && !isPrivileged && (
                          <div className="text-xs text-amber-300/90 bg-amber-950/40 border border-amber-500/20 p-2 rounded-xl flex items-center gap-2 mt-2">
                            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>
                              Content locked by instructor. Will unlock once approved for release by the creator or an admin.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        {isReleased ? (
                          <>
                            <button
                              onClick={() => onTakeQuiz(quiz)}
                              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Take Quiz</span>
                            </button>

                            {isPrivileged && (
                              <button
                                onClick={() => lockQuiz(activeSpace.id, currentModule.id, quiz.id)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
                                title="Lock Quiz (Retract release)"
                              >
                                <Lock className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            {isPrivileged ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onTakeQuiz(quiz)}
                                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Preview</span>
                                </button>
                                <button
                                  onClick={() => releaseQuiz(activeSpace.id, currentModule.id, quiz.id)}
                                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/20 flex items-center gap-1.5 transition-all"
                                >
                                  <Unlock className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Release to Members</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                disabled
                                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-500 font-semibold text-xs flex items-center gap-1.5 cursor-not-allowed border border-slate-700/50"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                <span>Locked</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Generated Summaries & Synthesis (GATED EXCLUSIVE CONTENT) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-white">Generated Concept Summaries</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                  Exclusive Gated Content
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {currentModule.summaries.map((summary) => {
                const isReleased = summary.isReleased;

                return (
                  <div
                    key={summary.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isReleased
                        ? 'bg-slate-900/90 border-slate-800'
                        : isPrivileged
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-slate-900/40 border-slate-800/60 opacity-90'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2">
                          {isReleased ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <Unlock className="w-3 h-3" />
                              <span>Released to Members</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <Lock className="w-3 h-3" />
                              <span>Exclusive — Locked from Members</span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-white">{summary.title}</h4>
                        <div className="space-y-1 pt-1">
                          {summary.keyTakeaways.map((point, i) => (
                            <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-teal-400 mt-0.5">•</span>
                              <span className="leading-relaxed">{point}</span>
                            </div>
                          ))}
                        </div>

                        {isReleased && summary.releasedBy && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Released by {summary.releasedBy}</span>
                          </div>
                        )}

                        {!isReleased && !isPrivileged && (
                          <div className="text-xs text-amber-300/90 bg-amber-950/40 border border-amber-500/20 p-2 rounded-xl flex items-center gap-2 mt-2">
                            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>
                              Concept summary locked. Requires creator or admin release.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        {isReleased ? (
                          <>
                            <button
                              onClick={() => onViewSummary(summary)}
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Read Summary</span>
                            </button>

                            {isPrivileged && (
                              <button
                                onClick={() => lockSummary(activeSpace.id, currentModule.id, summary.id)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
                                title="Lock Summary"
                              >
                                <Lock className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            {isPrivileged ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onViewSummary(summary)}
                                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Preview</span>
                                </button>
                                <button
                                  onClick={() => releaseSummary(activeSpace.id, currentModule.id, summary.id)}
                                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/20 flex items-center gap-1.5 transition-all"
                                >
                                  <Unlock className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Release to Members</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                disabled
                                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-500 font-semibold text-xs flex items-center gap-1.5 cursor-not-allowed border border-slate-700/50"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                <span>Locked</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
