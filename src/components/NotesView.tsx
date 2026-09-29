import { apiFetch } from '../lib/api';
import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Loader2,
  Sparkles,
  History,
  Trash2,
  ChevronRight,
  Copy,
  CheckCircle2,
  Folder,
  FolderOpen,
  FileText,
  Component,
  Cloud,
  Printer,
  Highlighter,
  MessageSquare,
  MessageSquarePlus,
  X,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  AlignLeft,
  Link as LinkIcon,
  Library,
  Camera,
  GripVertical,
  Pin,
  ArrowLeftRight,
  Search
} from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { DeepSeekModel } from "../types";
import { exportToPDF } from "../lib/exportPdf";
import { getAccessToken } from "../lib/auth";
import { safeLocalStorageGet, safeLocalStorageSet } from "../lib/storage";
import { MermaidChart } from "./MermaidChart";
import * as d3 from "d3";
import { Network } from "lucide-react";

interface SavedNote {
  id: string;
  topic: string;
  subject: string;
  content: string;
  date: string;
  folderPath?: string[];
  status?: "new" | "reviewing" | "mastered";
}

interface NotesViewProps {
  model: DeepSeekModel;
}

export function cleanLeakedNoteJson(text: string): string {
  if (!text) return "";
  let res = text;
  // Clean stray JSON syntax leaks like: ' } ], "mermaid_diagram": "```mermaid' or '", "mermaid_diagram": "'
  res = res.replace(/["'}\]\s]*,\s*["']?(?:mermaid_diagram|mermaidCode|comparisonTable)["']?\s*:\s*["']?(```mermaid)?/gi, (_, m1) => {
    return m1 ? `\n\n${m1}` : '\n\n';
  });
  // Clean raw trailing JSON closing brackets or quotes leaking into notes
  res = res.replace(/(\n|^)\s*["'}\]]{2,}\s*(\n|$)/g, '\n');
  return res;
}

const UPSC_TERMS_DB = [
  { term: "Fundamental Rights", category: "GS Paper II (Polity)", desc: "Enshrined in Part III of the Constitution (Articles 12-35), these rights guarantee civil liberties to all citizens, protecting them from state encroachment." },
  { term: "Directive Principles", category: "GS Paper II (Polity)", desc: "Non-justiciable guidelines in Part IV of the Constitution (Articles 36-51) that direct the State to establish social and economic democracy." },
  { term: "DPSP", category: "GS Paper II (Polity)", desc: "Directive Principles of State Policy: guidelines for framing laws to establish a welfare state." },
  { term: "Basic Structure Doctrine", category: "GS Paper II (Polity)", desc: "Judicial principle from the Kesavananda Bharati case (1973) stating that Parliament cannot amend certain core features of the Constitution." },
  { term: "Judicial Review", category: "GS Paper II (Polity)", desc: "The power of the judiciary to examine the constitutionality of legislative acts and executive orders, ensuring conformity with constitutional limits." },
  { term: "Sarkaria Commission", category: "GS Paper II (Polity)", desc: "Commission set up in 1983 to examine the relationship and balance of power between the Centre and States." },
  { term: "Collegium System", category: "GS Paper II (Polity)", desc: "The system of appointment and transfer of judges of the Supreme Court and High Courts, led by the Chief Justice of India and four senior-most judges." },
  { term: "Uniform Civil Code", category: "GS Paper II (Polity)", desc: "Article 44 directive aiming to replace personal laws based on scriptures and customs of each major religious community with a common set governing all citizens." },
  { term: "UCC", category: "GS Paper II (Polity)", desc: "Uniform Civil Code: a proposal to formulate and implement personal laws of citizens which apply on all citizens equally regardless of their religion." },
  { term: "Writ of Habeas Corpus", category: "GS Paper II (Polity)", desc: "A court order under Article 32 or 226 to produce a detained person before the court to determine the legality of their detention." },
  { term: "Writ of Mandamus", category: "GS Paper II (Polity)", desc: "A judicial command issued to a public authority or lower court directing them to perform a mandatory public duty." },
  { term: "Joint Parliamentary Committee", category: "GS Paper II (Polity)", desc: "An ad-hoc committee set up by Parliament for a specific purpose, consisting of members from both the Lok Sabha and Rajya Sabha." },
  { term: "JPC", category: "GS Paper II (Polity)", desc: "Joint Parliamentary Committee: a legislative committee formed for investigating specific matters." },
  { term: "Financial Action Task Force", category: "GS Paper II (International Relations)", desc: "An intergovernmental organization founded in 1989 to develop policies to combat money laundering and terrorist financing." },
  { term: "FATF", category: "GS Paper II (International Relations)", desc: "Financial Action Task Force: the global money laundering and terrorist financing watchdog." },
  { term: "FRBM Act", category: "GS Paper III (Economy)", desc: "Fiscal Responsibility and Budget Management Act (2003) enacted to institutionalize financial discipline and reduce fiscal deficit." },
  { term: "Monetary Policy Committee", category: "GS Paper III (Economy)", desc: "A 6-member committee of the RBI, chaired by the Governor, responsible for setting the benchmark policy interest rate (repo rate)." },
  { term: "MPC", category: "GS Paper III (Economy)", desc: "Monetary Policy Committee: RBI committee that decides statutory interest rates to maintain price stability." },
  { term: "GST Council", category: "GS Paper III (Economy)", desc: "A joint forum of the Centre and States established under Article 279A, to make recommendations on Goods and Services Tax rates and exemptions." },
  { term: "Insolvency and Bankruptcy Code", category: "GS Paper III (Economy)", desc: "Enacted in 2016, it provides a single law for insolvency and bankruptcy, consolidating existing frameworks for a time-bound resolution." },
  { term: "IBC", category: "GS Paper III (Economy)", desc: "Insolvency and Bankruptcy Code: structural economic reform aimed at accelerating default resolution processes." },
  { term: "Ramsar Convention", category: "GS Paper III (Environment)", desc: "An international treaty signed in 1971 for the conservation and sustainable use of wetlands, named after Ramsar in Iran." },
  { term: "Paris Agreement", category: "GS Paper III (Environment)", desc: "A legally binding international treaty on climate change adopted in 2015, targeting to limit global warming to well below 2°C." },
  { term: "NITI Aayog", category: "GS Paper II & III (Planning/Policy)", desc: "National Institution for Transforming India: the premier policy think tank of the Government, promoting cooperative federalism." },
  { term: "Capital Adequacy Ratio", category: "GS Paper III (Economy)", desc: "The ratio of a bank's capital to its risk-weighted assets, used to protect depositors and promote financial stability." },
  { term: "CAR", category: "GS Paper III (Economy)", desc: "Capital Adequacy Ratio: banking reliability index measuring core capital relative to risk attributes." },
  { term: "Panchayati Raj", category: "GS Paper II (Polity)", desc: "A three-tier system of local self-government introduced by the 73rd Constitutional Amendment Act, 1992." },
  { term: "Non-Performing Assets", category: "GS Paper III (Economy)", desc: "NPAs are bank loans or advances that are in default or in arrears on principal or interest payments for 90 days or more." },
  { term: "NPA", category: "GS Paper III (Economy)", desc: "Non-Performing Assets: standard classification for defaulted banking debts." },
  { term: "Electoral Bonds", category: "GS Paper II (Polity)", desc: "Interest-free financial instruments used for anonymous political donations, introduced in 2018 and later declared unconstitutional by the SC in 2024." },
  { term: "National Monetisation Pipeline", category: "GS Paper III (Economy)", desc: "A core government project estimating a monetisation potential of Rs 6 lakh crores through core assets of the Central Government over a 4-year period." },
  { term: "NMP", category: "GS Paper III (Economy)", desc: "National Monetisation Pipeline: public-private partnership venture for unlocking state infrastructure capital." },
  { term: "Carbon Border Adjustment Mechanism", category: "GS Paper III (Environment/Trade)", desc: "The European Union's landmark tool to place a price on carbon emitted during the production of carbon-intensive goods entering the EU." },
  { term: "CBAM", category: "GS Paper III (Environment/Trade)", desc: "Carbon Border Adjustment Mechanism: EU tariff protecting sustainable manufacturing from external carbon-dense production." },
  { term: "Pradhan Mantri Jan Dhan Yojana", category: "GS Paper III (Economy)", desc: "National Mission for Financial Inclusion to ensure access to financial services like banking accounts, remittances, and credit at affordable costs." },
  { term: "Digital Public Infrastructure", category: "GS Paper III (Technology)", desc: "Blocks of digital networks or platforms such as UPI, Aadhaar, and DigiLocker that enable public service delivery and innovation." },
  { term: "DPI", category: "GS Paper III (Technology)", desc: "Digital Public Infrastructure: societal-scale foundational software enabling equitable civil and transactional flow." },
  { term: "Panchamrit", category: "GS Paper III (Environment)", desc: "India's five-point climate action targets announced at COP26, including achieving Net Zero emissions by 2070." },
  { term: "Circular Economy", category: "GS Paper III (Environment)", desc: "An economic system aimed at eliminating waste through the continual use, recycling, and refurbishing of existing materials and resources." },
  { term: "Preamble", category: "GS Paper II (Polity)", desc: "The introductory statement of the Constitution outlining its guiding principles, values, and objectives (Justice, Liberty, Equality, Fraternity)." },
  { term: "Article 21", category: "GS Paper II (Polity)", desc: "Declares that no person shall be deprived of his life or personal liberty except according to procedure established by law, covering right to privacy, clean environment, etc." },
  { term: "Governor's Power", category: "GS Paper II (Polity)", desc: "Constitutional powers vested under Articles 153-161, often of central focus regarding discretionary assent to bills (Article 200) and ordinance making." },
  { term: "Delimitation Commission", category: "GS Paper II (Polity)", desc: "High-power body appointed by the President to redefine boundaries of constituencies based on recent census data." },
  { term: "Speaker of Lok Sabha", category: "GS Paper II (Polity)", desc: "The presiding officer of the lower house of Parliament, wielding immense power in deciding money bills (Article 110) and anti-defection cases." },
  { term: "First Past the Post", category: "GS Paper II (Polity)", desc: "FPTP: Electoral system where the candidate with the highest number of votes wins, used in general elections for Lok Sabha and Assemblies." },
  { term: "Proportional Representation", category: "GS Paper II (Polity)", desc: "An electoral system where parties or candidates gain seats in proportion to the number of votes cast for them, used for Rajya Sabha elections." },
  { term: "PR", category: "GS Paper II (Polity)", desc: "Proportional Representation electoral framework." },
  { term: "Judicial Activism", category: "GS Paper II (Polity)", desc: "Judicial philosophy in which judges allow their personal/political views about public policy to guide their decisions, actively forming new rights." },
];

type TreeNode = {
  name: string;
  type: "folder";
  children: Record<string, TreeNode>;
  notes: SavedNote[];
};

export function normalizeFolderPath(folderPath?: string[], subject?: string, topic?: string): string[] {
  let rawPath = (folderPath && folderPath.length > 0) ? folderPath : [subject || "General Studies"];
  let clean = rawPath.map(p => (p || "").trim().replace(/\s+/g, ' ')).filter(Boolean);

  // Canonicalize standard UPSC subjects
  clean = clean.map(item => {
    const lower = item.toLowerCase();
    if (lower.includes("gs 1") || lower.includes("gs1") || lower.includes("general studies 1") || lower.includes("general studies i")) return "General Studies 1";
    if (lower.includes("gs 2") || lower.includes("gs2") || lower.includes("general studies 2") || lower.includes("general studies ii")) return "General Studies 2";
    if (lower.includes("gs 3") || lower.includes("gs3") || lower.includes("general studies 3") || lower.includes("general studies iii")) return "General Studies 3";
    if (lower.includes("gs 4") || lower.includes("gs4") || lower.includes("general studies 4") || lower.includes("general studies iv") || lower.includes("ethics")) return "General Studies 4";
    if (lower.includes("polity") || lower.includes("governance") || lower.includes("constitution") || lower.includes("judiciary") || lower.includes("parliament")) return "Polity & Governance";
    if (lower.includes("economy") || lower.includes("economics") || lower.includes("banking") || lower.includes("agriculture") || lower.includes("budget")) return "Economy";
    if (lower.includes("geography")) return "Geography";
    if (lower.includes("history") || lower.includes("culture") || lower.includes("art")) return "History & Culture";
    if (lower.includes("science") || lower.includes("tech") || lower.includes("space") || lower.includes("biotech")) return "Science & Technology";
    if (lower.includes("environment") || lower.includes("ecology") || lower.includes("biodiversity") || lower.includes("climate")) return "Environment & Ecology";
    if (lower.includes("security") || lower.includes("cyber")) return "Internal Security";
    if (lower.includes("disaster")) return "Disaster Management";
    if (lower.includes("society") || lower.includes("social justice")) return "Social Justice & Society";
    if (lower.includes("law")) return "Law Optional";
    if (lower.includes("international") || lower.includes("ir")) return "International Relations";
    if (lower.includes("current affairs") || lower.includes("general")) return "Current Affairs";
    
    return item.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  });

  // If path length >= 3, or if the last element is the note topic itself, strip the topic element so notes sit inside the module folder
  if (clean.length > 2) {
    const last = clean[clean.length - 1].toLowerCase();
    const t = (topic || "").toLowerCase();
    if (!t || t.includes(last) || last.includes(t) || clean.length > 3) {
      clean.pop();
    }
  }

  return clean.length > 0 ? clean : [subject || "General Studies"];
}

function buildFolderTree(notes: SavedNote[]): Record<string, TreeNode> {
  const root: Record<string, TreeNode> = {};

  notes.forEach((note) => {
    let currentLevel = root;
    const path = normalizeFolderPath(note.folderPath, note.subject, note.topic);

    path.forEach((folderName, index) => {
      if (!currentLevel[folderName]) {
        currentLevel[folderName] = {
          name: folderName,
          type: "folder",
          children: {},
          notes: [],
        };
      }
      if (index === path.length - 1) {
        currentLevel[folderName].notes.push(note);
      }
      currentLevel = currentLevel[folderName].children;
    });
  });

  return root;
}



const FolderNodeComponent = ({
  node,
  depth = 0,
  currentNoteId,
  onLoadNote,
  onDeleteNote,
  onUpdateStatus,
}: {
  node: TreeNode;
  depth?: number;
  currentNoteId?: string | null;
  onLoadNote: (note: SavedNote) => void;
  onDeleteNote: (e: React.MouseEvent, id: string) => void;
  onUpdateStatus: (
    id: string,
    status: "new" | "reviewing" | "mastered",
  ) => void;
}) => {
  const [isOpen, setIsOpen] = useState(depth < 1); // open first level by default

  return (
    <div className="flex flex-col select-none">
      <div
        className="flex items-center gap-2 py-2 px-2.5 rounded-lg hover:bg-panel-border/50 cursor-pointer transition-colors text-main border-l-2 border-transparent hover:border-emerald-500/40"
        style={{ paddingLeft: `${depth * 1.2 + 0.5}rem` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <FolderOpen className="w-4 h-4 text-emerald-500" />
        ) : (
          <Folder className="w-4 h-4 text-muted" />
        )}
        <span className="font-bold text-xs truncate text-main">{node.name}</span>
        <span className="ml-auto text-[10px] text-muted font-bold bg-input px-1.5 py-0.2 rounded-full border border-panel-border">
          {node.notes.length}
        </span>
      </div>

      {isOpen && (
        <div className="flex flex-col mt-0.5 relative">
          {depth > 0 && (
            <div
              className="absolute left-0 top-0 bottom-0 border-l border-panel-border/60"
              style={{ left: `${depth * 1.2 + 0.9}rem` }}
            />
          )}
          {Object.values(node.children).map((childNode) => (
            <FolderNodeComponent
              key={childNode.name}
              node={childNode}
              depth={depth + 1}
              currentNoteId={currentNoteId}
              onLoadNote={onLoadNote}
              onDeleteNote={onDeleteNote}
              onUpdateStatus={onUpdateStatus}
            />
          ))}

          {node.notes.map((note) => {
            const isActive = currentNoteId === note.id;
            return (
              <div
                key={note.id}
                onClick={() => onLoadNote(note)}
                className={`flex items-center justify-between py-2 px-2.5 rounded-xl cursor-pointer transition-all group relative border my-0.5 shadow-xs ${
                  isActive
                    ? "bg-emerald-500/10 border-emerald-500/40 text-main font-semibold shadow-sm"
                    : "bg-input/60 hover:bg-input border-panel-border/70 hover:border-emerald-500/30"
                }`}
                style={{
                  marginLeft: `${(depth + 1) * 1.2 + 0.3}rem`,
                }}
              >
                <div className="flex items-center gap-2 overflow-hidden min-w-0 pr-1">
                  <FileText
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? "text-emerald-500" : "text-muted"
                    }`}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-main truncate font-medium">
                      {note.topic}
                    </span>
                    <span className="text-[10px] text-muted truncate">
                      {note.subject || "General"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextStatus =
                        note.status === "new"
                          ? "reviewing"
                          : note.status === "reviewing"
                          ? "mastered"
                          : "new";
                      onUpdateStatus(note.id, nextStatus);
                    }}
                    title={`Status: ${
                      note.status === "mastered"
                        ? "Done / Mastered (Click to change)"
                        : note.status === "reviewing"
                        ? "In Review (Click to change)"
                        : "New Note (Click to change)"
                    }`}
                    className={`text-[10px] px-1.5 py-0.5 rounded-md border transition-all cursor-pointer shrink-0 font-medium flex items-center gap-1 ${
                      note.status === "mastered"
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : note.status === "reviewing"
                        ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
                        : "bg-panel border-panel-border/60 text-muted hover:bg-input"
                    }`}
                  >
                    <span>
                      {note.status === "mastered"
                        ? "✅"
                        : note.status === "reviewing"
                        ? "🔄"
                        : "🆕"}
                    </span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoadNote(note);
                      setTimeout(() => {
                        exportToPDF("notes-content", note.topic || "UPSC_Notes");
                      }, 100);
                    }}
                    className="p-1 text-muted hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-emerald-500/10 shrink-0"
                    title="Print / Export Note"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => onDeleteNote(e, note.id)}
                    className="p-1 text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-red-500/10 shrink-0"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};



export function NotesView({ model }: NotesViewProps) {
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("Law Optional");
  const [notes, setNotes] = useState("");
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [isNotebookSidebarOpen, setIsNotebookSidebarOpen] = useState(true);
  const [notebookSidebarWidth, setNotebookSidebarWidth] = useState(280);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 1024) {
        setIsNotebookSidebarOpen(false);
      }
    }
  }, []);
  
  // UPSC Knowledge Graph and Tooltip States
  const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);
  const [hoveredTermPosition, setHoveredTermPosition] = useState<{ top: number; left: number } | null>(null);
  const hoveredTermRef = useRef<HTMLDivElement | null>(null);
  const hoverLeaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isFetchingTerm, setIsFetchingTerm] = useState(false);
  const [definitionsCache, setDefinitionsCache] = useState<Record<string, { category: string; desc: string }>>({});
  const [sidebarTab, setSidebarTab] = useState<"annotations" | "knowledge-graph">("knowledge-graph");
  const [selectedSyllabusTerm, setSelectedSyllabusTerm] = useState<string | null>(null);
  const [isTocCollapsed, setIsTocCollapsed] = useState(true);
  const [savedNotesSearch, setSavedNotesSearch] = useState("");
  const [savedNotesStatusFilter, setSavedNotesStatusFilter] = useState<"all" | "new" | "reviewing" | "mastered">("all");
  const [isDeepDive, setIsDeepDive] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [tocPosition, setTocPosition] = useState({ x: 24, y: 120 });
  const [isDraggingToc, setIsDraggingToc] = useState(false);
  const [tocPinnedSide, setTocPinnedSide] = useState<'left' | 'right' | null>(null);

  // Auto-dismiss sticky term tooltip on outside click, escape key, or scroll
  useEffect(() => {
    if (!hoveredTerm) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        hoveredTermRef.current && 
        !hoveredTermRef.current.contains(target) && 
        !target?.closest('.upsc-term-highlight')
      ) {
        setHoveredTerm(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHoveredTerm(null);
      }
    };

    const handleScroll = () => {
      setHoveredTerm(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hoveredTerm]);

  const handleTocDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("a")) return;
    
    setIsDraggingToc(true);

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const rect = e.currentTarget.getBoundingClientRect();
    const startX = window.innerWidth - rect.right;
    const startY = rect.top;
    const startMouseX = clientX;
    const startMouseY = clientY;

    let unpinned = false;

    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentClientX = "touches" in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentClientY = "touches" in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = currentClientX - startMouseX;
      const deltaY = currentClientY - startMouseY;

      if (!unpinned && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
        unpinned = true;
        setTocPinnedSide(null);
      }

      const panelWidth = isTocCollapsed ? 100 : 330;
      const newX = Math.max(10, Math.min(window.innerWidth - panelWidth - 10, startX - deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 150, startY + deltaY));

      setTocPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDraggingToc(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleMouseMove, { passive: false });
    document.addEventListener("touchend", handleMouseUp);
  };

  const notesHeadings = React.useMemo(() => {
    if (!notes) return [];
    const lines = notes.split("\n");
    const headings: { id: string; text: string; level: number }[] = [];
    let inCodeBlock = false;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        return;
      }
      if (inCodeBlock) return;

      const match = trimmed.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length; // 2 or 3
        const rawText = match[2].trim();
        const text = rawText.replace(/[\*\_`#]/g, "").trim();
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-");
        headings.push({ id, text, level });
      }
    });
    return headings;
  }, [notes]);
  
  const handleSidebarDrag = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = notebookSidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.min(Math.max(startWidth + moveEvent.clientX - startX, 200), 600);
      setNotebookSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [notebookSidebarWidth]);
  
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>(() => {
    const saved = localStorage.getItem("upsc_saved_notes");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved notes", e);
      }
    }
    return [];
  });

  const filteredSavedNotes = React.useMemo(() => {
    return savedNotes.filter((note) => {
      const query = savedNotesSearch.trim().toLowerCase();
      const matchesSearch =
        !query ||
        (note.topic && note.topic.toLowerCase().includes(query)) ||
        (note.subject && note.subject.toLowerCase().includes(query));
      const matchesStatus =
        savedNotesStatusFilter === "all" ||
        (note.status || "new") === savedNotesStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [savedNotes, savedNotesSearch, savedNotesStatusFilter]);

  const [savedPYQs, setSavedPYQs] = useState<any[]>(() => 
    safeLocalStorageGet<any[]>("upsc_saved_pyqs", [])
  );

  const [relatedNotes, setRelatedNotes] = useState<SavedNote[]>([]);
  const [relatedPYQs, setRelatedPYQs] = useState<any[]>([]);
  const [isGeneratingRelated, setIsGeneratingRelated] = useState(false);

  // Dynamic active recall deck state variables
  const [flashcards, setFlashcards] = useState<any[] | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [showFlashcardsModule, setShowFlashcardsModule] = useState(false);
  const [cardStatus, setCardStatus] = useState<Record<number, 'learned' | 'review'>>({});

  const handleGenerateFlashcards = async () => {
    if (!notes) return;
    setIsGeneratingFlashcards(true);
    setFlashcards(null);
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
    setCardStatus({});
    setShowFlashcardsModule(true);
    try {
      const response = await apiFetch("/api/notes-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notesText: notes, subject })
      });
      const data = await response.json();
      if (data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
      } else {
        setError("Could not generate recall cards. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch recall cards.");
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  useEffect(() => {
    if (!notes || !topic) {
       setRelatedNotes([]);
       setRelatedPYQs([]);
       return;
    }
    
    // We only fetch related items if we actually have saved ones
    const notesContext = savedNotes.filter(n => n.id !== currentNoteId);
    const pyqsContext = savedPYQs;
    
    if (notesContext.length === 0 && pyqsContext.length === 0) {
       setRelatedNotes([]);
       setRelatedPYQs([]);
       return;
    }

    const generateRelated = () => {
       setIsGeneratingRelated(true);
       try {
          const lowerTopic = topic.toLowerCase();
          
          // Naive matching instead of API call to save API usage
          const matchedNotes = notesContext.filter(n => n.topic.toLowerCase().includes(lowerTopic) || lowerTopic.includes(n.topic.toLowerCase())).slice(0, 3);
          const matchedPYQs = pyqsContext.filter(p => p.topic?.toLowerCase().includes(lowerTopic) || p.question.toLowerCase().includes(lowerTopic)).slice(0, 2);
          
          setRelatedNotes(matchedNotes);
          setRelatedPYQs(matchedPYQs);
       } catch(e) {} finally {
         setIsGeneratingRelated(false);
       }
    };
    
    // add debounce
    const timeout = setTimeout(generateRelated, 500);
    return () => clearTimeout(timeout);
  }, [notes, topic, currentNoteId]);

  useEffect(() => {
    localStorage.setItem("upsc_saved_notes", JSON.stringify(savedNotes));
  }, [savedNotes]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "upsc_saved_notes" && e.newValue) {
        try {
          setSavedNotes(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSummarize = async () => {
    if (!notes) return;
    setIsSummarizing(true);
    setShowSummary(true);
    try {
      const res = await apiFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: `Summarize the following notes into a single high-yield TL;DR paragraph suitable for rapid revision:\n\n${notes}`
            }
          ]
        })
      });
      if (!res.ok) throw new Error("Failed to summarize note");
      const data = await res.json();
      setSummary(data.reply);
    } catch(err) {
      setSummary("Error generating summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveSuccess, setDriveSuccess] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const [annotationPos, setAnnotationPos] = useState<{ top: number; left: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [selectedTextRelativePos, setSelectedTextRelativePos] = useState<number>(0);
  const [noteInputParams, setNoteInputParams] = useState<{text: string, colorClass: string} | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [annotationNote, setAnnotationNote] = useState("");
  const [activeMarkToken, setActiveMarkToken] = useState<{ id: string, top: number, left: number, note: string | null } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const isHighlightingRef = useRef(false);
  const selectionTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const handleSearch = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setTopic(customEvent.detail);
        // Optionally look if it exists in savedNotes and load it
        const existing = savedNotes.find(n => n.topic.toLowerCase() === customEvent.detail.toLowerCase());
        if (existing) {
          loadNote(existing);
        } else {
          // If not exist, clear note content so user can generate it
          setNotes("");
          setCurrentNoteId(null);
          setSummary("");
        }
      }
    };
    window.document.addEventListener('app:search-notes', handleSearch);
    return () => window.document.removeEventListener('app:search-notes', handleSearch);
  }, [savedNotes]);

  // Custom markdown components

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || !notes) return;

    // Helper to find the actual scrolling container in the document
    const getScrollContainer = (el: HTMLElement | null): HTMLElement | Window => {
      if (!el) return window;
      let parent = el.parentElement;
      while (parent) {
        const style = window.getComputedStyle(parent);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          return parent;
        }
        parent = parent.parentElement;
      }
      return window;
    };

    const container = getScrollContainer(scrollEl);

    // 1. Scroll listener for Read Progress
    const handleScrollProgress = () => {
      let scrollTop = 0;
      let scrollHeight = 0;
      let clientHeight = 0;

      if (container === window) {
        scrollTop = window.scrollY;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = window.innerHeight;
      } else {
        const element = container as HTMLElement;
        scrollTop = element.scrollTop;
        scrollHeight = element.scrollHeight;
        clientHeight = element.clientHeight;
      }

      if (scrollHeight > clientHeight) {
        setScrollProgress((scrollTop / (scrollHeight - clientHeight)) * 100);
      } else {
        setScrollProgress(0);
      }
    };

    // Attach scroll listener to the container actually doing the scrolling
    container.addEventListener("scroll", handleScrollProgress, { passive: true });
    // Execute immediately to calculate current state
    handleScrollProgress();

    // 2. IntersectionObserver for active heading detection
    const headingElements = document.querySelectorAll("#notes-content h2[id], #notes-content h3[id]");
    
    // Track which headings are currently in viewport
    const intersectingMap = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id) {
            intersectingMap.set(entry.target.id, entry.isIntersecting);
          }
        });

        // Try to find the first heading in order of appearance that is intersecting
        let foundActive = false;
        for (const heading of notesHeadings) {
          if (intersectingMap.get(heading.id)) {
            setActiveHeadingId(heading.id);
            foundActive = true;
            break;
          }
        }

        // Fallback: Use bounding rect to find the heading closest to but above/at top of viewport
        if (!foundActive) {
          let lastPassedId = notesHeadings[0]?.id || null;
          for (const heading of notesHeadings) {
            const el = document.getElementById(heading.id);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= 200) {
                lastPassedId = heading.id;
              } else {
                break;
              }
            }
          }
          if (lastPassedId) {
            setActiveHeadingId(lastPassedId);
          }
        }
      },
      {
        root: container === window ? null : (container as Element),
        rootMargin: "-80px 0px -60% 0px", // focus on headings near top half of the screen
        threshold: 0
      }
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => {
      container.removeEventListener("scroll", handleScrollProgress);
      observer.disconnect();
    };
  }, [notes, notesHeadings]);

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
        name: `${subject} - ${topic} Notes.md`,
        mimeType: "text/markdown",
      };

      const boundary = "foo_bar_baz";
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        "Content-Type: application/json\r\n\r\n" +
        JSON.stringify(metadata) +
        delimiter +
        "Content-Type: text/markdown\r\n\r\n" +
        notes +
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

      setDriveSuccess("Successfully saved to Google Drive!");
      setTimeout(() => setDriveSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSavingToDrive(false);
    }
  };

  const [isAutoCategorizingTopic, setIsAutoCategorizingTopic] = useState(false);

  const handleAutoCategorizeTopic = async () => {
    if (!topic.trim()) return;
    setIsAutoCategorizingTopic(true);
    try {
      const res = await apiFetch("/api/categorize-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: topic }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.category) {
          const cat = data.category.toLowerCase();
          if (cat.includes("polity") || cat.includes("governance")) setSubject("General Studies 2");
          else if (cat.includes("economy") || cat.includes("science") || cat.includes("environment")) setSubject("General Studies 3");
          else if (cat.includes("history") || cat.includes("culture") || cat.includes("geography")) setSubject("General Studies 1");
          else if (cat.includes("ethics")) setSubject("General Studies 4");
          else if (cat.includes("law")) setSubject("Law Optional");
          else setSubject("General Studies 2");
        }
      }
    } catch (err) {
      console.warn("Auto categorize error:", err);
    } finally {
      setIsAutoCategorizingTopic(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError("");
    setNotes("");
    setCurrentNoteId(null);
    setFlashcards(null);
    setShowFlashcardsModule(false);

    try {
      setScrollProgress(0);
      if (window.innerWidth < 1024) setIsNotebookSidebarOpen(false);
      const res = await apiFetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, subject, model, isDeepDive }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate notes");

      const finalSubject = (data.folderPath && data.folderPath[0]) ? data.folderPath[0] : subject;
      const noteId = Date.now().toString();
      const newNote: SavedNote = {
        id: noteId,
        topic,
        subject: finalSubject,
        content: data.notes,
        folderPath: data.folderPath || [finalSubject, topic],
        date: new Date().toISOString(),
      };

      const sanitizedNotes = cleanLeakedNoteJson(data.notes);
      setNotes(sanitizedNotes);
      setCurrentNoteId(noteId);
      setSavedNotes((prev) => [{ ...newNote, content: sanitizedNotes }, ...prev]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOCRScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsLoading(true);
      setError("");
      setFlashcards(null);
      setShowFlashcardsModule(false);
      
      const formData = new FormData();
      formData.append("document", file);
      
      try {
        const res = await apiFetch("/api/ocr", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "OCR failed");
        
        setTopic(file.name || "Handwritten Notes");
        setNotes(data.text);
        const noteId = Date.now().toString();
        setCurrentNoteId(noteId);
        setSavedNotes((prev) => [{
          id: noteId,
          topic: file.name || "Handwritten Notes OCR",
          subject: subject,
          content: data.text,
          date: new Date().toISOString()
        }, ...prev]);
        setScrollProgress(0);
        if (window.innerWidth < 1024) setIsNotebookSidebarOpen(false);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const loadNote = (note: SavedNote) => {
    setTopic(note.topic);
    setSubject(note.subject);
    setNotes(note.content);
    setCurrentNoteId(note.id);
    setError("");
    setScrollProgress(0);
    setFlashcards(null);
    setShowFlashcardsModule(false);
    if (window.innerWidth < 1024) setIsNotebookSidebarOpen(false);
  };

  useEffect(() => {
    const handleOpenNote = (e: Event) => {
      const customEvent = e as CustomEvent<{ noteId: string }>;
      const noteToOpen = savedNotes.find(n => n.id === customEvent.detail.noteId);
      if (noteToOpen) {
        loadNote(noteToOpen);
      }
    };
    window.addEventListener("app:open-note", handleOpenNote);
    return () => window.removeEventListener("app:open-note", handleOpenNote);
  }, [savedNotes]);

  const deleteNote = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedNotes((prev) => prev.filter((n) => n.id !== id));
    if (currentNoteId === id) {
      setNotes("");
      setTopic("");
      setCurrentNoteId(null);
    }
  };

  const updateNoteStatus = (
    id: string,
    status: "new" | "reviewing" | "mastered",
  ) => {
    setSavedNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, status } : note)),
    );
  };

  const availableConcepts = React.useMemo(() => {
    return savedNotes
      .filter((n) => n.id !== currentNoteId && n.topic && n.topic.trim().length > 3)
      .sort((a, b) => b.topic.length - a.topic.length);
  }, [savedNotes, currentNoteId]);

  const identifiedTermsInNote = React.useMemo(() => {
    if (!notes) return [];
    const lowercaseNotes = notes.toLowerCase();
    return UPSC_TERMS_DB.filter(t => {
      if (!lowercaseNotes.includes(t.term.toLowerCase())) return false;
      const escaped = t.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      return regex.test(notes);
    });
  }, [notes]);

  const handleTermMouseEnter = React.useCallback((term: string, e: React.MouseEvent<HTMLSpanElement>) => {
    if (hoverLeaveTimerRef.current) {
      clearTimeout(hoverLeaveTimerRef.current);
      hoverLeaveTimerRef.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredTerm(term);
    setHoveredTermPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });

    if (!definitionsCache[term.toLowerCase()]) {
      const staticMatch = UPSC_TERMS_DB.find(t => t.term.toLowerCase() === term.toLowerCase());
      if (staticMatch) {
        setDefinitionsCache(prev => ({
          ...prev,
          [term.toLowerCase()]: {
            category: staticMatch.category,
            desc: staticMatch.desc
          }
        }));
      }
    }
  }, [definitionsCache]);

  const handleTermMouseLeave = React.useCallback(() => {
    if (hoverLeaveTimerRef.current) {
      clearTimeout(hoverLeaveTimerRef.current);
    }
    hoverLeaveTimerRef.current = setTimeout(() => {
      setHoveredTerm(null);
    }, 280);
  }, []);

  const d3ContainerRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (sidebarTab !== "knowledge-graph" || !d3ContainerRef.current) return;

    const svg = d3.select(d3ContainerRef.current);
    svg.selectAll("*").remove();

    // Prepare data
    const nodeData: any[] = [];
    const linkData: any[] = [];

    // Root node: Current note
    nodeData.push({
      id: "root",
      label: topic || "Active Note",
      type: "root",
      val: 14,
      color: "var(--accent)"
    });

    // Match concept notes in note texts
    const matchedConcepts = availableConcepts.filter((c) => {
      const esc = c.topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(`\\b${esc}\\b`, "i");
      return rx.test(notes);
    });

    matchedConcepts.forEach((c) => {
      const nodeId = `concept-${c.id}`;
      nodeData.push({
        id: nodeId,
        label: c.topic,
        type: "concept",
        val: 9,
        color: "#2563eb", // blue
        original: c
      });
      linkData.push({
        source: "root",
        target: nodeId,
        value: 2
      });
    });

    // Match static/identified UPSC terms
    identifiedTermsInNote.forEach((t) => {
      const nodeId = `upsc-${t.term}`;
      nodeData.push({
        id: nodeId,
        label: t.term,
        type: "upsc",
        val: 8.5,
        color: t.category.includes("III") ? "#eab308" : t.category.includes("II") ? "#10b981" : "#a855f7", // GS III yellow, GS II emerald, GS I/IV purple
        original: t
      });
      linkData.push({
        source: "root",
        target: nodeId,
        value: 1.5
      });
    });

    if (nodeData.length <= 1) {
      // Suggest generic categories if nothing matches to keep the graph beautiful and suggesting links
      const suggestions = UPSC_TERMS_DB.slice(0, 4);
      suggestions.forEach((t) => {
        const nodeId = `upsc-${t.term}`;
        nodeData.push({
          id: nodeId,
          label: t.term,
          type: "upsc-suggested",
          val: 7.5,
          color: "#9ca3af",
          original: t
        });
        linkData.push({
          source: "root",
          target: nodeId,
          value: 1
        });
      });
    }

    const width = d3ContainerRef.current.clientWidth || 280;
    const height = 180;

    const simulation = d3.forceSimulation(nodeData)
      .force("link", d3.forceLink(linkData).id((d: any) => d.id).distance(50))
      .force("charge", d3.forceManyBody().strength(-70))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => d.val + 6));

    const link = svg.append("g")
      .attr("stroke", "var(--panel-border)")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(linkData)
      .join("line")
      .attr("stroke-width", (d: any) => Math.sqrt(d.value) * 1.5);

    const node = svg.append("g")
      .selectAll("g")
      .data(nodeData)
      .join("g")
      .style("cursor", "pointer")
      .on("click", (event: any, d: any) => {
        if (d.type === "concept" && d.original) {
          loadNote(d.original);
        } else if ((d.type === "upsc" || d.type === "upsc-suggested") && d.original) {
          setSelectedSyllabusTerm(d.original.term);
        }
      });

    node.append("circle")
      .attr("r", (d: any) => d.val)
      .attr("fill", (d: any) => d.color)
      .attr("stroke", "var(--panel)")
      .attr("stroke-width", 1.5);

    node.append("text")
      .text((d: any) => d.label)
      .attr("font-size", "9px")
      .attr("dx", (d: any) => d.val + 3)
      .attr("dy", 3)
      .attr("fill", "var(--text-main)")
      .attr("class", "font-sans font-medium select-none text-main")
      .style("pointer-events", "none");

    // Dragging support
    node.call(d3.drag()
      .on("start", (event: any, d: any) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event: any, d: any) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event: any, d: any) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }) as any);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [sidebarTab, topic, notes, availableConcepts, identifiedTermsInNote]);

  const processTextNodes = React.useCallback(
    (children: any): any => {
      if (!availableConcepts.length && !UPSC_TERMS_DB.length) return children;

      return React.Children.map(children, (child) => {
        if (typeof child === "string") {
          let result: React.ReactNode[] = [child];
          
          // 1. Process custom note links (Kesavananda-style link bubbles)
          if (availableConcepts.length) {
            availableConcepts.forEach((concept) => {
              const escapedTopic = concept.topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const regex = new RegExp(`\\b(${escapedTopic})\\b`, "gi");

              result = result.flatMap((segment) => {
                if (typeof segment === "string") {
                  const parts = segment.split(regex);
                  return parts.map((part, i) => {
                    if (i % 2 !== 0 && part.toLowerCase() === concept.topic.toLowerCase()) {
                      return (
                        <span
                          key={`${concept.id}-${i}`}
                          className="relative group/tooltip inline cursor-pointer z-10"
                        >
                          <span
                            className="underline decoration-accent/50 decoration-wavy underline-offset-4 font-semibold text-accent hover:text-accent/80 transition-colors"
                            onClick={() => loadNote(concept)}
                          >
                            {part}
                          </span>
                          <span className="absolute invisible opacity-0 group-hover/tooltip:visible group-hover/tooltip:opacity-100 transition-all duration-200 delay-0 group-hover/tooltip:delay-500 bottom-full left-1/2 -translate-x-1/2 bg-panel border border-panel-border shadow-xl rounded-xl w-72 z-[100] mb-2 pointer-events-none p-4 text-left cursor-default">
                            <span className="font-bold text-main text-sm mb-1.5 flex items-center gap-2">
                               <span className="w-2 h-2 rounded-full bg-accent inline-block"></span>
                               <span>{concept.topic}</span>
                            </span>
                            <span className="text-[11px] text-muted leading-relaxed line-clamp-3 block">
                              {concept.content.replace(/[#*`]/g, "").slice(0, 150)}...
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-accent mt-3 block">Click to open node</span>
                          </span>
                        </span>
                      );
                    }
                    return part;
                  });
                }
                return segment;
              });
            });
          }

          // 2. Process general UPSC key-terms across remaining raw text segments
          result = result.flatMap((segment, segIdx) => {
            if (typeof segment === "string") {
              let upscSegments: React.ReactNode[] = [segment];
              
              UPSC_TERMS_DB.forEach((t, tIdx) => {
                const escapedTerm = t.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                const upscRegex = new RegExp(`\\b(${escapedTerm})\\b`, "gi");

                upscSegments = upscSegments.flatMap((upscSeg) => {
                  if (typeof upscSeg === "string") {
                    const parts = upscSeg.split(upscRegex);
                    return parts.map((part, i) => {
                      if (i % 2 !== 0 && part.toLowerCase() === t.term.toLowerCase()) {
                        return (
                          <span
                            key={`upsc-${t.term}-${segIdx}-${tIdx}-${i}`}
                            onMouseEnter={(e) => handleTermMouseEnter(t.term, e)}
                            onMouseLeave={handleTermMouseLeave}
                            onClick={() => {
                              setSelectedSyllabusTerm(t.term);
                              setSidebarTab("knowledge-graph");
                              setIsSidebarOpen(true);
                            }}
                            className="upsc-term-highlight underline decoration-[2px] decoration-dotted decoration-accent/60 hover:decoration-solid hover:bg-accent/10 hover:text-accent font-semibold cursor-help transition-all inline-block px-1 rounded-sm relative z-10"
                          >
                            {part}
                          </span>
                        );
                      }
                      return part;
                    });
                  }
                  return upscSeg;
                });
              });
              return upscSegments;
            }
            return segment;
          });

          return result;
        }

        if (React.isValidElement(child)) {
          if (typeof child.type === "string" && ["code", "pre", "a", "h1", "h2", "h3", "h4"].includes(child.type)) {
            return child;
          }
          return React.cloneElement(child, {
            ...(child.props as any),
            // @ts-ignore
            children: processTextNodes(child.props.children),
          });
        }
        return child;
      });
    },
    [availableConcepts, handleTermMouseEnter, handleTermMouseLeave]
  );

  const markdownComponents = React.useMemo(
    () => ({
      pre(props: any) {
        // If the pre contains a mermaid code element, don't style or constrain as code block pre
        const isMermaid = React.Children.toArray(props.children).some((child: any) => 
          child?.props?.className?.includes('language-mermaid')
        );
        if (isMermaid) {
          return <div className="my-6 not-prose w-full overflow-visible">{props.children}</div>;
        }
        return <pre {...props} className={`overflow-x-auto rounded-xl p-4 bg-app text-main border border-panel-border ${props.className || ''}`} />;
      },
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
      mark(props: any) {
        const noteText = props.title || (props.node && props.node.properties && props.node.properties.title) || "";
        return (
          <mark id={props.id} className={props.className} title={noteText} data-note={noteText}>
            {props.children}
          </mark>
        );
      },
      p: (props: any) => <p {...props}>{processTextNodes(props.children)}</p>,
      li: (props: any) => <li {...props}>{processTextNodes(props.children)}</li>,
      h2(props: any) {
        const text = React.Children.toArray(props.children)
          .map((child: any) => {
            if (typeof child === "string" || typeof child === "number") return String(child);
            if (child?.props?.children) return String(child.props.children);
            return "";
          })
          .join("")
          .replace(/[\*\_`#]/g, "")
          .trim();
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-");
        const isGrounding = text.toLowerCase().includes("grounding verification") || text.toLowerCase().includes("source verification");
        if (isGrounding) {
          return (
            <h2 id={id} {...props} className="flex items-center gap-2.5 text-emerald-500 font-extrabold border-b-2 border-emerald-500/20 pb-2 mt-8 mb-4 text-base uppercase tracking-wide">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              {processTextNodes(props.children)}
            </h2>
          );
        }
        return (
          <h2 id={id} {...props}>
            {processTextNodes(props.children)}
          </h2>
        );
      },
      h3(props: any) {
        const text = React.Children.toArray(props.children)
          .map((child: any) => {
            if (typeof child === "string" || typeof child === "number") return String(child);
            if (child?.props?.children) return String(child.props.children);
            return "";
          })
          .join("")
          .replace(/[\*\_`#]/g, "")
          .trim();
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-");
        return (
          <h3 id={id} {...props}>
            {processTextNodes(props.children)}
          </h3>
        );
      },
    }),
    [processTextNodes]
  );

  const applyHighlight = (colorClass: string, noteStr: string = "", targetText: string = selectedText) => {
    if (!targetText || !targetText.trim()) return;
    
    // Set flag to prevent mouseup race condition during/after highlighting
    isHighlightingRef.current = true;
    setTimeout(() => {
      isHighlightingRef.current = false;
    }, 250);

    const cleanTarget = targetText.trim();
    const markId = "mark-" + Date.now() + Math.floor(Math.random() * 1000);
    
    try {
      const prev = notes || "";
      if (!prev) return;

      let targetIndex = -1;
      let matchedLength = cleanTarget.length;

      // 1. Direct plain search first (fastest, strictly O(N) with zero regex overhead)
      const directIndex = prev.indexOf(cleanTarget);
      if (directIndex !== -1) {
        targetIndex = directIndex;
      } else {
        // 2. Linear non-backtracking search if markdown tags or varied spacing exist between words
        const words = cleanTarget.split(/\s+/).filter(Boolean);
        if (words.length > 0) {
          const escapedWords = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
          // Strictly linear separator with NO nested quantifiers to avoid catastrophic backtracking / ReDoS
          const linearPattern = escapedWords.join('[\\s*_`~<>\'"#-]+');
          const safeRegex = new RegExp(linearPattern, 'gi');

          const expectedIndex = prev.length * (selectedTextRelativePos || 0);
          let match: RegExpExecArray | null;
          let bestMatch: { index: number; length: number } | null = null;
          let minDiff = Infinity;
          let iterations = 0;

          while ((match = safeRegex.exec(prev)) !== null && iterations < 50) {
            iterations++;
            const diff = Math.abs(match.index - expectedIndex);
            if (diff < minDiff) {
              minDiff = diff;
              bestMatch = { index: match.index, length: match[0].length };
            }
            if (match[0].length === 0) safeRegex.lastIndex++;
          }

          if (bestMatch) {
            targetIndex = bestMatch.index;
            matchedLength = bestMatch.length;
          }
        }
      }

      if (targetIndex !== -1) {
        const matchedSubstring = prev.substring(targetIndex, targetIndex + matchedLength);
        // Strip any existing <mark> tags inside to prevent corrupting HTML tags
        const cleanContent = matchedSubstring.replace(/<\/?mark[^>]*>/gi, '');

        let tag = `<mark id="${markId}" class="${colorClass} px-1 rounded cursor-pointer"`;
        if (noteStr) {
          const safeNote = noteStr.replace(/"/g, '&quot;');
          tag += ` title="${safeNote}" data-note="${safeNote}"`;
        }
        tag += `>${cleanContent}</mark>`;

        const updatedNotes = prev.substring(0, targetIndex) + tag + prev.substring(targetIndex + matchedLength);

        // Update state cleanly without nesting state setters inside updater
        setNotes(updatedNotes);
        if (currentNoteId) {
          setSavedNotes(prevSaved =>
            prevSaved.map(n => n.id === currentNoteId ? { ...n, content: updatedNotes } : n)
          );
        }
      } else {
        console.warn("Could not find matching text to highlight:", cleanTarget);
      }
    } catch (e) {
      console.error("Highlight error:", e);
    }
    
    // Clear selection overlay state
    setAnnotationPos(null);
    setSelectedText("");
    setSelectedTextRelativePos(0);
    setNoteInputParams(null);
    setAnnotationNote("");
    
    try {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        sel.removeAllRanges();
      }
    } catch (e) {}
  };

  const handleSelection = () => {
    // If user is currently applying a highlight or if annotation note modal is open, don't interfere
    if (isHighlightingRef.current || document.getElementById("annotation-note-input")) {
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      if (annotationPos && !noteInputParams) {
        setAnnotationPos(null);
        setSelectedText("");
        setSelectedTextRelativePos(0);
      }
      return;
    }
    
    const text = selection.toString().trim();
    if (text.length > 0) {
      const range = selection.getRangeAt(0);
      const container = document.getElementById("notes-content");
      if (container && container.contains(range.commonAncestorContainer)) {
        const rect = range.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Quick relative position calculation without cloning entire document tree
        let relativePos = 0;
        const totalLen = (container.textContent || "").length;
        if (totalLen > 0) {
          try {
            const preRange = document.createRange();
            preRange.setStart(container, 0);
            preRange.setEnd(range.startContainer, range.startOffset);
            relativePos = preRange.toString().length / totalLen;
          } catch (e) {
            relativePos = 0.5;
          }
        }

        // Clamp coordinates within container bounds so toolbar never clips or causes overflow
        const top = Math.max(10, rect.top - containerRect.top - 50);
        const left = Math.max(10, Math.min(containerRect.width - 240, rect.left - containerRect.left + (rect.width / 2) - 100));

        setAnnotationPos({ top, left });
        setSelectedText(text);
        setSelectedTextRelativePos(relativePos);
      }
    } else {
      if (annotationPos && !noteInputParams) {
        setAnnotationPos(null);
        setSelectedText("");
        setSelectedTextRelativePos(0);
      }
    }
  };

  useEffect(() => {
    const handleEvents = (e: Event) => {
      // If clicking inside the toolbar or input, ignore
      const target = e.target as HTMLElement | null;
      if (target && (target.closest('.annotation-toolbar') || target.closest('#annotation-note-input'))) {
        return;
      }

      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      selectionTimeoutRef.current = setTimeout(() => {
        handleSelection();
      }, 50);
    };

    document.addEventListener("mouseup", handleEvents);
    document.addEventListener("touchend", handleEvents);
    document.addEventListener("keyup", handleEvents);
    
    return () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      document.removeEventListener("mouseup", handleEvents);
      document.removeEventListener("touchend", handleEvents);
      document.removeEventListener("keyup", handleEvents);
    };
  }, [notes, currentNoteId]);

  const annotationsList = React.useMemo(() => {
    if (!notes || typeof window === 'undefined') return [];
    try {
      const doc = new DOMParser().parseFromString(notes, 'text/html');
      const marks = Array.from(doc.querySelectorAll('mark'));
      return marks.map(mark => ({
        id: mark.id,
        text: mark.textContent || "",
        note: mark.getAttribute('data-note') || mark.title || null,
        colorClass: mark.className,
      }));
    } catch(e) {
      return [];
    }
  }, [notes]);

  return (
    <div className="h-full relative overflow-hidden flex bg-transparent print:h-auto print:overflow-visible">
      {/* Archive Sidebar (Left) */}
      <div 
        className={`shrink-0 bg-panel border-r border-panel-border flex flex-col h-full overflow-hidden z-20 transition-all duration-300 ease-in-out relative ${isNotebookSidebarOpen ? "opacity-100" : "w-0 opacity-0 overflow-hidden"} print:hidden`}
        style={{ width: isNotebookSidebarOpen ? `${notebookSidebarWidth}px` : '0px' }}
      >
         <div className="p-3.5 border-b border-panel-border shrink-0 bg-panel z-10 shadow-xs flex flex-col gap-2.5" style={{ minWidth: isNotebookSidebarOpen ? `${notebookSidebarWidth}px` : 'auto' }}>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <Library className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-bold text-main text-sm">Saved Notes</h3>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                     {savedNotes.length}
                  </span>
               </div>
               <button onClick={() => setIsNotebookSidebarOpen(false)} className="text-muted hover:text-main p-1 rounded-md hover:bg-input transition-colors">
                 <AlignLeft className="w-4 h-4" />
               </button>
            </div>

            {/* Search input for Saved Notes */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-muted pointer-events-none" />
              <input
                type="text"
                value={savedNotesSearch}
                onChange={(e) => setSavedNotesSearch(e.target.value)}
                placeholder="Search notes or subjects..."
                className="w-full bg-input border border-panel-border rounded-lg pl-7 pr-6 py-1 text-xs text-main placeholder:text-muted focus:outline-none focus:border-emerald-500/50"
              />
              {savedNotesSearch && (
                <button
                  onClick={() => setSavedNotesSearch("")}
                  className="absolute right-2 top-1.5 text-muted hover:text-main"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-input p-0.5 rounded-lg border border-panel-border text-[10px] font-bold">
              {(["all", "new", "reviewing", "mastered"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSavedNotesStatusFilter(st)}
                  className={`flex-1 py-0.5 rounded-md capitalize transition-all ${
                    savedNotesStatusFilter === st
                      ? "bg-panel text-main font-black border border-panel-border shadow-2xs"
                      : "text-muted hover:text-main"
                  }`}
                >
                  {st === "all" ? "All" : st === "new" ? "New" : st === "reviewing" ? "Review" : "Done"}
                </button>
              ))}
            </div>
         </div>

         <div className="p-2.5 flex flex-col gap-1 flex-1 overflow-y-auto min-h-0" style={{ minWidth: isNotebookSidebarOpen ? `${notebookSidebarWidth}px` : 'auto' }}>
             {filteredSavedNotes.length === 0 ? (
                 <div className="p-6 text-center text-xs text-muted flex flex-col items-center justify-center gap-2">
                     <FileText className="w-7 h-7 opacity-30 text-emerald-500" />
                     <p className="font-semibold text-main">
                       {savedNotes.length === 0
                         ? "No saved notes yet"
                         : "No matching notes found"}
                     </p>
                     <p className="text-[11px] text-muted/80 max-w-[180px]">
                       {savedNotes.length === 0
                         ? "Generated notes will appear here for revision & export."
                         : "Try clearing your search term or status filter."}
                     </p>
                 </div>
             ) : (
                Object.values(buildFolderTree(filteredSavedNotes)).map((node) => (
                  <FolderNodeComponent
                    key={node.name}
                    node={node}
                    currentNoteId={currentNoteId}
                    onLoadNote={loadNote}
                    onDeleteNote={deleteNote}
                    onUpdateStatus={updateNoteStatus}
                  />
                ))
             )}
         </div>
         {isNotebookSidebarOpen && (
            <div 
              className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-emerald-500/50 z-30 transition-colors group"
              onMouseDown={handleSidebarDrag}
            >
               <div className="absolute top-1/2 -mt-4 -left-1 w-2 h-8 rounded-full bg-panel border border-panel-border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-0.5 h-3 bg-muted rounded-full mx-[1px]" />
                  <div className="w-0.5 h-3 bg-muted rounded-full mx-[1px]" />
               </div>
            </div>
         )}
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden print:overflow-visible print:h-auto">
      {!isNotebookSidebarOpen && (
         <button
            onClick={() => setIsNotebookSidebarOpen(true)}
            className="absolute top-6 left-4 z-30 flex items-center justify-center p-2 bg-panel border border-panel-border shadow-sm rounded-lg text-muted hover:text-main transition-colors print:hidden"
            title="Open Saved Notes"
         >
            <AlignLeft className="w-4 h-4" />
         </button>
      )}
      {notes && (
        <div className="absolute top-0 left-0 w-full h-1 z-50 pointer-events-none print:hidden">
          <div className="h-full bg-accent transition-all duration-100 ease-out" style={{ width: `${scrollProgress}%` }} />
        </div>
      )}
      <div 
        className="flex-1 overflow-y-auto w-full relative transition-all duration-500 print:overflow-visible print:h-auto"
        ref={scrollRef}
        onClick={() => {
           if (isSidebarOpen) setIsSidebarOpen(false);
           if (activeMarkToken) setActiveMarkToken(null);
           if (noteInputParams) setNoteInputParams(null);
        }}
      >
        <div className={`p-4 md:p-8 mx-auto w-full flex-1 pb-16 transition-all duration-500 print:max-w-none print:p-0 print:m-0 print:pb-0 ${isZenMode ? "max-w-3xl" : "max-w-5xl"}`}>
        {!isZenMode && (
          <>
            <header className="mb-10 text-center space-y-4 print:hidden">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-panel shadow-sm text-accent">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-main tracking-tight">
                  Concept Notes
                </h2>
                <p className="text-muted mt-2 text-[15px]">
                  Generate high-yield, structured notes aligned with the UPSC
                  syllabus.
                </p>
              </div>
            </header>

            <form
              onSubmit={handleGenerate}
              className="glass-panel p-8 rounded-3xl shadow-sm flex flex-col gap-6 mb-8 relative overflow-hidden print:hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent rounded-full blur-3xl -mr-10 -mt-10 opacity-10 pointer-events-none" />

              <div className="flex flex-col md:flex-row gap-5">
                <div className="w-full md:w-1/3 flex flex-col gap-2 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-muted tracking-wide uppercase">
                      Select Subject
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoCategorizeTopic}
                      disabled={!topic.trim() || isAutoCategorizingTopic}
                      className="text-[11px] font-bold text-accent tracking-wide uppercase hover:underline flex items-center gap-1 disabled:opacity-40"
                      title="Auto detect subject based on topic"
                    >
                      {isAutoCategorizingTopic ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Auto-Detect
                    </button>
                  </div>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-panel-border px-4 py-3 bg-input focus:bg-input focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all font-medium text-main"
                  >
                    <option value="General Studies 1">General Studies I</option>
                    <option value="General Studies 2">General Studies II</option>
                    <option value="General Studies 3">General Studies III</option>
                    <option value="General Studies 4">
                      General Studies IV (Ethics)
                    </option>
                    <option value="Law Optional">Law Optional</option>
                    <option value="Essay">Essay</option>
                  </select>
                </div>

                <div className="w-full md:w-2/3 flex flex-col gap-2 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-muted tracking-wide uppercase">
                      Topic to Cover
                    </label>
                    <label className="text-[11px] font-bold text-accent tracking-wide uppercase cursor-pointer hover:underline flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      OCR Scan
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleOCRScan} />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Basic Structure Doctrine..."
                    className="w-full rounded-xl border border-panel-border px-4 py-3 bg-input focus:bg-input focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all font-medium text-main placeholder-light"
                  />
                </div>
              </div>

              {/* Row 2: Deep-dive toggle & Submit */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-panel-border/40 relative z-10">
                <label className="flex items-start gap-3 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    checked={isDeepDive}
                    onChange={(e) => setIsDeepDive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-10 h-6 bg-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-panel-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent border border-panel-border/60 transition-colors shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-main group-hover:text-accent transition-colors flex items-center gap-1.5">
                      UPSC Deep-Dive Mode (Exhaustive & Granular)
                      <span className="text-[9px] bg-accent/15 text-accent px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">High Yield</span>
                    </span>
                    <span className="text-[11.5px] text-muted">
                      Adds historical roots, detailed judgements, commission stances, and balanced critiques.
                    </span>
                  </div>
                </label>

                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isLoading && topic.trim()) {
                      handleGenerate(e);
                    }
                  }}
                  onTouchEnd={(e) => {
                    if (!isLoading && topic.trim()) {
                      e.preventDefault();
                      handleGenerate(e);
                    }
                  }}
                  disabled={!topic.trim() || isLoading}
                  className="w-full sm:w-auto shrink-0 bg-accent hover:opacity-90 text-white rounded-xl px-8 py-3 font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 h-[48px] shadow-sm cursor-pointer select-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Synthesize
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

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

        {notes && (
          <div className={`rounded-3xl p-6 md:p-10 relative mb-8 group transition-all duration-500 ${isZenMode ? "bg-transparent" : "glass-panel shadow-sm"}`}>
            <div className="absolute top-4 right-6 flex items-center gap-3 z-10 print:hidden">
              <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[11px] font-bold tracking-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Grounded (2025–2026)
              </span>
              <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                {subject}
              </span>
              <button
                onClick={() => {
                  if (showSummary) setShowSummary(false);
                  else handleSummarize();
                }}
                disabled={isSummarizing}
                className={`transition-colors border shadow-sm flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  showSummary 
                    ? "bg-accent/10 border-accent/20 text-accent" 
                    : "bg-panel border-panel-border text-muted hover:text-main hover:border-sidebar-border"
                } disabled:opacity-50`}
                title="Summarize Note"
              >
                {isSummarizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlignLeft className="w-3.5 h-3.5" />}
                {showSummary ? "Hide TL;DR" : "TL;DR"}
              </button>
              <button
                onClick={() => {
                  if (showFlashcardsModule) setShowFlashcardsModule(false);
                  else handleGenerateFlashcards();
                }}
                disabled={isGeneratingFlashcards}
                className={`transition-colors border shadow-sm flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  showFlashcardsModule 
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                    : "bg-panel border-panel-border text-muted hover:text-main hover:border-sidebar-border"
                } disabled:opacity-50`}
                title="Generate and study active recall deck from these notes"
              >
                {isGeneratingFlashcards ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                {showFlashcardsModule ? "Hide Recall Cards" : "Recall Deck"}
              </button>
              <button
                onClick={() => setIsZenMode(!isZenMode)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-main p-1 rounded-md border border-transparent shadow-sm"
                title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode (Focus)"}
              >
                {isZenMode ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
              <button
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-main p-1 rounded-md border border-transparent shadow-sm"
                title="Copy notes"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            {/* Notes Content Section */}

            {showFlashcardsModule && (
              <div className="mb-8 p-6 bg-amber-500/5 rounded-2xl border border-amber-500/20 relative select-none print:hidden max-w-[75ch] mx-auto">
                <div className="absolute top-4 right-4">
                  <button 
                    onClick={() => setShowFlashcardsModule(false)}
                    className="text-muted hover:text-main transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl shadow-xs">
                    <Sparkles className="w-4 h-4 fill-amber-500/10" />
                  </span>
                  <div>
                    <h3 className="font-bold text-main text-sm">UPSC Active Recall Quiz</h3>
                    <p className="text-[11px] text-muted">Test your memory retrieval on the core facts of this note.</p>
                  </div>
                </div>

                {isGeneratingFlashcards ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    <p className="text-sm font-medium">Extracting key constitutional Articles, landmark judgements, and UPSC facts...</p>
                  </div>
                ) : flashcards && flashcards.length > 0 ? (
                  <div className="flex flex-col gap-5">
                    {/* Progress Bar */}
                    <div className="w-full bg-input rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-amber-500 h-1.5 transition-all duration-300" 
                        style={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted font-semibold">
                      <span>Card {currentCardIndex + 1} of {flashcards.length}</span>
                      <span className="font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                        {Object.values(cardStatus).filter(s => s === 'learned').length} Mastered
                      </span>
                    </div>

                    {/* Flippable Card Container */}
                    <div 
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                      className={`min-h-[160px] cursor-pointer rounded-xl border p-6 flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden ${
                        isCardFlipped 
                          ? "bg-amber-50/50 dark:bg-amber-950/10 border-amber-300/50 shadow-xs" 
                          : "bg-panel hover:bg-panel/90 border-panel-border hover:border-amber-500/30 shadow-xs"
                      }`}
                    >
                      <div className="absolute top-2.5 right-2.5 text-[9px] uppercase font-bold tracking-widest text-muted px-2 py-0.5 bg-input rounded-sm flex items-center gap-1">
                        <ArrowLeftRight className="w-2.5 h-2.5 text-amber-500" />
                        <span>Click Card to Flip</span>
                      </div>

                      {!isCardFlipped ? (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Question</span>
                          <p className="text-[15px] font-serif font-bold text-main leading-relaxed px-4">
                            {flashcards[currentCardIndex].question}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 text-left w-full">
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">High Yield Answer & Facts</span>
                          <div className="text-[13.5px] text-main leading-relaxed px-2 font-medium space-y-1 pt-1.5">
                            {flashcards[currentCardIndex].answer.split('\n').map((line: string, i: number) => (
                              <p key={i} className="mb-1 leading-relaxed">{line}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Interactive Controls */}
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCardFlipped(false);
                          setCurrentCardIndex(prev => Math.max(0, prev - 1));
                        }}
                        disabled={currentCardIndex === 0}
                        className="text-xs font-semibold text-muted hover:text-main disabled:opacity-30 transition-colors flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCardStatus(prev => ({ ...prev, [currentCardIndex]: 'review' }));
                            if (currentCardIndex < flashcards.length - 1) {
                              setIsCardFlipped(false);
                              setCurrentCardIndex(prev => prev + 1);
                            }
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            cardStatus[currentCardIndex] === 'review'
                              ? "bg-red-500 text-white shadow-xs"
                              : "bg-input border border-panel-border text-muted hover:text-red-500 hover:border-red-500/30"
                          }`}
                        >
                          Need Review
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCardStatus(prev => ({ ...prev, [currentCardIndex]: 'learned' }));
                            if (currentCardIndex < flashcards.length - 1) {
                              setIsCardFlipped(false);
                              setCurrentCardIndex(prev => prev + 1);
                            }
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            cardStatus[currentCardIndex] === 'learned'
                              ? "bg-emerald-500 text-white shadow-xs"
                              : "bg-input border border-panel-border text-muted hover:text-emerald-500 hover:border-emerald-500/30"
                          }`}
                        >
                          Mastered ✓
                        </button>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentCardIndex < flashcards.length - 1) {
                            setIsCardFlipped(false);
                            setCurrentCardIndex(prev => prev + 1);
                          }
                        }}
                        disabled={currentCardIndex === flashcards.length - 1}
                        className="text-xs font-semibold text-muted hover:text-main disabled:opacity-30 transition-colors flex items-center gap-1"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Completion Summary Card */}
                    {Object.keys(cardStatus).length === flashcards.length && (
                      <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center flex flex-col items-center gap-1 animate-fade-in">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        <h4 className="text-sm font-bold text-main">Recall Session Completed!</h4>
                        <p className="text-xs text-muted">
                          You mastered {Object.values(cardStatus).filter(s => s === 'learned').length} of {flashcards.length} cards. Excellent for memory consolidation.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-muted">
                    No flashcards generated. Please click the button to try again.
                  </div>
                )}
              </div>
            )}
            
            {showSummary && (
              <div className="mb-8 p-6 bg-accent/5 rounded-2xl border border-accent/20 flex items-start gap-4 max-w-[75ch] mx-auto">
                <div className="p-2 bg-accent/10 rounded-xl text-accent shrink-0">
                  <AlignLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-main mb-2">Topic Summary (TL;DR)</h3>
                  {isSummarizing ? (
                    <div className="flex items-center gap-2 text-muted">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <p className="text-sm">Synthesizing core concepts...</p>
                    </div>
                  ) : (
                    <div className="text-[15px] leading-relaxed markdown-body prose prose-sm sm:prose-base prose-slate max-w-none prose-headings:text-main prose-headings:font-bold prose-p:text-main/90 prose-li:text-main/90 prose-strong:text-main prose-p:my-1" style={{ "--tw-prose-body": "var(--text-main)" } as any}>
                       <Markdown remarkPlugins={[remarkGfm]}>{summary}</Markdown>
                    </div>
                  )}
                </div>
              </div>
            )}



            <div
              id="notes-content"
              className="prose prose-sm sm:prose-base prose-slate max-w-[75ch] mx-auto text-main prose-headings:text-main prose-headings:font-bold prose-headings:font-sans prose-headings:tracking-tight prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-5 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:leading-relaxed prose-p:text-main/95 prose-li:text-main/95 prose-strong:text-main prose-strong:font-bold prose-ul:list-disc prose-ol:list-decimal prose-li:my-1.5 relative px-2 sm:px-4"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                const mark = target.closest('mark');
                if (mark && mark.id) {
                  const rect = mark.getBoundingClientRect();
                  const container = document.getElementById("notes-content");
                  if (container) {
                    const containerRect = container.getBoundingClientRect();
                    setActiveMarkToken({
                      id: mark.id,
                      top: Math.max(0, rect.top - containerRect.top - 40),
                      left: Math.max(0, rect.left - containerRect.left + (rect.width / 2) - 20),
                      note: mark.getAttribute("data-note") || mark.title || null
                    });
                  }
                } else {
                  setActiveMarkToken(null);
                }
              }}
            >
              {activeMarkToken && (
                <div 
                  className="absolute z-50 bg-[#fffde7] dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 shadow-xl rounded-md flex flex-col w-64"
                  style={{ top: activeMarkToken.top, left: activeMarkToken.left }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2 py-1.5 flex items-center justify-between border-b border-yellow-200 dark:border-yellow-800/50 bg-yellow-100/50 dark:bg-yellow-800/20">
                    <span className="text-[10px] font-bold text-yellow-800 dark:text-yellow-200 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3" /> Note
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => {
                          setNotes(prev => {
                            const rx = new RegExp(`<mark id="${activeMarkToken.id}"[^>]*>([\\s\\S]*?)<\\/mark>`);
                            const updated = prev.replace(rx, '$1');
                            if (currentNoteId) {
                              setSavedNotes(prevSaved => prevSaved.map(n => n.id === currentNoteId ? { ...n, content: updated } : n));
                            }
                            return updated;
                          });
                          setActiveMarkToken(null);
                        }}
                        className="p-1 text-yellow-700 hover:bg-yellow-200 dark:text-yellow-300 dark:hover:bg-yellow-800 rounded transition-colors"
                        title="Delete annotation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => setActiveMarkToken(null)}
                        className="p-1 text-yellow-700 hover:bg-yellow-200 dark:text-yellow-300 dark:hover:bg-yellow-800 rounded transition-colors"
                        title="Close Note"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {activeMarkToken.note ? (
                    <div className="px-3 py-2 text-sm text-yellow-950 dark:text-yellow-50 whitespace-pre-wrap leading-relaxed">
                      {activeMarkToken.note}
                    </div>
                  ) : (
                    <div className="px-3 py-2 text-[11px] text-yellow-800/70 dark:text-yellow-200/50 italic">
                      Highlighted text
                    </div>
                  )}
                </div>
              )}

              {annotationPos && selectedText && !noteInputParams && (
                <div 
                  className="absolute z-50 bg-panel border border-panel-border shadow-lg rounded-xl flex items-center p-1.5 gap-1 annotation-toolbar"
                  style={{ top: annotationPos.top, left: annotationPos.left }}
                  onMouseDown={(e) => e.preventDefault()} // prevent selection loss
                  onClick={(e) => e.stopPropagation()}
                >
                  <button onMouseDown={(e) => {e.preventDefault(); e.stopPropagation();}} onClick={(e) => {e.preventDefault(); e.stopPropagation(); applyHighlight("bg-yellow-200 text-yellow-900", "");}} className="w-8 h-8 rounded-full bg-yellow-200 hover:scale-110 transition-transform shadow-sm flex items-center justify-center border border-yellow-300" title="Highlight Yellow"></button>
                  <button onMouseDown={(e) => {e.preventDefault(); e.stopPropagation();}} onClick={(e) => {e.preventDefault(); e.stopPropagation(); applyHighlight("bg-emerald-200 text-emerald-900", "");}} className="w-8 h-8 rounded-full bg-emerald-200 hover:scale-110 transition-transform shadow-sm flex items-center justify-center border border-emerald-300" title="Highlight Green"></button>
                  <button onMouseDown={(e) => {e.preventDefault(); e.stopPropagation();}} onClick={(e) => {e.preventDefault(); e.stopPropagation(); applyHighlight("bg-pink-200 text-pink-900", "");}} className="w-8 h-8 rounded-full bg-pink-200 hover:scale-110 transition-transform shadow-sm flex items-center justify-center border border-pink-300" title="Highlight Pink"></button>
                  <button onMouseDown={(e) => {e.preventDefault(); e.stopPropagation();}} onClick={(e) => {e.preventDefault(); e.stopPropagation(); applyHighlight("bg-blue-200 text-blue-900", "");}} className="w-8 h-8 rounded-full bg-blue-200 hover:scale-110 transition-transform shadow-sm flex items-center justify-center border border-blue-300" title="Highlight Blue"></button>
                  <button onMouseDown={(e) => {e.preventDefault(); e.stopPropagation();}} onClick={(e) => {e.preventDefault(); e.stopPropagation(); applyHighlight("bg-transparent border-b-2 border-main", "");}} className="w-8 h-8 rounded-lg bg-transparent hover:bg-input transition-colors flex items-center justify-center border-b-2 border-main" title="Underline">U</button>
                  <div className="w-px h-6 bg-panel-border mx-1"></div>
                  <button onMouseDown={(e) => {e.preventDefault(); e.stopPropagation();}} onClick={(e) => {e.preventDefault(); e.stopPropagation(); setNoteInputParams({ text: selectedText, colorClass: "bg-yellow-200 text-yellow-900"});}} className="w-8 h-8 rounded-lg text-muted hover:text-main hover:bg-input transition-colors flex items-center justify-center" title="Add Note">
                    <MessageSquarePlus className="w-4 h-4" />
                  </button>
                </div>
              )}

              {noteInputParams && annotationPos && (
                <div 
                  id="annotation-note-input"
                  className="absolute z-50 bg-panel border border-panel-border shadow-xl rounded-xl p-3 flex flex-col gap-2 min-w-[250px] annotation-toolbar"
                  style={{ top: annotationPos.top - 20, left: annotationPos.left }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Add Note</span>
                    <button onClick={() => setNoteInputParams(null)} className="text-muted hover:text-main">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea 
                    value={annotationNote}
                    onChange={(e) => setAnnotationNote(e.target.value)}
                    placeholder="Type your note here..."
                    className="w-full text-sm bg-input border border-panel-border rounded-lg p-2 resize-none focus:outline-none focus:border-accent text-main"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2 mt-1">
                    <button onMouseDown={(e) => {e.preventDefault(); e.stopPropagation();}} onClick={(e) => {e.preventDefault(); e.stopPropagation(); setNoteInputParams(null);}} className="px-3 py-1.5 text-[11px] font-semibold text-muted hover:text-main transition-colors">Cancel</button>
                    <button onMouseDown={(e) => {e.preventDefault(); e.stopPropagation();}} onClick={(e) => {e.preventDefault(); e.stopPropagation(); applyHighlight("bg-yellow-200 text-yellow-900 border-b-2 border-yellow-400", annotationNote, noteInputParams.text);}} className="px-3 py-1.5 text-[11px] font-semibold bg-accent text-white rounded-lg shadow-sm hover:opacity-90 transition-opacity">Save Note</button>
                  </div>
                </div>
              )}

              <Markdown 
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw]}
                components={markdownComponents}
              >
                {cleanLeakedNoteJson(notes)}
              </Markdown>
            </div>

            <div className="mt-8 pt-6 border-t border-panel-border flex justify-end gap-3 print:hidden">
              <button
                onClick={() => {
                  exportToPDF("notes-content", topic || "UPSC_Notes");
                }}
                className="flex items-center gap-2 bg-input border border-panel-border hover:bg-panel text-main px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm cursor-pointer hover:border-emerald-500/50"
              >
                <Printer className="w-4 h-4 text-emerald-500" />
                Print / Export Notes
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
            {/* End Notes Content Section */}
            </div>
        )}
      </div>
      </div>
      </div>

      {hoveredTerm && hoveredTermPosition && (
         <div
            ref={hoveredTermRef}
            onMouseEnter={() => {
              if (hoverLeaveTimerRef.current) {
                clearTimeout(hoverLeaveTimerRef.current);
                hoverLeaveTimerRef.current = null;
              }
            }}
            onMouseLeave={() => {
              if (hoverLeaveTimerRef.current) clearTimeout(hoverLeaveTimerRef.current);
              hoverLeaveTimerRef.current = setTimeout(() => {
                setHoveredTerm(null);
              }, 200);
            }}
            style={{
               top: hoveredTermPosition.top + 8,
               left: Math.max(8, Math.min(hoveredTermPosition.left, window.innerWidth - 340)),
            }}
            className="absolute z-50 bg-panel border-2 border-accent/45 backdrop-blur-md shadow-2xl rounded-2xl w-[320px] p-5 transition-all duration-300 animate-in fade-in slide-in-from-top-1 font-sans text-left border-l-4 border-l-accent"
         >
            <div className="flex items-start justify-between mb-3">
               <div>
                  <span className="text-[10px] font-bold text-accent uppercase tracking-widest block mb-0.5 select-none">
                     {definitionsCache[hoveredTerm.toLowerCase()]?.category || "GS Curriculum Core"}
                  </span>
                  <h4 className="font-extrabold text-[15px] text-main">
                     {hoveredTerm}
                  </h4>
               </div>
               <div className="flex items-center gap-1.5">
                  <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.5 rounded font-black uppercase font-mono tracking-wider select-none animate-pulse">
                     AI Explainer
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHoveredTerm(null);
                    }}
                    className="p-1 rounded-md text-muted hover:text-main hover:bg-input transition-colors cursor-pointer"
                    title="Dismiss Note (Esc)"
                    aria-label="Dismiss note"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
               </div>
            </div>
            {isFetchingTerm && !definitionsCache[hoveredTerm.toLowerCase()] ? (
               <div className="flex items-center gap-2 py-3 justify-center text-[11px] text-muted font-semibold bg-input rounded-xl border border-panel-border/40 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping inline-block"></span>
                  <span>Consulting UPSC Syllabus...</span>
               </div>
            ) : (
               <p className="text-[13px] leading-relaxed text-muted font-medium bg-input/40 p-3 rounded-xl border border-panel-border/30">
                  {definitionsCache[hoveredTerm.toLowerCase()]?.desc || "Compiling academic notes..."}
               </p>
            )}
            <div className="mt-4 pt-3 border-t border-panel-border/45 flex items-center justify-between text-[10px] text-muted select-none font-bold">
               <button
                 type="button"
                 onClick={() => setHoveredTerm(null)}
                 className="text-muted hover:text-main underline cursor-pointer"
               >
                 Dismiss
               </button>
               <button
                 type="button"
                 onClick={() => {
                   setSelectedSyllabusTerm(hoveredTerm);
                   setSidebarTab("knowledge-graph");
                   setIsSidebarOpen(true);
                   setHoveredTerm(null);
                 }}
                 className="text-accent hover:underline font-bold cursor-pointer flex items-center gap-1"
               >
                 <span>D3 Graph Sync</span>
                 <span>→</span>
               </button>
            </div>
         </div>
      )}

      {/* Floating Table of Contents Panel (Single Draggable & Collapsible Overlay) */}
      {notes && !isZenMode && (
        <div 
          style={
            tocPinnedSide === "left"
              ? {
                  left: "24px",
                  top: `${tocPosition.y}px`,
                  touchAction: "none"
                }
              : tocPinnedSide === "right"
              ? {
                  right: "24px",
                  top: `${tocPosition.y}px`,
                  touchAction: "none"
                }
              : {
                  right: `${tocPosition.x}px`,
                  top: `${tocPosition.y}px`,
                  touchAction: "none"
                }
          }
          className={`fixed z-40 transition-all duration-200 print:hidden flex flex-col select-none ${
            isDraggingToc ? "cursor-grabbing scale-[0.98]" : ""
          }`}
        >
          {isTocCollapsed ? (
            /* Unobtrusive Small Collapsed Pill Button */
            <div
              onMouseDown={handleTocDragStart}
              onTouchStart={handleTocDragStart}
              onClick={() => setIsTocCollapsed(false)}
              className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-panel/90 backdrop-blur-md border border-panel-border shadow-md hover:border-emerald-500/50 hover:bg-input hover:shadow-lg transition-all cursor-pointer"
              title="Click to view Note Outline (Drag to reposition)"
            >
              <GripVertical className="w-3.5 h-3.5 text-muted/50 cursor-grab active:cursor-grabbing shrink-0" />
              <AlignLeft className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="font-extrabold text-[11px] text-main tracking-wider hidden sm:inline">Outline</span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-bold px-1.5 py-0.2 rounded-full shrink-0">
                {Math.round(scrollProgress)}%
              </span>
              <Maximize className="w-3 h-3 text-muted group-hover:text-main transition-colors shrink-0 ml-0.5" />
            </div>
          ) : (
            /* Full Expanded Note Outline Panel */
            <div className="w-[310px] sm:w-[330px] max-h-[80vh] md:max-h-[480px] bg-panel/95 backdrop-blur-md border border-panel-border rounded-3xl shadow-2xl flex flex-col">
              {/* Header & Drag Handle */}
              <div 
                onMouseDown={handleTocDragStart}
                onTouchStart={handleTocDragStart}
                className="flex items-center justify-between p-3.5 cursor-grab active:cursor-grabbing hover:bg-input/20 rounded-t-3xl transition-colors border-b border-panel-border/50"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <GripVertical className="w-4 h-4 text-muted/60 shrink-0 cursor-grab active:cursor-grabbing" />
                  <div className="flex items-center gap-1.5 min-w-0">
                    <AlignLeft className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-extrabold text-[12.5px] text-main uppercase tracking-wider truncate">Note Outline</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {/* Switch Side Button */}
                  {tocPinnedSide !== null && (
                    <button
                      onClick={() => setTocPinnedSide(tocPinnedSide === "left" ? "right" : "left")}
                      className="text-muted hover:text-main p-1.5 rounded-xl hover:bg-input transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                      title={`Move to ${tocPinnedSide === "left" ? "Right" : "Left"} Edge`}
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Pin Toggle Button */}
                  <button
                    onClick={() => {
                      if (tocPinnedSide !== null) {
                        setTocPinnedSide(null);
                      } else {
                        const isNearLeft = tocPosition.x > (window.innerWidth / 2);
                        setTocPinnedSide(isNearLeft ? "left" : "right");
                      }
                    }}
                    className={`p-1.5 rounded-xl transition-all cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center ${
                      tocPinnedSide !== null 
                        ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20" 
                        : "text-muted hover:text-main hover:bg-input border border-transparent"
                    }`}
                    title={tocPinnedSide !== null ? "Unpin from screen edge" : "Pin to screen edge"}
                  >
                    <Pin className={`w-3.5 h-3.5 ${tocPinnedSide !== null ? "rotate-45 text-emerald-500" : ""}`} />
                  </button>

                  <button
                    onClick={() => setIsTocCollapsed(true)}
                    className="text-muted hover:text-main p-1.5 rounded-xl hover:bg-input transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                    title="Collapse Outline"
                  >
                    <Minimize className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Collapsible Content */}
              <div className="p-4 flex flex-col gap-3.5 min-h-0">
                {/* Reading Status Widget */}
                <div className="bg-input/60 rounded-xl p-3 border border-panel-border/40 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center text-[9.5px] font-bold text-muted uppercase">
                    <span>Read Progress</span>
                    <span>{Math.round(scrollProgress)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-panel rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-panel-border/20 text-[10px] text-muted font-medium">
                    <span>Est. Reading Time</span>
                    <span>{Math.max(1, Math.ceil(notes.split(/\s+/).length / 200))} min</span>
                  </div>
                </div>

                {/* Outline List (with custom scrollbar styles) */}
                <div className="flex flex-col gap-1 pr-1 overflow-y-auto max-h-[30vh] md:max-h-[220px] custom-scrollbar scroll-smooth">
                  {notesHeadings.map((heading, idx) => {
                    const isH2 = heading.level === 2;
                    const isActive = activeHeadingId === heading.id;
                    return (
                      <button
                        key={`${heading.id}-float-${idx}`}
                        onClick={() => {
                          const element = document.getElementById(heading.id);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            // Highlight target heading briefly
                            const originalClass = element.className;
                            element.className = `${originalClass} ring-4 ring-emerald-500 ring-opacity-25 rounded px-2 -mx-2 transition-all duration-500`;
                            setTimeout(() => {
                              element.className = originalClass;
                            }, 2000);
                          }
                        }}
                        className={`text-left transition-all flex items-start gap-2 cursor-pointer py-1.5 px-2 rounded-lg border min-w-0 ${
                          isActive 
                            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold" 
                            : "bg-transparent border-transparent text-muted hover:text-main hover:bg-input/40"
                        } ${isH2 ? "text-[12.5px]" : "text-[11px] pl-5"}`}
                      >
                        <span className={`mt-1 shrink-0 select-none text-[10px] ${isActive ? "text-emerald-500" : "text-muted/40"}`}>
                          {isH2 ? "✦" : "↳"}
                        </span>
                        <span className="truncate">{heading.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Back to Top */}
                <button
                  onClick={() => {
                    if (scrollRef.current) {
                      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className="w-full mt-1 pt-3 border-t border-panel-border/60 text-center text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-center gap-1 cursor-pointer"
                >
                  ↑ Back to Top
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
