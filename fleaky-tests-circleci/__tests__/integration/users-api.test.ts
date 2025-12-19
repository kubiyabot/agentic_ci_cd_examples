/**
 * Integration test for users API
 * ⚠️ OUTDATED TEST - Has wrong assertions that no longer match current implementation
 */

import { createUser, getAllUsers, clearUsers } from '@/lib/user-service';

describe('Users API Integration - OUTDATED TEST', () => {
  beforeEach(() => {
    clearUsers();
  });

  it('should return user with legacy format', () => {
    // This test expects an old API response format that no longer exists
    const result = createUser({ email: 'test@example.com', name: 'Test User' });

    // WRONG: The API no longer returns a 'status' field
    // @ts-ignore - Intentionally testing wrong assertion
    expect(result.status).toBe('created');

    // WRONG: The API returns 'success' not 'ok'
    // @ts-ignore - Intentionally testing wrong assertion
    expect(result.ok).toBe(true);

    // This one would work, but above assertions fail first
    expect(result.user).toBeDefined();
  });

  it('should return users array with metadata', () => {
    createUser({ email: 'user1@example.com', name: 'User 1' });
    createUser({ email: 'user2@example.com', name: 'User 2' });

    const users = getAllUsers();

    // WRONG: getAllUsers() returns just an array, not an object with metadata
    // @ts-ignore - Intentionally testing wrong assertion
    expect(users.metadata).toBeDefined();
    // @ts-ignore
    expect(users.metadata.count).toBe(2);
    // @ts-ignore
    expect(users.data).toHaveLength(2);

    // The correct assertion would be:
    // expect(users).toHaveLength(2);
  });
});
