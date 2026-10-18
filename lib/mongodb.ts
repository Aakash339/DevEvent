import mongoose, { type Mongoose } from "mongoose";

function getMongoDbUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }
  return uri;
}

const MONGODB_URI = getMongoDbUri();

// Keep the connection promise on globalThis so hot reloads reuse it in development.
type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cached = (globalWithMongoose.mongooseCache ??= {
  conn: null,
  promise: null,
});

async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Allow a later request to retry after a failed connection attempt.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
