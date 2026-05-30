import { useState, useCallback } from "react";
import JsonEditor from "./components/JsonEditor";
import ToonOutput from "./components/ToonOutput";
import StatsPanel from "./components/StatsPanel";
import SampleSelector from "./components/SampleSelector";
import { convertJsonStringToToon } from "./lib/toonConverter";
import { computeStats, type TokenStats } from "./lib/tokenCounter";
import { sampleDatasets } from "./lib/sampleData";

function App() {
  const [jsonInput, setJsonInput] = useState("");
  const [toonOutput, setToonOutput] = useState("");
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSample, setActiveSample] = useState<number | null>(null);

  const handleConvert = useCallback(() => {
    if (!jsonInput.trim()) {
      setError("Input is empty");
      return;
    }
    try {
      const toon = convertJsonStringToToon(jsonInput);
      setToonOutput(toon);
      setStats(computeStats(jsonInput, toon));
      setError(null);
    } catch (e) {
      setError(e instanceof SyntaxError ? e.message : "Invalid JSON");
      setToonOutput("");
      setStats(null);
    }
  }, [jsonInput]);

  const handleJsonChange = useCallback((value: string) => {
    setJsonInput(value);
    setActiveSample(null);
    // Auto-clear error on edit
    setError(null);
  }, []);

  const handleSampleSelect = useCallback((json: string) => {
    setJsonInput(json);
    setError(null);

    // Find which sample was selected
    const idx = sampleDatasets.findIndex(
      (s) => JSON.stringify(s.json, null, 2) === json
    );
    setActiveSample(idx >= 0 ? idx : null);

    // Auto-convert
    try {
      const toon = convertJsonStringToToon(json);
      setToonOutput(toon);
      setStats(computeStats(json, toon));
    } catch {
      // shouldn't happen with our samples
    }
  }, []);

  const handleClear = useCallback(() => {
    setJsonInput("");
    setToonOutput("");
    setStats(null);
    setError(null);
    setActiveSample(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-gray-800">{"{}"}</span>
              <h1 className="text-sm font-semibold tracking-tight text-gray-800">
                telemetry-toon-lab
              </h1>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded">
              v1.0
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span>JSON → TOON converter for LLM pipelines</span>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider shrink-0">
              Samples
            </span>
            <SampleSelector onSelect={handleSampleSelect} activeIndex={activeSample} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="text-[11px] px-3 py-1.5 rounded-md border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={handleConvert}
              className="text-[11px] px-4 py-1.5 rounded-md bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Convert →
            </button>
          </div>
        </div>
      </div>

      {/* Main panels */}
      <main className="flex-1 min-h-0">
        <div className="max-w-[1440px] mx-auto px-4 py-4 h-[calc(100vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_320px] gap-3 h-full">
            {/* JSON Input */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm min-h-[300px]">
              <JsonEditor
                value={jsonInput}
                onChange={handleJsonChange}
                error={error}
              />
            </div>

            {/* TOON Output */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm min-h-[300px]">
              <ToonOutput value={toonOutput} />
            </div>

            {/* Statistics */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm min-h-[300px]">
              <StatsPanel stats={stats} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 py-2 flex items-center justify-center gap-1 text-[11px] text-gray-400">
          <span>made with</span>
          <span className="text-red-400">❤️</span>
          <span>by</span>
          <a
            href="https://github.com/santhosh-005"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            santhosh
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
