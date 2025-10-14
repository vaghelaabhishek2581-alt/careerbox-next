const fs = require('fs');
const path = require('path');

// Read the JSON file
const filePath = path.join(__dirname, '..', 'lib', 'actions', 'parul-university.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Function to fix placement data recursively
function fixPlacementData(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => fixPlacementData(item));
  } else if (obj !== null && typeof obj === 'object') {
    const fixed = {};
    for (const [key, value] of Object.entries(obj)) {
      // Fix placement fields that should be numbers
      if (key === 'placements' && typeof value === 'object' && value !== null) {
        fixed[key] = {
          ...value,
          averagePackage: value.averagePackage === 'N/A' ? null : value.averagePackage,
          highestPackage: value.highestPackage === 'N/A' ? null : value.highestPackage,
          placementRate: value.placementRate === 'N/A' ? null : value.placementRate,
          topRecruiters: value.topRecruiters || []
        };
      } else {
        fixed[key] = fixPlacementData(value);
      }
    }
    return fixed;
  }
  return obj;
}

// Fix the data
const fixedData = fixPlacementData(data);

// Write back to file
fs.writeFileSync(filePath, JSON.stringify(fixedData, null, 2), 'utf8');

console.log('✅ Successfully fixed placement data in parul-university.json');
console.log('   - Replaced "N/A" with null for averagePackage, highestPackage, and placementRate');
