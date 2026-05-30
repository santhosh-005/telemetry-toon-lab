# telemetry-toon-lab

Convert telemetry & security JSON into compact **TOON** (Terse Object-Oriented Notation) and visualize token savings for LLM pipelines.

## What is TOON?

TOON is a compact text notation that strips JSON's syntactic overhead — quotes, commas, colons, whitespace — into a denser format:

```
// JSON (164 chars)
{"method":"POST","path":"/api/v2/events","status":201,"duration_ms":142,"headers":{"authorization":"Bearer ***"}}

// TOON (89 chars)
method:POST|path:/api/v2/events|status:201|duration_ms:142|headers:{authorization:Bearer ***}
```

**Key rules:**
- `key:value` pairs separated by `|`
- Nested objects in `{}`
- Arrays in `[]`, comma-separated
- Strings unquoted unless they contain reserved chars
- `~` = null, `T`/`F` = booleans

## Features

- **Three-panel layout** — JSON input, TOON output, statistics
- **Token reduction stats** — estimated token & character savings
- **Sample datasets** — HTTP logs, security alerts, K8s events, cloud audit
- **Syntax highlighting** — color-coded TOON output
- **Copy to clipboard** — one-click TOON copy

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
│   ├── toonConverter.ts   # JSON → TOON conversion logic
│   ├── tokenCounter.ts    # Token estimation & stats
│   └── sampleData.ts      # Sample telemetry datasets
├── components/
│   ├── JsonEditor.tsx      # JSON input with line numbers
│   ├── ToonOutput.tsx      # Highlighted TOON output
│   ├── StatsPanel.tsx      # Reduction statistics
│   └── SampleSelector.tsx  # Sample dataset buttons
├── App.tsx                 # Main application
├── index.css               # Global styles
└── main.tsx                # Entry point
```

## License

MIT
