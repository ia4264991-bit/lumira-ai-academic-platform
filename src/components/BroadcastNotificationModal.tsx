import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, X, Send, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface BroadcastNotificationModalProps {
  onClose: () => void;
}

export const BroadcastNotificationModal: React.FC<BroadcastNotificationModalProps> = ({ onClose }) => {
  const { activeSpace, sendBroadcastNotification, currentRoleInActiveSpace } = useApp();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('important');

  if (!activeSpace) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    sendBroadcastNotification(activeSpace.id, title, message, priority);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                CourseSpace Broadcast
              </span>
              <h3 className="text-base font-bold text-white">Send Notification to Members</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            Sending as <strong className="text-white capitalize">{currentRoleInActiveSpace}</strong> to all{' '}
            <strong className="text-teal-400">{activeSpace.members.length} members</strong> in {activeSpace.title}.
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Notification Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Live Study Session Tomorrow at 4 PM"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Announcement Message</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the full announcement or instructions for your students..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 transition-colors resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Priority Level</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('normal')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  priority === 'normal'
                    ? 'bg-slate-800 border-teal-500 text-teal-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Normal</span>
              </button>
              <button
                type="button"
                onClick={() => setPriority('important')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  priority === 'important'
                    ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Important</span>
              </button>
              <button
                type="button"
                onClick={() => setPriority('urgent')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  priority === 'urgent'
                    ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Urgent</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-teal-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Broadcast</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
