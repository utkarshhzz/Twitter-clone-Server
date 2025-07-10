import express from 'express';
import bodyParser from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
const cors = require('cors');        
import { prismaClient } from '../clients/db';
import { User } from './user';
import { Tweet } from './Tweet';
import { GraphqlContext } from '../interfaces';
import JWTService from '../services/jwt';
 export async function initServer() {
    const app=express();
    app.use(bodyParser.json());
    app.use(cors());
    
    const graphqlServer = new ApolloServer<GraphqlContext>({
        typeDefs: `        
        ${User.types}
        ${Tweet.types}

        type Query {
        ${User.queries}
        ${Tweet.queries}
        sayHello:String 
        sayHelloToMe(name:String!): String
        }

        type Mutation {
        ${Tweet.mutations}
        ${User.mutations}
        }
        `,
        resolvers:{
            Query:{
                ...User.resolvers.queries,
                ...Tweet.resolvers.queries,
                
            },
            Mutation:{
                ...Tweet.resolvers.mutations,
                ...User.resolvers.mutations,
                
            },
            ...Tweet.resolvers.extraResolvers,
            ...User.resolvers.extraResolvers,
        },

    });
    await graphqlServer.start();
    app.use("/graphql",expressMiddleware(graphqlServer,{
        context:async ({req,res}) => {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader) {
                    return { user: null };
                }
                
                const token = authHeader.replace('Bearer ', '');
                if (!token) {
                    return { user: null };
                }
                
                const user = JWTService.decodeToken(token);
                return { user };
            } catch (error) {
                console.error('Token verification failed:', error);
                return {
                    user: null
                }
            }
        }
    }));
    return app;

}