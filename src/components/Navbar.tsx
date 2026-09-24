import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, 
  Users, 
  Plus, 
  Bell, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  ShieldCheck, 
  Crown, 
  ChevronDown,
  ExternalLink,
  Share2
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'decks' | 'spaces';
  setCurrentTab: (tab: 'decks' | 'spaces') => void;
  onOpenJoinModal: () => void;
  onOpenCreateDeckModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenJoinModal,
  onOpenCreateDeckModal,
}) => {
  const { 
    currentUser, 
    availableUsers, 
    switchUser, 
    activeSpace, 
    currentRoleInActiveSpace,
    unreadNotificationCount,
    markNotificationAsRead
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <div 
            onClick={() => setCurrentTab('decks')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">Studley</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Spaces
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Collaborative Study Platform</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setCurrentTab('decks')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'decks'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Card Decks</span>
            </button>
            <button
              onClick={() => setCurrentTab('spaces')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'spaces'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>CourseSpaces</span>
              {activeSpace && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          </nav>
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Quick Join CourseSpace button */}
          <button
            onClick={onOpenJoinModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 transition-colors shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Join Space</span>
          </button>

          {/* Create Card (Studey Style) */}
          <button
            onClick={onOpenCreateDeckModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Card</span>
          </button>

          {/* XP & Streak chip */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-950/80 px-3 py-1 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentUser.xp} XP</span>
            </div>
            <div className="h-3 w-px bg-slate-800" />
            <div className="flex items-center gap-1 text-orange-400 font-semibold">
              <Flame className="w-3.5 h-3.5" />
              <span>{currentUser.streakDays}d Streak</span>
            </div>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-teal-400" />
                    <h3 className="text-sm font-semibold text-white">CourseSpace Broadcasts</h3>
                  </div>
                  {activeSpace && (
                    <span className="text-xs text-slate-400">{activeSpace.code}</span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto mt-2 space-y-2">
                  {!activeSpace || activeSpace.notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No notifications yet</p>
                  ) : (
                    activeSpace.notifications.map((n) => {
                      const isRead = n.readBy.includes(currentUser.id);
                      return (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(activeSpace.id, n.id)}
                          className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                            isRead
                              ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                              : 'bg-teal-950/20 border-teal-500/30 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-teal-300">{n.title}</span>
                            <span className="text-[10px] text-slate-500">
                              {n.priority === 'urgent' && '🔴 Urgent'}
                              {n.priority === 'important' && '🟡 Important'}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed text-slate-300">{n.message}</p>
                          <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                            <span>From: {n.senderName} ({n.senderRole})</span>
                            {!isRead && <span className="text-teal-400 font-medium">Click to mark read</span>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 transition-all text-left"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-teal-500/40"
              />
              <div className="hidden md:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white leading-tight">{currentUser.name}</span>
                  {currentRoleInActiveSpace === 'creator' && (
                    <Crown className="w-3 h-3 text-amber-400" />
                  )}
                  {currentRoleInActiveSpace === 'admin' && (
                    <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block capitalize">
                  {currentRoleInActiveSpace ? `${currentRoleInActiveSpace} view` : 'Studley User'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-3 animate-in fade-in slide-in-from-top-2">
                <div className="px-2 py-1.5 mb-2 border-b border-slate-800">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Switch Test Persona
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Test how Creator, Admin, and Member permissions behave in real time!
                  </p>
                </div>

                <div className="space-y-1">
                  {availableUsers.map((u) => {
                    const isActive = u.id === currentUser.id;
                    const roleInSpace = activeSpace?.members.find((m) => m.id === u.id)?.role;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                          isActive
                            ? 'bg-teal-500/20 text-white border border-teal-500/40'
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div>
                            <div className="text-xs font-semibold flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isActive && <CheckCircle2 className="w-3 h-3 text-teal-400" />}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {roleInSpace ? `Space ${roleInSpace.toUpperCase()}` : 'Student'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-amber-400">{u.xp} XP</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
