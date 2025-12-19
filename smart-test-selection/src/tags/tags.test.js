/**
 * Tags Module Tests
 * These tests cover ONLY tag-related functionality
 */

const {
  createTag,
  getTagById,
  getAllTags,
  addTaskToTag,
  removeTaskFromTag,
  deleteTag,
  clearTags,
} = require('./tags');

describe('Tags Module', () => {
  beforeEach(() => {
    clearTags();
  });

  describe('createTag', () => {
    it('should create a new tag', () => {
      const tag = createTag('urgent', '#ff0000');

      expect(tag.id).toBe(1);
      expect(tag.name).toBe('urgent');
      expect(tag.color).toBe('#ff0000');
      expect(tag.taskIds).toEqual([]);
    });

    it('should throw error for empty name', () => {
      expect(() => createTag('')).toThrow('Tag name is required');
    });

    it('should throw error for duplicate name', () => {
      createTag('urgent');
      expect(() => createTag('urgent')).toThrow('already exists');
    });
  });

  describe('getAllTags', () => {
    it('should return all tags', () => {
      createTag('urgent');
      createTag('bug');
      createTag('feature');

      expect(getAllTags()).toHaveLength(3);
    });
  });

  describe('addTaskToTag', () => {
    it('should add task to tag', () => {
      const tag = createTag('urgent');
      addTaskToTag(tag.id, 1);
      addTaskToTag(tag.id, 2);

      expect(tag.taskIds).toEqual([1, 2]);
    });

    it('should not add duplicate task', () => {
      const tag = createTag('urgent');
      addTaskToTag(tag.id, 1);
      addTaskToTag(tag.id, 1);

      expect(tag.taskIds).toEqual([1]);
    });
  });

  describe('removeTaskFromTag', () => {
    it('should remove task from tag', () => {
      const tag = createTag('urgent');
      addTaskToTag(tag.id, 1);
      addTaskToTag(tag.id, 2);

      removeTaskFromTag(tag.id, 1);
      expect(tag.taskIds).toEqual([2]);
    });
  });

  describe('deleteTag', () => {
    it('should delete tag', () => {
      const tag = createTag('urgent');
      expect(getAllTags()).toHaveLength(1);

      deleteTag(tag.id);
      expect(getAllTags()).toHaveLength(0);
    });
  });
});
