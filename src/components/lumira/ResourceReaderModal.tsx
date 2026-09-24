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
      default: return "bg-slate-700 text-slate-300 border-slate-600";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100">
      
      {/* Top Application Bar (Full Page Reader - Real Production App) */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
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
              <p className="text-[11px] text-slate-400 font-mono">
                {cardName} • {activeChunk.location} ({currentPage} of {totalPages})
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar & Page Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-1 border border-slate-700/60">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 font-mono text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-slate-800/80 rounded-lg p-1 border border-slate-700/60 text-xs">
            <button 
              onClick={() => setZoomLevel(z => Math.max(80, z - 10))} 
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-slate-300 w-12 text-center">{zoomLevel}%</span>
            <button 
              onClick={() => setZoomLevel(z => Math.min(150, z + 10))} 
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setSarahOpen(!sarahOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              sarahOpen 
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30" 
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Sarah AI Copilot</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Document Reader & Sarah Split View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Document Viewer Pane */}
        <div 
          className="flex-1 overflow-y-auto p-6 md:p-12 flex justify-center bg-slate-900/40"
          onMouseUp={handleTextSelection}
        >
          <div 
            style={{ zoom: `${zoomLevel}%` }}
            className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12 shadow-2xl space-y-6 relative transition-all"
          >
            {/* Header info in reader */}
            <div className="border-b border-slate-800 pb-4 flex justify-between items-center text-xs text-slate-400">
              <span className="font-mono font-medium">{activeChunk.location}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 font-mono">STATUS: {resource.status}</span>
            </div>

            {/* Selection Tool floating action if text is highlighted */}
            {selectedText && (
              <div className="sticky top-2 z-30 p-2.5 bg-indigo-950/90 border border-indigo-500/50 rounded-xl shadow-xl flex items-center justify-between gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                <div className="text-xs text-indigo-200 line-clamp-1 italic max-w-md">
                  Selected: "{selectedText}"
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleHighlight}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-200"
                  >
                    <Highlighter className="w-3 h-3 text-amber-400" />
                    Highlight
                  </button>
                  <button
                    onClick={() => {
                      setSarahOpen(true);
                      handleAskSarahSelection();
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg text-white shadow-md shadow-indigo-600/30"
                  >
                    <Sparkles className="w-3 h-3" />
                    Ask Sarah
                  </button>
                </div>
              </div>
            )}

            {/* Render formatted content with chunk citation support */}
            <div className="prose prose-invert max-w-none text-slate-200 text-base leading-relaxed select-text space-y-4 font-serif">
              {activeChunk.content.split("\n\n").map((para, i) => (
                <p key={i} className="cursor-text hover:bg-indigo-950/10 rounded px-1 transition-colors">
                  {para}
                </p>
              ))}
            </div>

            {/* Active Highlights on this chunk */}
            {highlights.length > 0 && (
              <div className="mt-8 pt-4 border-t border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Highlights on this document</h4>
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
            <div className="border-t border-slate-800 pt-6 flex justify-between items-center text-xs text-slate-500">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage <= 1}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 font-semibold"
              >
                Previous Page
              </button>
              <span className="font-mono">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 rounded-lg text-white font-semibold"
              >
                Next Page
              </button>
            </div>
          </div>
        </div>

        {/* Right Dock: Sarah AI Assistant grounded in this specific resource */}
        {sarahOpen && (
          <aside className="w-96 border-l border-slate-800 bg-slate-900 flex flex-col shrink-0 animate-in slide-in-from-right duration-200 shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Sarah AI Tutor
                  </h3>
                  <p className="text-[10px] text-indigo-300 font-mono line-clamp-1">
                    Context: {resource.title}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSarahOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {sarahChat.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  {msg.citation && (
                    <span className="text-[10px] text-indigo-300 font-mono mb-1 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/60">
                      📍 {msg.citation}
                    </span>
                  )}
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[90%] ${
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white rounded-br-none" 
                      : "bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none shadow-md"
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 italic">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  Sarah is analyzing passage & citations...
                </div>
              )}
            </div>

            {/* Quick Socratic Prompts */}
            <div className="p-2 border-t border-slate-800/80 bg-slate-900/50 flex flex-wrap gap-1">
              {[
                "Summarize this page",
                "Generate 3 exam questions",
                "Explain core mechanism",
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleAskSarahSelection(suggestion)}
                  className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
              <input
                type="text"
                value={sarahQuestion}
                onChange={e => setSarahQuestion(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAskSarahSelection()}
                placeholder={selectedText ? "Ask about selected text..." : "Ask Sarah about this document..."}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleAskSarahSelection()}
                disabled={!sarahQuestion.trim() && !selectedText}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs"
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
