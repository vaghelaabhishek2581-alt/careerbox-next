const fs = require('fs');
const path = require('path');

// Read the JSON file
const filePath = path.join(__dirname, '..', 'lib', 'actions', 'parul-university.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Fields that should be numbers but might have "N/A"
const numericFields = [
  'averagePackage',
  'highestPackage',
  'placementRate',
  'overallPlacementRate',
  'averageSalary',
  'highestSalary',
  'medianSalary',
  'companiesVisited',
  'totalOffers',
  'totalAlumni',
  'alumniInFortune500',
  'entrepreneursCreated',
  'totalSeats',
  'tuitionFee',
  'totalFee'
];

// Function to fix data recursively
function fixData(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => fixData(item));
  } else if (obj !== null && typeof obj === 'object') {
    const fixed = {};
    for (const [key, value] of Object.entries(obj)) {
      // If the key is a numeric field and value is "N/A", replace with null
      if (numericFields.includes(key) && value === 'N/A') {
        fixed[key] = null;
      } else if (typeof value === 'object' && value !== null) {
        fixed[key] = fixData(value);
      } else {
        fixed[key] = value;
      }
    }
    return fixed;
  }
  return obj;
}

// Fix the data
const fixedData = fixData(data);

// Write back to file
fs.writeFileSync(filePath, JSON.stringify(fixedData, null, 2), 'utf8');

console.log('✅ Successfully fixed data in parul-university.json');
console.log('   - Replaced "N/A" with null for all numeric fields');
