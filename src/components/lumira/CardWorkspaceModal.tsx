import React, { useState, useEffect } from "react";
import {
  ArrowLeft, Share2, Sparkles, Send, CheckCircle2, Upload,
  Copy, Check, MessageSquare, Maximize2, X, Users,
} from "lucide-react";
import { Card, Resource, Note, FlashcardSet, Quiz, CourseSpaceEvent, SarahMessage, SupportedFileType } from "../../types/lumira";
import { LumiraAPI } from "../../services/api";
import { CourseSpaceChat } from "./CourseSpaceChat";
import { ResourceReaderModal } from "./ResourceReaderModal";
import { useAuth } from "../../context/AuthContext";

interface CardWorkspaceModalProps {
  card: Card;
  onClose: () => void;
  onUpdateCard: (updated: Card) => void;
}

type TabId = "resources" | "notes" | "flashcards" | "quizzes" | "chat" | "updates" | "shareLink";

export const CardWorkspaceModal: React.FC<CardWorkspaceModalProps> = ({
  card,
  onClose,
  onUpdateCard,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("resources");

  const [resources, setResources] = useState<Resource[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [events, setEvents] = useState<CourseSpaceEvent[]>([]);

  const [openedResource, setOpenedResource] = useState<Resource | null>(null);

  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const [showSarah, setShowSarah] = useState(false);
  const [sarahMessages, setSarahMessages] = useState<SarahMessage[]>([
    {
      id: "s1",
      role: "model",
      content: `Welcome to **${card.name}**! I'm Sarah, your workspace tutor. I'm grounded in your lecture materials and can explain concepts, generate active recall drills, or clarify lecture slides. What are you studying?`,
      timestamp: "Just now"
    }
  ]);
  const [sarahInput, setSarahInput] = useState("");
  const [isSarahThinking, setIsSarahThinking] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadText, setUploadText] = useState("");
  const [uploadFileType, setUploadFileType] = useState<SupportedFileType>("pdf");

  const [copiedLink, setCopiedLink] = useState(false);
  const [togglingSpace, setTogglingSpace] = useState(false);

  useEffect(() => {
    loadSubsystems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      uploadText.trim() || "Course notes and key topics.",
      uploadFileType
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

    setSarahMessages(prev => [...prev, {
      id: "usr-" + Date.now(),
      role: "user",
      content: question,
      timestamp: "Just now",
    }]);
    setIsSarahThinking(true);

    try {
      const answer = await LumiraAPI.askSarah({ cardId: card.id, question });
      setSarahMessages(prev => [...prev, {
        id: "sarah-" + Date.now(),
        role: "model",
        content: answer,
        timestamp: "Just now"
      }]);
    } catch (err: any) {
      setSarahMessages(prev => [...prev, {
        id: "err-" + Date.now(),
        role: "model",
        content: "Sorry — I couldn't reach the tutoring service just now. " + (err?.message || ""),
        timestamp: "Just now"
      }]);
    } finally {
      setIsSarahThinking(false);
    }
  };

  const handleToggleCourseSpace = async () => {
    setTogglingSpace(true);
    try {
      const updated = await LumiraAPI.convertToCourseSpace(card.id);
      onUpdateCard(updated);
      setActiveTab("shareLink");
    } catch (e: any) {
      alert("Couldn't create the Course Space: " + (e?.message || "unknown error"));
    } finally {
      setTogglingSpace(false);
    }
  };

  const handleGenerateLink = async () => {
    try {
      const res = await LumiraAPI.resetShareLink(card.id);
      onUpdateCard({ ...card, shareToken: res.shareToken, isShared: true });
    } catch (e: any) {
      alert("Couldn't generate a link: " + (e?.message || "unknown error"));
    }
  };

  const handleCopyShareLink = () => {
    const link = `${window.location.origin}/join/${card.shareToken || card.id}`;
    navigator.clipboard?.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1600);
  };

  const currentCards = flashcardSets[0]?.cards || [];
  const activeQuiz = quizzes[0];

  const roleLabel = (card.role || "OWNER").charAt(0) + (card.role || "OWNER").slice(1).toLowerCase();
  const roleClass =
    card.role === "ADMIN" ? "bg-rolebg-admin text-roleink-admin" :
    card.role === "MEMBER" ? "bg-rolebg-member text-roleink-member" :
    "bg-rolebg-owner text-roleink-owner";

  const statusChip = (status: string) => {
    const map: Record<string, [string, string]> = {
      PENDING: ["bg-pending-bg text-pending-ink", "Pending"],
      PROCESSING: ["bg-processing-bg text-processing-ink", "Processing"],
      READY: ["bg-ready-bg text-ready-ink", "Ready"],
      FAILED: ["bg-danger-bg text-danger-ink", "Failed"],
    };
    const [cls, label] = map[status] || map.READY;
    return <span className={`text-[0.62rem] font-bold px-2 py-0.5 rounded-full shrink-0 ${cls}`}>{label}</span>;
  };

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "resources", label: "Resources", count: resources.length },
    { id: "notes", label: "Notes", count: notes.length },
    { id: "flashcards", label: "Flashcards", count: currentCards.length },
    { id: "quizzes", label: "Quizzes", count: quizzes.length },
    ...(card.isShared ? [{ id: "chat" as TabId, label: "Live Chat" }] : []),
    ...(card.isShared ? [{ id: "updates" as TabId, label: "Updates", count: events.length }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 bg-canvas text-ink flex flex-col">
      <div className="max-w-[420px] mx-auto w-full h-full bg-surface flex flex-col relative sm:my-6 sm:h-[calc(100%-3rem)] sm:rounded-[32px] sm:shadow-xl overflow-hidden">

        {/* Back row */}
        <div className="flex items-center gap-2 px-3.5 pt-4 pb-1">
          <button onClick={onClose} className="p-1.5 text-ink text-xl leading-none">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          {card.isShared && (
            <button
              onClick={() => setActiveTab("shareLink")}
              className="w-[34px] h-[34px] rounded-full bg-[#F1F1F6] flex items-center justify-center"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Title + role */}
        <div className="px-[18px] pb-1">
          <div className="text-[1.25rem] font-display font-bold mt-1 mb-1">{card.name}</div>
          <div className="flex items-center gap-2 text-[0.78rem] text-muted">
            <span className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold ${roleClass}`}>{roleLabel}</span>
            {card.isShared && (
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Course Space</span>
            )}
          </div>
        </div>

        {!card.isShared && (
          <div className="flex gap-2 px-[18px] pt-2.5 pb-1.5">
            <button
              onClick={handleToggleCourseSpace}
              disabled={togglingSpace}
              className="px-3.5 py-2.5 rounded-[10px] bg-primary text-white text-[0.82rem] font-display font-semibold disabled:opacity-60"
            >
              {togglingSpace ? "Creating…" : "Create Course Space"}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 px-3.5 pt-2.5 pb-0.5 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`whitespace-nowrap px-3.5 py-2 text-[0.8rem] font-display font-semibold rounded-full transition ${
                activeTab === t.id ? "bg-ink text-white" : "text-muted"
              }`}
            >
              {t.label}{t.count !== undefined ? ` (${t.count})` : ""}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-[18px] pt-2.5 pb-24">

          {activeTab === "resources" && (
            <div>
              <div
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 py-3 text-primary font-display font-semibold text-[0.86rem] cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Add Resource
              </div>
              {resources.length === 0 ? (
                <div className="text-center py-10 text-muted text-sm">
                  <div className="text-2xl mb-2">📄</div>No resources yet
                </div>
              ) : (
                resources.map(res => (
                  <div key={res.id} className="flex items-center gap-3 py-3 border-b border-line">
                    <div className="w-9 h-9 rounded-[10px] bg-[#F1F1F6] flex items-center justify-center text-base shrink-0">📄</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.88rem] font-semibold truncate">{res.title}</div>
                      <div className="text-[0.72rem] text-muted mt-0.5">
                        {card.isShared ? "Shared with Course Space" : "Private"} · {res.fileType.toUpperCase()}
                      </div>
                    </div>
                    <button
                      title="Ask Sarah about this"
                      onClick={() => { setShowSarah(true); setSarahInput(`About "${res.title}": `); }}
                      className="w-7 h-7 rounded-full bg-[#FFF4E0] flex items-center justify-center text-[0.85rem] shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber" />
                    </button>
                    <button
                      onClick={() => setOpenedResource(res)}
                      title="Open in Reader"
                      className="w-7 h-7 rounded-full bg-[#F1F1F6] flex items-center justify-center shrink-0"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    {statusChip(res.status)}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div>
              {notes.length === 0 ? (
                <div className="text-center py-10 text-muted text-sm">
                  <div className="text-2xl mb-2">📝</div>No notes yet — private to you unless you share it
                </div>
              ) : (
                notes.map(note => (
                  <div key={note.id} className="py-3 border-b border-line">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[0.88rem] font-semibold">{note.title}</div>
                      <span className="text-[0.68rem] px-2 py-0.5 rounded-full bg-[#F1F1F6] text-muted shrink-0">
                        {note.isShared ? "Shared" : "Private"}
                      </span>
                    </div>
                    <p className="text-[0.82rem] text-muted mt-1 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "flashcards" && (
            <div className="py-2">
              {currentCards.length > 0 ? (
                <div className="space-y-5">
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="min-h-[220px] bg-canvas border border-line rounded-2xl p-6 flex flex-col justify-between cursor-pointer"
                  >
                    <div className="flex justify-between text-[0.7rem] text-primary font-semibold">
                      <span>Card {activeFlashcardIndex + 1} of {currentCards.length}</span>
                      <span>{isFlipped ? "Answer" : "Tap to flip"}</span>
                    </div>
                    <div className="my-auto text-center px-2">
                      <p className="text-[1.1rem] font-display font-semibold leading-relaxed">
                        {isFlipped ? currentCards[activeFlashcardIndex].back : currentCards[activeFlashcardIndex].front}
                      </p>
                      {currentCards[activeFlashcardIndex].hint && !isFlipped && (
                        <p className="text-[0.75rem] text-muted mt-3">💡 {currentCards[activeFlashcardIndex].hint}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between gap-2">
                    <button
                      onClick={() => { setIsFlipped(false); setActiveFlashcardIndex(p => Math.max(0, p - 1)); }}
                      disabled={activeFlashcardIndex === 0}
                      className="flex-1 py-2.5 bg-[#F1F1F6] disabled:opacity-40 rounded-[10px] text-[0.8rem] font-display font-semibold"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => { setIsFlipped(false); setActiveFlashcardIndex(p => (p + 1) % currentCards.length); }}
                      className="flex-1 py-2.5 bg-primary text-white rounded-[10px] text-[0.8rem] font-display font-semibold"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-muted text-sm">
                  <div className="text-2xl mb-2">🗂️</div>No flashcards yet
                </div>
              )}
            </div>
          )}

          {activeTab === "quizzes" && (
            <div className="py-2 space-y-5">
              {activeQuiz ? (
                <>
                  <div>
                    <h2 className="text-[1.05rem] font-display font-bold">{activeQuiz.title}</h2>
                    {activeQuiz.description && <p className="text-[0.82rem] text-muted mt-0.5">{activeQuiz.description}</p>}
                  </div>
                  {activeQuiz.questions.map((q, idx) => (
                    <div key={q.id} className="space-y-2">
                      <p className="text-[0.85rem] font-semibold">{idx + 1}. {q.question}</p>
                      <div className="space-y-1.5">
                        {q.options.map(opt => {
                          const isSelected = quizAnswers[q.id] === opt.id;
                          const isCorrect = q.correctOptionId === opt.id;
                          const cls = quizSubmitted
                            ? isCorrect ? "bg-ready-bg border-ready-ink/40 text-ready-ink"
                            : isSelected ? "bg-danger-bg border-danger/40 text-danger-ink"
                            : "bg-canvas border-line text-muted"
                            : isSelected ? "bg-primary-100 border-primary text-ink" : "bg-canvas border-line text-ink";
                          return (
                            <button
                              key={opt.id}
                              onClick={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                              className={`w-full text-left p-3 rounded-xl text-[0.8rem] border transition ${cls}`}
                            >
                              {opt.text}
                            </button>
                          );
                        })}
                      </div>
                      {quizSubmitted && q.explanation && (
                        <p className="text-[0.75rem] text-muted bg-canvas p-2.5 rounded-xl">💡 {q.explanation}</p>
                      )}
                    </div>
                  ))}
                  {!quizSubmitted ? (
                    <button onClick={() => setQuizSubmitted(true)} className="w-full py-3 bg-primary text-white font-display font-semibold rounded-[10px] text-[0.85rem]">
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}
                      className="w-full py-2.5 bg-[#F1F1F6] text-ink text-[0.8rem] rounded-[10px] font-display font-semibold"
                    >
                      Retake Quiz
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-10 text-muted text-sm">
                  <div className="text-2xl mb-2">❓</div>No quizzes yet
                </div>
              )}
            </div>
          )}

          {activeTab === "chat" && card.isShared && (
            <CourseSpaceChat
              cardId={card.id}
              cardName={card.name}
              userRole={card.role === "ADMIN" ? "Admin" : card.role === "MEMBER" ? "Member" : "Owner"}
              membersCount={3}
            />
          )}

          {activeTab === "updates" && (
            <div>
              {events.length === 0 ? (
                <div className="text-center py-10 text-muted text-sm">
                  <div className="text-2xl mb-2">🔔</div>No updates yet
                </div>
              ) : (
                events.map(ev => (
                  <div key={ev.id} className="py-3 border-b border-line flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[0.86rem]">{(ev as any).actorName || "Someone"} · <span className="text-muted">{ev.type}</span></div>
                      <div className="text-[0.72rem] text-muted mt-0.5">{new Date(ev.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "shareLink" && (
            <div className="py-2">
              {!card.shareToken ? (
                <div className="text-center py-6">
                  <div className="text-2xl mb-2">🔗</div>
                  <p className="text-muted text-sm mb-4">No link yet — generate one to invite classmates.</p>
                  <button onClick={handleGenerateLink} className="px-4 py-2.5 bg-primary text-white rounded-[10px] text-[0.82rem] font-display font-semibold">
                    Generate link
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-[0.75rem] font-semibold text-muted mb-1.5">Share link</div>
                  <div className="flex items-center gap-2 bg-[#F1F1F6] rounded-[10px] px-3 py-2.5 text-[0.8rem] mb-3.5 break-all">
                    🔗 {window.location.origin}/join/{card.shareToken}
                  </div>
                  <button onClick={handleCopyShareLink} className="w-full py-2.5 bg-[#F1F1F6] rounded-[10px] text-[0.82rem] font-display font-semibold mb-4 flex items-center justify-center gap-2">
                    {copiedLink ? <Check className="w-4 h-4 text-teal" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? "Link copied" : "Copy link"}
                  </button>
                  <div className="pt-4">
                    <button onClick={handleGenerateLink} className="w-full py-2.5 bg-danger-bg text-danger-ink rounded-[10px] text-[0.82rem] font-display font-semibold">
                      Reset link (invalidate old one)
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Sarah FAB */}
        <button
          onClick={() => setShowSarah(true)}
          className="absolute right-[18px] bottom-[18px] w-[54px] h-[54px] rounded-full bg-amber text-amber-ink flex items-center justify-center shadow-[0_8px_20px_rgba(242,169,60,0.45)]"
        >
          <Sparkles className="w-6 h-6" />
        </button>

        {/* Sarah sheet */}
        {showSarah && (
          <div className="absolute inset-0 z-20 flex items-end bg-[rgba(15,15,20,0.45)]" onClick={(e) => { if (e.target === e.currentTarget) setShowSarah(false); }}>
            <div className="lumira-sheet bg-surface w-full rounded-t-[20px] p-5 pb-6 flex flex-col h-[78%] max-h-[560px] relative">
              <button onClick={() => setShowSarah(false)} className="absolute top-4 right-4 text-muted">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-line mb-2.5">
                <div className="w-[30px] h-[30px] rounded-full bg-amber text-amber-ink flex items-center justify-center font-bold text-[0.85rem] shadow-[0_0_0_3px_rgba(242,169,60,0.18)]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-display font-bold text-[0.95rem]">Sarah</div>
                  <div className="text-[0.72rem] text-muted">{card.name}{card.isShared ? " · Course Space" : ""}</div>
                </div>
              </div>
              <div className="text-[0.7rem] text-[#8A5A0F] bg-[#FFF8EB] rounded-lg px-2.5 py-2 mb-2.5 leading-relaxed">
                {card.isShared
                  ? "In a Course Space, Sarah never uses another member's private notes, conversations, or generated artifacts."
                  : "Sarah is grounded in this Card's resources and your own notes."}
              </div>
              <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pb-2">
                {sarahMessages.map(msg => (
                  <div key={msg.id} className={`flex gap-2 max-w-[88%] ${msg.role === "user" ? "self-end flex-row-reverse" : ""}`}>
                    {msg.role !== "user" && (
                      <div className="w-[30px] h-[30px] rounded-full bg-amber text-amber-ink flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                    <div className={`px-3.5 py-2.5 rounded-2xl text-[0.85rem] leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user" ? "bg-primary text-white rounded-br-[4px]" : "bg-[#F1F1F6] text-ink rounded-bl-[4px]"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isSarahThinking && <div className="text-[0.78rem] text-muted italic pl-9">Sarah is thinking…</div>}
              </div>
              <div className="flex gap-2 pt-2.5 border-t border-line mt-2">
                <input
                  value={sarahInput}
                  onChange={e => setSarahInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendSarah()}
                  placeholder="Ask Sarah..."
                  className="flex-1 px-3.5 py-2.5 rounded-full border-[1.5px] border-line text-[0.85rem] focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleSendSarah}
                  disabled={!sarahInput.trim()}
                  className="w-10 h-10 rounded-full bg-amber disabled:opacity-50 flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4 text-amber-ink" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Resource sheet */}
        {showUploadModal && (
          <div className="absolute inset-0 z-20 flex items-end bg-[rgba(15,15,20,0.45)]" onClick={(e) => { if (e.target === e.currentTarget) setShowUploadModal(false); }}>
            <div className="bg-surface w-full rounded-t-[20px] p-5 pb-7 relative">
              <button onClick={() => setShowUploadModal(false)} className="absolute top-4 right-4 text-muted"><X className="w-4 h-4" /></button>
              <h3 className="font-display font-bold text-[1.05rem] mb-3.5">Add Resource</h3>
              <div className="mb-3.5">
                <label className="text-[0.75rem] font-semibold text-muted mb-1.5 block">Format</label>
                <div className="flex gap-1.5 flex-wrap">
                  {(["pdf", "docx", "pptx", "xlsx", "csv", "txt", "image"] as SupportedFileType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setUploadFileType(type)}
                      className={`px-2.5 py-1 rounded-full text-[0.68rem] font-semibold uppercase ${
                        uploadFileType === type ? "bg-ink text-white" : "bg-[#F1F1F6] text-muted"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <input
                placeholder="e.g. Lecture 5.pdf"
                value={uploadTitle}
                onChange={e => setUploadTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-line text-[0.9rem] mb-3.5"
              />
              <textarea
                placeholder="Paste extracted text or notes (optional)"
                value={uploadText}
                onChange={e => setUploadText(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-line text-[0.82rem] mb-3.5"
              />
              <button onClick={handleAddResource} className="w-full py-2.5 bg-primary text-white rounded-[10px] font-display font-semibold text-[0.85rem]">
                Upload
              </button>
            </div>
          </div>
        )}

        {openedResource && (
          <ResourceReaderModal
            resource={openedResource}
            cardName={card.name}
            onClose={() => setOpenedResource(null)}
            onGroundSarah={(passage, loc) => {
              setShowSarah(true);
              setSarahInput(`Can you explain this from ${loc}: "${passage}"?`);
              setOpenedResource(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
