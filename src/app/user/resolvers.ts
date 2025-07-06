import axios from 'axios';
import { prismaClient } from '../../clients/db';
import JWTService from '../../services/jwt';
interface GoogleTokenResult{
    iss?:string;
    sub?:string;
    aud?:string;
    exp?:number;
    iat?:number;
    email?:string;
    email_verified?:boolean;
    name?:string;
    picture?:string;
    locale?:string;
    given_name?:string;
    family_name?:string;
}
const queries={
    verifyGoogleToken:async(parent:any,{token}:{token:string})=>{
        const googleToken=token;
        const googleOauthURL=new URL('https://oauth2.googleapis.com/tokeninfo');
        googleOauthURL.searchParams.set('id_token',googleToken);
        const{data}=await axios.get<GoogleTokenResult>(googleOauthURL.toString(),{
            responseType:'json'
        });
        const user=await prismaClient.user.findUnique({where:{email:data.email}}) 
        if(!user)
        {
            const nameParts = data.name?.split(' ') || [];
            await prismaClient.user.create({
                data:{
                    firstName: data.given_name || nameParts[0] || '',
                    lastName: data.family_name || nameParts.slice(1).join(' ') || '',
                    email:data.email || '',
                    profileImageURL:data.picture || '',
                }
            });
        }
        const userInDb=await prismaClient.user.findUnique({where:{email:data.email}});
        if(!userInDb)
        {
            throw new Error("User not found in database");
        }
        const userToken = await JWTService.generateTokenForUser(userInDb);

        return userToken;

    },
};

export const resolvers={queries};