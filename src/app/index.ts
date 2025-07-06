import express from 'express';
import bodyParser from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
const cors = require('cors');        
import { prismaClient } from '../clients/db';
import { User } from './user';
 export async function initServer() {
    const app=express();
    app.use(bodyParser.json());
    app.use(cors());
    
    const graphqlServer = new ApolloServer({
        typeDefs: `
        ${User.types}

        type Query {
        ${User.queries}
        sayHello:String
        sayHelloToMe(name:String!): String
        }
        `,
        resolvers:{
            Query:{
                ...User.resolvers.queries,
                
            },
        },

    });
    await graphqlServer.start();
    app.use("/graphql",expressMiddleware(graphqlServer));
    return app;

}