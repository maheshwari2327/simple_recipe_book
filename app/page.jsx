// LAYER: Frontend (React Server Component)
// Home Page: Server-rendered recipe grid, tag filtering, veg-only toggle, and seed initialization.

import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import { seedDatabaseIfNeeded } from '@/lib/seed';
import RecipeCard from '@/components/RecipeCard';
import FilterBar from '@/components/FilterBar';
import SurpriseMeButton from '@/components/SurpriseMeButton';
import { ChefHat, PlusCircle, Sparkles, Database, CheckCircle2 } from 'lucide-react';

// Force dynamic server rendering so URL filters take effect immediately on request
export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }) {
  // Await searchParams as per Next.js App Router conventions
  const resolvedSearchParams = await searchParams;
  const tagParam = resolvedSearchParams?.tag?.trim();
  const vegParam = resolvedSearchParams?.veg?.trim();
  const queryParam = resolvedSearchParams?.q?.trim();

  let recipes = [];
  let allTags = [];
  let isFallbackMode = false;
  let dbError = null;

  try {
    // 1. Establish MongoDB connection (or in-memory fallback if MongoDB server is offline)
    const dbResult = await getDatabase();
    const db = dbResult.db;
    isFallbackMode = Boolean(dbResult.isFallback);

    // 2. Automatically seed 5 sample Indian recipes on first run if database is empty
    await seedDatabaseIfNeeded(db);

    // 3. Build MongoDB query filter based on search params
    const filter = {};

    // Filter by Vegetarian status
    if (vegParam === 'true') {
      filter.veg = true;
    } else if (vegParam === 'false') {
      filter.veg = false;
    }

    // Filter by Tag (case-insensitive exact match in tags array)
    if (tagParam) {
      filter.tags = {
        $regex: new RegExp(`^${escapeRegex(tagParam)}$`, 'i'),
      };
    }

    // Filter by keyword query in title if provided
    if (queryParam) {
      filter.title = {
        $regex: new RegExp(escapeRegex(queryParam), 'i'),
      };
    }

    // 4. Fetch filtered recipes from collection
    recipes = await db
      .collection('recipes')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    // 5. Gather all distinct tags across recipes to populate tag filter pills
    allTags = await db.collection('recipes').distinct('tags');
    allTags = (allTags || []).filter(Boolean).sort();
  } catch (err) {
    console.error('HomePage Server Fetch Error:', err.message);
    dbError = err.message;
  }

  return (
    <div className="space-y-8">
      {/* Notice if running in fallback in-memory mode */}
      {isFallbackMode && (
        <aside aria-label="Demo mode status" className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <p>
              <strong>Live In-Memory Mode Active:</strong> All 5 Indian recipes, filters, detail views, and adding recipes are fully functional! (To persist data across server restarts, connect to MongoDB Atlas in <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">.env.local</code>).
            </p>
          </div>
          <Link
            href="/add"
            className="hidden sm:inline-flex shrink-0 font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2"
          >
            Try Adding a Recipe →
          </Link>
        </aside>
      )}

      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-10 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Authentic Indian Cooking</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Delicious Flavors, <br />
            Curated at Your Fingertips.
          </h1>

          <p className="text-sm sm:text-base text-amber-100 leading-relaxed">
            Explore authentic Indian curries, breakfast classics, and rich comfort foods.
            All recipes are rendered on the server and persisted in MongoDB.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-white text-orange-600 hover:bg-orange-50 shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Your Recipe</span>
            </Link>

            {/* Stretch Goal: Surprise Me hero button */}
            <SurpriseMeButton variant="hero" />
          </div>
        </div>

        {/* Decorative background watermark */}
        <ChefHat className="absolute -right-8 -bottom-8 w-64 h-64 text-white/10 pointer-events-none transform -rotate-12" />
      </section>

      {/* Database Error Alert (Shown only if catastrophic error occurs) */}
      {dbError && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-900 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-base text-amber-900">
                Database Notice
              </h3>
              <p className="text-sm text-amber-800 leading-relaxed">
                {dbError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      {!dbError && (
        <FilterBar allTags={allTags} totalCount={recipes.length} />
      )}

      {/* Recipe Grid Header */}
      {!dbError && (
        <div className="flex items-center justify-between pb-2">
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              {tagParam ? `Recipes tagged #${tagParam}` : vegParam === 'true' ? 'Vegetarian Recipes' : 'All Recipes'}
            </h2>
            <p className="text-xs text-stone-600">
              Showing {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
            </p>
          </div>
        </div>
      )}

      {/* Recipe Cards Grid */}
      {!dbError && recipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe._id.toString()} recipe={recipe} />
          ))}
        </div>
      )}

      {/* Empty State when no recipes match filters */}
      {!dbError && recipes.length === 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
            <ChefHat className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-2">
            No recipes found
          </h3>
          <p className="text-sm text-stone-600 mb-6">
            We couldn&apos;t find any recipes matching your current filter criteria. Try resetting the filters or add a brand new recipe!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
            >
              Reset Filters
            </Link>
            <Link
              href="/add"
              className="w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-colors"
            >
              + Add First Recipe
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Escapes special regex characters
 */
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
