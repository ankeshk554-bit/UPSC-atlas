export type ViewType =
  | "overview"
  | "chat"
  | "notes"
  | "evaluate"
  | "performance"
  | "blueprint"
  | "pyq"
  | "syllabus"
  | "affairs"
  | "mistake-book"
  | "data-bank"
  | "planner"
  | "rss-reader"
  | "digest";

export type DeepSeekModel = "deepseek-chat" | "deepseek-reasoner";

export interface ChatSession {
  id: string;
  title: string;
  subject?: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface PerformanceRecord {
  date: string;
  score: number;
  subject: string;
  totalMarks: number;
}
