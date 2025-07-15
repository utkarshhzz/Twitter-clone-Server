const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function createTestUser() {
    try {
        // First, check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: 'test@example.com' }
        });

        if (existingUser) {
            console.log('Test user already exists:', existingUser);
            return existingUser;
        }

        // Create test user
        const user = await prisma.user.create({
            data: {
                id: 'test-user-123',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                profileImageURL: 'https://example.com/avatar.jpg'
            }
        });

        console.log('Created test user:', user);
        return user;
    } catch (error) {
        console.error('Error creating test user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUser();
