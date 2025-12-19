/**
 * Task Module Tests
 * These tests cover ONLY task-related functionality
 */

const {
  createTask,
  getTaskById,
  getAllTasks,
  updateTask,
  deleteTask,
  completeTask,
  clearTasks,
} = require('./tasks');

describe('Task Module', () => {
  beforeEach(() => {
    clearTasks();
  });

  describe('createTask', () => {
    it('should create a new task', () => {
      const task = createTask('Write documentation', 'Document the API', '2024-12-31', 'high');

      expect(task.id).toBe(1);
      expect(task.title).toBe('Write documentation');
      expect(task.description).toBe('Document the API');
      expect(task.priority).toBe('high');
      expect(task.completed).toBe(false);
    });

    it('should throw error for empty title', () => {
      expect(() => createTask('', 'Description')).toThrow('Task title is required');
    });

    it('should assign default priority', () => {
      const task = createTask('Task', 'Description');
      expect(task.priority).toBe('medium');
    });
  });

  describe('getTaskById', () => {
    it('should retrieve task by id', () => {
      const created = createTask('Test task', 'Test description');
      const retrieved = getTaskById(created.id);

      expect(retrieved).toEqual(created);
    });

    it('should return undefined for non-existent id', () => {
      expect(getTaskById(999)).toBeUndefined();
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks', () => {
      createTask('Task 1', 'Description 1');
      createTask('Task 2', 'Description 2');
      createTask('Task 3', 'Description 3');

      const allTasks = getAllTasks();
      expect(allTasks).toHaveLength(3);
    });

    it('should return empty array when no tasks', () => {
      expect(getAllTasks()).toHaveLength(0);
    });
  });

  describe('updateTask', () => {
    it('should update task properties', () => {
      const task = createTask('Original', 'Original description');
      const updated = updateTask(task.id, { title: 'Updated', priority: 'high' });

      expect(updated.title).toBe('Updated');
      expect(updated.priority).toBe('high');
      expect(updated.description).toBe('Original description');
    });

    it('should throw error for non-existent task', () => {
      expect(() => updateTask(999, { title: 'Updated' })).toThrow('not found');
    });
  });

  describe('deleteTask', () => {
    it('should delete task by id', () => {
      const task = createTask('To delete', 'Will be removed');
      expect(getAllTasks()).toHaveLength(1);

      deleteTask(task.id);
      expect(getAllTasks()).toHaveLength(0);
    });

    it('should throw error for non-existent task', () => {
      expect(() => deleteTask(999)).toThrow('not found');
    });
  });

  describe('completeTask', () => {
    it('should mark task as completed', () => {
      const task = createTask('Todo', 'Something to do');
      expect(task.completed).toBe(false);

      const completed = completeTask(task.id);
      expect(completed.completed).toBe(true);
    });

    it('should throw error for non-existent task', () => {
      expect(() => completeTask(999)).toThrow('not found');
    });
  });
});
