import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, Db, Document, MongoClient } from 'mongodb';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private client?: MongoClient;
  private database?: Db;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const uri = this.config.get<string>('MONGODB_URI');
    const dbName = this.config.get<string>('MONGODB_DB_NAME');

    if (!uri || !dbName || uri.includes('<db_password>')) {
      throw new Error('Set MONGODB_URI (with real credentials) and MONGODB_DB_NAME in this service .env');
    }

    this.client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
    try {
      await this.client.connect();
      this.database = this.client.db(dbName);
      await this.database.command({ ping: 1 });

      const courses = this.collection('courses');
      await courses.createIndex({ id: 1 }, { unique: true });
      if (await courses.countDocuments() === 0) {
        await courses.insertMany([
          { id: 1, name: 'Course 1', price: 100 },
          { id: 2, name: 'Course 2', price: 200 },
          { id: 3, name: 'Course 3', price: 300 },
        ]);
      }
      // Keep small numeric IDs so the API and gateway stay unchanged.
      const last = await courses.findOne({}, { sort: { id: -1 } });
      await this.collection<{ _id: string; value: number }>('counters').updateOne(
        { _id: 'courses' },
        { $max: { value: typeof last?.id === 'number' ? last.id : 0 } },
        { upsert: true },
      );
      console.log(`Connected to MongoDB database: ${dbName}`);
    } catch (error) {
      await this.client.close();
      throw error;
    }
  }

  collection<T extends Document = Document>(name: string): Collection<T> {
    if (!this.database) throw new Error('MongoDB connection is not ready');
    return this.database.collection<T>(name);
  }

  async nextId(name: string): Promise<number> {
    const counter = await this.collection<{ _id: string; value: number }>('counters')
      .findOneAndUpdate(
        { _id: name },
        { $inc: { value: 1 } },
        { upsert: true, returnDocument: 'after' },
      );
    if (!counter) throw new Error('Could not generate ID');
    return counter.value;
  }

  async onModuleDestroy() {
    await this.client?.close();
  }
}
