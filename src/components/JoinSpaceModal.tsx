import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, X, ArrowRight, Share2, Sparkles, Lock, CheckCircle2 } from 'lucide-react';

interface JoinSpaceModalProps {
  onClose: () => void;
  onJoined: (spaceId: string) => void;
}

export const JoinSpaceModal: React.FC<JoinSpaceModalProps> = ({ onClose, onJoined }) => {
  const { joinCourseSpaceByCode, courseSpaces } = useApp();
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleJoin = (targetCode?: string) => {
    const codeToUse = targetCode || code;
    if (!codeToUse.trim()) return;

    const res = joinCourseSpaceByCode(codeToUse);
    if (res.success && res.spaceId) {
      onJoined(res.spaceId);
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                Join CourseSpace
              </span>
              <h3 className="text-base font-bold text-white">Enter Invite Code or Link</h3>
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
        <div className="p-6 space-y-5">
          <div className="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-500/20 text-xs text-teal-200 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-teal-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Instant Resource Access</span>
            </div>
            <p>
              When you join, you receive all core module cards and reference guides immediately. Advanced quizzes & summaries unlock when released by the creator or admins.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">CourseSpace Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setErrorMsg('');
              }}
              placeholder="e.g. CS-CELL101"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono uppercase tracking-wider focus:outline-none focus:border-teal-500 transition-colors"
            />
            {errorMsg && (
              <p className="text-xs text-rose-400 mt-1">{errorMsg}</p>
            )}
          </div>

          {/* Quick Demo Spaces Clickable */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Available Active Spaces:
            </span>
            <div className="space-y-2">
              {courseSpaces.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleJoin(s.code)}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/40 cursor-pointer flex items-center justify-between group transition-all"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                      {s.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">Code: {s.code}</span>
                  </div>
                  <span className="text-xs text-teal-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    Join &rarr;
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleJoin()}
              disabled={!code.trim()}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <span>Join CourseSpace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
