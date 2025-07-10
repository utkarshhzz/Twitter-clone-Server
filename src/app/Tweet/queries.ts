export const queries = `#graphql
    getAllTweets: [Tweet!]!
    getTweetsByUser(userId: ID!): [Tweet]
    getTweetById(id: ID!): Tweet
    getSignedURLForTweet(imageName:String!,imageType: String!): String
`;
