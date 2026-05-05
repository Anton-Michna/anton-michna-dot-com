import { useState, useEffect, useRef } from "react";

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search as user types
  useEffect(() => {
    if (searchQuery.length >= minQueryLength) {
      const timeoutId = setTimeout(async () => {
        setIsLoading(true);
        try {
          const results = await fetchResults(searchQuery);
          setSearchResults(results);
          setShowDropdown(results.length > 0);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
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
    <div style={{ position: "relative" }} ref={dropdownRef}>
      {label && <label>{label} </label>}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
        placeholder={placeholder}
        disabled={disabled}
        style={{ width: "300px" }}
      />
      {isLoading && (
        <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
          Loading...
        </div>
      )}
      {showDropdown && searchResults.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "0",
            width: "300px",
            maxHeight: "200px",
            overflowY: "auto",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            zIndex: 1000,
            marginTop: "4px",
          }}
        >
          {searchResults.map((item) => (
            <div
              key={getItemKey(item)}
              onClick={() => handleItemSelect(item)}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                color: "black",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f0f0f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
