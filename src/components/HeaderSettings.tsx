import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Settings2, Palette, Cpu, X, User } from "lucide-react";
import { Theme } from "../App";
import { DeepSeekModel } from "../types";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { DriveBackupButton } from "./DriveBackupButton";
import { SyncStatusIndicator } from "./SyncStatusIndicator";

interface HeaderSettingsProps {
  theme: Theme;
  setTheme: (t: Theme) => void;
  model: DeepSeekModel;
  setModel: (m: DeepSeekModel) => void;
  glassMode: boolean;
  setGlassMode: (g: boolean) => void;
  readerFont: string;
  setReaderFont: (f: string) => void;
  readerFontSize: string;
  setReaderFontSize: (s: string) => void;
  readerLineHeight: string;
  setReaderLineHeight: (h: string) => void;
  eyeSaverTint: string;
  setEyeSaverTint: (t: string) => void;
  readerContrast: string;
  setReaderContrast: (c: string) => void;
}

export interface ThemePreset {
  id: Theme;
  name: string;
  icon: string;
  appBg: string;
  panelBg: string;
  accent: string;
  text: string;
  border: string;
  dark: boolean;
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: "default", name: "Light Minimalist", icon: "☀️", appBg: "#f8fafc", panelBg: "#ffffff", accent: "#3b82f6", text: "#0f172a", border: "#e2e8f0", dark: false },
  { id: "dark", name: "No Nonsense Dark", icon: "🌙", appBg: "#121212", panelBg: "#1e1e1e", accent: "#3b82f6", text: "#f3f4f6", border: "#333333", dark: true },
  { id: "white", name: "Plain White", icon: "⬜", appBg: "#ffffff", panelBg: "#ffffff", accent: "#2563eb", text: "#000000", border: "#e5e5e5", dark: false },
  { id: "sepia", name: "Warm Sepia (Easy)", icon: "☕", appBg: "#f4ecd8", panelBg: "#fffaed", accent: "#d97706", text: "#433422", border: "#e5d9c5", dark: false },
  { id: "amoled", name: "Pure AMOLED Dark", icon: "🌌", appBg: "#000000", panelBg: "#0a0a0a", accent: "#8b5cf6", text: "#f8fafc", border: "#1a1a1a", dark: true },
  { id: "nord", name: "Nord Arctic Frost", icon: "❄️", appBg: "#2e3440", panelBg: "#3b4252", accent: "#88c0d0", text: "#eceff4", border: "#4c566a", dark: true },
  { id: "midnight", name: "Midnight Glass", icon: "🌙", appBg: "#0b0f19", panelBg: "#111827", accent: "#6366f1", text: "#f3f4f6", border: "#374151", dark: true },
  { id: "cyberpunk", name: "Cyberpunk Neon", icon: "⚡", appBg: "#0d0221", panelBg: "#000000", accent: "#f91880", text: "#0ff0fc", border: "#0ff0fc", dark: true },
  { id: "sunset", name: "Sunset Gold", icon: "🌇", appBg: "#fff1e6", panelBg: "#ffffff", accent: "#dc2f02", text: "#3d0c02", border: "#ffecd1", dark: false },
  { id: "ocean", name: "Ocean Breeze", icon: "🌊", appBg: "#0f172a", panelBg: "#1e293b", accent: "#0ea5e9", text: "#f0f9ff", border: "#0ea5e9", dark: true },
  { id: "forest", name: "Forest Moss", icon: "🌱", appBg: "#143601", panelBg: "#1a4301", accent: "#538d22", text: "#e9f5db", border: "#538d22", dark: true },
  { id: "lavender", name: "Provence Lavender", icon: "🪻", appBg: "#f3e8ff", panelBg: "#faf5ff", accent: "#c084fc", text: "#3b0764", border: "#d8b4fe", dark: false },
  { id: "frost", name: "Frost Glass", icon: "🎐", appBg: "#e0f2fe", panelBg: "#f0f9ff", accent: "#0284c7", text: "#0c4a6e", border: "#bae6fd", dark: false },
  { id: "gruvbox", name: "Gruvbox retro-warm", icon: "🎨", appBg: "#282828", panelBg: "#3c3836", accent: "#fabd2f", text: "#ebdbb2", border: "#504945", dark: true },
  { id: "obsidian", name: "Slate Obsidian", icon: "🪨", appBg: "#0d0d0d", panelBg: "#141414", accent: "#a366ff", text: "#f0f0f0", border: "#2b2b2b", dark: true },
  { id: "eink", name: "Paper E-Ink Reader", icon: "📄", appBg: "#e5e5e5", panelBg: "#e5e5e5", accent: "#333333", text: "#111111", border: "#c9c9c9", dark: false },
  { id: "sage", name: "Soothing Sage Mint", icon: "🍃", appBg: "#ecf3ef", panelBg: "#f5faf7", accent: "#10b981", text: "#1e2e25", border: "#d3e2da", dark: false },
  { id: "latte", name: "Premium Cozy Latte", icon: "☕", appBg: "#fcf7f2", panelBg: "#ffffff", accent: "#d97706", text: "#2c221a", border: "#f2e6dc", dark: false },
  { id: "serenity", name: "Serenity Deep Work", icon: "🕊️", appBg: "#eef2f6", panelBg: "#ffffff", accent: "#5c8d83", text: "#2d3748", border: "#dbe3eb", dark: false },
  { id: "dracula", name: "Dracula Focus", icon: "🦇", appBg: "#282a36", panelBg: "#44475a", accent: "#bd93f9", text: "#f8f8f2", border: "#6272a4", dark: true },
  { id: "solarized-light", name: "Solarized Light", icon: "☀️", appBg: "#fdf6e3", panelBg: "#eee8d5", accent: "#268bd2", text: "#657b83", border: "#93a1a1", dark: false },
  { id: "solarized-dark", name: "Solarized Dark", icon: "🌑", appBg: "#002b36", panelBg: "#073642", accent: "#2aa198", text: "#839496", border: "#586e75", dark: true },
  { id: "tokyo-night", name: "Tokyo Night", icon: "🗼", appBg: "#1a1b26", panelBg: "#24283b", accent: "#7aa2f7", text: "#c0caf5", border: "#414868", dark: true },
  { id: "high-contrast", name: "High Contrast", icon: "👁️", appBg: "#000000", panelBg: "#000000", accent: "#ffff00", text: "#ffffff", border: "#ffffff", dark: true }
];

export function HeaderSettings({
  theme,
  setTheme,
  model,
  setModel,
  glassMode,
  setGlassMode,
  readerFont,
  setReaderFont,
  readerFontSize,
  setReaderFontSize,
  readerLineHeight,
  setReaderLineHeight,
  eyeSaverTint,
  setEyeSaverTint,
  readerContrast,
  setReaderContrast,
}: HeaderSettingsProps) {
  const [open, setOpen] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState<Theme | null>(null);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-full transition-colors text-muted hover:text-main hover:bg-input cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:ring-offset-background/50"
        title="Settings"
        aria-label="Settings"
      >
        <Settings2 className="w-5 h-5 animate-hover-spin" />
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-panel border border-panel-border rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-panel-border bg-panel/80 backdrop-blur-md">
              <h2 className="text-2xl font-bold text-main flex items-center gap-2">
                <Settings2 className="w-6 h-6 text-accent" />
                Settings
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 -mr-2 text-muted hover:text-main hover:bg-input rounded-full transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10">
              
              {/* Account & Sync */}
              <section className="space-y-4">
                <h3 className="text-[11px] font-bold tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" /> Account & Data
                </h3>
                <div className="bg-input/40 border border-panel-border/80 rounded-2xl p-5 md:p-6 space-y-6 shadow-sm">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-main text-sm">Google Account</h4>
                      <p className="text-[11px] text-muted">Sign in securely to unlock workspace synchronization.</p>
                    </div>
                    <div className="flex items-center w-full sm:w-auto">
                      <GoogleAuthButton />
                    </div>
                  </div>
                  
                  <div className="h-px bg-panel-border/30 w-full" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-main text-sm">Drive Backup & Sync</h4>
                        <SyncStatusIndicator />
                      </div>
                      <p className="text-[11px] text-muted">Securely backup your research progress in your personal Google Drive.</p>
                    </div>
                    <div className="flex items-center w-full sm:w-auto">
                      <DriveBackupButton />
                    </div>
                  </div>

                </div>
              </section>

              {/* Appearance */}
              <section className="space-y-4">
                <h3 className="text-[11px] font-bold tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                  <Palette className="w-4 h-4 text-accent" /> Appearance & Theme Controls
                </h3>
                <div className="bg-input/40 border border-panel-border/80 rounded-2xl p-5 md:p-6 space-y-6 shadow-sm">
                  {/* Theme Selector Section */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-panel-border/30 pb-3">
                      <div>
                        <label className="text-sm font-bold text-main block">Interface Theme Preset</label>
                        <p className="text-[11px] text-muted">Hover to preview palette swatches; click a card to style the environment.</p>
                      </div>

                      {/* Active / Hover color swatches container */}
                      {(() => {
                        const hoveredPreset = THEME_PRESETS.find(p => p.id === hoveredTheme);
                        const activePreset = THEME_PRESETS.find(p => p.id === theme);
                        const displayPreset = hoveredPreset || activePreset;
                        return (
                          <div className="flex items-center gap-2.5 bg-panel/70 border border-panel-border px-3 py-1.5 rounded-xl transition-all duration-300 shadow-sm shrink-0">
                            <span className="text-[10px] font-black uppercase text-muted tracking-wider">
                              {hoveredPreset ? `Previewing: ${hoveredPreset.name}` : `Active: ${activePreset?.name}`}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-4 h-4 rounded-full border border-panel-border/60 inline-block shadow-sm transition-transform duration-300 scale-105 hover:scale-125"
                                style={{ backgroundColor: displayPreset?.appBg }}
                                title="App Canvas Color"
                              />
                              <span
                                className="w-4 h-4 rounded-full border border-panel-border/60 inline-block shadow-sm transition-transform duration-300 scale-105 hover:scale-125"
                                style={{ backgroundColor: displayPreset?.panelBg }}
                                title="Cards & Panels"
                              />
                              <span
                                className="w-4 h-4 rounded-full border border-panel-border/60 inline-block shadow-sm transition-transform duration-300 scale-105 hover:scale-125"
                                style={{ backgroundColor: displayPreset?.accent }}
                                title="Primary Accent Hue"
                              />
                              <span
                                className="w-4 h-4 rounded-full border border-panel-border/60 inline-block shadow-sm transition-transform duration-300 scale-105 hover:scale-125"
                                style={{ backgroundColor: displayPreset?.text }}
                                title="Main Text Focus"
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Interactive Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {THEME_PRESETS.map((preset) => {
                        const isSelected = theme === preset.id;
                        const isHovered = hoveredTheme === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setTheme(preset.id);
                              // Simple acoustic chime feedback
                              if (window.AudioContext || (window as any).webkitAudioContext) {
                                try {
                                  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                                  const osc = ctx.createOscillator();
                                  const gain = ctx.createGain();
                                  osc.connect(gain);
                                  gain.connect(ctx.destination);
                                  osc.type = "sine";
                                  osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
                                  gain.gain.setValueAtTime(0.03, ctx.currentTime);
                                  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
                                  osc.start();
                                  osc.stop(ctx.currentTime + 0.12);
                                } catch (_) {}
                              }
                            }}
                            onMouseEnter={() => setHoveredTheme(preset.id)}
                            onMouseLeave={() => setHoveredTheme(null)}
                            className={`relative flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "bg-accent/15 border-accent shadow-sm scale-[1.02] z-10"
                                : "bg-panel/40 border-panel-border/60 hover:bg-panel/85 hover:border-panel-border/90 hover:scale-[1.02] hover:shadow-xs"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-base select-none shrink-0" role="img">
                                {preset.icon}
                              </span>
                              <div className="min-w-0">
                                <span className={`text-[11px] font-black text-main block truncate ${isSelected ? "text-accent" : ""}`}>
                                  {preset.name}
                                </span>
                                <span className="text-[9px] text-muted font-bold block">
                                  {preset.dark ? "Dark Theme" : "Light Theme"}
                                </span>
                              </div>
                            </div>

                            {/* Small live color palette swatch */}
                            <div className={`flex items-center gap-1 p-1 rounded-lg bg-input/40 border border-panel-border/30 transition-all duration-200 ${isHovered ? "scale-105 bg-input/60" : ""}`}>
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block transition-transform duration-150"
                                style={{ backgroundColor: preset.appBg }}
                                title="App BG"
                              />
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block transition-transform duration-150"
                                style={{ backgroundColor: preset.panelBg }}
                                title="Panel BG"
                              />
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block transition-transform duration-150"
                                style={{ backgroundColor: preset.accent }}
                                title="Accent"
                              />
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block transition-transform duration-150"
                                style={{ backgroundColor: preset.text }}
                                title="Text"
                              />
                            </div>

                            {/* Active marker indicator */}
                            {isSelected && (
                              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-px bg-panel-border/30 w-full" />

                  {/* Backdrop glass setting */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-main block">Glass Mode Backdrop</label>
                    <div className="flex items-center gap-3 p-2.5 bg-panel/40 rounded-xl border border-panel-border/50">
                      <button
                        type="button"
                        onClick={() => setGlassMode(!glassMode)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-sm ${glassMode ? "bg-accent" : "bg-panel-border"}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${glassMode ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </button>
                      <span className="text-[11px] font-semibold text-main">
                        {glassMode ? "Frosted Glass Enabled" : "Flat Panels"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Robust Text Rendering & Eye-Safe Preferences */}
                <div className="space-y-3 mt-4 pt-1">
                  <h4 className="text-[11px] font-bold text-main uppercase tracking-wider flex items-center gap-2">
                    📖 Eye-Comfort Reader Customization (For deep reading sessions)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-accent/5 border border-accent/10 rounded-2xl p-5 shadow-inner">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-muted tracking-wide block">Reading Font Face</label>
                      <select
                        value={readerFont}
                        onChange={(e) => setReaderFont(e.target.value)}
                        className="w-full bg-panel border border-panel-border rounded-xl px-2.5 py-1.5 text-[11px] text-main outline-none focus:border-accent cursor-pointer"
                      >
                        <option value="inter">Inter (Default Modern Sans)</option>
                        <option value="lora">Lora (Warm Scholar Serif)</option>
                        <option value="merriweather">Merriweather (Readability Serif)</option>
                        <option value="jetbrains">JetBrains Mono (Logical Technical)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-muted tracking-wide block">Text Scale Size</label>
                      <select
                        value={readerFontSize}
                        onChange={(e) => setReaderFontSize(e.target.value)}
                        className="w-full bg-panel border border-panel-border rounded-xl px-2.5 py-1.5 text-[11px] text-main outline-none focus:border-accent cursor-pointer"
                      >
                        <option value="sm">Small (14px)</option>
                        <option value="base">Normal Standard (16px)</option>
                        <option value="lg">Medium-Large (18px)</option>
                        <option value="xl">Comfortable Large (20px)</option>
                        <option value="2xl">Oversized Ease (22px)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-muted tracking-wide block">Line Height Spacing</label>
                      <select
                        value={readerLineHeight}
                        onChange={(e) => setReaderLineHeight(e.target.value)}
                        className="w-full bg-panel border border-panel-border rounded-xl px-2.5 py-1.5 text-[11px] text-main outline-none focus:border-accent cursor-pointer"
                      >
                        <option value="tight">Cozy / Compact</option>
                        <option value="normal">Relaxed Standard</option>
                        <option value="relaxed">Spacious (Highly legible)</option>
                        <option value="loose">Ultra Air Double-space</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-muted tracking-wide block">Eye-Saver Warmth Tint</label>
                      <select
                        value={eyeSaverTint}
                        onChange={(e) => setEyeSaverTint(e.target.value)}
                        className="w-full bg-panel border border-panel-border rounded-xl px-2.5 py-1.5 text-[11px] text-main outline-none focus:border-accent cursor-pointer"
                      >
                        <option value="none">Off (No Tint overlay)</option>
                        <option value="sepia">Warm Paper (Sepia 4%) 📄</option>
                        <option value="candle">Eye Saver (Amber TrueTone 8%) 🕯️</option>
                        <option value="dim">Night Dimmer (Soft backdrop 4%) 🌒</option>
                      </select>
                    </div>

                    <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                      <label className="text-[11px] font-black uppercase text-muted tracking-wide block">Text Contrast Optimizer</label>
                      <select
                        value={readerContrast}
                        onChange={(e) => setReaderContrast(e.target.value)}
                        className="w-full bg-panel border border-panel-border rounded-xl px-2.5 py-1.5 text-[11px] text-main outline-none focus:border-accent cursor-pointer"
                      >
                        <option value="normal">Balanced Dynamic Default</option>
                        <option value="low">Soft Contrast (Reduced brightness strain)</option>
                        <option value="high">High Contrast (Rich rendering clarity)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* AI Details */}
              <section className="space-y-4">
                <h3 className="text-[11px] font-bold tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-accent" /> Cognitive Core
                </h3>
                <div className="bg-input/40 border border-panel-border/80 rounded-2xl p-5 md:p-6 shadow-sm">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-main block">Model Choice</label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value as DeepSeekModel)}
                      className="w-full md:w-1/2 bg-panel border border-panel-border rounded-xl px-3 py-2 text-sm text-main outline-none focus:border-accent shadow-sm cursor-pointer"
                    >
                      <option value="deepseek-chat">High-Speed AI Core</option>
                      <option value="deepseek-reasoner">Deep Reasoning Elite</option>
                    </select>
                  </div>
                </div>
              </section>
              
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
