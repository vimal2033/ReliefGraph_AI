/**
 * ReliefGraph Resilient In-Memory Storage Engine
 * Provides transparent zero-configuration fallback when MongoDB is not running locally.
 */

export class MockObjectId {
  constructor(id) {
    this.id = id ? String(id) : Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  }
  toString() {
    return this.id;
  }
  toJSON() {
    return this.id;
  }
  equals(other) {
    if (!other) return false;
    return String(this) === String(other);
  }
}

function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr == null) return undefined;
    curr = curr[part];
  }
  return curr;
}

function matchValue(actual, expected) {
  if (expected === undefined) return true;
  if (expected instanceof MockObjectId || actual instanceof MockObjectId) {
    return String(actual) === String(expected);
  }
  if (expected !== null && typeof expected === 'object' && !Array.isArray(expected)) {
    if ('$in' in expected && Array.isArray(expected.$in)) {
      return expected.$in.some((item) => matchValue(actual, item));
    }
    if ('$ne' in expected) {
      return !matchValue(actual, expected.$ne);
    }
  }
  return String(actual) === String(expected);
}

function matchesFilter(doc, query = {}) {
  if (!query || Object.keys(query).length === 0) return true;
  for (const [key, val] of Object.entries(query)) {
    const actual = getNestedValue(doc, key);
    if (!matchValue(actual, val)) {
      return false;
    }
  }
  return true;
}

export class MemoryCollection {
  constructor(name) {
    this.name = name;
    this.docs = [];
  }

  createDoc(data = {}) {
    const rawId = data._id || new MockObjectId();
    const docId = rawId instanceof MockObjectId ? rawId : new MockObjectId(rawId);

    const doc = {
      ...data,
      _id: docId,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
    };

    const self = this;
    doc.save = async function () {
      doc.updatedAt = new Date();
      const existingIdx = self.docs.findIndex((d) => String(d._id) === String(doc._id));
      if (existingIdx >= 0) {
        self.docs[existingIdx] = doc;
      } else {
        self.docs.push(doc);
      }
      return doc;
    };

    return doc;
  }

  async countDocuments(query = {}) {
    return this.docs.filter((d) => matchesFilter(d, query)).length;
  }

  find(query = {}) {
    let result = this.docs
      .filter((d) => matchesFilter(d, query))
      .map((d) => this.createDoc(d));

    const chain = {
      sort(sortCriteria = {}) {
        const [field, order] = Object.entries(sortCriteria)[0] || [];
        if (field) {
          result.sort((a, b) => {
            const valA = getNestedValue(a, field);
            const valB = getNestedValue(b, field);
            if (valA < valB) return order === -1 ? 1 : -1;
            if (valA > valB) return order === -1 ? -1 : 1;
            return 0;
          });
        }
        return chain;
      },
      limit(n) {
        result = result.slice(0, n);
        return chain;
      },
      then(resolve, reject) {
        return Promise.resolve(result).then(resolve, reject);
      },
      catch(reject) {
        return Promise.resolve(result).catch(reject);
      },
    };

    return chain;
  }

  async findOne(query = {}) {
    const found = this.docs.find((d) => matchesFilter(d, query));
    return found ? this.createDoc(found) : null;
  }

  async findById(id) {
    const strId = String(id);
    const found = this.docs.find((d) => String(d._id) === strId);
    return found ? this.createDoc(found) : null;
  }

  async insertMany(items = []) {
    const inserted = [];
    for (const item of items) {
      const doc = this.createDoc(item);
      this.docs.push(doc);
      inserted.push(doc);
    }
    return inserted;
  }

  async updateOne(query, update = {}) {
    const doc = this.docs.find((d) => matchesFilter(d, query));
    if (doc) {
      const setVals = update.$set || update;
      Object.assign(doc, setVals);
      doc.updatedAt = new Date();
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  }

  async updateMany(query, update = {}) {
    let count = 0;
    const setVals = update.$set || update;
    for (const doc of this.docs) {
      if (matchesFilter(doc, query)) {
        Object.assign(doc, setVals);
        doc.updatedAt = new Date();
        count++;
      }
    }
    return { modifiedCount: count };
  }

  async findByIdAndUpdate(id, update = {}) {
    const doc = await this.findById(id);
    if (doc) {
      const setVals = update.$set || update;
      Object.assign(doc, setVals);
      await doc.save();
      return doc;
    }
    return null;
  }

  async deleteMany(query = {}) {
    const before = this.docs.length;
    this.docs = this.docs.filter((d) => !matchesFilter(d, query));
    return { deletedCount: before - this.docs.length };
  }
}

// Global registry of memory collections
export const memoryStore = {
  shelters: new MemoryCollection('Shelter'),
  reports: new MemoryCollection('Report'),
  dispatches: new MemoryCollection('Dispatch'),
  needs: new MemoryCollection('Need'),
  alerts: new MemoryCollection('Alert'),
};

/**
 * Creates a hybrid proxy that delegates to Mongoose when connected,
 * or seamlessly falls back to memoryCollection when disconnected.
 */
export function createHybridModel(MongooseModel, memoryColl) {
  return new Proxy(MongooseModel, {
    construct(target, args) {
      const isConnected = target.db?.readyState === 1;
      if (isConnected) {
        return new target(...args);
      }
      return memoryColl.createDoc(args[0] || {});
    },
    get(target, prop) {
      const isConnected = target.db?.readyState === 1;
      if (isConnected) {
        return target[prop];
      }
      if (prop in memoryColl) {
        const val = memoryColl[prop];
        return typeof val === 'function' ? val.bind(memoryColl) : val;
      }
      return target[prop];
    },
  });
}
