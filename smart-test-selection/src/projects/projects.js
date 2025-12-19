/**
 * Project Management Module
 * Handles grouping tasks into projects
 */

const projects = [];
let nextId = 1;

class Project {
  constructor(name, description, color = '#3b82f6') {
    this.id = nextId++;
    this.name = name;
    this.description = description;
    this.color = color;
    this.taskIds = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

function createProject(name, description, color) {
  if (!name || name.trim().length === 0) {
    throw new Error('Project name is required');
  }

  const project = new Project(name, description, color);
  projects.push(project);
  return project;
}

function getProjectById(id) {
  return projects.find(project => project.id === id);
}

function getAllProjects() {
  return [...projects];
}

function updateProject(id, updates) {
  const project = getProjectById(id);
  if (!project) {
    throw new Error(`Project with id ${id} not found`);
  }

  Object.assign(project, updates);
  project.updatedAt = new Date();
  return project;
}

function deleteProject(id) {
  const index = projects.findIndex(project => project.id === id);
  if (index === -1) {
    throw new Error(`Project with id ${id} not found`);
  }

  projects.splice(index, 1);
  return true;
}

function addTaskToProject(projectId, taskId) {
  const project = getProjectById(projectId);
  if (!project) {
    throw new Error(`Project with id ${projectId} not found`);
  }

  if (project.taskIds.includes(taskId)) {
    throw new Error(`Task ${taskId} already in project`);
  }

  project.taskIds.push(taskId);
  project.updatedAt = new Date();
  return project;
}

function removeTaskFromProject(projectId, taskId) {
  const project = getProjectById(projectId);
  if (!project) {
    throw new Error(`Project with id ${projectId} not found`);
  }

  const index = project.taskIds.indexOf(taskId);
  if (index === -1) {
    throw new Error(`Task ${taskId} not in project`);
  }

  project.taskIds.splice(index, 1);
  project.updatedAt = new Date();
  return project;
}

function clearProjects() {
  projects.length = 0;
  nextId = 1;
}

module.exports = {
  createProject,
  getProjectById,
  getAllProjects,
  updateProject,
  deleteProject,
  addTaskToProject,
  removeTaskFromProject,
  clearProjects,
};
