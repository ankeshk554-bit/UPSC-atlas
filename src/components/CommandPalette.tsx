import React, { useEffect, useState, useMemo } from 'react';
import { 
  Search, 
  Map, 
  Calendar, 
  Mail, 
  BookOpen, 
  AlertTriangle, 
  TrendingUp, 
  MessageSquare, 
  ListChecks, 
  Database, 
  PenTool, 
  FileCheck, 
  Globe, 
  Rss, 
  ArrowRight,
  LayoutTemplate,
  Users
} from 'lucide-react';
import { ViewType } from '../types';

interface SavedNote {
  id: string;
  topic: string;
  subject: string;
  content: string;
  date: string;
}

interface CommandPaletteProps {
  onNavigate: (view: ViewType) => void;
  currentView: ViewType;
}

// Fully comprehensive array of commands matching all available views
const commands = [
  { id: 'overview', title: 'Atlas Overview', icon: Map, keywords: ['home', 'dashboard', 'main', 'landing'] },
  { id: 'chat', title: 'Mentor Chat', icon: MessageSquare, keywords: ['ai', 'ask', 'doubt', 'gpt', 'teacher'] },
  { id: 'planner', title: 'Daily Planner', icon: Calendar, keywords: ['schedule', 'todo', 'tasks', 'agenda'] },
  { id: 'digest', title: 'Daily Prep Digest', icon: Mail, keywords: ['news', 'brief', 'summary', 'newsletter'] },
  { id: 'syllabus', title: 'Syllabus Tracker', icon: ListChecks, keywords: ['progress', 'topics', 'syllabus', 'coverage'] },
  { id: 'notes', title: 'Concept Notes', icon: BookOpen, keywords: ['generator', 'markdown', 'summary', 'scribble'] },
  { id: 'pyq', title: 'PYQ Solver', icon: PenTool, keywords: ['past', 'year', 'questions', 'mains', 'solved'] },
  { id: 'evaluate', title: 'Evaluate Answers', icon: FileCheck, keywords: ['check', 'marks', 'grading', 'feedback'] },
  { id: 'blueprint', title: 'Answer Sandbox', icon: LayoutTemplate, keywords: ['canvas', 'sandbox', 'draft', 'template', 'writing'] },
  { id: 'mistake-book', title: 'Mistake Book', icon: AlertTriangle, keywords: ['errors', 'log', 'review', 'weak areas'] },
  { id: 'affairs', title: 'Current Affairs', icon: Globe, keywords: ['news', 'linking', 'topics', 'editorial', 'newspaper'] },
  { id: 'rss-reader', title: 'RSS Feed Reader', icon: Rss, keywords: ['editorials', 'hindu', 'express', 'news', 'feeds'] },
  { id: 'performance', title: 'Performance Stats', icon: TrendingUp, keywords: ['analytics', 'charts', 'graph', 'metrics'] },
];

export function CommandPalette({ onNavigate, currentView }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [recentViews, setRecentViews] = useState<string[]>([]);

  // Load saved notes for full text searching when opened
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("upsc_saved_notes");
      if (saved) {
        try {
          setSavedNotes(JSON.parse(saved));
        } catch (e) { }
      }
    }
  }, [isOpen]);

  // Load and listen to recent views list
  useEffect(() => {
    const loadRecents = () => {
      try {
        const storedRecents = localStorage.getItem('app_recent_views');
        if (storedRecents) {
          const parsed = JSON.parse(storedRecents);
          if (Array.isArray(parsed)) {
            setRecentViews(parsed);
          }
        }
      } catch (e) {
        console.error('Failed to parse recent views:', e);
      }
    };

    if (isOpen) {
      loadRecents();
    }

    const handleStorageChange = () => {
      if (isOpen) {
        loadRecents();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isOpen]);

  // Command Palette global toggle hotkey handler (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key.toLowerCase() === 'k' || e.code === 'KeyK') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen((prev) => {
          if (!prev) setQuery('');
          return !prev;
        });
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    const handleOpenToggle = () => {
      setIsOpen(prev => !prev);
      if (!isOpen) setQuery('');
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('app:open-command-palette', handleOpenToggle);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('app:open-command-palette', handleOpenToggle);
    };
  }, [isOpen]);

  // Compute 5 previously accessed views, excluding the current on-screen page (Hook defined unconditionally)
  const recentsList = useMemo(() => {
    return recentViews
      .filter(viewId => viewId !== currentView)
      .map(viewId => commands.find(c => c.id === viewId))
      .filter((c): c is NonNullable<typeof c> => !!c)
      .slice(0, 5);
  }, [recentViews, currentView]);

  if (!isOpen) return null;

  const lowerQuery = query.toLowerCase().trim();

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(lowerQuery) || 
    cmd.keywords.some(k => k.includes(lowerQuery))
  );

  const filteredNotes = query.trim().length > 1 ? savedNotes.filter(n => {
    return n.topic.toLowerCase().includes(lowerQuery) || n.content.toLowerCase().includes(lowerQuery);
  }) : [];

  const handleOpenNote = (noteId: string) => {
    onNavigate('notes');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('app:open-note', { detail: { noteId } }));
    }, 100);
    setIsOpen(false);
  };

  const handleRecentNavigate = (viewId: ViewType) => {
    onNavigate(viewId);
    setIsOpen(false);
    
    // Play subtle high acoustic tone
    if (window.AudioContext || (window as any).webkitAudioContext) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 chime
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch (_) {}
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-32 sm:pt-48 pb-4 px-4 bg-app/80 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)}>
      <div 
        className="w-full max-w-xl bg-app border border-panel-border rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans transform scale-100 transition-transform" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-panel-border bg-panel-header/20">
          <Search className="w-5 h-5 text-muted mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search notes... (Esc to close)"
            className="flex-1 bg-transparent border-none outline-none text-main placeholder:text-muted text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="text-[11px] text-muted font-mono bg-panel-border/30 px-1.5 border border-panel-border/50 py-0.5 rounded cursor-pointer" onClick={() => setIsOpen(false)}>ESC</span>
        </div>
        <div className="max-h-[380px] overflow-y-auto p-2.5 custom-scrollbar">
          
          {/* Quick Recent Section - displayed only when the search query is empty */}
          {query === '' && recentsList.length > 0 && (
            <div className="mb-4 px-1.5 pt-1">
              <div className="px-3 py-1 pb-2 text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-1.5 select-none border-b border-panel-border/30 mb-2.5">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                Quick Recent Views (Jump Back)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recentsList.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => handleRecentNavigate(cmd.id as ViewType)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-panel-border/40 bg-panel/30 hover:bg-accent/10 hover:border-accent/40 hover:text-accent transition-all duration-200 text-left group cursor-pointer shadow-3xs"
                  >
                    <div className="flex items-center min-w-0 pr-1">
                      <cmd.icon className="w-4 h-4 text-muted group-hover:text-accent mr-2.5 shrink-0 transition-transform group-hover:scale-110" />
                      <span className="text-[11px] font-black text-main group-hover:text-accent truncate leading-none">
                        {cmd.title}
                      </span>
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-muted/60 bg-input/40 px-1.5 py-0.5 rounded border border-panel-border/30 group-hover:text-accent/80 group-hover:bg-accent/10 shrink-0">
                      Jump Back
                    </span>
                  </button>
                ))}
              </div>
              <div className="h-px bg-panel-border/40 w-full mt-4 mb-1.5" />
            </div>
          )}

          {/* Matches Commands Listing */}
          {filteredCommands.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1.5 text-[11px] font-black text-muted uppercase tracking-wider select-none">Commands</div>
              {filteredCommands.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    onNavigate(cmd.id as ViewType);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 rounded-xl hover:bg-accent/10 hover:text-accent transition-colors text-left group cursor-pointer"
                >
                  <cmd.icon className="w-5 h-5 text-muted group-hover:text-accent mr-3 transition-transform group-hover:scale-105" />
                  <span className="flex-1 text-sm font-semibold text-main group-hover:text-accent">{cmd.title}</span>
                  <span className="hidden group-hover:block text-[10px] uppercase font-bold tracking-wider opacity-60">Jump to view</span>
                </button>
              ))}
            </div>
          )}

          {/* Search match in Notes Database */}
          {query.trim().length > 1 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-black text-muted uppercase tracking-wider select-none">Found in Notes</div>
              {filteredNotes.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted">No notes match "{query}"</div>
              ) : (
                filteredNotes.map(note => (
                  <button
                    key={note.id}
                    onClick={() => handleOpenNote(note.id)}
                    className="w-full flex items-center px-4 py-3 rounded-xl hover:bg-yellow-500/10 hover:text-yellow-500 transition-colors text-left group cursor-pointer"
                  >
                    <BookOpen className="w-5 h-5 text-muted group-hover:text-yellow-500 mr-3" />
                    <div className="flex-1 flex flex-col items-start overflow-hidden">
                      <span className="text-sm font-semibold text-main group-hover:text-yellow-500 line-clamp-1">{note.topic}</span>
                      <span className="text-[11px] text-muted line-clamp-1 mt-0.5 w-full pr-4 opacity-70">
                        {note.content.substring(0, 100).replace(/[#`*]/g, '')}...
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))
              )}
            </div>
          )}
          
          {filteredCommands.length === 0 && query.trim().length <= 1 && (
            <div className="p-4 text-center text-sm text-muted select-none">No commands found. Try typing a different keyword!</div>
          )}
        </div>
      </div>
    </div>
  );
}
