import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";

import { connectDB } from "./db/connectDB.js";

import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import passport from "passport";
import session from "express-session";
import connectMongo from "connect-mongodb-session";
import { buildContext } from "graphql-passport";
import mergedTypeDefs from "./typedefs/index.js";
import mergedResolvers from "./resolvers/index.js";
import { configurePassport } from "./passport/passport.config.js";

dotenv.config();
configurePassport(); // auth system
const app = express();

const httpServer = http.createServer(app);
const MongoDBStore = connectMongo(session); // auth system
const store = new MongoDBStore({
	uri: process.env.MONGO_URI,
	collection: "sessions",
}); // auth system

store.on("error", (err) => console.log(err)); // auth system
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false, // this option specifies whether to save the session to the store on every request
		saveUninitialized: false, // option specifies whether to save uninitialized sessions
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 7,
			httpOnly: true, // this option prevents the Cross-Site Scripting (XSS) attacks
		},
		store: store,
	})
); // auth system

app.use(passport.initialize()); // auth system
app.use(passport.session()); // auth system

const server = new ApolloServer({
    typeDefs :mergedTypeDefs,
    resolvers :mergedResolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
})


await server.start();

app.use(
    '/',
    cors({
		origin: "http://localhost:3000",
		credentials: true,
	}),
    express.json(),
    expressMiddleware(server, {
        context: async ({ req, res }) => buildContext({ req, res }),
    }),
  );
  
  await new Promise((resolve) =>
    httpServer.listen({ port: 4000 }, resolve),
  );
  await connectDB();
  console.log(`🚀 Server ready at http://localhost:4000/`);