import React, { useState, useEffect } from 'react';
import { Mail, Sparkles, RefreshCw, Calendar, Loader2, AlertTriangle, Brain, Filter, CheckCircle2, ArrowRight } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Topic, initialSyllabus } from './SyllabusTracker';

interface RssFeed {
  id: string;
  name?: string;
  url: string;
}

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
    name: "The Hindu - Opinion",
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
    id: "livemint-op",
    name: "Livemint - Opinion",
    url: "https://www.livemint.com/rss/opinion",
  },
  {
    id: "livemint-eco",
    name: "Livemint - Economy",
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

interface FlattenedTopic {
  id: string;
  title: string;
  status: "not_started" | "reading" | "mastered";
}

function flattenSyllabus(topics: Topic[]): FlattenedTopic[] {
  let list: FlattenedTopic[] = [];
  if (!topics || !Array.isArray(topics)) return list;
  for (const topic of topics) {
    list.push({ id: topic.id, title: topic.title, status: topic.status });
    if (topic.subtopics && topic.subtopics.length > 0) {
      list = list.concat(flattenSyllabus(topic.subtopics));
    }
  }
  return list;
}

function calculateMLRelevance(
  title: string, 
  description: string, 
  flattenedSyllabus: FlattenedTopic[]
): { 
  score: number;       // 0 to 100 percentage
  matchedTopic: string; 
  matchedStatus: "not_started" | "reading" | "mastered" | null;
  relevanceClass: "Unsuitable" | "Inference Align" | "Direct High Yield" | "Critically Core";
} {
  const fullText = (title + " " + description).toLowerCase();

  // Stop words to clean up token comparison
  const stopWords = new Set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "arent", 
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "cant", 
    "cannot", "could", "did", "do", "does", "doing", "dont", "down", "during", "each", "few", "for", "from", 
    "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", "himself", 
    "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "lets", "me", "more", "most", "must", 
    "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", 
    "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such", "than", "that", 
    "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those", "through", 
    "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", 
    "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself", "yourselves"
  ]);

  // Clean and tokenize article words
  const cleanTokens = fullText
    .replace(/[^\w\s-]/g, "")
    .split(/\s+/)
    .filter(token => token.length > 2 && !stopWords.has(token));

  // 1. Extreme Penalty Filter (Frivolous and Non-exam clickbaits)
  const frivolousKeywords = [
    "cricket", "ipl", "t20", "match score", "bollywood", "celebrity", "gossip", 
    "movie review", "box office", "actor", "actress", "murder case", 
    "theft", "accident kills", "fashion show", "dating", "horoscope", "serial killer", 
    "stolen", "gold rate today", "silver rate", "stock tips", "entertainment", "scandal",
    "bizarre", "paparazzi", "romance", "celeb", "viral video", "divorce", "remarry"
  ];

  for (const word of frivolousKeywords) {
    if (fullText.includes(word)) {
      return { 
        score: 0, 
        matchedTopic: "Frivolous / Clickbait (Auto-Filtered)", 
        matchedStatus: null,
        relevanceClass: "Unsuitable" 
      };
    }
  }

  // 2. Compute similarity across each syllabus module
  let maxScore = 0;
  let bestTopic: FlattenedTopic | null = null;

  for (const topic of flattenedSyllabus) {
    // Basic structural topics like "Preliminary Examination" are not content modules, skip
    if (topic.id === "prelims" || topic.id === "pre-p1" || topic.id === "pre-p2") {
      continue;
    }

    const tTitle = topic.title.toLowerCase();
    
    // Tokenize topic title
    const tTokens = tTitle
      .replace(/[^\w\s-]/g, "")
      .split(/\s+/)
      .filter(token => token.length > 3 && !stopWords.has(token));

    let intersectionCount = 0;
    for (const token of tTokens) {
      if (cleanTokens.includes(token)) {
        intersectionCount++;
      }
    }

    if (intersectionCount > 0) {
      // Calculate overlap score
      let topicWeight = intersectionCount * 12;

      // UPSC Syllabus Module Multipliers (Affinity and learning speed priority)
      if (topic.status === "reading") {
        topicWeight *= 3.0; // Dynamic Current Module Boost (300% multiplier)
      } else if (topic.status === "mastered") {
        topicWeight *= 1.4; // Mastered Syllabus recall validation
      } else {
        topicWeight *= 1.0; 
      }

      if (topicWeight > maxScore) {
        maxScore = topicWeight;
        bestTopic = topic;
      }
    }
  }

  // 3. Add base broad-domain modifiers for core UPSC terms
  const coreUpscKeywords = [
    { kw: "constitution", weight: 15 },
    { kw: "supreme court", weight: 18 },
    { kw: "parliament", weight: 15 },
    { kw: "amendment", weight: 15 },
    { kw: "governing", weight: 10 },
    { kw: "monetary policy", weight: 15 },
    { kw: "inflation", weight: 12 },
    { kw: "gdp", weight: 12 },
    { kw: "fiscal deficit", weight: 15 },
    { kw: "geopolitics", weight: 15 },
    { kw: "bilateral relations", weight: 15 },
    { kw: "isro", weight: 15 },
    { kw: "satellite", weight: 12 },
    { kw: "semiconductor", weight: 15 },
    { kw: "biotechnology", weight: 15 },
    { kw: "climate change", weight: 18 },
    { kw: "biodiversity", weight: 15 },
    { kw: "pollution", weight: 10 },
    { kw: "disaster management", weight: 15 },
    { kw: "tribal welfare", weight: 12 },
    { kw: "social security", weight: 12 }
  ];

  let baseUpscScore = 0;
  for (const entry of coreUpscKeywords) {
    if (fullText.includes(entry.kw)) {
      baseUpscScore += entry.weight;
    }
  }

  // Combine scores
  let rawWeightedSum = maxScore + baseUpscScore;

  // Clamp and format the score between 0 and 100
  let percentageScore = Math.min(100, Math.round((rawWeightedSum / 65) * 100));

  // Even if no direct syllabus token hits, if it contains UPSC keywords, give it a baseline relevance
  if (percentageScore === 0 && baseUpscScore > 0) {
    percentageScore = Math.min(60, Math.round(baseUpscScore * 2.5));
  }

  // Cap lowest non-frivolous score to 15% if it has positive indicators
  if (percentageScore < 15 && rawWeightedSum > 0) {
    percentageScore = 15;
  }

  // Determine classification class
  let relevanceClass: "Unsuitable" | "Inference Align" | "Direct High Yield" | "Critically Core" = "Inference Align";
  if (percentageScore >= 80) {
    relevanceClass = "Critically Core";
  } else if (percentageScore >= 50) {
    relevanceClass = "Direct High Yield";
  } else {
    relevanceClass = "Inference Align";
  }

  return {
    score: percentageScore,
    matchedTopic: bestTopic ? bestTopic.title : "General Current Affairs / Multi-Syllabus alignment",
    matchedStatus: bestTopic ? bestTopic.status : null,
    relevanceClass
  };
}

function checkUpscRelevance(title: string, description: string): { score: number; highYield: boolean } {
  // Load syllabus to apply ML-relevance on-the-fly
  let currentSyllabus = initialSyllabus;
  try {
    const saved = localStorage.getItem("upsc_syllabus_v2");
    if (saved) {
      currentSyllabus = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load syllabus in relevance checker", e);
  }

  const flattened = flattenSyllabus(currentSyllabus);
  const result = calculateMLRelevance(title, description, flattened);

  return {
    score: result.score,
    highYield: result.score >= 15 // Positive relevance above 15% threshold is high-yield
  };
}

interface DailyDigestViewProps {
  model?: string;
  onNavigate?: (view: string) => void;
}

export function DailyDigestView({ model, onNavigate }: DailyDigestViewProps = {}) {
  const [digest, setDigest] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGeneratedTime, setLastGeneratedTime] = useState<string | null>(null);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);
  const [rankedItems, setRankedItems] = useState<any[]>([]);
  const [syllabus, setSyllabus] = useState<Topic[]>(() => {
    const saved = localStorage.getItem("upsc_syllabus_v2");
    return saved ? JSON.parse(saved) : initialSyllabus;
  });

  // Filter by Syllabus states
  const [filterBySyllabus, setFilterBySyllabus] = useState(false);
  const [isSyllabusMatching, setIsSyllabusMatching] = useState(false);
  const [syllabusMatches, setSyllabusMatches] = useState<Record<string, { matchedTopic: string; relevance: string; explanation: string }>>({});
  const [syllabusMatchError, setSyllabusMatchError] = useState<string | null>(null);

  const performSyllabusMatch = async (itemsList: any[]) => {
    if (!itemsList || itemsList.length === 0) return;
    setIsSyllabusMatching(true);
    setSyllabusMatchError(null);

    const flattened = flattenSyllabus(syllabus);
    const inProgress = flattened.filter(t => t.status === "reading");
    const activeTopics = inProgress.length > 0 
      ? inProgress 
      : flattened.filter(t => t.status === "mastered");
    
    // Fallback: if no active reading or mastered topics, match with first 15 standard syllabus tracker items
    const finalTopicsToMatch = activeTopics.length > 0 
      ? activeTopics.map(t => t.title) 
      : flattened.slice(0, 15).map(t => t.title);

    try {
      const resp = await fetch("/api/rss-syllabus-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itemsList.map(item => ({
            title: item.title,
            description: item.description
          })),
          syllabusTopics: finalTopicsToMatch
        })
      });

      if (!resp.ok) {
        throw new Error("Failed to secure AI syllabus matches.");
      }

      const data = await resp.json();
      const matchesMap: Record<string, { matchedTopic: string; relevance: string; explanation: string }> = {};
      
      if (data.matches && Array.isArray(data.matches)) {
        data.matches.forEach((m: any) => {
          const item = itemsList[m.index];
          if (item && item.link) {
            matchesMap[item.link] = {
              matchedTopic: m.matchedTopic,
              relevance: m.relevance,
              explanation: m.explanation
            };
          }
        });
      }

      setSyllabusMatches(matchesMap);
    } catch (err: any) {
      console.error("Syllabus match failed:", err);
      setSyllabusMatchError(err.message || "Failed to cross-reference with syllabus.");
      setFilterBySyllabus(false);
    } finally {
      setIsSyllabusMatching(false);
    }
  };

  const handleToggleSyllabusFilter = async (checked: boolean) => {
    setFilterBySyllabus(checked);
    if (checked && Object.keys(syllabusMatches).length === 0 && rankedItems.length > 0) {
      await performSyllabusMatch(rankedItems);
    }
  };

  const displayItems = React.useMemo(() => {
    if (!filterBySyllabus) return rankedItems;
    return rankedItems.filter(item => syllabusMatches[item.link]);
  }, [rankedItems, filterBySyllabus, syllabusMatches]);

  useEffect(() => {
    if (filterBySyllabus && rankedItems.length > 0 && Object.keys(syllabusMatches).length === 0) {
      performSyllabusMatch(rankedItems);
    }
  }, [filterBySyllabus, rankedItems]);

  useEffect(() => {
    // Check if we have a today digest stored
    const todayStr = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`upsc_daily_digest`);
    const savedDate = localStorage.getItem(`upsc_daily_digest_date`);

    if (saved && savedDate === todayStr) {
      setDigest(saved);
      setLastGeneratedTime(localStorage.getItem(`upsc_daily_digest_time`) || null);
      setIsOfflineFallback(localStorage.getItem(`upsc_daily_digest_is_fallback`) === "true");
    }
  }, []);

  useEffect(() => {
    try {
      const itemsRaw = localStorage.getItem("upsc_rss_digest_source_items");
      if (itemsRaw) {
        const parsed = JSON.parse(itemsRaw);
        const flattened = flattenSyllabus(syllabus);
        const scored = parsed.map((item: any) => {
          const ml = calculateMLRelevance(item.title || "", item.description || "", flattened);
          return {
            ...item,
            mlScore: ml.score,
            matchedTopic: ml.matchedTopic,
            matchedStatus: ml.matchedStatus,
            relevanceClass: ml.relevanceClass
          };
        }).sort((a: any, b: any) => b.mlScore - a.mlScore);
        setRankedItems(scored);
      } else {
        setRankedItems([]);
      }
    } catch (e) {
      console.error("Failed to parse source items on load", e);
    }
  }, [digest, syllabus]);

  const parseFeedXml = (xmlString: string) => {
    // Sanitize unescaped ampersands to prevent parsing errors like xmlParseEntityRef: no name
    const sanitizedXml = xmlString.replace(/&(?!(#[xX]?[0-9a-fA-F]+|[a-zA-Z0-9]+);)/g, "&amp;");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sanitizedXml, "text/xml");
    const items = Array.from(xmlDoc.querySelectorAll("item"));
    return items.map((item) => ({
      title: item.querySelector("title")?.textContent || "Untitled",
      description: item.querySelector("description")?.textContent?.replace(/<[^>]+>/g, '') || "",
      link: item.querySelector("link")?.textContent || "",
      pubDate: item.querySelector("pubDate")?.textContent || "",
    }));
  };

  const extractItemsFromFeed = async (url: string) => {
    try {
      const resp = await fetch(`/api/rss-proxy?url=${encodeURIComponent(url)}`);
      let parsedItems: any[] = [];
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.items) {
          parsedItems = data.items;
        } else if (data && data.xmlFallback) {
          parsedItems = parseFeedXml(data.xmlFallback);
        }
      }
      return parsedItems;
    } catch (e) {
      console.error("Failed fetching for digest:", url, e);
      return [];
    }
  };

  const generateDigest = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Get URLs from localStorage or default
      const saved = localStorage.getItem("upsc_rss_feeds");
      const feeds: RssFeed[] = saved ? JSON.parse(saved) : DEFAULT_FEEDS;
      
      // Fetch feeds in parallel
      const feedPromises = feeds.map(feed => extractItemsFromFeed(feed.url));
      const results = await Promise.all(feedPromises);
      
      let allItems: any[] = [];
      results.forEach(items => {
        allItems = [...allItems, ...items];
      });

      // Filter only recent items (last 48 hours for broader coverage if some feeds update slow)
      const now = new Date();
      const recentItems = allItems.filter(item => {
        if (!item.pubDate) return true;
        const d = new Date(item.pubDate);
        if (isNaN(d.getTime())) return true;
        const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
        return diffHours <= 48;
      });

      // Filter and rank based on UPSC syllabus high-yield relevance scoring, ignoring frivolous news
      const ratedItems = recentItems.map(item => {
        const relevance = checkUpscRelevance(item.title || "", item.description || "");
        return { ...item, relevanceScore: relevance.score, isHighYield: relevance.highYield };
      });

      // Exclude blocklisted frivolous news items (negative score) and order descending by score
      let upscItems = ratedItems
        .filter(item => item.relevanceScore >= -5)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Fallback in case list is entirely depleted
      if (upscItems.length < 5) {
        upscItems = recentItems;
      }

      // Send to summarize endpoint (limit to first 30 high-yield items)
      const targetItems = upscItems.slice(0, 30);

      if (targetItems.length === 0) {
        throw new Error("No recent articles found to summarize.");
      }

      const res = await fetch('/api/generate-daily-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: targetItems, model })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate digest");
      }

      if (data.digest) {
        const todayStr = new Date().toISOString().split('T')[0];
        const timeStr = new Date().toLocaleTimeString();
        const fallbackActive = data.isOfflineFallback || false;
        
        setDigest(data.digest);
        setLastGeneratedTime(timeStr);
        setIsOfflineFallback(fallbackActive);
        
        localStorage.setItem(`upsc_daily_digest`, data.digest);
        localStorage.setItem(`upsc_rss_digest_source_items`, JSON.stringify(targetItems));
        localStorage.setItem(`upsc_daily_digest_date`, todayStr);
        localStorage.setItem(`upsc_daily_digest_time`, timeStr);
        localStorage.setItem(`upsc_daily_digest_is_fallback`, fallbackActive ? "true" : "false");

        // Reactively score and update ranked items panel immediately
        const flattened = flattenSyllabus(syllabus);
        const scoredAndSaved = targetItems.map((item: any) => {
          const ml = calculateMLRelevance(item.title || "", item.description || "", flattened);
          return {
            ...item,
            mlScore: ml.score,
            matchedTopic: ml.matchedTopic,
            matchedStatus: ml.matchedStatus,
            relevanceClass: ml.relevanceClass
          };
        }).sort((a: any, b: any) => b.mlScore - a.mlScore);
        setRankedItems(scoredAndSaved);
      } else {
        throw new Error("Empty response received from AI.");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8 scroll-smooth overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-panel-border border-dashed">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-main flex items-center gap-3">
              <Mail className="w-8 h-8 text-accent" />
              Daily Prep Digest
            </h1>
            <p className="text-muted mt-2 max-w-xl text-sm leading-relaxed">
              Your intelligent morning briefing. Automatically collated and structured from your configured RSS feeds, highlighting only the most relevant UPSC stories of the day.
            </p>
          </div>
          
          <button
            onClick={generateDigest}
            disabled={isGenerating}
            className="flex-shrink-0 flex items-center gap-2 bg-main text-app px-5 py-2.5 rounded-xl font-bold hover:bg-main/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin text-app" />
            ) : (
              <RefreshCw className="w-4 h-4 text-app" />
            )}
            {isGenerating ? 'Collating Sources...' : 'Generate Today\'s Digest'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Content Section */}
        {digest ? (
          <div className="bg-panel rounded-2xl border border-panel-border shadow-sm p-6 md:p-10 font-sans shadow-lg">
            {isOfflineFallback && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 text-amber-800 dark:text-amber-400 p-4 rounded-xl flex items-start gap-2.5 mb-6 text-[11px] leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">Offline Synthesis Engaged</strong>
                  <span>Cloud synthesis hit API limits. Active local heuristics compiled this study digest to maintain uninterrupted prep.</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted mb-8 pb-4 border-b border-panel-border/50">
              <Calendar className="w-4 h-4 text-emerald-500" /> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              <span className="opacity-50 ml-auto flex items-center gap-1"><Sparkles className="w-3 h-3 text-accent"/> Generated at {lastGeneratedTime}</span>
            </div>
            
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl flex items-center justify-between gap-4 mb-6 text-[11px]">
              <span className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                High-yield filtering applied. Clicking full summary links below dynamically redirects to RSS Feed Reader.
              </span>
            </div>

            <div 
               className="markdown-body prose max-w-none prose-p:my-2 prose-h2:text-accent prose-h2:mt-8 prose-h2:mb-4 prose-h2:uppercase prose-h2:text-sm prose-h2:tracking-widest prose-h2:font-black prose-li:my-1 text-main font-sans"
               style={{ "--tw-prose-body": "var(--text-main)" } as any}
            >
              <Markdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, href, children, ...props }) => {
                    const handleClick = (e: React.MouseEvent) => {
                      if (href) {
                        e.preventDefault();
                        
                        // Try to find the full article object in our source items list
                        let matchedItem: any = null;
                        try {
                          const savedItemsRaw = localStorage.getItem("upsc_rss_digest_source_items");
                          if (savedItemsRaw) {
                            const savedItems = JSON.parse(savedItemsRaw);
                            matchedItem = savedItems.find((item: any) => item.link === href);
                          }
                        } catch (err) {
                          console.error("Error reading saved digest items:", err);
                        }

                        // Save to redirect pointers
                        localStorage.setItem("upsc_rss_pending_link", href);
                        if (matchedItem) {
                          localStorage.setItem("upsc_rss_pending_article", JSON.stringify(matchedItem));
                        }
                        
                        const label = String(children || "");
                        if (label && label.length > 5 && !label.includes("Analyze Full News")) {
                          localStorage.setItem("upsc_rss_pending_title", label);
                        }
                        if (onNavigate) {
                          onNavigate('rss-reader');
                        }
                      }
                    };
                    return (
                      <a 
                        href={href} 
                        onClick={handleClick} 
                        className="text-accent underline hover:text-accent/80 font-bold inline-flex items-center gap-1 cursor-pointer"
                        {...props}
                      >
                        {children}
                      </a>
                    );
                  }
                }}
              >
                {digest}
              </Markdown>
            </div>

            {/* ML Current Affairs Relevance Analysis Dashboard */}
            {rankedItems && rankedItems.length > 0 && (
              <div id="ml-relevance-dashboard" className="mt-12 pt-8 border-t border-panel-border/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Brain className="w-5 h-5 text-accent animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-main flex items-center gap-2">
                        UPSC Relevance Classifier Audit (Syllabus Core Matcher)
                      </h3>
                      <p className="text-muted text-[11px]">
                        Active Natural Language overlaps & syllabus topic multipliers. Click a story block to pre-load inside RSS Reader.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Filter by Syllabus Toggle Control Panel */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 mb-6 rounded-2xl bg-accent/5 border border-accent/20">
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-main flex items-center gap-2">
                      Syllabus Alignment Matcher
                    </h4>
                    <p className="text-[11px] text-muted font-semibold">
                      Cross-reference news headlines with your active modules using smart AI semantic linkage.
                    </p>
                    {(() => {
                      const flattened = flattenSyllabus(syllabus);
                      const activeModulesCount = flattened.filter(t => t.status === "reading").length;
                      const masteredModulesCount = flattened.filter(t => t.status === "mastered").length;
                      return (
                        <div className="text-[10px] text-accent/80 font-bold flex flex-wrap items-center gap-2 mt-1">
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase font-extrabold text-[8px]">
                            {activeModulesCount} In Progress
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase font-extrabold text-[8px]">
                            {masteredModulesCount} Mastered
                          </span>
                          {activeModulesCount === 0 && (
                            <span className="text-[9.5px] text-amber-500/90 font-bold">
                              (No active 'Reading' modules. Matching broader syllabus tracker topics as fallback)
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={filterBySyllabus}
                        onChange={(e) => handleToggleSyllabusFilter(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-panel-border rounded-full peer peer-focus:ring-2 peer-focus:ring-accent/50 dark:bg-panel-border peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
                      <span className="ml-2.5 text-[11px] font-black uppercase text-main tracking-widest">
                        {filterBySyllabus ? "Active Filter" : "Syllabus Filter Off"}
                      </span>
                    </label>
                  </div>
                </div>

                {syllabusMatchError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-[11px] font-semibold mb-4 flex items-center justify-between gap-3">
                    <span>{syllabusMatchError}</span>
                    <button
                      onClick={() => performSyllabusMatch(rankedItems)}
                      className="px-2.5 py-1 bg-rose-500/20 text-rose-300 text-[10px] uppercase font-black tracking-wider rounded-lg hover:bg-rose-500/30 transition-all"
                    >
                      Retry Match
                    </button>
                  </div>
                )}

                {isSyllabusMatching && (
                  <div className="flex flex-col items-center justify-center p-12 text-center border border-panel-border/40 bg-app rounded-2xl animate-pulse my-6">
                    <Loader2 className="w-8 h-8 animate-spin text-accent mb-3" />
                    <h4 className="text-[11px] font-black uppercase text-main tracking-widest">
                      Cross-Referencing via AI Matcher
                    </h4>
                    <p className="text-[11px] text-muted font-semibold mt-1">
                      Performing deep semantic evaluation of daily headlines against your saved UPSC CSE syllabus topics...
                    </p>
                  </div>
                )}

                {!isSyllabusMatching && filterBySyllabus && displayItems.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-12 text-center border border-panel-border/40 bg-app rounded-2xl my-6">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mb-3" />
                    <h4 className="text-[11px] font-black uppercase text-main tracking-widest">
                      No Close Syllabus Matches Found
                    </h4>
                    <p className="text-[11px] text-muted font-semibold mt-1 max-w-sm mx-auto leading-relaxed">
                      None of today's headlines closely match your active 'Reading' or 'Mastered' syllabus modules. Change topic status in the Syllabus Tracker to expand focus.
                    </p>
                  </div>
                )}

                {!isSyllabusMatching && displayItems && displayItems.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayItems.map((item: any, i: number) => {
                      const isCore = item.relevanceClass === "Critically Core";
                      const isHighYield = item.relevanceClass === "Direct High Yield";
                      const scoreBg = isCore 
                        ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                        : isHighYield 
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                          : "bg-blue-500/10 text-blue-500 border-blue-500/20";
                      
                      const pBarColor = isCore 
                        ? "bg-rose-500" 
                        : isHighYield 
                          ? "bg-amber-500" 
                          : "bg-blue-500";

                      return (
                        <div 
                          id={`ml-item-${i}`}
                          key={i}
                          onClick={() => {
                            if (item.link) {
                              localStorage.setItem("upsc_rss_pending_link", item.link);
                              localStorage.setItem("upsc_rss_pending_article", JSON.stringify(item));
                              if (item.title) {
                                localStorage.setItem("upsc_rss_pending_title", item.title);
                              }
                              if (onNavigate) {
                                onNavigate('rss-reader');
                              }
                            }
                          }}
                          className="group border border-panel-border hover:border-accent p-4 rounded-xl bg-app hover:bg-accent/5 transition-all text-left cursor-pointer flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] uppercase font-bold text-muted tracking-wider">
                                Rank #{i+1} • {item.pubDate ? new Date(item.pubDate).toLocaleDateString() : "Newsdesk"}
                              </span>
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${scoreBg}`}>
                                {item.mlScore}% {item.relevanceClass}
                              </span>
                            </div>
                            <h4 className="text-[11px] font-bold text-main line-clamp-2 leading-relaxed group-hover:text-accent transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-panel-border/30 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-muted font-black uppercase tracking-wider">Syllabus Linkage:</span>
                              {(item.matchedStatus === "reading" || (syllabusMatches[item.link] && syllabusMatches[item.link].relevance === "High")) && (
                                <span className="bg-emerald-500/20 text-emerald-500 px-1.5 py-0.2 rounded font-black uppercase text-[8px] animate-pulse">
                                  CURRENT MODULE 🔥
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-medium text-main/90 line-clamp-1">
                              {syllabusMatches[item.link] ? syllabusMatches[item.link].matchedTopic : item.matchedTopic}
                            </p>
                            
                            {/* AI MATCH INSIGHT block */}
                            {syllabusMatches[item.link] && (
                              <div className="mt-2.5 p-2 rounded bg-accent/5 border border-accent/15 text-[11px] leading-relaxed text-main/80 font-medium">
                                <span className="text-[9px] font-black uppercase tracking-widest text-accent block mb-0.5">AI MATCH INSIGHT</span>
                                {syllabusMatches[item.link].explanation}
                              </div>
                            )}

                            <div className="w-full bg-panel-border/40 h-1.5 rounded-full overflow-hidden mt-1">
                              <div className={`h-full ${pBarColor} rounded-full`} style={{ width: `${item.mlScore}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          !isGenerating && (
            <div className="flex flex-col items-center justify-center p-20 text-center border border-panel-border border-dashed rounded-2xl bg-panel">
              <Mail className="w-12 h-12 text-light mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-main mb-2">No Digest Generated Today</h3>
              <p className="text-muted text-sm max-w-sm mb-6">Click the button above to auto-read your news feeds and build your curated syllabus-aligned summary.</p>
              <button
                onClick={generateDigest}
                className="px-6 py-2.5 bg-accent/10 text-accent rounded-xl font-bold text-sm tracking-wide hover:bg-accent/20 transition-colors"
              >
                Build Digest
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
