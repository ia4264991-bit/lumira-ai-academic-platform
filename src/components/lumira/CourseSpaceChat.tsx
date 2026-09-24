import React, { useState, useEffect, useRef } from "react";
import { Send, Users, Sparkles, MessageSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

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

const SEED_MESSAGES: Record<string, LiveChatMessage[]> = {
  os: [
    {
      id: "m-1",
      senderName: "Ama",
      senderRole: "Admin",
      text: "Hey everyone! Did anyone finish question 3 on the Semaphore synchronization assignment?",
      time: "2:15 PM",
      isSelf: false
    },
    {
      id: "m-2",
      senderName: "Kwame",
      senderRole: "Member",
      text: "Yes, remember to initialize the mutex semaphore to 1 and the empty slots to N. Check Lecture 2.pdf page 14!",
      time: "2:18 PM",
      isSelf: false
    },
    {
      id: "m-3",
      senderName: "Ama",
      senderRole: "Admin",
      text: "Thanks Kwame! Sarah also explained the producer-consumer condition variables really well.",
      time: "2:20 PM",
      isSelf: false
    }
  ]
};

export const CourseSpaceChat: React.FC<CourseSpaceChatProps> = ({
  cardId,
  cardName,
  userRole,
  membersCount
}) => {
  const { user } = useAuth();
  const currentUserName = user?.displayName || user?.email?.split("@")[0] || "You";
  
  const [messages, setMessages] = useState<LiveChatMessage[]>(() => {
    return SEED_MESSAGES[cardId] || [
      {
        id: "m-init",
        senderName: "Lumira Bot",
        senderRole: "Admin",
        text: `Welcome to the live discussion for ${cardName}! Share lecture insights, ask peer questions, and collaborate.`,
        time: "Just now",
        isSelf: false
      }
    ];
  });
  
  const [inputText, setInputText] = useState("");
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPeerTyping]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: LiveChatMessage = {
      id: "msg-" + Date.now(),
      senderName: currentUserName,
      senderRole: userRole,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSelf: true
    };

    setMessages(prev => [...prev, newMsg]);
    const sentText = inputText.trim();
    setInputText("");

    // Simulate realistic live peer response in Course Space
    if (sentText.toLowerCase().includes("help") || sentText.toLowerCase().includes("quiz") || sentText.toLowerCase().includes("lecture") || sentText.endsWith("?")) {
      setTimeout(() => {
        setIsPeerTyping(true);
      }, 1000);

      setTimeout(() => {
        setIsPeerTyping(false);
        const peers = [
          { name: "Ama", role: "Admin" as const },
          { name: "Kwame", role: "Member" as const }
        ];
        const randomPeer = peers[Math.floor(Math.random() * peers.length)];
        const peerReplies = [
          `Great point! I was just comparing that with the formulas in the Notes tab.`,
          `Have you tested that with the Sarah AI diagnostic quiz yet? It highlights common exam traps.`,
          `Exactly. We can review this together before next week's lab session!`,
          `I added some comments to my study set about that too.`
        ];
        const randomReply = peerReplies[Math.floor(Math.random() * peerReplies.length)];

        setMessages(prev => [
          ...prev,
          {
            id: "msg-" + Date.now(),
            senderName: randomPeer.name,
            senderRole: randomPeer.role,
            text: randomReply,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isSelf: false
          }
        ]);
      }, 2600);
    }
  };

  return (
    <div className="flex flex-col h-[460px] bg-white rounded-2xl border border-[#E7E6EE] overflow-hidden shadow-sm">
      {/* Live Chat Sub-Header */}
      <div className="px-4 py-2.5 bg-[#F6F6FA] border-b border-[#E7E6EE] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold font-mono text-[#1A1B23]">Course Space Live Room</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#6E7180] font-mono">
          <Users className="w-3 h-3 text-[#5B5FEF]" />
          <span>{membersCount} scholars online</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[10px]">
                {!msg.isSelf && (
                  <span className="font-semibold text-[#1A1B23] font-mono">{msg.senderName}</span>
                )}
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                    msg.senderRole === "Owner"
                      ? "bg-[#EDE9FE] text-[#6D28D9]"
                      : msg.senderRole === "Admin"
                      ? "bg-[#DBEAFE] text-[#1D4ED8]"
                      : "bg-[#E5F7F1] text-[#0F7A5C]"
                  }`}
                >
                  {msg.senderRole}
                </span>
                <span className="text-[#9698A8] text-[9px]">{msg.time}</span>
              </div>

              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  msg.isSelf
                    ? "bg-[#5B5FEF] text-white rounded-br-sm"
                    : "bg-[#F1F1F6] text-[#1A1B23] rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {isPeerTyping && (
          <div className="flex items-center gap-2 text-[11px] text-[#6E7180] italic pl-2 pt-1 animate-pulse">
            <span className="w-1.5 h-1.5 bg-[#9698A8] rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-[#9698A8] rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 bg-[#9698A8] rounded-full animate-bounce [animation-delay:0.4s]" />
            <span>A peer is typing…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSendMessage} className="p-2.5 bg-[#F6F6FA] border-t border-[#E7E6EE] flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${cardName} scholars as ${currentUserName}...`}
          className="flex-1 bg-white border border-[#E7E6EE] rounded-xl px-3.5 py-2 text-xs text-[#1A1B23] placeholder-[#9698A8] outline-none focus:border-[#5B5FEF] transition"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-8 h-8 rounded-xl bg-[#5B5FEF] hover:bg-[#4d51e8] disabled:opacity-40 text-white flex items-center justify-center transition shrink-0 shadow-sm"
          title="Send live message"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
