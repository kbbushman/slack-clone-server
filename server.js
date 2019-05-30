import path from 'path';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import models from './models';
import keys from './config/keys';
import setCurrentUser from './middleware/setCurrentUser';

const app = express();
const PORT = process.env.PORT || 5000;

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schema')));
const resolvers = mergeResolvers(fileLoader(path.join(__dirname, './resolvers')));
const endPoint = '/graphql';

// CORS Middleware
app.use(cors('*'));

// Auth Middleware
app.use((req, res, next) => setCurrentUser(req, res, next));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    models,
    user: req.currentUser,
    SECRET: keys.SECRET,
    SECRET2: keys.SECRET2,
  }),
});
server.applyMiddleware({ app, endPoint });

// Add { force: true } option to sync() to drop tables first
models.sequelize.sync().then(() => {
  app.listen(PORT, console.log(`Server running on port ${PORT}`));
});
