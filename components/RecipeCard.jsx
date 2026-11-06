// LAYER: Frontend Component
// Displays a single recipe in the home page grid with title, time, veg badge, and tags.

import Link from 'next/link';
import { Clock, ChefHat, ArrowUpRight } from 'lucide-react';
import VegBadge from './VegBadge';

export default function RecipeCard({ recipe }) {
  const { _id, title, minutes, veg, tags = [], ingredients = [], steps = [] } = recipe;
  const recipeId = _id.toString();

  return (
    <article className="group relative bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md hover:border-orange-200 transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Decorative top accent line */}
      <div
        className={`h-1.5 w-full ${
          veg ? 'bg-emerald-500' : 'bg-rose-500'
        }`}
      />

      <div className="p-5 flex-1 flex flex-col">
        {/* Top Badges: Veg indicator and Cooking Time */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <VegBadge veg={veg} />
          
          <div className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-stone-600" />
            <span>{minutes} mins</span>
          </div>
        </div>

        {/* Recipe Title with Clickable Link */}
        <h3 className="text-lg font-bold text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2">
          <Link href={`/recipes/${recipeId}`} className="focus:outline-hidden">
            <span className="absolute inset-0 z-10" aria-hidden="true" />
            {title}
          </Link>
        </h3>

        {/* Recipe Meta Info (ingredients & steps count) */}
        <p className="text-xs text-stone-600 mb-4 flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <ChefHat className="w-3.5 h-3.5 text-stone-600" />
            {ingredients.length} {ingredients.length === 1 ? 'ingredient' : 'ingredients'}
          </span>
          <span>•</span>
          <span>{steps.length} {steps.length === 1 ? 'step' : 'steps'}</span>
        </p>

        {/* Tags Pills */}
        <div className="mt-auto pt-3 border-t border-stone-100">
          <div className="flex flex-wrap gap-1.5 z-20 relative">
            {tags.slice(0, 4).map((tag, idx) => (
              <Link
                key={idx}
                href={`/?tag=${encodeURIComponent(tag)}`}
                className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                title={`Filter by "${tag}"`}
              >
                #{tag}
              </Link>
            ))}
            {tags.length > 4 && (
              <span className="text-[11px] text-stone-600 px-1 py-0.5">
                +{tags.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer with View Detail Link */}
      <div className="px-5 py-3 bg-stone-50/60 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
        <span className="font-medium text-stone-600">View preparation</span>
        <span className="inline-flex items-center gap-0.5 text-orange-600 font-semibold group-hover:translate-x-0.5 transition-transform">
          Details
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
}

