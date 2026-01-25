import { connectToDatabase } from '@/lib/db/mongodb'

const COLLECTION_NAME = 'admininstitutes'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TrieNode {
  c: Record<string, TrieNode>
  d: SuggestionItem[]
}

interface SuggestionItem {
  _k: string
  type: 'Institute' | 'Program' | 'Course'
  id: string
  slug: string
  name: string
  logo?: string
  city?: string
  state?: string
  pSlug?: string
  cSlug?: string
  institute?: string
  programme?: string
}

interface ProgramFull extends SuggestionItem {
  courseCount: number
  eligibilityExams: string[]
  placementRating?: number
  sampleCourses?: CoursePreview[]
  moreCourses: number
  url: string
}

interface CourseFull extends SuggestionItem {
  duration?: string
  level?: string
  fee?: number
  feeF?: string | null
  tuitionFee?: number
  educationType?: string
  totalSeats?: number
  eligibilityExams: string[]
  avgPackage?: number
  avgPackageF?: string | null
  url: string
  programmeDetails: {
    name: string
    slug: string
    courseCount: number
    placementRating?: number
    eligibilityExams: string[]
  }
}

interface CoursePreview {
  name: string
  slug: string
  duration?: string
  fee?: number
  feeF?: string | null
}

interface DocumentData {
  _id: any
  name?: string
  shortName?: string
  slug?: string
  logo?: string
  coverImage?: string
  type?: string
  location?: {
    city?: string
    state?: string
  }
  contact?: {
    phone?: string[]
  }
  establishedYear?: number
  accreditation?: {
    naac?: {
      grade?: string
    }
  }
  overview?: {
    about?: string
  }
  faculty_student_ratio?: {
    students?: Array<{ key: string; value: string }>
  }
  campusDetails?: {
    facilities_arr?: string[]
  }
  placements?: {
    topRecruiters?: string[]
    averagePackage?: number
  }
  programmes?: ProgrammeData[]
  rankings?: any
  admissions?: any
  researchAndInnovation?: any
  alumniNetwork?: any
  _slug?: string
  _desc?: string | null
  _courses?: number
}

interface ProgrammeData {
  name?: string
  course?: CourseData[]
  courseCount?: number
  eligibilityExams?: string[]
  placementRating?: number
}

interface CourseData {
  _id?: any
  degree?: string
  duration?: string
  level?: string
  courseLevel?: string
  fees?: {
    totalFee?: number
    tuitionFee?: number
  }
  educationType?: string
  totalSeats?: number
  eligibilityExams?: string[]
  placements?: {
    averagePackage?: number
  }
}

interface PerformanceResult {
  timeNs: number
  timeMs: number
  timeSec: number
  searched: number
  found: number
  speed: string
  message: string
}

interface SearchFilters {
  q?: string
  type?: 'institute' | 'programme' | 'course'
  city?: string
  state?: string
  level?: string
  programme?: string
  exam?: string
  course?: string
  page?: number
  limit?: number
}

interface ExploreFilters {
  city?: string
  state?: string
  type?: string
  level?: string
  programme?: string
  exam?: string
  course?: string
  accreditation?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'courses' | 'established'
  sortOrder?: 'asc' | 'desc'
}

interface SearchMatch {
  item: SuggestionItem
  score: number
  matchType: 'exact' | 'prefix' | 'fuzzy' | 'keyword' | 'phonetic' | 'synonym'
}

type IndexKey =
  | 'city'
  | 'state'
  | 'type'
  | 'level'
  | 'programme'
  | 'exam'
  | 'keyword'
  | 'course'

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const slug = (t: string | null | undefined): string =>
  t
    ? t
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    : ''

const fee = (f: number | null | undefined): string | null =>
  f ? `₹${f.toLocaleString('en-IN')}` : null

const getDesc = (doc: DocumentData): string | null => {
  const s = doc?.faculty_student_ratio?.students
  if (Array.isArray(s)) {
    const d = s.find(x => x.key === 'description')
    if (d?.value) return d.value
  }
  return doc?.overview?.about || null
}

// ============================================================================
// FUZZY MATCHING & NLP UTILITIES
// ============================================================================

/**
 * Calculate Levenshtein distance between two strings
 * Used for typo tolerance and fuzzy matching
 */
const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Calculate similarity score (0-1) based on Levenshtein distance
 */
const similarityScore = (a: string, b: string): number => {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase())
  return 1 - distance / maxLen
}

/**
 * Soundex algorithm for phonetic matching
 * Handles common misspellings and similar-sounding words
 */
const soundex = (word: string): string => {
  const a = word.toLowerCase().split('')
  const first = a[0]

  const codes: Record<string, string> = {
    a: '',
    e: '',
    i: '',
    o: '',
    u: '',
    h: '',
    w: '',
    y: '',
    b: '1',
    f: '1',
    p: '1',
    v: '1',
    c: '2',
    g: '2',
    j: '2',
    k: '2',
    q: '2',
    s: '2',
    x: '2',
    z: '2',
    d: '3',
    t: '3',
    l: '4',
    m: '5',
    n: '5',
    r: '6'
  }

  const coded = a
    .map(ch => codes[ch] ?? '')
    .join('')
    .replace(/(.)\1+/g, '$1')
    .replace(/^./, first.toUpperCase())

  return (coded + '0000').slice(0, 4)
}

/**
 * Normalize query for consistent matching
 * Handles common variations, abbreviations, and noise
 */
const normalizeQuery = (query: string): string => {
  return (
    query
      .toLowerCase()
      .trim()
      // Remove special characters but keep spaces
      .replace(/[^\w\s]/g, ' ')
      // Normalize multiple spaces
      .replace(/\s+/g, ' ')
      .trim()
  )
}

/**
 * Tokenize query into meaningful terms
 */
const tokenize = (query: string): string[] => {
  const normalized = normalizeQuery(query)
  return normalized.split(' ').filter(word => word.length > 1)
}

/**
 * Common abbreviation expansions for educational context
 */
const ABBREVIATIONS: Record<string, string[]> = {
  iit: ['indian institute of technology'],
  nit: ['national institute of technology'],
  iiit: ['indian institute of information technology'],
  iim: ['indian institute of management'],
  bits: ['birla institute of technology and science'],
  vit: ['vellore institute of technology'],
  srm: ['srm institute of science and technology'],
  cse: ['computer science engineering', 'computer science'],
  ece: ['electronics and communication engineering'],
  eee: ['electrical and electronics engineering'],
  mech: ['mechanical engineering'],
  civil: ['civil engineering'],
  it: ['information technology'],
  ai: ['artificial intelligence'],
  ml: ['machine learning'],
  ds: ['data science'],
  univ: ['university'],
  uni: ['university'],
  coll: ['college'],
  inst: ['institute'],
  tech: ['technology', 'technical'],
  eng: ['engineering'],
  engg: ['engineering'],
  mgmt: ['management'],
  sci: ['science'],
  govt: ['government'],
  pvt: ['private']
}

/**
 * Expand abbreviations in query
 */
const expandAbbreviations = (tokens: string[]): string[] => {
  const expanded: string[] = []
  for (const token of tokens) {
    expanded.push(token)
    if (ABBREVIATIONS[token]) {
      expanded.push(...ABBREVIATIONS[token])
    }
  }
  return expanded
}

/**
 * Common typo corrections for educational terms
 */
const TYPO_CORRECTIONS: Record<string, string> = {
  enginnering: 'engineering',
  enginering: 'engineering',
  engneering: 'engineering',
  enginneering: 'engineering',
  managment: 'management',
  managemnt: 'management',
  manegement: 'management',
  universty: 'university',
  univeristy: 'university',
  univercity: 'university',
  collage: 'college',
  colege: 'college',
  institue: 'institute',
  instutute: 'institute',
  insitute: 'institute',
  tecnology: 'technology',
  techonlogy: 'technology',
  technolgy: 'technology',
  medicle: 'medical',
  medcal: 'medical',
  pharamcy: 'pharmacy',
  pharmcy: 'pharmacy',
  computor: 'computer',
  compter: 'computer',
  sciance: 'science',
  scince: 'science',
  busines: 'business',
  bussiness: 'business',
  buisness: 'business',
  admision: 'admission',
  admisson: 'admission'
}

/**
 * Correct common typos
 */
const correctTypos = (tokens: string[]): string[] => {
  return tokens.map(token => TYPO_CORRECTIONS[token] || token)
}

/**
 * N-gram generation for partial matching
 */
const generateNgrams = (text: string, n: number = 3): Set<string> => {
  const ngrams = new Set<string>()
  const normalized = text.toLowerCase()
  for (let i = 0; i <= normalized.length - n; i++) {
    ngrams.add(normalized.slice(i, i + n))
  }
  return ngrams
}

/**
 * Calculate n-gram similarity
 */
const ngramSimilarity = (a: string, b: string, n: number = 3): number => {
  const ngramsA = generateNgrams(a, n)
  const ngramsB = generateNgrams(b, n)

  if (ngramsA.size === 0 || ngramsB.size === 0) return 0

  let intersection = 0
  for (const ngram of ngramsA) {
    if (ngramsB.has(ngram)) intersection++
  }

  return (2 * intersection) / (ngramsA.size + ngramsB.size)
}

// ============================================================================
// PERFORMANCE TRACKER
// ============================================================================

class Perf {
  private t0: bigint

  constructor () {
    this.t0 = process.hrtime.bigint()
  }

  done (total: number, found: number): PerformanceResult {
    const ns = Number(process.hrtime.bigint() - this.t0)
    const ms = ns / 1e6
    const sec = ns / 1e9
    return {
      timeNs: ns,
      timeMs: +ms.toFixed(4),
      timeSec: +sec.toFixed(6),
      searched: total,
      found,
      speed: `${Math.round(total / (sec || 1e-6)).toLocaleString()} docs/sec`,
      message: `Found ${found} of ${total.toLocaleString()} in ${ms.toFixed(
        4
      )}ms`
    }
  }
}

// ============================================================================
// ENHANCED TRIE WITH FUZZY MATCHING
// ============================================================================

class Trie {
  root: TrieNode
  n: number
  private allItems: Map<string, SuggestionItem>
  private soundexIndex: Map<string, Set<string>>
  private ngramIndex: Map<string, Set<string>>

  constructor () {
    this.root = { c: {}, d: [] }
    this.n = 0
    this.allItems = new Map()
    this.soundexIndex = new Map()
    this.ngramIndex = new Map()
  }

  add (text: string, data: SuggestionItem): void {
    if (!text) return

    const normalizedText = text.toLowerCase()

    // Store in allItems for fuzzy search
    this.allItems.set(data._k, data)

    // Build soundex index for phonetic matching
    const words = normalizedText.split(/\s+/)
    for (const word of words) {
      if (word.length >= 2) {
        const sx = soundex(word)
        if (!this.soundexIndex.has(sx)) {
          this.soundexIndex.set(sx, new Set())
        }
        this.soundexIndex.get(sx)!.add(data._k)
      }
    }

    // Build n-gram index for partial matching
    const ngrams = generateNgrams(normalizedText, 3)
    for (const ngram of ngrams) {
      if (!this.ngramIndex.has(ngram)) {
        this.ngramIndex.set(ngram, new Set())
      }
      this.ngramIndex.get(ngram)!.add(data._k)
    }

    // Standard trie insertion
    let node = this.root
    for (const ch of normalizedText) {
      if (!node.c[ch]) node.c[ch] = { c: {}, d: [] }
      node = node.c[ch]
      if (node.d.length < 50 && !node.d.some(x => x._k === data._k)) {
        node.d.push(data)
      }
    }
    this.n++
  }

  /**
   * Enhanced find with multiple matching strategies
   */
  find (query: string, limit: number = 10): SuggestionItem[] {
    const matches = this.findWithScores(query, limit * 2)
    return matches.slice(0, limit).map(m => m.item)
  }

  /**
   * Find with detailed scoring for ranking
   */
  findWithScores (query: string, limit: number = 20): SearchMatch[] {
    const results: SearchMatch[] = []
    const seen = new Set<string>()
    const normalizedQuery = normalizeQuery(query)
    const tokens = tokenize(query)
    const expandedTokens = expandAbbreviations(correctTypos(tokens))

    // 1. Exact prefix match (highest priority)
    const exactMatches = this.findExactPrefix(normalizedQuery, limit)
    for (const item of exactMatches) {
      if (!seen.has(item._k)) {
        seen.add(item._k)
        results.push({
          item,
          score: 1.0,
          matchType: 'exact'
        })
      }
    }

    // 2. Prefix match on individual tokens
    for (const token of expandedTokens) {
      const prefixMatches = this.findExactPrefix(token, limit)
      for (const item of prefixMatches) {
        if (!seen.has(item._k)) {
          seen.add(item._k)
          results.push({
            item,
            score: 0.85,
            matchType: 'prefix'
          })
        }
      }
    }

    // 3. Phonetic matching (handles pronunciation-based typos)
    for (const token of tokens) {
      if (token.length >= 2) {
        const sx = soundex(token)
        const phoneticKeys = this.soundexIndex.get(sx)
        if (phoneticKeys) {
          for (const key of phoneticKeys) {
            if (!seen.has(key)) {
              const item = this.allItems.get(key)
              if (item) {
                seen.add(key)
                results.push({
                  item,
                  score: 0.7,
                  matchType: 'phonetic'
                })
              }
            }
          }
        }
      }
    }

    // 4. N-gram matching (handles partial matches and typos)
    const queryNgrams = generateNgrams(normalizedQuery, 3)
    const ngramCounts = new Map<string, number>()

    for (const ngram of queryNgrams) {
      const keys = this.ngramIndex.get(ngram)
      if (keys) {
        for (const key of keys) {
          if (!seen.has(key)) {
            ngramCounts.set(key, (ngramCounts.get(key) || 0) + 1)
          }
        }
      }
    }

    // Sort by n-gram match count
    const ngramMatches = [...ngramCounts.entries()]
      .filter(([_, count]) => count >= Math.min(2, queryNgrams.size * 0.3))
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)

    for (const [key, count] of ngramMatches) {
      const item = this.allItems.get(key)
      if (item) {
        seen.add(key)
        const maxNgrams = Math.max(queryNgrams.size, 1)
        results.push({
          item,
          score: 0.5 + (count / maxNgrams) * 0.3,
          matchType: 'fuzzy'
        })
      }
    }

    // 5. Fuzzy matching using Levenshtein distance (for remaining items)
    if (results.length < limit && normalizedQuery.length >= 3) {
      for (const [key, item] of this.allItems) {
        if (!seen.has(key)) {
          const itemName = item.name.toLowerCase()
          const sim = similarityScore(normalizedQuery, itemName)

          // Also check individual word similarity
          const itemWords = itemName.split(/\s+/)
          let maxWordSim = sim
          for (const word of itemWords) {
            for (const token of tokens) {
              const wordSim = similarityScore(token, word)
              maxWordSim = Math.max(maxWordSim, wordSim)
            }
          }

          if (maxWordSim >= 0.6) {
            seen.add(key)
            results.push({
              item,
              score: maxWordSim * 0.6,
              matchType: 'fuzzy'
            })
          }
        }
      }
    }

    // Sort by score and return top results
    return results.sort((a, b) => b.score - a.score).slice(0, limit)
  }

  private findExactPrefix (query: string, limit: number): SuggestionItem[] {
    let node = this.root
    for (const ch of query.toLowerCase()) {
      if (!node.c[ch]) return []
      node = node.c[ch]
    }
    return node.d.slice(0, limit)
  }
}

// ============================================================================
// INVERTED INDEX
// ============================================================================

class Index {
  m: Record<IndexKey, Map<string, Set<string>>>

  constructor () {
    this.m = {
      city: new Map(),
      state: new Map(),
      type: new Map(),
      level: new Map(),
      programme: new Map(),
      exam: new Map(),
      keyword: new Map(),
      course: new Map()
    }
  }

  add (k: IndexKey, v: string | null | undefined, id: string): void {
    if (!v) return
    const m = this.m[k]
    const key = v.toString().toLowerCase().trim()
    if (!m.has(key)) m.set(key, new Set())
    m.get(key)!.add(id)
  }

  get (k: IndexKey, v: string | null | undefined): Set<string> {
    return v
      ? this.m[k]?.get(v.toString().toLowerCase().trim()) || new Set()
      : new Set()
  }

  /**
   * Fuzzy get - find matches even with typos
   */
  fuzzyGet (
    k: IndexKey,
    v: string | null | undefined,
    threshold: number = 0.7
  ): Set<string> {
    if (!v) return new Set()

    const searchTerm = v.toString().toLowerCase().trim()
    const results = new Set<string>()

    // Exact match first
    const exact = this.get(k, v)
    for (const id of exact) results.add(id)

    // Fuzzy match
    for (const [key, ids] of this.m[k]) {
      if (similarityScore(searchTerm, key) >= threshold) {
        for (const id of ids) results.add(id)
      }
    }

    return results
  }

  and (a: Set<string>, b: Set<string>): Set<string> {
    if (!b?.size) return a
    if (!a?.size) return new Set()
    const [s, l] = a.size <= b.size ? [a, b] : [b, a]
    return new Set([...s].filter(x => l.has(x)))
  }

  or (...sets: Set<string>[]): Set<string> {
    const r = new Set<string>()
    for (const s of sets) if (s) for (const i of s) r.add(i)
    return r
  }

  counts (k: IndexKey, ids: Set<string>): Record<string, number> {
    const r: Record<string, number> = {}
    for (const [v, set] of this.m[k]) {
      const c = [...set].filter(id => ids.has(id)).length
      if (c > 0) r[v] = c
    }
    return r
  }
}

// ============================================================================
// KEYWORD MAPPINGS
// ============================================================================

const KW: Record<string, string[]> = {
  engineering: [
    'b.tech',
    'btech',
    'b.e.',
    'be',
    'm.tech',
    'mtech',
    'm.e.',
    'me',
    'engineering',
    'engg',
    'engineer',
    'b tech',
    'm tech',
    'bachelor of technology',
    'master of technology',
    'bachelor of engineering',
    'master of engineering',
    'computer',
    'mechanical',
    'electrical',
    'civil',
    'electronics',
    'it',
    'cse',
    'ece',
    'information technology',
    'computer science',
    'electronics and communication',
    'electronics & communication',
    'comp',
    'mech',
    'elec',
    'eee',
    'electrical and electronics',
    'auto',
    'automobile',
    'automotive',
    'aeronautical',
    'aerospace',
    'chemical',
    'instrumentation',
    'biomedical',
    'biotechnology engineering',
    'production',
    'industrial',
    'mining',
    'petroleum',
    'textile',
    'agricultural',
    'food technology',
    'polymer'
  ],
  medical: [
    'mbbs',
    'md',
    'ms',
    'bds',
    'mds',
    'nursing',
    'bsc nursing',
    'b.sc nursing',
    'gnm',
    'pharmacy',
    'medical',
    'health',
    'bams',
    'bhms',
    'bpt',
    'mpt',
    'physiotherapy',
    'ayurveda',
    'homeopathy',
    'dental',
    'medicine',
    'bachelor of medicine',
    'doctor of medicine',
    'paramedical',
    'veterinary',
    'bvsc',
    'optometry',
    'radiology',
    'lab technology',
    'anesthesia',
    'operation theatre'
  ],
  management: [
    'mba',
    'bba',
    'pgdm',
    'pgp',
    'management',
    'business',
    'mms',
    'finance',
    'marketing',
    'hr',
    'human resource',
    'operations',
    'supply chain',
    'international business',
    'entrepreneurship',
    'retail',
    'hospital management',
    'event management',
    'executive mba',
    'emba',
    'business administration',
    'master of business',
    'bachelor of business'
  ],
  science: [
    'b.sc',
    'bsc',
    'm.sc',
    'msc',
    'b sc',
    'm sc',
    'science',
    'physics',
    'chemistry',
    'biology',
    'mathematics',
    'maths',
    'stats',
    'statistics',
    'biotechnology',
    'biotech',
    'microbiology',
    'zoology',
    'botany',
    'biochemistry',
    'environmental science',
    'forensic',
    'geology',
    'geography',
    'electronics science',
    'computer science bsc',
    'data science',
    'agriculture',
    'horticulture',
    'fisheries'
  ],
  commerce: [
    'b.com',
    'bcom',
    'm.com',
    'mcom',
    'b com',
    'm com',
    'commerce',
    'accounting',
    'finance',
    'ca',
    'cma',
    'cs',
    'chartered accountant',
    'cost accountant',
    'company secretary',
    'banking',
    'taxation',
    'accounts',
    'book keeping',
    'financial management',
    'bachelor of commerce',
    'master of commerce'
  ],
  arts: [
    'b.a.',
    'ba',
    'm.a.',
    'ma',
    'b a',
    'm a',
    'arts',
    'humanities',
    'literature',
    'english',
    'hindi',
    'history',
    'psychology',
    'sociology',
    'political science',
    'economics',
    'philosophy',
    'journalism',
    'mass communication',
    'media',
    'social work',
    'public administration',
    'anthropology',
    'bachelor of arts',
    'master of arts'
  ],
  law: [
    'llb',
    'llm',
    'll.b',
    'll.m',
    'law',
    'legal',
    'ba llb',
    'bba llb',
    'b.a. llb',
    'bba ll.b',
    'advocate',
    'bachelor of law',
    'master of law',
    'legal studies',
    'corporate law',
    'criminal law',
    'constitutional law',
    'international law',
    '5 year law',
    '3 year law',
    'integrated law'
  ],
  design: [
    'b.des',
    'm.des',
    'bdes',
    'mdes',
    'design',
    'fashion',
    'interior',
    'graphic',
    'ui',
    'ux',
    'product design',
    'textile design',
    'fashion design',
    'interior design',
    'graphic design',
    'web design',
    'animation',
    'vfx',
    'visual effects',
    'game design',
    'communication design',
    'industrial design',
    'jewellery design',
    'accessory design'
  ],
  pharmacy: [
    'b.pharm',
    'bpharm',
    'm.pharm',
    'mpharm',
    'd.pharm',
    'dpharm',
    'b pharm',
    'm pharm',
    'd pharm',
    'pharmacy',
    'pharmaceutical',
    'pharmacology',
    'pharma',
    'bachelor of pharmacy',
    'master of pharmacy',
    'diploma in pharmacy',
    'pharmaceutical sciences',
    'pharmaceutical chemistry'
  ],
  computer: [
    'computer',
    'bca',
    'mca',
    'b.c.a',
    'm.c.a',
    'software',
    'data science',
    'ai',
    'ml',
    'cyber',
    'artificial intelligence',
    'machine learning',
    'cyber security',
    'information technology',
    'it',
    'programming',
    'web development',
    'app development',
    'cloud computing',
    'blockchain',
    'iot',
    'internet of things',
    'software engineering',
    'bachelor of computer application',
    'master of computer application'
  ],
  hotel: [
    'hotel',
    'hospitality',
    'tourism',
    'bhmct',
    'ihm',
    'culinary',
    'chef',
    'hotel management',
    'catering',
    'travel',
    'cruise',
    'airline',
    'cabin crew',
    'food production',
    'food service',
    'housekeeping',
    'front office'
  ],
  education: [
    'b.ed',
    'bed',
    'm.ed',
    'med',
    'b ed',
    'm ed',
    'education',
    'teaching',
    'pedagogy',
    'teacher training',
    'bachelor of education',
    'master of education',
    'elementary education',
    'special education',
    'physical education',
    'd.el.ed',
    'diploma in education'
  ],
  architecture: [
    'b.arch',
    'barch',
    'm.arch',
    'march',
    'architecture',
    'planning',
    'urban planning',
    'landscape',
    'bachelor of architecture',
    'master of architecture'
  ],
  top: [
    'top',
    'best',
    'premier',
    'leading',
    'ranked',
    'famous',
    'popular',
    'top rated'
  ],
  college: [
    'college',
    'institute',
    'university',
    'school',
    'academy',
    'institution'
  ],
  government: ['government', 'public', 'state', 'central', 'govt', 'gov'],
  private: ['private', 'deemed', 'autonomous', 'self-financed', 'self financed']
}

// Build reverse lookup for faster keyword extraction
const KW_REVERSE: Map<string, Set<string>> = new Map()
for (const [category, keywords] of Object.entries(KW)) {
  for (const kw of keywords) {
    if (!KW_REVERSE.has(kw)) KW_REVERSE.set(kw, new Set())
    KW_REVERSE.get(kw)!.add(category)
  }
}

const extractKW = (text: string | null | undefined): string[] => {
  if (!text) return []

  const normalized = normalizeQuery(text)
  const words = normalized.split(/\s+/)
  const kw = new Set<string>()

  // Check individual words
  for (const word of words) {
    // Direct category match
    if (KW[word]) kw.add(word)

    // Reverse lookup
    const categories = KW_REVERSE.get(word)
    if (categories) {
      for (const cat of categories) kw.add(cat)
    }

    // Partial match
    for (const [category, keywords] of Object.entries(KW)) {
      if (keywords.some(k => word.includes(k) || k.includes(word))) {
        kw.add(category)
      }
    }
  }

  // Check multi-word phrases
  for (const [category, keywords] of Object.entries(KW)) {
    for (const keyword of keywords) {
      if (keyword.includes(' ') && normalized.includes(keyword)) {
        kw.add(category)
      }
    }
  }

  return [...kw]
}

// ============================================================================
// SEARCH ENGINE
// ============================================================================

class Engine {
  trie: {
    i: Trie
    p: Trie
    c: Trie
  }
  idx: Index
  docs: Map<string, DocumentData>
  progs: ProgramFull[]
  crses: CourseFull[]
  stats: {
    institutes: number
    programmes: number
    courses: number
  }

  constructor () {
    this.trie = { i: new Trie(), p: new Trie(), c: new Trie() }
    this.idx = new Index()
    this.docs = new Map()
    this.progs = []
    this.crses = []
    this.stats = { institutes: 0, programmes: 0, courses: 0 }
  }

  async build (db: any): Promise<void> {
    const t0 = Date.now()
    console.log('\n' + '═'.repeat(60))
    console.log('  BUILDING INDEX')
    console.log('═'.repeat(60))

    const data: DocumentData[] = await db
      .collection(COLLECTION_NAME)
      .find({})
      .toArray()
    console.log(`  Documents: ${data.length}`)

    for (const doc of data) {
      const id = doc._id.toString()
      const iSlug = doc.slug || slug(doc.name || '')
      const desc = getDesc(doc)

      doc._slug = iSlug
      doc._desc = desc
      doc._courses = 0
      this.docs.set(id, doc)

      if (!doc.name) continue

      const iSug: SuggestionItem = {
        _k: `i-${id}`,
        type: 'Institute',
        id,
        slug: iSlug,
        name: doc.name,
        logo: doc.logo,
        city: doc.location?.city,
        state: doc.location?.state
      }
      this.trie.i.add(doc.name, iSug)
      if (doc.shortName) this.trie.i.add(doc.shortName, iSug)

      if (doc.location?.city) this.idx.add('city', doc.location.city, id)
      if (doc.location?.state) this.idx.add('state', doc.location.state, id)
      if (doc.type) this.idx.add('type', doc.type, id)

      for (const kw of extractKW(doc.name + ' ' + (doc.type || ''))) {
        this.idx.add('keyword', kw, id)
      }

      this.stats.institutes++

      if (!doc.programmes) continue

      for (const prog of doc.programmes) {
        if (!prog.name) continue
        const pSlug = slug(prog.name)
        const pCnt = prog.course?.length || prog.courseCount || 0

        const pSug: SuggestionItem = {
          _k: `p-${id}-${pSlug}`,
          type: 'Program',
          id,
          slug: iSlug,
          pSlug,
          name: prog.name,
          institute: doc.name,
          logo: doc.logo
        }
        this.trie.p.add(prog.name, pSug)

        const pFull: ProgramFull = {
          ...pSug,
          city: doc.location?.city,
          state: doc.location?.state,
          courseCount: pCnt,
          eligibilityExams: prog.eligibilityExams || [],
          placementRating: prog.placementRating,
          sampleCourses: prog.course?.slice(0, 2).map(c => ({
            name: c.degree || '',
            slug: slug(c.degree || ''),
            duration: c.duration,
            fee: c.fees?.totalFee,
            feeF: fee(c.fees?.totalFee)
          })),
          moreCourses: Math.max(0, pCnt - 2),
          url: `/recommendation-collections/${iSlug}?programme=${pSlug}`
        }
        this.progs.push(pFull)

        this.idx.add('programme', prog.name, id)
        for (const kw of extractKW(prog.name)) this.idx.add('keyword', kw, id)
        for (const ex of prog.eligibilityExams || [])
          this.idx.add('exam', ex, id)

        this.stats.programmes++

        if (!prog.course) continue

        for (const c of prog.course) {
          if (!c.degree) continue
          const cSlug = slug(c.degree)
          const lvl = (c.level || c.courseLevel || '').toUpperCase()

          const cSug: SuggestionItem = {
            _k: `c-${id}-${cSlug}`,
            type: 'Course',
            id,
            slug: iSlug,
            pSlug,
            cSlug,
            name: c.degree,
            programme: prog.name,
            institute: doc.name,
            logo: doc.logo
          }
          this.trie.c.add(c.degree, cSug)

          const cFull: CourseFull = {
            ...cSug,
            city: doc.location?.city,
            state: doc.location?.state,
            duration: c.duration,
            level: lvl,
            fee: c.fees?.totalFee,
            feeF: fee(c.fees?.totalFee),
            tuitionFee: c.fees?.tuitionFee,
            educationType: c.educationType,
            totalSeats: c.totalSeats,
            eligibilityExams: c.eligibilityExams || prog.eligibilityExams || [],
            avgPackage: c.placements?.averagePackage,
            avgPackageF: fee(c.placements?.averagePackage),
            url: `/recommendation-collections/${iSlug}?programme=${pSlug}&course=${cSlug}`,
            programmeDetails: {
              name: prog.name,
              slug: pSlug,
              courseCount: pCnt,
              placementRating: prog.placementRating,
              eligibilityExams: prog.eligibilityExams || []
            }
          }
          this.crses.push(cFull)

          if (lvl) this.idx.add('level', lvl, id)
          this.idx.add('course', c.degree, id)

          for (const kw of extractKW(c.degree)) this.idx.add('keyword', kw, id)
          for (const kw of extractKW(prog.name)) this.idx.add('keyword', kw, id)

          doc._courses = (doc._courses || 0) + 1
          this.stats.courses++
        }
      }
    }

    console.log('─'.repeat(60))
    console.log(`  Institutes: ${this.stats.institutes}`)
    console.log(`  Programmes: ${this.stats.programmes}`)
    console.log(`  Courses: ${this.stats.courses}`)
    console.log(`  Keywords: ${this.idx.m.keyword.size}`)
    console.log(`  Time: ${Date.now() - t0}ms`)
    console.log('═'.repeat(60) + '\n')
  }

  /**
   * Enhanced suggest with human-like search understanding
   */
  suggest (q: string | null | undefined, limit: number = 8): any {
    const p = new Perf()

    if (!q?.trim()) {
      return {
        institutes: [],
        programmes: [],
        courses: [],
        performance: p.done(0, 0)
      }
    }

    const query = q.trim()
    const tokens = tokenize(query)
    const correctedTokens = correctTypos(tokens)
    const expandedTokens = expandAbbreviations(correctedTokens)

    // Use enhanced trie search with scoring
    const instMatches = this.trie.i.findWithScores(query, limit * 2)
    const progMatches = this.trie.p.findWithScores(query, limit * 2)
    const courseMatches = this.trie.c.findWithScores(query, limit * 2)

    let insts = instMatches.slice(0, limit).map(m => m.item)
    let progs = progMatches.slice(0, limit).map(m => m.item)
    let crses = courseMatches.slice(0, limit).map(m => m.item)

    // Extract keywords from corrected and expanded tokens
    const kws = extractKW(expandedTokens.join(' '))

    // If trie didn't find much, fall back to keyword search
    if (kws.length && insts.length < 3) {
      let ids: Set<string> = new Set()
      for (const kw of kws) {
        ids = this.idx.or(ids, this.idx.get('keyword', kw))
      }

      // Also try fuzzy matching on city/state names
      for (const token of correctedTokens) {
        ids = this.idx.or(ids, this.idx.fuzzyGet('city', token, 0.8))
        ids = this.idx.or(ids, this.idx.fuzzyGet('state', token, 0.8))
      }

      if (ids.size > 0) {
        const additionalInsts = [...ids]
          .slice(0, limit)
          .map((id): SuggestionItem | null => {
            const d = this.docs.get(id)
            return d
              ? {
                  _k: `i-${id}`,
                  type: 'Institute',
                  id,
                  slug: d._slug || '',
                  name: d.name || '',
                  logo: d.logo,
                  city: d.location?.city,
                  state: d.location?.state
                }
              : null
          })
          .filter((x): x is SuggestionItem => x !== null)

        // Merge with existing results (avoiding duplicates)
        const existingKeys = new Set(insts.map(i => i._k))
        for (const inst of additionalInsts) {
          if (!existingKeys.has(inst._k)) {
            insts.push(inst)
          }
        }
        insts = insts.slice(0, limit)

        if (progs.length < 3) {
          progs = this.progs.filter(x => ids.has(x.id)).slice(0, limit)
        }
        if (crses.length < 3) {
          crses = this.crses.filter(x => ids.has(x.id)).slice(0, limit)
        }
      }
    }

    const total = insts.length + progs.length + crses.length
    console.log(
      `[SUGGEST] "${q}" → ${insts.length}I/${progs.length}P/${crses.length}C`
    )

    return {
      query: q,
      normalizedQuery: normalizeQuery(q),
      keywords: kws,
      corrections:
        correctedTokens.join(' ') !== tokens.join(' ')
          ? { original: tokens.join(' '), corrected: correctedTokens.join(' ') }
          : undefined,
      institutes: insts.map(i => ({
        type: 'Institute',
        id: i.id,
        slug: i.slug,
        name: i.name,
        logo: i.logo,
        location: [i.city, i.state].filter(Boolean).join(', ')
      })),
      programmes: progs.map(prog => ({
        type: 'Program',
        id: prog.id,
        slug: prog.slug,
        pSlug: prog.pSlug,
        name: prog.name,
        institute: prog.institute,
        logo: prog.logo
      })),
      courses: crses.map(c => ({
        type: 'Course',
        id: c.id,
        slug: c.slug,
        pSlug: c.pSlug,
        cSlug: c.cSlug,
        name: c.name,
        programme: c.programme,
        institute: c.institute,
        logo: c.logo,
        programmeDetails: (c as any).programmeDetails
      })),
      performance: p.done(this.docs.size, total)
    }
  }

  search (filters: SearchFilters): any {
    const {
      q,
      type,
      city,
      state,
      level,
      programme,
      exam,
      course,
      page = 1,
      limit = 20
    } = filters

    const p = new Perf()
    const skip = (page - 1) * limit

    let ids = new Set(this.docs.keys())

    const splitValues = (value: string | null | undefined): string[] =>
      value
        ? value
            .toString()
            .split(/,|\band\b|&/i)
            .map(v => v.trim())
            .filter(Boolean)
        : []

    const orValues = (
      key: IndexKey,
      value: string | null | undefined
    ): Set<string> => {
      const values = splitValues(value)
      if (!values.length) return new Set()
      return this.idx.or(...values.map(v => this.idx.get(key, v)))
    }

    // Process query with NLP enhancements
    const tokens = q ? tokenize(q) : []
    const correctedTokens = correctTypos(tokens)
    const expandedTokens = expandAbbreviations(correctedTokens)
    const kws = extractKW(expandedTokens.join(' '))

    if (kws.length) {
      let kwIds: Set<string> = new Set()
      for (const kw of kws) {
        kwIds = this.idx.or(kwIds, this.idx.get('keyword', kw))
      }
      if (kwIds.size) ids = this.idx.and(ids, kwIds)
    } else if (q?.trim()) {
      // Use enhanced trie search
      const tr = [
        ...this.trie.i.find(q, 500),
        ...this.trie.p.find(q, 500),
        ...this.trie.c.find(q, 500)
      ]
      const trIds = new Set(tr.map(x => x.id))
      if (trIds.size) ids = this.idx.and(ids, trIds)
    }

    // Apply filters with fuzzy matching support
    if (city) ids = this.idx.and(ids, orValues('city', city))
    if (state) ids = this.idx.and(ids, orValues('state', state))
    if (level) ids = this.idx.and(ids, this.idx.get('level', level))
    if (programme) ids = this.idx.and(ids, this.idx.get('programme', programme))
    if (exam) ids = this.idx.and(ids, this.idx.get('exam', exam))
    if (course) ids = this.idx.and(ids, this.idx.get('course', course))

    let institutes: any[] = []
    let programmes: any[] = []
    let courses: any[] = []

    if (!type || type === 'institute') {
      institutes = [...ids]
        .map(id => {
          const d = this.docs.get(id)
          if (!d) return null
          return {
            id,
            slug: d._slug,
            name: d.name,
            shortName: d.shortName,
            logo: d.logo,
            coverImage: d.coverImage,
            type: d.type,
            city: d.location?.city,
            state: d.location?.state,
            establishedYear: d.establishedYear,
            naacGrade: d.accreditation?.naac?.grade,
            totalCourses: d._courses,
            totalFacilities: d.campusDetails?.facilities_arr?.length || 0,
            contact: d.contact?.phone?.[0],
            description: d._desc
              ? d._desc.substring(0, 350) + (d._desc.length > 350 ? '...' : '')
              : null,
            topRecruiters: d.placements?.topRecruiters?.slice(0, 6),
            programmes: d.programmes?.slice(0, 3).map(pr => ({
              name: pr.name,
              slug: slug(pr.name || ''),
              courseCount: pr.course?.length || pr.courseCount || 0,
              eligibilityExams: pr.eligibilityExams?.slice(0, 4),
              placementRating: pr.placementRating,
              sampleCourses: pr.course?.slice(0, 2).map(c => ({
                name: c.degree,
                duration: c.duration,
                fee: c.fees?.totalFee,
                feeF: fee(c.fees?.totalFee)
              })),
              moreCourses: Math.max(0, (pr.course?.length || 0) - 2),
              url: `/recommendation-collections/${d._slug}?programme=${slug(
                pr.name || ''
              )}`
            })),
            moreProgrammes: Math.max(0, (d.programmes?.length || 0) - 3)
          }
        })
        .filter(Boolean)
    }

    if (!type || type === 'programme') {
      programmes = this.progs.filter(x => ids.has(x.id))
    }

    if (!type || type === 'course') {
      courses = this.crses.filter(x => ids.has(x.id))
    }

    const filterCounts = {
      cities: this.idx.counts('city', ids),
      states: this.idx.counts('state', ids),
      levels: this.idx.counts('level', ids),
      programmes: this.idx.counts('programme', ids),
      exams: this.idx.counts('exam', ids),
      courses: this.idx.counts('course', ids)
    }

    const totals = {
      institutes: institutes.length,
      programmes: programmes.length,
      courses: courses.length
    }

    const iPage = institutes.slice(skip, skip + limit)
    const pPage = programmes.slice(skip, skip + limit)
    const cPage = courses.slice(skip, skip + limit)

    console.log(
      `[SEARCH] q="${q}" type=${type || 'all'} → ${totals.institutes}I/${
        totals.programmes
      }P/${totals.courses}C`
    )

    return {
      query: q,
      keywords: kws,
      activeFilters: { city, state, level, programme, exam, course },
      filterCounts,
      totals,
      pagination: {
        page,
        limit,
        hasMore: {
          institutes: skip + limit < totals.institutes,
          programmes: skip + limit < totals.programmes,
          courses: skip + limit < totals.courses
        }
      },
      institutes: iPage,
      programmes: pPage,
      courses: cPage,
      performance: p.done(
        this.docs.size,
        totals.institutes + totals.programmes + totals.courses
      )
    }
  }

  institute (instSlug: string): any {
    const p = new Perf()

    let doc: DocumentData | null = null
    for (const [, d] of this.docs) {
      if (d._slug === instSlug || d.slug === instSlug) {
        doc = d
        break
      }
    }

    if (!doc) {
      return {
        error: 'Institute not found',
        performance: p.done(this.docs.size, 0)
      }
    }

    console.log(`[INSTITUTE] ${instSlug}`)

    const instituteSlug = doc._slug || doc.slug || ''
    return {
      id: doc._id.toString(),
      slug: instituteSlug,
      name: doc.name,
      shortName: doc.shortName,
      logo: doc.logo,
      coverImage: doc.coverImage,
      type: doc.type,
      establishedYear: doc.establishedYear,
      description: doc._desc,
      location: doc.location,
      contact: doc.contact,
      accreditation: doc.accreditation,
      rankings: doc.rankings,
      overview: doc.overview,
      academicOverview: {
        totalCourses: doc._courses,
        totalFacilities: doc.campusDetails?.facilities_arr?.length || 0,
        facilities: doc.campusDetails?.facilities_arr
      },
      topRecruiters: doc.placements?.topRecruiters,
      programmes: doc.programmes?.map(pr => ({
        name: pr.name,
        slug: slug(pr.name || ''),
        courseCount: pr.course?.length || pr.courseCount || 0,
        eligibilityExams: pr.eligibilityExams,
        placementRating: pr.placementRating,
        url: `/recommendation-collections/${instituteSlug}?programme=${slug(
          pr.name || ''
        )}`,
        courses: pr.course?.map(c => ({
          id: c._id?.toString(),
          name: c.degree,
          slug: slug(c.degree || ''),
          duration: c.duration,
          level: c.level || c.courseLevel,
          fee: c.fees?.totalFee,
          feeF: fee(c.fees?.totalFee),
          tuitionFee: c.fees?.tuitionFee,
          educationType: c.educationType,
          totalSeats: c.totalSeats,
          eligibilityExams: c.eligibilityExams || pr.eligibilityExams,
          avgPackage: c.placements?.averagePackage,
          avgPackageF: fee(c.placements?.averagePackage),
          url: `/recommendation-collections/${instituteSlug}?programme=${slug(
            pr.name || ''
          )}&course=${slug(c.degree || '')}`
        }))
      })),
      raw: {
        campusDetails: doc.campusDetails,
        admissions: doc.admissions,
        placements: doc.placements,
        researchAndInnovation: doc.researchAndInnovation,
        alumniNetwork: doc.alumniNetwork,
        faculty_student_ratio: doc.faculty_student_ratio
      },
      performance: p.done(this.docs.size, 1)
    }
  }

  explore (filters: ExploreFilters): any {
    const {
      city,
      state,
      type,
      level,
      programme,
      exam,
      course,
      accreditation,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = filters

    const p = new Perf()
    const skip = (page - 1) * limit

    let ids = new Set(this.docs.keys())

    const splitValues = (value: string | null | undefined): string[] =>
      value
        ? value
            .toString()
            .split(/,|\band\b|&/i)
            .map(v => v.trim())
            .filter(Boolean)
        : []

    const orValues = (
      key: IndexKey,
      value: string | null | undefined
    ): Set<string> => {
      const values = splitValues(value)
      if (!values.length) return new Set()
      return this.idx.or(...values.map(v => this.idx.get(key, v)))
    }

    if (city) ids = this.idx.and(ids, orValues('city', city))
    if (state) ids = this.idx.and(ids, orValues('state', state))
    if (type) ids = this.idx.and(ids, this.idx.get('type', type))
    if (level) ids = this.idx.and(ids, this.idx.get('level', level))
    if (programme) ids = this.idx.and(ids, this.idx.get('programme', programme))
    if (exam) ids = this.idx.and(ids, this.idx.get('exam', exam))
    if (course) ids = this.idx.and(ids, this.idx.get('course', course))

    let institutes = [...ids]
      .map(id => {
        const d = this.docs.get(id)
        if (!d) return null

        if (accreditation) {
          const grade = d.accreditation?.naac?.grade
          if (accreditation === 'none' && grade) return null
          if (accreditation !== 'none' && grade !== accreditation) return null
        }

        return {
          id,
          slug: d._slug,
          name: d.name,
          shortName: d.shortName,
          logo: d.logo,
          coverImage: d.coverImage,
          type: d.type,
          city: d.location?.city,
          state: d.location?.state,
          establishedYear: d.establishedYear,
          naacGrade: d.accreditation?.naac?.grade,
          totalCourses: d._courses,
          totalFacilities: d.campusDetails?.facilities_arr?.length || 0,
          contact: d.contact?.phone?.[0],
          description: d._desc
            ? d._desc.substring(0, 350) + (d._desc.length > 350 ? '...' : '')
            : null,
          topRecruiters: d.placements?.topRecruiters?.slice(0, 6),
          programmes: d.programmes?.slice(0, 3).map(pr => ({
            name: pr.name,
            slug: slug(pr.name || ''),
            courseCount: pr.course?.length || pr.courseCount || 0,
            eligibilityExams: pr.eligibilityExams?.slice(0, 4),
            placementRating: pr.placementRating,
            sampleCourses: pr.course?.slice(0, 2).map(c => ({
              name: c.degree,
              duration: c.duration,
              fee: c.fees?.totalFee,
              feeF: fee(c.fees?.totalFee)
            })),
            moreCourses: Math.max(0, (pr.course?.length || 0) - 2),
            url: `/recommendation-collections/${d._slug}?programme=${slug(
              pr.name || ''
            )}`
          })),
          moreProgrammes: Math.max(0, (d.programmes?.length || 0) - 3)
        }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)

    institutes.sort((a, b) => {
      let compareValue = 0

      switch (sortBy) {
        case 'courses':
          compareValue = (a.totalCourses || 0) - (b.totalCourses || 0)
          break
        case 'established':
          compareValue = (a.establishedYear || 0) - (b.establishedYear || 0)
          break
        case 'name':
        default:
          compareValue = (a.name || '').localeCompare(b.name || '')
          break
      }

      return sortOrder === 'desc' ? -compareValue : compareValue
    })

    const total = institutes.length

    const filterCounts: Record<string, Record<string, number>> = {
      cities: this.idx.counts('city', ids),
      states: this.idx.counts('state', ids),
      types: this.idx.counts('type', ids),
      levels: this.idx.counts('level', ids),
      programmes: this.idx.counts('programme', ids),
      exams: this.idx.counts('exam', ids),
      courses: this.idx.counts('course', ids)
    }

    const accreditationCounts: Record<string, number> = {}
    for (const id of ids) {
      const d = this.docs.get(id)
      const grade = d?.accreditation?.naac?.grade
      const key = grade || 'none'
      accreditationCounts[key] = (accreditationCounts[key] || 0) + 1
    }
    filterCounts.accreditations = accreditationCounts

    const paginatedInstitutes = institutes.slice(skip, skip + limit)

    const activeFilterCount = [
      city,
      state,
      type,
      level,
      programme,
      exam,
      course,
      accreditation
    ].filter(Boolean).length

    console.log(
      `[EXPLORE] filters=${activeFilterCount} → ${total} institutes (page ${page}/${Math.ceil(
        total / limit
      )})`
    )

    return {
      activeFilters: {
        city,
        state,
        type,
        level,
        programme,
        exam,
        course,
        accreditation
      },
      filterCounts,
      sort: { sortBy, sortOrder },
      pagination: {
        page: +page,
        limit: +limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total
      },
      institutes: paginatedInstitutes,
      performance: p.done(this.docs.size, total)
    }
  }

  getStats (): any {
    return {
      documents: this.docs.size,
      ...this.stats,
      indexes: Object.fromEntries(
        Object.entries(this.idx.m).map(([k, m]) => [k, m.size])
      ),
      tries: {
        institutes: this.trie.i.n,
        programmes: this.trie.p.n,
        courses: this.trie.c.n
      }
    }
  }
}

// ============================================================================
// GLOBAL INSTANCE & INITIALIZATION
// ============================================================================

declare global {
  // eslint-disable-next-line no-var
  var searchEngine: Engine | undefined
  // eslint-disable-next-line no-var
  var searchEngineInit: Promise<void> | undefined
}

const engine: Engine = global.searchEngine || new Engine()
global.searchEngine = engine

export const initSearchEngine = async (): Promise<void> => {
  if (!global.searchEngineInit) {
    global.searchEngineInit = (async () => {
      const { db } = await connectToDatabase()
      await engine.build(db)
    })()
  }
  return global.searchEngineInit
}

export default engine
