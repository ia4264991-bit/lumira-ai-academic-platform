import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CourseSpaceGatedContent } from './CourseSpaceGatedContent';
import { CourseSpaceChat } from './CourseSpaceChat';
import { CourseSpaceLeaderboard } from './CourseSpaceLeaderboard';
import { CourseSpaceMembers } from './CourseSpaceMembers';
import { LiveStudyRoom } from './LiveStudyRoom';
import { ModuleQuiz, CourseModule, ModuleSummary } from '../types';
import { 
  Users, 
  Share2, 
  Copy, 
  Check, 
  Crown, 
  ShieldCheck, 
  Bell, 
  Radio, 
  BookOpen, 
  MessageSquare, 
  Trophy, 
  Lock, 
  Sparkles,
  ArrowLeft,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { sound } from '../utils/sound';

interface CourseSpaceViewProps {
  onBackToDecks: () => void;
  onTakeQuiz: (quiz: ModuleQuiz) => void;
  onStudyModuleCards: (module: CourseModule) => void;
  onViewSummary: (summary: ModuleSummary) => void;
  onOpenBroadcastModal: () => void;
}

type SpaceTab = 'modules' | 'study_room' | 'chat' | 'leaderboard' | 'members';

export const CourseSpaceView: React.FC<CourseSpaceViewProps> = ({
  onBackToDecks,
  onTakeQuiz,
  onStudyModuleCards,
  onViewSummary,
  onOpenBroadcastModal,
}) => {
  const { activeSpace, currentUser, currentRoleInActiveSpace, courseSpaces, setActiveSpaceId } = useApp();
  const [activeTab, setActiveTab] = useState<SpaceTab>('modules');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!activeSpace) {
    return (
      <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800 p-8">
        <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">No CourseSpace Selected</h3>
        <p className="text-xs text-slate-400 mb-6">Select a CourseSpace from your list or convert a deck.</p>
        <button
          onClick={onBackToDecks}
          className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
        >
          Return to Card Decks
        </button>
      </div>
    );
  }

  const isPrivileged = currentRoleInActiveSpace === 'creator' || currentRoleInActiveSpace === 'admin';
  const isCreator = currentRoleInActiveSpace === 'creator';

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/join/${activeSpace.code}`;
    navigator.clipboard?.writeText(inviteUrl);
    setCopiedLink(true);
    sound.playCorrect();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Space Switcher bar if multiple spaces */}
      {courseSpaces.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold shrink-0">Your Spaces:</span>
          {courseSpaces.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSpaceId(s.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                s.id === activeSpace.id
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/30">
                {activeSpace.subject}
              </span>

              {/* Share link / code pill */}
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-800 text-teal-300 border border-teal-500/30 text-xs font-mono transition-colors"
                title="Click to copy invite link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{activeSpace.code}</span>
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>

              {/* Current user role badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
                {isCreator ? (
                  <>
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-amber-300">Space Creator</span>
                  </>
                ) : currentRoleInActiveSpace === 'admin' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-bold text-purple-300">Space Admin</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-slate-300">Joined Member</span>
                  </>
                )}
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {activeSpace.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeSpace.description}
            </p>

            {/* Live active members mini bar */}
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400 flex-wrap">
              <div className="flex items-center -space-x-2">
                {activeSpace.members.slice(0, 5).map((m) => (
                  <img
                    key={m.id}
                    src={m.avatar}
                    alt={m.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-900"
                    title={`${m.name} (${m.role})`}
                  />
                ))}
              </div>
              <span>
                <strong className="text-white">{activeSpace.members.length}</strong> peers studying together in real time
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            {isPrivileged && (
              <button
                onClick={onOpenBroadcastModal}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Send Broadcast Notification</span>
              </button>
            )}

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-teal-500/20"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedLink ? 'Invite Link Copied!' : 'Share with Friends'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CourseSpace Tab Navigation */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('modules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'modules'
              ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Modules & Exclusive Content</span>
        </button>

        <button
          onClick={() => setActiveTab('study_room')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'study_room'
              ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Live Study Room</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'chat'
              ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Integrated Chat</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
            {activeSpace.messages.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'members'
              ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Members & Roles</span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div className="pt-2">
        {activeTab === 'modules' && (
          <CourseSpaceGatedContent
            onTakeQuiz={onTakeQuiz}
            onStudyModuleCards={onStudyModuleCards}
            onViewSummary={onViewSummary}
          />
        )}

        {activeTab === 'study_room' && (
          <LiveStudyRoom />
        )}

        {activeTab === 'chat' && (
          <CourseSpaceChat />
        )}

        {activeTab === 'leaderboard' && (
          <CourseSpaceLeaderboard />
        )}

        {activeTab === 'members' && (
          <CourseSpaceMembers />
        )}
      </div>
    </div>
  );
};
