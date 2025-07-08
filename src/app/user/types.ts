export const types=`#graphql
type User {
  id: ID!
  firstName: String!
  lastName: String
  email: String!
  profileImageURL: String
  name: String
  username: String
  image: String
  tweets:[Tweet]
}
  
`;