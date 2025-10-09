'use server'

import { cache } from 'react'
import { Institute, Course, InstituteSearchParams, InstituteSearchResult, CourseSearchParams, CourseSearchResult, EntityType } from '@/types/institute'

// Mock data - Nirma University from your example
const mockInstitutes: Institute[] = [
  {
    id: "nirma-university",
    name: "Nirma University",
    shortName: "NU",
    slug: "nirma-university",
    establishedYear: 2003,
    type: "Private",
    status: "University",
    logo: "https://upload.wikimedia.org/wikipedia/en/8/83/Nirma_University_Logo.png",
    coverImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLQHjqdfwG6Qin2RApYDY31D_7Nip8fxhBTw&s",
    accreditation: {
      naac: {
        grade: "A+",
        cgpa: 3.65,
        validUntil: "2027",
        cycleNumber: 2
      },
      nirf: {
        overallRank: 64,
        engineeringRank: 48,
        managementRank: 52,
        year: 2023
      },
      ugc: {
        recognition: "Recognized",
        section: "Section 3"
      },
      aicte: {
        approved: true,
        validUntil: "2024-25"
      }
    },
    location: {
      address: "Nirma University Road, Gota",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "382481",
      country: "India",
      coordinates: {
        latitude: 23.1291,
        longitude: 72.5448
      },
      nearbyLandmarks: [
        "Gota BRTS Station - 2 km",
        "Keshavnagar - 3 km",
        "Gandhinagar - 25 km",
        "Ahmedabad Airport - 20 km"
      ]
    },
    contact: {
      phone: ["+91-2717-241901", "+91-2717-241902"],
      email: "info@nirmauni.ac.in",
      website: "https://nirmauni.ac.in",
      fax: "+91-2717-241905",
      emergencyContact: "+91-2717-241900"
    },
    overview: {
      description: "Nirma University is a premier private university in Gujarat, established in 2003 by the Nirma Education and Research Foundation. Known for its excellence in engineering, management, law, and other disciplines, the university offers a comprehensive educational experience with state-of-the-art infrastructure and industry-oriented curriculum.",
      vision: "To be a globally recognized university fostering excellence in education, research, and innovation while developing ethical leaders and responsible citizens.",
      mission: "To provide world-class education through innovative teaching methodologies, cutting-edge research, industry partnerships, and holistic development of students, preparing them to meet global challenges and contribute to society.",
      motto: "Knowledge is Power",
      founder: "Dr. Karsanbhai K. Patel",
      chancellor: "Dr. Karsanbhai K. Patel",
      viceChancellor: "Dr. Anup Kumar Singh"
    },
    campusDetails: {
      totalArea: "120 acres",
      builtUpArea: "2.5 million sq ft",
      campusType: "Residential",
      environment: "Green Campus with sustainable practices",
      facilities: {
        academic: [
          "40+ Smart Classrooms",
          "Advanced Laboratories",
          "Central Library with 2.5 lakh books",
          "Digital Library",
          "Research Centers",
          "Conference Halls",
          "Seminar Rooms",
          "Amphitheatre"
        ],
        residential: [
          "8 Boys Hostels (3000+ capacity)",
          "4 Girls Hostels (1500+ capacity)",
          "Faculty Quarters",
          "Guest House",
          "Mess Facilities",
          "Common Rooms",
          "Study Halls"
        ],
        recreational: [
          "Sports Complex",
          "Swimming Pool",
          "Gymnasium",
          "Cricket Ground",
          "Football Field",
          "Basketball Courts",
          "Tennis Courts",
          "Indoor Games",
          "Student Activity Center"
        ],
        support: [
          "Medical Center",
          "Banking Facilities",
          "ATMs",
          "Cafeterias",
          "Food Courts",
          "Stationery Shop",
          "Transportation",
          "Security Services",
          "WiFi Campus"
        ]
      }
    },
    academics: {
      totalStudents: 8500,
      totalFaculty: 650,
      studentFacultyRatio: "13:1",
      internationalStudents: 180,
      totalPrograms: 45,
      institutes: [
        {
          name: "Institute of Technology",
          established: 2000,
          programs: ["B.Tech", "M.Tech", "PhD"]
        },
        {
          name: "Institute of Management",
          established: 2001,
          programs: ["MBA", "PGDM", "PhD"]
        },
        {
          name: "Institute of Law",
          established: 2007,
          programs: ["BA LLB", "BBA LLB", "LLM", "PhD"]
        },
        {
          name: "Institute of Pharmacy",
          established: 2004,
          programs: ["B.Pharm", "M.Pharm", "PhD"]
        },
        {
          name: "Institute of Science",
          established: 2003,
          programs: ["B.Sc", "M.Sc", "PhD"]
        }
      ]
    },
    admissions: {
      applicationDeadline: "2024-06-30",
      entranceExams: {
        engineering: ["JEE Main", "GUJCET", "NUAT"],
        management: ["CAT", "XAT", "CMAT", "GMAT"],
        law: ["CLAT", "LSAT"],
        pharmacy: ["NEET", "GPAT"]
      },
      admissionProcess: [
        "Online Application",
        "Entrance Exam Score",
        "Document Verification",
        "Counseling Process",
        "Seat Allocation",
        "Fee Payment",
        "Admission Confirmation"
      ],
      reservationPolicy: {
        sc: "15%",
        st: "7.5%",
        obc: "27%",
        ews: "10%",
        pwd: "5%"
      }
    },
    placements: {
      "2023": {
        overallPlacementRate: "95%",
        averageSalary: "8.5 LPA",
        highestSalary: "55 LPA",
        medianSalary: "7.2 LPA",
        companiesVisited: 350,
        totalOffers: 4200,
        topRecruiters: [
          "Microsoft", "Amazon", "Google", "TCS", "Infosys",
          "Wipro", "Accenture", "Deloitte", "L&T", "Reliance"
        ]
      },
      sectors: [
        "IT & Software - 45%",
        "Core Engineering - 25%",
        "Consulting - 15%",
        "Finance - 10%",
        "Others - 5%"
      ]
    },
    rankings: {
      national: [
        {
          agency: "NIRF",
          category: "Overall",
          rank: 64,
          year: 2023
        },
        {
          agency: "NIRF",
          category: "Engineering",
          rank: 48,
          year: 2023
        },
        {
          agency: "India Today",
          category: "Engineering",
          rank: 35,
          year: 2023
        }
      ],
      international: [
        {
          agency: "QS World University Rankings",
          category: "Overall",
          rank: "751-800",
          year: 2023
        },
        {
          agency: "Times Higher Education",
          category: "Overall",
          rank: "801-1000",
          year: 2023
        }
      ]
    },
    researchAndInnovation: {
      researchCenters: 15,
      patentsFiled: 120,
      publicationsPerYear: 800,
      researchFunding: "50 Crores",
      phdScholars: 400,
      incubationCenter: {
        name: "Nirma University Business Incubator",
        startupsFunded: 45,
        totalFunding: "15 Crores"
      },
      collaborations: [
        "IITs", "IIMs", "DRDO", "ISRO", "International Universities"
      ]
    },
    alumniNetwork: {
      totalAlumni: 25000,
      notableAlumni: [
        "Rahul Sharma - CEO, TechCorp",
        "Priya Patel - Senior Manager, Microsoft",
        "Amit Kumar - Founder, StartupXYZ"
      ],
      alumniInFortune500: 150,
      entrepreneursCreated: 200
    },
    awards: [
      "Best Private University - Gujarat (2022)",
      "Excellence in Technical Education (2021)",
      "Best Campus Infrastructure Award (2020)",
      "Outstanding Placement Record Award (2023)"
    ],
    courses: [
      {
        id: "btech-computer-engineering",
        name: "Computer Engineering",
        degree: "B.Tech",
        slug: "btech-computer-engineering",
        institute: "Institute of Technology",
        duration: "4 years",
        level: "Undergraduate",
        category: "Engineering",
        description: "The Computer Engineering program at Nirma University is designed to produce competent professionals who can design, develop, and maintain computer systems and software applications.",
        objectives: [
          "To provide strong foundation in computer science and engineering principles",
          "To develop problem-solving and analytical thinking skills",
          "To prepare students for careers in IT industry and higher studies"
        ],
        curriculum: {
          totalCredits: 160,
          coreCredits: 120,
          electiveCredits: 30,
          projectCredits: 10,
          semesterStructure: [
            {
              semester: 1,
              subjects: [
                "Mathematics I",
                "Physics I",
                "Chemistry",
                "Engineering Graphics",
                "Programming in C",
                "English Communication"
              ]
            }
          ]
        },
        eligibilityCriteria: {
          academicRequirement: "10+2 with Physics, Chemistry, Mathematics",
          minimumMarks: "60%",
          entranceExam: ["JEE Main", "GUJCET", "NUAT"],
          ageLimit: "17-25 years"
        },
        admissionProcess: [
          "Online Application Submission",
          "Entrance Exam Score Submission",
          "Merit List Publication"
        ],
        fees: {
          tuitionFee: "2,50,000 per year",
          hostelFee: "1,20,000 per year",
          messFee: "60,000 per year",
          otherFees: "25,000 per year",
          totalAnnualFee: "4,55,000",
          scholarships: [
            "Merit-based Scholarships (up to 50% tuition fee waiver)",
            "Need-based Scholarships"
          ]
        },
        facultyProfile: {
          totalFaculty: 45,
          professors: 8,
          associateProfessors: 15,
          assistantProfessors: 22,
          phdHolders: 35,
          industryExperience: "Average 12 years",
          notableFaculty: [
            "Dr. Rajesh Kumar - AI and Machine Learning Expert"
          ]
        },
        infrastructure: {
          laboratories: [
            "Computer Programming Lab",
            "Data Structures Lab",
            "Computer Networks Lab"
          ],
          software: [
            "Microsoft Visual Studio",
            "Eclipse IDE",
            "MySQL"
          ]
        },
        careerProspects: {
          averageSalary: "9.2 LPA",
          highestSalary: "55 LPA",
          placementRate: "98%",
          jobRoles: [
            "Software Developer",
            "System Analyst",
            "Database Administrator"
          ],
          topRecruiters: [
            "Microsoft", "Google", "Amazon", "TCS", "Infosys"
          ]
        },
        industryConnections: {
          internshipPartners: [
            "TCS", "Infosys", "Microsoft", "IBM", "Google"
          ],
          industryMentors: 30
        },
        studentActivities: {
          technicalClubs: [
            "Computer Society of India (CSI) Student Chapter",
            "IEEE Computer Society"
          ],
          competitions: [
            "Inter-college Programming Contest",
            "Hackathons"
          ]
        }
      }
    ]
  }
]

// Generate additional mock institutes
const generateMockInstitutes = (): Institute[] => {
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata']
  const types = ['Private', 'Government', 'Deemed']
  const additionalInstitutes: Institute[] = []

  cities.forEach((city, index) => {
    const instituteId = `${city.toLowerCase()}-institute-${index + 2}`
    additionalInstitutes.push({
      id: instituteId,
      name: `${city} Institute of Technology`,
      shortName: `${city.substring(0, 3).toUpperCase()}IT`,
      slug: instituteId,
      establishedYear: 1960 + Math.floor(Math.random() * 50),
      type: types[index % types.length],
      status: 'Institute',
      accreditation: {
        naac: {
          grade: ['A+', 'A', 'B+'][Math.floor(Math.random() * 3)],
          cgpa: 3.0 + Math.random() * 1.0,
          validUntil: '2026',
          cycleNumber: 2
        },
        nirf: {
          overallRank: 50 + Math.floor(Math.random() * 100),
          engineeringRank: 30 + Math.floor(Math.random() * 80),
          year: 2023
        }
      },
      location: {
        address: `${city} Technology Park`,
        city: city,
        state: city === 'Mumbai' ? 'Maharashtra' : city === 'Delhi' ? 'Delhi' : 'Karnataka',
        pincode: `${400000 + Math.floor(Math.random() * 99999)}`,
        country: 'India',
        coordinates: {
          latitude: 19.0760 + Math.random() * 10,
          longitude: 72.8777 + Math.random() * 10
        },
        nearbyLandmarks: [`${city} Airport - 15 km`, `${city} Railway Station - 8 km`]
      },
      contact: {
        phone: [`+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`],
        email: `info@${city.toLowerCase()}tech.ac.in`,
        website: `https://${city.toLowerCase()}tech.ac.in`
      },
      overview: {
        description: `${city} Institute of Technology is a premier engineering institution known for its academic excellence and industry partnerships.`,
        vision: 'To be a leading institute in technical education and research.',
        mission: 'To provide quality education and foster innovation.',
        motto: 'Excellence in Education',
        founder: 'Dr. Founder Name',
        chancellor: 'Dr. Chancellor Name',
        viceChancellor: 'Dr. VC Name'
      },
      campusDetails: {
        totalArea: `${50 + Math.floor(Math.random() * 100)} acres`,
        builtUpArea: `${1 + Math.random() * 2} million sq ft`,
        campusType: 'Residential',
        environment: 'Green Campus',
        facilities: {
          academic: ['Smart Classrooms', 'Laboratories', 'Library'],
          residential: ['Hostels', 'Mess Facilities'],
          recreational: ['Sports Complex', 'Gymnasium'],
          support: ['Medical Center', 'Banking']
        }
      },
      academics: {
        totalStudents: 3000 + Math.floor(Math.random() * 5000),
        totalFaculty: 200 + Math.floor(Math.random() * 300),
        studentFacultyRatio: '15:1',
        internationalStudents: Math.floor(Math.random() * 100),
        totalPrograms: 15 + Math.floor(Math.random() * 20),
        institutes: [
          {
            name: 'Department of Engineering',
            established: 1970 + Math.floor(Math.random() * 40),
            programs: ['B.Tech', 'M.Tech']
          }
        ]
      },
      admissions: {
        applicationDeadline: '2024-06-30',
        entranceExams: {
          engineering: ['JEE Main', 'State CET']
        },
        admissionProcess: ['Online Application', 'Entrance Exam', 'Counseling'],
        reservationPolicy: {
          sc: '15%',
          st: '7.5%',
          obc: '27%',
          ews: '10%',
          pwd: '5%'
        }
      },
      placements: {
        '2023': {
          overallPlacementRate: `${70 + Math.floor(Math.random() * 25)}%`,
          averageSalary: `${4 + Math.random() * 6} LPA`,
          highestSalary: `${20 + Math.random() * 30} LPA`,
          medianSalary: `${3 + Math.random() * 5} LPA`,
          companiesVisited: 100 + Math.floor(Math.random() * 200),
          totalOffers: 1000 + Math.floor(Math.random() * 2000),
          topRecruiters: ['TCS', 'Infosys', 'Wipro', 'Accenture']
        },
        sectors: ['IT & Software - 50%', 'Core Engineering - 30%', 'Others - 20%']
      },
      rankings: {
        national: [
          {
            agency: 'NIRF',
            category: 'Engineering',
            rank: 50 + Math.floor(Math.random() * 100),
            year: 2023
          }
        ],
        international: []
      },
      researchAndInnovation: {
        researchCenters: Math.floor(Math.random() * 10) + 5,
        patentsFiled: Math.floor(Math.random() * 50) + 10,
        publicationsPerYear: Math.floor(Math.random() * 200) + 100,
        researchFunding: `${Math.floor(Math.random() * 20) + 5} Crores`,
        phdScholars: Math.floor(Math.random() * 100) + 50,
        incubationCenter: {
          name: `${city} Innovation Hub`,
          startupsFunded: Math.floor(Math.random() * 20) + 5,
          totalFunding: `${Math.floor(Math.random() * 5) + 2} Crores`
        },
        collaborations: ['Industry Partners', 'Research Institutes']
      },
      alumniNetwork: {
        totalAlumni: 10000 + Math.floor(Math.random() * 15000),
        notableAlumni: [`Alumni ${index + 1} - Industry Leader`],
        alumniInFortune500: Math.floor(Math.random() * 50) + 10,
        entrepreneursCreated: Math.floor(Math.random() * 100) + 20
      },
      awards: [`Excellence Award ${2020 + index}`, 'Best Infrastructure Award'],
      courses: []
    })
  })

  return [...mockInstitutes, ...additionalInstitutes]
}

// Cache the function for better performance
export const getInstituteRecommendations = cache(async (
  params: InstituteSearchParams
): Promise<InstituteSearchResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))

  const {
    location,
    type,
    category,
    query,
    page = 1,
    sortBy = 'popularity',
    establishedYear,
    accreditation
  } = params

  let filteredInstitutes = generateMockInstitutes()

  // Apply filters
  if (location) {
    filteredInstitutes = filteredInstitutes.filter(institute => 
      institute.location.city.toLowerCase().includes(location.toLowerCase()) ||
      institute.location.state.toLowerCase().includes(location.toLowerCase())
    )
  }

  if (type) {
    filteredInstitutes = filteredInstitutes.filter(institute =>
      institute.type.toLowerCase() === type.toLowerCase()
    )
  }

  if (query) {
    filteredInstitutes = filteredInstitutes.filter(institute =>
      institute.name.toLowerCase().includes(query.toLowerCase()) ||
      institute.location.city.toLowerCase().includes(query.toLowerCase()) ||
      institute.overview.description.toLowerCase().includes(query.toLowerCase())
    )
  }

  // Apply sorting
  switch (sortBy) {
    case 'ranking':
      filteredInstitutes.sort((a, b) => {
        const aRank = a.rankings.national[0]?.rank || 999
        const bRank = b.rankings.national[0]?.rank || 999
        return (typeof aRank === 'number' ? aRank : 999) - (typeof bRank === 'number' ? bRank : 999)
      })
      break
    case 'established':
      filteredInstitutes.sort((a, b) => b.establishedYear - a.establishedYear)
      break
    case 'name':
      filteredInstitutes.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'popularity':
    default:
      filteredInstitutes.sort((a, b) => b.academics.totalStudents - a.academics.totalStudents)
  }

  // Pagination
  const pageSize = 10
  const totalPages = Math.ceil(filteredInstitutes.length / pageSize)
  const startIndex = (page - 1) * pageSize
  const paginatedInstitutes = filteredInstitutes.slice(startIndex, startIndex + pageSize)

  // Generate filter options
  const allInstitutes = generateMockInstitutes()
  const filters = {
    locations: Array.from(new Set(allInstitutes.map(i => i.location.city)))
      .map(city => ({
        value: city.toLowerCase(),
        label: city,
        count: allInstitutes.filter(i => i.location.city === city).length
      })),
    types: Array.from(new Set(allInstitutes.map(i => i.type)))
      .map(type => ({
        value: type.toLowerCase(),
        label: type,
        count: allInstitutes.filter(i => i.type === type).length
      })),
    categories: [
      { value: 'engineering', label: 'Engineering', count: allInstitutes.length },
      { value: 'management', label: 'Management', count: Math.floor(allInstitutes.length * 0.3) },
      { value: 'law', label: 'Law', count: Math.floor(allInstitutes.length * 0.2) }
    ],
    accreditations: [
      { value: 'naac-a+', label: 'NAAC A+', count: Math.floor(allInstitutes.length * 0.3) },
      { value: 'naac-a', label: 'NAAC A', count: Math.floor(allInstitutes.length * 0.4) },
      { value: 'aicte', label: 'AICTE Approved', count: allInstitutes.length }
    ]
  }

  return {
    institutes: paginatedInstitutes,
    total: filteredInstitutes.length,
    totalPages,
    currentPage: page,
    filters
  }
})

// Server action to get individual institute details
export const getInstituteDetails = cache(async (slug: string): Promise<Institute | null> => {
  await new Promise(resolve => setTimeout(resolve, 50))
  
  const allInstitutes = generateMockInstitutes()
  return allInstitutes.find(institute => institute.slug === slug) || null
})

// Server action to get course details
export const getCourseDetails = cache(async (instituteSlug: string, courseSlug: string): Promise<Course | null> => {
  await new Promise(resolve => setTimeout(resolve, 50))
  
  const institute = await getInstituteDetails(instituteSlug)
  if (!institute) return null
  
  return institute.courses.find(course => course.slug === courseSlug) || null
})

// Server action to get courses for an institute
export const getInstituteCourses = cache(async (
  instituteSlug: string,
  params: CourseSearchParams = {}
): Promise<CourseSearchResult> => {
  await new Promise(resolve => setTimeout(resolve, 50))
  
  const institute = await getInstituteDetails(instituteSlug)
  if (!institute) {
    return {
      courses: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
      filters: {
        degrees: [],
        categories: [],
        levels: [],
        durations: []
      }
    }
  }

  let filteredCourses = institute.courses

  // Apply filters
  if (params.degree) {
    filteredCourses = filteredCourses.filter(course =>
      course.degree.toLowerCase() === params.degree?.toLowerCase()
    )
  }

  if (params.category) {
    filteredCourses = filteredCourses.filter(course =>
      course.category.toLowerCase() === params.category?.toLowerCase()
    )
  }

  if (params.query) {
    filteredCourses = filteredCourses.filter(course =>
      course.name.toLowerCase().includes(params.query!.toLowerCase()) ||
      course.description.toLowerCase().includes(params.query!.toLowerCase())
    )
  }

  // Pagination
  const pageSize = 10
  const page = params.page || 1
  const totalPages = Math.ceil(filteredCourses.length / pageSize)
  const startIndex = (page - 1) * pageSize
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + pageSize)

  // Generate filter options
  const filters = {
    degrees: Array.from(new Set(institute.courses.map(c => c.degree)))
      .map(degree => ({
        value: degree.toLowerCase(),
        label: degree,
        count: institute.courses.filter(c => c.degree === degree).length
      })),
    categories: Array.from(new Set(institute.courses.map(c => c.category)))
      .map(category => ({
        value: category.toLowerCase(),
        label: category,
        count: institute.courses.filter(c => c.category === category).length
      })),
    levels: Array.from(new Set(institute.courses.map(c => c.level)))
      .map(level => ({
        value: level.toLowerCase(),
        label: level,
        count: institute.courses.filter(c => c.level === level).length
      })),
    durations: Array.from(new Set(institute.courses.map(c => c.duration)))
      .map(duration => ({
        value: duration.toLowerCase().replace(/\s+/g, '-'),
        label: duration,
        count: institute.courses.filter(c => c.duration === duration).length
      }))
  }

  return {
    courses: paginatedCourses,
    total: filteredCourses.length,
    totalPages,
    currentPage: page,
    filters
  }
})
