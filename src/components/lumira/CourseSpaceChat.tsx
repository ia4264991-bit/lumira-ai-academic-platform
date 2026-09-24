import React, { useState, useEffect, useRef } from "react";
import { Send, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { LumiraAPI } from "../../services/api";

export interface LiveChatMessage {
  id: string;
  senderName: string;
  senderRole: "Owner" | "Admin" | "Member";
  text: string;
  time: string;
  isSelf: boolean;
}

interface CourseSpaceChatProps {
  cardId: string;
  cardName: string;
  userRole: "Owner" | "Admin" | "Member";
  membersCount: number;
}

export const CourseSpaceChat: React.FC<CourseSpaceChatProps> = ({
  cardId,
  cardName,
  userRole,
  membersCount
}) => {
  const { user } = useAuth();
  const currentUserName = user?.displayName || user?.email?.split("@")[0] || "You";

  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    LumiraAPI.getChatMessages(cardId)
      .then((msgs) => {
        if (cancelled) return;
        setMessages(msgs.map((m: any) => ({
          id: m.id,
          senderName: m.senderName,
          senderRole: m.senderRole,
          text: m.text,
          time: m.createdAt,
          isSelf: m.senderName === currentUserName,
        })));
      })
      .catch(() => { if (!cancelled) setMessages([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || sending) return;
    setInputText("");
    setSending(true);
    try {
      const msg: any = await LumiraAPI.sendChatMessage(cardId, currentUserName, text, userRole);
      setMessages(prev => [...prev, {
        id: msg.id, senderName: msg.senderName, senderRole: msg.senderRole,
        text: msg.text, time: msg.createdAt, isSelf: true,
      }]);
    } catch {
      // Restore the draft so nothing typed is silently lost if the send failed.
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[460px] bg-white rounded-2xl border border-line overflow-hidden shadow-sm">
      <div className="px-4 py-2.5 bg-canvas border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          <span className="text-xs font-semibold text-ink">{cardName} · Live Room</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted">
          <Users className="w-3 h-3 text-primary" />
          <span>{membersCount} members</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-muted text-xs pt-6">Loading messages…</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted text-xs pt-6">No messages yet — say hello!</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}>
              <div className="flex items-center gap-1.5 mb-1 text-[10px]">
                {!msg.isSelf && <span className="font-semibold text-ink">{msg.senderName}</span>}
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                  msg.senderRole === "Owner" ? "bg-rolebg-owner text-roleink-owner"
                  : msg.senderRole === "Admin" ? "bg-rolebg-admin text-roleink-admin"
                  : "bg-rolebg-member text-roleink-member"
                }`}>
                  {msg.senderRole}
                </span>
                <span className="text-muted text-[9px]">{msg.time}</span>
              </div>
              <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                msg.isSelf ? "bg-primary text-white rounded-br-sm" : "bg-[#F1F1F6] text-ink rounded-bl-sm"
              }`}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-2.5 bg-canvas border-t border-line flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${cardName} as ${currentUserName}...`}
          className="flex-1 bg-white border border-line rounded-xl px-3.5 py-2 text-xs text-ink placeholder-muted outline-none focus:border-primary transition"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          className="w-8 h-8 rounded-xl bg-primary hover:opacity-90 disabled:opacity-40 text-white flex items-center justify-center transition shrink-0 shadow-sm"
          title="Send message"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
