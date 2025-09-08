"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Input } from "./input";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { type LanguageProficiency } from "@/lib/types/profile";

interface Language {
  name: string;
  level: LanguageProficiency["level"];
}

interface LanguageInputProps {
  value: Language[];
  onChange: (value: Language[]) => void;
  className?: string;
  maxLanguages?: number;
}

const PROFICIENCY_LEVELS: LanguageProficiency["level"][] = [
  "BASIC",
  "INTERMEDIATE",
  "ADVANCED",
  "FLUENT",
];

const formatLevel = (level: LanguageProficiency["level"]): string => {
  return level.charAt(0) + level.slice(1).toLowerCase();
};

export function LanguageInput({
  value,
  onChange,
  className,
  maxLanguages = 5,
}: LanguageInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedLevel, setSelectedLevel] =
    useState<LanguageProficiency["level"]>("INTERMEDIATE");
  const [error, setError] = useState<string | null>(null);

  const addLanguage = () => {
    const languageName = inputValue.trim();

    if (!languageName) {
      return;
    }

    if (
      value.some(
        (lang) => lang.name.toLowerCase() === languageName.toLowerCase()
      )
    ) {
      setError("Language already added");
      return;
    }

    if (value.length >= maxLanguages) {
      setError(`Maximum ${maxLanguages} languages allowed`);
      return;
    }

    setError(null);
    onChange([...value, { name: languageName, level: selectedLevel }]);
    setInputValue("");
  };

  const removeLanguage = (languageToRemove: string) => {
    onChange(value.filter((lang) => lang.name !== languageToRemove));
    setError(null);
  };

  const updateLevel = (
    languageName: string,
    newLevel: LanguageProficiency["level"]
  ) => {
    onChange(
      value.map((lang) =>
        lang.name === languageName ? { ...lang, level: newLevel } : lang
      )
    );
  };

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(null);
          }}
          placeholder="Add language..."
          className="flex-1"
        />
        <Select
          value={selectedLevel}
          onValueChange={(value) =>
            setSelectedLevel(value as LanguageProficiency["level"])
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROFICIENCY_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {formatLevel(level)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={addLanguage} type="button">
          Add
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {value.map((language) => (
          <Badge
            key={language.name}
            variant="secondary"
            className="flex items-center gap-2 h-8 pr-2"
          >
            <div className="flex items-center gap-1">
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => removeLanguage(language.name)}
              />
              <span>{language.name}</span>
            </div>
            <Select
              value={language.level}
              onValueChange={(value) =>
                updateLevel(
                  language.name,
                  value as LanguageProficiency["level"]
                )
              }
            >
              <SelectTrigger className="h-5 text-xs border-0 bg-transparent p-0 pl-2 pr-1 hover:bg-accent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROFICIENCY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {formatLevel(level)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Badge>
        ))}
      </div>
    </div>
  );
}
