import React from 'react';
import { ModuleSummary } from '../types';
import { X, FileText, CheckCircle2, Bookmark, Sparkles } from 'lucide-react';

interface SummaryModalProps {
  summary: ModuleSummary;
  onClose: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ summary, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                Module Concept Synthesis
              </span>
              <h3 className="text-base font-bold text-white truncate max-w-md">
                {summary.title}
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

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Key takeaways callout */}
          <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Core Takeaways & High-Yield Principles</span>
            </div>
            <div className="space-y-2">
              {summary.keyTakeaways.map((takeaway, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                  <span className="text-teal-400 font-bold shrink-0 mt-0.5">•</span>
                  <span className="leading-relaxed">{takeaway}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Full Markdown Notes */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Detailed Study Notes
            </h4>
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
              {summary.fullMarkdown}
            </div>
          </div>

          {summary.releasedBy && (
            <div className="text-xs text-slate-500 pt-2 border-t border-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified & Approved for CourseSpace release by {summary.releasedBy}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-slate-950/40 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
};
