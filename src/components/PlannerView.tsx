import { apiFetch } from '../lib/api';
import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  Target,
  CalendarDays,
  Edit2,
  X,
  RefreshCw,
  Download,
} from "lucide-react";
import { DeepSeekModel } from "../types";
import { getAccessToken, connectGoogleDrive, invalidateGoogleAccess } from "../lib/auth";

interface Task {
  id: string;
  timeBlock: string;
  title: string;
  type: "Study" | "Revision" | "Mock Test" | "Break" | "Other";
  completed: boolean;
}

const defaultTasks: Task[] = [
  {
    id: "1",
    timeBlock: "08:00 AM - 10:00 AM",
    title: "GS2: Parliament Structure and Functioning",
    type: "Study",
    completed: false,
  },
  {
    id: "2",
    timeBlock: "10:00 AM - 10:30 AM",
    title: "Tea Break & Newspaper Skimming",
    type: "Break",
    completed: false,
  },
  {
    id: "3",
    timeBlock: "10:30 AM - 12:30 PM",
    title: "Current Affairs Notes Compilation",
    type: "Study",
    completed: false,
  },
  {
    id: "4",
    timeBlock: "02:00 PM - 04:00 PM",
    title: "Optional Subject Paper 1",
    type: "Study",
    completed: false,
  },
  {
    id: "5",
    timeBlock: "04:30 PM - 06:00 PM",
    title: "Answer Writing Practice (2 Questions)",
    type: "Revision",
    completed: false,
  },
];

export function PlannerView({ model }: { model: DeepSeekModel }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("upsc_daily_planner");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return defaultTasks;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [genError, setGenError] = useState("");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Google Calendar Integration states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFetchingEvents, setIsFetchingEvents] = useState(false);
  const [importDateOption, setImportDateOption] = useState<"today" | "tomorrow">("today");
  const [draftTasks, setDraftTasks] = useState<{
    id: string;
    timeBlock: string;
    title: string;
    type: "Study" | "Revision" | "Mock Test" | "Break" | "Other";
    selected: boolean;
  }[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  const [newTask, setNewTask] = useState<Partial<Task>>({
    timeBlock: "09:00 AM - 10:00 AM",
    title: "",
    type: "Study",
  });

  useEffect(() => {
    localStorage.setItem("upsc_daily_planner", JSON.stringify(tasks));
    window.dispatchEvent(new Event("app:plannerUpdated"));
  }, [tasks]);

  const toggleTaskCompletion = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleSyncToCalendar = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus(null);
      let token = await getAccessToken();

      // If we don't have a token, we must request it now.
      if (!token) {
        try {
          const result = { accessToken: await connectGoogleDrive() };
          if (result) {
            token = result.accessToken;
          }
        } catch (err: any) {
          console.error("Sign in failed:", err);
          const errMsg = err.message || String(err);
          if (errMsg.includes("popup-closed-by-user") || err.code === "auth/popup-closed-by-user") {
            throw new Error(
              "Sign-in popup was blocked or closed. 💡 Solution: This preview runs in an iframe where browser security rules block popups. Please click 'Open in New Tab' (top-right of screen), allow popups in your address bar, and try again!"
            );
          }
          throw new Error(
            `Unable to sign in. Please allow popups and try again. Error: ${errMsg}`,
          );
        }
      }

      if (!token) {
        throw new Error("Please sign in to sync with Google Calendar");
      }

      const confirmed = window.confirm(
        `Are you sure you want to add ${tasks.length} tasks to your primary Google Calendar for today?`,
      );
      if (!confirmed) {
        setIsSyncing(false);
        return;
      }

      let addedCount = 0;
      let skippedCount = 0;

      for (const task of tasks) {
        const times = task.timeBlock.split(/-|to/i);
        if (times.length >= 2) {
          const startStr = times[0].trim();
          const endStr = times[1].trim();

          const parseTime = (timeStr: string) => {
            const match = timeStr.match(/(\d+):?(\d+)?\s*(AM|PM)/i);
            if (match) {
              let hours = parseInt(match[1], 10);
              const minutes = parseInt(match[2] || "0", 10);
              const period = match[3].toUpperCase();
              if (period === "PM" && hours < 12) hours += 12;
              if (period === "AM" && hours === 12) hours = 0;
              const date = new Date();
              date.setHours(hours, minutes, 0, 0);
              return date;
            }
            return null;
          };

          const startTime = parseTime(startStr);
          const endTime = parseTime(endStr);

          if (startTime && endTime) {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const event = {
              summary: `UPSC: ${task.title}`,
              description: `Task Type: ${task.type}`,
              start: { dateTime: startTime.toISOString(), timeZone: tz },
              end: { dateTime: endTime.toISOString(), timeZone: tz },
            };

            const rawUrl = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
            const res = await apiFetch(
              `/api/google-proxy?url=${encodeURIComponent(rawUrl)}`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(event),
              },
            );

            if (res.ok) {
              addedCount++;
            } else {
              const errorData = await res.json();
              if (res.status === 401 || res.status === 403) {
                invalidateGoogleAccess();
                throw new Error(
                  "Permission denied. Logged out, please try syncing again to grant Calendar access.",
                );
              } else {
                throw new Error(
                  errorData.error?.message || "Failed to sync to Calendar",
                );
              }
            }
          } else {
            console.warn(`Could not parse time for task: ${task.timeBlock}`);
            skippedCount++;
          }
        } else {
          skippedCount++;
        }
      }

      setSyncStatus(
        `Successfully added ${addedCount} tasks to Calendar!${skippedCount > 0 ? ` (${skippedCount} skipped due to time format)` : ""}`,
      );
      setTimeout(() => setSyncStatus(null), 5000);
    } catch (err: any) {
      console.error(err);
      setSyncStatus(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatTimeRange = (startStr: string, endStr: string) => {
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      
      const formatTime = (date: Date) => {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        const hoursStr = hours < 10 ? `0${hours}` : hours;
        const minStr = minutes < 10 ? `0${minutes}` : minutes;
        return `${hoursStr}:${minStr} ${ampm}`;
      };

      return `${formatTime(start)} - ${formatTime(end)}`;
    } catch (e) {
      return "09:00 AM - 10:00 AM";
    }
  };

  const fetchCalendarEvents = async (dateOption: "today" | "tomorrow" = "today") => {
    setIsFetchingEvents(true);
    setImportError(null);
    try {
      let token = await getAccessToken();
      if (!token) {
        try {
          const result = { accessToken: await connectGoogleDrive() };
          if (result) {
            token = result.accessToken;
          }
        } catch (err: any) {
          console.error("Sign in failed:", err);
          const errMsg = err.message || String(err);
          if (errMsg.includes("popup-closed-by-user") || err.code === "auth/popup-closed-by-user") {
            throw new Error(
              "Sign-in popup was blocked or closed. 💡 Solution: This preview runs in an iframe where browser security rules block popups. Please click 'Open in New Tab' (top-right of screen), allow popups in your address bar, and try again!"
            );
          }
          throw new Error(
            `Unable to sign in. Please allow popups and try again. Error: ${errMsg}`,
          );
        }
      }

      if (!token) {
        throw new Error("Google Calendar permission of active user is required to import events.");
      }

      // Compute boundaries
      const date = new Date();
      if (dateOption === "tomorrow") {
        date.setDate(date.getDate() + 1);
      }
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const rawUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(startOfDay.toISOString())}&timeMax=${encodeURIComponent(endOfDay.toISOString())}&singleEvents=true&orderBy=startTime`;
      const url = `/api/google-proxy?url=${encodeURIComponent(rawUrl)}`;
      
      const res = await apiFetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          invalidateGoogleAccess();
          throw new Error("Authentication session expired. Please click 'Import' again to log back in.");
        }
        throw new Error(`Failed to fetch events from Google Calendar (${res.status})`);
      }

      const data = await res.json();
      const items = data.items || [];

      const parsed = items.map((item: any, idx: number) => {
        const title = item.summary || "Untitled Event";
        
        // Auto categorize based on keywords
        let type: "Study" | "Revision" | "Mock Test" | "Break" | "Other" = "Study";
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes("test") || lowerTitle.includes("mock") || lowerTitle.includes("quiz") || lowerTitle.includes("paper")) {
          type = "Mock Test";
        } else if (lowerTitle.includes("revise") || lowerTitle.includes("revision") || lowerTitle.includes("recall") || lowerTitle.includes("compiled")) {
          type = "Revision";
        } else if (lowerTitle.includes("break") || lowerTitle.includes("tea") || lowerTitle.includes("coffee") || lowerTitle.includes("lunch") || lowerTitle.includes("dinner") || lowerTitle.includes("relax")) {
          type = "Break";
        } else if (lowerTitle.includes("other") || lowerTitle.includes("meeting") || lowerTitle.includes("call") || lowerTitle.includes("personal")) {
          type = "Other";
        }

        // Parse timeBlock
        let timeBlock = "09:00 AM - 10:00 AM";
        if (item.start?.date) {
          timeBlock = "All Day";
        } else if (item.start?.dateTime && item.end?.dateTime) {
          timeBlock = formatTimeRange(item.start.dateTime, item.end.dateTime);
        }

        return {
          id: `cal-${idx}-${Date.now()}`,
          timeBlock,
          title,
          type,
          selected: true
        };
      });

      setDraftTasks(parsed);
      setIsImportModalOpen(true);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || "Something went wrong while loading calendar events.";
      setImportError(errMsg);
      // Display diagnostic instructions in the main interface too so user is informed
      setSyncStatus(`Import failed: ${errMsg}`);
      // Keep error message open longer for user to read solutions
      setTimeout(() => setSyncStatus(null), 15000);
    } finally {
      setIsFetchingEvents(false);
    }
  };

  const handleImportDraftTasks = (overwrite: boolean) => {
    const selected = draftTasks.filter(d => d.selected).map(d => ({
      id: d.id,
      timeBlock: d.timeBlock,
      title: d.title,
      type: d.type,
      completed: false
    }));

    if (selected.length === 0) {
      setImportError("Please select at least one task to import.");
      return;
    }

    if (overwrite) {
      setTasks(selected);
    } else {
      setTasks(prev => [...prev, ...selected]);
    }

    setIsImportModalOpen(false);
    setSyncStatus(`Successfully imported ${selected.length} tasks from Google Calendar!`);
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const handleGeneratePlan = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGenError("");

    try {
      const res = await apiFetch("/api/planner-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate plan");

      if (data.tasks && Array.isArray(data.tasks)) {
        const generatedTasks: Task[] = data.tasks.map((t: any) => ({
          ...t,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          completed: false,
        }));
        setTasks(generatedTasks);
        setIsAiModalOpen(false);
        setPrompt("");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      setGenError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.timeBlock) return;

    const taskItem: Task = {
      id: Date.now().toString(),
      timeBlock: newTask.timeBlock,
      title: newTask.title,
      type: (newTask.type as any) || "Study",
      completed: false,
    };

    setTasks([...tasks, taskItem]);
    setIsTaskModalOpen(false);
    setNewTask({ timeBlock: "09:00 AM - 10:00 AM", title: "", type: "Study" });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Study":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "Revision":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Mock Test":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "Break":
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default:
        return "bg-accent/10 text-accent border-accent/20";
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  return (
    <div className="h-full flex flex-col bg-transparent overflow-y-auto">
      <div className="p-8 max-w-4xl mx-auto w-full flex-1 pb-16">
        <header className="mb-10 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-panel shadow-sm text-accent">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-main mb-2">
              Daily Micro-Planner
            </h2>
            <p className="text-muted text-[15px]">
              Time-block your day, track progress, and use AI to generate
              balanced schedules.
            </p>
          </div>
        </header>

        {syncStatus && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-bold text-center ${syncStatus.includes("failed") ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}
          >
            {syncStatus}
          </div>
        )}

        {/* Progress Overview Header */}
        <div className="glass-panel p-6 rounded-3xl shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-panel-border"
                  fill="none"
                  strokeWidth="3"
                  stroke="currentColor"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-accent transition-all duration-1000 ease-in-out"
                  fill="none"
                  strokeWidth="3"
                  strokeDasharray={`${progressPercent}, 100`}
                  stroke="currentColor"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-bold text-main">
                {progressPercent}%
              </span>
            </div>
            <div>
              <p className="text-[13px] font-bold text-muted uppercase tracking-wider mb-1">
                Today's Progress
              </p>
              <h3 className="text-2xl font-bold text-main">
                {completedCount} of {tasks.length} Tasks Done
              </h3>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto flex-wrap">
            <button
              onClick={() => fetchCalendarEvents("today")}
              disabled={isFetchingEvents}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-accent/10 border border-accent/20 text-accent px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-accent hover:text-white transition-all shadow-sm disabled:opacity-50"
              title="Import tasks and deadlines from Google Calendar"
            >
              {isFetchingEvents ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Import Calendar
            </button>
            <button
              onClick={handleSyncToCalendar}
              disabled={isSyncing || tasks.length === 0}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-accent/10 border border-accent/20 text-accent px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-accent hover:text-white transition-all shadow-sm disabled:opacity-50"
              title="Add current schedule to Google Calendar"
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Export Tasks
            </button>
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-accent/10 border border-accent/20 text-accent px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-accent hover:text-white transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4" /> AI Plan
            </button>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:bg-accent/90 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        </div>

        {/* Tasks View Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-main uppercase tracking-wider mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Your Schedule
          </h4>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex gap-4 p-4 rounded-2xl border transition-all ${
                  task.completed
                    ? "bg-panel-border/30 border-transparent opacity-60"
                    : "glass-panel border-panel-border/50 hover:shadow-md"
                }`}
              >
                <button
                  onClick={() => toggleTaskCompletion(task.id)}
                  className={`mt-1 shrink-0 flex items-center justify-center text-muted hover:text-accent transition-colors`}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted bg-input px-2 py-0.5 rounded-md text-nowrap">
                      <Clock className="w-3.5 h-3.5" /> {task.timeBlock}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getTypeColor(task.type)}`}
                    >
                      {task.type}
                    </span>
                  </div>
                  <p
                    className={`text-base font-semibold transition-colors ${task.completed ? "text-muted line-through" : "text-main"}`}
                  >
                    {task.title}
                  </p>
                </div>

                <div className="flex items-start shrink-0">
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="text-center py-20 glass-panel border-2 border-dashed rounded-3xl">
                <Target className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
                <p className="text-lg font-bold text-main mb-2">
                  No tasks planned for today
                </p>
                <p className="text-muted text-sm max-w-md mx-auto mb-6">
                  Add tasks manually or use AI to generate a structured
                  micro-plan.
                </p>
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="bg-accent text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-accent/90 transition-all inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Auto-Generate Schedule
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsAiModalOpen(false)}
          />
          <div className="relative w-full max-w-lg glass-panel rounded-3xl shadow-2xl p-6 md:p-8">
            <button
              onClick={() => setIsAiModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-muted hover:text-main bg-input hover:bg-panel-border rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold text-main mb-2 flex items-center gap-2 text-accent">
              <Sparkles className="w-6 h-6" /> AI Micro-Plan
            </h3>
            <p className="text-sm text-muted mb-6">
              Tell AI what you want to achieve today, and it will build a
              balanced, time-blocked schedule.
            </p>

            <textarea
              className="w-full glass-input rounded-xl px-4 py-4 text-sm text-main placeholder-muted focus:outline-none focus:border-accent min-h-[120px] resize-none mb-4"
              placeholder="E.g., I want to revise Complete Polity, give 1 mock test, and read today's Hindu newspaper. I start at 8 AM and can study till 8 PM."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            {genError && (
              <p className="text-red-500 text-sm mb-4 bg-red-500/10 p-3 rounded-lg">
                {genError}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-muted hover:text-main"
              >
                Cancel
              </button>
              <button
                onClick={handleGeneratePlan}
                disabled={isGenerating || !prompt.trim()}
                className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-bold shadow-md hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Generate Plan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsTaskModalOpen(false)}
          />
          <div className="relative w-full max-w-md glass-panel rounded-3xl shadow-2xl p-6 md:p-8">
            <button
              onClick={() => setIsTaskModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-muted hover:text-main bg-input hover:bg-panel-border rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold text-main mb-6">Add New Task</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                  Time Block
                </label>
                <input
                  type="text"
                  value={newTask.timeBlock}
                  onChange={(e) =>
                    setNewTask({ ...newTask, timeBlock: e.target.value })
                  }
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent"
                  placeholder="e.g., 09:00 AM - 10:00 AM"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                  Title / Description
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent"
                  placeholder="e.g., Revise modern history notes"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                  Task Type
                </label>
                <select
                  value={newTask.type}
                  onChange={(e) =>
                    setNewTask({ ...newTask, type: e.target.value as any })
                  }
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-main focus:outline-none focus:border-accent"
                >
                  <option value="Study">Study</option>
                  <option value="Revision">Revision</option>
                  <option value="Mock Test">Mock Test</option>
                  <option value="Break">Break</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-muted hover:text-main"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                disabled={!newTask.title || !newTask.timeBlock}
                className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-bold shadow-md hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Calendar Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsImportModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl glass-panel rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col max-h-[85vh] z-50">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-muted hover:text-main bg-input hover:bg-panel-border rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-main mb-1 flex items-center gap-2 text-accent">
                <CalendarIcon className="w-6 h-6 text-accent" />
                Import from Google Calendar
              </h3>
              <p className="text-sm text-muted">
                Select your events, tasks, or study deadlines to import directly into your daily micro-planner.
              </p>
            </div>

            {/* Date range switcher (Today vs Tomorrow) */}
            <div className="flex bg-input/40 rounded-xl p-1 border border-panel-border/60 self-start mb-6">
              <button
                onClick={() => {
                  setImportDateOption("today");
                  fetchCalendarEvents("today");
                }}
                disabled={isFetchingEvents}
                className={`px-4 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-colors ${importDateOption === "today" ? "bg-accent text-white" : "text-muted hover:text-main"}`}
              >
                Today's Events
              </button>
              <button
                onClick={() => {
                  setImportDateOption("tomorrow");
                  fetchCalendarEvents("tomorrow");
                }}
                disabled={isFetchingEvents}
                className={`px-4 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-colors ${importDateOption === "tomorrow" ? "bg-accent text-white" : "text-muted hover:text-main"}`}
              >
                Tomorrow's Events
              </button>
            </div>

            {isFetchingEvents ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <p className="text-sm font-bold text-muted">Querying Google Calendar events...</p>
              </div>
            ) : draftTasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <CalendarDays className="w-12 h-12 text-muted/40 mb-3" />
                <p className="text-base font-bold text-main">No calendar events found</p>
                <p className="text-[11px] text-muted max-w-sm mt-1">
                  We couldn't find any events on your calendar for {importDateOption}. Add some events on Google Calendar first or check another day.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 md:pr-2 mb-6">
                <div className="text-[11px] font-black uppercase tracking-wider text-muted flex items-center justify-between border-b border-panel-border/50 pb-2 mb-2">
                  <span>Detected Calendar Entries ({draftTasks.length})</span>
                  <span>Category Tag</span>
                </div>
                {draftTasks.map((draft) => (
                  <div
                    key={draft.id}
                    className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-all ${
                      draft.selected
                        ? "bg-accent/5 border-accent/20"
                        : "bg-transparent border-panel-border/40 opacity-50 hover:opacity-80"
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => {
                        setDraftTasks(
                          draftTasks.map((d) =>
                            d.id === draft.id ? { ...d, selected: !d.selected } : d
                          )
                        );
                      }}
                      className="shrink-0 text-muted hover:text-accent transition-all"
                    >
                      {draft.selected ? (
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-muted uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-accent" /> {draft.timeBlock}
                      </p>
                      <h4 className="text-sm font-bold text-main truncate mt-0.5">
                        {draft.title}
                      </h4>
                    </div>

                    {/* Type Selector Dropdown */}
                    <select
                      value={draft.type}
                      onChange={(e) => {
                        setDraftTasks(
                          draftTasks.map((d) =>
                            d.id === draft.id
                              ? { ...d, type: e.target.value as any }
                              : d
                          )
                        );
                      }}
                      className="bg-panel border border-panel-border rounded-xl px-3 py-1.5 text-[11px] text-main focus:outline-none focus:border-accent shrink-0 font-bold"
                    >
                      <option value="Study">Study</option>
                      <option value="Revision">Revision</option>
                      <option value="Mock Test">Mock Test</option>
                      <option value="Break">Break</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                ))}
              </div>
            )}

            {importError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] font-black text-red-500 text-center">
                {importError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-panel-border/60">
              <span className="text-[11px] text-muted font-semibold hidden md:block">
                Choose to append these to your day or replace.
              </span>
              <div className="flex gap-2.5 w-full sm:w-auto justify-end">
                <button
                  disabled={isFetchingEvents || draftTasks.filter(d => d.selected).length === 0}
                  onClick={() => handleImportDraftTasks(false)}
                  className="flex-1 sm:flex-none px-4.5 py-2 bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  Append to List
                </button>
                <button
                  disabled={isFetchingEvents || draftTasks.filter(d => d.selected).length === 0}
                  onClick={() => handleImportDraftTasks(true)}
                  className="flex-1 sm:flex-none px-4.5 py-2 bg-accent text-white rounded-xl text-[11px] font-black uppercase tracking-wider shadow-md hover:bg-accent/90 transition-all disabled:opacity-50"
                >
                  Overwrite List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
