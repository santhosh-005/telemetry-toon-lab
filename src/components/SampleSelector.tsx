import { sampleDatasets } from "../lib/sampleData";

interface Props {
  onSelect: (json: string) => void;
  activeIndex: number | null;
}

export default function SampleSelector({ onSelect, activeIndex }: Props) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {sampleDatasets.map((sample, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(JSON.stringify(sample.json, null, 2))}
          title={sample.description}
          className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
            activeIndex === idx
              ? "border-gray-800 dark:border-gray-200 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900"
              : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-[#161820]"
          }`}
        >
          {sample.label}
        </button>
      ))}
    </div>
  );
}
