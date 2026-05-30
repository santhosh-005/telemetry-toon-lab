import React, { useState, useCallback } from "react";
import type { TokenStats } from "../lib/tokenCounter";

// ── Props ────────────────────────────────────────────────────────────

interface Props {
  compactOutput: string;
  schemaOutput: string;
  compactStats: TokenStats | null;
  schemaStats: TokenStats | null;
}

// ══════════════════════════════════════════════════════════════════════
// COMPACT HIGHLIGHTER  (pipe-separated format)
// ══════════════════════════════════════════════════════════════════════

function highlightCompact(toon: string): React.JSX.Element[] {
  const elements: React.JSX.Element[] = [];
  let i = 0;
  let k = 0;

  while (i < toon.length) {
    const ch = toon[i];

    if ("{}[]".includes(ch)) {
      elements.push(<span key={k++} className="text-gray-400 dark:text-gray-500 font-semibold">{ch}</span>);
      i++;
    } else if (ch === "|") {
      elements.push(<span key={k++} className="text-gray-300 dark:text-gray-600">{ch}</span>);
      i++;
    } else if (ch === ",") {
      elements.push(<span key={k++} className="text-gray-300 dark:text-gray-600">{ch}</span>);
      i++;
    } else if (ch === ":") {
      elements.push(<span key={k++} className="text-blue-300 dark:text-blue-500">{ch}</span>);
      i++;
    } else if (ch === "~") {
      elements.push(<span key={k++} className="text-orange-400 italic">{ch}</span>);
      i++;
    } else if (ch === '"') {
      let str = '"';
      i++;
      while (i < toon.length) {
        if (toon[i] === "\\" && i + 1 < toon.length) { str += toon[i] + toon[i + 1]; i += 2; }
        else if (toon[i] === '"') { str += '"'; i++; break; }
        else { str += toon[i]; i++; }
      }
      elements.push(<span key={k++} className="text-emerald-600 dark:text-emerald-400">{str}</span>);
    } else {
      let val = "";
      while (i < toon.length && !"|:,{}[]".includes(toon[i])) { val += toon[i]; i++; }
      if (val === "T" || val === "F") {
        elements.push(<span key={k++} className="text-violet-500 dark:text-violet-400 font-medium">{val}</span>);
      } else if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(val)) {
        elements.push(<span key={k++} className="text-blue-500 dark:text-blue-400">{val}</span>);
      } else {
        elements.push(<span key={k++} className="text-gray-700 dark:text-gray-300">{val}</span>);
      }
    }
  }
  return elements;
}

/** Split compact TOON at top-level `|` for visual line breaks */
function wrapCompactLines(toon: string): string[] {
  const lines: string[] = [];
  let depth = 0;
  let current = "";
  for (let i = 0; i < toon.length; i++) {
    const ch = toon[i];
    if (ch === "{" || ch === "[") { depth++; current += ch; }
    else if (ch === "}" || ch === "]") { depth--; current += ch; }
    else if (ch === '"') {
      current += ch; i++;
      while (i < toon.length) {
        if (toon[i] === "\\" && i + 1 < toon.length) { current += toon[i] + toon[i + 1]; i += 2; continue; }
        current += toon[i];
        if (toon[i] === '"') break;
        i++;
      }
    } else if (ch === "|" && depth === 0) {
      lines.push(current); current = "";
    } else { current += ch; }
  }
  if (current) lines.push(current);
  return lines;
}

// ══════════════════════════════════════════════════════════════════════
// SCHEMA HIGHLIGHTER  (TOON Schema format)
// ══════════════════════════════════════════════════════════════════════

/** Split comma-separated row respecting quotes and nested {}/[] */
function splitRow(row: string): string[] {
  const parts: string[] = [];
  let current = "";
  let inQuote = false;
  let depth = 0;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (inQuote) {
      current += ch;
      if (ch === "\\" && i + 1 < row.length) { current += row[++i]; }
      else if (ch === '"') { inQuote = false; }
    } else if (ch === '"') {
      inQuote = true; current += ch;
    } else if (ch === "{" || ch === "[") {
      depth++; current += ch;
    } else if (ch === "}" || ch === "]") {
      depth--; current += ch;
    } else if (ch === "," && depth === 0) {
      parts.push(current); current = "";
    } else { current += ch; }
  }
  if (current) parts.push(current);
  return parts;
}

function colorValue(val: string, key: number): React.JSX.Element {
  const v = val.trim();
  if (v === "~") return <span key={key} className="text-orange-400 italic">~</span>;
  if (v === "true" || v === "false") return <span key={key} className="text-violet-500 dark:text-violet-400">{v}</span>;
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(v)) return <span key={key} className="text-blue-500 dark:text-blue-400">{v}</span>;
  if (v.startsWith('"')) return <span key={key} className="text-emerald-600 dark:text-emerald-400">{v}</span>;
  if (v.startsWith("{") || v.startsWith("[")) return <span key={key} className="text-gray-400 dark:text-gray-500">{v}</span>;
  return <span key={key} className="text-gray-800 dark:text-gray-200">{v}</span>;
}

function highlightSchemaLine(line: string, lineKey: number): React.JSX.Element {
  const trimmed = line.trimStart();
  const indent = line.substring(0, line.length - trimmed.length);

  // 1. Schema header: key[N]{fields}:
  const schemaMatch = trimmed.match(/^(.+)\[(\d+)\]\{(.+)\}:$/);
  if (schemaMatch) {
    return (
      <div key={lineKey}>
        {indent}
        <span className="text-gray-700 dark:text-gray-300">{schemaMatch[1]}</span>
        <span className="text-gray-400 dark:text-gray-500">[</span>
        <span className="text-blue-500 dark:text-blue-400">{schemaMatch[2]}</span>
        <span className="text-gray-400 dark:text-gray-500">]</span>
        <span className="text-gray-400 dark:text-gray-500">{"{"}</span>
        <span className="text-violet-500 dark:text-violet-400">{schemaMatch[3]}</span>
        <span className="text-gray-400 dark:text-gray-500">{"}"}</span>
        <span className="text-blue-300 dark:text-blue-500">:</span>
      </div>
    );
  }

  // 2. Primitive array: key[N]: values
  const primArrMatch = trimmed.match(/^(.+)\[(\d+)\]:\s(.+)$/);
  if (primArrMatch) {
    const values = splitRow(primArrMatch[3]);
    return (
      <div key={lineKey}>
        {indent}
        <span className="text-gray-700 dark:text-gray-300">{primArrMatch[1]}</span>
        <span className="text-gray-400 dark:text-gray-500">[</span>
        <span className="text-blue-500 dark:text-blue-400">{primArrMatch[2]}</span>
        <span className="text-gray-400 dark:text-gray-500">]</span>
        <span className="text-blue-300 dark:text-blue-500">: </span>
        {values.map((v, vi) => (
          <React.Fragment key={vi}>
            {vi > 0 && <span className="text-gray-300 dark:text-gray-600">,</span>}
            {colorValue(v, vi)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // 3. Empty/mixed array header: key[N]:
  const arrHeaderMatch = trimmed.match(/^(.+)\[(\d+)\]:$/);
  if (arrHeaderMatch) {
    return (
      <div key={lineKey}>
        {indent}
        <span className="text-gray-700 dark:text-gray-300">{arrHeaderMatch[1]}</span>
        <span className="text-gray-400 dark:text-gray-500">[</span>
        <span className="text-blue-500 dark:text-blue-400">{arrHeaderMatch[2]}</span>
        <span className="text-gray-400 dark:text-gray-500">]</span>
        <span className="text-blue-300 dark:text-blue-500">:</span>
      </div>
    );
  }

  // 4. Key-value: key: value  (key starts with letter/underscore/digit or quoted)
  const kvMatch = trimmed.match(/^([a-zA-Z_][\w.:-]*?):\s(.+)$/);
  if (kvMatch) {
    return (
      <div key={lineKey}>
        {indent}
        <span className="text-gray-500 dark:text-gray-400">{kvMatch[1]}</span>
        <span className="text-blue-300 dark:text-blue-500">: </span>
        {colorValue(kvMatch[2], 0)}
      </div>
    );
  }

  // 5. Nested object header: key:
  const nestedMatch = trimmed.match(/^([a-zA-Z_][\w.:-]*):$/);
  if (nestedMatch) {
    return (
      <div key={lineKey}>
        {indent}
        <span className="text-gray-700 dark:text-gray-300 font-medium">{nestedMatch[1]}</span>
        <span className="text-blue-300 dark:text-blue-500">:</span>
      </div>
    );
  }

  // 6. Mixed array item separator: -
  if (trimmed === "-") {
    return (
      <div key={lineKey}>
        {indent}
        <span className="text-gray-400 dark:text-gray-600">-</span>
      </div>
    );
  }

  // 7. Data row (comma-separated values)
  if (trimmed.includes(",")) {
    const values = splitRow(trimmed);
    return (
      <div key={lineKey}>
        {indent}
        {values.map((v, vi) => (
          <React.Fragment key={vi}>
            {vi > 0 && <span className="text-gray-300 dark:text-gray-600">,</span>}
            {colorValue(v, vi)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // 8. Fallback: plain text
  return (
    <div key={lineKey}>
      <span className="text-gray-700 dark:text-gray-300">{line}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// STATS DISPLAY (prominent, primary output)
// ══════════════════════════════════════════════════════════════════════

function StatsDisplay({ stats }: { stats: TokenStats }) {
  const badgeColor = (val: number) =>
    val >= 50
      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/60"
      : val >= 25
      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-800/60"
      : val > 0
      ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-800/60"
      : "text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";

  return (
    <div className="shrink-0 border-t border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-[#1a1c26] px-4 py-3 flex items-center justify-between gap-3 text-[13px] font-mono select-none overflow-x-auto scrollbar-none">
      {/* Badges & Stats unified in a single row */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[13.5px] font-extrabold tracking-tight ${badgeColor(stats.tokenReduction)}`}>
          <span>↓{stats.tokenReduction}%</span>
          <span className="text-[9.5px] font-bold opacity-80 uppercase tracking-widest">tokens</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[13.5px] font-extrabold tracking-tight ${badgeColor(stats.charReduction)}`}>
          <span>↓{stats.charReduction}%</span>
          <span className="text-[9.5px] font-bold opacity-80 uppercase tracking-widest">chars</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 shrink-0 text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 dark:text-gray-500 font-semibold text-[11px] uppercase tracking-wider">Tok:</span>
          <span className="font-semibold text-gray-600 dark:text-gray-300">{stats.jsonTokens.toLocaleString()}</span>
          <span className="text-gray-300 dark:text-gray-700 font-light">→</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[14.5px]">{stats.toonTokens.toLocaleString()}</span>
        </div>
        <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-800"></div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 dark:text-gray-500 font-semibold text-[11px] uppercase tracking-wider">Chr:</span>
          <span className="font-semibold text-gray-600 dark:text-gray-300">{stats.jsonChars.toLocaleString()}</span>
          <span className="text-gray-300 dark:text-gray-700 font-light">→</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[14.5px]">{stats.toonChars.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// OUTPUT SECTION (reusable for each format)
// ══════════════════════════════════════════════════════════════════════

function OutputSection({
  title,
  output,
  stats,
  renderContent,
  placeholder,
}: {
  title: string;
  output: string;
  stats: TokenStats | null;
  renderContent: (text: string) => React.JSX.Element;
  placeholder: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [output]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-[#1a1c26] shrink-0">
        <span className="text-[11px] font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">
          {title}
        </span>
        <button
          onClick={handleCopy}
          disabled={!output}
          className="text-[10px] font-medium px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto p-3 bg-white dark:bg-[#161820]">
        {output ? (
          renderContent(output)
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300 dark:text-gray-600 text-[11px]">
            {placeholder}
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && <StatsDisplay stats={stats} />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════

export default function DualOutputPanel({
  compactOutput,
  schemaOutput,
  compactStats,
  schemaStats,
}: Props) {
  const renderCompact = useCallback((text: string) => {
    const lines = wrapCompactLines(text);
    return (
      <pre className="font-mono text-[12px] leading-[20px] whitespace-pre-wrap break-all">
        {lines.map((line, idx) => (
          <div key={idx}>{highlightCompact(line)}</div>
        ))}
      </pre>
    );
  }, []);

  const renderSchema = useCallback((text: string) => {
    const lines = text.split("\n");
    return (
      <pre className="font-mono text-[12px] leading-[20px] whitespace-pre-wrap">
        {lines.map((line, idx) => highlightSchemaLine(line, idx))}
      </pre>
    );
  }, []);

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Top: Compact */}
      <div className="flex-1 flex flex-col min-h-0 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <OutputSection
          title="Compact"
          output={compactOutput}
          stats={compactStats}
          renderContent={renderCompact}
          placeholder="Compact output will appear here"
        />
      </div>

      {/* Bottom: TOON Schema */}
      <div className="flex-1 flex flex-col min-h-0 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <OutputSection
          title="TOON Schema"
          output={schemaOutput}
          stats={schemaStats}
          renderContent={renderSchema}
          placeholder="TOON schema output will appear here"
        />
      </div>
    </div>
  );
}
