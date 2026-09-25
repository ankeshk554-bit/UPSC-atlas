import React, { useState, useEffect } from "react";
import { AlertTriangle, Plus, Filter, BookX, Trash2 } from "lucide-react";
import { safeLocalStorageGet, safeLocalStorageSet } from "../lib/storage";

interface Mistake {
  id: string;
  date: string;
  subject: string;
  topic: string;
  mistakeType: "Conceptual" | "Factual" | "Silly" | "Skipped";
  description: string;
  lessonLearned: string;
}

const mockMistakes: Mistake[] = [
  {
    id: "1",
    date: "2023-11-15",
    subject: "Polity",
    topic: "Pardon Power of President",
    mistakeType: "Conceptual",
    description:
      "Marked that President can pardon court martial but Governor cannot, but also got confused about death sentence commuting.",
    lessonLearned:
      "President can pardon, commute, remit death sentence and court martial. Governor cannot pardon death sentence or court martial, but CAN remit/commute death sentence.",
  },
  {
    id: "2",
    date: "2023-11-18",
    subject: "Geography",
    topic: "Ocean Currents",
    mistakeType: "Silly",
    description: "Marked Agulhas current as Atlantic Ocean current.",
    lessonLearned:
      "Agulhas is Indian Ocean (warm). Remember A-I (Agulhas-Indian).",
  },
];

export function MistakeBookView() {
  const [mistakes, setMistakes] = useState<Mistake[]>(() => 
    safeLocalStorageGet<Mistake[]>("upsc_mistake_book", mockMistakes)
  );

  useEffect(() => {
    safeLocalStorageSet("upsc_mistake_book", mistakes);
    window.dispatchEvent(new Event("upsc_mistakes_updated"));
  }, [mistakes]);

  const [filterSubject, setFilterSubject] = useState("All");
  const [filterType, setFilterType] = useState("All");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMistake, setNewMistake] = useState<Partial<Mistake>>({
    subject: "Polity",
    topic: "",
    mistakeType: "Conceptual",
    description: "",
    lessonLearned: "",
  });

  const subjects = [
    "All",
    "Polity",
    "History",
    "Geography",
    "Economy",
    "Environment",
    "Science",
    "Current Affairs",
    "CSAT",
  ];
  const mistakeTypes = ["All", "Conceptual", "Factual", "Silly", "Skipped"];

  const filteredMistakes = mistakes.filter(
    (m) =>
      (filterSubject === "All" || m.subject === filterSubject) &&
      (filterType === "All" || m.mistakeType === filterType),
  );

  const handleDelete = (id: string) => {
    setMistakes(mistakes.filter((m) => m.id !== id));
  };

  const handleSaveMistake = () => {
    if (
      !newMistake.topic ||
      !newMistake.description ||
      !newMistake.lessonLearned
    )
      return;

    const mistake: Mistake = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      subject: newMistake.subject as string,
      topic: newMistake.topic,
      mistakeType: newMistake.mistakeType as any,
      description: newMistake.description,
      lessonLearned: newMistake.lessonLearned,
    };

    setMistakes([mistake, ...mistakes]);
    setIsAddModalOpen(false);
    setNewMistake({
      subject: "Polity",
      topic: "",
      mistakeType: "Conceptual",
      description: "",
      lessonLearned: "",
    });
  };

  const getMistakeTypeColor = (type: string) => {
    switch (type) {
      case "Conceptual":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "Factual":
        return "bg-accent/10 text-accent border-accent/20";
      case "Silly":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Skipped":
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent overflow-y-auto">
      <div className="p-8 max-w-5xl mx-auto w-full flex-1 pb-16">
        <header className="mb-10 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-panel shadow-sm text-accent">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-main mb-2">
              Test Mistake Log
            </h2>
            <p className="text-muted text-[15px]">
              Track mock test errors to prevent repeating them in the final
              exam.
            </p>
          </div>
        </header>

        <div className="glass-panel p-6 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted" />
              <span className="text-sm font-medium text-muted uppercase tracking-wider">
                Filters
              </span>
            </div>

            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="rounded-xl border border-panel-border px-4 py-2 bg-input focus:outline-none focus:border-accent text-sm text-main"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border border-panel-border px-4 py-2 bg-input focus:outline-none focus:border-accent text-sm text-main"
            >
              {mistakeTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:bg-accent/90 transition-all ml-auto md:ml-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Mistake
          </button>
        </div>

        <div className="space-y-4">
          {filteredMistakes.map((mistake) => (
            <div
              key={mistake.id}
              className="glass-panel rounded-2xl shadow-sm overflow-hidden p-6 flex flex-col gap-4 relative group"
            >
              <button
                onClick={() => handleDelete(mistake.id)}
                className="absolute top-4 right-4 p-2 text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-input rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-input text-main border border-panel-border">
                  {mistake.subject}
                </span>
                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-full border ${getMistakeTypeColor(mistake.mistakeType)}`}
                >
                  {mistake.mistakeType} Error
                </span>
                <span className="text-[11px] text-muted font-medium ml-auto">
                  {new Date(mistake.date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-main text-lg mb-2">
                  {mistake.topic}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
                    <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider mb-2">
                      The Mistake
                    </p>
                    <p className="text-sm text-main leading-relaxed">
                      {mistake.description}
                    </p>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                    <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-2">
                      Lesson / Correction
                    </p>
                    <p className="text-sm text-main leading-relaxed">
                      {mistake.lessonLearned}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredMistakes.length === 0 && (
            <div className="text-center py-20 glass-panel border-2 border-dashed rounded-3xl">
              <div className="w-16 h-16 bg-input rounded-2xl flex items-center justify-center mx-auto mb-4 text-muted">
                <BookX className="w-8 h-8" />
              </div>
              <p className="text-lg font-bold text-main mb-2">
                No Mistakes Found
              </p>
              <p className="text-muted text-sm max-w-md mx-auto">
                No errors logged for these filters. Keep practicing!
              </p>
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
            <h3 className="text-2xl font-bold text-main mb-6">
              Log New Mistake
            </h3>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                    Subject
                  </label>
                  <select
                    value={newMistake.subject}
                    onChange={(e) =>
                      setNewMistake({ ...newMistake, subject: e.target.value })
                    }
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm text-main focus:outline-none focus:border-accent"
                  >
                    {subjects
                      .filter((s) => s !== "All")
                      .map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                    Mistake Type
                  </label>
                  <select
                    value={newMistake.mistakeType}
                    onChange={(e) =>
                      setNewMistake({
                        ...newMistake,
                        mistakeType: e.target.value as any,
                      })
                    }
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm text-main focus:outline-none focus:border-accent"
                  >
                    {mistakeTypes
                      .filter((s) => s !== "All")
                      .map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                  Topic / Area
                </label>
                <input
                  type="text"
                  value={newMistake.topic}
                  onChange={(e) =>
                    setNewMistake({ ...newMistake, topic: e.target.value })
                  }
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-main placeholder-muted focus:outline-none focus:border-accent"
                  placeholder="E.g., Fundamental Rights"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-rose-500 uppercase tracking-wider mb-2">
                  The Mistake
                </label>
                <textarea
                  value={newMistake.description}
                  onChange={(e) =>
                    setNewMistake({
                      ...newMistake,
                      description: e.target.value,
                    })
                  }
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-main placeholder-muted focus:outline-none focus:border-rose-500 min-h-[80px] resize-none"
                  placeholder="What went wrong? E.g., Marked option B instead of C because I missed 'not' in the statement."
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-emerald-500 uppercase tracking-wider mb-2">
                  Lesson / Correction
                </label>
                <textarea
                  value={newMistake.lessonLearned}
                  onChange={(e) =>
                    setNewMistake({
                      ...newMistake,
                      lessonLearned: e.target.value,
                    })
                  }
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-main placeholder-muted focus:outline-none focus:border-emerald-500 min-h-[80px] resize-none"
                  placeholder="How to avoid it next time? E.g., Always circle keywords like NOT, ONLY, ALL."
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
                  onClick={handleSaveMistake}
                  disabled={
                    !newMistake.topic ||
                    !newMistake.description ||
                    !newMistake.lessonLearned
                  }
                  className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-bold shadow-md hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  Log Mistake
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
