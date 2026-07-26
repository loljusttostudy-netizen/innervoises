import React, { useState, useEffect, useRef } from 'react';
import { Input } from './Input.jsx';

export function AutocompleteInput({
  value,
  onChange,
  onSelect,
  fetchSuggestions,
  placeholder = '',
  className = ''
}) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onChange) onChange(val);

    if (val.trim().length > 0 && fetchSuggestions) {
      try {
        const res = await fetchSuggestions(val);
        setSuggestions(res || []);
        setIsOpen(true);
      } catch (err) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelectItem = (item) => {
    const displayName = typeof item === 'object' ? item.name : item;
    setQuery(displayName);
    setIsOpen(false);
    if (onSelect) onSelect(item);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <Input
        value={query}
        onChange={handleInputChange}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        placeholder={placeholder}
        className={className}
      />

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border-2 border-y2k-border shadow-y2k max-h-56 overflow-y-auto divide-y border-y2k-border">
          {suggestions.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleSelectItem(item)}
              className="px-4 py-2.5 hover:bg-y2k-green/40 text-sm font-semibold text-y2k-text cursor-pointer transition-colors"
            >
              {typeof item === 'object' ? (
                <div>
                  <p className="font-bold text-y2k-text">{item.name}</p>
                  {item.category && <p className="text-xs text-y2k-muted">{item.category} {item.hsn ? `· HSN: ${item.hsn}` : ''}</p>}
                </div>
              ) : (
                item
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
