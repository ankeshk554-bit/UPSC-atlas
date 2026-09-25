import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Target, X, CheckCircle2, ChevronDown, ListPlus } from "lucide-react";
import { safeLocalStorageGet, safeLocalStorageSet } from "../lib/storage";

type TimerMode = "focus" | "break";
const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const SUBJECTS = [
  "GS 1",
  "GS 2",
  "GS 3",
  "GS 4",
  "Essay",
  "Optional Paper 1",
  "Optional Paper 2",
  "CSAT",
  "Current Affairs",
];

export function DeepWorkTimer() {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(() =>
    parseInt(localStorage.getItem("upsc_sessions_count") || "0"),
  );
  
  const [isSeries, setIsSeries] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [subject, setSubject] = useState(() => localStorage.getItem("upsc_current_focus_subject") || "GS 1");
  const [topic, setTopic] = useState(() => localStorage.getItem("upsc_current_focus_topic") || "");
  const [showSubjectSelect, setShowSubjectSelect] = useState(false);

  const timerEndAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    timerEndAudio.current = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    );
  }, []);

  useEffect(() => {
    localStorage.setItem("upsc_sessions_count", sessions.toString());
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("upsc_current_focus_subject", subject);
  }, [subject]);

  useEffect(() => {
    localStorage.setItem("upsc_current_focus_topic", topic);
  }, [topic]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      timerEndAudio.current?.play().catch(e => console.log("Audio play blocked", e));
      if (mode === "focus") {
        setSessions((prev) => prev + 1);
        if (!isSeries) setShowNotification(true);

        try {
          const nowStr = new Date().toISOString();
          const today = nowStr.split("T")[0];

          // 1. Sync to deep work logs
          const existingLogs = safeLocalStorageGet<any[]>("upsc_deep_work_logs", []);
          const newLog = {
            id: `pomodoro-${Date.now()}`,
            date: nowStr,
            durationMinutes: 25,
            subject: subject,
            topic: topic.trim() || `${subject} Focus Session`
          };
          safeLocalStorageSet("upsc_deep_work_logs", [...existingLogs, newLog]);

          // 2. Sync to deep work stats (daily aggregation)
          const dwStats = safeLocalStorageGet<Record<string, number>>("upsc_deep_work_stats", {});
          dwStats[today] = (dwStats[today] || 0) + 25;
          safeLocalStorageSet("upsc_deep_work_stats", dwStats);

          // 3. Notify all open views and charts
          window.dispatchEvent(new Event("deep_work_log_added"));
          window.dispatchEvent(new Event("app:deepWorkUpdated"));
        } catch (e) {
          console.error("Failed to record deep work session log:", e);
        }
      }
      
      if (isSeries) {
        const nextMode = mode === "focus" ? "break" : "focus";
        setMode(nextMode);
        setTimeLeft(nextMode === "focus" ? WORK_TIME : BREAK_TIME);
        setIsActive(true);
      } else {
        const nextMode = mode === "focus" ? "break" : "focus";
        setMode(nextMode);
        setTimeLeft(nextMode === "focus" ? WORK_TIME : BREAK_TIME);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, subject, topic, isSeries]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "focus" ? WORK_TIME : BREAK_TIME);
  };

  const toggleMode = () => {
    const nextMode = mode === "focus" ? "break" : "focus";
    setMode(nextMode);
    setIsActive(false);
    setTimeLeft(nextMode === "focus" ? WORK_TIME : BREAK_TIME);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative group/timer">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-panel border border-panel-border rounded-full shadow-sm hover:border-accent/30 transition-all">
        
        <button
           onClick={() => setShowSubjectSelect(!showSubjectSelect)}
           className={`flex items-center gap-1 px-2 py-0.5 rounded-full border border-transparent hover:border-panel-border transition-colors text-[10px] font-bold tracking-wider uppercase ${mode === "focus" ? "text-accent" : "text-emerald-500"}`}
           title="Change Focus Subject"
        >
           {subject.substring(0,4)}
           <ChevronDown className="w-3 h-3 opacity-50" />
        </button>

        <div className="w-px h-4 bg-panel-border/60 mx-1" />

        <button
          onClick={toggleMode}
          className={`font-mono text-sm font-black w-14 text-center tracking-tighter ${
            mode === "focus" ? "text-main" : "text-emerald-500"
          }`}
          title={mode === "focus" ? "Switch to Break" : "Switch to Focus"}
        >
          {formatTime(timeLeft)}
        </button>
        
        <div className="w-px h-4 bg-panel-border/60 mx-1" />
        
        <div className="flex items-center gap-0.5">
          <button
            onClick={toggleTimer}
            className={`p-1.5 rounded-full transition-colors ${isActive ? "text-main bg-panel-border/50" : "text-muted hover:text-main hover:bg-panel-border/50"}`}
          >
            {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>
          
          <button
            onClick={resetTimer}
            className="p-1.5 rounded-full text-muted hover:text-main hover:bg-panel-border/50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => setIsSeries(!isSeries)}
            title="Auto-Series Mode (Continuous Focus/Break Loop)"
            className={`p-1.5 rounded-full transition-colors ${isSeries ? "text-accent bg-accent/10" : "text-muted hover:text-main hover:bg-panel-border/50"}`}
          >
            <ListPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Session completion visual indicator pulse */}
      {sessions > 0 && (
         <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 bg-accent text-white text-[9px] font-black rounded-full shadow-sm ring-2 ring-background z-10" title={`${sessions} Focus Sessions Completed Today`}>
            {sessions}
         </div>
      )}

      {showNotification && (
        <div className="absolute top-[120%] right-0 mt-1 w-64 bg-panel border border-panel-border rounded-xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
           <div className="flex items-start justify-between mb-2">
             <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" /> Deep Work Complete
             </div>
             <button onClick={() => setShowNotification(false)} className="text-muted hover:text-main">
                <X className="w-4 h-4" />
             </button>
           </div>
           <p className="text-[11px] text-muted mb-4 font-semibold">Great focus on <strong className="text-main">{subject}</strong>. Take a 5-minute break to consolidate memory.</p>
           <button 
             onClick={() => {
                setShowNotification(false);
                toggleMode();
                setIsActive(true);
             }}
             className="w-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 py-2 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-colors"
           >
             Start Break Timer
           </button>
        </div>
      )}

      {showSubjectSelect && (
        <div className="absolute top-[120%] right-0 mt-1 w-56 bg-panel border border-panel-border rounded-xl shadow-xl z-50 p-3 animate-in fade-in slide-in-from-top-2">
           <h4 className="text-[11px] font-bold text-muted mb-2 uppercase tracking-wide">Focus Session Setting</h4>
           <div className="space-y-3">
             <div>
               <label className="text-[11px] text-muted block mb-1">Subject</label>
               <select
                 value={subject}
                 onChange={(e) => setSubject(e.target.value)}
                 className="w-full text-sm bg-input border border-panel-border rounded-lg p-2 outline-none focus:border-accent"
               >
                 {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
             <div>
               <label className="text-[11px] text-muted block mb-1">Topic (optional)</label>
               <input
                 type="text"
                 value={topic}
                 onChange={(e) => setTopic(e.target.value)}
                 placeholder="e.g. Fundamental Rights"
                 className="w-full text-sm bg-input border border-panel-border rounded-lg p-2 outline-none focus:border-accent"
               />
             </div>
             <button
                 onClick={() => setShowSubjectSelect(false)}
                className="w-full py-1.5 bg-accent text-white rounded-lg text-[11px] font-bold"
             >
                Done
             </button>
           </div>
        </div>
      )}
    </div>
  );
}
