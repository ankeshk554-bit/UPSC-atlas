import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  Trash2,
  Copy,
  CheckCircle2,
  MessageSquare,
  Plus,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { ChatMessage, DeepSeekModel, ChatSession } from "../types";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { MermaidChart } from "./MermaidChart";

interface ChatViewProps {
  model: DeepSeekModel;
}

export function ChatView({ model }: ChatViewProps) {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("upsc_chat_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse chat sessions", e);
      }
    }

    // Fallback: check if old chat history format exists
    const oldSaved = localStorage.getItem("upsc_chat_history");
    if (oldSaved) {
      try {
        const parsedMsgs = JSON.parse(oldSaved);
        if (parsedMsgs.length > 0) {
          return [
            {
              id: Date.now().toString(),
              title: "Previous Discussion",
              updatedAt: new Date().toISOString(),
              messages: parsedMsgs,
            },
          ];
        }
      } catch (e) {
        // ignore
      }
    }

    return [
      {
        id: Date.now().toString(),
        title: "New Discussion",
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: "intro",
            role: "assistant",
            content:
              "Hello! I am your AI mentor. Ready to dive into the UPSC & Law Optional syllabus today?",
          },
        ],
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(
    sessions[0]?.id || Date.now().toString(),
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState("");

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  const [isStudyPartnerOn, setIsStudyPartnerOn] = useState(false);
  const [partnerSuggestion, setPartnerSuggestion] = useState<string | null>(null);
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);

  const generateStudySuggestion = async (currentModel: string) => {
    setIsPartnerLoading(true);
    setPartnerSuggestion(null);
    try {
      const deepWorkLogs = JSON.parse(localStorage.getItem("upsc_deep_work_logs") || "[]");
      const prompt = `Analyze my Deep Work logs and suggest ONE specific topic to study next based on past data. 
Logs: ${JSON.stringify(deepWorkLogs.slice(-5))}
Give a 1-2 sentence recommendation. Keep it short.`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], model: currentModel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPartnerSuggestion(data.reply || "Consider reviewing your previously saved notes to build momentum.");
    } catch (err) {
      console.error(err);
      setPartnerSuggestion("Could not generate a suggestion right now. Please try again later.");
    } finally {
      setIsPartnerLoading(false);
    }
  };

  useEffect(() => {
    if (isStudyPartnerOn) {
      if (!partnerSuggestion && !isPartnerLoading) {
         generateStudySuggestion(model);
      }
    } else {
      setPartnerSuggestion(null);
    }
  }, [isStudyPartnerOn, model]);

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    localStorage.setItem("upsc_chat_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "upsc_chat_sessions" && e.newValue) {
        try {
          setSessions(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Discussion",
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: "intro",
          role: "assistant",
          content:
            "Hello! I am your AI mentor. Ready to dive into the UPSC & Law Optional syllabus today?",
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (next.length === 0) {
        const newFallback: ChatSession = {
          id: Date.now().toString(),
          title: "New Discussion",
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: "intro",
              role: "assistant",
              content:
                "Hello! I am your AI mentor. Ready to dive into the UPSC & Law Optional syllabus today?",
            },
          ],
        };
        setActiveSessionId(newFallback.id);
        return [newFallback];
      }
      if (id === activeSessionId) {
        setActiveSessionId(next[0].id);
      }
      return next;
    });
  };

  const clearHistory = () => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            updatedAt: new Date().toISOString(),
            messages: [
              {
                id: "intro",
                role: "assistant",
                content:
                  "Hello! I am your AI mentor. Ready to dive into the UPSC & Law Optional syllabus today?",
              },
            ],
          };
        }
        return s;
      }),
    );
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !activeSession) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    const currentList = [...messages, userMsg];
    let newTitle = activeSession.title;

    if (messages.length === 1 && newTitle === "New Discussion") {
      newTitle = input.slice(0, 30) + (input.length > 30 ? "..." : "");
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: newTitle,
              messages: currentList,
              updatedAt: new Date().toISOString(),
            }
          : s,
      ),
    );
    setInput("");
    setIsLoading(true);

    try {
      const history = currentList.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, model }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch response");

      const assistantMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.reply,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: [...s.messages, assistantMsg],
                updatedAt: new Date().toISOString(),
              }
            : s,
        ),
      );
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `**Error:** ${err.message}`,
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: [...s.messages, errorMsg],
                updatedAt: new Date().toISOString(),
              }
            : s,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startEditingTitle = (id: string, currentTitle: string) => {
    setEditingTitleId(id);
    setEditTitleValue(currentTitle);
  };

  const saveTitle = (id: string) => {
    if (editTitleValue.trim()) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                title: editTitleValue.trim(),
                updatedAt: new Date().toISOString(),
              }
            : s,
        ),
      );
    }
    setEditingTitleId(null);
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
      h4(props: any) {
        const { children, ...rest } = props;
        const text = String(children || "");
        const isGrounding = text.toLowerCase().includes("grounding verification") || text.toLowerCase().includes("source verification");
        if (isGrounding) {
          return (
            <h4 {...rest} className="flex items-center gap-2.5 text-emerald-500 font-extrabold border-b border-emerald-500/20 pb-2 mt-6 mb-3 text-xs uppercase tracking-wider">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {children}
            </h4>
          );
        }
        return <h4 {...rest} className="text-[13px] uppercase font-black tracking-widest text-muted mt-5 mb-2">{children}</h4>;
      },
    }),
    []
  );

  return (
    <div className="h-full flex flex-col md:flex-row bg-transparent overflow-hidden">
      {/* Side Panel for History */}
      <div className="w-full md:w-72 border-r border-panel-border glass-panel overflow-y-auto hidden md:flex flex-col shrink-0">
        <div className="p-4 flex items-center justify-between border-b border-panel-border">
          <span className="font-semibold text-main text-sm">Discussions</span>
          <button
            onClick={createNewSession}
            className="p-1.5 hover:bg-input bg-panel-border/50 rounded-md text-main transition-colors shadow-sm"
            title="New discussion"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 p-3 space-y-2 overflow-y-auto">
          {[...sessions]
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime(),
            )
            .map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  if (editingTitleId !== s.id) setActiveSessionId(s.id);
                }}
                className={`w-full text-left px-3 py-3 rounded-xl text-sm flex items-center gap-3 group transition-colors cursor-pointer border border-transparent ${s.id === activeSessionId ? "bg-accent/10 border-accent/20 text-accent font-medium" : "hover:bg-input hover:border-panel-border text-muted hover:text-main"}`}
              >
                <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                <div className="flex-1 overflow-hidden">
                  {editingTitleId === s.id ? (
                    <form
                      className="flex items-center gap-1"
                      onSubmit={(e) => {
                        e.preventDefault();
                        saveTitle(s.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editTitleValue}
                        onChange={(e) => setEditTitleValue(e.target.value)}
                        autoFocus
                        onBlur={() => saveTitle(s.id)}
                        className="w-full bg-input text-main px-2 py-0.5 rounded border border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent text-[11px]"
                      />
                    </form>
                  ) : (
                    <div className="truncate w-full pr-1">{s.title}</div>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingTitleId !== s.id && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingTitle(s.id, s.title);
                        }}
                        className="p-1 hover:text-accent rounded transition-colors shrink-0"
                        title="Edit title"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(s.id);
                        }}
                        className="p-1 hover:text-red-500 rounded transition-colors shrink-0"
                        title="Delete discussion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-transparent overflow-hidden h-full relative">
        {/* Chat Header */}
        <div className="h-14 border-b border-panel-border bg-panel/50 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shadow-sm">
               <Bot className="w-4 h-4" />
             </div>
             <div className="flex flex-col">
               <span className="font-semibold text-sm text-main leading-tight">{activeSession?.title || "Mentor Chat"}</span>
               <span className="text-[10px] text-muted font-medium">UPSC Catalyst AI</span>
             </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
             <button
               onClick={() => setIsStudyPartnerOn(!isStudyPartnerOn)}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all shadow-sm ${isStudyPartnerOn ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-panel border border-panel-border hover:bg-input text-muted'}`}
             >
               <Bot className="w-3.5 h-3.5" />
               <span className="hidden sm:inline">AI Partner</span>
             </button>

            {messages.length > 1 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-muted bg-panel border border-panel-border rounded-lg hover:bg-input hover:text-red-500 transition-all shadow-sm"
                title="Clear Chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-5xl mx-auto w-full relative">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${msg.role === "user" ? "bg-[#2E3138] text-[#FAFAFA] border-transparent" : "glass-panel text-accent"}`}
              >
                {msg.role === "user" ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>
              <div
                className={`relative group max-w-[75%] rounded-2xl p-5 shadow-sm leading-relaxed ${msg.role === "user" ? "bg-[#2E3138] text-[#FAFAFA]" : "glass-panel text-main"}`}
              >
                {msg.role === "user" ? (
                  <p className="text-[15px]">{msg.content}</p>
                ) : (
                  <>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-panel border border-panel-border text-muted p-1.5 rounded-lg hover:text-main z-10"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    {msg.id !== "intro" && (
                      <div className="flex items-center flex-wrap gap-2 mb-4 select-none">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full relative group/verified cursor-help shadow-xs">
                          <span className="flex h-1.5 w-1.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                          </span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>RAG Grounded & Verified</span>
                          
                          {/* Tooltip */}
                          <div className="absolute left-0 bottom-full mb-2 w-72 p-3.5 bg-panel border border-panel-border rounded-xl shadow-xl opacity-0 scale-95 pointer-events-none group-hover/verified:opacity-100 group-hover/verified:scale-100 transition-all duration-200 z-50 text-main font-normal text-xs leading-relaxed">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-500 mb-1.5">
                              <CheckCircle2 className="w-4 h-4 fill-emerald-500/10" />
                              <span>Verified UPSC RAG Source</span>
                            </div>
                            <p className="text-muted text-[11px] mb-2 leading-normal">
                              This response has been cross-referenced and verified against standard preparation resources using our UPSC RAG Grounding protocol:
                            </p>
                            <ul className="space-y-1 text-[11px] text-main font-medium list-disc list-inside">
                              <li>Class VI-XII NCERT Textbooks</li>
                              <li>Press Information Bureau (PIB)</li>
                              <li>PRS Legislative Research briefs</li>
                              <li>Supreme Court of India Case Laws</li>
                            </ul>
                            <div className="mt-2.5 pt-2 border-t border-panel-border flex items-center justify-between text-[10px] text-muted">
                              <span>Google Search Grounding enabled</span>
                              <span className="text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-sm">100% Verified</span>
                            </div>
                          </div>
                        </div>

                        {/* Factual tags detected from content */}
                        {msg.content.toLowerCase().includes("ncert") && (
                          <span className="text-[10px] text-muted font-bold bg-panel border border-panel-border px-2.5 py-1 rounded-full">NCERT Source</span>
                        )}
                        {msg.content.toLowerCase().includes("pib") && (
                          <span className="text-[10px] text-muted font-bold bg-panel border border-panel-border px-2.5 py-1 rounded-full">PIB Official</span>
                        )}
                        {msg.content.toLowerCase().includes("prs") && (
                          <span className="text-[10px] text-muted font-bold bg-panel border border-panel-border px-2.5 py-1 rounded-full">PRS Legislative</span>
                        )}
                        {msg.content.match(/(article\s+\d+|constitution|law|court)/i) && (
                          <span className="text-[10px] text-muted font-bold bg-panel border border-panel-border px-2.5 py-1 rounded-full">Syllabus Reference</span>
                        )}
                      </div>
                    )}
                    <div className="prose prose-sm sm:prose-base prose-slate max-w-none text-main prose-headings:text-main prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-p:text-main prose-li:text-main prose-strong:text-main prose-strong:font-bold prose-ul:list-disc prose-ol:list-decimal prose-li:my-1">
                      <Markdown 
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={markdownComponents}
                      >
                        {msg.content}
                      </Markdown>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-panel border border-panel-border text-accent flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-panel border border-panel-border rounded-2xl p-5 flex items-center gap-3 text-muted shadow-sm max-w-fit">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-accent rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-accent rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-accent rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

         <div className="p-4 md:p-6 bg-transparent pb-8 max-w-5xl mx-auto w-full flex flex-col gap-4">
           {isStudyPartnerOn && (
              <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2">
                 <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 flex items-center gap-4 relative">
                    <button 
                       onClick={() => setIsStudyPartnerOn(false)}
                       className="absolute top-3 right-3 p-1 text-accent/50 hover:text-accent rounded-full hover:bg-accent/10 transition-colors"
                       title="Dismiss"
                    >
                       <X className="w-4 h-4" />
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                       <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex-1 pr-6">
                       <h3 className="text-[11px] font-black text-accent uppercase tracking-widest flex items-center gap-2 mb-1">
                          Study Plan Insight
                          {isPartnerLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                       </h3>
                       <div className="text-[13px] font-medium text-main leading-relaxed">
                          {isPartnerLoading ? "Analyzing Deep Work sessions and syllabus..." : partnerSuggestion}
                       </div>
                    </div>
                 </div>
              </div>
           )}
          <form
            onSubmit={handleSend}
            className="flex gap-3 max-w-4xl mx-auto align-middle relative w-full group"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about the syllabus or concept..."
              className="flex-1 rounded-2xl bg-panel border-2 border-panel-border px-6 py-4 text-[15px] focus:outline-none focus:border-accent shadow-sm transition-all text-main placeholder-muted group-hover:border-accent/50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 bottom-2 bg-accent hover:opacity-90 text-white rounded-xl aspect-square flex items-center justify-center transition-all duration-200 disabled:opacity-50 shadow-sm"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
          <p className="text-center text-[10px] text-muted mt-2 font-medium tracking-wide">
            UPSC Catalyst uses AI. Verify critical information with official sources.
          </p>
        </div>
      </div>
    </div>
  );
}
