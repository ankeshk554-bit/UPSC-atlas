import React, { useEffect } from "react";
import { X, Keyboard, ArrowRight, Zap, Play, Layout, Palette, HelpCircle, PenTool, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: "Navigation" | "Theme & Style" | "Study Tools" | "General";
  icon: React.ReactNode;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const shortcuts: ShortcutItem[] = [
    // General
    {
      keys: ["Ctrl / ⌘", "K"],
      description: "Toggle Global Command & Search Palette",
      category: "General",
      icon: <Zap className="w-4 h-4 text-amber-500" />
    },
    {
      keys: ["Ctrl / ⌘", "/"],
      description: "Toggle on-screen Keyboard Shortcut Guide",
      category: "General",
      icon: <Keyboard className="w-4 h-4 text-emerald-500" />
    },
    {
      keys: ["F11"],
      description: "Toggle Eye-Safe Zen Focus Mode (hides panels)",
      category: "General",
      icon: <HelpCircle className="w-4 h-4 text-blue-500" />
    },
    {
      keys: ["Alt / ⌥ / ⌘", "F"],
      description: "Toggle Distraction-Free Focused Reading Mode",
      category: "General",
      icon: <BookOpen className="w-4 h-4 text-purple-500" />
    },
    {
      keys: ["Esc"],
      description: "Close any open Drawer, Dialog, Modal, or Palette",
      category: "General",
      icon: <X className="w-4 h-4 text-rose-500" />
    },

    // Study Tools
    {
      keys: ["Alt / ⌥ / ⌘", "P"],
      description: "Play / Pause Pomodoro Focus Timer",
      category: "Study Tools",
      icon: <Play className="w-4 h-4 text-rose-500" />
    },
    {
      keys: ["Alt / ⌥ / ⌘", "N"],
      description: "Scribble Quick Jottings & Transient Thoughts",
      category: "Study Tools",
      icon: <PenTool className="w-4 h-4 text-accent" />
    },

    // Navigation (Alt + 1-9)
    {
      keys: ["Alt / ⌥ / ⌘", "1"],
      description: "Go to Atlas Overview Dashboard",
      category: "Navigation",
      icon: <Layout className="w-4 h-4 text-cyan-500" />
    },
    {
      keys: ["Alt / ⌥ / ⌘", "2"],
      description: "Open AI Mentor Chat Assistant",
      category: "Navigation",
      icon: <Layout className="w-4 h-4 text-indigo-500" />
    },
    {
      keys: ["Alt / ⌥ / ⌘", "3"],
      description: "Go to Daily Agenda & Micro-Planner",
      category: "Navigation",
      icon: <Layout className="w-4 h-4 text-pink-500" />
    },
    {
      keys: ["Alt / ⌥ / ⌘", "4"],
      description: "Open UPSC Concept Notes Generator",
      category: "Navigation",
      icon: <Layout className="w-4 h-4 text-amber-500" />
    },
    {
      keys: ["Alt / ⌥ / ⌘", "5"],
      description: "Go to Mains PYQ Question Solver",
      category: "Navigation",
      icon: <Layout className="w-4 h-4 text-emerald-500" />
    },
    {
      keys: ["Alt / ⌥ / ⌘", "6"],
      description: "Open Answer Evaluation Sandbox",
      category: "Navigation",
      icon: <Layout className="w-4 h-4 text-violet-500" />
    },
    {
      keys: ["Alt / ⌥ / ⌘", "7"],
      description: "Go to Premium Analytics & Performance",
      category: "Navigation",
      icon: <Layout className="w-4 h-4 text-teal-400" />
    },

    // Style
    {
      keys: ["Alt / ⌥ / ⌘", "T"],
      description: "Cycle through eye-safe themes instantly",
      category: "Theme & Style",
      icon: <Palette className="w-4 h-4 text-yellow-500" />
    },
    {
      keys: ["Alt / ⌥ / ⌘", "G"],
      description: "Toggle glassmorphism backdrop transparent mode",
      category: "Theme & Style",
      icon: <Palette className="w-4 h-4 text-orange-400" />
    }
  ];

  const categories = ["General", "Study Tools", "Navigation", "Theme & Style"] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="w-full max-w-2xl bg-panel border border-panel-border rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-5 md:p-6 border-b border-panel-border/60 bg-panel-header/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent/10 border border-accent/20 rounded-xl text-accent">
                  <Keyboard className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 id="shortcuts-title" className="text-base font-black text-main uppercase tracking-widest">
                    Workspace Keyboard Hotkeys
                  </h3>
                  <p className="text-[11px] text-muted font-bold mt-0.5">
                    Streamline your UPSC preparation with fast, mouse-free keys navigation.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-input rounded-xl text-muted hover:text-main transition-colors"
                title="Close shortcuts guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Categories of Shortcuts */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 custom-scrollbar bg-panel-bg/30">
              {categories.map((cat) => {
                const filtered = shortcuts.filter((s) => s.category === cat);
                return (
                  <div key={cat} className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-accent tracking-widest border-b border-panel-border/30 pb-1.5 matches-heading">
                      {cat}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filtered.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-2xl bg-panel/40 border border-panel-border/40 hover:bg-panel/75 hover:border-panel-border transition-all group shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="shrink-0 scale-95 group-hover:scale-105 transition-transform">
                              {s.icon}
                            </span>
                            <span className="text-[11px] font-bold text-main/90 group-hover:text-main leading-tight truncate">
                              {s.description}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {s.keys.map((k, kidx) => (
                              <React.Fragment key={kidx}>
                                <kbd className="px-1.5 py-0.5 min-w-[20px] text-center bg-input border border-panel-border/80 text-[10px] font-mono font-bold rounded-lg text-main select-none shadow-xs">
                                  {k}
                                </kbd>
                                {kidx < s.keys.length - 1 && (
                                  <span className="text-[10px] text-muted/60 font-black">+</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer tips */}
            <div className="p-4 bg-input/40 border-t border-panel-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <span className="text-[10px] text-muted font-bold flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Press <kbd className="px-1.5 py-0.5 bg-panel border border-panel-border text-[9px] font-mono font-black rounded mx-0.5 text-main">Ctrl / ⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-panel border border-panel-border text-[9px] font-mono font-black rounded text-main">K</kbd> to access quick dynamic search.
              </span>
              <button
                onClick={onClose}
                className="text-[11px] font-black text-accent uppercase tracking-widest hover:text-accent/80 flex items-center gap-1 transition-colors"
              >
                Continue Studying <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
