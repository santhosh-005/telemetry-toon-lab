import React, { useState, useCallback } from "react";

interface Props {
  value: string;
}

function highlightToon(toon: string): React.JSX.Element[] {
  const elements: React.JSX.Element[] = [];
  let i = 0;
  let keyIdx = 0;

  while (i < toon.length) {
    const ch = toon[i];

    if (ch === "{" || ch === "}" || ch === "[" || ch === "]") {
      elements.push(
        <span key={keyIdx++} className="text-gray-400 dark:text-gray-500 font-semibold">
          {ch}
        </span>
      );
      i++;
    } else if (ch === "|") {
      elements.push(
        <span key={keyIdx++} className="text-gray-300 dark:text-gray-600">
          {ch}
        </span>
      );
      i++;
    } else if (ch === ",") {
      elements.push(
        <span key={keyIdx++} className="text-gray-300 dark:text-gray-600">
          {ch}
        </span>
      );
      i++;
    } else if (ch === ":") {
      elements.push(
        <span key={keyIdx++} className="text-blue-300 dark:text-blue-500">
          {ch}
        </span>
      );
      i++;
    } else if (ch === "~") {
      elements.push(
        <span key={keyIdx++} className="text-orange-400 italic">
          {ch}
        </span>
      );
      i++;
    } else if (ch === '"') {
      // quoted string
      let str = '"';
      i++;
      while (i < toon.length) {
        if (toon[i] === "\\" && i + 1 < toon.length) {
          str += toon[i] + toon[i + 1];
          i += 2;
        } else if (toon[i] === '"') {
          str += '"';
          i++;
          break;
        } else {
          str += toon[i];
          i++;
        }
      }
      elements.push(
        <span key={keyIdx++} className="text-emerald-600 dark:text-emerald-400">
          {str}
        </span>
      );
    } else {
      // unquoted value — collect until delimiter
      let val = "";
      while (
        i < toon.length &&
        !"|:,{}[]".includes(toon[i])
      ) {
        val += toon[i];
        i++;
      }
      if (val === "T" || val === "F") {
        elements.push(
          <span key={keyIdx++} className="text-violet-500 dark:text-violet-400 font-medium">
            {val}
          </span>
        );
      } else if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(val)) {
        elements.push(
          <span key={keyIdx++} className="text-blue-500 dark:text-blue-400">
            {val}
          </span>
        );
      } else {
        elements.push(
          <span key={keyIdx++} className="text-gray-700 dark:text-gray-300">
            {val}
          </span>
        );
      }
    }
  }

  return elements;
}

export default function ToonOutput({ value }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value]);

  const displayLines = value ? wrapToonLines(value) : [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-[#1a1c26]">
        <span className="text-[11px] font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">
          Output · TOON
        </span>
        <button
          onClick={handleCopy}
          disabled={!value}
          className="text-[10px] font-medium px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-3 bg-white dark:bg-[#161820]">
        {value ? (
          <pre className="font-mono text-[12px] leading-[20px] whitespace-pre-wrap break-all">
            {displayLines.map((line, idx) => (
              <div key={idx}>{highlightToon(line)}</div>
            ))}
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300 dark:text-gray-600 text-[12px]">
            TOON output will appear here
          </div>
        )}
      </div>
    </div>
  );
}

/** Split TOON at top-level `|` delimiters for readable display */
function wrapToonLines(toon: string): string[] {
  const lines: string[] = [];
  let depth = 0;
  let current = "";

  for (let i = 0; i < toon.length; i++) {
    const ch = toon[i];
    if (ch === "{" || ch === "[") {
      depth++;
      current += ch;
    } else if (ch === "}" || ch === "]") {
      depth--;
      current += ch;
    } else if (ch === '"') {
      current += ch;
      i++;
      while (i < toon.length) {
        if (toon[i] === "\\" && i + 1 < toon.length) {
          current += toon[i] + toon[i + 1];
          i += 2;
          continue;
        }
        current += toon[i];
        if (toon[i] === '"') break;
        i++;
      }
    } else if (ch === "|" && depth === 0) {
      lines.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current) lines.push(current);
  return lines;
}
