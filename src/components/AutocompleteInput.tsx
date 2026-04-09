import { useState, useRef, useEffect, useCallback } from "react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
  onSelect?: (value: string) => void;
  icon?: React.ReactNode;
  allowFreeform?: boolean;
}

const highlightMatch = (text: string, query: string) => {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-primary font-semibold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
};

const AutocompleteInput = ({
  value,
  onChange,
  suggestions,
  placeholder,
  className,
  onSelect,
  icon,
  allowFreeform = true,
}: AutocompleteInputProps) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = value.trim()
    ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : [];

  const showDropdown = open && value.trim().length > 0 && (filtered.length > 0 || value.trim().length >= 2);

  useEffect(() => {
    setActiveIndex(-1);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectItem = useCallback(
    (item: string) => {
      onChange(item);
      onSelect?.(item);
      setOpen(false);
      inputRef.current?.blur();
    },
    [onChange, onSelect]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectItem(filtered[activeIndex]);
    } else if (e.key === "Enter" && !allowFreeform && filtered.length > 0) {
      e.preventDefault();
      selectItem(filtered[0]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "flex h-11 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            icon && "pl-9",
            className
          )}
        />
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1.5 rounded-xl border border-border bg-popover shadow-xl shadow-black/10 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
          <Command className="bg-transparent">
            <CommandList>
              {filtered.length > 0 ? (
                <CommandGroup>
                  {filtered.map((item, i) => (
                    <CommandItem
                      key={item}
                      onSelect={() => selectItem(item)}
                      className={cn(
                        "px-3 py-2.5 text-sm cursor-pointer rounded-lg mx-1 my-0.5 transition-colors",
                        i === activeIndex && "bg-accent text-accent-foreground"
                      )}
                    >
                      {highlightMatch(item, value)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandEmpty className="py-3 text-xs text-muted-foreground">
                  {allowFreeform ? (
                    <>No matches — press Enter to use "<span className="text-foreground font-medium">{value}</span>"</>
                  ) : (
                    <>No supported role matches</>
                  )}
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
