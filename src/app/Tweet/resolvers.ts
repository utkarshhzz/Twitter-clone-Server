import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";

interface CreateTweetPayload{
    content: string;
    imageURL?: string;
}

const mutations={
    createTweet:async (parent: any, { content, imageURL }: { content: string; imageURL?: string }, ctx: GraphqlContext) => {
        if (!ctx.user) 
            throw new Error("You must be logged in to create a tweet.");
        
        const tweet = await prismaClient.tweet.create({
            data:{
                content,
                imageURL,
                authorId: ctx.user.id
            }
        });
        
        return tweet;
    },
    
    deleteTweet: async (parent: any, { id }: { id: string }, ctx: GraphqlContext) => {
        if (!ctx.user) 
            throw new Error("You must be logged in to delete a tweet.");
        
        // Check if the tweet exists and belongs to the user
        const tweet = await prismaClient.tweet.findUnique({
            where: { id }
        });
        
        if (!tweet) {
            throw new Error("Tweet not found.");
        }
        
        if (tweet.authorId !== ctx.user.id) {
            throw new Error("You can only delete your own tweets.");
        }
        
        await prismaClient.tweet.delete({
            where: { id }
        });
        
        return true;
    }
}

const queries = {
    getAllTweets: async () => {
        return await prismaClient.tweet.findMany({
            include: {
                author: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    },
    
    getTweetsByUser: async (parent: any, { userId }: { userId: string }) => {
        return await prismaClient.tweet.findMany({
            where: {
                authorId: userId
            },
            include: {
                author: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    },
    
    getTweetById: async (parent: any, { id }: { id: string }) => {
        return await prismaClient.tweet.findUnique({
            where: { id },
            include: {
                author: true
            }
        });
    }
};
const extraResolvers = {
    Tweet: {
        author: async (parent: Tweet) => {
            return await prismaClient.user.findUnique({
                where: { id: parent.authorId }
            });
        },
        createdAt: (parent: Tweet) => {
            return parent.createdAt.toISOString();
        },
        updatedAt: (parent: Tweet) => {
            return parent.updatedAt.toISOString();
        }
    }
};

export const resolvers = { mutations, queries, extraResolvers };