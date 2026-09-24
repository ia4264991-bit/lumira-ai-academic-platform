import React, { useState } from "react";
import { 
  X, Sparkles, ChevronLeft, ChevronRight, 
  Highlighter, ZoomIn, ZoomOut, Check,
  Download, CheckCircle2, MessageSquare, Send
} from "lucide-react";
import { Resource, ResourceChunk } from "../../types/lumira";
import { LumiraAPI } from "../../services/api";

interface ResourceReaderModalProps {
  resource: Resource;
  cardName: string;
  onClose: () => void;
  onGroundSarah: (passage: string, location: string) => void;
}

export const ResourceReaderModal: React.FC<ResourceReaderModalProps> = ({
  resource,
  cardName,
  onClose,
  onGroundSarah,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedText, setSelectedText] = useState("");
  const [selectionLocation, setSelectionLocation] = useState("");
  const [highlights, setHighlights] = useState<Array<{ text: string; location: string }>>([]);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Sarah sidebar inside the reader - default closed so reading page is 100% visible and unobstructed
  const [sarahOpen, setSarahOpen] = useState(false);
  const [sarahQuestion, setSarahQuestion] = useState("");
  const [sarahChat, setSarahChat] = useState<Array<{ role: "user" | "sarah"; text: string; citation?: string }>>([
    {
      role: "sarah",
      text: `Hello! I'm Sarah, grounded in **${resource.title}**. Select any sentence or passage in the reader to ask me for Socratic breakdown, key definitions, or exam questions!`
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  // Extract structured chunks or generate pages if not present
  const chunks: ResourceChunk[] = resource.chunks && resource.chunks.length > 0 
    ? resource.chunks 
    : [
        {
          id: "chk-1",
          location: "Page 1 - Section 1",
          pageNumber: 1,
          content: resource.extractedText || "No content extracted yet."
        }
      ];

  const totalPages = Math.max(1, chunks.length);
  const activeChunk = chunks[currentPage - 1] || chunks[0];

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 3) {
      setSelectedText(selection.toString().trim());
      setSelectionLocation(activeChunk.location);
    }
  };

  const handleHighlight = () => {
    if (!selectedText) return;
    setHighlights(prev => [...prev, { text: selectedText, location: selectionLocation }]);
  };

  const handleDownloadToDevice = () => {
    const fullText = chunks && chunks.length > 0
      ? chunks.map(c => `=== ${c.location} ===\n\n${c.content}`).join("\n\n\n")
      : (resource.extractedText || "No content extracted.");
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resource.title.replace(/\.[^/.]+$/, "")}_offline_material.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2200);
  };

  const handleAskSarahSelection = async (promptOverride?: string) => {
    const question = promptOverride || sarahQuestion || `Can you explain this passage from ${selectionLocation}: "${selectedText}"?`;
    if (!question.trim()) return;

    setSarahOpen(true);
    setSarahChat(prev => [
      ...prev, 
      { 
        role: "user", 
        text: question, 
        citation: selectedText ? `${selectionLocation}: "${selectedText.slice(0, 60)}..."` : undefined 
      }
    ]);
    setSarahQuestion("");
    setIsThinking(true);

    try {
      const response = await LumiraAPI.askSarah({
        cardId: resource.owningCardId || "default",
        question,
        resourceTitle: resource.title,
        selectedText: selectedText || undefined
      });

      setSarahChat(prev => [
        ...prev, 
        { 
          role: "sarah", 
          text: response,
          citation: activeChunk.location
        }
      ]);
    } catch (err: any) {
      setSarahChat(prev => [...prev, { role: "sarah", text: "⚠️ Unable to query Sarah right now." }]);
    } finally {
      setIsThinking(false);
    }
  };

  const getFormatBadge = (type: string) => {
    switch (type) {
      case "pdf": return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "docx": return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "pptx": return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "xlsx": return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "csv": return "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30";
      case "image": return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";
      default: return "bg-surface-elevated text-ink border-line";
    }
  };

  const renderSarahContent = () => (
    <>
      <div className="p-3.5 border-b border-line flex items-center justify-between bg-surface-elevated shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-ink flex items-center gap-1.5">
              Sarah AI Tutor
            </h3>
            <p className="text-[10px] text-muted font-mono truncate">
              Context: {resource.title}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setSarahOpen(false)}
          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-line/50 transition-colors"
          title="Close Sarah"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Conversation Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sarahChat.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            {msg.citation && (
              <span className="text-[10px] text-primary font-mono mb-1 bg-primary-50 dark:bg-primary-900/40 px-2 py-0.5 rounded border border-primary/40">
                📍 {msg.citation}
              </span>
            )}
            <div className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[90%] ${
              msg.role === "user" 
                ? "bg-primary text-white rounded-br-none" 
                : "bg-surface-elevated text-ink border border-line rounded-bl-none shadow-sm"
            }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex items-center gap-2 text-xs text-primary italic">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            Sarah is analyzing passage & citations...
          </div>
        )}
      </div>

      {/* Quick Socratic Prompts */}
      <div className="p-2 border-t border-line bg-surface-elevated/50 flex flex-wrap gap-1 shrink-0">
        {[
          "Summarize this page",
          "Generate 3 exam questions",
          "Explain core mechanism",
        ].map((suggestion, i) => (
          <button
            key={i}
            onClick={() => handleAskSarahSelection(suggestion)}
            className="text-[10px] px-2 py-1 rounded bg-surface hover:bg-line text-ink border border-line transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-line bg-surface flex gap-2 shrink-0">
        <input
          type="text"
          value={sarahQuestion}
          onChange={e => setSarahQuestion(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAskSarahSelection()}
          placeholder={selectedText ? "Ask about selected text..." : "Ask Sarah about this document..."}
          className="flex-1 bg-surface-elevated border border-line rounded-lg px-3 py-2 text-xs text-ink placeholder-muted focus:outline-none focus:border-primary"
        />
        <button
          onClick={() => handleAskSarahSelection()}
          disabled={!sarahQuestion.trim() && !selectedText}
          className="px-3 py-2 bg-primary hover:bg-primary-hover disabled:opacity-40 text-white rounded-lg text-xs transition-colors shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas text-ink animate-in fade-in duration-150">
      
      {/* Top Application Bar */}
      <header className="h-14 border-b border-line bg-surface/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button 
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg bg-surface-elevated hover:bg-line text-ink transition shrink-0"
            title="Back to Workspace"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${getFormatBadge(resource.fileType)}`}>
              {resource.fileType}
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-ink tracking-tight truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                {resource.title}
              </h2>
              <p className="text-[11px] text-muted font-mono truncate">
                {cardName} • {activeChunk.location} ({currentPage} of {totalPages})
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Page Navigator */}
          <div className="flex items-center gap-1 bg-surface-elevated rounded-lg p-0.5 sm:p-1 border border-line">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-line disabled:opacity-30 text-ink transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs px-1.5 sm:px-2 font-mono text-ink">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded hover:bg-line disabled:opacity-30 text-ink transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="hidden lg:flex items-center gap-1 bg-surface-elevated rounded-lg p-1 border border-line text-xs">
            <button 
              onClick={() => setZoomLevel(z => Math.max(80, z - 10))} 
              className="p-1 hover:bg-line rounded text-muted hover:text-ink transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-ink w-10 text-center">{zoomLevel}%</span>
            <button 
              onClick={() => setZoomLevel(z => Math.min(150, z + 10))} 
              className="p-1 hover:bg-line rounded text-muted hover:text-ink transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download to Device */}
          <button
            onClick={handleDownloadToDevice}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-medium ${
              downloadSuccess 
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" 
                : "bg-surface-elevated hover:bg-line border-line text-ink"
            }`}
            title="Download file to device for offline access"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Downloaded</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">Download</span>
              </>
            )}
          </button>

          {/* Sarah Copilot Toggle */}
          <button
            onClick={() => setSarahOpen(!sarahOpen)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              sarahOpen 
                ? "bg-primary border-primary text-white shadow-md shadow-primary/20" 
                : "bg-surface-elevated hover:bg-line border-line text-ink"
            }`}
            title={sarahOpen ? "Close Sarah AI panel" : "Ask Sarah AI Copilot"}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{sarahOpen ? "Close Sarah" : "Sarah AI"}</span>
            <span className="sm:hidden">{sarahOpen ? "Close" : "AI"}</span>
          </button>

          {/* Close Reader */}
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg bg-surface-elevated hover:bg-line text-ink transition-colors"
            title="Close reader"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Document Reader & Sarah Container */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Document Viewer Pane - Takes 100% of reader space when Sarah is closed, perfectly readable */}
        <div 
          className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 md:p-10 flex justify-center bg-canvas"
          onMouseUp={handleTextSelection}
        >
          <div 
            style={{ zoom: `${zoomLevel}%` }}
            className="w-full max-w-4xl bg-surface border border-line rounded-2xl p-6 sm:p-8 md:p-12 shadow-xl space-y-6 relative transition-all my-auto"
          >
            {/* Header info inside document card */}
            <div className="border-b border-line pb-4 flex justify-between items-center text-xs text-muted">
              <span className="font-mono font-medium">{activeChunk.location}</span>
              <div className="flex items-center gap-2">
                {downloadSuccess && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Offline Ready
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-surface-elevated font-mono">STATUS: {resource.status}</span>
              </div>
            </div>

            {/* Selection Tool floating action if text is highlighted */}
            {selectedText && (
              <div className="sticky top-2 z-30 p-2.5 bg-surface-elevated/95 border border-primary/40 rounded-xl shadow-xl flex items-center justify-between gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                <div className="text-xs text-primary line-clamp-1 italic max-w-md">
                  Selected: "{selectedText}"
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleHighlight}
                    className="flex items-center gap-1 px-2.5 py-1 bg-surface hover:bg-line text-xs rounded-lg text-ink border border-line"
                  >
                    <Highlighter className="w-3 h-3 text-amber-500" />
                    Highlight
                  </button>
                  <button
                    onClick={() => {
                      setSarahOpen(true);
                      handleAskSarahSelection();
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-primary hover:bg-primary-hover text-xs font-semibold rounded-lg text-white shadow-md shadow-primary/20"
                  >
                    <Sparkles className="w-3 h-3" />
                    Ask Sarah
                  </button>
                </div>
              </div>
            )}

            {/* Render formatted content with chunk citation support */}
            <div className="prose dark:prose-invert max-w-none text-ink text-base leading-relaxed select-text space-y-4 font-serif">
              {activeChunk.content.split("\n\n").map((para, i) => (
                <p key={i} className="cursor-text hover:bg-primary/5 rounded px-1 transition-colors">
                  {para}
                </p>
              ))}
            </div>

            {/* Active Highlights on this chunk */}
            {highlights.length > 0 && (
              <div className="mt-8 pt-4 border-t border-line space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Highlights on this document</h4>
                <div className="space-y-1">
                  {highlights.map((h, i) => (
                    <div key={i} className="text-xs p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex justify-between items-center">
                      <span>"{h.text}"</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">{h.location}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Page Navigation Footer */}
            <div className="border-t border-line pt-6 flex justify-between items-center text-xs text-muted">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage <= 1}
                className="px-3.5 py-2 bg-surface-elevated hover:bg-line disabled:opacity-30 rounded-lg text-ink font-semibold transition-colors"
              >
                Previous Page
              </button>
              <span className="font-mono">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="px-3.5 py-2 bg-primary hover:bg-primary-hover disabled:opacity-30 rounded-lg text-white font-semibold transition-colors"
              >
                Next Page
              </button>
            </div>
          </div>
        </div>

        {/* Floating "Ask Sarah" shortcut in bottom corner when Sarah is closed */}
        {!sarahOpen && (
          <button
            onClick={() => setSarahOpen(true)}
            className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white font-medium text-xs shadow-xl shadow-primary/25 border border-white/20 transition-all hover:scale-105 active:scale-95"
            title="Open Sarah AI Copilot"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Ask Sarah</span>
          </button>
        )}

        {/* Desktop Sarah Dock: When open on md/lg screens, cleanly docks without crushing the reader */}
        {sarahOpen && (
          <aside className="hidden md:flex w-80 lg:w-96 border-l border-line bg-surface flex-col shrink-0 animate-in slide-in-from-right duration-200 shadow-xl z-20">
            {renderSarahContent()}
          </aside>
        )}

        {/* Mobile Sarah Slide-Over: Never obscures reader permanently on small screens */}
        {sarahOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex justify-end">
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
              onClick={() => setSarahOpen(false)}
            />
            <aside className="relative z-10 w-full sm:w-[380px] h-full bg-surface border-l border-line flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
              {renderSarahContent()}
            </aside>
          </div>
        )}

      </div>

    </div>
  );
};
