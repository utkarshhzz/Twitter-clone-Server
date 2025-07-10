import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import UserService from "../../services/user";
import TweetService from "../../services/tweet";

const s3Client = new S3Client({
    region: process.env.AWS_DEFAULT_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    },
});

const mutations={
    createTweet:async (parent: any, { content, imageURL }: { content: string; imageURL?: string }, ctx: GraphqlContext) => {
        if (!ctx.user) 
            throw new Error("You must be logged in to create a tweet.");
        
        const tweet = await TweetService.createTweet({
            content,
            imageURL,
            userId: ctx.user.id
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
        return await TweetService.getAllTweets();
    },
    
    getSignedURLForTweet: async(parent:any,
        {imageType,imageName}:{imageType:string,imageName:string},ctx:GraphqlContext) => {
            if(!ctx.user || !ctx.user.id) {
                throw new Error("You must be logged in to get a signed URL for a tweet image.");
            }
            const allowedImageTypes= ['jpeg', 'png', 'jpg' , 'webp'];
            if(!allowedImageTypes.includes(imageType)) {
                throw new Error("Invalid image type. Allowed types are: jpeg, png, jpg, webp.");
            }
            
            const putObjectCommand = new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET!,
                Key: `uploads/${ctx.user.id}/tweets/${imageName}-${Date.now()}.${imageType}`,
                ContentType: `image/${imageType}`
            });
            
            const signedUrl = await getSignedUrl(s3Client, putObjectCommand, {
                expiresIn: 3600 // URL expires in 1 hour
            });
            
            return signedUrl;
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
            return await UserService.getUserById(parent.authorId);
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