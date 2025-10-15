'use server'

import { connectToDatabase } from '@/lib/db/mongodb'
import AdminInstitute from '@/src/models/AdminInstitute'

export async function getInstituteFilterOptions() {
  try {
    await connectToDatabase()

    const [locations, types, categories, accreditations, recognitions] = await Promise.all([
      AdminInstitute.distinct('location.city').exec(),
      AdminInstitute.distinct('type').exec(),
      AdminInstitute.distinct('programmes.course.category').exec(),
      AdminInstitute.distinct('accreditation.naac.grade').exec(),
      AdminInstitute.distinct('programmes.course.recognition').exec(),
    ])

    const allAccreditations = [...new Set([...accreditations, ...recognitions])].filter(Boolean)

    return {
      locations: locations.filter(Boolean).map(value => ({ label: value, value })),
      types: types.filter(Boolean).map(value => ({ label: value, value })),
      categories: categories.filter(Boolean).map(value => ({ label: value, value })),
      accreditations: allAccreditations.map(value => ({ label: value, value })),
    }
  } catch (error) {
    console.error('Error fetching institute filter options:', error)
    return {
      locations: [],
      types: [],
      categories: [],
      accreditations: [],
    }
  }
}
