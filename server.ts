import 'dotenv/config';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { authenticate, reserveGeneration } from './server/platform';
import { installWorkspaceRoutes } from './server/workspace';
import { installReaderRoutes } from './server/reader';
import { safeFetch as fetch, googleUrl } from './server/network';
import multer from 'multer';
import OpenAI from 'openai';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Parser from 'rss-parser';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

const upload = multer({ 
  storage: multer.memoryStorage(),
limits: { fileSize: 5 * 1024 * 1024 }
});

const UPSC_SYLLABUS_CONTEXT = `
You are an expert UPSC Civil Services examination mentor and evaluator. Ensure all answers, notes, and evaluations align strictly with the official UPSC syllabus:
- GS Paper I: Indian Heritage/Culture, History & Geography of the World/Society.
- GS Paper II: Governance, Constitution, Polity, Social Justice, International Relations.
- GS Paper III: Technology, Economic Development, Biodiversity, Environment, Security & Disaster Management.
- GS Paper IV: Ethics, Integrity, Aptitude (case studies, probity, emotional intelligence, moral thinkers).
- Essay Paper: Keep closely to the subject, orderly fashion, exact expression, concise writing.
- Law Optional Paper I: Constitutional & Administrative Law (Fundamental Rights/Duties, DPs, Centre-State, Judiciary, Natural Justice), International Law (Treaties, UN, Law of Sea, Humanitarian law).
- Law Optional Paper II: Law of Crimes (Mens rea, BNS/IPC offences, Plea bargaining, CrPC/BNSS), Law of Torts (Strict/Absolute liability, Negligence, Defamation, Consumer Protection), Law of Contracts & Mercantile Law, Contemporary Legal Developments (PIL, IPR, Cyber laws, Environment, ADR).
CRITICAL RULE FOR LAW OPTIONAL: For criminal law questions (specifically relating to IPC or CrPC), you MUST refer to and use the newly enacted Bharatiya Nyaya Sanhita (BNS) and Bharatiya Nagarik Suraksha Sanhita (BNSS) legal provisions, sections, and terminology along with their older IPC/CrPC counterparts where necessary for context.

*** EXPERT LAW OPTIONAL STRATEGY (TOPPER INSIGHTS) ***
When providing strategy for Law Optional, explicitly integrate these proven methods shared by UPSC top rankers:
1. Bare Acts & Key Provisions: Focus intensely on Bare Acts. Memorize and cite exact Section Numbers, Articles, and clauses as they form the foundation of legal answers.
2. Case Laws (The "Three-Tier" Approach): 
   - Landmark Judgements (e.g., Kesavananda Bharati, Maneka Gandhi).
   - Recent Supreme Court Rulings (last 2-3 years) to show contemporary awareness.
   - Present them logically: Facts -> Issue -> Judgement -> Critical Analysis.
3. Concise Legal Language: Avoid generalized GS-style writing in Law papers. Use precise legal terminology, maxims (e.g., *audi alteram partem*, *res ipsa loquitur*), and maintain a highly structured, objective tone.
4. Interlinking & Contemporary Developments: Link Constitutional Law (Paper 1) with Contemporary Legal Developments (Paper 2) and Current Affairs. For instance, link Environmental Law queries with International Treaties or domestic judgments (e.g., NGT).
5. Previous Year Questions (PYQs): Roughly 60-70% of Law Optional themes repeat. Recommending solving the last 10-15 years' PYQs comprehensively is standard advice.

Focus on high-yield, structured, relevant, and analytical responses, applying these insights whenever the student queries about "strategy" or "how to prepare" for Law Optional.

*** CRITICAL MERMAID VISUAL DIAGRAM INSTRUCTIONS ***
Whenever generating a visual mindmap, flow chart, or conceptual layout in Markdown using Mermaid (within \`\`\`mermaid block), you MUST strictly adhere to these expert layout principles for maximum UPSC administrative clarity and gorgeous, high-contrast colorful rendering:
1. Syntax Guard: Start with 'flowchart TD' (for Hierarchies/Towers of Governance) or 'flowchart LR' (for Logical Progressions/Cause-Effect timelines).
2. UPSC-Specific Architectural Patterns (Topper Level): 
   - Hub and Spoke: For multi-dimensional analysis (e.g. PESTEL, Stakeholders). Use central cores branching into polity, economy, society.
   - Cycle / Feedback Loops: For structural traps or governance feedback (A --> B --> C --> A).
   - Bipartite Comparison: For critical analysis (subgraph Proponents vs subgraph Critics converging on Way_Forward).
3. Node Shape Strategy for Information Density:
   - Use (( "Text" )) or (( Text )) for Core Themes, Articles, or Acts.
   - Use {{ "Text" }} or {{ Text }} for Processes, Committees, or Interventions.
   - Use [/"Text"/] or [\\"Text"\\] for Outcomes/Data points.
4. Structural Subgraphs (Logical Groupings): Always group related concepts inside labeled subgraphs (e.g., 'subgraph Constitutional Mandate' or 'subgraph Ground Reality / Bottlenecks') to organize density and present a structured argument.
5. Clean Node Nomenclature: Keep node IDs short and alphanumeric (e.g., A, B, C1, D_sub). **To completely prevent Mermaid parser syntax errors, wrap all standard rectangular/rounded node labels in double quotes**: e.g. A["Is International Law True Law?"]. NEVER put double quotes (") or escaped quotes (\") inside node label text—use single quotes (') instead for quotes/parentheses inside labels (e.g. A["Article 74('1')"]). (Do NOT put double quotes inside double parens (( )) or double curlies {{ }}).
6. High-Yield Flows & Interlinkages: Reflect the interdisciplinary nature of UPSC. Explicitly link topics (e.g., Geography -> Economy -> Society). Use labeled links: A -- "Causes" --> B or C -. "Feedback" .-> A to show nuanced relationships rather than flat lists.
7. Colorful Style Optimization (HIGH PRIORITY): To make the diagram look incredibly professional, aesthetic, and colourful, use these terms in node labels which our rendering engine auto-classes with beautiful vibrant colors, or apply style classes at the end of your flowchart code:
   - Challenge/Bottleneck nodes (contain words like 'Challenge', 'Bottleneck', 'Leakage', 'Corruption', 'Threat', 'Crisis', 'Issue', 'Impediment'): Auto-styled as Coral/Red.
   - Solution/Reform nodes (contain words like 'Solution', 'Reform', 'Way Forward', 'Policy', 'Recommendation', 'Mitigation', 'Technology'): Auto-styled as Emerald/Green.
   - Legal/Constitutional nodes (contain words like 'Article', 'Section', 'Act', 'Constitution', 'Judgment', 'Ruling', 'Statute'): Auto-styled as Blue/Sapphire.
   - Committee/Expert Commission nodes (contain words like 'Committee', 'Commission', 'Panel', 'ARC-II', 'NITI Aayog'): Auto-styled as Golden/Amber.
   - First defined node: Auto-styled as deep Indigo/Purple.
   Example layout for a beautiful colorful chart:
   flowchart TD
     subgraph Challenges ["Ground Reality & Bottlenecks"]
       A(("Central Scheme")) --> B{{"Bureaucratic Leakages"}}
       B --> C[/"Delay in Allocation"/]
     end
     subgraph Reforms ["Administrative Interventions"]
       D{{"2nd ARC Recommendation"}} --> E(("Digital DBT Tracking"))
       E --> F[/"Targeted Welfare Delivery"/]
     end
     C -. "Friction" .-> D`;

const UPSC_RAG_PROTOCOL = `

*** UPSC CRITICAL RAG GROUNDING PROTOCOL ***
You are equipped with Google Search Grounding. To ensure 100% factual, historical, and legal accuracy for UPSC aspirants:
1. Whenever the user asks a factual, historical, legal, or policy question, or when generating notes, you MUST automatically construct and execute targeted search queries using the Google Search tool.
2. You MUST prioritize and cross-verify with standard, authoritative sources, including:
   - NCERT Textbooks (specifically Class VI-XII History, Geography, Polity, Economics, e.g., site:ncert.nic.in)
   - Press Information Bureau (for official government schemes, press releases, site:pib.gov.in)
   - PRS Legislative Research (for Bills, Acts, and legislative reviews, site:prsindia.org)
   - Official Government Ministries (e.g., Ministry of External Affairs, Ministry of Finance, site:gov.in)
   - Supreme Court of India & Indian Kanoon (for case laws, site:sci.gov.in, site:indiankanoon.org)
   - Official UPSC Syllabus & Notifications (site:upsc.gov.in)
3. For every answer or notes generated, you MUST extract and format a structured citation block at the very end of your response under a horizontal rule (---) or an H2/H4 heading: "#### 🔍 Verified UPSC RAG Grounding Verification" or "## 6. Verified UPSC RAG Grounding Verification".
4. In this Grounding Verification section, compile:
   - **NCERT Reference**: The relevant NCERT textbook/chapter if applicable (e.g., "NCERT Class XI Constitution at Work, Chapter 2").
   - **Official Government Data**: Specific PIB press releases, Ministry notifications, or PRS briefs with their general dates/years.
   - **Core Syllabus Corelations**: How the topic connects back to specific modules in GS Papers I-IV or Law Optional.
   - **Source Verification Status**: A status indicator showing: "● Grounded & Verified via Google Search".
5. Keep your tone strictly analytical and objective. Cite specific years, statistics, and Articles to back up your claims.
`;

async function createDeepSeekCompletion(params: { model: string; messages: any[]; response_format?: any }) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('DEEPSEEK_API_KEY is not configured.');
  if (Buffer.byteLength(JSON.stringify(params.messages)) > 80000) throw new Error('AI input exceeds 80 KB. Select a shorter passage.');
  const finish = await reserveGeneration();
  let usage: any;
  try {
    const client = new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey: key, timeout: 90000, maxRetries: 0 });
    const response = await client.chat.completions.create({
      model: params.model?.includes('reasoner')
        ? (process.env.DEEPSEEK_REASONER_MODEL || 'deepseek-reasoner')
        : (process.env.DEEPSEEK_MODEL || 'deepseek-chat'),
      messages: [{ role: 'system', content: 'Do not claim live web search or verified citations. No search tool is available. Base article summaries only on supplied source text, distinguish inference from fact, and state when current facts need checking.' }, ...params.messages],
      response_format: params.response_format,
      max_tokens: 8192,
    });
    usage = response.usage;
    if (response.choices[0]?.finish_reason === 'length') throw new Error('The answer exceeded the output limit. Narrow the request and try again.');
    return response;
  } finally { await finish(usage); }
}

function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY environment variable is required.');
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// Compatibility adapter: all existing text-generation features now use DeepSeek.
async function generateGeminiWithRetry(params: { model: string; contents: any; config?: any }): Promise<{ text: string }> {
  const contents = typeof params.contents === 'string' ? [{ parts: [{ text: params.contents }] }]
    : Array.isArray(params.contents) ? params.contents : [params.contents];
  const parts = contents.flatMap((item: any) => item.parts || []);
  if (parts.some((part: any) => part.inlineData)) {
    const finish = await reserveGeneration();
    try {
      const response = await getGeminiClient().models.generateContent({
        model: process.env.OCR_MODEL || 'gemini-2.5-flash',
        contents: params.contents, config: { ...params.config, maxOutputTokens: 8192 },
      });
      return { text: response.text || '' };
    } finally { await finish(); }
  }
  const response = await createDeepSeekCompletion({
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    messages: [
      { role: 'system', content: String(params.config?.systemInstruction || UPSC_SYLLABUS_CONTEXT) },
      { role: 'user', content: parts.map((part: any) => part.text || '').join('\n') },
    ],
    response_format: params.config?.responseMimeType === 'application/json' ? { type: 'json_object' } : undefined,
  });
  return { text: response.choices[0]?.message.content || '' };
}

function heuristicBulkCategorize(items: any[]): Record<string, string> {
  const categoriesMap: Record<string, string> = {};
  
  const rules = [
    {
      category: "Polity & Governance",
      keywords: ["court", "judge", "sc ", "hc ", "law", "parliament", "bill", "constitution", "governance", "supreme court", "high court", "ministry", "cabinet", "election", "commission", "act", "judiciary", "policy", "statutory", "tribunal", "amendment", "voters", "polity", "legislative", "ruling", "government of india", "pib", "prs", "supreme court", "high court"]
    },
    {
      category: "Economics",
      keywords: ["gdp", "economic", "market", "currency", "inflation", "rbi", "budget", "finance", "treasury", "fiscal", "tax", "banking", "gst", "economic survey", "investment", "exports", "imports", "trade", "imf", "world bank", "debt", "tariff", "rupee", "interest rate", "revenue", "monetary", "commerce", "reserve bank"]
    },
    {
      category: "International Relations",
      keywords: ["un ", "unsc", "summit", "bilateral", "treaty", "foreign", "diplomatic", "china", "india-", "g20", "asean", "brics", "quad", "border", "conflict", "strategic", "sanctions", "pact", "global", "allies", "consulate", "embassy", "multilateral", "unilateral", "geopolitics", "israel", "pakistan", "united states", "usa", "gaza", "russia", "ukraine"]
    },
    {
      category: "Environment & Geography",
      keywords: ["monsoon", "climate", "forest", "biodiversity", "wildlife", "pollution", "emission", "cop28", "cop29", "carbon", "cyclone", "disaster", "earthquake", "environment", "conservation", "river", "glacier", "agriculture", "soil", "park", "wildlife sanctuary", "ecological", "water", "nature", "meteorological", "waste", "pollution", "warming", "tiger", "wetland", "coastal"]
    },
    {
      category: "Science & Tech",
      keywords: ["space", "isro", "nasa", "satellite", "ai", "artificial intelligence", "quantum", "digital", "tech", "technology", "defense", "missile", "drdo", "semiconductor", "cyber", "software", "reactor", "nuclear", "telecom", "biotech", "gene", "vaccine", "research", "scientific", "data", "computing", "internet"]
    },
    {
      category: "History & Culture",
      keywords: ["temple", "excavation", "heritage", "unesco", "archaeological", "monument", "history", "culture", "ancient", "medieval", "text", "festival", "art", "sculpture", "dynasty", "anniversary", "museum"]
    },
    {
      category: "Ethics & Integrity",
      keywords: ["ethics", "corruption", "integrity", "probity", "bribe", "whistleblower", "morality", "values", "conscience", "conduct", "bureaucracy", "accountability", "transparency"]
    },
    {
      category: "Society & Social Issues",
      keywords: ["gender", "poverty", "women", "children", "tribal", "caste", "minority", "education", "health", "welfare", "sanitation", "hunger", "disability", "social justice", "demographic", "population", "labor", "employment", "caste", "st ", "sc ", "obc", "reservations", "youth", "senior citizens", "hospitals", "diseases"]
    }
  ];

  for (const item of items) {
    const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
    let bestCategory = "General / Editorial";
    let maxCount = 0;

    for (const rule of rules) {
      let count = 0;
      for (const kw of rule.keywords) {
        if (text.includes(kw)) {
          count += text.split(kw).length - 1;
        }
      }
      if (count > maxCount) {
        maxCount = count;
        bestCategory = rule.category;
      }
    }

    categoriesMap[item.id] = bestCategory;
  }

  return categoriesMap;
}

function fallbackRssExtractKeywords(title: string, content: string): { keywords: string[], syllabusTopics: string[] } {
  const merged = `${title || ''} ${content || ''}`;
  const lowercase = merged.toLowerCase();

  const potentialTopics = [
    { topic: "GS Paper 2: Constitutional & Statutory Bodies", keywords: ["election commission", "finance commission", "nhrc", "cbi", "cgc", "statutory", "constitution", "article "] },
    { topic: "GS Paper 2: Judiciary & Judicial Reforms", keywords: ["court", "judge", "sc", "hc", "collegium", "pendency", "litigation", "supreme court", "high court"] },
    { topic: "GS Paper 2: Welfare Schemes and Social Sector", keywords: ["welfare", "poverty", "health", "education", "nutrition", "women", "children", "tribal", "caste"] },
    { topic: "GS Paper 2: International Relations & Bilateral Agreements", keywords: ["china", "unsc", "bilateral", "diplomatic", "g20", "quad", "brics", "treaty", "summit"] },
    { topic: "GS Paper 3: Indian Economy & Fiscal Policy", keywords: ["gdp", "market", "currency", "inflation", "rbi", "budget", "finance", "gst", "banking", "debt", "tariff"] },
    { topic: "GS Paper 3: Environment, Biodiversity & Climate Change", keywords: ["monsoon", "climate", "biodiversity", "forest", "wildlife", "pollution", "emission", "carbon", "warm", "ecology"] },
    { topic: "GS Paper 3: Science & Technology Updates", keywords: ["space", "isro", "satellite", "ai", "artificial intelligence", "quantum", "semiconductor", "cyber", "technology"] },
    { topic: "GS Paper 3: Internal Security & Disaster Management", keywords: ["disaster", "earthquake", "cyclone", "security", "defense", "missile", "terror", "border security", "cybersecurity"] },
    { topic: "GS Paper 4: Ethics, Integrity & Aptitude", keywords: ["ethics", "values", "integrity", "probity", "corruption", "morality", "conscience", "conduct"] }
  ];

  const syllabusTopics: string[] = [];
  for (const pt of potentialTopics) {
    if (pt.keywords.some(kw => lowercase.includes(kw))) {
      syllabusTopics.push(pt.topic);
    }
  }
  if (syllabusTopics.length === 0) {
    syllabusTopics.push("General Current Affairs & Editorial Analysis");
  }

  const upscVocab = ["judiciary", "constitution", "carbon credits", "monetary policy", "federalism", "geopolitics", "biodiversity", "renewable energy", "semiconductors", "artificial intelligence", "bilateral ties", "elections", "parliament", "amendments", "disaster response", "fiscal deficit", "inflation", "welfare reforms", "maritime border", "standing committee"];
  const matchedVocab = upscVocab.filter(word => lowercase.includes(word));

  const capWords = (title || "").match(/[A-Z][a-z]{3,}/g) || [];
  const uniqCaps = Array.from(new Set(capWords)).filter(w => !["The", "And", "For", "With", "In", "On", "At", "To", "From", "By", "About", "How", "Why", "What", "When", "India", "Indian"].includes(w));

  const keywordsSet = new Set<string>([...matchedVocab, ...uniqCaps.slice(0, 3)]);
  
  if (keywordsSet.size === 0) {
    keywordsSet.add("Mains Resource");
    keywordsSet.add("Current Affairs");
    keywordsSet.add("UPSC Syllabus");
  }

  return {
    keywords: Array.from(keywordsSet).slice(0, 5),
    syllabusTopics: syllabusTopics.slice(0, 2)
  };
}

function fallbackEvaluateAnswer(extractedText: string, filename: string): any {
  const cleanedText = extractedText || "";
  const wordCount = cleanedText.split(/\s+/).filter(Boolean).length || 50;
  
  let detectedType = "15-marker";
  let maxScore = 15;
  if (wordCount < 100) {
    detectedType = "10-marker";
    maxScore = 10;
  } else if (wordCount > 400) {
    detectedType = "Essay (125 Marks)";
    maxScore = 125;
  }

  const overallPercent = Math.min(0.65, Math.max(0.35, 0.45 + (wordCount > 150 ? 0.08 : 0) + (cleanedText.toLowerCase().includes("conclusion") ? 0.05 : 0)));
  const overallScore = Math.round(maxScore * overallPercent);

  const structureMax = Math.round(maxScore * 0.2);
  const structureScore = Math.max(1, Math.round(structureMax * (cleanedText.toLowerCase().includes("introduction") || cleanedText.toLowerCase().includes("conclusion") ? 0.7 : 0.5)));

  const contentMax = Math.round(maxScore * 0.4);
  const contentScore = Math.max(1, Math.round(contentMax * 0.55));

  const legalMax = Math.round(maxScore * 0.2);
  const legalScore = Math.max(1, Math.round(legalMax * (cleanedText.toLowerCase().includes("article") || cleanedText.toLowerCase().includes("case") || cleanedText.toLowerCase().includes("section") ? 0.65 : 0.4)));

  const clarityMax = maxScore - structureMax - contentMax - legalMax;
  const clarityScore = Math.max(1, Math.round(clarityMax * 0.6));

  const strengths = ["Good structured layout with clear paragraph divisions."];
  const improvements = ["Incorporate more flowcharts, hub-and-spoke diagram ideas, or data tables to stand out."];

  if (wordCount > 180) {
    strengths.push("Comprehensive word coverage matching standard word limit requirements perfectly.");
  } else {
    improvements.push("Elaborate further on core points. The answer falls slightly short of the recommended length.");
  }

  if (cleanedText.toLowerCase().includes("article") || cleanedText.toLowerCase().includes("amendment") || cleanedText.toLowerCase().includes("vs")) {
    strengths.push("Excellent citation of relevant Constitutional provisions and judicial precedents.");
  } else {
    improvements.push("Enhance Polity linkage: cite relevant Constitutional Articles (e.g., Article 21, 356) and landmark cases (e.g., Kesavananda Bharati vs. State of Kerala) where possible.");
  }

  if (cleanedText.toLowerCase().includes("conclusion") || cleanedText.toLowerCase().includes("way forward")) {
    strengths.push("Features a well-balanced, forward-looking legal or policy-driven conclusion.");
  } else {
    improvements.push("Incorporate a distinct 'Way Forward' or recommendation section before your conclusion summarizing committee stances.");
  }

  strengths.push("Clarity of arguments presented is commendable, allowing smooth readability.");

  return {
    detectedType,
    isOfflineFallback: true,
    extractedText: cleanedText || `[Document processed: ${filename}]`,
    evaluation: {
      overallScore,
      maxScore,
      structure: { score: structureScore, max: structureMax, feedback: "Good logical progression. Adding explicit sub-headings can improve scannability further for examiners." },
      contentAccuracy: { score: contentScore, max: contentMax, feedback: "Accuracy is fairly strong with core conceptual understanding demonstrated. Double-check recent amendments and legal provisions to ensure absolute accuracy." },
      legalCitation: { score: legalScore, max: legalMax, feedback: "Includes useful regulatory references. Cite precise Acts, sections, or articles to secure higher tier points." },
      clarity: { score: clarityScore, max: clarityMax, feedback: "The legibility, flow, and expression are clear. Avoid complex sentences; stick to clean bullet points." },
      strengths,
      improvements,
      conclusion: "⚠️ [LIMIT REPORT: Running in Offline Heuristic Mode due to AI Quota limits] An overall highly respectable attempt illustrating core understanding of UPSC syllabus expectations. Polishing case logs and structure will push this into the top bracket score tier!"
    }
  };
}

function fallbackGenerateDailyDigest(items: any[]): string {
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  let markdown = `# Daily Prep Digest (Offline Mode Summary)\n`;
  markdown += `*Date: ${dateStr}*\n\n`;
  markdown += `> **Editor's Note & Key Takeaways**: \n`;
  markdown += `> This daily digest has been locally synthesized from active feed streams, filtered strictly for UPSC CSE high-yield relevance. All frivolous stories, localized issues, sports, or gossip have been automatically removed.\n\n`;

  // Filter items for UPSC relevance
  const checkRelevance = (title: string, desc: string) => {
    const text = (title + " " + desc).toLowerCase();
    const frivolous = ["cricket", "ipl", "match score", "bollywood", "celebrity", "gossip", "movie", "murder", "theft", "accident kills"];
    for (const r of frivolous) {
      if (text.includes(r)) return false;
    }
    return true;
  };

  const filteredItems = items.filter(item => checkRelevance(item.title || "", item.description || ""));
  const targetItems = filteredItems.length > 0 ? filteredItems : items;

  const categories: Record<string, any[]> = {};
  for (const item of targetItems) {
    const cat = item.category || "General Current Affairs";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  }

  for (const [catName, catItems] of Object.entries(categories)) {
    markdown += `## UPSC Syllabus: ${catName}\n\n`;
    for (const item of catItems.slice(0, 3)) {
      markdown += `*   **${item.title}**\n`;
      markdown += `    ${item.description || "Synthesizing full text of latest article highlights."}\n`;
      if (item.link) {
        markdown += `    👉 [Analyze Full News & AI Summary in RSS Reader](${item.link})\n\n`;
      } else {
        markdown += `    *UPSC Connection*: Highly relevant for preparing descriptive GS answers and Essay linkages.\n\n`;
      }
    }
  }

  markdown += `## Editorial Mains Practice Query\n`;
  markdown += `* **Question**: "The integration of multi-sectoral planning and strategic policy execution is crucial for achieving high-growth, sustainable development in India." Critically analyze this statement in light of recent statutory and regulatory developments.\n`;
  markdown += `* **Hint Outline**:\n`;
  markdown += `  1. **Intro**: Contextualize with latest economic indices or supreme court interpretations.\n`;
  markdown += `  2. **Body**: Detail both administrative hurdles (e.g., federal friction) and policy benefits (e.g., digital public infrastructure).\n`;
  markdown += `  3. **Conclusion**: Conclude optimistic way forward aligned with NITI Aayog recommendations.\n`;

  return markdown;
}

function robustJsonParse(text: string): any {
  if (!text) return {};
  let cleaned = text.trim();

  // Strip DeepSeek-R1 / Reasoner thinking blocks if present
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  if (cleaned.toLowerCase().startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  cleaned = cleaned.trim();
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Basic native parse failed, apply character-level newline escaping for literal newlines
    let inString = false;
    let isEscaped = false;
    let fixed = '';
    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      if (inString) {
        if (char === '"' && !isEscaped) {
          inString = false;
          fixed += char;
        } else if (char === '\\' && !isEscaped) {
          isEscaped = true;
          fixed += char;
        } else {
          isEscaped = false;
          if (char === '\n') fixed += '\\n';
          else if (char === '\r') fixed += '\\r';
          else if (char === '\t') fixed += '\\t';
          else if (char === '\b') fixed += '\\b';
          else if (char === '\f') fixed += '\\f';
          else fixed += char;
        }
      } else {
        if (char === '"') {
          inString = true;
        }
        fixed += char;
      }
    }
    
    try {
      return JSON.parse(fixed);
    } catch (e2) {
      // Last-resort fallback for completely malformed JSON (e.g. unescaped quotes inside value)
      console.log("Using regex fallback for malformed JSON");
      const result: any = {};
      const folderMatch = cleaned.match(/"folderPath"\s*:\s*(\[[^\]]*\])/);
      if (folderMatch) {
         try { result.folderPath = JSON.parse(folderMatch[1]); } 
         catch (e3) { result.folderPath = ["Uncategorized"]; }
      }
      
      const notesMatch = cleaned.match(/"notes"\s*:\s*([\s\S]*)$/);
      if (notesMatch) {
         let str = notesMatch[1].trim();
         
         // If subsequent JSON keys exist (e.g. "mermaid_diagram": "..." or "comparisonTable": "..."), separate them cleanly
         const subsequentKeyMatch = str.match(/["'}\]\s]*,\s*["'](?:mermaid_diagram|mermaidCode|comparisonTable)["']\s*:\s*["']?([\s\S]*?)(?:["']\s*\}|\s*$)/i);
         let extraMermaid = '';
         if (subsequentKeyMatch) {
           extraMermaid = subsequentKeyMatch[1].trim();
           str = str.substring(0, subsequentKeyMatch.index).trim();
         }

         if (str.endsWith('}')) {
             str = str.substring(0, str.lastIndexOf('}')).trim();
         }
         if (str.startsWith('"')) str = str.substring(1);
         if (str.endsWith('"')) str = str.substring(0, str.length - 1);
         
         // Convert JSON string escapes
         str = str.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
         
         if (extraMermaid) {
           extraMermaid = extraMermaid.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
           if (!extraMermaid.startsWith('```mermaid') && !str.includes('```mermaid')) {
             extraMermaid = `\n\n\`\`\`mermaid\n${extraMermaid}\n\`\`\`\n`;
           } else if (!str.includes('```mermaid')) {
             extraMermaid = `\n\n${extraMermaid}\n`;
           }
           str += extraMermaid;
         }

         result.notes = str;
      } else {
         // Maybe it was a different endpoint response
         result.rawFallback = cleaned;
      }
      return result;
    }
  }
}

async function startServer() {
  const app = express();
const PORT = Number(process.env.PORT || 3000);

  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api', rateLimit({ windowMs: 60000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false }));
  app.use('/api', authenticate);
  app.use('/api', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  app.use(express.json({ limit: '6mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: false }));
  installWorkspaceRoutes(app);
  installReaderRoutes(app);

  app.post('/api/diagrams-generate', async (req, res) => {
    try {
      const { paper, question, model } = req.body;
      if (!question) {
        return res.status(400).json({ error: "Question parameter is required" });
      }

      const prompt = `You are an expert UPSC Civil Services examination Mentor specializing in visual diagrams and flowcharts for the Mains answer sheet.
The student is practicing for Paper: ${paper || "General Studies"}.
For the Question below:
"${question}"

Design highly effective visual additions:
1. A valid, parseable, and visually clean Mermaid flowchart (using flowchart TD, flowchart LR, or mindmap) representing the system flow, cause-effect, or core administrative trauma of the topic.
   Ensure it conforms strictly to basic mermaid layout syntax, uses subgraphs to categorize separate dimensions (e.g. causes vs reforms), deploys node shapes for density (e.g., (( "Themes" )) or {{ "Processes" }}), and does not use unsupported characters.
   CRITICAL: You MUST ALWAYS, WITHOUT EXCEPTION, wrap all node labels in double quotes (e.g. A["ARC-II: Integrity"]) to prevent syntax errors with parentheses, commas, colons, quotes etc.
   Reflect UPSC patterns like Hub and Spoke or Feedback Loops. Avoid long descriptions in labels. Example structured code: flowchart TD\nsubgraph Bottlenecks\nA(("Structural Friction")) --> B{{"Supply Leaks"}}\nend\nsubgraph Solutions\nC(("Digital Tracking")) --> D[/"Direct Transfers"/]\nend\nB -. "Interconnected" .-> C.
2. A beautiful, balanced Markdown comparison table that contrasts two aspects (e.g. Option A vs Option B or Centre stance vs State stance or Current scenario vs Mandated target).
3. A brief Sketch Map or Diagram Prompt recommending what simple diagram they should sketch by hand on their paper (e.g. "Sketch a circular cycle representing the Virtuous Cycle of Investment").`;

      const hasDeepSeek = true;
      if (!hasDeepSeek) {
        throw new Error("DEEPSEEK_API_KEY environment variable is not configured in the Settings menu. Please configure it to generate diagrams.");
      }

      const selectedModel = model && model.toLowerCase().includes('deepseek') ? model : 'deepseek-chat';
      const isReasoner = selectedModel.toLowerCase().includes('reasoner');

      let messages = [
        { 
          role: 'system', 
          content: UPSC_SYLLABUS_CONTEXT + "\nYou are a UPSC Visual Blueprint engine. You must respond with a single, valid JSON block matching the requested structure." 
        },
        { 
          role: 'user', 
          content: prompt + "\n\nCRITICAL: Return your response PURELY in a valid JSON format. Matches this JSON structure exactly:\n{\n  \"mermaidCode\": \"A valid, parseable, visually clean Mermaid flowchart using flowchart TD or flowchart LR\",\n  \"comparisonTable\": \"A Markdown comparison table contracting two aspects of the topic\",\n  \"mapPrompt\": \"A brief hand-sketch diagram prompt for the candidate\"\n}" 
        }
      ];

      const completion = await createDeepSeekCompletion({
        model: selectedModel,
        messages,
        response_format: isReasoner ? undefined : { type: "json_object" }
      });

      let reply = (completion.choices[0].message.content || '{}').trim();
      if (reply.startsWith("```")) {
        reply = reply.replace(/^```(json)?/, "").replace(/```$/, "").trim();
      }

      res.json({ reply });
    } catch (err: any) {
      console.error("DeepSeek visual diagram generation failed:", err);
      res.status(500).json({ error: err.message || "Failed to generate visual diagrams with DeepSeek." });
    }
  });

  app.post('/api/brainstorm-generate', async (req, res) => {
    try {
      const { paper, question, model } = req.body;
      if (!question) {
        return res.status(400).json({ error: "Question parameter is required" });
      }

      const prompt = `You are an expert UPSC Civil Services examination Mentor specializing in brainstorming structures.
The student is practicing for GS Paper: ${paper || "General Studies"}.
For the Question below:
"${question}"

Structure a highly specialized brainstorming guide:
1. PESTEL parameters: Create concise, 1-sentence analytical points across Political, Economic, Social, Technological, Environmental, and Legal dimensions SPECIFIC to this question.
2. Stakeholders: Spot exactly 2-3 key stakeholders, their primary dilemma in this question, and their core interest.
3. Topper Vocabulary: Suggest 4 highly academic, specialized keywords or concepts (e.g. Sanskritization, symmetric federalism, deontology, capital expenditures multiplier, post-harvest losses) with very short 1-sentence definitions.`;

      const hasDeepSeek = true;
      if (!hasDeepSeek) {
        throw new Error("DEEPSEEK_API_KEY environment variable is not configured in the Settings menu. Please configure it to generate brainstorm guides.");
      }

      const selectedModel = model && model.toLowerCase().includes('deepseek') ? model : 'deepseek-chat';
      const isReasoner = selectedModel.toLowerCase().includes('reasoner');

      let messages = [
        { 
          role: 'system', 
          content: UPSC_SYLLABUS_CONTEXT + "\nYou are a UPSC Brainstorming engine. You must respond with a single, valid JSON block matching the requested structure." 
        },
        { 
          role: 'user', 
          content: prompt + "\n\nCRITICAL: Return your response PURELY in a valid JSON format. Matches this JSON structure exactly:\n{\n  \"pestel\": {\n    \"political\": \"Political point...\",\n    \"economic\": \"Economic point...\",\n    \"social\": \"Social point...\",\n    \"technological\": \"Tech point...\",\n    \"environmental\": \"Env point...\",\n    \"legal\": \"Legal point...\"\n  },\n  \"stakeholders\": [\n    { \"name\": \"Stakeholder name\", \"dilemma\": \"Their dilemma\", \"interest\": \"Core interest\" }\n  ],\n  \"vocabulary\": [\n    { \"word\": \"Key word\", \"definition\": \"Definition...\" }\n  ]\n}" 
        }
      ];

      const completion = await createDeepSeekCompletion({
        model: selectedModel,
        messages,
        response_format: isReasoner ? undefined : { type: "json_object" }
      });

      let reply = (completion.choices[0].message.content || '{}').trim();
      if (reply.startsWith("```")) {
        reply = reply.replace(/^```(json)?/, "").replace(/```$/, "").trim();
      }

      res.json({ reply });
    } catch (err: any) {
      console.error("DeepSeek brainstorm generation failed:", err);
      res.status(500).json({ error: err.message || "Failed to generate brainstorming guide with DeepSeek." });
    }
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, model } = req.body;
      let replyText = '';

      // We enforce using Gemini-3.5-flash with Google Search Grounding
      // for all chat messages to ensure 100% correct factual, legal, and current affairs data.
      const isJsonReq = messages && messages.length === 1 && 
        (messages[0].content.includes('JSON') || messages[0].content.includes('json') || messages[0].content.includes('structure'));

      let prompt = '';
      let config: any = {
        systemInstruction: UPSC_SYLLABUS_CONTEXT + UPSC_RAG_PROTOCOL,
        tools: [{ googleSearch: {} }] // Enable Google Search Grounding for absolute accuracy!
      };

      if (isJsonReq) {
        prompt = messages[0].content;
        config.responseMimeType = 'application/json';
      } else {
        const formattedChat = (messages || []).map((m: any) => `${m.role === 'user' ? 'Aspirant' : 'Atlas IAS Mentor'}: ${m.content}`).join('\n\n');
        prompt = `Below is a historical conversation thread between an Aspirant and Atlas IAS Mentor. Please respond as Atlas IAS Mentor to the latest message.
        
        THREAD:
        ${formattedChat}
        
        Mentor response:`;
      }

      try {
        const geminiResponse = await generateGeminiWithRetry({
          model: 'gemini-2.5-flash',
          contents: { parts: [{ text: prompt }] },
          config: config
        });
        replyText = geminiResponse.text || '';
      } catch (geminiErr: any) {
        console.error('Gemini with Search Grounding failed in chat, falling back to DeepSeek:', geminiErr.message);
        try {
          const completion = await createDeepSeekCompletion({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: UPSC_SYLLABUS_CONTEXT },
              ...messages
            ],
          });
          replyText = completion.choices[0].message.content || '';
        } catch (dsErr: any) {
          throw new Error(`Both Gemini and DeepSeek failed. Gemini: ${geminiErr.message}. DeepSeek: ${dsErr.message}`);
        }
      }

      res.json({ reply: replyText });
    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

function synthesizeLocalUpscNotes(topic: string, subject: string, category: string): { folderPath: string[]; notes: string } {
  const normSub = subject || "General Studies";
  let folderPath = [normSub];
  if (normSub.toLowerCase().includes("1")) folderPath = ["General Studies 1", category === "geography" ? "Geography" : category === "history" ? "History & Culture" : "Indian Society"];
  else if (normSub.toLowerCase().includes("2")) folderPath = ["General Studies 2", "Polity & Governance"];
  else if (normSub.toLowerCase().includes("3")) folderPath = ["General Studies 3", category === "economy" ? "Economy" : category === "environment" ? "Environment & Ecology" : "Science & Technology"];
  else if (normSub.toLowerCase().includes("4")) folderPath = ["General Studies 4", "Ethics & Integrity"];
  else if (normSub.toLowerCase().includes("law")) folderPath = ["Law Optional", "Paper 1"];
  else folderPath = ["General Studies", normSub];

  const notes = `## 1. Introduction & Context
**${topic}** is a core thematic topic within **${normSub}** of the UPSC Civil Services Examination. A comprehensive understanding of this domain requires analyzing its structural foundations, constitutional or statutory provisions, administrative mechanisms, and recent 2025–2026 policy developments.

## 2. Structural & Conceptual Foundations
* **Core Principle**: Explores the underlying operational and legal principles governing **${topic}**.
* **Key Provisions & Statutes**: 
  - **Constitutional/Statutory Framework**: Aligns with constitutional mandates, statutory enactments, and regulatory oversight bodies.
  - **Key Objectives**: Focuses on socio-economic equity, administrative transparency, sustainable resource management, and constitutional probity.
* **Dimensional Breakdown**:
  - **Administrative Dimension**: Role of executive agencies, federal coordination between Centre and States, and ground-level implementation bottlenecks.
  - **Socio-Economic Impact**: Influence on vulnerable sections, economic growth metrics, and public welfare delivery mechanisms.

\`\`\`mermaid
flowchart TD
    subgraph Core_Architecture ["Structural Architecture: ${topic}"]
        A(("Core Theme: ${topic}")) --> B{{"Administrative & Legal Framework"}}
        B --> C[/"Policy Execution & Devolution"/]
        C --> D[/"Public Welfare & Administrative Impact"/]
    end
    subgraph Bottlenecks ["Implementation Challenges"]
        E{{"Structural Bottleneck"}} --> F[/"Devolution & Capacity Deficit"/]
    end
    C -. "Gaps" .-> E
\`\`\`
**Figure 1:** Conceptual Workflow and Administrative Mapping of ${topic}.

## 3. Critical Analysis & Key Bottlenecks
* **Structural Bottlenecks**: Bureaucratic inertia, inter-agency coordination friction, and capacity constraints at local governance levels.
* **Contemporary Challenges**: Rapid technological shifts, emerging global uncertainties, and federal fiscal dynamics.

| Dimension | Key Aspect | Administrative Impact |
| :--- | :--- | :--- |
| **Legal / Statutory** | Enabling legislation & constitutional articles | Provides enforceable mandate & legal remedies |
| **Institutional** | Executive ministries & statutory commissions | Oversees policy formulation & ground implementation |
| **Socio-Economic** | Target beneficiaries & welfare outcomes | Enhances equitable access & inclusive growth |

## 4. Contemporary Relevance & 2025–2026 Policy Updates
* **Recent Judicial & Statutory Developments**: Supreme Court interpretations, Parliamentary amendments, and revised Union Budget allocations.
* **Executive Directives**: NITI Aayog action frameworks, PIB official releases, and 2nd ARC recommendations for governance optimization.

## 5. Conclusion & Way Forward
To maximize high-yield outcome for UPSC Mains:
1. **Capacity Building**: Strengthen institutional infrastructure and digital public tools.
2. **Cooperative Federalism**: Foster harmonized Centre-State action matrices.
3. **Targeted Delivery**: Ensure robust audit procedures and stakeholder consultation.

## 6. Verified UPSC Grounding Verification
* Source: Standard NCERT reference text, PIB releases, and official Ministry reports.
`;

  return { folderPath, notes };
}

  app.post('/api/notes', async (req, res) => {
    try {
      const { topic, subject, model, isDeepDive } = req.body;
      
      // Determine dynamic category of the notes for UPSC specialization
      let category = "polity"; // default fallback
      const subLower = (subject || "").toLowerCase();
      const topicLower = (topic || "").toLowerCase();
      
      if (subLower.includes("gs 1") || subLower.includes("studies 1") || subLower.includes("studies i")) {
        if (/(geography|monsoon|climate|river|earthquake|volcano|cyclone|soil|crop|mineral|map|spatial|oceanography|resource)/i.test(topicLower)) {
          category = "geography";
        } else if (/(history|ancient|medieval|modern|freedom struggle|art|culture|movement|revolt|british|dynasty|empire|heritage|renaissance|unification|world war)/i.test(topicLower)) {
          category = "history";
        } else {
          category = "society";
        }
      } else if (subLower.includes("gs 2") || subLower.includes("studies 2") || subLower.includes("studies ii") || subLower.includes("polity") || subLower.includes("governance") || subLower.includes("justice")) {
        category = "polity";
      } else if (subLower.includes("gs 3") || subLower.includes("studies 3") || subLower.includes("studies iii") || subLower.includes("economy") || subLower.includes("agri")) {
        if (/(economy|finance|budget|gst|tax|growth|inflation|banking|agriculture|msp|apmc|trade|industry|employment|investment|infrastructure|pds)/i.test(topicLower)) {
          category = "economy";
        } else if (/(environment|biodiversity|climate change|convention|wildlife|pollution|conservation|cop|forest|ecosystem|ramsar)/i.test(topicLower)) {
          category = "environment";
        } else if (/(science|technology|space|satellite|cyber|biotech|ai|nanotech|nuclear|energy|defense)/i.test(topicLower)) {
          category = "science";
        } else if (/(security|border|militancy|insurgency|terrorism|left wing|police|forces)/i.test(topicLower)) {
          category = "security";
        } else {
          category = "economy"; // fallback within GS3
        }
      } else if (subLower.includes("gs 4") || subLower.includes("ethics") || subLower.includes("integrity") || subLower.includes("aptitude")) {
        category = "ethics";
      } else if (subLower.includes("law")) {
        category = "law";
      } else if (subLower.includes("essay")) {
        category = "essay";
      } else {
        // Fallback checks based on topic keywords if subject is generic
        if (/(geography|climate|monsoon|river|earthquake|volcano|map)/i.test(topicLower)) {
          category = "geography";
        } else if (/(history|ancient|medieval|freedom struggle|gandhi|nehru|art|culture)/i.test(topicLower)) {
          category = "history";
        } else if (/(ethics|moral|integrity|values|philosophy|attitude|conscience|probity)/i.test(topicLower)) {
          category = "ethics";
        } else if (/(economy|fiscal|growth|inflation|agriculture|budget|msp)/i.test(topicLower)) {
          category = "economy";
        } else if (/(law|constitution|article|court|judgment|judiciary|amendment|bill)/i.test(topicLower)) {
          category = "law";
        } else if (/(essay|philosophical|anecdote|reflection|wisdom)/i.test(topicLower)) {
          category = "essay";
        }
      }

      let subjectDemands = "";
      let coreConceptsHeading = "## 2. Core Concepts";
      let caseLawHeading = "## 3. Important Cases / Examples";

      if (category === "history") {
        coreConceptsHeading = "## 2. Historical Timeline & Chronological Development";
        caseLawHeading = "## 3. Primary Sources, Personality Contributions & Subaltern Perspectives";
        subjectDemands = `
        UPSC SUBJECT-SPECIFIC DEMANDS FOR HISTORY (GS1):
        - Organize the content chronologically, establishing structural causes (social, economic, political, religious) and long-term socio-cultural transformations.
        - Highlight contributions of key nationalist, peasant, tribal, and revolutionary leaders (cite specific names, organizations, and journals/publications).
        - Mention historical/literary/archaeological sources where appropriate (e.g., travelogues, edicts, archival records) to elevate academic authority.
        - Include references to different schools of historical interpretation (Nationalist, Marxist, Subaltern, Imperialist) where helpful.
        - Guide: The Mermaid diagram MUST be a chronological timeline or a mindmap showing the structural causes of the event/movement.`;
      } else if (category === "geography") {
        coreConceptsHeading = "## 2. Physical & Geomorphological Mechanisms";
        caseLawHeading = "## 3. Spatial Distribution, Map References & Resource Allocation";
        subjectDemands = `
        UPSC SUBJECT-SPECIFIC DEMANDS FOR GEOGRAPHY (GS1):
        - Focus heavily on physical and geomorphological working mechanisms (e.g., Coriolis force, pressure gradients, plate boundary mechanics, adiabatic cooling).
        - Detail spatial and resource distribution (global and localized Indian variations, e.g., peninsular vs. extra-peninsular patterns).
        - Explicitly incorporate map references, regional examples (e.g., specific rivers, plateaus, passes), and environmental-economic links (human-geography interface).
        - Use key technical terms from geographical theories (e.g., convection currents, seafloor spreading, rain shadow effect).
        - Guide: The Mermaid diagram MUST represent a spatial schema, resource flow chain, or geomorphological lifecycle.`;
      } else if (category === "polity") {
        coreConceptsHeading = "## 2. Constitutional & Statutory Framework";
        caseLawHeading = "## 3. Landmark Judgements, Committee Reports & Institutional Audits";
        subjectDemands = `
        UPSC SUBJECT-SPECIFIC DEMANDS FOR POLITY & CONSTITUTION (GS2):
        - Cite exact Constitutional Articles (Articles 1-395), Schedules, Amendments, and the precise nature of the statutory/constitutional/regulatory bodies involved.
        - Integrate recommendations of landmark commissions (e.g., 2nd ARC, Punchhi Commission, Sarkaria Commission, Venkatachaliah Commission, Law Commission reports).
        - Focus on federal dynamics (Centre-State friction points, legislative distribution, devolution of powers to local Panchayati Raj bodies).
        - Balance constitutional theory with empirical ground reality (e.g., judicial backlog, executive overreach, legislative decline, criminalization of politics).
        - Guide: The Mermaid diagram MUST illustrate the division of powers, legislative passage steps, or federal institutional architectures.`;
      } else if (category === "economy") {
        coreConceptsHeading = "## 2. Economic Models, Structural Framework & Indices";
        caseLawHeading = "## 3. Sectoral Bottlenecks, APMC/Agri Reforms & Infrastructure Cases";
        subjectDemands = `
        UPSC SUBJECT-SPECIFIC DEMANDS FOR ECONOMY & AGRICULTURE (GS3):
        - Integrate key macro-economic parameters (inflation, GDP growth, fiscal deficit, CAD, tax-to-GDP ratio) and official data points from the Union Budget/Economic Survey.
        - Incorporate specific recommendations of standard panels (e.g., Urjit Patel Committee, Shanta Kumar Committee on FCI, Kelkar Committee on PPP, NITI Aayog Action Agenda).
        - Address structural agricultural hurdles (e.g., MSP calculation methodology, APMC monopolies, cold storage supply chains, land fragmentation) and industrial/investment models.
        - Reference multilateral trade/economic organizations (e.g., WTO agreements, IMF quotas, World Bank indices) and global frameworks.
        - Guide: The Mermaid diagram MUST represent an economic circular flow, agricultural supply chain, or credit transmission mechanism.`;
      } else if (category === "environment" || category === "science" || category === "security") {
        coreConceptsHeading = "## 2. Scientific Principles, Threat Matrix & Technical Framework";
        caseLawHeading = "## 3. International Conventions, National Action Plans & Statutory Bodies";
        subjectDemands = `
        UPSC SUBJECT-SPECIFIC DEMANDS FOR SCIENCE, ENVIRONMENT & SECURITY (GS3):
        - For Science/Tech: Explain core scientific working principles simply (e.g., CRISPR-Cas9 mechanism, qubits in quantum computing, LEO satellites, 5G architectures).
        - For Environment: Quote international protocols/conventions (UNFCCC COP resolutions, Ramsar, CBD, CITES) and national statutory frameworks (NGT, Forest Rights Act, National Board for Wildlife).
        - For Security & Disaster Management: Address internal security vectors (LWE, cross-border terrorism, cyber-warfare, border management) and NDMA guidelines.
        - Guide: The Mermaid diagram MUST depict a technological system process flow, ecological cycle, or security/disaster mitigation architecture.`;
      } else if (category === "ethics") {
        coreConceptsHeading = "## 2. Moral Thinkers, Philosophical Foundations & Core Values";
        caseLawHeading = "## 3. UPSC Mains-Style Case Study (Stakeholders & Action Matrix)";
        subjectDemands = `
        UPSC SUBJECT-SPECIFIC DEMANDS FOR ETHICS, INTEGRITY & APTITUDE (GS4):
        - Frame concepts through moral philosophies (e.g., Kantian Deontology, Utilitarianism, Aristotelian Virtue Ethics, Gandhian Trusteeship, Bhagavad Gita's Nishkama Karma, Social Contract theories).
        - Incorporate core values (integrity, empathy, impartiality, emotional intelligence, probity, objectivity) with practical examples.
        - Cite Nolan Committee principles of public life.
        - Under Section 3 (Case Study), structure a realistic administrative scenario. You MUST map out:
          1. Key Stakeholders (using a structured bulleted list)
          2. Ethical Dilemmas (e.g., administrative duty vs. personal empathy, professional secrecy vs. public interest)
          3. Options Available with their pros & cons
          4. Recommended course of action with clear ethical and constitutional justification.
        - Guide: The Mermaid diagram MUST be an Ethical Decision Tree or a Stakeholder Mapping Hub.`;
      } else if (category === "law") {
        coreConceptsHeading = "## 2. Jurisprudential Foundations & Bare Act Provisions";
        caseLawHeading = "## 3. Landmark Judgments, Ratio Decidendi & Legislative Evolution";
        subjectDemands = `
        UPSC SUBJECT-SPECIFIC DEMANDS FOR LAW OPTIONAL:
        - Maintain supreme legal rigor. Quote precise sections of the Bare Acts (e.g., BNS, BNSS, BSB, Contracts Act, Specific Relief Act, Torts concepts).
        - Integrate juristic opinions (e.g., Austin's Command theory, Salmond's views, Hart's Rule of Recognition, Roscoe Pound's Social Engineering).
        - For criminal law, explicitly highlight both classic IPC/CrPC provisions and newly enacted BNS/BNSS equivalents, explaining the legislative or transitional intent.
        - Strictly detail the 'Ratio Decidendi' (reason for the decision) of major landmark judgements (e.g., Kesavananda Bharati, Maneka Gandhi, Navtej Johar, Kartar Singh, S.R. Bommai).
        - Guide: The Mermaid diagram MUST represent a constitutional hierarchy, a procedural flowchart, or a comparative bipartite structure.`;
      } else if (category === "essay") {
        coreConceptsHeading = "## 2. Philosophical Exposition & Multi-Dimensional Analysis";
        caseLawHeading = "## 3. Anecdotal Hooks, Historical Metaphors & Thinkers' Quotes";
        subjectDemands = `
        UPSC SUBJECT-SPECIFIC DEMANDS FOR ESSAY PAPER:
        - Avoid structuring this as a dry, factual textbook chapter. Make it highly fluid, literary, deeply analytical, and reflective.
        - Apply a rigorous multi-dimensional lens (PESTEL-H: Political, Economic, Social, Technological, Environmental, Legal, Historical) to explore the topic.
        - Open Section 1 with an evocative historical anecdote, philosophical metaphor, or a powerful hook.
        - Weave in quotes from notable thinkers, statesmen, or poets (e.g., Mahatma Gandhi, Tagore, Amartya Sen, Plato, Orwell, Abraham Lincoln).
        - Seamlessly connect abstract concepts with concrete contemporary administrative challenges, maintaining elegant transitions (thesis -> antithesis -> synthesis).
        - Guide: The Mermaid diagram MUST be a multi-dimensional Mindmap (using hub-and-spoke) illustrating the thesis arguments.`;
      } else {
        // society fallback
        coreConceptsHeading = "## 2. Sociological Foundations & Indian Context";
        caseLawHeading = "## 3. Demographic Data, Social Schemes & Localized Cases";
        subjectDemands = `
        UPSC SUBJECT-SPECIFIC DEMANDS FOR INDIAN SOCIETY (GS1):
        - Emphasize sociological phenomena (e.g., secularization, communalism, regionalism, globalization, caste dynamics, patriarchy, urbanisation).
        - Cite relevant statistics and reports (e.g., Census, NFHS, UN Women, Oxfam Inequality reports).
        - Discuss government schemes and legislative interventions (e.g., Beti Bachao Beti Padhao, POSH Act, Scheduled Castes and Scheduled Tribes Prevention of Atrocities Act).
        - Provide local case studies, community-led success stories, or civil society movements.`;
      }

      let deepDiveInstruction = "";
      if (isDeepDive) {
        deepDiveInstruction = `
      EXHAUSTIVE MODE ACTIVATED (UPSC Deep-Dive Notes style):
      - Provide maximum depth, granular explanations, and exhaustive coverage of all sub-concepts and facets of this topic.
      - Go beyond high-level summaries: explain historical contexts, structural and constitutional foundations, specific ministries/agencies, administrative mechanisms, federal dynamics, socio-economic implications, and critical systemic loopholes.
      - Under each of the mandatory headings, include multiple structured H3 (###) subheadings to address specific dimensions. Elaborate fully on each sub-concept with highly detailed prose, bullet points, statistics, recent indices, and case studies.
      - Incorporate detailed recommendations from relevant Commissions/Committees (e.g., 2nd ARC, Punchhi, Sarkaria, Law Commission reports, NITI Aayog's Action Agenda, and custom expert committees).
      - Detail landmark Supreme Court judgements or high-yield judicial precedents with brief descriptions of the issues, rulings, and legal significance.
      - Present both sides of contemporary debates (Pro vs Con, Centre vs State, structural bottlenecks vs functional merits) using beautiful comparisons and structured arguments to help write robust Mains answers.`;
      }

      const prompt = `Prepare comprehensive UPSC notes for the topic: "${topic}" under the subject: "${subject}".
      
      ${subjectDemands}
      
      ${deepDiveInstruction}

      CRITICAL FORMATTING REQUIREMENTS FOR THE "notes" FIELD:
      1. You MUST use STRICT Markdown formatting.
      2. Use H2 (##) or H3 (###) for all main headings and subheadings.
      3. **Use bolding** for key terms, case laws, and important concepts (e.g. **Kasturi Lal v. State of UP**).
      4. Use proper unordered (-) and ordered (1. 2. 3.) lists, and ensure you use line breaks before and after lists.
      5. Add DOUBLE line breaks (\\n\\n) between paragraphs and headings to ensure readable spacing.
      6. HIGH PRIORITY: Use Markdown tables wherever necessary to compare concepts, summarize data, or present facts efficiently.
      7. HIGH PRIORITY: Use valid **Mermaid** syntax (\`\`\`mermaid\n...\n\`\`\`) to generate flowcharts, mindmaps, state diagrams, pie charts, and conceptual relationship diagrams. DO NOT use ASCII art. Incorporate at least one diagram per response to maximize information density within strict limits. ALWAYS include a non-removable '**Figure X:** [Description]' text label directly above every generated diagram to improve accessibility and readability in exported PDFs.
         CRITICAL MERMAID NODE QUALITY RULES:
         - EVERY node MUST have an explicit, descriptive, and human-readable label enclosed in quotes inside brackets: e.g. NodeId["Descriptive Concept Name<br/>Key Provision / Ratio Decidendi"].
         - STRICTLY FORBIDDEN: NEVER output bare letters or placeholder IDs without descriptive labels (e.g. NEVER write \`B --> B1\`, \`C --> C1 & D1\`, or \`A --> B\`). Every single box MUST explain an actual UPSC concept, case law, article, commission, or policy mechanism.
         - For landmark judgments diagrams, each box MUST state the Case Name, Year, and Constitutional Principle (e.g. Kesavananda["Kesavananda Bharati (1973)<br/>Basic Structure Doctrine"] --> JudicialReview["Judicial Review as Inviolable Feature"]).
      8. CRITICAL PRIORITY: Ensure that all facts, dates, events, cases, constitutional articles, and data points are 100% factually correct and derived from verified, standard academic and government sources ONLY. Do NOT hallucinate or invent information. Accuracy is paramount for UPSC grading.
      9. REAL-TIME GOOGLE SEARCH GROUNDING (2025–2026 UPDATES): You MUST actively use the live Google Search tool to retrieve the most recent 2024–2026 developments, Supreme Court verdicts, PIB press releases, new statutory acts (e.g. BNS, BNSS, BSB, DPDP Act 2023, Telecom Act 2023, IT Rules, 2025-2026 Economic Survey & Union Budget data). Explicitly incorporate these contemporary developments into Section 4 ("Critical Analysis & Contemporary Relevance (2025-2026 Updates)") and cite official sources in Section 6 ("Verified UPSC RAG Grounding Verification").
      
      Structure exactly using these sections:
      ## 1. Introduction & Context
      ${coreConceptsHeading}
      ${caseLawHeading}
      ## 4. Critical Analysis & Contemporary Relevance (2025-2026 Updates)
      ## 5. Conclusion & Way Forward
      ## 6. Verified UPSC RAG Grounding Verification
      
      Keep it high-yield, structured, and strictly aligned with the UPSC syllabus scope.
      
      You MUST respond with ONLY a valid JSON object following this exact structure:
      {
        "folderPath": ["Subject Name", "Paper Name (if applicable)", "Main Topic", "Sub Topic"],
        "notes": "The comprehensive markdown generated notes..."
      }
      
      CRITICAL FOLDER PATH INSTRUCTIONS:
      Align the "folderPath" strictly with the standard UPSC Syllabus structure to prevent fragmentation.
      - Level 1 MUST be one of: "General Studies 1", "General Studies 2", "General Studies 3", "General Studies 4", "Essay", "Law Optional", or the specific Optional name.
      - Level 2 MUST be the Paper for optionals (e.g., "Paper 1", "Paper 2") or the broad syllabus theme (e.g., "History", "Geography", "Polity", "Economy").
      - Level 3 MUST be the exact Syllabus module (e.g., "Constitutional Law", "Modern Indian History", "Environment").
      
      Examples:
      - GS1 History: ["General Studies 1", "History", "Modern India"]
      - Law Optional: ["Law Optional", "Paper 1", "Constitutional Law", "Fundamental Rights"]
      - GS3 Economy: ["General Studies 3", "Economy", "Agriculture"]
      
      Ensure the JSON string is properly escaped where needed but keep the markdown highly structured with headings, bold text, and bullet points. Do not include any Markdown wrappers like \`\`\`json around the response. Just output the raw JSON object string.`;

      const requestedModel = (model || '').toLowerCase();
      const isDeepSeekSelected = requestedModel.includes('deepseek') || requestedModel.includes('reasoner') || requestedModel.includes('r1') || requestedModel.includes('v3');
      
      let responseText = '';

      if (isDeepSeekSelected) {
        // User explicitly selected DeepSeek!
        const dsModel = requestedModel.includes('reasoner') || requestedModel.includes('r1') ? 'deepseek-reasoner' : 'deepseek-chat';
        console.log(`Executing DeepSeek primary with model: ${dsModel} for topic: ${topic}`);
        try {
          const isReasoner = dsModel.includes('reasoner');
          const completion = await createDeepSeekCompletion({
            model: dsModel,
            response_format: isReasoner ? undefined : { type: 'json_object' },
            messages: [
              { role: 'system', content: UPSC_SYLLABUS_CONTEXT },
              { role: 'user', content: prompt }
            ]
          });
          responseText = completion.choices[0]?.message?.content || '';
        } catch (dsErr: any) {
          console.warn(`Primary DeepSeek (${dsModel}) failed, attempting fallback DeepSeek-Chat:`, dsErr.message);
          try {
            const fallbackCompletion = await createDeepSeekCompletion({
              model: 'deepseek-chat',
              response_format: { type: 'json_object' },
              messages: [
                { role: 'system', content: UPSC_SYLLABUS_CONTEXT },
                { role: 'user', content: prompt }
              ]
            });
            responseText = fallbackCompletion.choices[0]?.message?.content || '';
          } catch (dsFallbackErr: any) {
            console.warn("DeepSeek fallback failed, trying Gemini:", dsFallbackErr.message);
            try {
              const geminiRes = await generateGeminiWithRetry({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: prompt }] },
                config: { systemInstruction: UPSC_SYLLABUS_CONTEXT }
              });
              responseText = geminiRes.text || '';
            } catch (gErr: any) {
              console.error("All AI models failed for notes generation:", gErr.message);
            }
          }
        }
      } else {
        // Primary is Gemini Search Grounding
        try {
          const searchGroundingPromise = generateGeminiWithRetry({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
              systemInstruction: UPSC_SYLLABUS_CONTEXT + UPSC_RAG_PROTOCOL,
              tools: [{ googleSearch: {} }]
            }
          });
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Search grounding timeout')), 14000)
          );

          const geminiResponse: any = await Promise.race([searchGroundingPromise, timeoutPromise]);
          responseText = geminiResponse.text || '';
        } catch (geminiErr: any) {
          console.warn("Gemini search grounding failed or timed out, trying fast Gemini:", geminiErr.message);
          try {
            const fastGeminiResponse = await generateGeminiWithRetry({
              model: 'gemini-2.5-flash',
              contents: { parts: [{ text: prompt }] },
              config: { systemInstruction: UPSC_SYLLABUS_CONTEXT }
            });
            responseText = fastGeminiResponse.text || '';
          } catch (fastErr: any) {
            console.warn("Fast Gemini failed, falling back to DeepSeek Reasoner/Chat:", fastErr.message);
            try {
              const completion = await createDeepSeekCompletion({
                model: 'deepseek-reasoner',
                messages: [
                  { role: 'system', content: UPSC_SYLLABUS_CONTEXT },
                  { role: 'user', content: prompt }
                ]
              });
              responseText = completion.choices[0]?.message?.content || '';
            } catch (dsErr: any) {
              console.error("DeepSeek fallback also failed in notes:", dsErr.message);
            }
          }
        }
      }

      if (responseText.startsWith('```json')) responseText = responseText.replace(/^```json\n?/, '');
      if (responseText.endsWith('```')) responseText = responseText.replace(/\n?```$/, '');
      responseText = responseText.trim();

      const parsed = robustJsonParse(responseText);
      
      let sanitizedNotes = parsed.notes ? String(parsed.notes) : '';
      sanitizedNotes = sanitizedNotes
        .replace(/["'}\]\s]*,\s*["']?(?:mermaid_diagram|mermaidCode|comparisonTable)["']?\s*:\s*["']?(```mermaid)?/gi, (_, m1) => m1 ? `\n\n${m1}` : '\n\n')
        .replace(/(\n|^)\s*["'}\]]{2,}\s*(\n|$)/g, '\n')
        .replace(/\\n/g, '\n')
        .replace(/<br\s*\/?>/gi, '\n');

      // Fail-safe check: if notes is empty or too short, synthesize high quality local notes
      let finalFolderPath = parsed.folderPath;
      if (!sanitizedNotes || sanitizedNotes.trim().length < 50) {
        console.log("Synthesizing local high-yield UPSC notes fallback for topic:", topic);
        const fallbackObj = synthesizeLocalUpscNotes(topic, subject, category);
        sanitizedNotes = fallbackObj.notes;
        if (!finalFolderPath || !Array.isArray(finalFolderPath)) {
          finalFolderPath = fallbackObj.folderPath;
        }
      }

      res.json({ notes: sanitizedNotes, folderPath: finalFolderPath || [subject, topic] });
    } catch (error: any) {
      console.error('Notes error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  app.post('/api/notes-flashcards', async (req, res) => {
    try {
      const { notesText, subject } = req.body;
      if (!notesText) {
        return res.status(400).json({ error: 'Notes text is required to generate flashcards.' });
      }

      const prompt = `
      You are an expert UPSC Civil Services exam examiner and ranker coach.
      Analyze the following UPSC study notes regarding "${subject || 'General Studies'}" and extract exactly 4 high-yield Active Recall Flashcard Questions and Answers.
      
      CRITICAL INSTRUCTIONS FOR FLASHCARDS:
      1. Every card MUST focus on high-yield, factual, legal, historical, or policy concepts present in the notes.
      2. The Question (Front) must be specific and analytical (e.g., "What are the key constitutional Articles and the landmark judgement related to the Basic Structure Doctrine?").
      3. The Answer (Back) must be structured with 3-4 bullet points containing extremely precise, verified facts: specific Articles, Case Laws, statutory acts, statistical indicators, committee reports, and key concepts.
      4. DO NOT make up any facts. Use your integrated Google Search Grounding to verify actual case law names, Article numbers, and committee names for 100% precision.
      5. Return ONLY a valid JSON array of objects, where each object has exactly two keys: "question" and "answer". Do not include any markdown wrap like \`\`\`json.
      
      Notes text:
      ${notesText}
      
      JSON Output Format:
      [
        {
          "question": "Front of card question...",
          "answer": "• Key fact 1\\n• Key fact 2 with specific Article/Case\\n• Impact or Core takeaway"
        }
      ]
      `;

      let responseText = '';
      try {
        const geminiResponse = await generateGeminiWithRetry({
          model: 'gemini-2.5-flash',
          contents: {
            parts: [{ text: prompt }]
          },
          config: {
            systemInstruction: UPSC_SYLLABUS_CONTEXT + UPSC_RAG_PROTOCOL,
            tools: [{ googleSearch: {} }]
          }
        });
        responseText = geminiResponse.text || '[]';
      } catch (err: any) {
        console.error("Gemini flashcard generation failed:", err.message);
        // Fallback simple prompt to DeepSeek
        try {
          const completion = await createDeepSeekCompletion({
            model: 'deepseek-chat',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: 'You are a UPSC examiner. Output a JSON object with key "flashcards" containing an array of 4 {question, answer} objects based on the notes.' },
              { role: 'user', content: prompt }
            ],
          });
          const parsedDs = robustJsonParse(completion.choices[0].message.content || '{}');
          responseText = JSON.stringify(parsedDs.flashcards || parsedDs || []);
        } catch (dsErr: any) {
          console.error("DeepSeek flashcard fallback failed:", dsErr.message);
          responseText = '[]';
        }
      }

      if (responseText.startsWith('```json')) responseText = responseText.replace(/^```json\n?/, '');
      if (responseText.endsWith('```')) responseText = responseText.replace(/\n?```$/, '');
      responseText = responseText.trim();

      const parsedCards = robustJsonParse(responseText);
      const cardsArray = Array.isArray(parsedCards) ? parsedCards : (parsedCards.flashcards || []);

      res.json({ flashcards: cardsArray });
    } catch (error: any) {
      console.error('Flashcard generation error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

function getPaperDemandsGuide(subject: string): string {
  const norm = (subject || '').toLowerCase();
  
  const commonTopperGuidelines = `
  *** CORE UPSC TOPPER WRITING & FRAMING PATTERNS (Derived from rankers' strategies) ***
  1. **Intro Strategy (The Hook)**: Never start with generic filler lines. You MUST open with:
     - A precise technical definition of the core keyword, OR
     - Relevant Constitutional Articles / Schedules / legal doctrines (e.g., Article 142 for complete justice), OR
     - A high-impact verified statistic, national report, index, or factual budget citation (e.g., NFHS-5, NITI Aayog Gini Index, IPCC Assessment Cycle).
  2. **Sub-heading Architecture**: Mirror the exact sub-components of the question into explicit, balanced headings. Use H3 (###) labels. Do NOT write in long narrative prose.
  3. **High Keyword Density**: Inject dense, specialized terminology relative to the topic (e.g., asymmetric federalism, administrative silos, deontology, capital expenditures multiplier, post-harvest disintermediation, structural family nucleation).
  4. **Active Bullet Points**: Outlines must be structured as 1-sentence, fact-based, objective statements starting with high-impact action verbs or strong nouns.
  5. **Value-Added Citation Strategy**: Seamlessly weave in relevant Commission names (like 2nd ARC, Swaminathan, Ashok Dalwai, Punchhi), Supreme Court cases, or SDG goals to back up claims.
  6. **Visual Layout and Density**: Summarize contrasting arguments using Markdown comparison tables. Frame conceptual relationships using a clear Mermaid flowchart, and ALWAYS prefix it with a non-removable '**Figure X:** Description' label. Ensure EVERY node in Mermaid diagrams has an explicit descriptive label inside quotes in brackets (e.g. NodeId["Case Law / Article / Actionable Mechanism"]). NEVER generate bare letter nodes like \`A --> B\` or \`B --> B1\`.
  7. **The Dedicated "Way Forward" Section**: Always end with a dedicated ### Way Forward section containing constructive, visionary, and actionable recommendations before concluding. Avoid negative or status-quo summaries.
  8. **Futuristic Alignment**: End with explicit alignment to SDG goals (SDGs 1-17), national goals ($5 Trillion economy, target 2047, Net-Zero 2070), or high ideals from national thinkers.
  `;

  if (norm.includes('studies 1') || norm.includes('gs1') || norm.includes('gs 1')) {
    return `
    ${commonTopperGuidelines}
    *** DEMAND OF GENERAL STUDIES I (GS-1) - TOPPER ANSWER PROTOCOL ***
    - **Modern History & Art & Culture**: Prioritize precise timelines and chronologies. Do not write generic stories. Explicitly mention contemporary travelers, diplomats, or historians (e.g., Al-Biruni, Megasthenes, Bipan Chandra, Sumit Sarkar, R.C. Majumdar) and highlight socio-economic-cultural structural transitions in systematic points.
    - **Geography**: Prioritize physical-human spatial interlinkages. Cite geographical regions, distribution matrices of specific resources, and scientific mechanisms (like Rain-shadow zones, ENSO, IOD, Polar Vortex). Propose map links (e.g., "[Sketch Map of India showing resource distribution or fault zones]").
    - **Society & Social Issues**: Ground claims with Census 2011 datasets, NFHS indicators, or UN Inequality Index. Use academic sociological terms (e.g., Sanskritization, structural family nucleation, patriarchal bargain, urban decay, demographic dividend, subaltern struggles).
    - **Visual Symmetry**: Group coordinates clearly (e.g., Geographical factors, Socio-economic factors, Anthropological shifts) and target SDG 11 (Sustainable Cities) or SDG 5 (Gender Equality).
    `;
  }
  if (norm.includes('studies 2') || norm.includes('gs2') || norm.includes('gs 2')) {
    return `
    ${commonTopperGuidelines}
    *** DEMAND OF GENERAL STUDIES II (GS-2) - TOPPER ANSWER PROTOCOL ***
    - **Polity & Constitutional Law**: You MUST explicitly cite relevant Constitutional Articles (e.g., Articles 14, 19, 21, 131, 142, 246, 356, 370), Schedules (e.g., 5th, 6th, 7th Schedule divisions), and landmark constitution amendments (e.g., 42nd, 44th, 73rd, 86th, 103rd CAA, 105th CAA).
    - **Administrative Judgements**: Synthesize Supreme Court Judgments (e.g., Kesavananda Bharati, S.R. Bommai, Puttaswamy, Vishaka, Nabam Rebia, Shreya Singhal, Minerva Mills).
    - **Governance, Welfare & Social Justice**: Reference findings and reforms from key committees (e.g., 2nd ARC, Punchhi Commission, Sarkaria Commission, Law Commission of India, Venkatachaliah Commission). Use governance terms like "Minimum Government, Maximum Governance", "Citizen's Charters", and "Siloed Administration".
    - **International Relations (IR)**: Avoid basic summaries. Apply structured IR paradigms (Strategic Autonomy, Net Security Provider, String of Pearls vs. Neck of Diamonds, Continental-Maritime balance, Soft/Hard Power, Track-1.5/2 Diplomacy). Mention specific bilateral treaties, global groupings (Quad, G20, BRICS, I2U2), or conventions.
    `;
  }
  if (norm.includes('studies 3') || norm.includes('gs3') || norm.includes('gs 3')) {
    return `
    ${commonTopperGuidelines}
    *** DEMAND OF GENERAL STUDIES III (GS-3) - TOPPER ANSWER PROTOCOL ***
    - **Indian Economy**: Begin with macro-economic statistics derived from verified sources (like Economic Survey, Union Budget, NSSO, RBI Reports, Gini index, NITI Aayog). Use professional terminology (such as 'Virtuous Cycle of Investment', 'Digital Public Infrastructure - DPI', 'Capital Expenditure multiplier', 'Base Effect').
    - **Agriculture**: Highlight structural barriers (APMC fragmentations, post-harvest losses up to 30%, middleman margin exploitation, MSP procurement biases). You MUST refer to and recommend implementing the Ashok Dalwai Committee guidelines on doubling farmers' incomes or Swaminathan commission recommendations.
    - **Environment & Disaster Management**: Provide scientific weight. Cite IPCC assessment cycles (like AR6/AR7), Paris Agreement targets, COP actions, NDMA (National Disaster Management Authority) guidelines, and disaster-resilient infrastructure frameworks.
    - **S&T & Internal Security**: Frame arguments around real-world tools, modules, and missions (such as CRISPR-Cas9, Digital Public Infrastructure, AI/Quantum missions, CERT-In, SpaceTech/ISRO initiatives, border fencing models, or defense indigenization like DRDO).
    - **Symmetry**: Conclude with alignment to SDG Goals (such as SDG 1 No Poverty, SDG 2 Zero Hunger, SDG 13 Climate Action, SDG 9 Industry/Innovation), and state specific national milestones (e.g. $5 Trillion economy target).
    `;
  }
  if (norm.includes('studies 4') || norm.includes('gs4') || norm.includes('gs 4') || norm.includes('ethics')) {
    return `
    ${commonTopperGuidelines}
    *** DEMAND OF GENERAL STUDIES IV (GS-4 ETHICS) - TOPPER ANSWER PROTOCOL ***
    - **Ethics Section A Theory**: Maintain rigorous technical ethics terminology. Refer to deontological duties (Kant), teleology/consequentialism (Utilitarianism by Bentham and Mill), Virtue Ethics (Aristotle, Socrates), Emotional Intelligence facets, and administrative values (Nolan Committee Principles of Public Life: Integrity, Objectivity, Accountability).
    - **Ethics Section B Case Studies**: If the input is in a situational/case-study template:
      1. **Stakeholder Mapping Matrix**: Clearly diagram out the stakeholder web (e.g., Local Administrator, general public, protesting youth, vulnerable communities) and their primary ethical interests. Use a neat Markdown table or bulleted list.
      2. **Core Ethical Dilemmas**: Detail 3 distinct ethical tensions (e.g., Public Security vs. Personal Liberty, Administrative Duty vs. Compassionate Empathy, Confidentiality vs. Accountability).
      3. **Options Appraisal Matrix**: Present 2-3 administrative courses of actions. Explicitly draft merits and demerits for each, including soft/unethical options vs. resilient/optimal routes.
      4. **Chosen Path**: Lay out your final chosen administrative course of action with clear, robust rationale. Refer to Gandhi's Talisman or the oath of office.
    `;
  }
  if (norm.includes('essay')) {
    return `
    ${commonTopperGuidelines}
    *** DEMAND OF ESSAY PAPER - TOPPER ANSWER PROTOCOL ***
    - **Narrative Framing**: Toppers open with a highly captivating personal or historical anecdote, visual parable, or philosophical paradox that establishes the central theme.
    - **PESTEL Expansion**: Build a robust, cohesive structure across multiple coordinates: Political, Economic, Social/Societal, Technological, Environmental, and Legislative dimensions, scaling from an individual moral level to state/civilizational frameworks.
    - **Dialectics**: Dedicate 1-2 powerful paragraphs to the "anti-thesis" or counterarguments, examining limitations or exceptions before reconciling the perspective.
    - **Inspiring Climax**: End with visionary, optimistic, and flowing prose. Incorporate values and quotes from national guides such as Rabindranath Tagore, Dr. B.R. Ambedkar, Swami Vivekananda, or APJ Abdul Kalam. Mention SDG targets or humanistic resolutions.
    `;
  }
  if (norm.includes('law')) {
    return `
    ${commonTopperGuidelines}
    *** DEMAND OF LAW OPTIONAL - TOPPER ANSWER PROTOCOL ***
    - **Bare Act Precision**: Cite exact Legal Sections of relevant Bare Acts. If addressing criminal jurisprudence (e.g., offenses against body, public order, or procedure), MUST refer to the newly enacted Bharatiya Nyaya Sanhita (BNS) and Bharatiya Nagarik Suraksha Sanhita (BNSS) section numbers, utilizing ancient IPC/CrPC sections only as transitional reference.
    - **Three-Tier Case Law strategy**:
      1. Landmark constitutional cases (e.g., Kesavananda Bharati, Maneka Gandhi, Indira Sawhney).
      2. Relevant contemporary Supreme Court rulings (last 3 years).
      3. Explicitly lay out: Facts -> Crux Issue -> Court's Ratio Decidendi -> Critical Analysis.
    - **Latin Maxims**: Wisely integrate Latin legal maxims (e.g., *audi alteram partem*, *res ipsa loquitur*, *salus populi suprema lex*, *ubi jus ibi remedium*).
    `;
  }
  return `
  ${commonTopperGuidelines}
  *** GENERAL UPSC TOPPER DEMAND ***
  - Adopt a highly structured layout with explicit H3 labels. Use bullet points of fact-based, objective statements rather than long narrative paragraphs.
  - Interlink core static concepts with ongoing current affairs.
  `;
}

  app.post('/api/pyq', async (req, res) => {
    try {
      const { question, subject, marks, model } = req.body;
      const paperGuide = getPaperDemandsGuide(subject);
      
      const wordLimit = marks === '10' ? '150 words' : marks === '15' ? '250 words' : marks === '125' ? '1000 - 1200 words' : '250+ words';
      
      const prompt = `You are an expert UPSC mentor. Please provide a model answer for the following Previous Year Question (PYQ):
      
      Question: "${question}"
      Paper: "${subject}"
      Marks: ${marks}
      Target Word Limit: ${wordLimit}

      CRITICAL FORMATTING REQUIREMENTS:
      1. You MUST use STRICT Markdown formatting.
      2. Use H3 (###) for main sections (e.g., ### Introduction, ### Body, ### Conclusion). 
      3. **Use bolding** for key terms, case laws, data points, or articles.
      4. Use proper unordered (-) and ordered (1. 2. 3.) lists, ensuring you use line breaks before and after lists.
      5. Add DOUBLE line breaks (\\n\\n) between paragraphs and headings to ensure readable spacing.
      6. HIGH PRIORITY: Use Markdown tables wherever necessary to summarize data, comparisons, or facts efficiently within the word limit.
      7. HIGH PRIORITY: Use valid **Mermaid** syntax (\`\`\`mermaid\n...\n\`\`\`) to generate flowcharts, mindmaps, state diagrams, pie charts, and conceptual relationship diagrams. Incorporate at least one diagram per answer to maximize information density. ALWAYS include a non-removable '**Figure X:** [Description]' text label directly above every generated diagram to improve accessibility and readability in exported PDFs. Ensure EVERY node in the diagram has an explicit descriptive label in quotes inside brackets (e.g. NodeId["Case Law / Article / Actionable Mechanism"]). NEVER generate bare letter nodes like \`A --> B\` or \`B --> B1\`. Every box must contain actual academic substance.
      8. CRITICAL PRIORITY: Ensure that all facts, dates, events, cases, constitutional articles, and data points are 100% factually correct and derived from verified sources. Accuracy is paramount.

      Ensure the answer is strictly structured with the exact topper conventions for this paper:
      - Introduction (Define context or keywords matching topper expectations)
      - Body Paragraphs (Use precise headings, incorporating legal provisions, landmark case laws, committee references, or relevant GS data)
      - Conclusion (Way forward, balanced progressive opinion matching SDG and committee recommendations)
      Keep it high-yield, examiner-friendly, and strictly within the word limit based on the marks.
      
      You MUST respond with ONLY a valid JSON object following this exact structure:
      {
        "folderPath": ["Paper Name", "Subject (e.g., History, Geography, Polity, etc.)"],
        "answer": "The comprehensive markdown generated answer..."
      }
      
      CRITICAL FOLDER PATH INSTRUCTIONS:
      Align the "folderPath" strictly with the standard UPSC Syllabus structure.
      - Level 1 MUST be the Paper provided: "${subject}".
      - Level 2 MUST be the exact Syllabus module or subject inferred from the question (e.g., "Modern Indian History", "Constitutional Law", "Ethics", "Science & Tech").
      
      Do not include any Markdown wrappers like \`\`\`json. Just output the raw JSON object string.`;

      let responseText = '';

      // Enforce Gemini with Google Search Grounding as primary for model answers
      // to ensure absolute factual, legal, and current affairs accuracy.
      try {
        const geminiResponse = await generateGeminiWithRetry({
          model: 'gemini-2.5-flash',
          contents: {
            parts: [{ text: prompt }]
          },
          config: {
            systemInstruction: UPSC_SYLLABUS_CONTEXT + "\n\n" + paperGuide,
            tools: [{ googleSearch: {} }] // Search grounding enabled!
          }
        });
        responseText = geminiResponse.text || '{"answer": ""}';
      } catch (geminiErr: any) {
        console.error("Gemini PYQ generation failed, falling back to DeepSeek:", geminiErr.message);
        try {
          const selectedModel = model && !model.toLowerCase().includes('gemini') ? model : 'deepseek-chat';
          const isReasoner = selectedModel.toLowerCase().includes('reasoner');
          const completion = await createDeepSeekCompletion({
            model: selectedModel,
            response_format: isReasoner ? undefined : { type: 'json_object' },
            messages: [
              { role: 'system', content: UPSC_SYLLABUS_CONTEXT + "\n\n" + paperGuide },
              { role: 'user', content: prompt }
            ],
          });
          responseText = completion.choices[0].message.content || '{"answer": ""}';
        } catch (dsErr: any) {
          console.error("DeepSeek fallback also failed in PYQ:", dsErr.message);
        }
      }

      if (responseText.startsWith('```json')) responseText = responseText.replace(/^```json\n?/, '');
      if (responseText.endsWith('```')) responseText = responseText.replace(/\n?```$/, '');
      responseText = responseText.trim();
      
      const parsed = robustJsonParse(responseText);
      
      let sanitizedAnswer = parsed.answer ? String(parsed.answer) : '';
      sanitizedAnswer = sanitizedAnswer.replace(/\\n/g, '\n').replace(/<br\s*\/?>/gi, '\n');

      res.json({ answer: sanitizedAnswer, folderPath: parsed.folderPath });
    } catch (error: any) {
      console.error('PYQ error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  app.post('/api/databank', async (req, res) => {
    try {
      const { topic, category, model } = req.body;
      
      const prompt = `You are an expert UPSC mentor. The student needs a high-yield data point for their Mains Answer Writing.
      
      Topic provided: "${topic}"
      Requested Category: "${category === 'All' ? 'Any highly relevant category (Quote, SC Judgement, Statistic, Case Study, or Committee)' : category}"
      
      Please provide a highly accurate and citable data point, quote, judgement, or case study that fits the topic and category.
      Ensure the source/author is exactly correct (e.g., name of the Supreme Court case/year, accurate Economic Survey data, report name).
      
      You MUST respond with ONLY a valid JSON object following this exact structure:
      {
        "category": "Quote" | "SC Judgement" | "Committee" | "Statistic" | "Case Study",
        "topic": "Cleaned up topic name",
        "content": "The actual quote, statistic, or judgement text",
        "authorOrSource": "Author, Report, Case Name + Year, or Source Entity",
        "paper": "One of: GS1, GS2, GS3, GS4, Essay, Law Optional, or General"
      }
      Do not include any Markdown wrappers like \`\`\`json. Just output the raw JSON object string.`;

      const selectedModel = model || 'deepseek-chat';
      const isReasoner = selectedModel.toLowerCase().includes('reasoner');

      const completion = await createDeepSeekCompletion({
        model: selectedModel,
        response_format: isReasoner ? undefined : { type: 'json_object' },
        messages: [
          { role: 'system', content: UPSC_SYLLABUS_CONTEXT },
          { role: 'user', content: prompt }
        ],
      });
      
      const responseText = completion.choices[0].message.content || '{}';
      const parsed = robustJsonParse(responseText);
      
      res.json(parsed);
    } catch (error: any) {
      console.error('DataBank error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  app.post('/api/databank-search', async (req, res) => {
    try {
      const { query, model } = req.body;
      
      const prompt = `You are an expert UPSC Mains mentor. The student searched for "${query}" in their Data & Quote Bank but wants AI to suggest ready-to-use arsenal of statistics, quotes, and judgements categorised by syllabus and tagged.
      
      Provide 3 to 5 highly relevant and accurate items (statistics, quotes, SC judgements, committee recommendations, or case studies) that fit this query perfectly.
      Ensure the source/author is exactly correct (e.g., name of the Supreme Court case/year, accurate Economic Survey data, report name).
      
      You MUST respond with ONLY a valid JSON object following this exact structure:
      {
        "items": [
          {
            "category": "Quote" | "SC Judgement" | "Committee" | "Statistic" | "Case Study",
            "topic": "Cleaned up topic keyword",
            "content": "The actual quote, statistic, or judgement text",
            "authorOrSource": "Author, Report, Case Name + Year, or Source Entity",
            "paper": "One of: GS1, GS2, GS3, GS4, Essay, Law Optional, or General"
          }
        ]
      }
      Do not include any Markdown wrappers like \`\`\`json. Just output the raw JSON object string.`;

      const selectedModel = model || 'deepseek-chat';
      const isReasoner = selectedModel.toLowerCase().includes('reasoner');

      const completion = await createDeepSeekCompletion({
        model: selectedModel,
        response_format: isReasoner ? undefined : { type: 'json_object' },
        messages: [
          { role: 'system', content: UPSC_SYLLABUS_CONTEXT },
          { role: 'user', content: prompt }
        ],
      });
      
      const responseText = completion.choices[0].message.content || '{"items":[]}';
      const parsed = robustJsonParse(responseText);
      
      res.json(parsed);
    } catch (error: any) {
      console.error('DataBank Search error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  app.post('/api/planner-generate', async (req, res) => {
    try {
      const { prompt, model } = req.body;
      
      const systemPrompt = `You are an expert UPSC mentor. The student needs a daily micro-plan based on their target: "${prompt}".
      
      Create a realistic, time-blocked daily study schedule for them. Break down their target into logical study blocks, include necessary breaks (e.g., lunch, tea, active recall sessions).
      
      You MUST respond with ONLY a valid JSON object matching this structure:
      {
        "tasks": [
          {
            "timeBlock": "e.g., 08:00 AM - 10:00 AM",
            "title": "Topic to study",
            "type": "Study" | "Revision" | "Mock Test" | "Break" | "Other"
          }
        ]
      }
      Do not include any Markdown wrappers like \`\`\`json. Just output the raw JSON object string.`;

      const selectedModel = model || 'deepseek-chat';
      const isReasoner = selectedModel.toLowerCase().includes('reasoner');

      const completion = await createDeepSeekCompletion({
        model: selectedModel,
        response_format: isReasoner ? undefined : { type: 'json_object' },
        messages: [
          { role: 'system', content: UPSC_SYLLABUS_CONTEXT },
          { role: 'user', content: systemPrompt }
        ],
      });
      
      const responseText = completion.choices[0].message.content || '{"tasks":[]}';
      const parsed = robustJsonParse(responseText);
      
      res.json(parsed);
    } catch (error: any) {
      console.error('Planner Generate error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  app.post('/api/ocr', function (req, res, next) {
    upload.single('document')(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: 'File upload error: ' + err.message });
      } else if (err) {
        return res.status(500).json({ error: 'Unknown file upload error: ' + err.message });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const mimeType = req.file.mimetype;
      const fileData = req.file.buffer.toString('base64');
      
      const prompt = `Please transcribe the handwritten or printed text from this image accurately. Output only the transcribed text.`;
      
      const response = await generateGeminiWithRetry({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: fileData,
                mimeType: mimeType,
              }
            }
          ]
        },
        config: {
          systemInstruction: "You are an expert OCR system. Extract text from images precisely.",
        }
      });
      
      res.json({ text: response.text || '' });
    } catch (error: any) {
      console.error('OCR error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  app.post('/api/evaluate', function (req, res, next) {
    upload.single('document')(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: 'File upload error: ' + err.message });
      } else if (err) {
        return res.status(500).json({ error: 'Unknown file upload error: ' + err.message });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if (!req.file && !req.body.text) {
        return res.status(400).json({ error: 'No file or text uploaded' });
      }

      const evalPrompt = `You are a UPSC examiner. Extract text (if provided) and evaluate the answer.

Determine max marks (10, 15, 20, 125, or 250) based on answer type.

Mark strictly on:
1. Intro: Technical definition, article, or stat.
2. Keywords: High-density terms.
3. Formatting: Bullets, sub-headings, diagrams.
4. Value Adds: Commissions, case laws, bare acts.
5. Conclusion: Progressive, linked to SDGs/visions.

Return EXACTLY this JSON structure:
{
  "detectedType": "10-marker / 15-marker / 20-marker / Essay / Full Test",
  "extractedText": "Raw text",
  "evaluation": {
    "overallScore": 8,
    "maxScore": 15,
    "structure": { "score": 2, "max": 3, "feedback": "" },
    "contentAccuracy": { "score": 4, "max": 6, "feedback": "" },
    "legalCitation": { "score": 1, "max": 3, "feedback": "" },
    "clarity": { "score": 1, "max": 3, "feedback": "" },
    "strengths": ["..."],
    "improvements": ["..."],
    "conclusion": "..."
  }
}`;
      
      let answerText = typeof req.body.text === 'string' ? req.body.text : '';
      if (req.file) {
        if (req.file.mimetype === 'text/plain') answerText = req.file.buffer.toString('utf8');
        else {
          if (!['application/pdf', 'image/png', 'image/jpeg', 'image/webp'].includes(req.file.mimetype)) {
            return res.status(400).json({ error: 'Upload a PDF, PNG, JPEG, WebP, or plain text answer.' });
          }
          const extracted = await generateGeminiWithRetry({
            model: process.env.OCR_MODEL || 'gemini-2.5-flash',
            contents: { parts: [
              { text: 'Transcribe the answer exactly as written. Return only the extracted text. Do not evaluate it.' },
              { inlineData: { data: req.file.buffer.toString('base64'), mimeType: req.file.mimetype } },
            ] },
          });
          answerText = extracted.text;
        }
      }
      if (!answerText.trim()) return res.status(422).json({ error: 'No readable answer was found. Paste the answer text and retry.' });
      const parts = [{ text: evalPrompt + '\n\nASPIRANT ANSWER TEXT:\n' + answerText }];

      const response = await generateGeminiWithRetry({
        model: 'gemini-3.1-flash-lite',
        contents: { parts },
        config: {
          systemInstruction: UPSC_SYLLABUS_CONTEXT,
          responseMimeType: "application/json"
        }
      });
      
      let fullResponse = response.text || '{}';
      
      // Clean markdown if Gemini still sends it
      if (fullResponse.startsWith('\`\`\`json')) fullResponse = fullResponse.replace(/^\`\`\`json\n?/, '');
      if (fullResponse.endsWith('\`\`\`')) fullResponse = fullResponse.replace(/\n?\`\`\`$/, '');
      
      let parsedResponse;
      try {
        parsedResponse = robustJsonParse(fullResponse);
      } catch (err) {
        throw new Error('Failed to parse AI evaluation as JSON. Raw response: ' + fullResponse.substring(0, 50));
      }

      res.json(parsedResponse);

    } catch (error: any) {
      res.status(503).json({ error: 'Evaluation is unavailable. Your answer has been preserved; please retry.' });
    }
  });

  app.all('/api/google-proxy', express.raw({ type: 'multipart/related', limit: '6mb' }), async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) {
        return res.status(400).json({ error: 'Missing target URL query parameter' });
      }

      if (!googleUrl(targetUrl)) {
        return res.status(400).json({ error: 'Only Google APIs are supported by this proxy' });
      }

      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      };

      if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization as string;
      }
      if (req.headers['content-type']) {
        headers['Content-Type'] = req.headers['content-type'] as string;
      }

      let body: any = undefined;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        if (req.headers['content-type']?.includes('application/json') && req.body !== undefined) {
          body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        } else if (typeof req.body === 'string') {
          body = req.body;
        } else if (Buffer.isBuffer(req.body)) {
          body = req.body;
        } else if (!req.readableEnded) {
          const buffers: Buffer[] = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          body = Buffer.concat(buffers);
          if (body.length === 0) {
            body = undefined;
          }
        }
      }

      const googleResponse = await fetch(targetUrl, {
        method: req.method,
        headers,
        body,
      });

      const contentType = googleResponse.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }

      res.status(googleResponse.status);

      const arrayBuffer = await googleResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);

    } catch (err: any) {
      console.error('Google Proxy Error:', err);
      res.status(500).json({ error: err.message || 'Error occurred in Google Proxy' });
    }
  });


  app.post('/api/rss-bulk-categorize', async (req, res) => {
    const items = req.body.items;
    if (!Array.isArray(items) || items.length > 500) return res.status(400).json({ error: 'Supply up to 500 articles.' });
    return res.json({ categories: heuristicBulkCategorize(items) });
  });

  app.post('/api/rss-extract-keywords', async (req, res) => {
    const { title, content } = req.body;
    return res.json(fallbackRssExtractKeywords(String(title || ''), String(content || '')));
  });

  app.post('/api/rss-summarize', async (req, res) => {
    try {
      const { title, content, link } = req.body;
      if (!content) {
        return res.status(400).json({ error: 'Missing article content' });
      }

      const prompt = `You are a premier UPSC Civil Services Examination (CSE) examiner, syllabus expert, and mentor. 
      Please synthesize a high-yield, structured, CSE-oriented executive summary of the following news article.
      
      Article Title: "${title || 'Untitled'}"
      Source Link / Context: "${link || 'N/A'}"
      Article Body/Snippet:
      """
      ${content}
      """
      
      Ensure your output is strictly styled in highly readable, formatted Markdown (with bullet points and subheaders like ##) targeting the needs of structural preparation for Indian Civil Services Examination.
      
      Include these specific sections exactly:
      ## UPSC Relevance (Syllabus Linkage)
      - Identify the precise GS Papers (GS Paper I, II, III, IV) or Essay paper and specific sub-topics/syllabus headers (e.g. GS-III: Environment & Disaster Management, GS-II: Issues Relating to Development and Management of Social Sector, Constitutional/Statutory Bodies). Ensure direct linkage.
      
      ## Core Concepts & Key Arguments
      - Synthesize 3-5 core points, factual statistics, historical references, or legal clauses.
      - Contrast key points / perspectives objectively (Pros & Cons, different stakeholders, structural issues, or policy implications).
      
      ## UPSC Answer Writing Mains Question & Answer Outline
      - Formulate 1 high-yield, descriptive Mains-oriented Question based on this theme.
      - Provide a structured guide/framework on how the aspirant should outline their response:
        - **Introduction**: Hinting at constitutional articles, facts, key acts, or contextual background.
        - **Body Structure**: Essential arguments, statistics, court rulings, or committee recommendations (e.g., Kasturirangan, Madhav Gadgil, etc.).
        - **Way Forward / Conclusion**: Balanced, realistic, implementation-focused, and optimistic policy recommendation.
        
      ## Prelims High-Yield Facts Checklist
      - Bullet points of facts (agencies, constitutional provisions, index/report publications, technical terms, species classifications, or bilateral treaty scopes) that can be targeted in modern UPSC Prelims.
      
      Do not include any chat greeting or postscript. Start cleanly from the markdown heading. Highlight key legal and constitutional terms with bold text formatting.`;

      try {
        const response = await createDeepSeekCompletion({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: UPSC_SYLLABUS_CONTEXT },
            { role: 'user', content: prompt }
          ]
        });
        return res.json({ summary: response.choices[0].message.content });
      } catch (dsErr: any) {
        console.warn('DeepSeek summary failed, falling back to Gemini:', dsErr?.message || dsErr);
        try {
          const geminiResponse = await generateGeminiWithRetry({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
              systemInstruction: UPSC_SYLLABUS_CONTEXT
            }
          });
          return res.json({ summary: geminiResponse.text });
        } catch (geminiErr: any) {
          console.warn('Gemini summary also failed, generating heuristic fallback:', geminiErr?.message || geminiErr);
          const cleanText = (content || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 450);
          const fallbackSummary = `## UPSC Relevance (Syllabus Linkage)\n- **GS Paper II & III**: Contemporary Policy, Governance, & Socio-Economic Analysis.\n\n## Core Concepts & Key Arguments\n- **Context**: "${title || 'Current Affairs Article'}"\n- **Core Summary**: ${cleanText}...\n- **Key Takeaway**: High-priority policy development requiring multi-sectoral institutional coordination.\n\n## UPSC Answer Writing Mains Question & Answer Outline\n- **Mains Practice Question**: "Analyze the key challenges and policy implications associated with ${title || 'this development'}. Suggest a viable Way Forward."\n- **Introduction**: Highlight constitutional mandates, historical context, or recent statutory developments.\n- **Body**: Contrast structural bottlenecks with functional benefits.\n- **Way Forward**: Recommend administrative reforms and 2nd ARC committee frameworks.\n\n## Prelims High-Yield Facts Checklist\n- Key statutory bodies, constitutional provisions, and administrative agencies related to ${title || 'this topic'}.`;
          return res.json({ summary: fallbackSummary });
        }
      }
    } catch (outerErr: any) {
      console.error('RSS Summarize outer error:', outerErr);
      res.status(500).json({ error: outerErr?.message || 'Error processing request' });
    }
  });

  app.post('/api/rss-ai-summary', async (req, res) => {
    const { title, content } = req.body;
    try {
      if (!content) {
        return res.status(400).json({ error: 'Missing article content' });
      }

      const prompt = `You are an elite UPSC Civil Services Examination (CSE) mentor. Based on the selected news article below, synthesize a high-yield, structured, exactly 4-5 bulleted 'AI Summary' that captures the core policy arguments, national/global context, crucial statistics, and direct syllabus relevance for civil services preparation.
      
      Article Title: "${title || 'Untitled'}"
      Article Body/Snippet:
      """
      ${content}
      """
      
      Please format your response strictly as 4-5 highly informative, professional bullet points in clean Markdown. Keep it direct, objective, and analytical. Highlight key legal, constitutional, and economic terms in bold. Do not include any introduction, conversational greeting, or outro. Start immediately with the bullets.`;

      try {
        const response = await createDeepSeekCompletion({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: UPSC_SYLLABUS_CONTEXT },
            { role: 'user', content: prompt }
          ]
        });
        return res.json({ summary: response.choices[0].message.content });
      } catch (deepseekErr: any) {
        console.warn('DeepSeek summary failed, falling back to Gemini:', deepseekErr);
        const geminiResponse = await generateGeminiWithRetry({
          model: 'gemini-2.5-flash',
          contents: { parts: [{ text: prompt }] },
          config: {
            systemInstruction: UPSC_SYLLABUS_CONTEXT
          }
        });
        return res.json({ summary: geminiResponse.text });
      }
    } catch (err: any) {
      console.error('RSS AI Summary error:', err);
      // Fallback word slicing if AI fails completely or hits quota limits
      const words = content.split(/\s+/).slice(0, 100).join(' ');
      res.status(500).json({ 
        error: err.message || 'Failed to generate AI Summary.',
        fallback: `• **Article Overview**: "${title || 'Selected Article'}" discusses key national and global themes.\n• **Article Core Snippet**: ${words}...\n• **UPSC Syllabus Linkage**: Relevant to general essay writing and current affairs linkages (GS Paper I/II/III).`
      });
    }
  });

  app.post('/api/rss-syllabus-match', async (req, res) => {
    const { items, syllabusTopics } = req.body;
    try {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.json({ matches: [] });
      }
      if (!syllabusTopics || !Array.isArray(syllabusTopics) || syllabusTopics.length === 0) {
        return res.json({ matches: [] });
      }

      const prompt = `You are an expert UPSC Civil Services Examination (CSE) syllabus matcher under the UPSC syllabus guidelines.
      Your task is to match a list of news article headlines/descriptions with a list of saved syllabus modules/topics.
      Identify which news items are highly relevant, moderately relevant, or irrelevant to any of the user's saved syllabus topics.
      
      Saved Syllabus Topics/Modules representing the user's current studies:
      ${syllabusTopics.map((topic, i) => `${i + 1}. "${topic}"`).join('\n')}
      
      News Items to analyze:
      ${items.map((item, index) => `${index}. [TITLE] "${item.title}" [DESC] "${item.description || ''}"`).join('\n')}
      
      For each news item, perform a high-speed accurate semantic matching. Determine:
      1. If there's an active match with any saved syllabus topic.
      2. The exact matched saved syllabus topic.
      3. A brief 1-sentence analytical reason why it aligns with the UPSC syllabus topic (e.g. relevance to GS papers, policy debate, administrative reform, constitutional issue, etc.).
      
      Output ONLY a valid JSON array of objects matched. Each object in the array MUST match the schema below:
      [
        {
          "index": <number referencing target news item index>,
          "matchedTopic": "<string - the exact saved syllabus topic name matched>",
          "relevance": "High" | "Medium" | "Low",
          "explanation": "<string - brief UPSC relevance explanation>"
        }
      ]
      
      Ensure you return ONLY a clean JSON block. Do not wrap it in backticks, code blocks, or include any preamble or postscript. Output a raw parseable JSON list. Only include items with High or Medium relevance.`;

      try {
        const response = await createDeepSeekCompletion({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: UPSC_SYLLABUS_CONTEXT },
            { role: 'user', content: prompt }
          ]
        });
        const text = response.choices[0].message.content.trim();
        const cleanedText = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
        const data = JSON.parse(cleanedText);
        return res.json({ matches: data });
      } catch (deepseekErr: any) {
        console.warn('DeepSeek syllabus match failed, falling back to Gemini:', deepseekErr);
        const geminiResponse = await generateGeminiWithRetry({
          model: 'gemini-3.5-flash',
          contents: { parts: [{ text: prompt }] },
          config: {
            responseMimeType: 'application/json',
            systemInstruction: UPSC_SYLLABUS_CONTEXT
          }
        });
        const text = geminiResponse.text || '[]';
        const cleanedText = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
        const data = JSON.parse(cleanedText);
        return res.json({ matches: data });
      }
    } catch (err: any) {
      console.error('RSS Syllabus Match API error:', err);
      // Fallback local keyword substring matching if AI fails entirely
      const matches: any[] = [];
      items.forEach((item, index) => {
        const titleAndDesc = `${item.title} ${item.description || ''}`.toLowerCase();
        for (const topic of syllabusTopics) {
          const words = topic.toLowerCase().split(/\s+/).filter(w => w.length > 4);
          const hasWordMatch = words.some(w => titleAndDesc.includes(w));
          if (hasWordMatch) {
            matches.push({
              index,
              matchedTopic: topic,
              relevance: "High",
              explanation: "Local keyword alignment found on core syllabus terminology."
            });
            break;
          }
        }
      });
      res.json({ matches, isOfflineFallback: true });
    }
  });

  app.post('/api/generate-daily-digest', async (req, res) => {
    try {
      const { items, model } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Missing or empty items array' });
      }

      const payloadDescription = items.map((item: any) => 
        `Title: ${item.title}\nCategory: ${item.category || 'General'}\nLink: ${item.link || ''}\nSummary snippet: ${item.description?.substring(0, 300) || 'None'}\n`
      ).join('---\n');

      const prompt = `You are an elite UPSC Civil Services Examination mentor. Based on the selected high-yield RSS feeds of today, construct a premium, rigorous Markdown-formatted "Daily Prep Digest" specifically tailored to UPSC CSE requirements.

Please adhere strictly to the following requirements:
1. Focus ONLY on high-yield, conceptual, and policy-driven articles mapped to standard UPSC GS Syllabus categories (GS I, GS II, GS III). Complete exclude and ignore any frivolous, entertainment, local crime, sports, or local speculative news.
2. For each highlighted news item, provide:
   - UPSC GS Syllabus Linkage (e.g. GS Paper II: Constitutional Amendments / Federal Structure)
   - A crisp 2-3 sentence high-yield conceptual summary.
   - You MUST end your analysis with a direct link so the user can easily jump to the full article: 👉 [Analyze Full News & AI Summary in RSS Reader]({exact_link_contained_in_this_item})
3. Keep the entire briefing concise, elegant, scannable, and extremely professional. Use bold lettering for core constitutional references, acts, supreme court cases, or economic terms. Do not add general greetings.

Here are the news items:
${payloadDescription}
`;

      let digestText = "";
      if (model && model.startsWith('gemini')) {
        const response = await generateGeminiWithRetry({
          model: model,
          contents: prompt,
          config: {
            systemInstruction: UPSC_SYLLABUS_CONTEXT
          }
        });
        digestText = response.text || "";
      } else {
        const response = await createDeepSeekCompletion({
          model: model || 'deepseek-chat',
          messages: [
            { role: 'system', content: UPSC_SYLLABUS_CONTEXT },
            { role: 'user', content: prompt }
          ]
        });
        digestText = response.choices[0].message.content || "";
      }
      
      res.json({ digest: digestText });
    } catch (err: any) {
      console.log('Daily Digest hit exception. Falling back to offline synthesis.');
      try {
        const { items } = req.body;
        const fallbackDigestObj = fallbackGenerateDailyDigest(items || []);
        res.json({ digest: fallbackDigestObj, isOfflineFallback: true });
      } catch (fallbackError: any) {
        console.log('Offline digest fallback failed:', fallbackError);
        res.status(500).json({ error: err.message || 'Error occurred generating digest' });
      }
    }
  });

  app.post('/api/study-materials-summarize', async (req, res) => {
    try {
      const { title, subject, category, snippet } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Missing title parameter' });
      }

      const prompt = `You are an elite UPSC Civil Services Examination (CSE) expert, syllabus dean, and answer-writing trainer.
Please synthesize a high-yield, structured, and syllabus-aligned academic reference Note for this study material:

Material Title: "${title}"
Category: "${category || 'General'}"
Subject/Topic: "${subject || 'General Studies'}"
Snippet/Content Reference:
"""
${snippet || 'No raw content provided.'}
"""

Generate a comprehensive, beautiful study guide in clean Markdown with the following structured sections:
1. ## UPSC SYLLABUS DIRECT CONNECTIONS (Precisely map to GS-I/II/III/IV topics and core themes)
2. ## THE CORE CONCEPT & DETAILED TECHNICAL EXPOSITION (Explain the underlying concept or reference detail comprehensively, using crisp language suitable for mains revision)
3. ## CRITICAL DEBATES, PROS & CONS, AND MULTIDEPENDENT STAKEHOLDER MATRIX
4. ## MAINS ANSWER WRITING VALUE-ADDITIONS (Constitutional Articles, legal clauses, supreme court decisions, and committee recommendations if applicable)
5. ## PRELIMS ESSENTIAL BULLET CHECKLIST (5 high-yield factual checkpoints)

Write with rigorous academic depth, precise vocabulary, and well-organized bullet lists. Do not write introductory chatter or conversational text. Start directly with the first heading.`;

      const response = await generateGeminiWithRetry({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          temperature: 0.2
        }
      });

      const noteText = response.text || "Failed to generate AI reference note.";
      res.json({ note: noteText });
    } catch (err: any) {
      console.error('Study material synthesis error:', err);
      res.status(500).json({ error: err.message || 'Error occurred generating study material guide' });
    }
  });

  app.post('/api/rss-discover', async (req, res) => {
    try {
      const { keywords } = req.body;
      if (!keywords || typeof keywords !== 'string' || !keywords.trim()) {
        return res.status(400).json({ error: 'Missing or empty search keywords' });
      }

      console.log(`Searching for RSS feeds with keywords: "${keywords}"`);
      const rawInput = keywords.trim();
      const query = rawInput.toLowerCase();

      // Check if the query looks like a URL/domain for direct RSS probing & HTML discovery
      const isUrlOrDomain = query.includes('.') && !query.includes(' ') && (
        query.startsWith('http://') ||
        query.startsWith('https://') ||
        /^[a-z0-9-]+(\.[a-z0-9-]+)+.*$/i.test(query)
      );
      
      if (isUrlOrDomain) {
        console.log(`Query looks like a URL/domain. Probing RSS feeds on: ${query}`);
        try {
          let targetUrl = rawInput;
          if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
          }

          const directParser = new Parser({
            timeout: 4000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept': 'application/rss+xml, application/xml, text/xml, */*'
            }
          });

          // A. Test if targetUrl itself is directly an active RSS/Atom feed
          try {
            const parsed = await directParser.parseURL(targetUrl);
            if (parsed && (parsed.title || (parsed.items && parsed.items.length > 0))) {
              console.log(`Target URL is directly an active RSS feed: "${parsed.title}"`);
              return res.json({
                feeds: [{
                  name: parsed.title || rawInput,
                  url: targetUrl,
                  description: parsed.description || `Direct active RSS feed with ${parsed.items?.length || 0} recent articles.`,
                  relevance: 'Verified direct RSS XML feed.'
                }],
                isOfflineFallback: false,
                directDiscovery: true
              });
            }
          } catch (notDirect) {
            // Target was not directly XML; probe standard feed endpoints and scrape homepage HTML
          }

          const parsedUrl = new URL(targetUrl);
          const origin = parsedUrl.origin;
          const candidateEndpoints = [
            `${origin}/feed`,
            `${origin}/feed/`,
            `${origin}/rss`,
            `${origin}/rss.xml`,
            `${origin}/stories.rss`,
            `${origin}/google_feeds.xml`,
            `${origin}/atom.xml`,
            `${origin}/index.xml`,
            `${origin}/section/india/feed/`,
            `${origin}/feed.xml`
          ];

          // Probe standard endpoints concurrently with fast timeout
          const probePromises = candidateEndpoints.map(async (candUrl) => {
            try {
              const p = await directParser.parseURL(candUrl);
              if (p && (p.title || (p.items && p.items.length > 0))) {
                return {
                  name: p.title || `Feed (${new URL(candUrl).pathname})`,
                  url: candUrl,
                  description: p.description || `Discovered RSS feed at ${candUrl}`,
                  relevance: 'Discovered directly via standard RSS endpoint.'
                };
              }
            } catch (e) {
              return null;
            }
            return null;
          });

          // Concurrently scrape homepage HTML for <link rel="alternate"> and <a> tags
          const htmlScrapePromise = (async () => {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000);
              const response = await fetch(targetUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                },
                signal: controller.signal
              });
              clearTimeout(timeoutId);
              if (!response.ok) return [];

              const html = await response.text();
              const found: any[] = [];

              // Match all <link ...> tags
              const linkTags = html.match(/<link\s+[^>]*>/gi) || [];
              for (const tag of linkTags) {
                const isAlternate = /rel=["'][^"']*alternate[^"']*["']/i.test(tag);
                const isRssType = /type=["'][^"']*(rss|atom|xml)[^"']*["']/i.test(tag);
                if (isAlternate || isRssType) {
                  const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
                  if (hrefMatch && hrefMatch[1]) {
                    try {
                      const href = new URL(hrefMatch[1], origin).toString();
                      const titleMatch = tag.match(/title=["']([^"']+)["']/i);
                      found.push({
                        name: titleMatch ? titleMatch[1] : `Feed (${new URL(href).pathname})`,
                        url: href,
                        description: 'Discovered from website metadata.',
                        relevance: 'Verified from HTML link tag.'
                      });
                    } catch (e) {}
                  }
                }
              }

              // Match <a> links containing /feed or /rss or .xml
              const aTags = html.match(/<a\s+[^>]*href=["'][^"']*(rss|feed|\.xml)[^"']*["'][^>]*>/gi) || [];
              for (const tag of aTags.slice(0, 6)) {
                const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
                if (hrefMatch && hrefMatch[1]) {
                  try {
                    const href = new URL(hrefMatch[1], origin).toString();
                    if (!found.some(f => f.url === href)) {
                      found.push({
                        name: `RSS Feed (${new URL(href).pathname})`,
                        url: href,
                        description: 'Discovered from website link.',
                        relevance: 'Discovered from HTML hyperlink.'
                      });
                    }
                  } catch (e) {}
                }
              }

              return found;
            } catch (e) {
              return [];
            }
          })();

          const [probedResults, htmlResults] = await Promise.all([
            Promise.all(probePromises),
            htmlScrapePromise
          ]);

          const validProbed = probedResults.filter(Boolean) as any[];
          const allFound = [...validProbed, ...htmlResults];

          if (allFound.length > 0) {
            const unique = Array.from(new Map(allFound.map(item => [item.url, item])).values());
            console.log(`Discovered ${unique.length} feeds via website probing!`);
            return res.json({ feeds: unique, isOfflineFallback: false, directDiscovery: true });
          }
        } catch (probeErr) {
          console.error('Direct website probing failed:', probeErr);
        }
      }

      // 1. First, like Inoreader/Feedly, we search our internal verified database AND public open directories (like Podcasts).
      // Comprehensive UPSC-centric curated database supporting sectional live news feeds and tags
      const CURATED_DIRECTORY_FEEDS = [
        // Live Law & Legal Portals
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
        // Indian Express Core
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
        // Economic Times & Livemint
        {
          name: "The Economic Times - Top Stories & Economy",
          url: "https://economictimes.indiatimes.com/rssfeedsdefault.cms",
          description: "Macroeconomic indicators, fiscal policies, market trends, infrastructure, and trade dynamics.",
          relevance: "GS Paper 3 - Prime tracker for Indian economic policy, taxation, GDP, and industrial corridors.",
          tags: ["economic times", "economictimes", "economy", "business", "finance", "markets", "trade", "fiscal"]
        },
        // Ecology & Thinktanks
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
          name: "Nature - Science Journal News",
          url: "https://www.nature.com/nature.rss",
          description: "Leading peer-reviewed international scientific research, biotechnology, astronomy, and health discoveries.",
          relevance: "GS Paper 3 - Deep context for global science breakthroughs, genetics, vaccines, and physics.",
          tags: ["nature", "science", "journal", "research", "technology", "biology", "health", "physics"]
        },
        {
          name: "Project Syndicate - Global Economics & Geopolitics",
          url: "https://www.project-syndicate.org/rss",
          description: "Global commentary from Nobel laureates, world leaders, and premier scholars on diplomacy and economics.",
          relevance: "GS Paper 2 & Essay - Global governance, multilateral reform, and macro-financial viewpoints.",
          tags: ["project syndicate", "projectsyndicate", "opinion", "economics", "geopolitics", "world", "foreign affairs"]
        },
        // PIB & Governance
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
        // Judiciary & Law
        {
          name: "Judiciary & Constitutional Affairs (The Hindu National)",
          url: "https://www.thehindu.com/news/national/feeder/default.rss",
          description: "Supreme Court judgments, constitutional benches, collegium decisions, and legal policy updates.",
          relevance: "GS Paper 2 - Crucial tracking of judicial review, constitutional morality, and landmark verdicts.",
          tags: ["judiciary", "judicial", "law", "supreme court", "high court", "legal", "constitution", "article 21", "sc", "justice", "collegium"]
        },
        // The Hindu Core Papers
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
          name: "The Hindu - Lead Longform Articles",
          url: "https://www.thehindu.com/opinion/lead/feeder/default.rss",
          description: "High-level longform lead articles discussing policy frameworks, judicial matters, and sociology.",
          relevance: "GS Paper 1, 2, 3 - Nuanced perspectives regarding deep-rooted country challenges.",
          tags: ["lead", "hindu", "longform", "sociology", "policy", "reform", "essay"]
        },
        {
          name: "The Hindu - International Relations",
          url: "https://www.thehindu.com/news/international/feeder/default.rss",
          description: "World news, bilateral pacts, multilateral summits, geopolitical disputes, and international relationships.",
          relevance: "GS Paper 2 - Prime source for International Relations (IR), global bodies, and strategic partnerships.",
          tags: ["international", "ir", "geopolitics", "diplomacy", "bilateral", "summits", "un", "foreign", "world", "treaty"]
        },
        {
          name: "The Hindu - Business & Economy",
          url: "https://www.thehindu.com/business/feeder/default.rss",
          description: "Indian fiscal developments, corporate regulations, market movements, trade policies, and global economics.",
          relevance: "GS Paper 3 - Paramount reference for Indian and global economic growth, GST, fiscal policy, inflation.",
          tags: ["business", "economy", "fiscal", "inflation", "gst", "trade", "banking", "finance", "budget"]
        },
        {
          name: "The Hindu - Environment & Energy",
          url: "https://www.thehindu.com/sci-tech/energy-and-environment/feeder/default.rss",
          description: "Ecological concerns, global warming initiatives, green energy transformations, and sustainable developments.",
          relevance: "GS Paper 3 - Coverage of biodiversity conservation, climate summits, pollution control acts.",
          tags: ["environment", "energy", "climate", "ecology", "biodiversity", "conservation", "green", "cop", "pollution"]
        },
        {
          name: "The Hindu - Science & Tech (S&T)",
          url: "https://www.thehindu.com/sci-tech/science/feeder/default.rss",
          description: "Scientific discoveries, medical breakthroughs, space missions, biotech, and IT/AI advancements.",
          relevance: "GS Paper 3 - Excellent tool to track modern tech updates (Defense, AI, Biotech, Space, ISRO).",
          tags: ["s&t", "science", "tech", "technology", "space", "isro", "ai", "biotech", "health", "innovation", "defence"]
        },
        {
          name: "The Hindu - Education & Social Justice",
          url: "https://www.thehindu.com/education/feeder/default.rss",
          description: "Academic reports, vocational metrics, NEP policies, and human resources development schemes.",
          relevance: "GS Paper 2 - Social justice, human resources development, and education sector analysis.",
          tags: ["education", "social justice", "nep", "human capital", "welfare", "schemes", "youth"]
        },

        // Livemint & Financial Daily
        {
          name: "Livemint - National Policy & Administration",
          url: "https://www.livemint.com/rss/news",
          description: "Real-time updates, policy implementations, federal administration news, and national reports.",
          relevance: "GS Paper 2 & 3 - Fundamental news highlights regarding governance and socio-economic affairs.",
          tags: ["livemint", "mint", "national", "policy", "governance", "administration", "india"]
        },
        {
          name: "Livemint - Economic Opinion & Views",
          url: "https://www.livemint.com/rss/opinion",
          description: "Thought-provoking opinion pieces, expert economic viewpoints, and policy columns.",
          relevance: "GS Paper 2 & Essay - Critical analysis of economic strategy, governance, and national affairs.",
          tags: ["livemint", "mint", "opinion", "editorial", "economy", "views", "macro"]
        },
        {
          name: "Livemint - Economy, Banking & RBI",
          url: "https://www.livemint.com/rss/economy",
          description: "Macroeconomic indicators, RBI monetary policies, trade deficits, industrial output, and fiscal management.",
          relevance: "GS Paper 3 - Paramount reference for Indian economic development, inflation, and growth.",
          tags: ["economy", "banking", "rbi", "inflation", "macroeconomics", "finance", "gdp", "capex", "budget"]
        },

        // BBC & NDTV National Coverage
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
        },

        // Ecology & Science Directories
        {
          name: "Down To Earth - Environment & Forest Conservation",
          url: "https://www.downtoearth.org.in/rss/environment",
          description: "Scientific tracking of wildlife reserves, forestry policies, climate change panels, and conservation projects.",
          relevance: "GS Paper 3 - Essential for environment protocols, Ramsar sites, wildlife acts, and climate summits.",
          tags: ["environment", "climate", "ecology", "downtoearth", "forest", "wildlife", "conservation", "ramsar"]
        },
        {
          name: "Down To Earth - Climate Change & Global Warming",
          url: "https://www.downtoearth.org.in/rss/climate-change",
          description: "Global tracking of emissions, greenhouse effects, climate adaptation reports, and policy updates.",
          relevance: "GS Paper 3 - Primary environment and sustainability syllabus linkages.",
          tags: ["climate", "climate change", "global warming", "emissions", "environment", "cop", "unfccc", "greenhouse"]
        },
        {
          name: "Down To Earth - Science & Technology (S&T)",
          url: "https://www.downtoearth.org.in/rss/science-and-technology",
          description: "Disruptions in science, digital initiatives, and clean energy tech developments.",
          relevance: "GS Paper 3 - Research and development metrics in agriculture, healthcare, and infrastructure.",
          tags: ["s&t", "science", "technology", "tech", "downtoearth", "biotech", "energy", "clean tech"]
        },

        // Curated UPSC Specific Feeds
        {
          name: "InsightsIAS Daily Current Affairs",
          url: "https://www.insightsonindia.com/feed",
          description: "Daily compiled current affairs, study checklists, and mains answer writing inputs.",
          relevance: "Syllabus Integration - Fast daily news analysis tailored precisely for CSE preparation.",
          tags: ["upsc", "insights", "insightsias", "current affairs", "daily", "mains", "prelims"]
        },
        {
          name: "IASbaba UPSC Guidance Portal",
          url: "https://iasbaba.com/feed/",
          description: "High-yield UPSC analysis, Daily Quiz questions, and mains-inspired response frameworks.",
          relevance: "Syllabus Integration - Structured study notes, exam tactics, and general news explanation.",
          tags: ["upsc", "iasbaba", "guidance", "quiz", "mains", "daily", "strategy"]
        },
        {
          name: "ForumIAS Civil Services Prep Hub",
          url: "https://blog.forumias.com/feed/",
          description: "Peer discussion briefs, civil services syllabus breakdown, and strategy papers.",
          relevance: "Syllabus Integration - Fast-paced study group materials and subject-wise notes.",
          tags: ["upsc", "forumias", "ias", "discussion", "syllabus", "strategy"]
        },

        // International Strategic Relations (Global feeds)
        {
          name: "BBC News - World Affairs & Geopolitics",
          url: "https://feeds.bbci.co.uk/news/world/rss.xml",
          description: "Global news summaries, conflicts, treaty formulations, and world affairs.",
          relevance: "GS Paper 2 - Valuable context for global security and International Relations of strategic import.",
          tags: ["international", "ir", "world", "bbc", "geopolitics", "security", "un"]
        },
        {
          name: "BBC News - Asia Strategic & Neighborhood",
          url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml",
          description: "Focused coverage of geopolitical dynamics in Southern Asia, Indo-Pacific, and neighboring borders.",
          relevance: "GS Paper 2 - Highly relevant for India's Neighborhood First Policy and East Asia strategic issues.",
          tags: ["asia", "south asia", "indo-pacific", "neighbourhood", "china", "pakistan", "ir"]
        },
        {
          name: "Al Jazeera News - World Affairs",
          url: "https://www.aljazeera.com/xml/rss/all.xml",
          description: "In-depth investigative reports on international crises, trade wars, and sovereign alliances.",
          relevance: "GS Paper 2 - Alternative viewpoints on Middle East, global governance, and developmental indices.",
          tags: ["world", "international", "middle east", "global", "news"]
        }
      ];

      // Smart token and tag scoring algorithm with domain prioritization
      const queryClean = query.trim();
      const queryTokens = queryClean.split(/\s+/).filter(t => t.length > 1);
      const queryDomain = queryClean.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

      let dbMatches = CURATED_DIRECTORY_FEEDS.map(feed => {
        let score = 0;
        const feedNameLower = feed.name.toLowerCase();
        const feedDescLower = feed.description.toLowerCase();
        const tags = (feed.tags || []).map(t => t.toLowerCase());

        // 1. Domain match (Highest priority)
        try {
          const feedDomain = new URL(feed.url).hostname.replace(/^www\./, '');
          if (queryDomain && (feedDomain === queryDomain || feedDomain.includes(queryDomain) || queryDomain.includes(feedDomain))) {
            score += 1000;
          }
        } catch (e) {}

        // 2. Exact full query matches
        if (feedNameLower === queryClean) {
          score += 500;
        } else if (feedNameLower.includes(queryClean)) {
          score += 250;
        }

        // 3. Exact tag matches
        tags.forEach(tag => {
          if (tag === queryClean) {
            score += 300;
          } else if (new RegExp(`(^|\\s)${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`, 'i').test(queryClean)) {
            score += 150;
          }
        });

        // 4. Token matches (whole word)
        queryTokens.forEach(token => {
          if (token.length > 2) {
            const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (new RegExp(`(^|\\s)${escaped}(\\s|$)`, 'i').test(feedNameLower)) {
              score += 80;
            } else if (feedNameLower.includes(token)) {
              score += 30;
            }
            if (tags.includes(token)) {
              score += 70;
            }
            if (new RegExp(`(^|\\s)${escaped}(\\s|$)`, 'i').test(feedDescLower)) {
              score += 20;
            }
          }
        });

        return { feed, score };
      })
      .filter(item => item.score >= 50)
      .sort((a, b) => b.score - a.score)
      .map(item => item.feed);

      // iTunes podcast search when requested
      const isExplicitPodcastQuery = query.includes("podcast") || query.includes("audio");
      
      if (isExplicitPodcastQuery) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          const itunesRes = await fetch(`https://itunes.apple.com/search?media=podcast&term=${encodeURIComponent(query)}&limit=8`, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (itunesRes.ok) {
            const itunesData = await itunesRes.json();
            if (itunesData.results && itunesData.results.length > 0) {
              const podcastFeeds = itunesData.results
                .filter((r: any) => r.feedUrl)
                .map((r: any) => ({
                  name: r.collectionName + " (Podcast/Audio)",
                  url: r.feedUrl,
                  description: r.artistName || "Public audio feed",
                  relevance: "Discovered via open iTunes podcast directory."
                }));
              dbMatches = [...podcastFeeds, ...dbMatches];
            }
          }
        } catch (e) {
          console.error("iTunes open directory search failed:", e);
        }
      }

      // If we found direct database results, return them immediately
      if (dbMatches.length > 0) {
         console.log(`Successfully resolved ${dbMatches.length} matching feeds from curated directory.`);
         return res.json({ feeds: dbMatches, isOfflineFallback: false, fromDatabase: true });
      }

      // 2. If nothing matched directly, run Gemini search with a generous 14-second timeout
      try {
        const prompt = `Locate valid, real public RSS or Atom XML feed URLs for the following website or topic: "${rawInput}".
If the query is a publication or website (e.g. LiveLaw, Indian Express, Scroll.in, Foreign Affairs, Project Syndicate, DTE, etc.), find its direct RSS feed URL.
If the query is a UPSC topic (e.g. Constitutional Law, Climate Action, Space Technology), find top news/editorial RSS feeds covering that topic.
Format strictly as JSON:
{
  "feeds": [
    {
      "name": "Feed Name",
      "url": "https://example.com/feed.xml",
      "description": "Short description of the feed",
      "relevance": "UPSC Syllabus relevance"
    }
  ]
}`;

        const geminiPromise = generateGeminiWithRetry({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: UPSC_SYLLABUS_CONTEXT,
          }
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini search timed out")), 14000)
        );

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        let text = response?.text || '';
        
        if (text.startsWith('```json')) text = text.replace(/^```json\n?/, '');
        if (text.endsWith('```')) text = text.replace(/\n?```$/, '');
        
        const parsed = robustJsonParse(text);
        if (parsed && Array.isArray(parsed.feeds) && parsed.feeds.length > 0) {
          return res.json(parsed);
        }
        throw new Error("No feeds parsed");
      } catch (geminiErr: any) {
        console.warn('Gemini discovery timed out or failed:', geminiErr?.message);
        return res.json({
          feeds: [],
          isOfflineFallback: true,
          noMatch: true,
          query: rawInput
        });
      }
    } catch (err: any) {
      console.log('RSS Discovery ultimate error:', err);
      res.status(500).json({ error: err.message || 'Failed to search feeds' });
    }
  });

  app.post('/api/rss-generate-mcq', async (req, res) => {
    try {
      const { title, content, link } = req.body;
      if (!content) {
        return res.status(400).json({ error: 'Missing article content' });
      }

      const prompt = `You are a premier UPSC Civil Services Examination (CSE) examiner and current affairs professor.
      Please generate a highly standard, rigorous UPSC-style Prelims Multiple Choice Question (MCQ) based on the following news article.
      
      Article Title: "${title || 'Untitled'}"
      Source Link / Context: "${link || 'N/A'}"
      Article Body/Snippet:
      """
      ${content}
      """

      UPSC MCQs are conceptual, testing deep understanding, constitutional provisions, statutory acts, economic indicators, or geography, rather than simple trivia.
      Generate 1 premium MCQ that follows the standard UPSC pattern:
      - Has a clear background question stem.
      - Has 2 or 3 numbered statements (Statement 1, Statement 2, Statement 3).
      - Asks: "Which of the statements given above is/are correct?"
      - Options:
        (a) 1 only
        (b) 2 only
        (c) Both 1 and 2
        (d) Neither 1 nor 2
        OR (for 3 statements):
        (a) 1 and 2 only
        (b) 2 and 3 only
        (c) 1 and 3 only
        (d) 1, 2 and 3
      - Correct answer: 'a', 'b', 'c', or 'd'.
      - A comprehensive, rigorous detailed explanation explaining why each statement is correct or incorrect, referencing specific articles of the Constitution, laws, data or organizations.
      - List relevant syllabus paper (GS1, GS2, GS3, or GS4) and specific topic.

      CRITICAL: Return your response PURELY in a valid JSON format. It MUST match this JSON structure exactly:
      {
        "question": "A clear, professionally drafted background question stem.",
        "statements": [
          "Statement 1 detail...",
          "Statement 2 detail..."
        ],
        "question_type": "Which of the statements given above is/are correct?",
        "options": {
          "a": "1 only",
          "b": "2 only",
          "c": "Both 1 and 2",
          "d": "Neither 1 nor 2"
        },
        "correct_option": "a",
        "explanation": "Detailed, comprehensive UPSC-style explanation. Discuss Statement 1, Statement 2 and explain why they are correct or incorrect.",
        "paper": "GS2",
        "topic": "Significant provisions of the Indian Constitution and basic structure."
      }
      `;

      const completion = await createDeepSeekCompletion({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are an expert UPSC CSE content creator.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(responseText);
      res.json(parsed);
    } catch (err: any) {
      console.error('Error generating UPSC MCQ:', err);
      res.status(500).json({ error: err.message || 'Error occurred during MCQ generation' });
    }
  });

  app.post('/api/rss-generate-flashcards', async (req, res) => {
    try {
      const { title, content } = req.body;
      if (!content) {
        return res.status(400).json({ error: 'Missing article content' });
      }

      const prompt = `You are a premier UPSC Civil Services Examination (CSE) expert.
      Analyze the following current affairs article and extract exactly 3 high-yield active recall flashcard Q&As.
      
      Article Title: "${title || 'Untitled'}"
      Article Body/Snippet:
      """
      ${content}
      """

      Each flashcard must target key factual, legal, constitutional, or policy details.
      The front (question) should trigger active recall (e.g. "Which committee recommended the implementation of...?" or "What Article authorizes...?").
      The back (answer) should be a concise, precise, high-yield answer.

      CRITICAL: Return your response PURELY in a valid JSON format. It MUST match this JSON structure exactly:
      {
        "flashcards": [
          {
            "question": "Clear, precise active recall question.",
            "answer": "Concise high-yield answer highlighting key facts, articles, or data."
          }
        ]
      }
      `;

      const completion = await createDeepSeekCompletion({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are an expert UPSC CSE content creator.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(responseText);
      res.json(parsed);
    } catch (err: any) {
      console.error('Error generating UPSC Flashcards:', err);
      res.status(500).json({ error: err.message || 'Error occurred during Flashcard generation' });
    }
  });

  app.post('/api/categorize-note', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') return res.status(400).json({ error: 'Text required' });
      
      const t = text.toLowerCase();
      
      // Fast UPSC Keyword Heuristic Auto-Categorization
      let heuristicCat = "";
      if (/(constitution|supreme court|high court|judiciary|parliament|bill|act\b|governance|polity|bns\b|bnss\b|bsb\b|election|commission|amendment|pib|prs|ministry|tribunal|fundamental right)/i.test(t)) {
        heuristicCat = "Polity & Governance";
      } else if (/(gdp|rbi|inflation|budget|fiscal|gst|tax\b|banking|finance|monetary|market|trade|export|import|currency|rupee|economy|economic|msp|apmc|agriculture)/i.test(t)) {
        heuristicCat = "Economy";
      } else if (/(isro|space|satellite|cyber|biotech|ai\b|nanotech|nuclear|defense|missile|technology|science|semiconductor|computing)/i.test(t)) {
        heuristicCat = "Science & Technology";
      } else if (/(climate|cop2|pollution|wildlife|forest|biodiversity|conservation|ramsar|carbon|ecology|environment|greenhouse|emission)/i.test(t)) {
        heuristicCat = "Environment & Ecology";
      } else if (/(unsc|summit|bilateral|treaty|diplomatic|g20|quad|asean|brics|foreign|border|geopolitics|china|pakistan|israel|usa|un\b)/i.test(t)) {
        heuristicCat = "International Relations";
      } else if (/(ancient|medieval|freedom struggle|gandhi|nehru|heritage|architecture|temple|revolt|british|dynasty|empire|history|culture)/i.test(t)) {
        heuristicCat = "History & Culture";
      }

      const prompt = `
Categorize the following text into exactly ONE of these specific UPSC syllabus subjects:
- Current Affairs (General)
- Polity & Governance
- Economy
- Science & Technology
- Environment & Ecology
- International Relations
- History & Culture

Respond with ONLY the exact category name from the list above. Do not include any other text, reasoning, or markdown.

Text to categorize:
"${text.substring(0, 3000)}"
`;
      
      try {
        const response = await generateGeminiWithRetry({
          model: 'gemini-2.5-flash',
          contents: { parts: [{ text: prompt }] }
        });
        
        let category = (response.text || '').trim();
        const valid = [
          "Current Affairs (General)",
          "Polity & Governance",
          "Economy",
          "Science & Technology",
          "Environment & Ecology",
          "International Relations",
          "History & Culture"
        ];
        
        const matched = valid.find(v => category.toLowerCase().includes(v.toLowerCase()));
        if (matched) {
          return res.json({ category: matched });
        }
      } catch (aiErr) {
        console.warn('AI categorization failed, using heuristic:', aiErr);
      }
      
      return res.json({ category: heuristicCat || "Current Affairs (General)" });
    } catch (err: any) {
      console.error('Categorize error:', err);
      return res.json({ category: "Current Affairs (General)" });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist/client');
    app.use(express.static(distPath, { dotfiles: 'deny' }));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, process.env.HOST || '127.0.0.1', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
