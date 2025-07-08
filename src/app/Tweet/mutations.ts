export const mutations = `#graphql
  createTweet(content: String!, imageURL: String): Tweet!
  deleteTweet(id: ID!): Boolean
`;