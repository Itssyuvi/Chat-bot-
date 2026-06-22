import { faqData, type FaqEntry } from "./faq-data"

/**
 * Lightweight NLP FAQ matcher.
 *
 * Mirrors the Python implementation (chatbot.py): text preprocessing
 * (lowercasing, punctuation stripping, stopword removal, light stemming),
 * TF-IDF vectorization, and cosine similarity to rank FAQ matches.
 */

const STOPWORDS = new Set([
  "a","an","the","and","or","but","if","while","is","are","was","were","be","been","being",
  "to","of","in","on","at","by","for","with","about","as","into","like","through","after",
  "over","between","out","against","during","without","before","under","around","among",
  "i","me","my","we","our","you","your","he","him","his","she","her","it","its","they",
  "them","their","this","that","these","those","do","does","did","doing","have","has","had",
  "can","could","should","would","will","shall","may","might","must","am","so","than","too",
  "very","just","there","here","what","which","who","whom","how","when","where","why",
])

/** Lowercase, strip punctuation, tokenize, remove stopwords, light stem. */
export function preprocess(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem)
}

/** Very small Porter-ish suffix stripper — good enough for FAQ matching. */
function stem(word: string): string {
  if (word.length <= 3) return word
  for (const suffix of ["ing", "ly", "ed", "ies", "ess", "es", "s"]) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
      return word.slice(0, -suffix.length)
    }
  }
  return word
}

type Vocab = Map<string, number>

type Model = {
  vocab: Vocab
  idf: number[]
  docVectors: number[][]
  entries: FaqEntry[]
}

function termFreq(tokens: string[], vocab: Vocab): number[] {
  const vec = new Array(vocab.size).fill(0)
  for (const tok of tokens) {
    const idx = vocab.get(tok)
    if (idx !== undefined) vec[idx] += 1
  }
  const total = tokens.length || 1
  return vec.map((c) => c / total)
}

function dot(a: number[], b: number[]): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}

function norm(a: number[]): number {
  return Math.sqrt(dot(a, a))
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const denom = norm(a) * norm(b)
  return denom === 0 ? 0 : dot(a, b) / denom
}

/** Build a TF-IDF model from the FAQ corpus once. */
function buildModel(): Model {
  const docs = faqData.map((f) => preprocess(`${f.question} ${f.answer}`))

  const vocab: Vocab = new Map()
  for (const doc of docs) {
    for (const tok of doc) {
      if (!vocab.has(tok)) vocab.set(tok, vocab.size)
    }
  }

  // Document frequency for each term
  const df = new Array(vocab.size).fill(0)
  for (const doc of docs) {
    const seen = new Set(doc)
    for (const tok of seen) {
      const idx = vocab.get(tok)!
      df[idx] += 1
    }
  }

  const N = docs.length
  const idf = df.map((d) => Math.log((1 + N) / (1 + d)) + 1)

  const docVectors = docs.map((doc) => {
    const tf = termFreq(doc, vocab)
    return tf.map((v, i) => v * idf[i])
  })

  return { vocab, idf, docVectors, entries: faqData }
}

const model = buildModel()

export type MatchResult = {
  answer: string
  question: string
  category: string
  score: number
  matched: boolean
}

const FALLBACK =
  "I'm not sure I understood that. Could you rephrase your question? You can ask me about accounts, billing, shipping, or technical support."

/**
 * Find the best FAQ answer for a user query.
 * @param query user input
 * @param threshold minimum cosine similarity to count as a match (0-1)
 * @param category optional category filter
 */
export function getResponse(query: string, threshold = 0.15, category = "All"): MatchResult {
  const tokens = preprocess(query)
  const tf = termFreq(tokens, model.vocab)
  const queryVec = tf.map((v, i) => v * model.idf[i])

  let bestIdx = -1
  let bestScore = 0

  for (let i = 0; i < model.docVectors.length; i++) {
    if (category !== "All" && model.entries[i].category !== category) continue
    const score = cosineSimilarity(queryVec, model.docVectors[i])
    if (score > bestScore) {
      bestScore = score
      bestIdx = i
    }
  }

  if (bestIdx === -1 || bestScore < threshold) {
    return {
      answer: FALLBACK,
      question: "",
      category: "",
      score: bestScore,
      matched: false,
    }
  }

  const entry = model.entries[bestIdx]
  return {
    answer: entry.answer,
    question: entry.question,
    category: entry.category,
    score: bestScore,
    matched: true,
  }
}

/** Suggest the top-N most relevant FAQ questions for a query (used for "did you mean"). */
export function suggestQuestions(query: string, n = 3, category = "All"): FaqEntry[] {
  const tokens = preprocess(query)
  const tf = termFreq(tokens, model.vocab)
  const queryVec = tf.map((v, i) => v * model.idf[i])

  return model.entries
    .map((entry, i) => ({ entry, score: cosineSimilarity(queryVec, model.docVectors[i]) }))
    .filter(({ entry }) => category === "All" || entry.category === category)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .filter(({ score }) => score > 0)
    .map(({ entry }) => entry)
}
