/**
 * Task Management Module
 * Handles CRUD operations for tasks
 */

const tasks = [];
let nextId = 1;

class Task {
  constructor(title, description, dueDate, priority = 'medium') {
    this.id = nextId++;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.completed = false;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

function createTask(title, description, dueDate, priority) {
  if (!title || title.trim().length === 0) {
    throw new Error('Task title is required');
  }

  const task = new Task(title, description, dueDate, priority);
  tasks.push(task);
  return task;
}

function getTaskById(id) {
  return tasks.find(task => task.id === id);
}

function getAllTasks() {
  return [...tasks];
}

function updateTask(id, updates) {
  const task = getTaskById(id);
  if (!task) {
    throw new Error(`Task with id ${id} not found`);
  }

  Object.assign(task, updates);
  task.updatedAt = new Date();
  return task;
}

function deleteTask(id) {
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) {
    throw new Error(`Task with id ${id} not found`);
  }

  tasks.splice(index, 1);
  return true;
}

function completeTask(id) {
  const task = getTaskById(id);
  if (!task) {
    throw new Error(`Task with id ${id} not found`);
  }

  task.completed = true;
  task.updatedAt = new Date();
  return task;
}

function clearTasks() {
  tasks.length = 0;
  nextId = 1;
}

module.exports = {
  createTask,
  getTaskById,
  getAllTasks,
  updateTask,
  deleteTask,
  completeTask,
  clearTasks,
};

// Added validation enhancement
function validatePriority(priority) {
  const validPriorities = ['low', 'medium', 'high', 'critical'];
  return validPriorities.includes(priority);
}

module.exports.validatePriority = validatePriority;
