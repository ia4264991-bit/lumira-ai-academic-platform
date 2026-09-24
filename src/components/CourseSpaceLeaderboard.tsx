import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Trophy, 
  Medal, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  HelpCircle, 
  Crown,
  TrendingUp
} from 'lucide-react';

export const CourseSpaceLeaderboard: React.FC = () => {
  const { activeSpace, currentUser } = useApp();
  const [timeframe, setTimeframe] = useState<'all' | 'weekly'>('all');

  if (!activeSpace) return null;

  // Sort members by XP descending
  const sortedMembers = [...activeSpace.members].sort((a, b) => b.xp - a.xp);

  const top1 = sortedMembers[0];
  const top2 = sortedMembers[1];
  const top3 = sortedMembers[2];

  return (
    <div className="space-y-8">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">CourseSpace Leaderboard</h3>
          </div>
          <p className="text-xs text-slate-400">
            Gamified learning rankings based on cards mastered, quizzes completed, and study streaks.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              timeframe === 'all'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All-Time XP
          </button>
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              timeframe === 'weekly'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly Sprint
          </button>
        </div>
      </div>

      {/* Top 3 Podium Visualizer */}
      {sortedMembers.length >= 2 && (
        <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="flex items-end justify-center gap-2 sm:gap-6 pt-4 max-w-lg mx-auto">
            {/* Rank 2 - Silver */}
            {top2 && (
              <div className="flex flex-col items-center w-24 sm:w-32">
                <div className="relative mb-2">
                  <img
                    src={top2.avatar}
                    alt={top2.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-slate-400"
                  />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                    2
                  </div>
                </div>
                <span className="text-xs font-bold text-white truncate max-w-full text-center">
                  {top2.name}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 mb-2">
                  {top2.xp} XP
                </span>
                <div className="w-full bg-slate-800/90 h-24 sm:h-28 rounded-t-2xl border-t border-x border-slate-700/80 flex flex-col items-center justify-center p-2">
                  <Medal className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">Silver</span>
                </div>
              </div>
            )}

            {/* Rank 1 - Gold (Center, elevated) */}
            {top1 && (
              <div className="flex flex-col items-center w-28 sm:w-36 -mt-6">
                <div className="relative mb-2">
                  <img
                    src={top1.avatar}
                    alt={top1.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-amber-400 shadow-xl shadow-amber-500/20"
                  />
                  <div className="absolute -top-3 -right-2 w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                    <Crown className="w-4 h-4 text-slate-950 fill-slate-950" />
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-bold text-amber-300 truncate max-w-full text-center">
                  {top1.name}
                </span>
                <span className="text-xs font-bold text-amber-400 mb-2">
                  {top1.xp} XP
                </span>
                <div className="w-full bg-gradient-to-t from-amber-500/20 to-amber-500/30 h-32 sm:h-36 rounded-t-2xl border-t-2 border-x border-amber-400/60 flex flex-col items-center justify-center p-2 shadow-lg shadow-amber-500/10">
                  <Trophy className="w-7 h-7 text-amber-400 mb-1 animate-bounce duration-1000" />
                  <span className="text-xs uppercase font-extrabold text-amber-300">Champion</span>
                </div>
              </div>
            )}

            {/* Rank 3 - Bronze */}
            {top3 && (
              <div className="flex flex-col items-center w-24 sm:w-32">
                <div className="relative mb-2">
                  <img
                    src={top3.avatar}
                    alt={top3.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-amber-700"
                  />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-md">
                    3
                  </div>
                </div>
                <span className="text-xs font-bold text-white truncate max-w-full text-center">
                  {top3.name}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 mb-2">
                  {top3.xp} XP
                </span>
                <div className="w-full bg-slate-800/90 h-20 sm:h-22 rounded-t-2xl border-t border-x border-slate-700/80 flex flex-col items-center justify-center p-2">
                  <Medal className="w-5 h-5 text-amber-600 mb-1" />
                  <span className="text-[10px] uppercase font-bold text-amber-600">Bronze</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Leaderboard List */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span>Rank & Student</span>
          <div className="flex items-center gap-6 sm:gap-12">
            <span className="hidden sm:inline">Cards Mastered</span>
            <span className="hidden sm:inline">Streak</span>
            <span>Total Points</span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {sortedMembers.map((member, index) => {
            const isMe = member.id === currentUser.id;

            return (
              <div
                key={member.id}
                className={`p-4 sm:px-6 flex items-center justify-between transition-colors ${
                  isMe ? 'bg-teal-500/10' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className={`w-6 text-center font-bold text-sm ${
                    index === 0 ? 'text-amber-400 font-extrabold text-base' :
                    index === 1 ? 'text-slate-300' :
                    index === 2 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    #{index + 1}
                  </span>

                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{member.name}</span>
                      {isMe && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 capitalize">{member.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:gap-12">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>{member.cardsMastered}</span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 text-xs text-orange-400 font-medium">
                    <Flame className="w-3.5 h-3.5 fill-orange-400" />
                    <span>{member.streakDays}d</span>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <span className="text-sm font-extrabold text-amber-400">{member.xp}</span>
                    <span className="text-[10px] text-slate-500 block uppercase">XP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gamification Point Breakdown Guide */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-300">Gamified XP Rules:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span>Review Card: <strong className="text-teal-400">+10 XP</strong></span>
          <span>Master Card: <strong className="text-emerald-400">+25 XP</strong></span>
          <span>Complete Released Quiz: <strong className="text-purple-400">+50 XP</strong></span>
          <span>Participate in Chat: <strong className="text-amber-400">+5 XP</strong></span>
        </div>
      </div>
    </div>
  );
};
