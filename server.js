import path from 'path';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import cors from 'cors';
import models from './models';
import keys from './config/keys';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schema')));
const resolvers = mergeResolvers(fileLoader(path.join(__dirname, './resolvers')));

const app = express();
const endPoint = '/graphql';
const PORT = process.env.PORT || 5000;
app.use(cors('*'));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: {
    models,
    user: {
      id: 1,
    },
    SECRET: keys.SECRET,
    SECRET2: keys.SECRET2,
  },
});
server.applyMiddleware({ app, endPoint });

// Add { force: true } option to sync() to drop tables first
models.sequelize.sync().then(() => {
  app.listen(PORT, console.log(`Server running on port ${PORT}`));
});
