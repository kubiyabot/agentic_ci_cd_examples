/**
 * Search Module
 * Handles searching and filtering tasks
 */

function searchTasks(tasks, query) {
  if (!query || query.trim().length === 0) {
    return tasks;
  }

  const lowerQuery = query.toLowerCase();
  return tasks.filter(task =>
    task.title.toLowerCase().includes(lowerQuery) ||
    task.description.toLowerCase().includes(lowerQuery)
  );
}

function filterByPriority(tasks, priority) {
  return tasks.filter(task => task.priority === priority);
}

function filterByCompleted(tasks, completed) {
  return tasks.filter(task => task.completed === completed);
}

function filterByDueDate(tasks, startDate, endDate) {
  return tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= startDate && dueDate <= endDate;
  });
}

function sortTasks(tasks, sortBy = 'createdAt', order = 'desc') {
  const sorted = [...tasks].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return order === 'asc' ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return order === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}

module.exports = {
  searchTasks,
  filterByPriority,
  filterByCompleted,
  filterByDueDate,
  sortTasks,
};
