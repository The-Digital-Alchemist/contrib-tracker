import React from 'react';

interface LanguageFilterProps {
  /** Currently selected language (empty string for "All Languages") */
  value: string;
  /** Callback when language selection changes */
  onValueChange: (language: string) => void;
  /** Available languages to show in dropdown */
  availableLanguages: string[];
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Custom placeholder text */
  placeholder?: string;
}

const LanguageFilter: React.FC<LanguageFilterProps> = ({
  value,
  onValueChange,
  availableLanguages,
  disabled = false,
  placeholder = "Filter by language..."
}) => {
  return (
    <div className="relative">
      <label htmlFor="language-filter" className="sr-only">
        Filter repositories by programming language
      </label>
      <select
        id="language-filter"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg
          bg-white text-gray-900 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
          appearance-none cursor-pointer
        `}
        aria-label="Filter repositories by programming language"
      >
        <option value="">All Languages</option>
        {availableLanguages.map((language) => (
          <option key={language} value={language}>
            {language}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className={`w-4 h-4 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};

export default LanguageFilter; 