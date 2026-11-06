// LAYER: Frontend (React Server Component)
// Recipe Detail Page: Renders full recipe information, ingredients checklist, and step-by-step instructions.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import VegBadge from '@/components/VegBadge';
import IngredientsList from '@/components/IngredientsList';
import { ArrowLeft, Clock, Calendar, ChefHat, CheckCircle2, AlertTriangle, Database } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id || !ObjectId.isValid(id)) {
      return { title: 'Recipe Not Found - Desi Rasoi' };
    }

    const { db } = await getDatabase();
    const recipe = await db.collection('recipes').findOne({ _id: new ObjectId(id) });
    if (!recipe) return { title: 'Recipe Not Found - Desi Rasoi' };
    return {
      title: `${recipe.title} - Desi Rasoi Recipe Book`,
      description: `Learn how to cook ${recipe.title} in ${recipe.minutes} minutes.`,
    };
  } catch {
    return { title: 'Recipe Details - Desi Rasoi' };
  }
}

export default async function RecipeDetailPage({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Validate ObjectId format
  if (!id || !ObjectId.isValid(id)) {
    notFound();
  }

  let recipe = null;
  let dbError = null;

  try {
    const { db } = await getDatabase();
    recipe = await db.collection('recipes').findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error('Error fetching recipe detail:', error.message);
    dbError = error.message;
  }

  if (dbError) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Recipes</span>
        </Link>
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-amber-900 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-base mb-1">Database Connection Required</h2>
              <p className="text-sm text-amber-800">
                Could not connect to MongoDB to load this recipe. Please verify your MongoDB connection string in <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    notFound();
  }

  const { title, minutes, veg, tags = [], ingredients = [], steps = [], createdAt } = recipe;

  // Format creation date
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-orange-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Recipes</span>
        </Link>
      </div>

      {/* Main Recipe Header Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <VegBadge veg={veg} size="lg" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-stone-600" />
            <span>{minutes} minutes</span>
          </div>

          {formattedDate && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-50 text-stone-600 text-xs font-medium border border-stone-200">
              <Calendar className="w-3.5 h-3.5" />
              <span>Added {formattedDate}</span>
            </div>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mb-4">
          {title}
        </h1>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
            {tags.map((tag, idx) => (
              <Link
                key={idx}
                href={`/?tag=${encodeURIComponent(tag)}`}
                className="text-xs font-medium px-3 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-100 hover:bg-orange-100 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Content: Ingredients & Steps */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Ingredients Column (5 cols on desktop) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-orange-600" />
                <span>Ingredients</span>
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                {ingredients.length} items
              </span>
            </div>

            <p className="text-xs text-stone-600 mb-4">
              Tap any ingredient to cross it off as you cook:
            </p>

            <IngredientsList ingredients={ingredients} />
          </div>
        </div>

        {/* Steps Column (7 cols on desktop) */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-orange-600" />
                <span>Step-by-Step Instructions</span>
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                {steps.length} steps
              </span>
            </div>

            <ol className="space-y-4">
              {steps.map((step, index) => (
                <li
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 hover:border-orange-200 transition-colors"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-orange-600 text-white font-bold text-xs shrink-0 shadow-xs">
                    {index + 1}
                  </span>
                  <p className="text-sm text-stone-800 leading-relaxed pt-0.5">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
