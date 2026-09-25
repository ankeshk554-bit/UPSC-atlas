import React, { useState, useEffect } from "react";
import {
  Network,
  Link2,
  Loader2,
  Trash2,
  Globe,
  BookOpen,
  Tag,
  Scale,
  Key,
  FileText,
  ChevronRight,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { DeepSeekModel } from "../types";

interface CurrentAffairsViewProps {
  model: DeepSeekModel;
}

interface Dimension {
  heading: string;
  points: string[];
}

interface LinkedAffair {
  id: string;
  sourceText: string;
  date: string;
  papers: string[];
  topics: string[];
  coreIssue: string;
  dimensions: Dimension[];
  keyTerms: string[];
  precedents: string[];
}

export function CurrentAffairsView({ model }: CurrentAffairsViewProps) {
  const [affairs, setAffairs] = useState<LinkedAffair[]>(() => {
    const saved = localStorage.getItem("upsc_affairs_v2");
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    localStorage.setItem("upsc_affairs_v2", JSON.stringify(affairs));
  }, [affairs]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "upsc_affairs_v2" && e.newValue) {
        try {
          setAffairs(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const query = input;
    setInput("");
    setIsLoading(true);
    setError(null);

    const prompt = `Analyze this current affair for the UPSC Civil Services Exam (focusing on General Studies and Law Optional).
Please return the analysis STRICTLY in the following JSON format without any markdown wrappers or additional text:
{
  "papers": ["array of related papers, e.g., 'GS 2', 'Law Paper 1'"],
  "topics": ["array of specific syllabus micro-topics linked"],
  "coreIssue": "A concise 1-2 sentence summary of the core issue",
  "dimensions": [
    {
      "heading": "e.g., Constitutional Angle, Pros/Cons, Economic Impact, Way Forward",
      "points": ["point 1", "point 2"]
    }
  ],
  "keyTerms": ["list of exact keywords/vocabulary/phrases to use in answers"],
  "precedents": ["list of relevant Supreme Court cases, Articles, or statutes (if any)"]
}
Current Affair:
${query}`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          model,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Parse JSON safely handling potential markdown wrappers
      let parsedData;
      try {
        const jsonStr = data.reply
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        const start = jsonStr.indexOf("{");
        const end = jsonStr.lastIndexOf("}") + 1;
        parsedData = JSON.parse(jsonStr.slice(start, end));
      } catch (err) {
        throw new Error("Failed to parse the structured response from AI.");
      }

      const newAffair: LinkedAffair = {
        id: Date.now().toString(),
        sourceText: query,
        date: new Date().toISOString(),
        papers: parsedData.papers || [],
        topics: parsedData.topics || [],
        coreIssue: parsedData.coreIssue || "No core issue identified.",
        dimensions: parsedData.dimensions || [],
        keyTerms: parsedData.keyTerms || [],
        precedents: parsedData.precedents || [],
      };

      setAffairs((prev) => [newAffair, ...prev]);
      setExpandedId(newAffair.id);
    } catch (err: any) {
      setError(`Error linking affair: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAffair = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAffairs((prev) => prev.filter((a) => a.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const filteredAffairs = affairs.filter(
    (a) =>
      a.sourceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.papers.some((p) =>
        p.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ||
      a.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="h-full flex flex-col bg-transparent overflow-y-auto">
      <div className="p-8 max-w-5xl mx-auto w-full flex-1 pb-16">
        <header className="mb-10">
          <h2 className="text-3xl font-bold text-main mb-2 tracking-tight">
            Current Affairs Linker
          </h2>
          <p className="text-muted text-[15px]">
            Paste news or judgments to instantly extract structured dimensions,
            keywords, and syllabus linkages.
          </p>
        </header>

        <form onSubmit={handleLink} className="mb-8 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a news headline, editorial snippet, or recent SC judgement..."
            className="w-full h-32 rounded-3xl glass-input px-6 py-5 text-[15px] focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 shadow-sm transition-all text-main placeholder-muted resize-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute bottom-4 right-4 bg-accent hover:opacity-90 text-white rounded-xl px-5 py-2.5 flex items-center gap-2 transition-all duration-200 disabled:opacity-50 shadow-sm font-semibold text-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Network className="w-4 h-4" />
            )}
            Link & Extract
          </button>
        </form>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-2xl border border-red-200 dark:border-red-800/40 flex items-start gap-3 mb-6 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {affairs.length > 0 && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Filter by keyword, paper, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent"
            />
          </div>
        )}

        <div className="space-y-4">
          {filteredAffairs.map((affair) => (
            <div
              key={affair.id}
              className="glass-panel rounded-2xl shadow-sm overflow-hidden transition-all duration-200"
            >
              <div
                className="p-5 cursor-pointer hover:bg-input transition-colors flex items-start justify-between gap-4"
                onClick={() =>
                  setExpandedId(expandedId === affair.id ? null : affair.id)
                }
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {affair.papers.map((paper, idx) => (
                      <span
                        key={idx}
                        className="bg-accent/10 text-accent px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      >
                        {paper}
                      </span>
                    ))}
                    <span className="text-[11px] text-muted font-medium ml-2">
                      {new Date(affair.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-main text-base line-clamp-2">
                    {affair.sourceText}
                  </h4>
                </div>
                <div className="flex items-center gap-3 shrink-0 mt-1">
                  <button
                    onClick={(e) => deleteAffair(affair.id, e)}
                    className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-1.5 text-muted">
                    {expandedId === affair.id ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>

              {expandedId === affair.id && (
                <div className="p-6 pt-0 border-t border-panel-border glass-panel">
                  <div className="mt-6 mb-6">
                    <h5 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Core Issue
                    </h5>
                    <p className="text-main text-sm bg-input p-3 rounded-xl border border-panel-border">
                      {affair.coreIssue}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h5 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Syllabus Connections
                    </h5>
                    <ul className="flex flex-wrap gap-2">
                      {affair.topics.map((topic, idx) => (
                        <li
                          key={idx}
                          className="bg-input text-main border border-panel-border px-3 py-1.5 rounded-lg text-[11px] font-medium"
                        >
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h5 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5" /> Key Vocabulary
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {affair.keyTerms.map((term, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5" /> Precedents & Articles
                      </h5>
                      <div className="flex flex-col gap-2">
                        {affair.precedents.map((prec, idx) => (
                          <div
                            key={idx}
                            className="text-[11px] font-medium text-main bg-input px-3 py-2 rounded-lg border border-panel-border flex items-start gap-2"
                          >
                            <Scale className="w-3.5 h-3.5 shrink-0 text-muted mt-0.5" />
                            <span>{prec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> Answer Dimensions
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {affair.dimensions.map((dim, idx) => (
                        <div
                          key={idx}
                          className="bg-input border border-panel-border rounded-xl p-4"
                        >
                          <h6 className="font-semibold text-main text-sm mb-2">
                            {dim.heading}
                          </h6>
                          <ul className="space-y-1.5">
                            {dim.points.map((point, pIdx) => (
                              <li
                                key={pIdx}
                                className="text-muted text-[11px] flex items-start gap-2"
                              >
                                <span className="text-accent mt-0.5">•</span>
                                <span className="leading-relaxed">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredAffairs.length === 0 && affairs.length > 0 && (
            <div className="text-center py-10 text-muted text-sm">
              No current affairs match your search.
            </div>
          )}

          {affairs.length === 0 && !isLoading && (
            <div className="text-center py-20 glass-panel border-2 border-dashed rounded-3xl">
              <div className="w-16 h-16 bg-input rounded-2xl flex items-center justify-center mx-auto mb-4 text-muted">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-main mb-2">
                No linkages yet
              </h3>
              <p className="text-muted">
                Paste a current affair above to instantly generate dimensions
                and keywords.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
