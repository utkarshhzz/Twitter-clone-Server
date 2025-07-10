import { prismaClient } from '../../clients/db';
import { GraphqlContext } from '../../interfaces';
import UserService from '../../services/user';
import { User } from '@prisma/client';
import { redisClient } from '../../clients/redis';

const queries = {
    verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
        const resultToken = await UserService.verifyGoogleAuthToken(token);
        return resultToken;
    },
    getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
        const id = ctx.user?.id;
        if (!id) return null;

        const user = await UserService.getUserById(id);
        return user;
    },
    getUserById: async (parent: any, { id }: { id: string }, ctx: GraphqlContext) => UserService.getUserById(id)
};
const extraResolvers = {
    User: {
        tweets: (parent: User) => 
            prismaClient.tweet.findMany({ 
                where: { author: { id: parent.id } },
                orderBy: { createdAt: 'desc' }
            }),
        followers: async (parent: User) => {
            const result = await prismaClient.follows.findMany({
                where: { following: { id: parent.id } },
                include: {
                    follower: true
                }
            });
            return result.map((el) => el.follower);
        },
        following: async (parent: User) => {
            const result = await prismaClient.follows.findMany({
                where: { follower: { id: parent.id } },
                include: {
                    following: true,
                }
            });
            return result.map((el) => el.following);
        },
        recommendedUsers: async (parent: User, _: any, ctx: GraphqlContext) => {
            if (!ctx.user) return [];
            
            // Check cache first
            try {
                const cachedValue = await redisClient.get(
                    `RECOMMENDED_USERS:${ctx.user.id}`
                );

                if (cachedValue) {
                    console.log("Cache Found");
                    return JSON.parse(cachedValue);
                }
            } catch (error) {
                console.error("Redis error:", error);
                // Continue without cache if Redis fails
            }

            // Get my followings and their followings
            const myFollowings = await prismaClient.follows.findMany({
                where: {
                    follower: { id: ctx.user.id },
                },
                include: {
                    following: {
                        include: { followers: { include: { following: true } } },
                    },
                },
            });

            const users: User[] = [];

            // Find recommendations - people that my followings follow, but I don't
            for (const followings of myFollowings) {
                for (const followingOfFollowedUser of followings.following.followers) {
                    if (
                        followingOfFollowedUser.following.id !== ctx.user.id &&
                        myFollowings.findIndex(
                            (e) => e?.followingId === followingOfFollowedUser.following.id
                        ) < 0
                    ) {
                        users.push(followingOfFollowedUser.following);
                    }
                }
            }

            console.log("Cache Not Found");
            
            // Store in cache
            try {
                await redisClient.set(
                    `RECOMMENDED_USERS:${ctx.user.id}`,
                    JSON.stringify(users)
                );
            } catch (error) {
                console.error("Redis set error:", error);
            }

            return users;
        },

        name: (parent: any) => {
            return `${parent.firstName} ${parent.lastName || ''}`.trim();
        },
        username: (parent: any) => {
            return parent.email?.split('@')[0] || '';
        },
        image: (parent: any) => {
            return parent.profileImageURL;
        }
    }
};

const mutations = {
    followUser: async (parent: any, { to }: { to: string }, ctx: GraphqlContext) => {
        if (!ctx.user || !ctx.user.id) {
            throw new Error('Unauthorized');
        }
        await UserService.followUser(ctx.user.id, to);
        
        try {
            await redisClient.del(`RECOMMENDED_USERS:${ctx.user.id}`);
        } catch (error) {
            console.error("Redis delete error:", error);
        }
        
        return true;
    },
    unfollowUser: async (parent: any, { to }: { to: string }, ctx: GraphqlContext) => {
        if (!ctx.user || !ctx.user.id) {
            throw new Error('Unauthorized');
        }
        await UserService.unfollowUser(ctx.user.id, to);
        
        try {
            await redisClient.del(`RECOMMENDED_USERS:${ctx.user.id}`);
        } catch (error) {
            console.error("Redis delete error:", error);
        }
        
        return true;
    }
};

export const resolvers = { queries, extraResolvers, mutations };