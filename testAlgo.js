// const express = require("express");
// const { MongoClient } = require("mongodb");

// const app = express();
// app.use(express.json());

// // ============================================
// // CONFIG
// // ============================================
// const MONGO_URI =
//   "mongodb+srv://jon:vatsal00@cluster0.esqiu8v.mongodb.net/quotemanager?retryWrites=true&w=majority";
// const DB_NAME = "careerboxNext";
// const COLLECTION_NAME = "admininstitutes";

// // ============================================
// // PERFORMANCE TRACKER
// // ============================================
// class PerformanceTracker {
//   constructor() {
//     this.start = process.hrtime.bigint();
//     this.checkpoints = [];
//   }

//   checkpoint(label) {
//     const now = process.hrtime.bigint();
//     const elapsed = Number(now - this.start) / 1e6;
//     this.checkpoints.push({ label, timeMs: elapsed });
//     return elapsed;
//   }

//   getMetrics(totalDocuments, resultsFound) {
//     const end = process.hrtime.bigint();
//     const totalNs = Number(end - this.start);
//     const totalMs = totalNs / 1e6;
//     const totalSec = totalNs / 1e9;

//     return {
//       performance: {
//         totalTimeNs: totalNs,
//         totalTimeMs: parseFloat(totalMs.toFixed(4)),
//         totalTimeSec: parseFloat(totalSec.toFixed(6)),
//         documentsSearched: totalDocuments,
//         resultsFound: resultsFound,
//         throughput: `${Math.round(totalDocuments / (totalSec || 0.0001)).toLocaleString()} docs/sec`,
//         complexity: "O(1) hash lookup + O(k) trie traversal",
//         message: `Searched ${totalDocuments.toLocaleString()} documents in ${totalMs.toFixed(4)}ms`,
//       },
//       checkpoints: this.checkpoints,
//     };
//   }
// }

// // ============================================
// // SLUG GENERATOR
// // ============================================
// function generateSlug(text) {
//   if (!text) return "";
//   return text
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9\s-]/g, "")
//     .replace(/\s+/g, "-")
//     .replace(/-+/g, "-")
//     .replace(/^-|-$/g, "");
// }

// // ============================================
// // TRIE - O(k) PREFIX SEARCH
// // ============================================
// class TrieNode {
//   constructor() {
//     this.children = {};
//     this.items = [];
//   }
// }

// class Trie {
//   constructor(name) {
//     this.name = name;
//     this.root = new TrieNode();
//     this.totalInserted = 0;
//     this.totalNodes = 1;
//   }

//   normalize(text) {
//     if (!text) return "";
//     return text.toLowerCase().trim();
//   }

//   insert(originalText, data) {
//     if (!originalText) return;
//     const text = this.normalize(originalText);
//     let node = this.root;

//     for (const char of text) {
//       if (!node.children[char]) {
//         node.children[char] = new TrieNode();
//         this.totalNodes++;
//       }
//       node = node.children[char];
//       if (node.items.length < 100) {
//         const exists = node.items.some(
//           (item) => item.id === data.id && item.name === data.name,
//         );
//         if (!exists) node.items.push(data);
//       }
//     }
//     this.totalInserted++;
//   }

//   search(query, limit = 10) {
//     const normalized = this.normalize(query);
//     if (!normalized) return [];

//     let node = this.root;
//     for (const char of normalized) {
//       if (!node.children[char]) return [];
//       node = node.children[char];
//     }
//     return node.items.slice(0, limit);
//   }

//   getStats() {
//     return { totalInserted: this.totalInserted, totalNodes: this.totalNodes };
//   }
// }

// // ============================================
// // HASH INDEX - O(1) LOOKUP
// // ============================================
// class HashIndex {
//   constructor() {
//     this.byCity = new Map();
//     this.byState = new Map();
//     this.byExam = new Map();
//     this.byType = new Map();
//     this.byLevel = new Map();
//     this.byProgramme = new Map();
//     this.byKeyword = new Map();
//     this.totalEntries = 0;
//   }

//   add(map, key, docId) {
//     if (!key) return;
//     const normalized = key.toString().toLowerCase().trim();
//     if (!map.has(normalized)) map.set(normalized, new Set());
//     map.get(normalized).add(docId);
//     this.totalEntries++;
//   }

//   get(map, key) {
//     if (!key) return new Set();
//     return map.get(key.toString().toLowerCase().trim()) || new Set();
//   }

//   intersect(setA, setB) {
//     if (!setB || setB.size === 0) return setA;
//     if (!setA || setA.size === 0) return new Set();
//     const [smaller, larger] =
//       setA.size <= setB.size ? [setA, setB] : [setB, setA];
//     return new Set([...smaller].filter((x) => larger.has(x)));
//   }

//   union(...sets) {
//     const result = new Set();
//     for (const set of sets) {
//       if (set) for (const item of set) result.add(item);
//     }
//     return result;
//   }

//   getStats() {
//     return {
//       cities: this.byCity.size,
//       states: this.byState.size,
//       exams: this.byExam.size,
//       types: this.byType.size,
//       levels: this.byLevel.size,
//       programmes: this.byProgramme.size,
//       keywords: this.byKeyword.size,
//     };
//   }
// }

// // ============================================
// // KEYWORD MAPPINGS
// // ============================================
// const KEYWORD_MAPPINGS = {
//   engineering: [
//     "b.tech",
//     "b.e.",
//     "m.tech",
//     "engineering",
//     "computer",
//     "mechanical",
//     "electrical",
//     "civil",
//     "electronics",
//   ],
//   medical: [
//     "mbbs",
//     "md",
//     "ms",
//     "bds",
//     "nursing",
//     "pharmacy",
//     "medical",
//     "health",
//     "bams",
//     "bhms",
//   ],
//   management: ["mba", "bba", "pgdm", "management", "business"],
//   science: ["b.sc", "m.sc", "science", "physics", "chemistry", "biology"],
//   commerce: ["b.com", "m.com", "commerce", "accounting", "finance"],
//   arts: ["b.a.", "m.a.", "arts", "humanities", "literature"],
//   law: ["llb", "llm", "law", "legal"],
//   design: ["b.des", "m.des", "design", "fashion"],
//   pharmacy: ["b.pharm", "m.pharm", "pharmacy"],
//   computer: ["computer science", "bca", "mca", "it", "software"],
//   biotechnology: ["biotechnology", "biotech"],
//   top: ["top", "best", "premier", "leading", "ranked"],
//   best: ["top", "best", "premier", "leading", "ranked"],
//   college: ["college", "institute", "university"],
//   university: ["university", "deemed", "central"],
//   institute: ["institute", "iit", "nit", "iiit"],
//   government: ["government", "public", "state"],
//   private: ["private", "deemed"],
// };

// // ============================================
// // HAVERSINE DISTANCE - O(1)
// // ============================================
// function haversineDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371;
//   const toRad = (deg) => (deg * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
//   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// }

// // ============================================
// // SEARCH ENGINE
// // ============================================
// class SearchEngine {
//   constructor() {
//     this.instituteTrie = new Trie("INSTITUTE");
//     this.programmeTrie = new Trie("PROGRAMME");
//     this.courseTrie = new Trie("COURSE");
//     this.hashIndex = new HashIndex();
//     this.documents = new Map();
//     this.allCourses = [];
//     this.allProgrammes = [];
//     this.coursesByLevel = new Map();
//     this.programmesByName = new Map();
//     this.stats = { institutes: 0, programmes: 0, courses: 0 };
//     this.buildTime = 0;
//   }

//   extractKeywords(text) {
//     if (!text) return [];
//     const words = text.toLowerCase().split(/\s+/);
//     const keywords = new Set();

//     for (const word of words) {
//       if (KEYWORD_MAPPINGS[word]) keywords.add(word);
//       for (const [key, values] of Object.entries(KEYWORD_MAPPINGS)) {
//         if (values.some((v) => word.includes(v) || v.includes(word))) {
//           keywords.add(key);
//         }
//       }
//     }
//     return [...keywords];
//   }

//   async buildIndexes(db) {
//     const buildStart = process.hrtime.bigint();

//     console.log("\n" + "═".repeat(60));
//     console.log("║ INDEX BUILD STARTING");
//     console.log("═".repeat(60));

//     const institutes = await db.collection(COLLECTION_NAME).find({}).toArray();
//     console.log(
//       `║ Fetched ${institutes.length} documents from ${COLLECTION_NAME}`,
//     );

//     if (institutes.length === 0) {
//       console.log("║ [WARN] No documents found!");
//       return;
//     }

//     for (const inst of institutes) {
//       const docId = inst._id.toString();
//       this.documents.set(docId, inst);
//       const instituteSlug = inst.slug || generateSlug(inst.name);

//       // INDEX INSTITUTE
//       if (inst.name) {
//         const data = {
//           type: "institute",
//           id: docId,
//           name: inst.name,
//           shortName: inst.shortName,
//           slug: instituteSlug,
//           logo: inst.logo,
//           coverImage: inst.coverImage,
//           city: inst.location?.city,
//           state: inst.location?.state,
//           instituteType: inst.type,
//           establishedYear: inst.establishedYear,
//           naacGrade: inst.accreditation?.naac?.grade,
//           totalCourses: 0,
//           totalFacilities: inst.campusDetails?.facilities_arr?.length || 0,
//           contact: inst.contact?.phone?.[0],
//         };

//         this.instituteTrie.insert(inst.name, data);
//         if (inst.shortName && inst.shortName !== inst.name) {
//           this.instituteTrie.insert(inst.shortName, data);
//         }

//         if (inst.location?.city)
//           this.hashIndex.add(this.hashIndex.byCity, inst.location.city, docId);
//         if (inst.location?.state)
//           this.hashIndex.add(
//             this.hashIndex.byState,
//             inst.location.state,
//             docId,
//           );
//         if (inst.type)
//           this.hashIndex.add(this.hashIndex.byType, inst.type, docId);

//         const keywords = this.extractKeywords(inst.name);
//         if (inst.type) keywords.push(...this.extractKeywords(inst.type));
//         for (const kw of keywords) {
//           this.hashIndex.add(this.hashIndex.byKeyword, kw, docId);
//         }

//         this.stats.institutes++;
//       }

//       // INDEX PROGRAMMES & COURSES
//       let instituteCourseCount = 0;

//       if (inst.programmes && Array.isArray(inst.programmes)) {
//         for (const prog of inst.programmes) {
//           const programmeSlug = generateSlug(prog.name);

//           if (prog.name) {
//             const progData = {
//               type: "programme",
//               id: docId,
//               name: prog.name,
//               slug: programmeSlug,
//               institute: inst.name,
//               instituteSlug: instituteSlug,
//               logo: inst.logo,
//               courseCount: prog.courseCount || prog.course?.length || 0,
//               eligibilityExams: prog.eligibilityExams || [],
//               city: inst.location?.city,
//               state: inst.location?.state,
//               placementRating: prog.placementRating,
//               url: `/recommendation-collections/${instituteSlug}?programme=${programmeSlug}`,
//             };

//             this.programmeTrie.insert(prog.name, progData);
//             this.allProgrammes.push(progData);
//             this.hashIndex.add(this.hashIndex.byProgramme, prog.name, docId);

//             const progNameLower = prog.name.toLowerCase();
//             if (!this.programmesByName.has(progNameLower)) {
//               this.programmesByName.set(progNameLower, []);
//             }
//             this.programmesByName.get(progNameLower).push(progData);

//             const progKeywords = this.extractKeywords(prog.name);
//             for (const kw of progKeywords) {
//               this.hashIndex.add(this.hashIndex.byKeyword, kw, docId);
//             }

//             this.stats.programmes++;
//           }

//           if (prog.eligibilityExams) {
//             for (const exam of prog.eligibilityExams) {
//               this.hashIndex.add(this.hashIndex.byExam, exam, docId);
//             }
//           }

//           if (prog.course && Array.isArray(prog.course)) {
//             for (const course of prog.course) {
//               if (course.degree) {
//                 const courseSlug = generateSlug(course.degree);
//                 const level = (
//                   course.level ||
//                   course.courseLevel ||
//                   ""
//                 ).toUpperCase();

//                 const courseData = {
//                   type: "course",
//                   id: docId,
//                   courseId: course._id?.toString(),
//                   name: course.degree,
//                   slug: courseSlug,
//                   programme: prog.name,
//                   programmeSlug: programmeSlug,
//                   institute: inst.name,
//                   instituteSlug: instituteSlug,
//                   logo: inst.logo,
//                   duration: course.duration,
//                   fee: course.fees?.totalFee,
//                   level: level,
//                   educationType: course.educationType,
//                   totalSeats: course.totalSeats,
//                   city: inst.location?.city,
//                   state: inst.location?.state,
//                   eligibilityExams:
//                     course.eligibilityExams || prog.eligibilityExams || [],
//                   averagePackage: course.placements?.averagePackage,
//                   url: `/recommendation-collections/${instituteSlug}?programme=${programmeSlug}&course=${courseSlug}`,
//                 };

//                 this.courseTrie.insert(course.degree, courseData);
//                 this.allCourses.push(courseData);

//                 if (level) {
//                   this.hashIndex.add(this.hashIndex.byLevel, level, docId);
//                   if (!this.coursesByLevel.has(level)) {
//                     this.coursesByLevel.set(level, []);
//                   }
//                   this.coursesByLevel.get(level).push(courseData);
//                 }

//                 const courseKeywords = this.extractKeywords(course.degree);
//                 for (const kw of courseKeywords) {
//                   this.hashIndex.add(this.hashIndex.byKeyword, kw, docId);
//                 }

//                 instituteCourseCount++;
//                 this.stats.courses++;
//               }
//             }
//           }
//         }
//       }

//       const instData = this.documents.get(docId);
//       if (instData) instData._totalCourses = instituteCourseCount;
//     }

//     const buildEnd = process.hrtime.bigint();
//     this.buildTime = Number(buildEnd - buildStart) / 1e6;

//     console.log("═".repeat(60));
//     console.log("║ INDEX BUILD COMPLETE");
//     console.log("═".repeat(60));
//     console.log(`║ Institutes: ${this.stats.institutes}`);
//     console.log(`║ Programmes: ${this.stats.programmes}`);
//     console.log(`║ Courses: ${this.stats.courses}`);
//     console.log(`║ Unique Programmes: ${this.programmesByName.size}`);
//     console.log(
//       `║ Course Levels: ${[...this.coursesByLevel.keys()].join(", ")}`,
//     );
//     console.log(`║ Keywords indexed: ${this.hashIndex.byKeyword.size}`);
//     console.log(`║ Build time: ${this.buildTime.toFixed(2)}ms`);
//     console.log("═".repeat(60) + "\n");
//   }

//   suggest(query, limit = 10) {
//     const perf = new PerformanceTracker();

//     if (!query || !query.trim()) {
//       return {
//         institutes: [],
//         programmes: [],
//         courses: [],
//         ...perf.getMetrics(0, 0),
//       };
//     }

//     const normalizedQuery = query.toLowerCase().trim();
//     perf.checkpoint("query_normalized");

//     // STEP 1: Trie prefix search - O(k)
//     let institutes = this.instituteTrie.search(query, limit);
//     let programmes = this.programmeTrie.search(query, limit);
//     let courses = this.courseTrie.search(query, limit);
//     perf.checkpoint("trie_search");

//     // STEP 2: Keyword-based search - O(1)
//     const queryKeywords = this.extractKeywords(normalizedQuery);
//     perf.checkpoint("keywords_extracted");

//     if (queryKeywords.length > 0) {
//       let keywordDocIds = new Set();
//       for (const kw of queryKeywords) {
//         const ids = this.hashIndex.get(this.hashIndex.byKeyword, kw);
//         keywordDocIds = this.hashIndex.union(keywordDocIds, ids);
//       }
//       perf.checkpoint("keyword_lookup");

//       if (institutes.length === 0 && keywordDocIds.size > 0) {
//         institutes = [...keywordDocIds]
//           .slice(0, limit)
//           .map((id) => {
//             const doc = this.documents.get(id);
//             if (!doc) return null;
//             return {
//               type: "institute",
//               id,
//               name: doc.name,
//               shortName: doc.shortName,
//               slug: doc.slug || generateSlug(doc.name),
//               logo: doc.logo,
//               city: doc.location?.city,
//               state: doc.location?.state,
//               instituteType: doc.type,
//               naacGrade: doc.accreditation?.naac?.grade,
//               totalCourses: doc._totalCourses || 0,
//               totalFacilities: doc.campusDetails?.facilities_arr?.length || 0,
//             };
//           })
//           .filter(Boolean);
//       }

//       if (programmes.length === 0 && keywordDocIds.size > 0) {
//         programmes = this.allProgrammes
//           .filter((p) => keywordDocIds.has(p.id))
//           .slice(0, limit);
//       }

//       if (courses.length === 0 && keywordDocIds.size > 0) {
//         courses = this.allCourses
//           .filter((c) => keywordDocIds.has(c.id))
//           .slice(0, limit);
//       }
//       perf.checkpoint("keyword_results");
//     }

//     // Deduplicate
//     const dedupe = (arr) => {
//       const seen = new Set();
//       return arr.filter((item) => {
//         if (!item) return false;
//         const key = `${item.type}-${item.id}-${item.name}`;
//         if (seen.has(key)) return false;
//         seen.add(key);
//         return true;
//       });
//     };

//     const result = {
//       institutes: dedupe(institutes),
//       programmes: dedupe(programmes),
//       courses: dedupe(courses),
//     };
//     perf.checkpoint("deduplication");

//     const totalResults =
//       result.institutes.length +
//       result.programmes.length +
//       result.courses.length;
//     const metrics = perf.getMetrics(this.documents.size, totalResults);

//     console.log(
//       `[SUGGEST] "${query}" -> ${result.institutes.length}I/${result.programmes.length}P/${result.courses.length}C in ${metrics.performance.totalTimeMs}ms`,
//     );

//     return { query, keywords: queryKeywords, ...result, ...metrics };
//   }

//   search(filters, limit = 20, skip = 0) {
//     const perf = new PerformanceTracker();
//     let resultIds = new Set(this.documents.keys());

//     if (filters.city)
//       resultIds = this.hashIndex.intersect(
//         resultIds,
//         this.hashIndex.get(this.hashIndex.byCity, filters.city),
//       );
//     if (filters.state)
//       resultIds = this.hashIndex.intersect(
//         resultIds,
//         this.hashIndex.get(this.hashIndex.byState, filters.state),
//       );
//     if (filters.exam)
//       resultIds = this.hashIndex.intersect(
//         resultIds,
//         this.hashIndex.get(this.hashIndex.byExam, filters.exam),
//       );
//     if (filters.type)
//       resultIds = this.hashIndex.intersect(
//         resultIds,
//         this.hashIndex.get(this.hashIndex.byType, filters.type),
//       );
//     if (filters.level)
//       resultIds = this.hashIndex.intersect(
//         resultIds,
//         this.hashIndex.get(this.hashIndex.byLevel, filters.level),
//       );
//     if (filters.keyword)
//       resultIds = this.hashIndex.intersect(
//         resultIds,
//         this.hashIndex.get(this.hashIndex.byKeyword, filters.keyword),
//       );
//     perf.checkpoint("filters_applied");

//     let results = [...resultIds]
//       .map((id) => this.documents.get(id))
//       .filter(Boolean);

//     if (filters.lat && filters.lon && filters.radiusKm) {
//       results = results.filter((doc) => {
//         if (!doc.location?.coordinates?.latitude) return false;
//         const dist = haversineDistance(
//           parseFloat(filters.lat),
//           parseFloat(filters.lon),
//           doc.location.coordinates.latitude,
//           doc.location.coordinates.longitude,
//         );
//         doc._distance = dist;
//         return dist <= parseFloat(filters.radiusKm);
//       });
//       results.sort((a, b) => a._distance - b._distance);
//     }
//     perf.checkpoint("geo_filter");

//     const total = results.length;
//     results = results.slice(skip, skip + limit);

//     const metrics = perf.getMetrics(this.documents.size, total);

//     return {
//       total,
//       results: results.map((d) => ({
//         id: d._id.toString(),
//         name: d.name,
//         shortName: d.shortName,
//         slug: d.slug || generateSlug(d.name),
//         logo: d.logo,
//         coverImage: d.coverImage,
//         type: d.type,
//         location: d.location,
//         establishedYear: d.establishedYear,
//         naacGrade: d.accreditation?.naac?.grade,
//         totalCourses: d._totalCourses || 0,
//         totalFacilities: d.campusDetails?.facilities_arr?.length || 0,
//         topRecruiters: d.placements?.topRecruiters?.slice(0, 6),
//         distance: d._distance ? `${d._distance.toFixed(2)} km` : undefined,
//         programmes: d.programmes?.map((p) => ({
//           name: p.name,
//           slug: generateSlug(p.name),
//           courseCount: p.courseCount || p.course?.length || 0,
//           eligibilityExams: p.eligibilityExams?.slice(0, 4),
//           placementRating: p.placementRating,
//           sampleCourses: p.course
//             ?.slice(0, 2)
//             .map((c) => ({
//               degree: c.degree,
//               duration: c.duration,
//               fee: c.fees?.totalFee,
//             })),
//           url: `/recommendation-collections/${d.slug || generateSlug(d.name)}?programme=${generateSlug(p.name)}`,
//         })),
//       })),
//       ...metrics,
//     };
//   }

//   getInstitute(slug) {
//     const perf = new PerformanceTracker();
//     let institute = null;
//     for (const [id, doc] of this.documents) {
//       if (doc.slug === slug || generateSlug(doc.name) === slug) {
//         institute = doc;
//         break;
//       }
//     }
//     if (!institute)
//       return { error: "Not found", ...perf.getMetrics(this.documents.size, 0) };

//     return {
//       id: institute._id.toString(),
//       name: institute.name,
//       shortName: institute.shortName,
//       slug: institute.slug || generateSlug(institute.name),
//       logo: institute.logo,
//       coverImage: institute.coverImage,
//       type: institute.type,
//       establishedYear: institute.establishedYear,
//       location: institute.location,
//       contact: institute.contact,
//       overview: institute.overview,
//       accreditation: institute.accreditation,
//       campusDetails: institute.campusDetails,
//       academicOverview: {
//         totalCourses: institute._totalCourses || 0,
//         totalFacilities: institute.campusDetails?.facilities_arr?.length || 0,
//       },
//       topRecruiters: institute.placements?.topRecruiters,
//       programmes: institute.programmes?.map((prog) => ({
//         name: prog.name,
//         slug: generateSlug(prog.name),
//         courseCount: prog.courseCount || prog.course?.length || 0,
//         eligibilityExams: prog.eligibilityExams,
//         placementRating: prog.placementRating,
//         url: `/recommendation-collections/${institute.slug || generateSlug(institute.name)}?programme=${generateSlug(prog.name)}`,
//         courses: prog.course?.map((c) => ({
//           id: c._id?.toString(),
//           degree: c.degree,
//           slug: generateSlug(c.degree),
//           duration: c.duration,
//           level: c.level || c.courseLevel,
//           fee: c.fees?.totalFee,
//           educationType: c.educationType,
//           totalSeats: c.totalSeats,
//         })),
//       })),
//       placements: institute.placements,
//       rankings: institute.rankings,
//       mediaGallery: institute.mediaGallery,
//       ...perf.getMetrics(this.documents.size, 1),
//     };
//   }

//   getProgramme(instituteSlug, programmeSlug) {
//     const perf = new PerformanceTracker();
//     let institute = null;
//     for (const [id, doc] of this.documents) {
//       if (
//         doc.slug === instituteSlug ||
//         generateSlug(doc.name) === instituteSlug
//       ) {
//         institute = doc;
//         break;
//       }
//     }
//     if (!institute)
//       return {
//         error: "Institute not found",
//         ...perf.getMetrics(this.documents.size, 0),
//       };

//     const programme = institute.programmes?.find(
//       (p) => generateSlug(p.name) === programmeSlug,
//     );
//     if (!programme)
//       return {
//         error: "Programme not found",
//         ...perf.getMetrics(this.documents.size, 0),
//       };

//     return {
//       programme: {
//         name: programme.name,
//         slug: generateSlug(programme.name),
//         courseCount: programme.course?.length || 0,
//         eligibilityExams: programme.eligibilityExams,
//         placementRating: programme.placementRating,
//       },
//       institute: {
//         name: institute.name,
//         slug: institute.slug || generateSlug(institute.name),
//         logo: institute.logo,
//         city: institute.location?.city,
//         state: institute.location?.state,
//         naacGrade: institute.accreditation?.naac?.grade,
//       },
//       courses: programme.course?.map((c) => ({
//         id: c._id?.toString(),
//         degree: c.degree,
//         slug: generateSlug(c.degree),
//         duration: c.duration,
//         level: c.level || c.courseLevel,
//         fee: c.fees?.totalFee,
//         tuitionFee: c.fees?.tuitionFee,
//         educationType: c.educationType,
//         totalSeats: c.totalSeats,
//         eligibilityExams: c.eligibilityExams || programme.eligibilityExams,
//         averagePackage: c.placements?.averagePackage,
//         url: `/recommendation-collections/${institute.slug || generateSlug(institute.name)}?programme=${generateSlug(programme.name)}&course=${generateSlug(c.degree)}`,
//       })),
//       ...perf.getMetrics(this.documents.size, programme.course?.length || 0),
//     };
//   }

//   getStats() {
//     return {
//       config: { database: DB_NAME, collection: COLLECTION_NAME },
//       counts: this.stats,
//       documents: this.documents.size,
//       indexes: this.hashIndex.getStats(),
//       tries: {
//         institutes: this.instituteTrie.getStats(),
//         programmes: this.programmeTrie.getStats(),
//         courses: this.courseTrie.getStats(),
//       },
//       buildTimeMs: this.buildTime,
//     };
//   }
// }

// // ============================================
// // GLOBAL ENGINE
// // ============================================
// const engine = new SearchEngine();
// let db = null;

// // ============================================
// // API ENDPOINTS
// // ============================================

// app.get("/api/suggest", (req, res) => {
//   const { q, limit = 10 } = req.query;
//   console.log(`\n[API] GET /api/suggest?q=${q}`);
//   if (!q) return res.status(400).json({ error: 'Query "q" required' });
//   res.json(engine.suggest(q, parseInt(limit)));
// });

// app.get("/api/search", (req, res) => {
//   const {
//     city,
//     state,
//     exam,
//     type,
//     level,
//     keyword,
//     lat,
//     lon,
//     radiusKm,
//     limit = 20,
//     skip = 0,
//   } = req.query;
//   console.log(`\n[API] GET /api/search`, req.query);
//   res.json(
//     engine.search(
//       { city, state, exam, type, level, keyword, lat, lon, radiusKm },
//       parseInt(limit),
//       parseInt(skip),
//     ),
//   );
// });

// app.get("/api/nearby", (req, res) => {
//   const { lat, lon, radiusKm = 50, limit = 20 } = req.query;
//   console.log(`\n[API] GET /api/nearby`);
//   if (!lat || !lon)
//     return res.status(400).json({ error: "lat and lon required" });
//   res.json(engine.search({ lat, lon, radiusKm }, parseInt(limit), 0));
// });

// app.get("/api/explore/categories", (req, res) => {
//   console.log(`\n[API] GET /api/explore/categories`);
//   const meta = {
//     UG: "After 12th",
//     PG: "After Graduation",
//     DOCTORATE: "After UG/PG",
//     CERTIFICATE: "After 10th/12th",
//     DIPLOMA: "After 10th/12th",
//   };
//   const categories = [...engine.coursesByLevel.entries()].map(
//     ([level, courses]) => ({
//       id: level.toLowerCase(),
//       level,
//       label: `${level} Courses`,
//       subtitle: meta[level] || "",
//       courseCount: courses.length,
//       instituteCount: new Set(courses.map((c) => c.id)).size,
//     }),
//   );
//   res.json({ categories });
// });

// app.get("/api/explore/level/:level", (req, res) => {
//   const { level } = req.params;
//   const { limit = 50, skip = 0, city, state } = req.query;
//   console.log(`\n[API] GET /api/explore/level/${level}`);
//   let courses = engine.coursesByLevel.get(level.toUpperCase()) || [];
//   if (city)
//     courses = courses.filter(
//       (c) => c.city?.toLowerCase() === city.toLowerCase(),
//     );
//   if (state)
//     courses = courses.filter(
//       (c) => c.state?.toLowerCase() === state.toLowerCase(),
//     );
//   const total = courses.length;
//   courses = courses.slice(parseInt(skip), parseInt(skip) + parseInt(limit));
//   const byProgramme = {};
//   for (const c of courses) {
//     const p = c.programme || "Other";
//     if (!byProgramme[p]) byProgramme[p] = [];
//     byProgramme[p].push(c);
//   }
//   res.json({
//     level: level.toUpperCase(),
//     total,
//     courses,
//     groupedByProgramme: byProgramme,
//   });
// });

// app.get("/api/explore/programmes", (req, res) => {
//   const { limit = 50 } = req.query;
//   console.log(`\n[API] GET /api/explore/programmes`);
//   const programmes = [...engine.programmesByName.entries()]
//     .map(([name, items]) => ({
//       name: items[0]?.name || name,
//       slug: generateSlug(items[0]?.name || name),
//       instituteCount: items.length,
//       institutes: items
//         .slice(0, 5)
//         .map((p) => ({
//           name: p.institute,
//           slug: p.instituteSlug,
//           logo: p.logo,
//           city: p.city,
//           state: p.state,
//         })),
//     }))
//     .sort((a, b) => b.instituteCount - a.instituteCount);
//   res.json({
//     total: programmes.length,
//     programmes: programmes.slice(0, parseInt(limit)),
//   });
// });

// app.get("/api/institute/:slug", (req, res) => {
//   console.log(`\n[API] GET /api/institute/${req.params.slug}`);
//   const result = engine.getInstitute(req.params.slug);
//   if (result.error) return res.status(404).json(result);
//   res.json(result);
// });

// app.get("/api/institute/:slug/programme/:programme", (req, res) => {
//   console.log(
//     `\n[API] GET /api/institute/${req.params.slug}/programme/${req.params.programme}`,
//   );
//   const result = engine.getProgramme(req.params.slug, req.params.programme);
//   if (result.error) return res.status(404).json(result);
//   res.json(result);
// });

// app.get("/api/stats", (req, res) => {
//   console.log(`\n[API] GET /api/stats`);
//   res.json(engine.getStats());
// });

// // ============================================
// // STARTUP
// // ============================================
// async function start() {
//   console.log(
//     "\n╔══════════════════════════════════════════════════════════════╗",
//   );
//   console.log(
//     "║        CAREERBOX SEARCH API - O(1) PERFORMANCE              ║",
//   );
//   console.log(
//     "╚══════════════════════════════════════════════════════════════╝\n",
//   );

//   try {
//     console.log("[STARTUP] Connecting to MongoDB...");
//     const client = new MongoClient(MONGO_URI);
//     await client.connect();
//     console.log("[STARTUP] ✓ Connected\n");

//     db = client.db(DB_NAME);
//     const count = await db.collection(COLLECTION_NAME).countDocuments();
//     console.log(
//       `[STARTUP] Collection: ${DB_NAME}.${COLLECTION_NAME} (${count} docs)\n`,
//     );

//     await engine.buildIndexes(db);

//     const PORT = process.env.PORT || 3000;
//     app.listen(PORT, () => {
//       console.log(`[SERVER] ✓ http://localhost:${PORT}\n`);
//       console.log("ENDPOINTS:");
//       console.log("  /api/suggest?q=engineering college");
//       console.log("  /api/search?keyword=engineering&state=Gujarat");
//       console.log("  /api/explore/categories");
//       console.log("  /api/explore/level/:level");
//       console.log("  /api/explore/programmes");
//       console.log("  /api/institute/:slug");
//       console.log("  /api/institute/:slug/programme/:programme");
//       console.log("  /api/stats\n");
//     });
//   } catch (err) {
//     console.error("[FATAL]", err);
//     process.exit(1);
//   }
// }

// start();
// version2
// const express = require("express");
// const { MongoClient } = require("mongodb");

// const app = express();
// app.use(express.json());

// // ═══════════════════════════════════════════════════════════
// // CONFIG
// // ═══════════════════════════════════════════════════════════
// const MONGO_URI =
//   "mongodb+srv://jon:vatsal00@cluster0.esqiu8v.mongodb.net/quotemanager?retryWrites=true&w=majority";
// const DB_NAME = "careerboxNext";
// const COLLECTION_NAME = "admininstitutes";

// // ═══════════════════════════════════════════════════════════
// // UTILS
// // ═══════════════════════════════════════════════════════════
// const slug = (t) =>
//   t
//     ? t
//         .toLowerCase()
//         .trim()
//         .replace(/[^a-z0-9\s-]/g, "")
//         .replace(/\s+/g, "-")
//         .replace(/-+/g, "-")
//         .replace(/^-|-$/g, "")
//     : "";
// const fee = (f) => (f ? `₹${f.toLocaleString("en-IN")}` : null);

// // Extract description from faculty_student_ratio.students[key=description]
// const getDesc = (doc) => {
//   const s = doc?.faculty_student_ratio?.students;
//   if (Array.isArray(s)) {
//     const d = s.find((x) => x.key === "description");
//     if (d?.value) return d.value;
//   }
//   return doc?.overview?.about || null;
// };

// // ═══════════════════════════════════════════════════════════
// // PERFORMANCE - Nanosecond Precision
// // ═══════════════════════════════════════════════════════════
// class Perf {
//   constructor() {
//     this.t0 = process.hrtime.bigint();
//   }
//   done(total, found) {
//     const ns = Number(process.hrtime.bigint() - this.t0);
//     const ms = ns / 1e6,
//       sec = ns / 1e9;
//     return {
//       timeNs: ns,
//       timeMs: +ms.toFixed(4),
//       timeSec: +sec.toFixed(6),
//       searched: total,
//       found,
//       speed: `${Math.round(total / (sec || 1e-6)).toLocaleString()} docs/sec`,
//       message: `Found ${found} of ${total.toLocaleString()} in ${ms.toFixed(4)}ms`,
//     };
//   }
// }

// // ═══════════════════════════════════════════════════════════
// // TRIE - O(k) Prefix Search
// // ═══════════════════════════════════════════════════════════
// class Trie {
//   constructor() {
//     this.root = { c: {}, d: [] };
//     this.n = 0;
//   }

//   add(text, data) {
//     if (!text) return;
//     let node = this.root;
//     for (const ch of text.toLowerCase()) {
//       if (!node.c[ch]) node.c[ch] = { c: {}, d: [] };
//       node = node.c[ch];
//       if (node.d.length < 50 && !node.d.some((x) => x._k === data._k))
//         node.d.push(data);
//     }
//     this.n++;
//   }

//   find(q, lim = 10) {
//     let node = this.root;
//     for (const ch of q.toLowerCase()) {
//       if (!node.c[ch]) return [];
//       node = node.c[ch];
//     }
//     return node.d.slice(0, lim);
//   }
// }

// // ═══════════════════════════════════════════════════════════
// // HASH INDEX - O(1) Lookup
// // ═══════════════════════════════════════════════════════════
// class Index {
//   constructor() {
//     this.m = {
//       city: new Map(),
//       state: new Map(),
//       type: new Map(),
//       level: new Map(),
//       programme: new Map(),
//       exam: new Map(),
//       keyword: new Map(),
//       course: new Map(),
//     };
//   }

//   add(k, v, id) {
//     if (!v) return;
//     const m = this.m[k],
//       key = v.toString().toLowerCase().trim();
//     if (!m.has(key)) m.set(key, new Set());
//     m.get(key).add(id);
//   }

//   get(k, v) {
//     return v
//       ? this.m[k]?.get(v.toString().toLowerCase().trim()) || new Set()
//       : new Set();
//   }

//   and(a, b) {
//     if (!b?.size) return a;
//     if (!a?.size) return new Set();
//     const [s, l] = a.size <= b.size ? [a, b] : [b, a];
//     return new Set([...s].filter((x) => l.has(x)));
//   }

//   or(...sets) {
//     const r = new Set();
//     for (const s of sets) if (s) for (const i of s) r.add(i);
//     return r;
//   }

//   counts(k, ids) {
//     const r = {};
//     for (const [v, set] of this.m[k]) {
//       const c = [...set].filter((id) => ids.has(id)).length;
//       if (c > 0) r[v] = c;
//     }
//     return r;
//   }
// }

// // ═══════════════════════════════════════════════════════════
// // KEYWORDS
// // ═══════════════════════════════════════════════════════════
// const KW = {
//   engineering: [
//     "b.tech",
//     "b.e.",
//     "m.tech",
//     "engineering",
//     "computer",
//     "mechanical",
//     "electrical",
//     "civil",
//     "electronics",
//     "it",
//     "cse",
//     "ece",
//   ],
//   medical: [
//     "mbbs",
//     "md",
//     "ms",
//     "bds",
//     "nursing",
//     "pharmacy",
//     "medical",
//     "health",
//     "bams",
//     "bhms",
//     "bpt",
//     "mpt",
//     "physiotherapy",
//   ],
//   management: [
//     "mba",
//     "bba",
//     "pgdm",
//     "management",
//     "business",
//     "mms",
//     "finance",
//     "marketing",
//     "hr",
//   ],
//   science: [
//     "b.sc",
//     "m.sc",
//     "science",
//     "physics",
//     "chemistry",
//     "biology",
//     "mathematics",
//     "biotechnology",
//     "microbiology",
//   ],
//   commerce: [
//     "b.com",
//     "m.com",
//     "commerce",
//     "accounting",
//     "finance",
//     "ca",
//     "cma",
//     "cs",
//   ],
//   arts: [
//     "b.a.",
//     "m.a.",
//     "arts",
//     "humanities",
//     "literature",
//     "history",
//     "psychology",
//     "sociology",
//   ],
//   law: ["llb", "llm", "law", "legal", "ba llb", "bba llb", "advocate"],
//   design: [
//     "b.des",
//     "m.des",
//     "design",
//     "fashion",
//     "interior",
//     "graphic",
//     "ui",
//     "ux",
//   ],
//   pharmacy: ["b.pharm", "m.pharm", "d.pharm", "pharmacy", "pharmaceutical"],
//   computer: [
//     "computer",
//     "bca",
//     "mca",
//     "software",
//     "data science",
//     "ai",
//     "ml",
//     "cyber",
//   ],
//   hotel: ["hotel", "hospitality", "tourism", "bhmct", "culinary", "chef"],
//   education: ["b.ed", "m.ed", "education", "teaching", "pedagogy"],
//   top: ["top", "best", "premier", "leading", "ranked", "famous", "popular"],
//   college: ["college", "institute", "university", "school", "academy"],
//   government: ["government", "public", "state", "central", "govt"],
//   private: ["private", "deemed", "autonomous", "self-financed"],
// };

// const extractKW = (t) => {
//   if (!t) return [];
//   const words = t.toLowerCase().split(/\s+/),
//     kw = new Set();
//   for (const w of words) {
//     if (KW[w]) kw.add(w);
//     for (const [k, vs] of Object.entries(KW)) {
//       if (vs.some((v) => w.includes(v) || v.includes(w))) kw.add(k);
//     }
//   }
//   return [...kw];
// };

// // ═══════════════════════════════════════════════════════════
// // SEARCH ENGINE
// // ═══════════════════════════════════════════════════════════
// class Engine {
//   constructor() {
//     this.trie = { i: new Trie(), p: new Trie(), c: new Trie() };
//     this.idx = new Index();
//     this.docs = new Map();
//     this.progs = []; // All programmes (flat)
//     this.crses = []; // All courses (flat)
//     this.stats = { institutes: 0, programmes: 0, courses: 0 };
//   }

//   async build(db) {
//     const t0 = Date.now();
//     console.log("\n" + "═".repeat(60));
//     console.log("  BUILDING INDEX");
//     console.log("═".repeat(60));

//     const data = await db.collection(COLLECTION_NAME).find({}).toArray();
//     console.log(`  Documents: ${data.length}`);

//     for (const doc of data) {
//       const id = doc._id.toString();
//       const iSlug = doc.slug || slug(doc.name);
//       const desc = getDesc(doc);

//       // Augment document
//       doc._slug = iSlug;
//       doc._desc = desc;
//       doc._courses = 0;
//       this.docs.set(id, doc);

//       if (!doc.name) continue;

//       // ═══ INSTITUTE (Suggestion) ═══
//       const iSug = {
//         _k: `i-${id}`,
//         type: "Institute",
//         id,
//         slug: iSlug,
//         name: doc.name,
//         logo: doc.logo,
//         city: doc.location?.city,
//         state: doc.location?.state,
//       };
//       this.trie.i.add(doc.name, iSug);
//       if (doc.shortName) this.trie.i.add(doc.shortName, iSug);

//       // Index
//       if (doc.location?.city) this.idx.add("city", doc.location.city, id);
//       if (doc.location?.state) this.idx.add("state", doc.location.state, id);
//       if (doc.type) this.idx.add("type", doc.type, id);
//       for (const kw of extractKW(doc.name + " " + (doc.type || "")))
//         this.idx.add("keyword", kw, id);

//       this.stats.institutes++;

//       // ═══ PROGRAMMES & COURSES ═══
//       if (!doc.programmes) continue;

//       for (const prog of doc.programmes) {
//         if (!prog.name) continue;
//         const pSlug = slug(prog.name);
//         const pCnt = prog.course?.length || prog.courseCount || 0;

//         // Programme Suggestion
//         const pSug = {
//           _k: `p-${id}-${pSlug}`,
//           type: "Program",
//           id,
//           slug: iSlug,
//           pSlug,
//           name: prog.name,
//           institute: doc.name,
//           logo: doc.logo,
//         };
//         this.trie.p.add(prog.name, pSug);

//         // Programme Full (for search results)
//         const pFull = {
//           ...pSug,
//           city: doc.location?.city,
//           state: doc.location?.state,
//           courseCount: pCnt,
//           eligibilityExams: prog.eligibilityExams || [],
//           placementRating: prog.placementRating,
//           sampleCourses: prog.course?.slice(0, 2).map((c) => ({
//             name: c.degree,
//             slug: slug(c.degree),
//             duration: c.duration,
//             fee: c.fees?.totalFee,
//             feeF: fee(c.fees?.totalFee),
//           })),
//           moreCourses: Math.max(0, pCnt - 2),
//           url: `/recommendation-collections/${iSlug}?programme=${pSlug}`,
//         };
//         this.progs.push(pFull);

//         this.idx.add("programme", prog.name, id);
//         for (const kw of extractKW(prog.name)) this.idx.add("keyword", kw, id);
//         for (const ex of prog.eligibilityExams || [])
//           this.idx.add("exam", ex, id);

//         this.stats.programmes++;

//         // ═══ COURSES ═══
//         if (!prog.course) continue;

//         for (const c of prog.course) {
//           if (!c.degree) continue;
//           const cSlug = slug(c.degree);
//           const lvl = (c.level || c.courseLevel || "").toUpperCase();

//           // Course Suggestion
//           const cSug = {
//             _k: `c-${id}-${cSlug}`,
//             type: "Course",
//             id,
//             slug: iSlug,
//             pSlug,
//             cSlug,
//             name: c.degree,
//             programme: prog.name,
//             institute: doc.name,
//             logo: doc.logo,
//           };
//           this.trie.c.add(c.degree, cSug);

//           // Course Full
//           const cFull = {
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
//           };
//           this.crses.push(cFull);

//           if (lvl) this.idx.add("level", lvl, id);
//           this.idx.add("course", c.degree, id);
//           for (const kw of extractKW(c.degree)) this.idx.add("keyword", kw, id);

//           doc._courses++;
//           this.stats.courses++;
//         }
//       }
//     }

//     console.log("─".repeat(60));
//     console.log(`  Institutes: ${this.stats.institutes}`);
//     console.log(`  Programmes: ${this.stats.programmes}`);
//     console.log(`  Courses: ${this.stats.courses}`);
//     console.log(`  Keywords: ${this.idx.m.keyword.size}`);
//     console.log(`  Time: ${Date.now() - t0}ms`);
//     console.log("═".repeat(60) + "\n");
//   }

//   // ═══════════════════════════════════════════════════════════
//   // API 1: SUGGEST - Lightning Fast Autocomplete
//   // Returns ONLY what's needed for dropdown
//   // ═══════════════════════════════════════════════════════════
//   suggest(q, limit = 8) {
//     const p = new Perf();
//     if (!q?.trim())
//       return {
//         institutes: [],
//         programmes: [],
//         courses: [],
//         performance: p.done(0, 0),
//       };

//     const query = q.trim();

//     // Trie search - O(k)
//     let insts = this.trie.i.find(query, limit);
//     let progs = this.trie.p.find(query, limit);
//     let crses = this.trie.c.find(query, limit);

//     // Keyword fallback - O(1)
//     const kws = extractKW(query);
//     if (kws.length && !insts.length) {
//       let ids = new Set();
//       for (const kw of kws) ids = this.idx.or(ids, this.idx.get("keyword", kw));

//       insts = [...ids]
//         .slice(0, limit)
//         .map((id) => {
//           const d = this.docs.get(id);
//           return d
//             ? {
//                 _k: `i-${id}`,
//                 type: "Institute",
//                 id,
//                 slug: d._slug,
//                 name: d.name,
//                 logo: d.logo,
//                 city: d.location?.city,
//                 state: d.location?.state,
//               }
//             : null;
//         })
//         .filter(Boolean);

//       if (!progs.length)
//         progs = this.progs.filter((x) => ids.has(x.id)).slice(0, limit);
//       if (!crses.length)
//         crses = this.crses.filter((x) => ids.has(x.id)).slice(0, limit);
//     }

//     const total = insts.length + progs.length + crses.length;
//     console.log(
//       `[SUGGEST] "${q}" → ${insts.length}I/${progs.length}P/${crses.length}C`,
//     );

//     return {
//       query: q,
//       keywords: kws,
//       institutes: insts.map((i) => ({
//         type: "Institute",
//         id: i.id,
//         slug: i.slug,
//         name: i.name,
//         logo: i.logo,
//         location: [i.city, i.state].filter(Boolean).join(", "),
//       })),
//       programmes: progs.map((p) => ({
//         type: "Program",
//         id: p.id,
//         slug: p.slug,
//         pSlug: p.pSlug,
//         name: p.name,
//         institute: p.institute,
//         logo: p.logo,
//       })),
//       courses: crses.map((c) => ({
//         type: "Course",
//         id: c.id,
//         slug: c.slug,
//         pSlug: c.pSlug,
//         cSlug: c.cSlug,
//         name: c.name,
//         programme: c.programme,
//         institute: c.institute,
//         logo: c.logo,
//       })),
//       performance: p.done(this.docs.size, total),
//     };
//   }

//   // ═══════════════════════════════════════════════════════════
//   // API 2: SEARCH - Full Results with Filters & Pagination
//   // Called when: clicking suggestion OR pressing Enter OR applying filters
//   // ═══════════════════════════════════════════════════════════
//   search({
//     q,
//     type,
//     city,
//     state,
//     level,
//     programme,
//     exam,
//     course,
//     page = 1,
//     limit = 20,
//   }) {
//     const p = new Perf();
//     const skip = (page - 1) * limit;

//     // Start with all docs
//     let ids = new Set(this.docs.keys());

//     // Query filter (keywords or trie)
//     const kws = q ? extractKW(q) : [];
//     if (kws.length) {
//       let kwIds = new Set();
//       for (const kw of kws)
//         kwIds = this.idx.or(kwIds, this.idx.get("keyword", kw));
//       if (kwIds.size) ids = this.idx.and(ids, kwIds);
//     } else if (q?.trim()) {
//       // Direct name search
//       const tr = [
//         ...this.trie.i.find(q, 500),
//         ...this.trie.p.find(q, 500),
//         ...this.trie.c.find(q, 500),
//       ];
//       const trIds = new Set(tr.map((x) => x.id));
//       if (trIds.size) ids = this.idx.and(ids, trIds);
//     }

//     // Apply filters - all O(1) lookup + O(min) intersection
//     if (city) ids = this.idx.and(ids, this.idx.get("city", city));
//     if (state) ids = this.idx.and(ids, this.idx.get("state", state));
//     if (level) ids = this.idx.and(ids, this.idx.get("level", level));
//     if (programme)
//       ids = this.idx.and(ids, this.idx.get("programme", programme));
//     if (exam) ids = this.idx.and(ids, this.idx.get("exam", exam));
//     if (course) ids = this.idx.and(ids, this.idx.get("course", course));

//     // Build results based on type
//     let institutes = [],
//       programmes = [],
//       courses = [];

//     // INSTITUTES
//     if (!type || type === "institute") {
//       institutes = [...ids]
//         .map((id) => {
//           const d = this.docs.get(id);
//           if (!d) return null;
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
//               ? d._desc.substring(0, 350) + (d._desc.length > 350 ? "..." : "")
//               : null,
//             topRecruiters: d.placements?.topRecruiters?.slice(0, 6),
//             programmes: d.programmes?.slice(0, 3).map((pr) => ({
//               name: pr.name,
//               slug: slug(pr.name),
//               courseCount: pr.course?.length || pr.courseCount || 0,
//               eligibilityExams: pr.eligibilityExams?.slice(0, 4),
//               placementRating: pr.placementRating,
//               sampleCourses: pr.course?.slice(0, 2).map((c) => ({
//                 name: c.degree,
//                 duration: c.duration,
//                 fee: c.fees?.totalFee,
//                 feeF: fee(c.fees?.totalFee),
//               })),
//               moreCourses: Math.max(0, (pr.course?.length || 0) - 2),
//               url: `/recommendation-collections/${d._slug}?programme=${slug(pr.name)}`,
//             })),
//             moreProgrammes: Math.max(0, (d.programmes?.length || 0) - 3),
//           };
//         })
//         .filter(Boolean);
//     }

//     // PROGRAMMES - Hydrate with course data
//     if (!type || type === "programme") {
//       programmes = this.progs.filter((x) => ids.has(x.id));
//     }

//     // COURSES - Hydrate with programme data
//     if (!type || type === "course") {
//       courses = this.crses.filter((x) => ids.has(x.id));
//     }

//     // Filter counts for sidebar
//     const filterCounts = {
//       cities: this.idx.counts("city", ids),
//       states: this.idx.counts("state", ids),
//       levels: this.idx.counts("level", ids),
//       programmes: this.idx.counts("programme", ids),
//       exams: this.idx.counts("exam", ids),
//       courses: this.idx.counts("course", ids),
//     };

//     // Totals
//     const totals = {
//       institutes: institutes.length,
//       programmes: programmes.length,
//       courses: courses.length,
//     };

//     // Paginate
//     const iPage = institutes.slice(skip, skip + limit);
//     const pPage = programmes.slice(skip, skip + limit);
//     const cPage = courses.slice(skip, skip + limit);

//     console.log(
//       `[SEARCH] q="${q}" type=${type || "all"} → ${totals.institutes}I/${totals.programmes}P/${totals.courses}C`,
//     );

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
//           courses: skip + limit < totals.courses,
//         },
//       },
//       institutes: iPage,
//       programmes: pPage,
//       courses: cPage,
//       performance: p.done(
//         this.docs.size,
//         totals.institutes + totals.programmes + totals.courses,
//       ),
//     };
//   }

//   // ═══════════════════════════════════════════════════════════
//   // API 3: INSTITUTE - Full Document
//   // Called when: viewing institute detail page
//   // ═══════════════════════════════════════════════════════════
//   institute(instSlug) {
//     const p = new Perf();

//     let doc = null;
//     for (const [, d] of this.docs) {
//       if (d._slug === instSlug || d.slug === instSlug) {
//         doc = d;
//         break;
//       }
//     }

//     if (!doc)
//       return {
//         error: "Institute not found",
//         performance: p.done(this.docs.size, 0),
//       };

//     console.log(`[INSTITUTE] ${instSlug}`);

//     return {
//       id: doc._id.toString(),
//       slug: doc._slug,
//       name: doc.name,
//       shortName: doc.shortName,
//       logo: doc.logo,
//       coverImage: doc.coverImage,
//       type: doc.type,
//       establishedYear: doc.establishedYear,

//       // Description (from faculty_student_ratio or overview)
//       description: doc._desc,

//       location: doc.location,
//       contact: doc.contact,

//       accreditation: doc.accreditation,
//       rankings: doc.rankings,
//       overview: doc.overview,

//       academicOverview: {
//         totalCourses: doc._courses,
//         totalFacilities: doc.campusDetails?.facilities_arr?.length || 0,
//         facilities: doc.campusDetails?.facilities_arr,
//       },

//       topRecruiters: doc.placements?.topRecruiters,

//       // All programmes with all courses
//       programmes: doc.programmes?.map((pr) => ({
//         name: pr.name,
//         slug: slug(pr.name),
//         courseCount: pr.course?.length || pr.courseCount || 0,
//         eligibilityExams: pr.eligibilityExams,
//         placementRating: pr.placementRating,
//         url: `/recommendation-collections/${doc._slug}?programme=${slug(pr.name)}`,
//         courses: pr.course?.map((c) => ({
//           id: c._id?.toString(),
//           name: c.degree,
//           slug: slug(c.degree),
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
//           url: `/recommendation-collections/${doc._slug}?programme=${slug(pr.name)}&course=${slug(c.degree)}`,
//         })),
//       })),

//       // Raw data for advanced frontend use
//       raw: {
//         campusDetails: doc.campusDetails,
//         admissions: doc.admissions,
//         placements: doc.placements,
//         researchAndInnovation: doc.researchAndInnovation,
//         alumniNetwork: doc.alumniNetwork,
//         faculty_student_ratio: doc.faculty_student_ratio,
//       },

//       performance: p.done(this.docs.size, 1),
//     };
//   }

//   stats() {
//     return {
//       documents: this.docs.size,
//       ...this.stats,
//       indexes: Object.fromEntries(
//         Object.entries(this.idx.m).map(([k, m]) => [k, m.size]),
//       ),
//       tries: {
//         institutes: this.trie.i.n,
//         programmes: this.trie.p.n,
//         courses: this.trie.c.n,
//       },
//     };
//   }
// }

// // ═══════════════════════════════════════════════════════════
// // INIT
// // ═══════════════════════════════════════════════════════════
// const engine = new Engine();

// // ═══════════════════════════════════════════════════════════
// // ROUTES
// // ═══════════════════════════════════════════════════════════

// // 1. SUGGEST - Fast autocomplete dropdown
// app.get("/api/suggest", (req, res) => {
//   const { q, limit = 8 } = req.query;
//   console.log(`\n[API] GET /api/suggest?q=${q}`);
//   if (!q) return res.status(400).json({ error: "q required" });
//   res.json(engine.suggest(q, +limit));
// });

// // 2. SEARCH - Full results + filters + pagination
// app.get("/api/search", (req, res) => {
//   const {
//     q,
//     type,
//     city,
//     state,
//     level,
//     programme,
//     exam,
//     course,
//     page = 1,
//     limit = 20,
//   } = req.query;
//   console.log(`\n[API] GET /api/search`, req.query);
//   res.json(
//     engine.search({
//       q,
//       type,
//       city,
//       state,
//       level,
//       programme,
//       exam,
//       course,
//       page: +page,
//       limit: +limit,
//     }),
//   );
// });

// // 3. INSTITUTE - Full document
// app.get("/api/institute/:slug", (req, res) => {
//   console.log(`\n[API] GET /api/institute/${req.params.slug}`);
//   const r = engine.institute(req.params.slug);
//   if (r.error) return res.status(404).json(r);
//   res.json(r);
// });

// // 4. STATS
// app.get("/api/stats", (req, res) => res.json(engine.stats()));

// // ═══════════════════════════════════════════════════════════
// // START
// // ═══════════════════════════════════════════════════════════
// async function start() {
//   console.log(
//     "\n╔══════════════════════════════════════════════════════════════╗",
//   );
//   console.log(
//     "║       CAREERBOX SEARCH API v3.0 - PRODUCTION READY          ║",
//   );
//   console.log(
//     "║       O(1) Hash + O(k) Trie | Nanosecond Precision          ║",
//   );
//   console.log(
//     "╚══════════════════════════════════════════════════════════════╝\n",
//   );

//   try {
//     const client = new MongoClient(MONGO_URI);
//     await client.connect();
//     const db = client.db(DB_NAME);
//     console.log(`[DB] Connected: ${DB_NAME}.${COLLECTION_NAME}`);

//     await engine.build(db);

//     app.listen(3000, () => {
//       console.log("[SERVER] http://localhost:3000\n");
//       console.log(
//         "╔══════════════════════════════════════════════════════════════╗",
//       );
//       console.log(
//         "║  ENDPOINTS                                                   ║",
//       );
//       console.log(
//         "╠══════════════════════════════════════════════════════════════╣",
//       );
//       console.log(
//         "║                                                              ║",
//       );
//       console.log(
//         "║  1. SUGGEST (autocomplete dropdown - lightning fast)         ║",
//       );
//       console.log(
//         "║     GET /api/suggest?q=par                                   ║",
//       );
//       console.log(
//         "║     → Returns: name, logo, location, type badge only         ║",
//       );
//       console.log(
//         "║                                                              ║",
//       );
//       console.log(
//         "║  2. SEARCH (click suggestion / enter / apply filters)        ║",
//       );
//       console.log(
//         "║     GET /api/search?q=parul&type=programme                   ║",
//       );
//       console.log(
//         "║     GET /api/search?q=engineering+college&type=institute     ║",
//       );
//       console.log(
//         "║     GET /api/search?city=Vadodara&programme=B.E.+/+B.Tech    ║",
//       );
//       console.log(
//         "║     → Returns: full data, filter counts, pagination          ║",
//       );
//       console.log(
//         "║                                                              ║",
//       );
//       console.log(
//         "║  3. INSTITUTE (full detail page)                             ║",
//       );
//       console.log(
//         "║     GET /api/institute/parul-university                      ║",
//       );
//       console.log(
//         "║     → Returns: complete document with all programmes/courses ║",
//       );
//       console.log(
//         "║                                                              ║",
//       );
//       console.log(
//         "╚══════════════════════════════════════════════════════════════╝\n",
//       );
//     });
//   } catch (e) {
//     console.error("[FATAL]", e);
//     process.exit(1);
//   }
// }

// start();
const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════
const MONGO_URI =
  "mongodb+srv://jon:vatsal00@cluster0.esqiu8v.mongodb.net/quotemanager?retryWrites=true&w=majority";
const DB_NAME = "careerboxNext";
const COLLECTION_NAME = "admininstitutes";

// ═══════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════
const slug = (t) =>
  t
    ? t
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    : "";
const fee = (f) => (f ? `₹${f.toLocaleString("en-IN")}` : null);

// Extract description from faculty_student_ratio.students[key=description]
const getDesc = (doc) => {
  const s = doc?.faculty_student_ratio?.students;
  if (Array.isArray(s)) {
    const d = s.find((x) => x.key === "description");
    if (d?.value) return d.value;
  }
  return doc?.overview?.about || null;
};

// ═══════════════════════════════════════════════════════════
// PERFORMANCE - Nanosecond Precision
// ═══════════════════════════════════════════════════════════
class Perf {
  constructor() {
    this.t0 = process.hrtime.bigint();
  }
  done(total, found) {
    const ns = Number(process.hrtime.bigint() - this.t0);
    const ms = ns / 1e6,
      sec = ns / 1e9;
    return {
      timeNs: ns,
      timeMs: +ms.toFixed(4),
      timeSec: +sec.toFixed(6),
      searched: total,
      found,
      speed: `${Math.round(total / (sec || 1e-6)).toLocaleString()} docs/sec`,
      message: `Found ${found} of ${total.toLocaleString()} in ${ms.toFixed(4)}ms`,
    };
  }
}

// ═══════════════════════════════════════════════════════════
// TRIE - O(k) Prefix Search
// ═══════════════════════════════════════════════════════════
class Trie {
  constructor() {
    this.root = { c: {}, d: [] };
    this.n = 0;
  }

  add(text, data) {
    if (!text) return;
    let node = this.root;
    for (const ch of text.toLowerCase()) {
      if (!node.c[ch]) node.c[ch] = { c: {}, d: [] };
      node = node.c[ch];
      if (node.d.length < 50 && !node.d.some((x) => x._k === data._k))
        node.d.push(data);
    }
    this.n++;
  }

  find(q, lim = 10) {
    let node = this.root;
    for (const ch of q.toLowerCase()) {
      if (!node.c[ch]) return [];
      node = node.c[ch];
    }
    return node.d.slice(0, lim);
  }
}

// ═══════════════════════════════════════════════════════════
// HASH INDEX - O(1) Lookup
// ═══════════════════════════════════════════════════════════
class Index {
  constructor() {
    this.m = {
      city: new Map(),
      state: new Map(),
      type: new Map(),
      level: new Map(),
      programme: new Map(),
      exam: new Map(),
      keyword: new Map(),
      course: new Map(),
    };
  }

  add(k, v, id) {
    if (!v) return;
    const m = this.m[k],
      key = v.toString().toLowerCase().trim();
    if (!m.has(key)) m.set(key, new Set());
    m.get(key).add(id);
  }

  get(k, v) {
    return v
      ? this.m[k]?.get(v.toString().toLowerCase().trim()) || new Set()
      : new Set();
  }

  and(a, b) {
    if (!b?.size) return a;
    if (!a?.size) return new Set();
    const [s, l] = a.size <= b.size ? [a, b] : [b, a];
    return new Set([...s].filter((x) => l.has(x)));
  }

  or(...sets) {
    const r = new Set();
    for (const s of sets) if (s) for (const i of s) r.add(i);
    return r;
  }

  counts(k, ids) {
    const r = {};
    for (const [v, set] of this.m[k]) {
      const c = [...set].filter((id) => ids.has(id)).length;
      if (c > 0) r[v] = c;
    }
    return r;
  }
}

// ═══════════════════════════════════════════════════════════
// KEYWORDS
// ═══════════════════════════════════════════════════════════
const KW = {
  engineering: [
    "b.tech",
    "btech",
    "b.e.",
    "be",
    "m.tech",
    "mtech",
    "m.e.",
    "me",
    "engineering",
    "engg",
    "engineer",
    "b tech",
    "m tech",
    "bachelor of technology",
    "master of technology",
    "bachelor of engineering",
    "master of engineering",
    "computer",
    "mechanical",
    "electrical",
    "civil",
    "electronics",
    "it",
    "cse",
    "ece",
    "information technology",
    "computer science",
    "electronics and communication",
    "electronics & communication",
    "comp",
    "mech",
    "elec",
    "eee",
    "electrical and electronics",
    "auto",
    "automobile",
    "automotive",
    "aeronautical",
    "aerospace",
    "chemical",
    "instrumentation",
    "biomedical",
    "biotechnology engineering",
    "production",
    "industrial",
    "mining",
    "petroleum",
    "textile",
    "agricultural",
    "food technology",
    "polymer",
  ],
  medical: [
    "mbbs",
    "md",
    "ms",
    "bds",
    "mds",
    "nursing",
    "bsc nursing",
    "b.sc nursing",
    "gnm",
    "pharmacy",
    "medical",
    "health",
    "bams",
    "bhms",
    "bpt",
    "mpt",
    "physiotherapy",
    "ayurveda",
    "homeopathy",
    "dental",
    "medicine",
    "bachelor of medicine",
    "doctor of medicine",
    "paramedical",
    "veterinary",
    "bvsc",
    "optometry",
    "radiology",
    "lab technology",
    "anesthesia",
    "operation theatre",
  ],
  management: [
    "mba",
    "bba",
    "pgdm",
    "pgp",
    "management",
    "business",
    "mms",
    "finance",
    "marketing",
    "hr",
    "human resource",
    "operations",
    "supply chain",
    "international business",
    "entrepreneurship",
    "retail",
    "hospital management",
    "event management",
    "executive mba",
    "emba",
    "business administration",
    "master of business",
    "bachelor of business",
  ],
  science: [
    "b.sc",
    "bsc",
    "m.sc",
    "msc",
    "b sc",
    "m sc",
    "science",
    "physics",
    "chemistry",
    "biology",
    "mathematics",
    "maths",
    "stats",
    "statistics",
    "biotechnology",
    "biotech",
    "microbiology",
    "zoology",
    "botany",
    "biochemistry",
    "environmental science",
    "forensic",
    "geology",
    "geography",
    "electronics science",
    "computer science bsc",
    "data science",
    "agriculture",
    "horticulture",
    "fisheries",
  ],
  commerce: [
    "b.com",
    "bcom",
    "m.com",
    "mcom",
    "b com",
    "m com",
    "commerce",
    "accounting",
    "finance",
    "ca",
    "cma",
    "cs",
    "chartered accountant",
    "cost accountant",
    "company secretary",
    "banking",
    "taxation",
    "accounts",
    "book keeping",
    "financial management",
    "bachelor of commerce",
    "master of commerce",
  ],
  arts: [
    "b.a.",
    "ba",
    "m.a.",
    "ma",
    "b a",
    "m a",
    "arts",
    "humanities",
    "literature",
    "english",
    "hindi",
    "history",
    "psychology",
    "sociology",
    "political science",
    "economics",
    "philosophy",
    "journalism",
    "mass communication",
    "media",
    "social work",
    "public administration",
    "anthropology",
    "bachelor of arts",
    "master of arts",
  ],
  law: [
    "llb",
    "llm",
    "ll.b",
    "ll.m",
    "law",
    "legal",
    "ba llb",
    "bba llb",
    "b.a. llb",
    "bba ll.b",
    "advocate",
    "bachelor of law",
    "master of law",
    "legal studies",
    "corporate law",
    "criminal law",
    "constitutional law",
    "international law",
    "5 year law",
    "3 year law",
    "integrated law",
  ],
  design: [
    "b.des",
    "m.des",
    "bdes",
    "mdes",
    "design",
    "fashion",
    "interior",
    "graphic",
    "ui",
    "ux",
    "product design",
    "textile design",
    "fashion design",
    "interior design",
    "graphic design",
    "web design",
    "animation",
    "vfx",
    "visual effects",
    "game design",
    "communication design",
    "industrial design",
    "jewellery design",
    "accessory design",
  ],
  pharmacy: [
    "b.pharm",
    "bpharm",
    "m.pharm",
    "mpharm",
    "d.pharm",
    "dpharm",
    "b pharm",
    "m pharm",
    "d pharm",
    "pharmacy",
    "pharmaceutical",
    "pharmacology",
    "pharma",
    "bachelor of pharmacy",
    "master of pharmacy",
    "diploma in pharmacy",
    "pharmaceutical sciences",
    "pharmaceutical chemistry",
  ],
  computer: [
    "computer",
    "bca",
    "mca",
    "b.c.a",
    "m.c.a",
    "software",
    "data science",
    "ai",
    "ml",
    "cyber",
    "artificial intelligence",
    "machine learning",
    "cyber security",
    "information technology",
    "it",
    "programming",
    "web development",
    "app development",
    "cloud computing",
    "blockchain",
    "iot",
    "internet of things",
    "software engineering",
    "bachelor of computer application",
    "master of computer application",
  ],
  hotel: [
    "hotel",
    "hospitality",
    "tourism",
    "bhmct",
    "ihm",
    "culinary",
    "chef",
    "hotel management",
    "catering",
    "travel",
    "cruise",
    "airline",
    "cabin crew",
    "food production",
    "food service",
    "housekeeping",
    "front office",
  ],
  education: [
    "b.ed",
    "bed",
    "m.ed",
    "med",
    "b ed",
    "m ed",
    "education",
    "teaching",
    "pedagogy",
    "teacher training",
    "bachelor of education",
    "master of education",
    "elementary education",
    "special education",
    "physical education",
    "d.el.ed",
    "diploma in education",
  ],
  architecture: [
    "b.arch",
    "barch",
    "m.arch",
    "march",
    "architecture",
    "planning",
    "urban planning",
    "landscape",
    "bachelor of architecture",
    "master of architecture",
  ],
  top: [
    "top",
    "best",
    "premier",
    "leading",
    "ranked",
    "famous",
    "popular",
    "top rated",
  ],
  college: [
    "college",
    "institute",
    "university",
    "school",
    "academy",
    "institution",
  ],
  government: ["government", "public", "state", "central", "govt", "gov"],
  private: [
    "private",
    "deemed",
    "autonomous",
    "self-financed",
    "self financed",
  ],
};

const extractKW = (t) => {
  if (!t) return [];
  const words = t.toLowerCase().split(/\s+/),
    kw = new Set();
  for (const w of words) {
    if (KW[w]) kw.add(w);
    for (const [k, vs] of Object.entries(KW)) {
      if (vs.some((v) => w.includes(v) || v.includes(w))) kw.add(k);
    }
  }
  return [...kw];
};

// ═══════════════════════════════════════════════════════════
// SEARCH ENGINE
// ═══════════════════════════════════════════════════════════
class Engine {
  constructor() {
    this.trie = { i: new Trie(), p: new Trie(), c: new Trie() };
    this.idx = new Index();
    this.docs = new Map();
    this.progs = []; // All programmes (flat)
    this.crses = []; // All courses (flat)
    this.stats = { institutes: 0, programmes: 0, courses: 0 };
  }

  async build(db) {
    const t0 = Date.now();
    console.log("\n" + "═".repeat(60));
    console.log("  BUILDING INDEX");
    console.log("═".repeat(60));

    const data = await db.collection(COLLECTION_NAME).find({}).toArray();
    console.log(`  Documents: ${data.length}`);

    for (const doc of data) {
      const id = doc._id.toString();
      const iSlug = doc.slug || slug(doc.name);
      const desc = getDesc(doc);

      // Augment document
      doc._slug = iSlug;
      doc._desc = desc;
      doc._courses = 0;
      this.docs.set(id, doc);

      if (!doc.name) continue;

      // ═══ INSTITUTE (Suggestion) ═══
      const iSug = {
        _k: `i-${id}`,
        type: "Institute",
        id,
        slug: iSlug,
        name: doc.name,
        logo: doc.logo,
        city: doc.location?.city,
        state: doc.location?.state,
      };
      this.trie.i.add(doc.name, iSug);
      if (doc.shortName) this.trie.i.add(doc.shortName, iSug);

      // Index
      if (doc.location?.city) this.idx.add("city", doc.location.city, id);
      if (doc.location?.state) this.idx.add("state", doc.location.state, id);
      if (doc.type) this.idx.add("type", doc.type, id);
      for (const kw of extractKW(doc.name + " " + (doc.type || "")))
        this.idx.add("keyword", kw, id);

      this.stats.institutes++;

      // ═══ PROGRAMMES & COURSES ═══
      if (!doc.programmes) continue;

      for (const prog of doc.programmes) {
        if (!prog.name) continue;
        const pSlug = slug(prog.name);
        const pCnt = prog.course?.length || prog.courseCount || 0;

        // Programme Suggestion
        const pSug = {
          _k: `p-${id}-${pSlug}`,
          type: "Program",
          id,
          slug: iSlug,
          pSlug,
          name: prog.name,
          institute: doc.name,
          logo: doc.logo,
        };
        this.trie.p.add(prog.name, pSug);

        // Programme Full (for search results)
        const pFull = {
          ...pSug,
          city: doc.location?.city,
          state: doc.location?.state,
          courseCount: pCnt,
          eligibilityExams: prog.eligibilityExams || [],
          placementRating: prog.placementRating,
          sampleCourses: prog.course?.slice(0, 2).map((c) => ({
            name: c.degree,
            slug: slug(c.degree),
            duration: c.duration,
            fee: c.fees?.totalFee,
            feeF: fee(c.fees?.totalFee),
          })),
          moreCourses: Math.max(0, pCnt - 2),
          url: `/recommendation-collections/${iSlug}?programme=${pSlug}`,
        };
        this.progs.push(pFull);

        this.idx.add("programme", prog.name, id);
        for (const kw of extractKW(prog.name)) this.idx.add("keyword", kw, id);
        for (const ex of prog.eligibilityExams || [])
          this.idx.add("exam", ex, id);

        this.stats.programmes++;

        // ═══ COURSES ═══
        if (!prog.course) continue;

        for (const c of prog.course) {
          if (!c.degree) continue;
          const cSlug = slug(c.degree);
          const lvl = (c.level || c.courseLevel || "").toUpperCase();

          // Course Suggestion
          const cSug = {
            _k: `c-${id}-${cSlug}`,
            type: "Course",
            id,
            slug: iSlug,
            pSlug,
            cSlug,
            name: c.degree,
            programme: prog.name,
            institute: doc.name,
            logo: doc.logo,
          };
          this.trie.c.add(c.degree, cSug);

          // Course Full (enriched with programme data)
          const cFull = {
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
            // Programme enrichment
            programmeDetails: {
              name: prog.name,
              slug: pSlug,
              courseCount: pCnt,
              placementRating: prog.placementRating,
              eligibilityExams: prog.eligibilityExams || [],
            },
          };
          this.crses.push(cFull);

          if (lvl) this.idx.add("level", lvl, id);
          this.idx.add("course", c.degree, id);

          // Index course with keywords (extract from course name)
          for (const kw of extractKW(c.degree)) this.idx.add("keyword", kw, id);

          // Also index programme keywords for course discoverability
          for (const kw of extractKW(prog.name))
            this.idx.add("keyword", kw, id);

          doc._courses++;
          this.stats.courses++;
        }
      }
    }

    console.log("─".repeat(60));
    console.log(`  Institutes: ${this.stats.institutes}`);
    console.log(`  Programmes: ${this.stats.programmes}`);
    console.log(`  Courses: ${this.stats.courses}`);
    console.log(`  Keywords: ${this.idx.m.keyword.size}`);
    console.log(`  Time: ${Date.now() - t0}ms`);
    console.log("═".repeat(60) + "\n");
  }

  // ═══════════════════════════════════════════════════════════
  // API 1: SUGGEST - Lightning Fast Autocomplete
  // Returns ONLY what's needed for dropdown
  // ═══════════════════════════════════════════════════════════
  suggest(q, limit = 8) {
    const p = new Perf();
    if (!q?.trim())
      return {
        institutes: [],
        programmes: [],
        courses: [],
        performance: p.done(0, 0),
      };

    const query = q.trim();

    // Trie search - O(k)
    let insts = this.trie.i.find(query, limit);
    let progs = this.trie.p.find(query, limit);
    let crses = this.trie.c.find(query, limit);

    // Keyword fallback - O(1)
    const kws = extractKW(query);
    if (kws.length && !insts.length) {
      let ids = new Set();
      for (const kw of kws) ids = this.idx.or(ids, this.idx.get("keyword", kw));

      insts = [...ids]
        .slice(0, limit)
        .map((id) => {
          const d = this.docs.get(id);
          return d
            ? {
                _k: `i-${id}`,
                type: "Institute",
                id,
                slug: d._slug,
                name: d.name,
                logo: d.logo,
                city: d.location?.city,
                state: d.location?.state,
              }
            : null;
        })
        .filter(Boolean);

      if (!progs.length)
        progs = this.progs.filter((x) => ids.has(x.id)).slice(0, limit);
      if (!crses.length)
        crses = this.crses.filter((x) => ids.has(x.id)).slice(0, limit);
    }

    const total = insts.length + progs.length + crses.length;
    console.log(
      `[SUGGEST] "${q}" → ${insts.length}I/${progs.length}P/${crses.length}C`,
    );

    return {
      query: q,
      keywords: kws,
      institutes: insts.map((i) => ({
        type: "Institute",
        id: i.id,
        slug: i.slug,
        name: i.name,
        logo: i.logo,
        location: [i.city, i.state].filter(Boolean).join(", "),
      })),
      programmes: progs.map((p) => ({
        type: "Program",
        id: p.id,
        slug: p.slug,
        pSlug: p.pSlug,
        name: p.name,
        institute: p.institute,
        logo: p.logo,
      })),
      courses: crses.map((c) => ({
        type: "Course",
        id: c.id,
        slug: c.slug,
        pSlug: c.pSlug,
        cSlug: c.cSlug,
        name: c.name,
        programme: c.programme,
        institute: c.institute,
        logo: c.logo,
        // Programme enrichment
        programmeDetails: c.programmeDetails,
      })),
      performance: p.done(this.docs.size, total),
    };
  }

  // ═══════════════════════════════════════════════════════════
  // API 2: SEARCH - Full Results with Filters & Pagination
  // Called when: clicking suggestion OR pressing Enter OR applying filters
  // ═══════════════════════════════════════════════════════════
  search({
    q,
    type,
    city,
    state,
    level,
    programme,
    exam,
    course,
    page = 1,
    limit = 20,
  }) {
    const p = new Perf();
    const skip = (page - 1) * limit;

    // Start with all docs
    let ids = new Set(this.docs.keys());

    // Query filter (keywords or trie)
    const kws = q ? extractKW(q) : [];
    if (kws.length) {
      let kwIds = new Set();
      for (const kw of kws)
        kwIds = this.idx.or(kwIds, this.idx.get("keyword", kw));
      if (kwIds.size) ids = this.idx.and(ids, kwIds);
    } else if (q?.trim()) {
      // Direct name search
      const tr = [
        ...this.trie.i.find(q, 500),
        ...this.trie.p.find(q, 500),
        ...this.trie.c.find(q, 500),
      ];
      const trIds = new Set(tr.map((x) => x.id));
      if (trIds.size) ids = this.idx.and(ids, trIds);
    }

    // Apply filters - all O(1) lookup + O(min) intersection
    if (city) ids = this.idx.and(ids, this.idx.get("city", city));
    if (state) ids = this.idx.and(ids, this.idx.get("state", state));
    if (level) ids = this.idx.and(ids, this.idx.get("level", level));
    if (programme)
      ids = this.idx.and(ids, this.idx.get("programme", programme));
    if (exam) ids = this.idx.and(ids, this.idx.get("exam", exam));
    if (course) ids = this.idx.and(ids, this.idx.get("course", course));

    // Build results based on type
    let institutes = [],
      programmes = [],
      courses = [];

    // INSTITUTES
    if (!type || type === "institute") {
      institutes = [...ids]
        .map((id) => {
          const d = this.docs.get(id);
          if (!d) return null;
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
              ? d._desc.substring(0, 350) + (d._desc.length > 350 ? "..." : "")
              : null,
            topRecruiters: d.placements?.topRecruiters?.slice(0, 6),
            programmes: d.programmes?.slice(0, 3).map((pr) => ({
              name: pr.name,
              slug: slug(pr.name),
              courseCount: pr.course?.length || pr.courseCount || 0,
              eligibilityExams: pr.eligibilityExams?.slice(0, 4),
              placementRating: pr.placementRating,
              sampleCourses: pr.course?.slice(0, 2).map((c) => ({
                name: c.degree,
                duration: c.duration,
                fee: c.fees?.totalFee,
                feeF: fee(c.fees?.totalFee),
              })),
              moreCourses: Math.max(0, (pr.course?.length || 0) - 2),
              url: `/recommendation-collections/${d._slug}?programme=${slug(pr.name)}`,
            })),
            moreProgrammes: Math.max(0, (d.programmes?.length || 0) - 3),
          };
        })
        .filter(Boolean);
    }

    // PROGRAMMES - Hydrate with course data
    if (!type || type === "programme") {
      programmes = this.progs.filter((x) => ids.has(x.id));
    }

    // COURSES - Hydrate with programme data
    if (!type || type === "course") {
      courses = this.crses.filter((x) => ids.has(x.id));
    }

    // Filter counts for sidebar
    const filterCounts = {
      cities: this.idx.counts("city", ids),
      states: this.idx.counts("state", ids),
      levels: this.idx.counts("level", ids),
      programmes: this.idx.counts("programme", ids),
      exams: this.idx.counts("exam", ids),
      courses: this.idx.counts("course", ids),
    };

    // Totals
    const totals = {
      institutes: institutes.length,
      programmes: programmes.length,
      courses: courses.length,
    };

    // Paginate
    const iPage = institutes.slice(skip, skip + limit);
    const pPage = programmes.slice(skip, skip + limit);
    const cPage = courses.slice(skip, skip + limit);

    console.log(
      `[SEARCH] q="${q}" type=${type || "all"} → ${totals.institutes}I/${totals.programmes}P/${totals.courses}C`,
    );

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
          courses: skip + limit < totals.courses,
        },
      },
      institutes: iPage,
      programmes: pPage,
      courses: cPage,
      performance: p.done(
        this.docs.size,
        totals.institutes + totals.programmes + totals.courses,
      ),
    };
  }

  // ═══════════════════════════════════════════════════════════
  // API 3: INSTITUTE - Full Document
  // Called when: viewing institute detail page
  // ═══════════════════════════════════════════════════════════
  institute(instSlug) {
    const p = new Perf();

    let doc = null;
    for (const [, d] of this.docs) {
      if (d._slug === instSlug || d.slug === instSlug) {
        doc = d;
        break;
      }
    }

    if (!doc)
      return {
        error: "Institute not found",
        performance: p.done(this.docs.size, 0),
      };

    console.log(`[INSTITUTE] ${instSlug}`);

    return {
      id: doc._id.toString(),
      slug: doc._slug,
      name: doc.name,
      shortName: doc.shortName,
      logo: doc.logo,
      coverImage: doc.coverImage,
      type: doc.type,
      establishedYear: doc.establishedYear,

      // Description (from faculty_student_ratio or overview)
      description: doc._desc,

      location: doc.location,
      contact: doc.contact,

      accreditation: doc.accreditation,
      rankings: doc.rankings,
      overview: doc.overview,

      academicOverview: {
        totalCourses: doc._courses,
        totalFacilities: doc.campusDetails?.facilities_arr?.length || 0,
        facilities: doc.campusDetails?.facilities_arr,
      },

      topRecruiters: doc.placements?.topRecruiters,

      // All programmes with all courses
      programmes: doc.programmes?.map((pr) => ({
        name: pr.name,
        slug: slug(pr.name),
        courseCount: pr.course?.length || pr.courseCount || 0,
        eligibilityExams: pr.eligibilityExams,
        placementRating: pr.placementRating,
        url: `/recommendation-collections/${doc._slug}?programme=${slug(pr.name)}`,
        courses: pr.course?.map((c) => ({
          id: c._id?.toString(),
          name: c.degree,
          slug: slug(c.degree),
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
          url: `/recommendation-collections/${doc._slug}?programme=${slug(pr.name)}&course=${slug(c.degree)}`,
        })),
      })),

      // Raw data for advanced frontend use
      raw: {
        campusDetails: doc.campusDetails,
        admissions: doc.admissions,
        placements: doc.placements,
        researchAndInnovation: doc.researchAndInnovation,
        alumniNetwork: doc.alumniNetwork,
        faculty_student_ratio: doc.faculty_student_ratio,
      },

      performance: p.done(this.docs.size, 1),
    };
  }

  // ═══════════════════════════════════════════════════════════
  // API 4: EXPLORE - Browse all institutes with filters
  // Called when: landing on explore page or applying filters
  // ═══════════════════════════════════════════════════════════
  explore({
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
    sortBy = "name", // name, courses, established
    sortOrder = "asc", // asc, desc
  }) {
    const p = new Perf();
    const skip = (page - 1) * limit;

    // Start with all institutes
    let ids = new Set(this.docs.keys());

    // Apply filters
    if (city) ids = this.idx.and(ids, this.idx.get("city", city));
    if (state) ids = this.idx.and(ids, this.idx.get("state", state));
    if (type) ids = this.idx.and(ids, this.idx.get("type", type));
    if (level) ids = this.idx.and(ids, this.idx.get("level", level));
    if (programme)
      ids = this.idx.and(ids, this.idx.get("programme", programme));
    if (exam) ids = this.idx.and(ids, this.idx.get("exam", exam));
    if (course) ids = this.idx.and(ids, this.idx.get("course", course));

    // Build institutes array
    let institutes = [...ids]
      .map((id) => {
        const d = this.docs.get(id);
        if (!d) return null;

        // Accreditation filter (client-side for now, can optimize later)
        if (accreditation) {
          const grade = d.accreditation?.naac?.grade;
          if (accreditation === "none" && grade) return null;
          if (accreditation !== "none" && grade !== accreditation) return null;
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
            ? d._desc.substring(0, 350) + (d._desc.length > 350 ? "..." : "")
            : null,
          topRecruiters: d.placements?.topRecruiters?.slice(0, 6),
          programmes: d.programmes?.slice(0, 3).map((pr) => ({
            name: pr.name,
            slug: slug(pr.name),
            courseCount: pr.course?.length || pr.courseCount || 0,
            eligibilityExams: pr.eligibilityExams?.slice(0, 4),
            placementRating: pr.placementRating,
            sampleCourses: pr.course?.slice(0, 2).map((c) => ({
              name: c.degree,
              duration: c.duration,
              fee: c.fees?.totalFee,
              feeF: fee(c.fees?.totalFee),
            })),
            moreCourses: Math.max(0, (pr.course?.length || 0) - 2),
            url: `/recommendation-collections/${d._slug}?programme=${slug(pr.name)}`,
          })),
          moreProgrammes: Math.max(0, (d.programmes?.length || 0) - 3),
        };
      })
      .filter(Boolean);

    // Sort
    institutes.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case "courses":
          compareValue = (a.totalCourses || 0) - (b.totalCourses || 0);
          break;
        case "established":
          compareValue = (a.establishedYear || 0) - (b.establishedYear || 0);
          break;
        case "name":
        default:
          compareValue = (a.name || "").localeCompare(b.name || "");
          break;
      }

      return sortOrder === "desc" ? -compareValue : compareValue;
    });

    const total = institutes.length;

    // Get available filter options based on current results
    const filterCounts = {
      cities: this.idx.counts("city", ids),
      states: this.idx.counts("state", ids),
      types: this.idx.counts("type", ids),
      levels: this.idx.counts("level", ids),
      programmes: this.idx.counts("programme", ids),
      exams: this.idx.counts("exam", ids),
      courses: this.idx.counts("course", ids),
    };

    // Accreditation counts (manual since not indexed)
    const accreditationCounts = {};
    for (const id of ids) {
      const d = this.docs.get(id);
      const grade = d?.accreditation?.naac?.grade;
      const key = grade || "none";
      accreditationCounts[key] = (accreditationCounts[key] || 0) + 1;
    }
    filterCounts.accreditations = accreditationCounts;

    // Paginate
    const paginatedInstitutes = institutes.slice(skip, skip + limit);

    console.log(
      `[EXPLORE] filters=${Object.keys({ city, state, type, level, programme, exam, course, accreditation }).filter((k) => eval(k)).length} → ${total} institutes (page ${page}/${Math.ceil(total / limit)})`,
    );

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
      },
      filterCounts,
      sort: { sortBy, sortOrder },
      pagination: {
        page: +page,
        limit: +limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
      institutes: paginatedInstitutes,
      performance: p.done(this.docs.size, total),
    };
  }

  stats() {
    return {
      documents: this.docs.size,
      ...this.stats,
      indexes: Object.fromEntries(
        Object.entries(this.idx.m).map(([k, m]) => [k, m.size]),
      ),
      tries: {
        institutes: this.trie.i.n,
        programmes: this.trie.p.n,
        courses: this.trie.c.n,
      },
    };
  }
}

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
const engine = new Engine();

// ═══════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════

// 1. SUGGEST - Fast autocomplete dropdown
app.get("/api/suggest", (req, res) => {
  const { q, limit = 8 } = req.query;
  console.log(`\n[API] GET /api/suggest?q=${q}`);
  if (!q) return res.status(400).json({ error: "q required" });
  res.json(engine.suggest(q, +limit));
});

// 2. SEARCH - Full results + filters + pagination
app.get("/api/search", (req, res) => {
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
    limit = 20,
  } = req.query;
  console.log(`\n[API] GET /api/search`, req.query);
  res.json(
    engine.search({
      q,
      type,
      city,
      state,
      level,
      programme,
      exam,
      course,
      page: +page,
      limit: +limit,
    }),
  );
});

// 3. INSTITUTE - Full document
app.get("/api/institute/:slug", (req, res) => {
  console.log(`\n[API] GET /api/institute/${req.params.slug}`);
  const r = engine.institute(req.params.slug);
  if (r.error) return res.status(404).json(r);
  res.json(r);
});

// 4. EXPLORE - Browse all institutes with filters + pagination
app.get("/api/explore", (req, res) => {
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
    sortBy = "name",
    sortOrder = "asc",
  } = req.query;
  console.log(`\n[API] GET /api/explore`, req.query);
  res.json(
    engine.explore({
      city,
      state,
      type,
      level,
      programme,
      exam,
      course,
      accreditation,
      page: +page,
      limit: +limit,
      sortBy,
      sortOrder,
    }),
  );
});

// 5. STATS
app.get("/api/stats", (req, res) => res.json(engine.stats()));

// ═══════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════
async function start() {
  console.log(
    "\n╔══════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║       CAREERBOX SEARCH API v3.1 - PRODUCTION READY          ║",
  );
  console.log(
    "║       O(1) Hash + O(k) Trie | Nanosecond Precision          ║",
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════╝\n",
  );

  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    console.log(`[DB] Connected: ${DB_NAME}.${COLLECTION_NAME}`);

    await engine.build(db);

    app.listen(3000, () => {
      console.log("[SERVER] http://localhost:3000\n");
      console.log(
        "╔══════════════════════════════════════════════════════════════╗",
      );
      console.log(
        "║  ENDPOINTS                                                   ║",
      );
      console.log(
        "╠══════════════════════════════════════════════════════════════╣",
      );
      console.log(
        "║                                                              ║",
      );
      console.log(
        "║  1. SUGGEST (autocomplete dropdown - lightning fast)         ║",
      );
      console.log(
        "║     GET /api/suggest?q=par                                   ║",
      );
      console.log(
        "║     → Returns: name, logo, location, type badge only         ║",
      );
      console.log(
        "║                                                              ║",
      );
      console.log(
        "║  2. SEARCH (click suggestion / enter / apply filters)        ║",
      );
      console.log(
        "║     GET /api/search?q=parul&type=programme                   ║",
      );
      console.log(
        "║     GET /api/search?q=engineering+college&type=institute     ║",
      );
      console.log(
        "║     GET /api/search?city=Vadodara&programme=B.E.+/+B.Tech    ║",
      );
      console.log(
        "║     → Returns: full data, filter counts, pagination          ║",
      );
      console.log(
        "║                                                              ║",
      );
      console.log(
        "║  3. INSTITUTE (full detail page)                             ║",
      );
      console.log(
        "║     GET /api/institute/parul-university                      ║",
      );
      console.log(
        "║     → Returns: complete document with all programmes/courses ║",
      );
      console.log(
        "║                                                              ║",
      );
      console.log(
        "║  4. EXPLORE (browse all with filters + sorting)              ║",
      );
      console.log(
        "║     GET /api/explore                                         ║",
      );
      console.log(
        "║     GET /api/explore?city=Ahmedabad&type=Private             ║",
      );
      console.log(
        "║     GET /api/explore?sortBy=courses&sortOrder=desc           ║",
      );
      console.log(
        "║     → Returns: institutes, filters, pagination, sorting      ║",
      );
      console.log(
        "║                                                              ║",
      );
      console.log(
        "╚══════════════════════════════════════════════════════════════╝\n",
      );
    });
  } catch (e) {
    console.error("[FATAL]", e);
    process.exit(1);
  }
}

start();
