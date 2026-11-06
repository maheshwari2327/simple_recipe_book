// LAYER: Database Code (In-Memory Fallback Driver)
// Provides a zero-configuration fallback when a local MongoDB daemon or Atlas cluster
// is temporarily unreachable. Implements the official MongoDB collection interface
// so the rest of the application (APIs, Server Components, Filter, Surprise Me)
// continues to function seamlessly out of the box.

import { ObjectId } from 'mongodb';
import { sampleRecipes } from './seedData.js';

class InMemoryCollection {
  constructor(name) {
    this.name = name;
    // Initialize in-memory storage with the 5 authentic sample Indian recipes
    this.documents = sampleRecipes.map((r, idx) => ({
      ...r,
      _id: new ObjectId(),
      createdAt: new Date(Date.now() - (sampleRecipes.length - idx) * 3600000),
    }));
  }

  async countDocuments(filter = {}) {
    return this._filterDocs(filter).length;
  }

  async insertOne(doc) {
    const newDoc = {
      ...doc,
      _id: doc._id || new ObjectId(),
      createdAt: doc.createdAt || new Date(),
    };
    this.documents.unshift(newDoc);
    return { acknowledged: true, insertedId: newDoc._id };
  }

  async insertMany(docs) {
    const inserted = docs.map((doc) => ({
      ...doc,
      _id: doc._id || new ObjectId(),
      createdAt: doc.createdAt || new Date(),
    }));
    this.documents.unshift(...inserted);
    return { acknowledged: true, insertedCount: inserted.length };
  }

  async findOne(filter = {}) {
    const results = this._filterDocs(filter);
    return results.length > 0 ? { ...results[0] } : null;
  }

  find(filter = {}) {
    const filtered = this._filterDocs(filter);

    return {
      sort: (sortSpec = {}) => {
        const sorted = [...filtered];
        if (sortSpec.createdAt === -1) {
          sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortSpec.createdAt === 1) {
          sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }
        return {
          toArray: async () => sorted.map((d) => ({ ...d })),
        };
      },
      toArray: async () => filtered.map((d) => ({ ...d })),
    };
  }

  async distinct(field) {
    const set = new Set();
    this.documents.forEach((doc) => {
      const val = doc[field];
      if (Array.isArray(val)) {
        val.forEach((item) => set.add(item));
      } else if (val !== undefined && val !== null) {
        set.add(val);
      }
    });
    return Array.from(set);
  }

  aggregate(pipeline = []) {
    let result = [...this.documents];

    for (const stage of pipeline) {
      if (stage.$sample && stage.$sample.size) {
        const size = stage.$sample.size;
        // Randomly shuffle and select sample size
        const shuffled = [...result].sort(() => 0.5 - Math.random());
        result = shuffled.slice(0, size);
      }
    }

    return {
      toArray: async () => result.map((d) => ({ ...d })),
    };
  }

  async deleteMany(filter = {}) {
    if (Object.keys(filter).length === 0) {
      const count = this.documents.length;
      this.documents = [];
      return { acknowledged: true, deletedCount: count };
    }
    const before = this.documents.length;
    this.documents = this.documents.filter((doc) => !this._matches(doc, filter));
    return { acknowledged: true, deletedCount: before - this.documents.length };
  }

  _filterDocs(filter) {
    if (!filter || Object.keys(filter).length === 0) {
      return [...this.documents];
    }
    return this.documents.filter((doc) => this._matches(doc, filter));
  }

  _matches(doc, filter) {
    for (const [key, expected] of Object.entries(filter)) {
      if (key === '_id') {
        const targetId = expected?.toString();
        const docId = doc._id?.toString();
        if (docId !== targetId) return false;
      } else if (key === 'veg') {
        if (doc.veg !== expected) return false;
      } else if (key === 'tags') {
        if (expected?.$regex) {
          const regex = expected.$regex;
          const hasMatch = Array.isArray(doc.tags) && doc.tags.some((t) => regex.test(t));
          if (!hasMatch) return false;
        } else if (Array.isArray(doc.tags)) {
          if (!doc.tags.includes(expected)) return false;
        }
      } else if (key === 'title') {
        if (expected?.$regex) {
          if (!expected.$regex.test(doc.title)) return false;
        } else if (doc.title !== expected) {
          return false;
        }
      }
    }
    return true;
  }
}

class InMemoryDatabase {
  constructor(name) {
    this.databaseName = name;
    this.collections = {};
  }

  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new InMemoryCollection(name);
    }
    return this.collections[name];
  }
}

// Global cached in-memory database singleton across HMR module reloads
if (!global._inMemoryMongoDb) {
  global._inMemoryMongoDb = new InMemoryDatabase('recipe_book');
}

export function getInMemoryDatabase() {
  return global._inMemoryMongoDb;
}

