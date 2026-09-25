import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  PenTool, 
  Sparkles, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  Search, 
  PlusCircle, 
  CloudLightning,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QuickNote {
  id: string;
  topic: string;
  subject: string;
  content: string;
  date: string;
}

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Eye-safe sound effect player helper
function playAcousticTone(freq: number, type: "sine" | "triangle" = "sine", duration: number = 0.15) {
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (_) {}
}

const CATEGORIES = [
  "General",
  "Polity & Governance",
  "History & Culture",
  "Economy",
  "Geography & Environment",
  "Ethics & Integrity",
  "Current Affairs",
  "Sci-Tech",
  "International Relations"
];

export function QuickNoteModal({ isOpen, onClose }: QuickNoteModalProps) {
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("General");
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [promotedId, setPromotedId] = useState<string | null>(null);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);

  // Load transient quick notes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("upsc_quick_notes");
      if (saved) {
        setNotes(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load quick notes", e);
    }
  }, [isOpen]);

  // Focus textarea when open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        contentInputRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  // Save transient notes helper
  const saveNotesToStorage = (updatedList: QuickNote[]) => {
    setNotes(updatedList);
    localStorage.setItem("upsc_quick_notes", JSON.stringify(updatedList));
  };

  // Add a new transient thought
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newNote: QuickNote = {
      id: "quick_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      topic: topic.trim() || `Incremental Scribble #${notes.length + 1}`,
      subject,
      content: content.trim(),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
    };

    const nextNotes = [newNote, ...notes];
    saveNotesToStorage(nextNotes);

    // Reset fields
    setTopic("");
    setContent("");
    
    // Play sweet ascending dual tone
    playAcousticTone(440, "sine", 0.08);
    setTimeout(() => playAcousticTone(659.25, "sine", 0.12), 65);
  };

  // Trash visual helper
  const handleDeleteNote = (id: string) => {
    const nextNotes = notes.filter(n => n.id !== id);
    saveNotesToStorage(nextNotes);
    playAcousticTone(220, "triangle", 0.18);
  };

  // Copy to clipboard
  const handleCopyToClipboard = (note: QuickNote) => {
    const fullText = `[${note.subject}] ${note.topic}\n---\n${note.content}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedId(note.id);
      playAcousticTone(523.25, "sine", 0.08);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  // Integrate and promote the quick note directly into main atlas study notes storage!
  const handlePromoteToMainNotes = (note: QuickNote) => {
    try {
      // 1. Get existing main atlas saved notes
      const savedStr = localStorage.getItem("upsc_saved_notes") || "[]";
      const savedNotes = JSON.parse(savedStr);

      // 2. Map QuickNote structure to SavedNote format
      const mainNoteFormat = {
        id: "note_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        topic: note.topic,
        subject: note.subject,
        content: `### Scribbled Idea\n\n> *This note was originally jotted as a transient thought via the Quick Note Scratchpad.*\n\n${note.content}`,
        date: new Date().toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }),
        folderPath: [note.subject, "Quick Scratchpad"],
        status: "new"
      };

      // 3. Append and save to standard notes
      const nextMainNotes = [mainNoteFormat, ...savedNotes];
      localStorage.setItem("upsc_saved_notes", JSON.stringify(nextMainNotes));

      // 4. Trigger state update for active main notes if currently viewed in app
      window.dispatchEvent(new Event("storage"));

      // 5. Remove from transient list to clean slate, or mark as promoted
      setPromotedId(note.id);
      playAcousticTone(523.25, "sine", 0.05);
      setTimeout(() => playAcousticTone(659.25, "sine", 0.08), 50);
      setTimeout(() => playAcousticTone(783.99, "sine", 0.15), 100);

      setTimeout(() => {
        const nextNotes = notes.filter(n => n.id !== note.id);
        saveNotesToStorage(nextNotes);
        setPromotedId(null);
      }, 1500);

    } catch (e) {
      console.error("Could not promote note to main list", e);
    }
  };

  // Close on Escape keyboard click
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filter notes based on quick search
  const filteredNotes = notes.filter(note => {
    const q = searchQuery.toLowerCase();
    return (
      note.topic.toLowerCase().includes(q) ||
      note.subject.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q)
    );
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Transparent dynamic overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="w-full max-w-4xl h-[80vh] bg-panel border border-panel-border rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-4 md:p-5 border-b border-panel-border/60 bg-panel-header/25 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-accent/10 border border-accent/25 rounded-xl text-accent">
                  <PenTool className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-main uppercase tracking-widest flex items-center gap-1.5">
                    Transient Thought Scratchpad
                    <span className="text-[9px] bg-accent/15 text-accent border border-accent/20 px-1.5 py-0.5 rounded-full font-sans tracking-tight">Active Canvas</span>
                  </h3>
                  <p className="text-[10px] text-muted font-bold mt-0.5">
                    Jot down quick ideas, quotes, syllabus reminders, or transient facts instantly.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-input rounded-xl text-muted hover:text-main transition-colors"
                title="Minimize scratchpad"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Screen Layout (Left: Jottings entry form, Right: Transient records repository) */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-panel-bg/25">
              
              {/* LEFT COLUMN: Input Form */}
              <div className="w-full md:w-[45%] p-4 md:p-5 border-b md:border-b-0 md:border-r border-panel-border/50 flex flex-col min-h-0 overflow-y-auto">
                <span className="text-[10px] font-black uppercase text-accent tracking-widest block mb-3 flex items-center gap-1">
                  <PlusCircle className="w-3.5 h-3.5" /> Scribble New Thought
                </span>

                <form onSubmit={handleAddNote} className="space-y-4 flex-1 flex flex-col">
                  {/* Topic field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-muted tracking-wide block">Thought Headline (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Article 21 interpretation or key IR quote..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full bg-input/40 border border-panel-border/60 text-[11px] text-main rounded-xl px-3 py-2 outline-none focus:border-accent text-main font-semibold"
                    />
                  </div>

                  {/* Subject Tag selectors */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-muted tracking-wide block">Syllabus Subject Tag</label>
                    <div className="flex flex-wrap gap-1 max-h-[110px] overflow-y-auto custom-scrollbar p-1.5 bg-input/20 border border-panel-border/30 rounded-xl">
                      {CATEGORIES.map((cat) => {
                        const isSelected = subject === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setSubject(cat);
                              playAcousticTone(520, "sine", 0.05);
                            }}
                            className={`px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded-lg transition-all border ${
                              isSelected
                                ? "bg-accent/15 border-accent text-accent"
                                : "bg-panel/40 border-panel-border/50 text-muted hover:text-main hover:border-panel-border"
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Content field */}
                  <div className="space-y-1.5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-black text-muted tracking-wide block">Scribble Area</label>
                      <span className="text-[8px] font-mono text-muted/80">
                        {content.length} / 1000 chars
                      </span>
                    </div>
                    <textarea
                      ref={contentInputRef}
                      placeholder="Type your rapid transient thoughts, ideas, definitions or answers facts here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value.slice(0, 1000))}
                      required
                      rows={5}
                      className="w-full flex-1 min-h-[120px] bg-input/40 border border-panel-border/60 text-[11px] text-main rounded-xl px-3 py-2.5 outline-none focus:border-accent text-main font-semibold resize-none leading-relaxed custom-scrollbar"
                    />
                  </div>

                  {/* Scribble Submit button */}
                  <button
                    type="submit"
                    disabled={!content.trim()}
                    className="w-full py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold uppercase tracking-widest text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CloudLightning className="w-3.5 h-3.5" /> File Rapid Scribble
                  </button>
                </form>
              </div>

              {/* RIGHT COLUMN: Scroller of Existing Notes */}
              <div className="flex-1 p-4 md:p-5 flex flex-col min-h-0 overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
                  <span className="text-[10px] font-black uppercase text-muted tracking-widest block flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-accent" /> Active Scratchpad ({notes.length})
                  </span>

                  {/* Search input bar */}
                  <div className="relative w-48 sm:w-56">
                    <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      placeholder="Search scribbles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-input/30 border border-panel-border/60 text-[10px] text-main rounded-lg pl-7 pr-2.5 py-1 outline-none focus:border-accent font-semibold"
                    />
                  </div>
                </div>

                {/* Listing Scroll Container */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 min-h-[150px]">
                  {filteredNotes.length > 0 ? (
                    filteredNotes.map((note) => {
                      const isPromoting = promotedId === note.id;
                      return (
                        <motion.div
                          key={note.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className={`p-3.5 rounded-2xl bg-panel border transition-all duration-300 relative group overflow-hidden ${
                            isPromoting 
                              ? "border-emerald-500 bg-emerald-500/10" 
                              : "border-panel-border/50 hover:border-panel-border-glow hover:bg-panel-highlight/10 shadow-3xs"
                          }`}
                        >
                          {/* Inner details */}
                          <div className="flex items-center justify-between gap-2.5 mb-1.5 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-accent/15 text-accent border border-accent/10 whitespace-nowrap">
                                {note.subject}
                              </span>
                              <span className="text-[10px] font-black text-main leading-tight truncate max-w-[210px]">
                                {note.topic}
                              </span>
                            </div>
                            <span className="text-[8px] font-mono text-muted/80 tracking-tight">
                              {note.date}
                            </span>
                          </div>

                          <p className="text-[11px] text-muted/95 leading-relaxed font-semibold break-words whitespace-pre-wrap select-text mb-3">
                            {note.content}
                          </p>

                          {/* Quick Interactive Actions Row */}
                          <div className="flex items-center justify-between border-t border-panel-border/30 pt-2.5 mt-2 text-[9px] font-black uppercase text-muted tracking-widest">
                            <span className="text-[8px] text-muted/65 select-none font-sans font-bold flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-accent" /> Scratchpad Item
                            </span>

                            <div className="flex items-center gap-1.5 opacity-85 group-hover:opacity-100 transition-opacity">
                              {/* Copy Button */}
                              <button
                                onClick={() => handleCopyToClipboard(note)}
                                className={`p-1.5 rounded-lg border flex items-center gap-1 transition-all ${
                                  copiedId === note.id
                                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-500"
                                    : "bg-input/40 border-panel-border/60 hover:border-panel-border hover:bg-input text-muted hover:text-main"
                                }`}
                                title="Copy scribble to clipboard"
                              >
                                {copiedId === note.id ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              {/* Promote-to-Atlas-Notes button */}
                              <button
                                onClick={() => handlePromoteToMainNotes(note)}
                                className={`p-1.5 rounded-lg border flex items-center gap-1 transition-all ${
                                  isPromoting
                                    ? "bg-emerald-500 text-white border-emerald-500"
                                    : "bg-accent/10 border-accent/20 hover:border-accent/40 text-accent hover:bg-accent/20"
                                }`}
                                title="File this into permanent Concept Notes Directory"
                              >
                                {isPromoting ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 animate-bounce" />
                                    <span>Promoting...</span>
                                  </>
                                ) : (
                                  <>
                                    <Layers className="w-3 h-3 text-accent" />
                                    <span>Promote to Atlas</span>
                                  </>
                                )}
                              </button>

                              {/* Trash/Delete Button */}
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-rose-500 hover:text-rose-400 transition-all"
                                title="Delete transient scribble"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2.5 bg-input/10 border border-dashed border-panel-border/60 rounded-2xl py-12">
                      <span className="text-3xl select-none">✏️</span>
                      <div>
                        <h5 className="text-[11px] font-black text-main uppercase tracking-widest">Scratchpad is vacant</h5>
                        <p className="text-[10px] font-semibold text-muted mt-1 max-w-[240px] mx-auto leading-normal">
                          {searchQuery ? "No private scribbles matched your search." : "Jot down definitions, IR statistics, or instant thoughts on the left to start."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer feedback row */}
            <div className="p-3 bg-input/40 border-t border-panel-border/60 flex items-center justify-between text-[10px] font-bold text-muted/80 shrink-0">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-accent" />
                Transient facts remain stored in browser memory unless promoted permanently.
              </span>
              <span className="font-mono">
                Active Scribbles count: {notes.length}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
