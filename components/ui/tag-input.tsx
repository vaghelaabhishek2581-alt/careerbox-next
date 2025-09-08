"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Input } from "./input";

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
  validateTag?: (tag: string) => boolean;
  formatTag?: (tag: string) => string;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Add tags...",
  className,
  maxTags = 10,
  validateTag = (tag) => tag.length >= 2,
  formatTag = (tag) => tag.trim(),
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const formattedTag = formatTag(tag);

    if (!formattedTag) {
      return;
    }

    if (value.includes(formattedTag)) {
      setError("Tag already exists");
      return;
    }

    if (value.length >= maxTags) {
      setError(`Maximum ${maxTags} tags allowed`);
      return;
    }

    if (!validateTag(formattedTag)) {
      setError("Tag is too short");
      return;
    }

    setError(null);
    onChange([...value, formattedTag]);
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
    setError(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className="min-h-[38px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm flex flex-wrap gap-2 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1 h-6"
          >
            {tag}
            <X
              className="h-3 w-3 cursor-pointer hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
            />
          </Badge>
        ))}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue) {
              addTag(inputValue);
            }
          }}
          className="flex-1 !h-6 !min-w-[50px] !p-0 !border-0 !focus-visible:ring-0 !focus-visible:ring-offset-0"
          placeholder={value.length === 0 ? placeholder : ""}
        />
      </div>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
