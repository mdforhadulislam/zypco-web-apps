import mongoose from 'mongoose';

declare global { 
  var mongoose: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
}

const MONGODB_URI: string = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB(): Promise<mongoose.Mongoose> {
  if (cached.conn) {
    // Already connected
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,      // Disable mongoose buffering
      useNewUrlParser: true,      // New parser
      useUnifiedTopology: true,   // Recommended
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    }).catch((err) => {
      cached.promise = null;
      console.error('MongoDB connection error:', err);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
