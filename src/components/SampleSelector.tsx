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
              ? "border-gray-800 bg-gray-800 text-white"
              : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 bg-white"
          }`}
        >
          {sample.label}
        </button>
      ))}
    </div>
  );
}
