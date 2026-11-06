// LAYER: Frontend Client Component
// Provides interactive filtering by tag and a "Veg only" toggle switch on the home page.

'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Leaf, Tag, X, Filter, Search } from 'lucide-react';
import { useState, useTransition } from 'react';

export default function FilterBar({ allTags = [], totalCount = 0 }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Read current filters from URL search parameters
  const currentTag = searchParams.get('tag') || '';
  const isVegOnly = searchParams.get('veg') === 'true';
  const currentSearch = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Helper to update query string smoothly
  function updateFilters(updates) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || value === false) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  // Handle "Veg only" toggle
  function handleToggleVeg() {
    updateFilters({ veg: isVegOnly ? null : 'true' });
  }

  // Handle tag selection
  function handleSelectTag(tag) {
    if (currentTag.toLowerCase() === tag.toLowerCase()) {
      updateFilters({ tag: null }); // Unselect if already selected
    } else {
      updateFilters({ tag });
    }
  }

  // Handle search submission
  function handleSearchSubmit(e) {
    e.preventDefault();
    updateFilters({ q: searchInput.trim() || null });
  }

  // Clear all active filters
  function handleClearAll() {
    setSearchInput('');
    startTransition(() => {
      router.push(pathname);
    });
  }

  const hasActiveFilters = Boolean(currentTag || isVegOnly || currentSearch);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs mb-8">
      {/* Top Controls Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search recipes by title or keyword..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-20 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-stone-600"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg transition-colors"
          >
            Find
          </button>
        </form>

        {/* Veg Only Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleVeg}
            type="button"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
              isVegOnly
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Leaf
              className={`w-4 h-4 ${
                isVegOnly ? 'text-white' : 'text-emerald-600'
              }`}
            />
            <span>Veg Only</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                isVegOnly
                  ? 'bg-emerald-700 text-emerald-100'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              {isVegOnly ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Clear Filters Button (shown only when filters active) */}
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
              title="Reset all filters"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Tag Pills Section */}
      {allTags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 mb-2 text-xs font-medium text-stone-600">
            <Tag className="w-3.5 h-3.5 text-stone-600" />
            <span>Filter by popular tags:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => updateFilters({ tag: null })}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                !currentTag
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All Tags
            </button>

            {allTags.map((tag) => {
              const isSelected = currentTag.toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  onClick={() => handleSelectTag(tag)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Filter Badges Bar */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-stone-600">Active filters:</span>
            {isVegOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-medium">
                🌱 Veg only
                <button
                  onClick={handleToggleVeg}
                  className="hover:text-emerald-950 ml-1"
                >
                  ×
                </button>
              </span>
            )}
            {currentTag && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 font-medium">
                #{currentTag}
                <button
                  onClick={() => updateFilters({ tag: null })}
                  className="hover:text-orange-950 ml-1"
                >
                  ×
                </button>
              </span>
            )}
            {currentSearch && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-medium">
                &ldquo;{currentSearch}&rdquo;
                <button
                  onClick={() => {
                    setSearchInput('');
                    updateFilters({ q: null });
                  }}
                  className="hover:text-blue-950 ml-1"
                >
                  ×
                </button>
              </span>
            )}
          </div>

          <span className="text-stone-600">
            {totalCount} {totalCount === 1 ? 'recipe' : 'recipes'} found
          </span>
        </div>
      )}
    </div>
  );
}

