import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import SearchSuggestion from '@/src/models/SearchSuggestion';
import AdminInstitute from '@/src/models/AdminInstitute';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 1) {
      return NextResponse.json({ suggestions: [] });
    }

    await connectToDatabase();

    const searchText = query.toLowerCase();
    const maxSuggestions = 10;

    // Check if SearchSuggestion collection has data (fast count)
    const suggestionCount = await SearchSuggestion.countDocuments().limit(1);
    
    let results: any[] = [];
    let source = 'none';

    if (suggestionCount > 0) {
      // Fast search using pre-indexed SearchSuggestion collection
      // Escape special regex characters
      const escapedText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      results = await SearchSuggestion.find({
        name: { $regex: `^${escapedText}`, $options: 'i' } // Prefix match uses index
      })
        .sort({ type: 1 }) // Institute first, then program, then course
        .limit(maxSuggestions)
        .select('name type publicId slug metadata') // Only select needed fields
        .lean();
      
      source = 'suggestion_index';
    } else {
      // Fallback to direct AdminInstitute search if suggestions not populated
      console.warn('⚠️ SearchSuggestion collection is empty - run "Rebuild Search Index"');
      
      const escapedText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const institutes = await AdminInstitute.find({
        name: { $regex: `^${escapedText}`, $options: 'i' }
      })
        .select('publicId name slug logo location')
        .limit(maxSuggestions)
        .lean();

      results = institutes.map((inst: any) => ({
        name: inst.name,
        type: 'institute',
        publicId: inst.publicId,
        slug: inst.slug,
        metadata: {
          logo: inst.logo,
          city: inst.location?.city,
          state: inst.location?.state,
        }
      }));
      
      source = 'fallback_institutes';
    }

    const duration = Date.now() - startTime;
    console.log(`🔍 Search "${query}" → ${results.length} results from ${source} in ${duration}ms`);

    // Transform to match expected format
    const suggestions = results.map((result: any) => {
      const baseData = {
        name: result.name,
        logo: result.metadata?.logo,
        location: {
          city: result.metadata?.city,
          state: result.metadata?.state,
        },
        publicId: result.publicId,
        slug: result.slug,
        resultType: result.type,
        category: result.type === 'institute' ? 'Institute' : result.type === 'program' ? 'Program' : 'Course',
      };

      // Add institute name for programs and courses
      if (result.type !== 'institute' && result.metadata?.instituteName) {
        return {
          ...baseData,
          instituteName: result.metadata.instituteName,
          instituteSlug: result.metadata.instituteSlug,
        };
      }

      return baseData;
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
