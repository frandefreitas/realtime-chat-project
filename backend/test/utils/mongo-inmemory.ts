import { MongoMemoryServer } from 'mongodb-memory-server';

export async function startInMemoryMongo() {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  return mongoServer;
}

export async function stopInMemoryMongo(mongoServer: MongoMemoryServer) {
  await mongoServer.stop();
}
