/**
 * User Service Module
 * Handles user management operations
 */

import { isValidEmail, generateId } from './utils';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface CreateUserRequest {
  email: string;
  name: string;
}

const users: User[] = [];

/**
 * Creates a new user
 * @param request - User creation request
 * @returns Created user or error
 */
export function createUser(request: CreateUserRequest): { success: boolean; user?: User; message?: string } {
  if (!request.name || request.name.trim().length === 0) {
    return { success: false, message: 'Name is required' };
  }

  if (!isValidEmail(request.email)) {
    return { success: false, message: 'Invalid email address' };
  }

  const existingUser = users.find(u => u.email === request.email);
  if (existingUser) {
    return { success: false, message: 'User with this email already exists' };
  }

  const user: User = {
    id: generateId(),
    email: request.email,
    name: request.name,
    createdAt: new Date(),
  };

  users.push(user);
  return { success: true, user };
}

/**
 * Gets a user by ID
 * @param id - User ID
 * @returns User or undefined
 */
export function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

/**
 * Gets a user by email
 * @param email - User email
 * @returns User or undefined
 */
export function getUserByEmail(email: string): User | undefined {
  return users.find(u => u.email === email);
}

/**
 * Gets all users
 * @returns Array of all users
 */
export function getAllUsers(): User[] {
  return [...users];
}

/**
 * Deletes a user by ID
 * @param id - User ID
 * @returns True if deleted, false if not found
 */
export function deleteUser(id: string): boolean {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return false;
  }
  users.splice(index, 1);
  return true;
}

/**
 * Clears all users (for testing)
 */
export function clearUsers(): void {
  users.length = 0;
}
