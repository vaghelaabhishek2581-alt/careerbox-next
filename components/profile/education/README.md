# Education Management System

A comprehensive education management system for CareerBox that allows users to add, edit, and manage multiple education entries with visual indicators for current/ongoing studies.

## Features

### 🎓 Multiple Education Entries
- Add unlimited education entries
- Each entry represents a different institution or course
- Automatic sorting with current studies at the top

### 🟢 Visual Current Indicators
- **Green ring and dot animation** for currently studying education
- **Green badges** with "Currently Studying" label
- **Green timeline borders** for active education
- **Animated pulse effects** to draw attention

### 📅 Timeline Journey View
- Visual timeline connecting multiple education entries
- Chronological ordering (newest first)
- Current education highlighted at the top

### 🎨 Enhanced UI Components
- Modern card-based layout
- Responsive design for all screen sizes
- Smooth animations and transitions
- Consistent with work experience styling

## Components

### EducationManager
Main component for managing all education entries with options for single or multiple education entry creation.

```tsx
import { EducationManager } from '@/components/profile/education';

// As a card component
<EducationManager variant="card" />

// As a section component
<EducationManager variant="section" />
```

**Features:**
- Dropdown menu with "Add Single Education" and "Add Multiple Education" options
- Manages both single and batch education entry workflows
- Visual timeline display of all education entries
- Edit/delete functionality for individual entries

### EducationDisplay
Individual education entry display with visual indicators.

```tsx
import { EducationDisplay } from '@/components/profile/education';

<EducationDisplay
  education={educationEntry}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### EducationForm
Form for adding/editing single education entries.

```tsx
import { EducationForm } from '@/components/profile/education';

<EducationForm
  open={isOpen}
  onClose={handleClose}
  education={editingEducation} // Optional for editing
  variant="modal" // or "full-screen"
/>
```

### MultiEducationForm
**NEW**: Advanced form for adding multiple education entries in one session.

```tsx
import { MultiEducationForm } from '@/components/profile/education';

<MultiEducationForm
  open={isOpen}
  onClose={handleClose}
  variant="modal" // or "full-screen"
/>
```

**Features:**
- **Split-screen layout**: Form on left, education list on right
- **Add to list workflow**: Fill form → Add to list → Repeat → Save all
- **Live preview**: See all added education entries before saving
- **Individual removal**: Remove specific entries from the list
- **Batch validation**: Validates all entries before submission
- **Visual indicators**: Current/completed status for each entry
- **Responsive design**: Adapts to different screen sizes

## Visual Indicators

### Current Education
- **Icon**: Green background with green ring and animated dot
- **Timeline**: Green border on the left side
- **Badge**: Green "Currently Studying" badge with book icon
- **Status**: "Present" in date range

### Completed Education
- **Icon**: Blue background (standard)
- **Timeline**: Gray border on the left side
- **Badge**: Gray "Completed" badge with award icon
- **Status**: Shows actual end date

## Data Structure

```typescript
interface IEducation {
  id: string;
  degree: string;           // Course level (Bachelor's, Master's, etc.)
  fieldOfStudy: string;     // Field of study
  institution: string;      // School/College/University name
  location?: string;        // City, Country
  startDate: string;        // ISO date string
  endDate?: string | null;  // ISO date string or null if current
  isCurrent: boolean;       // Currently studying flag
  grade?: string;          // GPA, percentage, or grade
  description?: string;     // Additional details
}
```

## API Integration

### Batch Education Endpoint
A new API endpoint for creating multiple education entries at once:

```typescript
// POST /api/profile/education/batch
{
  "educations": [
    {
      "degree": "Bachelor's Degree",
      "fieldOfStudy": "Computer Science",
      "institution": "University of Technology",
      "startDate": "2018-09-01",
      "endDate": "2022-06-01",
      "isCurrent": false,
      // ... other fields
    },
    // ... more education entries
  ]
}
```

**Response:**
```typescript
{
  "success": true,
  "educations": [...], // Array of created education entries with IDs
  "totalAdded": 2,
  "message": "2 education entries added successfully"
}
```

## Usage Examples

### Basic Usage
```tsx
import { EducationManager } from '@/components/profile/education';

function ProfilePage() {
  return (
    <div className="space-y-6">
      <EducationManager variant="card" />
    </div>
  );
}
```

### Multiple Education Workflow
```tsx
import { MultiEducationForm } from '@/components/profile/education';

function AddMultipleEducation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Add Multiple Education
      </Button>
      
      <MultiEducationForm
        open={isOpen}
        onClose={() => setIsOpen(false)}
        variant="full-screen" // Better for multiple entries
      />
    </>
  );
}
```

### Custom Integration
```tsx
import { 
  EducationDisplay, 
  EducationForm,
  EducationManager 
} from '@/components/profile/education';

function CustomEducationSection() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { education } = useAppSelector(state => state.profile);

  return (
    <section>
      <h2>My Education Journey</h2>
      
      {/* Use the complete manager */}
      <EducationManager variant="section" />
      
      {/* Or build custom layout */}
      <div className="space-y-4">
        {education.map(edu => (
          <EducationDisplay
            key={edu.id}
            education={edu}
            onEdit={setEditingEducation}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </section>
  );
}
```

## Features Comparison

| Feature | Education | Work Experience |
|---------|-----------|-----------------|
| Multiple Entries | ✅ | ✅ |
| Current Indicators | ✅ Green | ✅ Green |
| Timeline View | ✅ | ✅ |
| Visual Animations | ✅ Pulse & Ring | ✅ Pulse & Ring |
| Sorting | ✅ Date + Current | ✅ Date + Current |
| CRUD Operations | ✅ | ✅ |
| **Batch Creation** | ✅ **NEW** | ❌ |
| **Multi-Entry Form** | ✅ **NEW** | ❌ |
| **Split-Screen UI** | ✅ **NEW** | ❌ |

## New Features Added

### 🎯 **Multi-Education Form**
- **Split-screen interface** with form on left, preview on right
- **Add-to-list workflow** for building multiple entries
- **Live preview** of all education entries before saving
- **Individual entry management** (add/remove from list)
- **Batch submission** with progress feedback

### 🔄 **Enhanced Education Manager**
- **Dropdown menu** for single vs multiple education options
- **Flexible workflow** supporting both use cases
- **Consistent UI** with existing patterns

### 🚀 **Batch API Support**
- **New endpoint**: `/api/profile/education/batch`
- **Bulk creation** of multiple education entries
- **Atomic operations** (all succeed or all fail)
- **Detailed response** with creation statistics

## Styling

The components use Tailwind CSS with consistent color schemes:

- **Current/Active**: Green (`green-500`, `green-100`)
- **Completed/Past**: Blue (`blue-500`, `blue-100`) 
- **Neutral**: Gray (`gray-200`, `gray-500`)
- **Animations**: `animate-pulse`, `animate-ping`

## Integration

The education system integrates seamlessly with:
- Redux store for state management
- Toast notifications for user feedback
- Form validation with Zod schemas
- Responsive design principles
- Accessibility standards

## Best Practices

1. **Always sort current education first** for better UX
2. **Use visual indicators consistently** across all profile sections  
3. **Provide clear feedback** for all user actions
4. **Maintain responsive design** for mobile users
5. **Follow accessibility guidelines** for screen readers
