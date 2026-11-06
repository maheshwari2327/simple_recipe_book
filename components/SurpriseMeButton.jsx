// LAYER: Frontend Client Component
// Interactive "Surprise me" button that triggers a random recipe fetch using MongoDB's $sample stage.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';

export default function SurpriseMeButton({ className = '', variant = 'navbar' }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSurpriseMe() {
    if (loading) return;
    setLoading(true);

    try {
      // Call backend route handler that executes MongoDB $sample aggregation
      const response = await fetch('/api/recipes/random', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok || !data.id) {
        alert(data.error || 'No recipes found to surprise you. Please add some recipes first!');
        setLoading(false);
        return;
      }

      // Navigate directly to the randomly selected recipe detail page
      router.push(`/recipes/${data.id}`);
    } catch (err) {
      console.error('Surprise Me error:', err);
      alert('Unable to pick a random recipe right now. Please check your connection.');
      setLoading(false);
    }
  }

  if (variant === 'hero') {
    return (
      <button
        onClick={handleSurpriseMe}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 shadow-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title="Get a random recipe recommendation!"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-amber-700" />
        ) : (
          <Sparkles className="w-5 h-5 text-amber-600" />
        )}
        <span>{loading ? 'Finding recipe...' : 'Surprise Me!'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleSurpriseMe}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors disabled:opacity-50 ${className}`}
      title="Open a random recipe using MongoDB's $sample"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
      ) : (
        <Sparkles className="w-4 h-4 text-amber-600" />
      )}
      <span>{loading ? 'Picking...' : 'Surprise Me'}</span>
    </button>
  );
}

