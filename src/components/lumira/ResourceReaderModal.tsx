import React, { useState } from "react";
import { 
  X, Sparkles, BookOpen, ChevronLeft, ChevronRight, 
  Highlighter, Search, FileText, Send, Share2, ZoomIn, ZoomOut, Check
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [selectionLocation, setSelectionLocation] = useState("");
  const [highlights, setHighlights] = useState<Array<{ text: string; location: string }>>([]);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Sarah sidebar inside the reader
  const [sarahOpen, setSarahOpen] = useState(true);
  const [sarahQuestion, setSarahQuestion] = useState("");
  const [sarahChat, setSarahChat] = useState<Array<{ role: "user" | "sarah"; text: string; citation?: string }>>([
    {
      role: "sarah",
      text: `Hello! I'm Sarah, grounded in **${resource.title}**. Select any sentence or passage in the reader to ask me for Socratic breakdown, exam questions, or mechanism clarifications!`
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

  const handleAskSarahSelection = async (promptOverride?: string) => {
    const question = promptOverride || sarahQuestion || `Can you explain this passage from ${selectionLocation}: "${selectedText}"?`;
    if (!question.trim()) return;

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
      case "pdf": return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "docx": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "pptx": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "xlsx": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "csv": return "bg-teal-500/20 text-teal-300 border-teal-500/30";
      case "image": return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default: return "bg-[#E7E6EE] text-ink border-line";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas text-ink dark:bg-canvas dark:text-ink">
      
      {/* Top Application Bar (Full Page Reader - Real Production App) */}
      <header className="h-14 border-b border-line bg-white/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-[#F1F1F6] hover:bg-[#E7E6EE] text-ink hover:text-white transition"
            title="Back to Workspace"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getFormatBadge(resource.fileType)}`}>
              {resource.fileType}
            </span>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight line-clamp-1">{resource.title}</h2>
              <p className="text-[11px] text-muted font-mono">
                {cardName} • {activeChunk.location} ({currentPage} of {totalPages})
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar & Page Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#F1F1F6]/80 rounded-lg p-1 border border-line/60">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-[#E7E6EE] disabled:opacity-30 text-ink"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 font-mono text-ink">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded hover:bg-[#E7E6EE] disabled:opacity-30 text-ink"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-[#F1F1F6]/80 rounded-lg p-1 border border-line/60 text-xs">
            <button 
              onClick={() => setZoomLevel(z => Math.max(80, z - 10))} 
              className="p-1 hover:bg-[#E7E6EE] rounded text-muted hover:text-ink"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-ink w-12 text-center">{zoomLevel}%</span>
            <button 
              onClick={() => setZoomLevel(z => Math.min(150, z + 10))} 
              className="p-1 hover:bg-[#E7E6EE] rounded text-muted hover:text-ink"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setSarahOpen(!sarahOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              sarahOpen 
                ? "bg-primary border-primary text-white shadow-lg shadow-primary/30" 
                : "bg-[#F1F1F6] border-line text-ink hover:bg-[#E7E6EE]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Sarah AI Copilot</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#F1F1F6] hover:bg-[#E7E6EE] text-muted hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Document Reader & Sarah Split View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Document Viewer Pane */}
        <div 
          className="flex-1 overflow-y-auto p-6 md:p-12 flex justify-center bg-white/40"
          onMouseUp={handleTextSelection}
        >
          <div 
            style={{ zoom: `${zoomLevel}%` }}
            className="w-full max-w-4xl bg-white border border-line rounded-2xl p-8 md:p-12 shadow-2xl space-y-6 relative transition-all"
          >
            {/* Header info in reader */}
            <div className="border-b border-line pb-4 flex justify-between items-center text-xs text-muted">
              <span className="font-mono font-medium">{activeChunk.location}</span>
              <span className="px-2 py-0.5 rounded bg-[#F1F1F6] font-mono">STATUS: {resource.status}</span>
            </div>

            {/* Selection Tool floating action if text is highlighted */}
            {selectedText && (
              <div className="sticky top-2 z-30 p-2.5 bg-primary-50/90 border border-primary/50 rounded-xl shadow-xl flex items-center justify-between gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                <div className="text-xs text-primary line-clamp-1 italic max-w-md">
                  Selected: "{selectedText}"
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleHighlight}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#F1F1F6] hover:bg-[#E7E6EE] text-xs rounded-lg text-ink"
                  >
                    <Highlighter className="w-3 h-3 text-amber-400" />
                    Highlight
                  </button>
                  <button
                    onClick={() => {
                      setSarahOpen(true);
                      handleAskSarahSelection();
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-primary hover:bg-primary text-xs font-semibold rounded-lg text-white shadow-md shadow-primary/30"
                  >
                    <Sparkles className="w-3 h-3" />
                    Ask Sarah
                  </button>
                </div>
              </div>
            )}

            {/* Render formatted content with chunk citation support */}
            <div className="prose prose-invert max-w-none text-ink text-base leading-relaxed select-text space-y-4 font-serif">
              {activeChunk.content.split("\n\n").map((para, i) => (
                <p key={i} className="cursor-text hover:bg-primary-50/10 rounded px-1 transition-colors">
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
                    <div key={i} className="text-xs p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-200 flex justify-between items-center">
                      <span>"{h.text}"</span>
                      <span className="text-[10px] text-amber-400/70 font-mono">{h.location}</span>
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
                className="px-4 py-2 bg-[#F1F1F6] hover:bg-[#E7E6EE] disabled:opacity-30 rounded-lg text-ink font-semibold"
              >
                Previous Page
              </button>
              <span className="font-mono">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 bg-primary hover:bg-primary disabled:opacity-30 rounded-lg text-white font-semibold"
              >
                Next Page
              </button>
            </div>
          </div>
        </div>

        {/* Right Dock: Sarah AI Assistant grounded in this specific resource */}
        {sarahOpen && (
          <aside className="w-96 border-l border-line bg-white flex flex-col shrink-0 animate-in slide-in-from-right duration-200 shadow-2xl">
            <div className="p-4 border-b border-line flex items-center justify-between bg-[#F1F1F6]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/30 border border-primary/40 flex items-center justify-center text-primary">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Sarah AI Tutor
                  </h3>
                  <p className="text-[10px] text-primary font-mono line-clamp-1">
                    Context: {resource.title}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSarahOpen(false)}
                className="p-1 rounded text-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {sarahChat.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  {msg.citation && (
                    <span className="text-[10px] text-primary font-mono mb-1 bg-primary-50 px-2 py-0.5 rounded border border-primary/60">
                      📍 {msg.citation}
                    </span>
                  )}
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[90%] ${
                    msg.role === "user" 
                      ? "bg-primary text-white rounded-br-none" 
                      : "bg-[#F1F1F6] text-ink border border-line/60 rounded-bl-none shadow-md"
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
            <div className="p-2 border-t border-line/80 bg-white/50 flex flex-wrap gap-1">
              {[
                "Summarize this page",
                "Generate 3 exam questions",
                "Explain core mechanism",
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleAskSarahSelection(suggestion)}
                  className="text-[10px] px-2 py-1 rounded bg-[#F1F1F6] hover:bg-[#E7E6EE] text-ink border border-line/50"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-line bg-canvas flex gap-2">
              <input
                type="text"
                value={sarahQuestion}
                onChange={e => setSarahQuestion(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAskSarahSelection()}
                placeholder={selectedText ? "Ask about selected text..." : "Ask Sarah about this document..."}
                className="flex-1 bg-white border border-line rounded-lg px-3 py-2 text-xs text-ink placeholder-muted focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => handleAskSarahSelection()}
                disabled={!sarahQuestion.trim() && !selectedText}
                className="px-3 py-2 bg-primary hover:bg-primary disabled:opacity-40 text-white rounded-lg text-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>
        )}

      </div>

    </div>
  );
};
