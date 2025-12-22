import { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  minLength?: number
}

export function SearchBar({
  onSearch,
  placeholder = 'Search matters...',
  debounceMs = 500,
  minLength = 3
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
        // Follow minimum query length rules.
        // If length is 0, allow search with no query (clear).
        if (query.length >= minLength || query.length === 0) {
            onSearch(query);
        }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, minLength, onSearch]);

  const onClear = () => {
    setQuery('');
  };

  const onChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={query}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
      {query && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <svg
            className="h-5 w-5 text-gray-400 hover:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
