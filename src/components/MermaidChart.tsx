import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import mermaid from "mermaid";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  MoveHorizontal, 
  RefreshCw, 
  Download, 
  Expand, 
  X, 
  HelpCircle, 
  Lock, 
  LockOpen,
  Sparkles,
  Sun,
  Moon,
  Check
} from "lucide-react";

// Layout algorithms to cycle through
const LAYOUT_ALGORITHMS = ["dagre"];
const DIRECTIONS = ["TD", "LR", "RL", "BT"];

// Static initialization (theme-agnostic base config)
mermaid.initialize({
  startOnLoad: false,
  themeVariables: {
    edgeLabelBackground: "transparent",
  },
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  securityLevel: "loose",
  flowchart: { 
     htmlLabels: true,
     curve: "linear",
     nodeSpacing: 50,
     rankSpacing: 60,
     padding: 20
  },
  mindmap: {
    padding: 15,
    maxNodeWidth: 220
  }
});

interface MermaidProps {
  chart: string;
}

export function sanitizeMermaidGraph(code: string): string {
  let cleaned = code.trim();
  
  // 1. Strip markdown wrappers
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z0-9_-]*\s*/, "").replace(/```$/, "").trim();
  }
  
  // 2. Resolve case where entire response is wrapped in quotes
  if (cleaned.startsWith('"') && cleaned.endsWith('"') && !cleaned.includes('\n')) {
    try {
      cleaned = JSON.parse(cleaned);
    } catch {
      cleaned = cleaned.substring(1, cleaned.length - 1);
    }
  }

  // 3. Find the first occurrence of Mermaid diagram keywords
  const startKeywords = ["flowchart", "graph", "sequenceDiagram", "gantt", "classDiagram", "stateDiagram", "pie font", "pie", "erDiagram", "mindmap"];
  let foundIndex = -1;
  for (const keyword of startKeywords) {
    const idx = cleaned.toLowerCase().indexOf(keyword);
    if (idx !== -1 && (foundIndex === -1 || idx < foundIndex)) {
      foundIndex = idx;
    }
  }
  
  if (foundIndex !== -1) {
    cleaned = cleaned.substring(foundIndex).trim();
  }

  // 4. Repairs for common LLM mermaid syntax generation errors
  const lines = cleaned.split('\n');

  // Bracket configs ordered from longest open token to shortest,
  // with negative lookaheads on single-character open tokens so they NEVER match multi-char bracket openings!
  const bracketConfigs = [
    { open: '([', close: '])', regex: /\b([a-zA-Z0-9_-]+)\s*\(\[/g, allowQuotes: true },
    { open: '((', close: '))', regex: /\b([a-zA-Z0-9_-]+)\s*\(\(/g, allowQuotes: false },
    { open: '{{', close: '}}', regex: /\b([a-zA-Z0-9_-]+)\s*\{\{/g, allowQuotes: false },
    { open: '[(', close: ')]', regex: /\b([a-zA-Z0-9_-]+)\s*\[\(/g, allowQuotes: true },
    { open: '[/', close: '/]', regex: /\b([a-zA-Z0-9_-]+)\s*\[\//g, allowQuotes: false },
    { open: '[\\', close: '\]', regex: /\b([a-zA-Z0-9_-]+)\s*\[\\/g, allowQuotes: false },
    { open: '[>', close: ']',  regex: /\b([a-zA-Z0-9_-]+)\s*\[\>/g, allowQuotes: false },
    { open: '[',  close: ']',  regex: /\b([a-zA-Z0-9_-]+)\s*\[(?![\\(/\\>])/g, allowQuotes: true },
    { open: '(',  close: ')',  regex: /\b([a-zA-Z0-9_-]+)\s*\((?![\[\(])/g, allowQuotes: true },
    { open: '{',  close: '}',  regex: /\b([a-zA-Z0-9_-]+)\s*\{(?!\{)/g, allowQuotes: false }
  ];

  const repairedLines = lines.map(line => {
    let l = line.trim();
    if (!l) return "";

    // Clean up redundant double quote sequences
    l = l.replace(/""+/g, '"');

    // Skip special Mermaid directives
    const lower = l.toLowerCase();
    if (
      lower.startsWith("subgraph") || 
      lower.startsWith("end") || 
      lower.startsWith("linkstyle") || 
      lower.startsWith("style") || 
      lower.startsWith("click") || 
      lower.startsWith("classdef") ||
      lower.startsWith("class") ||
      lower.startsWith("direction") ||
      lower.startsWith("title") ||
      lower.startsWith("note") ||
      lower.startsWith("acctitle") ||
      lower.startsWith("accdescr") ||
      lower.startsWith("%%")
    ) {
      return line;
    }

    let processedLine = l;

    for (const config of bracketConfigs) {
      const regex = new RegExp(config.regex.source, 'g');
      let match: RegExpExecArray | null;
      const matchesToProcess: { nodeId: string; startIndex: number; openLen: number }[] = [];

      while ((match = regex.exec(processedLine)) !== null) {
        // Skip if match occurs inside quotes
        const beforeMatch = processedLine.substring(0, match.index);
        const quoteCount = (beforeMatch.replace(/\\"/g, '').match(/"/g) || []).length;
        if (quoteCount % 2 === 1) {
          continue;
        }

        matchesToProcess.push({
          nodeId: match[1],
          startIndex: match.index,
          openLen: match[0].length
        });
      }

      // Process right-to-left
      for (let i = matchesToProcess.length - 1; i >= 0; i--) {
        const item = matchesToProcess[i];
        const openPos = item.startIndex;
        const searchStart = openPos + item.openLen;
        const closePos = processedLine.indexOf(config.close, searchStart);

        if (closePos !== -1) {
          const rawLabel = processedLine.substring(searchStart, closePos);
          const trimmedLabel = rawLabel.trim();

          if (trimmedLabel) {
            const beforeNode = processedLine.substring(0, openPos);
            const afterNode = processedLine.substring(closePos + config.close.length);

            if (!config.allowQuotes) {
              // Shapes like (( )), {{ }}, { }, [/ /], [\ \] MUST NOT have quotes inside them in Mermaid
              let unquoted = trimmedLabel.replace(/^["']+|["']+$|\\"/g, '').replace(/"/g, "'").trim();
              if (config.open === '((' || config.open === '{{') {
                // Avoid nested parens breaking double-parens or double-curlies
                unquoted = unquoted.replace(/\(/g, '[').replace(/\)/g, ']');
              }
              processedLine = `${beforeNode}${item.nodeId}${config.open}${unquoted}${config.close}${afterNode}`;
            } else {
              const isQuoted = trimmedLabel.startsWith('"') && trimmedLabel.endsWith('"') && trimmedLabel.length >= 2;
              if (!isQuoted) {
                // Replace internal double quotes and backslashes with single quotes so Mermaid lexer never fails on \"
                const safeLabel = trimmedLabel.replace(/"/g, "'").replace(/\\+/g, '');
                processedLine = `${beforeNode}${item.nodeId}${config.open}"${safeLabel}"${config.close}${afterNode}`;
              } else {
                const inner = trimmedLabel.substring(1, trimmedLabel.length - 1);
                const safeInner = inner.replace(/"/g, "'").replace(/\\+/g, '');
                processedLine = `${beforeNode}${item.nodeId}${config.open}"${safeInner}"${config.close}${afterNode}`;
              }
            }
          }
        }
      }
    }

    return processedLine;
  });

  return repairedLines.join('\n');
}

export function autoFixMermaidSyntax(code: string): string {
  let cleaned = code.trim();

  // Strip markdown codeblocks
  cleaned = cleaned.replace(/^```[a-zA-Z0-9_-]*\s*/, "").replace(/```$/, "").trim();

  // Ensure diagram keyword at top
  if (!/^\s*(flowchart|graph|sequenceDiagram|gantt|classDiagram|stateDiagram|pie|erDiagram|mindmap)\b/i.test(cleaned)) {
    cleaned = "flowchart TD\n" + cleaned;
  }

  // Remove any backslashes or escaped quotes
  cleaned = cleaned.replace(/\\"/g, "'").replace(/\\/g, "");

  // Fix malformed arrows
  cleaned = cleaned
    .replace(/--\s+>/g, "-->")
    .replace(/-\.\s+->/g, "-.->")
    .replace(/==\s+>/g, "==>")
    .replace(/\b->\b/g, "-->");

  const lines = cleaned.split('\n');
  const fixedLines = lines.map(line => {
    let l = line.trim();
    if (!l) return "";

    // Skip special directives
    if (/^(subgraph|end|linkstyle|style|click|classdef|class|direction|title|note|%%)/i.test(l)) {
      return l;
    }

    // Replace any internal double quotes inside bracket definitions
    l = l.replace(/\["?(.*?)"?\]/g, (m, label) => {
      const clean = label.replace(/"/g, "'").replace(/\n/g, " ").trim();
      return `["${clean}"]`;
    });
    l = l.replace(/\("?(.*?)"?\)/g, (m, label) => {
      const clean = label.replace(/"/g, "'").replace(/\n/g, " ").trim();
      return `("${clean}")`;
    });

    return l;
  });

  return fixedLines.join('\n');
}

export function generateSafeFallbackFlowchart(code: string): string {
  const lines = code.split('\n');
  const outputLines: string[] = ["flowchart TD"];
  const nodeLabels = new Map<string, string>();
  const seenNodes = new Map<string, string>();
  let nodeCount = 0;

  // Step 1: Pre-extract all node definitions and labels from the whole chart
  const nodeDefRegex = /\b([a-zA-Z0-9_-]+)\s*(?:\["?(.*?)"?\]|\("?(.*?)"?\)\|\{"?(.*?)"?\}|\(\["?(.*?)"?\]\)|\(\("?(.*?)"?\)\)|\{\{"?(.*?)"?\}\}|\[\/"?(.*?)"?\/\]|\[\\"?(.*?)"?\\\])/g;

  lines.forEach(line => {
    const l = line.trim();
    if (!l || l.startsWith("%%")) return;
    let match: RegExpExecArray | null;
    while ((match = nodeDefRegex.exec(l)) !== null) {
      const id = match[1];
      if (["subgraph", "end", "flowchart", "graph", "direction", "class", "classdef", "style", "click"].includes(id.toLowerCase())) continue;
      const label = match.slice(2).find(val => val !== undefined && val.trim() !== "");
      if (label && label.trim().length > 0) {
        nodeLabels.set(id, label.trim().replace(/"/g, "'"));
      }
    }
  });

  // Step 2: Process arrows and connections, preserving labels and handling '&' multi-targets cleanly
  lines.forEach(line => {
    const l = line.trim();
    if (!l || l.startsWith("%%") || l.startsWith("subgraph") || l.startsWith("end") || l.startsWith("class") || l.startsWith("style")) return;

    const arrowMatch = l.match(/([^-\->=]+)(-->|->|==>|-\.->)(.*)/);
    if (arrowMatch) {
      const rawLeft = arrowMatch[1].trim();
      const arrowOp = "-->";
      const rawRight = arrowMatch[3].trim();

      const parseNodePart = (part: string) => {
        const idMatch = part.match(/\b([a-zA-Z0-9_-]+)/);
        const id = idMatch ? idMatch[1] : `N_${Math.random().toString(36).substr(2, 5)}`;
        
        // Check if part itself has inline bracket label
        const bracketMatch = part.match(/[\[\(\{](?:")?(.*?)(?:")?[\]\)\}]/);
        let label = bracketMatch ? bracketMatch[1].trim() : (nodeLabels.get(id) || id);
        
        label = label.replace(/[\[\]\(\)\{\}"']/g, ' ').replace(/\s+/g, ' ').trim();
        if (!label || /^[A-Z][0-9]?$/.test(label)) {
          // If label is still just a bare letter, check if nodeLabels has a fuller definition
          label = nodeLabels.get(id) || label || "Step";
        }
        return { id, label };
      };

      // Split rawRight if it contains '&' (Mermaid multi-target syntax like C1 & D1)
      const rightParts = rawRight.split(/\s*&\s*/).filter(p => p.trim().length > 0);
      const left = parseNodePart(rawLeft);

      if (!seenNodes.has(left.id)) {
        nodeCount++;
        seenNodes.set(left.id, `Node_${nodeCount}`);
      }
      const leftSafeId = seenNodes.get(left.id)!;

      rightParts.forEach(rightPart => {
        const right = parseNodePart(rightPart);
        if (!seenNodes.has(right.id)) {
          nodeCount++;
          seenNodes.set(right.id, `Node_${nodeCount}`);
        }
        const rightSafeId = seenNodes.get(right.id)!;

        outputLines.push(`  ${leftSafeId}["${left.label}"] ${arrowOp} ${rightSafeId}["${right.label}"]`);
      });
    }
  });

  // If no connections found, build nodes from discovered labels
  if (outputLines.length <= 1 && nodeLabels.size > 0) {
    let prevId: string | null = null;
    nodeLabels.forEach((label, id) => {
      nodeCount++;
      const safeId = `Node_${nodeCount}`;
      if (prevId) {
        outputLines.push(`  ${prevId} --> ${safeId}["${label}"]`);
      } else {
        outputLines.push(`  ${safeId}["${label}"]`);
      }
      prevId = safeId;
    });
  }

  if (outputLines.length <= 1) {
    outputLines.push('  N1["Topic Overview"] --> N2["Constitutional Framework"]');
    outputLines.push('  N2 --> N3["Judicial Doctrines & Case Precedents"]');
    outputLines.push('  N3 --> N4["Way Forward & Governance Reforms"]');
  }

  return outputLines.join('\n');
}

export function classifyAndStyleGraph(code: string): string {
  let cleaned = code.trim();
  const isFlowchart = /^\s*(flowchart|graph)\b/i.test(cleaned);
  if (!isFlowchart) return cleaned;

  // Split into lines to extract node definitions
  const lines = cleaned.split('\n');
  const nodeIds: string[] = [];
  const nodeToClass: Record<string, string> = {};

  // Keywords definitions
  const bottleneckKws = [
    "bottleneck", "leakage", "corruption", "threat", "weakness", "delay", "impediment", "hindrance", 
    "challenge", "loophole", "issue", "friction", "trap", "crisis", "revolt", "failure", "deficit", 
    "lacunae", "gap", "shortcoming", "administrative trauma", "disaster", "hazard", "risk", "protest", 
    "strike", "inefficiency", "impediments", "hurdles", "barriers"
  ];
  const reformKws = [
    "reform", "solution", "way forward", "recommendation", "policy", "benefit", "advantage", "strength", 
    "opportunity", "growth", "best practice", "monitoring", "success", "mitigation", "resilience", 
    "technology", "digital", "smart", "innovative", "blueprint", "uplift", "development", "efficiency",
    "digitization", "reforms", "tracking", "transfers"
  ];
  const constitutionalKws = [
    "article", "section", "act ", "acts", "supreme court", "high court", "judgment", "ruling", 
    "constitution", "bare act", "bns", "bnss", "bsb", "ipc", "crpc", "amendment", "statute", 
    "legal", "fundamental right", "directive principle", "sc ruling"
  ];
  const committeeKws = [
    "committee", "commission", "panel", "board", "expert", "niti aayog", "arc-ii", "arc", "punchhi", 
    "sarkaria", "law commission", "venkatachaliah"
  ];

  // Pattern to find node definitions: ID followed by a shape and label (supporting quoted & unquoted shapes)
  const nodeDefRegex = /\b([a-zA-Z0-9_-]+)\s*(?:\[\"?(.*?)\"?\]|\(\"?(.*?)\"?\)\|\{\"?(.*?)\"?\}|\(\[\"?(.*?)\"?\]\)\|\(\(\"?(.*?)\"?\)\)\|\{\{\"?(.*?)\"?\}\}|\[\/\"?(.*?)\"?\/\]|\[\\\"?(.*?)\"?\\\])/;

  lines.forEach(line => {
    const match = line.match(nodeDefRegex);
    if (match) {
      const nodeId = match[1];
      const label = match.slice(2).find(val => val !== undefined) || "";
      const lowerLabel = label.toLowerCase();

      if (["subgraph", "end", "flowchart", "graph", "direction"].includes(nodeId.toLowerCase())) {
        return;
      }

      nodeIds.push(nodeId);

      if (bottleneckKws.some(kw => lowerLabel.includes(kw))) {
        nodeToClass[nodeId] = "bottleneck";
      } else if (reformKws.some(kw => lowerLabel.includes(kw))) {
        nodeToClass[nodeId] = "reform";
      } else if (constitutionalKws.some(kw => lowerLabel.includes(kw))) {
        nodeToClass[nodeId] = "constitutional";
      } else if (committeeKws.some(kw => lowerLabel.includes(kw))) {
        nodeToClass[nodeId] = "committee";
      }
    }
  });

  if (nodeIds.length > 0) {
    const firstNode = nodeIds[0];
    if (!nodeToClass[firstNode]) {
      nodeToClass[firstNode] = "core";
    }
  }

  const classDefLines = [
    "",
    "%% Safe static class definitions for parser compatibility (styled dynamically in CSS)",
    "classDef bottleneck fill:#fee2e2,stroke:#ef4444,stroke-width:2.5px,color:#991b1b;",
    "classDef reform fill:#dcfce7,stroke:#22c55e,stroke-width:2.5px,color:#166534;",
    "classDef constitutional fill:#e0f2fe,stroke:#0284c7,stroke-width:2.5px,color:#075985;",
    "classDef committee fill:#fef9c3,stroke:#ca8a04,stroke-width:2.5px,color:#854d0e;",
    "classDef core fill:#e0e7ff,stroke:#6366f1,stroke-width:3px,color:#3730a3;",
    "classDef analysis fill:#f3e8ff,stroke:#9333ea,stroke-width:2.5px,color:#6b21a8;"
  ];

  const classGroups: Record<string, string[]> = {
    bottleneck: [],
    reform: [],
    constitutional: [],
    committee: [],
    core: []
  };

  Object.entries(nodeToClass).forEach(([id, cls]) => {
    if (classGroups[cls]) {
      classGroups[cls].push(id);
    }
  });

  Object.entries(classGroups).forEach(([cls, ids]) => {
    if (ids.length > 0) {
      classDefLines.push(`class ${ids.join(',')} ${cls};`);
    }
  });

  return lines.join('\n') + classDefLines.join('\n');
}

const themeCssVariables = `
  :root, [data-theme="default"], [data-theme="latte"], [data-theme="sage"], [data-theme="solarized-light"] {
    --m-bottleneck-bg: #fee2e2;
    --m-bottleneck-stroke: #ef4444;
    --m-bottleneck-text: #991b1b;
    --m-reform-bg: #dcfce7;
    --m-reform-stroke: #22c55e;
    --m-reform-text: #166534;
    --m-constitutional-bg: #e0f2fe;
    --m-constitutional-stroke: #0284c7;
    --m-constitutional-text: #075985;
    --m-committee-bg: #fef9c3;
    --m-committee-stroke: #ca8a04;
    --m-committee-text: #854d0e;
    --m-core-bg: #e0e7ff;
    --m-core-stroke: #6366f1;
    --m-core-text: #3730a3;
    --m-analysis-bg: #f3e8ff;
    --m-analysis-stroke: #9333ea;
    --m-analysis-text: #6b21a8;
    --m-arrow-color: #64748b;
    --m-cluster-bg: #f1f5f9;
    --m-cluster-stroke: #cbd5e1;
  }

  [data-theme="sepia"] {
    --m-bottleneck-bg: #ffd6d6;
    --m-bottleneck-stroke: #b91c1c;
    --m-bottleneck-text: #7f1d1d;
    --m-reform-bg: #ccfbf1;
    --m-reform-stroke: #0d9488;
    --m-reform-text: #115e59;
    --m-constitutional-bg: #bae6fd;
    --m-constitutional-stroke: #0369a1;
    --m-constitutional-text: #0c4a6e;
    --m-committee-bg: #fef08a;
    --m-committee-stroke: #a16207;
    --m-committee-text: #713f12;
    --m-core-bg: #e0e7ff;
    --m-core-stroke: #4f46e5;
    --m-core-text: #312e81;
    --m-analysis-bg: #f3e8ff;
    --m-analysis-stroke: #7e22ce;
    --m-analysis-text: #581c87;
    --m-arrow-color: #786551;
    --m-cluster-bg: #eae0cd;
    --m-cluster-stroke: #d5c8b2;
  }

  [data-theme="sunset"] {
    --m-bottleneck-bg: #fee2e2;
    --m-bottleneck-stroke: #ea580c;
    --m-bottleneck-text: #7c2d12;
    --m-reform-bg: #fef3c7;
    --m-reform-stroke: #d97706;
    --m-reform-text: #78350f;
    --m-constitutional-bg: #ffedd5;
    --m-constitutional-stroke: #ea580c;
    --m-constitutional-text: #7c2d12;
    --m-committee-bg: #fef9c3;
    --m-committee-stroke: #ca8a04;
    --m-committee-text: #854d0e;
    --m-core-bg: #ffedd5;
    --m-core-stroke: #f97316;
    --m-core-text: #431407;
    --m-analysis-bg: #fae8ff;
    --m-analysis-stroke: #d946ef;
    --m-analysis-text: #701a75;
    --m-arrow-color: #e85d04;
    --m-cluster-bg: #ffecd1;
    --m-cluster-stroke: #ffb703;
  }

  [data-theme="amoled"], [data-theme="nord"], [data-theme="cyberpunk"], [data-theme="midnight"], 
  [data-theme="ocean"], [data-theme="forest"], [data-theme="dracula"], [data-theme="solarized-dark"], 
  [data-theme="tokyo-night"], [data-theme="obsidian"], [data-theme="gruvbox"] {
    --m-bottleneck-bg: #5c0f0f;
    --m-bottleneck-stroke: #ef4444;
    --m-bottleneck-text: #fecaca;
    --m-reform-bg: #064e3b;
    --m-reform-stroke: #10b981;
    --m-reform-text: #dcfce7;
    --m-constitutional-bg: #0c4a6e;
    --m-constitutional-stroke: #0ea5e9;
    --m-constitutional-text: #bae6fd;
    --m-committee-bg: #78350f;
    --m-committee-stroke: #eab308;
    --m-committee-text: #fef08a;
    --m-core-bg: #1e1b4b;
    --m-core-stroke: #6366f1;
    --m-core-text: #e0e7ff;
    --m-analysis-bg: #3b0764;
    --m-analysis-stroke: #c084fc;
    --m-analysis-text: #f3e8ff;
    --m-arrow-color: #94a3b8;
    --m-cluster-bg: #111827;
    --m-cluster-stroke: #374151;
  }

  .mermaid-content svg {
    background: transparent !important;
  }
  /* Safari foreignObject layout preservation rule */
  .mermaid-content foreignObject {
    overflow: visible !important;
  }
  .mermaid-content foreignObject > div {
    display: inline-block !important;
    position: static !important;
    transform: none !important;
    -webkit-transform: none !important;
    backface-visibility: visible !important;
    -webkit-backface-visibility: visible !important;
  }
  .mermaid-content .edgePath .path {
    stroke: var(--m-arrow-color, #64748b) !important;
    stroke-width: 2.2px !important;
  }
  .mermaid-content .edgePath marker {
    fill: var(--m-arrow-color, #64748b) !important;
  }
  .mermaid-content .cluster rect {
    fill: var(--m-cluster-bg, #f1f5f9) !important;
    stroke: var(--m-cluster-stroke, #cbd5e1) !important;
    stroke-width: 1.5px !important;
    rx: 12px !important;
  }
  .mermaid-content .node rect,
  .mermaid-content .node circle,
  .mermaid-content .node ellipse,
  .mermaid-content .node polygon,
  .mermaid-content .node path {
    rx: 8px !important;
    ry: 8px !important;
  }
  .mermaid-content .node text,
  .mermaid-content .node tspan,
  .mermaid-content .node .nodeLabel {
    font-family: "Inter", ui-sans-serif, system-ui, sans-serif !important;
    font-weight: 600 !important;
    font-size: 11px !important;
  }

  /* Theme-aware node class overrides with safe default color fallbacks for high-contrast */
  .mermaid-content .node.bottleneck rect,
  .mermaid-content .node.bottleneck circle,
  .mermaid-content .node.bottleneck ellipse,
  .mermaid-content .node.bottleneck polygon,
  .mermaid-content .node.bottleneck path,
  .mermaid-content .bottleneck rect,
  .mermaid-content .bottleneck circle,
  .mermaid-content .bottleneck ellipse,
  .mermaid-content .bottleneck polygon,
  .mermaid-content .bottleneck path {
    fill: var(--m-bottleneck-bg, #fee2e2) !important;
    stroke: var(--m-bottleneck-stroke, #ef4444) !important;
  }
  .mermaid-content .node.bottleneck text,
  .mermaid-content .node.bottleneck tspan,
  .mermaid-content .node.bottleneck .nodeLabel,
  .mermaid-content .bottleneck text,
  .mermaid-content .bottleneck tspan,
  .mermaid-content .bottleneck .nodeLabel,
  .mermaid-content .node.bottleneck span,
  .mermaid-content .bottleneck span,
  .mermaid-content .node.bottleneck div,
  .mermaid-content .bottleneck div {
    color: var(--m-bottleneck-text, #991b1b) !important;
    fill: var(--m-bottleneck-text, #991b1b) !important;
  }

  .mermaid-content .node.reform rect,
  .mermaid-content .node.reform circle,
  .mermaid-content .node.reform ellipse,
  .mermaid-content .node.reform polygon,
  .mermaid-content .node.reform path,
  .mermaid-content .reform rect,
  .mermaid-content .reform circle,
  .mermaid-content .reform ellipse,
  .mermaid-content .reform polygon,
  .mermaid-content .reform path {
    fill: var(--m-reform-bg, #dcfce7) !important;
    stroke: var(--m-reform-stroke, #22c55e) !important;
  }
  .mermaid-content .node.reform text,
  .mermaid-content .node.reform tspan,
  .mermaid-content .node.reform .nodeLabel,
  .mermaid-content .reform text,
  .mermaid-content .reform tspan,
  .mermaid-content .reform .nodeLabel,
  .mermaid-content .node.reform span,
  .mermaid-content .reform span,
  .mermaid-content .node.reform div,
  .mermaid-content .reform div {
    color: var(--m-reform-text, #166534) !important;
    fill: var(--m-reform-text, #166534) !important;
  }

  .mermaid-content .node.constitutional rect,
  .mermaid-content .node.constitutional circle,
  .mermaid-content .node.constitutional ellipse,
  .mermaid-content .node.constitutional polygon,
  .mermaid-content .node.constitutional path,
  .mermaid-content .constitutional rect,
  .mermaid-content .constitutional circle,
  .mermaid-content .constitutional ellipse,
  .mermaid-content .constitutional polygon,
  .mermaid-content .constitutional path {
    fill: var(--m-constitutional-bg, #e0f2fe) !important;
    stroke: var(--m-constitutional-stroke, #0284c7) !important;
  }
  .mermaid-content .node.constitutional text,
  .mermaid-content .node.constitutional tspan,
  .mermaid-content .node.constitutional .nodeLabel,
  .mermaid-content .constitutional text,
  .mermaid-content .constitutional tspan,
  .mermaid-content .constitutional .nodeLabel,
  .mermaid-content .node.constitutional span,
  .mermaid-content .constitutional span,
  .mermaid-content .node.constitutional div,
  .mermaid-content .constitutional div {
    color: var(--m-constitutional-text, #075985) !important;
    fill: var(--m-constitutional-text, #075985) !important;
  }

  .mermaid-content .node.committee rect,
  .mermaid-content .node.committee circle,
  .mermaid-content .node.committee ellipse,
  .mermaid-content .node.committee polygon,
  .mermaid-content .node.committee path,
  .mermaid-content .committee rect,
  .mermaid-content .committee circle,
  .mermaid-content .committee ellipse,
  .mermaid-content .committee polygon,
  .mermaid-content .committee path {
    fill: var(--m-committee-bg, #fef9c3) !important;
    stroke: var(--m-committee-stroke, #ca8a04) !important;
  }
  .mermaid-content .node.committee text,
  .mermaid-content .node.committee tspan,
  .mermaid-content .node.committee .nodeLabel,
  .mermaid-content .committee text,
  .mermaid-content .committee tspan,
  .mermaid-content .committee .nodeLabel,
  .mermaid-content .node.committee span,
  .mermaid-content .committee span,
  .mermaid-content .node.committee div,
  .mermaid-content .committee div {
    color: var(--m-committee-text, #854d0e) !important;
    fill: var(--m-committee-text, #854d0e) !important;
  }

  .mermaid-content .node.core rect,
  .mermaid-content .node.core circle,
  .mermaid-content .node.core ellipse,
  .mermaid-content .node.core polygon,
  .mermaid-content .node.core path,
  .mermaid-content .core rect,
  .mermaid-content .core circle,
  .mermaid-content .core ellipse,
  .mermaid-content .core polygon,
  .mermaid-content .core path {
    fill: var(--m-core-bg, #e0e7ff) !important;
    stroke: var(--m-core-stroke, #6366f1) !important;
  }
  .mermaid-content .node.core text,
  .mermaid-content .node.core tspan,
  .mermaid-content .node.core .nodeLabel,
  .mermaid-content .core text,
  .mermaid-content .core tspan,
  .mermaid-content .core .nodeLabel,
  .mermaid-content .node.core span,
  .mermaid-content .core span,
  .mermaid-content .node.core div,
  .mermaid-content .core div {
    color: var(--m-core-text, #3730a3) !important;
    fill: var(--m-core-text, #3730a3) !important;
  }

  .mermaid-content .node.analysis rect,
  .mermaid-content .node.analysis circle,
  .mermaid-content .node.analysis ellipse,
  .mermaid-content .node.analysis polygon,
  .mermaid-content .node.analysis path,
  .mermaid-content .analysis rect,
  .mermaid-content .analysis circle,
  .mermaid-content .analysis ellipse,
  .mermaid-content .analysis polygon,
  .mermaid-content .analysis path {
    fill: var(--m-analysis-bg, #f3e8ff) !important;
    stroke: var(--m-analysis-stroke, #9333ea) !important;
  }
  .mermaid-content .node.analysis text,
  .mermaid-content .node.analysis tspan,
  .mermaid-content .node.analysis .nodeLabel,
  .mermaid-content .analysis text,
  .mermaid-content .analysis tspan,
  .mermaid-content .analysis .nodeLabel,
  .mermaid-content .node.analysis span,
  .mermaid-content .analysis span,
  .mermaid-content .node.analysis div,
  .mermaid-content .analysis div {
    color: var(--m-analysis-text, #6b21a8) !important;
    fill: var(--m-analysis-text, #6b21a8) !important;
  }
`;

const DiagramLegend: React.FC<{ isOpen: boolean; onClose: () => void; onToggle: () => void }> = ({ isOpen, onClose, onToggle }) => {
  return (
    <div className="absolute bottom-2 left-2 z-20 no-print">
      {!isOpen ? (
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-panel/90 backdrop-blur-md hover:bg-panel border border-panel-border text-[11px] font-bold rounded-lg shadow-sm transition-all cursor-pointer hover:shadow text-main"
          title="Show Diagram Legend"
        >
          <HelpCircle size={14} className="text-accent" />
          <span>Diagram Legend</span>
        </button>
      ) : (
        <div className="w-[280px] sm:w-[320px] bg-panel/95 backdrop-blur-md border border-panel-border rounded-xl shadow-xl p-3.5 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150 text-main">
          <div className="flex items-center justify-between border-b border-panel-border/60 pb-2">
            <span className="text-[11px] font-black uppercase tracking-wider font-mono text-main flex items-center gap-1.5">
              <HelpCircle size={14} className="text-accent" />
              Diagram Legend
            </span>
            <button
              onClick={onClose}
              className="text-muted hover:text-main p-1 rounded hover:bg-input transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-left text-[11px]">
            {/* Color Categories */}
            <div className="col-span-2 space-y-1.5">
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider font-mono">Colors / Categories</span>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="flex items-center gap-1.5 p-1 rounded bg-[var(--m-core-bg)]/20 border border-[var(--m-core-stroke)]/30">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--m-core-stroke)' }} />
                  <span className="text-[10px] font-medium text-main truncate">Core Subject</span>
                </div>
                <div className="flex items-center gap-1.5 p-1 rounded bg-[var(--m-bottleneck-bg)]/20 border border-[var(--m-bottleneck-stroke)]/30">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--m-bottleneck-stroke)' }} />
                  <span className="text-[10px] font-medium text-main truncate">Bottleneck</span>
                </div>
                <div className="flex items-center gap-1.5 p-1 rounded bg-[var(--m-reform-bg)]/20 border border-[var(--m-reform-stroke)]/30">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--m-reform-stroke)' }} />
                  <span className="text-[10px] font-medium text-main truncate">Solution / Reform</span>
                </div>
                <div className="flex items-center gap-1.5 p-1 rounded bg-[var(--m-constitutional-bg)]/20 border border-[var(--m-constitutional-stroke)]/30">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--m-constitutional-stroke)' }} />
                  <span className="text-[10px] font-medium text-main truncate">Legal / Const.</span>
                </div>
                <div className="flex items-center gap-1.5 p-1 rounded bg-[var(--m-committee-bg)]/20 border border-[var(--m-committee-stroke)]/30">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--m-committee-stroke)' }} />
                  <span className="text-[10px] font-medium text-main truncate">Committee</span>
                </div>
                <div className="flex items-center gap-1.5 p-1 rounded bg-[var(--m-analysis-bg)]/20 border border-[var(--m-analysis-stroke)]/30">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--m-analysis-stroke)' }} />
                  <span className="text-[10px] font-medium text-main truncate">General Analysis</span>
                </div>
              </div>
            </div>

            {/* Node Shapes */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider font-mono">Node Shapes</span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-5 bg-input border border-panel-border/80 flex items-center justify-center text-[8.5px] font-mono rounded" title="[Square]">
                    Process
                  </div>
                  <span className="text-[9.5px] text-muted">Action / Step</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-5 bg-input border border-panel-border/80 flex items-center justify-center text-[8.5px] font-mono rounded-full" title="(Oval)">
                    Goal
                  </div>
                  <span className="text-[9.5px] text-muted">Outcome / End</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-5 bg-input border border-panel-border/80 flex items-center justify-center text-[8.5px] font-mono relative" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} title="{Diamond}">
                    Dec.
                  </div>
                  <span className="text-[9.5px] text-muted">Decision Point</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-5 bg-input border border-panel-border/80 flex items-center justify-center text-[8.5px] font-mono" style={{ transform: 'skewX(-15deg)' }} title="[/Parallelogram/]">
                    Data
                  </div>
                  <span className="text-[9.5px] text-muted">Doc / Input</span>
                </div>
              </div>
            </div>

            {/* Edge Types */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider font-mono">Connections</span>
              <div className="space-y-2">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between text-[9px] font-mono text-main">
                    <span>Direct Flow</span>
                    <span className="text-accent">──▶</span>
                  </div>
                  <span className="text-[9px] text-muted">Sequence path</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between text-[9px] font-mono text-main">
                    <span>Feedback</span>
                    <span className="text-accent">╌╌▶</span>
                  </div>
                  <span className="text-[9px] text-muted">Loop or reference</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between text-[9px] font-mono text-main">
                    <span>Critical Link</span>
                    <span className="text-accent">━━▶</span>
                  </div>
                  <span className="text-[9px] text-muted">High-impact line</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

let renderQueue = Promise.resolve();

export const MermaidChart: React.FC<MermaidProps> = React.memo(({ chart }) => {
  const isInitialRender = useRef(true);
  const [currentChart, setCurrentChart] = useState(chart);
  const [svgStr, setSvgStr] = useState<string>("");
  const [isFitToWidth, setIsFitToWidth] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullscreenCanvasMode, setFullscreenCanvasMode] = useState<"light" | "dark">("light");
  const [isTouchInteractive, setIsTouchInteractive] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isFullscreenLegendOpen, setIsFullscreenLegendOpen] = useState(false);
  const [layoutIndex, setLayoutIndex] = useState(0);
  const [renderError, setRenderError] = useState<string | null>(null);

  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichSuccess, setEnrichSuccess] = useState(false);

  useEffect(() => {
    setCurrentChart(chart);
  }, [chart]);
  
  const renderVersion = useRef(0);

  // Concept inspector states
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [deconstructedData, setDeconstructedData] = useState<string | null>(null);
  const [isDeconstructing, setIsDeconstructing] = useState(false);

  // Prevent background scroll and support Escape key when in fullscreen
  useEffect(() => {
    if (!isFullScreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullScreen(false);
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullScreen]);

  // Enrich diagram with AI to eliminate bare letters and add rich UPSC concepts
  const enrichDiagramWithAI = useCallback(async () => {
    setIsEnriching(true);
    setEnrichSuccess(false);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `The following Mermaid diagram needs to be upgraded into a comprehensive, high-yield UPSC Civil Services concept flowchart:
\`\`\`mermaid
${currentChart}
\`\`\`
CRITICAL REQUIREMENTS:
1. Every single node MUST have an explicit, descriptive title enclosed in quotes in brackets: e.g. NodeId["Case Law / Constitutional Provision<br/>Core Ratio / Actionable Mechanism"].
2. STRICTLY FORBIDDEN: NEVER output bare letters or placeholder IDs (like A, B, B1, C, C1). Every box must contain real UPSC substance (landmark Supreme Court judgments with year, constitutional articles, commissions, or governance solutions).
3. Use a clean flowchart TD structure with logical progression.
4. Output ONLY the valid Mermaid code inside a \`\`\`mermaid ... \`\`\` code block. Do NOT write any conversational text.`
            }
          ]
        })
      });
      if (res.ok) {
        const data = await res.json();
        const reply = data.reply || "";
        const match = reply.match(/```(?:mermaid)?\s*([\s\S]*?)```/i);
        const newMermaid = match ? match[1].trim() : reply.trim();
        if (newMermaid && /^(flowchart|graph)\b/i.test(newMermaid)) {
          setCurrentChart(newMermaid);
          setEnrichSuccess(true);
          setTimeout(() => setEnrichSuccess(false), 3500);
        }
      }
    } catch (err) {
      console.error("Failed to enrich diagram:", err);
    } finally {
      setIsEnriching(false);
    }
  }, [currentChart]);

  // Deconstruct a node topic into a concise executive overview under the UPSC lens
  const deconstructConcept = useCallback(async () => {
    if (!selectedNode) return;
    setIsDeconstructing(true);
    setDeconstructedData(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `You are an expert UPSC Civil Services Mentor.
Provide a high-yield, compact EXECUTIVE CONCEPT OVERVIEW of the concept/node: "${selectedNode}".
The candidate needs a crisp, rapid conceptual overview (NOT a detailed, long, or repetitive essay answer).
Keep the ENTIRE overview under 140 words. Use this clean, scannable format:

### Core Essence
1-2 concise sentences defining what this concept is, its constitutional/statutory purpose, and key principle.

### UPSC Syllabus Link
One line specifying the exact GS Paper / Optional and syllabus topic (e.g. GS-2: Federalism & Inter-State Relations).

### Key Dimensions & Mechanisms
• **Pillars**: 2-3 high-yield keywords or mechanisms (e.g. Art. 263, Fiscal Devolution, Cooperative Framework).
• **Core Bottleneck**: 1 concise line on the primary operational friction or administrative hurdle.
• **Reforms / Way Forward**: 1 concise line citing a landmark commission or solution (e.g. 2nd ARC, Punchhi Commission, NITI Aayog).

CRITICAL CONSTRAINTS:
- Keep it concise, high-density, and scannable.
- Do NOT write long paragraphs or lengthy explanations. Total response must fit in a single glance without scrolling.`
            }
          ]
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDeconstructedData(data.reply || "Failed to retrieve concept overview. Please try again.");
      } else {
        setDeconstructedData("Could not connect to mentor service. Please retry.");
      }
    } catch (err) {
      console.error(err);
      setDeconstructedData("An unexpected error occurred during brainstorm.");
    } finally {
      setIsDeconstructing(false);
    }
  }, [selectedNode]);

  const manipulatedChart = useMemo(() => {
    const cleaned = sanitizeMermaidGraph(currentChart);
    let c = cleaned.trim();
    // For flowcharts, toggle the direction (TD, LR, RL, BT)
    const match = c.match(/^(flowchart|graph)\s+([A-Z]{2})/i);
    if (match) {
        const nextDir = DIRECTIONS[layoutIndex % DIRECTIONS.length];
        c = c.replace(/^(flowchart|graph)\s+[A-Z]{2}/i, `$1 ${nextDir}`);
    }
    return classifyAndStyleGraph(c);
  }, [chart, layoutIndex]);

  const forceRender = useCallback(async (currentLayoutIndex: number) => {
    const currentVersion = ++renderVersion.current;
    const layout = LAYOUT_ALGORITHMS[currentLayoutIndex % LAYOUT_ALGORITHMS.length];
    
    renderQueue = renderQueue.then(async () => {
      if (currentVersion !== renderVersion.current) return;
      try {
        if (typeof document !== "undefined" && document.fonts) {
          try {
            await document.fonts.ready;
          } catch (fontErr) {
            console.warn("Failed to wait for fonts to load", fontErr);
          }
        }
        const id = `mermaid-${Math.random().toString(36).substr(2, 9).replace(/^[0-9]/, 'm')}`;
        
        
        const getCssVar = (name, fallback) => {
          if (typeof window !== 'undefined') {
            const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
            if (val) return val;
          }
          return fallback;
        };

        const isMindmap = manipulatedChart.toLowerCase().includes("mindmap");
        mermaid.initialize({
          theme: "base",
          themeVariables: {
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            primaryColor: isMindmap ? getCssVar('--panel-bg', '#ffffff') : getCssVar('--app-bg', '#f8fafc'),
            primaryTextColor: getCssVar('--text-main', '#0f172a'),
            primaryBorderColor: getCssVar('--panel-border', '#e2e8f0'),
            lineColor: getCssVar('--text-muted', '#64748b'),
            secondaryColor: getCssVar('--sidebar-bg', '#f1f5f9'),
            tertiaryColor: getCssVar('--input-bg', '#ffffff'),
            mainBkg: getCssVar('--panel-bg', '#ffffff'),
            nodeBorder: getCssVar('--panel-border', '#e2e8f0'),
            clusterBkg: getCssVar('--sidebar-bg', '#f1f5f9'),
            clusterBorder: getCssVar('--sidebar-border', '#e2e8f0'),
            edgeLabelBackground: getCssVar('--panel-bg', '#ffffff'),
            nodeTextColor: getCssVar('--text-main', '#0f172a'),
            labelTextColor: getCssVar('--text-main', '#0f172a'),
          },
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          securityLevel: "loose",
          flowchart: { 
             htmlLabels: true,
             curve: "linear",
             defaultRenderer: layout as any,
             nodeSpacing: 50,
             rankSpacing: 60,
             padding: 24
          },
          mindmap: {
            padding: 20,
            maxNodeWidth: 250
          }
        });
        // Parse check with multi-pass error fallback
        let isValid = false;
        let errMsg = "";
        let finalChart = manipulatedChart;

        try {
          await mermaid.parse(finalChart);
          isValid = true;
        } catch (parseErr: any) {
          console.warn("Mermaid pass 1 failed, running autoFixMermaidSyntax:", parseErr);
          try {
            const fixed = autoFixMermaidSyntax(manipulatedChart);
            await mermaid.parse(fixed);
            finalChart = fixed;
            isValid = true;
          } catch (parseErr2: any) {
            console.warn("Mermaid pass 2 failed, running generateSafeFallbackFlowchart:", parseErr2);
            try {
              const fallback = generateSafeFallbackFlowchart(manipulatedChart);
              await mermaid.parse(fallback);
              finalChart = fallback;
              isValid = true;
            } catch (parseErr3: any) {
              errMsg = parseErr?.message || String(parseErr);
              isValid = false;
            }
          }
        }

        if (isValid) {
          try {
            const { svg } = await mermaid.render(id, finalChart);
            if (currentVersion === renderVersion.current) {
              setSvgStr(svg);
              setRenderError(null);
              isInitialRender.current = false;
            }
          } catch (renderErr: any) {
            console.warn("Mermaid render pass 1 error, attempting fallbacks:", renderErr);
            try {
              const fixed = autoFixMermaidSyntax(finalChart);
              const { svg } = await mermaid.render(`${id}-fix`, fixed);
              if (currentVersion === renderVersion.current) {
                setSvgStr(svg);
                setRenderError(null);
                isInitialRender.current = false;
              }
            } catch (errFix: any) {
              try {
                const fallback = generateSafeFallbackFlowchart(finalChart);
                const { svg } = await mermaid.render(`${id}-fb`, fallback);
                if (currentVersion === renderVersion.current) {
                  setSvgStr(svg);
                  setRenderError(null);
                  isInitialRender.current = false;
                }
              } catch (errFb: any) {
                if (currentVersion === renderVersion.current) {
                  setRenderError(renderErr?.message || "Failed to render flowchart layout.");
                }
              }
            }
          }
        } else {
          console.warn("Mermaid validation failed:", errMsg);
          if (currentVersion === renderVersion.current) {
            setRenderError(errMsg || "Invalid Mermaid syntax layout structure.");
          }
        }
      } catch (e: any) {
        console.warn("Mermaid execution error:", e);
        if (currentVersion === renderVersion.current) {
          setRenderError(e?.message || "Unexpected error processing visual blueprint layout.");
        }
      }
    }).catch(err => {
      console.error("Critical render queue failure:", err);
    });
  }, [manipulatedChart]);

  const handleRefresh = useCallback(() => {
    setSvgStr("");
    setRenderError(null);
    const nextIndex = (layoutIndex + 1) % DIRECTIONS.length;
    setLayoutIndex(nextIndex);
    // forceRender will be triggered by useEffect
  }, [layoutIndex]);

  const handleDownload = useCallback(() => {
    if (!svgStr) return;
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mermaid-chart.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [svgStr]);

  useEffect(() => {
    setRenderError(null);
    const timeoutId = setTimeout(() => forceRender(layoutIndex), 150);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [chart, layoutIndex, forceRender]);


  const handleNodeClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as Element;
    // Prioritize individual node over parent cluster/subgraph
    const nodeGroup = target.closest('.node') || target.closest('.edgeLabel') || target.closest('.cluster');
    if (!nodeGroup) return;

    // Extract text content safely
    let textToSearch = nodeGroup.textContent?.trim() || "";
    if (!textToSearch) return;

    textToSearch = textToSearch.replace(/\s+/g, ' ');
    if (textToSearch.length > 90) {
      textToSearch = textToSearch.substring(0, 90).trim() + "...";
    }

    setSelectedNode(textToSearch);
    setDeconstructedData(null);
  }, []);

  if (renderError) {
     return (
        <div className="p-5 border border-dashed border-red-500/20 bg-red-500/[0.01] rounded-2xl text-left no-print space-y-3 my-4">
          <div className="flex items-center gap-2 text-red-500">
            <X className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider font-mono">Flowchart Mapping Issue</span>
          </div>
          <p className="text-[11px] text-muted leading-relaxed">
            This flowchart has minor syntax differences that blocked native SVG building. You can inspect the structural source below or click Rebuilt.
          </p>
          <div className="bg-panel/50 border border-panel-border p-3 rounded-xl font-mono text-[10px] text-red-400 select-all overflow-x-auto max-h-32">
            {renderError}
          </div>
          
          <details className="text-[11px] text-muted cursor-pointer">
            <summary className="hover:text-main focus:outline-none py-1 select-none font-bold">Show source layout structure...</summary>
            <pre className="mt-2 p-3 bg-panel border border-panel-border rounded-xl text-[10px] text-main overflow-x-auto select-all leading-relaxed whitespace-pre max-h-48 font-mono">
              {chart}
            </pre>
          </details>
        </div>
     );
  }

  if (!svgStr) {
     return (
        <div className="text-muted text-sm italic animate-pulse py-12 text-center border border-dashed border-panel-border rounded-lg no-print">
           Generating diagram...
        </div>
     );
  }

  return (
    <div className="mermaid my-6 w-full no-print-break not-prose isolate z-[1]" style={{ isolation: 'isolate', zIndex: 1 }}>
      <style dangerouslySetInnerHTML={{ __html: themeCssVariables }} />
      <div className={`w-full mx-auto mermaid-theme-override relative group`}>
        <TransformWrapper
          initialScale={1}
          minScale={0.1}
          maxScale={8}
          centerOnInit={true}
          wheel={{ step: 0.1, disabled: true }}
          panning={{ disabled: !isTouchInteractive, velocityDisabled: false }}
          pinch={{ disabled: !isTouchInteractive }}
          doubleClick={{ disabled: !isTouchInteractive, mode: "zoomIn" }}
        >
          {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
            <>
              <div className="absolute top-2 right-2 flex flex-wrap items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-10 bg-panel/90 backdrop-blur-md p-1.5 rounded-xl border border-panel-border shadow-md no-print max-w-[calc(100%-16px)]">
                <button
                  onClick={() => setIsTouchInteractive(!isTouchInteractive)}
                  className={`p-2.5 sm:p-1.5 transition-all rounded flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 ${
                    isTouchInteractive 
                      ? 'text-amber-500 bg-amber-500/10 border border-amber-500/20 font-bold' 
                      : 'text-muted hover:text-main'
                  }`}
                  title={isTouchInteractive ? "Lock controls (Allows page scrolling on tablet/phone)" : "Unlock controls (Enable Pan & Zoom)"}
                >
                  {isTouchInteractive ? <LockOpen size={16} /> : <Lock size={16} />}
                  <span className="text-[10px] font-black uppercase tracking-wider hidden md:inline-block">
                    {isTouchInteractive ? "Active" : "Locked"}
                  </span>
                </button>
                <div className="w-px h-6 bg-panel-border mx-0.5 self-center" />
                <button
                  onClick={() => setIsFullScreen(true)}
                  className="p-2.5 sm:p-1.5 hover:bg-input text-main transition-colors rounded min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                  title="Expand Full Screen Studio"
                >
                  <Expand size={16} />
                </button>
                <div className="w-px h-6 bg-panel-border mx-0.5 self-center" />
                <button
                  onClick={handleRefresh}
                  className="p-2.5 sm:p-1.5 hover:bg-input text-main transition-colors rounded min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                  title={`Cycle Layout Orientation (Current: ${DIRECTIONS[layoutIndex % DIRECTIONS.length]})`}
                >
                  <RefreshCw size={16} />
                </button>
                <div className="w-px h-6 bg-panel-border mx-0.5 self-center" />
                <button
                  onClick={() => setIsFitToWidth(!isFitToWidth)}
                  className={`p-2.5 sm:p-1.5 hover:bg-input transition-colors rounded min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center ${isFitToWidth ? 'text-accent bg-accent/10' : 'text-main'}`}
                  title={isFitToWidth ? "Disable Fit to Width" : "Enable Fit to Width"}
                >
                  <MoveHorizontal size={16} />
                </button>
                <div className="w-px h-6 bg-panel-border mx-0.5 self-center" />
                <button
                  onClick={() => {
                    setIsTouchInteractive(true);
                    setIsFitToWidth(false);
                    zoomIn();
                  }}
                  className="p-2.5 sm:p-1.5 hover:bg-input text-main transition-colors rounded min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => {
                    setIsTouchInteractive(true);
                    setIsFitToWidth(false);
                    zoomOut();
                  }}
                  className="p-2.5 sm:p-1.5 hover:bg-input text-main transition-colors rounded min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  onClick={() => {
                    resetTransform();
                    setIsFitToWidth(true);
                    setIsTouchInteractive(false);
                  }}
                  className="p-2.5 sm:p-1.5 hover:bg-input text-main transition-colors rounded min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                  title="Reset Zoom"
                >
                  <Maximize size={16} />
                </button>
                <div className="w-px h-6 bg-panel-border mx-0.5 self-center" />
                <button
                  onClick={enrichDiagramWithAI}
                  disabled={isEnriching}
                  className="p-2.5 sm:p-1.5 hover:bg-input text-main transition-colors rounded min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center text-accent disabled:opacity-50"
                  title="Enrich Diagram with AI (Expand Concepts & Precedents)"
                >
                  {isEnriching ? (
                    <RefreshCw size={16} className="animate-spin text-accent" />
                  ) : enrichSuccess ? (
                    <Check size={16} className="text-emerald-500" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                </button>
                <div className="w-px h-6 bg-panel-border mx-0.5 self-center" />
                <button
                  onClick={handleDownload}
                  className="p-2.5 sm:p-1.5 hover:bg-input text-main transition-colors rounded min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                  title="Download SVG"
                >
                  <Download size={16} />
                </button>
              </div>
              
              <TransformComponent 
                wrapperClass={`!w-full !min-h-[300px] sm:!min-h-[420px] select-none no-print-break relative ${isTouchInteractive ? 'cursor-grab active:cursor-grabbing touch-none' : 'overflow-auto'}`}
                contentClass={`!w-full select-none ${isTouchInteractive ? 'touch-none' : ''}`}
              >
                <div 
                  onClick={handleNodeClick}
                  dangerouslySetInnerHTML={{ __html: svgStr }} 
                  className={`mermaid-content w-full flex justify-center [&_.node]:cursor-pointer [&_.node]:transition-opacity hover:[&_.node]:opacity-80 [&_.cluster]:cursor-pointer [&_.edgeLabel]:cursor-pointer [&>svg]:!min-w-0 [&>svg]:!w-full [&>svg]:!max-w-full [&>svg]:!h-auto [&>svg]:mx-auto`} 
                />
              </TransformComponent>
              
              {!isTouchInteractive && (
                <div className="absolute bottom-2 left-2 pointer-events-none z-10 bg-panel/75 backdrop-blur-xs px-2.5 py-1 rounded-md border border-panel-border/50 text-[10px] font-medium text-muted/80 flex items-center gap-1.5 shadow-xs no-print select-none">
                  <Lock size={10} className="text-muted/60" />
                  <span>Diagram Locked (Swipe to Scroll Notes)</span>
                </div>
              )}
              {isTouchInteractive && (
                <div className="absolute bottom-2 left-2 pointer-events-none z-10 bg-amber-500/10 backdrop-blur-xs px-2.5 py-1 rounded-md border border-amber-500/20 text-[10px] font-semibold text-amber-500 flex items-center gap-1.5 shadow-xs no-print select-none">
                  <LockOpen size={10} className="animate-pulse" />
                  <span>Diagram Interactive (Pan & Zoom Active)</span>
                </div>
              )}

              <DiagramLegend 
                isOpen={isLegendOpen} 
                onClose={() => setIsLegendOpen(false)} 
                onToggle={() => setIsLegendOpen(!isLegendOpen)} 
              />
            </>
          )}
        </TransformWrapper>
      </div>

      {/* CONCEPT INTERACTIVE INSPECTOR PANEL */}
      {selectedNode && (
        <div className="mt-4 p-4 border border-panel-border bg-panel text-main rounded-xl shadow-sm animate-fadeIn text-left text-sm relative no-print w-full max-w-full overflow-hidden">
          <button 
            onClick={() => { setSelectedNode(null); setDeconstructedData(null); }}
            className="absolute top-3 right-3 text-muted hover:text-main cursor-pointer p-1 rounded-md hover:bg-input transition-colors focus-visible:outline-none"
            title="Close Inspector"
          >
            <X size={16} />
          </button>
          
          <div className="flex items-start gap-3 pr-6 min-w-0">
            <span className="p-1 px-2.5 bg-accent/15 border border-accent/20 rounded-lg text-accent font-extrabold text-[10px] select-none uppercase tracking-wider font-mono shrink-0">
              Concept Overview
            </span>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-main text-sm sm:text-base tracking-tight capitalize select-all truncate" title={selectedNode}>
                {selectedNode}
              </h4>
              <p className="text-[11px] text-muted mt-0.5">
                UPSC High-Yield Topic. Rapid conceptual overview and syllabus alignment.
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-panel-border/60 flex flex-col gap-3 w-full max-w-full">
            {isDeconstructing ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2 animate-pulse">
                <RefreshCw className="w-5 h-5 text-accent animate-spin" />
                <p className="text-xs text-muted font-mono">UPSC Mentor AI is synthesizing executive overview...</p>
              </div>
            ) : deconstructedData ? (
              <div className="space-y-3 w-full max-w-full">
                <div className="p-3.5 bg-accent/[0.04] border border-accent/20 rounded-xl text-main select-text w-full max-w-full overflow-hidden">
                  <div className="markdown-body prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-headings:text-accent prose-headings:tracking-wide prose-headings:text-xs prose-headings:mt-3 prose-headings:mb-1.5 prose-headings:border-b prose-headings:border-accent/15 prose-headings:pb-0.5 prose-p:text-xs prose-p:text-main prose-p:leading-relaxed prose-p:my-1 prose-li:text-xs prose-li:text-main prose-li:leading-relaxed prose-li:my-0.5 prose-strong:text-accent break-words whitespace-normal overflow-wrap-anywhere">
                    <Markdown remarkPlugins={[remarkGfm]}>{deconstructedData}</Markdown>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => { setSelectedNode(null); setDeconstructedData(null); }}
                    className="text-xs text-muted hover:text-main underline cursor-pointer"
                  >
                    Close Inspector
                  </button>
                  <p className="text-[10px] text-muted font-mono italic">Executive Overview • UPSC High-Yield Focus</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-input/50 p-3 rounded-xl border border-panel-border/50">
                <span className="text-[11px] text-muted leading-relaxed max-w-md">
                  Synthesize key syllabus anchors, administrative challenges, and ARC-II / NITI commission reforms.
                </span>
                
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => { setSelectedNode(null); setDeconstructedData(null); }}
                    className="px-3 py-2 text-xs text-muted hover:text-main rounded-lg hover:bg-input transition-colors cursor-pointer border border-panel-border/40 font-semibold"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={deconstructConcept}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg text-[11px] font-bold shadow-sm transition-all cursor-pointer hover:shadow hover:translate-y-[-1px] active:translate-y-[1px] shrink-0 font-mono"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>OVERVIEW WITH AI</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAILED INTERACTIVE FULL SCREEN FLOWCHART STUDIO MODAL */}
      {isFullScreen && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-[99999] bg-[#090d16] flex flex-col p-3 sm:p-6 text-main animate-fadeIn overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Studio Header Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4 mb-3 sm:mb-4 bg-slate-900 px-4 py-3 rounded-2xl border border-white/10 shadow-lg shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-accent/20 border border-accent/40 rounded-xl text-accent shrink-0">
                <Expand className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h3 className="font-sans font-extrabold text-white text-sm sm:text-base uppercase tracking-wider flex items-center gap-2 truncate">
                  <span>Aspirant Flowchart Studio</span>
                  <span className="text-[10px] font-mono font-normal bg-accent/30 text-accent px-2 py-0.5 rounded-full border border-accent/40 hidden sm:inline-block">
                    High Resolution
                  </span>
                </h3>
                <p className="font-sans text-[11px] text-zinc-300 hidden sm:block truncate">
                  Drag to pan, scroll to zoom, click any node to inspect. Press Escape to exit.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {/* Canvas Theme Toggle */}
              <button
                onClick={() => setFullscreenCanvasMode(prev => prev === "light" ? "dark" : "light")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer border border-white/10"
                title={`Switch to ${fullscreenCanvasMode === 'light' ? 'Dark Canvas' : 'Light Canvas'}`}
              >
                {fullscreenCanvasMode === "light" ? (
                  <>
                    <Moon size={14} className="text-amber-300" />
                    <span className="hidden sm:inline">Dark Studio</span>
                  </>
                ) : (
                  <>
                    <Sun size={14} className="text-amber-400" />
                    <span className="hidden sm:inline">Light Paper</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsFullScreen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                title="Close Studio (Esc)"
              >
                <X size={16} />
                <span>Close (Esc)</span>
              </button>
            </div>
          </div>

          {/* Studio Canvas Area */}
          <div className={`flex-1 w-full rounded-2xl border relative overflow-hidden flex items-center justify-center transition-colors shadow-2xl min-h-0 ${fullscreenCanvasMode === 'light' ? 'bg-[#fcfdfd] text-slate-900 border-slate-300' : 'bg-[#0f172a] text-white border-white/10'}`}>
            <TransformWrapper
              initialScale={1}
              minScale={0.1}
              maxScale={8}
              centerOnInit={true}
              wheel={{ step: 0.1, disabled: false }}
              panning={{ disabled: false, velocityDisabled: false }}
              pinch={{ disabled: false }}
              doubleClick={{ disabled: false, mode: "zoomIn" }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div className="absolute top-4 right-4 flex space-x-1.5 z-20 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-white/15 shadow-xl text-white">
                    <button
                      onClick={enrichDiagramWithAI}
                      disabled={isEnriching}
                      className="p-2 hover:bg-white/10 text-accent transition-colors rounded-lg cursor-pointer disabled:opacity-50"
                      title="Enrich Diagram with AI"
                    >
                      {isEnriching ? <RefreshCw size={18} className="animate-spin text-accent" /> : <Sparkles size={18} />}
                    </button>
                    <div className="w-px h-6 bg-white/15 mx-0.5 self-center" />
                    <button
                      onClick={() => zoomIn()}
                      className="p-2 hover:bg-white/10 text-zinc-200 hover:text-white transition-colors rounded-lg cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn size={18} />
                    </button>
                    <button
                      onClick={() => zoomOut()}
                      className="p-2 hover:bg-white/10 text-zinc-200 hover:text-white transition-colors rounded-lg cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut size={18} />
                    </button>
                    <button
                      onClick={() => resetTransform()}
                      className="p-2 hover:bg-white/10 text-zinc-200 hover:text-white transition-colors rounded-lg cursor-pointer"
                      title="Reset Zoom"
                    >
                      <Maximize size={18} />
                    </button>
                    <div className="w-px h-6 bg-white/15 mx-0.5 self-center" />
                    <button
                      onClick={handleDownload}
                      className="p-2 hover:bg-white/10 text-zinc-200 hover:text-white transition-colors rounded-lg cursor-pointer"
                      title="Download SVG"
                    >
                      <Download size={18} />
                    </button>
                  </div>

                  <TransformComponent 
                    wrapperClass="!w-full !h-full cursor-grab active:cursor-grabbing touch-none select-none"
                    contentClass="!w-full !h-full touch-none select-none flex items-center justify-center"
                  >
                    <div 
                      onClick={handleNodeClick}
                      dangerouslySetInnerHTML={{ __html: svgStr }} 
                      className="mermaid-content w-full h-full flex items-center justify-center p-8 [&_svg]:!w-auto [&_svg]:!h-auto [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:object-contain [&_.node]:cursor-pointer"
                    />
                  </TransformComponent>

                  <DiagramLegend 
                    isOpen={isFullscreenLegendOpen} 
                    onClose={() => setIsFullscreenLegendOpen(false)} 
                    onToggle={() => setIsFullscreenLegendOpen(!isFullscreenLegendOpen)} 
                  />
                </>
              )}
            </TransformWrapper>
          </div>

          {/* Node Inspector Inside Fullscreen if active */}
          {selectedNode && (
            <div className="mt-3 p-4 bg-slate-900 border border-white/20 rounded-xl shadow-2xl text-left text-sm max-h-[32vh] overflow-y-auto animate-fadeIn relative text-white w-full max-w-full overflow-x-hidden shrink-0">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 sticky top-0 bg-slate-900 z-10">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="p-0.5 px-2 bg-accent/25 border border-accent/40 rounded text-accent font-extrabold text-[10px] uppercase font-mono shrink-0">
                    Executive Overview
                  </span>
                  <h4 className="font-bold text-white text-xs sm:text-sm capitalize truncate max-w-[400px]" title={selectedNode}>
                    {selectedNode}
                  </h4>
                </div>
                <button 
                  onClick={() => { setSelectedNode(null); setDeconstructedData(null); }}
                  className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer shrink-0"
                  title="Close Inspector"
                >
                  <X size={16} />
                </button>
              </div>

              {isDeconstructing ? (
                <div className="py-4 flex items-center justify-center gap-2 text-zinc-300 text-xs">
                  <RefreshCw className="w-4 h-4 text-accent animate-spin" />
                  <span>Generating rapid executive overview...</span>
                </div>
              ) : deconstructedData ? (
                <div className="markdown-body prose prose-sm max-w-none text-zinc-200 prose-invert prose-headings:font-bold prose-headings:text-accent prose-headings:text-xs prose-headings:mt-2.5 prose-headings:mb-1 prose-headings:border-b prose-headings:border-white/10 prose-headings:pb-0.5 prose-p:text-xs prose-p:leading-relaxed prose-p:my-1 prose-li:text-xs prose-li:leading-relaxed prose-li:my-0.5 break-words whitespace-normal overflow-wrap-anywhere">
                  <Markdown remarkPlugins={[remarkGfm]}>{deconstructedData}</Markdown>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-300">
                    Instant conceptual overview: core definition, syllabus link, bottlenecks & ARC-II/NITI reforms.
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { setSelectedNode(null); setDeconstructedData(null); }}
                      className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={deconstructConcept}
                      className="px-3 py-1.5 bg-accent hover:bg-accent/90 text-white rounded-lg text-xs font-bold font-mono cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Overview with AI</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
});

