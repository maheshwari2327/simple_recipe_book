// LAYER: Frontend (Client Component Form)
// "Add recipe" page with form inputs for title, minutes, veg (yes/no), tags, ingredients, and steps.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import VegBadge from '@/components/VegBadge';

export default function AddRecipePage() {
  const router = useRouter();

  // Form input state
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('');
  const [veg, setVeg] = useState(true);
  const [tags, setTags] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');

  // Submission UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Pre-fill a sample Indian recipe for rapid testing
  function handleFillSample() {
    setTitle('Palak Paneer (Spinach Cottage Cheese)');
    setMinutes('30');
    setVeg(true);
    setTags('spinach, paneer, north-indian, healthy, vegetarian');
    setIngredients(
      '500g fresh spinach leaves (palak)\n250g paneer cubes\n1 large onion, finely chopped\n2 green chilies\n1 tbsp ginger-garlic paste\n2 medium tomatoes, pureed\n1/2 tsp cumin seeds\n1/2 tsp turmeric powder\n1 tsp garam masala\n2 tbsp fresh cream or butter\nSalt to taste'
    );
    setSteps(
      'Blanch washed spinach leaves in boiling water for 2 minutes, then transfer to ice water to retain vibrant green color.\nBlend blanched spinach with green chilies into a smooth puree.\nHeat butter or ghee in a pan, add cumin seeds, chopped onions, and ginger-garlic paste; sauté until light golden.\nAdd tomato puree, turmeric, and salt; cook until oil starts separating.\nStir in the spinach puree and cook gently on medium-low for 5 minutes.\nAdd paneer cubes and garam masala; simmer for 3 minutes.\nSwirl in fresh cream and serve hot with garlic naan or roti.'
    );
    setErrorMessage('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Basic client validation
    if (!title.trim()) {
      setErrorMessage('Please provide a recipe title.');
      return;
    }
    const numMinutes = Number(minutes);
    if (!numMinutes || numMinutes <= 0) {
      setErrorMessage('Please provide a valid cooking time in minutes (greater than 0).');
      return;
    }
    if (!ingredients.trim()) {
      setErrorMessage('Please add at least one ingredient (one per line).');
      return;
    }
    if (!steps.trim()) {
      setErrorMessage('Please add at least one step (one per line).');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send POST request to backend route handler
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          minutes: numMinutes,
          veg: Boolean(veg),
          tags: tags,
          ingredients: ingredients,
          steps: steps,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to create recipe. Please check your inputs.');
        setIsSubmitting(false);
        return;
      }

      // Success feedback
      setSuccessMessage('Recipe created successfully! Redirecting...');
      
      // Redirect to the newly created recipe page
      const newId = data.recipe?._id;
      if (newId) {
        setTimeout(() => {
          router.push(`/recipes/${newId}`);
        }, 600);
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('Submit recipe error:', err);
      setErrorMessage('Network or server error occurred. Please verify your connection.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Navigation & Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-orange-600 transition-colors group mb-4"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Recipes</span>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Add a New Recipe
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Share your favorite culinary creation with ingredients and step-by-step instructions.
            </p>
          </div>

          {/* Quick Demo Pre-fill button */}
          <button
            type="button"
            onClick={handleFillSample}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors"
            title="Auto-fill with sample Palak Paneer recipe"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fill Sample</span>
          </button>
        </div>
      </div>

      {/* Error / Success Feedback Banners */}
      {errorMessage && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-medium">
          {successMessage}
        </div>
      )}

      {/* Recipe Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-stone-800 mb-1.5">
            Recipe Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            placeholder="e.g., Amritsari Chole Bhature"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-stone-600"
          />
        </div>

        {/* Time and Veg / Non-Veg Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Cooking Time in Minutes */}
          <div>
            <label htmlFor="minutes" className="block text-sm font-bold text-stone-800 mb-1.5">
              Cooking Time (Minutes) <span className="text-rose-500">*</span>
            </label>
            <input
              id="minutes"
              type="number"
              min="1"
              required
              placeholder="e.g., 35"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-stone-600"
            />
          </div>

          {/* Veg (Yes/No) Selector */}
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-1.5">
              Dietary Classification <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {/* Veg Option */}
              <button
                type="button"
                onClick={() => setVeg(true)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  veg
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <VegBadge veg={true} showLabel={false} size="sm" />
                <span>Vegetarian (Yes)</span>
              </button>

              {/* Non-Veg Option */}
              <button
                type="button"
                onClick={() => setVeg(false)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  !veg
                    ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <VegBadge veg={false} showLabel={false} size="sm" />
                <span>Non-Veg (No)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-bold text-stone-800 mb-1.5">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            type="text"
            placeholder="e.g., curry, north-indian, spicy, quick"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-stone-600"
          />
          <p className="text-[11px] text-stone-600 mt-1">
            Separate multiple tags with commas. Tags help filter recipes on the home page.
          </p>
        </div>

        {/* Ingredients (one per line) */}
        <div>
          <label htmlFor="ingredients" className="block text-sm font-bold text-stone-800 mb-1.5">
            Ingredients (one per line) <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="ingredients"
            required
            rows={5}
            placeholder={'2 cups basmati rice\n500g chicken or vegetables\n2 tbsp pure ghee\n1 large onion, sliced\n1 tsp garam masala\nSalt to taste'}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-stone-600 font-mono"
          />
          <p className="text-[11px] text-stone-600 mt-1">
            Press Enter after each ingredient. Each new line becomes a distinct checklist item.
          </p>
        </div>

        {/* Steps (one per line) */}
        <div>
          <label htmlFor="steps" className="block text-sm font-bold text-stone-800 mb-1.5">
            Cooking Steps (one per line) <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="steps"
            required
            rows={5}
            placeholder={'Wash and soak the basmati rice for 30 minutes.\nHeat ghee in a heavy pot and sauté sliced onions until golden.\nAdd spices and cook for 2 minutes until fragrant.\nAdd 4 cups of water and bring to a rolling boil.\nCover with a tight lid and simmer on low heat for 15 minutes.'}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-stone-600 font-mono"
          />
          <p className="text-[11px] text-stone-600 mt-1">
            Press Enter after each cooking instruction. Each line is displayed as a numbered step.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Recipe...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Save Recipe</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

