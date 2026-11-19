import { Search, X } from "lucide-react";

const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
}) => {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-app-border bg-white px-3 py-2">
      <Search size={18} className="text-app-muted" />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X size={16} className="text-app-muted" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;