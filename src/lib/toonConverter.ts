/**
 * TOON (Terse Object-Oriented Notation) Converter
 *
 * Converts JSON into a compact, human-readable notation designed to
 * minimize token usage for LLM pipelines while preserving all data.
 *
 * Format rules:
 *   - Objects use `key:value` pairs separated by `|`
 *   - Nested objects are wrapped in `{}`
 *   - Arrays are wrapped in `[]` with items separated by `,`
 *   - Strings are unquoted unless they contain reserved chars
 *   - Nulls → `~`, booleans → `T`/`F`
 *   - Top-level object omits outer braces
 */

const RESERVED_CHARS = /[{}[\]|,:\\~]/;

function escapeString(value: string): string {
  if (value === "") return '""';
  if (RESERVED_CHARS.test(value) || value === "T" || value === "F" || value === "~") {
    // Escape backslashes and quotes, then wrap in quotes
    return '"' + value.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
  }
  // Trim check — if leading/trailing whitespace matters, quote it
  if (value !== value.trim()) {
    return '"' + value.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
  }
  return value;
}

function convertValue(value: unknown): string {
  if (value === null || value === undefined) return "~";
  if (typeof value === "boolean") return value ? "T" : "F";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return escapeString(value);
  if (Array.isArray(value)) return convertArray(value);
  if (typeof value === "object") return convertObject(value as Record<string, unknown>, false);
  return String(value);
}

function convertArray(arr: unknown[]): string {
  if (arr.length === 0) return "[]";
  const items = arr.map((item) => convertValue(item));
  return "[" + items.join(",") + "]";
}

function convertObject(obj: Record<string, unknown>, isTopLevel: boolean): string {
  const keys = Object.keys(obj);
  if (keys.length === 0) return isTopLevel ? "" : "{}";

  const pairs = keys.map((key) => {
    const escapedKey = escapeString(key);
    const val = convertValue(obj[key]);
    return escapedKey + ":" + val;
  });

  const body = pairs.join("|");
  return isTopLevel ? body : "{" + body + "}";
}

/**
 * Convert a parsed JSON value to TOON format.
 */
export function jsonToToon(input: unknown): string {
  if (input === null || input === undefined) return "~";
  if (typeof input !== "object") return convertValue(input);
  if (Array.isArray(input)) return convertArray(input);
  return convertObject(input as Record<string, unknown>, true);
}

/**
 * Parse a JSON string and convert to TOON.
 * Throws if the JSON is invalid.
 */
export function convertJsonStringToToon(jsonString: string): string {
  const parsed = JSON.parse(jsonString);
  return jsonToToon(parsed);
}
