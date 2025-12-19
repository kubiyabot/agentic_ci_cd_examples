/**
 * Tags Module
 * Handles labeling tasks with tags for organization
 */

const tags = [];
let nextId = 1;

class Tag {
  constructor(name, color = '#gray') {
    this.id = nextId++;
    this.name = name;
    this.color = color;
    this.taskIds = [];
  }
}

function createTag(name, color) {
  if (!name || name.trim().length === 0) {
    throw new Error('Tag name is required');
  }

  // Check for duplicate name
  if (tags.some(tag => tag.name.toLowerCase() === name.toLowerCase())) {
    throw new Error(`Tag "${name}" already exists`);
  }

  const tag = new Tag(name, color);
  tags.push(tag);
  return tag;
}

function getTagById(id) {
  return tags.find(tag => tag.id === id);
}

function getAllTags() {
  return [...tags];
}

function addTaskToTag(tagId, taskId) {
  const tag = getTagById(tagId);
  if (!tag) {
    throw new Error(`Tag with id ${tagId} not found`);
  }

  if (!tag.taskIds.includes(taskId)) {
    tag.taskIds.push(taskId);
  }

  return tag;
}

function removeTaskFromTag(tagId, taskId) {
  const tag = getTagById(tagId);
  if (!tag) {
    throw new Error(`Tag with id ${tagId} not found`);
  }

  const index = tag.taskIds.indexOf(taskId);
  if (index !== -1) {
    tag.taskIds.splice(index, 1);
  }

  return tag;
}

function deleteTag(id) {
  const index = tags.findIndex(tag => tag.id === id);
  if (index === -1) {
    throw new Error(`Tag with id ${id} not found`);
  }

  tags.splice(index, 1);
  return true;
}

function clearTags() {
  tags.length = 0;
  nextId = 1;
}

module.exports = {
  createTag,
  getTagById,
  getAllTags,
  addTaskToTag,
  removeTaskFromTag,
  deleteTag,
  clearTags,
};
