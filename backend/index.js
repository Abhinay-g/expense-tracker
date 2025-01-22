import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { connectDB } from "./db/connectDB.js";

import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
dotenv.config();
const app = express();

const httpServer = http.createServer(app);


import mergedResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typedefs/index.js";
const server = new ApolloServer({
    typeDefs :mergedTypeDefs,
    resolvers :mergedResolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
})


await server.start();

app.use(
    '/',
    cors(),
    express.json(),
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(server, {
      context: async ({ req }) => ({ req }),
    }),
  );
  
  // Modified server startup
  await new Promise((resolve) =>
    httpServer.listen({ port: 4000 }, resolve),
  );
  await connectDB();
  console.log(`🚀 Server ready at http://localhost:4000/`);