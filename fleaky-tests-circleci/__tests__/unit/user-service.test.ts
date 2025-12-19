/**
 * Unit tests for user service
 * These tests are STABLE and should always pass
 */

import {
  createUser,
  getUserById,
  getUserByEmail,
  getAllUsers,
  deleteUser,
  clearUsers,
} from '@/lib/user-service';

describe('User Service - STABLE TESTS', () => {
  beforeEach(() => {
    clearUsers();
  });

  describe('createUser', () => {
    it('should create a new user successfully', () => {
      const result = createUser({ email: 'test@example.com', name: 'Test User' });
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('test@example.com');
      expect(result.user?.name).toBe('Test User');
      expect(result.user?.id).toBeTruthy();
      expect(result.user?.createdAt).toBeInstanceOf(Date);
    });

    it('should reject user with invalid email', () => {
      const result = createUser({ email: 'invalid', name: 'Test User' });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid email');
    });

    it('should reject user without name', () => {
      const result = createUser({ email: 'test@example.com', name: '' });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Name is required');
    });

    it('should reject duplicate email', () => {
      createUser({ email: 'test@example.com', name: 'User One' });
      const result = createUser({ email: 'test@example.com', name: 'User Two' });
      expect(result.success).toBe(false);
      expect(result.message).toContain('already exists');
    });
  });

  describe('getUserById', () => {
    it('should retrieve user by ID', () => {
      const created = createUser({ email: 'test@example.com', name: 'Test User' });
      const userId = created.user!.id;

      const user = getUserById(userId);
      expect(user).toBeDefined();
      expect(user?.id).toBe(userId);
    });

    it('should return undefined for non-existent ID', () => {
      const user = getUserById('non-existent-id');
      expect(user).toBeUndefined();
    });
  });

  describe('getUserByEmail', () => {
    it('should retrieve user by email', () => {
      createUser({ email: 'test@example.com', name: 'Test User' });

      const user = getUserByEmail('test@example.com');
      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });

    it('should return undefined for non-existent email', () => {
      const user = getUserByEmail('nonexistent@example.com');
      expect(user).toBeUndefined();
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', () => {
      createUser({ email: 'user1@example.com', name: 'User 1' });
      createUser({ email: 'user2@example.com', name: 'User 2' });
      createUser({ email: 'user3@example.com', name: 'User 3' });

      const users = getAllUsers();
      expect(users).toHaveLength(3);
    });

    it('should return empty array when no users', () => {
      const users = getAllUsers();
      expect(users).toHaveLength(0);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', () => {
      const created = createUser({ email: 'test@example.com', name: 'Test User' });
      const userId = created.user!.id;

      const deleted = deleteUser(userId);
      expect(deleted).toBe(true);
      expect(getUserById(userId)).toBeUndefined();
    });

    it('should return false for non-existent user', () => {
      const deleted = deleteUser('non-existent-id');
      expect(deleted).toBe(false);
    });
  });
});
