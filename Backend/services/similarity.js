/**
 * Similarity service — three-layer duplicate detection
 *
 * Layer 1: Jaccard (keyword overlap)         threshold ≥ 0.85
 * Layer 2: Levenshtein (edit distance)       threshold ≥ 0.75
 * Layer 3: MiniLM cosine (semantic)          threshold ≥ 0.88
 *
 * Embedding model: Xenova/all-MiniLM-L6-v2 (384-dim)
 * Loaded via @xenova/transformers (Transformers.js) — runs locally in Node.js
 * No GPU required; CPU-only with thread limit set for reasonableness.
 */

const { distance: levenshteinDistance } = require('fastest-levenshtein');
const { env, pipeline } = require('@xenova/transformers');

// Limit CPU threads to avoid saturating the process
env.backends.onnx.wasm.numThreads = 2;

// ─── Singleton embedding model ─────────────────────────────────────────────
// Loaded once; all calls reuse the same pipeline instance.
let embeddingPipeline = null;

async function getEmbeddingPipeline() {
  if (embeddingPipeline) return embeddingPipeline;
  embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    quantized: false,
  });
  return embeddingPipeline;
}

/**
 * generateEmbedding(text) — returns number[] (384-dim MiniLM embedding)
 * First call is slow (model download ~90MB, cached locally).
 * Failures return null (non-fatal; callers fall back to Jaccard+Levenshtein).
 */
async function generateEmbedding(text) {
  try {
    const extractor = await getEmbeddingPipeline();
    const result = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(result.data);
  } catch (err) {
    console.error('Embedding generation failed:', err.message);
    return null;
  }
}

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

module.exports = { isSimilar, jaccardSimilarity, levenshteinSimilarity, cosineSimilarity, generateEmbedding };