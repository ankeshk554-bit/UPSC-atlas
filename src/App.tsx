import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { NotesView } from './components/NotesView';
import { EvaluateView } from './components/EvaluateView';
import { PerformanceView } from './components/PerformanceView';
import { PYQView } from './components/PYQView';
import { SyllabusTracker } from './components/SyllabusTracker';
import { CurrentAffairsView } from './components/CurrentAffairsView';
import { MistakeBookView } from './components/MistakeBookView';
import { DataBankView } from './components/DataBankView';
import { PlannerView } from './components/PlannerView';
import { OverviewView } from './components/OverviewView';
import { CommandPalette } from './components/CommandPalette';
import { DailyDigestView } from './components/DailyDigestView';
import { DeepWorkTimer } from './components/DeepWorkTimer';
import { HeaderSettings } from './components/HeaderSettings';
import { UserProfileSettings } from './components/UserProfileSettings';
import { RssReaderView } from './components/RssReaderView';
import { AnswerBlueprintView } from './components/AnswerBlueprintView';
import { ViewType, DeepSeekModel } from './types';
import { PanelLeftClose, PanelLeftOpen, Keyboard, PenTool, Users, BookOpen, Sun, Moon, RotateCcw } from 'lucide-react';
import { useAutoSync } from './lib/useAutoSync';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { QuickNoteModal } from './components/QuickNoteModal';

export type Theme = 'default' | 'dark' | 'white' | 'sepia' | 'amoled' | 'nord' | 'cyberpunk' | 'sunset' | 'ocean' | 'forest' | 'lavender' | 'midnight' | 'frost' | 'gruvbox' | 'obsidian' | 'eink' | 'sage' | 'latte' | 'serenity' | 'dracula' | 'solarized-light' | 'solarized-dark' | 'tokyo-night' | 'high-contrast';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    return (localStorage.getItem('app_current_view') as ViewType) || 'overview';
  });
  const [model, setModel] = useState<DeepSeekModel>(() => {
    return (localStorage.getItem('app_model') as DeepSeekModel) || 'deepseek-chat';
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isWhiteboardFullScreen, setIsWhiteboardFullScreen] = useState(false);
  const [isFocusedReading, setIsFocusedReading] = useState<boolean>(() => {
    return localStorage.getItem('app_focused_reading') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('app_focused_reading', String(isFocusedReading));
    if (isFocusedReading) {
      setSidebarOpen(false);
    }
  }, [isFocusedReading]);

  useEffect(() => {
    const handleWhiteboardFullScreen = (e: Event) => {
      const customEvent = e as CustomEvent<{ fullscreen: boolean }>;
      if (customEvent.detail) {
        setIsWhiteboardFullScreen(customEvent.detail.fullscreen);
      }
    };
    window.addEventListener("app:whiteboard-fullscreen", handleWhiteboardFullScreen as EventListener);
    return () => {
      window.removeEventListener("app:whiteboard-fullscreen", handleWhiteboardFullScreen as EventListener);
    };
  }, []);
  
  useEffect(() => {
    if ((currentView === 'notes' || currentView === 'pyq') && window.innerWidth >= 1024) {
      setSidebarOpen(false);
    } else if (currentView !== 'notes' && currentView !== 'pyq' && window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, [currentView]);

  useAutoSync();
  
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('app_theme') as Theme) || 'default';
  });

  const [glassMode, setGlassMode] = useState<boolean>(() => {
    return localStorage.getItem('app_glass_mode') !== 'false';
  });

  const [zenMode, setZenMode] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isQuickNoteOpen, setIsQuickNoteOpen] = useState(false);

  // Robust eye-safe typography preferences
  const [readerFont, setReaderFont] = useState<string>(() => localStorage.getItem('app_reader_font') || 'inter');
  const [readerFontSize, setReaderFontSize] = useState<string>(() => localStorage.getItem('app_reader_font_size') || 'base');
  const [readerLineHeight, setReaderLineHeight] = useState<string>(() => localStorage.getItem('app_reader_line_height') || 'normal');
  const [eyeSaverTint, setEyeSaverTint] = useState<string>(() => localStorage.getItem('app_eye_saver_tint') || 'none');
  const [readerContrast, setReaderContrast] = useState<string>(() => localStorage.getItem('app_reader_contrast') || 'normal');

  useEffect(() => {
    localStorage.setItem('app_reader_font', readerFont);
    const fontMapping: Record<string, string> = {
      inter: 'var(--font-inter), "Inter", sans-serif',
      merriweather: 'var(--font-merriweather), "Merriweather", serif',
      lora: 'var(--font-lora), "Lora", serif',
      jetbrains: 'var(--font-jetbrains), "JetBrains Mono", monospace'
    };
    document.documentElement.style.setProperty('--dynamic-font-family', fontMapping[readerFont] || fontMapping.inter);
  }, [readerFont]);

  useEffect(() => {
    localStorage.setItem('app_reader_font_size', readerFontSize);
    const sizeMapping: Record<string, string> = {
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.375rem'
    };
    document.documentElement.style.setProperty('--dynamic-font-size', sizeMapping[readerFontSize] || sizeMapping.base);
  }, [readerFontSize]);

  useEffect(() => {
    localStorage.setItem('app_reader_line_height', readerLineHeight);
    const lhMapping: Record<string, string> = {
      tight: '1.35',
      normal: '1.55',
      relaxed: '1.75',
      loose: '2.0'
    };
    document.documentElement.style.setProperty('--dynamic-line-height', lhMapping[readerLineHeight] || lhMapping.normal);
  }, [readerLineHeight]);

  useEffect(() => {
    localStorage.setItem('app_eye_saver_tint', eyeSaverTint);
    const tintColor = 
      eyeSaverTint === 'sepia' 
        ? 'rgba(217, 119, 6, 0.04)' 
        : eyeSaverTint === 'candle' 
          ? 'rgba(249, 115, 22, 0.08)' 
          : eyeSaverTint === 'dim' 
            ? 'rgba(0, 0, 0, 0.04)' 
            : 'transparent';
    document.documentElement.style.setProperty('--dynamic-eye-saver-tint', tintColor);
  }, [eyeSaverTint]);

  useEffect(() => {
    localStorage.setItem('app_reader_contrast', readerContrast);
    const filterVal = 
      readerContrast === 'low' ? 'opacity(0.95) contrast(0.95)' 
        : readerContrast === 'high' 
          ? 'contrast(1.04) brightness(1.02)' 
          : 'none';
    document.documentElement.style.setProperty('--dynamic-text-contrast-filter', filterVal);
  }, [readerContrast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Zen Mode with F11
      if (e.key === 'F11') {
        e.preventDefault();
        setZenMode(z => !z);
        setSidebarOpen(z => z); // if entering zen mode, we also close sidebar
      }

      // Alt / Option / Cmd + F => Toggle Focused Reading Mode
      if ((e.altKey || e.metaKey) && (e.key.toLowerCase() === 'f' || e.code === 'KeyF' || e.key === 'ƒ')) {
        e.preventDefault();
        setIsFocusedReading(prev => !prev);
      }

      // Ctrl / Cmd + / => Keyboard Shortcuts Guide
      if (e.key === '/' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      }

      // Alt / Option / Cmd + P => Toggle Deep Work timer
      if ((e.altKey || e.metaKey) && (e.key.toLowerCase() === 'p' || e.code === 'KeyP' || e.key === 'π')) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("app:timer-command", { detail: { cmd: "toggle" } }));
      }


      // Alt / Option / Cmd + N => Toggle Quick Note Modal
      if ((e.altKey || e.metaKey) && (e.key.toLowerCase() === 'n' || e.code === 'KeyN' || e.key === '˜')) {
        e.preventDefault();
        setIsQuickNoteOpen(prev => !prev);
      }

      // Alt / Option / Cmd + T => Cycle visual theme presets
      if ((e.altKey || e.metaKey) && (e.key.toLowerCase() === 't' || e.code === 'KeyT' || e.key === '†')) {
        e.preventDefault();
        const themeOrder: Theme[] = ['default', 'dark', 'sepia', 'amoled', 'nord', 'midnight', 'cyberpunk', 'sunset', 'ocean', 'forest', 'lavender', 'frost', 'gruvbox', 'obsidian', 'eink', 'sage', 'latte', 'serenity', 'dracula', 'solarized-light', 'solarized-dark', 'tokyo-night', 'high-contrast'];
        setTheme(prev => {
          const index = themeOrder.indexOf(prev);
          const nextIndex = (index + 1) % themeOrder.length;
          return themeOrder[nextIndex];
        });
      }

      // Alt / Option / Cmd + G => Toggle Glass Mode
      if ((e.altKey || e.metaKey) && (e.key.toLowerCase() === 'g' || e.code === 'KeyG' || e.key === '©')) {
        e.preventDefault();
        setGlassMode(prev => !prev);
      }

      // Alt / Option / Cmd + 1-7 => Switch panels
      const isAltNumber = (e.altKey || e.metaKey) && (
        ['1', '2', '3', '4', '5', '6', '7'].includes(e.key) ||
        ['¡', '™', '£', '¢', '∞', '§', '¶'].includes(e.key) ||
        ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7'].includes(e.code)
      );
      if (isAltNumber) {
        e.preventDefault();
        let keyDigit = '';
        if (['1', '2', '3', '4', '5', '6', '7'].includes(e.key)) {
          keyDigit = e.key;
        } else if (e.code && e.code.startsWith('Digit') && ['1', '2', '3', '4', '5', '6', '7'].includes(e.code.replace('Digit', ''))) {
          keyDigit = e.code.replace('Digit', '');
        } else {
          const optionCharMap: Record<string, string> = {
            '¡': '1',
            '™': '2',
            '£': '3',
            '¢': '4',
            '∞': '5',
            '§': '6',
            '¶': '7'
          };
          keyDigit = optionCharMap[e.key] || '';
        }

        const viewMapping: Record<string, ViewType> = {
          '1': 'overview',
          '2': 'chat',
          '3': 'planner',
          '4': 'notes',
          '5': 'pyq',
          '6': 'evaluate',
          '7': 'performance'
        };
        const nextView = viewMapping[keyDigit];
        if (nextView) {
          setCurrentView(nextView);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update sidebar when zen mode changes
  useEffect(() => {
    if (zenMode) setSidebarOpen(false);
  }, [zenMode]);

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app_glass_mode', String(glassMode));
    document.documentElement.setAttribute('data-glass', String(glassMode));
  }, [glassMode]);

  useEffect(() => {
    localStorage.setItem('app_model', model);
  }, [model]);

  useEffect(() => {
    localStorage.setItem('app_current_view', currentView);
    try {
      const storedRecents = localStorage.getItem('app_recent_views');
      let recents: string[] = storedRecents ? JSON.parse(storedRecents) : [];
      if (!Array.isArray(recents)) recents = [];
      
      // Filter out current view to avoid duplications, then prepend it
      recents = recents.filter(v => v !== currentView);
      recents.unshift(currentView);
      
      // Keep up to 10 stored recents so we can query them later
      localStorage.setItem('app_recent_views', JSON.stringify(recents.slice(0, 10)));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Failed to log recent views:', e);
    }
  }, [currentView]);

  // View title helper
  const getViewTitle = () => {
    switch (currentView) {
      case 'overview': return 'Atlas Overview Dashboard';
      case 'chat': return 'AI Mentor Chat';
      case 'planner': return 'Daily Micro-Planner';
      case 'notes': return 'Concept Notes Generator';
      case 'pyq': return 'PYQ Solver';
      case 'evaluate': return 'Answer Evaluation';
      case 'blueprint': return 'Mains Answer Sandbox';
      case 'performance': return 'Performance Analytics';
      case 'digest': return 'Daily Prep Digest';
      case 'syllabus': return 'Syllabus Micro-Tracker';
      case 'affairs': return 'Current Affairs Linking';
      case 'rss-reader': return 'RSS Feed Reader';
      case 'mistake-book': return 'Test Mistake Log';
      case 'data-bank': return 'Mains Data & Quote Bank';
      default: return '';
    }
  };

  const handleToggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'default' : 'dark';
    setTheme(nextTheme);

    // Simple acoustic chime feedback
    if (window.AudioContext || (window as any).webkitAudioContext) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(nextTheme === 'dark' ? 440 : 587.33, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } catch (_) {}
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-app font-sans text-main transition-colors duration-200 relative print:h-auto print:overflow-visible">
      <CommandPalette onNavigate={setCurrentView} currentView={currentView} />
      {/* Decorative ambient background orbs */}
      {glassMode && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 transition-opacity print:hidden">
          <div className="absolute top-[0%] left-[0%] w-[100vw] h-[100vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent opacity-60" />
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-accent/40 blur-[120px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-500/30 blur-[100px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-purple-500/30 blur-[140px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '12s' }} />
        </div>
      )}

      {/* Mobile/Tablet Overlay */}
      {sidebarOpen && !isFocusedReading && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-md transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop static, Mobile absolute fixed */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isWhiteboardFullScreen || isFocusedReading ? '-translate-x-full lg:hidden hidden' : sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'} print:hidden
      `}>
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          onClose={() => {
            if (window.innerWidth < 1024) {
              setSidebarOpen(false);
            }
          }} 
          theme={theme}
          setTheme={setTheme}
          footer={
            <div className="flex items-center justify-between w-full">
              <UserProfileSettings />
              <HeaderSettings 
                theme={theme} 
                setTheme={setTheme} 
                model={model} 
                setModel={setModel} 
                glassMode={glassMode} 
                setGlassMode={setGlassMode} 
                readerFont={readerFont}
                setReaderFont={setReaderFont}
                readerFontSize={readerFontSize}
                setReaderFontSize={setReaderFontSize}
                readerLineHeight={readerLineHeight}
                setReaderLineHeight={setReaderLineHeight}
                eyeSaverTint={eyeSaverTint}
                setEyeSaverTint={setEyeSaverTint}
                readerContrast={readerContrast}
                setReaderContrast={setReaderContrast}
              />
            </div>
          }
        />
      </div>
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full pt-0 pb-[env(safe-area-inset-bottom)] z-10 print:overflow-visible">
        {!zenMode && !isWhiteboardFullScreen && (
          <header className={`pt-[env(safe-area-inset-top)] h-[calc(3rem+env(safe-area-inset-top))] flex-shrink-0 glass-panel border-x-0 border-t-0 z-20 px-4 md:px-8 flex items-center justify-between transition-colors duration-300 print:hidden ${isFocusedReading ? 'bg-panel-bg shadow-sm' : ''}`}>
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              {!isFocusedReading && (
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)} 
                  className="p-1.5 md:-ml-1.5 rounded-lg hover:bg-input text-muted hover:text-main transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:ring-offset-background/50"
                  title="Toggle Sidebar"
                  aria-label="Toggle Sidebar"
                >
                  {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
                </button>
              )}
              <h2 className="font-semibold text-lg text-main tracking-tight capitalize select-none flex items-center gap-2">
                {isFocusedReading && <BookOpen className="w-4 h-4 text-muted/60" />}
                {getViewTitle()}
                {isFocusedReading && (
                  <span className="text-[9px] font-bold tracking-widest uppercase bg-panel-border/35 text-muted px-2 py-0.5 rounded-md ml-1.5 border border-panel-border/20">
                    Focused
                  </span>
                )}
              </h2>
            </div>
            
            <div className="hidden sm:flex items-center justify-center gap-2 md:gap-3 flex-1 min-w-0">
              {!isFocusedReading && (
                <>
                  <DeepWorkTimer />
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 md:gap-3 flex-shrink-0 ml-auto">
              {/* Premium Segmented Theme Switch */}
              <div className="flex items-center bg-panel border border-panel-border p-1 rounded-full shadow-sm shrink-0">
                <button
                  id="header-theme-toggle-light"
                  onClick={() => {
                    if (theme !== 'default') {
                      setTheme('default');
                      // Play soft light mode chime
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase transition-all cursor-pointer ${
                    theme !== 'dark'
                      ? 'bg-accent text-black shadow-sm scale-105'
                      : 'text-muted hover:text-main'
                  }`}
                  title="Switch to Light Theme"
                  aria-label="Switch to Light Theme"
                >
                  <Sun className={`w-3.5 h-3.5 ${theme !== 'dark' ? 'text-black' : 'text-muted'}`} />
                  <span className="hidden md:inline">Light</span>
                </button>
                <button
                  id="header-theme-toggle-dark"
                  onClick={() => {
                    if (theme !== 'dark') {
                      setTheme('dark');
                      // Play soft dark mode chime
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-accent text-black shadow-sm scale-105'
                      : 'text-muted hover:text-main'
                  }`}
                  title="Switch to Dark Theme"
                  aria-label="Switch to Dark Theme"
                >
                  <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-black' : 'text-muted'}`} />
                  <span className="hidden md:inline">Dark</span>
                </button>
              </div>

              {!isFocusedReading && (
                <>
                  <button
                    id="header-reset-app-button"
                    onClick={() => {
                      if (window.confirm("Reset workspace cache and reload with latest updates? This will refresh all feeds, clear stale browser cache, and reload the latest code.")) {
                        try {
                          localStorage.removeItem('upsc_rss_feeds');
                          localStorage.removeItem('upsc_cached_feeds_data');
                          localStorage.removeItem('upsc_pyq_sidebar_tab');
                          if ('caches' in window) {
                            caches.keys().then((names) => {
                              names.forEach((name) => caches.delete(name));
                            });
                          }
                          if ('serviceWorker' in navigator) {
                            navigator.serviceWorker.getRegistrations().then((registrations) => {
                              for (const r of registrations) r.unregister();
                            });
                          }
                        } catch (_) {}
                        window.location.reload();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-panel hover:bg-amber-500/10 border border-panel-border hover:border-amber-500/40 text-muted hover:text-amber-500 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-sm shrink-0"
                    title="Clear cached data & reload fresh application state"
                    aria-label="Reset and reload app"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Reset Page</span>
                  </button>

                  <button
                    id="header-shortcuts-guide-toggle"
                    onClick={() => setIsShortcutsOpen(true)}
                    className="p-2 bg-panel border border-panel-border text-muted hover:text-main hover:border-accent/40 rounded-full transition-all cursor-pointer shadow-sm relative flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:ring-offset-background/50"
                    title="Keyboard Shortcuts Guide (Ctrl+/)"
                    aria-label="Keyboard Shortcuts Guide"
                  >
                    <Keyboard className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </header>
        )}

        {zenMode && (
          <div className="absolute top-2 right-4 z-50 opacity-0 hover:opacity-100 transition-opacity">
            <button onClick={() => setZenMode(false)} className="bg-panel-bg/80 backdrop-blur border border-panel-border text-[11px] px-2 py-1 rounded text-muted">Exit Zen Mode (F11)</button>
          </div>
        )}

        <div 
          className={`flex-1 overflow-hidden min-h-0 print:overflow-visible print:h-auto flex flex-col ${zenMode ? 'p-0' : ''} ${isFocusedReading ? 'bg-app duration-300' : ''}`}
          style={{
            fontFamily: 'var(--dynamic-font-family, var(--font-inter, sans-serif))',
            fontSize: 'var(--dynamic-font-size, 1rem)',
            lineHeight: 'var(--dynamic-line-height, 1.55)',
            filter: 'var(--dynamic-text-contrast-filter, none)'
          }}
        >
          <div className={`flex-1 flex flex-col min-h-0 ${isFocusedReading ? 'max-w-4xl mx-auto px-4 md:px-8 py-6 w-full h-full transition-all duration-300 overflow-y-auto' : 'w-full h-full'}`}>
            {isFocusedReading && (
              <div className="mb-6 bg-panel border border-panel-border rounded-2xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs font-semibold print:hidden select-none animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-muted">Font:</span>
                  <div className="flex bg-input rounded-lg p-0.5 border border-panel-border/60">
                    <button
                      onClick={() => setReaderFont('inter')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${readerFont === 'inter' ? 'bg-panel text-accent shadow-xs' : 'text-muted hover:text-main'}`}
                      title="Inter (Sans)"
                    >
                      Sans
                    </button>
                    <button
                      onClick={() => setReaderFont('lora')}
                      className={`px-2.5 py-1 rounded-md font-serif transition-colors ${readerFont === 'lora' ? 'bg-panel text-accent shadow-xs' : 'text-muted hover:text-main'}`}
                      title="Lora (Serif)"
                    >
                      Serif
                    </button>
                    <button
                      onClick={() => setReaderFont('jetbrains')}
                      className={`px-2.5 py-1 rounded-md font-mono transition-colors ${readerFont === 'jetbrains' ? 'bg-panel text-accent shadow-xs' : 'text-muted hover:text-main'}`}
                      title="JetBrains (Mono)"
                    >
                      Mono
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted">Size:</span>
                    <button
                      onClick={() => {
                        const sizes = ['sm', 'base', 'lg', 'xl', '2xl'];
                        const idx = sizes.indexOf(readerFontSize);
                        if (idx > 0) setReaderFontSize(sizes[idx - 1]);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-panel border border-panel-border text-muted hover:text-main active:scale-95 text-xs font-bold"
                      title="Decrease font size"
                    >
                      A-
                    </button>
                    <span className="font-mono text-[10px] w-8 text-center uppercase font-bold text-main">{readerFontSize}</span>
                    <button
                      onClick={() => {
                        const sizes = ['sm', 'base', 'lg', 'xl', '2xl'];
                        const idx = sizes.indexOf(readerFontSize);
                        if (idx < sizes.length - 1) setReaderFontSize(sizes[idx + 1]);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-panel border border-panel-border text-muted hover:text-main active:scale-95 text-xs font-bold"
                      title="Increase font size"
                    >
                      A+
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted">Eye Care:</span>
                    <div className="flex bg-input rounded-lg p-0.5 border border-panel-border/60">
                      <button
                        onClick={() => setEyeSaverTint('none')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${eyeSaverTint === 'none' ? 'bg-panel text-accent shadow-xs' : 'text-muted hover:text-main'}`}
                      >
                        Off
                      </button>
                      <button
                        onClick={() => setEyeSaverTint('sepia')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${eyeSaverTint === 'sepia' ? 'bg-panel text-amber-600 shadow-xs' : 'text-muted hover:text-main'}`}
                        title="Warm Sepia"
                      >
                        Sepia
                      </button>
                      <button
                        onClick={() => setEyeSaverTint('candle')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${eyeSaverTint === 'candle' ? 'bg-panel text-orange-500 shadow-xs' : 'text-muted hover:text-main'}`}
                        title="Candlelight"
                      >
                        Candle
                      </button>
                      <button
                        onClick={() => setEyeSaverTint('dim')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${eyeSaverTint === 'dim' ? 'bg-panel text-blue-500 shadow-xs' : 'text-muted hover:text-main'}`}
                        title="Dim Mode"
                      >
                        Dim
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted">Spacing:</span>
                    <select
                      value={readerLineHeight}
                      onChange={(e) => setReaderLineHeight(e.target.value)}
                      className="bg-panel border border-panel-border rounded-lg px-2 py-1 text-[10px] font-bold text-main outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="tight">Cozy</option>
                      <option value="normal">Normal</option>
                      <option value="relaxed">Relaxed</option>
                      <option value="loose">Loose</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            {currentView === 'overview' && <OverviewView onNavigate={setCurrentView} />}
            {currentView === 'chat' && <ChatView model={model} />}
            {currentView === 'planner' && <PlannerView model={model} />}
            {currentView === 'notes' && <NotesView model={model} />}
            {currentView === 'pyq' && <PYQView model={model} />}
            {currentView === 'evaluate' && <EvaluateView model={model} />}
            {currentView === 'blueprint' && <AnswerBlueprintView model={model} />}
            {currentView === 'performance' && <PerformanceView />}
            {currentView === 'digest' && <DailyDigestView model={model} onNavigate={(view) => setCurrentView(view as any)} />}
            {currentView === 'syllabus' && <SyllabusTracker />}
            {currentView === 'affairs' && <CurrentAffairsView model={model} />}
            {currentView === 'rss-reader' && <RssReaderView model={model} onNavigate={setCurrentView} />}
            {currentView === 'mistake-book' && <MistakeBookView />}
            {currentView === 'data-bank' && <DataBankView model={model} />}
          </div>
        </div>
      </main>

      {/* Dynamic Eye Saver TrueTone-like warm overlay filter screen */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9999] transition-all duration-300" 
        style={{ backgroundColor: 'var(--dynamic-eye-saver-tint, transparent)' }} 
      />

      {/* Global Keyboard Shortcuts Modal Guide */}
      <KeyboardShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />

      {/* Global Quick Note Floating Action Button (FAB) */}
      {!isWhiteboardFullScreen && !isFocusedReading && (
        <button
          onClick={() => {
            setIsQuickNoteOpen(true);
            // Sweet dynamic musical chime on user tap
            if (window.AudioContext || (window as any).webkitAudioContext) {
              try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = "sine";
                osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                gain.gain.setValueAtTime(0.04, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                osc.start();
                osc.stop(ctx.currentTime + 0.1);
              } catch (_) {}
            }
          }}
          className="fixed bottom-6 right-6 z-[100] flex items-center justify-center p-3.5 bg-accent text-white hover:bg-accent/90 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all outline-none border border-accent/20 cursor-pointer group"
          title="Write a transient Quick Note (Alt+N)"
        >
          <PenTool className="w-5 h-5" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-500 ease-out font-black uppercase tracking-widest text-[10px] whitespace-nowrap">
            Scratchpad
          </span>
        </button>
      )}

      {/* Global Quick Notes Scratchpad Modal */}
      <QuickNoteModal isOpen={isQuickNoteOpen} onClose={() => setIsQuickNoteOpen(false)} />
    </div>
  );
}
