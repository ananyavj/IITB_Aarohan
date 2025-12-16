import { db, type User } from '../db/db';

/**
 * User Repository - Handles user authentication and management
 */

/**
 * Find user by username
 */
export async function getUserByUsername(username: string): Promise<User | undefined> {
    return await db.users.where('username').equals(username).first();
}

/**
 * Create a new user
 */
export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLoginAt'>): Promise<number> {
    const user: User = {
        ...userData,
        createdAt: new Date(),
        lastLoginAt: new Date(),
    };

    return await db.users.add(user);
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(userId: number): Promise<void> {
    await db.users.update(userId, {
        lastLoginAt: new Date(),
    });
}

/**
 * Get the most recently logged in user
 */
export async function getLastLoggedInUser(): Promise<User | undefined> {
    return await db.users.orderBy('lastLoginAt').reverse().first();
}

/**
 * Validate user credentials
 */
export async function validateCredentials(username: string, password: string): Promise<User | null> {
    const user = await getUserByUsername(username);

    if (!user) {
        return null;
    }

    // Simple password check (in production, use bcrypt or similar)
    if (user.password === password) {
        // Update last login
        await updateLastLogin(user.id!);
        return user;
    }

    return null;
}

/**
 * Update user profile information
 */
export async function updateUser(userId: number, updates: Partial<Omit<User, 'id' | 'username' | 'createdAt'>>): Promise<void> {
    await db.users.update(userId, updates);
}

/**
 * Check if username already exists
 */
export async function usernameExists(username: string): Promise<boolean> {
    const count = await db.users.where('username').equals(username).count();
    return count > 0;
}
