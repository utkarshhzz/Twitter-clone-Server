export const queries = `#graphql
    getAllTweets: [Tweet!]!
    getTweetsByUser(userId: ID!): [Tweet]
    getTweetById(id: ID!): Tweet
`;
