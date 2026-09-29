import { apiFetch } from '../lib/api';
import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  AlertTriangle,
  Loader2,
  History,
  Trash2,
  ChevronRight,
  Copy,
  CheckCircle2,
  Printer,
  LayoutTemplate,
  X,
  Camera
} from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DeepSeekModel } from "../types";
import { exportToPDF } from "../lib/exportPdf";

interface EvaluationData {
  overallScore: number;
  maxScore: number;
  structure: { score: number; max: number; feedback: string };
  contentAccuracy: { score: number; max: number; feedback: string };
  legalCitation: { score: number; max: number; feedback: string };
  clarity: { score: number; max: number; feedback: string };
  strengths: string[];
  improvements: string[];
  conclusion: string;
}

interface SavedEvaluation {
  id: string;
  filename: string;
  extractedText: string;
  evaluation: EvaluationData;
  detectedType?: string;
  date: string;
  isOfflineFallback?: boolean;
}

interface EvaluateViewProps {
  model: DeepSeekModel;
}

export function EvaluateView({ model }: EvaluateViewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState<{
    detectedType?: string;
    extractedText: string;
    evaluation: EvaluationData;
    isOfflineFallback?: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // New Answer Structure feature states
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [structureTopic, setStructureTopic] = useState("");
  const [structureResult, setStructureResult] = useState("");
  const [isStructureLoading, setIsStructureLoading] = useState(false);
  const [structureError, setStructureError] = useState("");

  const handleSuggestStructure = async () => {
    if (!structureTopic.trim()) return;
    setIsStructureLoading(true);
    setStructureError("");
    try {
      const res = await apiFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: `Suggest a concise UPSC Mains framework (e.g. Intro-Body-Conclusion) for: "${structureTopic}". Return Markdown with: 1. Intro, 2. Body Structure, 3. Value Additions, 4. Conclusion.`
            }
          ]
        })
      });
      if (!res.ok) throw new Error("Failed to fetch structure");
      const data = await res.json();
      setStructureResult(data.reply);
    } catch (err: any) {
      setStructureError(err.message);
    } finally {
      setIsStructureLoading(false);
    }
  };

  const [savedEvals, setSavedEvals] = useState<SavedEvaluation[]>(() => {
    const saved = localStorage.getItem("upsc_saved_evals");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved evaluations", e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("upsc_saved_evals", JSON.stringify(savedEvals));
  }, [savedEvals]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "upsc_saved_evals" && e.newValue) {
        try {
          setSavedEvals(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result.evaluation, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setIsLoading(true);
      setError("");
      
      const formData = new FormData();
      formData.append("document", f);
      
      try {
        const res = await apiFetch("/api/ocr", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "OCR failed");
        
        setText(data.text);
        setFile(null); // Clear file since we transcribed it
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !text.trim()) return;

    setIsLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    if (file) {
      formData.append("document", file);
    } else {
      formData.append("text", text);
    }
    formData.append("model", model);

    try {
      const res = await apiFetch("/api/evaluate", {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error("Server returned an invalid response (expected JSON). This may occur if the file is too large or the server is updating.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to evaluate document");

      const generatedTitle = file 
        ? file.name 
        : text.trim().slice(0, 35).replace(/[\r\n]+/g, " ") + (text.trim().length > 35 ? "..." : "") || "Manual Answer Input";

      const newEval: SavedEvaluation = {
        id: Date.now().toString(),
        filename: generatedTitle,
        extractedText: data.extractedText,
        evaluation: data.evaluation,
        detectedType: data.detectedType,
        date: new Date().toISOString(),
        isOfflineFallback: data.isOfflineFallback,
      };

      setResult(data);
      setSavedEvals((prev) => [newEval, ...prev]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEval = (evaluation: SavedEvaluation) => {
    setResult({
      detectedType: evaluation.detectedType,
      extractedText: evaluation.extractedText,
      evaluation: evaluation.evaluation,
      isOfflineFallback: evaluation.isOfflineFallback,
    });
    setFile(null); // Clear selected file when loading historical eval
    setError("");
  };

  const deleteEval = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedEvals((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="h-full flex overflow-hidden bg-transparent">
      <div className="p-8 max-w-5xl mx-auto w-full flex-1 overflow-y-auto pb-16">
        <header className="mb-10 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-panel shadow-sm text-accent">
            <FileCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-main tracking-tight">
              Answer Evaluation
            </h2>
            <p className="text-muted mt-2 text-[15px]">
              Upload handwritten or typed answers for OCR and syllabus-aligned
              feedback.
            </p>
          </div>
          <div className="flex justify-center pt-3">
            <button
               onClick={() => setIsStructureModalOpen(!isStructureModalOpen)}
               className={`glass-panel text-accent hover:bg-accent hover:text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-sm text-sm ${isStructureModalOpen ? "bg-accent text-white" : ""}`}
            >
               <LayoutTemplate className="w-4 h-4" /> {isStructureModalOpen ? "Close Structure Guide" : "Answer Structure Guide"}
            </button>
          </div>
        </header>

        <form
          onSubmit={handleUpload}
          className="glass-panel p-8 rounded-3xl shadow-sm mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent rounded-full blur-3xl -mr-10 -mt-10 opacity-10 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
            {/* File Upload / Dropzone */}
            <div
              className={`border-2 border-dashed h-full flex flex-col justify-center items-center ${file ? "border-accent bg-accent/5" : "border-panel-border bg-input/50"} rounded-2xl p-10 text-center transition-colors hover:bg-input/80 cursor-pointer relative group`}
            >
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div
                className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${file ? "bg-accent/20 text-accent" : "glass-panel text-muted group-hover:text-accent shadow-sm"}`}
              >
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-[14px] font-semibold text-main mb-1">
                {file ? file.name : "Click or drop document here"}
              </p>
              <p className="text-[12px] text-light">
                Direct Evaluation (JPEG, PNG, PDF)
              </p>
            </div>

            {/* OCR / Manual Text Entry */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold text-muted uppercase tracking-wider">
                  Or Paste / Scan Text
                </label>
                <label className="text-[11px] font-bold text-accent tracking-wide uppercase cursor-pointer hover:underline flex items-center gap-1 bg-accent/10 px-3 py-1.5 rounded-lg transition-colors hover:bg-accent/20">
                  <Camera className="w-3.5 h-3.5" />
                  OCR Scan
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleOCR} />
                </label>
              </div>
              <textarea 
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste your answer text here, or use OCR Scan above to transcribe handwritten notes..."
                className="w-full h-full min-h-[160px] rounded-2xl border border-panel-border px-5 py-4 bg-input focus:bg-input focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all font-medium text-[13px] text-main placeholder-light resize-none"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end relative z-10">
            <button
              type="submit"
              disabled={(!file && !text.trim()) || isLoading}
              className="bg-accent hover:opacity-90 text-white rounded-xl px-10 py-3.5 font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </>
              ) : (
                "Evaluate Syllabus Alignment"
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 text-red-600 p-5 rounded-2xl border border-red-100 flex items-start gap-3 mb-8 text-[15px] font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div
              id="evaluation-content"
              className="glass-panel rounded-3xl shadow-sm p-10 relative group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 opacity-60 pointer-events-none" />

              {result.isOfflineFallback && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 text-amber-800 dark:text-amber-400 p-4 rounded-2xl flex items-start gap-2.5 mb-6 text-sm">
                  <AlertTriangle className="w-5.5 h-5.5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block">Offline Rule-Mapping Mode Active</strong>
                    <span>The live Gemini cloud analysis loaded under rate-quota exhaustion. The mentor has run offline syllabus rule-mapping for your submission.</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-panel-border pb-5 mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-main tracking-tight">
                    AI Evaluation Report
                  </h3>
                  <p className="text-muted text-sm mt-1">
                    {result.detectedType
                      ? `Detected Type: ${result.detectedType}`
                      : "Structured Model-based Grading"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-3xl font-bold text-emerald-500">
                      {result.evaluation.overallScore}
                    </span>
                    <span className="text-lg font-medium text-muted">
                      /{result.evaluation.maxScore}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      exportToPDF("evaluation-content", "UPSC_Evaluation")
                    }
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-main p-1.5 rounded-lg border border-transparent shadow-sm"
                    title="Export PDF"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-main p-1.5 rounded-lg border border-transparent shadow-sm"
                    title="Copy evaluation text"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {[
                  {
                    label: "Structure & Flow",
                    data: result.evaluation.structure,
                    color: "text-blue-500",
                  },
                  {
                    label: "Content & Accuracy",
                    data: result.evaluation.contentAccuracy,
                    color: "text-accent",
                  },
                  {
                    label: "Legal Citation / Evidence",
                    data: result.evaluation.legalCitation,
                    color: "text-purple-500",
                  },
                  {
                    label: "Clarity & Presentation",
                    data: result.evaluation.clarity,
                    color: "text-rose-500",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-input rounded-2xl p-5 border border-panel-border flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4
                        className={`text-sm font-bold uppercase tracking-wider ${item.color}`}
                      >
                        {item.label}
                      </h4>
                      <span className="text-sm font-bold glass-panel px-2 py-0.5 rounded text-main">
                        {item.data?.score ?? 0} / {item.data?.max ?? 0}
                      </span>
                    </div>
                    <p className="text-[13px] text-main leading-relaxed flex-1">
                      {item.data?.feedback ?? "N/A"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-500 uppercase tracking-wider mb-4">
                    <CheckCircle2 className="w-4 h-4" /> Key Strengths
                  </h4>
                  <ul className="space-y-3">
                    {result.evaluation.strengths?.map((strength, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-[14px] text-main leading-relaxed"
                      >
                        <span className="text-emerald-500 mt-1">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-red-500 uppercase tracking-wider mb-4">
                    <AlertCircle className="w-4 h-4" /> Areas for Improvement
                  </h4>
                  <ul className="space-y-3">
                    {result.evaluation.improvements?.map((improvement, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-[14px] text-main leading-relaxed"
                      >
                        <span className="text-red-500 mt-1">•</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-accent/5 p-6 rounded-2xl border border-accent/20">
                <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-2">
                  Conclusion
                </h4>
                <p className="text-[14px] text-main leading-relaxed font-medium">
                  {result.evaluation.conclusion}
                </p>
              </div>
            </div>

            <details className="glass-panel rounded-2xl shadow-sm p-5 group transition-all">
              <summary className="font-semibold text-main cursor-pointer list-none flex items-center justify-between text-[15px]">
                <span className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-muted" /> Extracted Text
                  (OCR)
                </span>
                <span className="text-muted group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="mt-5 p-5 bg-input rounded-xl border border-panel-border text-[13px] text-muted whitespace-pre-wrap font-mono leading-relaxed">
                {result.extractedText}
              </div>
            </details>
          </div>
        )}

        {savedEvals.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-bold text-main mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-muted" />
              Past Evaluations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedEvals.map((evalRecord) => (
                <div
                  key={evalRecord.id}
                  onClick={() => loadEval(evalRecord)}
                  className="glass-panel p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer relative group flex flex-col"
                >
                  <button
                    onClick={(e) => deleteEval(e, evalRecord.id)}
                    className="absolute top-3 right-3 text-light hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 mb-3 pr-6">
                    <FileCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                    <h4 className="font-semibold text-main line-clamp-1 flex-1 text-sm">
                      {evalRecord.filename}
                    </h4>
                  </div>
                  <div className="text-[11px] text-muted line-clamp-2 mt-auto">
                    {`Score: ${evalRecord.evaluation?.overallScore ?? "?"}/${evalRecord.evaluation?.maxScore ?? "?"} • ${(evalRecord.evaluation?.conclusion || "").substring(0, 80)}...`}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted mt-4 pt-3 border-t border-panel-border">
                    <span>
                      {new Date(evalRecord.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center text-accent font-medium group-hover:gap-1 transition-all">
                      View <ChevronRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Answer Structure Sidebar */}
      {isStructureModalOpen && (
        <div className="w-[450px] border-l border-panel-border bg-panel flex flex-col shadow-sm h-full shrink-0">
           <div className="flex items-center justify-between p-6 border-b border-panel-border bg-input/40 shrink-0">
             <h3 className="text-lg font-bold text-main flex items-center gap-2">
               <LayoutTemplate className="w-5 h-5 text-accent" /> Answer Structure Guide
             </h3>
             <button onClick={() => setIsStructureModalOpen(false)} className="text-muted hover:text-main transition-colors p-1.5 rounded-lg hover:bg-panel-border">
               <X className="w-5 h-5" />
             </button>
           </div>
           
           <div className="p-6 overflow-y-auto flex-1 h-full">
             <div className="mb-6">
               <label className="text-sm font-bold text-main uppercase tracking-wider mb-3 block">Question Topic</label>
               <div className="flex flex-col gap-3">
                 <textarea
                   value={structureTopic}
                   onChange={(e) => setStructureTopic(e.target.value)}
                   placeholder="e.g., Examine the impact of climate change on food security in India."
                   className="w-full bg-input border border-panel-border rounded-xl px-4 py-3 text-sm text-main placeholder-muted/70 focus:outline-none focus:border-accent min-h-[100px] resize-none"
                   onKeyDown={(e) => {
                     if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSuggestStructure();
                     }
                   }}
                 />
                 <button
                   onClick={handleSuggestStructure}
                   disabled={isStructureLoading || !structureTopic.trim()}
                   className="bg-accent hover:opacity-90 disabled:opacity-50 text-white rounded-xl px-6 py-3 font-bold text-sm transition-all flex items-center justify-center w-full shadow-sm"
                 >
                   {isStructureLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Suggest"}
                 </button>
               </div>
             </div>
             
             {structureError && (
               <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-start gap-3 mb-6 text-sm font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{structureError}</p>
               </div>
             )}

             {structureResult && !isStructureLoading && (
               <div 
                  className="prose prose-sm max-w-none text-main prose-headings:text-main prose-strong:text-main prose-a:text-accent prose-p:text-main prose-li:text-main bg-input p-6 rounded-2xl border border-panel-border font-sans"
                  style={{ "--tw-prose-body": "var(--text-main)", "--tw-prose-headings": "var(--text-main)", "--tw-prose-bold": "var(--text-main)" } as any}
               >
                  <Markdown remarkPlugins={[remarkGfm]}>{structureResult}</Markdown>
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
}
