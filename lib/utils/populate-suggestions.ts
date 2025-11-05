import SearchSuggestion from '@/src/models/SearchSuggestion'

interface InstituteData {
  publicId: string
  name: string
  slug: string
  logo?: string
  location?: {
    city?: string
    state?: string
  }
  programmes?: Array<{
    name: string
    course?: Array<{
      name: string
    }>
  }>
  courses?: Array<{
    name: string
  }>
}

export async function populateSuggestionsFromInstitute(institute: InstituteData) {
  const suggestions = []

  // 1. Institute suggestion
  suggestions.push({
    name: institute.name,
    type: 'institute',
    publicId: institute.publicId,
    slug: institute.slug,
    metadata: {
      instituteName: institute.name,
      instituteSlug: institute.slug,
      logo: institute.logo,
      city: institute.location?.city,
      state: institute.location?.state,
    },
    searchText: institute.name.toLowerCase(),
  })

  // 2. Program suggestions from programmes array
  if (institute.programmes && Array.isArray(institute.programmes)) {
    for (const program of institute.programmes) {
      if (program.name) {
        suggestions.push({
          name: program.name,
          type: 'program',
          publicId: institute.publicId,
          slug: institute.slug,
          metadata: {
            instituteName: institute.name,
            instituteSlug: institute.slug,
            programName: program.name,
            logo: institute.logo,
            city: institute.location?.city,
            state: institute.location?.state,
          },
          searchText: `${program.name} ${institute.name}`.toLowerCase(),
        })

        // 3. Courses within programmes
        if (program.course && Array.isArray(program.course)) {
          for (const course of program.course) {
            if (course.name) {
              suggestions.push({
                name: course.name,
                type: 'course',
                publicId: institute.publicId,
                slug: institute.slug,
                metadata: {
                  instituteName: institute.name,
                  instituteSlug: institute.slug,
                  programName: program.name,
                  logo: institute.logo,
                  city: institute.location?.city,
                  state: institute.location?.state,
                },
                searchText: `${course.name} ${program.name} ${institute.name}`.toLowerCase(),
              })
            }
          }
        }
      }
    }
  }

  // 4. Course suggestions from legacy courses array
  if (institute.courses && Array.isArray(institute.courses)) {
    for (const course of institute.courses) {
      if (course.name) {
        suggestions.push({
          name: course.name,
          type: 'course',
          publicId: institute.publicId,
          slug: institute.slug,
          metadata: {
            instituteName: institute.name,
            instituteSlug: institute.slug,
            logo: institute.logo,
            city: institute.location?.city,
            state: institute.location?.state,
          },
          searchText: `${course.name} ${institute.name}`.toLowerCase(),
        })
      }
    }
  }

  // Remove duplicates based on name + type
  const uniqueSuggestions = suggestions.filter(
    (suggestion, index, self) =>
      index === self.findIndex((s) => s.name === suggestion.name && s.type === suggestion.type)
  )

  return uniqueSuggestions
}

export async function deleteSuggestionsByPublicId(publicId: string) {
  await SearchSuggestion.deleteMany({ publicId })
}

export async function upsertSuggestions(suggestions: any[]) {
  const operations = suggestions.map((suggestion) => ({
    updateOne: {
      filter: { 
        name: suggestion.name, 
        type: suggestion.type,
        publicId: suggestion.publicId 
      },
      update: { $set: suggestion },
      upsert: true,
    },
  }))

  if (operations.length > 0) {
    await SearchSuggestion.bulkWrite(operations)
  }
}
