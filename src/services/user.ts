import axios from 'axios';
import { prismaClient } from '../clients/db';
import JWTService from './jwt';

interface GoogleTokenResult {
    iss?: string;
    sub?: string;
    aud?: string;
    exp?: number;
    iat?: number;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
    locale?: string;
    given_name?: string;
    family_name?: string;
}

class UserService {
    public static async verifyGoogleAuthToken(token: string) {
        const googleToken = token;
        const googleOauthURL = new URL('https://oauth2.googleapis.com/tokeninfo');
        googleOauthURL.searchParams.set('id_token', googleToken);
        const { data } = await axios.get<GoogleTokenResult>(googleOauthURL.toString(), {
            responseType: 'json'
        });
        
        const user = await prismaClient.user.findUnique({ where: { email: data.email } });
        
        if (!user) {
            const nameParts = data.name?.split(' ') || [];
            await prismaClient.user.create({
                data: {
                    firstName: data.given_name || nameParts[0] || '',
                    lastName: data.family_name || nameParts.slice(1).join(' ') || '',
                    email: data.email || '',
                    profileImageURL: data.picture || '',
                }
            });
        }
        
        const userInDb = await prismaClient.user.findUnique({ where: { email: data.email } });
        if (!userInDb) {
            throw new Error("User not found in database");
        }
        
        const userToken = await JWTService.generateTokenForUser(userInDb);
        return userToken;
    }
    
    public static async getUserById(id: string) {
        return prismaClient.user.findUnique({ where: { id } });
    }
    public static followUser(from: string, to: string) {
        return prismaClient.follows.create({
            data: {
                followerId: from,
                followingId: to,
            },
        });
    }
    public static unfollowUser(from: string, to: string) {
        return prismaClient.follows.deleteMany({
            where: {
                followerId: from,
                followingId: to,
            },
        });
    }
}

export default UserService;