// LAYER: Database Code
// This module handles automatic database initialization and seeding on first run.

import { sampleRecipes } from './seedData.js';

/**
 * Seeds the recipes collection with sample Indian recipes if the collection is currently empty.
 * @param {import('mongodb').Db} db - The active MongoDB database instance
 * @returns {Promise<{ seeded: boolean, count: number }>} Result indicating whether seeding occurred
 */
export async function seedDatabaseIfNeeded(db) {
  try {
    const collection = db.collection('recipes');

    // Check if recipes already exist in the database
    const existingCount = await collection.countDocuments();

    if (existingCount === 0) {
      console.log('Database is empty. Seeding 5 sample Indian recipes...');
      
      // Ensure each recipe has its own distinct timestamp upon insertion
      const docsToInsert = sampleRecipes.map((r, idx) => ({
        ...r,
        createdAt: new Date(Date.now() - (sampleRecipes.length - idx) * 3600000),
      }));

      const result = await collection.insertMany(docsToInsert);
      console.log(`Successfully seeded ${result.insertedCount} recipes!`);
      return { seeded: true, count: result.insertedCount };
    }

    return { seeded: false, count: existingCount };
  } catch (error) {
    console.error('Error checking or seeding database:', error);
    throw error;
  }
}

