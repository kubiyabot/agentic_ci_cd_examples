/**
 * Search Module Tests
 * These tests cover ONLY search and filter functionality
 */

const {
  searchTasks,
  filterByPriority,
  filterByCompleted,
  filterByDueDate,
  sortTasks,
} = require('./search');

describe('Search Module', () => {
  const mockTasks = [
    { id: 1, title: 'Write documentation', description: 'API docs', priority: 'high', completed: false, createdAt: new Date('2024-01-01'), dueDate: '2024-01-15' },
    { id: 2, title: 'Fix bug', description: 'Login issue', priority: 'high', completed: true, createdAt: new Date('2024-01-02'), dueDate: '2024-01-10' },
    { id: 3, title: 'Add feature', description: 'Dark mode', priority: 'medium', completed: false, createdAt: new Date('2024-01-03'), dueDate: '2024-01-20' },
    { id: 4, title: 'Review code', description: 'PR review', priority: 'low', completed: false, createdAt: new Date('2024-01-04'), dueDate: null },
  ];

  describe('searchTasks', () => {
    it('should search by title', () => {
      const results = searchTasks(mockTasks, 'bug');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Fix bug');
    });

    it('should search by description', () => {
      const results = searchTasks(mockTasks, 'dark');
      expect(results).toHaveLength(1);
      expect(results[0].description).toBe('Dark mode');
    });

    it('should return all tasks for empty query', () => {
      const results = searchTasks(mockTasks, '');
      expect(results).toHaveLength(4);
    });
  });

  describe('filterByPriority', () => {
    it('should filter by high priority', () => {
      const results = filterByPriority(mockTasks, 'high');
      expect(results).toHaveLength(2);
    });

    it('should filter by low priority', () => {
      const results = filterByPriority(mockTasks, 'low');
      expect(results).toHaveLength(1);
    });
  });

  describe('filterByCompleted', () => {
    it('should filter completed tasks', () => {
      const results = filterByCompleted(mockTasks, true);
      expect(results).toHaveLength(1);
      expect(results[0].completed).toBe(true);
    });

    it('should filter incomplete tasks', () => {
      const results = filterByCompleted(mockTasks, false);
      expect(results).toHaveLength(3);
    });
  });

  describe('filterByDueDate', () => {
    it('should filter tasks within date range', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-15');
      const results = filterByDueDate(mockTasks, startDate, endDate);
      expect(results).toHaveLength(2);
    });
  });

  describe('sortTasks', () => {
    it('should sort by createdAt descending', () => {
      const sorted = sortTasks(mockTasks, 'createdAt', 'desc');
      expect(sorted[0].id).toBe(4);
      expect(sorted[3].id).toBe(1);
    });

    it('should sort by createdAt ascending', () => {
      const sorted = sortTasks(mockTasks, 'createdAt', 'asc');
      expect(sorted[0].id).toBe(1);
      expect(sorted[3].id).toBe(4);
    });
  });
});
