
'use server';
/**
 * @fileOverview Mock implementation of the AuthService for development and testing.
 */
import type { LoginInput, LoginOutput, SignUpInput, SignUpOutput, GetCurrentUserOutput, User } from './types';
import { v4 as uuidv4 } from 'uuid';

// In a real app, this would be handled with server-side sessions or cookies.
// For mock purposes, we'll just store the "logged in" user in-memory.
let MOCK_CURRENT_USER: User | null = null;

const MOCK_USERS: User[] = [
    {
        id: 'c4a6b8e0-3e2b-4b1a-9c0a-4a2b1c9d8e7f',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        avatarUrl: 'https://placehold.co/100x100.png',
    }
];


export async function login(input: LoginInput): Promise<LoginOutput> {
    console.log('[Auth Mock] Logging in with:', input.email);
    let user = MOCK_USERS.find(u => u.email === input.email);
    
    // If user doesn't exist, create one on the fly for easy testing.
    if (!user) {
        console.log('[Auth Mock] User not found, creating a new mock user for testing.');
        const name = input.email.split('@')[0];
        user = {
            id: uuidv4(),
            name: name.charAt(0).toUpperCase() + name.slice(1),
            email: input.email,
            avatarUrl: `https://placehold.co/100x100.png?text=${name.charAt(0).toUpperCase()}`
        };
        MOCK_USERS.push(user);
    }

    MOCK_CURRENT_USER = user;

    return {
        user,
        token: `mock-jwt-token-for-${user.name.toLowerCase()}`,
    };
}

export async function signup(input: SignUpInput): Promise<SignUpOutput> {
    console.log('[Auth Mock] Signing up with:', input.email);

    if (MOCK_USERS.some(u => u.email === input.email)) {
        // For signup, it's better to simulate the real behavior of failing if user exists.
        throw new Error('User with this email already exists');
    }
    
    const newUser: User = {
        id: uuidv4(),
        name: input.name,
        email: input.email,
        avatarUrl: `https://placehold.co/100x100.png?text=${input.name.charAt(0)}`
    }

    MOCK_USERS.push(newUser);
    MOCK_CURRENT_USER = newUser;

    return {
        user: newUser,
        token: `mock-jwt-token-for-${newUser.id}`,
    };
}

export async function logout(): Promise<void> {
    console.log('[Auth Mock] Logging out');
    MOCK_CURRENT_USER = null;
    return Promise.resolve();
}

export async function getCurrentUser(): Promise<GetCurrentUserOutput> {
    console.log('[Auth Mock] Getting current user:', MOCK_CURRENT_USER?.email || 'None');
    if (!MOCK_CURRENT_USER) {
      // To avoid breaking the UI that expects a user, let's sign in a default one if none exists.
      // This is for mock development purposes.
      MOCK_CURRENT_USER = MOCK_USERS[0];
       console.log('[Auth Mock] No user found, auto-signing-in default user:', MOCK_CURRENT_USER.email);
    }
    return {
        user: MOCK_CURRENT_USER,
    };
}
