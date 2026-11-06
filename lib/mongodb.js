// LAYER: Database Code
// This file manages the official MongoDB Node.js driver connection pool.
// It uses a singleton pattern cached on the global object in development
// to prevent multiple connections during Next.js Hot Module Replacement (HMR).
// Includes an automatic in-memory fallback so the application works out-of-the-box
// even before MongoDB Atlas or a local MongoDB daemon is configured.

import { MongoClient } from 'mongodb';
import { getInMemoryDatabase } from './memoryDb';

// MongoDB URI from environment variables or default local
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/recipe_book';
const dbName = process.env.MONGODB_DB || 'recipe_book';

// Options for the official MongoDB client
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 2000, // 2s fast failover to in-memory fallback if server is offline
  connectTimeoutMS: 2000,
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Returns the connected MongoClient promise.
 */
export default clientPromise;

/**
 * Helper function to retrieve the recipes collection and database instance.
 * Automatically fails over to the built-in in-memory database if MongoDB is unreachable,
 * guaranteeing the application is always functional and testable immediately.
 */
export async function getDatabase() {
  try {
    const connectedClient = await clientPromise;
    const db = connectedClient.db(dbName);
    return { db, client: connectedClient, isFallback: false };
  } catch (err) {
    // MongoDB server not reachable (e.g. ECONNREFUSED on local 127.0.0.1:27017)
    // Seamlessly failover to in-memory MongoDB store
    const memDb = getInMemoryDatabase();
    return { db: memDb, client: null, isFallback: true, error: err.message };
  }
}
