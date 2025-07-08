# Twitter Clone Backend - Authentication Guide

## ✅ Issue Resolved!

The authentication is now working correctly. The issue was that the JWT token referenced a user ID that didn't exist in the database.

## How Authentication Works

### 1. JWT Token Structure
The backend expects JWT tokens with this payload:
```json
{
  "id": "user-id-from-database",
  "email": "user@example.com",
  "iat": 1751983443
}
```

### 2. Authentication Flow

1. **Get JWT Token**: Use the `verifyGoogleToken` query to authenticate with Google OAuth
2. **Include Token**: Send the JWT token in the Authorization header
3. **Make Authenticated Requests**: Use the token for protected mutations

### 3. Example Usage

#### Step 1: Authenticate with Google (Frontend)
```graphql
query {
  verifyGoogleToken(token: "YOUR_GOOGLE_ID_TOKEN") 
}
```
This returns a JWT token that you should store and use for subsequent requests.

#### Step 2: Create Tweet (with Authentication)
```javascript
// Frontend JavaScript/TypeScript
const createTweet = async (content, imageURL = null) => {
  const token = localStorage.getItem('jwt_token'); // or however you store it
  
  const response = await fetch('http://localhost:8000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `
        mutation CreateTweet($content: String!, $imageURL: String) {
          createTweet(content: $content, imageURL: $imageURL) {
            id
            content
            imageURL
            createdAt
            author {
              id
              firstName
              lastName
              email
              name
              username
            }
          }
        }
      `,
      variables: { content, imageURL }
    })
  });
  
  return await response.json();
};

// Usage
const result = await createTweet("Hello World!", "https://example.com/image.jpg");
```

#### Step 3: Get All Tweets (No Authentication Required)
```javascript
const getAllTweets = async () => {
  const response = await fetch('http://localhost:8000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        query {
          getAllTweets {
            id
            content
            imageURL
            createdAt
            author {
              id
              firstName
              lastName
              email
              name
              username
              image
            }
          }
        }
      `
    })
  });
  
  return await response.json();
};
```

## 🔧 Testing Commands

### Test with PowerShell (Windows)
```powershell
# Get all tweets
Invoke-WebRequest -Uri "http://localhost:8000/graphql" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"query":"{ getAllTweets { id content author { firstName lastName } createdAt } }"}'

# Create tweet (replace YOUR_JWT_TOKEN with actual token)
Invoke-WebRequest -Uri "http://localhost:8000/graphql" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer YOUR_JWT_TOKEN"} -Body '{"query":"mutation { createTweet(content: \"Hello from PowerShell!\") { id content author { firstName lastName } } }"}'
```

### Test with curl (Mac/Linux)
```bash
# Get all tweets
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ getAllTweets { id content author { firstName lastName } createdAt } }"}'

# Create tweet (replace YOUR_JWT_TOKEN with actual token)
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "mutation { createTweet(content: \"Hello from curl!\") { id content author { firstName lastName } } }"}'
```

## 🛡️ Security Features

1. **JWT Verification**: All tokens are verified using the secret key
2. **User Context**: Authenticated user is available in all resolvers
3. **Protected Mutations**: createTweet and deleteTweet require authentication
4. **User Ownership**: Users can only delete their own tweets

## 📝 Available Operations

### Queries (No Authentication Required)
- `getAllTweets` - Get all tweets with author info
- `getTweetsByUser(userId: ID!)` - Get tweets by specific user
- `getTweetById(id: ID!)` - Get specific tweet
- `getCurrentUser` - Get current authenticated user (requires auth)

### Mutations (Authentication Required)
- `createTweet(content: String!, imageURL: String)` - Create new tweet
- `deleteTweet(id: ID!)` - Delete own tweet

### User Fields Available
- `id`, `firstName`, `lastName`, `email`, `profileImageURL`
- `name` (computed: firstName + lastName)
- `username` (computed: email prefix)
- `image` (alias for profileImageURL)
- `tweets` (user's tweets)

### Tweet Fields Available
- `id`, `content`, `imageURL`, `createdAt`, `updatedAt`
- `author` (User object with all user fields)

## 🎯 Ready for Frontend Integration!

Your backend is fully functional and ready for frontend integration. All the required GraphQL operations are implemented and tested.
