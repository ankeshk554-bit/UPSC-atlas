import { apiFetch } from '../lib/api';
import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  FileText,
  HelpCircle,
  Copy,
  Check,
  Send,
  Loader2,
  LayoutTemplate,
  Lightbulb,
  FileSpreadsheet,
  BookmarkCheck,
  Award,
  ChevronDown,
  ChevronUp,
  Timer,
  Play,
  Pause,
  Square,
  Compass,
  Zap,
  ListTodo,
  Network,
  Table2,
  Map,
  Scale,
  Coins,
  Cpu,
  ShieldAlert,
  Heart
} from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DeepSeekModel } from "../types";
import { MermaidChart } from "./MermaidChart";

interface DataBankItem {
  id: string;
  category: "Quote" | "SC Judgement" | "Committee" | "Statistic" | "Case Study";
  topic: string;
  content: string;
  authorOrSource: string;
  paper: string;
}

interface BlueprintSection {
  id: string;
  title: string;
  description: string;
  placeholder: string;
  valueAddsRequired: ("Quote" | "SC Judgement" | "Committee" | "Statistic" | "Case Study")[];
  points: string[];
  citations: DataBankItem[];
  paragraphDraft?: string;
}

interface SavedBlueprint {
  id: string;
  question: string;
  paper: "GS1" | "GS2" | "GS3" | "GS4" | "Essay";
  sections: BlueprintSection[];
  date: string;
  aiFeedback?: string;
  score?: number;
}

const PRESET_QUESTIONS = [
  {
    id: "q1",
    paper: "GS2" as const,
    question: "Analyze the challenges and prospects of cooperative federalism in India in light of recent fiscal tensions between Centre and States.",
    suggestedStructure: "Introduction (Article 246, GST framework) -> Body (Fiscal constraints, Cess/Surcharge issues, NITI Aayog's role) -> SC Cases/Committees (Sarkaria Commission, SR Bommai) -> Way Forward.",
  },
  {
    id: "q2",
    paper: "GS3" as const,
    question: "To what extent can digital public infrastructure (DPI) bridge the rural-urban divide in India's agricultural supply chain? Examine.",
    suggestedStructure: "Introduction (Definition of DPI/AgriStack) -> Body (Disintermediation, price discovery, financial inclusion, tech barriers) -> Stats/Committees (Dalwai Committee, NSSO data) -> Conclusion.",
  },
  {
    id: "q3",
    paper: "GS4" as const,
    question: "You are the District Magistrate of a communally sensitive district where a major festival is about to take place. An provocative social media post by a local youth has triggered widespread protests with demands for immediate arrest and violence. Discuss your ethical dilemmas and immediate administrative course of action.",
    suggestedStructure: "Introduction (Identify ethical dilemas: Law & order vs. Freedom of speech, public safety) -> Body (Immediate crisis containment, medium-term peace dialogues) -> Ethical Principles (Probity, crisis leadership) -> Conclusion.",
  },
  {
    id: "q4",
    paper: "GS1" as const,
    question: "Critically evaluate the impact of rapid urbanization on the structure and values of traditional joint families in modern Indian society.",
    suggestedStructure: "Introduction (Urbanization data) -> Body (Nucleation of families, structural shifts, changing gender roles, elderly isolation) -> Way Forward.",
  },
  {
    id: "q6",
    paper: "GS1" as const,
    question: "Explain the factors responsible for the origin of earthquakes and locate the major seismic zones of the Indian subcontinent with special reference to plate tectonic settings.",
    suggestedStructure: "Introduction (Definition of seismicity, elastic rebound theory) -> Body (Inter-plate vs intra-plate tectonics, locate Seismic Zone V to II, Himalayan convergent boundary) -> Way Forward (NDMA guidelines for earthquake risk resilience).",
  },
  {
    id: "q7",
    paper: "GS1" as const,
    question: "Examine the physical and dynamical mechanism of the Indian Monsoon. How do Indian Ocean Dipole (IOD) and El Niño Southern Oscillation (ENSO) modulate precipitation pattern variations?",
    suggestedStructure: "Introduction (Thermal theory vs dynamic theory of monsoons) -> Body (ITCZ movement, jet streams role, positive/negative IOD anomalies, El Niño dry spells) -> Way Forward (Micro-irrigation frameworks, adaptive resilient agricultural sowing).",
  },
  {
    id: "q5",
    paper: "Essay" as const,
    question: "Mindfulness is the process of keeping one's consciousness alive to the current reality.",
    suggestedStructure: "Introduction (Hook, philosophical background) -> Body (Multi-dimensional framework: Individual, societal, environment, political consciousness) -> Quotes/Philosophers -> Philosophical Resolution.",
  }
];

interface SyllabusGuideline {
  subject: string;
  banner: string;
  iconName: "Map" | "Scale" | "Coins" | "Cpu" | "ShieldAlert" | "Heart" | "BookOpen" | "Sparkles";
  colorClass: string;
  badgeColorClass: string;
  description: string;
  guidelines: string[];
}

const getDynamicSyllabusGuidelines = (detectedSub: string, qText: string): SyllabusGuideline => {
  const normSub = (detectedSub || "").toLowerCase();
  const normText = (qText || "").toLowerCase();
  
  if (
    normSub.includes("geography") || 
    normText.includes("earthquake") || 
    normText.includes("seismic") || 
    normText.includes("monsoon") || 
    normText.includes("orographic") || 
    normText.includes("plates") || 
    normText.includes("precipitation") || 
    normText.includes("dipole") || 
    normText.includes("ocean") ||
    normText.includes("climate") ||
    normText.includes("geomorphology") ||
    normText.includes("climatology") ||
    normText.includes("river") ||
    normText.includes("volcano") ||
    normText.includes("seismicity")
  ) {
    return {
      subject: "Geography & Physical Sciences (GS-1)",
      banner: "Geography Map & Diagram Schema Active",
      iconName: "Map",
      colorClass: "from-sky-500/10 to-blue-600/5 text-sky-400 border-sky-400/30",
      badgeColorClass: "bg-sky-500/10 border-sky-400/35 text-sky-400",
      description: "UPSC GS-1 Geography prompts heavily reward geographic hand-drawn outline maps, schematic flowcharts of physical mechanisms, and structural diagrams.",
      guidelines: [
        "Include schematic cross-section diagrams representing physical processes (e.g., tectonic boundaries, convection currents, ITCZ, ENSO).",
        "Draw clean, raw hand-drawn outline maps of India or relevant global regions to label seismic, climatic, or resource zones.",
        "Address specific altitudinal zonation patterns, mountain ranges, coastal barriers, or thermohaline flows.",
        "Refer to the NDMA (National Disaster Management Authority) or IMD models of mitigation as progressive action directives."
      ]
    };
  }
  
  if (
    normSub.includes("polity") || 
    normSub.includes("constitution") || 
    normSub.includes("governance") || 
    normSub.includes("justice") || 
    normText.includes("court") || 
    normText.includes("judgement") || 
    normText.includes("article") || 
    normText.includes("separation of powers") || 
    normText.includes("parliament") || 
    normText.includes("constitution") || 
    normText.includes("federalism") ||
    normText.includes("judiciary") ||
    normText.includes("legislative") ||
    normText.includes("cabinet")
  ) {
    return {
      subject: "Polity, Constitution & Governance (GS-2)",
      banner: "Constitutional Article & Case Law Benchmarks Active",
      iconName: "Scale",
      colorClass: "from-indigo-500/10 to-purple-600/5 text-indigo-400 border-indigo-400/30",
      badgeColorClass: "bg-indigo-500/10 border-indigo-400/35 text-indigo-400",
      description: "UPSC GS-2 Polity answers must avoid generic essays. Always anchor your outline with constitutional Articles, Supreme Court ratios, and committee findings.",
      guidelines: [
        "Cite major Articles of the Constitution (e.g., Articles 14, 21, 142, 246, 356) right in the introduction to lay strong groundwork.",
        "Ground argument dimensions using landmark judicial cases (e.g., Kesavananda Bharati, Bommai, Puttaswamy, Minerva Mills).",
        "Incorporate structural recommendations from the 2nd Administrative Reforms Commission (ARC) or Law Commission boards.",
        "Focus on cooperative federalism, democratic decentralization, constitutional morality, and the rule of law."
      ]
    };
  }
  
  if (
    normSub.includes("economy") || 
    normSub.includes("agriculture") || 
    normText.includes("economic") || 
    normText.includes("gdp") || 
    normText.includes("sowing") || 
    normText.includes("fdi") || 
    normText.includes("industry") || 
    normText.includes("irrigation") || 
    normText.includes("pm-") || 
    normText.includes("growth") ||
    normText.includes("fiscal") ||
    normText.includes("tax") ||
    normText.includes("inflation") ||
    normText.includes("banking") ||
    normText.includes("supply chain")
  ) {
    return {
      subject: "Economy, Agriculture & Infrastructure (GS-3)",
      banner: "Mains Macro-Data & Supply Linkage Schema Active",
      iconName: "Coins",
      colorClass: "from-emerald-500/10 to-teal-600/5 text-emerald-400 border-emerald-400/30",
      badgeColorClass: "bg-emerald-500/10 border-emerald-400/35 text-emerald-400",
      description: "UPSC GS-3 Economy and Agriculture prompts require dense macro statistics, supply linkage networks, and concrete policy schemes.",
      guidelines: [
        "Incorporate verified macro statistics (economic survey metrics, NITI Aayog index, debt-to-gdp ratios) in your opening hook.",
        "Incorporate a supply-chain processing loop diagram or a backward-forward linkages schematic chart.",
        "Keep arguments balanced between production inputs (micro-irrigation, fertilizer, seeds) and market avenues (APMC, e-NAM).",
        "Reference modern policy schemes as action outcomes (e.g., PM Gati Shakti, PM Fasal Bima Yojana, AgriStack)."
      ]
    };
  }

  if (
    normSub.includes("science") || 
    normSub.includes("technology") || 
    normText.includes("nanotech") || 
    normText.includes("biotech") || 
    normText.includes("space") || 
    normText.includes("nuclear") || 
    normText.includes("artificial intelligence") || 
    normText.includes("cyber") || 
    normText.includes("energy") ||
    normText.includes("defense") ||
    normText.includes("indigenisation")
  ) {
    return {
      subject: "Science & Technology Development (GS-3)",
      banner: "Technical Block Schema & Dual-Use Vector Active",
      iconName: "Cpu",
      colorClass: "from-cyan-500/10 to-sky-600/5 text-cyan-400 border-cyan-400/30",
      badgeColorClass: "bg-cyan-500/10 border-cyan-400/35 text-cyan-400",
      description: "GS-3 Science & Tech requires defining scientific concepts simply before outlining dual-use application areas and regulatory concerns.",
      guidelines: [
        "Include a brief tech block structure or system drawing (e.g., layered AI stack, CRISPR gene clips, satellite orbit altitudes).",
        "Address fundamental scientific core principles (e.g., quantum entanglement, fusion reaction boundaries) in the introduction.",
        "Balance arguments between massive digital public welfare benefits and security risks (bias, data leaks, geopolitical misuse).",
        "Reference global multi-agency regulatory principles, G20 declarations, or specific National Tech Missions."
      ]
    };
  }

  if (
    normSub.includes("environment") || 
    normSub.includes("disaster") || 
    normSub.includes("security") || 
    normText.includes("pollution") || 
    normText.includes("climate change") || 
    normText.includes("biodiversity") || 
    normText.includes("militancy") || 
    normText.includes("extremism") || 
    normText.includes("border management") ||
    normText.includes("cop28") ||
    normText.includes("environmental") ||
    normText.includes("wildlife")
  ) {
    return {
      subject: "Environment, Security & Disaster Management (GS-3)",
      banner: "Sendai & Global Treaties Alignment Active",
      iconName: "ShieldAlert",
      colorClass: "from-orange-500/10 to-red-600/5 text-orange-400 border-orange-400/30",
      badgeColorClass: "bg-orange-500/10 border-orange-400/35 text-orange-400",
      description: "GS-3 Environment & Security questions demand international framework compliance (e.g., Sendai Framework, Paris Treaty) alongside clear mitigation workflows.",
      guidelines: [
        "Align disaster handling points with Sendai Framework's four priority actions (understanding risk, strengthening governance, investing, preparing).",
        "Detail pre-disaster preparedness elements, active response boundaries, and post-disaster resilient infrastructure rebuilds.",
        "Ground security prompts using advanced technological solutions (smart border fencing, UAV tracking, central state grids).",
        "Reference specific environmental conventions and local hotspot monitoring cases (such as biological reserves, Ramsar sites)."
      ]
    };
  }

  if (
    normSub.includes("ethics") || 
    normSub.includes("case study") || 
    normSub.includes("integrity") || 
    normSub.includes("probity") || 
    normSub.includes("ethical") || 
    normText.includes("ethics") || 
    normText.includes("dilemma") || 
    normText.includes("values") || 
    normText.includes("case study") ||
    normSub.includes("case studies")
  ) {
    return {
      subject: "GS-4 Ethics, Integrity & Case Studies",
      banner: "Ethical Dilemmas & Stakeholder Matrices Active",
      iconName: "Heart",
      colorClass: "from-pink-500/10 to-rose-600/5 text-pink-400 border-pink-400/30",
      badgeColorClass: "bg-pink-500/10 border-pink-400/35 text-pink-400",
      description: "GS-4 Ethics papers evaluate your value choices. Always write down the focal ethical dilemma using an structured stakeholder grid.",
      guidelines: [
        "Contrast competing professional or personal values (e.g., administrative efficiency vs. empathy for marginal clusters).",
        "Encircle a complete stakeholder web detail list in your initial outline brainstorm.",
        "Adopt ethical frameworks specifically (e.g., Kantian categorical imperatives, Aristotle golden mean, Gandhiji's Talisman).",
        "Conclude with balanced, moral courage directives, citing the administrative oath of office or structural transparency."
      ]
    };
  }

  if (
    normSub.includes("history") || 
    normSub.includes("society") || 
    normSub.includes("culture") || 
    normText.includes("history") || 
    normText.includes("society") || 
    normText.includes("cultural") || 
    normText.includes("movement") || 
    normText.includes("british") || 
    normText.includes("ancient") || 
    normText.includes("medieval") || 
    normText.includes("social") ||
    normText.includes("joint families") ||
    normSub.includes("essay")
  ) {
    return {
      subject: "History, Heritage, Society & Essay Themes",
      banner: "Chronological Anchor & Societal Paradigm Active",
      iconName: "BookOpen",
      colorClass: "from-amber-500/10 to-yellow-600/5 text-amber-500 border-yellow-400/30",
      badgeColorClass: "bg-amber-500/10 border-yellow-400/35 text-amber-500",
      description: "GS-1 History, Society, and general essays need chronologically precise evidence grids coupled with multi-dimensional thematic tracks.",
      guidelines: [
        "Include chronologic timelines, exact milestones, or historical commission reports to root your history arguments.",
        "Contrast social patterns over time (e.g., traditional joint family setups vs. globalization family nucleation).",
        "Identify specific sub-cultural parameters (regional languages, art guidelines, architectural lineages, spiritual nodes).",
        "Evaluate multi-dimensional implications scaling from individual human souls to national sovereignty."
      ]
    };
  }

  // Default
  return {
    subject: detectedSub || "Mains Core Subject Area",
    banner: "Syllabus-Aligned Analytical Framework Active",
    iconName: "Sparkles",
    colorClass: "from-accent/20 to-accent/5 text-accent border-accent/20",
    badgeColorClass: "bg-accent/15 border-accent/20 text-accent",
    description: "Write points that are high-yield, specific, and structured. Incorporate relevant data bank variables to bolster argument weight.",
    guidelines: [
      "Deconstruct sub-parts of the question and map separate analytical headings for each.",
      "Anchor your introduction to either definitions, index metrics, or context settings.",
      "Evaluate both sides / multi-dimensions (economic, social, constitutional) before giving progressive way forwards.",
      "Propose actionable, smart suggestions aligned with policy reports or international goals (SDGs)."
    ]
  };
};

const renderSubjectIcon = (iconName: string) => {
  switch (iconName) {
    case "Map": return <Map className="w-5 h-5 text-sky-400 shrink-0" />;
    case "Scale": return <Scale className="w-5 h-5 text-indigo-400 shrink-0" />;
    case "Coins": return <Coins className="w-5 h-5 text-emerald-400 shrink-0" />;
    case "Cpu": return <Cpu className="w-5 h-5 text-cyan-400 shrink-0" />;
    case "ShieldAlert": return <ShieldAlert className="w-5 h-5 text-orange-400 shrink-0" />;
    case "Heart": return <Heart className="w-5 h-5 text-pink-400 shrink-0" />;
    case "BookOpen": return <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />;
    default: return <Sparkles className="w-5 h-5 text-accent shrink-0" />;
  }
};

export function AnswerBlueprintView({ model }: { model: DeepSeekModel }) {
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [currentPaper, setCurrentPaper] = useState<"GS1" | "GS2" | "GS3" | "GS4" | "Essay">(() => {
    const pendingPaper = localStorage.getItem("upsc_pending_blueprint_paper");
    if (pendingPaper) {
      localStorage.removeItem("upsc_pending_blueprint_paper");
      return pendingPaper as any;
    }
    return "GS2";
  });
  const [customQuestion, setCustomQuestion] = useState<string>(() => {
    const pendingQuestion = localStorage.getItem("upsc_pending_blueprint_question");
    if (pendingQuestion) {
      localStorage.removeItem("upsc_pending_blueprint_question");
      return pendingQuestion;
    }
    return "";
  });
  
  useEffect(() => {
    const handleSetQuestion = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        if (customEvent.detail.question) {
          setCustomQuestion(customEvent.detail.question);
        }
        if (customEvent.detail.paper) {
          setCurrentPaper(customEvent.detail.paper);
        }
      }
    };
    window.addEventListener("app:setBlueprintQuestion", handleSetQuestion);
    return () => window.removeEventListener("app:setBlueprintQuestion", handleSetQuestion);
  }, []);
  
  const [savedBlueprints, setSavedBlueprints] = useState<SavedBlueprint[]>(() => {
    const saved = localStorage.getItem("upsc_saved_blueprints");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeBlueprintId, setActiveBlueprintId] = useState<string | null>(null);

  // Default structure template
  const defaultSections = (paper: "GS1" | "GS2" | "GS3" | "GS4" | "Essay" = "GS2"): BlueprintSection[] => {
    if (paper === "GS1") {
      return [
        {
          id: "intro",
          title: "1. Intro, Chronology & Context (10% Space)",
          description: "Define core term, state key historical/geographical fact, traveler reference or demographic status.",
          placeholder: "Define structural elements (e.g. Sanskritization, rain-shadow effect, travelers like Al-Biruni)...",
          valueAddsRequired: ["Statistic", "Quote"],
          points: [""],
          citations: []
        },
        {
          id: "dimension1",
          title: "2. Spatial/Chronological Distribution & Maps (40% Space)",
          description: "Map links, physical/geographical distributions, or structural historical transitions.",
          placeholder: "Plot spatial resources, structural factors, diagram links (e.g. [Diagram: Coastal fault zones])...",
          valueAddsRequired: ["Case Study", "Statistic"],
          points: [""],
          citations: []
        },
        {
          id: "dimension2",
          title: "3. Socio-Demographic & Family Nucleation Dynamics (30% Space)",
          description: "Analyze changing joint family systems, structural social issues, Census 2011/NFHS facts, or gender matrix shifts.",
          placeholder: "Address joint family change dynamics, patriarchal bargains, urban decay indicators...",
          valueAddsRequired: ["Statistic", "Case Study"],
          points: [""],
          citations: []
        },
        {
          id: "conclusion",
          title: "4. SDG-11/SDG-5 Futuristic Mitigation & Conclusion (20% Space)",
          description: "Establish a positive way forward centering target alignment, societal resilience, or sustainable geography.",
          placeholder: "Align with SDG 11 (Sustainable Cities) or SDG 5 (Gender Equality), state path forward...",
          valueAddsRequired: ["Quote", "Committee"],
          points: [""],
          citations: []
        }
      ];
    }
    if (paper === "GS2") {
      return [
        {
          id: "intro",
          title: "1. Constitutional Grounding & Preamble (10% Space)",
          description: "State relevant Constitutional Articles, Schedules, legal doctrines, or constitutional base.",
          placeholder: "Cite Articles (e.g. Art 14, 19, 21, 131, 142) and landmark amendments (e.g. 42nd, 73rd, 103rd CAA)...",
          valueAddsRequired: ["SC Judgement", "Quote"],
          points: [""],
          citations: []
        },
        {
          id: "dimension1",
          title: "2. SC Judgements & Precedents (40% Space)",
          description: "Evaluate SC judgements, judicial doctrines, and separation of power matrix bottlenecks.",
          placeholder: "Landmark cases (e.g. Kesavananda Bharati, S.R. Bommai, Puttaswamy, Vishaka, Nabam Rebia Shreya Singhal)...",
          valueAddsRequired: ["SC Judgement", "Committee"],
          points: [""],
          citations: []
        },
        {
          id: "dimension2",
          title: "3. Welfare Governance & 2nd ARC Reforms (30% Space)",
          description: "Outline welfare indices, administrative commissions, federal conflicts, or civil society recommendations.",
          placeholder: "Refer to 2nd ARC, Punchhi Commission, Sarkaria Commission, Law Commission recommendations...",
          valueAddsRequired: ["Committee", "Case Study"],
          points: [""],
          citations: []
        },
        {
          id: "conclusion",
          title: "4. Global IR Frameworks & Institutional Way Forward (20% Space)",
          description: "Address bilateral/multilateral groupings, strategic autonomy, Track-1.5/2 diplomacy, or SDG 16.",
          placeholder: "Envisage Quad/G20 partnerships, strategic posture, and align with progressive constitutional morality...",
          valueAddsRequired: ["Committee", "Quote"],
          points: [""],
          citations: []
        }
      ];
    }
    if (paper === "GS3") {
      return [
        {
          id: "intro",
          title: "1. Macro-Economics & NITI Aayog Stats (10% Space)",
          description: "Cite macroeconomic stats, Economic Survey data, Union Budget quotes, or NITI Aayog indicators.",
          placeholder: "GDP multipliers, NSSO, RBI data, DPI networks, Gini indices (e.g., Virtuous Cycle of Investment)...",
          valueAddsRequired: ["Statistic", "Quote"],
          points: [""],
          citations: []
        },
        {
          id: "dimension1",
          title: "2. Agrarian Supply Chains & Ashok Dalwai Guidelines (40% Space)",
          description: "Structural blocks in APMC, post-harvest losses up to 30%, MSP procurement, and farmers' doubling policies.",
          placeholder: "Deploy Dalwai Committee reforms, supply chain disintermediation, Swaminathan commissions report...",
          valueAddsRequired: ["Committee", "Statistic"],
          points: [""],
          citations: []
        },
        {
          id: "dimension2",
          title: "3. Science/Tech Models & Border Security Systems (30% Space)",
          description: "Examine CRISPR, Quantum/AI missions, defense indigenization, border fences, or cyber security protocols.",
          placeholder: "Examine CERT-In models, ISRO space-tech, border defense grids, or indigenized modules...",
          valueAddsRequired: ["Case Study", "Committee"],
          points: [""],
          citations: []
        },
        {
          id: "conclusion",
          title: "4. NDMA Guidelines, Paris Targets & SDG Goals (20% Space)",
          description: "Incorporate IPCC targets, NDMA resilient setups, Paris COP pledges, and alignment to SDG 1, 2, 9, 13.",
          placeholder: "NDMA structural/non-structural guidelines, Net Zero 2070 target, align with SDG 13...",
          valueAddsRequired: ["Committee", "Statistic"],
          points: [""],
          citations: []
        }
      ];
    }
    if (paper === "GS4") {
      return [
        {
          id: "intro",
          title: "1. Stakeholder Matrix & Ethical Tensions (10% Space)",
          description: "Detail stakeholder web mapping and 3 explicit ethical conflicts/dilemmas in public service.",
          placeholder: "Map stakeholders (Public, DM, local youth, state). Identify Law & Order vs. Speech, Duty vs. Empathy...",
          valueAddsRequired: ["Case Study", "Quote"],
          points: [""],
          citations: []
        },
        {
          id: "dimension1",
          title: "2. Intellectual Value Systems & Theories (40% Space)",
          description: "Establish Kantian duty, Aristotelian virtue, Bentham utilitarian framework, or Nolan Principles of Public Life.",
          placeholder: "Argue from deontology (Kant), teleology (Mill), emotional intelligence, Nolan Principles (Probity, Objectivity)...",
          valueAddsRequired: ["Quote", "Case Study"],
          points: [""],
          citations: []
        },
        {
          id: "dimension2",
          title: "3. Course of Actions Options Appraisal (30% Space)",
          description: "Perform an extensive appraisal of soft/unethical options vs. resilient/optimal administrative directions.",
          placeholder: "Option A: Merits/Demerits. Option B: Merit/Demerit. Specify administrative validity...",
          valueAddsRequired: ["Case Study", "Committee"],
          points: [""],
          citations: []
        },
        {
          id: "conclusion",
          title: "4. Chosen Action & Gandhi's Talisman (20% Space)",
          description: "Provide final resolution justification citing administrative probity, constitutional oath, or spiritual ideals.",
          placeholder: "Final chosen plan with detailed logic, quoting Gandhi's Talisman, oath of office, or public welfare goals...",
          valueAddsRequired: ["Quote", "Case Study"],
          points: [""],
          citations: []
        }
      ];
    }
    if (paper === "Essay") {
      return [
        {
          id: "intro",
          title: "1. Narrative Anchor & Philosophical Hook (15% Space)",
          description: "Open with a highly engaging story, historical parable, or philosophical paradox introducing the thesis.",
          placeholder: "Write details of the visual hook / story of a historical thinker, parable or deep quote...",
          valueAddsRequired: ["Quote", "Case Study"],
          points: [""],
          citations: []
        },
        {
          id: "dimension1",
          title: "2. PESTEL Multi-Dimensional Coordinates (45% Space)",
          description: "Examine key thematic streams: Political, Economic, Societal, Technological, Environmental, and Legal coordinates.",
          placeholder: "Deconstruct theme through multi-dimensional coordinates scaling from individual soul to state/global layers...",
          valueAddsRequired: ["Statistic", "Committee"],
          points: [""],
          citations: []
        },
        {
          id: "dimension2",
          title: "3. Dialectical Counterargument Examination (20% Space)",
          description: "Synthesize limit conditions, anti-thesis arguments, or complex paradoxes to broaden core themes.",
          placeholder: "Explain the counter-thesis, exceptions to the main prompt, or philosophical contradictions...",
          valueAddsRequired: ["Quote", "Case Study"],
          points: [""],
          citations: []
        },
        {
          id: "conclusion",
          title: "4. Futuristic Harmony Climax (20% Space)",
          description: "Construct elegant, high-impact concluding resolution citing Tagore, Kalam, Preamble, or global human values.",
          placeholder: "Provide inspirational closure, linking back to original theme with humanism, moral codes, or SDG goals...",
          valueAddsRequired: ["Quote", "Statistic"],
          points: [""],
          citations: []
        }
      ];
    }
    return [];
  };

  const [sections, setSections] = useState<BlueprintSection[]>(defaultSections("GS2"));
  const [expandedDrafts, setExpandedDrafts] = useState<Record<string, boolean>>({});
  const [isAnalyzingSubject, setIsAnalyzingSubject] = useState<boolean>(false);
  const [detectedSubject, setDetectedSubject] = useState<string>("");
  const [lastAnalyzedQuestion, setLastAnalyzedQuestion] = useState<string>("");

  // Debounced auto-reformat when user types or pastes a custom/new question
  useEffect(() => {
    const activeQuestion = customQuestion.trim() || selectedQuestion;
    if (!activeQuestion) {
      setDetectedSubject("");
    }
  }, [customQuestion, selectedQuestion, currentPaper]);

  const handleAutoReformatSections = async (qText?: string, paper?: string) => {
    const activeQuestion = qText || customQuestion.trim() || selectedQuestion;
    const activePaper = paper || currentPaper;
    if (!activeQuestion) return;

    setIsAnalyzingSubject(true);

    const promptMessage = `
    You are an expert UPSC Civil Services examination Mentor specializing in framing answer sheet structures.
    We are practicing for Paper: ${activePaper}.
    For the Question below:
    "${activeQuestion}"
    
    1. First, analyze exactly which specific subject under the UPSC syllabus this question belongs to (e.g., Ancient/Medieval History, Modern History, Art & Culture, Indian Society, Geography, Constitution, Polity, Governance, Social Justice, International Relations, Macro-Economics, Agriculture, Science & Technology, Environment, Security, Disaster Management, Ethics Theory, Ethics Case Study, or Philosophical Essay).
    2. Then, re-architect and format exactly 4 answer sections/boxes customized SPECIFICALLY to that subject area's constraints, space standards, and syllabus parameters.
    
    Format exactly 4 sections:
    - Section 1 (id: "intro"): Title, description, and placeholder specifically for the introduction (approx 10-15% space allocation).
    - Section 2 (id: "dimension1"): Title, description, and placeholder for the first major analytical dimension (approx 35-45% space allocation).
    - Section 3 (id: "dimension2"): Title, description, and placeholder for the second major analytical dimension or counterarguments/challenges (approx 25-35% space allocation).
    - Section 4 (id: "conclusion"): Title, description, and placeholder for the futuristic conclusion, policy way forwards, or action directives (approx 15-20% space allocation).

    Each section has:
       * id: MUST be one of "intro", "dimension1", "dimension2", "conclusion".
       * title: A custom, beautiful title specifying exactly what to write, including the space/weight allocation % (e.g., "1. Physical Lapse Mechanism & Orographic Effects (10% Space)").
       * description: A specific 1-sentence analytical instruction explaining what details of the question to map in this section.
       * placeholder: Specific sub-concepts, key terms, or frameworks to cue the candidate (e.g., "Address altitudinal zonation patterns, tree line vegetation limits...").
       * valueAddsRequired: A JSON list of 1 to 2 recommended types from: ["Quote", "SC Judgement", "Committee", "Statistic", "Case Study"] that are perfect for that subject.

    Return your response PURELY in Raw JSON format (do not wrap in markdown \`\`\`json blocks, just the parseable JSON string) conforming EXACTLY to this schema:
    {
      "detectedSubject": "UPSC Subject Name (e.g., Geography (GS-1))",
      "sections": [
        {
          "id": "intro",
          "title": "...",
          "description": "...",
          "placeholder": "...",
          "valueAddsRequired": ["...", "..."]
        },
        ...
      ]
    }
    `;

    try {
      const res = await apiFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: promptMessage }]
        })
      });

      if (!res.ok) throw new Error("Sandbox server reformat failed");
      const data = await res.json();
      const reply = data.reply || "";

      let cleaned = reply.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(json)?/, "").replace(/```$/, "").trim();
      }

      const parsed = JSON.parse(cleaned);
      if (parsed && Array.isArray(parsed.sections) && parsed.sections.length === 4) {
        setDetectedSubject(parsed.detectedSubject || "");
        
        setSections(parsed.sections.map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          placeholder: s.placeholder,
          valueAddsRequired: s.valueAddsRequired || [],
          points: [""],
          citations: []
        })));
      }
    } catch (err) {
      console.error("AI Reformat Sections error:", err);
    } finally {
      setIsAnalyzingSubject(false);
    }
  };

  // Data Bank Integration
  const [dataBank, setDataBank] = useState<DataBankItem[]>([]);
  const [dbSearch, setDbSearch] = useState("");
  const [dbCategory, setDbCategory] = useState<string>("All");

  // UPSC Sprint Stopwatch State
  const [sprintMode, setSprintMode] = useState<"10" | "15" | "20" | null>(null);
  const [sprintTimeLeft, setSprintTimeLeft] = useState<number>(0);
  const [sprintTotalTime, setSprintTotalTime] = useState<number>(0);
  const [isSprintRunning, setIsSprintRunning] = useState<boolean>(false);
  const [isGeneratingShell, setIsGeneratingShell] = useState<boolean>(false);

  // Stopwatch countdown logic
  useEffect(() => {
    let timerInterval: any = null;
    if (isSprintRunning && sprintTimeLeft > 0) {
      timerInterval = setInterval(() => {
        setSprintTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (sprintTimeLeft === 0 && isSprintRunning) {
      setIsSprintRunning(false);
      setSprintMode(null);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isSprintRunning, sprintTimeLeft]);

  // Sprint pacing calculated states
  const currentSprintPhase = useMemo(() => {
    if (!sprintMode || !isSprintRunning) return null;
    const timeElapsed = sprintTotalTime - sprintTimeLeft;
    if (sprintMode === "10") {
      if (timeElapsed < 60) return { id: "keyword", title: "Pacing Phase 1: Decipher Keywords", desc: "Examine directive verbs, plan map links & structure.", focusSectionId: null };
      if (timeElapsed < 135) return { id: "intro", title: "Pacing Phase 2: Introduction", desc: "Write definitions/Article basis in the intro segment immediately.", focusSectionId: "intro" };
      if (timeElapsed < 345) return { id: "body", title: "Pacing Phase 3: Dimension Arguments", desc: "Speed draft main facets and contradictions now.", focusSectionId: "dimensions" };
      return { id: "conclusion", title: "Pacing Phase 4: Settle & Conclude", desc: "List suggestions inspired by standard state commissions.", focusSectionId: "conclusion" };
    } else if (sprintMode === "15") {
      if (timeElapsed < 90) return { id: "keyword", title: "Pacing Phase 1: Structure Layout", desc: "Deconstruct sub-parts, schedule points balance.", focusSectionId: null };
      if (timeElapsed < 210) return { id: "intro", title: "Pacing Phase 2: Core Introduction", desc: "Cite landmark stats/quotes to lay strong groundwork.", focusSectionId: "intro" };
      if (timeElapsed < 540) return { id: "body", title: "Pacing Phase 3: Core Dimensions", desc: "Write points supporting and contrasting stakeholders.", focusSectionId: "dimensions" };
      return { id: "conclusion", title: "Pacing Phase 4: Progressive Conclusion", desc: "Synthesize answers matching SDG/Preamble goals.", focusSectionId: "conclusion" };
    } else {
      // 20-Marker Sprint pacing (15 Minutes)
      if (timeElapsed < 120) return { id: "keyword", title: "Pacing Phase 1: Deep Schema Mapping", desc: "Deconstruct all parts of the long prompt, sketch-map connections, prioritize headings.", focusSectionId: null };
      if (timeElapsed < 300) return { id: "intro", title: "Pacing Phase 2: Structural Introduction", desc: "Draft academic concept definitions, historical contexts, or baseline index databases.", focusSectionId: "intro" };
      if (timeElapsed < 780) return { id: "body", title: "Pacing Phase 3: Comprehensive Multi-Dimension Body", desc: "Balance massive argument coordinates, write comparative metrics tables, and sketch a flowchart.", focusSectionId: "dimensions" };
      return { id: "conclusion", title: "Pacing Phase 4: Systemic Synthesis & SDG Way Forward", desc: "Propose a multi-agency Way Forward framework aligned with SDG goals or prime committee suggestions.", focusSectionId: "conclusion" };
    }
  }, [sprintMode, sprintTimeLeft, sprintTotalTime, isSprintRunning]);

  const handleStartSprint = (mode: "10" | "15" | "20") => {
    const mins = mode === "10" ? 7 : mode === "15" ? 11 : 15;
    setSprintMode(mode);
    setSprintTotalTime(mins * 60);
    setSprintTimeLeft(mins * 60);
    setIsSprintRunning(true);
    setPresetsOpen(false); // minimize noise to focus
  };

  const handleStopSprint = () => {
    setIsSprintRunning(false);
    setSprintMode(null);
    setSprintTimeLeft(0);
  };

  const handleTogglePauseSprint = () => {
    setIsSprintRunning(!isSprintRunning);
  };

  const formatTime = (secs: number) => {
    const minStr = Math.floor(secs / 60);
    const secStr = secs % 60;
    return `${minStr}:${secStr < 10 ? "0" : ""}${secStr}`;
  };

  // Safe AI Suggestion Shell Points Generator
  const handleAutoDraftShell = async () => {
    const activeQuestion = customQuestion.trim() || selectedQuestion;
    if (!activeQuestion) return;

    setIsGeneratingShell(true);
    
    const promptMessage = `
    You are an expert UPSC Civil Services examination Mentor specializing in framing answer structures.
    We are practicing for Paper: ${currentPaper}.
    For the Question below:
    "${activeQuestion}"
    
    Structure a comprehensive skeletal blueprint outline. Provide exactly 2 or 3 highly tailored, specific, conceptual bullet points for each section.
    Return your response purely in raw JSON format (do not wrap in markdown \`\`\`json blocks, just the parseable JSON string) with EXACTLY this structure:
    {
      "intro": ["Tailored Intro Point 1 with specific Article/Constitution/Definition connection", "Tailored Intro Point 2 with specific historical context"],
      "dimension1": ["Dimension 1 Point 1 (e.g., arguments of the issue)", "Dimension 1 Point 2 (e.g., central theme details)"],
      "dimension2": ["Dimension 2 Point 1 (e.g., opposing stakeholder views or bottleneck challenges)", "Dimension 2 Point 2 (e.g., judicial or administrative limitations)"],
      "conclusion": ["Conclusion Point 1 linked to specific commission recomendation if realistic", "Conclusion Point 2 offering futuristic progressive pathway"]
    }
    
    Keep the points extremely concise, under 15 words each, highly specific to the question (no generic answers!).
    `;

    try {
      const res = await apiFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: promptMessage }]
        })
      });

      if (!res.ok) throw new Error("Sandbox server draft failed");
      const data = await res.json();
      const reply = data.reply || "";

      let cleaned = reply.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(json)?/, "").replace(/```$/, "").trim();
      }

      const parsed = JSON.parse(cleaned);
      if (parsed) {
        setSections(prev => prev.map(sec => {
          const apiPoints = parsed[sec.id];
          if (Array.isArray(apiPoints) && apiPoints.length > 0) {
            const filteredPoints = apiPoints.filter(p => p && p.trim().length > 0);
            return {
              ...sec,
              points: filteredPoints.length > 0 ? filteredPoints : sec.points
            };
          }
          return sec;
        }));
      }
    } catch (err) {
      console.error("AI Shell generation error:", err);
    } finally {
      setIsGeneratingShell(false);
    }
  };

  // Topper's Brainstorming & Diagram Studio states
  const [activeStudioTab, setActiveStudioTab] = useState<'checklist' | 'brainstorm' | 'diagrams'>('checklist');
  const [brainstormData, setBrainstormData] = useState<{
    pestel?: {
      political: string;
      economic: string;
      social: string;
      technological: string;
      environmental: string;
      legal: string;
    };
    stakeholders?: { name: string; dilemma: string; interest: string; avatar?: string }[];
    vocabulary?: { word: string; definition: string }[];
  } | null>(null);
  const [isGeneratingBrainstorm, setIsGeneratingBrainstorm] = useState<boolean>(false);

  const [diagramData, setDiagramData] = useState<{
    mermaidCode?: string;
    comparisonTable?: string;
    mapPrompt?: string;
  } | null>(null);
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState<boolean>(false);
  const [diagramError, setDiagramError] = useState<string | null>(null);

  const cleanComparisonTable = useMemo(() => {
    if (!diagramData?.comparisonTable) return "";
    let text = diagramData.comparisonTable.trim();
    // Replace double escaped newlines (e.g., \\n)
    text = text.replace(/\\n/g, "\n");
    // Ensure that if it has escaped pipes, they remain, but handle standard cell formatting
    return text;
  }, [diagramData?.comparisonTable]);

  // Manual list of metrics target checklists
  const [manualChecklist, setManualChecklist] = useState({
    hook: false,
    headings: false,
    keywordDensity: false,
    actionBullets: false,
    citationsConnected: false,
    diagramPlanned: false,
    wayForwardSDG: false,
  });

  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const [injectionNotification, setInjectionNotification] = useState<string | null>(null);

  useEffect(() => {
    if (injectionNotification) {
      const timer = setTimeout(() => {
        setInjectionNotification(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [injectionNotification]);

  const handleGenerateBrainstorm = async () => {
    const activeQuestion = customQuestion.trim() || selectedQuestion;
    if (!activeQuestion) return;

    setIsGeneratingBrainstorm(true);

    try {
      const res = await apiFetch("/api/brainstorm-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paper: currentPaper,
          question: activeQuestion,
          model: model
        })
      });

      if (!res.ok) throw new Error("Brainstorm failed");
      const data = await res.json();
      let cleaned = (data.reply || "").trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(json)?/, "").replace(/```$/, "").trim();
      }
      const parsed = JSON.parse(cleaned);
      if (parsed) {
        setBrainstormData(parsed);
      }
    } catch (err) {
      console.error("AI Brainstorm error:", err);
    } finally {
      setIsGeneratingBrainstorm(false);
    }
  };

  const handleGenerateDiagrams = async () => {
    const activeQuestion = customQuestion.trim() || selectedQuestion;
    if (!activeQuestion) return;

    setIsGeneratingDiagram(true);

    try {
      setDiagramError(null);
      const res = await apiFetch("/api/diagrams-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paper: currentPaper,
          question: activeQuestion,
          model: model
        })
      });

      if (!res.ok) throw new Error("Could not connect to the IAS Visual Blueprint generation service.");
      const data = await res.json();
      let cleaned = (data.reply || "").trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(json)?/, "").replace(/```$/, "").trim();
      }
      
      let parsed: any = null;
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        // Fallback substring extractor for braces
        const startIdx = cleaned.indexOf("{");
        const endIdx = cleaned.lastIndexOf("}");
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          try {
            parsed = JSON.parse(cleaned.substring(startIdx, endIdx + 1));
          } catch (subErr) {
            console.error("Advanced substring JSON parse failed:", subErr);
          }
        }
      }

      if (parsed && (parsed.mermaidCode || parsed.comparisonTable)) {
        setDiagramData(parsed);
        setDiagramError(null);
      } else {
        throw new Error("The AI returned diagram data in an unparseable format. Please try again.");
      }
    } catch (err: any) {
      console.error("AI Diagram error:", err);
      setDiagramError(err?.message || "Failed to parse or build layout diagrams. Please try again.");
    } finally {
      setIsGeneratingDiagram(false);
    }
  };

  const handleAppendDiagramToSection = (secId: string, type: 'mermaid' | 'table') => {
    if (!diagramData) return;
    const appendText = type === 'mermaid' 
      ? `\n\n\`\`\`mermaid\n${diagramData.mermaidCode}\n\`\`\``
      : `\n\n${diagramData.comparisonTable}`;
    
    setSections(prev => prev.map(s => {
      if (s.id === secId) {
        const newPts = [...s.points];
        if (newPts.length > 0 && newPts[newPts.length - 1].trim()) {
          newPts[newPts.length - 1] = newPts[newPts.length - 1] + appendText;
        } else {
          newPts[newPts.length - 1] = appendText;
        }
        return { ...s, points: newPts };
      }
      return s;
    }));
  };

  // Intelligent Search-Free matching vault recommendations
  const recommendedCitations = useMemo(() => {
    const activeQuestion = (customQuestion.trim() || selectedQuestion).toLowerCase();
    if (!activeQuestion || dataBank.length === 0) return [];

    const words = activeQuestion
      .replace(/[^a-zA-Z\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 3 && !["with", "this", "that", "from", "their", "under", "about", "which", "discuss", "examine", "analyze", "critically", "recent", "between", "hows", "what", "where", "them"].includes(w));

    if (words.length === 0) return [];

    const scored = dataBank.map(item => {
      let score = 0;
      const topicLower = item.topic.toLowerCase();
      const contentLower = item.content.toLowerCase();
      const sourceLower = item.authorOrSource.toLowerCase();

      words.forEach(word => {
        if (topicLower.includes(word)) score += 10;
        if (contentLower.includes(word)) score += 3;
        if (sourceLower.includes(word)) score += 2;
        if (item.paper && currentPaper && item.paper.toLowerCase() === currentPaper.toLowerCase()) {
          score += 1;
        }
      });
      return { item, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.item)
      .slice(0, 3);
  }, [dataBank, customQuestion, selectedQuestion, currentPaper]);

  useEffect(() => {
    const loadBank = () => {
      const bank = localStorage.getItem("upsc_data_bank");
      if (bank) {
        try {
          setDataBank(JSON.parse(bank));
        } catch (err) {}
      } else {
        setDataBank([]);
      }
    };
    loadBank();
    window.addEventListener("upsc_databank_updated", loadBank);
    return () => window.removeEventListener("upsc_databank_updated", loadBank);
  }, []);

  const [activeTab, setActiveTab] = useState<"workspace" | "saved">("workspace");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | undefined>(undefined);
  const [score, setScore] = useState<number | undefined>(undefined);
  
  // Collapsed state for presets
  const [presetsOpen, setPresetsOpen] = useState(true);

  // Filtered DB items
  const filteredDbItems = useMemo(() => {
    return dataBank.filter(item => {
      const matchSearch = 
        item.content.toLowerCase().includes(dbSearch.toLowerCase()) ||
        item.topic.toLowerCase().includes(dbSearch.toLowerCase()) ||
        item.authorOrSource.toLowerCase().includes(dbSearch.toLowerCase());
      const matchCategory = dbCategory === "All" || item.category === dbCategory;
      return matchSearch && matchCategory;
    });
  }, [dataBank, dbSearch, dbCategory]);

  // Persist saved local blue prints
  useEffect(() => {
    localStorage.setItem("upsc_saved_blueprints", JSON.stringify(savedBlueprints));
  }, [savedBlueprints]);

  const handleApplyPreset = (q: typeof PRESET_QUESTIONS[0]) => {
    setSelectedQuestion(q.question);
    setCurrentPaper(q.paper);
    setCustomQuestion("");
    setSections(defaultSections(q.paper));
    setAiFeedback(undefined);
    setScore(undefined);
    setActiveBlueprintId(null);
    setDetectedSubject("");
    setLastAnalyzedQuestion(q.question);
    handleAutoReformatSections(q.question, q.paper);
  };

  const handleAddPoint = (secId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id === secId) {
        return { ...s, points: [...s.points, ""] };
      }
      return s;
    }));
  };

  const handleUpdatePoint = (secId: string, idx: number, val: string) => {
    setSections(prev => prev.map(s => {
      if (s.id === secId) {
        const newPts = [...s.points];
        newPts[idx] = val;
        return { ...s, points: newPts };
      }
      return s;
    }));
  };

  const handleRemovePoint = (secId: string, idx: number) => {
    setSections(prev => prev.map(s => {
      if (s.id === secId) {
        const newPts = s.points.filter((_, i) => i !== idx);
        return { ...s, points: newPts.length === 0 ? [""] : newPts };
      }
      return s;
    }));
  };

  const handleUpdateDraft = (secId: string, val: string) => {
    setSections(prev => prev.map(s => {
      if (s.id === secId) {
        return { ...s, paragraphDraft: val };
      }
      return s;
    }));
  };

  // Drag-and-click citing
  const handleCiteItem = (secId: string, item: DataBankItem) => {
    setSections(prev => prev.map(s => {
      if (s.id === secId) {
        // Prevent duplicates
        if (s.citations.some(c => c.id === item.id)) return s;
        return { ...s, citations: [...s.citations, item] };
      }
      return s;
    }));
  };

  const handleUnciteItem = (secId: string, itemId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id === secId) {
        return { ...s, citations: s.citations.filter(c => c.id !== itemId) };
      }
      return s;
    }));
  };

  const handleSaveBlueprint = () => {
    const activeQuestion = customQuestion.trim() || selectedQuestion;
    if (!activeQuestion) return;

    if (activeBlueprintId) {
      // Update
      setSavedBlueprints(prev => prev.map(sb => {
        if (sb.id === activeBlueprintId) {
          return {
            ...sb,
            question: activeQuestion,
            paper: currentPaper,
            sections,
            aiFeedback,
            score
          };
        }
        return sb;
      }));
    } else {
      // Create New
      const newId = `blueprint_${Date.now()}`;
      const newBp: SavedBlueprint = {
        id: newId,
        question: activeQuestion,
        paper: currentPaper,
        sections,
        date: new Date().toISOString(),
        aiFeedback,
        score
      };
      setSavedBlueprints(prev => [newBp, ...prev]);
      setActiveBlueprintId(newId);
    }
    
    // Quick notification fallback / reload check
    const event = new CustomEvent("app:sync-request");
    window.dispatchEvent(event);
  };

  const handleLoadBlueprint = (sb: SavedBlueprint) => {
    setActiveBlueprintId(sb.id);
    setSelectedQuestion("");
    setCustomQuestion(sb.question);
    setCurrentPaper(sb.paper);
    setSections(sb.sections);
    setAiFeedback(sb.aiFeedback);
    setScore(sb.score);
    setLastAnalyzedQuestion(sb.question);
    setActiveTab("workspace");
  };

  const handleDeleteBlueprint = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedBlueprints(prev => prev.filter(sb => sb.id !== id));
    if (activeBlueprintId === id) {
      handleResetWorkspace();
    }
  };

  const handleResetWorkspace = () => {
    setSelectedQuestion("");
    setCurrentPaper("GS2");
    setCustomQuestion("");
    setSections(defaultSections("GS2"));
    setAiFeedback(undefined);
    setScore(undefined);
    setActiveBlueprintId(null);
    setDetectedSubject("");
    setLastAnalyzedQuestion("");
  };

  // AI assessment of answer blueprint structural completeness
  const handleEvaluateBlueprint = async () => {
    const activeQuestion = customQuestion.trim() || selectedQuestion;
    if (!activeQuestion) return;

    setIsEvaluating(true);
    setAiFeedback("");
    setScore(undefined);    // Build structure payload
    const structuredStr = sections.map(s => {
      const pointsList = s.points.filter(p => p.trim()).map(p => `- ${p}`).join("\n");
      const citesList = s.citations.map(c => `[CITE: ${c.category}] ${c.authorOrSource}: ${c.content}`).join("\n");
      return `### ${s.title}\nDescription: ${s.description}\nPoints:\n${pointsList || "None provided"}\nFull Sentence Paragraph Draft:\n${s.paragraphDraft || "No full sentence paragraph draft written yet"}\nSaved Data Citations Referenced:\n${citesList || "No specific case/statistic cited"}`;
    }).join("\n\n");

    const currentMarks = sprintMode || "15";

    const promptMessage = `
    You are an expert UPSC Civil Services examination Mains examiner and Mentor. 
    Review the following "Mains Answer Blueprint Structure Outline & Full Sentence Draft" drafted by an aspirant.
    
    CRITERIA FOR OUTLINE & DRAFT GRADING:
    1. **Structural Balance**: Promptly examines key keywords of the prompt; includes deep coverage for intro, pros, cons, and progressive conclusions. Under UPSC standards, a ${currentMarks}-Mark question expects roughly ${currentMarks === "10" ? "150 words" : currentMarks === "15" ? "250 words" : "350 words"} of dense structured analysis.
    2. **Value Additions**: Evaluates if appropriate Supreme Court cases, landmark judgements, committees, data metrics, or quotes were cited correctly.
    3. **Logical flow**: Cohesion, PESTEL or multi-dimensional thinking where applicable.
    4. **Paragraph Writing Tone**: Assess if they used professional, administrative vocabulary (e.g. "Constitutional Morality", "Ameliorate", "Inter-alia") and write with maximum brevity and density.
    
    QUESTION PROMPT: "${activeQuestion}"
    GS PAPER TYPE: ${currentPaper}
    EXPECTED QUESTION WEIGHT: ${currentMarks} Marks
    
    ASPIRANT'S DRAFT OUTLINE STRUCTURE & PARAGRAPHS:
    ${structuredStr}
    
    Return your evaluation strictly in markdown. Include these explicit sections:
    1. **Overall Grade Score**: Out of 10. Give an honest, realistic UPSC-standards grade (e.g., 4.5/10 is average, 6.5/10 is outstanding).
    2. **Core Strength of the Blueprint & Paragraphs** (1-2 points)
    3. **Paragraph Draft Critiques**: Provide feedback on the drafted paragraphs, calling out word economy, flow, administrative tone, and precise integration of cited cases.
    4. **Crucial Gaps Identified**: (List specific dimensions, committee recommendations, or SC files missed that are critical for an IAS-topper level answer)
    5. **Refined Frame Suggestion**: Suggest exact top headings (using visual tags) they should write in the actual exam sheet for maximum visual layout points.
    6. **Suggested Additional Value Addition**: Recommend 1 real committee, case law, or statistic they should add to elevate their GS or Law Optional score.
    `;

    try {
      const res = await apiFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: promptMessage }]
        })
      });

      if (!res.ok) throw new Error("A1 server failed to compile advice");
      const data = await res.json();
      const reply = data.reply || "";

      // Extract raw score if possible
      const scoreRegex = /(\d+(\.\d+)?)\s*\/\s*10/;
      const match = reply.match(scoreRegex);
      let parsedScore = 5.5;
      if (match) {
        parsedScore = parseFloat(match[1]);
      }
      
      setScore(parsedScore);
      setAiFeedback(reply);

      // Auto update stored copy if it's already saved
      if (activeBlueprintId) {
        setSavedBlueprints(prev => prev.map(sb => {
          if (sb.id === activeBlueprintId) {
            return { ...sb, aiFeedback: reply, score: parsedScore };
          }
          return sb;
        }));
      }
    } catch (err) {} finally {
      setIsEvaluating(false);
    }
  };

  // Dynamic status evaluation checks
  const currentFulfillment = useMemo(() => {
    let hasSC = false;
    let hasComm = false;
    let hasStat = false;
    let pointsCount = 0;

    sections.forEach(s => {
      s.citations.forEach(c => {
        if (c.category === "SC Judgement") hasSC = true;
        if (c.category === "Committee") hasComm = true;
        if (c.category === "Statistic") hasStat = true;
      });
      s.points.forEach(p => {
        if (p.trim().length > 3) pointsCount++;
      });
    });

    return { hasSC, hasComm, hasStat, pointsCount };
  }, [sections]);

  const activeQuestionText = customQuestion.trim() || selectedQuestion;

  return (
    <div className="flex flex-col h-full bg-app text-main max-w-7xl mx-auto w-full p-4 lg:p-8 animate-fadeIn" id="blueprint-nexus-root">
      
      {/* Upper Navigation/Tabs bar */}
      <div className="flex items-center justify-between border-b border-panel-border/30 pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 border border-accent/25 rounded-xl text-accent">
            <LayoutTemplate className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-black tracking-tight uppercase">Mains Answer Sandbox</h1>
            <p className="text-[11px] text-muted font-bold tracking-wider">Brainstorm structures, cite VAM data & evaluate logically under 7 min</p>
          </div>
        </div>

        <div className="flex gap-1.5 p-1 bg-panel-border/10 border border-panel-border/30 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("workspace")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              activeTab === "workspace" ? "bg-accent text-white shadow-sm" : "text-muted hover:text-main"
            }`}
          >
            Blueprinting Terminal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "saved" ? "bg-accent text-black shadow-sm" : "text-muted hover:text-main"
            }`}
          >
            Saved Layouts
            {savedBlueprints.length > 0 && (
              <span className="bg-panel-border/30 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-black">
                {savedBlueprints.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "saved" ? (
        <div className="flex-1 overflow-y-auto">
          {savedBlueprints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-3xl border p-8 max-w-lg mx-auto">
              <BookmarkCheck className="w-12 h-12 text-muted mb-4 stroke-[1.5]" />
              <h3 className="font-bold text-main text-base uppercase">No Saved Blueprints</h3>
              <p className="text-[11px] text-muted mt-2 max-w-sm leading-relaxed">
                Unlock high marks in UPSC Mains by formulating robust paragraph structures, citing landmark cases from data vault, and evaluating draft maps.
              </p>
              <button
                onClick={() => setActiveTab("workspace")}
                className="mt-6 bg-accent text-black text-[11px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl hover:opacity-90"
              >
                Start Brainstorming
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedBlueprints.map((sb) => (
                <div
                  key={sb.id}
                  onClick={() => handleLoadBlueprint(sb)}
                  className="glass-panel p-5 rounded-2xl relative border border-panel-border/45 hover:border-accent/40 cursor-pointer transition-all hover:translate-y-[-2px] flex flex-col justify-between group h-64 text-left"
                >
                  <button
                    onClick={(e) => handleDeleteBlueprint(sb.id, e)}
                    className="absolute top-4 right-4 p-1 rounded-lg text-muted hover:text-red-500 hover:bg-panel-border/30 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete backup outline"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9.5px] px-2 py-0.5 rounded-md font-black tracking-widest bg-accent/15 text-accent border border-accent/20`}>
                        {sb.paper}
                      </span>
                      <span className="text-[10px] text-muted">
                        {new Date(sb.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <h3 className="font-bold text-main text-[14px] leading-snug line-clamp-3 group-hover:text-accent transition-colors">
                      {sb.question}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-panel-border/35 flex items-center justify-between">
                    <span className="text-[11px] text-muted flex items-center gap-1 font-medium">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-light" />
                      {sb.sections.reduce((count, s) => count + s.citations.length, 0)} value citations
                    </span>
                    {sb.score ? (
                      <span className="flex items-center gap-1.5 text-[11px] text-accent font-black bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-lg">
                        <Award className="w-3.5 h-3.5" />
                        {sb.score}/10
                      </span>
                    ) : (
                      <span className="text-[10.5px] font-bold text-muted hover:underline uppercase tracking-wide group-hover:text-accent">
                        Draft Outline
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
          
          {/* Main workspace section */}
          <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-0 lg:pr-2 custom-scrollbar">
            
            {/* Choose Questions Section */}
            <div className="glass-panel p-5 rounded-3xl border border-panel-border/30 text-left shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-accent" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-light">Select UPSC Mains Prompt Sandbox</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPresetsOpen(!presetsOpen)}
                  className="text-muted p-1 rounded hover:bg-panel-border/20 transition-colors"
                >
                  {presetsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {presetsOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3.5 mb-5">
                  {PRESET_QUESTIONS.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleApplyPreset(q)}
                      className={`text-left p-3.5 rounded-2xl border transition-all text-[11px] flex flex-col justify-between gap-3 h-32 cursor-pointer ${
                        selectedQuestion === q.question
                          ? "bg-accent/10 border-accent/50 text-main shadow-md ring-1 ring-accent/30"
                          : "bg-panel-border/10 border-panel-border/25 text-muted hover:text-main hover:bg-panel-border/20"
                      }`}
                    >
                      <span className="font-extrabold uppercase text-[9.5px] tracking-wider text-accent opacity-85 block bg-accent/5 border border-accent/10 px-2 py-0.5 rounded-md self-start">
                        {q.paper}
                      </span>
                      <p className="line-clamp-3 leading-snug font-bold mt-1 text-main">{q.question}</p>
                    </button>
                  ))}
                </div>
              )}

              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-2 block">Or Enter Your Custom Mains / Optional Board Question</label>
                <textarea
                  value={customQuestion}
                  onChange={(e) => {
                    setCustomQuestion(e.target.value);
                    setSelectedQuestion("");
                  }}
                  placeholder="Paste any UPSC question topic here (e.g., Examine the major reasons for Judicial Activism in India and its impact on the Separation of Powers...)"
                  className="w-full bg-input border border-panel-border/30 rounded-2xl pl-4 pr-16 py-3.5 text-[13px] text-main placeholder-muted/80 focus:outline-none focus:border-accent min-h-[75px] resize-none leading-relaxed transition-colors"
                />
                
                <div className="absolute right-3.5 bottom-3.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAutoReformatSections()}
                    disabled={isAnalyzingSubject || !(customQuestion.trim() || selectedQuestion)}
                    className="bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent text-[9.5px] font-extrabold tracking-wider uppercase rounded-lg px-2.5 py-1.5 focus:outline-none transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-55"
                    title="Let AI classify subject & re-architect answer boxes dynamically for this question's exact syllabus demands"
                  >
                    {isAnalyzingSubject ? (
                      <Loader2 className="w-3 h-3 animate-spin text-accent" />
                    ) : (
                      <Sparkles className="w-3 h-3 animate-pulse text-accent" />
                    )}
                    <span>{isAnalyzingSubject ? "Refitting..." : "AI Refit Boxes"}</span>
                  </button>

                  <select
                    value={currentPaper}
                    onChange={(e: any) => {
                      const newPaper = e.target.value as "GS1" | "GS2" | "GS3" | "GS4" | "Essay";
                      setCurrentPaper(newPaper);
                      
                      const activeQ = customQuestion.trim() || selectedQuestion;
                      if (activeQ) {
                        setDetectedSubject("");
                        setLastAnalyzedQuestion(activeQ);
                        handleAutoReformatSections(activeQ, newPaper);
                      } else {
                        if (!activeBlueprintId) {
                          setSections(defaultSections(newPaper));
                          setDetectedSubject("");
                        }
                      }
                    }}
                    className="bg-app border border-panel-border text-[9.5px] font-extrabold tracking-wider uppercase rounded-lg px-2.5 py-1.5 focus:outline-none text-main cursor-pointer"
                  >
                    <option value="GS1">GS 1</option>
                    <option value="GS2">GS 2</option>
                    <option value="GS3">GS 3</option>
                    <option value="GS4">GS 4</option>
                    <option value="Essay">Essay</option>
                  </select>
                </div>
              </div>
            </div>

            {activeQuestionText ? (
              <div className="flex flex-col gap-5 text-left">
                
                {/* Dynamically Update Adaptive Syllabus-Level Header and Instruction Set Banner */}
                {(() => {
                  const sGuideline = getDynamicSyllabusGuidelines(detectedSubject, activeQuestionText);
                  return (
                    <div className={`glass-panel p-5 rounded-3xl border bg-gradient-to-br ${sGuideline.colorClass} text-left animate-fadeIn shadow-sm`}>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-2xl bg-app/60 border border-panel-border/25 flex items-center justify-center shadow-inner mt-0.5 shrink-0">
                            {renderSubjectIcon(sGuideline.iconName)}
                          </div>
                          <div>
                            <span className={`inline-block text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider mb-1.5 border ${sGuideline.badgeColorClass}`}>
                              {sGuideline.subject} Directive
                            </span>
                            <h3 className="text-[15px] font-black tracking-tight text-light leading-snug">
                              {sGuideline.banner}
                            </h3>
                            <p className="text-[11.5px] text-muted leading-relaxed mt-1 max-w-4xl">
                              {sGuideline.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Instruction Set Guide Columns */}
                      <div className="mt-4 pt-4 border-t border-panel-border/20">
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <Compass className="w-3.5 h-3.5 text-accent animate-spin" style={{ animationDuration: "12s" }} />
                          <span className="text-[10px] font-black uppercase tracking-wider text-muted font-mono">Subject-Specific Syllabus Framing Directives:</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {sGuideline.guidelines.map((guideText, gIdx) => (
                            <div 
                              key={gIdx} 
                              className="flex gap-2 p-2.5 rounded-xl bg-app/30 border border-panel-border/10 items-start hover:border-panel-border/30 transition-all group"
                            >
                              <div className="w-4 h-4 rounded-full bg-accent/15 text-accent border border-accent/20 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5 group-hover:scale-105 transition-transform font-mono">
                                {gIdx + 1}
                              </div>
                              <span className="text-[11px] text-muted leading-relaxed font-sans">{guideText}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* UPSC PRACTICE DASHBOARD NEXUS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Interactive Sprint Stopwatch */}
                  <div className="glass-panel p-5 rounded-3xl border border-panel-border/30 bg-gradient-to-br from-panel-border/5 via-transparent to-transparent">
                    <div className="flex items-center gap-2 mb-3">
                      <Timer className="w-4 h-4 text-accent animate-pulse" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-light">UPSC Real-Time Sprint Stopwatch</span>
                    </div>

                    {!sprintMode ? (
                      <div className="flex flex-col gap-3">
                        <p className="text-[11px] text-muted leading-relaxed">
                          UPSC Mains gives you exactly 7 minutes (10-Marker), 11 minutes (15-Marker), or 15 minutes (20-Marker) per question. Test your brainstorm pacing!
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartSprint("10")}
                            className="bg-panel-border/20 hover:bg-accent/15 border border-panel-border/25 hover:border-accent/40 text-main hover:text-accent p-2 py-2.5 rounded-2xl text-[10.5px] font-black uppercase tracking-wider text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1"
                          >
                            <span>10-Marker</span>
                            <span className="text-[8.5px] text-muted font-normal uppercase">7 Mins Strict</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartSprint("15")}
                            className="bg-panel-border/20 hover:bg-accent/15 border border-panel-border/25 hover:border-accent/40 text-main hover:text-accent p-2 py-2.5 rounded-2xl text-[10.5px] font-black uppercase tracking-wider text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1"
                          >
                            <span>15-Marker</span>
                            <span className="text-[8.5px] text-muted font-normal uppercase">11 Mins Strict</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartSprint("20")}
                            className="bg-panel-border/20 hover:bg-accent/15 border border-panel-border/25 hover:border-accent/40 text-main hover:text-accent p-2 py-2.5 rounded-2xl text-[10.5px] font-black uppercase tracking-wider text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1"
                          >
                            <span>20-Marker</span>
                            <span className="text-[8.5px] text-muted font-normal uppercase">15 Mins Strict</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between border-b border-panel-border/15 pb-2.5 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-accent tracking-tighter tabular-nums animate-pulse">
                              {formatTime(sprintTimeLeft)}
                            </span>
                            <span className="text-[9px] px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent font-black uppercase tracking-widest">
                              {sprintMode}-Marker Active
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={handleTogglePauseSprint}
                              className="p-1 px-2.5 bg-panel-border/15 hover:bg-panel-border/30 rounded-xl text-[10px] font-bold text-main cursor-pointer"
                              title={isSprintRunning ? "Pause timer" : "Resume timer"}
                            >
                              {isSprintRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-accent" />}
                            </button>
                            <button
                              type="button"
                              onClick={handleStopSprint}
                              className="p-1 px-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-[10px] font-bold text-red-400 cursor-pointer flex items-center gap-1"
                              title="Stop sprint"
                            >
                              <Square className="w-3 h-3" />
                              <span>Stop</span>
                            </button>
                          </div>
                        </div>

                        {currentSprintPhase && (
                          <div className="bg-app/40 rounded-2xl p-3 border border-panel-border/30">
                            <p className="text-[10px] font-black uppercase tracking-wider text-accent">
                              {currentSprintPhase.title}
                            </p>
                            <p className="text-[11.5px] text-main font-semibold leading-relaxed mt-0.5">
                              {currentSprintPhase.desc}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Instant Draft Starter */}
                  <div className="glass-panel p-5 rounded-3xl border border-panel-border/30 bg-gradient-to-br from-panel-border/5 via-transparent to-transparent flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-400" />
                          <span className="text-[11px] font-black uppercase tracking-wider text-light">AI Outline Shell Core Starter</span>
                        </div>
                        <span className="text-[9px] bg-panel-border/30 px-1.5 py-0.5 rounded-full font-black text-muted uppercase">
                          Saves writing block
                        </span>
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed">
                        Stuck or need a rapid high-caliber foundation? Click below to instantly load a custom, targeted conceptual structural shell.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoDraftShell}
                      disabled={isGeneratingShell}
                      className="w-full mt-3 bg-panel border border-panel-border/40 hover:border-accent/40 hover:bg-accent/5 p-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 text-light disabled:opacity-55"
                    >
                      {isGeneratingShell ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                          Structuring Answer Shell...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-accent" />
                          Spark AI Answer Skeleton
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Vault Recommendation Smart matches list (Only visible when matches are detected!) */}
                {recommendedCitations.length > 0 && (
                  <div className="glass-panel p-4 rounded-3xl border border-accent/20 bg-accent/[0.02]">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-accent">Smart Recommended Vault Citations Match</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {recommendedCitations.map((item) => (
                        <div key={item.id} className="bg-app/50 p-3 rounded-2xl border border-panel-border/30 text-[11px] flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[8.5px] font-black bg-accent/15 border border-accent/20 text-accent px-1.5 py-0.2 rounded uppercase tracking-wider shrink-0">
                                {item.category}
                              </span>
                              <span className="font-extrabold text-[10px] text-main truncate max-w-[100px]">{item.authorOrSource}</span>
                            </div>
                            <p className="text-muted leading-normal line-clamp-2 mt-1 italic">
                              "{item.content}"
                            </p>
                          </div>
                          <div className="mt-2 pt-2 border-t border-panel-border/20 grid grid-cols-2 gap-1">
                            {sections.map((s) => {
                              const isAttached = s.citations.some(c => c.id === item.id);
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => isAttached ? handleUnciteItem(s.id, item.id) : handleCiteItem(s.id, item)}
                                  className={`text-[9px] py-0.5 rounded text-center truncate font-bold border transition-colors cursor-pointer ${
                                    isAttached
                                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-extrabold"
                                      : "bg-panel-border/10 border-panel-border/25 text-muted hover:text-main"
                                  }`}
                                >
                                  {isAttached ? "Linked" : s.id === "intro" ? "+ Intro" : s.id === "conclusion" ? "+ Concl" : s.id === "dimension1" ? "+ Dim 1" : "+ Dim 2"}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TOPPER'S BRAINSTORMING & DIAGRAM STUDIO */}
                <div className="glass-panel p-6 rounded-3xl border border-accent/20 bg-gradient-to-br from-panel-border/5 via-transparent to-transparent text-left relative" id="toppers-brainstorming-diagram-studio">
                  {injectionNotification && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black text-[11px] font-black px-4 py-2.5 rounded-xl shadow-md border border-emerald-400/30 flex items-center gap-1.5 animate-bounce">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{injectionNotification}</span>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-panel-border/20 pb-4 mb-4 gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-accent/15 border border-accent/20 rounded-xl text-accent">
                        <Network className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-main text-sm uppercase tracking-wide">Topper's Interactive Brainstorming & Diagram Studio</h3>
                        <p className="text-[10px] text-muted">Deconstruct prompts with PESTEL parameters, stakeholder models, and Mermaid layouts</p>
                      </div>
                    </div>

                    <div className="flex p-0.5 bg-panel-border/10 border border-panel-border/30 rounded-xl max-w-full overflow-x-auto select-none" style={{ scrollbarWidth: "none" }}>
                      <button
                        type="button"
                        onClick={() => setActiveStudioTab('checklist')}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap min-w-[100px] justify-center ${
                          activeStudioTab === 'checklist' ? 'bg-accent text-black shadow-sm' : 'text-muted hover:text-main'
                        }`}
                      >
                        <ListTodo className="w-3.5 h-3.5" />
                        Audit Checklist
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveStudioTab('brainstorm')}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap min-w-[100px] justify-center ${
                          activeStudioTab === 'brainstorm' ? 'bg-accent text-black shadow-sm' : 'text-muted hover:text-main'
                        }`}
                      >
                        <Compass className="w-3.5 h-3.5" />
                        Brainstorm Forge
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveStudioTab('diagrams')}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap min-w-[100px] justify-center ${
                          activeStudioTab === 'diagrams' ? 'bg-accent text-black shadow-sm' : 'text-muted hover:text-main'
                        }`}
                      >
                        <Table2 className="w-3.5 h-3.5" />
                        Diagrams & Matrix
                      </button>
                    </div>
                  </div>

                  {/* TAB CONTENT: 1. CHECKLIST AUDIT */}
                  {activeStudioTab === 'checklist' && (
                    <div className="space-y-4 animate-fadeIn">
                      {/* Live score indicator */}
                      <div className="bg-panel-border/5 border border-panel-border/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-bold text-main uppercase tracking-wide text-left">UPSC Answer Sheet Grid Metric Score</p>
                          <p className="text-[10px] text-muted text-left">A dynamic gauge matching standard IAS Toppers score sheets</p>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto max-w-xs">
                          {/* Score bar */}
                          {(() => {
                            let scoreCalc = 10; // Baseline
                            if (currentFulfillment.pointsCount >= 4) scoreCalc += 15;
                            if (currentFulfillment.pointsCount >= 8) scoreCalc += 15;
                            if (currentFulfillment.hasSC) scoreCalc += 15;
                            if (currentFulfillment.hasComm) scoreCalc += 15;
                            if (currentFulfillment.hasStat) scoreCalc += 10;
                            // manual checklist
                            Object.values(manualChecklist).forEach(val => {
                              if (val) scoreCalc += 5;
                            });
                            if (scoreCalc > 100) scoreCalc = 100;

                            const label = scoreCalc < 40 ? "Bare Draft" : scoreCalc < 75 ? "Mains Standard" : "Topper Caliber! 🔥";
                            const color = scoreCalc < 40 ? "bg-red-500" : scoreCalc < 75 ? "bg-amber-400" : "bg-emerald-500";
                            const textColor = scoreCalc < 40 ? "text-red-400" : scoreCalc < 75 ? "text-amber-400" : "text-emerald-400";

                            return (
                              <div className="flex-1 text-right">
                                <div className="flex justify-between items-center text-[11px] mb-1 font-bold">
                                  <span className={textColor}>{label}</span>
                                  <span className="text-main">{scoreCalc}% Compliance</span>
                                </div>
                                <div className="w-full h-2 bg-panel-border/25 rounded-full overflow-hidden">
                                  <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${scoreCalc}%` }} />
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Explicit Interactive Checklist Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <label className="flex items-start gap-2.5 p-3 rounded-2xl border border-panel-border/20 hover:border-panel-border/40 bg-app/20 cursor-pointer select-none transition-colors">
                          <input
                            type="checkbox"
                            checked={manualChecklist.hook}
                            onChange={(e) => setManualChecklist(prev => ({ ...prev, hook: e.target.checked }))}
                            className="mt-0.5 accent-accent"
                          />
                          <div className="text-left">
                            <p className="text-[11.5px] font-bold text-main leading-tight">Technical Intro Hook</p>
                            <p className="text-[9.5px] text-muted">Began with a core definition, index reference, or Article instead of generic narrative filler.</p>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 p-3 rounded-2xl border border-panel-border/20 hover:border-panel-border/40 bg-app/20 cursor-pointer select-none transition-colors">
                          <input
                            type="checkbox"
                            checked={manualChecklist.headings}
                            onChange={(e) => setManualChecklist(prev => ({ ...prev, headings: e.target.checked }))}
                            className="mt-0.5 accent-accent"
                          />
                          <div className="text-left">
                            <p className="text-[11.5px] font-bold text-main leading-tight">Symmetric Sub-Headings</p>
                            <p className="text-[9.5px] text-muted">Created headings directly mirroring the explicit questions of the prompt.</p>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 p-3 rounded-2xl border border-panel-border/20 hover:border-panel-border/40 bg-app/20 cursor-pointer select-none transition-colors">
                          <input
                            type="checkbox"
                            checked={manualChecklist.keywordDensity}
                            onChange={(e) => setManualChecklist(prev => ({ ...prev, keywordDensity: e.target.checked }))}
                            className="mt-0.5 accent-accent"
                          />
                          <div className="text-left">
                            <p className="text-[11.5px] font-bold text-main leading-tight font-sans font-extrabold">High Keyword Density</p>
                            <p className="text-[9.5px] text-muted font-sans">Leveraged critical syllabus phrases (e.g., administrative silos, asymmetric federalism).</p>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 p-3 rounded-2xl border border-panel-border/20 hover:border-panel-border/40 bg-app/20 cursor-pointer select-none transition-colors">
                          <input
                            type="checkbox"
                            checked={manualChecklist.actionBullets}
                            onChange={(e) => setManualChecklist(prev => ({ ...prev, actionBullets: e.target.checked }))}
                            className="mt-0.5 accent-accent"
                          />
                          <div className="text-left">
                            <p className="text-[11.5px] font-bold text-main leading-tight">Action-Oriented Points</p>
                            <p className="text-[9.5px] text-muted font-sans">Formulated sub-points as discrete, fact-based causes and consequences instead of loose words.</p>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 p-3 rounded-2xl border border-panel-border/20 hover:border-panel-border/40 bg-app/20 cursor-pointer select-none transition-colors">
                          <input
                            type="checkbox"
                            checked={manualChecklist.citationsConnected}
                            onChange={(e) => setManualChecklist(prev => ({ ...prev, citationsConnected: e.target.checked }))}
                            className="mt-0.5 accent-accent"
                          />
                          <div className="text-left">
                            <p className="text-[11.5px] font-bold text-main leading-tight font-sans">Linked Court/Report VAMs</p>
                            <p className="text-[9.5px] text-muted font-sans">Anchored each core argument using court ratios, committee files, or verified statistics.</p>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 p-3 rounded-2xl border border-panel-border/20 hover:border-panel-border/40 bg-app/20 cursor-pointer select-none transition-colors">
                          <input
                            type="checkbox"
                            checked={manualChecklist.wayForwardSDG}
                            onChange={(e) => setManualChecklist(prev => ({ ...prev, wayForwardSDG: e.target.checked }))}
                            className="mt-0.5 accent-accent"
                          />
                          <div className="text-left">
                            <p className="text-[11.5px] font-bold text-main leading-tight font-sans">Forward-Looking SDG Target</p>
                            <p className="text-[9.5px] text-muted font-sans">Dedicated a closing path forward grounded in United Nations SDG goals or high-level committees.</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: 2. BRAINSTORM FORGE */}
                  {activeStudioTab === 'brainstorm' && (
                    <div className="space-y-4 animate-fadeIn text-left">
                      {!brainstormData ? (
                        <div className="bg-panel-border/5 p-6 rounded-2xl border border-panel-border/20 text-center flex flex-col items-center justify-center py-8">
                          <Compass className="w-8 h-8 text-muted mb-3" />
                          <h4 className="font-extrabold text-[11px] text-main uppercase">Ignite the Brainstorming Engine</h4>
                          <p className="text-[11px] text-muted mt-1 leading-relaxed max-w-md">
                            Struggling to map multi-dimensional coordinates? Atlases AI will parse this prompt and map dynamic PESTEL directions, key stakeholder trade-offs, and critical keyword banks.
                          </p>
                          <button
                            type="button"
                            onClick={handleGenerateBrainstorm}
                            disabled={isGeneratingBrainstorm}
                            className="mt-4 bg-accent text-black text-[10.5px] font-black uppercase px-4 py-2 rounded-xl transition-all hover:opacity-90 flex items-center gap-1 cursor-pointer disabled:opacity-55"
                          >
                            {isGeneratingBrainstorm ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Forging Vectors...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                Ignite Brainstorm Forge
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-accent tracking-wider font-mono">PESTEL Analytical Dimensions</span>
                            <button
                              type="button"
                              onClick={handleGenerateBrainstorm}
                              disabled={isGeneratingBrainstorm}
                              className="text-[9.5px] text-muted hover:text-accent font-bold uppercase tracking-wider flex items-center gap-1 disabled:opacity-55"
                            >
                              <Sparkles className="w-3 h-3 text-accent" />
                              {isGeneratingBrainstorm ? "Regenerating..." : "Regenerate Info"}
                            </button>
                          </div>

                          {/* PESTEL GRID */}
                          {brainstormData.pestel && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                              <div className="bg-app/40 p-3 rounded-xl border border-panel-border/20 text-left">
                                <span className="text-[9px] font-black uppercase text-red-500">Political</span>
                                <p className="text-[11px] text-muted leading-relaxed mt-1 font-sans">{brainstormData.pestel.political}</p>
                              </div>
                              <div className="bg-app/40 p-3 rounded-xl border border-panel-border/20 text-left">
                                <span className="text-[9px] font-black uppercase text-emerald-400">Economic</span>
                                <p className="text-[11px] text-muted leading-relaxed mt-1 font-sans">{brainstormData.pestel.economic}</p>
                              </div>
                              <div className="bg-app/40 p-3 rounded-xl border border-panel-border/20 text-left">
                                <span className="text-[9px] font-black uppercase text-amber-500 font-sans">Social</span>
                                <p className="text-[11px] text-muted leading-relaxed mt-1 font-sans">{brainstormData.pestel.social}</p>
                              </div>
                              <div className="bg-app/40 p-3 rounded-xl border border-panel-border/20 text-left">
                                <span className="text-[9px] font-black uppercase text-blue-400">Technological</span>
                                <p className="text-[11px] text-muted leading-relaxed mt-1 font-sans">{brainstormData.pestel.technological}</p>
                              </div>
                              <div className="bg-app/40 p-3 rounded-xl border border-panel-border/20 text-left">
                                <span className="text-[9px] font-black uppercase text-cyan-400">Environmental</span>
                                <p className="text-[11px] text-muted leading-relaxed mt-1 font-sans">{brainstormData.pestel.environmental}</p>
                              </div>
                              <div className="bg-app/40 p-3 rounded-xl border border-panel-border/20 text-left">
                                <span className="text-[9px] font-black uppercase text-violet-400 font-sans">Legal & Const</span>
                                <p className="text-[11px] text-muted leading-relaxed mt-1 font-sans">{brainstormData.pestel.legal}</p>
                              </div>
                            </div>
                          )}

                          {/* STAKEHOLDERS TRADE-OFFS */}
                          {brainstormData.stakeholders && brainstormData.stakeholders.length > 0 && (
                            <div className="border-t border-panel-border/15 pt-3">
                              <span className="text-[10px] font-black uppercase text-accent tracking-wider block mb-2 font-mono">Affected Stakeholders Trade-offs</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {brainstormData.stakeholders.map((stk, sIdx) => (
                                  <div key={sIdx} className="bg-app/20 p-3 rounded-xl border border-panel-border/25 flex flex-col justify-between">
                                    <div className="text-left font-sans">
                                      <p className="text-[11px] font-black text-light uppercase tracking-wider">{stk.name}</p>
                                      <p className="text-[11px] text-main mt-1 leading-snug"><span className="text-[10px] text-muted font-bold uppercase">Dilemma:</span> {stk.dilemma}</p>
                                    </div>
                                    <p className="text-[10.5px] text-accent/80 font-semibold mt-1.5 pt-1.5 border-t border-panel-border/10 text-left"><span className="text-[9px] text-muted font-black uppercase">Core Interest:</span> {stk.interest}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* HIGH-YIELD TOPPER VOCABULARY */}
                          {brainstormData.vocabulary && brainstormData.vocabulary.length > 0 && (
                            <div className="border-t border-panel-border/15 pt-3">
                              <span className="text-[10px] font-black uppercase text-accent tracking-wider block mb-2 font-mono">High-Yield Topper Vocabulary Forge</span>
                              <p className="text-[10px] text-muted mb-2">Click any keyword block to copy to your clipboard:</p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {brainstormData.vocabulary.map((vocab, vIdx) => (
                                  <button
                                    key={vIdx}
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(vocab.word);
                                      setCopiedWord(vocab.word);
                                      setTimeout(() => setCopiedWord(null), 2000);
                                    }}
                                    className="bg-panel-border/10 hover:bg-accent/15 border border-panel-border/25 hover:border-accent/40 rounded-xl p-2.5 text-left transition-all active:scale-[0.98] group relative"
                                  >
                                    <span className="text-[11px] font-black text-light group-hover:text-accent transition-colors block leading-tight font-sans truncate">{vocab.word}</span>
                                    <span className="text-[9px] text-muted leading-tight mt-0.5 block line-clamp-1 font-normal font-sans">{vocab.definition}</span>
                                    {copiedWord === vocab.word && (
                                      <span className="absolute inset-0 bg-accent text-black rounded-xl text-[9px] font-black flex items-center justify-center animate-pulse uppercase tracking-wider">
                                        Copied!
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                   {/* TAB CONTENT: 3. DIAGRAMS & COMPARISON MATRIX */}
                  {activeStudioTab === 'diagrams' && (
                    <div className="space-y-4 animate-fadeIn text-left">
                      {diagramError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 hover:text-red-400 transition-all rounded-xl text-[11px] leading-relaxed max-w-2xl mx-auto flex items-center gap-2">
                          <span className="text-sm font-bold">⚠️</span>
                          <span className="flex-1">{diagramError}</span>
                        </div>
                      )}

                      {!diagramData ? (
                        <div className="bg-panel-border/5 p-6 rounded-2xl border border-panel-border/20 text-center flex flex-col items-center justify-center py-8">
                          <Table2 className="w-8 h-8 text-muted mb-3" />
                          <h4 className="font-extrabold text-[11px] text-main uppercase">Build Visual Blueprint Assets</h4>
                          <p className="text-[11px] text-muted mt-1 leading-relaxed max-w-md">
                            Toppers score up to 2-3 extra marks per paper by framing argument tables and flowchart structures. Let Atlas compile a specialized Mermaid diagram layout custom to this prompt.
                          </p>
                          <button
                            type="button"
                            onClick={handleGenerateDiagrams}
                            disabled={isGeneratingDiagram}
                            className="mt-4 bg-accent text-black text-[10.5px] font-black uppercase px-4 py-2 rounded-xl transition-all hover:opacity-90 flex items-center gap-1 cursor-pointer disabled:opacity-55"
                          >
                            {isGeneratingDiagram ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Architecting Layouts...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                Generate Visual Blueprints
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-5 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-accent tracking-wider font-mono">Live Mermaid Flowchart Draft</span>
                            <button
                              type="button"
                              onClick={handleGenerateDiagrams}
                              disabled={isGeneratingDiagram}
                              className="text-[9.5px] text-muted hover:text-accent font-bold uppercase tracking-wider flex items-center gap-1 disabled:opacity-55 animate-pulse"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-accent" />
                              {isGeneratingDiagram ? "Rebuilding..." : "Re-Architect Diagrams"}
                            </button>
                          </div>

                          {/* Mermaid Flowchart Render Layout */}
                          {diagramData.mermaidCode && (
                            <div className="bg-app/40 rounded-2xl border border-panel-border/30 overflow-hidden flex flex-col text-left">
                              {/* Live render container */}
                              <div className="p-4 border-b border-panel-border/15 bg-app/60 rounded-t-2xl">
                                <MermaidChart chart={diagramData.mermaidCode} />
                              </div>

                              {/* Injection selectors */}
                              <div className="p-3 bg-panel-border/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-left">
                                <span className="font-bold text-muted uppercase text-[9.5px]">Inject this flowchart into section:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {sections.map(s => (
                                    <button
                                      key={s.id}
                                      type="button"
                                      onClick={() => {
                                        handleAppendDiagramToSection(s.id, 'mermaid');
                                        setInjectionNotification(`Flowchart successfully injected to ${s.id === 'intro' ? 'Intro' : s.id === 'conclusion' ? 'Conclusion' : s.id === 'dimension1' ? 'Dimension 1' : 'Dimension 2'}!`);
                                      }}
                                      className="px-2.5 py-1 bg-accent/15 border border-accent/25 hover:bg-accent hover:text-black rounded-lg text-[9.5px] font-black transition-all cursor-pointer text-main"
                                    >
                                      {s.id === 'intro' ? 'Intro' : s.id === 'conclusion' ? 'Concl' : s.id === 'dimension1' ? 'Dim I' : 'Dim II'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Markdown Comparison Matrix */}
                          {diagramData.comparisonTable && (
                            <div className="border-t border-panel-border/15 pt-4 space-y-2 text-left">
                              <span className="text-[10px] font-black uppercase text-accent tracking-wider block font-mono">Symmetric Comparison Matrix</span>
                              <div className="bg-app/20 p-4 rounded-xl border border-panel-border/20 max-w-none text-main overflow-x-auto text-left font-sans">
                                <Markdown 
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    table: ({node, ...props}) => <table className="min-w-full border-collapse border border-panel-border/30 my-3 text-[11px] select-text bg-panel/30 rounded-xl overflow-hidden" {...props} />,
                                    thead: ({node, ...props}) => <thead className="bg-panel-border/15 border-b border-panel-border/40 font-bold uppercase text-[9.5px] text-accent tracking-wider" {...props} />,
                                    tbody: ({node, ...props}) => <tbody className="divide-y divide-panel-border/10 text-[11px]" {...props} />,
                                    tr: ({node, ...props}) => <tr className="hover:bg-panel-border/10 transition-colors" {...props} />,
                                    th: ({node, ...props}) => <th className="px-3 py-2 text-left font-black text-light border border-panel-border/20" {...props} />,
                                    td: ({node, ...props}) => <td className="px-3 py-2 text-muted leading-relaxed border border-panel-border/20 max-w-xs break-words" {...props} />,
                                  }}
                                >
                                  {cleanComparisonTable}
                                </Markdown>
                              </div>

                              <div className="p-3 bg-panel-border/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-left">
                                <span className="font-bold text-muted uppercase text-[9.5px]">Inject comparison table into:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {sections.map(s => (
                                    <button
                                      key={s.id}
                                      type="button"
                                      onClick={() => {
                                        handleAppendDiagramToSection(s.id, 'table');
                                        setInjectionNotification(`Comparison table matrix injected successfully to ${s.id === 'intro' ? 'Intro' : s.id === 'conclusion' ? 'Conclusion' : s.id === 'dimension1' ? 'Dimension 1' : 'Dimension 2'}!`);
                                      }}
                                      className="px-2.5 py-1 bg-accent/15 border border-accent/25 hover:bg-accent hover:text-black rounded-lg text-[9.5px] font-black transition-all cursor-pointer text-main"
                                    >
                                      {s.id === 'intro' ? 'Intro' : s.id === 'conclusion' ? 'Concl' : s.id === 'dimension1' ? 'Dim I' : 'Dim II'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Sketch Prompt Recommendation */}
                          {diagramData.mapPrompt && (
                            <div className="border-t border-panel-border/15 pt-4 text-left">
                              <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider block font-mono">Marginal Hand-Drawn Sketch Idea</span>
                              <div className="bg-amber-400/[0.02] border border-amber-400/20 rounded-xl p-3.5 mt-1.5 text-[11px] text-main leading-relaxed font-sans italic text-left">
                                "{diagramData.mapPrompt}"
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Progress Indicators & Visual Symmetry Outline Panel */}
                <div className="bg-panel-border/10 border border-panel-border/25 rounded-3xl p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-500 text-sm">
                        {currentFulfillment.pointsCount}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[11px] font-bold text-main">Structure Completion Progress</span>
                        <span className="text-[10px] text-muted">Aspirants target at least 4 core dimensions</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10.5px] font-extrabold transition-all uppercase tracking-wider ${
                        currentFulfillment.hasSC
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500 font-black shadow-sm"
                          : "bg-panel-border/10 border-panel-border/10 text-muted"
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Judgement Cited
                      </div>
                      
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10.5px] font-extrabold transition-all uppercase tracking-wider ${
                        currentFulfillment.hasComm
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500 font-black shadow-sm"
                          : "bg-panel-border/10 border-panel-border/10 text-muted"
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Committee Added
                      </div>

                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10.5px] font-extrabold transition-all uppercase tracking-wider ${
                        currentFulfillment.hasStat
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500 font-black shadow-sm"
                          : "bg-panel-border/10 border-panel-border/10 text-muted"
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Statistic Tied
                      </div>
                    </div>
                  </div>

                  {/* 4-Node Visual Layout Symmetry map */}
                  <div className="border-t border-panel-border/15 pt-4">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Compass className="w-3.5 h-3.5 text-accent" />
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-muted">Aesthetic Paper Symmetry Blueprint Map</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 select-none">
                      {sections.map((sec, sIdx) => {
                        const activePoints = sec.points.filter(p => p.trim().length > 0);
                        const isIntro = sec.id === "intro";
                        const isConcl = sec.id === "conclusion";
                        
                        return (
                          <div 
                            key={sec.id}
                            className={`p-3 rounded-2xl border transition-all flex flex-col justify-between min-h-[85px] text-left relative ${
                              currentSprintPhase && currentSprintPhase.focusSectionId === sec.id
                                ? "bg-accent/10 border-accent shadow-[0_0_12px_rgba(234,179,8,0.1)] ring-1 ring-accent/30"
                                : activePoints.length > 0
                                  ? "bg-panel-border/10 border-panel-border/30"
                                  : "bg-panel-border/5 border-panel-border/15 opacity-60"
                            }`}
                          >
                            {/* Desktop step connectors */}
                            {sIdx < sections.length - 1 && (
                              <div className="hidden sm:block absolute -right-1.5 top-1/2 -translate-y-1/2 z-10">
                                <ArrowRight className="w-3 h-3 text-panel-border/30" />
                              </div>
                            )}

                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span className="text-[9px] font-black uppercase tracking-wide text-light">
                                {isIntro ? "Intro" : isConcl ? "Concl" : sec.id === "dimension1" ? "Dim I" : "Dim II"}
                              </span>
                              <span className="text-[8px] font-black text-muted bg-panel-border/20 px-1 py-0.2 rounded">
                                {isIntro ? "10%" : isConcl ? "20%" : sec.id === "dimension1" ? "40%" : "30%"}
                              </span>
                            </div>

                            <div className="flex flex-col gap-1.5 mt-2">
                              {/* Point pills */}
                              <div className="flex gap-1">
                                {Array.from({ length: Math.max(1, activePoints.length) }).map((_, pI) => (
                                  <div 
                                    key={pI} 
                                    className={`h-1 w-3 rounded-full transition-all ${
                                      activePoints.length > pI 
                                        ? isIntro ? "bg-amber-400" : isConcl ? "bg-emerald-400" : "bg-accent"
                                        : "bg-panel-border/20"
                                    }`}
                                  />
                                ))}
                              </div>

                              {/* Value addition tags */}
                              {sec.citations.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {sec.citations.slice(0, 2).map((cite) => (
                                    <span 
                                      key={cite.id}
                                      className="text-[7.5px] font-black uppercase text-accent bg-accent/10 border border-accent/20 px-1 rounded-sm"
                                    >
                                      {cite.category === "SC Judgement" ? "SC" : cite.category === "Committee" ? "Comm" : cite.category === "Statistic" ? "Stat" : "Quote"}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Section Blueprints Workspace */}
                <div className="flex flex-col gap-4">
                  {detectedSubject && (
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-accent/5 border border-accent/20 rounded-2xl text-[11px] text-accent text-left animate-fadeIn">
                      <Sparkles className="w-4 h-4 text-accent animate-pulse shrink-0" />
                      <div>
                        <strong className="font-extrabold uppercase tracking-wide text-[10px] block text-accent/80 mb-0.5">Syllabus-Aligned Re-Architect</strong>
                        <span>Answer boxes have been customized for <strong>{detectedSubject}</strong> subject requirements.</span>
                      </div>
                    </div>
                  )}
                  {sections.map((sec) => (
                    <div
                      key={sec.id}
                      className={`glass-panel p-5 rounded-3xl border relative flex flex-col justify-between transition-all duration-300 ${
                        currentSprintPhase && (currentSprintPhase.focusSectionId === sec.id || (currentSprintPhase.focusSectionId === "dimensions" && sec.id.startsWith("dimension")))
                          ? "border-amber-500/80 bg-amber-500/[0.01] shadow-[0_0_15px_rgba(234,179,8,0.12)] ring-1 ring-amber-500/30"
                          : "border-panel-border/30 hover:border-panel-border/55"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-4">
                        <div className="flex flex-col text-left">
                          <h3 className="font-bold text-main text-sm">{sec.title}</h3>
                          <p className="text-[11px] text-muted leading-relaxed mt-0.5">{sec.description}</p>
                        </div>

                        {/* Allowed values labels */}
                        <div className="flex flex-wrap gap-1 md:self-end">
                          <span className="text-[9.5px] text-muted self-center font-bold tracking-wider uppercase mr-1.5">Recommended Value Addition:</span>
                          {sec.valueAddsRequired.map((valType, i) => (
                            <span
                              key={i}
                              className="text-[9px] px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wide bg-panel-border/20 border border-panel-border/35 text-light"
                            >
                              {valType}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Points / Outline list blocks */}
                      <div className="space-y-2.5 mb-4">
                        {sec.points.map((pt, idx) => (
                          <div key={idx} className="flex gap-2.5 items-center">
                            <span className="text-[11px] text-muted select-none">{idx + 1}.</span>
                            <input
                              type="text"
                              value={pt}
                              onChange={(e) => handleUpdatePoint(sec.id, idx, e.target.value)}
                              placeholder={sec.placeholder}
                              className="w-full text-[11px] bg-app/40 border border-panel-border/30 rounded-xl px-3.5 py-2.5 text-main focus:outline-none focus:border-accent inline-block transition-colors placeholder:text-muted/65"
                            />
                            {sec.points.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePoint(sec.id, idx)}
                                className="p-1.5 rounded-lg text-light hover:text-red-500 hover:bg-panel-border/25 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleAddPoint(sec.id)}
                          className="text-[11px] font-black uppercase text-accent hover:underline flex items-center gap-1 mt-2.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Dev Dimension
                        </button>
                      </div>

                      {/* Expandable Paragraph Writer for full sentences */}
                      <div className="mt-3 pt-3 border-t border-panel-border/10">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setExpandedDrafts(prev => ({ ...prev, [sec.id]: !prev[sec.id] }))}
                            className="text-[11px] font-black uppercase tracking-wider text-accent border border-accent/20 bg-accent/5 hover:bg-accent/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            {expandedDrafts[sec.id] ? "Minimize Paragraph Canvas" : "Write Full Answer Paragraph Draft"}
                            {sec.paragraphDraft && sec.paragraphDraft.trim().length > 0 && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                          </button>
                          
                          {expandedDrafts[sec.id] && (
                            <span className="text-[10px] font-mono text-muted">
                              Words: <strong className="text-main">
                                {(sec.paragraphDraft || "").trim().split(/\s+/).filter(Boolean).length}
                              </strong> / ~{sec.id === 'intro' ? '40' : sec.id === 'conclusion' ? '45' : '100'} words
                            </span>
                          )}
                        </div>

                        {expandedDrafts[sec.id] && (
                          <div className="mt-3.5 space-y-3.5 animate-fadeIn">
                            <div className="relative">
                              <textarea
                                value={sec.paragraphDraft || ""}
                                onChange={(e) => handleUpdateDraft(sec.id, e.target.value)}
                                placeholder="State your formal sentence flow here. Integrate cited Supreme Court cases or committee metrics to ensure structural coherence..."
                                className="w-full h-28 bg-input border border-panel-border/30 rounded-2xl p-4 text-[11px] text-main font-sans placeholder-muted/50 focus:outline-none focus:border-accent resize-none leading-relaxed transition-colors"
                              />
                            </div>

                            {/* Transitional Terms Palette */}
                            <div className="flex flex-col gap-2 bg-panel-border/5 border border-panel-border/20 p-3 rounded-2xl text-left">
                              <span className="text-[9px] font-black tracking-wider text-muted uppercase">Topper Transitional Terminology Matrix (Click to Append):</span>
                              <div className="flex flex-wrap gap-1.5 select-none">
                                {[
                                  { label: "Inter-alia", desc: "Among other things" },
                                  { label: "Concomitantly", desc: "Co-occurringly" },
                                  { label: "Pari-passu", desc: "Equally mapped" },
                                  { label: "Sine-qua-non", desc: "Vital premise" },
                                  { label: "Ameliorate", desc: "Enhance standard" },
                                  { label: "Constitutional Morality", desc: "Moral baseline" },
                                  { label: "Subsidiarity", desc: "Closest authority" }
                                ].map((termObj) => (
                                  <button
                                    key={termObj.label}
                                    type="button"
                                    onClick={() => {
                                      const oldDraft = sec.paragraphDraft || "";
                                      const insertTerm = `${termObj.label} `;
                                      handleUpdateDraft(sec.id, oldDraft + (oldDraft.endsWith(" ") || oldDraft.length === 0 ? "" : " ") + insertTerm);
                                    }}
                                    className="text-[9px] px-2 py-1 bg-app border border-panel-border/40 hover:border-accent/40 rounded-lg text-muted hover:text-main cursor-pointer hover:bg-accent/5 transition-all"
                                    title={termObj.desc}
                                  >
                                    + {termObj.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cited components list */}
                      {sec.citations.length > 0 && (
                        <div className="border-t border-panel-border/25 pt-3.5 mt-2 text-left">
                          <p className="text-[10px] font-black uppercase tracking-wider text-muted mb-2.5">Citations Attached to this node:</p>
                          <div className="flex flex-wrap gap-2">
                            {sec.citations.map((cite) => (
                              <div
                                key={cite.id}
                                className="bg-panel p-2.5 rounded-xl border border-accent/20 flex items-center justify-between gap-3 text-[11px] text-main max-w-sm"
                              >
                                <div className="flex-1 truncate">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[8.5px] font-black bg-accent/15 border border-accent/20 px-1.5 py-0.2 rounded-md uppercase tracking-wider text-accent shrink-0">
                                      {cite.category}
                                    </span>
                                    <span className="font-bold text-[10.5px] truncate text-light">{cite.authorOrSource}</span>
                                  </div>
                                  <p className="text-[10.5px] text-muted line-clamp-1">{cite.content}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleUnciteItem(sec.id, cite.id)}
                                  className="text-muted hover:text-red-500 p-1 rounded hover:bg-panel-border/30 cursor-pointer shrink-0"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Submit/Control Action panel */}
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-end shrink-0 py-2">
                  <button
                    onClick={handleResetWorkspace}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-panel-border font-bold text-[11px] text-muted hover:bg-panel-border/20 cursor-pointer transition-all"
                  >
                    Reset Canvas
                  </button>
                  <button
                    onClick={handleSaveBlueprint}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-panel-border/40 border border-panel-border/60 hover:bg-panel-border/70 text-main font-bold text-[11px] cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-4 h-4 text-light" />
                    Save Outline Draft
                  </button>
                  <button
                    onClick={handleEvaluateBlueprint}
                    disabled={isEvaluating}
                    className="w-full sm:w-auto bg-accent hover:opacity-90 disabled:opacity-50 text-black px-6 py-2.5 rounded-xl font-bold text-[11px] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        Analyzing Structure Strength...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-black" />
                        AI Structure Critique
                      </>
                    )}
                  </button>
                </div>

                {/* AI Review Outcome panel */}
                {aiFeedback && (
                  <div className="glass-panel p-6 rounded-3xl border border-accent/25 relative text-left bg-gradient-to-br from-accent/[0.02] via-transparent to-transparent mt-2">
                    <div className="flex items-center justify-between pb-4 border-b border-panel-border/30 mb-5 shrink-0">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                        <h4 className="font-black text-main text-[13px] uppercase tracking-wider">Atlas AI Evaluation Report</h4>
                      </div>
                      
                      {score !== undefined && (
                        <div className="flex items-center gap-1 text-[13.5px] font-black text-accent bg-accent/15 border border-accent/20 px-3.5 py-1.5 rounded-xl">
                          <Award className="w-4 h-4 text-accent" />
                          <span>Score: {score}/10</span>
                        </div>
                      )}
                    </div>

                    <div 
                      className="prose prose-sm max-w-none text-main prose-headings:text-main prose-strong:text-main prose-a:text-accent prose-p:text-main prose-li:text-main bg-app/30 p-5 rounded-2xl border border-panel-border/25 leading-relaxed font-sans"
                      style={{ "--tw-prose-body": "var(--text-main)", "--tw-prose-headings": "var(--text-main)", "--tw-prose-bold": "var(--text-main)" } as any}
                    >
                      <Markdown>{aiFeedback}</Markdown>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-panel-border/35 rounded-3xl p-8">
                <HelpCircle className="w-12 h-12 text-muted/65 mb-4 stroke-[1.5]" />
                <h3 className="font-bold text-main text-base uppercase">Choose or Enter a Question</h3>
                <p className="text-[11px] text-muted mt-2 max-w-sm leading-relaxed">
                  Select one of our preset templates above or paste a custom board topic in the text field to activate the interactive canvas workspace.
                </p>
              </div>
            )}
          </div>

          {/* Right Side: UPSC Mains VAM Data-Bank citation tray */}
          <div className="w-full lg:w-[350px] border-t lg:border-t-0 lg:border-l border-panel-border/30 pt-6 lg:pt-0 lg:pl-6 flex flex-col overflow-hidden shrink-0 text-left h-[500px] lg:h-auto">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-panel-border/25 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-accent" />
                <h3 className="font-black text-main text-[12.5px] uppercase tracking-wider">My Mains Data Vault</h3>
              </div>
              <span className="text-[10px] bg-panel-border/30 px-2 py-0.5 rounded-full font-black text-muted">
                {dataBank.length} items
              </span>
            </div>

            <p className="text-[10.5px] text-muted leading-relaxed mb-4">
              Search your saved statistics, judgements, and committees. Select a card while drafting a section above to immediately cite it!
            </p>

            {/* Micro search filter */}
            <div className="flex flex-col gap-2.5 mb-4 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-light" />
                <input
                  type="text"
                  placeholder="Query stats, cases, committee..."
                  value={dbSearch}
                  onChange={(e) => setDbSearch(e.target.value)}
                  className="w-full text-[11px] bg-app border border-panel-border/25 rounded-xl pl-8 pr-3 py-2 text-main focus:outline-none focus:border-accent placeholder:text-muted/70 transition-colors"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {["All", "Quote", "SC Judgement", "Committee", "Statistic"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setDbCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg border font-bold text-[9.5px] whitespace-nowrap transition-colors cursor-pointer ${
                      dbCategory === cat
                        ? "bg-accent/15 border-accent text-accent font-extrabold"
                        : "bg-panel-border/10 border-panel-border/25 text-muted hover:text-main"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List scrollbox */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar">
              {filteredDbItems.length === 0 ? (
                <div className="text-center py-10 text-muted/50 border border-dashed border-panel-border/20 rounded-2xl p-4">
                  <p className="text-[11px] font-semibold">No Matching Value-Add Items</p>
                  <p className="text-[10px] mt-1 leading-normal">Add more quotes or judgements in the Mains Data Bank view.</p>
                </div>
              ) : (
                filteredDbItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-app p-4 rounded-2xl border border-panel-border/25 hover:border-accent/25 hover:shadow-sm transition-all group/card flex flex-col justify-between relative"
                  >
                    <div className="flex flex-col gap-1.5 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[8.5px] font-black bg-accent/10 border border-accent/20 text-accent px-1.5 py-0.2 rounded-md uppercase tracking-wider">
                          {item.category}
                        </span>
                        <span className="text-[8.5px] font-bold text-muted uppercase">
                          {item.paper}
                        </span>
                      </div>
                      
                      <h4 className="font-extrabold text-[12.5px] text-main leading-tight line-clamp-1 mt-1 font-sans">
                        {item.authorOrSource}
                      </h4>
                      <p className="text-[11.5px] text-muted line-clamp-3 leading-relaxed mt-1">
                        {item.content}
                      </p>
                    </div>

                    {activeQuestionText && (
                      <div className="mt-3 pt-2.5 border-t border-panel-border/20 flex flex-col gap-1 text-left">
                        <p className="text-[8.5px] font-black text-muted tracking-wider uppercase mb-1.5">Attach / Cite to section:</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {sections.map((s) => {
                            const isAttached = s.citations.some(c => c.id === item.id);
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => isAttached ? handleUnciteItem(s.id, item.id) : handleCiteItem(s.id, item)}
                                className={`text-[9px] px-1.5 py-1 rounded text-center truncate font-bold border transition-colors cursor-pointer ${
                                  isAttached
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-extrabold"
                                    : "bg-panel-border/15 border-panel-border/25 text-muted hover:border-accent/40 hover:text-main"
                                }`}
                              >
                                {isAttached ? "Linked" : s.id === "intro" ? "Intro" : s.id === "conclusion" ? "Conclusion" : s.id === "dimension1" ? "Dimension 1" : "Dimension 2"}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
