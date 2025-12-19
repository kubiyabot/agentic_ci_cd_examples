/**
 * Comments Module Tests
 * These tests cover ONLY comment-related functionality
 */

const {
  addComment,
  getCommentsByTaskId,
  deleteComment,
  clearComments,
} = require('./comments');

describe('Comments Module', () => {
  beforeEach(() => {
    clearComments();
  });

  describe('addComment', () => {
    it('should add a comment to a task', () => {
      const comment = addComment(1, 'John Doe', 'Great work!');

      expect(comment.id).toBe(1);
      expect(comment.taskId).toBe(1);
      expect(comment.author).toBe('John Doe');
      expect(comment.text).toBe('Great work!');
    });

    it('should throw error for empty text', () => {
      expect(() => addComment(1, 'John', '')).toThrow('Comment text is required');
    });
  });

  describe('getCommentsByTaskId', () => {
    it('should return comments for a specific task', () => {
      addComment(1, 'Alice', 'Comment 1');
      addComment(2, 'Bob', 'Comment 2');
      addComment(1, 'Charlie', 'Comment 3');

      const taskComments = getCommentsByTaskId(1);
      expect(taskComments).toHaveLength(2);
      expect(taskComments[0].author).toBe('Alice');
      expect(taskComments[1].author).toBe('Charlie');
    });

    it('should return empty array for task with no comments', () => {
      expect(getCommentsByTaskId(999)).toEqual([]);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', () => {
      const comment = addComment(1, 'John', 'To be deleted');
      expect(getCommentsByTaskId(1)).toHaveLength(1);

      deleteComment(comment.id);
      expect(getCommentsByTaskId(1)).toHaveLength(0);
    });

    it('should throw error for non-existent comment', () => {
      expect(() => deleteComment(999)).toThrow('not found');
    });
  });
});
