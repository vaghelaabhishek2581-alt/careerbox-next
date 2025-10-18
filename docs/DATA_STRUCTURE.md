# CareerBox Data Structure Documentation

## Database Schema (AdminInstitute Collection)

### Institute Document Structure

```json
{
  "_id": { "$oid": "..." },
  "id": "adani-university",
  "slug": "adani-university",
  "name": "Adani University",
  "shortName": "Adani University",
  "establishedYear": null,
  "type": null,
  "status": null,
  "logo": "https://...",
  "coverImage": "https://...",
  "website": "https://...",
  
  "accreditation": {
    "naac": {
      "grade": "None",
      "category": "NAAC None",
      "cgpa": null,
      "validUntil": "",
      "cycleNumber": null
    },
    "nirf": {
      "overallRank": null,
      "universityRank": null,
      "managementRank": null,
      "year": 2025
    },
    "ugc": {
      "recognition": null
    }
  },
  
  "location": {
    "address": "...",
    "city": "Ahmedabad",
    "state": "Gujarat",
    "pincode": null,
    "country": "India",
    "coordinates": {
      "latitude": null,
      "longitude": null
    },
    "nearbyLandmarks": []
  },
  
  "contact": {
    "phone": ["8980805306", "9998861340"],
    "email": "info@aii.ac.in",
    "website": "https://...",
    "admissionsEmail": "admissions.fest@adaniuni.ac.in"
  },
  
  "overview": {
    "description": null,
    "vision": "...",
    "mission": "...",
    "motto": "Knowledge is Light",
    "founder": null,
    "chancellor": null,
    "viceChancellor": null,
    "stats": []
  },
  
  "campusDetails": {
    "campusType": null,
    "environment": null,
    "totalArea": null,
    "facilities": {
      "academic": [],
      "residential": [],
      "recreational": [],
      "support": []
    }
  },
  
  "academics": {
    "totalStudents": null,
    "totalFaculty": null,
    "studentFacultyRatio": null,
    "internationalStudents": null,
    "totalPrograms": null,
    "totalCourses": null,
    "schools": [
      {
        "name": "Adani University-FMS",
        "established": 2009,
        "programs": []
      }
    ]
  },
  
  "admissions": {
    "admissionProcess": [],
    "reservationPolicy": null
  },
  
  "placements": {
    "overview": {
      "overallPlacementRate": null,
      "averageSalary": null,
      "highestSalary": null,
      "medianSalary": null,
      "companiesVisited": null,
      "totalOffers": null
    },
    "topRecruiters": ["Adani Group", "Flipkart", "Deloitte", ...],
    "sectors": []
  },
  
  "rankings": {
    "national": [{}],
    "international": [],
    "rankingsDescription": null
  },
  
  "researchAndInnovation": {
    "researchCenters": null,
    "patentsFiled": null,
    "publicationsPerYear": null,
    "researchFunding": null,
    "phdScholars": null,
    "incubationCenter": {
      "name": null,
      "startupsFunded": null,
      "totalFunding": null
    },
    "collaborations": []
  },
  
  "alumniNetwork": {
    "totalAlumni": null,
    "notableAlumni": [],
    "alumniInFortune500": null,
    "entrepreneursCreated": null
  },
  
  "awards": [],
  
  "mediaGallery": {
    "photos": {
      "Campus View": ["https://..."],
      "Labs": ["https://...", "https://..."],
      "Auditorium": ["https://..."]
    },
    "videos": [
      {
        "url": "https://www.youtube.com/v/...",
        "title": "Adani University",
        "thumbnail": "https://i.ytimg.com/vi/.../default.jpg"
      }
    ]
  },
  
  "programmes": [
    {
      "_id": { "$oid": "..." },
      "name": "B.E. / B.Tech",
      "courseCount": 6,
      "placementRating": 24,
      "eligibilityExams": ["GUJCET", "JEE Main", "CUET"],
      "course": [
        {
          "_id": { "$oid": "..." },
          "name": "B.E. / B.Tech",
          "degree": "B.Tech. in Computer Science and Engineering (AI & ML)",
          "school": null,
          "duration": "4 years",
          "level": "UG",
          "category": null,
          "totalSeats": 0,
          "fees": {
            "tuitionFee": 727600,
            "totalFee": 727600,
            "currency": "INR"
          },
          "brochure": {
            "url": "https://..."
          },
          "seoUrl": "https://...",
          "location": {
            "state": "Gujarat",
            "city": "Ahmedabad",
            "locality": null
          },
          "educationType": "Full Time",
          "deliveryMethod": "Classroom",
          "courseLevel": "UG",
          "affiliatedUniversity": "Adani University",
          "recognition": [],
          "placements": {
            "averagePackage": null,
            "highestPackage": null,
            "placementRate": null,
            "topRecruiters": []
          },
          "eligibilityExams": ["CUET", "JEE Main", "GUJCET"]
        }
      ]
    }
  ],
  
  "createdAt": { "$date": "2025-10-17T17:53:56.345Z" },
  "updatedAt": { "$date": "2025-10-17T17:53:56.345Z" },
  "__v": 0
}
```

## UI Data Transformation

### For InstituteCard Component

```typescript
{
  id: "adani-university",
  slug: "adani-university",
  name: "Adani University",
  logo: "https://...",
  location: {
    city: "Ahmedabad",
    state: "Gujarat"
  },
  type: null,
  overview: {
    description: null
  },
  campusDetails: {
    totalStudents: null
  },
  academics: {
    totalCourses: null,
    totalPrograms: null
  },
  accreditation: {
    nirf: {
      overallRank: null
    }
  }
}
```

### For ProgramCard Component

```typescript
{
  id: "be-btech-adani",
  name: "B.E. / B.Tech",
  courseCount: 6,
  placementRating: 24,
  eligibilityExams: ["GUJCET", "JEE Main", "CUET"],
  institute: {
    name: "Adani University",
    slug: "adani-university",
    logo: "https://...",
    location: {
      city: "Ahmedabad",
      state: "Gujarat"
    }
  }
}
```

### For CourseCard Component

```typescript
{
  id: "btech-cs-ai-ml",
  name: "B.E. / B.Tech",
  degree: "B.Tech. in Computer Science and Engineering (AI & ML)",
  duration: "4 years",
  level: "UG",
  fees: {
    amount: 727600,
    currency: "INR"
  },
  institute: {
    name: "Adani University",
    slug: "adani-university",
    location: {
      city: "Ahmedabad",
      state: "Gujarat"
    }
  },
  category: null,
  eligibilityExams: ["CUET", "JEE Main", "GUJCET"]
}
```

## Important Notes

### Null Handling
- Many fields are `null` instead of undefined
- Always use optional chaining (`?.`) and nullish coalescing (`??`)
- Display "N/A" or hide sections when data is null

### ID Fields
- Primary key: `slug` (string)
- MongoDB ID: `_id.$oid` (ObjectId)
- Legacy ID: `id` (string, same as slug)

### Nested Arrays
- `programmes[]` contains programs
- `programmes[].course[]` contains courses
- Each has its own `_id` ObjectId

### Common Null Fields
```typescript
// Often null in database:
- establishedYear
- type
- status
- overview.description
- campusDetails.totalStudents
- academics.totalFaculty
- placements.overview.averageSalary
- accreditation.nirf.overallRank
```

### Data Validation
```typescript
// Safe access patterns:
const city = institute.location?.city || 'N/A'
const students = institute.campusDetails?.totalStudents || 0
const rank = institute.accreditation?.nirf?.overallRank || null
const description = institute.overview?.description || 'No description available'
```

## Filter Data Structure

```typescript
{
  locations: [
    { value: "Mumbai", label: "Mumbai", count: 45 },
    { value: "Delhi", label: "Delhi", count: 38 }
  ],
  types: [
    { value: "Private", label: "Private", count: 120 },
    { value: "Government", label: "Government", count: 85 }
  ],
  categories: [
    { value: "Engineering", label: "Engineering", count: 200 },
    { value: "Management", label: "Management", count: 150 }
  ],
  accreditations: [
    { value: "NAAC A+", label: "NAAC A+", count: 50 }
  ],
  degrees: [
    { value: "B.Tech", label: "B.Tech", count: 300 }
  ]
}
```

## API Response Structure

```typescript
{
  institutes: Institute[],
  programs: ProgramResult[],
  courses: UiCourse[],
  filters: FilterOptions,
  total: number,
  currentPage: number,
  totalPages: number,
  pageSize: number
}
```
