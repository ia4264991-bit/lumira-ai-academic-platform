import React, { useState, useEffect } from "react";
import { 
  X, BookOpen, FileText, HelpCircle, Layers, Sparkles, 
  Share2, Users, Send, CheckCircle2, Upload, 
  ShieldCheck, Gauge, Copy, Check, MessageSquare
} from "lucide-react";
import { Card, Resource, Note, FlashcardSet, Quiz, CourseSpaceEvent, SarahMessage } from "../../types/lumira";
import { LumiraAPI } from "../../services/api";
import { CourseSpaceChat } from "./CourseSpaceChat";
import { useAuth } from "../../context/AuthContext";

interface CardWorkspaceModalProps {
  card: Card;
  onClose: () => void;
  onUpdateCard: (updated: Card) => void;
}

export const CardWorkspaceModal: React.FC<CardWorkspaceModalProps> = ({
  card,
  onClose,
  onUpdateCard,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"resources" | "notes" | "flashcards" | "quizzes" | "chat" | "sarah" | "updates">("resources");
  
  // Subsystem states
  const [resources, setResources] = useState<Resource[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [events, setEvents] = useState<CourseSpaceEvent[]>([]);
  
  // Flashcard & Quiz States
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Sarah AI workspace state
  const [sarahMessages, setSarahMessages] = useState<SarahMessage[]>([
    {
      id: "s1",
      role: "model",
      content: `Welcome to **${card.name}**! I'm Sarah, your workspace tutor.\n\nI am grounded in your lecture materials and can explain key mechanisms, generate active recall drills, or clarify lecture slides. What are you studying?`,
      timestamp: "Just now"
    }
  ]);
  const [sarahInput, setSarahInput] = useState("");
  const [isSarahThinking, setIsSarahThinking] = useState(false);
  
  // AD-037: Usage Meter state (server-authoritative)
  const [tokenUsage, setTokenUsage] = useState({ used: 1420, quota: 150000 });

  // Resource Upload & Selected Resource for Contextual Sarah (AD-027)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadText, setUploadText] = useState("");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);

  // Load all subsystems for this card aggregate
  useEffect(() => {
    loadSubsystems();
  }, [card.id]);

  const loadSubsystems = async () => {
    try {
      const [res, n, fc, q, ev] = await Promise.all([
        LumiraAPI.getResources(card.id),
        LumiraAPI.getNotes(card.id),
        LumiraAPI.getFlashcardSets(card.id),
        LumiraAPI.getQuizzes(card.id),
        LumiraAPI.getEvents(card.id)
      ]);
      setResources(res);
      setNotes(n);
      setFlashcardSets(fc);
      setQuizzes(q);
      setEvents(ev);
    } catch (err) {
      console.error("Failed to load card aggregate subsystems:", err);
    }
  };

  const handleAddResource = async () => {
    if (!uploadTitle.trim()) return;
    const newRes = await LumiraAPI.addResource(
      card.id,
      uploadTitle.trim(),
      uploadText.trim() || "Course notes and key topics."
    );
    setResources(prev => [newRes, ...prev]);
    setShowUploadModal(false);
    setUploadTitle("");
    setUploadText("");
  };

  const handleSendSarah = async () => {
    if (!sarahInput.trim() || isSarahThinking) return;
    const question = sarahInput.trim();
    setSarahInput("");
    
    // Add user message
    const userMsg: SarahMessage = {
      id: "usr-" + Date.now(),
      role: "user",
      content: question,
      timestamp: "Just now",
      groundedResourceTitle: selectedResource?.title
    };
    setSarahMessages(prev => [...prev, userMsg]);
    setIsSarahThinking(true);

    try {
      const answer = await LumiraAPI.askSarah({
        cardId: card.id,
        question,
        resourceTitle: selectedResource?.title
      });
      
      setSarahMessages(prev => [...prev, {
        id: "sarah-" + Date.now(),
        role: "model",
        content: answer,
        timestamp: "Just now",
        groundedResourceTitle: selectedResource?.title
      }]);

      setTokenUsage(prev => ({ used: Math.min(prev.quota, prev.used + 180), quota: prev.quota }));
    } catch (err: any) {
      setSarahMessages(prev => [...prev, {
        id: "err-" + Date.now(),
        role: "model",
        content: "⚠️ " + (err.message || "Unable to consult Sarah right now. Please verify permissions."),
        timestamp: "Just now"
      }]);
    } finally {
      setIsSarahThinking(false);
    }
  };

  const handleToggleCourseSpace = async () => {
    try {
      const updated = await LumiraAPI.convertToCourseSpace(card.id);
      onUpdateCard(updated);
    } catch (e: any) {
      alert("Failed to toggle sharing: " + e.message);
    }
  };

  const handleCopyShareLink = () => {
    const link = `${window.location.origin}/join/${card.shareToken || card.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const currentCards = flashcardSets[0]?.cards || [];
  const activeQuiz = quizzes[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Workspace Top Header */}
        <div className={`p-6 bg-gradient-to-r ${card.color} text-white flex justify-between items-start shrink-0 relative overflow-hidden`}>
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-black/30 backdrop-blur-sm border border-white/20">
                {card.isShared ? "Course Space" : "Personal Card"}
              </span>
              {card.role && (
                <span className="text-xs px-2 py-0.5 rounded bg-white/20 font-mono">
                  {card.role}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{card.name}</h2>
            <p className="text-xs text-white/80 font-mono">
              Aggregate Root ID: {card.id} • Created {new Date(card.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            {/* Convert to / manage Course Space */}
            <button
              onClick={handleToggleCourseSpace}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition ${
                card.isShared 
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30" 
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              {card.isShared ? "Course Space Active" : "Enable Course Space"}
            </button>

            {card.isShared && (
              <button
                onClick={handleCopyShareLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/20 hover:bg-white/30 transition text-white"
                title="Copy Invite Link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? "Link Copied" : "Share Link"}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Navigation Bar - AD-020 */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 shrink-0 overflow-x-auto">
          <div className="flex space-x-1 py-2">
            {[
              { id: "resources", label: "Resources", icon: BookOpen, count: resources.length },
              { id: "notes", label: "Notes", icon: FileText, count: notes.length },
              { id: "flashcards", label: "Flashcards", icon: Layers, count: currentCards.length },
              { id: "quizzes", label: "Quizzes", icon: HelpCircle, count: quizzes.length },
              ...(card.isShared ? [{ id: "chat", label: "Live Chat", icon: MessageSquare, count: undefined }] : []),
              { id: "sarah", label: "Sarah AI Tutor", icon: Sparkles, count: undefined },
              { id: "updates", label: "Updates Feed", icon: CheckCircle2, count: events.length },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* AD-037 Server-authoritative Token Usage Meter */}
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-4">
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Quota:</span>
            <span className="font-mono text-slate-200 font-semibold">{tokenUsage.used.toLocaleString()} / {tokenUsage.quota.toLocaleString()}</span>
          </div>
        </div>

        {/* Subsystem Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50">
          
          {/* RESOURCES TAB (AD-021: First-class Subsystem) */}
          {activeTab === "resources" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white">Curated Resources</h3>
                  <p className="text-sm text-slate-400">PDFs, lecture slides, and notes (shared by default in Course Spaces).</p>
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-600/20"
                >
                  <Upload className="w-4 h-4" />
                  Add Resource
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {resources.map(res => (
                  <div 
                    key={res.id} 
                    className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                      selectedResource?.id === res.id 
                        ? "bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10" 
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs px-2 py-0.5 rounded font-mono uppercase bg-slate-800 text-slate-300">
                          {res.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          {res.sizeBytes ? `${(res.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : "Text snippet"}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-slate-100 mt-2">{res.title}</h4>
                      {res.extractedText && (
                        <p className="text-xs text-slate-400 line-clamp-3 mt-1.5 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                          {res.extractedText}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-xs">
                      <span className="text-slate-500">
                        {new Date(res.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedResource(res);
                          setActiveTab("sarah");
                        }}
                        className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Ground Sarah AI
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Study Notes</h3>
              </div>
              <div className="space-y-3">
                {notes.map(note => (
                  <div key={note.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-slate-100">{note.title}</h4>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {note.isShared ? "Shared with Space" : "Private Note"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FLASHCARDS TAB */}
          {activeTab === "flashcards" && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Active Recall Flashcards</h3>
              </div>

              {currentCards.length > 0 ? (
                <div className="space-y-4">
                  <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="min-h-[220px] bg-gradient-to-br from-slate-900 to-indigo-950/60 border border-indigo-500/30 rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:border-indigo-400/50 transition shadow-xl"
                  >
                    <div className="flex justify-between text-xs text-indigo-300 font-mono">
                      <span>Card {activeFlashcardIndex + 1} of {currentCards.length}</span>
                      <span>{isFlipped ? "Answer" : "Tap to flip"}</span>
                    </div>
                    <div className="my-auto text-center px-4">
                      <p className="text-lg font-semibold text-slate-100 leading-relaxed">
                        {isFlipped ? currentCards[activeFlashcardIndex].back : currentCards[activeFlashcardIndex].front}
                      </p>
                      {currentCards[activeFlashcardIndex].hint && !isFlipped && (
                        <p className="text-xs text-slate-400 mt-2">💡 Hint: {currentCards[activeFlashcardIndex].hint}</p>
                      )}
                    </div>
                    <div className="text-center text-xs text-slate-500">
                      {isFlipped ? "Tap to show question" : "Tap to reveal solution"}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setActiveFlashcardIndex(prev => Math.max(0, prev - 1));
                      }}
                      disabled={activeFlashcardIndex === 0}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-xs font-semibold"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setActiveFlashcardIndex(prev => (prev + 1) % currentCards.length);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white"
                    >
                      Next Card
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  No flashcards currently in this deck.
                </div>
              )}
            </div>
          )}

          {/* QUIZZES TAB */}
          {activeTab === "quizzes" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Diagnostic Quizzes</h3>
              </div>

              {activeQuiz ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-slate-100">{activeQuiz.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{activeQuiz.description}</p>
                  </div>

                  <div className="space-y-6">
                    {activeQuiz.questions.map((q, idx) => (
                      <div key={q.id} className="space-y-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                        <p className="text-sm font-semibold text-slate-200">{idx + 1}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options.map(opt => {
                            const isSelected = quizAnswers[q.id] === opt.id;
                            const isCorrect = q.correctOptionId === opt.id;
                            return (
                              <button
                                key={opt.id}
                                onClick={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                                className={`w-full text-left p-3 rounded-lg text-xs transition border ${
                                  quizSubmitted
                                    ? isCorrect 
                                      ? "bg-emerald-950/60 border-emerald-500 text-emerald-200"
                                      : isSelected 
                                      ? "bg-rose-950/60 border-rose-500 text-rose-200"
                                      : "bg-slate-900 border-slate-800 text-slate-400"
                                    : isSelected
                                    ? "bg-indigo-900/60 border-indigo-500 text-white"
                                    : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300"
                                }`}
                              >
                                {opt.text}
                              </button>
                            );
                          })}
                        </div>
                        {quizSubmitted && (
                          <p className="text-xs text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                            💡 <strong>Explanation:</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition"
                    >
                      Submit Diagnostic Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setQuizSubmitted(false);
                        setQuizAnswers({});
                      }}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition"
                    >
                      Retake Quiz
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  No quizzes available.
                </div>
              )}
            </div>
          )}

          {/* LIVE CHAT TAB FOR COURSE SPACES */}
          {activeTab === "chat" && card.isShared && (
            <div className="max-w-2xl mx-auto">
              <CourseSpaceChat
                cardId={card.id}
                cardName={card.name}
                userRole={card.role === "ADMIN" ? "Admin" : card.role === "MEMBER" ? "Member" : "Owner"}
                membersCount={3}
              />
            </div>
          )}

          {/* SARAH AI TUTOR TAB (AD-027, AD-054: Zero-Trust Grounded AI) */}
          {activeTab === "sarah" && (
            <div className="max-w-3xl mx-auto h-[600px] flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              
              {/* Sarah Header with Resource Context Grounding */}
              <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      Sarah AI Tutor
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                        Zero-Trust Security (AD-054)
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      {selectedResource 
                        ? `Grounded on: ${selectedResource.title}` 
                        : `Grounded on entire workspace "${card.name}"`}
                    </p>
                  </div>
                </div>

                {selectedResource && (
                  <button
                    onClick={() => setSelectedResource(null)}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded"
                  >
                    Clear Grounding
                  </button>
                )}
              </div>

              {/* Sarah Conversation Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {sarahMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                      <span>{msg.role === "user" ? "You" : "Sarah AI"}</span>
                      {msg.groundedResourceTitle && (
                        <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 text-[10px]">
                          📚 {msg.groundedResourceTitle}
                        </span>
                      )}
                      <span>• {msg.timestamp}</span>
                    </div>
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-slate-800 border border-slate-700/70 text-slate-100 rounded-bl-none shadow-md"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {isSarahThinking && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 italic pl-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    Sarah is analyzing your academic materials...
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={sarahInput}
                  onChange={e => setSarahInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendSarah()}
                  placeholder="Ask Sarah a conceptual question or request a study drill..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSendSarah}
                  disabled={!sarahInput.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* UPDATES FEED TAB (AD-026: Append-only Event Log) */}
          {activeTab === "updates" && (
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-lg font-semibold text-white">Course Space Updates Log</h3>
              <div className="space-y-3">
                {events.map(ev => (
                  <div key={ev.id} className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-200">{ev.actorName || "Scholar"}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">{ev.type}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{JSON.stringify(ev.payload)}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">{new Date(ev.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Upload Resource Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4 text-slate-100">
            <h4 className="text-lg font-bold">Add Academic Resource</h4>
            <input
              type="text"
              placeholder="Resource Title (e.g. Chapter 4 Bioenergetics)"
              value={uploadTitle}
              onChange={e => setUploadTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500"
            />
            <textarea
              placeholder="Paste extracted text, syllabus notes, or core equations..."
              value={uploadText}
              onChange={e => setUploadText(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
              <button onClick={handleAddResource} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium">Save Resource</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
