import React, { useState, useEffect } from "react";
import {
  ArrowLeft, Share2, Sparkles, Send, CheckCircle2, Upload,
  Copy, Check, MessageSquare, Maximize2, X, Users, Download,
  Plus, FileText, HelpCircle, Layers, Loader2
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
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [events, setEvents] = useState<CourseSpaceEvent[]>([]);
  const [openedResource, setOpenedResource] = useState<Resource | null>(null);

  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Sarah AI state
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

  // Resource upload sheet
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadText, setUploadText] = useState("");
  const [uploadFileType, setUploadFileType] = useState<SupportedFileType>("pdf");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Add Note sheet
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteIsShared, setNoteIsShared] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  // AI Generation sheet (Flashcards or Quiz)
  const [showGenerateModal, setShowGenerateModal] = useState<"flashcards" | "quiz" | null>(null);
  const [generateTopic, setGenerateTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState<"flashcards" | "quiz" | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [togglingSpace, setTogglingSpace] = useState(false);

  const getDownloadedKey = (resId: string) => `lumira_dl_${card.id}_${resId}`;

  const isResourceDownloaded = (resId: string): boolean => {
    try {
      return localStorage.getItem(getDownloadedKey(resId)) === "true";
    } catch {
      return false;
    }
  };

  const persistResourceDownload = (res: Resource, downloaded: boolean) => {
    try {
      const key = getDownloadedKey(res.id);
      if (downloaded) {
        localStorage.setItem(key, "true");
        localStorage.setItem(`lumira_cached_res_${res.id}`, JSON.stringify(res));
      } else {
        localStorage.removeItem(key);
        localStorage.removeItem(`lumira_cached_res_${res.id}`);
      }
    } catch (e) {
      console.error("Failed to persist offline status:", e);
    }
  };

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
      const mappedResources = res.map(r => ({
        ...r,
        downloadedOffline: isResourceDownloaded(r.id) || !!r.downloadedOffline
      }));
      setResources(mappedResources);
      setNotes(n);
      setFlashcardSets(fc);
      setQuizzes(q);
      setEvents(ev);
    } catch (err) {
      console.error("Failed to load card aggregate subsystems:", err);
    }
  };

  const handleDownloadResource = (res: Resource, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    persistResourceDownload(res, true);
    setResources(prev => prev.map(r => r.id === res.id ? { ...r, downloadedOffline: true } : r));

    // Create a client-side file download for the student
    const content = res.extractedText || `Lumira Academic Resource: ${res.title}\nCard: ${card.name}\nType: ${res.fileType}`;
    const blob = new Blob([content], { type: res.mimeType || "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = res.title.endsWith(`.${res.fileType}`) ? res.title : `${res.title}.${res.fileType || "txt"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenResource = (res: Resource) => {
    setOpenedResource(res);
  };

  const handleAddResource = async () => {
    if (!uploadTitle.trim()) return;
    if (uploadFile) {
      try {
        const newRes = await LumiraAPI.uploadResourceFile(card.id, uploadTitle.trim(), uploadFileType, uploadFile);
        setResources(prev => [{ ...newRes, downloadedOffline: true }, ...prev]);
        persistResourceDownload(newRes, true);
      } catch (err: any) {
        alert("Upload failed: " + (err?.message || "unknown error"));
        return;
      }
    } else {
      const newRes = await LumiraAPI.addResource(
        card.id,
        uploadTitle.trim(),
        uploadText.trim() || "Course notes and key topics.",
        uploadFileType
      );
      setResources(prev => [newRes, ...prev]);
    }
    setShowUploadModal(false);
    setUploadTitle("");
    setUploadText("");
    setUploadFile(null);
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim()) return;
    setSavingNote(true);
    try {
      const newNote = await LumiraAPI.addNote(card.id, noteTitle.trim(), noteContent.trim(), noteIsShared);
      setNotes(prev => [newNote, ...prev]);
      setShowNoteModal(false);
      setNoteTitle("");
      setNoteContent("");
      setNoteIsShared(false);
    } catch (err: any) {
      alert("Failed to save note: " + (err?.message || "unknown error"));
    } finally {
      setSavingNote(false);
    }
  };

  const handleGenerateFlashcards = async (customTopic?: string) => {
    setIsGenerating("flashcards");
    try {
      const topicToUse = customTopic !== undefined ? customTopic : generateTopic.trim();
      const newSet = await LumiraAPI.generateFlashcards(card.id, topicToUse || undefined);
      setFlashcardSets(prev => [newSet, ...prev]);
      setActiveSetIndex(0);
      setActiveFlashcardIndex(0);
      setIsFlipped(false);
      setShowGenerateModal(null);
      setGenerateTopic("");
    } catch (err: any) {
      alert("Could not generate flashcards: " + (err?.message || "Please check your resources."));
    } finally {
      setIsGenerating(null);
    }
  };

  const handleGenerateQuiz = async (customTopic?: string) => {
    setIsGenerating("quiz");
    try {
      const topicToUse = customTopic !== undefined ? customTopic : generateTopic.trim();
      const newQuiz = await LumiraAPI.generateQuiz(card.id, topicToUse || undefined);
      setQuizzes(prev => [newQuiz, ...prev]);
      setActiveQuizIndex(0);
      setQuizAnswers({});
      setQuizSubmitted(false);
      setShowGenerateModal(null);
      setGenerateTopic("");
    } catch (err: any) {
      alert("Could not generate quiz: " + (err?.message || "Please check your resources."));
    } finally {
      setIsGenerating(null);
    }
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
    } catch (e: any) {
      alert("Couldn't convert to Course Space: " + (e?.message || "unknown error"));
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

  const currentSet = flashcardSets[activeSetIndex] || flashcardSets[0];
  const currentCards = currentSet?.cards || [];
  const activeQuiz = quizzes[activeQuizIndex] || quizzes[0];

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
          <button onClick={onClose} className="p-1.5 text-ink text-xl leading-none hover:bg-canvas rounded-full transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          {card.isShared && (
            <button
              onClick={() => setActiveTab("shareLink")}
              className="w-[34px] h-[34px] rounded-full bg-[#F1F1F6] flex items-center justify-center text-ink hover:bg-[#E7E6EE] transition"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Title + role */}
        <div className="px-[18px] pb-1">
          <div className="text-[1.25rem] font-display font-bold mt-1 mb-1 leading-snug">{card.name}</div>
          <div className="flex items-center gap-2 text-[0.78rem] text-muted">
            <span className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold ${roleClass}`}>{roleLabel}</span>
            {card.isShared && (
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Course Space</span>
            )}
          </div>
        </div>

        {!card.isShared && (
          <div className="flex gap-2 px-[18px] pt-2 pb-1">
            <button
              onClick={handleToggleCourseSpace}
              disabled={togglingSpace}
              className="px-3.5 py-2 rounded-[10px] bg-primary text-white text-[0.8rem] font-display font-semibold disabled:opacity-60 hover:bg-primary-600 transition"
            >
              {togglingSpace ? "Creating…" : "Create Course Space"}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 px-3.5 pt-2 pb-1 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 text-[0.78rem] font-display font-semibold rounded-full transition ${
                activeTab === t.id ? "bg-ink text-white" : "text-muted hover:text-ink"
              }`}
            >
              {t.label}{t.count !== undefined ? ` (${t.count})` : ""}
            </button>
          ))}
        </div>

        {/* Tab content body */}
        <div className="flex-1 overflow-y-auto px-[18px] pt-2 pb-24">
          {activeTab === "resources" && (
            <div>
              <div className="flex items-center justify-between pb-3 pt-1 border-b border-line">
                <span className="text-[0.78rem] text-muted font-medium">{resources.length} document{resources.length === 1 ? "" : "s"}</span>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white text-[0.75rem] font-semibold hover:bg-primary-600 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Resource</span>
                </button>
              </div>

              {resources.length === 0 ? (
                <div className="text-center py-12 text-muted text-sm space-y-3">
                  <div className="text-3xl">📄</div>
                  <p className="font-semibold text-ink">No resources uploaded yet</p>
                  <p className="text-[0.78rem] text-muted max-w-xs mx-auto">
                    Upload lecture notes, PDFs, or slide decks. Sarah will ground tutoring and drills in them.
                  </p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-[0.8rem] font-semibold hover:bg-primary-600 transition"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload First Resource</span>
                  </button>
                </div>
              ) : (
                resources.map(res => {
                  const isDownloaded = !!res.downloadedOffline;
                  return (
                    <div
                      key={res.id}
                      onClick={() => handleOpenResource(res)}
                      className="py-3 border-b border-line flex items-center justify-between gap-3 cursor-pointer group hover:bg-canvas/50 -mx-2 px-2 rounded-xl transition"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[0.88rem] font-semibold truncate group-hover:text-primary transition-colors">
                          {res.title}
                        </div>
                        <div className="flex items-center gap-2 text-[0.72rem] text-muted mt-0.5">
                          <span className="uppercase font-bold tracking-wider">{res.fileType}</span>
                          {res.sizeBytes && <span>• {Math.round(res.sizeBytes / 1024)} KB</span>}
                          {isDownloaded && (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Offline ready
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleDownloadResource(res, e)}
                          title={isDownloaded ? "Re-download file" : "Download to device"}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                            isDownloaded
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-[#F1F1F6] text-ink hover:bg-[#E7E6EE]"
                          }`}
                        >
                          {isDownloaded ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => {
                            setShowSarah(true);
                            setSarahInput(`Explain key concepts from "${res.title}".`);
                          }}
                          title="Ask Sarah about this resource"
                          className="w-7 h-7 rounded-full bg-amber-50 hover:bg-amber-100 flex items-center justify-center transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        </button>

                        <button
                          onClick={() => handleOpenResource(res)}
                          title="Open in Reader"
                          className="w-7 h-7 rounded-full bg-[#F1F1F6] hover:bg-[#E7E6EE] flex items-center justify-center text-ink transition-colors"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {statusChip(res.status)}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div>
              <div className="flex items-center justify-between pb-3 pt-1 border-b border-line">
                <span className="text-[0.78rem] text-muted font-medium">{notes.length} note{notes.length === 1 ? "" : "s"}</span>
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white text-[0.75rem] font-semibold hover:bg-primary-600 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
              </div>

              {notes.length === 0 ? (
                <div className="text-center py-12 text-muted text-sm space-y-3">
                  <div className="text-3xl">📝</div>
                  <p className="font-semibold text-ink">No notes yet</p>
                  <p className="text-[0.78rem] text-muted max-w-xs mx-auto">
                    Take private study notes or share synthesis with fellow Course Space scholars.
                  </p>
                  <button
                    onClick={() => setShowNoteModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-[0.8rem] font-semibold hover:bg-primary-600 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create First Note</span>
                  </button>
                </div>
              ) : (
                notes.map(note => (
                  <div key={note.id} className="py-3.5 border-b border-line">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[0.88rem] font-semibold">{note.title}</div>
                      <span className="text-[0.68rem] px-2 py-0.5 rounded-full bg-[#F1F1F6] text-muted shrink-0 font-medium">
                        {note.isShared ? "Shared" : "Private"}
                      </span>
                    </div>
                    <p className="text-[0.82rem] text-muted mt-1.5 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "flashcards" && (
            <div className="py-1">
              <div className="flex items-center justify-between pb-3 border-b border-line mb-3">
                {flashcardSets.length > 1 ? (
                  <select
                    value={activeSetIndex}
                    onChange={e => {
                      setActiveSetIndex(Number(e.target.value));
                      setActiveFlashcardIndex(0);
                      setIsFlipped(false);
                    }}
                    className="text-[0.78rem] bg-canvas border border-line rounded-lg px-2 py-1 font-semibold max-w-[170px] truncate"
                  >
                    {flashcardSets.map((s, idx) => (
                      <option key={s.id} value={idx}>{s.title}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-[0.78rem] text-muted font-medium">
                    {currentSet ? currentSet.title : "Flashcards"}
                  </span>
                )}

                <button
                  onClick={() => setShowGenerateModal("flashcards")}
                  disabled={isGenerating !== null}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 text-[0.75rem] font-semibold transition disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGenerating === "flashcards" ? "animate-spin text-primary" : "text-amber-500"}`} />
                  <span>{isGenerating === "flashcards" ? "Generating…" : "Generate with Sarah"}</span>
                </button>
              </div>

              {currentCards.length > 0 ? (
                <div className="space-y-4">
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="min-h-[230px] bg-canvas border border-line rounded-2xl p-6 flex flex-col justify-between cursor-pointer select-none hover:border-primary/40 transition shadow-sm"
                  >
                    <div className="flex justify-between text-[0.7rem] text-primary font-semibold">
                      <span>Card {activeFlashcardIndex + 1} of {currentCards.length}</span>
                      <span className="text-muted">{isFlipped ? "Answer" : "Tap to flip"}</span>
                    </div>
                    <div className="my-auto text-center px-2">
                      <p className="text-[1.05rem] font-display font-semibold leading-relaxed">
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
                      className="flex-1 py-2.5 bg-[#F1F1F6] disabled:opacity-40 rounded-[10px] text-[0.8rem] font-display font-semibold hover:bg-[#E7E6EE] transition"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => { setIsFlipped(false); setActiveFlashcardIndex(p => (p + 1) % currentCards.length); }}
                      className="flex-1 py-2.5 bg-primary text-white rounded-[10px] text-[0.8rem] font-display font-semibold hover:bg-primary-600 transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted text-sm space-y-3">
                  <div className="text-3xl">🗂️</div>
                  <p className="font-semibold text-ink">No flashcards yet</p>
                  <p className="text-[0.78rem] text-muted max-w-xs mx-auto">
                    Sarah can generate grounded active-recall flashcards directly from your uploaded materials.
                  </p>
                  <button
                    onClick={() => handleGenerateFlashcards()}
                    disabled={isGenerating !== null}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-[0.8rem] font-semibold hover:bg-primary-600 transition disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Flashcards with Sarah</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "quizzes" && (
            <div className="py-1">
              <div className="flex items-center justify-between pb-3 border-b border-line mb-3">
                {quizzes.length > 1 ? (
                  <select
                    value={activeQuizIndex}
                    onChange={e => {
                      setActiveQuizIndex(Number(e.target.value));
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                    }}
                    className="text-[0.78rem] bg-canvas border border-line rounded-lg px-2 py-1 font-semibold max-w-[170px] truncate"
                  >
                    {quizzes.map((q, idx) => (
                      <option key={q.id} value={idx}>{q.title}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-[0.78rem] text-muted font-medium">
                    {activeQuiz ? activeQuiz.title : "Quizzes"}
                  </span>
                )}

                <button
                  onClick={() => setShowGenerateModal("quiz")}
                  disabled={isGenerating !== null}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 text-[0.75rem] font-semibold transition disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGenerating === "quiz" ? "animate-spin text-primary" : "text-amber-500"}`} />
                  <span>{isGenerating === "quiz" ? "Generating…" : "Generate with Sarah"}</span>
                </button>
              </div>

              {activeQuiz ? (
                <div className="space-y-5">
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
                            ? isCorrect ? "bg-emerald-50 border-emerald-500/50 text-emerald-900 font-medium"
                            : isSelected ? "bg-rose-50 border-rose-500/50 text-rose-900"
                            : "bg-canvas border-line text-muted"
                            : isSelected ? "bg-primary/10 border-primary text-ink" : "bg-canvas border-line text-ink hover:border-line/80";

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
                        <p className="text-[0.75rem] text-muted bg-canvas p-2.5 rounded-xl border border-line">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}

                  {!quizSubmitted ? (
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      className="w-full py-3 bg-primary text-white font-display font-semibold rounded-[10px] text-[0.85rem] hover:bg-primary-600 transition"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}
                      className="w-full py-2.5 bg-[#F1F1F6] text-ink text-[0.8rem] rounded-[10px] font-display font-semibold hover:bg-[#E7E6EE] transition"
                    >
                      Retake Quiz
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted text-sm space-y-3">
                  <div className="text-3xl">❓</div>
                  <p className="font-semibold text-ink">No quizzes generated yet</p>
                  <p className="text-[0.78rem] text-muted max-w-xs mx-auto">
                    Sarah can generate a conceptual diagnostic exam directly grounded in your resources.
                  </p>
                  <button
                    onClick={() => handleGenerateQuiz()}
                    disabled={isGenerating !== null}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-[0.8rem] font-semibold hover:bg-primary-600 transition disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Quiz with Sarah</span>
                  </button>
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

          {activeTab === "updates" && card.isShared && (
            <div className="py-2">
              <h3 className="font-display font-bold text-[0.95rem] mb-3">Recent Activity</h3>
              {events.length === 0 ? (
                <div className="text-center py-10 text-muted text-sm">No activity recorded yet.</div>
              ) : (
                <div className="space-y-3">
                  {events.map(ev => (
                    <div key={ev.id} className="p-3 bg-canvas border border-line rounded-xl text-[0.82rem]">
                      <div className="font-semibold">{ev.actorName || "Scholar"}</div>
                      <div className="text-muted mt-0.5">
                        {ev.type === "RESOURCE_UPLOADED" && `Uploaded "${ev.payload?.resourceTitle || "a resource"}"`}
                        {ev.type === "RESOURCE_ADDED" && `Added resource "${ev.payload?.title || ""}"`}
                        {ev.type === "STUDY_ARTIFACT_GENERATED" && `Generated a ${ev.payload?.artifactType || "study artifact"}`}
                        {ev.type === "SARAH_QUERY" && "Consulted Sarah Tutor"}
                      </div>
                      <div className="text-[0.68rem] text-muted/70 mt-1">
                        {new Date(ev.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "shareLink" && (
            <div className="py-4 space-y-4 text-center">
              <h3 className="font-display font-bold text-[1.1rem]">Course Space Invite Link</h3>
              <p className="text-[0.82rem] text-muted max-w-xs mx-auto leading-relaxed">
                Anyone with this link can join this collaborative Course Space to share resources and take study drills together.
              </p>
              <div className="p-3 bg-canvas border border-line rounded-xl flex items-center justify-between gap-2">
                <input
                  readOnly
                  value={`${window.location.origin}/join/${card.shareToken || card.id}`}
                  className="bg-transparent text-[0.8rem] w-full text-muted truncate outline-none"
                />
                <button
                  onClick={handleCopyShareLink}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-[0.75rem] font-semibold shrink-0"
                >
                  {copiedLink ? "Copied!" : "Copy"}
                </button>
              </div>
              <button
                onClick={handleGenerateLink}
                className="text-[0.78rem] text-primary font-semibold hover:underline"
              >
                Regenerate invite token
              </button>
            </div>
          )}
        </div>

        {/* Floating Sarah Tutor button */}
        {!showSarah && (
          <button
            onClick={() => setShowSarah(true)}
            className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500 text-ink font-display font-bold text-[0.85rem] shadow-lg hover:bg-amber-400 transition transform hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-amber-900" />
            <span>Ask Sarah</span>
          </button>
        )}

        {/* Sarah Tutor Drawer */}
        {showSarah && (
          <div className="absolute inset-0 z-30 flex flex-col bg-surface">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-canvas">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-xs">
                  ✨
                </span>
                <div>
                  <div className="font-display font-bold text-[0.95rem] leading-none">Sarah Tutor</div>
                  <div className="text-[0.7rem] text-muted mt-0.5">Grounded in {card.name}</div>
                </div>
              </div>
              <button onClick={() => setShowSarah(false)} className="p-1 rounded-full text-muted hover:bg-canvas">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notice */}
            <div className="px-4 py-2 bg-amber-50 text-amber-900 border-b border-amber-200 text-[0.72rem] leading-snug">
              🔒 <strong>Academic Zero-Trust Grounding:</strong> Sarah references only the resources in this workspace.
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {sarahMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-[0.82rem] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-br-none"
                        : "bg-canvas border border-line text-ink rounded-bl-none whitespace-pre-wrap"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[0.65rem] text-muted mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
              {isSarahThinking && (
                <div className="flex items-center gap-2 text-muted text-xs p-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span>Sarah is analyzing course resources…</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-line bg-surface">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question about your materials…"
                  value={sarahInput}
                  onChange={e => setSarahInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendSarah()}
                  className="flex-1 px-3.5 py-2.5 rounded-full border border-line bg-canvas text-[0.85rem] outline-none focus:border-primary"
                />
                <button
                  onClick={handleSendSarah}
                  disabled={!sarahInput.trim() || isSarahThinking}
                  className="w-10 h-10 rounded-full bg-amber-500 text-ink flex items-center justify-center disabled:opacity-40 hover:bg-amber-400 transition shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Note Modal */}
        {showNoteModal && (
          <div
            className="absolute inset-0 z-40 flex items-end bg-black/40 backdrop-blur-xs"
            onClick={e => { if (e.target === e.currentTarget) setShowNoteModal(false); }}
          >
            <div className="bg-surface w-full rounded-t-[24px] p-5 pb-7 relative border-t border-line shadow-2xl">
              <button onClick={() => setShowNoteModal(false)} className="absolute top-4 right-4 text-muted p-1 hover:text-ink">
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-display font-bold text-[1.05rem] mb-3">Add Study Note</h3>
              <input
                placeholder="Note Title (e.g. Lecture 4 Key Takeaways)"
                value={noteTitle}
                onChange={e => setNoteTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line text-[0.88rem] mb-3 bg-canvas outline-none focus:border-primary"
              />
              <textarea
                placeholder="Write your study notes, formulas, or concepts here…"
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                rows={5}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line text-[0.82rem] mb-3 bg-canvas outline-none focus:border-primary leading-relaxed"
              />
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-[0.78rem] text-muted font-medium">Share with Course Space</span>
                <input
                  type="checkbox"
                  checked={noteIsShared}
                  onChange={e => setNoteIsShared(e.target.checked)}
                  className="w-4 h-4 rounded text-primary"
                />
              </div>
              <button
                onClick={handleSaveNote}
                disabled={!noteTitle.trim() || savingNote}
                className="w-full py-2.5 bg-primary text-white rounded-xl font-display font-semibold text-[0.85rem] disabled:opacity-50 hover:bg-primary-600 transition"
              >
                {savingNote ? "Saving…" : "Save Note"}
              </button>
            </div>
          </div>
        )}

        {/* Generate Flashcards / Quiz with Sarah Prompt Modal */}
        {showGenerateModal && (
          <div
            className="absolute inset-0 z-40 flex items-end bg-black/40 backdrop-blur-xs"
            onClick={e => { if (e.target === e.currentTarget) setShowGenerateModal(null); }}
          >
            <div className="bg-surface w-full rounded-t-[24px] p-5 pb-7 relative border-t border-line shadow-2xl">
              <button onClick={() => setShowGenerateModal(null)} className="absolute top-4 right-4 text-muted p-1 hover:text-ink">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-500 text-lg">✨</span>
                <h3 className="font-display font-bold text-[1.05rem]">
                  Generate {showGenerateModal === "flashcards" ? "Flashcards" : "Quiz"} with Sarah
                </h3>
              </div>
              <p className="text-[0.78rem] text-muted mb-3.5 leading-relaxed">
                Sarah will synthesize your workspace resources. You can enter an optional focus topic or leave blank for a comprehensive study set.
              </p>
              <input
                placeholder="Optional focus topic (e.g. Mitochondrial gradient, Eigenvalues)"
                value={generateTopic}
                onChange={e => setGenerateTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line text-[0.85rem] mb-4 bg-canvas outline-none focus:border-primary"
              />
              <button
                onClick={() => showGenerateModal === "flashcards" ? handleGenerateFlashcards() : handleGenerateQuiz()}
                disabled={isGenerating !== null}
                className="w-full py-2.5 bg-primary text-white rounded-xl font-display font-semibold text-[0.85rem] flex items-center justify-center gap-2 hover:bg-primary-600 transition disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sarah is synthesizing…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Upload Resource sheet */}
        {showUploadModal && (
          <div
            className="absolute inset-0 z-40 flex items-end bg-black/40 backdrop-blur-xs"
            onClick={e => { if (e.target === e.currentTarget) setShowUploadModal(false); }}
          >
            <div className="bg-surface w-full rounded-t-[24px] p-5 pb-7 relative border-t border-line shadow-2xl">
              <button onClick={() => setShowUploadModal(false)} className="absolute top-4 right-4 text-muted p-1 hover:text-ink">
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-display font-bold text-[1.05rem] mb-3">Add Resource</h3>
              <div className="mb-3.5">
                <label className="text-[0.75rem] font-semibold text-muted mb-1.5 block">Format</label>
                <div className="flex gap-1.5 flex-wrap">
                  {(["pdf", "docx", "pptx", "xlsx", "csv", "txt", "image"] as SupportedFileType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setUploadFileType(type)}
                      className={`px-2.5 py-1 rounded-full text-[0.68rem] font-semibold uppercase transition ${
                        uploadFileType === type ? "bg-ink text-white" : "bg-[#F1F1F6] text-muted hover:text-ink"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <input
                placeholder="Title (e.g. Lecture 5 Notes.pdf)"
                value={uploadTitle}
                onChange={e => setUploadTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line text-[0.88rem] mb-3 bg-canvas outline-none focus:border-primary"
              />
              <input
                type="file"
                onChange={e => {
                  const f = e.target.files?.[0] || null;
                  setUploadFile(f);
                  if (f && !uploadTitle) setUploadTitle(f.name);
                }}
                className="w-full text-[0.78rem] text-muted mb-2 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              <div className="text-center text-[0.72rem] text-muted my-2">— or paste text directly —</div>
              <textarea
                placeholder="Paste extracted text or lecture notes for Sarah to tutor on…"
                value={uploadText}
                onChange={e => setUploadText(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line text-[0.82rem] mb-3.5 bg-canvas outline-none focus:border-primary leading-relaxed"
              />
              <button
                onClick={handleAddResource}
                disabled={!uploadTitle.trim()}
                className="w-full py-2.5 bg-primary text-white rounded-xl font-display font-semibold text-[0.85rem] disabled:opacity-50 hover:bg-primary-600 transition"
              >
                Upload Resource
              </button>
            </div>
          </div>
        )}

        {/* Full Reader Modal */}
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
