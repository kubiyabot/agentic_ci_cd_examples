/**
 * Comments Module
 * Handles adding comments to tasks
 */

const comments = [];
let nextId = 1;

class Comment {
  constructor(taskId, author, text) {
    this.id = nextId++;
    this.taskId = taskId;
    this.author = author;
    this.text = text;
    this.createdAt = new Date();
  }
}

function addComment(taskId, author, text) {
  if (!text || text.trim().length === 0) {
    throw new Error('Comment text is required');
  }

  const comment = new Comment(taskId, author, text);
  comments.push(comment);
  return comment;
}

function getCommentsByTaskId(taskId) {
  return comments.filter(comment => comment.taskId === taskId);
}

function deleteComment(id) {
  const index = comments.findIndex(comment => comment.id === id);
  if (index === -1) {
    throw new Error(`Comment with id ${id} not found`);
  }

  comments.splice(index, 1);
  return true;
}

function clearComments() {
  comments.length = 0;
  nextId = 1;
}

module.exports = {
  addComment,
  getCommentsByTaskId,
  deleteComment,
  clearComments,
};
