import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  BookOpen, 
  Scale, 
  ArrowUpRight, 
  Layers, 
  Activity, 
  Check, 
  Trophy, 
  Bookmark,
  ExternalLink,
  Compass
} from "lucide-react";

export interface SubTopicRef {
  id: string;
  title: string;
  shortTitle: string;
}

export interface RoadmapMilestone {
  id: string;
  parentId: string; // The corresponding ID in tracker tree
  phase: "Prelims" | "Mains GS" | "Optionals";
  title: string;
  subtitle: string;
  badgeColor: string;
  advice: string;
  subtopics: SubTopicRef[];
}

const ROADMAP_MILESTONES: RoadmapMilestone[] = [
  {
    id: "m1-prelims-gs",
    parentId: "pre-p1",
    phase: "Prelims",
    title: "Prelims Paper I: General Studies",
    subtitle: "Core static foundation & current events",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    advice: "Prelims is about elimination, accuracy, and broad coverage. Read Laxmikanth for Polity (every word!), PMF/Shankar for Environment, and standard NCERTs for Geography. Keep the historical timelines clear: correlate events with socio-economic context.",
    subtopics: [
      { id: "pre-p1-1", title: "Current events of national and international importance.", shortTitle: "Current Affairs" },
      { id: "pre-p1-2", title: "History of India and Indian National Movement.", shortTitle: "History of India" },
      { id: "pre-p1-3", title: "Indian and World Geography - Physical, Social, Economic.", shortTitle: "Physical & Indian Geography" },
      { id: "pre-p1-4", title: "Indian Polity and Governance - Constitution, Panchayati Raj, Public Policy.", shortTitle: "Polity & Constitution" },
      { id: "pre-p1-5", title: "Economic and Social Development - Sustainable Development, Inclusion.", shortTitle: "Economy & Development" },
      { id: "pre-p1-6", title: "General issues on Environmental Ecology, Bio-diversity and Climate Change.", shortTitle: "Environment & Ecology" },
      { id: "pre-p1-7", title: "General Science.", shortTitle: "General Science" }
    ]
  },
  {
    id: "m2-prelims-csat",
    parentId: "pre-p2",
    phase: "Prelims",
    title: "Prelims Paper II: CSAT Engine",
    subtitle: "Logical reasoning & mental ability qualification",
    badgeColor: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    advice: "Do not take CSAT lightly. Target at least 40 PYQs timed under test conditions. Focus on logical arrangements, percentages, ratios, and comprehensible reading of complex passages.",
    subtopics: [
      { id: "pre-p2-1", title: "Comprehension", shortTitle: "Reading Comprehension" },
      { id: "pre-p2-3", title: "Logical reasoning and analytical ability", shortTitle: "Reasoning Mechanics" },
      { id: "pre-p2-5", title: "General mental ability", shortTitle: "Mental Ability" },
      { id: "pre-p2-6", title: "Basic numeracy and Data interpretation", shortTitle: "Basic Numeracy" }
    ]
  },
  {
    id: "m3-mains-essay",
    parentId: "mains-essay",
    phase: "Mains GS",
    title: "Mains Paper I: Essay Writing",
    subtitle: "Articulating multi-dimensional perspectives",
    badgeColor: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    advice: "Essays require structured brainstorming. Spend 25 minutes planning: map philosophical quotes, construct counter-arguments, and weave elegant transitions. Keep a bank of legal and constitutional benchmarks to add concrete, authoritative weight.",
    subtopics: [
      { id: "essay-1", title: "Candidates may be required to write essays on multiple topics.", shortTitle: "Multi-dimensional Essay Writing" }
    ]
  },
  {
    id: "m4-mains-gs1",
    parentId: "mains-gs1",
    phase: "Mains GS",
    title: "GS Paper I: Heritage, History, Geography & Society",
    subtitle: "Human history, physical landscapes, and social dynamics",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    advice: "GS-1 expects precise diagrams for geography and structural classifications in history. For Society, substantiate answers with key reports on women, migration, regionalism, and urban development.",
    subtopics: [
      { id: "gs1-1", title: "Indian Culture - Art Forms, Literature, and Architecture", shortTitle: "Indian Art & Culture" },
      { id: "gs1-2", title: "Modern Indian History from mid-18th century", shortTitle: "Modern Indian History" },
      { id: "gs1-3", title: "The Freedom Struggle - stages and contributors", shortTitle: "Freedom Struggle" },
      { id: "gs1-5", title: "History of the World - Industrial Revolution, World Wars", shortTitle: "World History" },
      { id: "gs1-6", title: "Salient features of Indian Society, Diversity of India", shortTitle: "Indian Society Basics" },
      { id: "gs1-8", title: "Effects of globalization on Indian society", shortTitle: "Globalization & Society" },
      { id: "gs1-11", title: "Salient features of world's physical geography", shortTitle: "Physical Geography" }
    ]
  },
  {
    id: "m5-mains-gs2",
    parentId: "mains-gs2",
    phase: "Mains GS",
    title: "GS Paper II: Polity, Constitution & IR",
    subtitle: "Institutional frameworks, governance, and world diplomacy",
    badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    advice: "As a Law applicant, you have a massive leverage here. Quote constitutional provisions (Articles 14, 19, 21, 32, 226, 368) and case laws (Keshvananda, Puttaswamy, S.R. Bommai, Indira Sawhney) to draft stellar GS-2 answers. Balance the legalistic insights with policy analysis.",
    subtopics: [
      { id: "gs2-1", title: "Indian Constitution - historical underpinnings, evolution, basic structure", shortTitle: "Constitutional Core" },
      { id: "gs2-2", title: "Functions and responsibilities of the Union and the States", shortTitle: "Federal Dynamics" },
      { id: "gs2-3", title: "Separation of powers between organs, dispute redressal", shortTitle: "Separation of Powers" },
      { id: "gs2-6", title: "Structure, organization and functioning of the Executive and Judiciary", shortTitle: "Executive & Judiciary" },
      { id: "gs2-8", title: "Salient features of the Representation of People's Act", shortTitle: "RPA Essentials" },
      { id: "gs2-12", title: "Bilateral, regional and global groupings involving India", shortTitle: "Diplomacy & Alignments" },
      { id: "gs2-14", title: "Important International institutions, agencies and fora", shortTitle: "International Orgs" }
    ]
  },
  {
    id: "m6-mains-gs3",
    parentId: "mains-gs3",
    phase: "Mains GS",
    title: "GS Paper III: Economy, Tech, Environment & Security",
    subtitle: "Economic development, science, ecology, and internal defense",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    advice: "In GS-3, include flowchart-based frameworks for security threats, land reforms, or supply chains. Substantiate with exact numbers (Current GDP, solar targets, defense expenditure, environment indices). Use precise technical terms in ISRO, DRDO and cybersecurity answers.",
    subtopics: [
      { id: "gs3-1", title: "Indian Economy and issues relating to planning, mobilization of resources", shortTitle: "Economic Growth" },
      { id: "gs3-4", title: "Major crops, cropping patterns, irrigation, e-technology", shortTitle: "Agriculture & Supply Chain" },
      { id: "gs3-6", title: "Land reforms in India", shortTitle: "Land Reforms" },
      { id: "gs3-9", title: "Science and Technology - developments and applications", shortTitle: "S&T Breakthroughs" },
      { id: "gs3-11", title: "Conservation, environmental pollution and degradation, EIA", shortTitle: "Ecology & Climate" },
      { id: "gs3-13", title: "Linkages between development and spread of extremism", shortTitle: "Extremism Linkages" },
      { id: "gs3-14", title: "Role of external state and non-state actors in security", shortTitle: "Internal Security threats" }
    ]
  },
  {
    id: "m7-mains-gs4",
    parentId: "mains-gs4",
    phase: "Mains GS",
    title: "GS Paper IV: Ethics, Integrity & Aptitude",
    subtitle: "Ethical reasoning, moral philosophy, and case scenarios",
    badgeColor: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    advice: "Ethics requires a personal voice. Anchor answers using high-conviction ethical frameworks (Kant's Deontology, Mill's Utilitarianism, Aristotelian Virtue). Illustrate with real-world examples: administrative heroes like T.N. Seshan or Lal Bahadur Shastri.",
    subtopics: [
      { id: "gs4-1", title: "Ethics and Human Interface - Essence, determinants, consequences", shortTitle: "Ethics Frameworks" },
      { id: "gs4-2", title: "Attitude - content, structure, function, moral & political influence", shortTitle: "Attitudes & Values" },
      { id: "gs4-3", title: "Aptitude and foundational values for Civil Service, integrity, objectivity", shortTitle: "Public Service Values" },
      { id: "gs4-5", title: "Public/Civil service values and Ethics in Public administration", shortTitle: "Administrative Ethics" },
      { id: "gs4-6", title: "Probity in Governance - Concept, Citizen's Charters, RTI", shortTitle: "Probity & Law" }
    ]
  },
  {
    id: "m8-law-p1",
    parentId: "law-p1",
    phase: "Optionals",
    title: "Optional Law Paper I",
    subtitle: "Constitutional, Administrative, & Public International Law",
    badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    advice: "Keep a dedicated legal notebook. Constitutional Law is all about doctrines. When arguing the Basic Structure doctrine, reference its development from Shankari Prasad to Sajjan Singh, Golak Nath, and Kesavananda. For International Law, quote ICJ Article 38 sources, state recognition theories, and the Law of the Sea (UNCLOS) provisions meticulously.",
    subtopics: [
      { id: "const-law", title: "Constitutional and Administrative Law foundations", shortTitle: "Constitutional Core" },
      { id: "const-1", title: "Constitution and Constitutionalism: The distinctive features", shortTitle: "Constitutionalism" },
      { id: "const-2", title: "Fundamental Rights: Public Interest Litigation, judicial reviews", shortTitle: "Fundamental Rights (Art 14, 19, 21)" },
      { id: "const-8", title: "Union Judiciary and State Judiciary: Powers & appointment", shortTitle: "Judiciary & Writs" },
      { id: "int-law", title: "Public International Law doctrines & provisions", shortTitle: "International Law Foundations" },
      { id: "int-2", title: "Sources of International Law, treaties, customs", shortTitle: "PIL Treaty System" },
      { id: "int-10", title: "United Nations: Organ structures, resolutions, security forces", shortTitle: "United Nations & ICJ" }
    ]
  },
  {
    id: "m9-law-p2",
    parentId: "law-p2",
    phase: "Optionals",
    title: "Optional Law Paper II",
    subtitle: "Crimes, Torts, Contracts & Contemporary Legislation",
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    advice: "60-70% of Paper II repeats previous themes. For Crimes, map BNS (Bharatiya Nyaya Sanhita) equivalent sections to old IPC sections (e.g., Kidnapping, culpable homicide, dacoity). For Torts, emphasize the difference between absolute liability (Shriram Gas Case) and strict liability (Rylands). For Mercantile Law, master breach of contracts and partnership dynamics.",
    subtopics: [
      { id: "crime-law", title: "Law of Crimes (General principles, Mens rea, Specific offenses)", shortTitle: "General Principles & Crimes" },
      { id: "crime-2", title: "Mens rea (Guilty mind) and statutory offenses", shortTitle: "Mens rea Rules" },
      { id: "tort-law", title: "Law of Torts (Negligence, Defamation, Liability exceptions)", shortTitle: "Law of Torts" },
      { id: "tort-2", title: "Liability based upon fault, Strict Liability vs Absolute Liability", shortTitle: "Absolute & Strict Liability" },
      { id: "contract-law", title: "Law of Contracts and Mercantile Law rules", shortTitle: "Mercantile & Contract Laws" },
      { id: "contract-1", title: "Nature and fundamental elements of contracts", shortTitle: "Contract Formulation" },
      { id: "contemporary-law", title: "Contemporary Legal Developments (IPR, Cyber, PIL, ADR)", shortTitle: "Contemporary legal frontiers" }
    ]
  }
];

export interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  duration: number;
  rotation: number;
  angle: number;
  velocity: number;
}

export const getSubtopicValueAddRecommendation = (subtopicId: string): string[] => {
  switch (subtopicId) {
    case "pre-p1-1": return ["PIB summaries", "Yojana & Kurukshetra journals"];
    case "pre-p1-2": return ["Spectrum Modern History", "Bipan Chandra key phases"];
    case "pre-p1-3": return ["GC Leong chapter highlights", "Oxford student atlas maps"];
    case "pre-p1-4": return ["M. Laxmikanth chapters 3-11", "Articles 12-51A exact wordings"];
    case "pre-p1-5": return ["Economic Survey summary chapters", "NITI Aayog Strategy reports"];
    case "pre-p1-6": return ["PMF IAS environment concepts", "COP Climate declarations"];
    case "pre-p1-7": return ["NCERT Class IX & X general concepts"];
    
    case "pre-p2-1": return ["CSAT PYQ reading strategies"];
    case "pre-p2-3": return ["Analytical sequencing matrix patterns"];
    case "pre-p2-5": return ["Time-speed-distance shortcuts"];
    case "pre-p2-6": return ["Standard numeric data structures"];
    
    case "essay-1": return ["Philosophical anthology quotes", "Socio-economic indices stats"];
    
    case "gs1-1": return ["Nitin Singhania core summaries", "CCR-T visual arts databases"];
    case "gs1-2": return ["Plassey to Partition summaries", "Land revenue structures"];
    case "gs1-3": return ["Extremist-Moderate split stages", "Subhas Chandra Bose records"];
    case "gs1-5": return ["French Revolution philosophies", "Decolonisation patterns"];
    case "gs1-6": return ["Sanskritization / Westernization", "Joint family system breakdowns"];
    case "gs1-8": return ["McDonaldization vs Hybridization theories"];
    case "gs1-11": return ["Plate tectonics maps", "Cyclone formations / El Nino cycles"];
    
    case "gs2-1": return ["Puttaswamy Case (Art 21)", "Basic Structure evolution trail"];
    case "gs2-2": return ["Sarkaria & Punchhi Reports", "Article 356 misuse precedents"];
    case "gs2-3": return ["Ram Jawaya Kapur (1955) rule", "NJAC Judgement (2015)"];
    case "gs2-6": return ["2nd ARC Report on local governance", "Master of Roster rulings"];
    case "gs2-8": return ["Lily Thomas Case (2013)", "RPA sections 8(3) and 8(4)"];
    case "gs2-12": return ["Neighborhood First policy", "Indo-US civil nuclear deal"];
    case "gs2-14": return ["Article 38 ICJ custom sources", "WTO dispute resolution panel"];
    
    case "gs3-1": return ["Dalwai Report", "NITI Aayog action agenda"];
    case "gs3-4": return ["E-NAM direct trades", "PM-KISAN DBT statistics"];
    case "gs3-6": return ["Zamindari abolition laws", "Model land leasing acts"];
    case "gs3-9": return ["Gaganyaan crewed system module", "Quantum computing hubs"];
    case "gs3-11": return ["EIA 2026 drafted procedures", "Tiger census numbers"];
    case "gs3-13": return ["LWE operational security clusters"];
    case "gs3-14": return ["Cybersecurity critical networks", "Coastal defenses radars"];
    
    case "gs4-1": return ["Kant categorical imperative rules", "Mahatma Gandhi 7 sins"];
    case "gs4-2": return ["Cognitive dissonance examples", "Persuasive messages tactics"];
    case "gs4-3": return ["Satyam Shivam Sundaram ethics core"];
    case "gs4-5": return ["Nolan principles standards", "2nd ARC Ethics Report"];
    case "gs4-6": return ["Citizen charters standards", "RTI Section 8 exemptions"];
    
    case "const-law": return ["D.D. Basu constitutional guidelines"];
    case "const-1": return ["A.V. Dicey Rule of Law principles"];
    case "const-2": return ["Maneka Gandhi v. Union of India (1978)"];
    case "const-8": return ["Advisory jurisdiction Article 143"];
    case "int-law": return ["Starke Public International Law studies"];
    case "int-2": return ["Vienna Convention of Law of Treaties (Art 31)"];
    case "int-10": return ["ICJ statutes Article 36 jurisdiction"];
    
    case "crime-law": return ["BNS Section equivalents maps"];
    case "crime-2": return ["Sherras v. De Rutzen guilt guidelines"];
    case "tort-law": return ["Winfield & Jolowicz tort liabilities"];
    case "tort-2": return ["M.C. Mehta Oleum Gas case (1987) absolute power"];
    case "contract-law": return ["Indian Contract Act Section 73 damages"];
    case "contract-1": return ["Lalman Shukla v. Gauri Dutt communication rule"];
    case "contemporary-law": return ["WIPO treaties", "Information Technology Act Sec 66A trail"];
    
    default: return [];
  }
};

export const getSubtopicPracticeQuestion = (
  sub: any, 
  milestoneModel: RoadmapMilestone
): { question: string, paper: "GS1" | "GS2" | "GS3" | "GS4" | "Essay" } => {
  const paperStr = (milestoneModel.phase === "Prelims") 
    ? "GS2" 
    : (milestoneModel.phase === "Optionals") 
      ? "GS2" 
      : (milestoneModel.title.includes("GS Paper I") ? "GS1" 
         : milestoneModel.title.includes("GS Paper II") ? "GS2" 
         : milestoneModel.title.includes("GS Paper III") ? "GS3" 
         : milestoneModel.title.includes("GS Paper IV") ? "GS4" 
         : "Essay") as any;

  switch (sub.id) {
    case "pre-p1-4": return { question: "Elucidate how democratic decentralization via the 73rd and 74th Constitutional Amendment Acts has transformed local grassroots governance in India.", paper: "GS2" };
    case "gs1-1": return { question: "Compare and contrast the distinct structural elements of Gandhara and Mathura schools of art, detailing their spiritual-geological roots.", paper: "GS1" };
    case "gs1-6": return { question: "Critically analyze the changing dimensions of the joint family system in India in the face of rapid urbanization and economic modernization.", paper: "GS1" };
    case "gs2-1": return { question: "Discuss the evolutionary journey of the Basic Structure doctrine as a guardian of constitutionalism and citizen rights.", paper: "GS2" };
    case "gs2-2": return { question: "Analyze the institutional friction points in center-state relations of governor appointments and legislative reviews.", paper: "GS2" };
    case "gs2-3": return { question: "Establish the functional separation of powers in the Indian structure in light of judicial activism and Ram Jawaya Kapur standard.", paper: "GS2" };
    case "gs2-6": return { question: "The independence of judiciary is a fundamental requirement of democracy. Assess the efficacy of the Collegium system and proposals for NJAC.", paper: "GS2" };
    case "gs2-8": return { question: "Discuss the significance of the Representation of the People Act, 1951, particularly relating to the disqualification standards of legislators.", paper: "GS2" };
    case "gs3-1": return { question: "Explain the concept of jobless growth in the Indian economy and suggest structural strategies for high-road employment generation.", paper: "GS3" };
    case "gs3-4": return { question: "Doubling of farmers' income is a matter of administrative imperative. Detail the key supply chain reforms proposed by the Ashok Dalwai panel.", paper: "GS3" };
    case "gs3-11": return { question: "Examine the Western Ghats conservation deadlock. Critically compare the protection models recommended by Gadgil and Kasturirangan reports.", paper: "GS3" };
    case "gs4-5": return { question: "Identify the 7 Nolan principles of public life. Discuss their direct applicability and significance for a civil servant resolving ethical conflicts.", paper: "GS4" };
    case "const-2": return { question: "Assess the widening definition of Right to Life under Article 21 of the Indian Constitution, highlighting landmark judicial expansions.", paper: "GS2" };
    case "tort-2": return { question: "Distinguish between strict liability and absolute liability. Critically evaluate whether the absolute liability doctrine has succeeded in deterring corporate safety hazards.", paper: "GS2" };
    default: return { 
      question: `In reference to '${sub.shortTitle}', examine the core constitutional, socio-economic, or administrative parameters and suggest a progressive way forward.`, 
      paper: paperStr 
    };
  }
};

export function VerticalStudyRoadmap({ 
  onNavigate, 
  compact = false 
}: { 
  onNavigate: (view: string) => void; 
  compact?: boolean; 
}) {
  const [syllabus, setSyllabus] = useState<any[]>([]);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>("m1-prelims-gs");
  const [activeTab, setActiveTab] = useState<"All" | "Prelims" | "Mains GS" | "Optionals">("All");
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [isCompactScreen, setIsCompactScreen] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsCompactScreen(window.innerWidth < 1024);
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const isCompact = compact || isCompactScreen;

  // Load and subscribe to syllabus updates
  const loadSyllabus = () => {
    try {
      const saved = localStorage.getItem("upsc_syllabus_v2");
      if (saved) {
        setSyllabus(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load syllabus in roadmap", e);
    }
  };

  useEffect(() => {
    loadSyllabus();

    // Listen to our custom event or standard storage
    const handleUpdate = () => {
      loadSyllabus();
    };

    window.addEventListener("app:syllabusUpdated", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "upsc_syllabus_v2") {
        handleUpdate();
      }
    });

    return () => {
      window.removeEventListener("app:syllabusUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const triggerConfetti = (e: React.MouseEvent) => {
    // Get mouse coordinates, or fall back to node coordinates
    const rect = e.currentTarget
      ? (e.currentTarget as HTMLElement).getBoundingClientRect()
      : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    
    const xBase = e.clientX || rect.left + rect.width / 2;
    const yBase = e.clientY || rect.top + rect.height / 2;

    const colors = ["#EAB308", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#F43F5E", "#06B6D4"];
    const newParticles: ConfettiParticle[] = Array.from({ length: 28 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 80 + Math.random() * 180;
      return {
        id: Date.now() + i + Math.random(),
        x: xBase,
        y: yBase,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 10,
        duration: 0.8 + Math.random() * 0.7,
        rotation: Math.random() * 360,
        angle: angle,
        velocity: velocity,
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);

    // Clean up particles
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1600);
  };

  // Find a topic by ID inside hierarchal trees recursively
  const findTopicInTree = (nodes: any[], targetId: string): any | null => {
    for (const node of nodes) {
      if (node.id === targetId) return node;
      if (node.subtopics && node.subtopics.length > 0) {
        const found = findTopicInTree(node.subtopics, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  // Traverse a node recursive to return all flat child micro-topics (with no subtopics)
  const getAllChildMicroTopicsRec = (node: any, list: any[] = []) => {
    if (!node) return list;
    if (!node.subtopics || node.subtopics.length === 0) {
      list.push(node);
    } else {
      node.subtopics.forEach((sub: any) => getAllChildMicroTopicsRec(sub, list));
    }
    return list;
  };

  // Calculate dynamic progress stats for a specific milestone parent ID
  const getMilestoneProgress = (parentId: string) => {
    if (syllabus.length === 0) return { total: 0, mastered: 0, percent: 0 };

    const parentNode = findTopicInTree(syllabus, parentId);
    if (!parentNode) return { total: 0, mastered: 0, percent: 0 };

    const children = getAllChildMicroTopicsRec(parentNode);
    const total = children.length;
    const mastered = children.filter((c: any) => c.status === "mastered").length;
    const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;

    return { total, mastered, percent };
  };

  // Calculate overall syllabus stats across all categories beautifully
  const overallStats = useMemo(() => {
    if (syllabus.length === 0) {
      return { total: 0, mastered: 0, percent: 0, prelimsPercent: 0, mainsPercent: 0, optionalsPercent: 0 };
    }

    const allTopics: any[] = [];
    syllabus.forEach(root => {
      getAllChildMicroTopicsRec(root, allTopics);
    });

    const total = allTopics.length;
    const mastered = allTopics.filter((t: any) => t.status === "mastered").length;
    const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;

    const getPhaseProgress = (phase: "Prelims" | "Mains GS" | "Optionals") => {
      const msList = ROADMAP_MILESTONES.filter(m => m.phase === phase);
      let tMastered = 0;
      let tTotal = 0;
      msList.forEach(m => {
        const prog = getMilestoneProgress(m.parentId);
        tMastered += prog.mastered;
        tTotal += prog.total;
      });
      return tTotal > 0 ? Math.round((tMastered / tTotal) * 100) : 0;
    };

    return {
      total,
      mastered,
      percent,
      prelimsPercent: getPhaseProgress("Prelims"),
      mainsPercent: getPhaseProgress("Mains GS"),
      optionalsPercent: getPhaseProgress("Optionals")
    };
  }, [syllabus]);

  const handleLaunchBlueprint = (sub: any, m: RoadmapMilestone, e: React.MouseEvent) => {
    e.stopPropagation();
    const promptInfo = getSubtopicPracticeQuestion(sub, m);
    window.dispatchEvent(
      new CustomEvent("app:setBlueprintQuestion", {
        detail: {
          question: promptInfo.question,
          paper: promptInfo.paper
        }
      })
    );
    onNavigate("blueprint");
  };

  // Recursive updater function to edit specific topics in the tree
  const updateTreeNode = (nodes: any[], targetId: string, status: "not_started" | "reading" | "mastered"): any[] => {
    return nodes.map((n) => {
      if (n.id === targetId) {
        // Update current
        const updated = { ...n, status };
        // If has subtopics, update all of them recursively to make it seamless
        if (updated.subtopics && updated.subtopics.length > 0) {
          updated.subtopics = setAllChildrenStatus(updated.subtopics, status);
        }
        return updated;
      }
      if (n.subtopics && n.subtopics.length > 0) {
        return {
          ...n,
          subtopics: updateTreeNode(n.subtopics, targetId, status)
        };
      }
      return n;
    });
  };

  const setAllChildrenStatus = (nodes: any[], status: "not_started" | "reading" | "mastered"): any[] => {
    return nodes.map((n) => ({
      ...n,
      status,
      subtopics: n.subtopics && n.subtopics.length > 0 ? setAllChildrenStatus(n.subtopics, status) : []
    }));
  };

  // Set the status of a specific milestone subtopic
  const toggleSubtopicStatus = (subtopicId: string, currentStatus: string, e: React.MouseEvent) => {
    const nextStatus = currentStatus === "mastered" ? "not_started" : "mastered";
    const updatedSyllabus = updateTreeNode(syllabus, subtopicId, nextStatus);
    
    // Core updates
    setSyllabus(updatedSyllabus);
    localStorage.setItem("upsc_syllabus_v2", JSON.stringify(updatedSyllabus));
    // Emit global event to update charts and syllabus tracker instantly!
    window.dispatchEvent(new CustomEvent("app:syllabusUpdated"));

    if (nextStatus === "mastered") {
      triggerConfetti(e);
    }
  };

  // Toggle complete milestone top-level block
  const handleToggleCompleteMilestone = (milestone: RoadmapMilestone, allChecked: boolean, e: React.MouseEvent) => {
    const targetStatus = allChecked ? "not_started" : "mastered";
    
    // Update the parentNode itself in the tree
    let updatedSyllabus = updateTreeNode(syllabus, milestone.parentId, targetStatus);
    
    // Also update individual listed reference subtopics in our configuration specifically
    milestone.subtopics.forEach((sub) => {
      updatedSyllabus = updateTreeNode(updatedSyllabus, sub.id, targetStatus);
    });

    setSyllabus(updatedSyllabus);
    localStorage.setItem("upsc_syllabus_v2", JSON.stringify(updatedSyllabus));
    window.dispatchEvent(new CustomEvent("app:syllabusUpdated"));

    if (targetStatus === "mastered") {
      triggerConfetti(e);
    }
  };

  // Filter milestones based on tab selection
  const filteredMilestones = ROADMAP_MILESTONES.filter(
    (m) => activeTab === "All" || m.phase === activeTab
  );

  return (
    <div className={`bg-app glass-panel relative overflow-hidden shadow-sm w-full mt-4 mb-4 ${isCompact ? "p-3 rounded-2xl border border-panel-border max-h-[500px] overflow-y-auto custom-scrollbar" : "rounded-3xl border border-panel-border p-6 md:p-8"}`}>
      <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      {/* Embedded Confetti Backdrop overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ 
                x: p.x, 
                y: p.y, 
                scale: 1, 
                opacity: 1, 
                rotate: 0 
              }}
              animate={{ 
                x: p.x + Math.cos(p.angle) * p.velocity * 0.9, 
                y: p.y + Math.sin(p.angle) * p.velocity * 0.9 + 150, 
                scale: 0.1, 
                opacity: 0, 
                rotate: p.rotation + 360 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: p.duration, ease: [0.1, 0.8, 0.3, 1] }}
              style={{
                position: "absolute",
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: Math.random() > 0.45 ? "50%" : "3px",
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Title & Stats */}
      {isCompact ? (
        <div className="flex flex-col border-b border-panel-border pb-3 mb-3 gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-accent" />
              <h3 className="text-[11px] font-black text-main uppercase tracking-wider">
                Study Roadmap
              </h3>
            </div>
            <span className="bg-accent/10 border border-accent/20 text-accent font-black text-[9px] uppercase px-1.5 py-0.5 rounded tracking-wider">
              Topper Guide
            </span>
          </div>
          {/* Tab Selection Row */}
          <div className="flex bg-input p-0.5 rounded-lg border border-panel-border overflow-x-auto whitespace-nowrap">
            {(["All", "Prelims", "Mains GS", "Optionals"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2 py-1 text-[9px] font-black rounded-md transition-all ${
                  activeTab === tab
                    ? "bg-accent text-white shadow-sm"
                    : "text-muted hover:text-main"
                }`}
              >
                {tab === "Mains GS" ? "Mains" : tab}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6 mb-6">
          {/* Command Tower HUD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-panel-border/5 p-6 rounded-3xl border border-panel-border/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
            
            {/* Conquest Circular Ring & Major Metrics */}
            <div className="lg:col-span-5 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-panel-border/20 pb-5 lg:pb-0 lg:pr-6">
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="34" stroke="currentColor" className="text-panel-border/20" strokeWidth="5.5" fill="transparent" />
                  <circle cx="40" cy="40" r="34" stroke="currentColor" className="text-accent transition-all duration-1000 ease-out" strokeWidth="5.5" strokeDasharray={2 * Math.PI * 34} strokeDashoffset={2 * Math.PI * 34 * (1 - overallStats.percent / 100)} strokeLinecap="round" fill="transparent" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-sm font-black text-main font-mono leading-none">{overallStats.percent}%</span>
                  <span className="text-[7px] font-bold text-muted uppercase tracking-wider mt-0.5 font-mono">CONQUERED</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-accent text-[10px] font-black uppercase tracking-wider">
                  <Trophy className="w-3.5 h-3.5 text-accent" />
                  <span>Syllabus Conquest HUD</span>
                </div>
                <h2 className="text-[14px] font-black uppercase text-main leading-none">UPSC Command Tower</h2>
                <p className="text-[11px] text-muted leading-relaxed font-semibold">
                  Syllabus micro-tracking & interactive answer blueprinting. Connected with high-yield case studies & topper prompt markers.
                </p>
              </div>
            </div>

            {/* Detailed Real-time Trackers */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4.5 pt-1 lg:pt-0">
              <div className="bg-app/45 border border-panel-border/30 rounded-2xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted text-[9.5px] font-black uppercase tracking-wider">
                  <span>Phase Progress</span>
                  <Layers className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="mt-2 space-y-1.5">
                  <div>
                    <div className="flex justify-between text-[8px] font-extrabold text-muted uppercase">
                      <span>Prelims</span>
                      <span>{overallStats.prelimsPercent}%</span>
                    </div>
                    <div className="w-full h-1 bg-input rounded-full overflow-hidden mt-0.5">
                      <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${overallStats.prelimsPercent}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[8px] font-extrabold text-muted uppercase">
                      <span>Mains GS</span>
                      <span>{overallStats.mainsPercent}%</span>
                    </div>
                    <div className="w-full h-1 bg-input rounded-full overflow-hidden mt-0.5">
                      <div className="h-full bg-violet-400 transition-all duration-500" style={{ width: `${overallStats.mainsPercent}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[8px] font-extrabold text-muted uppercase">
                      <span>Law Optionals</span>
                      <span>{overallStats.optionalsPercent}%</span>
                    </div>
                    <div className="w-full h-1 bg-input rounded-full overflow-hidden mt-0.5">
                      <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${overallStats.optionalsPercent}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-app/45 border border-panel-border/30 rounded-2xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted text-[9.5px] font-black uppercase tracking-wider">
                  <span>Synaptic Yield</span>
                  <Activity className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="space-y-0.5 mt-2">
                  <span className="text-lg font-black text-main font-mono leading-none">
                    {overallStats.mastered} <span className="text-[10px] font-medium text-muted font-mono">/ {overallStats.total}</span>
                  </span>
                  <p className="text-[9.5px] text-muted leading-tight font-semibold pt-1">
                    Topics fully internalized and ready for UPSC integration.
                  </p>
                </div>
              </div>

              <div className="bg-app/45 border border-panel-border/30 rounded-2xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted text-[9.5px] font-black uppercase tracking-wider">
                  <span>Target Focus</span>
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="space-y-0.5 mt-2">
                  <span className="text-[9px] font-black text-accent bg-accent/15 border border-accent/20 px-2 py-0.5 rounded-lg inline-block uppercase">
                    Law Optional Leverage
                  </span>
                  <p className="text-[9.5px] text-muted leading-tight font-semibold pt-1.5">
                    Your Optionals knowledge is mapped directly into GS-2 and GS-4 questions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Selection Filter Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div>
              <h3 className="text-[13px] font-black uppercase tracking-wider text-main">Syllabus Milestones</h3>
              <p className="text-[10.5px] text-muted font-medium mt-0.5">
                Practice topic-level answer blueprints instantly by picking active practice markers.
              </p>
            </div>
            <div className="flex bg-input p-1 rounded-xl border border-panel-border self-stretch sm:self-auto shrink-0 overflow-x-auto whitespace-nowrap">
              {(["All", "Prelims", "Mains GS", "Optionals"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-[11px] font-black rounded-lg transition-all ${
                    activeTab === tab
                      ? "bg-accent text-black shadow-sm"
                      : "text-muted hover:text-main"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        {/* Timeline Path Line Indicator */}
        <div className={`absolute ${isCompact ? "left-[14px]" : "left-[24px]"} top-4 bottom-4 w-0.5 bg-gradient-to-b from-accent/40 via-panel-border to-purple-500/30 z-0`} />

        <div className={`${isCompact ? "space-y-4" : "space-y-8"} relative z-10`}>
          {filteredMilestones.map((m) => {
            const progress = getMilestoneProgress(m.parentId);
            const isFullyCompleted = progress.total > 0 && progress.mastered === progress.total;
            const isExpanded = expandedMilestone === m.id;

            // Compute actual statuses of individual subtopics
            const subtopicsWithState = m.subtopics.map((sub) => {
              const foundNode = findTopicInTree(syllabus, sub.id);
              return {
                ...sub,
                status: foundNode ? foundNode.status : "not_started"
              };
            });

            const totalSubtopicsMastered = subtopicsWithState.filter(
              (s) => s.status === "mastered"
            ).length;
            const subPercent = m.subtopics.length > 0 
              ? Math.round((totalSubtopicsMastered / m.subtopics.length) * 100) 
              : 0;

            return (
              <div
                key={m.id}
                className={`group relative flex ${isCompact ? "gap-3" : "gap-6"} items-start transition-all duration-300 ${
                  isFullyCompleted ? "opacity-95" : "opacity-100"
                }`}
              >
                {/* Visual Circle Node Descriptor */}
                <div className="relative shrink-0 z-10 flex items-center justify-center">
                  <button
                    onClick={(e) => handleToggleCompleteMilestone(m, isFullyCompleted, e)}
                    className={`${isCompact ? "w-7 h-7 rounded-lg" : "w-12 h-12 rounded-[1.25rem]"} border flex items-center justify-center transition-all shadow-md group/btn ${
                      isFullyCompleted
                        ? "bg-accent border-accent text-black scale-110"
                        : "bg-app border-panel-border text-muted hover:border-accent hover:text-accent hover:scale-105"
                    }`}
                    title={isFullyCompleted ? "Reset milestone" : "Mark milestone completed"}
                  >
                    {isFullyCompleted ? (
                      <motion.div
                        initial={{ scale: 0.3, rotate: -20 }}
                        animate={{ scale: [1.4, 0.9, 1.1, 1], rotate: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        <Check className={`${isCompact ? "w-3.5 h-3.5" : "w-5 h-5"} stroke-[3px]`} />
                      </motion.div>
                    ) : (
                      <span className={`${isCompact ? "text-[8px]" : "text-[11px]"} font-black font-mono group-hover/btn:hidden`}>
                        {progress.percent}%
                      </span>
                    )}
                    {!isFullyCompleted && (
                      <CheckCircle2 className={`${isCompact ? "w-3.5 h-3.5" : "w-4 h-4"} hidden group-hover/btn:block text-accent scale-110`} />
                    )}
                  </button>
                </div>

                {/* Main Milestone Body Card */}
                <div className={`flex-1 bg-panel border border-panel-border hover:border-panel-border-hover rounded-xl ${isCompact ? "p-3" : "p-5 md:p-6"} transition-all shadow-sm`}>
                  <div className={`flex flex-col ${isCompact ? "gap-2" : "sm:flex-row sm:items-center justify-between gap-3"} mb-1.5`}>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[8px] font-bold border rounded uppercase tracking-widest px-1 py-0.2 ${m.badgeColor}`}>
                          {m.phase}
                        </span>
                        <span className="text-[9px] font-bold text-muted uppercase tracking-wider font-mono">
                          {progress.mastered}/{progress.total} Mastered
                        </span>
                      </div>
                      <h4 className={`${isCompact ? "text-[11px] leading-tight" : "text-base"} font-black text-main group-hover:text-accent transition-colors`}>
                        {m.title}
                      </h4>
                    </div>

                    {/* Progress Bar & Expand Control */}
                    <div className="flex items-center justify-between sm:justify-end gap-2">
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <div className={`${isCompact ? "w-16" : "w-24"} h-1.5 bg-input rounded-full overflow-hidden border border-panel-border shadow-inner`}>
                          <div
                            className="h-full bg-gradient-to-r from-accent to-accent/80 transition-all duration-500 rounded-full"
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                        {!isCompact && (
                          <span className="text-[10px] font-black text-muted uppercase tracking-wider font-mono">
                            {progress.percent}% COMPLETE
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setExpandedMilestone(isExpanded ? null : m.id)}
                        className="p-1 rounded bg-input/40 hover:bg-input text-muted hover:text-main transition-colors"
                        title="Toggle Detailed Syllabus Subtopics"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-main font-bold" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-muted" />
                        )}
                      </button>
                    </div>
                  </div>

                  {!isCompact && (
                    <p className="text-[11px] text-muted leading-relaxed mb-4 font-medium italic">
                      "{m.subtitle}"
                    </p>
                  )}

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className={`mt-3 pt-3 border-t border-panel-border/60 ${isCompact ? "space-y-3" : "space-y-5"} animate-in fade-in slide-in-from-top-1.5 duration-200`}>
                      
                      {/* Topper Advice Box */}
                      <div className={`bg-accent/5 border border-accent/15 rounded-lg relative overflow-hidden ${isCompact ? "p-2.5" : "p-4"}`}>
                        <div className="flex items-start gap-2.5">
                          <div className={`rounded-lg bg-accent/10 flex items-center justify-center shrink-0 text-accent ${isCompact ? "w-6 h-6" : "w-8 h-8"}`}>
                            <Sparkles className={`${isCompact ? "w-3 h-3" : "w-4 h-4"}`} />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-bold text-accent uppercase tracking-widest block">
                              Topper Strategy
                            </span>
                            <p className={`${isCompact ? "text-[10px]" : "text-[11px]"} text-main leading-relaxed font-semibold`}>
                              {m.advice}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Subtopics Checklist Container */}
                      <div>
                        <h5 className="text-[9px] font-black text-muted uppercase tracking-widest mb-2 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-accent/80" /> Syllabus Subtopics
                        </h5>

                        <div className={`grid grid-cols-1 ${isCompact ? "" : "sm:grid-cols-2"} gap-3`}>
                          {subtopicsWithState.map((sub) => {
                            const isSubMastered = sub.status === "mastered";
                            const valueAdds = getSubtopicValueAddRecommendation(sub.id);
                            return (
                              <div
                                key={sub.id}
                                onClick={(e) => toggleSubtopicStatus(sub.id, sub.status, e)}
                                className={`flex flex-col justify-between rounded-xl border transition-all cursor-pointer select-none ${isCompact ? "p-2" : "p-4"} ${
                                  isSubMastered
                                    ? "bg-accent/5 border-accent/20 text-main"
                                    : "bg-input hover:bg-input/85 border-panel-border/60 text-muted hover:text-main"
                                }`}
                              >
                                <div className="flex items-start gap-2.5">
                                  <div className="pt-0.5">
                                    {isSubMastered ? (
                                      <motion.div 
                                        initial={{ scale: 0.4 }}
                                        animate={{ scale: [1.5, 0.85, 1.1, 1] }}
                                        transition={{ duration: 0.35 }}
                                        className="w-3.5 h-3.5 bg-accent text-black rounded flex items-center justify-center shadow-sm"
                                      >
                                        <Check className="w-3 h-3 stroke-[3px]" />
                                      </motion.div>
                                    ) : (
                                      <div className="w-3.5 h-3.5 border border-panel-border-hover hover:border-accent rounded bg-app animate-hover" />
                                    )}
                                  </div>
                                  <div className="space-y-1 flex-1">
                                    <span className={`text-[8.5px] font-black uppercase tracking-wider block ${isSubMastered ? "text-accent" : "text-muted"}`}>
                                      {sub.shortTitle}
                                    </span>
                                    <p className={`${isCompact ? "text-[10px] leading-tight" : "text-[11.5px] leading-relaxed"} font-bold text-main`}>
                                      {sub.title}
                                    </p>
                                    
                                    {valueAdds.length > 0 && !isCompact && (
                                      <div className="flex flex-wrap gap-1 pt-1.5 pb-0.5">
                                        {valueAdds.map(rec => (
                                          <span key={rec} className="text-[8.5px] px-2 py-0.5 bg-panel-border/20 text-muted rounded uppercase font-mono tracking-wide font-black">
                                            {rec}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {!isCompact && (
                                  <div className="mt-3.5 pt-2.5 border-t border-panel-border/20 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={(e) => handleLaunchBlueprint(sub, m, e)}
                                      className="w-full flex items-center justify-center gap-1 py-1.5 px-3 bg-accent/10 hover:bg-accent/20 border border-accent/20 hover:border-accent/40 text-accent rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all duration-200"
                                      title="Open this syllabus topic directly in the AI Answer Blueprint designer"
                                    >
                                      <Sparkles className="w-3 h-3 text-accent animate-pulse" />
                                      <span>Outline Practice Blueprint</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Link buttons block */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => onNavigate("pyq")}
                          className="text-[10px] px-2.5 py-1.5 hover:-translate-y-0.5 rounded-lg bg-input hover:brightness-110 border border-panel-border flex items-center gap-1.5 font-black text-main transition-all shadow-sm"
                        >
                          <BookOpen className="w-3 h-3 text-accent" /> PYQs
                        </button>
                        <button
                          onClick={() => onNavigate("notes")}
                          className="text-[10px] px-2.5 py-1.5 hover:-translate-y-0.5 rounded-lg bg-input hover:brightness-110 border border-panel-border flex items-center gap-1.5 font-black text-main transition-all shadow-sm"
                        >
                          <Scale className="w-3 h-3 text-accent" /> Notes
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
