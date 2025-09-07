"use client";

import { useState, useEffect } from "react";
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

interface Institute {
  _id: string;
  name: string;
  type: string;
  state: string;
  city: string;
  examBoards?: string[];
}

interface InstituteSearchProps {
  value?: string;
  state?: string;
  onChange: (value: string) => void;
  onSelect?: (institute: Institute) => void;
}

export function InstituteSearch({
  value,
  state,
  onChange,
  onSelect,
}: InstituteSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (!debouncedSearch) {
      setInstitutes([]);
      return;
    }

    const fetchInstitutes = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: debouncedSearch,
          limit: "5",
        });
        if (state) params.append("state", state);

        const response = await fetch(`/api/institutes/search?${params}`);
        if (!response.ok) throw new Error("Failed to fetch institutes");
        const data = await response.json();
        setInstitutes(data.institutes);
      } catch (error) {
        console.error("Error fetching institutes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutes();
  }, [debouncedSearch, state]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || "Search institute..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Search institutes..."
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
                No institutes found. You can enter a custom institute name.
              </p>
            )}
          </CommandEmpty>
          <CommandGroup>
            {institutes.map((institute) => (
              <CommandItem
                key={institute._id}
                value={institute.name}
                onSelect={() => {
                  onChange(institute.name);
                  onSelect?.(institute);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === institute.name ? "opacity-100" : "opacity-0"
                  )}
                />
                <div>
                  <p className="font-medium">{institute.name}</p>
                  <p className="text-xs text-gray-500">
                    {institute.type} • {institute.city}, {institute.state}
                  </p>
                </div>
              </CommandItem>
            ))}
            {search && !institutes.length && !loading && (
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
                Use "{search}"
              </CommandItem>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
