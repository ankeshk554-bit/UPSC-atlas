import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  BookOpen,
  FileCheck,
  TrendingUp,
  Map,
  PenTool,
  ListChecks,
  Globe,
  AlertTriangle,
  Database,
  Calendar,
  Rss,
  Mail,
  ChevronDown,
  ChevronRight,
  Search,
  CheckCircle2,
  Users,
  LayoutTemplate,
  Sun,
  Moon
} from "lucide-react";
import { ViewType } from "../types";
import { VerticalStudyRoadmap } from "./VerticalStudyRoadmap";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onClose?: () => void;
  footer?: React.ReactNode;
  theme: string;
  setTheme: (theme: any) => void;
}

export function Sidebar({ currentView, onViewChange, onClose, footer, theme, setTheme }: SidebarProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [fullyMasteredCount, setFullyMasteredCount] = useState(0);
  const [showSidebarRoadmap, setShowSidebarRoadmap] = useState(false);
  const [width, setWidth] = useState(() => {
    try {
      const savedWidth = localStorage.getItem("app_sidebar_width");
      return savedWidth ? parseInt(savedWidth, 10) : 280;
    } catch (e) {
      return 280;
    }
  });
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate new width restricted to between 220px and 480px Range
      const newWidth = Math.max(220, Math.min(480, e.clientX));
      setWidth(newWidth);
      try {
        localStorage.setItem("app_sidebar_width", newWidth.toString());
      } catch (_) {}
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      document.body.classList.add('select-none');
      document.body.classList.add('cursor-col-resize');
    } else {
      document.body.classList.remove('select-none');
      document.body.classList.remove('cursor-col-resize');
    }
    return () => {
      document.body.classList.remove('select-none');
      document.body.classList.remove('cursor-col-resize');
    };
  }, [isResizing]);

  useEffect(() => {
    const calculateMastery = () => {
      const saved = localStorage.getItem("upsc_syllabus_v2");
      if (!saved) return;
      try {
        const syllabus = JSON.parse(saved);
        let count = 0;
        syllabus.forEach((mainTopic: any) => {
          let total = 0;
          let mastered = 0;
          const traverse = (t: any) => {
            if (t.subtopics && t.subtopics.length > 0) {
              t.subtopics.forEach(traverse);
            } else {
              total++;
              if (t.status === "mastered") mastered++;
            }
          };
          traverse(mainTopic);
          if (total > 0 && total === mastered) {
            count++;
          }
        });
        setFullyMasteredCount(count);
      } catch (e) {}
    };

    calculateMastery();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "upsc_syllabus_v2") {
        calculateMastery();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    // Add custom event listener just in case other components update it in the same window
    window.addEventListener("app:syllabusUpdated", calculateMastery);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("app:syllabusUpdated", calculateMastery);
    };
  }, []);

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const menuGroups = [
    {
      label: "Dashboard",
      items: [
        { id: "overview", label: "Atlas Overview", icon: Map },
        { id: "planner", label: "Daily Planner", icon: Calendar },
        { id: "digest", label: "Daily Prep Digest", icon: Mail },
      ]
    },
    {
      label: "Study & AI Mentor",
      items: [
        { id: "chat", label: "Mentor Chat", icon: MessageSquare },
        { id: "syllabus", label: "Syllabus Tracker", icon: ListChecks },
        { id: "notes", label: "Generate Notes", icon: BookOpen },
      ]
    },
    {
      label: "Practice & Analysis",
      items: [
        { id: "pyq", label: "PYQ Solver", icon: PenTool },
        { id: "evaluate", label: "Evaluate Answers", icon: FileCheck },
        { id: "blueprint", label: "Answer Sandbox", icon: LayoutTemplate },
        { id: "mistake-book", label: "Mistake Book", icon: AlertTriangle },
        { id: "performance", label: "Performance", icon: TrendingUp },
      ]
    },
    {
      label: "Resources",
      items: [
        { id: "data-bank", label: "Mains Data Bank", icon: Database },
        { id: "affairs", label: "Current Affairs", icon: Globe },
        { id: "rss-reader", label: "RSS Feed Reader", icon: Rss },
      ]
    }
  ];

  const handleNavClick = (id: ViewType) => {
    onViewChange(id);
    if (onClose) onClose();
  };

  const sidebarWidth = isMobile ? undefined : width;

  return (
    <div 
      style={sidebarWidth !== undefined ? { width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px`, maxWidth: `${sidebarWidth}px` } : undefined}
      className={`pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] glass-sidebar border-r border-sidebar-border h-full flex flex-col text-sidebar-text font-sans relative ${
        isResizing ? "select-none cursor-col-resize duration-0" : "transition-all duration-200"
      }`}
    >
      <div className="p-8 flex items-center gap-3 text-sidebar-text border-b border-sidebar-border pb-6 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg shadow-accent/20">
          <Map className="w-5 h-5 text-white" />
        </div>
        <div 
          className="flex-1 cursor-pointer group" 
          onClick={() => window.dispatchEvent(new CustomEvent('app:open-command-palette'))}
          title="Search Notes & Commands (⌘K)"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-black tracking-tight text-sidebar-text leading-tight uppercase group-hover:text-accent transition-colors">
              Atlas
            </h1>
            <span className="hidden lg:flex items-center gap-1.5 text-[9px] font-mono border border-sidebar-border px-1.5 py-1 rounded text-sidebar-text font-bold bg-sidebar-hover group-hover:bg-accent/10 group-hover:text-accent group-hover:border-accent/30 transition-all">
              <Search className="w-2.5 h-2.5" />
              ⌘K
            </span>
          </div>
          <p className="text-[11px] font-extrabold tracking-widest uppercase text-accent mt-0.5">
            Search Workspace
          </p>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-6 overflow-y-auto pb-4 custom-scrollbar">
        {/* Quick Theme Select Panel */}
        <div className="bg-sidebar-hover/35 border border-sidebar-border/50 p-2.5 rounded-2xl flex flex-col gap-2 mb-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-sidebar-text/60 pl-1">
            Quick Theme Select
          </div>
          <div className="grid grid-cols-2 bg-sidebar-hover/55 p-1 rounded-xl border border-sidebar-border/30 gap-1">
            <button
              onClick={() => {
                if (theme !== 'default') {
                  setTheme('default');
                  // Soft feedback chime
                  if (window.AudioContext || (window as any).webkitAudioContext) {
                    try {
                      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                      const osc = ctx.createOscillator();
                      const gain = ctx.createGain();
                      osc.connect(gain);
                      gain.connect(ctx.destination);
                      osc.type = "sine";
                      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
                      gain.gain.setValueAtTime(0.02, ctx.currentTime);
                      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                      osc.start();
                      osc.stop(ctx.currentTime + 0.15);
                    } catch (_) {}
                  }
                }
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                theme !== 'dark'
                  ? 'bg-accent text-white shadow-xs scale-102 font-black'
                  : 'text-sidebar-text/70 hover:text-sidebar-text hover:bg-sidebar-hover/40'
              }`}
              title="Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
            <button
              onClick={() => {
                if (theme !== 'dark') {
                  setTheme('dark');
                  // Soft feedback chime
                  if (window.AudioContext || (window as any).webkitAudioContext) {
                    try {
                      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                      const osc = ctx.createOscillator();
                      const gain = ctx.createGain();
                      osc.connect(gain);
                      gain.connect(ctx.destination);
                      osc.type = "sine";
                      osc.frequency.setValueAtTime(440, ctx.currentTime);
                      gain.gain.setValueAtTime(0.02, ctx.currentTime);
                      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                      osc.start();
                      osc.stop(ctx.currentTime + 0.15);
                    } catch (_) {}
                  }
                }
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-accent text-white shadow-xs scale-102 font-black'
                  : 'text-sidebar-text/70 hover:text-sidebar-text hover:bg-sidebar-hover/40'
              }`}
              title="Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {menuGroups.map((group, index) => {
          const isCollapsed = collapsedGroups[group.label];
          return (
          <div key={index}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between px-4 py-1.5 mb-1 group"
            >
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-sidebar-text/90 group-hover:text-sidebar-text transition-colors">
                {group.label}
              </h3>
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-sidebar-text/70 group-hover:text-sidebar-text transition-colors" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-sidebar-text/70 group-hover:text-sidebar-text transition-colors" />
              )}
            </button>
            <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"}`}>
              {group.items.map((item) => {
                const isActive = currentView === item.id;
                const isSyllabus = item.id === "syllabus";
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id as ViewType)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "bg-accent/15 text-accent font-bold shadow-2xs border border-accent/20"
                        : "hover:bg-sidebar-hover text-sidebar-text font-semibold hover:text-main"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={`w-4 h-4 transition-colors ${isActive ? "text-accent" : "text-sidebar-text/80 group-hover:text-accent"}`}
                      />
                      <span className="text-[13.5px] font-semibold">{item.label}</span>
                    </div>
                    {isSyllabus && fullyMasteredCount > 0 && (
                      <span className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-full" title={`${fullyMasteredCount} module(s) fully mastered`}>
                         <CheckCircle2 className="w-2.5 h-2.5" />
                         {fullyMasteredCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          );
        })}
        {/* Mobile/Compact Study Roadmap section */}
        <div className="pt-2 border-t border-sidebar-border/40 mt-4 lg:hidden">
          <button
            onClick={() => setShowSidebarRoadmap(!showSidebarRoadmap)}
            className="w-full flex items-center justify-between gap-2 px-4 py-2 rounded-xl hover:bg-sidebar-hover text-sidebar-text text-[11px] font-bold uppercase tracking-wider transition-all"
          >
            <span className="flex items-center gap-2">
              <Map className="w-3.5 h-3.5 text-accent anim-pulse" />
              Syllabus Roadmap
            </span>
            <span className="text-[10px] bg-accent/20 text-accent font-bold px-1.5 py-0.5 rounded">
              {showSidebarRoadmap ? "HIDE" : "VIEW"}
            </span>
          </button>
          
          {showSidebarRoadmap && (
            <div className="mt-2 text-main bg-app/30 rounded-xl border border-sidebar-border/20 overflow-hidden">
              <VerticalStudyRoadmap onNavigate={handleNavClick} compact={true} />
            </div>
          )}
        </div>
      </nav>
      {/* Settings area inside sidebar */}
      {footer && (
        <div className="px-4 py-3 border-t border-sidebar-border mt-auto flex items-center justify-between gap-2.5 bg-sidebar-hover/20">
          {footer}
        </div>
      )}

      {/* Resizing Handle on the Right Border */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
        className={`absolute -right-1 top-0 bottom-0 w-2 hover:bg-accent/40 active:bg-accent cursor-col-resize z-[60] group/handle hidden lg:block transition-all ${
          isResizing ? "bg-accent" : "bg-transparent"
        }`}
        title="Drag to resize sidebar"
      >
        {/* Subtle indicator line in the middle of handle on hover */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 bg-sidebar-border group-hover/handle:bg-accent-foreground/50 rounded-full transition-colors" />
      </div>
    </div>
  );
}
