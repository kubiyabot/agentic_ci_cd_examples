/**
 * Project Module Tests
 * These tests cover ONLY project-related functionality
 */

const {
  createProject,
  getProjectById,
  getAllProjects,
  updateProject,
  deleteProject,
  addTaskToProject,
  removeTaskFromProject,
  clearProjects,
} = require('./projects');

describe('Project Module', () => {
  beforeEach(() => {
    clearProjects();
  });

  describe('createProject', () => {
    it('should create a new project', () => {
      const project = createProject('Website Redesign', 'Redesign company website', '#ff6b6b');

      expect(project.id).toBe(1);
      expect(project.name).toBe('Website Redesign');
      expect(project.description).toBe('Redesign company website');
      expect(project.color).toBe('#ff6b6b');
      expect(project.taskIds).toEqual([]);
    });

    it('should throw error for empty name', () => {
      expect(() => createProject('', 'Description')).toThrow('Project name is required');
    });

    it('should assign default color', () => {
      const project = createProject('Project', 'Description');
      expect(project.color).toBe('#3b82f6');
    });
  });

  describe('getProjectById', () => {
    it('should retrieve project by id', () => {
      const created = createProject('Test Project', 'Test description');
      const retrieved = getProjectById(created.id);

      expect(retrieved).toEqual(created);
    });

    it('should return undefined for non-existent id', () => {
      expect(getProjectById(999)).toBeUndefined();
    });
  });

  describe('getAllProjects', () => {
    it('should return all projects', () => {
      createProject('Project 1', 'Description 1');
      createProject('Project 2', 'Description 2');
      createProject('Project 3', 'Description 3');

      const allProjects = getAllProjects();
      expect(allProjects).toHaveLength(3);
    });

    it('should return empty array when no projects', () => {
      expect(getAllProjects()).toHaveLength(0);
    });
  });

  describe('updateProject', () => {
    it('should update project properties', () => {
      const project = createProject('Original', 'Original description');
      const updated = updateProject(project.id, { name: 'Updated', color: '#00ff00' });

      expect(updated.name).toBe('Updated');
      expect(updated.color).toBe('#00ff00');
    });

    it('should throw error for non-existent project', () => {
      expect(() => updateProject(999, { name: 'Updated' })).toThrow('not found');
    });
  });

  describe('deleteProject', () => {
    it('should delete project by id', () => {
      const project = createProject('To delete', 'Will be removed');
      expect(getAllProjects()).toHaveLength(1);

      deleteProject(project.id);
      expect(getAllProjects()).toHaveLength(0);
    });

    it('should throw error for non-existent project', () => {
      expect(() => deleteProject(999)).toThrow('not found');
    });
  });

  describe('addTaskToProject', () => {
    it('should add task to project', () => {
      const project = createProject('Project', 'Description');
      addTaskToProject(project.id, 1);
      addTaskToProject(project.id, 2);

      expect(project.taskIds).toEqual([1, 2]);
    });

    it('should throw error for duplicate task', () => {
      const project = createProject('Project', 'Description');
      addTaskToProject(project.id, 1);

      expect(() => addTaskToProject(project.id, 1)).toThrow('already in project');
    });

    it('should throw error for non-existent project', () => {
      expect(() => addTaskToProject(999, 1)).toThrow('not found');
    });
  });

  describe('removeTaskFromProject', () => {
    it('should remove task from project', () => {
      const project = createProject('Project', 'Description');
      addTaskToProject(project.id, 1);
      addTaskToProject(project.id, 2);

      removeTaskFromProject(project.id, 1);
      expect(project.taskIds).toEqual([2]);
    });

    it('should throw error for task not in project', () => {
      const project = createProject('Project', 'Description');
      expect(() => removeTaskFromProject(project.id, 999)).toThrow('not in project');
    });

    it('should throw error for non-existent project', () => {
      expect(() => removeTaskFromProject(999, 1)).toThrow('not found');
    });
  });
});
