import { useState, useCallback, useEffect } from "react";
import JsonEditor from "./components/JsonEditor";
import DualOutputPanel from "./components/DualOutputPanel";
import SampleSelector from "./components/SampleSelector";
import { convertJsonStringToToon } from "./lib/toonConverter";
import { convertToToonSchema } from "./lib/toonSchemaConverter";
import { computeStats, type TokenStats } from "./lib/tokenCounter";
import { sampleDatasets } from "./lib/sampleData";

function App() {
  const [jsonInput, setJsonInput] = useState("");
  const [compactOutput, setCompactOutput] = useState("");
  const [schemaOutput, setSchemaOutput] = useState("");
  const [compactStats, setCompactStats] = useState<TokenStats | null>(null);
  const [schemaStats, setSchemaStats] = useState<TokenStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSample, setActiveSample] = useState<number | null>(null);
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const convertBoth = useCallback((json: string) => {
    try {
      const compact = convertJsonStringToToon(json);
      const schema = convertToToonSchema(json);
      setCompactOutput(compact);
      setSchemaOutput(schema);
      setCompactStats(computeStats(json, compact));
      setSchemaStats(computeStats(json, schema));
      setError(null);
    } catch (e) {
      setError(e instanceof SyntaxError ? e.message : "Invalid JSON");
      setCompactOutput("");
      setSchemaOutput("");
      setCompactStats(null);
      setSchemaStats(null);
    }
  }, []);

  const handleConvert = useCallback(() => {
    if (!jsonInput.trim()) {
      setError("Input is empty");
      return;
    }
    convertBoth(jsonInput);
  }, [jsonInput, convertBoth]);

  const handleJsonChange = useCallback((value: string) => {
    setJsonInput(value);
    setActiveSample(null);
    setError(null);
  }, []);

  const handleSampleSelect = useCallback((json: string) => {
    setJsonInput(json);
    setError(null);

    const idx = sampleDatasets.findIndex(
      (s) => JSON.stringify(s.json, null, 2) === json
    );
    setActiveSample(idx >= 0 ? idx : null);

    // Auto-convert both formats
    convertBoth(json);
  }, [convertBoth]);

  const handleClear = useCallback(() => {
    setJsonInput("");
    setCompactOutput("");
    setSchemaOutput("");
    setCompactStats(null);
    setSchemaStats(null);
    setError(null);
    setActiveSample(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117] text-gray-800 dark:text-gray-200 flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161820]">
        <div className="max-w-[1440px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-gray-800 dark:text-gray-200">{"{ }"}</span>
              <h1 className="text-sm font-semibold tracking-tight text-gray-800 dark:text-gray-200">
                telemetry-toon-lab
              </h1>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded">
              v2.0
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-400 dark:text-gray-500 hidden sm:inline">
              JSON → TOON converter for LLM pipelines
            </span>
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark((d) => !d)}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161820]">
        <div className="max-w-[1440px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider shrink-0">
              Samples
            </span>
            <SampleSelector onSelect={handleSampleSelect} activeIndex={activeSample} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="text-[11px] px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={handleConvert}
              className="text-[11px] px-4 py-1.5 rounded-md bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Convert →
            </button>
          </div>
        </div>
      </div>

      {/* Main panels: JSON editor + dual output */}
      <main className="flex-1 min-h-0">
        <div className="max-w-[1440px] mx-auto px-4 py-4 h-[calc(100vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full">
            {/* JSON Input */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-[#161820] shadow-sm min-h-[300px]">
              <JsonEditor
                value={jsonInput}
                onChange={handleJsonChange}
                error={error}
              />
            </div>

            {/* Dual output: Compact + TOON Schema */}
            <div className="min-h-[300px]">
              <DualOutputPanel
                compactOutput={compactOutput}
                schemaOutput={schemaOutput}
                compactStats={compactStats}
                schemaStats={schemaStats}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161820]">
        <div className="max-w-[1440px] mx-auto px-4 py-2 flex items-center justify-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
          <span>made with</span>
          <span className="text-red-400">❤️</span>
          <span>by</span>
          <a
            href="https://github.com/santhosh-005"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors"
          >
            santhosh
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
