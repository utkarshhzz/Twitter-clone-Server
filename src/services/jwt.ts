import JWT from 'jsonwebtoken';
//import { prismaClient } from "../clients/db";
import { User } from "@prisma/client";
import { JWTUser } from '../interfaces';
const JWT_SECRET ="$uper@1234.";
class JWTService {
    public static generateTokenForUser(user: User) {
        if (!user) {
            throw new Error(`User not found`);
        }
        
        const payload: JWTUser = {
            id: user.id,
            email: user.email,
        };
        
        const token = JWT.sign(payload, JWT_SECRET);
        return token  ;
    }
    
    public static verifyToken(token: string) {
        try {
            return JWT.verify(token, JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
    public static decodeToken(token: string) {
        try {
            if (!token) {
                throw new Error('No token provided');
            }
            const decoded = JWT.verify(token, JWT_SECRET) as JWTUser;
            console.log('Token decoded successfully:', decoded);
            return decoded;
        } catch (error) {
            console.error('Token decode error:', error);
            throw new Error('Invalid or expired token');
        }
    }
}
export default JWTService;