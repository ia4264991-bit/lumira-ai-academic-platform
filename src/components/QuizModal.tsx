import React, { useState } from 'react';
import { ModuleQuiz } from '../types';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw,
  Trophy
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface QuizModalProps {
  quiz: ModuleQuiz;
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ quiz, onClose }) => {
  const { activeSpace, updateStudyProgress } = useApp();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const question = quiz.questions[currentQIndex];

  const handleSelect = (optId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(optId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption) return;
    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === question.correctOptionId;
    if (isCorrect) {
      sound.playCorrect();
      setScore((prev) => prev + 1);
    } else {
      sound.playFlip();
    }
  };

  const handleNext = () => {
    if (currentQIndex < quiz.questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsFinished(true);
      if (activeSpace) {
        updateStudyProgress(activeSpace.id, 50, 0);
      }
      sound.playRelease();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleRestart = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                CourseSpace Assessment
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-sm">
                {quiz.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Finished Screen */}
        {isFinished ? (
          <div className="p-8 text-center space-y-6 my-auto">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/10">
              <Trophy className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h4 className="text-2xl font-extrabold text-white">Quiz Completed!</h4>
              <p className="text-sm text-slate-400">
                You scored <strong className="text-teal-400">{score}</strong> out of{' '}
                <strong className="text-white">{quiz.questions.length}</strong> questions correct.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Earned +50 XP for CourseSpace Leaderboard!</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={handleRestart}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-2 transition-colors border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Quiz</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-md"
              >
                Done & Return to Space
              </button>
            </div>
          </div>
        ) : (
          /* Active Question */
          <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Question Progress */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Question {currentQIndex + 1} of {quiz.questions.length}</span>
                <span className="text-purple-400 font-semibold">Multiple Choice</span>
              </div>

              <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {question.question}
              </h4>

              {/* Options */}
              <div className="space-y-2.5">
                {question.options.map((opt) => {
                  const isSelected = selectedOption === opt.id;
                  const isCorrect = opt.id === question.correctOptionId;

                  let optStyle = 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-800 text-slate-200';
                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                    } else if (isSelected && !isCorrect) {
                      optStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                    } else {
                      optStyle = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60';
                    }
                  } else if (isSelected) {
                    optStyle = 'bg-purple-950/40 border-purple-500 text-purple-200 ring-1 ring-purple-500';
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(opt.id)}
                      disabled={isAnswerSubmitted}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${optStyle}`}
                    >
                      <span className="leading-relaxed">{opt.text}</span>
                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation upon submit */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-xs text-slate-300 space-y-1 animate-in fade-in">
                  <span className="font-bold text-teal-400 block">Explanation:</span>
                  <p className="leading-relaxed">{question.explanation}</p>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="pt-6 border-t border-slate-800 mt-6 flex justify-end">
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-purple-600/20"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <span>{currentQIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
