import { api, APIError } from "encore.dev/api";
import { cardDB } from "./card";

export interface ChatMessage {
  id: string;
  cardId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole: "Owner" | "Admin" | "Member";
  text: string;
  createdAt: string;
}

export interface SendChatMessageRequest {
  cardId: string;
  senderName: string;
  senderRole?: "Owner" | "Admin" | "Member";
  text: string;
}

// In-memory real-time message buffer with seeded peer conversation
const spaceChatMessages: Record<string, ChatMessage[]> = {
  os: [
    {
      id: "cm-1",
      cardId: "os",
      senderId: "u-ama",
      senderName: "Ama",
      senderRole: "Admin",
      text: "Hey everyone! Did anyone finish question 3 on the Semaphore synchronization assignment?",
      createdAt: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    {
      id: "cm-2",
      cardId: "os",
      senderId: "u-kwame",
      senderName: "Kwame",
      senderRole: "Member",
      text: "Yes, remember to initialize the mutex semaphore to 1 and the buffer slot count to N. Check Lecture 2.pdf page 14!",
      createdAt: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    {
      id: "cm-3",
      cardId: "os",
      senderId: "u-ama",
      senderName: "Ama",
      senderRole: "Admin",
      text: "Thanks Kwame! Sarah also explained the producer-consumer condition variables really well.",
      createdAt: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  ]
};

// GET /v1/cards/:cardId/chat - Fetch Course Space chat messages
export const getChatMessages = api(
  { expose: true, method: "GET", path: "/v1/cards/:cardId/chat" },
  async ({ cardId }: { cardId: string }): Promise<{ messages: ChatMessage[] }> => {
    return { messages: spaceChatMessages[cardId] || [] };
  }
);

// POST /v1/cards/:cardId/chat - Send a real-time message to Course Space members
export const sendChatMessage = api(
  { expose: true, method: "POST", path: "/v1/cards/:cardId/chat" },
  async ({ cardId, senderName, senderRole, text }: SendChatMessageRequest): Promise<ChatMessage> => {
    if (!text?.trim()) {
      throw APIError.invalidArgument("Message text cannot be empty");
    }

    if (!spaceChatMessages[cardId]) {
      spaceChatMessages[cardId] = [];
    }

    const newMsg: ChatMessage = {
      id: "cm-" + Date.now(),
      cardId,
      senderId: "user-current",
      senderName: senderName || "Scholar",
      senderRole: senderRole || "Owner",
      text: text.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    spaceChatMessages[cardId].push(newMsg);

    return newMsg;
  }
);
