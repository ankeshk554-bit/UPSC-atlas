import React, { useState, useEffect } from 'react';
import { Play, TrendingUp, Calendar, AlertTriangle, BookOpen, Clock, Activity, CheckCircle2, ChevronRight, MessageSquare, MapPin, FileText, PenTool, Milestone, Target, Plus, Check, Award, Flame, Trophy, Zap } from 'lucide-react';
import { ViewType } from '../types';
import { ConceptGraph } from './ConceptGraph';
import { D3CalendarHeatmap } from './D3CalendarHeatmap';
import { VerticalStudyRoadmap } from './VerticalStudyRoadmap';
import { DailyGoalTracker } from './DailyGoalTracker';

interface OverviewViewProps {
  onNavigate: (view: ViewType) => void;
}

function InteractiveRoadmap({ onNavigate }: { onNavigate: (view: ViewType) => void }) {
  const milestones = [
    { id: 1, title: 'GS I', desc: 'History & Geo', colorClass: 'bg-blue-500/10 text-blue-500 group-hover:border-blue-500/50' },
    { id: 2, title: 'GS II', desc: 'Polity & IR', colorClass: 'bg-rose-500/10 text-rose-500 group-hover:border-rose-500/50' },
    { id: 3, title: 'GS III', desc: 'Economy & Sci', colorClass: 'bg-emerald-500/10 text-emerald-500 group-hover:border-emerald-500/50' },
    { id: 4, title: 'GS IV', desc: 'Ethics', colorClass: 'bg-amber-500/10 text-amber-500 group-hover:border-amber-500/50' },
    { id: 5, title: 'Optional', desc: 'Subject Specific', colorClass: 'bg-purple-500/10 text-purple-500 group-hover:border-purple-500/50' },
  ];

  return (
    <div className="bg-app glass-panel rounded-2xl border border-panel-border p-8 relative overflow-hidden mt-6 mb-6 z-10 w-full shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-panel-border/50 gap-2">
        <h3 className="text-lg font-black text-main uppercase tracking-wider flex items-center gap-2">
          <Milestone className="w-5 h-5 text-accent" /> Syllabus Roadmap
        </h3>
        <p className="text-[11px] text-muted font-bold uppercase tracking-widest bg-muted/5 px-2.5 py-1 rounded">Quick Navigation</p>
      </div>

      <div className="relative">
        {/* Connecting line */}
        <div className="absolute top-[20px] left-[20px] right-[20px] h-[2px] bg-panel-border hidden lg:block z-0" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 gap-y-12">
          {milestones.map((m) => (
            <div key={m.id} className="relative group flex flex-col items-start lg:items-center z-10">
              <div className="flex flex-row lg:flex-col items-center lg:items-center w-full gap-4 lg:gap-0">
                {/* Node */}
                <div className={`shrink-0 w-10 h-10 rounded-2xl border border-transparent flex items-center justify-center font-black text-sm relative transition-all shadow-sm ${m.colorClass} group-hover:-translate-y-1 bg-app`}>
                  {m.id}
                </div>
                
                {/* Content */}
                <div className="lg:mt-6 flex-1 w-full lg:text-center">
                  <h4 className="font-bold text-main whitespace-nowrap">{m.title}</h4>
                  <p className="text-[11px] text-muted uppercase tracking-wider font-bold mt-1 mb-4">{m.desc}</p>
                  
                  {/* Actions */}
                  <div className="flex gap-2 justify-start lg:justify-center">
                    <button 
                      onClick={() => onNavigate('notes')}
                      className="text-[11px] px-2.5 py-1.5 rounded-lg bg-input hover:brightness-95 dark:hover:brightness-110 transition-colors border border-panel-border flex items-center gap-1.5 font-semibold text-main shadow-sm flex-1 lg:flex-none justify-center"
                      title="Generate Notes"
                    >
                      <FileText className="w-3.5 h-3.5 text-muted group-hover:text-main transition-colors" /> Notes
                    </button>
                    <button 
                      onClick={() => onNavigate('pyq')}
                      className="text-[11px] px-2.5 py-1.5 rounded-lg bg-input hover:brightness-95 dark:hover:brightness-110 transition-colors border border-panel-border flex items-center gap-1.5 font-semibold text-main shadow-sm flex-1 lg:flex-none justify-center"
                      title="Solve PYQs"
                    >
                      <PenTool className="w-3.5 h-3.5 text-muted group-hover:text-main transition-colors" /> PYQs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExamCountdownWidget() {
  const [examDates, setExamDates] = useState(() => {
    const saved = localStorage.getItem('upsc_exam_dates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Overwrite old default if it's cached
        if (parsed.prelims === '2027-05-30' && parsed.mains === '2027-09-15') {
          return { prelims: '2027-05-23', mains: '2027-08-20' };
        }
        return parsed;
      } catch (e) {}
    }
    return { prelims: '2027-05-23', mains: '2027-08-20' };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempDates, setTempDates] = useState(examDates);

  const [syllabusStats, setSyllabusStats] = useState({ total: 1, mastered: 0 });

  useEffect(() => {
    localStorage.setItem('upsc_exam_dates', JSON.stringify(examDates));
  }, [examDates]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('upsc_syllabus_v2');
      if (saved) {
        const topics = JSON.parse(saved);
        let totalCount = 0;
        let masteredCount = 0;
        const countTopics = (arr: any[]) => {
          arr.forEach((t: any) => {
            if (!t.subtopics || t.subtopics.length === 0) {
              totalCount++;
              if (t.status === 'mastered') masteredCount++;
            } else {
              countTopics(t.subtopics);
            }
          });
        };
        countTopics(topics);
        setSyllabusStats({ total: totalCount || 1, mastered: masteredCount });
      }
    } catch (e) {
      console.log('Error parsing syllabus v2', e);
    }
  }, []);

  const saveDates = () => {
    setExamDates(tempDates);
    setIsEditing(false);
  };

  const applyPreset = (prelims: string, mains: string) => {
    const next = { prelims, mains };
    setTempDates(next);
    setExamDates(next);
    setIsEditing(false);
  };

  const getDaysLeft = (dateString: string) => {
    const diff = new Date(dateString).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const prelimsDays = getDaysLeft(examDates.prelims);
  const mainsDays = getDaysLeft(examDates.mains);

  const progress = Math.round((syllabusStats.mastered / syllabusStats.total) * 100);

  return (
    <div className="bg-app glass-panel border border-panel-border rounded-2xl p-6 flex flex-col mt-6 relative z-10 w-full mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-panel-border/50 gap-3">
        <div>
          <h3 className="text-lg font-black text-main uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" /> Exam Countdown
          </h3>
          <p className="text-xs text-muted mt-0.5 font-medium">UPSC Civil Services Examination Timeline</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-input/60 p-0.5 rounded-lg border border-panel-border/60">
            <button
              onClick={() => applyPreset('2027-05-23', '2027-08-20')}
              className="px-2.5 py-1 text-[11px] font-bold rounded-md text-muted hover:text-main transition-colors"
            >
              CSE 2027
            </button>
            <button
              onClick={() => applyPreset('2028-05-28', '2028-08-25')}
              className="px-2.5 py-1 text-[11px] font-bold rounded-md text-muted hover:text-main transition-colors"
            >
              CSE 2028
            </button>
          </div>
          <button onClick={() => { setIsEditing(!isEditing); setTempDates(examDates); }} className="text-[11px] font-bold text-muted uppercase hover:text-accent transition-colors px-3 py-1.5 rounded-lg border border-transparent hover:border-panel-border bg-transparent hover:bg-input">
            {isEditing ? 'Cancel' : 'Custom'}
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-input/50 p-5 rounded-xl border border-panel-border">
          <div>
            <label className="text-[11px] font-bold text-muted uppercase tracking-widest block mb-2">Prelims Date</label>
            <input type="date" value={tempDates.prelims} onChange={e => setTempDates({...tempDates, prelims: e.target.value})} className="w-full bg-app border border-panel-border rounded-lg px-4 py-2.5 text-sm font-medium text-main focus:outline-none focus:border-accent shadow-sm" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-muted uppercase tracking-widest block mb-2">Mains Date</label>
            <input type="date" value={tempDates.mains} onChange={e => setTempDates({...tempDates, mains: e.target.value})} className="w-full bg-app border border-panel-border rounded-lg px-4 py-2.5 text-sm font-medium text-main focus:outline-none focus:border-accent shadow-sm" />
          </div>
          <div className="sm:col-span-2 flex justify-end mt-2">
            <button onClick={saveDates} className="bg-accent text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors hover:bg-accent/90 shadow-md">Save Changes</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-input border border-panel-border p-5 rounded-xl flex items-center gap-6 shadow-sm group hover:-translate-y-0.5 transition-transform">
           <div className="w-16 h-16 rounded-[1.25rem] bg-blue-500/10 border border-blue-500/20 text-blue-500 flex flex-col items-center justify-center shrink-0 shadow-inner group-hover:border-blue-500/40 transition-colors">
             <span className="text-2xl font-black">{prelimsDays}</span>
           </div>
           <div>
             <h4 className="text-main font-bold">Days to Prelims</h4>
             <p className="text-sm font-bold text-muted uppercase tracking-wide mt-1">
               {new Date(examDates.prelims).toLocaleDateString(undefined, { dateStyle: 'medium' })} ({Math.ceil(prelimsDays / 7)} weeks)
             </p>
           </div>
        </div>
        <div className="bg-input border border-panel-border p-5 rounded-xl flex items-center gap-6 shadow-sm group hover:-translate-y-0.5 transition-transform">
           <div className="w-16 h-16 rounded-[1.25rem] bg-rose-500/10 border border-rose-500/20 text-rose-500 flex flex-col items-center justify-center shrink-0 shadow-inner group-hover:border-rose-500/40 transition-colors">
             <span className="text-2xl font-black">{mainsDays}</span>
           </div>
           <div>
             <h4 className="text-main font-bold">Days to Mains</h4>
             <p className="text-sm font-bold text-muted uppercase tracking-wide mt-1">
               {new Date(examDates.mains).toLocaleDateString(undefined, { dateStyle: 'medium' })} ({Math.ceil(mainsDays / 7)} weeks)
             </p>
           </div>
        </div>
      </div>

      <div className="bg-app border border-panel-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[13px] font-bold text-main uppercase tracking-wider flex items-center gap-2"><Target className="w-4 h-4 text-accent" /> Syllabus Mastery Progress</span>
          <span className="text-[11px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded uppercase tracking-widest">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-input rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-gradient-to-r from-accent to-accent/80 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between mt-4">
           <p className="text-[11px] font-bold text-muted">
             {syllabusStats.mastered} out of {syllabusStats.total} micro-topics mastered
           </p>
           <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        </div>
      </div>

    </div>
  );
}

function TopperPatternsDashboard({ onNavigate }: { onNavigate: (view: ViewType) => void }) {
  const [activeTab, setActiveTab] = useState<'GS1' | 'GS2' | 'GS3' | 'GS4' | 'Essay'>('GS2');

  const papersData = {
    GS1: {
      title: "General Studies I",
      focus: "Analytical Chronology, Spatial Physical-Human Models, and Socio-Demographic Fact-Bases",
      spaceAllocation: [
        { name: "Chronology Hook / Context", pct: 15, desc: "Accurate historical era anchor, traveler name or physical geo mechanism." },
        { name: "Spatial / Chronological Plotting", pct: 35, desc: "Resource mapping, coastal fault zones or historic transition matrix." },
        { name: "Socio-Demographic Nucleation", pct: 30, desc: "Urban decay, patriarchal bargains or Census 2011 gender dynamics." },
        { name: "SDG-11 Sustainable Mitigation", pct: 20, desc: "Actionable paths pointing toward sustainable resilient cities." }
      ],
      tactics: [
        { title: "Traveler & Scholar Linkage", text: "Incorporate contemporary scholar citations (e.g., Al-Biruni, Ibn Battuta) or modern historians (Bipan Chandra, Sumit Sarkar) to anchor historical context, bypassing narrative prose." },
        { title: "Physical-to-Human Geopolitics", text: "Link physical factors with socio-economic results. Map resources or coastal grids and outline using custom bracket figures (such as [Figure 1: Coastlines in conflict])." },
        { title: "Academic Sociological Density", text: "Deploy rigorous academic terms (e.g., Joint Family Nucleation, Patriarchal Bargains, Urban Sprawl Decay) when tackling Society/Demographics topics." }
      ],
      evidence: ["Census 2011", "NFHS-5 Summary Profiles", "IPCC Assessment Cycle reports", "UN Gender Inequality Index", "ISRO Resource Map Models"],
      contrast: {
        standard: "Starts with: 'Joint family is an old tradition of India but now it is breaking due to westernization and modern thoughts.' (Lacks depth, generic narration).",
        topper: "Starts with: 'According to NFHS-5, India is witnessing cooperative family atomization. Joint families are under structural family nucleation dynamics, transitioning due to unequal urban-rural wage gradients rather than mere Westernization.' (Precise, sociological terminology, backed by datasets)."
      }
    },
    GS2: {
      title: "General Studies II",
      focus: "Strict Constitutional Framing, Landmark SC Precedent Ratios, and Welfare Auditing",
      spaceAllocation: [
        { name: "Constitutional Core Grounding", pct: 15, desc: "State core Articles, Schedules, legal doctrines, or constitutional basis." },
        { name: "SC Precedents & Jurisprudence", pct: 35, desc: "Landmark judgments & separation of powers bottleneck appraisals." },
        { name: "Welfare & Governance Commissions", pct: 30, desc: "2nd ARC models, Punchhi or Sarkaria implementation metrics." },
        { name: "Strategic Autonomy & Diplomacy", pct: 20, desc: "Groupings (Quad, G20, BRICS), soft power, or SDG-16 path-forward." }
      ],
      tactics: [
        { title: "Constitutional Anchoring", text: "Never make a governance point without citing the exact Articles (e.g. Art 14, 19, 21, 131, 142) or constitutional amendment acts (e.g. 73rd, 103rd, 105th CAA)." },
        { title: "Court Judgment Ratio Decidendi", text: "Weave in landmark Supreme Court ratios (Kesavananda Bharati, S.R. Bommai, Puttaswamy, Vishaka, Nabam Rebia) to back legal arguments." },
        { title: "Commission-Led Reform Pathways", text: "Base public service improvements explicitly on commission verdicts (2nd ARC, Punchhi, Sarkaria, Law Commission) rather than vague advice." },
        { title: "IR Analytical Paradigms", text: "Frame foreign policy topics with dense, realistic tags: 'Strategic Autonomy', 'Continental-Maritime Dilemma', or 'Track-1.5/2 Diplomacy'." }
      ],
      evidence: ["Articles 14, 19, 21, 131, 142", "2nd ARC Recommendation reports", "Punchhi & Sarkaria Commissions", "SR Bommai & Puttaswamy Cases", "SDG-16 indicators / NITI index"],
      contrast: {
        standard: "Starts with: 'Federalism means state and center should cooperate with each other for running the country.' (No core constitutional reference).",
        topper: "Starts with: 'Cooperative federalism in India is structurally governed by Article 246 and the Seventh Schedule. Its administrative limits have evolved through the S.R. Bommai case, establishing states as sovereign entities rather than subsidiaries.' (Sovereign grounding, legal citations)."
      }
    },
    GS3: {
      title: "General Studies III",
      focus: "Macroeconomic Survey Metrics, Dalwai Agrarian Reforms, and NDMA Resilient Ecosystems",
      spaceAllocation: [
        { name: "Macroeconomics / Survey Hook", pct: 15, desc: "Macro statistics, Union Budget figures, Economic Survey data models." },
        { name: "Agrarian Supply Interlinkages", pct: 35, desc: "APMC fragmentations, post-harvest leakages, and Dalwai proposals." },
        { name: "Science Frontiers & Security Bulwarks", pct: 30, desc: "Cyber-defense grids, quantum missions, or CRISPR gene systems." },
        { name: "NDMA Protocols & Paris targets", pct: 20, desc: "Inspirational climate plans (Net Zero 2070) aligned with SDG 1, 2, 9, 13." }
      ],
      tactics: [
        { title: "Macro-Economic Grounding", text: "Back economic points with precise parameters from the Economic Survey, Union Budget, or RBI. Use tags like 'Capital Expenditure Multiplier' or 'Virtuous Cycle of Investment'." },
        { title: "Dalwai Agrarian Supply Reforms", text: "Refine agricultural answers with quantitative terms like '30% post-harvest value leakage'. Explicitly advise implementing the Ashok Dalwai or Swaminathan committees' formulas." },
        { title: "NDMA & Disaster Resilience", text: "Base disaster answers on NDMA's specific structural/non-structural checklist and IPCC global reports instead of basic advice." }
      ],
      evidence: ["Economic Survey 2025-26 metrics", "Ashok Dalwai Agrarian committee files", "NDMA structural/non-structural guidelines", "IPCC Assessment Cycles", "CERT-In Cyber Bulletins"],
      contrast: {
        standard: "Starts with: 'Agriculture has many problems like low income, bad irrigation, and no cold storage facilities.' (Lacks numbers, generic).",
        topper: "Starts with: 'Despite accounting for ~18% of GDP, Indian agriculture suffers from structural value leakages, with up to 30% post-harvest losses due to APMC friction. To address this, the Ashok Dalwai Committee recommends supply chain disintermediation...' (High density, quantitative, structural)."
      }
    },
    GS4: {
      title: "General Studies IV (Ethics)",
      focus: "Comprehensive Stakeholder Matrices, Deontological Judgments, and Options Appraisal Ledgers",
      spaceAllocation: [
        { name: "Stakeholder Matrix & Dilemma", pct: 15, desc: "Diagram stakeholder web and define 3 core public service trade-offs." },
        { name: "Philosophical Theory core", pct: 35, desc: "Kant deontology, Mill utilitarianism, or Nolan Life Principles." },
        { name: "Action Appraisal ledger", pct: 30, desc: "Merits and demerits ledger contrasting easy vs brave action plans." },
        { name: "Gandhi's Talisman Climax", pct: 20, desc: "Action decision based on core public probity and oath of office." }
      ],
      tactics: [
        { title: "Stakeholder Multi-tier Grid", text: "Begin complex case studies by drafting a clean structural stakeholder list (public, admin, state) and state 3 distinct moral dilemmas clearly." },
        { title: "Intellectual Philosophical Grounding", text: "Frame problems with technical theories: Kant's Categorical Imperative (deontology), Utilitarian framework (teleology), and evaluate using Nolan's 7 Principles of Public Life." },
        { title: "Strategic Actions Ledger", text: "Structure case results using clear tables of options, mapping merits and demerits of passive administrative tolerance against courageous optimal probity." }
      ],
      evidence: ["Nolan Principles of Public life", "Kantian Categorical Imperative", "Gandhi's Talisman context", "2nd ARC Report 4: Ethics in Governance", "Aristotelian Golden Mean theory"],
      contrast: {
        standard: "Starts with: 'As a DM, I will stop the protest immediately because law and order is very important for the public.' (No ethical conflict identified).",
        topper: "Starts with: 'This case involves an ethical tension between Duty to Maintain Order (Law) and the Empathy to Listen to Public Grievances (Morality). Mapping the stakeholders (Aspirants, Admin, State), I must find a solution balancing Kantian Deontology with Nolan's core accountability...' (Multi-dimensional framework)."
      }
    },
    Essay: {
      title: "Mains Essay Paper",
      focus: "Engaging Narrative Hooks, PESTEL Coordinates mapping, and Dialectical Balance",
      spaceAllocation: [
        { name: "Narrative Anchor / Parable", pct: 15, desc: "Unique story or conceptual paradox introducing the core thesis." },
        { name: "PESTEL Multidimensional Grid", pct: 45, desc: "Systematic political, economic, sociological, tech, eco, and legal grid." },
        { name: "Dialectical Counter-Thesis", pct: 20, desc: "Address limits, counter-arguments, and complex trade-offs." },
        { name: "Futuristic Inspirational finish", pct: 20, desc: "Align with Tagore, Kalam, or Preamble ideals for clean climax." }
      ],
      tactics: [
        { title: "Anectodoal Parable Hooks", text: "Open with a unique historical anecdote (e.g., Socrates' trials, the tragedy of the commons) or a highly visual story rather than flat definitions." },
        { title: "PESTEL Coordinate Matrix", text: "Scale your analysis systematically from micro parameters (soul, cognitive ethics) to macro parameters (national wealth, global climate, cosmic humanism)." },
        { title: "Dialectical Counter-examination", text: "Engage in genuine intellectual depth by challenging your own central thesis: outline limitations or contradictions to capture academic maturity." }
      ],
      evidence: ["Rabindranath Tagore's Humanism", "APJ Abdul Kalam's Vision 2020", "Preamble Constitutional Morality", "Universal Declaration of Human Rights", "Civilizational Historical Parables"],
      contrast: {
        standard: "Starts with: 'Poverty is a big curse. It causes crime and stops development, which is bad for everyone.' (Simplistic, flat intro).",
        topper: "Starts with: 'In 1845, Henry David Thoreau retreated to Walden Pond, seeking a life of pure simplicity, detached from material wealth. This parable reveals the eternal dichotomy of poverty: it is both a deprivation of bodily capabilities and, in voluntary forms, a source of moral richness...' (Narrative hook, philosophical depth)."
      }
    }
  };

  const currentData = papersData[activeTab];

  return (
    <div className="bg-app border border-panel-border rounded-2xl p-6 md:p-8 relative overflow-hidden mt-6 mb-6 z-10 w-full shadow-sm">
      {/* Decorative inner gradient */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-panel-border/50 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-accent/10 border border-accent/20 text-accent text-[9px] font-black tracking-wider uppercase">Rank 1 Framework</span>
            <h3 className="text-base font-black text-main uppercase tracking-wider flex items-center gap-2">
              Topper Writing Patterns & Frameworks
            </h3>
          </div>
          <p className="text-[11px] text-muted mt-1 leading-relaxed">
            Browse structural layouts, space distributions, and keyword models utilized by UPSC toppers to maximize scores.
          </p>
        </div>
        <button
          onClick={() => onNavigate('blueprint')}
          className="px-4 py-2 bg-accent text-white font-extrabold rounded-xl text-[11px] tracking-wider uppercase hover:bg-accent/90 transition-all flex items-center gap-1.5 shadow-md shadow-accent/10 shrink-0"
        >
          <PenTool className="w-3.5 h-3.5" /> Practice Blueprint
        </button>
      </div>

      {/* Tabs Selector */}
      <div className="flex flex-wrap gap-1.5 mb-6 bg-input/40 p-1 rounded-xl w-max border border-panel-border/50">
        {(Object.keys(papersData) as Array<keyof typeof papersData>).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? 'bg-app text-accent shadow-sm'
                  : 'text-muted hover:text-main'
              }`}
            >
              {tab === 'Essay' ? 'Essay' : tab}
            </button>
          );
        })}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Visual Space indicators and Value Adds */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h4 className="text-[11px] font-black text-main uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-3 rounded bg-accent block" /> Space Devolution Structure
            </h4>
            
            {/* Visual stacked bar */}
            <div className="w-full h-4 bg-muted/10 rounded-lg flex overflow-hidden border border-panel-border/50 mb-4 shadow-inner">
              {currentData.spaceAllocation.map((item, idx) => {
                const colors = [
                  'bg-indigo-500/80',
                  'bg-cyan-500/80',
                  'bg-emerald-500/80',
                  'bg-amber-500/80'
                ];
                return (
                  <div
                    key={idx}
                    className={`${colors[idx % colors.length]} h-full transition-all`}
                    style={{ width: `${item.pct}%` }}
                    title={`${item.name}: ${item.pct}%`}
                  />
                );
              })}
            </div>

            {/* List breakdown */}
            <div className="space-y-3">
              {currentData.spaceAllocation.map((item, idx) => {
                const colors = [
                  'bg-indigo-500',
                  'bg-cyan-500',
                  'bg-emerald-500',
                  'bg-amber-500'
                ];
                return (
                  <div key={idx} className="flex items-start gap-3 bg-input/20 p-2.5 rounded-xl border border-panel-border/30">
                    <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]} shrink-0 mt-1`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold text-main block truncate leading-none">{item.name}</span>
                        <span className="text-[11px] font-extrabold text-accent leading-none shrink-0">{item.pct}% area</span>
                      </div>
                      <p className="text-[11px] text-muted mt-1 leading-normal">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Evidence Base */}
          <div className="bg-input/20 border border-panel-border/45 rounded-xl p-4">
            <h4 className="text-[11px] font-black text-main uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent" /> High-Density Evidence Base
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {currentData.evidence.map((ev, i) => (
                <span key={i} className="text-[11px] font-bold text-main bg-input border border-panel-border/60 rounded-lg px-2.5 py-1.5 flex items-center gap-1 shadow-sm">
                  <Check className="w-2.5 h-2.5 text-accent shrink-0" />
                  {ev}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Tactics and Comparison */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h4 className="text-[11px] font-black text-main uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-3 rounded bg-accent block" /> Ranker Framing Strategies
            </h4>
            <div className="grid grid-cols-1 gap-3.5">
              {currentData.tactics.map((tac, idx) => (
                <div key={idx} className="bg-input/30 border border-panel-border/40 p-4 rounded-xl space-y-1 hover:border-panel-border/70 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-accent/10 border border-accent/20 text-accent flex items-center justify-center font-bold text-[10px] shrink-0">{idx + 1}</span>
                    <h5 className="font-extrabold text-[11px] text-main tracking-wide uppercase">{tac.title}</h5>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed pl-7">{tac.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Standard vs Topper Contrast Box */}
          <div className="border border-panel-border rounded-xl overflow-hidden bg-app/50 shadow-sm">
            <div className="bg-input/50 px-4 py-2 w-full border-b border-panel-border flex items-center justify-between">
              <span className="text-[11px] font-black text-main uppercase tracking-wider">Pattern Comparison Paradigm</span>
              <span className="text-[10px] font-bold text-muted bg-app/80 px-2.5 py-1 rounded border border-panel-border/40 uppercase">Evaluation Delta</span>
            </div>
            <div className="divide-y divide-panel-border/50">
              <div className="p-4 space-y-1.5 bg-rose-500/5">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block bg-rose-500/10 px-1.5 py-0.5 rounded w-max">Standard Aspirant Answer (~3.5/10)</span>
                <p className="text-[11px] text-muted italic leading-relaxed pl-1">
                  &ldquo;{currentData.contrast.standard}&rdquo;
                </p>
              </div>
              <div className="p-4 space-y-1.5 bg-emerald-500/5">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block bg-emerald-500/10 px-1.5 py-0.5 rounded w-max">Rank 1 Topper Approach (~7.0/10)</span>
                <p className="text-[11px] text-main font-medium italic leading-relaxed pl-1">
                  &ldquo;{currentData.contrast.topper}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function MilestonesWidget() {
  const [totalHours, setTotalHours] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // calculate total hours
    const logs = JSON.parse(localStorage.getItem("upsc_deep_work_logs") || "[]");
    const totalMinutes = logs.reduce((acc: number, log: any) => acc + (log.durationMinutes || 0), 0);
    setTotalHours(Math.floor(totalMinutes / 60));

    // calculate streak
    const uniqueDates = [...new Set(logs.map((l: any) => l.date.split('T')[0]))].sort().reverse() as string[];
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    if (uniqueDates.length > 0) {
      const latestDate = new Date(uniqueDates[0]);
      latestDate.setHours(0,0,0,0);
      const diffFromToday = (today.getTime() - latestDate.getTime()) / (1000 * 3600 * 24);
      if (Math.round(diffFromToday) <= 1) {
        currentStreak = 1;
        let currentDateRef = latestDate;
        for (let i = 1; i < uniqueDates.length; i++) {
          const prev = new Date(uniqueDates[i]);
          prev.setHours(0,0,0,0);
          const gap = (currentDateRef.getTime() - prev.getTime()) / (1000 * 3600 * 24);
          if (Math.round(gap) === 1) {
            currentStreak++;
            currentDateRef = prev;
          } else if (Math.round(gap) > 1) {
            break;
          }
        }
      }
    }
    setStreak(currentStreak);

    const handleUpdate = () => {
      // re-calculate
      const updatedLogs = JSON.parse(localStorage.getItem("upsc_deep_work_logs") || "[]");
      const updatedTotalMinutes = updatedLogs.reduce((acc: number, log: any) => acc + (log.durationMinutes || 0), 0);
      setTotalHours(Math.floor(updatedTotalMinutes / 60));
      
      const newUniqueDates = [...new Set(updatedLogs.map((l: any) => l.date.split('T')[0]))].sort().reverse() as string[];
      let newCurrentStreak = 0;
      if (newUniqueDates.length > 0) {
        const latestDate = new Date(newUniqueDates[0]);
        latestDate.setHours(0,0,0,0);
        const diffFromToday = (today.getTime() - latestDate.getTime()) / (1000 * 3600 * 24);
        if (Math.round(diffFromToday) <= 1) {
          newCurrentStreak = 1;
          let currentDateRef = latestDate;
          for (let i = 1; i < newUniqueDates.length; i++) {
            const prev = new Date(newUniqueDates[i]);
            prev.setHours(0,0,0,0);
            const gap = (currentDateRef.getTime() - prev.getTime()) / (1000 * 3600 * 24);
            if (Math.round(gap) === 1) {
              newCurrentStreak++;
              currentDateRef = prev;
            } else if (Math.round(gap) > 1) {
              break;
            }
          }
        }
      }
      setStreak(newCurrentStreak);
    };

    window.addEventListener('deep_work_log_added', handleUpdate);
    window.addEventListener('app:deepWorkUpdated', handleUpdate);
    return () => {
      window.removeEventListener('deep_work_log_added', handleUpdate);
      window.removeEventListener('app:deepWorkUpdated', handleUpdate);
    };
  }, []);

  const milestones = [
    {
      id: 'streak-7',
      title: '7-Day Streak',
      desc: 'Consistency is key',
      achieved: streak >= 7,
      progress: Math.min(100, Math.round((streak / 7) * 100)),
      icon: <Flame className={`w-5 h-5 ${streak >= 7 ? 'text-amber-500' : 'text-muted'}`} />
    },
    {
      id: 'streak-30',
      title: '30-Day Streak',
      desc: 'Unstoppable momentum',
      achieved: streak >= 30,
      progress: Math.min(100, Math.round((streak / 30) * 100)),
      icon: <Trophy className={`w-5 h-5 ${streak >= 30 ? 'text-amber-500' : 'text-muted'}`} />
    },
    {
      id: 'hours-100',
      title: '100 Hours',
      desc: 'Deep work logged',
      achieved: totalHours >= 100,
      progress: Math.min(100, Math.round((totalHours / 100) * 100)),
      icon: <Clock className={`w-5 h-5 ${totalHours >= 100 ? 'text-blue-500' : 'text-muted'}`} />
    },
    {
      id: 'hours-500',
      title: '500 Hours',
      desc: 'Mastery in progress',
      achieved: totalHours >= 500,
      progress: Math.min(100, Math.round((totalHours / 500) * 100)),
      icon: <Zap className={`w-5 h-5 ${totalHours >= 500 ? 'text-purple-500' : 'text-muted'}`} />
    }
  ];

  return (
    <div className="bg-app glass-panel rounded-2xl border border-panel-border p-6 mt-6 shadow-sm w-full relative z-10">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-panel-border/50">
        <h3 className="text-lg font-black text-main uppercase tracking-wider flex items-center gap-2">
          <Award className="w-5 h-5 text-accent" /> Achievement Milestones
        </h3>
        <p className="text-[11px] text-muted font-bold uppercase tracking-widest bg-muted/5 px-2.5 py-1 rounded">
          {milestones.filter(m => m.achieved).length} / {milestones.length} Unlocked
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {milestones.map((m) => (
          <div key={m.id} className={`border rounded-xl p-4 flex flex-col gap-3 transition-all ${m.achieved ? 'border-accent/40 bg-accent/5' : 'border-panel-border bg-input/20'}`}>
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.achieved ? 'bg-app border border-accent/20 shadow-sm' : 'bg-app border border-panel-border'}`}>
                 {m.icon}
              </div>
              {m.achieved && (
                <div className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Unlocked</span>
                </div>
              )}
            </div>
            <div>
              <h4 className={`font-bold text-sm ${m.achieved ? 'text-main' : 'text-muted'}`}>{m.title}</h4>
              <p className="text-[11px] text-muted font-medium mt-0.5">{m.desc}</p>
            </div>
            {!m.achieved && (
              <div className="mt-auto pt-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5 text-muted">
                  <span>Progress</span>
                  <span>{m.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-app border border-panel-border rounded-full overflow-hidden">
                   <div className="h-full bg-accent/50 transition-all duration-1000" style={{ width: `${m.progress}%` }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function OverviewView({ onNavigate }: OverviewViewProps) {
  // Stats
  const [deepWorkMinutes, setDeepWorkMinutes] = useState(0);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [syllabusMasteredCount, setSyllabusMasteredCount] = useState(0);

  const refreshStats = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const storedDW = localStorage.getItem('upsc_deep_work_stats');
      if (storedDW) {
        const _dw = JSON.parse(storedDW);
        if (_dw[today]) setDeepWorkMinutes(_dw[today]);
      }

      const tpRaw = localStorage.getItem('upsc_daily_planner') || localStorage.getItem('upsc_micro_planner');
      if (tpRaw) {
        let tasks = JSON.parse(tpRaw);
        if (!Array.isArray(tasks) && tasks[today]) tasks = tasks[today];
        if (Array.isArray(tasks)) {
           setPendingTasksCount(tasks.filter((t: any) => !t.completed).length);
        }
      }

      const mistakesRaw = localStorage.getItem('upsc_mistake_book');
      if (mistakesRaw) {
        const m = JSON.parse(mistakesRaw);
        setMistakesCount(Array.isArray(m) ? m.length : 0);
      }
      
      const syllabusRaw = localStorage.getItem('upsc_syllabus_v2');
      if (syllabusRaw) {
        const topics = JSON.parse(syllabusRaw);
        let count = 0;
        let totalCount = 0;
        const countTopics = (arr: any[]) => {
          arr.forEach((t: any) => {
            if (!t.subtopics || t.subtopics.length === 0) {
              totalCount++;
              if (t.status === 'mastered') count++;
            } else {
              countTopics(t.subtopics);
            }
          });
        };
        countTopics(topics);
        setSyllabusMasteredCount(count);
      }
    } catch (e) {
      console.log('Error parsing stats', e);
    }
  };

  useEffect(() => {
    refreshStats();

    window.addEventListener('app:deepWorkUpdated', refreshStats);
    window.addEventListener('deep_work_log_added', refreshStats);
    window.addEventListener('upsc_mistakes_updated', refreshStats);
    window.addEventListener('app:plannerUpdated', refreshStats);
    window.addEventListener('storage', refreshStats);
    return () => {
      window.removeEventListener('app:deepWorkUpdated', refreshStats);
      window.removeEventListener('deep_work_log_added', refreshStats);
      window.removeEventListener('upsc_mistakes_updated', refreshStats);
      window.removeEventListener('app:plannerUpdated', refreshStats);
      window.removeEventListener('storage', refreshStats);
    };
  }, []);

  const dwh = Math.floor(deepWorkMinutes / 60);
  const dwm = deepWorkMinutes % 60;

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans bg-muted/5 relative">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-main tracking-tight flex items-center gap-2">
            Preparation Console
          </h1>
          <p className="text-sm text-muted mt-1 font-medium tracking-wide">
            Strategic performance analytics, daily tracking, and curriculum mapping.
          </p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => onNavigate('digest')} 
             className="px-5 py-2.5 bg-accent/10 text-accent font-bold rounded-xl text-sm tracking-wide hover:bg-accent/20 transition-all flex items-center gap-2 border border-accent/20"
           >
             <Activity className="w-4 h-4" /> Today's Digest
           </button>
           <button 
             onClick={() => onNavigate('planner')} 
             className="px-5 py-2.5 bg-accent text-white font-bold rounded-xl text-sm tracking-wide hover:bg-accent/90 transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
           >
             <Play className="w-4 h-4" /> Start Focus Session
           </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 relative z-10">
        {/* Deep Work Card */}
        <div className="bg-app glass-panel rounded-2xl p-6 flex flex-col items-start gap-4 border border-panel-border transition-all hover:border-accent/40">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Clock className="w-5 h-5" />
          </div>
          <div>
             <h3 className="text-3xl font-black text-main tracking-tighter">
               {dwh}h {dwm}m
             </h3>
             <p className="text-[11px] font-bold text-muted uppercase tracking-wider mt-1">Deep Work Today</p>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-app glass-panel rounded-2xl p-6 flex flex-col items-start gap-4 border border-panel-border transition-all hover:border-emerald-500/40">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
             <h3 className="text-3xl font-black text-main tracking-tighter">
               {pendingTasksCount}
             </h3>
             <p className="text-[11px] font-bold text-muted uppercase tracking-wider mt-1">Pending Planner Tasks</p>
          </div>
        </div>

        {/* Mastered Topics */}
        <div className="bg-app glass-panel rounded-2xl p-6 flex flex-col items-start gap-4 border border-panel-border transition-all hover:border-blue-500/40">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
             <h3 className="text-3xl font-black text-main tracking-tighter">
               {syllabusMasteredCount}
             </h3>
             <p className="text-[11px] font-bold text-muted uppercase tracking-wider mt-1">Topics Mastered</p>
          </div>
        </div>

        {/* Mistake Book */}
        <div className="bg-app glass-panel rounded-2xl p-6 flex flex-col items-start gap-4 border border-panel-border transition-all hover:border-rose-500/40">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
             <h3 className="text-3xl font-black text-main tracking-tighter">
               {mistakesCount}
             </h3>
             <p className="text-[11px] font-bold text-muted uppercase tracking-wider mt-1">Total Logged Mistakes</p>
          </div>
        </div>
      </div>
      
      <MilestonesWidget />
      <DailyGoalTracker />
      <ExamCountdownWidget />

      <ConceptGraph onNavigate={onNavigate} />

      <TopperPatternsDashboard onNavigate={onNavigate} />

      <div className="pt-6 relative z-10 w-full">
         <D3CalendarHeatmap />
      </div>

      <VerticalStudyRoadmap onNavigate={onNavigate} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 relative z-10">
        
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-main uppercase tracking-wider flex items-center gap-2">
                 <TrendingUp className="w-5 h-5 text-accent" /> Quick Actions Hub
              </h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => onNavigate('rss-reader')}
                className="group cursor-pointer bg-app border border-panel-border rounded-2xl p-5 hover:border-accent/40 hover:bg-accent/5 transition-all flex flex-col justify-between"
              >
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Activity className="w-6 h-6" />
                     </div>
                     <ChevronRight className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-main">RSS Feed Reader</h4>
                    <p className="text-[11px] text-muted mt-1 leading-relaxed">Catch up on curated Editorials from The Hindu and Indian Express.</p>
                  </div>
              </div>

                <div 
                onClick={() => onNavigate('notes')}
                className="group cursor-pointer bg-app border border-panel-border rounded-2xl p-5 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all flex flex-col justify-between"
              >
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BookOpen className="w-6 h-6" />
                     </div>
                     <ChevronRight className="w-5 h-5 text-muted group-hover:text-purple-500 transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-main">Concept Notes Generator</h4>
                    <p className="text-[11px] text-muted mt-1 leading-relaxed">Synthesize scattered topics into structured mains-ready notes.</p>
                  </div>
              </div>

               <div 
                onClick={() => onNavigate('mistake-book')}
                className="group cursor-pointer bg-app border border-panel-border rounded-2xl p-5 hover:border-rose-500/40 hover:bg-rose-500/5 transition-all flex flex-col justify-between"
              >
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <AlertTriangle className="w-6 h-6" />
                     </div>
                     <ChevronRight className="w-5 h-5 text-muted group-hover:text-rose-500 transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-main">Review Mistake Book</h4>
                    <p className="text-[11px] text-muted mt-1 leading-relaxed">Analyze test series errors to prevent negative marking.</p>
                  </div>
              </div>

               <div 
                onClick={() => onNavigate('chat')}
                className="group cursor-pointer bg-app border border-panel-border rounded-2xl p-5 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all flex flex-col justify-between"
              >
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-6 h-6" />
                     </div>
                     <ChevronRight className="w-5 h-5 text-muted group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-main">UPSC AI Mentor</h4>
                    <p className="text-[11px] text-muted mt-1 leading-relaxed">Contextual multi-turn guidance tailored to syllabus nuances.</p>
                  </div>
              </div>
           </div>
        </div>

        <div className="bg-app glass-panel border border-panel-border rounded-2xl p-6 flex flex-col">
           <h3 className="text-[13px] font-black text-main uppercase tracking-widest mb-6 border-b border-panel-border pb-4 flex items-center justify-between">
              Zen Mode Focus <span className="bg-accent/10 text-accent px-2 py-0.5 rounded text-[11px] font-bold">PRO</span>
           </h3>
           <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full border border-panel-border flex items-center justify-center shadow-inner relative overflow-hidden bg-muted/5">
                 <div className="absolute inset-0 bg-accent/5" />
                 <BookOpen className="w-8 h-8 text-muted opacity-50" />
              </div>
              <div>
                 <h4 className="font-bold text-main">Distraction-Free Environment</h4>
                 <p className="text-[11px] text-muted mt-2 leading-relaxed px-4">
                   Collapse the sidebar via the top-left toggle or hit F11 for full immersion. The Atlas environment removes notifications to multiply your effective study output.
                 </p>
              </div>
           </div>
        </div>

      </div>

    </div>
  );
}
