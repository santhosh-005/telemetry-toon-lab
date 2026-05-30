/**
 * Token Counter
 *
 * Estimates token count using a simple heuristic that approximates
 * GPT-style BPE tokenization. This avoids heavy dependencies like
 * tiktoken while giving a reasonable estimate for comparison purposes.
 *
 * Heuristic: split on whitespace and punctuation boundaries, count fragments.
 * Roughly 1 token ≈ 4 characters for English text (OpenAI guideline).
 */

/**
 * Estimate token count using character-based heuristic (1 token ≈ 4 chars).
 * This aligns with OpenAI's rule-of-thumb and is consistent across formats.
 */
export function estimateTokens(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  return Math.ceil(text.length / 4);
}

export interface TokenStats {
  jsonTokens: number;
  toonTokens: number;
  jsonChars: number;
  toonChars: number;
  tokenReduction: number; // percentage
  charReduction: number;  // percentage
}

export function computeStats(jsonText: string, toonText: string): TokenStats {
  const jsonTokens = estimateTokens(jsonText);
  const toonTokens = estimateTokens(toonText);
  const jsonChars = jsonText.length;
  const toonChars = toonText.length;

  const tokenReduction = jsonTokens > 0
    ? Math.round(((jsonTokens - toonTokens) / jsonTokens) * 100)
    : 0;

  const charReduction = jsonChars > 0
    ? Math.round(((jsonChars - toonChars) / jsonChars) * 100)
    : 0;

  return {
    jsonTokens,
    toonTokens,
    jsonChars,
    toonChars,
    tokenReduction,
    charReduction,
  };
}
