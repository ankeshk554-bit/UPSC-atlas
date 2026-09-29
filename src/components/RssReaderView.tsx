import { apiFetch } from '../lib/api';
import React, { useState, useEffect } from "react";
import {
  Rss,
  Plus,
  Trash2,
  BookOpen,
  Brain,
  Loader2,
  Search,
  Type,
  Sparkles,
  PlusCircle,
  Check,
  ArrowUpRight,
  Copy,
  Save,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw, PanelLeftOpen, PanelLeftClose,
  ZoomIn,
  ZoomOut,
  CheckCheck,
  Edit2,
  ChevronLeft,
  MessageSquare,
  X,
  Settings2,
  Download,
  Maximize, Highlighter,
  Minimize,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";
import { DeepSeekModel } from "../types";
import { Topic, initialSyllabus } from "./SyllabusTracker";
import { exportToPDF } from "../lib/exportPdf";
import { safeLocalStorageGet, safeLocalStorageSet } from "../lib/storage";

const getCategoryStyles = (category?: string) => {
  if (!category) return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  const cat = category.toLowerCase();
  if (cat.includes('polity') || cat.includes('gov')) return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
  if (cat.includes('econ')) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (cat.includes('opinion') || cat.includes('editorial')) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  if (cat.includes('international') || cat.includes('ir') || cat.includes('world')) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  if (cat.includes('env') || cat.includes('eco') || cat.includes('geo')) return "bg-teal-500/10 text-teal-500 border-teal-500/20";
  if (cat.includes('sci') || cat.includes('tech')) return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
  if (cat.includes('hist') || cat.includes('cult')) return "bg-accent/10 text-accent border-accent/20";
  if (cat.includes('ethic')) return "bg-rose-500/10 text-rose-500 border-rose-500/20";
  if (cat.includes('soci') || cat.includes('issue')) return "bg-pink-500/10 text-pink-500 border-pink-500/20";
  return "bg-accent/10 text-accent border-accent/20";
};

export const FEED_CATEGORIES = ["All", "Opinion", "Environment", "International", "Polity", "Economy", "Science & Tech", "General"];

export function categorizeItemClientSide(item: { title: string; description?: string; link?: string; category?: string; feedName?: string }): string {
  const title = (item.title || "").toLowerCase();
  const desc = (item.description || "").toLowerCase();
  const link = (item.link || "").toLowerCase();
  const feedName = (item.feedName || "").toLowerCase();
  const existingCat = (item.category || "").toLowerCase();

  // 1. Opinion / Editorial
  if (
    feedName.includes("opinion") || 
    feedName.includes("editorial") || 
    feedName.includes("lead") ||
    link.includes("/opinion/") || 
    link.includes("/editorial/") || 
    link.includes("/lead/") ||
    title.includes("editorial") ||
    title.includes("opinion") ||
    existingCat.includes("opinion") ||
    existingCat.includes("editorial")
  ) {
    return "Opinion";
  }

  // 2. Environment
  if (
    feedName.includes("environment") ||
    feedName.includes("ecology") ||
    feedName.includes("climate") ||
    link.includes("environment") ||
    link.includes("climate") ||
    link.includes("energy") ||
    title.includes("climate") ||
    title.includes("environment") ||
    title.includes("wildlife") ||
    title.includes("biodiversity") ||
    title.includes("pollution") ||
    title.includes("ecology") ||
    title.includes("conservation") ||
    desc.includes("climate change") ||
    desc.includes("global warming") ||
    desc.includes("greenhouse") ||
    desc.includes("ecology") ||
    desc.includes("wildlife") ||
    existingCat.includes("environment") ||
    existingCat.includes("ecology") ||
    existingCat.includes("climate")
  ) {
    return "Environment";
  }

  // 3. International Relations
  if (
    feedName.includes("international") ||
    feedName.includes("world") ||
    feedName.includes("asia") ||
    link.includes("international") ||
    link.includes("world") ||
    link.includes("foreign") ||
    title.includes("bilateral") ||
    title.includes("geopolitics") ||
    title.includes("diplomatic") ||
    title.includes("china") ||
    title.includes("us-") ||
    title.includes("un ") ||
    title.includes("united nations") ||
    title.includes("g20") ||
    title.includes("asean") ||
    title.includes("summit") ||
    title.includes("treaty") ||
    title.includes("global affairs") ||
    desc.includes("foreign policy") ||
    desc.includes("international relations") ||
    desc.includes("diplomatic") ||
    existingCat.includes("international") ||
    existingCat.includes("world") ||
    existingCat.includes("ir")
  ) {
    return "International";
  }

  // 4. Polity & Governance
  if (
    feedName.includes("national") ||
    feedName.includes("polity") ||
    feedName.includes("governance") ||
    feedName.includes("livelaw") ||
    feedName.includes("bar and bench") ||
    feedName.includes("prs") ||
    link.includes("national") ||
    link.includes("law") ||
    link.includes("court") ||
    title.includes("supreme court") ||
    title.includes("parliament") ||
    title.includes("constitution") ||
    title.includes("bill") ||
    title.includes("judiciary") ||
    title.includes("election") ||
    title.includes("governance") ||
    title.includes("ministry") ||
    desc.includes("high court") ||
    desc.includes("legislation") ||
    desc.includes("sc ruling") ||
    existingCat.includes("polity") ||
    existingCat.includes("gov") ||
    existingCat.includes("law")
  ) {
    return "Polity";
  }

  // 5. Economy
  if (
    feedName.includes("business") ||
    feedName.includes("economy") ||
    feedName.includes("rbi") ||
    link.includes("business") ||
    link.includes("economy") ||
    link.includes("finance") ||
    title.includes("gdp") ||
    title.includes("inflation") ||
    title.includes("gst") ||
    title.includes("budget") ||
    title.includes("fiscal") ||
    title.includes("banking") ||
    title.includes("monetary") ||
    title.includes("trade") ||
    desc.includes("economic") ||
    desc.includes("finance") ||
    desc.includes("rbi") ||
    desc.includes("rupee") ||
    existingCat.includes("econ") ||
    existingCat.includes("business")
  ) {
    return "Economy";
  }

  // 6. Science & Technology
  if (
    feedName.includes("sci-tech") ||
    feedName.includes("science") ||
    feedName.includes("technology") ||
    link.includes("science") ||
    link.includes("tech") ||
    link.includes("space") ||
    title.includes("space") ||
    title.includes("isro") ||
    title.includes("nasa") ||
    title.includes("ai ") ||
    title.includes("artificial intelligence") ||
    title.includes("technology") ||
    title.includes("cyber") ||
    title.includes("quantum") ||
    title.includes("biotech") ||
    desc.includes("scientific") ||
    desc.includes("technological") ||
    desc.includes("researchers") ||
    existingCat.includes("sci") ||
    existingCat.includes("tech")
  ) {
    return "Science & Tech";
  }

  if (item.category) {
    const formatted = item.category.trim();
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  return "General";
}

interface RssFeed {
  id: string;
  name: string;
  url: string;
  isCustom?: boolean;
}

interface RssFeedItem {
  id: string;
  title: string;
  link: string;
  description: string;
  content: string;
  pubDate: string;
  creator?: string;
  feedName?: string;
  category?: string;
}

interface SavedSummary {
  id: string;
  title: string;
  link: string;
  summary?: string;
  date: string;
  feedName?: string;
  content?: string;
  creator?: string;
  tag?: string;
}

export const UPSC_SYLLABUS_TAGS = [
  "GS 1 (History, Geography, Society)",
  "GS 2 (Polity, Constitution, Governance, IR)",
  "GS 3 (Economy, S&T, Environment, Security)",
  "GS 4 (Ethics, Integrity, Aptitude)",
  "Essay Paper",
  "Law Optional",
  "Prelims GS Focus",
  "Current Affairs (General)"
];

const DEFAULT_FEEDS: RssFeed[] = [
  {
    id: "pib-nat",
    name: "PIB - National & Cabinet",
    url: "https://pib.gov.in/RssMain.aspx?ModId=1",
  },
  {
    id: "prs-leg",
    name: "PRS Legislative Research",
    url: "https://prsindia.org/rss/articles",
  },
  {
    id: "hindu-nat",
    name: "The Hindu - National",
    url: "https://www.thehindu.com/news/national/feeder/default.rss",
  },
  {
    id: "hindu-opi",
    name: "The Hindu - Opinion & Editorial",
    url: "https://www.thehindu.com/opinion/feeder/default.rss",
  },
  {
    id: "hindu-int",
    name: "The Hindu - International",
    url: "https://www.thehindu.com/news/international/feeder/default.rss",
  },
  {
    id: "hindu-biz",
    name: "The Hindu - Business & Economy",
    url: "https://www.thehindu.com/business/feeder/default.rss",
  },
  {
    id: "hindu-env",
    name: "The Hindu - Environment & Energy",
    url: "https://www.thehindu.com/sci-tech/energy-and-environment/feeder/default.rss",
  },
  {
    id: "hindu-sci",
    name: "The Hindu - Science & Tech",
    url: "https://www.thehindu.com/sci-tech/science/feeder/default.rss",
  },
  {
    id: "livemint-news",
    name: "Livemint - National & Policy",
    url: "https://www.livemint.com/rss/news",
  },
  {
    id: "livemint-opinion",
    name: "Livemint - Columns & Opinion",
    url: "https://www.livemint.com/rss/opinion",
  },
  {
    id: "livemint-eco",
    name: "Livemint - Macro Economy",
    url: "https://www.livemint.com/rss/economy",
  },
  {
    id: "bbc-india",
    name: "BBC News - India",
    url: "https://feeds.bbci.co.uk/news/world/asia/india/rss.xml",
  },
  {
    id: "ndtv-news",
    name: "NDTV - National News",
    url: "https://feeds.feedburner.com/ndtvnews-india-news",
  }
];

const CLIENT_CURATED_FEEDS: Array<{
  name: string;
  url: string;
  description: string;
  relevance: string;
  tags: string[];
}> = [
  {
    name: "LiveLaw India - Legal, Constitution & Supreme Court",
    url: "https://www.livelaw.in/google_feeds.xml",
    description: "Live coverage of Supreme Court verdicts, constitutional benches, high court decisions, and legal reforms.",
    relevance: "GS Paper 2 - Essential for constitutional morality, judicial review, fundamental rights, and landmark cases.",
    tags: ["livelaw", "live law", "law", "legal", "supreme court", "high court", "judiciary", "constitution", "article 21", "justice"]
  },
  {
    name: "Bar and Bench - Indian Courts & Legal News",
    url: "https://www.barandbench.com/stories.rss",
    description: "Comprehensive reporting on legal affairs, judicial appointments, bar councils, and litigation news.",
    relevance: "GS Paper 2 - Crucial tracking of collegium, PILs, and legal developments.",
    tags: ["bar and bench", "barandbench", "law", "legal", "judiciary", "courts", "collegium", "litigation"]
  },
  {
    name: "The Indian Express - National & Governance",
    url: "https://indianexpress.com/section/india/feed/",
    description: "National coverage, investigative journalism, cabinet developments, and governance tracking.",
    relevance: "GS Paper 2 & 3 - High-yield coverage of policies, national issues, and civil administrative reforms.",
    tags: ["indian express", "indianexpress", "express", "national", "news", "governance", "india"]
  },
  {
    name: "The Indian Express - Opinion & Explained",
    url: "https://indianexpress.com/section/opinion/feed/",
    description: "Authoritative analytical op-eds, constitutional explanations, and policy breakdowns.",
    relevance: "GS Paper 2 & Essay - Ideal for in-depth editorial perspective and mains answer framing.",
    tags: ["indian express", "indianexpress", "express", "opinion", "editorial", "explained", "analysis"]
  },
  {
    name: "The Economic Times - Top Stories & Economy",
    url: "https://economictimes.indiatimes.com/rssfeedsdefault.cms",
    description: "Macroeconomic indicators, fiscal policies, market trends, infrastructure, and trade dynamics.",
    relevance: "GS Paper 3 - Prime tracker for Indian economic policy, taxation, GDP, and industrial corridors.",
    tags: ["economic times", "economictimes", "economy", "business", "finance", "markets", "trade", "fiscal"]
  },
  {
    name: "Down To Earth - Environment & Forest Conservation",
    url: "https://www.downtoearth.org.in/stories.rss",
    description: "Scientific tracking of wildlife reserves, forestry policies, climate change panels, and conservation projects.",
    relevance: "GS Paper 3 - Indispensable for environment protocols, Ramsar sites, wildlife acts, and climate summits.",
    tags: ["downtoearth", "down to earth", "environment", "climate", "ecology", "forest", "wildlife", "conservation", "ramsar"]
  },
  {
    name: "Manohar Parrikar IDSA - Defense & Geopolitics",
    url: "https://idsa.in/feed",
    description: "India's premier security and defense think-tank analyzing national security, borders, and military modernization.",
    relevance: "GS Paper 3 - Internal security, border management, defense acquisitions, and nuclear policy.",
    tags: ["idsa", "defense", "security", "military", "strategic", "geopolitics", "internal security", "borders"]
  },
  {
    name: "Press Information Bureau (PIB) - National & Cabinet",
    url: "https://pib.gov.in/RssMain.aspx?ModId=1",
    description: "Official statements, cabinet decisions, government schemes, and ministry notifications from the Government of India.",
    relevance: "GS Paper 2 & 3 - Primary authoritative source for policy, schemes, and official press communiques.",
    tags: ["pib", "press information bureau", "government", "cabinet", "policy", "schemes", "ministry", "national", "official", "governance"]
  },
  {
    name: "PRS Legislative Research - Parliament & Bills",
    url: "https://prsindia.org/rss/articles",
    description: "Objective analysis of parliamentary bills, legislative debates, committee reports, and statutory frameworks.",
    relevance: "GS Paper 2 - Indispensable for constitutional law, parliamentary scrutiny, and statutory reforms.",
    tags: ["prs", "parliament", "bills", "acts", "legislation", "committee", "legislative", "law", "polity"]
  },
  {
    name: "Judiciary & Constitutional Affairs (The Hindu National)",
    url: "https://www.thehindu.com/news/national/feeder/default.rss",
    description: "Supreme Court judgments, constitutional benches, collegium decisions, and legal policy updates.",
    relevance: "GS Paper 2 - Crucial tracking of judicial review, constitutional morality, and landmark verdicts.",
    tags: ["judiciary", "judicial", "law", "supreme court", "high court", "legal", "constitution", "article 21", "sc", "justice", "collegium"]
  },
  {
    name: "The Hindu - National News",
    url: "https://www.thehindu.com/news/national/feeder/default.rss",
    description: "Comprehensive national news coverage, federal political updates, and policy debates from India's paper of record.",
    relevance: "GS Paper 2 & 3 - Core reference for government policy, legislation, and national events.",
    tags: ["hindu", "national", "news", "policy", "india", "current affairs", "centre", "state"]
  },
  {
    name: "The Hindu - Opinion & Analysis",
    url: "https://www.thehindu.com/opinion/feeder/default.rss",
    description: "Analytical opinion articles, intellectual columns, and reader viewpoints on contemporary socio-political issues.",
    relevance: "GS Paper 2 & Essay - Fundamental for developing balanced arguments and deep policy analysis.",
    tags: ["hindu", "opinion", "op-ed", "analysis", "columns", "essay", "views", "editorials"]
  },
  {
    name: "The Hindu - Editorial",
    url: "https://www.thehindu.com/opinion/editorial/feeder/default.rss",
    description: "Official stances and leading analysis on key constitutional, national, and international developments.",
    relevance: "GS Paper 2, Essay & Interview - Direct benchmark for structural arguments and official policy perspectives.",
    tags: ["editorial", "editorials", "hindu", "analysis", "mains", "perspective", "views"]
  },
  {
    name: "The Hindu - Science & Tech (S&T)",
    url: "https://www.thehindu.com/sci-tech/science/feeder/default.rss",
    description: "Scientific discoveries, medical breakthroughs, space missions, biotech, and IT/AI advancements.",
    relevance: "GS Paper 3 - Excellent tool to track modern tech updates (Defense, AI, Biotech, Space, ISRO).",
    tags: ["s&t", "science", "tech", "technology", "space", "isro", "ai", "biotech", "health", "innovation", "defence"]
  },
  {
    name: "The Hindu - Environment & Energy",
    url: "https://www.thehindu.com/sci-tech/energy-and-environment/feeder/default.rss",
    description: "Ecological concerns, global warming initiatives, green energy transformations, and sustainable developments.",
    relevance: "GS Paper 3 - Coverage of biodiversity conservation, climate summits, pollution control acts.",
    tags: ["environment", "energy", "climate", "ecology", "biodiversity", "conservation", "green", "cop", "pollution"]
  },
  {
    name: "Livemint - Economy, Banking & RBI",
    url: "https://www.livemint.com/rss/economy",
    description: "Macroeconomic indicators, RBI monetary policies, trade deficits, industrial output, and fiscal management.",
    relevance: "GS Paper 3 - Paramount reference for Indian economic development, inflation, and growth.",
    tags: ["economy", "banking", "rbi", "inflation", "macroeconomics", "finance", "gdp", "capex", "budget"]
  },
  {
    name: "Livemint - National Policy & Administration",
    url: "https://www.livemint.com/rss/news",
    description: "Real-time updates, policy implementations, federal administration news, and national reports.",
    relevance: "GS Paper 2 & 3 - Fundamental news highlights regarding governance and socio-economic affairs.",
    tags: ["livemint", "mint", "national", "policy", "governance", "administration", "india"]
  },
  {
    name: "Down To Earth - Environment & Forest Conservation",
    url: "https://www.downtoearth.org.in/rss/environment",
    description: "Scientific tracking of wildlife reserves, forestry policies, climate change panels, and conservation projects.",
    relevance: "GS Paper 3 - Essential for environment protocols, Ramsar sites, wildlife acts, and climate summits.",
    tags: ["environment", "climate", "ecology", "downtoearth", "forest", "wildlife", "conservation", "ramsar"]
  },
  {
    name: "Down To Earth - Science & Technology (S&T)",
    url: "https://www.downtoearth.org.in/rss/science-and-technology",
    description: "Disruptions in science, digital initiatives, and clean energy tech developments.",
    relevance: "GS Paper 3 - Research and development metrics in agriculture, healthcare, and infrastructure.",
    tags: ["s&t", "science", "technology", "tech", "downtoearth", "biotech", "energy", "clean tech"]
  },
  {
    name: "InsightsIAS Daily Current Affairs",
    url: "https://www.insightsonindia.com/feed",
    description: "Daily compiled current affairs, study checklists, and mains answer writing inputs.",
    relevance: "Syllabus Integration - Fast daily news analysis tailored precisely for CSE preparation.",
    tags: ["upsc", "insights", "insightsias", "current affairs", "daily", "mains", "prelims"]
  },
  {
    name: "BBC News - India & South Asia",
    url: "https://feeds.bbci.co.uk/news/world/asia/india/rss.xml",
    description: "Objective international reporting on Indian affairs, environmental challenges, and diplomatic relations.",
    relevance: "GS Paper 2 - Balanced foreign viewpoint on India's social, geopolitical, and internal developments.",
    tags: ["bbc", "india", "south asia", "neighbourhood", "foreign", "geopolitics"]
  },
  {
    name: "NDTV - Top National News",
    url: "https://feeds.feedburner.com/ndtvnews-india-news",
    description: "High-yield breaking national coverage, parliamentary sessions, and administrative developments.",
    relevance: "GS Paper 2 & 3 - Daily coverage of cabinet decisions, social issues, and national infrastructure.",
    tags: ["ndtv", "national", "news", "breaking", "parliament", "cabinet"]
  }
];

function sanitizeStoredFeeds(saved: RssFeed[] | null): RssFeed[] {
  if (!saved || !Array.isArray(saved) || saved.length === 0) return DEFAULT_FEEDS;
  // Filter out permanently dead or blocked feed URLs (such as CloudFront-blocked Indian Express, legacy 404 LiveLaw, timed out PIB)
  const deadDomains = ["indianexpress.com", "livelaw.in/rss", "barandbench.com/rss", "pib.gov.in/Rss", "prsindia.org/feed", "yojana.gov.in"];
  const sanitized = saved.filter(f => !deadDomains.some(d => f.url && f.url.includes(d)));
  if (sanitized.length === 0) return DEFAULT_FEEDS;
  return sanitized;
}

const FALLBACK_NEWS: RssFeedItem[] = [
  {
    id: "fallback-1",
    title: "Supreme Court Rules on the Ambit of Article 21 and Digital Privacy",
    link: "https://www.livelaw.in/top-stories/digital-privacy",
    description:
      "In a significant ruling, the Supreme Court has expanded the scope of individual digital safety under the Right to Privacy in Article 21, recommending stronger guidelines against state-sponsored data intercepting without judicial warrants.",
    content:
      "In a high-intensity constitutional bench ruling, the Supreme Court of India declared that digital surveillance without explicit, documented judicial warrants is an encroachment upon Article 19(1)(a) and Article 21. Speaking for the majority, the Chief Justice remarked that national digital sovereignty cannot override structural guarantees of personal privacy in a procedural democracy. The court ordered legislative committees to finalize the regulatory safeguards under the Digital Personal Data Protection (DPDP) guidelines within six months, keeping international benchmarks such as GDPR in consideration.",
    pubDate: new Date().toUTCString(),
    creator: "Judiciary Desk",
  },
  {
    id: "fallback-2",
    title:
      "Western Ghats Ecology: Central Board Urges States to Declare Ecologically Sensitive Areas",
    link: "https://pib.gov.in/ecology-western-ghats",
    description:
      "The Ministry of Environment, Forest and Climate Change has renewed draft notifications to declare major stretches of the Western Ghats as Ecologically Sensitive Areas (ESAs), echoing key Gadgil Committee suggestions.",
    content:
      "With severe cloudbursts and landslides affecting Southern Peninsula regions, the Ministry of Environment, Forest, and Climate Change (MoEFCC) has dispatched an urgent draft advisory to six peninsular states. The notification requests fast-tracking the classification of 56,800 square kilometers of the ecologically rich region as Ecologically Sensitive Area (ESA). The circular highlights the persistent relevance of both the Madhav Gadgil and Kasturirangan report recommendations, warning against any further heavy developmental or stone-quarrying activities across unstable sloped zones.",
    pubDate: new Date().toUTCString(),
    creator: "MoEFCC Press",
  },
  {
    id: "fallback-3",
    title:
      "Indo-Pacific Strategic Partnership: Quad Framework Expands Maritime Domain Awareness",
    link: "https://thehindu.com/strategic-partnership",
    description:
      "Foreign Ministers of the Quad alliance have jointly approved the expansion of the Indo-Pacific Partnership for Maritime Domain Awareness (IPMDA) to curb illegal, unreported fishing and track naval activity in international seas.",
    content:
      "The senior ministerial council of Japan, India, Australia, and the United States concluded negotiations in Tokyo, solidifying a common satellite-linked surveillance framework titled IPMDA. The expansion allows littoral South-Asian countries to access real-time commercial satellite feed to address non-traditional security threats: piracy, unmapped deep-sea trawling, and illegal naval maneuvers. Experts note this acts as a crucial counterweight to persistent territorial incursions, serving GS Paper-II IR objectives precisely.",
    pubDate: new Date().toUTCString(),
    creator: "Strategic Affairs Correspondent",
  },
  {
    id: "fallback-4",
    title:
      "RBI Monetary Policy: Proposing Central Bank Digital Currency (e-Rupee) for Retail Offscreen Payments",
    link: "https://indianexpress.com/rbi-cbdc-payments",
    description:
      "The Reserve Bank of India has unveiled the structural prototype for offscreen and retail transaction capabilities using CBDC, catering to rural pockets with low internet accessibility.",
    content:
      "The Reserve Bank of India (RBI) announced a groundbreaking pilot that integrates retail e-Rupee token transactions with sound-wave and SMS technology. This structural innovation enables individuals in tribal or remote villages lacking 4G/5G coverage to exchange central bank liability-linked tokens securely without real-time internet connections. It aims to reduce transaction delays, minimize cash-printing costs, and bypass private payment gateways, offering a high-yield study for economic development in GS Paper III.",
    pubDate: new Date().toUTCString(),
    creator: "Economic Bureau",
  },
];

interface RssReaderViewProps {
  model: DeepSeekModel;
  onNavigate?: (view: any) => void;
}

export function RssReaderView({ model, onNavigate }: RssReaderViewProps) {
  // Feeds
  const [feeds, setFeeds] = useState<RssFeed[]>(() => {
    const raw = safeLocalStorageGet<RssFeed[]>("upsc_rss_feeds", DEFAULT_FEEDS);
    const cleaned = sanitizeStoredFeeds(raw);
    safeLocalStorageSet("upsc_rss_feeds", cleaned);
    return cleaned;
  });

  const [selectedFeedId, setSelectedFeedId] = useState<string>(() => {
    const currentFeeds = sanitizeStoredFeeds(safeLocalStorageGet<RssFeed[]>("upsc_rss_feeds", DEFAULT_FEEDS));
    return currentFeeds[0]?.id || "hindu-nat";
  });

  const handleResetToVerifiedFeeds = () => {
    setFeeds(DEFAULT_FEEDS);
    safeLocalStorageSet("upsc_rss_feeds", DEFAULT_FEEDS);
    setSelectedFeedId("hindu-nat");
    setFetchError("");
  };
  const [feedItems, setFeedItems] = useState<RssFeedItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<RssFeedItem | null>(() => {
    const pendingLink = localStorage.getItem("upsc_rss_pending_link");
    if (pendingLink) {
      const pendingTitle = localStorage.getItem("upsc_rss_pending_title") || "Selected News Article";
      const pendingArticleRaw = localStorage.getItem("upsc_rss_pending_article");
      if (pendingArticleRaw) {
        try {
          return JSON.parse(pendingArticleRaw);
        } catch (e) {
          // Fallback to synthetic
        }
      }
      return {
        id: "digest-linked-" + Date.now(),
        title: pendingTitle.includes("Analyze Full News") ? "High-Yield Current Affairs Selected News" : pendingTitle,
        link: pendingLink,
        description: "Directly loaded from UPSC Prep Daily Digest. Complete article fetch initiated.",
        content: "Directly loaded from UPSC Prep Daily Digest. Complete article fetch initiated.",
        category: "Current Affairs (General)",
        pubDate: new Date().toUTCString(),
      };
    }
    return null;
  });

  const [digestRedirectArticle, setDigestRedirectArticle] = useState<RssFeedItem | null>(() => {
    const pendingLink = localStorage.getItem("upsc_rss_pending_link");
    if (pendingLink) {
      const pendingTitle = localStorage.getItem("upsc_rss_pending_title") || "Selected News Article";
      const pendingArticleRaw = localStorage.getItem("upsc_rss_pending_article");
      if (pendingArticleRaw) {
        try {
          return JSON.parse(pendingArticleRaw);
        } catch (e) {
          // Fallback to synthetic
        }
      }
      return {
        id: "digest-linked-" + Date.now(),
        title: pendingTitle.includes("Analyze Full News") ? "High-Yield Current Affairs Selected News" : pendingTitle,
        link: pendingLink,
        description: "Directly loaded from UPSC Prep Daily Digest. Complete article fetch initiated.",
        content: "Directly loaded from UPSC Prep Daily Digest. Complete article fetch initiated.",
        category: "Current Affairs (General)",
        pubDate: new Date().toUTCString(),
      };
    }
    return null;
  });

  const [fetchArticleError, setFetchArticleError] = useState<string | null>(null);

  // TOC state
  const [tableOfContents, setTableOfContents] = useState<{id: string, title: string, level: number}[]>([]);
  
  // AI brief summary states
  const [aiBriefSummaries, setAiBriefSummaries] = useState<Record<string, string>>(() => 
    safeLocalStorageGet<Record<string, string>>("upsc_rss_ai_brief_summaries", {})
  );
  const [isGeneratingBriefSummary, setIsGeneratingBriefSummary] = useState(false);
  const [briefSummaryError, setBriefSummaryError] = useState<string | null>(null);
  const [copiedSummaryId, setCopiedSummaryId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("upsc_rss_ai_brief_summaries", JSON.stringify(aiBriefSummaries));
  }, [aiBriefSummaries]);

  // Custom Feed Add Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeAddTab, setActiveAddTab] = useState<"discover" | "manual">("discover");
  const [newFeedName, setNewFeedName] = useState("");
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [addError, setAddError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editFeedId, setEditFeedId] = useState<string | null>(null);

  // New States for RSS Feed Discovery and Validation
  const [discoverQuery, setDiscoverQuery] = useState("");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState("");
  const [discoveredFeeds, setDiscoveredFeeds] = useState<Array<{ name: string; url: string; description: string; relevance?: string }>>([]);
  const [isDiscoverOfflineFallback, setIsDiscoverOfflineFallback] = useState(false);
  const [isValidatingFeed, setIsValidatingFeed] = useState(false);

  const handleEditFeedAction = (feed: RssFeed, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditFeedId(feed.id);
    setNewFeedName(feed.name);
    setNewFeedUrl(feed.url);
    setActiveAddTab("manual");
    setShowAddForm(true);
  };

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState<"current" | "all">("current");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [feedsCache, setFeedsCache] = useState<Record<string, RssFeedItem[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [activeTab, setActiveTab] = useState<"feed" | "my-summaries">("feed");

  // Reader Customization Options
  const [selectedFont, setSelectedFont] = useState<string>(() => localStorage.getItem("rss_reader_font") || "lora");
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">(() => (localStorage.getItem("rss_reader_font_size") as "sm" | "md" | "lg" | "xl") || "lg");
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [viewMode, setViewMode] = useState<"reader" | "web">("reader");
  const [showTextSettings, setShowTextSettings] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [hideSourcesPane, setHideSourcesPane] = useState(false);
  const [hoverRevealLeftPane, setHoverRevealLeftPane] = useState(false);
  const [hoverRevealRightPane, setHoverRevealRightPane] = useState(false);

  useEffect(() => {
    localStorage.setItem("rss_reader_font", selectedFont);
  }, [selectedFont]);

  useEffect(() => {
    localStorage.setItem("rss_reader_font_size", fontSize);
  }, [fontSize]);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const progress = scrollHeight > clientHeight ? (scrollTop / (scrollHeight - clientHeight)) * 100 : 0;
    const bar = document.getElementById("rss-scroll-progress-bar");
    if (bar) {
      bar.style.width = `${progress}%`;
    }
  };

  // Full article state
  const [fullArticle, setFullArticle] = useState<{
    content: string;
    html: string;
  } | null>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [extractedTopics, setExtractedTopics] = useState<{
    keywords: string[];
    syllabusTopics: string[];
  } | null>(null);
  const [isExtractingTopics, setIsExtractingTopics] = useState(false);

  // AI summary states
  const [aisummaries, setAiSummaries] = useState<Record<string, string>>(() => 
    safeLocalStorageGet<Record<string, string>>("upsc_rss_ai_summaries", {})
  );
  const [isSummarizing, setIsSummarizing] = useState(false);

  // UPSC Interactive MCQ Practice
  const [mcqs, setMcqs] = useState<Record<string, any>>(() => 
    safeLocalStorageGet<Record<string, any>>("upsc_rss_mcqs", {})
  );
  const [isGeneratingMcq, setIsGeneratingMcq] = useState(false);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({}); // Selected options
  const [submittedMcqs, setSubmittedMcqs] = useState<Record<string, boolean>>({}); // Submitted status

  // UPSC Interactive Flashcard Practice
  const [flashcards, setFlashcards] = useState<Record<string, Array<{ question: string; answer: string }>>>(() => 
    safeLocalStorageGet<Record<string, Array<{ question: string; answer: string }>>>("upsc_rss_flashcards", {})
  );
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({}); // Card indexing flip status
  const [activeSubTab, setActiveSubTab] = useState<"summary" | "mcq" | "flashcards">("summary");
  const [copied, setCopied] = useState<string | null>(null);
  const [saveConfirmation, setSaveConfirmation] = useState(false);
  const [saveConfirmMessage, setSaveConfirmMessage] = useState("Saved to your Notes & Briefs library!");
  const [selectedTagForSaving, setSelectedTagForSaving] = useState<string>("Current Affairs (General)");
  const [selectedFilterTag, setSelectedFilterTag] = useState<string>("all");

  // Sticky Notes logic
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
    const [noteContent, setNoteContent] = useState("");
  const [isCategorizingNote, setIsCategorizingNote] = useState(false);

  // TTS logic
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesisInstance, setSpeechSynthesisInstance] = useState<SpeechSynthesisUtterance | null>(null);

  // Read more/less logic
  const [isArticleExpanded, setIsArticleExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const articleContentRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedItem && viewMode === "reader") {
      setIsArticleExpanded(false);
      setNeedsExpansion(false);
      // Wait for content to render, then check height
      setTimeout(() => {
        if (articleContentRef.current) {
          const height = articleContentRef.current.scrollHeight;
          if (height > 1200) { // arbitrary limit in px
            setNeedsExpansion(true);
          }
        }
      }, 500);
    }
  }, [selectedItem, viewMode, fullArticle]);


  // Saved summaries tab data
  const [savedUserSummaries, setSavedUserSummaries] = useState<SavedSummary[]>(() => 
    safeLocalStorageGet<SavedSummary[]>("upsc_saved_rss_notes", [])
  );

  // States to keep track of clicked/read items and Show Unread flag
  const [readItems, setReadItems] = useState<string[]>(() => 
    safeLocalStorageGet<string[]>("upsc_read_rss_items", [])
  );
  const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Sidebar resize state
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isDragging, setIsDragging] = useState(false);

  const [userSyllabus] = useState<Topic[]>(() => 
    safeLocalStorageGet<Topic[]>("upsc_syllabus_v2", initialSyllabus)
  );

  useEffect(() => {
    let animationFrameId: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      let newWidth = e.clientX;
      if (newWidth < 250) newWidth = 250;
      if (newWidth > 600) newWidth = 600;
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(() => {
        setSidebarWidth(newWidth);
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none"; // Prevent text selection while dragging
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isDragging]);

  // Track feeds update to localstorage
  useEffect(() => {
    localStorage.setItem("upsc_rss_feeds", JSON.stringify(feeds));
  }, [feeds]);

  // Track AI summaries in storage
  useEffect(() => {
    localStorage.setItem("upsc_rss_ai_summaries", JSON.stringify(aisummaries));
  }, [aisummaries]);

  // Track saved user summaries in storage
  useEffect(() => {
    localStorage.setItem(
      "upsc_saved_rss_notes",
      JSON.stringify(savedUserSummaries),
    );
  }, [savedUserSummaries]);

  // Track read items in storage
  useEffect(() => {
    localStorage.setItem("upsc_read_rss_items", JSON.stringify(readItems));
  }, [readItems]);

  // Fetch items whenever the feed changes
  useEffect(() => {
    if (activeTab === "feed") {
      fetchFeedItems();
    }
  }, [selectedFeedId, activeTab]);

  // Prefetch other feeds in the background to make global keyword/title search instant and offline-ready
  useEffect(() => {
    let active = true;

    const prefetchFeeds = async () => {
      // Loop through all feeds and prefetch them if they are not the currently selected feed and not in cache
      for (const feed of feeds) {
        if (!active) break;
        if (feed.id === selectedFeedId) continue;
        if (feedsCache[feed.id]) continue;

        try {
          const response = await apiFetch(
            `/api/rss-proxy?url=${encodeURIComponent(feed.url)}&_t=${Date.now()}`,
            { cache: 'no-store' }
          );
          if (!response.ok) continue;

          const data = await response.json();
          let itemsWithFeed: RssFeedItem[] = [];

          if (data.items) {
            itemsWithFeed = data.items.map((item: any) => ({
              ...item,
              description: cleanDescription(item.description),
              feedName: feed.name,
            }));
          } else if (data.xmlFallback) {
            const parsed = parseFeedXml(data.xmlFallback);
            itemsWithFeed = parsed.map((item) => ({
              ...item,
              feedName: feed.name,
            }));
          }

          if (itemsWithFeed.length > 0 && active) {
            setFeedsCache((prev) => ({ ...prev, [feed.id]: itemsWithFeed }));
          }
        } catch (e) {
          console.warn(`Background prefetch failed for ${feed.name}:`, e);
        }
      }
    };

    // Delay background prefetch by 2 seconds to not interfere with primary content loading
    const timer = setTimeout(() => {
      prefetchFeeds();
    }, 2000);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [feeds, selectedFeedId]);

  function cleanDescription(html: string): string {
    if (!html) return "";
    let text = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
    text = text.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");
    text = text.replace(/<br\s*\/?>/gi, "\n");
    text = text.replace(/<\/?[^>]+(>|$)/g, "");

    const txt = document.createElement("textarea");
    txt.innerHTML = text;
    // Basic substitution for common characters that might not decode fully in some setups
    return txt.value.replace(/&#160;/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&#8217;/g, "'")
      .replace(/&#8216;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"');
  }

  const fetchFeedItems = async () => {
    const targetFeed = feeds.find((f) => f.id === selectedFeedId);
    if (!targetFeed) return;

    setIsLoading(true);
    setFetchError("");
    
    // Only clear selectedItem if we don't have a pending redirect active
    if (!localStorage.getItem("upsc_rss_pending_link") && !digestRedirectArticle) {
      setSelectedItem(null);
    }

    try {
      // Fetch via CORS-bypassing express server endpoint
      const response = await apiFetch(
        `/api/rss-proxy?url=${encodeURIComponent(targetFeed.url)}&_t=${Date.now()}`,
        { cache: 'no-store' }
      );
      if (!response.ok) {
        throw new Error(`Server returned error status ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        throw new Error("Received HTML proxy response instead of JSON data. Server may be booting or a fallback page was served.");
      }

      let data;
      try {
        data = await response.json();
      } catch (e: any) {
        throw new Error(`Invalid JSON response: ${e.message}`);
      }
      
      let itemsWithFeed: RssFeedItem[] = [];

      if (data.items) {
        itemsWithFeed = data.items.map((item: any) => ({
          ...item,
          description: cleanDescription(item.description),
          feedName: targetFeed.name,
        }));
      } else if (data.xmlFallback) {
        // Parse RSS XML Fallback
        const parsed = parseFeedXml(data.xmlFallback);
        if (parsed.length === 0) {
          throw new Error("No feed items could be extracted.");
        }
        itemsWithFeed = parsed.map((item) => ({
          ...item,
          feedName: targetFeed.name,
        }));
      } else {
        throw new Error("No feed items could be extracted.");
      }

      setFeedItems(itemsWithFeed);
      setFeedsCache((prev) => ({ ...prev, [selectedFeedId]: itemsWithFeed }));

      // Auto-categorize items in background has been disabled to prevent automatic API usage
      // which would consume user API keys/limits without explicit interaction.

    } catch (err: any) {
      console.warn(
        "RSS Feed fetch failed: ",
        err,
      );
      
      setFetchError(`Could not query live feed directly (${err.message}).`);
      
      // Only populate with fallback if we have absolutely nothing
      setFeedsCache((prev) => {
        const existing = prev[selectedFeedId];
        if (!existing || existing.length === 0) {
          const updatedFallback = FALLBACK_NEWS.map((item) => ({
            ...item,
            feedName: targetFeed.name,
          }));
          setFeedItems(updatedFallback);
          return { ...prev, [selectedFeedId]: updatedFallback };
        } else {
          // If we already have cached items, just keep showing them instead of mock data
          setFeedItems(existing);
          return prev;
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch full article content when selecting an item
  const handleSelectItem = async (item: RssFeedItem) => {
    setSelectedItem(item);
    setFetchArticleError(null);
    if (item.id) {
      setReadItems((prev) => {
        if (prev.includes(item.id)) return prev;
        return [...prev, item.id];
      });
    }
    setShowAiPanel(false);
    setFullArticle(null);
    setExtractedTopics(null);
    setIsLoadingArticle(true);
    const bar = document.getElementById("rss-scroll-progress-bar");
    if (bar) {
      bar.style.width = '0%';
    }

    let articleContentText = "";

    try {
      const resp = await apiFetch(
        `/api/fetch-article?url=${encodeURIComponent(item.link)}`,
      );
      if (resp.ok) {
        const data = await resp.json();
        if (data && (data.content || data.html)) {
          setFullArticle({
            content: data.content,
            html: data.html,
          });
          articleContentText = data.content;
        } else {
          setFetchArticleError("The live content extractor returned an empty body. Displaying available feeds metadata instead.");
        }
      } else {
        setFetchArticleError(`Server returned HTTP ${resp.status} while fetching full article. Using RSS description summary.`);
      }
    } catch (e: any) {
      console.error("Failed to fetch full article", e);
      setFetchArticleError(`Network or proxy connection failed. Using cached item description/summary.`);
    } finally {
      setIsLoadingArticle(false);
    }

    if (!articleContentText) {
       articleContentText = item.content || item.description || item.title;
    }

    if (articleContentText) {
      setIsExtractingTopics(true);
      apiFetch('/api/rss-extract-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: item.title, content: articleContentText })
      })
      .then(res => res.json())
      .then(extractorData => {
        if (extractorData && extractorData.keywords && extractorData.syllabusTopics) {
          setExtractedTopics(extractorData);
        }
      })
      .catch(err => console.error("Extract topics failed:", err))
      .finally(() => setIsExtractingTopics(false));
    }
  };

  // Raw RSS/Atom XML Custom Parser
  const parseFeedXml = (xmlString: string): RssFeedItem[] => {
    // Sanitize unescaped ampersands to prevent parsing errors like xmlParseEntityRef: no name
    const sanitizedXml = xmlString.replace(/&(?!(#[xX]?[0-9a-fA-F]+|[a-zA-Z0-9]+);)/g, "&amp;");

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sanitizedXml, "text/xml");

    // Test parser errors
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      console.warn("XML Parsing Warning in feed: ", parserError.textContent);
    }

    const items = xmlDoc.querySelectorAll("item");
    const parsedItems: RssFeedItem[] = [];

    if (items.length > 0) {
      items.forEach((item, index) => {
        const getTagText = (tagName: string) => {
          try {
            const el = item.querySelector(tagName);
            return el ? el.textContent || "" : "";
          } catch (e) {
            return "";
          }
        };

        const title = getTagText("title");
        const link = getTagText("link");

        let description = getTagText("description");
        // Strip heavy CDATA wrappers if any
        description = cleanDescription(description);

        let content =
          item.querySelector("content\\:encoded, encoded")?.textContent ||
          description;
        content = cleanDescription(content);

        const pubDate =
          getTagText("pubDate") ||
          getTagText("pubdate") ||
          getTagText("date") ||
          getTagText("dc\\:date");
        const creator = getTagText("dc\\:creator") || getTagText("author");

        parsedItems.push({
          id: link || `${selectedFeedId}-${index}-${Date.now()}`,
          title: title.trim(),
          link: link.trim(),
          description: description,
          content: content,
          pubDate: pubDate,
          creator: creator,
        });
      });
    } else {
      // Check Atom entries
      const entries = xmlDoc.querySelectorAll("entry");
      if (entries.length > 0) {
        entries.forEach((entry, index) => {
          const getTagText = (tagName: string) => {
            try {
              const el = entry.querySelector(tagName);
              return el ? el.textContent || "" : "";
            } catch (e) {
              return "";
            }
          };

          const title = getTagText("title");
          const linkEl = entry.querySelector("link");
          const link = linkEl ? linkEl.getAttribute("href") || "" : "";

          let summary = getTagText("summary") || getTagText("content");
          summary = cleanDescription(summary);

          const pubDate =
            getTagText("updated") ||
            getTagText("published") ||
            getTagText("date");
          const creator = entry.querySelector("author name")?.textContent || "";

          parsedItems.push({
            id: link || `${selectedFeedId}-atom-${index}-${Date.now()}`,
            title: title.trim(),
            link: link.trim(),
            description: summary,
            content: summary,
            pubDate: pubDate,
            creator: creator,
          });
        });
      }
    }

    // Sort parsed items descending by publication date (latest first)
    parsedItems.sort((a, b) => {
      const timeA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const timeB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      const validA = !isNaN(timeA) && timeA > 0;
      const validB = !isNaN(timeB) && timeB > 0;
      
      if (validA && validB) return timeB - timeA;
      if (validA && !validB) return -1;
      if (!validA && validB) return 1;
      return 0;
    });

    return parsedItems;
  };

  // Add or Edit Custom Feed
  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");

    if (!newFeedName.trim() || !newFeedUrl.trim()) {
      setAddError("Please enter both name and feed URL.");
      return;
    }

    try {
      new URL(newFeedUrl); // valid check
    } catch (e) {
      setAddError("Invalid URL format. Include http:// or https://");
      return;
    }

    if (editFeedId) {
      setFeeds((prev) =>
        prev.map((f) =>
          f.id === editFeedId
            ? { ...f, name: newFeedName.trim(), url: newFeedUrl.trim() }
            : f,
        ),
      );
      setEditFeedId(null);
    } else {
      const newFeed: RssFeed = {
        id: `custom-${Date.now()}`,
        name: newFeedName.trim(),
        url: newFeedUrl.trim(),
        isCustom: true,
      };
      setFeeds((prev) => [...prev, newFeed]);
      setSelectedFeedId(newFeed.id);
    }

    setNewFeedName("");
    setNewFeedUrl("");
    setShowAddForm(false);
  };

  // Helper to validate pasted Feed URLs and auto-resolve their title
  const handleValidateFeed = async () => {
    let cleanUrl = newFeedUrl.trim();
    if (!cleanUrl) {
      setAddError("Please fill in the feed URL first.");
      return;
    }

    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = "https://" + cleanUrl;
      setNewFeedUrl(cleanUrl);
    }

    try {
      new URL(cleanUrl); // valid check
    } catch (e) {
      setAddError("Invalid URL format. Please provide a valid web address.");
      return;
    }

    setAddError("");
    setIsValidatingFeed(true);
    try {
      const resp = await apiFetch(`/api/rss-proxy?url=${encodeURIComponent(cleanUrl)}&_t=${Date.now()}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(8000)
      });
      if (!resp.ok) {
        throw new Error(`Feed URL is unreachable or returned status ${resp.status}`);
      }
      const data = await resp.json();
      if (data && (data.items || data.xmlFallback)) {
        let resolvedTitle = "";
        
        // Try resolving title from JSON items or feed title if available
        if (data.items && data.items.length > 0) {
          resolvedTitle = data.items[0].creator || "";
        }
        
        if (!resolvedTitle && data.xmlFallback) {
          try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.xmlFallback.replace(/&(?!(#[xX]?[0-9a-fA-F]+|[a-zA-Z0-9]+);)/g, "&amp;"), "text/xml");
            resolvedTitle = xmlDoc.querySelector("channel > title")?.textContent || xmlDoc.querySelector("feed > title")?.textContent || "";
          } catch (e) {}
        }

        if (!resolvedTitle) {
          const parsedUrl = new URL(cleanUrl);
          resolvedTitle = parsedUrl.hostname.replace("www.", "").split(".")[0];
          resolvedTitle = resolvedTitle.charAt(0).toUpperCase() + resolvedTitle.slice(1);
        }

        if (resolvedTitle) {
          setNewFeedName(resolvedTitle.trim());
          setAddError("✅ Feed is valid! Channel title resolved.");
        } else {
          setAddError("✅ Feed validates successfully!");
        }
      } else {
        throw new Error("Could not parse valid items from feed.");
      }
    } catch (err: any) {
      setAddError(`Validator Notice: ${err.message || 'Check connection or URL format.'}`);
    } finally {
      setIsValidatingFeed(false);
    }
  };

  // Reusable resilient search for XML feeds by keywords, publications or website domain
  const executeDiscoverFeeds = async (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      setDiscoverError("Please enter keywords, website domain, or topic name.");
      return;
    }

    setIsDiscovering(true);
    setDiscoverError("");
    setDiscoveredFeeds([]);
    setIsDiscoverOfflineFallback(false);

    try {
      const resp = await apiFetch("/api/rss-discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: trimmed }),
        signal: AbortSignal.timeout(18000)
      });

      if (!resp.ok) {
        throw new Error(`Server discovery returned status ${resp.status}`);
      }

      const data = await resp.json();
      if (data && Array.isArray(data.feeds) && data.feeds.length > 0) {
        setDiscoveredFeeds(data.feeds);
        setIsDiscoverOfflineFallback(data.isOfflineFallback || false);
      } else if (data && data.noMatch) {
        // Explicit noMatch returned
        const queryLower = trimmed.toLowerCase();
        const matched = CLIENT_CURATED_FEEDS.filter(f =>
          f.name.toLowerCase().includes(queryLower) ||
          f.description.toLowerCase().includes(queryLower) ||
          f.url.toLowerCase().includes(queryLower) ||
          (f.tags && f.tags.some(t => t.toLowerCase().includes(queryLower) || queryLower.includes(t.toLowerCase())))
        );
        if (matched.length > 0) {
          setDiscoveredFeeds(matched);
        } else {
          setDiscoveredFeeds([]);
          setDiscoverError(`No active feeds found for "${trimmed}". Try entering the website domain (e.g. "indianexpress.com", "livelaw.in") or switch to Manual URL.`);
        }
      } else {
        // Fallback to client-side fuzzy match
        const queryLower = trimmed.toLowerCase();
        const matched = CLIENT_CURATED_FEEDS.filter(f =>
          f.name.toLowerCase().includes(queryLower) ||
          f.description.toLowerCase().includes(queryLower) ||
          f.url.toLowerCase().includes(queryLower) ||
          (f.tags && f.tags.some(t => t.toLowerCase().includes(queryLower) || queryLower.includes(t.toLowerCase())))
        );
        if (matched.length > 0) {
          setDiscoveredFeeds(matched);
        } else {
          setDiscoveredFeeds([]);
          setDiscoverError(`No feeds found matching "${trimmed}". Try entering the website domain directly (e.g. "indianexpress.com", "livelaw.in").`);
        }
      }
    } catch (err: any) {
      console.warn("API discover error, using client-side matching fallback:", err?.message);
      // Instant client-side fuzzy match fallback so user gets relevant matches
      const queryLower = trimmed.toLowerCase();
      const matched = CLIENT_CURATED_FEEDS.filter(f =>
        f.name.toLowerCase().includes(queryLower) ||
        f.description.toLowerCase().includes(queryLower) ||
        f.url.toLowerCase().includes(queryLower) ||
        (f.tags && f.tags.some(t => t.toLowerCase().includes(queryLower) || queryLower.includes(t.toLowerCase())))
      );
      if (matched.length > 0) {
        setDiscoveredFeeds(matched);
        setIsDiscoverOfflineFallback(true);
      } else {
        setDiscoveredFeeds([]);
        setDiscoverError(`Search timed out. If you know the website address (e.g. "livelaw.in", "indianexpress.com"), you can type it above or switch to the Manual URL tab.`);
      }
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleDiscoverFeeds = async (e: React.FormEvent) => {
    e.preventDefault();
    executeDiscoverFeeds(discoverQuery);
  };

  const handleDeleteFeed = (feedId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = feeds.filter((f) => f.id !== feedId);
    setFeeds(remaining);
    if (selectedFeedId === feedId) {
      setSelectedFeedId(remaining[0]?.id || "");
    }
  };

  const handleResetDefaultFeeds = () => {
    if (window.confirm("Are you sure you want to reset all feed channels to the default high-yield active sources? This will overwrite any custom feeds you have manually added.")) {
      localStorage.removeItem("upsc_rss_feeds");
      setFeeds(DEFAULT_FEEDS);
      setSelectedFeedId(DEFAULT_FEEDS[0].id);
      setFeedsCache({});
      setFeedItems([]);
    }
  };

  // UPSC AI Summarization Call
  const handleAiSummarize = async () => {
    if (!selectedItem) return;

    setIsSummarizing(true);
    try {
      const response = await apiFetch("/api/rss-summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedItem.title,
          content: selectedItem.content || selectedItem.description,
          link: selectedItem.link,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to summarize, server returned status: ${response.status}`,
        );
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        throw new Error("Received HTML proxy response instead of JSON. Server may be booting.");
      }

      let data;
      try {
        data = await response.json();
      } catch (e: any) {
        throw new Error(`Invalid JSON response: ${e.message}`);
      }
      
      if (data.summary) {
        setAiSummaries((prev) => ({
          ...prev,
          [selectedItem.id]: data.summary,
        }));
      } else {
        throw new Error("No summary returned from model");
      }
    } catch (err: any) {
      console.error("AI Summarizer error:", err);
      setBriefSummaryError(`AI Summarizer error: ${err.message || err}`);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleExportToBlueprint = () => {
    if (!selectedItem) return;
    
    // Try to find a Mains question inside the AI summary first
    const summary = aisummaries[selectedItem.id] || "";
    let extractedQuestion = "";
    let extractedPaper = "GS2";

    // Check for lines containing "Mains" and "?"
    const lines = summary.split("\n");
    for (const line of lines) {
      if (line.toLowerCase().includes("mains") || line.toLowerCase().includes("question:") || line.toLowerCase().includes("q.")) {
        const cleaned = line.replace(/^\s*[-*#0-9.]+\s*(q[:.]|mains[:.]|question[:.])?\s*/i, "").trim();
        if (cleaned.length > 20 && cleaned.endsWith("?")) {
          extractedQuestion = cleaned;
          break;
        }
      }
    }

    // Fallback to a standard UPSC-style question if we can't parse one
    if (!extractedQuestion) {
      extractedQuestion = `Analyze the socio-economic and constitutional implications of the issues discussed in: "${selectedItem.title}". Discuss the role of regulatory institutions and suggest a way forward.`;
    }

    // Detect Paper (GS1, GS2, GS3, GS4) from summary
    if (summary.toUpperCase().includes("GS PAPER I") || summary.toUpperCase().includes("GS-1") || summary.toUpperCase().includes("GS1")) {
      extractedPaper = "GS1";
    } else if (summary.toUpperCase().includes("GS PAPER II") || summary.toUpperCase().includes("GS-2") || summary.toUpperCase().includes("GS2")) {
      extractedPaper = "GS2";
    } else if (summary.toUpperCase().includes("GS PAPER III") || summary.toUpperCase().includes("GS-3") || summary.toUpperCase().includes("GS3")) {
      extractedPaper = "GS3";
    } else if (summary.toUpperCase().includes("GS PAPER IV") || summary.toUpperCase().includes("GS-4") || summary.toUpperCase().includes("GS4")) {
      extractedPaper = "GS4";
    }

    localStorage.setItem("upsc_pending_blueprint_question", extractedQuestion);
    localStorage.setItem("upsc_pending_blueprint_paper", extractedPaper);

    if (onNavigate) {
      onNavigate("blueprint");
    }
  };

  const handleGenerateMcq = async () => {
    if (!selectedItem) return;
    setIsGeneratingMcq(true);
    try {
      const response = await apiFetch('/api/rss-generate-mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedItem.title,
          content: fullArticle?.content || selectedItem.content || selectedItem.description,
          link: selectedItem.link
        })
      });
      if (!response.ok) throw new Error('Failed to generate UPSC MCQ');
      const data = await response.json();
      
      const updatedMcqs = { ...mcqs, [selectedItem.id]: data };
      setMcqs(updatedMcqs);
      localStorage.setItem("upsc_rss_mcqs", JSON.stringify(updatedMcqs));
      setActiveSubTab("mcq");
    } catch (err: any) {
      console.error(err);
      setBriefSummaryError(err.message || 'Could not generate MCQ. Please try again.');
    } finally {
      setIsGeneratingMcq(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!selectedItem) return;
    setIsGeneratingFlashcards(true);
    try {
      const response = await apiFetch('/api/rss-generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedItem.title,
          content: fullArticle?.content || selectedItem.content || selectedItem.description
        })
      });
      if (!response.ok) throw new Error('Failed to generate UPSC Flashcards');
      const data = await response.json();
      
      const updatedFlashcards = { ...flashcards, [selectedItem.id]: data.flashcards };
      setFlashcards(updatedFlashcards);
      localStorage.setItem("upsc_rss_flashcards", JSON.stringify(updatedFlashcards));
      setActiveSubTab("flashcards");
    } catch (err: any) {
      console.error(err);
      setBriefSummaryError(err.message || 'Could not generate Flashcards. Please try again.');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  // Generate AI Summary
  const handleGenerateBriefSummary = async () => {
    if (!selectedItem) return;
    setIsGeneratingBriefSummary(true);
    setBriefSummaryError(null);

    const articleText = fullArticle?.content || selectedItem.content || selectedItem.description || "";

    try {
      const response = await apiFetch("/api/rss-ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedItem.title,
          content: articleText,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Failed to generate AI summary, server returned status: ${response.status}`);
      }

      const data = await response.json();
      if (data.summary) {
        setAiBriefSummaries((prev) => ({
          ...prev,
          [selectedItem.id]: data.summary,
        }));
      } else if (data.fallback) {
        setAiBriefSummaries((prev) => ({
          ...prev,
          [selectedItem.id]: data.fallback,
        }));
      } else {
        throw new Error("No summary returned from model");
      }
    } catch (err: any) {
      console.error("AI Summary error:", err);
      setBriefSummaryError(err.message || "Failed to connect to AI server.");
    } finally {
      setIsGeneratingBriefSummary(false);
    }
  };

  // Save or Unsave specific summary to local bookmarks collection (toggle behaviour)
  const handleSaveSummaryToNotes = () => {
    if (!selectedItem) return;

    const isAlreadySaved = savedUserSummaries.some((record) => record.id === selectedItem.id);
    if (isAlreadySaved) {
      // Toggle to unsave
      setSavedUserSummaries((prev) => prev.filter((record) => record.id !== selectedItem.id));
      setSaveConfirmMessage("Removed article from saved!");
      setSaveConfirmation(true);
      setTimeout(() => setSaveConfirmation(false), 2000);
      return;
    }

    const currentSummaryText = aisummaries[selectedItem.id];

    const record: SavedSummary = {
      id: selectedItem.id,
      title: selectedItem.title,
      link: selectedItem.link,
      summary: currentSummaryText,
      date: new Date().toISOString(),
      feedName: selectedItem.feedName,
      creator: selectedItem.creator,
      content: selectedItem.content || selectedItem.description,
      tag: selectedTagForSaving || "Current Affairs (General)"
    };

    setSavedUserSummaries((prev) => [record, ...prev]);
    setSaveConfirmMessage("Saved to your saved articles!");
    setSaveConfirmation(true);
    setTimeout(() => setSaveConfirmation(false), 2000);
  };

  // Change saved article category tag
  const handleChangeSavedArticleTag = (id: string, newTag: string) => {
    setSavedUserSummaries((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, tag: newTag } : record
      )
    );
  };

  // Delete saved summary report
  const handleDeleteSavedSummary = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedUserSummaries((prev) => prev.filter((r) => r.id !== id));
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(null);
    }
  };

  // Copy Summary text helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const filteredItems = React.useMemo(() => {
    let baseItems = [...feedItems];
    
    // Inject the active daily digest redirected article at the top of the feed list
    if (digestRedirectArticle) {
      if (!baseItems.some(item => item.link === digestRedirectArticle.link)) {
        baseItems = [digestRedirectArticle, ...baseItems];
      }
    }
    
    if (searchScope === "all") {
      const itemsMap = new Map<string, RssFeedItem>();
      
      // Add items from currently loaded feed first to maintain natural order of current channel
      baseItems.forEach(item => {
        if (item.id) {
          itemsMap.set(item.id, item);
        }
      });
      
      // Incorporate items cached from other channels
      Object.keys(feedsCache).forEach(feedId => {
        const cached = feedsCache[feedId] || [];
        cached.forEach(item => {
          if (item.id && !itemsMap.has(item.id)) {
            const feedObj = feeds.find(f => f.id === feedId);
            itemsMap.set(item.id, {
              ...item,
              feedName: item.feedName || feedObj?.name || 'Subscribed Channel'
            });
          }
        });
      });
      
      baseItems = Array.from(itemsMap.values());
    }

    // Sort baseItems globally by date descending if they have pubDate to keep list organized 
    baseItems.sort((a, b) => {
      const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      const validA = !isNaN(dateA) && dateA > 0;
      const validB = !isNaN(dateB) && dateB > 0;
      
      if (validA && validB) return dateB - dateA;
      if (validA && !validB) return -1;
      if (!validA && validB) return 1;
      return 0;
    });

    // Automatically categorize feed items client-side if a category doesn't exist
    baseItems = baseItems.map(item => ({
      ...item,
      category: item.category || categorizeItemClientSide(item)
    }));

    // Apply category filter if one is selected
    if (selectedCategory && selectedCategory !== "All") {
      baseItems = baseItems.filter(item => {
        const itemCat = item.category?.toLowerCase() || "";
        return itemCat === selectedCategory.toLowerCase();
      });
    }

    // Apply showUnreadOnly filter
    if (showUnreadOnly) {
      baseItems = baseItems.filter(item => {
        const isRead = readItems.includes(item.id);
        const isBookmarked = savedUserSummaries.some(record => record.id === item.id);
        const isCurrent = selectedItem?.id === item.id || (selectedItem?.link && selectedItem?.link === item.link);
        return !isRead && !isBookmarked || isCurrent;
      });
    }
    
    if (!searchQuery.trim()) {
      return baseItems;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return baseItems.filter((item) => {
      const searchContent = (
        (item.title || "") + " " + 
        (item.description || "") + " " + 
        (item.creator || "") + " " + 
        (item.feedName || "") + " " +
        (item.category || "")
      ).toLowerCase();
      return searchContent.includes(query);
    });
  }, [feedItems, feedsCache, searchScope, searchQuery, feeds, selectedCategory, showUnreadOnly, readItems, savedUserSummaries, selectedItem, digestRedirectArticle]);

  // Mount-only initializer to check for pending redirect from Daily Prep Digest
  React.useEffect(() => {
    const pendingLink = localStorage.getItem("upsc_rss_pending_link");
    if (!pendingLink) return;

    setActiveTab("feed");

    const pendingTitle = localStorage.getItem("upsc_rss_pending_title") || "Selected News Article";
    const pendingArticleRaw = localStorage.getItem("upsc_rss_pending_article");
    
    let targetArticle: RssFeedItem;
    if (pendingArticleRaw) {
      try {
        targetArticle = JSON.parse(pendingArticleRaw);
      } catch (e) {
        targetArticle = {
          id: "digest-linked-" + Date.now(),
          title: pendingTitle.includes("Analyze Full News") ? "High-Yield Current Affairs Selected News" : pendingTitle,
          link: pendingLink,
          description: "Directly loaded from UPSC Prep Daily Digest. Complete article fetch initiated.",
          content: "Directly loaded from UPSC Prep Daily Digest. Complete article fetch initiated.",
          category: "Current Affairs (General)",
          pubDate: new Date().toUTCString(),
        };
      }
    } else {
      targetArticle = {
        id: "digest-linked-" + Date.now(),
        title: pendingTitle.includes("Analyze Full News") ? "High-Yield Current Affairs Selected News" : pendingTitle,
        link: pendingLink,
        description: "Directly loaded from UPSC Prep Daily Digest. Complete article fetch initiated.",
        content: "Directly loaded from UPSC Prep Daily Digest. Complete article fetch initiated.",
        category: "Current Affairs (General)",
        pubDate: new Date().toUTCString(),
      };
    }

    setDigestRedirectArticle(targetArticle);
    setSelectedItem(targetArticle);
    handleSelectItem(targetArticle);

    // Clean up localStorage keys so this only triggers once!
    localStorage.removeItem("upsc_rss_pending_link");
    localStorage.removeItem("upsc_rss_pending_article");
    localStorage.removeItem("upsc_rss_pending_title");
  }, []);

  // Typography definitions based on font state
  const fontClass = () => {
    switch (selectedFont) {
      case "inter":
        return "font-inter";
      case "merriweather":
        return "font-merriweather";
      case "lora":
        return "font-lora";
      case "jetbrains":
        return "font-jetbrains";
      case "playfair":
        return "font-playfair";
      case "georgia":
        return "font-georgia";
      case "fira-sans":
        return "font-fira-sans";
      case "mono":
        return "font-mono";
      case "serif":
        return "font-serif";
      case "sans":
      default:
        return "font-sans";
    }
  };

  const proseSizeClass = () => {
    switch (fontSize) {
      case "sm":
        return "prose-sm";
      case "lg":
        return "prose-lg";
      case "xl":
        return "prose-xl";
      default:
        return "prose-base"; // md
    }
  };

  const getFontSizeRem = () => {
    switch (fontSize) {
      case "sm":
        return "0.85rem"; // ~14px
      case "md":
        return "1rem"; // 16px
      case "lg":
        return "1.15rem"; // ~18.5px
      case "xl":
        return "1.35rem"; // ~21.5px
      default:
        return "1rem";
    }
  };

  
  const popupRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        if (!isAddingNote) {
          setSelectionRect(null);
          setSelectedText("");
        }
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 0) {
        const range = selection.getRangeAt(0);
        const container = document.getElementById("article-reader-content");
        if (container && container.contains(range.commonAncestorContainer)) {
          const rect = range.getBoundingClientRect();
          setSelectedText(text);
          setSelectionRect(rect);
          if (!isAddingNote) {
            setNoteContent("");
          }
        }
      }
    };

    const handleMouseUpOrTouchEnd = (e: MouseEvent | TouchEvent) => {
      // If event happened inside the popup, do not clear
      if (popupRef.current && popupRef.current.contains(e.target as Node)) {
        return;
      }

      // Small delay to allow browser selection to stabilize
      setTimeout(() => {
        handleSelection();
      }, 50);
    };

    document.addEventListener("mouseup", handleMouseUpOrTouchEnd);
    document.addEventListener("touchend", handleMouseUpOrTouchEnd);

    return () => {
      document.removeEventListener("mouseup", handleMouseUpOrTouchEnd);
      document.removeEventListener("touchend", handleMouseUpOrTouchEnd);
    };
  }, [isAddingNote]);

  const handleOpenNotePopup = async () => {
    setIsAddingNote(true);
    if (!selectedText) return;

    // Instant client-side heuristic auto-categorization
    const instantCategory = categorizeItemClientSide({ title: selectedText, description: selectedText });
    setSelectedTagForSaving(instantCategory);

    setIsCategorizingNote(true);
    try {
      const response = await apiFetch('/api/categorize-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.category) {
          setSelectedTagForSaving(data.category);
        }
      }
    } catch (err) {
      console.error('Categorize error', err);
    } finally {
      setIsCategorizingNote(false);
    }
  };

  const handleSaveStickyNote = () => {
      if (!selectedText) return;
      const savedStr = localStorage.getItem("upsc_saved_notes");
      let savedNotes = savedStr ? JSON.parse(savedStr) : [];
      
      const now = new Date();
      
      const newNote = {
          id: Date.now().toString(),
          topic: `Note from: ${selectedItem?.title || "Article"}`,
          subject: selectedTagForSaving,
          folderPath: ["Current Affairs", selectedTagForSaving],
          content: `**Highlighted Text:**\n> ${selectedText}\n\n**Note:**\n${noteContent}`,
          date: now.toISOString(),
          status: "new"
      };
      
      savedNotes.unshift(newNote);
      localStorage.setItem("upsc_saved_notes", JSON.stringify(savedNotes));
      
      setIsAddingNote(false);
      setSelectionRect(null);
      setSelectedText("");
      setNoteContent("");
      setSaveConfirmation(true);
      setTimeout(() => setSaveConfirmation(false), 2000);
  };

  const handleDownloadPDF = () => {
    exportToPDF("article-reader-content", selectedItem ? selectedItem.title || "UPSC_Article" : "UPSC_Article");
  };

  const selectedItemText = selectedItem ? (fullArticle?.content || selectedItem.content || selectedItem.description || "") : "";
  const selectedItemWords = selectedItemText ? selectedItemText.trim().split(/\s+/).filter(Boolean).length : 0;
  const isLongArticle = selectedItemWords > 150;

  return (
    <div className="h-[calc(100vh-48px)] overflow-hidden flex flex-col lg:flex-row bg-app relative print:h-auto print:overflow-visible">

      {/* TEXT SELECTION HIGHLIGHT POPUP */}
      {selectionRect && selectedText && (
        <div
          ref={popupRef}
          className="fixed z-[100] animate-fadeIn"
          style={{
            top: Math.max(70, Math.min(window.innerHeight - 250, selectionRect.top - (isAddingNote ? 200 : 45))),
            left: Math.max(15, Math.min(window.innerWidth - 320, selectionRect.left + (selectionRect.width / 2) - (isAddingNote ? 150 : 60))),
          }}
          onMouseUp={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <div className="bg-app border border-panel-border shadow-2xl rounded-xl overflow-hidden flex flex-col" style={{ width: isAddingNote ? '300px' : 'auto' }}>
            {!isAddingNote ? (
              <div className="flex items-center p-1">
                <button
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenNotePopup(); }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenNotePopup(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-accent/10 hover:text-accent rounded-lg text-muted text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Highlighter className="w-3.5 h-3.5 text-accent" />
                  Save Note
                </button>
              </div>
            ) : (
              <div className="p-3 flex flex-col gap-2">
                <div className="text-[10px] uppercase font-bold text-light tracking-widest mb-1 flex justify-between">
                  <span>Add Note to Highlight</span>
                  <button onClick={() => { setIsAddingNote(false); setSelectionRect(null); }} className="hover:text-main"><X className="w-3 h-3" /></button>
                </div>
                <div className="text-[11px] italic text-muted border-l-2 border-accent/30 pl-2 line-clamp-3 mb-2">
                  "{selectedText}"
                </div>
                <textarea
                  autoFocus
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Type your notes here..."
                  className="w-full h-20 text-[12px] bg-input border border-panel-border rounded-lg p-2 text-main focus:outline-none focus:border-accent resize-none placeholder:text-muted"
                />
                
                {/* Subject categorization */}
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] font-bold text-muted uppercase">Topic:</span>
                  <select 
                    value={selectedTagForSaving}
                    onChange={(e) => setSelectedTagForSaving(e.target.value)}
                    className="text-[11px] bg-app border border-panel-border rounded p-1 text-main flex-1"
                    disabled={isCategorizingNote}
                  >
                    {isCategorizingNote && <option value={selectedTagForSaving}>✨ AI Categorizing...</option>}
                    <option value="Current Affairs (General)">Current Affairs (General)</option>
                    <option value="Polity & Governance">Polity & Governance</option>
                    <option value="Economy">Economy</option>
                    <option value="Science & Technology">Science & Tech</option>
                    <option value="Environment & Ecology">Environment & Ecology</option>
                    <option value="International Relations">International Relations</option>
                    <option value="History & Culture">History & Culture</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-2 mt-1">
                  <button
                    onClick={() => { setIsAddingNote(false); setSelectionRect(null); }}
                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-panel-border text-muted hover:text-main hover:bg-black/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveStickyNote}
                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-accent text-white hover:bg-accent/90 transition-all flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" />
                    Save Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LEFT PANES WRAPPER (Handles Focus Mode hiding) */}
      <div 
        className={`flex-shrink-0 transition-transform duration-300 z-30
          ${isFocusMode ? (hoverRevealLeftPane ? 'absolute left-0 top-0 bottom-0 shadow-2xl translate-x-0 !flex bg-app border-r border-panel-border/50' : 'absolute left-0 top-0 bottom-0 -translate-x-[120%] !flex') : 'relative flex'}
          ${!selectedItem ? 'w-full lg:w-auto h-full flex flex-col lg:flex-row' : 'hidden lg:flex flex-row h-full w-auto'} 
        `}
      >
        {/* PANE 1: Source Sidebar (Hidden on mobile if viewing article) */}
        <div className={`w-full lg:w-[260px] h-full flex-col border-r border-panel-border bg-sidebar flex-shrink-0 print:hidden ${selectedItem || selectedFeedId || activeTab === 'my-summaries' ? 'hidden lg:flex' : 'flex'} ${hideSourcesPane ? 'lg:!hidden' : ''}`}>

        <div className="p-4 border-b border-panel-border flex items-center justify-between">
          <h2 className="text-[11px] font-black tracking-widest uppercase text-muted">My Sources</h2>
          <div className="flex items-center gap-2">
            <button
               onClick={handleResetDefaultFeeds}
               className="text-muted hover:text-accent transition-colors"
               title="Reset to Active Default Channels"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
               onClick={() => setShowAddForm(!showAddForm)}
               className="text-muted hover:text-accent transition-colors"
               title="Add Custom Feed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Library Section */}
          <div className="py-4">
            <h3 className="px-4 text-[10px] uppercase font-bold text-light tracking-widest mb-1">Library</h3>
            <div 
              onClick={() => { setActiveTab('my-summaries'); setSelectedItem(null); setSelectedFeedId(''); }}
              className={`mx-2 px-3 py-2 rounded-xl flex justify-between items-center cursor-pointer transition-colors ${
                activeTab === 'my-summaries' ? 'bg-accent/10 text-accent font-bold' : 'text-muted hover:text-main hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="text-[13px]">Saved Articles</span>
              </div>
              {savedUserSummaries.length > 0 && (
                <span className="bg-accent/20 text-accent text-[10px] px-1.5 py-0.5 rounded font-black">
                  {savedUserSummaries.length}
                </span>
              )}
            </div>
          </div>

          {/* Feeds Section */}
          <div className="py-2">
            <div className="px-4 text-[10px] uppercase font-bold text-light tracking-widest mb-1 flex justify-between items-center">
              <span>Channels</span>
            </div>
            
            <div className="space-y-0.5">
              {feeds.map(feed => (
                <div
                  key={feed.id}
                  onClick={() => { setActiveTab('feed'); setSelectedFeedId(feed.id); setSelectedItem(null); }}
                  className={`group mx-2 px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    activeTab === 'feed' && selectedFeedId === feed.id 
                      ? 'bg-accent/10 text-accent font-bold border border-accent/20 shadow-sm'
                      : 'text-muted hover:text-main hover:bg-black/5 border border-transparent'
                  }`}
                >
                  <div className="flex flex-1 min-w-0 items-center gap-2">
                    <Rss className={`w-3.5 h-3.5 flex-shrink-0 ${activeTab === 'feed' && selectedFeedId === feed.id ? 'text-accent' : 'text-light'}`} />
                    <span className="text-[13px] truncate">{feed.name}</span>
                  </div>
                  
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 pl-2">
                     <button
                        onClick={(e) => handleEditFeedAction(feed, e)}
                        className="text-muted hover:text-blue-500"
                        title="Edit Channel"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteFeed(feed.id, e)}
                        className="text-muted hover:text-red-500"
                        title="Remove Channel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Add Form & Search Discovery Inline/Panel */}
        {showAddForm && (
           <div className="p-4 border-t border-panel-border bg-input/40 animate-fadeIn space-y-3.5">
             <div className="flex bg-app rounded-xl p-0.5 border border-panel-border">
               <button
                 type="button"
                 onClick={() => { setActiveAddTab('discover'); setAddError(""); }}
                 className={`flex-1 text-[11px] py-1.5 rounded-lg font-bold transition-all ${
                   activeAddTab === "discover"
                     ? "bg-accent text-white shadow-sm"
                     : "text-muted hover:text-main"
                 }`}
               >
                 AI Discover
               </button>
               <button
                 type="button"
                 onClick={() => { setActiveAddTab('manual'); setAddError(""); }}
                 className={`flex-1 text-[11px] py-1.5 rounded-lg font-bold transition-all ${
                   activeAddTab === "manual"
                     ? "bg-accent text-black shadow-sm"
                     : "text-muted hover:text-main"
                 }`}
               >
                 Manual URL
               </button>
             </div>

             {activeAddTab === 'discover' ? (
               <div className="space-y-2.5">
                 <form onSubmit={handleDiscoverFeeds} className="space-y-2 text-left">
                   <div className="text-[11px] font-bold text-main uppercase tracking-widest flex items-center justify-between">
                     <span>Search RSS Feeds</span>
                     <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
                   </div>
                   <p className="text-[10px] text-muted leading-snug">
                     Describe your topic or keyword to search the web for RSS sources relevant to UPSC.
                   </p>
                   <div className="relative">
                     <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-light" />
                     <input
                       type="text"
                       placeholder="e.g., LiveLaw, Indian Express, PIB, Environment, or domain like livelaw.in..."
                       value={discoverQuery}
                       onChange={(e) => setDiscoverQuery(e.target.value)}
                       className="w-full text-[11px] bg-app border border-panel-border pl-8 pr-2.5 py-2 text-main rounded-lg focus:outline-none focus:border-accent placeholder:text-muted"
                     />
                   </div>
                   <div className="flex flex-wrap gap-1.5 pt-1">
                     {["LiveLaw", "Indian Express", "PIB", "Judiciary", "Environment", "Economy", "S&T"].map((sug) => (
                       <button
                         key={sug}
                         type="button"
                         onClick={() => {
                           setDiscoverQuery(sug);
                           executeDiscoverFeeds(sug);
                         }}
                         className="px-2 py-0.5 bg-app hover:bg-accent/10 border border-panel-border hover:border-accent/40 rounded-md text-[9px] font-semibold text-muted hover:text-accent transition-all cursor-pointer"
                       >
                         {sug}
                       </button>
                     ))}
                   </div>
                   <div className="flex justify-end gap-1.5 pt-2">
                     <button type="button" onClick={() => { setShowAddForm(false); }} className="text-[11px] text-muted hover:text-main font-bold">Cancel</button>
                     <button type="submit" disabled={isDiscovering} className="text-[10px] uppercase tracking-wider bg-accent text-black px-3 py-1.5 rounded-lg font-bold hover:bg-accent/80 flex items-center gap-1 cursor-pointer">
                       {isDiscovering ? <Loader2 className="w-3 h-3 animate-spin whitespace-nowrap" /> : null}
                       Search
                     </button>
                   </div>
                 </form>

                 {discoverError && (
                   <p className="text-[10px] text-red-500 bg-red-500/5 border border-red-500/10 p-2 rounded-lg leading-relaxed text-left">{discoverError}</p>
                 )}

                 {isDiscovering && (
                   <div className="p-4 border border-panel-border rounded-xl bg-app flex flex-col justify-center items-center text-center">
                     <Loader2 className="w-4 h-4 text-accent animate-spin mb-1.5" />
                     <p className="text-[10px] text-muted">AI is researching live feeds via Google search...</p>
                   </div>
                 )}

                 {discoveredFeeds.length > 0 && (
                   <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 border border-panel-border/40 rounded-xl p-2 bg-app">
                      {isDiscoverOfflineFallback && (
                        <div className="bg-amber-50/70 border border-amber-200/40 text-amber-800 dark:bg-amber-950/25 dark:border-amber-800/30 dark:text-amber-400 p-2.5 rounded-xl mb-2 flex items-start gap-1.5 text-[10px] leading-relaxed">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-semibold block">Using Offline Feeds Directory</strong>
                            <span>Custom web-search was suspended due to AI limits. Displaying verified local backup UPSC channels instead.</span>
                          </div>
                        </div>
                      )}
                     {discoveredFeeds.map((feed, idx) => (
                       <div key={idx} className="border-b border-panel-border/30 pb-2 mb-2 last:border-b-0 last:pb-0 text-left">
                         <div className="flex justify-between items-start gap-1">
                           <h5 className="text-[11px] font-bold text-main line-clamp-1">{feed.name}</h5>
                           <button
                             type="button"
                             onClick={() => {
                               if (feeds.some(f => f.url.toLowerCase().trim() === feed.url.toLowerCase().trim())) {
                                 return;
                               }
                               const newRssFeed: RssFeed = {
                                 id: `custom-${Date.now()}-${idx}`,
                                 name: feed.name,
                                 url: feed.url,
                                 isCustom: true
                               };
                               setFeeds(prev => [...prev, newRssFeed]);
                               setSelectedFeedId(newRssFeed.id);
                               setDiscoverQuery("");
                               setDiscoveredFeeds([]);
                               setShowAddForm(false);
                             }}
                             className="text-[8.5px] bg-accent hover:bg-accent/80 text-black px-1.5 py-0.5 rounded font-black flex items-center gap-0.5 cursor-pointer uppercase shrink-0"
                           >
                             Add Feed
                           </button>
                         </div>
                         <p className="text-[9px] text-muted line-clamp-1 truncate">{feed.url}</p>
                         <p className="text-[9px] text-light mt-0.5 leading-snug line-clamp-2">{feed.description}</p>
                         {feed.relevance && (
                           <div className="text-[8px] bg-accent/5 border border-accent/15 text-accent px-1.5 py-0.5 rounded-md font-bold mt-1 inline-block uppercase tracking-wider">
                             {feed.relevance}
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             ) : (
               <form onSubmit={handleAddFeed} className="space-y-2.5 text-left">
                 <h4 className="text-[11px] font-bold text-main uppercase tracking-widest">{editFeedId ? "Edit Custom Source" : "Build Custom Source"}</h4>
                 <div>
                   <label className="text-[9px] font-bold uppercase tracking-wider text-muted mb-1 block">Feed URL</label>
                   <div className="flex gap-1.5">
                     <input
                       type="text"
                       placeholder="XML URL Link"
                       value={newFeedUrl}
                       onChange={(e) => setNewFeedUrl(e.target.value)}
                       className="flex-1 text-[11px] bg-app border border-panel-border rounded-lg px-2.5 py-2 text-main focus:outline-none focus:border-accent focus:ring-0 placeholder:text-muted"
                     />
                     <button
                       type="button"
                       disabled={isValidatingFeed}
                       onClick={handleValidateFeed}
                       className="px-2.5 py-2 text-[10px] uppercase tracking-wider bg-accent/10 border border-accent/20 hover:bg-accent hover:text-black font-bold text-accent rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                     >
                       {isValidatingFeed ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Validate"}
                     </button>
                   </div>
                 </div>
                 
                 <div>
                   <label className="text-[9px] font-bold uppercase tracking-wider text-muted mb-1 block">Feed Title</label>
                   <input
                     type="text"
                     placeholder="Feed Title (e.g. The Wire)"
                     value={newFeedName}
                     onChange={(e) => setNewFeedName(e.target.value)}
                     className="w-full text-[11px] bg-app border border-panel-border rounded-lg px-2.5 py-2 text-main focus:outline-none focus:border-accent"
                   />
                 </div>

                 {addError && (
                   <p className={`text-[10px] p-2 rounded border leading-relaxed ${addError.startsWith('✅') ? 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10' : 'text-red-500 bg-red-500/5 border-red-500/10'}`}>
                     {addError}
                   </p>
                 )}
                 <div className="flex justify-end gap-1.5 pt-1">
                   <button type="button" onClick={() => { setShowAddForm(false); setEditFeedId(null); setNewFeedName(""); setNewFeedUrl(""); setAddError(""); }} className="text-[11px] text-muted hover:text-main font-bold">Cancel</button>
                   <button type="submit" className="text-[10px] uppercase tracking-wider bg-accent text-black px-3 py-1.5 rounded-lg font-bold hover:bg-accent/80 cursor-pointer">{editFeedId ? "Save" : "Add"}</button>
                 </div>
               </form>
             )}
           </div>
        )}
      </div>

      {/* PANE 2: Article List */}
      <div
        className={`w-full lg:w-[320px] h-full flex-col border-r border-panel-border bg-input flex-shrink-0 print:hidden ${selectedItem ? 'hidden lg:flex' : (!selectedFeedId && activeTab !== 'my-summaries' ? 'hidden lg:flex' : 'flex')}`}
        style={{ width: window.innerWidth >= 1024 ? sidebarWidth : "100%" }}
      >
        <div className="p-3 lg:p-4 border-b border-panel-border flex items-center gap-3 bg-app">
           <button
             onClick={() => setHideSourcesPane(!hideSourcesPane)}
             className="hidden lg:flex items-center justify-center p-1.5 rounded-lg border border-transparent hover:border-panel-border hover:bg-black/5 text-muted hover:text-main transition-colors"
             title={hideSourcesPane ? "Show Sources" : "Hide Sources"}
           >
             {hideSourcesPane ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
           </button>
           <button
             onClick={() => { setSelectedFeedId(''); setActiveTab('feed'); }}
             className="lg:hidden flex items-center justify-center p-1.5 rounded-lg border border-panel-border bg-app text-muted hover:text-main"
             title="Back to sources"
           >
             <ChevronLeft className="w-5 h-5" />
           </button>
           <h3 className="text-[15px] font-bold font-sans text-main tracking-tight line-clamp-1 flex-1">
             {activeTab === 'feed' ? feeds.find(f => f.id === selectedFeedId)?.name || 'Feed' : 'Saved Articles'}
           </h3>
           {activeTab === 'feed' && (
              <button
                 onClick={() => fetchFeedItems()}
                 title="Refresh Feed"
                 className="flex items-center justify-center p-2 text-muted hover:text-accent hover:bg-black/10 rounded-lg transition-colors border border-transparent"
              >
                 <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-accent" : ""}`} />
              </button>
           )}
        </div>

        {activeTab === 'feed' && fetchError && (
          <div className="m-4 bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl flex flex-col gap-2.5">
             <div className="flex gap-2 items-start">
               <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
               <div className="flex-1">
                 <p className="text-[12px] font-semibold text-main">Live Feed Unavailable</p>
                 <p className="text-[11px] text-muted leading-relaxed mt-0.5">{fetchError}</p>
               </div>
             </div>
             <div className="flex flex-wrap gap-2 pt-1 border-t border-amber-500/20">
               <button
                 type="button"
                 onClick={() => {
                   setSelectedFeedId("hindu-nat");
                   setFetchError("");
                 }}
                 className="text-[11px] bg-accent text-white px-3 py-1 rounded-lg font-medium hover:opacity-90 transition-opacity"
               >
                 Switch to The Hindu (National)
               </button>
               <button
                 type="button"
                 onClick={handleResetToVerifiedFeeds}
                 className="text-[11px] bg-panel border border-panel-border text-main px-3 py-1 rounded-lg font-medium hover:bg-input transition-colors"
               >
                 Restore Verified Channels
               </button>
             </div>
          </div>
        )}

        <div className="p-4 border-b border-panel-border/30 flex flex-col gap-2 bg-app">
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-3 w-4 h-4 text-light" />
            <input
              type="text"
              placeholder={activeTab === 'feed'? (searchScope === 'all' ? "Search all feeds..." : "Search selected feed...") : "Search saved..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[13px] bg-app/60 border border-panel-border rounded-xl pl-9 pr-10 py-2.5 text-main focus:outline-none focus:border-accent transition-colors placeholder:text-muted"
            />
            {activeTab === 'feed' && (
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`absolute right-2 p-1.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
                  showFilters
                    ? "text-accent bg-accent/10 hover:bg-accent/20"
                    : "text-muted hover:text-main hover:bg-panel-border/20"
                }`}
                title={`${showFilters ? "Hide" : "Show"} filter settings`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {!showFilters && (searchScope === "all" || selectedCategory !== "All" || showUnreadOnly) && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
                )}
              </button>
            )}
          </div>

          {activeTab === 'feed' && !showFilters && (searchScope === "all" || selectedCategory !== "All" || showUnreadOnly) && (
            <div className="flex flex-wrap items-center gap-1.5 px-1 py-0.5 mt-0.5 text-[10px] text-muted">
              <span className="font-semibold text-[9px] uppercase tracking-wider text-light mr-1">Active:</span>
              {searchScope === "all" && (
                <span className="bg-panel-border/30 px-1.5 py-0.5 rounded border border-panel-border/10 text-main font-semibold">
                  All Feeds
                </span>
              )}
              {selectedCategory !== "All" && (
                <span className="bg-accent/10 border border-accent/20 text-accent px-1.5 py-0.5 rounded font-semibold">
                  {selectedCategory}
                </span>
              )}
              {showUnreadOnly && (
                <span className="bg-accent/10 border border-accent/20 text-accent px-1.5 py-0.5 rounded font-semibold">
                  Unread Only
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setSearchScope("current");
                  setSelectedCategory("All");
                  setShowUnreadOnly(false);
                }}
                className="text-[9.5px] font-black uppercase text-accent/85 hover:text-accent cursor-pointer hover:underline ml-auto animate-pulse"
              >
                Reset
              </button>
            </div>
          )}

          {activeTab === 'feed' && showFilters && (
            <div className="flex flex-col gap-2 mt-1 animate-fadeIn">
              <div className="flex gap-1 p-1 bg-panel-border/10 border border-panel-border/30 rounded-xl text-[11px]">
                <button
                  type="button"
                  onClick={() => setSearchScope("current")}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg font-bold transition-all ${
                    searchScope === "current"
                      ? "bg-accent/10 border border-accent/20 text-accent"
                      : "text-muted hover:text-main"
                  }`}
                >
                  <span>Current feed</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSearchScope("all")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-bold transition-all ${
                    searchScope === "all"
                      ? "bg-accent/10 border border-accent/20 text-accent"
                      : "text-muted hover:text-main"
                  }`}
                >
                  <span>All feeds</span>
                  {Object.keys(feedsCache).length > 0 && (
                    <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-black uppercase ${searchScope === 'all' ? 'bg-accent/20 text-accent' : 'bg-panel-border/40 text-light'}`}>
                      {Object.values(feedsCache).reduce((count, items) => count + items.length, 0)} items
                    </span>
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-panel-border/5 border border-panel-border/25 rounded-xl text-[11px] select-none">
                <div className="flex flex-col text-left">
                  <span className="text-[11.5px] font-bold text-main">Show Unread Only</span>
                  <span className="text-[9.5px] text-muted">Hide clicked or bookmarked articles</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    showUnreadOnly ? "bg-accent" : "bg-panel-border"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-app shadow-sm transition duration-200 ease-in-out ${
                      showUnreadOnly ? "translate-x-4 bg-black" : "translate-x-0 bg-light"
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted">Topic Categories</span>
                  {selectedCategory !== "All" && (
                    <button 
                      onClick={() => setSelectedCategory("All")} 
                      className="text-[9px] text-accent font-black uppercase hover:underline cursor-pointer"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5" style={{ scrollbarWidth: "none" }}>
                  {FEED_CATEGORIES.map((cat) => {
                    const isActive = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg border font-bold text-[10.5px] whitespace-nowrap transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-accent text-black border-accent shadow-sm"
                            : "bg-panel-border/10 border-panel-border/30 text-muted hover:text-main hover:bg-panel-border/20"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {activeTab !== 'feed' && (
            <div className="flex items-center gap-1.5 bg-panel-border/10 border border-panel-border/30 rounded-xl px-2.5 py-1.5 text-[11px]">
              <span className="text-light font-medium shrink-0">Filter:</span>
              <select
                value={selectedFilterTag}
                onChange={(e) => setSelectedFilterTag(e.target.value)}
                className="bg-transparent border-0 text-main font-bold outline-none cursor-pointer text-[11px] pr-1 flex-1 focus:ring-0"
              >
                <option value="all" className="bg-panel text-main">All Saved Articles</option>
                {UPSC_SYLLABUS_TAGS.map((tag) => (
                  <option key={tag} value={tag} className="bg-panel text-main">
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-panel-border/60">
           {activeTab === 'feed' ? (
              isLoading ? (
                <div className="p-8 flex flex-col justify-center items-center h-32">
                   <Loader2 className="w-5 h-5 text-accent animate-spin mb-2" />
                   <p className="text-[10px] uppercase tracking-widest text-muted">Syncing data</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-8 text-center text-muted text-[11px] font-semibold py-12">No articles matched.</div>
              ) : (
                filteredItems.map(item => {
                  const isSelected = selectedItem?.id === item.id || (selectedItem?.link && selectedItem?.link === item.link);
                  const hasSummary = !!aisummaries[item.id];
                  const isRead = readItems.includes(item.id);
                  const isBookmarked = savedUserSummaries.some(record => record.id === item.id);
                  const isUnread = !isRead && !isBookmarked;
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className={`group p-5 cursor-pointer transition-all duration-200 text-left flex flex-col gap-2 relative overflow-hidden ${
                        isSelected ? "bg-accent/5 border-l-[3px] border-accent shadow-sm" : "border-l-[3px] border-transparent hover:bg-panel-border/20"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-light uppercase font-bold tracking-widest opacity-80">
                        <span className="truncate flex-1 mr-2 flex items-center gap-1.5">
                          {isUnread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" title="Unread article" />
                          )}
                          <span className="truncate">{item.creator || "UPSC News"}</span>
                        </span>
                        <span>{item.pubDate ? new Date(item.pubDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Today"}</span>
                      </div>
                      <h4 className={`text-[14px] font-semibold text-main leading-tight ${isSelected ? 'text-accent' : 'group-hover:text-accent'} transition-colors`}>{item.title}</h4>
                      <p className="text-[12px] text-muted line-clamp-2 leading-relaxed opacity-80">{item.description || "Read full article inside."}</p>
                      
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {item.category && (
                          <div className={`flex items-center gap-1 border px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${getCategoryStyles(item.category)}`}>
                            {item.category}
                          </div>
                        )}
                        {hasSummary && (
                          <div className="flex items-center gap-1 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider bg-emerald-500/10">
                            <CheckCheck className="w-3 h-3" /> UPSC Analyzed
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )
           ) : (
              savedUserSummaries.length === 0 ? (
                <div className="p-10 flex flex-col justify-center items-center text-center opacity-60">
                   <BookOpen className="w-6 h-6 mb-2 text-light" />
                   <p className="text-[11px]">No saved articles yet</p>
                </div>
              ) : (() => {
                const matched = savedUserSummaries.filter(s => {
                  const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        (s.summary && s.summary.toLowerCase().includes(searchQuery.toLowerCase()));
                  const matchesCategory = selectedFilterTag === "all" || s.tag === selectedFilterTag;
                  return matchesSearch && matchesCategory;
                });

                if (matched.length === 0) {
                  return (
                    <div className="p-8 text-center text-muted text-[11px] font-semibold py-12">
                      No articles match current filter.
                    </div>
                  );
                }

                return matched.map(record => {
                  const isSelected = selectedItem?.id === record.id;
                  return (
                     <div
                      key={record.id}
                      onClick={() => handleSelectItem({ id: record.id, title: record.title, link: record.link, description: record.title, content: record.content || "", pubDate: record.date, creator: record.creator || record.feedName || "Saved Article" })}
                      className={`group p-4 cursor-pointer transition-all hover:bg-panel-border/30 text-left flex flex-col gap-1.5 relative overflow-hidden ${
                        isSelected ? "bg-accent/5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-accent" : ""
                      }`}
                     >
                        <div className="flex items-center justify-between text-[10px] text-light uppercase tracking-widest font-bold">
                           <span className="text-accent truncate">{record.feedName || "LIBRARY"}</span>
                           <button 
                             onClick={(e) => handleDeleteSavedSummary(record.id, e)} 
                             className="text-muted hover:text-red-500 md:opacity-0 group-hover:opacity-100 transition-all p-1.5 -mr-1.5 cursor-pointer z-10"
                             title="Delete Article"
                           >
                              <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        </div>
                        <h4 className="text-[13px] font-bold text-main leading-snug">{record.title}</h4>
                        <div className="mt-1 flex flex-wrap items-center justify-between gap-1.5">
                          <span className="text-[9.5px] text-muted">{new Date(record.date).toLocaleDateString()}</span>
                          {record.tag && (
                            <span className="px-2 py-0.5 rounded border border-accent/25 bg-accent/5 text-accent text-[8px] font-black uppercase tracking-wider">
                              {record.tag.split(" (")[0]}
                            </span>
                          )}
                        </div>
                     </div>
                  );
                });
              })()
           )}
        </div>
      </div>

      {/* Resize Handle (Desktop Only) */}
      <div
        className="hidden lg:flex w-1.5 cursor-col-resize bg-transparent hover:bg-accent/50 active:bg-accent z-10 transition-colors"
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
      />
      </div> {/* END LEFT PANES WRAPPER */}

      {/* Focus Mode Overlay for Left Panes */}
      {isFocusMode && !hoverRevealLeftPane && (
        <div 
          className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 w-4 h-32 bg-panel-border/30 hover:bg-accent hover:w-6 transition-all rounded-r-xl cursor-pointer z-50 items-center justify-center opacity-50 hover:opacity-100"
          onMouseEnter={() => setHoverRevealLeftPane(true)}
          onClick={() => setHoverRevealLeftPane(true)}
        >
          <div className="w-1 h-8 rounded-full bg-app/50 pointer-events-none" />
        </div>
      )}
      
      {/* Dim Overlay when Left Pane is revealed in focus mode */}
      {isFocusMode && hoverRevealLeftPane && (
        <div 
          className="absolute inset-0 z-20 bg-app/60 backdrop-blur-sm transition-opacity"
          onClick={() => setHoverRevealLeftPane(false)}
        />
      )}

      {/* RIGHT SECTION (PANE 3): Reading interface and AI Summary View */}
      <div className={`flex-1 h-full overflow-hidden flex-col bg-app print:overflow-visible print:block ${!selectedItem ? 'hidden lg:flex' : 'flex'}`}>
        {selectedItem ? (
          <div className="flex-1 h-full overflow-y-auto flex flex-col print:overflow-visible">
            {/* Display customization header banner */}
            <div className="p-2 px-4 border-b border-panel-border bg-input flex-shrink-0 flex items-center justify-between z-20 relative print:hidden">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="lg:hidden flex items-center justify-center p-1.5 rounded-lg border border-panel-border bg-app text-muted hover:text-main"
                  title="Back to list"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <a
                  href={selectedItem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-accent font-bold hover:underline py-1.5 px-3 rounded-lg hover:bg-accent/5 transition-all border border-transparent hover:border-accent/20"
                >
                  Visit Original <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Focus Mode Toggle */}
                <button
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  className={`hidden lg:flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    isFocusMode
                      ? "bg-accent/10 border-accent/50 text-accent"
                      : "bg-app border-panel-border text-muted hover:text-main"
                  }`}
                  title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                >
                  {isFocusMode ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
                  Focus
                </button>
                
                {/* Bookmark Toggle */}
                <button
                  onClick={handleSaveSummaryToNotes}
                  className={`flex p-1.5 rounded-lg border transition-all ${savedUserSummaries.some((record) => record.id === selectedItem.id) ? 'bg-accent/20 border-accent/40 text-accent font-bold scale-105 shadow' : 'bg-app border-panel-border text-muted hover:text-main'}`}
                  title={savedUserSummaries.some((record) => record.id === selectedItem.id) ? "Remove saved article (Unsave)" : "Save to Bookmarks"}
                >
                  <BookOpen className={`w-4 h-4 ${savedUserSummaries.some((record) => record.id === selectedItem.id) ? 'fill-accent' : ''}`} />
                </button>

                {/* AI Panel Toggle */}
                <button
                  onClick={() => setShowAiPanel(!showAiPanel)}
                  className={`flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    showAiPanel
                      ? "bg-accent/10 border-accent/50 text-accent"
                      : "bg-app border-panel-border text-muted hover:text-main"
                  }`}
                  title="Toggle AI Syllabus Panel"
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI Analysis
                </button>

                <button
                  onClick={handleDownloadPDF}
                  className="p-1.5 rounded-lg border border-panel-border bg-app text-muted hover:text-main transition-colors"
                  title="Download as PDF"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* Settings Dropdown Toggle */}
                <div className="relative">
                  <button
                    onClick={() => setShowTextSettings(!showTextSettings)}
                    className={`p-1.5 rounded-lg border transition-all ${showTextSettings ? 'bg-accent text-black border-accent' : 'bg-app border-panel-border text-muted hover:text-main'}`}
                    title="Reader Options"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>

                  {/* Settings Popover */}
                  {showTextSettings && (
                    <div className="absolute right-0 top-full mt-2 bg-panel border border-panel-border rounded-xl shadow-xl p-4 w-[280px] flex flex-col gap-4 z-50">
                      <div>
                        {/* Reader vs Web View */}
                        <div className="flex bg-app rounded-lg p-1 border border-panel-border">
                          <button
                            onClick={() => setViewMode("reader")}
                            className={`flex-1 text-[11px] py-1.5 rounded-md font-semibold transition-all ${
                              viewMode === "reader"
                                ? "bg-accent text-black shadow-sm"
                                : "text-muted hover:text-main"
                            }`}
                          >
                            Reader
                          </button>
                          <button
                            onClick={() => setViewMode("web")}
                            className={`flex-1 text-[11px] py-1.5 rounded-md font-semibold transition-all ${
                              viewMode === "web"
                                ? "bg-accent text-black shadow-sm"
                                : "text-muted hover:text-main"
                            }`}
                          >
                            Original Web
                          </button>
                        </div>
                      </div>

                      {viewMode === "reader" && (
                        <>
                          <div className="space-y-2">
                            <span className="text-[10px] font-black tracking-widest uppercase text-muted">Font Family</span>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: "sans", label: "System" },
                                { id: "inter", label: "Inter" },
                                { id: "merriweather", label: "Merriweather" },
                                { id: "lora", label: "Lora" },
                                { id: "playfair", label: "Playfair" },
                                { id: "georgia", label: "Georgia" },
                                { id: "fira-sans", label: "Fira Sans" },
                                { id: "jetbrains", label: "Mono" },
                              ].map((fontOption) => (
                                <button
                                  key={fontOption.id}
                                  onClick={() => setSelectedFont(fontOption.id as any)}
                                  className={`text-[11px] px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                                    selectedFont === fontOption.id
                                      ? "bg-accent/10 text-accent border border-accent/30"
                                      : "bg-app border border-panel-border text-muted hover:text-main"
                                  }`}
                                >
                                  {fontOption.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[10px] font-black tracking-widest uppercase text-muted">Font Size</span>
                            <div className="flex items-center justify-between border border-panel-border rounded-xl p-1 bg-app">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (fontSize === "xl") setFontSize("lg");
                                  else if (fontSize === "lg") setFontSize("md");
                                  else if (fontSize === "md") setFontSize("sm");
                                }}
                                className="flex-1 flex justify-center p-2 rounded-lg hover:bg-input text-muted hover:text-main transition-colors"
                              >
                                <ZoomOut className="w-4 h-4" />
                              </button>
                              <span className="text-[11px] font-black min-w-[40px] text-center select-none uppercase tracking-wider text-muted">
                                {fontSize}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (fontSize === "sm") setFontSize("md");
                                  else if (fontSize === "md") setFontSize("lg");
                                  else if (fontSize === "lg") setFontSize("xl");
                                }}
                                className="flex-1 flex justify-center p-2 rounded-lg hover:bg-input text-muted hover:text-main transition-colors"
                              >
                                <ZoomIn className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Split viewport: Left reading actual text, Right showing AI Summary */}
            <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 divide-panel-border overflow-hidden select-text relative">
              {viewMode === "reader" && (
                <div className="absolute top-0 left-0 w-full lg:w-auto h-1 z-20 pointer-events-none" style={{ right: showAiPanel && !isFocusMode ? '480px' : '0' }}>
                   <div id="rss-scroll-progress-bar" className="h-full bg-accent transition-all duration-100 ease-out" style={{ width: `0%` }} />
                </div>
              )}
              {/* Actual News Post Pane */}
              <div 
                className="flex-1 overflow-y-auto p-0 relative flex flex-col"
                ref={scrollRef}
                onScroll={handleScroll}
              >
                {viewMode === "web" ? (
                  <div className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold">Read at the source</h2>
                    <a href={/^https:\/\//i.test(selectedItem.link) ? selectedItem.link : '#'}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-accent underline">
                      Open original article
                    </a>
                  </div>
                ) : (
                  <div className="px-4 py-4 lg:px-8 lg:py-6 flex-1 relative min-w-0 overflow-x-hidden">
                    <article
                      id="article-reader-content"
                      className={`${fontClass()} space-y-6 max-w-3xl mx-auto w-full min-w-0 rss-reader-article`}
                      style={{
                        "--rss-reader-font-size": getFontSizeRem(),
                      } as React.CSSProperties}
                    >
                      <div className="space-y-1 font-sans border-b border-panel-border pb-2">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-accent tracking-widest uppercase">
                          <span>{selectedItem.creator || "UPSC Newsdesk"}</span>
                          {selectedItem.pubDate && (
                            <>
                              <span className="text-light">•</span>
                              <span className="text-muted">
                                {new Date(
                                  selectedItem.pubDate,
                                ).toLocaleString()}
                              </span>
                            </>
                          )}
                          {selectedItem.category && (
                            <>
                              <span className="text-light opacity-50">•</span>
                              <span className={`px-2.5 py-0.5 rounded font-black border uppercase tracking-wider text-[10px] ${getCategoryStyles(selectedItem.category)}`}>
                                {selectedItem.category}
                              </span>
                            </>
                          )}
                        </div>
                        <h1 className="text-xl lg:text-2xl font-black text-main leading-[1.2] tracking-tight font-sans mt-1 mb-1">
                          {selectedItem.title}
                        </h1>
                      </div>

                      {/* AI Summary for long news articles */}
                      {isLongArticle && (<>
                                                <div id="ai-brief-summary-section" className="px-3 py-2 border border-panel-border bg-panel/30 rounded-lg relative overflow-hidden my-2 flex items-center justify-between gap-3 shadow-sm opacity-60 hover:opacity-100 transition-opacity print:hidden">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-accent" />
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-main flex items-center gap-2 m-0">
                              AI Brief
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-input text-muted border border-panel-border/50">
                                {selectedItemWords} words
                              </span>
                            </h3>
                          </div>
                          
                          <div className="flex-1 flex justify-end">
                            {!aiBriefSummaries[selectedItem.id] && !isGeneratingBriefSummary && !briefSummaryError && (
                              <button
                                onClick={handleGenerateBriefSummary}
                                className="px-2 py-1 text-accent font-bold rounded text-[10px] uppercase tracking-wider flex items-center gap-1 transition-colors hover:bg-accent/10"
                              >
                                Generate
                              </button>
                            )}
                            {isGeneratingBriefSummary && (
                              <div className="flex items-center gap-2 text-[10px] text-muted animate-pulse">
                                <Loader2 className="w-3 h-3 animate-spin text-accent" />
                                Drafting...
                              </div>
                            )}
                            {briefSummaryError && (
                              <div className="flex items-center gap-2 text-[10px] text-rose-400">
                                <AlertCircle className="w-3 h-3" /> Failed
                                <button onClick={handleGenerateBriefSummary} className="ml-1 underline">Retry</button>
                              </div>
                            )}
                          </div>
                        </div>

                        {aiBriefSummaries[selectedItem.id] && (
                          <div className="mb-3 bg-app/40 border border-panel-border/50 p-3 rounded-xl relative text-[12px] leading-relaxed">
                            <div className="prose prose-sm max-w-none text-main dark:text-main">
                              <Markdown remarkPlugins={[remarkGfm]}>
                                {aiBriefSummaries[selectedItem.id]}
                              </Markdown>
                            </div>
                            <div className="mt-3 pt-2 border-t border-panel-border/30 flex items-center justify-between text-[9px] text-muted font-bold uppercase tracking-widest">
                              <span className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-500" /> AI generated
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(aiBriefSummaries[selectedItem.id]);
                                  setCopiedSummaryId(selectedItem.id);
                                  setTimeout(() => setCopiedSummaryId(null), 2000);
                                }}
                                className="hover:text-accent flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                {copiedSummaryId === selectedItem.id ? (
                                  <span className="text-emerald-500 flex items-center gap-1">
                                    <Check className="w-2.5 h-2.5" /> Copied!
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <Copy className="w-2.5 h-2.5" /> Copy
                                  </span>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                        </>
                      )}

                      {/* Main text container */}
                      <div className="relative">
                        <div 
                          ref={articleContentRef}
                          className={`text-main font-medium leading-relaxed transition-all duration-700 ease-in-out overflow-hidden ${needsExpansion && !isArticleExpanded ? 'max-h-[800px]' : 'max-h-[25000px]'}`}
                        >
                          {isLoadingArticle ? (
                            <div className="flex items-center justify-center p-12 text-muted gap-2">
                              <Loader2 className="w-5 h-5 animate-spin text-accent" />{" "}
                              Wait... loading full text...
                            </div>
                          ) : fullArticle?.html ? (
                            <div
                              className={`prose ${proseSizeClass()} max-w-none`}
                              style={
                                {
                                  fontSize: getFontSizeRem(),
                                  "--tw-prose-body": "var(--text-main)",
                                  "--tw-prose-headings": "var(--text-main)",
                                  "--tw-prose-links": "var(--accent)",
                                  "--tw-prose-bold": "var(--text-main)",
                                  "--tw-prose-quotes": "var(--text-muted)",
                                  "--tw-prose-quote-borders":
                                    "var(--panel-border)",
                                  "--tw-prose-code": "var(--accent)",
                                  "--tw-prose-hr": "var(--panel-border)",
                                  "--tw-prose-lists": "var(--text-main)",
                                  "--tw-prose-counters": "var(--text-muted)",
                                  "--tw-prose-bullets": "var(--text-muted)",
                                } as React.CSSProperties
                              }
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(fullArticle.html, {
                                  ADD_TAGS: ["iframe", "video", "audio", "source"],
                                  ADD_ATTR: ["target", "allow", "allowfullscreen", "frameborder", "controls", "src", "width", "height"],
                                }),
                              }}
                            />
                          ) : (
                            <>
                              {fetchArticleError && (
                                <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-2.5">
                                    <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                                    <span className="text-[11px] text-rose-400 font-medium">{fetchArticleError}</span>
                                  </div>
                                  <button 
                                    onClick={() => handleSelectItem(selectedItem)}
                                    className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-lg text-[10px] uppercase font-black tracking-wider hover:bg-rose-500/30 transition-colors shrink-0"
                                  >
                                    Retry Load
                                  </button>
                                </div>
                              )}
                              <div
                                className={`prose ${proseSizeClass()} max-w-none italic opacity-80 whitespace-pre-wrap`}
                                style={
                                  {
                                    fontSize: getFontSizeRem(),
                                    "--tw-prose-body": "var(--text-main)",
                                    "--tw-prose-headings": "var(--text-main)",
                                  } as React.CSSProperties
                                }
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(
                                    selectedItem.content ||
                                      selectedItem.description,
                                    {
                                      ADD_TAGS: ["iframe", "video", "audio", "source"],
                                      ADD_ATTR: ["target", "allow", "allowfullscreen", "frameborder", "controls", "src", "width", "height"],
                                    }
                                  ),
                                }}
                              />
                              <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-xl text-center">
                                <p className="text-[11px] text-accent font-bold mb-2">
                                  Full article content could not be accurately
                                  extracted.
                                </p>
                                <button
                                  onClick={() => setViewMode("web")}
                                  className="px-4 py-2 bg-accent text-black text-[11px] font-bold rounded-lg hover:bg-accent/80 transition-colors"
                                >
                                  Open Web View
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Read More Overlay */}
                        {needsExpansion && !isArticleExpanded && (
                          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-app via-app/80 to-transparent flex items-end justify-center pb-2 pointer-events-none">
                            <button 
                              onClick={(e) => { e.preventDefault(); setIsArticleExpanded(true); }}
                              className="pointer-events-auto px-8 py-3 bg-accent text-black font-extrabold text-[11px] uppercase tracking-widest rounded-full shadow-xl shadow-accent/20 hover:-translate-y-1 transition-all duration-300"
                            >
                              Read Full Article
                            </button>
                          </div>
                        )}

                        {/* Show Less Button */}
                        {needsExpansion && isArticleExpanded && (
                          <div className="mt-10 flex justify-center border-t border-panel-border/50 pt-8">
                            <button 
                              onClick={(e) => { 
                                e.preventDefault(); 
                                setIsArticleExpanded(false); 
                                // Scroll back to top of article slightly
                                if (articleContentRef.current) {
                                  articleContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                              }}
                              className="px-6 py-2 border-2 border-panel-border text-light font-bold text-[11px] uppercase tracking-widest rounded-full hover:border-accent/50 hover:text-accent transition-colors"
                            >
                              Show Less
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Display Auto-Extracted Syllabus Topics & Keywords */}
                      {(isExtractingTopics || extractedTopics) && (
                        <div className="mt-12 bg-app/50 border border-panel-border rounded-2xl p-6 font-sans">
                          <h4 className="text-[13px] font-bold text-main uppercase tracking-wider mb-4 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-emerald-500" />
                            Related Syllabus Topics
                          </h4>
                          
                          {isExtractingTopics && !extractedTopics ? (
                            <div className="flex items-center gap-2 text-muted text-sm italic">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Extracting topics...
                            </div>
                          ) : extractedTopics ? (
                            <div className="space-y-4">
                              {/* Visual Progress Map */}
                              {(() => {
                                const isMatch = (str: string) => {
                                  const s = str.toLowerCase();
                                  return (extractedTopics.keywords || []).some(k => s.includes(k.toLowerCase()) || k.toLowerCase().includes(s)) || 
                                         (extractedTopics.syllabusTopics || []).some(t => s.includes(t.toLowerCase()) || t.toLowerCase().includes(s));
                                };

                                const filterTree = (nodes: Topic[]): Topic[] => {
                                  return nodes.map(node => {
                                    const matchHere = isMatch(node.title);
                                    const matchedChildren = filterTree(node.subtopics || []);
                                    
                                    if (matchHere || matchedChildren.length > 0) {
                                      return { ...node, subtopics: matchedChildren, _isExactMatch: matchHere };
                                    }
                                    return null;
                                  }).filter(Boolean) as (Topic & { _isExactMatch?: boolean })[];
                                };

                                const matchedTree = filterTree(userSyllabus);

                                const countStatuses = (nodes: any[]): { total: number, mastered: number, reading: number } => {
                                  let stats = { total: 0, mastered: 0, reading: 0 };
                                  for (const node of nodes) {
                                    if (node._isExactMatch) {
                                      stats.total++;
                                      if (node.status === 'mastered') stats.mastered++;
                                      if (node.status === 'reading') stats.reading++;
                                    }
                                    if (node.subtopics) {
                                      const childrenStats = countStatuses(node.subtopics);
                                      stats.total += childrenStats.total;
                                      stats.mastered += childrenStats.mastered;
                                      stats.reading += childrenStats.reading;
                                    }
                                  }
                                  return stats;
                                };
                                
                                const stats = countStatuses(matchedTree);
                                const progressPct = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
                                const readingPct = stats.total > 0 ? Math.round((stats.reading / stats.total) * 100) : 0;

                                const renderNode = (node: Topic & { _isExactMatch?: boolean }, depth = 0) => (
                                  <div key={node.id} style={{ paddingLeft: depth > 0 ? '16px' : '0' }} className="mt-2">
                                    <div className={`flex items-start gap-2 ${node._isExactMatch ? 'bg-accent/10 border border-accent/30 p-2 rounded-lg' : ''}`}>
                                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${node.status === 'mastered' ? 'bg-emerald-500' : node.status === 'reading' ? 'bg-accent/80' : 'bg-panel-border'}`} />
                                      <div>
                                        <span className={`text-sm ${node._isExactMatch ? 'font-bold text-main' : 'font-medium text-muted'} leading-tight`}>{node.title}</span>
                                        {node._isExactMatch && (
                                          <div className="text-[10px] text-accent font-bold uppercase tracking-wider mt-1">
                                            Status: {node.status.replace("_", " ")}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {node.subtopics && node.subtopics.length > 0 && (
                                      <div className="border-l border-panel-border ml-1 mt-1">
                                        {node.subtopics.map(sub => renderNode(sub, depth + 1))}
                                      </div>
                                    )}
                                  </div>
                                );

                                if (matchedTree.length === 0) return null;

                                return (
                                  <div className="bg-panel border border-panel-border rounded-xl p-4 mt-4">
                                    <h5 className="text-[11px] font-bold text-main uppercase tracking-wider mb-4 border-b border-panel-border pb-2">
                                      Your Syllabus Progress Map
                                    </h5>
                                    
                                    {/* Progress Bar Rendering */}
                                    {stats.total > 0 && (
                                      <div className="mb-4">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted mb-1.5">
                                          <span>{stats.mastered}/{stats.total} Mastered</span>
                                          <span>{progressPct}%</span>
                                        </div>
                                        <div className="relative h-2 w-full bg-input rounded-full overflow-hidden flex">
                                          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progressPct}%` }} />
                                          <div className="h-full bg-accent/80 transition-all" style={{ width: `${readingPct}%` }} />
                                        </div>
                                      </div>
                                    )}

                                    <div>
                                      {matchedTree.map(node => renderNode(node))}
                                    </div>
                                  </div>
                                );
                              })()}

                              {extractedTopics.syllabusTopics && extractedTopics.syllabusTopics.length > 0 && (
                                <div className="space-y-2">
                                  {extractedTopics.syllabusTopics.map((topic, i) => (
                                    <div key={i} className="flex items-start gap-2 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                      <span className="text-sm font-medium text-main">{topic}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {extractedTopics.keywords && extractedTopics.keywords.length > 0 && (
                                <div>
                                  <h5 className="text-[11px] font-bold text-muted uppercase tracking-widest mb-2 mt-4">Core Keywords</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {extractedTopics.keywords.map((kw, i) => (
                                      <span key={i} className="bg-panel-border/30 text-light px-2.5 py-1 rounded-md text-[11px] font-semibold">
                                        #{kw}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      )}
                        
                        {/* UPSC Study & Practice Suite */}
                        <div className="mt-12 border border-panel-border rounded-2xl overflow-hidden bg-panel/30">
                          {/* Tab Headers */}
                          <div className="flex border-b border-panel-border bg-panel/50 px-2 overflow-x-auto scrollbar-none">
                            <button
                              onClick={() => setActiveSubTab("summary")}
                              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                                activeSubTab === "summary"
                                  ? "border-accent text-accent animate-pulse-subtle"
                                  : "border-transparent text-muted hover:text-light"
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Syllabus Context
                            </button>
                            <button
                              onClick={() => setActiveSubTab("mcq")}
                              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                                activeSubTab === "mcq"
                                  ? "border-accent text-accent animate-pulse-subtle"
                                  : "border-transparent text-muted hover:text-light"
                              }`}
                            >
                              <Brain className="w-3.5 h-3.5" />
                              Prelims MCQ Practice
                            </button>
                            <button
                              onClick={() => setActiveSubTab("flashcards")}
                              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                                activeSubTab === "flashcards"
                                  ? "border-accent text-accent animate-pulse-subtle"
                                  : "border-transparent text-muted hover:text-light"
                              }`}
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              Active Recall Flashcards
                            </button>
                          </div>

                          {/* Tab Content */}
                          <div className="p-6">
                            {/* SUMMARY TAB */}
                            {activeSubTab === "summary" && (
                              <div>
                                {aisummaries[selectedItem.id] ? (
                                  <div className="space-y-6 animate-fade-in">
                                    <div className="prose prose-sm max-w-none text-main dark:text-main">
                                      <Markdown remarkPlugins={[remarkGfm]}>
                                        {aisummaries[selectedItem.id]}
                                      </Markdown>
                                    </div>
                                    <div className="flex justify-end pt-4 border-t border-panel-border/50">
                                      <button
                                        onClick={handleExportToBlueprint}
                                        className="flex items-center gap-2 px-4 py-2 bg-accent text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-accent/85 transition-all shadow-md shadow-accent/10"
                                      >
                                        <Plus className="w-4 h-4" /> Draft Mains Answer Blueprint
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center text-center py-8 max-w-md mx-auto space-y-4 animate-fade-in">
                                    <div className="p-3 bg-accent/10 rounded-full text-accent">
                                      <Sparkles className="w-6 h-6" />
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-bold text-main uppercase tracking-wider">
                                        Synthesize UPSC Syllabus Context
                                      </h4>
                                      <p className="text-[11px] text-muted leading-relaxed mt-1">
                                        Summarize this news article instantly into UPSC General Studies (GS) Paper linkages, high-yield syllabus takeaways, and custom Mains practice questions!
                                      </p>
                                    </div>
                                    <button
                                      onClick={handleAiSummarize}
                                      disabled={isSummarizing}
                                      className="px-5 py-2 bg-accent text-black rounded-xl font-bold transition-all text-xs uppercase tracking-wider disabled:opacity-50 flex items-center gap-2"
                                    >
                                      {isSummarizing ? (
                                        <>
                                          <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Article...
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="w-4 h-4" /> Synthesize Linkages
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* MCQ PRACTICE TAB */}
                            {activeSubTab === "mcq" && (
                              <div>
                                {mcqs[selectedItem.id] ? (
                                  <div className="space-y-6 animate-fade-in">
                                    <div className="bg-panel/40 border border-panel-border p-4 rounded-xl">
                                      <div className="flex items-center justify-between gap-2 border-b border-panel-border pb-2 mb-3">
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded">
                                          {mcqs[selectedItem.id].paper || "GS Paper"}
                                        </span>
                                        <span className="text-[11px] text-muted font-medium truncate max-w-[200px]">
                                          {mcqs[selectedItem.id].topic}
                                        </span>
                                      </div>
                                      <h4 className="text-sm font-bold text-main leading-relaxed mb-4">
                                        {mcqs[selectedItem.id].question}
                                      </h4>

                                      {/* Statements */}
                                      {mcqs[selectedItem.id].statements && mcqs[selectedItem.id].statements.length > 0 && (
                                        <ul className="mt-4 space-y-2.5 pl-2 mb-4">
                                          {mcqs[selectedItem.id].statements.map((stmt: string, index: number) => (
                                            <li key={index} className="text-xs text-light leading-relaxed flex items-start gap-2">
                                              <span className="font-bold text-accent flex-shrink-0">{index + 1}.</span>
                                              <span>{stmt}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      )}

                                      <p className="text-xs font-semibold text-main mt-4 italic mb-4">
                                        {mcqs[selectedItem.id].question_type || "Which of the statements given above is/are correct?"}
                                      </p>

                                      {/* Options Selection */}
                                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {Object.entries(mcqs[selectedItem.id].options || {}).map(([key, label]: [string, any]) => {
                                          const isSelected = mcqAnswers[selectedItem.id] === key;
                                          const isSubmitted = submittedMcqs[selectedItem.id];
                                          const isCorrect = mcqs[selectedItem.id].correct_option === key;

                                          let btnStyle = "border-panel-border hover:border-accent/40 bg-panel/30 text-light";
                                          if (isSelected) {
                                            btnStyle = "border-accent bg-accent/10 text-accent font-bold";
                                          }
                                          if (isSubmitted) {
                                            if (isCorrect) {
                                              btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold";
                                            } else if (isSelected) {
                                              btnStyle = "border-rose-500 bg-rose-500/10 text-rose-400 font-bold";
                                            } else {
                                              btnStyle = "border-panel-border opacity-50 bg-panel/10 text-muted";
                                            }
                                          }

                                          return (
                                            <button
                                              key={key}
                                              disabled={isSubmitted}
                                              onClick={() => setMcqAnswers(prev => ({ ...prev, [selectedItem.id]: key }))}
                                              className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs transition-all ${btnStyle}`}
                                            >
                                              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] uppercase ${
                                                isSelected ? "bg-accent text-black" : "bg-panel-border/40 text-muted"
                                              }`}>
                                                {key}
                                              </span>
                                              <span>{label}</span>
                                            </button>
                                          );
                                        })}
                                      </div>

                                      {/* Action bar */}
                                      <div className="mt-6 flex justify-between items-center gap-2 border-t border-panel-border pt-4">
                                        <button
                                          onClick={() => {
                                            setSubmittedMcqs(prev => {
                                              const u = { ...prev };
                                              delete u[selectedItem.id];
                                              return u;
                                            });
                                            setMcqAnswers(prev => {
                                              const u = { ...prev };
                                              delete u[selectedItem.id];
                                              return u;
                                            });
                                          }}
                                          className="text-[11px] text-muted hover:text-accent font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                                        >
                                          <RotateCcw className="w-3.5 h-3.5" /> Reset
                                        </button>
                                        
                                        {!submittedMcqs[selectedItem.id] ? (
                                          <button
                                            disabled={!mcqAnswers[selectedItem.id]}
                                            onClick={() => setSubmittedMcqs(prev => ({ ...prev, [selectedItem.id]: true }))}
                                            className="px-4 py-1.5 bg-accent text-black font-extrabold rounded-lg text-[11px] uppercase tracking-wider hover:bg-accent/80 transition-colors disabled:opacity-40"
                                          >
                                            Submit Answer
                                          </button>
                                        ) : (
                                          <span className={`text-[11px] font-extrabold uppercase tracking-widest ${
                                            mcqAnswers[selectedItem.id] === mcqs[selectedItem.id].correct_option ? "text-emerald-400" : "text-rose-400"
                                          }`}>
                                            {mcqAnswers[selectedItem.id] === mcqs[selectedItem.id].correct_option ? "● Correct" : "● Incorrect"}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Explanation once submitted */}
                                    {submittedMcqs[selectedItem.id] && (
                                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-xl space-y-3 animate-fade-in">
                                        <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                          <CheckCircle2 className="w-3.5 h-3.5" /> High-Yield CSE Explanation
                                        </h5>
                                        <p className="text-xs text-light leading-relaxed whitespace-pre-line">
                                          {mcqs[selectedItem.id].explanation}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center text-center py-8 max-w-md mx-auto space-y-4 animate-fade-in">
                                    <div className="p-3 bg-accent/10 rounded-full text-accent">
                                      <Brain className="w-6 h-6" />
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-bold text-main uppercase tracking-wider">
                                        Generate UPSC Prelims MCQ
                                      </h4>
                                      <p className="text-[11px] text-muted leading-relaxed mt-1">
                                        Generate a high-yield, conceptual UPSC statement-style Multiple Choice Question (MCQ) specifically mapped to the facts and arguments of this article!
                                      </p>
                                    </div>
                                    <button
                                      onClick={handleGenerateMcq}
                                      disabled={isGeneratingMcq}
                                      className="px-5 py-2 bg-accent text-black rounded-xl font-bold transition-all text-xs uppercase tracking-wider disabled:opacity-50 flex items-center gap-2"
                                    >
                                      {isGeneratingMcq ? (
                                        <>
                                          <Loader2 className="w-4 h-4 animate-spin" /> Compiling MCQ...
                                        </>
                                      ) : (
                                        <>
                                          <Brain className="w-4 h-4" /> Generate Practice MCQ
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* FLASHCARDS TAB */}
                            {activeSubTab === "flashcards" && (
                              <div>
                                {flashcards[selectedItem.id] ? (
                                  <div className="space-y-4 animate-fade-in">
                                    <div className="flex items-center justify-between gap-2 border-b border-panel-border pb-2 mb-3">
                                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted">
                                        Active Recall Mode
                                      </span>
                                      <span className="text-[10px] font-extrabold text-accent uppercase tracking-widest">
                                        {flashcards[selectedItem.id].length} Cards Generated
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                      {flashcards[selectedItem.id].map((fc: any, index: number) => {
                                        const isFlipped = flippedCards[`${selectedItem.id}-${index}`];
                                        return (
                                          <div
                                            key={index}
                                            onClick={() => setFlippedCards(prev => ({ ...prev, [`${selectedItem.id}-${index}`]: !isFlipped }))}
                                            className={`cursor-pointer border rounded-2xl p-5 min-h-[120px] flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                                              isFlipped 
                                                ? "border-emerald-500/40 bg-emerald-500/5 shadow-inner" 
                                                : "border-panel-border hover:border-accent/40 bg-panel/20 shadow-sm"
                                            }`}
                                          >
                                            {/* Card Indicator */}
                                            <div className="absolute top-3 right-4 text-[9px] font-extrabold uppercase tracking-widest text-muted">
                                              {isFlipped ? "Answer" : "Question"} #{index + 1}
                                            </div>

                                            <div className="py-2 pr-12">
                                              {isFlipped ? (
                                                <p className="text-xs text-light leading-relaxed whitespace-pre-line font-medium animate-fade-in">
                                                  {fc.answer}
                                                </p>
                                              ) : (
                                                <h5 className="text-xs font-bold text-main leading-relaxed animate-fade-in">
                                                  {fc.question}
                                                </h5>
                                              )}
                                            </div>

                                            <div className="text-[10px] font-bold text-accent uppercase tracking-wider self-start mt-2">
                                              {isFlipped ? "Click to flip back" : "Click to reveal answer"}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center text-center py-8 max-w-md mx-auto space-y-4 animate-fade-in">
                                    <div className="p-3 bg-accent/10 rounded-full text-accent">
                                      <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-bold text-main uppercase tracking-wider">
                                        Extract Active Recall Flashcards
                                      </h4>
                                      <p className="text-[11px] text-muted leading-relaxed mt-1">
                                        Extract a targeted set of revision flashcards designed for long-term retention of constitutional provisions, statistics, committees, and data!
                                      </p>
                                    </div>
                                    <button
                                      onClick={handleGenerateFlashcards}
                                      disabled={isGeneratingFlashcards}
                                      className="px-5 py-2 bg-accent text-black rounded-xl font-bold transition-all text-xs uppercase tracking-wider disabled:opacity-50 flex items-center gap-2"
                                    >
                                      {isGeneratingFlashcards ? (
                                        <>
                                          <Loader2 className="w-4 h-4 animate-spin" /> Processing Cards...
                                        </>
                                      ) : (
                                        <>
                                          <BookOpen className="w-4 h-4" /> Extract Flashcards
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                    </article>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/5">
            <div className="max-w-md space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-3xl border border-accent/20 flex items-center justify-center mx-auto shadow-sm">
                <BookOpen className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-black text-main uppercase tracking-wider">
                  No Article Selected
                </h3>
                <p className="text-[11px] text-muted max-w-sm mt-1 mx-auto leading-relaxed">
                  Select any current affairs item from the left catalog panel,
                  or insert personalized external RSS feeds to keep track of
                  constitutional, global and national edits!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RssReaderView;
