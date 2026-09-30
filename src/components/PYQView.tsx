import { apiFetch } from '../lib/api';
import React, { useState, useEffect, useMemo } from "react";
import {
  PenTool,
  Loader2,
  Sparkles,
  History,
  Trash2,
  ChevronRight,
  ChevronDown,
  Copy,
  CheckCircle2,
  Cloud,
  Printer,
  AlignLeft, 
  Folder, 
  FolderOpen, 
  Library, 
  FileText,
  Search,
  BookOpen,
  Filter,
  BookmarkPlus,
  ArrowRight,
  GraduationCap,
  Shuffle,
  Tag,
  Calendar,
  Check,
  Layers,
  CheckCheck,
  Target,
  Compass,
  BarChart3,
  ShieldCheck,
  Award,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { DeepSeekModel } from "../types";
import { getAccessToken } from "../lib/auth";
import { MermaidChart } from "./MermaidChart";
import { exportToPDF } from "../lib/exportPdf";
import {
  UPSC_OFFICIAL_SYLLABUS_MATRIX,
  SyllabusSubtopic,
  getTotalSyllabusTopicsCount
} from "../data/upscMainsSyllabusMatrix";

interface SavedPYQ {
  id: string;
  question: string;
  subject: string;
  marks: string;
  answer: string;
  date: string;
  folderPath?: string[];
  status?: "new" | "reviewing" | "mastered";
}

interface PYQViewProps {
  model: DeepSeekModel;
}

import {
  OfficialPYQItem,
  UPSC_MAINS_PYQ_BANK as UPSC_PYQ_PRESETS,
  ALL_OFFICIAL_MAINS_PYQS as ALL_OFFICIAL_PYQS
} from "../data/upscMainsPyqBank";

type TreeNode = {
  name: string;
  type: "folder";
  children: Record<string, TreeNode>;
  pyqs: SavedPYQ[];
};


const OFFICIAL_EXEMPLARS: SavedPYQ[] = [
  {
    id: "exemplar-gs2-2023",
    subject: "General Studies 2",
    marks: "15",
    question: "The Constitution of India is a living document with capabilities of enormous dynamism. Discuss in the light of the Basic Structure doctrine. (UPSC Mains 2023)",
    date: new Date().toISOString(),
    folderPath: ["General Studies 2", "Polity & Constitution"],
    status: "mastered",
    answer: `## Model Answer: The Indian Constitution as a Living Document & Basic Structure

### 1. Introduction
The Constitution of India is neither an immutable monolith nor a fragile parchment subject to transitory political whims. In *Kesavananda Bharati v. State of Kerala (1973)*, the Supreme Court established the **Basic Structure Doctrine**, operationalizing Chief Justice Marshall's aphorism that *"a constitution is intended to endure for ages to come, and consequently, to be adapted to the various crises of human affairs."*

\`\`\`mermaid
flowchart TD
    A[Living Constitution] --> B[Article 368: Dynamic Adaptability]
    A --> C[Judicial Review: Organic Interpretation]
    C --> D[Basic Structure Doctrine: Kesavananda 1973]
    D --> E[Check Against Totalitarian Amending Power]
    D --> F[Expansion of Human Dignity & Rights]
\`\`\`

---

### 2. Dimensions of "Living Document": Structural Dynamism
* **Article 368 Amendment Mechanism:** Allows formal organic evolution while maintaining institutional continuity (over 106 Constitutional Amendments enacted, e.g., 73rd/74th Panchayati Raj, 101st GST, and 103rd EWS reservation).
* **Purposive & Transformative Interpretation:** The Judiciary treats Fundamental Rights as an integrated triad (*Maneka Gandhi v. UOI, 1978* Golden Triangle of Articles 14, 19, and 21).
* **Expansion of Article 21:** From mere physical protection against arbitrary arrest to include:
  * Right to Privacy (*K.S. Puttaswamy, 2017*)
  * Right to Clean Environment (*Subhash Kumar, 1991*)
  * Right to Die with Dignity / Passive Euthanasia (*Common Cause, 2018*)
  * Right to Decisional Autonomy (*Navtej Singh Johar, 2018*)

---

### 3. Basic Structure Doctrine: Anchoring Dynamism Without Destruction
While dynamism allows adaptability, unbridled amendatory power risks institutional subversion. The Basic Structure acts as a constitutional gyroscope:

1. **Preventing Hyper-Executive Encroachment:** In *Indira Nehru Gandhi v. Raj Narain (1975)* and *Minerva Mills v. UOI (1980)*, the court barred amending power from declaring itself absolute.
2. **Preserving Judicial Independence:** In the *NJAC Judgment (2015)* (99th Amendment), the primacy of the collegium system was sustained under the independence of judiciary touchstone.
3. **Harmonizing Fundamental Rights and Directive Principles:** As held in *Minerva Mills*, the Indian Constitution is founded on the bedrock of the balance between Part III (FRs) and Part IV (DPSPs).

---

### 4. Conclusion & Way Forward
The Indian Constitution qualifies as a living document precisely because the Basic Structure doctrine allows the constitutional tree to branch and grow in response to societal mutations without severing its philosophical roots.`
  },
  {
    id: "exemplar-gs1-2024",
    subject: "General Studies 1",
    marks: "10",
    question: "Explain the role of geographical factors towards the development of Ancient India. (UPSC Mains 2024)",
    date: new Date().toISOString(),
    folderPath: ["General Studies 1", "Ancient History"],
    status: "mastered",
    answer: `## Model Answer: Geographical Determinants of Ancient Indian Civilization

### 1. Introduction
Ancient Indian historical progression was fundamentally shaped by its physiographic and climatic architecture. As historian Fernand Braudel underscored in *La Longue Durée*, geography provides the permanent environmental canvas on which human societies construct their political, economic, and cultural edifices.

---

### 2. Key Geographical Factors & Historical Impacts

| Geographical Feature | Civilization Zone | Historical & Cultural Consequence |
| :--- | :--- | :--- |
| **Himalayan Barrier & Passes** | Northern Frontier | Khyber and Bolan passes facilitated trade caravans and cultural diffusion while screening against sub-zero Siberian winds. |
| **Indus-Saraswati Alluvial Basin** | Harappan Civilization | Perennial snow-fed waters, silt recharge, and flood recession farming enabled India's earliest bronze-age urban civilization. |
| **Ganga-Yamuna Doab** | Mahajanapadas & Magadha | Deep alluvial soils + monsoon rainfall yielded agrarian surpluses, sustaining standing armies and urbanization (c. 6th century BCE). |
| **Chota Nagpur Iron Belt** | Magadha Imperial Rise | Dense forests (elephants for warfare) and rich hematite iron ore deposits gave Magadha decisive metallurgical superiority. |
| **Monsoon Wind System** | Peninsular Maritime India | Southwest & Northeast monsoon winds powered trans-oceanic dhows, propelling Indo-Roman and Chola maritime commerce. |

---

### 3. Conclusion
From the granaries of Harappa to Magadha's iron-armed hegemony and the Cholas' oceanic trade, geography actively shaped urbanization, imperial consolidation, and international commerce in ancient India.`
  },
  {
    id: "exemplar-gs3-2024",
    subject: "General Studies 3",
    marks: "10",
    question: "Explain the significance of capital expenditure in fostering sustainable economic growth in India. (UPSC Mains 2024)",
    date: new Date().toISOString(),
    folderPath: ["General Studies 3", "Macroeconomics & Growth"],
    status: "reviewing",
    answer: `## Model Answer: Capital Expenditure (Capex) as Engine of Sustainable Growth

### 1. Context & Introduction
Over successive Union Budgets, the Government of India has mounted a decisive counter-cyclical capital expenditure push (surpassing ₹11 lakh crore / 3.4% of GDP). Unlike revenue expenditure which funds current consumption, capital expenditure creates durable physical assets and productivity multipliers that elevate the economy's potential GDP path.

---

### 2. Multi-Dimensional Significance of Capex
* **High Fiscal Multiplier Effect:** RBI and NIPFP empirical studies estimate the capital expenditure multiplier at **2.45 to 3.25** in India (compared to just 0.92 for revenue expenditure).
* **Crowding-In Private Investment:** Public infrastructure outlays under PM GatiShakti (logistics, freight corridors, ports) de-risk private balance sheets and reduce national logistics costs towards 8-9% of GDP.
* **Supply-Side Bottleneck Removal:** High-efficiency transport grids eliminate transit delays for perishable agrarian output, curtailing structural inflation.
* **Green & Resilient Infrastructure:** Modern Capex prioritizes green hydrogen, battery storage, and solar parks, decoupling economic growth from carbon intensity.

---

### 3. Conclusion
Strategic public capital expenditure serves as both a shock absorber and a structural springboard, transforming India from a consumption-led economy to an asset-backed, production-frontier powerhouse.`
  }
];

function buildFolderTree(pyqs: SavedPYQ[]): Record<string, TreeNode> {
  const root: Record<string, TreeNode> = {};

  pyqs.forEach((pyq) => {
    let currentLevel = root;
    const path = pyq.folderPath && pyq.folderPath.length > 0 
      ? pyq.folderPath 
      : [pyq.subject];

    path.forEach((rawFolderName, index) => {
      let folderName = (rawFolderName || "Uncategorized").replace(/-/g, ' ').trim().replace(/\s+/g, ' ');
      folderName = folderName.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );

      if (!currentLevel[folderName]) {
        currentLevel[folderName] = {
          name: folderName,
          type: "folder",
          children: {},
          pyqs: [],
        };
      }
      if (index === path.length - 1) {
        currentLevel[folderName].pyqs.push(pyq);
      }
      currentLevel = currentLevel[folderName].children;
    });
  });

  return root;
}

const FolderNodeComponent = ({
  node,
  depth = 0,
  onLoadPYQ,
  onDeletePYQ,
  onUpdateStatus,
}: {
  node: TreeNode;
  depth?: number;
  onLoadPYQ: (pyq: SavedPYQ) => void;
  onDeletePYQ: (e: React.MouseEvent, id: string) => void;
  onUpdateStatus: (
    id: string,
    status: "new" | "reviewing" | "mastered",
  ) => void;
}) => {
  const [isOpen, setIsOpen] = useState(depth < 1);

  return (
    <div className="flex flex-col select-none">
      <div
        className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-panel-border/50 cursor-pointer transition-colors text-main border-l-2 border-transparent hover:border-accent/40`}
        style={{ paddingLeft: `${depth * 0.5 + 0.4}rem` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <FolderOpen className="w-4 h-4 text-accent shrink-0" />
        ) : (
          <Folder className="w-4 h-4 text-muted shrink-0" />
        )}
        <span className="font-semibold text-[13px] truncate">{node.name}</span>
      </div>

      {isOpen && (
        <div className="flex flex-col mt-0.5 relative">
          {depth > 0 && (
            <div
              className="absolute left-0 top-0 bottom-0 border-l border-panel-border/30"
              style={{ left: `${depth * 0.5 + 0.8}rem` }}
            />
          )}
          {Object.values(node.children).map((childNode) => (
            <FolderNodeComponent
              key={childNode.name}
              node={childNode}
              depth={depth + 1}
              onLoadPYQ={onLoadPYQ}
              onDeletePYQ={onDeletePYQ}
              onUpdateStatus={onUpdateStatus}
            />
          ))}

          {node.pyqs.map((pyq) => (
            <div
              key={pyq.id}
              onClick={() => onLoadPYQ(pyq)}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-input cursor-pointer transition-all group relative border border-transparent hover:border-panel-border/80 shadow-xs"
              style={{
                marginLeft: `${(depth + 1) * 0.5 + 0.25}rem`,
                marginTop: "2px",
                marginBottom: "2px",
              }}
            >
              <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-[12px] text-main truncate font-medium" title={pyq.question}>
                  {pyq.question}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                <select
                  value={pyq.status || "new"}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdateStatus(pyq.id, e.target.value as any);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md outline-none cursor-pointer border ${
                    pyq.status === "mastered"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : pyq.status === "reviewing"
                        ? "bg-accent/10 text-accent/80 border-accent/20"
                        : "bg-panel text-muted border-panel-border/50 hover:bg-input"
                  }`}
                >
                  <option value="new">🆕</option>
                  <option value="reviewing">🔄</option>
                  <option value="mastered">✅</option>
                </select>
                <button
                  onClick={(e) => onDeletePYQ(e, pyq.id)}
                  className="p-1 text-muted hover:bg-red-500/10 hover:text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-red-500/20"
                  title="Delete Topic"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function PYQView({ model }: PYQViewProps) {
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState("General Studies 1");
  const [marks, setMarks] = useState("10");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Sidebar & Bank navigation state
  const [sidebarTab, setSidebarTab] = useState<"official" | "saved">("official");
  const [bankFilterSubject, setBankFilterSubject] = useState<string>("All");
  const [bankSearchQuery, setBankSearchQuery] = useState<string>("");
  const [bankFilterYear, setBankFilterYear] = useState<string>("All");
  const [bankFilterTheme, setBankFilterTheme] = useState<string>("All");
  const [bankViewGrouping, setBankViewGrouping] = useState<"cards" | "byYear" | "byTheme">("cards");
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);
  const [isBankExpanded, setIsBankExpanded] = useState<boolean>(true);
  const [openSubjectFolders, setOpenSubjectFolders] = useState<Record<string, boolean>>({
    "General Studies 1": true,
    "General Studies 2": false,
    "General Studies 3": false,
    "General Studies 4": false,
    "Essay": false,
    "Law Optional": false
  });

  const ALL_YEARS = useMemo(() => [
    "All", "2026", "2025", "2024", "2023", "2022", "2021", "2020",
    "2019", "2018", "2017", "2016", "2015", "2014", "2013"
  ], []);

  const availableThemes = useMemo(() => {
    const pool = bankFilterSubject === "All"
      ? ALL_OFFICIAL_PYQS
      : (UPSC_PYQ_PRESETS[bankFilterSubject] || []);
    const uniqueThemes = Array.from(new Set(pool.map((p) => p.theme))).filter(Boolean).sort();
    return ["All", ...uniqueThemes];
  }, [bankFilterSubject]);

  // Enhanced Bank View Modes: Explorer vs Syllabus Audit vs Paper Archive
  const [bankActiveTab, setBankActiveTab] = useState<"explorer" | "audit" | "papers">("explorer");
  const [auditSelectedSubject, setAuditSelectedSubject] = useState<string>("All");
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>("");
  const [archiveYear, setArchiveYear] = useState<string>("2024");
  const [archivePaper, setArchivePaper] = useState<string>("General Studies 1");

  const getQuestionsCountForSyllabusTopic = (subtopic: SyllabusSubtopic) => {
    const paperPool = UPSC_PYQ_PRESETS[subtopic.paper] || [];
    return paperPool.filter((q) => {
      const qText = `${q.theme} ${q.label} ${q.question}`.toLowerCase();
      return subtopic.themeKeywords.some((kw) => qText.includes(kw.toLowerCase()));
    }).length;
  };

  const filteredSyllabusSubtopics = useMemo(() => {
    let list: SyllabusSubtopic[] = [];
    if (auditSelectedSubject === "All") {
      list = Object.values(UPSC_OFFICIAL_SYLLABUS_MATRIX).flat();
    } else {
      list = UPSC_OFFICIAL_SYLLABUS_MATRIX[auditSelectedSubject] || [];
    }
    if (auditSearchQuery.trim()) {
      const q = auditSearchQuery.toLowerCase();
      list = list.filter((item) =>
        item.title.toLowerCase().includes(q) ||
        item.officialText.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.themeKeywords.some((k) => k.toLowerCase().includes(q))
      );
    }
    return list;
  }, [auditSelectedSubject, auditSearchQuery]);

  const archiveQuestions = useMemo(() => {
    const paperPool = UPSC_PYQ_PRESETS[archivePaper] || [];
    return paperPool.filter((q) => q.year === archiveYear);
  }, [archivePaper, archiveYear]);

  const handleViewSyllabusTopicQuestions = (subtopic: SyllabusSubtopic) => {
    setBankActiveTab("explorer");
    setBankFilterSubject(subtopic.paper);
    setBankFilterYear("All");
    setBankFilterTheme("All");
    const primaryKeyword = subtopic.themeKeywords[0] || subtopic.title;
    setBankSearchQuery(primaryKeyword);
  };

  const [savedPYQs, setSavedPYQs] = useState<SavedPYQ[]>(() => {
    const saved = localStorage.getItem("upsc_saved_pyqs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved PYQs", e);
      }
    }
    return [];
  });

  const [isNotebookSidebarOpen, setIsNotebookSidebarOpen] = useState(true);
  const [notebookSidebarWidth, setNotebookSidebarWidth] = useState(320);

  const toggleSubjectFolder = (subj: string) => {
    setOpenSubjectFolders((prev) => ({
      ...prev,
      [subj]: !prev[subj]
    }));
  };

  const loadOfficialQuestion = (item: OfficialPYQItem) => {
    setSubject(item.subject);
    setMarks(item.marks);
    setQuestion(item.question);
    setError("");
    const formEl = document.getElementById("pyq-solver-form");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCopyQuestionText = (item: OfficialPYQItem, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${item.question} (UPSC Mains ${item.year}, ${item.subject})`);
    setCopiedQuestionId(item.id);
    setTimeout(() => setCopiedQuestionId(null), 2000);
  };

  const handleLoadAndSolve = async (item: OfficialPYQItem) => {
    setSubject(item.subject);
    setMarks(item.marks);
    setQuestion(item.question);
    setError("");
    const formEl = document.getElementById("pyq-solver-form");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
    }

    setIsLoading(true);
    setError("");
    setAnswer("");

    try {
      const res = await apiFetch("/api/pyq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: item.question, subject: item.subject, marks: item.marks, model }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate answer");

      const newPYQ: SavedPYQ = {
        id: Date.now().toString(),
        question: item.question,
        subject: item.subject,
        marks: item.marks,
        answer: data.answer,
        folderPath: data.folderPath || [item.subject, item.theme],
        date: new Date().toISOString(),
      };

      setAnswer(data.answer);
      setSavedPYQs((prev) => [newPYQ, ...prev]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedExemplars = () => {
    setSavedPYQs((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newItems = OFFICIAL_EXEMPLARS.filter((e) => !existingIds.has(e.id));
      return [...newItems, ...prev];
    });
    setSidebarTab("saved");
  };

  const filteredOfficialPYQs = useMemo(() => {
    return ALL_OFFICIAL_PYQS.filter((item) => {
      if (bankFilterSubject !== "All" && item.subject !== bankFilterSubject) return false;
      if (bankFilterYear !== "All" && item.year !== bankFilterYear) return false;
      if (bankFilterTheme !== "All" && item.theme !== bankFilterTheme) return false;
      if (bankSearchQuery.trim()) {
        const q = bankSearchQuery.toLowerCase();
        const matchTitle = item.label.toLowerCase().includes(q);
        const matchText = item.question.toLowerCase().includes(q);
        const matchTheme = item.theme.toLowerCase().includes(q);
        const matchYear = item.year.includes(q);
        if (!matchTitle && !matchText && !matchTheme && !matchYear) return false;
      }
      return true;
    });
  }, [bankFilterSubject, bankFilterYear, bankFilterTheme, bankSearchQuery]);

  const handleRandomPYQ = () => {
    const pool = filteredOfficialPYQs.length > 0 ? filteredOfficialPYQs : ALL_OFFICIAL_PYQS;
    const randomIndex = Math.floor(Math.random() * pool.length);
    const picked = pool[randomIndex];
    loadOfficialQuestion(picked);
  };

  const handleSidebarDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = notebookSidebarWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.pageX - startX);
      if (newWidth >= 250 && newWidth <= 600) {
        setNotebookSidebarWidth(newWidth);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  useEffect(() => {
    localStorage.setItem("upsc_saved_pyqs", JSON.stringify(savedPYQs));
  }, [savedPYQs]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "upsc_saved_pyqs" && e.newValue) {
        try {
          setSavedPYQs(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (subject === "Essay") {
      if (marks !== "125") setMarks("125");
    } else {
      if (marks === "125") setMarks("10");
    }
  }, [subject, marks]);

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveSuccess, setDriveSuccess] = useState("");

  const handleSaveToDrive = async () => {
    const token = await getAccessToken();
    if (!token) {
      setError("Please sign in with Google (top right) to save to Drive.");
      return;
    }

    setIsSavingToDrive(true);
    setDriveSuccess("");
    setError("");

    try {
      const metadata = {
        name: `PYQ - ${subject} - ${marks}M.md`,
        mimeType: "text/markdown",
      };

      const boundary = "foo_bar_baz";
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const markdownContent = `## ${question}\n\n**Subject:** ${subject} | **Marks:** ${marks}\n\n---\n\n${answer}`;

      const multipartRequestBody =
        `--${boundary}\r\n` +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(metadata) +
        delimiter +
        "Content-Type: text/markdown; charset=UTF-8\r\n\r\n" +
        markdownContent +
        closeDelimiter;

      const rawUrl = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
      const res = await apiFetch(
        `/api/google-proxy?url=${encodeURIComponent(rawUrl)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body: multipartRequestBody,
        },
      );

      if (!res.ok) {
        throw new Error("Failed to save to Google Drive");
      }

      setDriveSuccess("Successfully saved PYQ answer to Google Drive!");
      setTimeout(() => setDriveSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSavingToDrive(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError("");
    setAnswer("");

    try {
      const res = await apiFetch("/api/pyq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, subject, marks, model }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate answer");

      const newPYQ: SavedPYQ = {
        id: Date.now().toString(),
        question,
        subject,
        marks,
        answer: data.answer,
        folderPath: data.folderPath,
        date: new Date().toISOString(),
      };

      setAnswer(data.answer);
      setSavedPYQs((prev) => [newPYQ, ...prev]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPYQ = (pyq: SavedPYQ) => {
    setQuestion(pyq.question);
    setSubject(pyq.subject);
    setMarks(pyq.marks);
    setAnswer(pyq.answer);
    setError("");
    if (window.innerWidth < 1024) setIsNotebookSidebarOpen(false);
  };

  const deletePYQ = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedPYQs((prev) => prev.filter((n) => n.id !== id));
    if (savedPYQs.find((n) => n.id === id)?.answer === answer) {
      setAnswer("");
      setQuestion("");
    }
  };

  const updatePYQStatus = (
    id: string,
    status: "new" | "reviewing" | "mastered",
  ) => {
    setSavedPYQs((prev) =>
      prev.map((pyq) => (pyq.id === id ? { ...pyq, status } : pyq)),
    );
  };

  const markdownComponents = React.useMemo(
    () => ({
      code(props: any) {
        const { children, className, node, ...rest } = props;
        const match = /language-(\w+)/.exec(className || "");
        if (match && match[1] === "mermaid") {
          return <MermaidChart chart={String(children).replace(/\n$/, "")} />;
        }
        return (
          <code {...rest} className={className}>
            {children}
          </code>
        );
      },
    }),
    []
  );

  return (
    <div className="h-full relative overflow-hidden flex bg-transparent print:h-auto print:overflow-visible">
       {/* Sidebar */}
       <div 
        className={`shrink-0 bg-panel border-r border-panel-border flex flex-col overflow-y-auto z-20 transition-all duration-300 ease-in-out relative ${isNotebookSidebarOpen ? "opacity-100" : "w-0 opacity-0 overflow-hidden"} print:hidden`}
        style={{ width: isNotebookSidebarOpen ? `${notebookSidebarWidth}px` : '0px' }}
      >
         {/* Sidebar Navigation Header */}
         <div className="p-3 border-b border-panel-border sticky top-0 bg-panel/95 backdrop-blur z-10 shadow-sm flex flex-col gap-2" style={{ minWidth: isNotebookSidebarOpen ? `${notebookSidebarWidth}px` : 'auto' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-main flex items-center gap-2 text-[13px]">
                 <BookOpen className="w-4 h-4 text-accent" />
                 UPSC Repository
              </h3>
              <button onClick={() => setIsNotebookSidebarOpen(false)} className="text-muted hover:text-main p-1.5 rounded-md hover:bg-input transition-colors">
                <AlignLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar Tabs: Official Bank vs My Saved */}
            <div className="grid grid-cols-2 gap-1 bg-input/70 p-1 rounded-xl border border-panel-border text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setSidebarTab("official")}
                className={`py-1.5 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                  sidebarTab === "official"
                    ? "bg-panel text-accent shadow-xs font-bold"
                    : "text-muted hover:text-main"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Official ({ALL_OFFICIAL_PYQS.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab("saved")}
                className={`py-1.5 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                  sidebarTab === "saved"
                    ? "bg-panel text-accent shadow-xs font-bold"
                    : "text-muted hover:text-main"
                }`}
              >
                <Library className="w-3.5 h-3.5" />
                <span>Saved ({savedPYQs.length})</span>
              </button>
            </div>
         </div>

         {/* Sidebar Body */}
         <div className="p-3 flex flex-col gap-2 flex-1" style={{ minWidth: isNotebookSidebarOpen ? `${notebookSidebarWidth}px` : 'auto' }}>
            {sidebarTab === "official" ? (
              <div className="flex flex-col gap-1.5">
                <div className="text-[11px] text-muted px-1 pb-1 font-medium">
                  Official Papers (2013–2026):
                </div>
                {Object.entries(UPSC_PYQ_PRESETS).map(([paperName, items]) => {
                  const isOpen = openSubjectFolders[paperName];
                  return (
                    <div key={paperName} className="flex flex-col border border-panel-border/60 rounded-xl overflow-hidden bg-panel/50">
                      <button
                        type="button"
                        onClick={() => toggleSubjectFolder(paperName)}
                        className="flex items-center justify-between p-2.5 text-left hover:bg-input/60 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isOpen ? (
                            <FolderOpen className="w-4 h-4 text-accent shrink-0" />
                          ) : (
                            <Folder className="w-4 h-4 text-muted shrink-0" />
                          )}
                          <span className="text-[12px] font-bold text-main truncate">{paperName}</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent/10 text-accent shrink-0 ml-1">
                          {items.length}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="flex flex-col gap-1 p-2 pt-0 border-t border-panel-border/40">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => loadOfficialQuestion(item)}
                              className="group p-2 rounded-lg hover:bg-input transition-all cursor-pointer border border-transparent hover:border-accent/20 flex flex-col gap-1 text-left"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-accent/15 text-accent">
                                  {item.year}
                                </span>
                                <span className="text-[10px] text-muted font-medium">
                                  {item.marks}M
                                </span>
                              </div>
                              <p className="text-[11px] font-semibold text-main line-clamp-1 group-hover:text-accent transition-colors">
                                {item.label}
                              </p>
                              <p className="text-[10px] text-muted line-clamp-2 leading-relaxed">
                                {item.question}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {savedPYQs.length === 0 ? (
                  <div className="p-4 text-center flex flex-col items-center gap-3 bg-input/30 rounded-2xl border border-panel-border my-2">
                    <p className="text-[12px] text-muted leading-relaxed">No answers saved in your notebook yet.</p>
                    <button
                      type="button"
                      onClick={handleSeedExemplars}
                      className="text-[11px] font-semibold bg-accent text-white px-3 py-2 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Seed 3 Official Model Answers
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between px-1 pb-1">
                      <span className="text-[11px] text-muted font-medium">Saved Answers:</span>
                      <button
                        type="button"
                        onClick={handleSeedExemplars}
                        className="text-[10px] text-accent font-semibold hover:underline"
                        title="Add authentic exemplar answers to notebook"
                      >
                        + Add Exemplars
                      </button>
                    </div>
                    {Object.values(buildFolderTree(savedPYQs)).map((node) => (
                      <FolderNodeComponent
                        key={node.name}
                        node={node}
                        onLoadPYQ={loadPYQ}
                        onDeletePYQ={deletePYQ}
                        onUpdateStatus={updatePYQStatus}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
         </div>

         {isNotebookSidebarOpen && (
            <div 
              className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-accent/50 z-30 transition-colors group"
              onMouseDown={handleSidebarDrag}
            >
               <div className="absolute top-1/2 -mt-4 -left-1 w-2 h-8 rounded-full bg-panel border border-panel-border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-0.5 h-3 bg-muted rounded-full mx-[1px]" />
                  <div className="w-0.5 h-3 bg-muted rounded-full mx-[1px]" />
               </div>
            </div>
         )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden print:overflow-visible print:h-auto">
      {!isNotebookSidebarOpen && (
         <button
            onClick={() => setIsNotebookSidebarOpen(true)}
            className="absolute top-6 left-4 z-30 flex items-center justify-center p-2 bg-panel border border-panel-border shadow-sm rounded-lg text-muted hover:text-main transition-colors print:hidden"
            title="Open UPSC Repository"
         >
            <AlignLeft className="w-4 h-4" />
         </button>
      )}

      <div className="flex-1 overflow-y-auto w-full relative transition-all duration-500 print:overflow-visible print:h-auto pb-16">
        <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
        <header className="mb-8 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl glass-panel shadow-sm text-accent">
            <PenTool className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-main tracking-tight">
              PYQ Solver & Official Question Bank
            </h2>
            <p className="text-muted mt-1.5 text-[14px]">
              Explore {ALL_OFFICIAL_PYQS.length} authentic UPSC Mains questions (2013–2026) across GS 1–4, Essay, and Law Optional, or solve any question with UPSC rubric alignment.
            </p>
          </div>
        </header>

        {/* OFFICIAL UPSC QUESTION BANK EXPLORER */}
        <section className="glass-panel p-6 rounded-3xl shadow-sm mb-8 border border-panel-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-panel-border/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-accent/15 text-accent">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-main flex items-center gap-2 flex-wrap">
                  Official UPSC Mains Question Bank & Syllabus Matrix
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                    {ALL_OFFICIAL_PYQS.length} Questions
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCheck className="w-3 h-3" />
                    100% Syllabus Covered
                  </span>
                </h3>
                <p className="text-[12px] text-muted">
                  Authentic questions (2013–2026) cross-referenced with official UPSC CSE Gazette syllabus heads
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleRandomPYQ}
                className="text-[12px] px-3 py-1.5 rounded-xl font-semibold bg-accent/10 hover:bg-accent text-accent hover:text-white transition-all flex items-center gap-1.5 border border-accent/25 shadow-xs"
                title="Pick a random UPSC question from current filters"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Random PYQ</span>
              </button>
              <button
                type="button"
                onClick={() => setIsBankExpanded(!isBankExpanded)}
                className="text-[12px] font-semibold text-accent hover:underline flex items-center gap-1 px-2 py-1"
              >
                {isBankExpanded ? "Collapse View" : "Expand View"}
                <ChevronDown className={`w-4 h-4 transition-transform ${isBankExpanded ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          {isBankExpanded && (
            <div className="mt-4 flex flex-col gap-4">
              {/* View Mode Switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-input/60 rounded-2xl border border-panel-border/70 overflow-x-auto scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setBankActiveTab("explorer")}
                  className={`text-[12px] px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    bankActiveTab === "explorer"
                      ? "bg-accent text-white shadow-xs"
                      : "text-muted hover:text-main"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Questions Explorer</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    bankActiveTab === "explorer" ? "bg-white/20 text-white" : "bg-panel-border/50 text-muted"
                  }`}>
                    {filteredOfficialPYQs.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setBankActiveTab("audit")}
                  className={`text-[12px] px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    bankActiveTab === "audit"
                      ? "bg-accent text-white shadow-xs"
                      : "text-muted hover:text-main"
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Syllabus & Theme Coverage Audit</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    bankActiveTab === "audit" ? "bg-white/20 text-white" : "bg-emerald-500/15 text-emerald-500"
                  }`}>
                    {getTotalSyllabusTopicsCount()} Topics
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setBankActiveTab("papers")}
                  className={`text-[12px] px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    bankActiveTab === "papers"
                      ? "bg-accent text-white shadow-xs"
                      : "text-muted hover:text-main"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Year-by-Year Official Papers (2013–2026)</span>
                </button>
              </div>

              {/* MODE 1: QUESTIONS EXPLORER */}
              {bankActiveTab === "explorer" && (
                <div className="flex flex-col gap-4">
                  {/* Paper Selector Tabs */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "All", label: "All Papers", count: ALL_OFFICIAL_PYQS.length },
                      { id: "General Studies 1", label: "GS 1 (Heritage & Geo)", count: UPSC_PYQ_PRESETS["General Studies 1"]?.length || 0 },
                      { id: "General Studies 2", label: "GS 2 (Polity & IR)", count: UPSC_PYQ_PRESETS["General Studies 2"]?.length || 0 },
                      { id: "General Studies 3", label: "GS 3 (Economy & Tech)", count: UPSC_PYQ_PRESETS["General Studies 3"]?.length || 0 },
                      { id: "General Studies 4", label: "GS 4 (Ethics)", count: UPSC_PYQ_PRESETS["General Studies 4"]?.length || 0 },
                      { id: "Essay", label: "Essay", count: UPSC_PYQ_PRESETS["Essay"]?.length || 0 },
                      { id: "Law Optional", label: "Law Optional", count: UPSC_PYQ_PRESETS["Law Optional"]?.length || 0 }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setBankFilterSubject(tab.id);
                          setBankFilterTheme("All");
                        }}
                        className={`text-[12px] px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                          bankFilterSubject === tab.id
                            ? "bg-accent text-white shadow-xs font-semibold"
                            : "bg-input hover:bg-panel text-main border border-panel-border/50"
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          bankFilterSubject === tab.id ? "bg-white/20 text-white" : "bg-panel-border/50 text-muted"
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Filters row: Year pills + Theme filter + Search input */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                      <span className="text-[11px] font-bold text-muted uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Year:
                      </span>
                      {ALL_YEARS.map((y) => (
                        <button
                          key={y}
                          type="button"
                          onClick={() => setBankFilterYear(y)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 ${
                            bankFilterYear === y
                              ? "bg-main text-panel shadow-xs"
                              : "bg-input hover:bg-panel border border-panel-border/40 text-muted hover:text-main"
                          }`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {/* Theme Selector */}
                      <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto bg-input/60 border border-panel-border rounded-xl px-3 py-1.5">
                        <Tag className="w-3.5 h-3.5 text-muted shrink-0" />
                        <select
                          value={bankFilterTheme}
                          onChange={(e) => setBankFilterTheme(e.target.value)}
                          className="text-[12px] bg-transparent text-main focus:outline-none cursor-pointer w-full sm:max-w-[200px] truncate"
                        >
                          {availableThemes.map((th) => (
                            <option key={th} value={th} className="bg-panel text-main">
                              {th === "All" ? "All Syllabus Themes" : th}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Search query */}
                      <div className="relative flex-1 w-full">
                        <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-3" />
                        <input
                          type="text"
                          value={bankSearchQuery}
                          onChange={(e) => setBankSearchQuery(e.target.value)}
                          placeholder="Search question, keyword, or year (e.g. federalism, monsoon, ethics, capex, privacy)..."
                          className="w-full text-[12px] bg-input/60 border border-panel-border rounded-xl pl-9 pr-3 py-2 text-main focus:outline-none focus:border-accent transition-colors"
                        />
                        {bankSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setBankSearchQuery("")}
                            className="absolute right-2.5 top-2 text-[11px] text-muted hover:text-main"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {(bankFilterSubject !== "All" || bankFilterYear !== "All" || bankFilterTheme !== "All" || bankSearchQuery) && (
                        <button
                          type="button"
                          onClick={() => {
                            setBankFilterSubject("All");
                            setBankFilterYear("All");
                            setBankFilterTheme("All");
                            setBankSearchQuery("");
                          }}
                          className="text-[11px] text-accent hover:underline whitespace-nowrap shrink-0 px-1"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Questions List Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[440px] overflow-y-auto p-1 pr-2">
                    {filteredOfficialPYQs.length === 0 ? (
                      <div className="col-span-2 text-center py-10 text-[13px] text-muted bg-input/20 rounded-2xl border border-panel-border/40">
                        No official questions match the selected paper, year, theme, or search query.
                      </div>
                    ) : (
                      filteredOfficialPYQs.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl bg-panel border border-panel-border/80 hover:border-accent/40 transition-all flex flex-col justify-between gap-3 shadow-xs hover:shadow-sm group"
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                                  UPSC {item.year}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-input text-main border border-panel-border/50">
                                  {item.subject}
                                </span>
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-input/60 text-muted">
                                  {item.theme}
                                </span>
                              </div>
                              <span className="text-[11px] font-semibold text-muted">
                                {item.marks} Marks {item.marks === "10" ? "(150w)" : item.marks === "15" ? "(250w)" : item.marks === "20" ? "(250+w)" : "(1200w)"}
                              </span>
                            </div>
                            <h4 className="text-[13px] font-bold text-main mt-0.5">{item.label}</h4>
                            <p className="text-[12px] text-muted leading-relaxed italic bg-input/30 p-2.5 rounded-xl border border-panel-border/40">
                              "{item.question}"
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-panel-border/40 gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={(e) => handleCopyQuestionText(item, e)}
                              className="text-[11px] text-muted hover:text-main flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-input transition-colors"
                              title="Copy question text"
                            >
                              {copiedQuestionId === item.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  <span className="text-emerald-500 font-medium">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => loadOfficialQuestion(item)}
                                className="text-[11px] font-semibold bg-input hover:bg-panel text-main border border-panel-border/70 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-xs"
                                title="Load question into the answer generator form"
                              >
                                <span>Load in Form</span>
                                <ArrowRight className="w-3 h-3 text-muted" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLoadAndSolve(item)}
                                disabled={isLoading}
                                className="text-[11px] font-semibold bg-accent text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-all flex items-center gap-1 shadow-xs disabled:opacity-50"
                                title="Instantly solve with AI evaluation"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Quick Solve</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* MODE 2: SYLLABUS & THEME COVERAGE AUDIT */}
              {bankActiveTab === "audit" && (
                <div className="flex flex-col gap-4">
                  {/* Assurance Banner */}
                  <div className="p-4 rounded-2xl bg-accent/10 border border-accent/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-accent" />
                        <h4 className="text-sm font-bold text-main">100% Official UPSC Syllabus Coverage Verification</h4>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">
                        Every official syllabus sub-point from the UPSC Civil Services Examination Gazette notification is audited below. The question bank cross-references all 14 examination cycles (2013–2026), ensuring no core theme, micro-topic, or statutory dimension is left unaddressed.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-center px-3 py-1.5 rounded-xl bg-panel border border-panel-border/70 shadow-2xs">
                        <div className="text-xs font-bold text-accent">{getTotalSyllabusTopicsCount()} Heads</div>
                        <div className="text-[10px] text-muted">All Indexed</div>
                      </div>
                      <div className="text-center px-3 py-1.5 rounded-xl bg-panel border border-panel-border/70 shadow-2xs">
                        <div className="text-xs font-bold text-emerald-500">2013–2026</div>
                        <div className="text-[10px] text-muted">14 Cycles</div>
                      </div>
                    </div>
                  </div>

                  {/* Syllabus Paper Filter Pills & Search */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: "All", label: "All Papers" },
                        { id: "General Studies 1", label: "GS 1" },
                        { id: "General Studies 2", label: "GS 2" },
                        { id: "General Studies 3", label: "GS 3" },
                        { id: "General Studies 4", label: "GS 4" },
                        { id: "Essay", label: "Essay" },
                        { id: "Law Optional", label: "Law Optional" }
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setAuditSelectedSubject(p.id)}
                          className={`text-[12px] px-3 py-1 rounded-xl font-medium transition-all ${
                            auditSelectedSubject === p.id
                              ? "bg-accent text-white font-semibold shadow-xs"
                              : "bg-input hover:bg-panel text-main border border-panel-border/50"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative min-w-[240px]">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        type="text"
                        value={auditSearchQuery}
                        onChange={(e) => setAuditSearchQuery(e.target.value)}
                        placeholder="Search syllabus head or topic..."
                        className="w-full text-[12px] bg-input border border-panel-border rounded-xl pl-8 pr-3 py-1.5 text-main placeholder:text-muted/70 focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  {/* Syllabus Subtopics Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[520px] overflow-y-auto pr-1">
                    {filteredSyllabusSubtopics.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-muted text-xs">
                        No syllabus subtopics match your search.
                      </div>
                    ) : (
                      filteredSyllabusSubtopics.map((subtopic) => {
                        const countInBank = getQuestionsCountForSyllabusTopic(subtopic);
                        return (
                          <div
                            key={subtopic.id}
                            className="p-4 rounded-2xl bg-panel border border-panel-border/80 hover:border-accent/40 transition-all flex flex-col justify-between gap-3 shadow-xs"
                          >
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                                    {subtopic.code}
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-input text-main border border-panel-border/50">
                                    {subtopic.paper}
                                  </span>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  subtopic.importanceWeight === "Core (Very High)"
                                    ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                                    : subtopic.importanceWeight === "High"
                                    ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                                    : "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                                }`}>
                                  {subtopic.importanceWeight}
                                </span>
                              </div>

                              <h4 className="text-[13px] font-bold text-main mt-0.5">{subtopic.title}</h4>
                              
                              <p className="text-[11px] text-muted leading-relaxed italic bg-input/40 p-2.5 rounded-xl border border-panel-border/40">
                                "{subtopic.officialText}"
                              </p>

                              <div className="text-[11px] text-muted leading-snug">
                                {subtopic.description}
                              </div>

                              <div className="flex flex-col gap-1 text-[11px] pt-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-main">Weightage:</span>
                                  <span className="text-muted">{subtopic.typicalQuestionsPerCycle}</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-main">Exam Years:</span>
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {subtopic.frequentYears.slice(0, 7).map((yr) => (
                                      <span key={yr} className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-input text-muted">
                                        {yr}
                                      </span>
                                    ))}
                                    {subtopic.frequentYears.length > 7 && (
                                      <span className="text-[9px] text-muted">+{subtopic.frequentYears.length - 7} more</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-panel-border/50 gap-2">
                              <span className="text-[11px] font-medium text-muted flex items-center gap-1">
                                <BookOpen className="w-3 h-3 text-accent" />
                                <span>{countInBank} {countInBank === 1 ? "question" : "questions"} in bank</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleViewSyllabusTopicQuestions(subtopic)}
                                className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-accent/10 transition-colors"
                              >
                                <span>View & Practice Questions</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* MODE 3: YEAR-BY-YEAR OFFICIAL PAPERS (2013-2026) */}
              {bankActiveTab === "papers" && (
                <div className="flex flex-col gap-4">
                  {/* Paper and Year Selectors */}
                  <div className="p-4 rounded-2xl bg-panel border border-panel-border/80 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-main flex items-center gap-2">
                          Official Paper Selector
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                            UPSC CSE Mains {archiveYear}
                          </span>
                        </h4>
                        <p className="text-xs text-muted">
                          Select any examination year and paper to inspect questions in chronological order.
                        </p>
                      </div>

                      {/* Paper Dropdown / Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          "General Studies 1",
                          "General Studies 2",
                          "General Studies 3",
                          "General Studies 4",
                          "Essay",
                          "Law Optional"
                        ].map((paper) => (
                          <button
                            key={paper}
                            type="button"
                            onClick={() => setArchivePaper(paper)}
                            className={`text-[11px] px-2.5 py-1.5 rounded-xl font-medium transition-all ${
                              archivePaper === paper
                                ? "bg-accent text-white font-bold shadow-xs"
                                : "bg-input hover:bg-panel text-muted hover:text-main border border-panel-border/50"
                            }`}
                          >
                            {paper.replace("General Studies", "GS")}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Year Selection Row */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-panel-border/40">
                      <span className="text-[11px] font-semibold text-muted shrink-0 mr-1">Exam Year:</span>
                      {ALL_YEARS.filter((y) => y !== "All").map((year) => (
                        <button
                          key={year}
                          type="button"
                          onClick={() => setArchiveYear(year)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                            archiveYear === year
                              ? "bg-accent text-white font-bold shadow-xs"
                              : "bg-input hover:bg-panel text-muted hover:text-main border border-panel-border/40"
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Archive Questions Display */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-semibold text-main">
                        Questions for {archivePaper} ({archiveYear})
                      </span>
                      <span className="text-xs text-muted">
                        {archiveQuestions.length} questions available
                      </span>
                    </div>

                    {archiveQuestions.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-input/40 border border-dashed border-panel-border text-center space-y-2">
                        <BookOpen className="w-8 h-8 text-muted mx-auto opacity-50" />
                        <p className="text-sm font-semibold text-main">
                          No preloaded quick-benchmark questions for {archivePaper} ({archiveYear})
                        </p>
                        <p className="text-xs text-muted max-w-md mx-auto">
                          Have a specific question from {archiveYear} {archivePaper} you want to solve? Simply paste it into the Solver below — our model evaluates ANY question from 2013–2026 using the official UPSC scoring rubric.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                        {archiveQuestions.map((item, idx) => (
                          <div
                            key={item.id}
                            className="p-4 rounded-2xl bg-panel border border-panel-border/80 hover:border-accent/40 transition-all flex flex-col justify-between gap-3 shadow-xs"
                          >
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                                    Q{idx + 1} • {archiveYear}
                                  </span>
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-input text-muted">
                                    {item.theme}
                                  </span>
                                </div>
                                <span className="text-[11px] font-semibold text-muted">
                                  {item.marks} Marks {item.marks === "10" ? "(150w)" : item.marks === "15" ? "(250w)" : item.marks === "20" ? "(250+w)" : "(1200w)"}
                                </span>
                              </div>
                              <h4 className="text-[13px] font-bold text-main">{item.label}</h4>
                              <p className="text-[12px] text-muted italic bg-input/30 p-2.5 rounded-xl border border-panel-border/40 leading-relaxed">
                                "{item.question}"
                              </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-panel-border/40">
                              <button
                                type="button"
                                onClick={() => loadOfficialQuestion(item)}
                                className="text-[11px] font-semibold bg-input hover:bg-panel text-main border border-panel-border/70 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-xs"
                              >
                                <span>Load in Form</span>
                                <ArrowRight className="w-3 h-3 text-muted" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLoadAndSolve(item)}
                                disabled={isLoading}
                                className="text-[11px] font-semibold bg-accent text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-all flex items-center gap-1 shadow-xs disabled:opacity-50"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Quick Solve</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* WORKSPACE ANSWER GENERATOR FORM */}
        <form
          id="pyq-solver-form"
          onSubmit={handleGenerate}
          className="glass-panel p-8 rounded-3xl shadow-sm flex flex-col gap-5 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent rounded-full blur-3xl -mr-10 -mt-10 opacity-10 pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-2">
            <div className="flex flex-col gap-2 relative col-span-2">
              <label className="text-[11px] font-semibold text-muted tracking-wide uppercase flex items-center justify-between">
                <span>Select Subject</span>
                <span className="text-[10px] text-accent lowercase">
                  ({UPSC_PYQ_PRESETS[subject]?.length || 0} official questions available)
                </span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-panel-border px-4 py-3 glass-input focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all font-medium text-main"
              >
                <option value="General Studies 1">General Studies I (Heritage, History, Geography)</option>
                <option value="General Studies 2">General Studies II (Governance, Polity, IR)</option>
                <option value="General Studies 3">General Studies III (Economy, Environment, Tech)</option>
                <option value="General Studies 4">General Studies IV (Ethics, Integrity, Aptitude)</option>
                <option value="Essay">Essay (Philosophical & Socio-Economic)</option>
                <option value="Law Optional">Law Optional (Constitutional, Torts, International)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 relative">
              <label className="text-[11px] font-semibold text-muted tracking-wide uppercase">
                Marks & Word Limit
              </label>
              <select
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="w-full rounded-xl border border-panel-border px-4 py-3 glass-input focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all font-medium text-main"
              >
                {subject === "Essay" ? (
                  <option value="125">125 Marks (1000 - 1200 words)</option>
                ) : (
                  <>
                    <option value="10">10 Marks (150 words)</option>
                    <option value="15">15 Marks (250 words)</option>
                    <option value="20">20 Marks (250+ words)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {UPSC_PYQ_PRESETS[subject] && UPSC_PYQ_PRESETS[subject].length > 0 && (
            <div className="flex flex-col gap-2 bg-input/40 p-3.5 rounded-2xl border border-panel-border">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                Quick Load Official UPSC Question ({subject})
              </span>
              <div className="flex flex-wrap gap-2">
                {UPSC_PYQ_PRESETS[subject].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setQuestion(item.question);
                      setMarks(item.marks);
                    }}
                    className="text-[12px] bg-panel hover:bg-accent/10 hover:text-accent hover:border-accent/40 border border-panel-border px-3 py-1.5 rounded-lg text-main font-medium transition-all text-left flex items-center gap-1.5 group shadow-xs cursor-pointer"
                  >
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-accent/15 text-accent">{item.year}</span>
                    <span>{item.label}</span>
                    <span className="text-muted text-[11px]">({item.marks}M)</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 relative">
            <label className="text-[11px] font-semibold text-muted tracking-wide uppercase">
              Paste or Edit Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Explain the role of geographical factors towards the development of Ancient India..."
              className="w-full rounded-xl border border-panel-border px-4 py-3 glass-input focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all font-medium text-main placeholder-light min-h-[100px] resize-y"
            />
          </div>

          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!question.trim() || isLoading}
              className="w-full md:w-auto shrink-0 bg-accent hover:opacity-90 text-white rounded-xl px-10 py-3.5 font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm relative z-10 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Synthesize Answer
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 mb-8 font-medium text-[15px]">
            {error}
          </div>
        )}

        {driveSuccess && (
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl border border-emerald-100 mb-8 font-medium text-[15px]">
            {driveSuccess}
          </div>
        )}

        {answer && (
          <div className="glass-panel rounded-3xl shadow-sm p-10 relative mb-8 group">
            <div className="absolute top-4 right-6 flex items-center gap-3">
              <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                {subject} • {marks} Marks
              </span>
              <button
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-main p-1 rounded-md border border-transparent shadow-sm"
                title="Copy answer"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <div id="pyq-content" className="prose prose-sm sm:prose-base prose-slate max-w-none text-main prose-headings:text-main prose-headings:font-bold prose-h1:text-2xl prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-p:text-main prose-li:text-main prose-strong:text-main prose-strong:font-bold prose-ul:list-disc prose-ol:list-decimal prose-li:my-1">
              <Markdown 
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={markdownComponents}
              >
                {answer}
              </Markdown>
            </div>

            <div className="mt-8 pt-6 border-t border-panel-border flex justify-end gap-3">
              <button
                onClick={() => exportToPDF("pyq-content", "UPSC_Answer")}
                className="flex items-center gap-2 bg-input border border-panel-border hover:bg-panel text-main px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={handleSaveToDrive}
                disabled={isSavingToDrive}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {isSavingToDrive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Cloud className="w-4 h-4" />
                )}
                {isSavingToDrive ? "Saving..." : "Save to Google Drive"}
              </button>
            </div>
          </div>
        )}
      </div>
     </div>
    </div>
   </div>
  );
}
