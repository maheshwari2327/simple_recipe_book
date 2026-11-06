// LAYER: Backend API (Next.js Route Handler)
// Handles single recipe retrieval by its MongoDB ObjectId.

import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';

/**
 * GET /api/recipes/[id]
 * Retrieves a single recipe by its unique MongoDB ObjectId.
 * Validates ObjectId format and returns appropriate HTTP status codes (200, 400, 404, 500).
 */
export async function GET(request, context) {
  try {
    // 1. In Next.js App Router, params can be an object or promise
    const params = await context.params;
    const { id } = params;

    // 2. Validate MongoDB ObjectId format
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid recipe ID format. Must be a 24-character hexadecimal string.' },
        { status: 400 }
      );
    }

    // 3. Connect to database
    const { db } = await getDatabase();

    // 4. Query the recipe by _id
    const recipe = await db.collection('recipes').findOne({
      _id: new ObjectId(id),
    });

    // 5. If recipe does not exist, return 404 Not Found
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found with the specified ID.' },
        { status: 404 }
      );
    }

    // 6. Return 200 OK with recipe document
    return NextResponse.json({ recipe }, { status: 200 });
  } catch (error) {
    console.error(`GET /api/recipes/[id] error:`, error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve recipe details. Please check database connection.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

