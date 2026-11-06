// LAYER: Backend API (Next.js Route Handler)
// Stretch Goal Feature: Picks a random recipe using MongoDB's `$sample` aggregation stage.

import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { seedDatabaseIfNeeded } from '@/lib/seed';

// Force dynamic evaluation so it is never statically evaluated at build time
export const dynamic = 'force-dynamic';

/**
 * GET /api/recipes/random
 * Returns a single random recipe from the collection using MongoDB's $sample aggregation operator.
 * Perfect for the "Surprise me" button!
 */
export async function GET() {
  try {
    // 1. Establish database connection
    const { db } = await getDatabase();

    // 2. Ensure database has seed data if empty
    await seedDatabaseIfNeeded(db);

    // 3. Use MongoDB $sample aggregation pipeline to randomly select 1 recipe
    const randomRecipes = await db
      .collection('recipes')
      .aggregate([{ $sample: { size: 1 } }])
      .toArray();

    // 4. Check if any recipe was returned
    if (!randomRecipes || randomRecipes.length === 0) {
      return NextResponse.json(
        { error: 'No recipes found in the database.' },
        { status: 404 }
      );
    }

    const randomRecipe = randomRecipes[0];

    // 5. Return 200 OK with recipe and its ID for client routing
    return NextResponse.json(
      {
        id: randomRecipe._id.toString(),
        recipe: randomRecipe,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/recipes/random error:', error);
    return NextResponse.json(
      {
        error: 'Failed to pick a random recipe. Please check database connection.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
