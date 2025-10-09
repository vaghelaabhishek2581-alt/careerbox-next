const fs = require('fs');
const path = require('path');

// List of files to fix
const files = [
  'app/api/institutes/[instituteId]/documents/route.ts',
  'app/api/institutes/[instituteId]/facilities/route.ts', 
  'app/api/institutes/[instituteId]/highlights/route.ts',
  'app/api/institutes/[instituteId]/locations/route.ts',
  'app/api/institutes/[instituteId]/programs/route.ts',
  'app/api/institutes/[instituteId]/rankings/route.ts',
  'app/api/institutes/[instituteId]/registration-details/route.ts',
  'app/api/institutes/[instituteId]/scholarships/route.ts',
  'app/api/institutes/[instituteId]/upload-image/route.ts',
  'app/api/institutes/[instituteId]/route.ts'
];

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix function signatures
    content = content.replace(
      /{ params }: { params: { instituteId: string } }/g,
      '{ params }: { params: Promise<{ instituteId: string }> }'
    );
    
    // Fix params destructuring
    content = content.replace(
      /const { instituteId } = params/g,
      'const { instituteId } = await params'
    );
    
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('All files processed!');
