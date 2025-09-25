// Utility for loading Indian states and cities from local JSON data
// This replaces the react-country-state-city package for better performance

// Type for the states data structure
type StatesData = Record<string, string[]>;

// Cache for loaded data to avoid re-fetching
let statesDataCache: StatesData | null = null;

/**
 * Load states data from JSON file
 */
async function loadStatesData(): Promise<StatesData> {
  if (statesDataCache) {
    return statesDataCache;
  }
  
  try {
    const response = await fetch('/states.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch states.json: ${response.status}`);
    }
    
    const data: StatesData = await response.json();
    statesDataCache = data;
    return data;
  } catch (error) {
    console.error('Error loading states data:', error);
    throw new Error('Failed to load location data');
  }
}

/**
 * Get all Indian state names (sorted alphabetically)
 */
export async function getStateNames(): Promise<string[]> {
  try {
    const statesData = await loadStatesData();
    return Object.keys(statesData).sort();
  } catch (error) {
    console.error('Error getting state names:', error);
    return [];
  }
}

/**
 * Get city names for a specific state (sorted alphabetically)
 */
export async function getCityNames(stateName: string): Promise<string[]> {
  try {
    const statesData = await loadStatesData();
    const cities = statesData[stateName];
    
    if (!cities) {
      console.warn(`No cities found for state: ${stateName}`);
      return [];
    }
    
    return [...cities].sort(); // Create a copy and sort
  } catch (error) {
    console.error('Error getting city names:', error);
    return [];
  }
}

/**
 * Get all states with their cities
 */
export async function getAllStatesWithCities(): Promise<StatesData> {
  try {
    return await loadStatesData();
  } catch (error) {
    console.error('Error getting all states with cities:', error);
    return {};
  }
}

/**
 * Search cities by name across all states
 */
export async function searchCities(query: string): Promise<{ city: string, state: string }[]> {
  try {
    const statesData = await loadStatesData();
    const results: { city: string, state: string }[] = [];
    const lowerQuery = query.toLowerCase();
    
    Object.entries(statesData).forEach(([stateName, cities]) => {
      cities.forEach(city => {
        if (city.toLowerCase().includes(lowerQuery)) {
          results.push({ city, state: stateName });
        }
      });
    });
    
    return results.sort((a, b) => a.city.localeCompare(b.city));
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
}

/**
 * Check if a state exists
 */
export async function isValidState(stateName: string): Promise<boolean> {
  try {
    const statesData = await loadStatesData();
    return stateName in statesData;
  } catch (error) {
    console.error('Error validating state:', error);
    return false;
  }
}

/**
 * Check if a city exists in a specific state
 */
export async function isValidCity(stateName: string, cityName: string): Promise<boolean> {
  try {
    const statesData = await loadStatesData();
    const cities = statesData[stateName];
    return cities ? cities.includes(cityName) : false;
  } catch (error) {
    console.error('Error validating city:', error);
    return false;
  }
}

/**
 * Clear cache (useful for testing or if data needs to be refreshed)
 */
export function clearLocationCache(): void {
  statesDataCache = null;
}
