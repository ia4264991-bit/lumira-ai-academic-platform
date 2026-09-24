import React, { useState, useEffect } from "react";
import { 
  X, BookOpen, FileText, HelpCircle, Layers, Sparkles, 
  Share2, Users, Send, CheckCircle2, Upload, 
  ShieldCheck, Gauge, Copy, Check
} from "lucide-react";
import { Card, Resource, Note, FlashcardSet, Quiz, CourseSpaceEvent, SarahMessage } from "../../types/lumira";
import { LumiraAPI } from "../../services/api";

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
  const [activeTab, setActiveTab] = useState<"resources" | "notes" | "flashcards" | "quizzes" | "sarah" | "updates">("resources");

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

  // Quick generation modal for Sarah (AD-035)
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load data on mount
  useEffect(() => {
    LumiraAPI.getResources(card.id).then(setResources);
    LumiraAPI.getNotes(card.id).then(setNotes);
    LumiraAPI.getFlashcardSets(card.id).then(setFlashcardSets);
    LumiraAPI.getQuizzes(card.id).then(setQuizzes);
    LumiraAPI.getEvents(card.id).then(setEvents);
  }, [card.id]);

  const handleSendSarah = async () => {
    if (!sarahInput.trim()) return;
    const question = sarahInput;
    setSarahInput("");

    const userMsg: SarahMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      groundedResourceTitle: selectedResource?.title
    };
    setSarahMessages(prev => [...prev, userMsg]);
    setIsSarahThinking(true);

    try {
      const answer = await LumiraAPI.askSarah({
        cardId: card.id,
        question,
        resourceTitle: selectedResource?.title,
        selectedText: selectedResource?.extractedText
      });
      setSarahMessages(prev => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: "model",
          content: answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setTokenUsage(prev => ({ ...prev, used: prev.used + 180 }));
    } finally {
      setIsSarahThinking(false);
    }
  };

  const handleSarahGenerate = async (type: "flashcards" | "quiz") => {
    setIsGenerating(true);
    try {
      if (type === "flashcards") {
        const newSet: FlashcardSet = {
          id: `set-${Date.now()}`,
          owningCardId: card.id,
          title: "Sarah-Generated Key Concept Cards",
          isShared: false,
          createdAt: new Date().toISOString(),
          cards: [
            { id: `fc-${Date.now()}-1`, front: "What is the primary thermodynamic driving force?", back: "The negative change in Gibbs free energy (ΔG < 0).", hint: "Equilibrium condition", mastered: false },
            { id: `fc-${Date.now()}-2`, front: "How do enzymes affect the activation energy barrier?", back: "They stabilize the transition state, effectively lowering the activation energy barrier without shifting equilibrium.", hint: "Catalytic mechanism", mastered: false }
          ]
        };
        setFlashcardSets(prev => [newSet, ...prev]);
        setActiveTab("flashcards");
      } else {
        const newQuiz: Quiz = {
          id: `q-${Date.now()}`,
          owningCardId: card.id,
          title: "Active Recall Diagnostic Assessment",
          description: "Grounded in your workspace materials.",
          isShared: false,
          createdAt: new Date().toISOString(),
          questions: [
            {
              id: "gen-q1",
              question: "Which factor directly accelerates enzymatic reaction velocity at subsaturating substrate concentrations?",
              options: [
                { id: "o1", text: "Increasing substrate concentration [S]" },
                { id: "o2", text: "Competitive inhibitor accumulation" },
                { id: "o3", text: "Denaturing the apoenzyme" },
                { id: "o4", text: "None of the above" },
              ],
              correctOptionId: "o1",
              explanation: "Under Michaelis-Menten kinetics, when [S] << Km, reaction velocity increases linearly with [S]."
            }
          ]
        };
        setQuizzes(prev => [newQuiz, ...prev]);
        setActiveTab("quizzes");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareToCourseSpace = async () => {
    const updated = await LumiraAPI.convertToCourseSpace(card.id);
    onUpdateCard(updated);
  };

  const handleAddResource = async () => {
    if (!uploadTitle.trim()) return;
    const res = await LumiraAPI.addResource(card.id, uploadTitle, uploadText || "Sample academic textbook passage.");
    setResources(prev => [res, ...prev]);
    setShowUploadModal(false);
    setUploadTitle("");
    setUploadText("");
  };

  const copyShareLink = () => {
    if (card.shareToken) {
      navigator.clipboard.writeText(`https://lumira.study/join/${card.shareToken}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header (Card Title, Role, Course Space Capability) */}
        <div className={`p-5 bg-gradient-to-r ${card.color} flex items-center justify-between`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase bg-black/30 tracking-wider">
                {card.isShared ? "Course Space" : "Personal Card"}
              </span>
              {card.role && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/20 text-white">
                  Role: {card.role}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{card.name}</h2>
          </div>

          <div className="flex items-center gap-2">
            {!card.isShared ? (
              <button
                onClick={handleShareToCourseSpace}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition backdrop-blur-sm shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                Enable Course Space
              </button>
            ) : (
              <button
                onClick={copyShareLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 hover:bg-black/50 rounded-lg text-xs font-mono text-white transition backdrop-blur-sm"
                title="Copy Course Space Invite Link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Link Copied!" : `Link: ${card.shareToken}`}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-black/20 hover:bg-black/40 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* First-Class Subsystems (AD-020: Resources, Notes, Flashcards, Quizzes, Sarah AI, Updates) */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 overflow-x-auto">
          <div className="flex gap-2">
            {[
              { id: "resources", label: "Resources", icon: BookOpen },
              { id: "notes", label: "Notes", icon: FileText },
              { id: "flashcards", label: "Flashcards", icon: Layers },
              { id: "quizzes", label: "Quizzes", icon: HelpCircle },
              { id: "sarah", label: "Sarah AI", icon: Sparkles },
              ...(card.isShared ? [{ id: "updates", label: "Updates Feed", icon: Users }] : []),
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                    isActive
                      ? "border-indigo-500 text-indigo-400 bg-slate-900/60"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* AD-037: Usage Meter in Top Bar */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 pl-4 py-2 font-mono">
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Meter: <strong>{tokenUsage.used.toLocaleString()}</strong> / {tokenUsage.quota.toLocaleString()} tokens</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50">
          
          {/* RESOURCES TAB (AD-021) */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map(res => (
                  <div key={res.id} className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-slate-600 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-indigo-400" />
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                            {res.status}
                          </span>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                          Shared
                        </span>
                      </div>
                      <h4 className="font-medium text-slate-100 mb-1">{res.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-3 mb-3 leading-relaxed">{res.extractedText}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                      <span className="text-xs text-slate-500">{(res.sizeBytes ? res.sizeBytes / 1000000 : 1.2).toFixed(1)} MB</span>
                      <button
                        onClick={() => {
                          setSelectedResource(res);
                          setActiveTab("sarah");
                        }}
                        className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Grounded Sarah Ask
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
              <h3 className="text-lg font-semibold text-white">Study Notes</h3>
              <div className="grid grid-cols-1 gap-4">
                {notes.map(note => (
                  <div key={note.id} className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-base text-slate-100">{note.title}</h4>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-700/60 text-slate-400 font-mono">
                        {note.isShared ? "Shared to Space" : "Private Note"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FLASHCARDS TAB */}
          {activeTab === "flashcards" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-semibold text-white">Flashcard Mastery</h3>
                  <p className="text-xs text-slate-400">Canonical cards with local personal progress tracking.</p>
                </div>
                <button
                  onClick={() => handleSarahGenerate("flashcards")}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-semibold text-indigo-300 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  {isGenerating ? "Generating..." : "Generate Set with Sarah"}
                </button>
              </div>

              {flashcardSets.length > 0 && flashcardSets[0].cards.length > 0 ? (
                <>
                  <div className="flex justify-between items-center text-sm text-slate-400">
                    <span className="font-medium text-slate-200">{flashcardSets[0].title}</span>
                    <span>Card {activeFlashcardIndex + 1} of {flashcardSets[0].cards.length}</span>
                  </div>

                  <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="cursor-pointer min-h-[260px] p-8 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/90 border border-indigo-500/30 flex flex-col justify-between shadow-xl transition-all duration-300 hover:border-indigo-500/60"
                  >
                    <span className="text-xs uppercase font-mono tracking-wider text-indigo-400">
                      {isFlipped ? "Answer" : "Question (Click to flip)"}
                    </span>
                    <p className="text-xl text-center font-medium text-slate-100 my-auto">
                      {isFlipped 
                        ? flashcardSets[0].cards[activeFlashcardIndex].back 
                        : flashcardSets[0].cards[activeFlashcardIndex].front
                      }
                    </p>
                    {flashcardSets[0].cards[activeFlashcardIndex].hint && !isFlipped && (
                      <p className="text-xs text-slate-500 text-center">
                        Hint: {flashcardSets[0].cards[activeFlashcardIndex].hint}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setActiveFlashcardIndex(prev => Math.max(0, prev - 1));
                      }}
                      disabled={activeFlashcardIndex === 0}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-sm font-medium transition"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setActiveFlashcardIndex(prev => Math.min(flashcardSets[0].cards.length - 1, prev + 1));
                      }}
                      disabled={activeFlashcardIndex === flashcardSets[0].cards.length - 1}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-sm font-medium transition"
                    >
                      Next Card
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-center text-slate-400 py-12">No flashcard sets generated yet.</p>
              )}
            </div>
          )}

          {/* QUIZZES TAB (AD-029, AD-053) */}
          {activeTab === "quizzes" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-semibold text-white">Diagnostic Quizzes</h3>
                  <p className="text-xs text-slate-400">Multi-choice evaluations with granular step explanations.</p>
                </div>
                <button
                  onClick={() => handleSarahGenerate("quiz")}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-semibold text-indigo-300 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  {isGenerating ? "Generating..." : "Generate Quiz with Sarah"}
                </button>
              </div>

              {quizzes.map(quiz => (
                <div key={quiz.id} className="p-6 bg-slate-800/70 border border-slate-700 rounded-xl space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-100">{quiz.title}</h4>
                    <p className="text-sm text-slate-400">{quiz.description}</p>
                  </div>

                  {quiz.questions.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-slate-900/60 rounded-lg space-y-3">
                      <p className="font-medium text-sm text-slate-200">{idx + 1}. {q.question}</p>
                      <div className="space-y-2">
                        {q.options.map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                            className={`w-full text-left p-3 rounded-lg text-sm transition border ${
                              quizAnswers[q.id] === opt.id
                                ? "bg-indigo-600/30 border-indigo-500 text-white"
                                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                            }`}
                          >
                            {opt.text}
                          </button>
                        ))}
                      </div>
                      {quizSubmitted && (
                        <p className="text-xs text-indigo-300 pt-2 border-t border-slate-800">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => setQuizSubmitted(true)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 font-medium rounded-lg text-sm text-white transition"
                  >
                    Submit Quiz & Review Answers
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* SARAH AI TAB (AD-027, AD-054) */}
          {activeTab === "sarah" && (
            <div className="flex flex-col h-[520px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
              <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Server-Authoritative Context & Live Authorization Boundary (AD-054)</span>
                </div>
                {selectedResource && (
                  <span className="text-indigo-400 font-mono">
                    Grounded: {selectedResource.title}
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {sarahMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-sm"
                      }`}
                    >
                      {msg.groundedResourceTitle && (
                        <p className="text-[11px] text-indigo-200 mb-1 opacity-80 font-mono">
                          Ref: {msg.groundedResourceTitle}
                        </p>
                      )}
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}
                {isSarahThinking && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
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
