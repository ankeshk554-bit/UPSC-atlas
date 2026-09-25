import React, { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  Award,
  Target,
  BookOpen,
  Printer,
  Plus,
  X,
  BarChart3,
  PieChart,
  Activity,
  ChevronDown,
  Trash2,
  Brain,
  Clock,
  Flame,
  Zap,
  CheckCircle2,
  Trophy,
  Calendar,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Legend,
  ComposedChart,
  AreaChart,
  Area
} from "recharts";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { SyllabusCoverageView } from "./SyllabusCoverageView";
import { D3ConsistencyHeatmap } from "./D3ConsistencyHeatmap";

interface TestRecord {
  id: string;
  name: string;
  subject: string;
  score: number;
  total: number;
  date: string;
}

const initialTestHistory: TestRecord[] = [
  {
    id: "1",
    name: "Vision IAS Abhyas",
    subject: "GS 1",
    score: 85,
    total: 200,
    date: "2026-05-28",
  },
  {
    id: "2",
    name: "ForumIAS Simulator",
    subject: "GS 2",
    score: 92,
    total: 200,
    date: "2026-05-12",
  },
  {
    id: "3",
    name: "Vision IAS Mains",
    subject: "Essay",
    score: 112,
    total: 250,
    date: "2026-04-25",
  },
  {
    id: "4",
    name: "Vajiram Test 4",
    subject: "GS 3",
    score: 105,
    total: 200,
    date: "2026-03-10",
  },
];

const SUBJECTS = [
  "GS 1",
  "GS 2",
  "GS 3",
  "GS 4",
  "Essay",
  "Optional 1",
  "Optional 2",
  "CSAT",
  "Full Length (GS)",
  "Full Length (Optional)",
];

export function PerformanceView() {
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "deepWork" | "syllabus">(
    "overview",
  );
  const [timeRange, setTimeRange] = useState<"3m" | "6m" | "1y">("6m");
  const [testHistory, setTestHistory] = useState<TestRecord[]>(() => {
    try {
      const saved = localStorage.getItem("upsc_test_history");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("upsc_test_history", JSON.stringify(testHistory));
  }, [testHistory]);
  const [historyFilter, setHistoryFilter] = useState("All Subjects");
  
  const [deepWorkLogs, setDeepWorkLogs] = useState<any[]>([]);
  const [syllabusStats, setSyllabusStats] = useState({ 
    total: 100, 
    mastered: 0, 
    inProgress: 0, 
    notStarted: 100 
  });
  const [syllabusSubjectData, setSyllabusSubjectData] = useState<any[]>([]);

  useEffect(() => {
    const loadLogs = () => {
       try {
         const logs = JSON.parse(localStorage.getItem("upsc_deep_work_logs") || "[]");
         // sort descending
         logs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
         setDeepWorkLogs(logs);
       } catch (e) {}
    };
    const loadSyllabus = () => {
      try {
        const saved = localStorage.getItem('upsc_syllabus_v2');
        if (saved) {
          const topics = JSON.parse(saved);
          let tCount = 0;
          let mCount = 0;
          let iCount = 0;
          let nCount = 0;

          const subjectMap: Record<string, { total: number, mastered: number }> = {};

          const traverse = (arr: any[], currentSubject: string) => {
            arr.forEach((t: any) => {
               const subj = currentSubject || t.title;
               if (!subjectMap[subj]) {
                 subjectMap[subj] = { total: 0, mastered: 0 };
               }
               
               if (!t.subtopics || t.subtopics.length === 0) {
                 tCount++;
                 subjectMap[subj].total += 1;
                 if (t.status === 'mastered') { mCount++; subjectMap[subj].mastered += 1; }
                 else if (t.status === 'in-progress') iCount++;
                 else nCount++;
               } else {
                 traverse(t.subtopics, subj);
               }
            });
          };
          traverse(topics, "");

          setSyllabusStats({
            total: tCount || 1,
            mastered: mCount,
            inProgress: iCount,
            notStarted: nCount
          });

          // Compute subject progress for radar chart
          const subData = Object.entries(subjectMap)
            .filter(([_, d]) => d.total > 0)
            .map(([sub, data]) => {
              const score = Math.round((data.mastered / data.total) * 100);
              return { subject: sub.substring(0, 15) + (sub.length > 15 ? '...' : ''), score, maxScore: 100 };
            })
            // Take top 6 for radar chart
            .slice(0, 6);

          setSyllabusSubjectData(subData);
        }
      } catch (e) {}
    };

    loadLogs();
    loadSyllabus();
    
    window.addEventListener("deep_work_log_added", loadLogs);
    return () => window.removeEventListener("deep_work_log_added", loadLogs);
  }, []);

  const heatmapData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    deepWorkLogs.forEach((log) => {
      if (log.date) {
        const dateStr = log.date.split("T")[0];
        dataMap[dateStr] = (dataMap[dateStr] || 0) + (log.durationMinutes || 0);
      }
    });
    return Object.entries(dataMap).map(([date, duration]) => ({
      date,
      count: Math.min(4, Math.ceil(duration / 60))
    }));
  }, [deepWorkLogs]);

  const deepWorkChartData = useMemo(() => {
    const data = [];
    const now = new Date();
    // Use start of day for consistent comparison
    now.setHours(0, 0, 0, 0);

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        dateStr: d.toISOString().split("T")[0],
        dateFormatted: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        durationMinutes: 0
      });
    }

    deepWorkLogs.forEach((log) => {
      if (log.date) {
        const logDateStr = log.date.split("T")[0];
        const point = data.find((p) => p.dateStr === logDateStr);
        if (point) {
           point.durationMinutes += (log.durationMinutes || 0);
        }
      }
    });

    return data;
  }, [deepWorkLogs]);

  const totalStudyHours = useMemo(() => {
      return Math.round(deepWorkLogs.reduce((acc, log) => acc + (log.durationMinutes || 0), 0) / 60);
  }, [deepWorkLogs]);

  const streakStats = useMemo(() => {
    if (!deepWorkLogs.length) return { current: 0, longest: 0, last7Days: [] };
    
    // Process unique study dates (sorted ascending)
    const uniqueDates = Array.from(
      new Set(deepWorkLogs.map(l => l.date.split('T')[0]))
    ).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
    
    if (!uniqueDates.length) return { current: 0, longest: 0, last7Days: [] };
    
    // 1. Calculate longest streak
    let longest = 0;
    let temp = 0;
    let prevDate: Date | null = null;
    
    uniqueDates.forEach((dateStr) => {
      const current = new Date(dateStr);
      current.setHours(0,0,0,0);
      
      if (!prevDate) {
        temp = 1;
      } else {
        const diff = (current.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);
        // Clean handling for timezone/day differences
        if (Math.round(diff) === 1) {
          temp++;
        } else if (Math.round(diff) > 1) {
          if (temp > longest) longest = temp;
          temp = 1;
        }
      }
      prevDate = current;
    });
    if (temp > longest) longest = temp;
    
    // 2. Calculate current streak (evaluate backwards starting from today/yesterday)
    const uniqueDatesDesc = [...uniqueDates].reverse();
    let current = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const latestDate = new Date(uniqueDatesDesc[0]);
    latestDate.setHours(0,0,0,0);
    
    const diffFromToday = (today.getTime() - latestDate.getTime()) / (1000 * 3600 * 24);
    
    // Streak is active if user studied today (diff = 0) or yesterday (diff = 1)
    if (Math.round(diffFromToday) <= 1) {
      current = 1;
      let currentDateRef = latestDate;
      
      for (let i = 1; i < uniqueDatesDesc.length; i++) {
        const prev = new Date(uniqueDatesDesc[i]);
        prev.setHours(0,0,0,0);
        const gap = (currentDateRef.getTime() - prev.getTime()) / (1000 * 3600 * 24);
        if (Math.round(gap) === 1) {
          current++;
          currentDateRef = prev;
        } else if (Math.round(gap) > 1) {
          break;
        }
      }
    }
    
    // 3. Generate last 7 days status strip representing consecutive daily progress
    const last7Days = [];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const isLogged = uniqueDates.includes(dateStr);
      last7Days.push({
        dateStr,
        dayName: weekdays[d.getDay()],
        dayNum: d.getDate(),
        isLogged,
        isToday: i === 0,
      });
    }
    
    return { current, longest: Math.max(longest, current), last7Days };
  }, [deepWorkLogs]);

  const streakMilestone = useMemo(() => {
    const current = streakStats.current;
    
    if (current === 0) {
      return {
        level: "Foundation Seeker",
        nextMilestone: 3,
        daysToNext: 3,
        progressPercent: 0,
        badge: "🌱",
        quote: "Every grand accomplishment begins with the decision to try. Commit today to kickstart your UPSC preparation streak!",
        description: "Consistency is key. Complete your first study block today to activate your daily momentum streak."
      };
    } else if (current < 3) {
      return {
        level: "Novice Aspirant",
        nextMilestone: 3,
        daysToNext: 3 - current,
        progressPercent: Math.round((current / 3) * 100),
        badge: "📜",
        quote: "Focus is a muscle. Keep feeding your intellectual fire. 3 days builds a basic momentum habit block.",
        description: "Your engine is warming up! Complete study logs for consecutive days to unlock the 3-day Foundation badge."
      };
    } else if (current < 7) {
      return {
        level: "Syllabus Explorer",
        nextMilestone: 7,
        daysToNext: 7 - current,
        progressPercent: Math.round(((current - 3) / 4) * 100),
        badge: "🔬",
        quote: "Small disciplines repeated with consistency everyday lead to monumental intellectual breakthroughs.",
        description: "You've crossed your initial hurdle. Complete 7 consecutive study days to unlock the prestigious Weekly Shield."
      };
    } else if (current < 14) {
      return {
        level: "Consistency Challenger",
        nextMilestone: 14,
        daysToNext: 14 - current,
        progressPercent: Math.round(((current - 7) / 7) * 100),
        badge: "⚔️",
        quote: "The path of Civil Services is paved with daily repetitions. The weekly threshold is where masters are separated.",
        description: "Exceptional discipline! Keep defending your weekly streak to earn the 14-day Fortitude Badge."
      };
    } else if (current < 21) {
      return {
        level: "Prelims Warrior",
        nextMilestone: 21,
        daysToNext: 21 - current,
        progressPercent: Math.round(((current - 14) / 7) * 100),
        badge: "🛡️",
        quote: "Pain is temporary. Ranks are permanent. Focus on your hourly slots and let consistency carry you.",
        description: "An incredible 2-week streak! Keep the flame burning bright for 21 days to reach Mains Master status."
      };
    } else if (current < 30) {
      return {
        level: "Mains Master",
        nextMilestone: 30,
        daysToNext: 30 - current,
        progressPercent: Math.round(((current - 21) / 9) * 100),
        badge: "👑",
        quote: "You have transcended transient motivation. This is pure automatic habit loop and legendary willpower.",
        description: "Elite caliber representation. Just a few more days to touch the ultimate 30-day discipline apex."
      };
    } else {
      return {
        level: "UPSC Discipline Legend",
        nextMilestone: 100, // elite target
        daysToNext: 100 - current,
        progressPercent: Math.min(100, Math.round((current / 100) * 100)),
        badge: "🏆",
        quote: "You represent the top 0.01% of focused minds. Ranks are won exactly through this unflinching daily devotion.",
        description: "Unprecedented dedication level. You have achieved true automatic academic habit loops. Continue defending the crown!"
      };
    }
  }, [streakStats.current]);

  const handleQuickCommit = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const uniqueDates = new Set(deepWorkLogs.map(l => l.date.split('T')[0]));
    
    // Add a study log entry for today
    const newLog = {
      id: `streak-quick-${Date.now()}`,
      date: new Date().toISOString(),
      durationMinutes: 45, // default study unit
      subject: "GS 4", // default interactive commit subject
      topic: "Ethics & Consistency Case Studies"
    };

    const existingLogs = JSON.parse(localStorage.getItem("upsc_deep_work_logs") || "[]");
    localStorage.setItem("upsc_deep_work_logs", JSON.stringify([...existingLogs, newLog]));
    
    // Notify application that deep work logs changed
    window.dispatchEvent(new Event("deep_work_log_added"));
  };

  const dynamicTrendData = useMemo(() => {
    const sorted = [...testHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentTarget = 40;
    return sorted.map((test) => {
       const accuracy = Math.round((test.score / test.total) * 100);
       currentTarget = Math.min(100, currentTarget + Math.max(1, Math.round(accuracy * 0.05)));
       return {
         date: new Date(test.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
         name: test.name,
         score: accuracy,
         target: currentTarget
       };
    });
  }, [testHistory]);

  const { avgScore, strongestSubject, weakestSubject, dynamicSubjectData } = useMemo(() => {
    if (!testHistory.length) return { avgScore: 0, strongestSubject: "N/A", weakestSubject: "N/A", dynamicSubjectData: [] };
    const avg = Math.round(
      testHistory.reduce((acc, t) => acc + (t.score / t.total) * 100, 0) / testHistory.length
    );

    const dataMap: Record<string, { total: number, count: number }> = {};
    testHistory.forEach(test => {
      dataMap[test.subject] = dataMap[test.subject] || { total: 0, count: 0 };
      dataMap[test.subject].total += (test.score / test.total) * 100;
      dataMap[test.subject].count += 1;
    });

    let strongest = { subject: "N/A", avg: 0 };
    let weakest = { subject: "N/A", avg: 100 };

    const subjectDataArr = Object.entries(dataMap).map(([sub, data]) => {
      const a = Math.round(data.total / data.count);
      if (a > strongest.avg) strongest = { subject: sub, avg: a };
      if (a < weakest.avg) weakest = { subject: sub, avg: a };
      return { subject: sub, score: a, maxScore: 100 };
    });

    if (weakest.avg === 100 && subjectDataArr.length < 2) weakest = { subject: "N/A", avg: 0 };

    return { avgScore: avg, strongestSubject: strongest.subject, weakestSubject: weakest.subject, dynamicSubjectData: subjectDataArr };
  }, [testHistory]);

  const timeVsScoreData = useMemo(() => {
    const timeMap: Record<string, number> = {};
    deepWorkLogs.forEach(log => {
      const sub = log.subject || "Uncategorized";
      timeMap[sub] = (timeMap[sub] || 0) + (log.durationMinutes || 0) / 60;
    });

    const combined = syllabusSubjectData.map(d => ({
      subject: d.subject.replace("General Studies ", "GS ").replace("Optional ", "Opt "),
      focusHours: Math.round((timeMap[d.subject] || 0) * 10) / 10,
      accuracy: d.score // this represents syllabus mastery
    }));

    return combined;
  }, [deepWorkLogs, syllabusSubjectData]);

  const aiInsight = useMemo(() => {
    if (syllabusSubjectData.length === 0) return { title: "Need More Data", text: "Mark topics as mastered in your syllabus tracker to unlock AI insights here.", action: "Start reviewing syllabus topics." };
    
    const sorted = [...syllabusSubjectData].sort((a,b) => b.score - a.score);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];
    const overallScore = syllabusStats.total > 0 ? Math.round((syllabusStats.mastered / syllabusStats.total) * 100) : 0;

    return {
       title: "Syllabus Diagnostic Insight",
       text: `Your overall syllabus mastery is ${overallScore}%. ${weakest && weakest.score < 100 ? `Your coverage in ${weakest.subject} is currently your lowest vulnerability.` : ""} ${strongest && strongest.score > 0 ? `Conversely, ${strongest.subject} is your strongest pillar.` : ""}`,
       action: weakest && weakest.score < 100 ? `Dedicate your next deep work sessions to mastering core topics in ${weakest.subject}.` : "Keep up the consistent momentum!"
    }
  }, [syllabusSubjectData, syllabusStats]);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [newTest, setNewTest] = useState<Partial<TestRecord>>({
    name: "",
    subject: "GS 1",
    score: 0,
    total: 200,
    date: new Date().toISOString().split("T")[0],
  });

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTest.name || !newTest.score) return;

    const record: TestRecord = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTest.name,
      subject: newTest.subject || "GS 1",
      score: Number(newTest.score),
      total: Number(newTest.total) || 200,
      date: newTest.date || new Date().toISOString().split("T")[0],
    };

    setTestHistory([record, ...testHistory]);
    setIsLogModalOpen(false);
    setNewTest({
      name: "",
      subject: "GS 1",
      score: 0,
      total: 200,
      date: new Date().toISOString().split("T")[0],
    });
  };



  const handleDeleteTest = (id: string) => {
    setTestHistory(testHistory.filter((t) => t.id !== id));
  };

  const filteredHistory =
    historyFilter === "All Subjects"
      ? testHistory
      : testHistory.filter((t) => t.subject === historyFilter);

  return (
    <div className="h-full flex flex-col bg-transparent w-full relative">
      <div className="p-8 max-w-7xl mx-auto w-full flex-1 overflow-y-auto pb-24">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-main mb-2 tracking-tight">
              Performance Analytics
            </h2>
            <p className="text-muted text-[15px]">
              Deep insights into your preparation trajectory
            </p>
          </div>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-accent/90 transition-colors w-full md:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Log New Test
          </button>
        </header>

        {/* Tab Navigation */}
        <div className="flex border-b border-panel-border mb-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === "overview" ? "border-accent text-accent" : "border-transparent text-muted hover:text-main"}`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview & Analytics
            </div>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === "history" ? "border-accent text-accent" : "border-transparent text-muted hover:text-main"}`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Test History
            </div>
          </button>
          <button
            onClick={() => setActiveTab("deepWork")}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === "deepWork" ? "border-accent text-accent" : "border-transparent text-muted hover:text-main"}`}
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Deep Work Sessions
            </div>
          </button>
          <button
            onClick={() => setActiveTab("syllabus")}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === "syllabus" ? "border-accent text-accent" : "border-transparent text-muted hover:text-main"}`}
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Syllabus Coverage
            </div>
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-panel p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted font-bold uppercase tracking-wider mb-1">
                    Syllabus Mastery
                  </p>
                  <p className="text-4xl font-black text-main tracking-tight">
                    {syllabusStats.total > 0 ? Math.round((syllabusStats.mastered / syllabusStats.total) * 100) : 0}
                    <span className="text-2xl text-light font-medium">%</span>
                  </p>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted font-bold uppercase tracking-wider mb-1">
                    Total Focus Time
                  </p>
                  <p className="text-4xl font-black text-main tracking-tight">
                    {totalStudyHours}
                    <span className="text-2xl text-light font-medium ml-1">hrs</span>
                  </p>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Flame className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted font-bold uppercase tracking-wider mb-1">
                    Current Streak
                  </p>
                  <p className="text-4xl font-black text-main tracking-tight">
                    {streakStats.current}
                    <span className="text-2xl text-light font-medium ml-1">days</span>
                  </p>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted font-bold uppercase tracking-wider mb-1">
                    Topics Mastered
                  </p>
                  <p className="text-4xl font-black text-main tracking-tight">
                    {syllabusStats.mastered}
                    <span className="text-2xl text-light font-medium ml-1">/ {syllabusStats.total}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* AI Insight */}
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
              <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center shrink-0 shadow-inner">
                <Zap className="w-8 h-8 fill-current text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-main mb-2 tracking-tight">
                  {aiInsight.title}
                </h3>
                <p className="text-muted leading-relaxed text-[15px] font-medium max-w-4xl">
                  {aiInsight.text}
                  <span className="text-main font-bold block mt-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Action: {aiInsight.action}
                  </span>
                </p>
              </div>
            </div>

            {/* UPSC Study Streak Dashboard Visualizer */}
            <div className="glass-panel p-8 rounded-3xl shadow-sm relative overflow-hidden border border-panel-border/60 hover:shadow-md transition-all bg-gradient-to-br from-panel via-panel to-accent/5">
              {/* Background gradient flares */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-panel-border/50 mb-6 font-sans">
                  <div>
                    <h3 className="text-2xl font-bold text-main tracking-tight flex items-center gap-2">
                      <Flame className="w-5 h-5 text-rose-500 fill-current animate-pulse shrink-0" />
                      UPSC Study Streak Companion
                    </h3>
                    <p className="text-[11px] text-muted font-semibold mt-1">
                      Cultivating unwavering daily consistency to conquer the syllabus. Track consecutive study days.
                    </p>
                  </div>

                  {/* Badges and milestones high-level wrapper */}
                  <div className="flex items-center gap-3 bg-input/40 px-4 py-2.5 rounded-2xl border border-panel-border/40 select-none">
                    <span className="text-2xl">{streakMilestone.badge}</span>
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted tracking-wide leading-none mb-1">Consistency Tier</p>
                      <p className="text-[11px] font-bold text-main leading-none">{streakMilestone.level}</p>
                    </div>
                  </div>
                </div>

                {/* Main Content Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left: Glowing Streak Flame metrics (5 columns on lg) */}
                  <div className="lg:col-span-5 flex flex-col items-center p-6 bg-input/20 rounded-xl border border-panel-border/40 hover:bg-input/30 transition-colors">
                    <div className="relative flex items-center justify-center mb-4">
                      {/* Animated outer ring */}
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-rose-500/10"
                        animate={{ scale: [1, 1.13, 1], rotate: 360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.div
                        className="absolute inset-2 rounded-full border border-dashed border-accent/20"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                      />
                      {/* Inside flame circle */}
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500/15 to-amber-500/10 flex flex-col items-center justify-center shadow-lg relative z-10 select-none">
                        <Flame className="w-9 h-9 text-rose-500 fill-current" />
                        <span className="text-2xl font-black text-main mt-0.5 tracking-tight">{streakStats.current}</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-black text-main uppercase tracking-wider mb-0.5">
                        {streakStats.current} Day Active Run
                      </p>
                      <p className="text-[11px] text-muted font-medium mb-3">
                        All-time longest run: <span className="font-bold text-main">{streakStats.longest} days</span>
                      </p>
                      
                      {/* Interactive Trigger Button */}
                      <button
                        onClick={handleQuickCommit}
                        className="flex items-center gap-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer select-none"
                      >
                        <Sparkles className="w-3 text-rose-500" /> Commit study today
                      </button>
                    </div>
                  </div>

                  {/* Right: Last 7 Days Habit Matrix and Milestone Progress bar (7 columns on lg) */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Last 7 Days matrix strip */}
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5 flex-wrap">
                        <Calendar className="w-3.5 h-3.5 text-accent" /> Consecutive 7-Day Matrix Strip
                      </h4>
                      <div className="grid grid-cols-7 gap-2">
                        {streakStats.last7Days.map((day, idx) => (
                          <div
                            key={idx}
                            className={`flex flex-col items-center p-2 rounded-xl border relative ${
                              day.isToday 
                                ? "bg-accent/5 border-accent/40 shadow-sm" 
                                : "bg-panel border-panel-border/30"
                            } ${day.isLogged ? "bg-rose-500/5 border-rose-500/10" : ""}`}
                          >
                            <span className="text-[10px] font-black text-muted uppercase tracking-wider mb-2">
                              {day.dayName}
                            </span>
                            
                            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-input/40 border border-panel-border/50 mb-2">
                              {day.isLogged ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="text-rose-500 animate-pulse"
                                >
                                  <Flame className="w-5 h-5 fill-current text-rose-500" />
                                </motion.div>
                              ) : (
                                <div className="text-muted/40 text-[11px] font-bold">
                                  {day.dayNum}
                                </div>
                              )}

                              {/* Small marker for today */}
                              {day.isToday && (
                                <span className="absolute -bottom-1 w-1.5 h-1.5 bg-accent rounded-full" />
                              )}
                            </div>

                            <span className="text-[8px] font-black uppercase tracking-wide text-muted">
                              {day.isToday ? "Today" : `${day.dayNum}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progress to next Milestone */}
                    <div className="bg-input/20 border border-panel-border/30 rounded-2xl p-4">
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <span className="text-muted font-bold">
                          Next Milestone: <span className="text-main font-black">{streakMilestone.nextMilestone} Days Streak</span>
                        </span>
                        <span className="text-accent font-black">
                          {streakMilestone.daysToNext} days left
                        </span>
                      </div>

                      {/* Styled Progress Bar */}
                      <div className="w-full h-3 bg-input rounded-full overflow-hidden border border-panel-border/40 mb-3 relative">
                        <motion.div
                          className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full animate-pulse"
                          initial={{ width: 0 }}
                          animate={{ width: `${streakMilestone.progressPercent}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>

                      {/* Milestone Description Text */}
                      <p className="text-[11px] text-muted italic font-medium leading-relaxed">
                        "{streakMilestone.quote}"
                      </p>
                      <p className="text-[10px] text-muted font-semibold mt-1">
                        {streakMilestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Trend Chart */}
              <div className="glass-panel p-8 rounded-3xl shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-main tracking-tight">
                    Score Trajectory
                  </h3>
                </div>
                <div className="flex-1 w-full min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dynamicTrendData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-accent, #4f46e5)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--color-accent, #4f46e5)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                        stroke="currentColor"
                        className="text-panel-border/50 opacity-30"
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "var(--color-muted, #6B7280)",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "var(--color-muted, #6B7280)",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        dx={-10}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-panel, #fff)",
                          borderRadius: "16px",
                          border: "1px solid var(--color-panel-border, #E5E7EB)",
                          boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                          padding: "16px",
                          fontWeight: 600,
                        }}
                        itemStyle={{ paddingBottom: "4px" }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{
                          paddingTop: "20px",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        name="Accuracy %"
                        stroke="var(--color-accent, #4f46e5)"
                        fillOpacity={1}
                        fill="url(#colorScore)"
                        strokeWidth={3}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                      <Line
                        name="Target Trajectory"
                        type="monotone"
                        dataKey="target"
                        stroke="var(--color-text-muted, #9CA3AF)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        activeDot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Effort vs Reward Composed Chart */}
              <div className="glass-panel p-8 rounded-3xl shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-main tracking-tight mb-8">
                  Effort vs. Syllabus Mastery
                </h3>
                <div className="flex-1 w-full min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={timeVsScoreData}
                      margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="currentColor" className="text-panel-border/50 opacity-30" />
                      <XAxis 
                        dataKey="subject" 
                        scale="band" 
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "var(--color-muted, #6B7280)",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        dy={10}
                      />
                      <YAxis 
                        yAxisId="left" 
                        orientation="left" 
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "var(--color-muted, #6B7280)",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        dx={-10}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "var(--color-muted, #6B7280)",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        dx={10}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-panel, #fff)",
                          borderRadius: "16px",
                          border: "1px solid var(--color-panel-border, #E5E7EB)",
                          boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                          padding: "16px",
                          fontWeight: 600,
                        }}
                      />
                      <Legend 
                        iconType="circle"
                        wrapperStyle={{
                          paddingTop: "20px",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      />
                      <Bar yAxisId="left" dataKey="focusHours" name="Focus Time (hrs)" fill="var(--color-panel-border, #E5E7EB)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                      <Line yAxisId="right" type="monotone" dataKey="accuracy" name="Mastery %" stroke="var(--color-accent, #4f46e5)" strokeWidth={4} dot={{ r: 5, strokeWidth: 2, fill: "var(--color-panel, #fff)" }} activeDot={{ r: 7 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Heatmap */}
            <div className="glass-panel p-8 rounded-3xl shadow-sm relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-main tracking-tight">
                    Deep Work Consistency Matrix
                  </h3>
                  <p className="text-muted text-[11px] font-semibold mt-1">
                    Staggered, animated grids of study effort over the last 6 months. Hover on cells to view session activity.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-muted bg-panel-border/30 px-3 py-1.5 rounded-xl border border-panel-border/50">
                  <span>Less</span>
                  <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: 'var(--panel-border, rgba(0,0,0,0.05))' }} />
                  <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 25%, transparent)' }} />
                  <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 50%, transparent)' }} />
                  <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 75%, transparent)' }} />
                  <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: 'var(--accent)' }} />
                  <span>More</span>
                </div>
              </div>
              <div className="w-full">
                <D3ConsistencyHeatmap logs={deepWorkLogs} />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "history" && (
          <div className="glass-panel rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-panel-border/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-main tracking-tight">
                Recent Examinations
              </h3>
              <div className="relative">
                <select
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
                  className="appearance-none bg-panel-border/50 border border-panel-border text-main text-sm font-medium rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-accent/50 outline-none"
                >
                  <option value="All Subjects">All Subjects</option>
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-panel-border/20 text-muted uppercase tracking-wider text-[11px] font-bold border-b border-panel-border/50">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Test Name</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4 text-right">Score</th>
                    <th className="px-6 py-4 text-right">Accuracy</th>
                    <th className="px-6 py-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-panel-border/30">
                  {filteredHistory.map((test) => {
                    const accuracy = Math.round(
                      (test.score / test.total) * 100,
                    );
                    return (
                      <tr
                        key={test.id}
                        className="hover:bg-panel-border/10 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-muted">
                          {new Date(test.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-main">
                          {test.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="bg-panel-border/50 text-main text-[11px] font-bold px-3 py-1 rounded-full">
                            {test.subject}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-main">
                          {test.score}{" "}
                          <span className="text-muted font-medium text-[11px]">
                            / {test.total}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span
                              className={`text-sm font-bold ${accuracy >= 50 ? "text-emerald-500" : "text-accent"}`}
                            >
                              {accuracy}%
                            </span>
                            <div className="w-16 h-2 bg-panel-border rounded-full overflow-hidden shrink-0">
                              <div
                                className={`h-full ${accuracy >= 50 ? "bg-emerald-500" : "bg-accent"}`}
                                style={{ width: `${accuracy}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 pr-6">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTest(test.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                    {filteredHistory.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-muted font-medium"
                        >
                          No tests logged yet for this selected filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === "deepWork" && (
            <div className="space-y-8 w-full flex flex-col">
              <div className="glass-panel p-8 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-main tracking-tight">
                      Deep Work Trend (Last 30 Days)
                    </h3>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={deepWorkChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-panel-border/50 opacity-20" />
                      <XAxis 
                        dataKey="dateFormatted" 
                        stroke="currentColor" 
                        className="text-muted text-[11px]" 
                        tickLine={false}
                        axisLine={false}
                        minTickGap={20}
                      />
                      <YAxis 
                        stroke="currentColor" 
                        className="text-muted text-[11px]" 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}m`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--color-panel)', 
                          border: '1px solid var(--color-panel-border)',
                          borderRadius: '12px',
                          color: 'var(--color-main)'
                        }}
                        itemStyle={{ color: 'var(--color-accent)' }}
                        formatter={(value) => [`${value} mins`, 'Deep Work']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="durationMinutes" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        dot={false}
                        activeDot={{ r: 6, fill: "#3b82f6", strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-panel-border/50 flex items-center justify-between">
                <h3 className="text-lg font-bold text-main tracking-tight">
                  Focus Mode Logs
                </h3>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  <span className="text-sm font-bold text-main">
                     Total: {Math.round(deepWorkLogs.reduce((acc, log) => acc + (log.durationMinutes || 0), 0) / 60)} hrs
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-panel-border/20 text-muted uppercase tracking-wider text-[11px] font-bold border-b border-panel-border/50">
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Topic</th>
                      <th className="px-6 py-4 text-right">Duration</th>
                      <th className="px-6 py-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-panel-border/30">
                    {deepWorkLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-panel-border/10 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-muted">
                          {new Date(log.date).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="bg-panel-border/50 text-main text-[11px] font-bold px-3 py-1 rounded-full">
                            {log.subject || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-main">
                          {log.topic || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-main">
                          {log.durationMinutes}{" "}
                          <span className="text-muted font-medium text-[11px]">
                            mins
                          </span>
                        </td>
                        <td className="px-6 py-4 pr-6">
                           <button onClick={(e) => {
                             e.stopPropagation();
                             const newLogs = deepWorkLogs.filter((l) => l.id !== log.id);
                             setDeepWorkLogs(newLogs);
                             localStorage.setItem("upsc_deep_work_logs", JSON.stringify(newLogs));
                             window.dispatchEvent(new Event("deep_work_log_added"));
                           }} className="opacity-0 group-hover:opacity-100 p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </td>
                      </tr>
                    ))}
                    {deepWorkLogs.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-muted font-medium"
                        >
                          No deep work sessions logged yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          )}

          {activeTab === "syllabus" && (
            <SyllabusCoverageView />
          )}
        </div>

      {/* Log Test Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsLogModalOpen(false)}
          />
          <div className="glass-panel w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsLogModalOpen(false)}
              className="absolute top-6 right-6 text-muted hover:text-main focus:outline-none bg-panel-border/50 hover:bg-panel-border p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-main mb-6">
              Log Test Result
            </h2>

            <form onSubmit={handleAddTest} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-main mb-2">
                  Test Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newTest.name}
                  onChange={(e) =>
                    setNewTest({ ...newTest, name: e.target.value })
                  }
                  placeholder="e.g. Vision IAS Abhyas 2"
                  className="w-full bg-input text-main border border-panel-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all font-medium placeholder:text-muted/50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-main mb-2">
                  Subject
                </label>
                <select
                  value={newTest.subject}
                  onChange={(e) =>
                    setNewTest({ ...newTest, subject: e.target.value })
                  }
                  className="w-full bg-input text-main border border-panel-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all font-medium appearance-none"
                >
                  <option value="GS 1">GS 1 (History, Geography)</option>
                  <option value="GS 2">GS 2 (Polity, IR)</option>
                  <option value="GS 3">GS 3 (Economy, Environment)</option>
                  <option value="GS 4">GS 4 (Ethics)</option>
                  <option value="Essay">Essay</option>
                  <option value="Optional 1">Optional Paper 1</option>
                  <option value="Optional 2">Optional Paper 2</option>
                  <option value="CSAT">CSAT</option>
                  <option value="Full Length (GS)">
                    Full Length Test (GS)
                  </option>
                  <option value="Full Length (Optional)">
                    Full Length Test (Optional)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-main mb-2">
                    Marks Scored
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newTest.score || ""}
                    onChange={(e) =>
                      setNewTest({ ...newTest, score: Number(e.target.value) })
                    }
                    className="w-full bg-input text-main border border-panel-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all font-medium text-2xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-main mb-2">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newTest.total}
                    onChange={(e) =>
                      setNewTest({ ...newTest, total: Number(e.target.value) })
                    }
                    className="w-full bg-input text-main border border-panel-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all font-medium text-2xl text-muted"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-main mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newTest.date}
                  onChange={(e) =>
                    setNewTest({ ...newTest, date: e.target.value })
                  }
                  className="w-full bg-input text-main border border-panel-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all font-medium"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-accent hover:bg-accent/90 text-white rounded-xl text-base font-bold transition-transform active:scale-[0.98] shadow-md shadow-accent/20 flex items-center justify-center gap-2"
                >
                  <Target className="w-5 h-5" />
                  Save Performance Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
