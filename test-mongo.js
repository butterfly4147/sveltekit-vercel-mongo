// Simple test script to check MongoDB connection
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

async function testMongoConnection() {
  console.log('Starting MongoDB connection test...');
  console.log('Current working directory:', process.cwd());

  // Try to read .env.local directly
  try {
    const envLocalPath = path.join(process.cwd(), '.env.local');
    console.log('Looking for .env.local at:', envLocalPath);
    if (fs.existsSync(envLocalPath)) {
      console.log('.env.local file exists');
      const envContent = fs.readFileSync(envLocalPath, 'utf8');
      console.log('.env.local content (first line):', envContent.split('\n')[0]);
    } else {
      console.log('.env.local file does not exist');
    }
  } catch (err) {
    console.error('Error checking .env.local file:', err);
  }

  // Load environment variables
  dotenv.config({ path: '.env.local' });
  dotenv.config();

  console.log('MONGODB_URI available:', !!process.env.MONGODB_URI);
  
  // Get MongoDB URI from environment variable
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MongoDB URI not found in environment variables!');
    console.error('Available environment variables:', Object.keys(process.env));
    return;
  }

  // Log the MongoDB URI host part (not credentials)
  const uriParts = uri.split('@');
  if (uriParts.length > 1) {
    console.log('MongoDB URI host part:', uriParts[uriParts.length - 1]);
  }

  // Setup MongoDB connection options
  const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  };

  let client = null;
  try {
    console.log('Attempting to connect to MongoDB...');
    client = new MongoClient(uri, options);
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    
    // List databases to confirm connection
    const dbs = await client.db().admin().listDatabases();
    console.log('Available databases:');
    dbs.databases.forEach(db => console.log(` - ${db.name}`));
    
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Need to wrap in an async IIFE to use await at the top level
(async () => {
  try {
    await testMongoConnection();
  } catch (error) {
    console.error('Test failed with error:', error);
  }
})();
