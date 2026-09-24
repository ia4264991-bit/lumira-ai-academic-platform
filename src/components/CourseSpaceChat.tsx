import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Send, 
  Pin, 
  Crown, 
  ShieldCheck, 
  Smile, 
  Sparkles,
  MessageSquare
} from 'lucide-react';

export const CourseSpaceChat: React.FC = () => {
  const { activeSpace, currentUser, sendChatMessage, currentRoleInActiveSpace } = useApp();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSpace?.messages]);

  if (!activeSpace) return null;

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(activeSpace.id, inputText);
    setInputText('');
  };

  const pinnedMessage = activeSpace.messages.find((m) => m.isPinned);

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800 flex flex-col h-[640px] overflow-hidden shadow-xl">
      {/* Chat Header */}
      <div className="p-4 sm:px-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>CourseSpace Discussion</span>
              <span className="text-[11px] font-normal text-slate-400">
                ({activeSpace.members.length} members)
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Live peer collaboration and release alerts</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">Connected</span>
        </div>
      </div>

      {/* Pinned Announcement if available */}
      {pinnedMessage && (
        <div className="bg-teal-950/30 border-b border-teal-500/20 px-4 py-2.5 flex items-start gap-2.5 text-xs text-teal-200">
          <Pin className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
          <div className="flex-1 truncate">
            <span className="font-semibold text-teal-300">Pinned Announcement: </span>
            <span>{pinnedMessage.text}</span>
          </div>
        </div>
      )}

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {activeSpace.messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isSystem = msg.isSystemAnnouncement;

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="max-w-md px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300 text-center flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{msg.text}</span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <img
                src={msg.senderAvatar}
                alt={msg.senderName}
                className="w-8 h-8 rounded-xl object-cover shrink-0 ring-1 ring-slate-700"
              />

              <div className={`max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-xs font-semibold text-slate-300">{msg.senderName}</span>

                  {msg.senderRole === 'creator' && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Crown className="w-2.5 h-2.5" />
                      Creator
                    </span>
                  )}
                  {msg.senderRole === 'admin' && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Admin
                    </span>
                  )}

                  <span className="text-[10px] text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-teal-600 text-white rounded-tr-none'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 bg-slate-950/60 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${activeSpace.title}...`}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold transition-all shadow-md shadow-teal-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
