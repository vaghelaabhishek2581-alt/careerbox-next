# Programmes Implementation Guide

## Overview
This implementation allows institutes to display **programmes first**, and when users click on a programme, it shows all courses within that programme. The URL updates with a query parameter to maintain state.

## How It Works

### 1. **Data Structure**
Your institute data now includes a `programmes` array:
```json
{
  "programmes": [
    {
      "id": "123456",
      "name": "BPT",
      "courseCount": 20,
      "placementRating": 3,
      "eligibilityExams": ["Gmat", "Xat", "Cat"],
      "course": [
        // Array of courses belonging to this programme
      ]
    }
  ]
}
```

### 2. **URL Structure**
- **All Programmes View**: `/institutes/gujarat-university`
- **Single Programme View**: `/institutes/gujarat-university?programme=BPT`

When a user clicks on a programme, the URL updates with the `?programme=` parameter.

### 3. **Component Flow**

#### **InstituteDetailPageWithProgrammes.tsx**
This is the new main component that handles:

1. **Reading URL Parameters**
   ```tsx
   const searchParams = useSearchParams()
   const selectedProgrammeId = searchParams.get('programme')
   ```

2. **Showing Programmes Grid** (when no programme is selected)
   - Displays all programmes as clickable cards
   - Shows course count, rating, and eligibility exams
   - Click handler updates URL with programme ID

3. **Showing Programme Courses** (when a programme is selected)
   - Displays breadcrumb navigation
   - Shows all courses from the selected programme
   - Includes "Back to Programmes" button

### 4. **Key Features**

#### ✅ **Programme Grid View**
- Beautiful card layout with gradient backgrounds
- Shows programme name, course count, rating, and eligibility exams
- Hover effects and smooth transitions
- Click to navigate to programme details

#### ✅ **Programme Detail View**
- Breadcrumb navigation: "All Programmes > BPT"
- Back button to return to programmes list
- Full course details with fees, placements, seats, etc.
- Apply Now and Brochure buttons for each course

#### ✅ **URL-Based Navigation**
- URL updates when selecting a programme
- Shareable links (users can copy and share specific programme URLs)
- Browser back/forward buttons work correctly

#### ✅ **Fallback Support**
- If no programmes exist, falls back to showing courses directly
- Maintains backward compatibility

### 5. **Files Modified**

1. **`lib/actions/institute-recommendations.ts`**
   - Added `programmes` field mapping in `mapAdminToUiInstitute()`
   - Maps programme data including nested courses
   - Added `overview.stats` field support

2. **`components/publicCollections/InstituteDetailPageWithProgrammes.tsx`** (NEW)
   - Main component with programme/course switching logic
   - URL parameter handling
   - Beautiful UI for both views

3. **`app/(landing)/institutes/[slug]/page.tsx`**
   - Updated to use `InstituteDetailPageWithProgrammes` component

### 6. **Usage Example**

When a user visits `/institutes/gujarat-university`:
1. They see a grid of programmes (BPT, MBA, etc.)
2. They click on "BPT"
3. URL changes to `/institutes/gujarat-university?programme=BPT`
4. Page shows all BPT courses with full details
5. They can click "Back to Programmes" to return

### 7. **Benefits**

✅ **Better Organization**: Courses grouped by programmes  
✅ **Improved UX**: Users find relevant courses faster  
✅ **SEO Friendly**: Each programme has a unique URL  
✅ **Shareable**: Users can share specific programme links  
✅ **Scalable**: Easy to add more programmes  
✅ **Backward Compatible**: Falls back to courses if no programmes  

### 8. **Testing**

Test with your Gujarat University data:
```bash
# Visit the institute page
http://localhost:3000/institutes/gujarat-university

# You should see:
# 1. Programme card for "BPT" with 20 courses
# 2. Click on BPT
# 3. URL changes to: /institutes/gujarat-university?programme=BPT
# 4. See all 16 courses from the BPT programme
```

### 9. **Next Steps**

If you want to enhance this further, you can:
- Add filters within programme courses (by level, category, etc.)
- Add search functionality within a programme
- Add comparison feature between courses in a programme
- Add programme-level statistics and overview

## Summary

✅ **Programmes are now shown first**  
✅ **Clicking a programme shows its courses**  
✅ **URL updates with programme parameter**  
✅ **Beautiful, responsive UI**  
✅ **Fully functional with your data structure**

The implementation is complete and ready to use!
