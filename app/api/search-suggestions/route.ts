import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import AdminInstitute from '@/src/models/AdminInstitute';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 1) {
      return NextResponse.json({ suggestions: [] });
    }

    await connectToDatabase();

    const searchRegex = { $regex: query, $options: 'i' };
    const suggestions: any[] = [];
    const maxSuggestions = 10;

    // Priority 1: Search in institutes first (limit 8)
    const institutes = await AdminInstitute.find({
      $or: [
        { name: searchRegex },
        { 'location.city': searchRegex },
        { 'location.state': searchRegex },
        { type: searchRegex },
      ],
    })
      .select('name logo location type')
      .limit(8)
      .lean();

    // Add institutes to suggestions
    institutes.forEach((institute: any) => {
      suggestions.push({
        name: institute.name,
        logo: institute.logo,
        location: institute.location,
        type: institute.type,
        resultType: 'institute',
        category: 'Institute',
      });
    });

    // If we have enough suggestions from institutes, return early
    if (suggestions.length >= maxSuggestions) {
      return NextResponse.json({ suggestions: suggestions.slice(0, maxSuggestions) });
    }

    // Priority 2: Search in programs only if needed (limit remaining slots)
    const remainingSlots = maxSuggestions - suggestions.length;
    if (remainingSlots > 0) {
      const programResults = await AdminInstitute.aggregate([
        { $unwind: '$programmes' },
        {
          $match: {
            'programmes.name': searchRegex,
          },
        },
        { $limit: Math.min(remainingSlots, 5) },
        {
          $project: {
            name: '$programmes.name',
            instituteName: '$name',
            logo: '$logo',
            location: 1,
          },
        },
      ]);

      // Add programs to suggestions
      programResults.forEach((program: any) => {
        suggestions.push({
          name: program.name,
          logo: program.logo,
          location: program.location,
          instituteName: program.instituteName,
          resultType: 'program',
          category: 'Program',
        });
      });
    }

    // If we have enough suggestions now, return early
    if (suggestions.length >= maxSuggestions) {
      return NextResponse.json({ suggestions: suggestions.slice(0, maxSuggestions) });
    }

    // Priority 3: Search in courses only if still needed (limit remaining slots)
    const finalRemainingSlots = maxSuggestions - suggestions.length;
    if (finalRemainingSlots > 0) {
      const courseResults = await AdminInstitute.aggregate([
        { $unwind: '$courses' },
        {
          $match: {
            $or: [
              { 'courses.name': searchRegex },
              { 'courses.degree': searchRegex },
            ],
          },
        },
        { $limit: finalRemainingSlots },
        {
          $project: {
            name: '$courses.name',
            degree: '$courses.degree',
            instituteName: '$name',
            logo: '$logo',
            location: 1,
          },
        },
      ]);

      // Add courses to suggestions
      courseResults.forEach((course: any) => {
        suggestions.push({
          name: course.degree ? `${course.degree} - ${course.name}` : course.name,
          logo: course.logo,
          location: course.location,
          instituteName: course.instituteName,
          resultType: 'course',
          category: 'Course',
        });
      });
    }

    return NextResponse.json({ suggestions: suggestions.slice(0, maxSuggestions) });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
