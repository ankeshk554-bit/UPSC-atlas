import React, { useState, useEffect } from "react";
import {
  Database,
  Search,
  Plus,
  Filter,
  Copy,
  Check,
  Quote,
  BookA,
  X,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { DeepSeekModel } from "../types";

interface DataBankItem {
  id: string;
  category: "Quote" | "SC Judgement" | "Committee" | "Statistic" | "Case Study";
  topic: string;
  content: string;
  authorOrSource: string;
  paper: string;
}

const mockDataBank: DataBankItem[] = [
  {
    id: "1",
    category: "Quote",
    topic: "Education, Empowerment",
    content:
      '"Education is the most powerful weapon which you can use to change the world."',
    authorOrSource: "Nelson Mandela",
    paper: "Essay",
  },
  {
    id: "2",
    category: "SC Judgement",
    topic: "Privacy, Basic Structure, Personal Liberty",
    content:
      "The right to privacy is protected as an intrinsic part of the right to life and personal liberty under Article 21 and as a part of the freedoms guaranteed by Part III of the Constitution.",
    authorOrSource: "K.S. Puttaswamy v. Union of India (2017)",
    paper: "GS2",
  },
  {
    id: "law-1",
    category: "SC Judgement",
    topic: "Basic Structure Doctrine, Amendability of Constitution",
    content:
      "While Parliament has wide power to amend the Constitution under Article 368, it cannot amend, alter, or destroy its 'Basic Structure' or essential features.",
    authorOrSource: "Kesavananda Bharati v. State of Kerala (1973)",
    paper: "Law Optional",
  },
  {
    id: "law-2",
    category: "SC Judgement",
    topic: "Due Process of Law, Golden Triangle of Articles 14, 19, 21",
    content:
      "Article 21's 'procedure established by law' must be just, fair, and reasonable, incorporating substantial due process. Constitutional rights under Articles 14, 19, and 21 form a 'Golden Triangle' and cannot be read in isolation.",
    authorOrSource: "Maneka Gandhi v. Union of India (1978)",
    paper: "Law Optional",
  },
  {
    id: "law-3",
    category: "SC Judgement",
    topic: "Absolute Liability, Environmental Protection, Tort Law",
    content:
      "Enterprise engaged in hazardous/inherently dangerous activity owes an absolute, non-delegable duty to the community. Absolute liability has no exceptions, unlike Strict Liability under English law (Rylands v. Fletcher).",
    authorOrSource: "M.C. Mehta v. Union of India (1987) Shriram Gas Leak",
    paper: "Law Optional",
  },
  {
    id: "law-4",
    category: "SC Judgement",
    topic: "Custodial Torture, Police Conduct, Arrest Safeguards",
    content:
      "Laid down comprehensive, mandatory guidelines for arrest and detention to counter custodial violence under Article 21 (now largely codified and expanded under BNSS Sections 35 to 49).",
    authorOrSource: "D.K. Basu v. State of West Bengal (1997)",
    paper: "Law Optional",
  },
  {
    id: "law-5",
    category: "Quote",
    topic: "Rule of Law, Constitutionalism",
    content:
      '"The life of the law has not been logic: it has been experience."',
    authorOrSource: "Oliver Wendell Holmes Jr. (The Common Law)",
    paper: "Law Optional",
  },
  {
    id: "3",
    category: "Statistic",
    topic: "Agriculture, Economy",
    content:
      "Agriculture employs ~45% of the workforce but contributes only ~18% to India's GVA.",
    authorOrSource: "Economic Survey 2023-24",
    paper: "GS3",
  },
  {
    id: "law-6",
    category: "SC Judgement",
    topic: "Separation of Powers, Judicial Independence",
    content:
      "Judicial independence is a basic feature of the Constitution. The appointment of judges must remain free from executive primacy to safeguard the Rule of Law.",
    authorOrSource: "Supreme Court Advocates-on-Record Association v. UOI (NJAC Case, 2015)",
    paper: "Law Optional",
  },
];

export function DataBankView({ model }: { model: DeepSeekModel }) {
  const [items, setItems] = useState<DataBankItem[]>(() => {
    const saved = localStorage.getItem("upsc_data_bank");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return mockDataBank;
  });

  useEffect(() => {
    localStorage.setItem("upsc_data_bank", JSON.stringify(items));
    window.dispatchEvent(new Event("upsc_databank_updated"));
  }, [items]);

  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPaper, setFilterPaper] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  // Form State
  const [newTopic, setNewTopic] = useState("");
  const [newCategory, setNewCategory] = useState("All");
  const [newFormItem, setNewFormItem] = useState<Partial<DataBankItem>>({
    category: "Quote",
    topic: "",
    content: "",
    authorOrSource: "",
    paper: "General",
  });
  const [bulkItems, setBulkItems] = useState<Partial<DataBankItem>[]>([]);
  const [genError, setGenError] = useState("");

  const categories = [
    "All",
    "Quote",
    "SC Judgement",
    "Committee",
    "Statistic",
    "Case Study",
  ];
  const papers = [
    "All",
    "GS1",
    "GS2",
    "GS3",
    "GS4",
    "Essay",
    "Law Optional",
    "General",
  ];

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      filterCategory === "All" || item.category === filterCategory;
    const matchesPaper = filterPaper === "All" || item.paper === filterPaper;
    const matchesSearch =
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.authorOrSource.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPaper && matchesSearch;
  });

  const handleCopy = (content: string, source: string, id: string) => {
    navigator.clipboard.writeText(`${content}\n- ${source}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Quote":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "SC Judgement":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "Committee":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Statistic":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Case Study":
        return "bg-accent/10 text-accent border-accent/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const handleSmartGenerate = async () => {
    if (!newTopic.trim()) {
      setGenError("Please enter a topic to generate data for.");
      return;
    }

    setIsGenerating(true);
    setGenError("");
    setBulkItems([]);

    try {
      const res = await fetch("/api/databank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: newTopic, category: newCategory, model }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");

      setNewFormItem({
        category: data.category as any,
        topic: data.topic || newTopic,
        content: data.content,
        authorOrSource: data.authorOrSource,
        paper: data.paper || "General",
      });
    } catch (err: any) {
      setGenError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsBulkGenerating(true);
    setGenError("");
    setBulkItems([]);
    setNewFormItem({
      category: "Quote",
      topic: "",
      content: "",
      authorOrSource: "",
      paper: "General",
    });

    try {
      const res = await fetch("/api/databank-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, model }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to search");

      if (data.items && Array.isArray(data.items)) {
        setBulkItems(data.items);
      }
    } catch (err: any) {
      setGenError(err.message);
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const handleSaveBulkItem = (bulkItem: Partial<DataBankItem>) => {
    const newItem: DataBankItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      category: (bulkItem.category as any) || "Quote",
      topic: bulkItem.topic || "General",
      content: bulkItem.content || "",
      authorOrSource: bulkItem.authorOrSource || "",
      paper: bulkItem.paper || "General",
    };

    setItems((prev) => [newItem, ...prev]);
    setBulkItems((prev) => prev.filter((item) => item !== bulkItem));
    if (bulkItems.length === 1) {
      // If it was the last item
      setIsAddModalOpen(false);
    }
  };

  const handleSaveItem = () => {
    if (
      !newFormItem.content ||
      !newFormItem.topic ||
      !newFormItem.authorOrSource
    ) {
      setGenError("Please fill out all fields before saving.");
      return;
    }

    const newItem: DataBankItem = {
      id: Date.now().toString(),
      category: (newFormItem.category as any) || "Quote",
      topic: newFormItem.topic!,
      content: newFormItem.content!,
      authorOrSource: newFormItem.authorOrSource!,
      paper: newFormItem.paper || "General",
    };

    setItems((prev) => [newItem, ...prev]);
    setIsAddModalOpen(false);
    setNewFormItem({
      category: "Quote",
      topic: "",
      content: "",
      authorOrSource: "",
      paper: "General",
    });
    setNewTopic("");
  };

  return (
    <div className="h-full flex flex-col bg-transparent overflow-y-auto">
      <div className="p-8 max-w-6xl mx-auto w-full flex-1 pb-16">
        <header className="mb-10 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-panel shadow-sm text-accent">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-main mb-2">
              Mains Data & Quote Bank
            </h2>
            <p className="text-muted text-[15px]">
              Ready-to-use arsenal of statistics, quotes, and judgements
              categorised by syllabus.
            </p>
          </div>
        </header>

        <div className="glass-panel p-6 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Search keywords, topics, or sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input rounded-xl pl-11 pr-4 py-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <select
              value={filterPaper}
              onChange={(e) => setFilterPaper(e.target.value)}
              className="rounded-xl border border-panel-border px-4 py-3 bg-input focus:outline-none focus:border-accent text-sm text-main"
            >
              {papers.map((p) => (
                <option key={p} value={p}>
                  Paper: {p}
                </option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-xl border border-panel-border px-4 py-3 bg-input focus:outline-none focus:border-accent text-sm text-main"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center h-full gap-2 bg-accent text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:bg-accent/90 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Add New
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-panel rounded-2xl shadow-sm p-6 flex flex-col relative group hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${getCategoryColor(item.category)}`}
                  >
                    {item.category}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-slate-500/20 bg-slate-500/10 text-slate-500">
                    {item.paper}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 bg-input border border-panel-border text-muted hover:text-red-500 rounded-lg transition-all"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      handleCopy(item.content, item.authorOrSource, item.id)
                    }
                    className="p-2 bg-input border border-panel-border text-muted hover:text-accent rounded-lg transition-colors"
                    title="Copy for Answer Writing"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <div className="text-xl font-serif text-main mb-4 leading-snug flex gap-2">
                  {item.category === "Quote" && (
                    <Quote className="w-5 h-5 text-accent opacity-50 shrink-0 mt-1" />
                  )}
                  {item.content}
                </div>

                <div className="mt-auto pt-4 border-t border-panel-border/50 flex flex-col gap-1">
                  <p className="text-sm font-semibold text-accent">
                    {item.authorOrSource}
                  </p>
                  <p className="text-[11px] text-muted font-medium">
                    Topic: {item.topic}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-20 glass-panel border-2 border-dashed rounded-3xl">
              <div className="w-16 h-16 bg-input rounded-2xl flex items-center justify-center mx-auto mb-4 text-muted">
                <BookA className="w-8 h-8" />
              </div>
              <p className="text-lg font-bold text-main mb-2">No Data Found</p>
              <p className="text-muted text-sm max-w-md mx-auto mb-6">
                No items match your search or filter. You can try a different
                query or let AI find relevant data for you.
              </p>

              {searchQuery && (
                <button
                  onClick={async () => {
                    setIsAddModalOpen(true);
                    setNewTopic(searchQuery);
                    handleBulkSearch(searchQuery);
                  }}
                  className="bg-accent text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:bg-accent/90 transition-all inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Ask AI to Search "
                  {searchQuery}"
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl glass-panel rounded-3xl shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-muted hover:text-main bg-input hover:bg-panel-border rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold text-main mb-6">
              Add to Data Bank
            </h3>

            {/* Smart Generate Section */}
            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 mb-8">
              <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI Smart Generate & Categorize
              </h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="E.g., Women Empowerment, Cyber Security, etc."
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="flex-1 glass-input rounded-xl px-4 py-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent"
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="glass-input rounded-xl px-4 py-3 text-sm text-main focus:outline-none focus:border-accent w-full sm:w-auto"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === "All" ? "Any Type" : c}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleSmartGenerate}
                    disabled={isGenerating || isBulkGenerating || !newTopic}
                    className="flex-1 bg-panel border border-accent text-accent px-4 py-3 rounded-xl text-sm font-bold hover:bg-accent/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Get One"
                    )}
                  </button>
                  <button
                    onClick={() => handleBulkSearch(newTopic)}
                    disabled={isGenerating || isBulkGenerating || !newTopic}
                    className="flex-1 bg-accent text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {isBulkGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Get Multiple"
                    )}
                  </button>
                </div>
              </div>
              {genError && (
                <p className="text-red-500 text-sm mt-3">{genError}</p>
              )}
            </div>

            {/* Render Bulk Generated Items if exist */}
            {bulkItems.length > 0 && (
              <div className="mb-8 space-y-4">
                <h4 className="text-sm font-bold text-main uppercase tracking-wider mb-2">
                  AI Suggestions
                </h4>
                {bulkItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-input border border-panel-border rounded-2xl p-5 flex flex-col gap-3 relative group"
                  >
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getCategoryColor(item.category || "")}`}
                        >
                          {item.category}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-slate-500/20 bg-slate-500/10 text-slate-500">
                          {item.paper}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSaveBulkItem(item)}
                        className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-accent hover:text-white transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Save
                      </button>
                    </div>
                    <div className="text-[15px] font-serif text-main leading-snug">
                      {item.content}
                    </div>
                    <div className="mt-1 flex flex-col gap-0.5 pt-2 border-t border-panel-border/30">
                      <p className="text-sm font-semibold text-accent">
                        {item.authorOrSource}
                      </p>
                      <p className="text-[11px] text-muted font-medium">
                        Topic: {item.topic}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Manual Edit / Review Form */}
            {bulkItems.length === 0 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <select
                      value={newFormItem.category}
                      onChange={(e) =>
                        setNewFormItem({
                          ...newFormItem,
                          category: e.target.value as any,
                        })
                      }
                      className="w-full glass-input rounded-xl px-4 py-3 text-sm text-main focus:outline-none focus:border-accent"
                    >
                      {categories
                        .filter((c) => c !== "All")
                        .map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                      Syllabus Paper
                    </label>
                    <select
                      value={newFormItem.paper}
                      onChange={(e) =>
                        setNewFormItem({
                          ...newFormItem,
                          paper: e.target.value,
                        })
                      }
                      className="w-full glass-input rounded-xl px-4 py-3 text-sm text-main focus:outline-none focus:border-accent"
                    >
                      {papers
                        .filter((p) => p !== "All")
                        .map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                    Topic / Keyword
                  </label>
                  <input
                    type="text"
                    value={newFormItem.topic}
                    onChange={(e) =>
                      setNewFormItem({ ...newFormItem, topic: e.target.value })
                    }
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent"
                    placeholder="E.g., Higher Education"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                    Content (Quote, Stat, Judgement)
                  </label>
                  <textarea
                    value={newFormItem.content}
                    onChange={(e) =>
                      setNewFormItem({
                        ...newFormItem,
                        content: e.target.value,
                      })
                    }
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent min-h-[100px] resize-none"
                    placeholder="The exact quote, fact, or judgement text..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                    Source / Author
                  </label>
                  <input
                    type="text"
                    value={newFormItem.authorOrSource}
                    onChange={(e) =>
                      setNewFormItem({
                        ...newFormItem,
                        authorOrSource: e.target.value,
                      })
                    }
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent"
                    placeholder="E.g., NITI Aayog Report 2024"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 text-sm font-semibold text-muted hover:text-main transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveItem}
                    disabled={!newFormItem.content}
                    className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-bold shadow-md hover:bg-accent/90 transition-colors disabled:opacity-50"
                  >
                    Save to Data Bank
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
