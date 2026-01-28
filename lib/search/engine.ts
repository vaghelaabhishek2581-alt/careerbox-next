// import { connectToDatabase } from '@/lib/db/mongodb'

// const COLLECTION_NAME = 'admininstitutes'

// // ============================================================================
// // TYPE DEFINITIONS
// // ============================================================================

// interface TrieNode {
//   c: Record<string, TrieNode>
//   d: SuggestionItem[]
// }

// interface SuggestionItem {
//   _k: string
//   type: 'Institute' | 'Program' | 'Course'
//   id: string
//   slug: string
//   name: string
//   logo?: string
//   city?: string
//   state?: string
//   pSlug?: string
//   cSlug?: string
//   institute?: string
//   programme?: string
// }

// interface ProgramFull extends SuggestionItem {
//   courseCount: number
//   eligibilityExams: string[]
//   placementRating?: number
//   sampleCourses?: CoursePreview[]
//   moreCourses: number
//   url: string
// }

// interface CourseFull extends SuggestionItem {
//   duration?: string
//   level?: string
//   fee?: number
//   feeF?: string | null
//   tuitionFee?: number
//   educationType?: string
//   totalSeats?: number
//   eligibilityExams: string[]
//   avgPackage?: number
//   avgPackageF?: string | null
//   url: string
//   programmeDetails: {
//     name: string
//     slug: string
//     courseCount: number
//     placementRating?: number
//     eligibilityExams: string[]
//   }
// }

// interface CoursePreview {
//   name: string
//   slug: string
//   duration?: string
//   fee?: number
//   feeF?: string | null
// }

// interface DocumentData {
//   _id: any
//   name?: string
//   shortName?: string
//   slug?: string
//   logo?: string
//   coverImage?: string
//   type?: string
//   location?: {
//     city?: string
//     state?: string
//   }
//   contact?: {
//     phone?: string[]
//   }
//   establishedYear?: number
//   accreditation?: {
//     naac?: {
//       grade?: string
//     }
//   }
//   overview?: {
//     about?: string
//   }
//   faculty_student_ratio?: {
//     students?: Array<{ key: string; value: string }>
//   }
//   campusDetails?: {
//     facilities_arr?: string[]
//   }
//   placements?: {
//     topRecruiters?: string[]
//     averagePackage?: number
//   }
//   programmes?: ProgrammeData[]
//   rankings?: any
//   admissions?: any
//   researchAndInnovation?: any
//   alumniNetwork?: any
//   _slug?: string
//   _desc?: string | null
//   _courses?: number
// }

// interface ProgrammeData {
//   name?: string
//   course?: CourseData[]
//   courseCount?: number
//   eligibilityExams?: string[]
//   placementRating?: number
// }

// interface CourseData {
//   _id?: any
//   degree?: string
//   duration?: string
//   level?: string
//   courseLevel?: string
//   fees?: {
//     totalFee?: number
//     tuitionFee?: number
//   }
//   educationType?: string
//   totalSeats?: number
//   eligibilityExams?: string[]
//   placements?: {
//     averagePackage?: number
//   }
// }

// interface PerformanceResult {
//   timeNs: number
//   timeMs: number
//   timeSec: number
//   searched: number
//   found: number
//   speed: string
//   message: string
// }

// interface SearchFilters {
//   q?: string
//   type?: 'institute' | 'programme' | 'course'
//   city?: string
//   state?: string
//   level?: string
//   programme?: string
//   exam?: string
//   course?: string
//   page?: number
//   limit?: number
// }

// interface ExploreFilters {
//   city?: string
//   state?: string
//   type?: string
//   level?: string
//   programme?: string
//   exam?: string
//   course?: string
//   accreditation?: string
//   page?: number
//   limit?: number
//   sortBy?: 'name' | 'courses' | 'established'
//   sortOrder?: 'asc' | 'desc'
// }

// interface SearchMatch {
//   item: SuggestionItem
//   score: number
//   matchType: 'exact' | 'prefix' | 'fuzzy' | 'keyword' | 'phonetic' | 'synonym'
// }

// type IndexKey =
//   | 'city'
//   | 'state'
//   | 'type'
//   | 'level'
//   | 'programme'
//   | 'exam'
//   | 'keyword'
//   | 'course'

// // ============================================================================
// // UTILITY FUNCTIONS
// // ============================================================================

// const slug = (t: string | null | undefined): string =>
//   t
//     ? t
//         .toLowerCase()
//         .trim()
//         .replace(/[^a-z0-9\s-]/g, '')
//         .replace(/\s+/g, '-')
//         .replace(/-+/g, '-')
//         .replace(/^-|-$/g, '')
//     : ''

// const fee = (f: number | null | undefined): string | null =>
//   f ? `₹${f.toLocaleString('en-IN')}` : null

// const getDesc = (doc: DocumentData): string | null => {
//   const s = doc?.faculty_student_ratio?.students
//   if (Array.isArray(s)) {
//     const d = s.find(x => x.key === 'description')
//     if (d?.value) return d.value
//   }
//   return doc?.overview?.about || null
// }

// // ============================================================================
// // FUZZY MATCHING & NLP UTILITIES
// // ============================================================================

// /**
//  * Calculate Levenshtein distance between two strings
//  * Used for typo tolerance and fuzzy matching
//  */
// const levenshteinDistance = (a: string, b: string): number => {
//   const matrix: number[][] = []

//   for (let i = 0; i <= b.length; i++) {
//     matrix[i] = [i]
//   }
//   for (let j = 0; j <= a.length; j++) {
//     matrix[0][j] = j
//   }

//   for (let i = 1; i <= b.length; i++) {
//     for (let j = 1; j <= a.length; j++) {
//       if (b.charAt(i - 1) === a.charAt(j - 1)) {
//         matrix[i][j] = matrix[i - 1][j - 1]
//       } else {
//         matrix[i][j] = Math.min(
//           matrix[i - 1][j - 1] + 1, // substitution
//           matrix[i][j - 1] + 1, // insertion
//           matrix[i - 1][j] + 1 // deletion
//         )
//       }
//     }
//   }

//   return matrix[b.length][a.length]
// }

// /**
//  * Calculate similarity score (0-1) based on Levenshtein distance
//  */
// const similarityScore = (a: string, b: string): number => {
//   const maxLen = Math.max(a.length, b.length)
//   if (maxLen === 0) return 1
//   const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase())
//   return 1 - distance / maxLen
// }

// /**
//  * Soundex algorithm for phonetic matching
//  * Handles common misspellings and similar-sounding words
//  */
// const soundex = (word: string): string => {
//   const a = word.toLowerCase().split('')
//   const first = a[0]

//   const codes: Record<string, string> = {
//     a: '',
//     e: '',
//     i: '',
//     o: '',
//     u: '',
//     h: '',
//     w: '',
//     y: '',
//     b: '1',
//     f: '1',
//     p: '1',
//     v: '1',
//     c: '2',
//     g: '2',
//     j: '2',
//     k: '2',
//     q: '2',
//     s: '2',
//     x: '2',
//     z: '2',
//     d: '3',
//     t: '3',
//     l: '4',
//     m: '5',
//     n: '5',
//     r: '6'
//   }

//   const coded = a
//     .map(ch => codes[ch] ?? '')
//     .join('')
//     .replace(/(.)\1+/g, '$1')
//     .replace(/^./, first.toUpperCase())

//   return (coded + '0000').slice(0, 4)
// }

// /**
//  * Normalize query for consistent matching
//  * Handles common variations, abbreviations, and noise
//  */
// const normalizeQuery = (query: string): string => {
//   return (
//     query
//       .toLowerCase()
//       .trim()
//       // Remove special characters but keep spaces
//       .replace(/[^\w\s]/g, ' ')
//       // Normalize multiple spaces
//       .replace(/\s+/g, ' ')
//       .trim()
//   )
// }

// /**
//  * Tokenize query into meaningful terms
//  */
// const tokenize = (query: string): string[] => {
//   const normalized = normalizeQuery(query)
//   return normalized.split(' ').filter(word => word.length > 1)
// }

// /**
//  * Common abbreviation expansions for educational context
//  */
// const ABBREVIATIONS: Record<string, string[]> = {
//   iit: ['indian institute of technology'],
//   nit: ['national institute of technology'],
//   iiit: ['indian institute of information technology'],
//   iim: ['indian institute of management'],
//   bits: ['birla institute of technology and science'],
//   vit: ['vellore institute of technology'],
//   srm: ['srm institute of science and technology'],
//   cse: ['computer science engineering', 'computer science'],
//   ece: ['electronics and communication engineering'],
//   eee: ['electrical and electronics engineering'],
//   mech: ['mechanical engineering'],
//   civil: ['civil engineering'],
//   it: ['information technology'],
//   ai: ['artificial intelligence'],
//   ml: ['machine learning'],
//   ds: ['data science'],
//   univ: ['university'],
//   uni: ['university'],
//   coll: ['college'],
//   inst: ['institute'],
//   tech: ['technology', 'technical'],
//   eng: ['engineering'],
//   engg: ['engineering'],
//   mgmt: ['management'],
//   sci: ['science'],
//   govt: ['government'],
//   pvt: ['private']
// }

// /**
//  * Expand abbreviations in query
//  */
// const expandAbbreviations = (tokens: string[]): string[] => {
//   const expanded: string[] = []
//   for (const token of tokens) {
//     expanded.push(token)
//     if (ABBREVIATIONS[token]) {
//       expanded.push(...ABBREVIATIONS[token])
//     }
//   }
//   return expanded
// }

// /**
//  * Common typo corrections for educational terms
//  */
// const TYPO_CORRECTIONS: Record<string, string> = {
//   enginnering: 'engineering',
//   enginering: 'engineering',
//   engneering: 'engineering',
//   enginneering: 'engineering',
//   managment: 'management',
//   managemnt: 'management',
//   manegement: 'management',
//   universty: 'university',
//   univeristy: 'university',
//   univercity: 'university',
//   collage: 'college',
//   colege: 'college',
//   institue: 'institute',
//   instutute: 'institute',
//   insitute: 'institute',
//   tecnology: 'technology',
//   techonlogy: 'technology',
//   technolgy: 'technology',
//   medicle: 'medical',
//   medcal: 'medical',
//   pharamcy: 'pharmacy',
//   pharmcy: 'pharmacy',
//   computor: 'computer',
//   compter: 'computer',
//   sciance: 'science',
//   scince: 'science',
//   busines: 'business',
//   bussiness: 'business',
//   buisness: 'business',
//   admision: 'admission',
//   admisson: 'admission'
// }

// /**
//  * Correct common typos
//  */
// const correctTypos = (tokens: string[]): string[] => {
//   return tokens.map(token => TYPO_CORRECTIONS[token] || token)
// }

// /**
//  * N-gram generation for partial matching
//  */
// const generateNgrams = (text: string, n: number = 3): Set<string> => {
//   const ngrams = new Set<string>()
//   const normalized = text.toLowerCase()
//   for (let i = 0; i <= normalized.length - n; i++) {
//     ngrams.add(normalized.slice(i, i + n))
//   }
//   return ngrams
// }

// /**
//  * Calculate n-gram similarity
//  */
// const ngramSimilarity = (a: string, b: string, n: number = 3): number => {
//   const ngramsA = generateNgrams(a, n)
//   const ngramsB = generateNgrams(b, n)

//   if (ngramsA.size === 0 || ngramsB.size === 0) return 0

//   let intersection = 0
//   for (const ngram of ngramsA) {
//     if (ngramsB.has(ngram)) intersection++
//   }

//   return (2 * intersection) / (ngramsA.size + ngramsB.size)
// }

// // ============================================================================
// // PERFORMANCE TRACKER
// // ============================================================================

// class Perf {
//   private t0: bigint

//   constructor () {
//     this.t0 = process.hrtime.bigint()
//   }

//   done (total: number, found: number): PerformanceResult {
//     const ns = Number(process.hrtime.bigint() - this.t0)
//     const ms = ns / 1e6
//     const sec = ns / 1e9
//     return {
//       timeNs: ns,
//       timeMs: +ms.toFixed(4),
//       timeSec: +sec.toFixed(6),
//       searched: total,
//       found,
//       speed: `${Math.round(total / (sec || 1e-6)).toLocaleString()} docs/sec`,
//       message: `Found ${found} of ${total.toLocaleString()} in ${ms.toFixed(
//         4
//       )}ms`
//     }
//   }
// }

// // ============================================================================
// // ENHANCED TRIE WITH FUZZY MATCHING
// // ============================================================================

// class Trie {
//   root: TrieNode
//   n: number
//   private allItems: Map<string, SuggestionItem>
//   private soundexIndex: Map<string, Set<string>>
//   private ngramIndex: Map<string, Set<string>>

//   constructor () {
//     this.root = { c: {}, d: [] }
//     this.n = 0
//     this.allItems = new Map()
//     this.soundexIndex = new Map()
//     this.ngramIndex = new Map()
//   }

//   add (text: string, data: SuggestionItem): void {
//     if (!text) return

//     const normalizedText = text.toLowerCase()

//     // Store in allItems for fuzzy search
//     this.allItems.set(data._k, data)

//     // Build soundex index for phonetic matching
//     const words = normalizedText.split(/\s+/)
//     for (const word of words) {
//       if (word.length >= 2) {
//         const sx = soundex(word)
//         if (!this.soundexIndex.has(sx)) {
//           this.soundexIndex.set(sx, new Set())
//         }
//         this.soundexIndex.get(sx)!.add(data._k)
//       }
//     }

//     // Build n-gram index for partial matching
//     const ngrams = generateNgrams(normalizedText, 3)
//     for (const ngram of ngrams) {
//       if (!this.ngramIndex.has(ngram)) {
//         this.ngramIndex.set(ngram, new Set())
//       }
//       this.ngramIndex.get(ngram)!.add(data._k)
//     }
//     // Standard trie insertion
//     let node = this.root
//     for (const ch of normalizedText) {
//       if (!node.c[ch]) node.c[ch] = { c: {}, d: [] }
//       node = node.c[ch]
//       if (node.d.length < 50 && !node.d.some(x => x._k === data._k)) {
//         node.d.push(data)
//       }
//     }
//     this.n++
//   }

//   /**
//    * Enhanced find with multiple matching strategies
//    */
//   find (query: string, limit: number = 10): SuggestionItem[] {
//     const matches = this.findWithScores(query, limit * 2)
//     return matches.slice(0, limit).map(m => m.item)
//   }

//   /**
//    * Find with detailed scoring for ranking
//    */
//   findWithScores (query: string, limit: number = 20): SearchMatch[] {
//     const results: SearchMatch[] = []
//     const seen = new Set<string>()
//     const normalizedQuery = normalizeQuery(query)
//     const tokens = tokenize(query)
//     const expandedTokens = expandAbbreviations(correctTypos(tokens))

//     // 1. Exact prefix match (highest priority)
//     const exactMatches = this.findExactPrefix(normalizedQuery, limit)
//     for (const item of exactMatches) {
//       if (!seen.has(item._k)) {
//         seen.add(item._k)
//         results.push({
//           item,
//           score: 1.0,
//           matchType: 'exact'
//         })
//       }
//     }

//     // 2. Prefix match on individual tokens
//     for (const token of expandedTokens) {
//       const prefixMatches = this.findExactPrefix(token, limit)
//       for (const item of prefixMatches) {
//         if (!seen.has(item._k)) {
//           seen.add(item._k)
//           results.push({
//             item,
//             score: 0.85,
//             matchType: 'prefix'
//           })
//         }
//       }
//     }

//     // 3. Phonetic matching (handles pronunciation-based typos)
//     for (const token of tokens) {
//       if (token.length >= 2) {
//         const sx = soundex(token)
//         const phoneticKeys = this.soundexIndex.get(sx)
//         if (phoneticKeys) {
//           for (const key of phoneticKeys) {
//             if (!seen.has(key)) {
//               const item = this.allItems.get(key)
//               if (item) {
//                 seen.add(key)
//                 results.push({
//                   item,
//                   score: 0.7,
//                   matchType: 'phonetic'
//                 })
//               }
//             }
//           }
//         }
//       }
//     }

//     // 4. N-gram matching (handles partial matches and typos)
//     const queryNgrams = generateNgrams(normalizedQuery, 3)
//     const ngramCounts = new Map<string, number>()

//     for (const ngram of queryNgrams) {
//       const keys = this.ngramIndex.get(ngram)
//       if (keys) {
//         for (const key of keys) {
//           if (!seen.has(key)) {
//             ngramCounts.set(key, (ngramCounts.get(key) || 0) + 1)
//           }
//         }
//       }
//     }

//     // Sort by n-gram match count
//     const ngramMatches = [...ngramCounts.entries()]
//       .filter(([_, count]) => count >= Math.min(2, queryNgrams.size * 0.3))
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, limit)

//     for (const [key, count] of ngramMatches) {
//       const item = this.allItems.get(key)
//       if (item) {
//         seen.add(key)
//         const maxNgrams = Math.max(queryNgrams.size, 1)
//         results.push({
//           item,
//           score: 0.5 + (count / maxNgrams) * 0.3,
//           matchType: 'fuzzy'
//         })
//       }
//     }

//     // 5. Fuzzy matching using Levenshtein distance (for remaining items)
//     if (results.length < limit && normalizedQuery.length >= 3) {
//       for (const [key, item] of this.allItems) {
//         if (!seen.has(key)) {
//           const itemName = item.name.toLowerCase()
//           const sim = similarityScore(normalizedQuery, itemName)

//           // Also check individual word similarity
//           const itemWords = itemName.split(/\s+/)
//           let maxWordSim = sim
//           for (const word of itemWords) {
//             for (const token of tokens) {
//               const wordSim = similarityScore(token, word)
//               maxWordSim = Math.max(maxWordSim, wordSim)
//             }
//           }

//           if (maxWordSim >= 0.6) {
//             seen.add(key)
//             results.push({
//               item,
//               score: maxWordSim * 0.6,
//               matchType: 'fuzzy'
//             })
//           }
//         }
//       }
//     }

//     // Sort by score and return top results
//     return results.sort((a, b) => b.score - a.score).slice(0, limit)
//   }

//   private findExactPrefix (query: string, limit: number): SuggestionItem[] {
//     let node = this.root
//     for (const ch of query.toLowerCase()) {
//       if (!node.c[ch]) return []
//       node = node.c[ch]
//     }
//     return node.d.slice(0, limit)
//   }
// }

// // ============================================================================
// // INVERTED INDEX
// // ============================================================================

// class Index {
//   m: Record<IndexKey, Map<string, Set<string>>>

//   constructor () {
//     this.m = {
//       city: new Map(),
//       state: new Map(),
//       type: new Map(),
//       level: new Map(),
//       programme: new Map(),
//       exam: new Map(),
//       keyword: new Map(),
//       course: new Map()
//     }
//   }

//   add (k: IndexKey, v: string | null | undefined, id: string): void {
//     if (!v) return
//     const m = this.m[k]
//     const key = v.toString().toLowerCase().trim()
//     if (!m.has(key)) m.set(key, new Set())
//     m.get(key)!.add(id)
//   }

//   get (k: IndexKey, v: string | null | undefined): Set<string> {
//     return v
//       ? this.m[k]?.get(v.toString().toLowerCase().trim()) || new Set()
//       : new Set()
//   }

//   /**
//    * Fuzzy get - find matches even with typos
//    */
//   fuzzyGet (
//     k: IndexKey,
//     v: string | null | undefined,
//     threshold: number = 0.7
//   ): Set<string> {
//     if (!v) return new Set()

//     const searchTerm = v.toString().toLowerCase().trim()
//     const results = new Set<string>()

//     // Exact match first
//     const exact = this.get(k, v)
//     for (const id of exact) results.add(id)

//     // Fuzzy match
//     for (const [key, ids] of this.m[k]) {
//       if (similarityScore(searchTerm, key) >= threshold) {
//         for (const id of ids) results.add(id)
//       }
//     }

//     return results
//   }

//   and (a: Set<string>, b: Set<string>): Set<string> {
//     if (!b?.size) return a
//     if (!a?.size) return new Set()
//     const [s, l] = a.size <= b.size ? [a, b] : [b, a]
//     return new Set([...s].filter(x => l.has(x)))
//   }

//   or (...sets: Set<string>[]): Set<string> {
//     const r = new Set<string>()
//     for (const s of sets) if (s) for (const i of s) r.add(i)
//     return r
//   }

//   counts (k: IndexKey, ids: Set<string>): Record<string, number> {
//     const r: Record<string, number> = {}
//     for (const [v, set] of this.m[k]) {
//       const c = [...set].filter(id => ids.has(id)).length
//       if (c > 0) r[v] = c
//     }
//     return r
//   }
// }

// // ============================================================================
// // KEYWORD MAPPINGS
// // ============================================================================

// const KW: Record<string, string[]> = {
//   engineering: [
//     'b.tech',
//     'btech',
//     'b.e.',
//     'be',
//     'm.tech',
//     'mtech',
//     'm.e.',
//     'me',
//     'engineering',
//     'engg',
//     'engineer',
//     'b tech',
//     'm tech',
//     'bachelor of technology',
//     'master of technology',
//     'bachelor of engineering',
//     'master of engineering',
//     'computer',
//     'mechanical',
//     'electrical',
//     'civil',
//     'electronics',
//     'it',
//     'cse',
//     'ece',
//     'information technology',
//     'computer science',
//     'electronics and communication',
//     'electronics & communication',
//     'comp',
//     'mech',
//     'elec',
//     'eee',
//     'electrical and electronics',
//     'auto',
//     'automobile',
//     'automotive',
//     'aeronautical',
//     'aerospace',
//     'chemical',
//     'instrumentation',
//     'biomedical',
//     'biotechnology engineering',
//     'production',
//     'industrial',
//     'mining',
//     'petroleum',
//     'textile',
//     'agricultural',
//     'food technology',
//     'polymer'
//   ],
//   medical: [
//     'mbbs',
//     'md',
//     'ms',
//     'bds',
//     'mds',
//     'nursing',
//     'bsc nursing',
//     'b.sc nursing',
//     'gnm',
//     'pharmacy',
//     'medical',
//     'health',
//     'bams',
//     'bhms',
//     'bpt',
//     'mpt',
//     'physiotherapy',
//     'ayurveda',
//     'homeopathy',
//     'dental',
//     'medicine',
//     'bachelor of medicine',
//     'doctor of medicine',
//     'paramedical',
//     'veterinary',
//     'bvsc',
//     'optometry',
//     'radiology',
//     'lab technology',
//     'anesthesia',
//     'operation theatre'
//   ],
//   management: [
//     'mba',
//     'bba',
//     'pgdm',
//     'pgp',
//     'management',
//     'business',
//     'mms',
//     'finance',
//     'marketing',
//     'hr',
//     'human resource',
//     'operations',
//     'supply chain',
//     'international business',
//     'entrepreneurship',
//     'retail',
//     'hospital management',
//     'event management',
//     'executive mba',
//     'emba',
//     'business administration',
//     'master of business',
//     'bachelor of business'
//   ],
//   science: [
//     'b.sc',
//     'bsc',
//     'm.sc',
//     'msc',
//     'b sc',
//     'm sc',
//     'science',
//     'physics',
//     'chemistry',
//     'biology',
//     'mathematics',
//     'maths',
//     'stats',
//     'statistics',
//     'biotechnology',
//     'biotech',
//     'microbiology',
//     'zoology',
//     'botany',
//     'biochemistry',
//     'environmental science',
//     'forensic',
//     'geology',
//     'geography',
//     'electronics science',
//     'computer science bsc',
//     'data science',
//     'agriculture',
//     'horticulture',
//     'fisheries'
//   ],
//   commerce: [
//     'b.com',
//     'bcom',
//     'm.com',
//     'mcom',
//     'b com',
//     'm com',
//     'commerce',
//     'accounting',
//     'finance',
//     'ca',
//     'cma',
//     'cs',
//     'chartered accountant',
//     'cost accountant',
//     'company secretary',
//     'banking',
//     'taxation',
//     'accounts',
//     'book keeping',
//     'financial management',
//     'bachelor of commerce',
//     'master of commerce'
//   ],
//   arts: [
//     'b.a.',
//     'ba',
//     'm.a.',
//     'ma',
//     'b a',
//     'm a',
//     'arts',
//     'humanities',
//     'literature',
//     'english',
//     'hindi',
//     'history',
//     'psychology',
//     'sociology',
//     'political science',
//     'economics',
//     'philosophy',
//     'journalism',
//     'mass communication',
//     'media',
//     'social work',
//     'public administration',
//     'anthropology',
//     'bachelor of arts',
//     'master of arts'
//   ],
//   law: [
//     'llb',
//     'llm',
//     'll.b',
//     'll.m',
//     'law',
//     'legal',
//     'ba llb',
//     'bba llb',
//     'b.a. llb',
//     'bba ll.b',
//     'advocate',
//     'bachelor of law',
//     'master of law',
//     'legal studies',
//     'corporate law',
//     'criminal law',
//     'constitutional law',
//     'international law',
//     '5 year law',
//     '3 year law',
//     'integrated law'
//   ],
//   design: [
//     'b.des',
//     'm.des',
//     'bdes',
//     'mdes',
//     'design',
//     'fashion',
//     'interior',
//     'graphic',
//     'ui',
//     'ux',
//     'product design',
//     'textile design',
//     'fashion design',
//     'interior design',
//     'graphic design',
//     'web design',
//     'animation',
//     'vfx',
//     'visual effects',
//     'game design',
//     'communication design',
//     'industrial design',
//     'jewellery design',
//     'accessory design'
//   ],
//   pharmacy: [
//     'b.pharm',
//     'bpharm',
//     'm.pharm',
//     'mpharm',
//     'd.pharm',
//     'dpharm',
//     'b pharm',
//     'm pharm',
//     'd pharm',
//     'pharmacy',
//     'pharmaceutical',
//     'pharmacology',
//     'pharma',
//     'bachelor of pharmacy',
//     'master of pharmacy',
//     'diploma in pharmacy',
//     'pharmaceutical sciences',
//     'pharmaceutical chemistry'
//   ],
//   computer: [
//     'computer',
//     'bca',
//     'mca',
//     'b.c.a',
//     'm.c.a',
//     'software',
//     'data science',
//     'ai',
//     'ml',
//     'cyber',
//     'artificial intelligence',
//     'machine learning',
//     'cyber security',
//     'information technology',
//     'it',
//     'programming',
//     'web development',
//     'app development',
//     'cloud computing',
//     'blockchain',
//     'iot',
//     'internet of things',
//     'software engineering',
//     'bachelor of computer application',
//     'master of computer application'
//   ],
//   hotel: [
//     'hotel',
//     'hospitality',
//     'tourism',
//     'bhmct',
//     'ihm',
//     'culinary',
//     'chef',
//     'hotel management',
//     'catering',
//     'travel',
//     'cruise',
//     'airline',
//     'cabin crew',
//     'food production',
//     'food service',
//     'housekeeping',
//     'front office'
//   ],
//   education: [
//     'b.ed',
//     'bed',
//     'm.ed',
//     'med',
//     'b ed',
//     'm ed',
//     'education',
//     'teaching',
//     'pedagogy',
//     'teacher training',
//     'bachelor of education',
//     'master of education',
//     'elementary education',
//     'special education',
//     'physical education',
//     'd.el.ed',
//     'diploma in education'
//   ],
//   architecture: [
//     'b.arch',
//     'barch',
//     'm.arch',
//     'march',
//     'architecture',
//     'planning',
//     'urban planning',
//     'landscape',
//     'bachelor of architecture',
//     'master of architecture'
//   ],
//   top: [
//     'top',
//     'best',
//     'premier',
//     'leading',
//     'ranked',
//     'famous',
//     'popular',
//     'top rated'
//   ],
//   college: [
//     'college',
//     'institute',
//     'university',
//     'school',
//     'academy',
//     'institution'
//   ],
//   government: ['government', 'public', 'state', 'central', 'govt', 'gov'],
//   private: ['private', 'deemed', 'autonomous', 'self-financed', 'self financed']
// }

// // Build reverse lookup for faster keyword extraction
// const KW_REVERSE: Map<string, Set<string>> = new Map()
// for (const [category, keywords] of Object.entries(KW)) {
//   for (const kw of keywords) {
//     if (!KW_REVERSE.has(kw)) KW_REVERSE.set(kw, new Set())
//     KW_REVERSE.get(kw)!.add(category)
//   }
// }

// const extractKW = (text: string | null | undefined): string[] => {
//   if (!text) return []

//   const normalized = normalizeQuery(text)
//   const words = normalized.split(/\s+/)
//   const kw = new Set<string>()

//   // Check individual words
//   for (const word of words) {
//     // Direct category match
//     if (KW[word]) kw.add(word)

//     // Reverse lookup
//     const categories = KW_REVERSE.get(word)
//     if (categories) {
//       for (const cat of categories) kw.add(cat)
//     }

//     // Partial match
//     for (const [category, keywords] of Object.entries(KW)) {
//       if (keywords.some(k => word.includes(k) || k.includes(word))) {
//         kw.add(category)
//       }
//     }
//   }

//   // Check multi-word phrases
//   for (const [category, keywords] of Object.entries(KW)) {
//     for (const keyword of keywords) {
//       if (keyword.includes(' ') && normalized.includes(keyword)) {
//         kw.add(category)
//       }
//     }
//   }

//   return [...kw]
// }

// // ============================================================================
// // SEARCH ENGINE
// // ============================================================================

// class Engine {
//   trie: {
//     i: Trie
//     p: Trie
//     c: Trie
//   }
//   idx: Index
//   docs: Map<string, DocumentData>
//   progs: ProgramFull[]
//   crses: CourseFull[]
//   stats: {
//     institutes: number
//     programmes: number
//     courses: number
//   }

//   constructor () {
//     this.trie = { i: new Trie(), p: new Trie(), c: new Trie() }
//     this.idx = new Index()
//     this.docs = new Map()
//     this.progs = []
//     this.crses = []
//     this.stats = { institutes: 0, programmes: 0, courses: 0 }
//   }

//   async build (db: any): Promise<void> {
//     const t0 = Date.now()
//     console.log('\n' + '═'.repeat(60))
//     console.log('  BUILDING INDEX')
//     console.log('═'.repeat(60))

//     const data: DocumentData[] = await db
//       .collection(COLLECTION_NAME)
//       .find({})
//       .toArray()
//     console.log(`  Documents: ${data.length}`)

//     for (const doc of data) {
//       const id = doc._id.toString()
//       const iSlug = doc.slug || slug(doc.name || '')
//       const desc = getDesc(doc)

//       doc._slug = iSlug
//       doc._desc = desc
//       doc._courses = 0
//       this.docs.set(id, doc)

//       if (!doc.name) continue

//       const iSug: SuggestionItem = {
//         _k: `i-${id}`,
//         type: 'Institute',
//         id,
//         slug: iSlug,
//         name: doc.name,
//         logo: doc.logo,
//         city: doc.location?.city,
//         state: doc.location?.state
//       }
//       this.trie.i.add(doc.name, iSug)
//       if (doc.shortName) this.trie.i.add(doc.shortName, iSug)

//       if (doc.location?.city) this.idx.add('city', doc.location.city, id)
//       if (doc.location?.state) this.idx.add('state', doc.location.state, id)
//       if (doc.type) this.idx.add('type', doc.type, id)

//       for (const kw of extractKW(doc.name + ' ' + (doc.type || ''))) {
//         this.idx.add('keyword', kw, id)
//       }

//       this.stats.institutes++

//       if (!doc.programmes) continue

//       for (const prog of doc.programmes) {
//         if (!prog.name) continue
//         const pSlug = slug(prog.name)
//         const pCnt = prog.course?.length || prog.courseCount || 0

//         const pSug: SuggestionItem = {
//           _k: `p-${id}-${pSlug}`,
//           type: 'Program',
//           id,
//           slug: iSlug,
//           pSlug,
//           name: prog.name,
//           institute: doc.name,
//           logo: doc.logo
//         }
//         this.trie.p.add(prog.name, pSug)

//         const pFull: ProgramFull = {
//           ...pSug,
//           city: doc.location?.city,
//           state: doc.location?.state,
//           courseCount: pCnt,
//           eligibilityExams: prog.eligibilityExams || [],
//           placementRating: prog.placementRating,
//           sampleCourses: prog.course?.slice(0, 2).map(c => ({
//             name: c.degree || '',
//             slug: slug(c.degree || ''),
//             duration: c.duration,
//             fee: c.fees?.totalFee,
//             feeF: fee(c.fees?.totalFee)
//           })),
//           moreCourses: Math.max(0, pCnt - 2),
//           url: `/recommendation-collections/${iSlug}?programme=${pSlug}`
//         }
//         this.progs.push(pFull)

//         this.idx.add('programme', prog.name, id)
//         for (const kw of extractKW(prog.name)) this.idx.add('keyword', kw, id)
//         for (const ex of prog.eligibilityExams || [])
//           this.idx.add('exam', ex, id)

//         this.stats.programmes++

//         if (!prog.course) continue

//         for (const c of prog.course) {
//           if (!c.degree) continue
//           const cSlug = slug(c.degree)
//           const lvl = (c.level || c.courseLevel || '').toUpperCase()

//           const cSug: SuggestionItem = {
//             _k: `c-${id}-${cSlug}`,
//             type: 'Course',
//             id,
//             slug: iSlug,
//             pSlug,
//             cSlug,
//             name: c.degree,
//             programme: prog.name,
//             institute: doc.name,
//             logo: doc.logo
//           }
//           this.trie.c.add(c.degree, cSug)

//           const cFull: CourseFull = {
//             ...cSug,
//             city: doc.location?.city,
//             state: doc.location?.state,
//             duration: c.duration,
//             level: lvl,
//             fee: c.fees?.totalFee,
//             feeF: fee(c.fees?.totalFee),
//             tuitionFee: c.fees?.tuitionFee,
//             educationType: c.educationType,
//             totalSeats: c.totalSeats,
//             eligibilityExams: c.eligibilityExams || prog.eligibilityExams || [],
//             avgPackage: c.placements?.averagePackage,
//             avgPackageF: fee(c.placements?.averagePackage),
//             url: `/recommendation-collections/${iSlug}?programme=${pSlug}&course=${cSlug}`,
//             programmeDetails: {
//               name: prog.name,
//               slug: pSlug,
//               courseCount: pCnt,
//               placementRating: prog.placementRating,
//               eligibilityExams: prog.eligibilityExams || []
//             }
//           }
//           this.crses.push(cFull)

//           if (lvl) this.idx.add('level', lvl, id)
//           this.idx.add('course', c.degree, id)

//           for (const kw of extractKW(c.degree)) this.idx.add('keyword', kw, id)
//           for (const kw of extractKW(prog.name)) this.idx.add('keyword', kw, id)

//           doc._courses = (doc._courses || 0) + 1
//           this.stats.courses++
//         }
//       }
//     }

//     console.log('─'.repeat(60))
//     console.log(`  Institutes: ${this.stats.institutes}`)
//     console.log(`  Programmes: ${this.stats.programmes}`)
//     console.log(`  Courses: ${this.stats.courses}`)
//     console.log(`  Keywords: ${this.idx.m.keyword.size}`)
//     console.log(`  Time: ${Date.now() - t0}ms`)
//     console.log('═'.repeat(60) + '\n')
//   }

//   /**
//    * Enhanced suggest with human-like search understanding
//    */
//   suggest (q: string | null | undefined, limit: number = 8): any {
//     const p = new Perf()

//     if (!q?.trim()) {
//       return {
//         institutes: [],
//         programmes: [],
//         courses: [],
//         performance: p.done(0, 0)
//       }
//     }

//     const query = q.trim()
//     const tokens = tokenize(query)
//     const correctedTokens = correctTypos(tokens)
//     const expandedTokens = expandAbbreviations(correctedTokens)

//     // Use enhanced trie search with scoring
//     const instMatches = this.trie.i.findWithScores(query, limit * 2)
//     const progMatches = this.trie.p.findWithScores(query, limit * 2)
//     const courseMatches = this.trie.c.findWithScores(query, limit * 2)

//     let insts = instMatches.slice(0, limit).map(m => m.item)
//     let progs = progMatches.slice(0, limit).map(m => m.item)
//     let crses = courseMatches.slice(0, limit).map(m => m.item)

//     // Extract keywords from corrected and expanded tokens
//     const kws = extractKW(expandedTokens.join(' '))

//     // If trie didn't find much, fall back to keyword search
//     if (kws.length && insts.length < 3) {
//       let ids: Set<string> = new Set()
//       for (const kw of kws) {
//         ids = this.idx.or(ids, this.idx.get('keyword', kw))
//       }

//       // Also try fuzzy matching on city/state names
//       for (const token of correctedTokens) {
//         ids = this.idx.or(ids, this.idx.fuzzyGet('city', token, 0.8))
//         ids = this.idx.or(ids, this.idx.fuzzyGet('state', token, 0.8))
//       }

//       if (ids.size > 0) {
//         const additionalInsts = [...ids]
//           .slice(0, limit)
//           .map((id): SuggestionItem | null => {
//             const d = this.docs.get(id)
//             return d
//               ? {
//                   _k: `i-${id}`,
//                   type: 'Institute',
//                   id,
//                   slug: d._slug || '',
//                   name: d.name || '',
//                   logo: d.logo,
//                   city: d.location?.city,
//                   state: d.location?.state
//                 }
//               : null
//           })
//           .filter((x): x is SuggestionItem => x !== null)

//         // Merge with existing results (avoiding duplicates)
//         const existingKeys = new Set(insts.map(i => i._k))
//         for (const inst of additionalInsts) {
//           if (!existingKeys.has(inst._k)) {
//             insts.push(inst)
//           }
//         }
//         insts = insts.slice(0, limit)

//         if (progs.length < 3) {
//           progs = this.progs.filter(x => ids.has(x.id)).slice(0, limit)
//         }
//         if (crses.length < 3) {
//           crses = this.crses.filter(x => ids.has(x.id)).slice(0, limit)
//         }
//       }
//     }

//     const total = insts.length + progs.length + crses.length
//     console.log(
//       `[SUGGEST] "${q}" → ${insts.length}I/${progs.length}P/${crses.length}C`
//     )

//     return {
//       query: q,
//       normalizedQuery: normalizeQuery(q),
//       keywords: kws,
//       corrections:
//         correctedTokens.join(' ') !== tokens.join(' ')
//           ? { original: tokens.join(' '), corrected: correctedTokens.join(' ') }
//           : undefined,
//       institutes: insts.map(i => ({
//         type: 'Institute',
//         id: i.id,
//         slug: i.slug,
//         name: i.name,
//         logo: i.logo,
//         location: [i.city, i.state].filter(Boolean).join(', ')
//       })),
//       programmes: progs.map(prog => ({
//         type: 'Program',
//         id: prog.id,
//         slug: prog.slug,
//         pSlug: prog.pSlug,
//         name: prog.name,
//         institute: prog.institute,
//         logo: prog.logo
//       })),
//       courses: crses.map(c => ({
//         type: 'Course',
//         id: c.id,
//         slug: c.slug,
//         pSlug: c.pSlug,
//         cSlug: c.cSlug,
//         name: c.name,
//         programme: c.programme,
//         institute: c.institute,
//         logo: c.logo,
//         programmeDetails: (c as any).programmeDetails
//       })),
//       performance: p.done(this.docs.size, total)
//     }
//   }

//   search (filters: SearchFilters): any {
//     const {
//       q,
//       type,
//       city,
//       state,
//       level,
//       programme,
//       exam,
//       course,
//       page = 1,
//       limit = 20
//     } = filters

//     const p = new Perf()
//     const skip = (page - 1) * limit

//     let ids = new Set(this.docs.keys())

//     const splitValues = (value: string | null | undefined): string[] =>
//       value
//         ? value
//             .toString()
//             .split(/,|\band\b|&/i)
//             .map(v => v.trim())
//             .filter(Boolean)
//         : []

//     const orValues = (
//       key: IndexKey,
//       value: string | null | undefined
//     ): Set<string> => {
//       const values = splitValues(value)
//       if (!values.length) return new Set()
//       return this.idx.or(...values.map(v => this.idx.get(key, v)))
//     }

//     // Process query with NLP enhancements
//     const tokens = q ? tokenize(q) : []
//     const correctedTokens = correctTypos(tokens)
//     const expandedTokens = expandAbbreviations(correctedTokens)
//     const kws = extractKW(expandedTokens.join(' '))

//     if (kws.length) {
//       let kwIds: Set<string> = new Set()
//       for (const kw of kws) {
//         kwIds = this.idx.or(kwIds, this.idx.get('keyword', kw))
//       }
//       if (kwIds.size) ids = this.idx.and(ids, kwIds)
//     } else if (q?.trim()) {
//       // Use enhanced trie search
//       const tr = [
//         ...this.trie.i.find(q, 500),
//         ...this.trie.p.find(q, 500),
//         ...this.trie.c.find(q, 500)
//       ]
//       const trIds = new Set(tr.map(x => x.id))
//       if (trIds.size) ids = this.idx.and(ids, trIds)
//     }

//     // Apply filters with fuzzy matching support
//     if (city) ids = this.idx.and(ids, orValues('city', city))
//     if (state) ids = this.idx.and(ids, orValues('state', state))
//     if (level) ids = this.idx.and(ids, this.idx.get('level', level))
//     if (programme) ids = this.idx.and(ids, this.idx.get('programme', programme))
//     if (exam) ids = this.idx.and(ids, this.idx.get('exam', exam))
//     if (course) ids = this.idx.and(ids, this.idx.get('course', course))

//     let institutes: any[] = []
//     let programmes: any[] = []
//     let courses: any[] = []

//     if (!type || type === 'institute') {
//       institutes = [...ids]
//         .map(id => {
//           const d = this.docs.get(id)
//           if (!d) return null
//           return {
//             id,
//             slug: d._slug,
//             name: d.name,
//             shortName: d.shortName,
//             logo: d.logo,
//             coverImage: d.coverImage,
//             type: d.type,
//             city: d.location?.city,
//             state: d.location?.state,
//             establishedYear: d.establishedYear,
//             naacGrade: d.accreditation?.naac?.grade,
//             totalCourses: d._courses,
//             totalFacilities: d.campusDetails?.facilities_arr?.length || 0,
//             contact: d.contact?.phone?.[0],
//             description: d._desc
//               ? d._desc.substring(0, 350) + (d._desc.length > 350 ? '...' : '')
//               : null,
//             topRecruiters: d.placements?.topRecruiters?.slice(0, 6),
//             programmes: d.programmes?.slice(0, 3).map(pr => ({
//               name: pr.name,
//               slug: slug(pr.name || ''),
//               courseCount: pr.course?.length || pr.courseCount || 0,
//               eligibilityExams: pr.eligibilityExams?.slice(0, 4),
//               placementRating: pr.placementRating,
//               sampleCourses: pr.course?.slice(0, 2).map(c => ({
//                 name: c.degree,
//                 duration: c.duration,
//                 fee: c.fees?.totalFee,
//                 feeF: fee(c.fees?.totalFee)
//               })),
//               moreCourses: Math.max(0, (pr.course?.length || 0) - 2),
//               url: `/recommendation-collections/${d._slug}?programme=${slug(
//                 pr.name || ''
//               )}`
//             })),
//             moreProgrammes: Math.max(0, (d.programmes?.length || 0) - 3)
//           }
//         })
//         .filter(Boolean)
//     }

//     if (!type || type === 'programme') {
//       programmes = this.progs.filter(x => ids.has(x.id))
//     }

//     if (!type || type === 'course') {
//       courses = this.crses.filter(x => ids.has(x.id))
//     }

//     const filterCounts = {
//       cities: this.idx.counts('city', ids),
//       states: this.idx.counts('state', ids),
//       levels: this.idx.counts('level', ids),
//       programmes: this.idx.counts('programme', ids),
//       exams: this.idx.counts('exam', ids),
//       courses: this.idx.counts('course', ids)
//     }

//     const totals = {
//       institutes: institutes.length,
//       programmes: programmes.length,
//       courses: courses.length
//     }

//     const iPage = institutes.slice(skip, skip + limit)
//     const pPage = programmes.slice(skip, skip + limit)
//     const cPage = courses.slice(skip, skip + limit)

//     console.log(
//       `[SEARCH] q="${q}" type=${type || 'all'} → ${totals.institutes}I/${
//         totals.programmes
//       }P/${totals.courses}C`
//     )

//     return {
//       query: q,
//       keywords: kws,
//       activeFilters: { city, state, level, programme, exam, course },
//       filterCounts,
//       totals,
//       pagination: {
//         page,
//         limit,
//         hasMore: {
//           institutes: skip + limit < totals.institutes,
//           programmes: skip + limit < totals.programmes,
//           courses: skip + limit < totals.courses
//         }
//       },
//       institutes: iPage,
//       programmes: pPage,
//       courses: cPage,
//       performance: p.done(
//         this.docs.size,
//         totals.institutes + totals.programmes + totals.courses
//       )
//     }
//   }

//   institute (instSlug: string): any {
//     const p = new Perf()

//     let doc: DocumentData | null = null
//     for (const [, d] of this.docs) {
//       if (d._slug === instSlug || d.slug === instSlug) {
//         doc = d
//         break
//       }
//     }

//     if (!doc) {
//       return {
//         error: 'Institute not found',
//         performance: p.done(this.docs.size, 0)
//       }
//     }

//     console.log(`[INSTITUTE] ${instSlug}`)

//     const instituteSlug = doc._slug || doc.slug || ''
//     return {
//       id: doc._id.toString(),
//       slug: instituteSlug,
//       name: doc.name,
//       shortName: doc.shortName,
//       logo: doc.logo,
//       coverImage: doc.coverImage,
//       type: doc.type,
//       establishedYear: doc.establishedYear,
//       description: doc._desc,
//       location: doc.location,
//       contact: doc.contact,
//       accreditation: doc.accreditation,
//       rankings: doc.rankings,
//       overview: doc.overview,
//       academicOverview: {
//         totalCourses: doc._courses,
//         totalFacilities: doc.campusDetails?.facilities_arr?.length || 0,
//         facilities: doc.campusDetails?.facilities_arr
//       },
//       topRecruiters: doc.placements?.topRecruiters,
//       programmes: doc.programmes?.map(pr => ({
//         name: pr.name,
//         slug: slug(pr.name || ''),
//         courseCount: pr.course?.length || pr.courseCount || 0,
//         eligibilityExams: pr.eligibilityExams,
//         placementRating: pr.placementRating,
//         url: `/recommendation-collections/${instituteSlug}?programme=${slug(
//           pr.name || ''
//         )}`,
//         courses: pr.course?.map(c => ({
//           id: c._id?.toString(),
//           name: c.degree,
//           slug: slug(c.degree || ''),
//           duration: c.duration,
//           level: c.level || c.courseLevel,
//           fee: c.fees?.totalFee,
//           feeF: fee(c.fees?.totalFee),
//           tuitionFee: c.fees?.tuitionFee,
//           educationType: c.educationType,
//           totalSeats: c.totalSeats,
//           eligibilityExams: c.eligibilityExams || pr.eligibilityExams,
//           avgPackage: c.placements?.averagePackage,
//           avgPackageF: fee(c.placements?.averagePackage),
//           url: `/recommendation-collections/${instituteSlug}?programme=${slug(
//             pr.name || ''
//           )}&course=${slug(c.degree || '')}`
//         }))
//       })),
//       raw: {
//         campusDetails: doc.campusDetails,
//         admissions: doc.admissions,
//         placements: doc.placements,
//         researchAndInnovation: doc.researchAndInnovation,
//         alumniNetwork: doc.alumniNetwork,
//         faculty_student_ratio: doc.faculty_student_ratio
//       },
//       performance: p.done(this.docs.size, 1)
//     }
//   }

//   explore (filters: ExploreFilters): any {
//     const {
//       city,
//       state,
//       type,
//       level,
//       programme,
//       exam,
//       course,
//       accreditation,
//       page = 1,
//       limit = 20,
//       sortBy = 'name',
//       sortOrder = 'asc'
//     } = filters

//     const p = new Perf()
//     const skip = (page - 1) * limit

//     let ids = new Set(this.docs.keys())

//     const splitValues = (value: string | null | undefined): string[] =>
//       value
//         ? value
//             .toString()
//             .split(/,|\band\b|&/i)
//             .map(v => v.trim())
//             .filter(Boolean)
//         : []

//     const orValues = (
//       key: IndexKey,
//       value: string | null | undefined
//     ): Set<string> => {
//       const values = splitValues(value)
//       if (!values.length) return new Set()
//       return this.idx.or(...values.map(v => this.idx.get(key, v)))
//     }

//     if (city) ids = this.idx.and(ids, orValues('city', city))
//     if (state) ids = this.idx.and(ids, orValues('state', state))
//     if (type) ids = this.idx.and(ids, this.idx.get('type', type))
//     if (level) ids = this.idx.and(ids, this.idx.get('level', level))
//     if (programme) ids = this.idx.and(ids, this.idx.get('programme', programme))
//     if (exam) ids = this.idx.and(ids, this.idx.get('exam', exam))
//     if (course) ids = this.idx.and(ids, this.idx.get('course', course))

//     let institutes = [...ids]
//       .map(id => {
//         const d = this.docs.get(id)
//         if (!d) return null

//         if (accreditation) {
//           const grade = d.accreditation?.naac?.grade
//           if (accreditation === 'none' && grade) return null
//           if (accreditation !== 'none' && grade !== accreditation) return null
//         }

//         return {
//           id,
//           slug: d._slug,
//           name: d.name,
//           shortName: d.shortName,
//           logo: d.logo,
//           coverImage: d.coverImage,
//           type: d.type,
//           city: d.location?.city,
//           state: d.location?.state,
//           establishedYear: d.establishedYear,
//           naacGrade: d.accreditation?.naac?.grade,
//           totalCourses: d._courses,
//           totalFacilities: d.campusDetails?.facilities_arr?.length || 0,
//           contact: d.contact?.phone?.[0],
//           description: d._desc
//             ? d._desc.substring(0, 350) + (d._desc.length > 350 ? '...' : '')
//             : null,
//           topRecruiters: d.placements?.topRecruiters?.slice(0, 6),
//           programmes: d.programmes?.slice(0, 3).map(pr => ({
//             name: pr.name,
//             slug: slug(pr.name || ''),
//             courseCount: pr.course?.length || pr.courseCount || 0,
//             eligibilityExams: pr.eligibilityExams?.slice(0, 4),
//             placementRating: pr.placementRating,
//             sampleCourses: pr.course?.slice(0, 2).map(c => ({
//               name: c.degree,
//               duration: c.duration,
//               fee: c.fees?.totalFee,
//               feeF: fee(c.fees?.totalFee)
//             })),
//             moreCourses: Math.max(0, (pr.course?.length || 0) - 2),
//             url: `/recommendation-collections/${d._slug}?programme=${slug(
//               pr.name || ''
//             )}`
//           })),
//           moreProgrammes: Math.max(0, (d.programmes?.length || 0) - 3)
//         }
//       })
//       .filter((x): x is NonNullable<typeof x> => x !== null)

//     institutes.sort((a, b) => {
//       let compareValue = 0

//       switch (sortBy) {
//         case 'courses':
//           compareValue = (a.totalCourses || 0) - (b.totalCourses || 0)
//           break
//         case 'established':
//           compareValue = (a.establishedYear || 0) - (b.establishedYear || 0)
//           break
//         case 'name':
//         default:
//           compareValue = (a.name || '').localeCompare(b.name || '')
//           break
//       }

//       return sortOrder === 'desc' ? -compareValue : compareValue
//     })

//     const total = institutes.length

//     const filterCounts: Record<string, Record<string, number>> = {
//       cities: this.idx.counts('city', ids),
//       states: this.idx.counts('state', ids),
//       types: this.idx.counts('type', ids),
//       levels: this.idx.counts('level', ids),
//       programmes: this.idx.counts('programme', ids),
//       exams: this.idx.counts('exam', ids),
//       courses: this.idx.counts('course', ids)
//     }

//     const accreditationCounts: Record<string, number> = {}
//     for (const id of ids) {
//       const d = this.docs.get(id)
//       const grade = d?.accreditation?.naac?.grade
//       const key = grade || 'none'
//       accreditationCounts[key] = (accreditationCounts[key] || 0) + 1
//     }
//     filterCounts.accreditations = accreditationCounts

//     const paginatedInstitutes = institutes.slice(skip, skip + limit)

//     const activeFilterCount = [
//       city,
//       state,
//       type,
//       level,
//       programme,
//       exam,
//       course,
//       accreditation
//     ].filter(Boolean).length

//     console.log(
//       `[EXPLORE] filters=${activeFilterCount} → ${total} institutes (page ${page}/${Math.ceil(
//         total / limit
//       )})`
//     )

//     return {
//       activeFilters: {
//         city,
//         state,
//         type,
//         level,
//         programme,
//         exam,
//         course,
//         accreditation
//       },
//       filterCounts,
//       sort: { sortBy, sortOrder },
//       pagination: {
//         page: +page,
//         limit: +limit,
//         total,
//         totalPages: Math.ceil(total / limit),
//         hasMore: skip + limit < total
//       },
//       institutes: paginatedInstitutes,
//       performance: p.done(this.docs.size, total)
//     }
//   }

//   getStats (): any {
//     return {
//       documents: this.docs.size,
//       ...this.stats,
//       indexes: Object.fromEntries(
//         Object.entries(this.idx.m).map(([k, m]) => [k, m.size])
//       ),
//       tries: {
//         institutes: this.trie.i.n,
//         programmes: this.trie.p.n,
//         courses: this.trie.c.n
//       }
//     }
//   }
// }

// // ============================================================================
// // GLOBAL INSTANCE & INITIALIZATION
// // ============================================================================

// declare global {
//   // eslint-disable-next-line no-var
//   var searchEngine: Engine | undefined
//   // eslint-disable-next-line no-var
//   var searchEngineInit: Promise<void> | undefined
// }

// const engine: Engine = global.searchEngine || new Engine()
// global.searchEngine = engine

// export const initSearchEngine = async (): Promise<void> => {
//   if (!global.searchEngineInit) {
//     global.searchEngineInit = (async () => {
//       const { db } = await connectToDatabase()
//       await engine.build(db)
//     })()
//   }
//   return global.searchEngineInit
// }

// export default engine
import { connectToDatabase } from '@/lib/db/mongodb'

const COLLECTION_NAME = 'admininstitutes'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TrieNode {
  c: Record<string, TrieNode>
  d: SuggestionItem[]
  f: number // frequency count for popularity
  t: number // total documents passing through this node
}

interface CompressedTrieNode {
  k: string // compressed key (multiple characters)
  c: Record<string, CompressedTrieNode>
  d: SuggestionItem[]
  f: number
  t: number
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
  // Enhanced fields for better ranking
  popularity?: number
  naacGrade?: string
  establishedYear?: number
  totalCourses?: number
  avgPackage?: number
  coordinates?: { lat: number; lng: number }
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
    address?: string
    pincode?: string
    coordinates?: {
      latitude?: number
      longitude?: number
    }
  }
  contact?: {
    phone?: string[]
    email?: string
    website?: string
  }
  establishedYear?: number
  accreditation?: {
    naac?: {
      grade?: string
      cgpa?: number
    }
    nirf?: {
      year?: string
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
    campusType?: string
  }
  placements?: {
    topRecruiters?: string[]
    averagePackage?: number
    highestPackage?: number
  }
  programmes?: ProgrammeData[]
  rankings?: RankingData
  admissions?: any
  researchAndInnovation?: any
  alumniNetwork?: any
  academics?: AcademicsData
  _slug?: string
  _desc?: string | null
  _courses?: number
  _popularity?: number
  _searchVector?: Map<string, number> // TF-IDF vector
}

interface AcademicsData {
  totalStudents?: number
  totalFaculty?: number
  studentFacultyRatio?: number
  internationalStudents?: number
  schools?: Array<{
    name?: string
    established?: number
    programs?: any[]
  }>
}

interface RankingData {
  national?: any
  data?: Array<{
    publisherName?: string
    entityName?: string
    rankData?: Array<{
      year?: number
      rank?: string
    }>
  }>
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
    highestPackage?: number
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
  cacheHit?: boolean
  strategy?: string
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
  minFee?: number
  maxFee?: number
  minEstablished?: number
  maxEstablished?: number
  accreditation?: string
  facilities?: string[]
  nearLat?: number
  nearLng?: number
  radiusKm?: number
  sortBy?:
    | 'relevance'
    | 'popularity'
    | 'name'
    | 'established'
    | 'fee'
    | 'ranking'
    | 'distance'
  sortOrder?: 'asc' | 'desc'
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
  minFee?: number
  maxFee?: number
  facilities?: string[]
  page?: number
  limit?: number
  sortBy?: 'name' | 'courses' | 'established' | 'ranking' | 'popularity'
  sortOrder?: 'asc' | 'desc'
}

interface SearchMatch {
  item: SuggestionItem
  score: number
  matchType:
    | 'exact'
    | 'prefix'
    | 'fuzzy'
    | 'keyword'
    | 'phonetic'
    | 'synonym'
    | 'semantic'
    | 'bm25'
  components?: ScoreComponents
}

interface ScoreComponents {
  bm25Score: number
  fuzzyScore: number
  popularityBoost: number
  recencyBoost: number
  accreditationBoost: number
  totalScore: number
}

interface QueryIntent {
  type:
    | 'institute_search'
    | 'course_search'
    | 'programme_search'
    | 'location_search'
    | 'comparison'
    | 'ranking'
    | 'fee_query'
    | 'placement_query'
    | 'general'
  confidence: number
  entities: QueryEntity[]
  modifiers: QueryModifier[]
}

interface QueryEntity {
  type:
    | 'institute'
    | 'course'
    | 'programme'
    | 'location'
    | 'exam'
    | 'degree'
    | 'field'
  value: string
  position: number
  confidence: number
}

interface QueryModifier {
  type: 'top' | 'best' | 'cheap' | 'expensive' | 'near' | 'in' | 'for'
  value?: string
  position: number
}

interface AutoSuggestion {
  text: string
  type: 'query' | 'institute' | 'course' | 'programme' | 'location' | 'filter'
  score: number
  metadata?: any
  highlight?: string
}

interface FacetResult {
  field: string
  buckets: Array<{
    value: string
    count: number
    selected: boolean
  }>
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
  | 'facility'
  | 'recruiter'
  | 'accreditation'

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

// Haversine formula for geospatial distance
const haversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// ============================================================================
// ADVANCED FUZZY MATCHING & NLP UTILITIES
// ============================================================================

/**
 * Damerau-Levenshtein distance (handles transpositions)
 * More accurate than standard Levenshtein for typos
 */
const damerauLevenshtein = (a: string, b: string): number => {
  const lenA = a.length
  const lenB = b.length

  if (lenA === 0) return lenB
  if (lenB === 0) return lenA

  const matrix: number[][] = []

  for (let i = 0; i <= lenA; i++) {
    matrix[i] = [i]
    for (let j = 1; j <= lenB; j++) {
      matrix[i][j] = i === 0 ? j : 0
    }
  }

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )

      // Transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost)
      }
    }
  }

  return matrix[lenA][lenB]
}

/**
 * Jaro-Winkler similarity (better for names and short strings)
 * Returns value between 0 and 1
 */
const jaroWinkler = (s1: string, s2: string): number => {
  if (s1 === s2) return 1

  const len1 = s1.length
  const len2 = s2.length

  if (len1 === 0 || len2 === 0) return 0

  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1
  const s1Matches = new Array(len1).fill(false)
  const s2Matches = new Array(len2).fill(false)

  let matches = 0
  let transpositions = 0

  // Find matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow)
    const end = Math.min(i + matchWindow + 1, len2)

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue
      s1Matches[i] = true
      s2Matches[j] = true
      matches++
      break
    }
  }

  if (matches === 0) return 0

  // Count transpositions
  let k = 0
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue
    while (!s2Matches[k]) k++
    if (s1[i] !== s2[k]) transpositions++
    k++
  }

  const jaro =
    (matches / len1 +
      matches / len2 +
      (matches - transpositions / 2) / matches) /
    3

  // Winkler modification (boost for common prefix)
  let prefix = 0
  for (let i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
    if (s1[i] === s2[i]) prefix++
    else break
  }

  return jaro + prefix * 0.1 * (1 - jaro)
}

/**
 * Double Metaphone algorithm (better phonetic matching than Soundex)
 * Handles multiple pronunciations
 */
const doubleMetaphone = (word: string): [string, string] => {
  const vowels = new Set(['A', 'E', 'I', 'O', 'U'])
  let primary = ''
  let secondary = ''
  const str = word.toUpperCase()
  const len = str.length
  let pos = 0

  const charAt = (i: number) => (i >= 0 && i < len ? str[i] : '')
  const isVowel = (c: string) => vowels.has(c)

  // Skip silent letters at start
  if (['GN', 'KN', 'PN', 'WR', 'PS'].some(p => str.startsWith(p))) {
    pos++
  }

  // Handle initial X
  if (str[0] === 'X') {
    primary += 'S'
    secondary += 'S'
    pos++
  }

  while (pos < len && (primary.length < 4 || secondary.length < 4)) {
    const c = str[pos]

    switch (c) {
      case 'A':
      case 'E':
      case 'I':
      case 'O':
      case 'U':
      case 'Y':
        if (pos === 0) {
          primary += 'A'
          secondary += 'A'
        }
        pos++
        break

      case 'B':
        primary += 'P'
        secondary += 'P'
        pos += charAt(pos + 1) === 'B' ? 2 : 1
        break

      case 'C':
        if (charAt(pos + 1) === 'H' && charAt(pos + 2) !== 'I') {
          primary += 'K'
          secondary += 'K'
          pos += 2
        } else if (
          charAt(pos + 1) === 'I' ||
          charAt(pos + 1) === 'E' ||
          charAt(pos + 1) === 'Y'
        ) {
          primary += 'S'
          secondary += 'S'
          pos += 2
        } else {
          primary += 'K'
          secondary += 'K'
          pos += charAt(pos + 1) === 'C' ? 2 : 1
        }
        break

      case 'D':
        if (charAt(pos + 1) === 'G') {
          if (['I', 'E', 'Y'].includes(charAt(pos + 2))) {
            primary += 'J'
            secondary += 'J'
            pos += 3
          } else {
            primary += 'TK'
            secondary += 'TK'
            pos += 2
          }
        } else {
          primary += 'T'
          secondary += 'T'
          pos += charAt(pos + 1) === 'D' ? 2 : 1
        }
        break

      case 'F':
        primary += 'F'
        secondary += 'F'
        pos += charAt(pos + 1) === 'F' ? 2 : 1
        break

      case 'G':
        if (charAt(pos + 1) === 'H') {
          if (pos > 0 && !isVowel(charAt(pos - 1))) {
            primary += 'K'
            secondary += 'K'
          } else if (pos === 0) {
            primary += 'K'
            secondary += 'K'
          }
          pos += 2
        } else if (charAt(pos + 1) === 'N') {
          if (pos === 0 && isVowel(charAt(pos + 2))) {
            primary += 'KN'
            secondary += 'N'
          } else {
            primary += 'N'
            secondary += 'N'
          }
          pos += 2
        } else if (['I', 'E', 'Y'].includes(charAt(pos + 1))) {
          primary += 'J'
          secondary += 'K'
          pos += 2
        } else {
          primary += 'K'
          secondary += 'K'
          pos += charAt(pos + 1) === 'G' ? 2 : 1
        }
        break

      case 'H':
        if (pos === 0 || isVowel(charAt(pos - 1))) {
          if (isVowel(charAt(pos + 1))) {
            primary += 'H'
            secondary += 'H'
          }
        }
        pos++
        break

      case 'J':
        primary += 'J'
        secondary += 'J'
        pos += charAt(pos + 1) === 'J' ? 2 : 1
        break

      case 'K':
        primary += 'K'
        secondary += 'K'
        pos += charAt(pos + 1) === 'K' ? 2 : 1
        break

      case 'L':
        primary += 'L'
        secondary += 'L'
        pos += charAt(pos + 1) === 'L' ? 2 : 1
        break

      case 'M':
        primary += 'M'
        secondary += 'M'
        pos += charAt(pos + 1) === 'M' ? 2 : 1
        break

      case 'N':
        primary += 'N'
        secondary += 'N'
        pos += charAt(pos + 1) === 'N' ? 2 : 1
        break

      case 'P':
        if (charAt(pos + 1) === 'H') {
          primary += 'F'
          secondary += 'F'
          pos += 2
        } else {
          primary += 'P'
          secondary += 'P'
          pos += charAt(pos + 1) === 'P' ? 2 : 1
        }
        break

      case 'Q':
        primary += 'K'
        secondary += 'K'
        pos += charAt(pos + 1) === 'Q' ? 2 : 1
        break

      case 'R':
        primary += 'R'
        secondary += 'R'
        pos += charAt(pos + 1) === 'R' ? 2 : 1
        break

      case 'S':
        if (charAt(pos + 1) === 'H') {
          primary += 'X'
          secondary += 'X'
          pos += 2
        } else if (
          ['I', 'E', 'Y'].includes(charAt(pos + 1)) &&
          charAt(pos + 2) === 'O'
        ) {
          primary += 'S'
          secondary += 'X'
          pos += 3
        } else {
          primary += 'S'
          secondary += 'S'
          pos += charAt(pos + 1) === 'S' ? 2 : 1
        }
        break

      case 'T':
        if (charAt(pos + 1) === 'H') {
          primary += '0' // th sound
          secondary += 'T'
          pos += 2
        } else if (
          charAt(pos + 1) === 'I' &&
          ['O', 'A'].includes(charAt(pos + 2))
        ) {
          primary += 'X'
          secondary += 'X'
          pos += 3
        } else {
          primary += 'T'
          secondary += 'T'
          pos += charAt(pos + 1) === 'T' ? 2 : 1
        }
        break

      case 'V':
        primary += 'F'
        secondary += 'F'
        pos += charAt(pos + 1) === 'V' ? 2 : 1
        break

      case 'W':
        if (isVowel(charAt(pos + 1))) {
          primary += 'A'
          secondary += 'A'
        }
        pos++
        break

      case 'X':
        primary += 'KS'
        secondary += 'KS'
        pos += charAt(pos + 1) === 'X' ? 2 : 1
        break

      case 'Z':
        primary += 'S'
        secondary += 'S'
        pos += charAt(pos + 1) === 'Z' ? 2 : 1
        break

      default:
        pos++
    }
  }

  return [primary.slice(0, 4), secondary.slice(0, 4)]
}

/**
 * Soundex (kept for backward compatibility)
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
 * Porter Stemmer (simplified implementation for educational terms)
 */
const stem = (word: string): string => {
  let w = word.toLowerCase()

  // Step 1: Common suffix removal
  const suffixes = [
    { suffix: 'ational', replace: 'ate' },
    { suffix: 'tional', replace: 'tion' },
    { suffix: 'ization', replace: 'ize' },
    { suffix: 'iveness', replace: 'ive' },
    { suffix: 'fulness', replace: 'ful' },
    { suffix: 'ousness', replace: 'ous' },
    { suffix: 'ement', replace: '' },
    { suffix: 'ment', replace: '' },
    { suffix: 'ence', replace: '' },
    { suffix: 'ance', replace: '' },
    { suffix: 'able', replace: '' },
    { suffix: 'ible', replace: '' },
    { suffix: 'ing', replace: '' },
    { suffix: 'tion', replace: '' },
    { suffix: 'sion', replace: '' },
    { suffix: 'ness', replace: '' },
    { suffix: 'ity', replace: '' },
    { suffix: 'ies', replace: 'y' },
    { suffix: 'es', replace: '' },
    { suffix: 'ed', replace: '' },
    { suffix: 's', replace: '' }
  ]

  for (const { suffix, replace } of suffixes) {
    if (w.endsWith(suffix) && w.length > suffix.length + 2) {
      w = w.slice(0, -suffix.length) + replace
      break
    }
  }

  return w
}

/**
 * Calculate similarity score using multiple algorithms
 * Returns weighted combination of different similarity measures
 */
const multiStrategySimiliarity = (a: string, b: string): number => {
  const aLower = a.toLowerCase()
  const bLower = b.toLowerCase()

  // Exact match
  if (aLower === bLower) return 1.0

  // Prefix match (high weight)
  if (aLower.startsWith(bLower) || bLower.startsWith(aLower)) {
    const minLen = Math.min(aLower.length, bLower.length)
    const maxLen = Math.max(aLower.length, bLower.length)
    return 0.9 * (minLen / maxLen)
  }

  // Jaro-Winkler (good for short strings and names)
  const jw = jaroWinkler(aLower, bLower)

  // Damerau-Levenshtein normalized
  const maxLen = Math.max(aLower.length, bLower.length)
  const dl = 1 - damerauLevenshtein(aLower, bLower) / maxLen

  // N-gram similarity
  const ngram = ngramSimilarity(aLower, bLower, 2)

  // Weighted combination
  return jw * 0.4 + dl * 0.35 + ngram * 0.25
}

/**
 * Normalize query for consistent matching
 */
const normalizeQuery = (query: string): string => {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Advanced tokenizer with special handling for educational terms
 */
const tokenize = (query: string): string[] => {
  const normalized = normalizeQuery(query)
  const tokens = normalized.split(' ').filter(word => word.length > 1)

  // Handle compound terms
  const compoundTokens: string[] = []
  for (let i = 0; i < tokens.length - 1; i++) {
    // Check for known compound terms
    const compound = tokens[i] + tokens[i + 1]
    const compoundWithSpace = tokens[i] + ' ' + tokens[i + 1]
    if (COMPOUND_TERMS.has(compound) || COMPOUND_TERMS.has(compoundWithSpace)) {
      compoundTokens.push(compoundWithSpace)
    }
  }

  return [...tokens, ...compoundTokens]
}

// Known compound terms in education
const COMPOUND_TERMS = new Set([
  'computer science',
  'electrical engineering',
  'mechanical engineering',
  'civil engineering',
  'chemical engineering',
  'data science',
  'machine learning',
  'artificial intelligence',
  'business administration',
  'hotel management',
  'fashion design',
  'interior design',
  'graphic design',
  'information technology'
])

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

  // Dice coefficient
  return (2 * intersection) / (ngramsA.size + ngramsB.size)
}

// ============================================================================
// COMPREHENSIVE ABBREVIATION & SYNONYM MAPPINGS
// ============================================================================

const ABBREVIATIONS: Record<string, string[]> = {
  // Institute types
  iit: ['indian institute of technology', 'iit'],
  nit: ['national institute of technology', 'nit'],
  iiit: ['indian institute of information technology', 'iiit', 'triple i t'],
  iim: ['indian institute of management', 'iim'],
  bits: ['birla institute of technology and science', 'bits pilani'],
  vit: ['vellore institute of technology', 'vit'],
  srm: ['srm institute of science and technology', 'srm'],
  mit: [
    'manipal institute of technology',
    'massachusetts institute of technology'
  ],
  lpu: ['lovely professional university'],
  amity: ['amity university'],

  // Engineering branches
  cse: ['computer science engineering', 'computer science', 'cs', 'csce'],
  ece: [
    'electronics and communication engineering',
    'electronics communication',
    'ec'
  ],
  eee: ['electrical and electronics engineering', 'electrical electronics'],
  ee: ['electrical engineering'],
  me: ['mechanical engineering', 'mech'],
  ce: ['civil engineering'],
  che: ['chemical engineering'],
  it: ['information technology', 'info tech'],
  ai: ['artificial intelligence'],
  ml: ['machine learning'],
  ds: ['data science'],
  aiml: ['artificial intelligence and machine learning', 'ai ml'],
  vlsi: ['very large scale integration'],
  iot: ['internet of things'],

  // Degrees
  btech: ['bachelor of technology', 'b.tech', 'b tech', 'be', 'b.e.', 'b.e'],
  mtech: ['master of technology', 'm.tech', 'm tech', 'me', 'm.e.', 'm.e'],
  mba: ['master of business administration', 'm.b.a', 'pgdm'],
  bba: ['bachelor of business administration', 'b.b.a'],
  bca: ['bachelor of computer applications', 'b.c.a'],
  mca: ['master of computer applications', 'm.c.a'],
  bsc: ['bachelor of science', 'b.sc', 'b sc', 'b.s.'],
  msc: ['master of science', 'm.sc', 'm sc', 'm.s.'],
  bcom: ['bachelor of commerce', 'b.com', 'b com'],
  mcom: ['master of commerce', 'm.com', 'm com'],
  ba: ['bachelor of arts', 'b.a', 'b a'],
  ma: ['master of arts', 'm.a', 'm a'],
  llb: ['bachelor of laws', 'll.b', 'l.l.b'],
  llm: ['master of laws', 'll.m', 'l.l.m'],
  mbbs: ['bachelor of medicine bachelor of surgery', 'm.b.b.s'],
  md: ['doctor of medicine', 'm.d.'],
  bds: ['bachelor of dental surgery', 'b.d.s'],
  bpharm: ['bachelor of pharmacy', 'b.pharm', 'b pharma'],
  mpharm: ['master of pharmacy', 'm.pharm', 'm pharma'],
  pharmd: ['doctor of pharmacy', 'pharm.d'],
  barch: ['bachelor of architecture', 'b.arch', 'b arch'],
  march: ['master of architecture', 'm.arch', 'm arch'],
  bdes: ['bachelor of design', 'b.des', 'b des'],
  mdes: ['master of design', 'm.des', 'm des'],
  bed: ['bachelor of education', 'b.ed', 'b ed'],
  med: ['master of education', 'm.ed', 'm ed'],
  phd: ['doctor of philosophy', 'ph.d', 'ph d', 'doctorate'],

  // Common terms
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
  pvt: ['private'],
  auto: ['autonomous'],
  hons: ['honours', 'honors']
}

// Build reverse lookup for faster abbreviation detection
// Note: We create new arrays to avoid mutating the original ABBREVIATIONS
const ABBREVIATION_REVERSE: Map<string, string[]> = new Map()
for (const [abbr, expansions] of Object.entries(ABBREVIATIONS)) {
  // For forward lookup: abbr -> expansions (create a copy!)
  if (!ABBREVIATION_REVERSE.has(abbr)) {
    ABBREVIATION_REVERSE.set(abbr, [...expansions])
  } else {
    // Merge if already exists
    const existing = ABBREVIATION_REVERSE.get(abbr)!
    for (const exp of expansions) {
      if (!existing.includes(exp)) existing.push(exp)
    }
  }

  // For reverse lookup: expansion -> [abbreviations]
  for (const expansion of expansions) {
    // Skip self-references to avoid circular issues
    if (expansion === abbr) continue

    if (!ABBREVIATION_REVERSE.has(expansion)) {
      ABBREVIATION_REVERSE.set(expansion, [])
    }
    const reverseList = ABBREVIATION_REVERSE.get(expansion)!
    if (!reverseList.includes(abbr)) {
      reverseList.push(abbr)
    }
  }
}

/**
 * Expand abbreviations in query tokens
 */
const expandAbbreviations = (tokens: string[]): string[] => {
  const expanded: string[] = []
  for (const token of tokens) {
    expanded.push(token)
    const abbr = ABBREVIATIONS[token]
    if (abbr) {
      expanded.push(...abbr)
    }
  }
  return [...new Set(expanded)]
}

// ============================================================================
// COMPREHENSIVE TYPO CORRECTIONS
// ============================================================================

const TYPO_CORRECTIONS: Record<string, string> = {
  // Engineering
  enginnering: 'engineering',
  enginering: 'engineering',
  engneering: 'engineering',
  enginneering: 'engineering',
  engineerng: 'engineering',
  engeneering: 'engineering',

  // Management
  managment: 'management',
  managemnt: 'management',
  manegement: 'management',
  managament: 'management',
  mangement: 'management',

  // University/College
  universty: 'university',
  univeristy: 'university',
  univercity: 'university',
  univerity: 'university',
  unversity: 'university',
  collage: 'college',
  colege: 'college',
  collge: 'college',
  colledge: 'college',

  // Institute
  institue: 'institute',
  instutute: 'institute',
  insitute: 'institute',
  intitute: 'institute',
  instituite: 'institute',

  // Technology
  tecnology: 'technology',
  techonlogy: 'technology',
  technolgy: 'technology',
  techology: 'technology',
  technlogy: 'technology',

  // Medical
  medicle: 'medical',
  medcal: 'medical',
  mediacl: 'medical',
  pharamcy: 'pharmacy',
  pharmcy: 'pharmacy',
  pharmecy: 'pharmacy',

  // Computer
  computor: 'computer',
  compter: 'computer',
  computar: 'computer',
  comupter: 'computer',
  compueter: 'computer',

  // Science
  sciance: 'science',
  scince: 'science',
  sceince: 'science',
  sicence: 'science',

  // Business
  busines: 'business',
  bussiness: 'business',
  buisness: 'business',
  busness: 'business',
  buisiness: 'business',

  // Admission
  admision: 'admission',
  admisson: 'admission',
  addmission: 'admission',

  // Architecture
  architechture: 'architecture',
  arcitecture: 'architecture',
  architectur: 'architecture',

  // Communication
  comunication: 'communication',
  communicaton: 'communication',
  comminication: 'communication',

  // Mechanical
  machanical: 'mechanical',
  mechancal: 'mechanical',
  mechanicle: 'mechanical',

  // Electrical
  electircal: 'electrical',
  electricle: 'electrical',
  elecrrical: 'electrical',

  // Electronics
  elctronics: 'electronics',
  electroincs: 'electronics',
  electonics: 'electronics',

  // Civil
  civl: 'civil',
  cival: 'civil',

  // Chemical
  chemcal: 'chemical',
  chemicle: 'chemical',

  // Information
  infromation: 'information',
  informaton: 'information',
  infomation: 'information',

  // Application
  aplication: 'application',
  applicaton: 'application',
  appication: 'application',

  // Administration
  adminstration: 'administration',
  administraton: 'administration',

  // Commerce
  comerce: 'commerce',
  commerse: 'commerce',

  // Design
  desgin: 'design',
  desgn: 'design',

  // Degree
  degre: 'degree',
  degee: 'degree',

  // Course
  cource: 'course',
  coarse: 'course',

  // Placement
  placment: 'placement',
  placemet: 'placement',

  // Eligibility
  eligiblity: 'eligibility',
  eligibilty: 'eligibility',

  // Scholarship
  scholorship: 'scholarship',
  scholarhip: 'scholarship',

  // Hostel
  hostal: 'hostel',
  hostl: 'hostel',

  // Location-specific
  ahmdabad: 'ahmedabad',
  ahemdabad: 'ahmedabad',
  ahmadabad: 'ahmedabad',
  banglore: 'bangalore',
  bangaluru: 'bangalore',
  bengaluru: 'bangalore',
  bombay: 'mumbai',
  calcutta: 'kolkata',
  madras: 'chennai',
  dilli: 'delhi',
  delhe: 'delhi',
  hydrabad: 'hyderabad',
  hyderbad: 'hyderabad',
  pune: 'pune',
  poona: 'pune',
  gujrat: 'gujarat',
  gujurat: 'gujarat',
  maharashtr: 'maharashtra',
  maharastra: 'maharashtra',
  tamilnadu: 'tamil nadu',
  karnatka: 'karnataka',
  kerla: 'kerala',
  andhrapradesh: 'andhra pradesh',
  telangna: 'telangana'
}

/**
 * Correct common typos in tokens
 */
const correctTypos = (tokens: string[]): string[] => {
  return tokens.map(token => TYPO_CORRECTIONS[token] || token)
}

// ============================================================================
// EXTENDED KEYWORD CATEGORIES (from Document 2)
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
    'eee',
    'electrical and electronics',
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
    'polymer',
    'mechatronics',
    'robotics',
    'nanotechnology',
    'vlsi',
    'embedded systems',
    'data science',
    'artificial intelligence',
    'machine learning',
    'cyber security',
    'cloud computing',
    'software engineering'
  ],
  medical: [
    'mbbs',
    'md',
    'ms',
    'bds',
    'mds',
    'nursing',
    'bsc nursing',
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
    'paramedical',
    'veterinary',
    'bvsc',
    'optometry',
    'radiology',
    'anesthesia',
    'cardiology',
    'dermatology',
    'neurology',
    'oncology',
    'orthopedics',
    'pediatrics',
    'psychiatry',
    'surgery',
    'pathology',
    'microbiology',
    'biochemistry',
    'anatomy',
    'physiology',
    'pharmacology',
    'clinical research'
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
    'banking',
    'insurance',
    'investment banking',
    'financial management',
    'project management',
    'logistics',
    'digital marketing',
    'e-commerce',
    'tourism management',
    'hotel management',
    'aviation management',
    'sports management'
  ],
  science: [
    'b.sc',
    'bsc',
    'm.sc',
    'msc',
    'science',
    'physics',
    'chemistry',
    'biology',
    'mathematics',
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
    'data science',
    'agriculture',
    'horticulture',
    'fisheries',
    'genetics',
    'molecular biology',
    'neuroscience',
    'bioinformatics',
    'computational biology',
    'food science',
    'nutrition'
  ],
  commerce: [
    'b.com',
    'bcom',
    'm.com',
    'mcom',
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
    'financial management',
    'economics',
    'actuarial science',
    'audit',
    'cost accounting',
    'business economics'
  ],
  arts: [
    'b.a.',
    'ba',
    'm.a.',
    'ma',
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
    'linguistics',
    'foreign languages',
    'fine arts',
    'performing arts',
    'music',
    'dance',
    'theatre',
    'film studies'
  ],
  law: [
    'llb',
    'llm',
    'law',
    'legal',
    'ba llb',
    'bba llb',
    'advocate',
    'legal studies',
    'corporate law',
    'criminal law',
    'constitutional law',
    'international law',
    'intellectual property',
    'cyber law',
    'human rights law',
    'environmental law',
    'taxation law',
    'banking law',
    'company law',
    'labour law',
    'family law'
  ],
  design: [
    'b.des',
    'm.des',
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
    'game design',
    'communication design',
    'industrial design',
    'jewellery design',
    'accessory design',
    'visual communication',
    'user experience',
    'user interface',
    'interaction design'
  ],
  pharmacy: [
    'b.pharm',
    'bpharm',
    'm.pharm',
    'mpharm',
    'd.pharm',
    'dpharm',
    'pharmacy',
    'pharmaceutical',
    'pharmacology',
    'pharma',
    'pharmaceutical sciences',
    'pharmaceutical chemistry',
    'pharmacognosy',
    'pharmaceutics',
    'clinical pharmacy',
    'industrial pharmacy',
    'regulatory affairs',
    'drug development',
    'pharmaceutical analysis',
    'pharmacovigilance',
    'pharm.d'
  ],
  computer: [
    'computer',
    'bca',
    'mca',
    'software',
    'data science',
    'ai',
    'ml',
    'cyber',
    'artificial intelligence',
    'machine learning',
    'cyber security',
    'information technology',
    'programming',
    'web development',
    'app development',
    'cloud computing',
    'blockchain',
    'iot',
    'software engineering',
    'full stack',
    'devops',
    'big data',
    'data analytics',
    'python',
    'java',
    'cloud',
    'networking'
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
    'housekeeping',
    'front office',
    'food and beverage',
    'resort management',
    'event management',
    'travel management'
  ],
  education: [
    'b.ed',
    'bed',
    'm.ed',
    'med',
    'education',
    'teaching',
    'pedagogy',
    'teacher training',
    'elementary education',
    'special education',
    'physical education',
    'd.el.ed',
    'nursery teacher training',
    'montessori',
    'curriculum development',
    'educational psychology'
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
    'interior architecture',
    'sustainable architecture',
    'urban design',
    'town planning',
    'conservation architecture',
    'building design'
  ],
  agriculture: [
    'agriculture',
    'agricultural',
    'bsc agriculture',
    'msc agriculture',
    'agronomy',
    'horticulture',
    'forestry',
    'fisheries',
    'dairy',
    'animal husbandry',
    'veterinary',
    'food technology',
    'agricultural engineering',
    'soil science',
    'plant pathology',
    'entomology',
    'agricultural economics'
  ],
  // Modifiers
  top: [
    'top',
    'best',
    'premier',
    'leading',
    'ranked',
    'famous',
    'popular',
    'renowned',
    'prestigious'
  ],
  college: [
    'college',
    'institute',
    'university',
    'school',
    'academy',
    'institution',
    'campus'
  ],
  government: [
    'government',
    'public',
    'state',
    'central',
    'govt',
    'gov',
    'aided'
  ],
  private: ['private', 'deemed', 'autonomous', 'self-financed', 'unaided']
}

// Build reverse lookup for faster keyword extraction
const KW_REVERSE: Map<string, Set<string>> = new Map()
for (const [category, keywords] of Object.entries(KW)) {
  for (const kw of keywords) {
    if (!KW_REVERSE.has(kw)) KW_REVERSE.set(kw, new Set())
    KW_REVERSE.get(kw)!.add(category)
  }
}

/**
 * Extract keywords with confidence scores
 */
const extractKW = (
  text: string | null | undefined
): Array<{ keyword: string; confidence: number }> => {
  if (!text) return []

  const normalized = normalizeQuery(text)
  const words = normalized.split(/\s+/)
  const results: Map<string, number> = new Map()

  // Check individual words
  for (const word of words) {
    if (KW[word]) {
      results.set(word, (results.get(word) || 0) + 1.0)
    }

    const categories = KW_REVERSE.get(word)
    if (categories) {
      for (const cat of categories) {
        results.set(cat, (results.get(cat) || 0) + 0.9)
      }
    }

    // Partial match with lower confidence
    for (const [category, keywords] of Object.entries(KW)) {
      if (keywords.some(k => k.includes(word) || word.includes(k))) {
        results.set(category, (results.get(category) || 0) + 0.5)
      }
    }
  }

  // Check multi-word phrases
  for (const [category, keywords] of Object.entries(KW)) {
    for (const keyword of keywords) {
      if (keyword.includes(' ') && normalized.includes(keyword)) {
        results.set(category, (results.get(category) || 0) + 1.2)
      }
    }
  }

  return Array.from(results.entries())
    .map(([keyword, confidence]) => ({
      keyword,
      confidence: Math.min(confidence, 1)
    }))
    .sort((a, b) => b.confidence - a.confidence)
}

// ============================================================================
// BM25 RANKING ALGORITHM
// ============================================================================

/**
 * BM25 parameters (tuned for educational search)
 */
const BM25_K1 = 1.5 // Term frequency saturation
const BM25_B = 0.75 // Document length normalization

class BM25Index {
  private docs: Map<string, { tf: Map<string, number>; length: number }>
  private idf: Map<string, number>
  private avgLength: number
  private totalDocs: number

  constructor () {
    this.docs = new Map()
    this.idf = new Map()
    this.avgLength = 0
    this.totalDocs = 0
  }

  /**
   * Add a document to the BM25 index
   */
  addDocument (docId: string, text: string): void {
    const tokens = tokenize(text)
    const tf = new Map<string, number>()

    // Calculate term frequencies
    for (const token of tokens) {
      const stemmed = stem(token)
      tf.set(stemmed, (tf.get(stemmed) || 0) + 1)
    }

    this.docs.set(docId, { tf, length: tokens.length })
    this.totalDocs++

    // Update average length
    let totalLen = 0
    for (const [, doc] of this.docs) {
      totalLen += doc.length
    }
    this.avgLength = totalLen / this.totalDocs
  }

  /**
   * Calculate IDF for all terms (call after all documents are added)
   */
  calculateIDF (): void {
    const docFreq = new Map<string, number>()

    // Count document frequency for each term
    for (const [, doc] of this.docs) {
      const seenTerms = new Set<string>()
      for (const [term] of doc.tf) {
        if (!seenTerms.has(term)) {
          docFreq.set(term, (docFreq.get(term) || 0) + 1)
          seenTerms.add(term)
        }
      }
    }

    // Calculate IDF using BM25 formula
    for (const [term, df] of docFreq) {
      // IDF = log((N - df + 0.5) / (df + 0.5))
      this.idf.set(term, Math.log((this.totalDocs - df + 0.5) / (df + 0.5) + 1))
    }
  }

  /**
   * Score a document against a query
   */
  score (docId: string, query: string): number {
    const doc = this.docs.get(docId)
    if (!doc) return 0

    const queryTokens = tokenize(query)
    let score = 0

    for (const token of queryTokens) {
      const stemmed = stem(token)
      const tf = doc.tf.get(stemmed) || 0
      const idf = this.idf.get(stemmed) || 0

      if (tf > 0 && idf > 0) {
        // BM25 formula
        const numerator = tf * (BM25_K1 + 1)
        const denominator =
          tf + BM25_K1 * (1 - BM25_B + BM25_B * (doc.length / this.avgLength))
        score += idf * (numerator / denominator)
      }
    }

    return score
  }

  /**
   * Search and rank all documents
   */
  search (
    query: string,
    limit: number = 100
  ): Array<{ docId: string; score: number }> {
    const results: Array<{ docId: string; score: number }> = []

    for (const [docId] of this.docs) {
      const s = this.score(docId, query)
      if (s > 0) {
        results.push({ docId, score: s })
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit)
  }
}

// ============================================================================
// BLOOM FILTER (for fast negative lookups)
// ============================================================================

class BloomFilter {
  private bits: Uint8Array
  private size: number
  private hashCount: number

  constructor (expectedItems: number, falsePositiveRate: number = 0.01) {
    // Calculate optimal size and hash count
    this.size = Math.ceil(
      -(expectedItems * Math.log(falsePositiveRate)) / Math.log(2) ** 2
    )
    this.hashCount = Math.ceil((this.size / expectedItems) * Math.log(2))
    this.bits = new Uint8Array(Math.ceil(this.size / 8))
  }

  private hash (str: string, seed: number): number {
    let h = seed
    for (let i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) >>> 0
    }
    return h % this.size
  }

  add (item: string): void {
    for (let i = 0; i < this.hashCount; i++) {
      const pos = this.hash(item, i)
      this.bits[Math.floor(pos / 8)] |= 1 << pos % 8
    }
  }

  mightContain (item: string): boolean {
    for (let i = 0; i < this.hashCount; i++) {
      const pos = this.hash(item, i)
      if ((this.bits[Math.floor(pos / 8)] & (1 << pos % 8)) === 0) {
        return false
      }
    }
    return true
  }
}

// ============================================================================
// LRU CACHE
// ============================================================================

class LRUCache<K, V> {
  private cache: Map<K, V>
  private maxSize: number

  constructor (maxSize: number) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  get (key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  set (key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest (first) entry
      const firstKey: K | any = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  has (key: K): boolean {
    return this.cache.has(key)
  }

  clear (): void {
    this.cache.clear()
  }
}

// ============================================================================
// PERFORMANCE TRACKER
// ============================================================================

class Perf {
  private t0: bigint
  private strategy?: string
  private cacheHit?: boolean

  constructor () {
    this.t0 = process.hrtime.bigint()
  }

  setStrategy (strategy: string): void {
    this.strategy = strategy
  }

  setCacheHit (hit: boolean): void {
    this.cacheHit = hit
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
      )}ms`,
      cacheHit: this.cacheHit,
      strategy: this.strategy
    }
  }
}

// ============================================================================
// QUERY INTENT ANALYZER
// ============================================================================

class QueryIntentAnalyzer {
  private locationPatterns: RegExp[]
  private feePatterns: RegExp[]
  private placementPatterns: RegExp[]
  private rankingPatterns: RegExp[]
  private comparisonPatterns: RegExp[]

  constructor () {
    this.locationPatterns = [
      /\b(in|at|near|around)\s+([a-zA-Z\s]+)/i,
      /\b([a-zA-Z]+)\s+(college|university|institute)s?\b/i,
      /\bcollege\s+in\s+([a-zA-Z\s]+)/i
    ]

    this.feePatterns = [
      /\b(fee|fees|cost|tuition|affordable|cheap|expensive)\b/i,
      /\b(budget|price|pricing)\b/i,
      /\bunder\s+(\d+)\s*(lakh|lac|lakhs)?\b/i
    ]

    this.placementPatterns = [
      /\b(placement|placements|job|jobs|salary|package|recruit)\b/i,
      /\b(highest|average)\s+package\b/i,
      /\b(career|employment)\b/i
    ]

    this.rankingPatterns = [
      /\b(rank|ranking|ranked|top|best|nirf|naac)\b/i,
      /\b(premier|prestigious|reputed)\b/i
    ]

    this.comparisonPatterns = [
      /\b(vs|versus|compare|comparison|better|between)\b/i,
      /\b(or)\b/i,
      /\bwhich\s+is\s+better\b/i
    ]
  }

  analyze (query: string): QueryIntent {
    const normalizedQuery = query.toLowerCase()
    const entities: QueryEntity[] = []
    const modifiers: QueryModifier[] = []

    // Detect location
    for (const pattern of this.locationPatterns) {
      const match = normalizedQuery.match(pattern)
      if (match) {
        entities.push({
          type: 'location',
          value: match[2] || match[1],
          position: match.index || 0,
          confidence: 0.8
        })
      }
    }

    // Detect query type
    let type: QueryIntent['type'] = 'general'
    let confidence = 0.5

    // Check for comparison
    for (const pattern of this.comparisonPatterns) {
      if (pattern.test(normalizedQuery)) {
        type = 'comparison'
        confidence = 0.9
        break
      }
    }

    // Check for fee queries
    if (type === 'general') {
      for (const pattern of this.feePatterns) {
        if (pattern.test(normalizedQuery)) {
          type = 'fee_query'
          confidence = 0.85
          modifiers.push({ type: 'cheap', position: 0 })
          break
        }
      }
    }

    // Check for placement queries
    if (type === 'general') {
      for (const pattern of this.placementPatterns) {
        if (pattern.test(normalizedQuery)) {
          type = 'placement_query'
          confidence = 0.85
          break
        }
      }
    }

    // Check for ranking queries
    if (type === 'general') {
      for (const pattern of this.rankingPatterns) {
        if (pattern.test(normalizedQuery)) {
          type = 'ranking'
          confidence = 0.85
          break
        }
      }
    }

    // Detect course/programme entities
    const keywords = extractKW(query)
    for (const { keyword, confidence: kwConf } of keywords) {
      if (
        [
          'engineering',
          'medical',
          'management',
          'science',
          'commerce',
          'arts',
          'law',
          'design',
          'pharmacy',
          'computer',
          'hotel',
          'education',
          'architecture'
        ].includes(keyword)
      ) {
        entities.push({
          type: 'field',
          value: keyword,
          position: 0,
          confidence: kwConf
        })
        if (type === 'general') {
          type = 'course_search'
          confidence = 0.75
        }
      }
    }

    // Check for top/best modifiers
    if (/\b(top|best|premier|leading)\b/i.test(normalizedQuery)) {
      modifiers.push({ type: 'top', position: 0 })
    }

    return { type, confidence, entities, modifiers }
  }
}

// ============================================================================
// ENHANCED TRIE WITH COMPRESSED PATHS & FUZZY MATCHING
// ============================================================================

class AdvancedTrie {
  root: TrieNode
  n: number
  private allItems: Map<string, SuggestionItem>
  private soundexIndex: Map<string, Set<string>>
  private metaphoneIndex: Map<string, Set<string>>
  private ngramIndex: Map<string, Set<string>>
  private stemIndex: Map<string, Set<string>>
  private bloomFilter: BloomFilter

  constructor (expectedItems: number = 100000) {
    this.root = { c: {}, d: [], f: 0, t: 0 }
    this.n = 0
    this.allItems = new Map()
    this.soundexIndex = new Map()
    this.metaphoneIndex = new Map()
    this.ngramIndex = new Map()
    this.stemIndex = new Map()
    this.bloomFilter = new BloomFilter(expectedItems)
  }

  add (text: string, data: SuggestionItem): void {
    if (!text) return

    const normalizedText = text.toLowerCase()

    // Store in allItems for fuzzy search
    this.allItems.set(data._k, data)

    // Add to bloom filter
    this.bloomFilter.add(normalizedText)

    // Build phonetic indexes
    const words = normalizedText.split(/\s+/)
    for (const word of words) {
      if (word.length >= 2) {
        // Soundex
        const sx = soundex(word)
        if (!this.soundexIndex.has(sx)) this.soundexIndex.set(sx, new Set())
        this.soundexIndex.get(sx)!.add(data._k)

        // Double Metaphone
        const [primary, secondary] = doubleMetaphone(word)
        if (!this.metaphoneIndex.has(primary))
          this.metaphoneIndex.set(primary, new Set())
        this.metaphoneIndex.get(primary)!.add(data._k)
        if (secondary && secondary !== primary) {
          if (!this.metaphoneIndex.has(secondary))
            this.metaphoneIndex.set(secondary, new Set())
          this.metaphoneIndex.get(secondary)!.add(data._k)
        }

        // Stemmed index
        const stemmed = stem(word)
        if (!this.stemIndex.has(stemmed)) this.stemIndex.set(stemmed, new Set())
        this.stemIndex.get(stemmed)!.add(data._k)
      }
    }

    // Build n-gram index
    const ngrams = generateNgrams(normalizedText, 3)
    for (const ngram of ngrams) {
      if (!this.ngramIndex.has(ngram)) this.ngramIndex.set(ngram, new Set())
      this.ngramIndex.get(ngram)!.add(data._k)
    }

    // Standard trie insertion with frequency tracking
    let node = this.root
    for (const ch of normalizedText) {
      if (!node.c[ch]) node.c[ch] = { c: {}, d: [], f: 0, t: 0 }
      node = node.c[ch]
      node.t++ // Track total documents passing through
      if (node.d.length < 100 && !node.d.some(x => x._k === data._k)) {
        node.d.push(data)
      }
    }
    node.f++ // Mark as complete word
    this.n++
  }

  /**
   * Quick check if a query might have matches
   */
  mightHaveMatches (query: string): boolean {
    return this.bloomFilter.mightContain(query.toLowerCase())
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
    const correctedTokens = correctTypos(tokens)
    const expandedTokens = expandAbbreviations(correctedTokens)

    // 1. Exact prefix match (highest priority)
    const exactMatches = this.findExactPrefix(normalizedQuery, limit)
    for (const item of exactMatches) {
      if (!seen.has(item._k)) {
        seen.add(item._k)
        results.push({
          item,
          score: 1.0,
          matchType: 'exact',
          components: {
            bm25Score: 0,
            fuzzyScore: 1.0,
            popularityBoost: item.popularity || 0,
            recencyBoost: 0,
            accreditationBoost: item.naacGrade ? 0.1 : 0,
            totalScore: 1.0
          }
        })
      }
    }

    // 2. Token-based prefix matching
    for (const token of expandedTokens) {
      if (token.length >= 2) {
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
    }

    // 3. Double Metaphone matching (better phonetic than Soundex)
    for (const token of tokens) {
      if (token.length >= 2) {
        const [primary, secondary] = doubleMetaphone(token)

        const primaryKeys = this.metaphoneIndex.get(primary)
        if (primaryKeys) {
          for (const key of primaryKeys) {
            if (!seen.has(key)) {
              const item = this.allItems.get(key)
              if (item) {
                seen.add(key)
                results.push({
                  item,
                  score: 0.75,
                  matchType: 'phonetic'
                })
              }
            }
          }
        }

        if (secondary && secondary !== primary) {
          const secondaryKeys = this.metaphoneIndex.get(secondary)
          if (secondaryKeys) {
            for (const key of secondaryKeys) {
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
    }

    // 4. Stem-based matching
    for (const token of correctedTokens) {
      const stemmed = stem(token)
      const stemKeys = this.stemIndex.get(stemmed)
      if (stemKeys) {
        for (const key of stemKeys) {
          if (!seen.has(key)) {
            const item = this.allItems.get(key)
            if (item) {
              seen.add(key)
              results.push({
                item,
                score: 0.65,
                matchType: 'synonym'
              })
            }
          }
        }
      }
    }

    // 5. N-gram matching for typo tolerance
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

    // 6. Multi-strategy fuzzy matching for remaining items
    if (results.length < limit && normalizedQuery.length >= 3) {
      const candidateKeys = new Set<string>()

      // Get candidates from partial matches
      for (const [key] of this.allItems) {
        if (!seen.has(key)) {
          candidateKeys.add(key)
        }
      }

      // Score candidates using multi-strategy similarity
      const fuzzyResults: Array<{ key: string; score: number }> = []
      for (const key of candidateKeys) {
        const item = this.allItems.get(key)
        if (item) {
          const similarity = multiStrategySimiliarity(
            normalizedQuery,
            item.name
          )
          if (similarity >= 0.5) {
            fuzzyResults.push({ key, score: similarity })
          }
        }
      }

      // Sort and add top fuzzy matches
      fuzzyResults.sort((a, b) => b.score - a.score)
      for (const { key, score } of fuzzyResults.slice(
        0,
        limit - results.length
      )) {
        const item = this.allItems.get(key)
        if (item && !seen.has(key)) {
          seen.add(key)
          results.push({
            item,
            score: score * 0.6,
            matchType: 'fuzzy'
          })
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

  /**
   * Get auto-complete suggestions with context
   */
  getCompletions (prefix: string, limit: number = 10): AutoSuggestion[] {
    const suggestions: AutoSuggestion[] = []
    const normalizedPrefix = prefix.toLowerCase()

    let node = this.root
    for (const ch of normalizedPrefix) {
      if (!node.c[ch]) return suggestions
      node = node.c[ch]
    }

    // DFS to find all completions
    const dfs = (n: TrieNode, path: string, depth: number): void => {
      if (suggestions.length >= limit) return
      if (depth > 50) return // Limit depth

      if (n.f > 0 && n.d.length > 0) {
        const item = n.d[0]
        suggestions.push({
          text: item.name,
          type: item.type.toLowerCase() as any,
          score: n.f / Math.max(n.t, 1), // Frequency ratio
          metadata: item,
          highlight: `<b>${prefix}</b>${path.slice(normalizedPrefix.length)}`
        })
      }

      // Sort children by frequency for better suggestions
      const sortedChildren = Object.entries(n.c).sort(
        ([, a], [, b]) => b.t - a.t
      )

      for (const [ch, child] of sortedChildren) {
        dfs(child, path + ch, depth + 1)
      }
    }

    dfs(node, normalizedPrefix, 0)
    return suggestions.sort((a, b) => b.score - a.score).slice(0, limit)
  }
}

// ============================================================================
// ADVANCED INVERTED INDEX WITH RANGE QUERIES
// ============================================================================

class AdvancedIndex {
  m: Record<IndexKey, Map<string, Set<string>>>
  private numericRanges: Map<string, Map<string, number>> // docId -> value
  private geoIndex: Map<string, { lat: number; lng: number }> // docId -> coords

  constructor () {
    this.m = {
      city: new Map(),
      state: new Map(),
      type: new Map(),
      level: new Map(),
      programme: new Map(),
      exam: new Map(),
      keyword: new Map(),
      course: new Map(),
      facility: new Map(),
      recruiter: new Map(),
      accreditation: new Map()
    }
    this.numericRanges = new Map()
    this.geoIndex = new Map()
  }

  add (k: IndexKey, v: string | null | undefined, id: string): void {
    if (!v) return
    const m = this.m[k]
    const key = v.toString().toLowerCase().trim()
    if (!m.has(key)) m.set(key, new Set())
    m.get(key)!.add(id)
  }

  addNumeric (field: string, id: string, value: number): void {
    if (!this.numericRanges.has(field)) {
      this.numericRanges.set(field, new Map())
    }
    this.numericRanges.get(field)!.set(id, value)
  }

  addGeo (id: string, lat: number, lng: number): void {
    this.geoIndex.set(id, { lat, lng })
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

    // Fuzzy match using multi-strategy similarity
    for (const [key, ids] of this.m[k]) {
      if (multiStrategySimiliarity(searchTerm, key) >= threshold) {
        for (const id of ids) results.add(id)
      }
    }

    return results
  }

  /**
   * Range query for numeric fields
   */
  rangeQuery (field: string, min?: number, max?: number): Set<string> {
    const results = new Set<string>()
    const fieldMap = this.numericRanges.get(field)

    if (!fieldMap) return results

    for (const [id, value] of fieldMap) {
      if (
        (min === undefined || value >= min) &&
        (max === undefined || value <= max)
      ) {
        results.add(id)
      }
    }

    return results
  }

  /**
   * Geospatial query - find documents within radius
   */
  geoQuery (lat: number, lng: number, radiusKm: number): Set<string> {
    const results = new Set<string>()

    for (const [id, coords] of this.geoIndex) {
      const distance = haversineDistance(lat, lng, coords.lat, coords.lng)
      if (distance <= radiusKm) {
        results.add(id)
      }
    }

    return results
  }

  /**
   * Get distance from a point
   */
  getDistance (id: string, lat: number, lng: number): number | null {
    const coords = this.geoIndex.get(id)
    if (!coords) return null
    return haversineDistance(lat, lng, coords.lat, coords.lng)
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

  /**
   * Get facet counts for a field
   */
  getFacets (
    k: IndexKey,
    filterIds: Set<string>,
    topN: number = 20
  ): FacetResult {
    const counts: Map<string, number> = new Map()

    for (const [value, ids] of this.m[k]) {
      let count = 0
      for (const id of ids) {
        if (filterIds.has(id)) count++
      }
      if (count > 0) counts.set(value, count)
    }

    // Sort by count and take top N
    const sortedBuckets = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([value, count]) => ({
        value,
        count,
        selected: false
      }))

    return { field: k, buckets: sortedBuckets }
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
// SEMANTIC SIMILARITY (Co-occurrence based)
// ============================================================================

class SemanticIndex {
  private cooccurrence: Map<string, Map<string, number>>
  private termCounts: Map<string, number>
  private totalDocs: number

  constructor () {
    this.cooccurrence = new Map()
    this.termCounts = new Map()
    this.totalDocs = 0
  }

  /**
   * Add a document to build co-occurrence matrix
   */
  addDocument (text: string): void {
    const tokens = tokenize(text)
    const uniqueTokens = [...new Set(tokens.map(t => stem(t)))]

    for (const token of uniqueTokens) {
      this.termCounts.set(token, (this.termCounts.get(token) || 0) + 1)
    }

    // Build co-occurrence (within window of 5)
    for (let i = 0; i < uniqueTokens.length; i++) {
      const term1 = uniqueTokens[i]
      if (!this.cooccurrence.has(term1)) {
        this.cooccurrence.set(term1, new Map())
      }

      for (
        let j = Math.max(0, i - 5);
        j < Math.min(uniqueTokens.length, i + 5);
        j++
      ) {
        if (i !== j) {
          const term2 = uniqueTokens[j]
          const coMap = this.cooccurrence.get(term1)!
          coMap.set(term2, (coMap.get(term2) || 0) + 1)
        }
      }
    }

    this.totalDocs++
  }

  /**
   * Get related terms using PMI (Pointwise Mutual Information)
   */
  getRelatedTerms (
    term: string,
    topN: number = 10
  ): Array<{ term: string; score: number }> {
    const stemmed = stem(term.toLowerCase())
    const coMap = this.cooccurrence.get(stemmed)

    if (!coMap) return []

    const results: Array<{ term: string; score: number }> = []
    const termCount = this.termCounts.get(stemmed) || 1

    for (const [relatedTerm, coCount] of coMap) {
      const relatedCount = this.termCounts.get(relatedTerm) || 1

      // PMI = log(P(x,y) / (P(x) * P(y)))
      const pxy = coCount / this.totalDocs
      const px = termCount / this.totalDocs
      const py = relatedCount / this.totalDocs

      const pmi = Math.log(pxy / (px * py))
      if (pmi > 0) {
        results.push({ term: relatedTerm, score: pmi })
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, topN)
  }

  /**
   * Expand query with semantically related terms
   */
  expandQuery (query: string): string[] {
    const tokens = tokenize(query)
    const expanded: Set<string> = new Set(tokens)

    for (const token of tokens) {
      const related = this.getRelatedTerms(token, 3)
      for (const { term, score } of related) {
        if (score > 1) {
          // Only add highly related terms
          expanded.add(term)
        }
      }
    }

    return [...expanded]
  }
}

// ============================================================================
// MAIN SEARCH ENGINE
// ============================================================================

class AdvancedEngine {
  trie: {
    i: AdvancedTrie
    p: AdvancedTrie
    c: AdvancedTrie
  }
  idx: AdvancedIndex
  bm25: {
    i: BM25Index
    p: BM25Index
    c: BM25Index
  }
  semantic: SemanticIndex
  intentAnalyzer: QueryIntentAnalyzer
  docs: Map<string, DocumentData>
  progs: ProgramFull[]
  crses: CourseFull[]
  stats: {
    institutes: number
    programmes: number
    courses: number
    facilities: number
    recruiters: number
  }
  cache: {
    suggest: LRUCache<string, any>
    search: LRUCache<string, any>
  }

  constructor () {
    this.trie = {
      i: new AdvancedTrie(10000),
      p: new AdvancedTrie(50000),
      c: new AdvancedTrie(100000)
    }
    this.idx = new AdvancedIndex()
    this.bm25 = {
      i: new BM25Index(),
      p: new BM25Index(),
      c: new BM25Index()
    }
    this.semantic = new SemanticIndex()
    this.intentAnalyzer = new QueryIntentAnalyzer()
    this.docs = new Map()
    this.progs = []
    this.crses = []
    this.stats = {
      institutes: 0,
      programmes: 0,
      courses: 0,
      facilities: 0,
      recruiters: 0
    }
    this.cache = {
      suggest: new LRUCache(1000),
      search: new LRUCache(500)
    }
  }

  async build (db: any): Promise<void> {
    const t0 = Date.now()
    console.log('\n' + '═'.repeat(70))
    console.log('  BUILDING ADVANCED SEARCH INDEX')
    console.log('═'.repeat(70))

    const data: DocumentData[] = await db
      .collection(COLLECTION_NAME)
      .find({})
      .toArray()
    console.log(`  Documents: ${data.length}`)

    const facilitiesSet = new Set<string>()
    const recruitersSet = new Set<string>()

    for (const doc of data) {
      const id = doc._id.toString()
      const iSlug = doc.slug || slug(doc.name || '')
      const desc = getDesc(doc)

      doc._slug = iSlug
      doc._desc = desc
      doc._courses = 0
      doc._popularity = this.calculatePopularity(doc)
      this.docs.set(id, doc)

      if (!doc.name) continue

      // Build searchable text for BM25
      const searchText = [
        doc.name,
        doc.shortName,
        doc.type,
        doc.location?.city,
        doc.location?.state,
        doc._desc
      ]
        .filter(Boolean)
        .join(' ')

      this.bm25.i.addDocument(id, searchText)
      this.semantic.addDocument(searchText)

      const iSug: SuggestionItem = {
        _k: `i-${id}`,
        type: 'Institute',
        id,
        slug: iSlug,
        name: doc.name,
        logo: doc.logo,
        city: doc.location?.city,
        state: doc.location?.state,
        popularity: doc._popularity,
        naacGrade: doc.accreditation?.naac?.grade,
        establishedYear: doc.establishedYear,
        totalCourses: doc._courses,
        coordinates: doc.location?.coordinates
          ? {
              lat: doc.location.coordinates.latitude || 0,
              lng: doc.location.coordinates.longitude || 0
            }
          : undefined
      }

      this.trie.i.add(doc.name, iSug)
      if (doc.shortName) this.trie.i.add(doc.shortName, iSug)

      // Index basic fields
      if (doc.location?.city) this.idx.add('city', doc.location.city, id)
      if (doc.location?.state) this.idx.add('state', doc.location.state, id)
      if (doc.type) this.idx.add('type', doc.type, id)

      // Index NAAC grade
      if (doc.accreditation?.naac?.grade) {
        this.idx.add('accreditation', doc.accreditation.naac.grade, id)
      }

      // Index facilities
      if (doc.campusDetails?.facilities_arr) {
        for (const facility of doc.campusDetails.facilities_arr) {
          this.idx.add('facility', facility, id)
          facilitiesSet.add(facility)
        }
      }

      // Index top recruiters
      if (doc.placements?.topRecruiters) {
        for (const recruiter of doc.placements.topRecruiters) {
          this.idx.add('recruiter', recruiter, id)
          recruitersSet.add(recruiter)
        }
      }

      // Numeric indexes
      if (doc.establishedYear) {
        this.idx.addNumeric('establishedYear', id, doc.establishedYear)
      }
      if (doc.placements?.averagePackage) {
        this.idx.addNumeric('avgPackage', id, doc.placements.averagePackage)
      }

      // Geospatial index
      if (
        doc.location?.coordinates?.latitude &&
        doc.location?.coordinates?.longitude
      ) {
        this.idx.addGeo(
          id,
          doc.location.coordinates.latitude,
          doc.location.coordinates.longitude
        )
      }

      // Keywords
      for (const { keyword } of extractKW(doc.name + ' ' + (doc.type || ''))) {
        this.idx.add('keyword', keyword, id)
      }

      this.stats.institutes++

      if (!doc.programmes) continue

      for (const prog of doc.programmes) {
        if (!prog.name) continue
        const pSlug = slug(prog.name)
        const pCnt = prog.course?.length || prog.courseCount || 0

        const pKey = `p-${id}-${pSlug}`
        const pSearchText = [
          prog.name,
          doc.name,
          doc.location?.city,
          prog.eligibilityExams?.join(' ')
        ]
          .filter(Boolean)
          .join(' ')

        this.bm25.p.addDocument(pKey, pSearchText)

        const pSug: SuggestionItem = {
          _k: pKey,
          type: 'Program',
          id,
          slug: iSlug,
          pSlug,
          name: prog.name,
          institute: doc.name,
          logo: doc.logo,
          city: doc.location?.city,
          state: doc.location?.state
        }
        this.trie.p.add(prog.name, pSug)

        const pFull: ProgramFull = {
          ...pSug,
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
        for (const { keyword } of extractKW(prog.name)) {
          this.idx.add('keyword', keyword, id)
        }
        for (const ex of prog.eligibilityExams || []) {
          this.idx.add('exam', ex, id)
        }

        this.stats.programmes++

        if (!prog.course) continue

        for (const c of prog.course) {
          if (!c.degree) continue
          const cSlug = slug(c.degree)
          const lvl = (c.level || c.courseLevel || '').toUpperCase()
          const cKey = `c-${id}-${cSlug}`

          const cSearchText = [
            c.degree,
            prog.name,
            doc.name,
            doc.location?.city,
            lvl
          ]
            .filter(Boolean)
            .join(' ')

          this.bm25.c.addDocument(cKey, cSearchText)

          const cSug: SuggestionItem = {
            _k: cKey,
            type: 'Course',
            id,
            slug: iSlug,
            pSlug,
            cSlug,
            name: c.degree,
            programme: prog.name,
            institute: doc.name,
            logo: doc.logo,
            city: doc.location?.city,
            state: doc.location?.state,
            avgPackage: c.placements?.averagePackage
          }
          this.trie.c.add(c.degree, cSug)

          const cFull: CourseFull = {
            ...cSug,
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

          // Index fee ranges
          if (c.fees?.totalFee) {
            this.idx.addNumeric('fee', id, c.fees.totalFee)
          }

          for (const { keyword } of extractKW(c.degree + ' ' + prog.name)) {
            this.idx.add('keyword', keyword, id)
          }

          doc._courses = (doc._courses || 0) + 1
          this.stats.courses++
        }
      }
    }

    // Calculate BM25 IDF after all documents are added
    this.bm25.i.calculateIDF()
    this.bm25.p.calculateIDF()
    this.bm25.c.calculateIDF()

    this.stats.facilities = facilitiesSet.size
    this.stats.recruiters = recruitersSet.size

    console.log('─'.repeat(70))
    console.log(`  Institutes: ${this.stats.institutes}`)
    console.log(`  Programmes: ${this.stats.programmes}`)
    console.log(`  Courses: ${this.stats.courses}`)
    console.log(`  Facilities indexed: ${this.stats.facilities}`)
    console.log(`  Recruiters indexed: ${this.stats.recruiters}`)
    console.log(`  Keywords: ${this.idx.m.keyword.size}`)
    console.log(`  Build time: ${Date.now() - t0}ms`)
    console.log('═'.repeat(70) + '\n')
  }

  /**
   * Calculate popularity score for an institute
   */
  private calculatePopularity (doc: DocumentData): number {
    let score = 0

    // NAAC grade boost
    const naacBoost: Record<string, number> = {
      'A++': 1.0,
      'A+': 0.9,
      A: 0.8,
      'B++': 0.6,
      'B+': 0.5,
      B: 0.4,
      C: 0.2
    }
    if (doc.accreditation?.naac?.grade) {
      score += naacBoost[doc.accreditation.naac.grade] || 0.3
    }

    // Course count (normalized)
    const courseCount =
      doc.programmes?.reduce((sum, p) => sum + (p.course?.length || 0), 0) || 0
    score += Math.min(courseCount / 100, 0.5)

    // Establishment year (older = more established)
    if (doc.establishedYear) {
      const age = 2025 - doc.establishedYear
      score += Math.min(age / 100, 0.3)
    }

    // Facilities count
    const facilityCount = doc.campusDetails?.facilities_arr?.length || 0
    score += Math.min(facilityCount / 20, 0.2)

    // Has placements data
    if (doc.placements?.topRecruiters?.length) {
      score += 0.2
    }

    return Math.min(score, 1)
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
        suggestions: [],
        performance: p.done(0, 0)
      }
    }

    const query = q.trim()
    const cacheKey = `suggest:${query}:${limit}`

    // Check cache
    const cached = this.cache.suggest.get(cacheKey)
    if (cached) {
      p.setCacheHit(true)
      return {
        ...cached,
        performance: p.done(this.docs.size, cached.total || 0)
      }
    }

    // Analyze query intent
    const intent = this.intentAnalyzer.analyze(query)

    // Tokenize and process query
    const tokens = tokenize(query)
    const correctedTokens = correctTypos(tokens)
    const expandedTokens = expandAbbreviations(correctedTokens)

    // Was there a typo correction?
    const hasCorrection =
      correctedTokens.join(' ') !== tokens.join(' ')
        ? {
            original: tokens.join(' '),
            corrected: correctedTokens.join(' ')
          }
        : undefined

    // Get matches using enhanced trie search
    const instMatches = this.trie.i.findWithScores(query, limit * 3)
    const progMatches = this.trie.p.findWithScores(query, limit * 3)
    const courseMatches = this.trie.c.findWithScores(query, limit * 3)

    // Apply BM25 scoring for re-ranking
    p.setStrategy('trie+bm25')

    const rerankedInsts = instMatches.map(m => {
      const bm25Score = this.bm25.i.score(m.item.id, query)
      const popularityBoost = (m.item.popularity || 0) * 0.2
      const accreditationBoost = m.item.naacGrade ? 0.1 : 0
      return {
        ...m,
        score:
          m.score * 0.6 +
          bm25Score * 0.3 +
          popularityBoost +
          accreditationBoost,
        components: {
          bm25Score,
          fuzzyScore: m.score,
          popularityBoost,
          recencyBoost: 0,
          accreditationBoost,
          totalScore:
            m.score * 0.6 +
            bm25Score * 0.3 +
            popularityBoost +
            accreditationBoost
        }
      }
    })

    // Sort by combined score
    rerankedInsts.sort((a, b) => b.score - a.score)

    let insts = rerankedInsts.slice(0, limit).map(m => m.item)
    let progs = progMatches.slice(0, limit).map(m => m.item)
    let crses = courseMatches.slice(0, limit).map(m => m.item)

    // Extract keywords
    const kws = extractKW(expandedTokens.join(' ')).map(k => k.keyword)

    // If trie didn't find much, fall back to keyword + fuzzy search
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
                  state: d.location?.state,
                  popularity: d._popularity,
                  naacGrade: d.accreditation?.naac?.grade
                }
              : null
          })
          .filter((x): x is SuggestionItem => x !== null)

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

    // Generate auto-complete suggestions
    const autoSuggestions = this.trie.i.getCompletions(query, 5)

    const total = insts.length + progs.length + crses.length
    console.log(
      `[SUGGEST] "${q}" → ${insts.length}I/${progs.length}P/${crses.length}C (intent: ${intent.type})`
    )

    const result = {
      query: q,
      normalizedQuery: normalizeQuery(q),
      intent,
      keywords: kws,
      corrections: hasCorrection,
      institutes: insts.map(i => ({
        type: 'Institute',
        id: i.id,
        slug: i.slug,
        name: i.name,
        logo: i.logo,
        location: [i.city, i.state].filter(Boolean).join(', '),
        naacGrade: i.naacGrade,
        popularity: i.popularity
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
      suggestions: autoSuggestions,
      total,
      performance: p.done(this.docs.size, total)
    }

    // Cache the result
    this.cache.suggest.set(cacheKey, result)

    return result
  }

  /**
   * Advanced search with facets, filters, and ranking
   */
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
      minFee,
      maxFee,
      minEstablished,
      maxEstablished,
      accreditation,
      facilities,
      nearLat,
      nearLng,
      radiusKm = 50,
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = filters

    const p = new Perf()
    const skip = (page - 1) * limit

    // Check cache for exact same query
    const cacheKey = JSON.stringify(filters)
    const cached = this.cache.search.get(cacheKey)
    if (cached) {
      p.setCacheHit(true)
      return {
        ...cached,
        performance: p.done(this.docs.size, cached.totals?.institutes || 0)
      }
    }

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
      return this.idx.or(...values.map(v => this.idx.fuzzyGet(key, v, 0.8)))
    }

    // Analyze query intent
    const intent = q ? this.intentAnalyzer.analyze(q) : null
    p.setStrategy(intent ? `intent:${intent.type}` : 'filters')

    // Process query with NLP enhancements
    const tokens = q ? tokenize(q) : []
    const correctedTokens = correctTypos(tokens)
    const expandedTokens = expandAbbreviations(correctedTokens)
    const kws = extractKW(expandedTokens.join(' ')).map(k => k.keyword)

    // Query-based filtering
    if (kws.length) {
      let kwIds: Set<string> = new Set()
      for (const kw of kws) {
        kwIds = this.idx.or(kwIds, this.idx.get('keyword', kw))
      }
      if (kwIds.size) ids = this.idx.and(ids, kwIds)
    } else if (q?.trim()) {
      // Use BM25 for ranking
      const bm25Results = this.bm25.i.search(q, 500)
      const bm25Ids = new Set(bm25Results.map(r => r.docId))
      if (bm25Ids.size) ids = this.idx.and(ids, bm25Ids)
    }

    // Apply standard filters
    if (city) ids = this.idx.and(ids, orValues('city', city))
    if (state) ids = this.idx.and(ids, orValues('state', state))
    if (level) ids = this.idx.and(ids, this.idx.fuzzyGet('level', level))
    if (programme)
      ids = this.idx.and(ids, this.idx.fuzzyGet('programme', programme))
    if (exam) ids = this.idx.and(ids, this.idx.fuzzyGet('exam', exam))
    if (course) ids = this.idx.and(ids, this.idx.fuzzyGet('course', course))
    if (accreditation)
      ids = this.idx.and(ids, this.idx.get('accreditation', accreditation))

    // Facility filters
    if (facilities?.length) {
      for (const facility of facilities) {
        ids = this.idx.and(ids, this.idx.fuzzyGet('facility', facility))
      }
    }

    // Numeric range filters
    if (minEstablished || maxEstablished) {
      const rangeIds = this.idx.rangeQuery(
        'establishedYear',
        minEstablished,
        maxEstablished
      )
      ids = this.idx.and(ids, rangeIds)
    }

    if (minFee || maxFee) {
      const feeIds = this.idx.rangeQuery('fee', minFee, maxFee)
      ids = this.idx.and(ids, feeIds)
    }

    // Geospatial filter
    if (nearLat !== undefined && nearLng !== undefined) {
      const geoIds = this.idx.geoQuery(nearLat, nearLng, radiusKm)
      ids = this.idx.and(ids, geoIds)
    }

    let institutes: any[] = []
    let programmes: any[] = []
    let courses: any[] = []

    if (!type || type === 'institute') {
      institutes = [...ids]
        .map(id => {
          const d = this.docs.get(id)
          if (!d) return null

          // Calculate BM25 score for this document
          const bm25Score = q ? this.bm25.i.score(id, q) : 0

          // Calculate distance if geospatial search
          let distance: number | undefined
          if (nearLat !== undefined && nearLng !== undefined) {
            distance = this.idx.getDistance(id, nearLat, nearLng) || undefined
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
            website: d.contact?.website,
            description: d._desc
              ? d._desc.substring(0, 350) + (d._desc.length > 350 ? '...' : '')
              : null,
            topRecruiters: d.placements?.topRecruiters?.slice(0, 6),
            avgPackage: d.placements?.averagePackage,
            avgPackageF: fee(d.placements?.averagePackage),
            popularity: d._popularity,
            bm25Score,
            distance,
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

      // Sort institutes
      institutes.sort((a, b) => {
        let compareValue = 0
        switch (sortBy) {
          case 'relevance':
            compareValue = (b.bm25Score || 0) - (a.bm25Score || 0)
            if (compareValue === 0) {
              compareValue = (b.popularity || 0) - (a.popularity || 0)
            }
            break
          case 'popularity':
            compareValue = (b.popularity || 0) - (a.popularity || 0)
            break
          case 'name':
            compareValue = (a.name || '').localeCompare(b.name || '')
            break
          case 'established':
            compareValue = (a.establishedYear || 0) - (b.establishedYear || 0)
            break
          case 'ranking':
            // Sort by NAAC grade
            const gradeOrder: Record<string, number> = {
              'A++': 1,
              'A+': 2,
              A: 3,
              'B++': 4,
              'B+': 5,
              B: 6,
              C: 7
            }
            const gradeA = gradeOrder[a.naacGrade || ''] || 999
            const gradeB = gradeOrder[b.naacGrade || ''] || 999
            compareValue = gradeA - gradeB
            break
          case 'distance':
            compareValue = (a.distance || Infinity) - (b.distance || Infinity)
            break
          default:
            compareValue = 0
        }
        return sortOrder === 'desc' ? -compareValue : compareValue
      })
    }

    if (!type || type === 'programme') {
      programmes = this.progs.filter(x => ids.has(x.id))
    }

    if (!type || type === 'course') {
      courses = this.crses.filter(x => ids.has(x.id))
    }

    // Generate facets
    const facets = {
      cities: this.idx.getFacets('city', ids, 20),
      states: this.idx.getFacets('state', ids, 10),
      levels: this.idx.getFacets('level', ids, 10),
      programmes: this.idx.getFacets('programme', ids, 20),
      exams: this.idx.getFacets('exam', ids, 15),
      accreditations: this.idx.getFacets('accreditation', ids, 10),
      facilities: this.idx.getFacets('facility', ids, 20),
      recruiters: this.idx.getFacets('recruiter', ids, 20)
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

    const result = {
      query: q,
      intent,
      keywords: kws,
      corrections:
        correctedTokens.join(' ') !== tokens.join(' ')
          ? { original: tokens.join(' '), corrected: correctedTokens.join(' ') }
          : undefined,
      activeFilters: {
        city,
        state,
        level,
        programme,
        exam,
        course,
        minFee,
        maxFee,
        minEstablished,
        maxEstablished,
        accreditation,
        facilities,
        nearLat,
        nearLng,
        radiusKm
      },
      facets,
      sort: { sortBy, sortOrder },
      totals,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totals.institutes / limit),
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

    // Cache result
    this.cache.search.set(cacheKey, result)

    return result
  }

  /**
   * Get single institute by slug
   */
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

    // Get similar institutes
    const similarInstitutes = this.findSimilarInstitutes(doc, 5)

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
      academics: doc.academics,
      academicOverview: {
        totalCourses: doc._courses,
        totalFacilities: doc.campusDetails?.facilities_arr?.length || 0,
        facilities: doc.campusDetails?.facilities_arr,
        campusType: doc.campusDetails?.campusType
      },
      placements: {
        topRecruiters: doc.placements?.topRecruiters,
        averagePackage: doc.placements?.averagePackage,
        averagePackageF: fee(doc.placements?.averagePackage),
        highestPackage: doc.placements?.highestPackage,
        highestPackageF: fee(doc.placements?.highestPackage)
      },
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
          highestPackage: c.placements?.highestPackage,
          highestPackageF: fee(c.placements?.highestPackage),
          url: `/recommendation-collections/${instituteSlug}?programme=${slug(
            pr.name || ''
          )}&course=${slug(c.degree || '')}`
        }))
      })),
      similarInstitutes,
      raw: {
        campusDetails: doc.campusDetails,
        admissions: doc.admissions,
        researchAndInnovation: doc.researchAndInnovation,
        alumniNetwork: doc.alumniNetwork,
        faculty_student_ratio: doc.faculty_student_ratio,
        mediaGallery: (doc as any).mediaGallery
      },
      performance: p.done(this.docs.size, 1)
    }
  }

  /**
   * Find similar institutes based on type, location, and programs
   */
  private findSimilarInstitutes (doc: DocumentData, limit: number): any[] {
    const scores: Map<string, number> = new Map()
    const docId = doc._id.toString()

    // Find institutes with similar type
    if (doc.type) {
      const typeIds = this.idx.get('type', doc.type)
      for (const id of typeIds) {
        if (id !== docId) {
          scores.set(id, (scores.get(id) || 0) + 0.3)
        }
      }
    }

    // Find institutes in same city
    if (doc.location?.city) {
      const cityIds = this.idx.get('city', doc.location.city)
      for (const id of cityIds) {
        if (id !== docId) {
          scores.set(id, (scores.get(id) || 0) + 0.2)
        }
      }
    }

    // Find institutes in same state
    if (doc.location?.state) {
      const stateIds = this.idx.get('state', doc.location.state)
      for (const id of stateIds) {
        if (id !== docId) {
          scores.set(id, (scores.get(id) || 0) + 0.1)
        }
      }
    }

    // Find institutes with similar programs
    if (doc.programmes) {
      for (const prog of doc.programmes) {
        if (prog.name) {
          const progIds = this.idx.get('programme', prog.name)
          for (const id of progIds) {
            if (id !== docId) {
              scores.set(id, (scores.get(id) || 0) + 0.15)
            }
          }
        }
      }
    }

    // Sort by score and get top similar
    const sorted = [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)

    return sorted
      .map(([id]) => {
        const d = this.docs.get(id)
        if (!d) return null
        return {
          id,
          slug: d._slug,
          name: d.name,
          logo: d.logo,
          type: d.type,
          city: d.location?.city,
          state: d.location?.state,
          naacGrade: d.accreditation?.naac?.grade,
          totalCourses: d._courses
        }
      })
      .filter(Boolean)
  }

  /**
   * Explore with advanced filtering
   */
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
      minFee,
      maxFee,
      facilities,
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
      return this.idx.or(...values.map(v => this.idx.fuzzyGet(key, v)))
    }

    // Apply filters
    if (city) ids = this.idx.and(ids, orValues('city', city))
    if (state) ids = this.idx.and(ids, orValues('state', state))
    if (type) ids = this.idx.and(ids, this.idx.fuzzyGet('type', type))
    if (level) ids = this.idx.and(ids, this.idx.fuzzyGet('level', level))
    if (programme)
      ids = this.idx.and(ids, this.idx.fuzzyGet('programme', programme))
    if (exam) ids = this.idx.and(ids, this.idx.fuzzyGet('exam', exam))
    if (course) ids = this.idx.and(ids, this.idx.fuzzyGet('course', course))

    // Facility filters
    if (facilities?.length) {
      for (const facility of facilities) {
        ids = this.idx.and(ids, this.idx.fuzzyGet('facility', facility))
      }
    }

    // Numeric range filters
    if (minFee || maxFee) {
      const feeIds = this.idx.rangeQuery('fee', minFee, maxFee)
      ids = this.idx.and(ids, feeIds)
    }

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
          popularity: d._popularity,
          topRecruiters: d.placements?.topRecruiters?.slice(0, 6),
          avgPackage: d.placements?.averagePackage,
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

    // Sort
    institutes.sort((a, b) => {
      let compareValue = 0

      switch (sortBy) {
        case 'courses':
          compareValue = (a.totalCourses || 0) - (b.totalCourses || 0)
          break
        case 'established':
          compareValue = (a.establishedYear || 0) - (b.establishedYear || 0)
          break
        case 'ranking':
          const gradeOrder: Record<string, number> = {
            'A++': 1,
            'A+': 2,
            A: 3,
            'B++': 4,
            'B+': 5,
            B: 6,
            C: 7
          }
          const gradeA = gradeOrder[a.naacGrade || ''] || 999
          const gradeB = gradeOrder[b.naacGrade || ''] || 999
          compareValue = gradeA - gradeB
          break
        case 'popularity':
          compareValue = (a.popularity || 0) - (b.popularity || 0)
          break
        case 'name':
        default:
          compareValue = (a.name || '').localeCompare(b.name || '')
          break
      }

      return sortOrder === 'desc' ? -compareValue : compareValue
    })

    const total = institutes.length

    // Generate facets
    const facets = {
      cities: this.idx.getFacets('city', ids, 20),
      states: this.idx.getFacets('state', ids, 10),
      types: this.idx.getFacets('type', ids, 10),
      levels: this.idx.getFacets('level', ids, 10),
      programmes: this.idx.getFacets('programme', ids, 20),
      exams: this.idx.getFacets('exam', ids, 15),
      accreditations: this.idx.getFacets('accreditation', ids, 10),
      facilities: this.idx.getFacets('facility', ids, 20)
    }

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
        accreditation,
        minFee,
        maxFee,
        facilities
      },
      facets,
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

  /**
   * "Did you mean" suggestions for typos
   */
  didYouMean (query: string, limit: number = 5): string[] {
    const tokens = tokenize(query)
    const suggestions: string[] = []

    for (const token of tokens) {
      // Check if it's a known typo
      const corrected = TYPO_CORRECTIONS[token]
      if (corrected && corrected !== token) {
        suggestions.push(query.replace(token, corrected))
      }

      // Find similar terms using fuzzy matching
      const allTerms = [...this.idx.m.keyword.keys()]
      const similar = allTerms
        .map(term => ({
          term,
          score: multiStrategySimiliarity(token, term)
        }))
        .filter(({ score }) => score > 0.7 && score < 1)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)

      for (const { term } of similar) {
        const suggestion = query.replace(token, term)
        if (!suggestions.includes(suggestion)) {
          suggestions.push(suggestion)
        }
      }
    }

    return suggestions.slice(0, limit)
  }

  /**
   * Get comprehensive stats
   */
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
      },
      cache: {
        suggest: 'LRU(1000)',
        search: 'LRU(500)'
      }
    }
  }

  /**
   * Clear caches
   */
  clearCache (): void {
    this.cache.suggest.clear()
    this.cache.search.clear()
  }
}

// ============================================================================
// GLOBAL INSTANCE & INITIALIZATION
// ============================================================================

declare global {
  // eslint-disable-next-line no-var
  var advancedSearchEngine: AdvancedEngine | undefined
  // eslint-disable-next-line no-var
  var advancedSearchEngineInit: Promise<void> | undefined
}

const engine: AdvancedEngine =
  global.advancedSearchEngine || new AdvancedEngine()
global.advancedSearchEngine = engine

export const initSearchEngine = async (): Promise<void> => {
  if (!global.advancedSearchEngineInit) {
    global.advancedSearchEngineInit = (async () => {
      const { db } = await connectToDatabase()
      await engine.build(db)
    })()
  }
  return global.advancedSearchEngineInit
}

export default engine
