/**
 * TOON Schema Converter
 *
 * Converts JSON into a schema-oriented TOON format that eliminates
 * repeated field names in arrays of objects by representing them as
 * tables with a schema declaration.
 *
 * Format rules:
 *   - Primitive values:      key: value
 *   - Nested objects:        key:\n  child: value
 *   - Primitive arrays:      key[N]: v1,v2,v3
 *   - Object arrays (homo):  key[N]{f1,f2,...}:\n  v1,v2,...\n  v1,v2,...
 *   - Null → ~, booleans → true/false
 */

// ── Helpers ──────────────────────────────────────────────────────────

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isPrimitive(v: unknown): boolean {
  return v === null || v === undefined || typeof v !== "object";
}

/**
 * Format a primitive for a key: value line.
 * Strings are unquoted unless they contain newlines.
 */
function formatPrimitive(value: unknown): string {
  if (value === null || value === undefined) return "~";
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (value.includes("\n")) {
      return '"' + value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n") + '"';
    }
    return value;
  }
  return String(value);
}

/**
 * Format a value for use inside a comma-separated data row.
 * Quotes strings that contain commas/newlines; uses compact notation for objects/arrays.
 */
function formatRowValue(value: unknown): string {
  if (value === null || value === undefined) return "~";
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (value.includes(",") || value.includes("\n")) {
      return '"' + value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n") + '"';
    }
    return value;
  }
  if (Array.isArray(value)) {
    return "[" + value.map(formatRowValue).join(",") + "]";
  }
  if (isPlainObject(value)) {
    const pairs = Object.entries(value).map(([k, v]) => `${k}:${formatRowValue(v)}`);
    return "{" + pairs.join("|") + "}";
  }
  return String(value);
}

/**
 * Check if all items in an array are objects with identical keys.
 * Returns the key list (preserving first item's order) or null.
 */
function getHomogeneousKeys(arr: unknown[]): string[] | null {
  if (arr.length === 0) return null;
  if (!arr.every(isPlainObject)) return null;
  const first = arr[0] as Record<string, unknown>;
  const keys = Object.keys(first);
  const signature = keys.slice().sort().join("\0");
  for (let i = 1; i < arr.length; i++) {
    const item = arr[i] as Record<string, unknown>;
    if (Object.keys(item).slice().sort().join("\0") !== signature) return null;
  }
  return keys;
}

// ── Renderers ────────────────────────────────────────────────────────

function renderObject(obj: Record<string, unknown>, indent: number): string {
  const pad = "  ".repeat(indent);
  const lines: string[] = [];

  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) continue;

    if (isPrimitive(val)) {
      lines.push(`${pad}${key}: ${formatPrimitive(val)}`);
    } else if (Array.isArray(val)) {
      lines.push(...renderArrayField(key, val, indent));
    } else if (isPlainObject(val)) {
      lines.push(`${pad}${key}:`);
      lines.push(renderObject(val, indent + 1));
    }
  }

  return lines.join("\n");
}

function renderArrayField(key: string, arr: unknown[], indent: number): string[] {
  const pad = "  ".repeat(indent);
  const lines: string[] = [];

  // Empty array
  if (arr.length === 0) {
    lines.push(`${pad}${key}[0]:`);
    return lines;
  }

  // All-primitive array → inline
  if (arr.every(isPrimitive)) {
    lines.push(`${pad}${key}[${arr.length}]: ${arr.map(formatRowValue).join(",")}`);
    return lines;
  }

  // Homogeneous object array → table format
  const homoKeys = getHomogeneousKeys(arr);
  if (homoKeys) {
    lines.push(`${pad}${key}[${arr.length}]{${homoKeys.join(",")}}:`);
    for (const item of arr) {
      const obj = item as Record<string, unknown>;
      const vals = homoKeys.map((k) => formatRowValue(obj[k]));
      lines.push(`${pad}  ${vals.join(",")}`);
    }
    return lines;
  }

  // Non-homogeneous / mixed array → per-item fallback
  lines.push(`${pad}${key}[${arr.length}]:`);
  for (const item of arr) {
    if (isPlainObject(item)) {
      lines.push(`${pad}  -`);
      lines.push(renderObject(item, indent + 2));
    } else if (Array.isArray(item)) {
      lines.push(`${pad}  ${formatRowValue(item)}`);
    } else {
      lines.push(`${pad}  ${formatPrimitive(item)}`);
    }
  }
  return lines;
}

function renderTopArray(arr: unknown[], indent: number): string {
  const pad = "  ".repeat(indent);

  if (arr.length === 0) return "[0]:";

  if (arr.every(isPrimitive)) {
    return `[${arr.length}]: ${arr.map(formatRowValue).join(",")}`;
  }

  const homoKeys = getHomogeneousKeys(arr);
  if (homoKeys) {
    const lines = [`[${arr.length}]{${homoKeys.join(",")}}:`];
    for (const item of arr) {
      const obj = item as Record<string, unknown>;
      const vals = homoKeys.map((k) => formatRowValue(obj[k]));
      lines.push(`${pad}  ${vals.join(",")}`);
    }
    return lines.join("\n");
  }

  const lines = [`[${arr.length}]:`];
  for (const item of arr) {
    if (isPlainObject(item)) {
      lines.push(`${pad}  -`);
      lines.push(renderObject(item, indent + 1));
    } else {
      lines.push(`${pad}  ${formatRowValue(item)}`);
    }
  }
  return lines.join("\n");
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Parse a JSON string and convert to TOON Schema format.
 * Throws if the JSON is invalid.
 */
export function convertToToonSchema(jsonString: string): string {
  const parsed = JSON.parse(jsonString);
  if (parsed === null || parsed === undefined) return "~";
  if (typeof parsed !== "object") return formatPrimitive(parsed);
  if (Array.isArray(parsed)) return renderTopArray(parsed, 0);
  return renderObject(parsed as Record<string, unknown>, 0);
}
