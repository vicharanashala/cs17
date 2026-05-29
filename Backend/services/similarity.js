/**
 * Similarity service — three-layer duplicate detection
 *
 * Layer 1: Jaccard (keyword overlap)         threshold ≥ 0.85
 * Layer 2: Levenshtein (edit distance)       threshold ≥ 0.75
 * Layer 3: MiniLM cosine (semantic)          threshold ≥ 0.88
 *
 * MiniLM is marked TODO — replace with actual embedding call when the
 * Python FastAPI microservice is running. For now it returns 0 (no match).
 */

const { distance: levenshteinDistance } = require('fastest-levenshtein');

// ─── Layer 1: Jaccard ───────────────────────────────────────────────────────
function tokenize(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean)
  );
}

function jaccardSimilarity(a, b) {
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

// ─── Layer 2: Levenshtein ───────────────────────────────────────────────────
function levenshteinSimilarity(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  return 1 - dist / maxLen;
}

// ─── Layer 3: MiniLM cosine ─────────────────────────────────────────────────
// TODO: Call the FastAPI microservice at process.env.MINIML_API_URL
// For now returns 0 so it never falsely triggers.
function cosineSimilarity(embA, embB) {
  if (!embA || !embB || embA.length !== embB.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < embA.length; i++) {
    dot   += embA[i] * embB[i];
    normA += embA[i] * embA[i];
    normB += embB[i] * embB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ─── Main export ────────────────────────────────────────────────────────────
/**
 * isSimilar(titleA, titleB, embA?, embB?)
 * Returns { similar: boolean, method: string, score: number }
 */
function isSimilar(titleA, titleB, embA = null, embB = null) {
  const j = jaccardSimilarity(titleA, titleB);
  if (j >= 0.85) return { similar: true, method: 'jaccard', score: j };

  const l = levenshteinSimilarity(titleA, titleB);
  if (l >= 0.75) return { similar: true, method: 'levenshtein', score: l };

  const c = cosineSimilarity(embA, embB);
  if (c >= 0.88) return { similar: true, method: 'cosine', score: c };

  return { similar: false, method: null, score: Math.max(j, l, c) };
}

module.exports = { isSimilar, jaccardSimilarity, levenshteinSimilarity, cosineSimilarity };
