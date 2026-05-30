# telemetry-toon-lab

Convert telemetry & security JSON into compact formats and visualize token savings for LLM pipelines.

## Output Formats

### Compact (pipe-separated)

Strips JSON syntax into a dense single-line notation:

```
method:POST|path:/api/v2/events|status:201|headers:{authorization:Bearer ***}
```

### TOON Schema (table-oriented)

Eliminates repeated field names in object arrays by declaring a schema once:

```
context:
  task: Our favorite hikes together
  location: Boulder
friends[3]: ana,luis,sam
hikes[2]{id,name,distanceKm,elevationGain,companion,wasSunny}:
  1,Blue Lake Trail,7.5,320,ana,true
  2,Ridge Overlook,9.2,540,luis,false
```

**Rules:**
- `key: value` — primitive values
- `key:` — nested object (children indented)
- `key[N]: v1,v2,...` — primitive array
- `key[N]{f1,f2,...}:` — homogeneous object array as table (schema declared once, rows are values only)
- `~` = null, `true`/`false` = booleans

## Features

- **Dual output** — Compact + TOON Schema side-by-side
- **Token stats** — estimated token & character savings per format
- **Sample datasets** — HTTP logs, security alerts, K8s events, cloud audit
- **Syntax highlighting** — color-coded output for both formats
- **Dark mode** — toggle with localStorage persistence

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4

## Project Structure

```
src/
├── lib/
│   ├── toonConverter.ts         # Compact JSON converter
│   ├── toonSchemaConverter.ts   # TOON Schema converter
│   ├── tokenCounter.ts          # Token estimation & stats
│   └── sampleData.ts            # Sample telemetry datasets
├── components/
│   ├── JsonEditor.tsx            # JSON input with line numbers
│   ├── DualOutputPanel.tsx       # Dual output with inline stats
│   └── SampleSelector.tsx        # Sample dataset buttons
├── App.tsx                       # Main application
├── index.css                     # Global styles
└── main.tsx                      # Entry point
```

## License

MIT
