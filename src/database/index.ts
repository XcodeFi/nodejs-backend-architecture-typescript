import Role, { RoleCode, RoleModel } from './model/Role';
import mongoose from 'mongoose';
import Logger from '../core/Logger';
import { db, environment } from '../config';
import UserRepo from './repository/UserRepo';
import RoleRepo from './repository/RoleRepo';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import User from './model/User';
import ApiRepo from './repository/ApiKeyRepo';
import ApiKey from './model/ApiKey';

// Build the connection string
const dbURI = `mongodb://${db.host}:${db.port}/${db.name}`;

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  autoIndex: true,
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

Logger.debug(dbURI);

// Create the database connection
mongoose
  .connect(dbURI, options)
  .then(() => {
    Logger.info('Mongoose connection done');

    if (environment === 'development') {
      seed('afteracademy-blog-db', 'afteracademy-blog-db-user', 'changeit');
    }
  })
  .catch((e) => {
    Logger.info('Mongoose connection error');
    Logger.error(e);
  });

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', () => {
  Logger.info('Mongoose default connection open to ' + dbURI);
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
  Logger.error('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  Logger.info('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    Logger.info('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

async function seed(dbName: string, user: string, password: string) {

  const isInitData = await RoleRepo.findByCode('ADMIN');
  
  if (isInitData)
    return
  
  const initRole = [
    { code: 'LEARNER', status: true, createdAt: new Date(), updatedAt: new Date() },
    { code: 'WRITER', status: true, createdAt: new Date(), updatedAt: new Date() },
    { code: 'EDITOR', status: true, createdAt: new Date(), updatedAt: new Date() },
    { code: 'ADMIN', status: true, createdAt: new Date(), updatedAt: new Date() },
  ] as Role[];

  initRole.forEach(async (t) => {
    await RoleRepo.create(t);
  });

  const accessTokenKey = crypto.randomBytes(64).toString('hex');
  const refreshTokenKey = crypto.randomBytes(64).toString('hex');
  const passwordHash = await bcrypt.hash(password, 10);

  const { user: createdUser, keystore } = await UserRepo.create(
    {
      name: user,
      email: user,
      profilePicUrl: user,
      password: passwordHash,
      updatedAt: new Date(),
    } as User,
    accessTokenKey,
    refreshTokenKey,
    'readWrite',
  );

  await ApiRepo.create({
    metadata: 'To be used by the xyz vendor',
    key: 'GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj',
    version: 1,
    status: true,
    updatedAt: new Date(),
  } as ApiKey);
}
