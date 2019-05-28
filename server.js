import path from 'path';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import models from './models';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schema')));
const resolvers = mergeResolvers(fileLoader(path.join(__dirname, './resolvers')));

const app = express();
const endPoint = '/graphql';
const PORT = process.env.PORT || 5000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: {
    models,
    user: {
      id: 1,
    },
  },
});
server.applyMiddleware({ app, endPoint });

// Add { force: true } option to sync() to drop tables first
models.sequelize.sync().then(() => {
  app.listen(PORT, console.log(`Server running on port ${PORT}`));
});
