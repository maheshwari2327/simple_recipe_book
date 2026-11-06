// LAYER: Backend API (Next.js Route Handler)
// Handles recipe list retrieval (with tag/veg filtering) and new recipe creation.

import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { seedDatabaseIfNeeded } from '@/lib/seed';

// Force dynamic evaluation so it is never statically evaluated at build time
export const dynamic = 'force-dynamic';

/**
 * GET /api/recipes
 * Retrieves a list of recipes with optional filters:
 * - ?tag=<string>   Filters recipes that contain this tag (case-insensitive)
 * - ?veg=<boolean>  Filters recipes by veg status ("true" or "false")
 * Automatically seeds the database on first run if it is empty.
 */
export async function GET(request) {
  try {
    // 1. Establish database connection
    const { db } = await getDatabase();

    // 2. Automatically seed 5 sample Indian recipes on first run if collection is empty
    await seedDatabaseIfNeeded(db);

    // 3. Parse search parameters from request URL
    const { searchParams } = new URL(request.url);
    const tagQuery = searchParams.get('tag')?.trim();
    const vegQuery = searchParams.get('veg')?.trim();

    // 4. Construct MongoDB query filter
    const query = {};

    // Filter by vegetarian status if provided
    if (vegQuery === 'true') {
      query.veg = true;
    } else if (vegQuery === 'false') {
      query.veg = false;
    }

    // Filter by tag using case-insensitive regex matching against tags array
    if (tagQuery) {
      query.tags = {
        $regex: new RegExp(`^${escapeRegex(tagQuery)}$`, 'i'),
      };
    }

    // 5. Query MongoDB collection, sorting by newest first
    const recipes = await db
      .collection('recipes')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // 6. Return standard 200 OK with the array of recipes
    return NextResponse.json({ recipes }, { status: 200 });
  } catch (error) {
    console.error('GET /api/recipes error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve recipes. Please check database connection.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recipes
 * Creates a new recipe after validating required fields.
 * Expected payload:
 * {
 *   title: string,
 *   minutes: number,
 *   veg: boolean,
 *   tags: string[] | string (comma-separated),
 *   ingredients: string[] | string (line-separated),
 *   steps: string[] | string (line-separated)
 * }
 */
export async function POST(request) {
  try {
    // 1. Parse request JSON body safely
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload received in request body.' },
        { status: 400 }
      );
    }

    const { title, minutes, veg, tags, ingredients, steps } = body;

    // 2. Validate Title
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Recipe title is required and must not be empty.' },
        { status: 400 }
      );
    }

    // 3. Validate Cooking Time in Minutes
    const parsedMinutes = Number(minutes);
    if (isNaN(parsedMinutes) || parsedMinutes <= 0 || !Number.isInteger(parsedMinutes)) {
      return NextResponse.json(
        { error: 'Cooking time must be a positive integer in minutes.' },
        { status: 400 }
      );
    }

    // 4. Validate Veg flag
    if (typeof veg !== 'boolean') {
      return NextResponse.json(
        { error: 'Veg property is required and must be a boolean (true or false).' },
        { status: 400 }
      );
    }

    // 5. Normalize and validate Tags
    let parsedTags = [];
    if (Array.isArray(tags)) {
      parsedTags = tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean);
    } else if (typeof tags === 'string') {
      parsedTags = tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
    }

    // 6. Normalize and validate Ingredients
    let parsedIngredients = [];
    if (Array.isArray(ingredients)) {
      parsedIngredients = ingredients.map((i) => String(i).trim()).filter(Boolean);
    } else if (typeof ingredients === 'string') {
      parsedIngredients = ingredients
        .split('\n')
        .map((i) => i.trim())
        .filter(Boolean);
    }

    if (parsedIngredients.length === 0) {
      return NextResponse.json(
        { error: 'At least one ingredient is required.' },
        { status: 400 }
      );
    }

    // 7. Normalize and validate Steps
    let parsedSteps = [];
    if (Array.isArray(steps)) {
      parsedSteps = steps.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof steps === 'string') {
      parsedSteps = steps
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (parsedSteps.length === 0) {
      return NextResponse.json(
        { error: 'At least one preparation step is required.' },
        { status: 400 }
      );
    }

    // 8. Prepare clean recipe document matching data model
    const newRecipe = {
      title: title.trim(),
      minutes: parsedMinutes,
      veg: Boolean(veg),
      tags: parsedTags,
      ingredients: parsedIngredients,
      steps: parsedSteps,
      createdAt: new Date(),
    };

    // 9. Insert into MongoDB collection
    const { db } = await getDatabase();
    const result = await db.collection('recipes').insertOne(newRecipe);

    // 10. Return 201 Created status with the newly inserted recipe
    return NextResponse.json(
      {
        message: 'Recipe created successfully',
        recipe: {
          _id: result.insertedId,
          ...newRecipe,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/recipes error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create recipe. Please check database connection.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Helper to escape special characters for safe regular expression queries
 */
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
