import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Crown, 
  ShieldCheck, 
  UserPlus, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  ShieldAlert, 
  Shield, 
  Award,
  Clock
} from 'lucide-react';

export const CourseSpaceMembers: React.FC = () => {
  const { activeSpace, currentUser, promoteToAdmin, demoteToMember, currentRoleInActiveSpace } = useApp();

  if (!activeSpace) return null;

  const isCreator = currentRoleInActiveSpace === 'creator';

  return (
    <div className="space-y-6">
      {/* Role Management Info Header */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">CourseSpace Member Roster & Permissions</h3>
          </div>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            {isCreator ? (
              <>
                You are the <strong className="text-amber-400">Creator</strong>. You can appoint members to <strong className="text-purple-400">Admin</strong> to share administrative powers, including releasing exclusive quizzes and broadcasting notifications.
              </>
            ) : (
              <>
                View all peers studying together in this CourseSpace. Admins appointed by the creator help guide discussions and approve release of study drills.
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total Cohort</span>
            <span className="text-lg font-bold text-white">{activeSpace.members.length} Members</span>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeSpace.members.map((member) => {
          const isCurrentUser = member.id === currentUser.id;

          return (
            <div
              key={member.id}
              className={`p-5 rounded-3xl border transition-all ${
                isCurrentUser
                  ? 'bg-slate-900 border-teal-500/40 ring-1 ring-teal-500/20'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-800"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                        member.status === 'online'
                          ? 'bg-emerald-400'
                          : member.status === 'studying'
                          ? 'bg-teal-400 animate-pulse'
                          : 'bg-slate-500'
                      }`}
                      title={member.status}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{member.name}</h4>
                      {isCurrentUser && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-semibold">
                          You
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      {member.role === 'creator' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                          <Crown className="w-3.5 h-3.5" />
                          <span>Space Creator</span>
                        </span>
                      )}
                      {member.role === 'admin' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Space Admin</span>
                        </span>
                      )}
                      {member.role === 'member' && (
                        <span className="text-[11px] text-slate-400">Member</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Creator Controls to promote/demote */}
                {isCreator && member.role !== 'creator' && (
                  <div>
                    {member.role === 'admin' ? (
                      <button
                        onClick={() => demoteToMember(activeSpace.id, member.id)}
                        className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      >
                        Demote to Member
                      </button>
                    ) : (
                      <button
                        onClick={() => promoteToAdmin(activeSpace.id, member.id)}
                        className="text-xs px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Make Admin</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">XP</span>
                  <span className="text-xs font-bold text-amber-400">{member.xp}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Mastered</span>
                  <span className="text-xs font-bold text-teal-400">{member.cardsMastered} cards</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Streak</span>
                  <span className="text-xs font-bold text-orange-400 flex items-center justify-center gap-1">
                    <Flame className="w-3 h-3 fill-orange-400" />
                    <span>{member.streakDays}d</span>
                  </span>
                </div>
              </div>

              {/* Status Note */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Last active: {member.lastActive}</span>
                </span>
                <span className="capitalize text-slate-400">
                  {member.status === 'studying' ? '📖 Currently studying' : member.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
