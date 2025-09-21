import { differenceInMonths, format } from "date-fns";

// Helper function to generate unique IDs
export const generateUniqueId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Calculate duration between two dates in months
export const calculateDuration = (startDate: Date, endDate?: Date | null, isCurrent?: boolean): string => {
  const end = isCurrent || !endDate ? new Date() : endDate;
  const months = differenceInMonths(end, startDate);
  
  if (months < 1) {
    return "Less than 1 month";
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 0) {
    return `${months} month${months === 1 ? '' : 's'}`;
  }
  
  if (remainingMonths === 0) {
    return `${years} year${years === 1 ? '' : 's'}`;
  }
  
  return `${years} year${years === 1 ? '' : 's'} ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
};

// Calculate total experience duration across all positions
export const calculateTotalExperience = (positions: Array<{
  startDate: Date | string;
  endDate?: Date | string | null;
  isCurrent?: boolean;
}>): string => {
  let totalMonths = 0;
  
  positions.forEach(position => {
    const startDate = typeof position.startDate === 'string' ? new Date(position.startDate) : position.startDate;
    const endDate = position.endDate ? (typeof position.endDate === 'string' ? new Date(position.endDate) : position.endDate) : null;
    
    const end = position.isCurrent || !endDate ? new Date() : endDate;
    totalMonths += differenceInMonths(end, startDate);
  });
  
  if (totalMonths < 1) {
    return "Less than 1 month";
  }
  
  const years = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;
  
  if (years === 0) {
    return `${totalMonths} month${totalMonths === 1 ? '' : 's'}`;
  }
  
  if (remainingMonths === 0) {
    return `${years} year${years === 1 ? '' : 's'}`;
  }
  
  return `${years} year${years === 1 ? '' : 's'} ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
};

// Format date for display
export const formatDateForDisplay = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, "MMM yyyy");
};
