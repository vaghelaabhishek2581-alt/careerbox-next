"use client";

import { useState, useEffect, useRef } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import apiClient from "@/lib/api/client";

interface Company {
  _id: string;
  name: string;
  logo?: string;
  location?: string;
}

interface CompanySearchProps {
  value?: string;
  onChange: (value: string) => void;
  onSelect?: (company: Company) => void;
}

export function CompanySearch({
  value,
  onChange,
  onSelect,
}: CompanySearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (!debouncedSearch) {
      setCompanies([]);
      return;
    }

    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(
          `/api/companies/search?q=${encodeURIComponent(
            debouncedSearch
          )}&limit=5`
        );
        if (response.success) {
          setCompanies((response.data as any).companies);
        } else {
          throw new Error(response.error || "Failed to fetch companies");
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [debouncedSearch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || "Search company..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Search companies..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>
            {loading ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Searching...
              </p>
            ) : (
              <p className="py-6 text-center text-sm text-gray-500">
                No companies found. You can enter a custom company name.
              </p>
            )}
          </CommandEmpty>
          <CommandGroup>
            {companies.map((company) => (
              <CommandItem
                key={company._id}
                value={company.name}
                onSelect={() => {
                  onChange(company.name);
                  onSelect?.(company);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === company.name ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex items-center">
                  {company.logo && (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="h-6 w-6 rounded mr-2"
                    />
                  )}
                  <div>
                    <p className="font-medium">{company.name}</p>
                    {company.location && (
                      <p className="text-xs text-gray-500">
                        {company.location}
                      </p>
                    )}
                  </div>
                </div>
              </CommandItem>
            ))}
            {search && !companies.length && !loading && (
              <CommandItem
                value={search}
                onSelect={() => {
                  onChange(search);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === search ? "opacity-100" : "opacity-0"
                  )}
                />
                Use &quot;{search}&quot;
              </CommandItem>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
