import type { TokenStats } from "../lib/tokenCounter";

interface Props {
  stats: TokenStats | null;
}

function StatRow({
  label,
  jsonVal,
  toonVal,
  unit,
}: {
  label: string;
  jsonVal: number;
  toonVal: number;
  unit: string;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{label}</span>
      <span className="text-[12px] text-gray-600 dark:text-gray-400 font-mono text-right">
        {jsonVal.toLocaleString()} {unit}
      </span>
      <span className="text-[12px] text-gray-800 dark:text-gray-200 font-mono text-right font-medium">
        {toonVal.toLocaleString()} {unit}
      </span>
    </div>
  );
}

function ReductionBadge({ value, label }: { value: number; label: string }) {
  const color =
    value >= 50
      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900"
      : value >= 25
      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900"
      : value > 0
      ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border-amber-100 dark:border-amber-900"
      : "text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800";

  return (
    <div className={`flex flex-col items-center p-3 rounded-lg border ${color}`}>
      <span className="text-2xl font-bold font-mono leading-none">
        {value}%
      </span>
      <span className="text-[10px] mt-1 font-medium uppercase tracking-wide opacity-70">
        {label}
      </span>
    </div>
  );
}

export default function StatsPanel({ stats }: Props) {
  if (!stats) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-[#1a1c26]">
          <span className="text-[11px] font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">
            Statistics
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-300 dark:text-gray-600 text-[12px] p-4">
          Convert JSON to see statistics
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-[#1a1c26]">
        <span className="text-[11px] font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">
          Statistics
        </span>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {/* Reduction badges */}
        <div className="grid grid-cols-2 gap-2">
          <ReductionBadge value={stats.tokenReduction} label="Token saving" />
          <ReductionBadge value={stats.charReduction} label="Char saving" />
        </div>

        {/* Comparison table */}
        <div>
          <div className="grid grid-cols-3 gap-2 pb-1.5 border-b border-gray-200 dark:border-gray-700">
            <span className="text-[10px] text-gray-300 dark:text-gray-600 font-semibold uppercase tracking-wider">
              Metric
            </span>
            <span className="text-[10px] text-gray-300 dark:text-gray-600 font-semibold uppercase tracking-wider text-right">
              JSON
            </span>
            <span className="text-[10px] text-gray-300 dark:text-gray-600 font-semibold uppercase tracking-wider text-right">
              TOON
            </span>
          </div>
          <StatRow
            label="Tokens (est.)"
            jsonVal={stats.jsonTokens}
            toonVal={stats.toonTokens}
            unit=""
          />
          <StatRow
            label="Characters"
            jsonVal={stats.jsonChars}
            toonVal={stats.toonChars}
            unit=""
          />
        </div>

        {/* Visual bar */}
        <div className="space-y-1.5">
          <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
            Size comparison
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 w-10 shrink-0">JSON</span>
              <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gray-300 dark:bg-gray-600 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 w-10 shrink-0">TOON</span>
              <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 dark:bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${100 - stats.charReduction}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="text-[10px] text-gray-300 dark:text-gray-600 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
          Token estimates use ~4 chars/token heuristic (GPT-style BPE approximation). Actual counts may vary by model tokenizer.
        </div>
      </div>
    </div>
  );
}
