import React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface EnhancedDatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

export const EnhancedDatePicker: React.FC<EnhancedDatePickerProps> = ({ 
  date, 
  onDateChange, 
  disabled = false, 
  placeholder = "Select date",
  minDate,
  maxDate = new Date()
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'calendar' | 'year' | 'month'>('calendar');
  const [viewYear, setViewYear] = React.useState(date?.getFullYear() || new Date().getFullYear());
  const [viewMonth, setViewMonth] = React.useState(date?.getMonth() || new Date().getMonth());

  const currentYear = new Date().getFullYear();
  const maxYear = maxDate?.getFullYear() || currentYear;
  const minYear = minDate?.getFullYear() || (currentYear - 50);
  
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).reverse();
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleYearSelect = (year: number) => {
    setViewYear(year);
    setViewMode('month');
  };

  const handleMonthSelect = (monthIndex: number) => {
    setViewMonth(monthIndex);
    setViewMode('calendar');
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onDateChange(selectedDate);
      setIsOpen(false);
    }
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    if (viewMode === 'year') {
      const startYear = Math.floor(viewYear / 10) * 10;
      const newStartYear = direction === 'prev' ? startYear - 10 : startYear + 10;
      setViewYear(Math.max(minYear, Math.min(maxYear, newStartYear)));
    } else {
      const newYear = direction === 'prev' ? viewYear - 1 : viewYear + 1;
      setViewYear(Math.max(minYear, Math.min(maxYear, newYear)));
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (viewMonth === 0) {
        const newYear = viewYear - 1;
        if (newYear >= minYear) {
          setViewMonth(11);
          setViewYear(newYear);
        }
      } else {
        setViewMonth(prev => prev - 1);
      }
    } else {
      if (viewMonth === 11) {
        const newYear = viewYear + 1;
        if (newYear <= maxYear) {
          setViewMonth(0);
          setViewYear(newYear);
        }
      } else {
        setViewMonth(prev => prev + 1);
      }
    }
  };

  const isDateDisabled = (date: Date) => {
    if (maxDate && date > maxDate) return true;
    if (minDate && date < minDate) return true;
    return false;
  };

  const canNavigateYear = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      return viewYear > minYear;
    } else {
      return viewYear < maxYear;
    }
  };

  const canNavigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      return !(viewYear === minYear && viewMonth === 0);
    } else {
      return !(viewYear === maxYear && viewMonth === 11);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full pl-3 text-left font-normal",
            (!date || disabled) && "text-muted-foreground"
          )}
        >
          {date ? format(date, "MMM yyyy") : <span>{placeholder}</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => viewMode === 'calendar' ? navigateMonth('prev') : navigateYear('prev')}
              className="h-7 w-7 p-0"
              disabled={viewMode === 'calendar' ? !canNavigateMonth('prev') : !canNavigateYear('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {viewMode === 'calendar' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('month')}
                    className="text-sm font-medium"
                  >
                    {months[viewMonth]}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('year')}
                    className="text-sm font-medium"
                  >
                    {viewYear}
                  </Button>
                </>
              )}
              {viewMode === 'month' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('year')}
                  className="text-sm font-medium"
                >
                  {viewYear}
                </Button>
              )}
              {viewMode === 'year' && (
                <span className="text-sm font-medium px-2">
                  {Math.floor(viewYear / 10) * 10} - {Math.floor(viewYear / 10) * 10 + 9}
                </span>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => viewMode === 'calendar' ? navigateMonth('next') : navigateYear('next')}
              className="h-7 w-7 p-0"
              disabled={viewMode === 'calendar' ? !canNavigateMonth('next') : !canNavigateYear('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {viewMode === 'year' && (
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {years.map((year) => (
                <Button
                  key={year}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleYearSelect(year)}
                  className={cn(
                    "text-center",
                    year === viewYear && "bg-primary text-primary-foreground"
                  )}
                >
                  {year}
                </Button>
              ))}
            </div>
          )}

          {viewMode === 'month' && (
            <div className="grid grid-cols-3 gap-2">
              {months.map((month, index) => {
                const isDisabled = (viewYear === minYear && index < (minDate?.getMonth() || 0)) ||
                                 (viewYear === maxYear && index > (maxDate?.getMonth() || 11));
                return (
                  <Button
                    key={month}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMonthSelect(index)}
                    disabled={isDisabled}
                    className={cn(
                      "text-center text-xs",
                      index === viewMonth && "bg-primary text-primary-foreground",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {month.slice(0, 3)}
                  </Button>
                );
              })}
            </div>
          )}

          {viewMode === 'calendar' && (
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              month={new Date(viewYear, viewMonth)}
              onMonthChange={(newMonth) => {
                setViewMonth(newMonth.getMonth());
                setViewYear(newMonth.getFullYear());
              }}
              disabled={isDateDisabled}
              className="border-none p-0"
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
