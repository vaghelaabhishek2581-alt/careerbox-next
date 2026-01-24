import { connectToDatabase } from '@/lib/db/mongodb'

const COLLECTION_NAME = 'admininstitutes'

const slug = (t: any) =>
  t
    ? t
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    : ''
const fee = (f: any) => (f ? `₹${f.toLocaleString('en-IN')}` : null)

const getDesc = (doc: any) => {
  const s = doc?.faculty_student_ratio?.students
  if (Array.isArray(s)) {
    const d = s.find((x: any) => x.key === 'description')
    if (d?.value) return d.value
  }
  return doc?.overview?.about || null
}

class Perf {
  constructor () {
    this.t0 = process.hrtime.bigint()
  }
  done (total: number, found: number) {
    const ns = Number(process.hrtime.bigint() - this.t0)
    const ms = ns / 1e6,
      sec = ns / 1e9
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

class Trie {
  constructor () {
    this.root = { c: {}, d: [] }
    this.n = 0
  }

  add (text: string, data: any) {
    if (!text) return
    let node = this.root
    for (const ch of text.toLowerCase()) {
      if (!node.c[ch]) node.c[ch] = { c: {}, d: [] }
      node = node.c[ch]
      if (node.d.length < 50 && !node.d.some((x: any) => x._k === data._k))
        node.d.push(data)
    }
    this.n++
  }

  find (q: string, lim = 10) {
    let node = this.root
    for (const ch of q.toLowerCase()) {
      if (!node.c[ch]) return []
      node = node.c[ch]
    }
    return node.d.slice(0, lim)
  }
}

class Index {
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

  add (k: string, v: any, id: string) {
    if (!v) return
    const m = this.m[k],
      key = v.toString().toLowerCase().trim()
    if (!m.has(key)) m.set(key, new Set())
    m.get(key).add(id)
  }

  get (k: string, v: any) {
    return v
      ? this.m[k]?.get(v.toString().toLowerCase().trim()) || new Set()
      : new Set()
  }

  and (a: Set<any>, b: Set<any>) {
    if (!b?.size) return a
    if (!a?.size) return new Set()
    const [s, l] = a.size <= b.size ? [a, b] : [b, a]
    return new Set([...s].filter(x => l.has(x)))
  }

  or (...sets: Set<any>[]) {
    const r = new Set()
    for (const s of sets) if (s) for (const i of s) r.add(i)
    return r
  }

  counts (k: string, ids: Set<any>) {
    const r: any = {}
    for (const [v, set] of this.m[k]) {
      const c = [...set].filter(id => ids.has(id)).length
      if (c > 0) r[v] = c
    }
    return r
  }
}

const KW = {
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

const extractKW = (t: any) => {
  if (!t) return []
  const words = t.toLowerCase().split(/\s+/),
    kw = new Set()
  for (const w of words) {
    if (KW[w]) kw.add(w)
    for (const [k, vs] of Object.entries(KW)) {
      if (vs.some(v => w.includes(v) || v.includes(w))) kw.add(k)
    }
  }
  return [...kw]
}

class Engine {
  constructor () {
    this.trie = { i: new Trie(), p: new Trie(), c: new Trie() }
    this.idx = new Index()
    this.docs = new Map()
    this.progs = []
    this.crses = []
    this.stats = { institutes: 0, programmes: 0, courses: 0 }
  }

  async build (db: any) {
    const t0 = Date.now()
    console.log('\n' + '═'.repeat(60))
    console.log('  BUILDING INDEX')
    console.log('═'.repeat(60))

    const data = await db.collection(COLLECTION_NAME).find({}).toArray()
    console.log(`  Documents: ${data.length}`)

    for (const doc of data) {
      const id = doc._id.toString()
      const iSlug = doc.slug || slug(doc.name)
      const desc = getDesc(doc)

      doc._slug = iSlug
      doc._desc = desc
      doc._courses = 0
      this.docs.set(id, doc)

      if (!doc.name) continue

      const iSug = {
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
      for (const kw of extractKW(doc.name + ' ' + (doc.type || '')))
        this.idx.add('keyword', kw, id)

      this.stats.institutes++

      if (!doc.programmes) continue

      for (const prog of doc.programmes) {
        if (!prog.name) continue
        const pSlug = slug(prog.name)
        const pCnt = prog.course?.length || prog.courseCount || 0

        const pSug = {
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

        const pFull = {
          ...pSug,
          city: doc.location?.city,
          state: doc.location?.state,
          courseCount: pCnt,
          eligibilityExams: prog.eligibilityExams || [],
          placementRating: prog.placementRating,
          sampleCourses: prog.course?.slice(0, 2).map((c: any) => ({
            name: c.degree,
            slug: slug(c.degree),
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

          const cSug = {
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

          doc._courses++
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

  suggest (q: any, limit = 8) {
    const p = new Perf()
    if (!q?.trim())
      return {
        institutes: [],
        programmes: [],
        courses: [],
        performance: p.done(0, 0)
      }

    const query = q.trim()

    let insts = this.trie.i.find(query, limit)
    let progs = this.trie.p.find(query, limit)
    let crses = this.trie.c.find(query, limit)

    const kws = extractKW(query)
    if (kws.length && !insts.length) {
      let ids: any = new Set()
      for (const kw of kws) ids = this.idx.or(ids, this.idx.get('keyword', kw))

      insts = [...ids]
        .slice(0, limit)
        .map((id: any) => {
          const d = this.docs.get(id)
          return d
            ? {
                _k: `i-${id}`,
                type: 'Institute',
                id,
                slug: d._slug,
                name: d.name,
                logo: d.logo,
                city: d.location?.city,
                state: d.location?.state
              }
            : null
        })
        .filter(Boolean)

      if (!progs.length)
        progs = this.progs.filter((x: any) => ids.has(x.id)).slice(0, limit)
      if (!crses.length)
        crses = this.crses.filter((x: any) => ids.has(x.id)).slice(0, limit)
    }

    const total = insts.length + progs.length + crses.length
    console.log(
      `[SUGGEST] "${q}" → ${insts.length}I/${progs.length}P/${crses.length}C`
    )

    return {
      query: q,
      keywords: kws,
      institutes: insts.map((i: any) => ({
        type: 'Institute',
        id: i.id,
        slug: i.slug,
        name: i.name,
        logo: i.logo,
        location: [i.city, i.state].filter(Boolean).join(', ')
      })),
      programmes: progs.map((p: any) => ({
        type: 'Program',
        id: p.id,
        slug: p.slug,
        pSlug: p.pSlug,
        name: p.name,
        institute: p.institute,
        logo: p.logo
      })),
      courses: crses.map((c: any) => ({
        type: 'Course',
        id: c.id,
        slug: c.slug,
        pSlug: c.pSlug,
        cSlug: c.cSlug,
        name: c.name,
        programme: c.programme,
        institute: c.institute,
        logo: c.logo,
        programmeDetails: c.programmeDetails
      })),
      performance: p.done(this.docs.size, total)
    }
  }

  search ({
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
  }: any) {
    const p = new Perf()
    const skip = (page - 1) * limit

    let ids = new Set(this.docs.keys())
    const splitValues = (value: any) =>
      value
        ? value
            .toString()
            .split(/,|\band\b|&/i)
            .map(v => v.trim())
            .filter(Boolean)
        : []
    const orValues = (key: string, value: any) => {
      const values = splitValues(value)
      if (!values.length) return new Set()
      return this.idx.or(...values.map((v: any) => this.idx.get(key, v)))
    }

    const kws = q ? extractKW(q) : []
    if (kws.length) {
      let kwIds: any = new Set()
      for (const kw of kws)
        kwIds = this.idx.or(kwIds, this.idx.get('keyword', kw))
      if (kwIds.size) ids = this.idx.and(ids, kwIds)
    } else if (q?.trim()) {
      const tr = [
        ...this.trie.i.find(q, 500),
        ...this.trie.p.find(q, 500),
        ...this.trie.c.find(q, 500)
      ]
      const trIds = new Set(tr.map((x: any) => x.id))
      if (trIds.size) ids = this.idx.and(ids, trIds)
    }

    if (city) ids = this.idx.and(ids, orValues('city', city))
    if (state) ids = this.idx.and(ids, orValues('state', state))
    if (level) ids = this.idx.and(ids, this.idx.get('level', level))
    if (programme) ids = this.idx.and(ids, this.idx.get('programme', programme))
    if (exam) ids = this.idx.and(ids, this.idx.get('exam', exam))
    if (course) ids = this.idx.and(ids, this.idx.get('course', course))

    let institutes: any = [],
      programmes: any = [],
      courses: any = []

    if (!type || type === 'institute') {
      institutes = [...ids]
        .map((id: any) => {
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
            programmes: d.programmes?.slice(0, 3).map((pr: any) => ({
              name: pr.name,
              slug: slug(pr.name),
              courseCount: pr.course?.length || pr.courseCount || 0,
              eligibilityExams: pr.eligibilityExams?.slice(0, 4),
              placementRating: pr.placementRating,
              sampleCourses: pr.course?.slice(0, 2).map((c: any) => ({
                name: c.degree,
                duration: c.duration,
                fee: c.fees?.totalFee,
                feeF: fee(c.fees?.totalFee)
              })),
              moreCourses: Math.max(0, (pr.course?.length || 0) - 2),
              url: `/recommendation-collections/${d._slug}?programme=${slug(
                pr.name
              )}`
            })),
            moreProgrammes: Math.max(0, (d.programmes?.length || 0) - 3)
          }
        })
        .filter(Boolean)
    }

    if (!type || type === 'programme') {
      programmes = this.progs.filter((x: any) => ids.has(x.id))
    }

    if (!type || type === 'course') {
      courses = this.crses.filter((x: any) => ids.has(x.id))
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

  institute (instSlug: any) {
    const p = new Perf()

    let doc: any = null
    for (const [, d] of this.docs) {
      if (d._slug === instSlug || d.slug === instSlug) {
        doc = d
        break
      }
    }

    if (!doc)
      return {
        error: 'Institute not found',
        performance: p.done(this.docs.size, 0)
      }

    console.log(`[INSTITUTE] ${instSlug}`)

    return {
      id: doc._id.toString(),
      slug: doc._slug,
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
      programmes: doc.programmes?.map((pr: any) => ({
        name: pr.name,
        slug: slug(pr.name),
        courseCount: pr.course?.length || pr.courseCount || 0,
        eligibilityExams: pr.eligibilityExams,
        placementRating: pr.placementRating,
        url: `/recommendation-collections/${doc._slug}?programme=${slug(
          pr.name
        )}`,
        courses: pr.course?.map((c: any) => ({
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
          url: `/recommendation-collections/${doc._slug}?programme=${slug(
            pr.name
          )}&course=${slug(c.degree)}`
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

  explore ({
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
  }: any) {
    const p = new Perf()
    const skip = (page - 1) * limit

    let ids = new Set(this.docs.keys())
    const splitValues = (value: any) =>
      value
        ? value
            .toString()
            .split(/,|\band\b|&/i)
            .map(v => v.trim())
            .filter(Boolean)
        : []
    const orValues = (key: string, value: any) => {
      const values = splitValues(value)
      if (!values.length) return new Set()
      return this.idx.or(...values.map((v: any) => this.idx.get(key, v)))
    }

    if (city) ids = this.idx.and(ids, orValues('city', city))
    if (state) ids = this.idx.and(ids, orValues('state', state))
    if (type) ids = this.idx.and(ids, this.idx.get('type', type))
    if (level) ids = this.idx.and(ids, this.idx.get('level', level))
    if (programme) ids = this.idx.and(ids, this.idx.get('programme', programme))
    if (exam) ids = this.idx.and(ids, this.idx.get('exam', exam))
    if (course) ids = this.idx.and(ids, this.idx.get('course', course))

    let institutes = [...ids]
      .map((id: any) => {
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
          programmes: d.programmes?.slice(0, 3).map((pr: any) => ({
            name: pr.name,
            slug: slug(pr.name),
            courseCount: pr.course?.length || pr.courseCount || 0,
            eligibilityExams: pr.eligibilityExams?.slice(0, 4),
            placementRating: pr.placementRating,
            sampleCourses: pr.course?.slice(0, 2).map((c: any) => ({
              name: c.degree,
              duration: c.duration,
              fee: c.fees?.totalFee,
              feeF: fee(c.fees?.totalFee)
            })),
            moreCourses: Math.max(0, (pr.course?.length || 0) - 2),
            url: `/recommendation-collections/${d._slug}?programme=${slug(
              pr.name
            )}`
          })),
          moreProgrammes: Math.max(0, (d.programmes?.length || 0) - 3)
        }
      })
      .filter(Boolean)

    institutes.sort((a: any, b: any) => {
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

    const filterCounts: any = {
      cities: this.idx.counts('city', ids),
      states: this.idx.counts('state', ids),
      types: this.idx.counts('type', ids),
      levels: this.idx.counts('level', ids),
      programmes: this.idx.counts('programme', ids),
      exams: this.idx.counts('exam', ids),
      courses: this.idx.counts('course', ids)
    }

    const accreditationCounts: any = {}
    for (const id of ids) {
      const d = this.docs.get(id)
      const grade = d?.accreditation?.naac?.grade
      const key = grade || 'none'
      accreditationCounts[key] = (accreditationCounts[key] || 0) + 1
    }
    filterCounts.accreditations = accreditationCounts

    const paginatedInstitutes = institutes.slice(skip, skip + limit)

    console.log(
      `[EXPLORE] filters=${
        Object.keys({
          city,
          state,
          type,
          level,
          programme,
          exam,
          course,
          accreditation
        }).filter(k => eval(k)).length
      } → ${total} institutes (page ${page}/${Math.ceil(total / limit)})`
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

  stats () {
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

declare global {
  var searchEngine: any
  var searchEngineInit: any
}

const engine = global.searchEngine || new Engine()
global.searchEngine = engine

export const initSearchEngine = async () => {
  if (!global.searchEngineInit) {
    global.searchEngineInit = (async () => {
      const { db } = await connectToDatabase()
      await engine.build(db)
    })()
  }
  return global.searchEngineInit
}

export default engine
