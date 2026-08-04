import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface SearchDropdownProps<T> {
  onSelect: (item: T) => void;
  fetchResults: (query: string) => Promise<T[]>;
  renderItem: (item: T) => React.ReactNode;
  getItemKey: (item: T) => string | number;
  getDisplayValue: (item: T) => string;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  minQueryLength?: number;
  debounceMs?: number;
  maxResults?: number;
}

export function SearchDropdown<T>({
  onSelect,
  fetchResults,
  renderItem,
  getItemKey,
  getDisplayValue,
  disabled = false,
  placeholder = "Search...",
  label,
  minQueryLength = 2,
  debounceMs = 300,
}: SearchDropdownProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<T[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.length >= minQueryLength) {
      const timeoutId = setTimeout(async () => {
        setIsLoading(true);
        try {
          const results = await fetchResults(searchQuery);
          setSearchResults(results);
          if (results.length > 0) {
            // Calculate position from input element
            const rect = inputRef.current?.getBoundingClientRect();
            if (rect) {
              setDropdownPos({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width,
              });
            }
            setShowDropdown(true);
          } else {
            setShowDropdown(false);
          }
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
          setShowDropdown(false);
        } finally {
          setIsLoading(false);
        }
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
      setIsLoading(false);
    }
  }, [searchQuery, minQueryLength, debounceMs, fetchResults]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemSelect = (item: T) => {
    setSearchQuery(getDisplayValue(item));
    setShowDropdown(false);
    onSelect(item);
  };

  return (
    <div className="relative">
      {label && (
        <label className="mb-1 block font-display text-sm font-bold tracking-wide text-ink uppercase">
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="sb-field disabled:cursor-not-allowed disabled:opacity-55"
      />
      {isLoading && (
        <div className="mt-1 font-mono text-xs text-ink/50">Loading...</div>
      )}
      {showDropdown &&
        searchResults.length > 0 &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
            }}
            className="z-[9999] max-h-48 overflow-y-auto rounded-lg border border-border bg-panel shadow-[0_24px_48px_-28px_rgba(0,0,0,0.8)]"
          >
            {searchResults.map((item) => (
              <div
                key={getItemKey(item)}
                onClick={() => handleItemSelect(item)}
                className="cursor-pointer border-b border-border px-3 py-2 text-ink transition-colors last:border-b-0 hover:bg-signal/10 hover:text-signal"
              >
                {renderItem(item)}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
