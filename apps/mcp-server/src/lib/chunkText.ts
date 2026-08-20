/**
 * Splits text into sentence-aware chunks of roughly `maxWords` words each.
 * We approximate tokens using word count (~0.75 words per token is common,
 * but we keep it simple and just cap words per chunk).
 */
export function chunkText(text: string, maxWords = 400): string[] {
  const sentences = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/);

  const chunks: string[] = [];
  let current: string[] = [];
  let currentWordCount = 0;

  for (const sentence of sentences) {
    const wordCount = sentence.split(/\s+/).length;

    if (currentWordCount + wordCount > maxWords && current.length > 0) {
      chunks.push(current.join(" "));
      current = [];
      currentWordCount = 0;
    }

    current.push(sentence);
    currentWordCount += wordCount;
  }

  if (current.length > 0) {
    chunks.push(current.join(" "));
  }

  return chunks.length > 0 ? chunks : [text];
}