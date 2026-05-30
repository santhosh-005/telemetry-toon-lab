import { useRef, useEffect } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  error: string | null;
}

export default function JsonEditor({ value, onChange, error }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    syncScroll();
  }, [value]);

  function syncScroll() {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }

  const lineCount = value.split("\n").length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50/80">
        <span className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
          Input · JSON
        </span>
        {error && (
          <span className="text-[10px] font-medium text-red-500 truncate max-w-[200px]">
            {error}
          </span>
        )}
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div
          ref={lineNumbersRef}
          className="flex-none w-10 bg-gray-50/60 border-r border-gray-100 overflow-hidden select-none pt-3 pb-3 text-right pr-2"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className="text-[11px] leading-[20px] text-gray-300 font-mono"
            >
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          spellCheck={false}
          placeholder='Paste JSON here...'
          className={`flex-1 resize-none p-3 font-mono text-[12px] leading-[20px] bg-white text-gray-800 outline-none placeholder-gray-300 ${
            error ? "ring-1 ring-inset ring-red-200" : ""
          }`}
        />
      </div>
    </div>
  );
}
