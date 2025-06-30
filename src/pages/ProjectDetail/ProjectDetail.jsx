// src/pages/ProjectDetail/ProjectDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import projectService from '../../services/projectService';
import taskService from '../../services/taskService';
import userService from '../../services/userService';
import TaskModal from '../../components/TaskModal/TaskModal';
import TaskItem from '../../components/TaskItem/TaskItem';
import './ProjectDetail.scss';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projectData, tasksData, usersData] = await Promise.all([
        projectService.getProject(id),
        taskService.getTasks(id),
        userService.getUsers()
      ]);
      
      setProject(projectData);
      setTasks(tasksData);
      setUsers(usersData);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view this project');
      } else {
        setError('Failed to fetch project details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    if (!project?.can_edit) {
      setError('Only the project owner can create tasks');
      return;
    }
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    if (!project?.can_edit) {
      setError('Only the project owner can edit tasks');
      return;
    }
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!project?.can_edit) {
      setError('Only the project owner can delete tasks');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        setTasks(tasks.filter(t => t.id !== taskId));
      } catch (err) {
        if (err.response?.status === 403) {
          setError('You can only delete tasks in your own projects');
        } else {
          setError('Failed to delete task');
        }
      }
    }
  };

  const handleModalClose = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleTaskSaved = () => {
    fetchProjectData();
    handleModalClose();
  };

  const getFilteredTasks = () => {
    if (filter === 'all') return tasks;
    return tasks.filter(task => task.status === filter);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#27ae60';
      case 'completed':
        return '#3498db';
      case 'on-hold':
        return '#f39c12';
      default:
        return '#95a5a6';
    }
  };

  const getTaskCounts = () => {
    return {
      all: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      'in-progress': tasks.filter(t => t.status === 'in-progress').length,
      done: tasks.filter(t => t.status === 'done').length
    };
  };

  if (loading) return <div className="loading">Loading project details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!project) return <div className="error-message">Project not found</div>;

  const taskCounts = getTaskCounts();
  const filteredTasks = getFilteredTasks();
  const canEdit = project.can_edit;

  return (
    <div className="project-detail">
      <div className="project-header">
        <div className="header-left">
          <div className="breadcrumb">
            <Link to="/projects">Projects</Link>
            <span> / </span>
            <span>{project.title}</span>
          </div>
          <h1>{project.title}</h1>
          <div className="project-meta">
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(project.status) }}
            >
              {project.status}
            </span>
            <span className="created-date">
              Created {new Date(project.created_at).toLocaleDateString()}
            </span>
            {!canEdit && (
              <span className="owner-info">
                Owner: {project.first_name} {project.last_name}
              </span>
            )}
          </div>
          {project.description && (
            <p className="project-description">{project.description}</p>
          )}
          {!canEdit && (
            <div className="permission-notice">
              <span>📋 You are viewing this project. Only the owner can manage tasks.</span>
            </div>
          )}
        </div>
        <div className="header-actions">
          {canEdit && (
            <button onClick={handleCreateTask} className="create-task-btn">
              Create New Task
            </button>
          )}
        </div>
      </div>

      <div className="task-filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Tasks ({taskCounts.all})
        </button>
        <button
          className={filter === 'todo' ? 'active' : ''}
          onClick={() => setFilter('todo')}
        >
          To Do ({taskCounts.todo})
        </button>
        <button
          className={filter === 'in-progress' ? 'active' : ''}
          onClick={() => setFilter('in-progress')}
        >
          In Progress ({taskCounts['in-progress']})
        </button>
        <button
          className={filter === 'done' ? 'active' : ''}
          onClick={() => setFilter('done')}
        >
          Done ({taskCounts.done})
        </button>
      </div>

      <div className="tasks-section">
        {filteredTasks.length === 0 ? (
          <div className="empty-tasks">
            <h3>No tasks {filter !== 'all' ? `with status "${filter}"` : ''}</h3>
            <p>{canEdit ? 'Create a new task to get started' : 'No tasks to display'}</p>
            {canEdit && (
              <button onClick={handleCreateTask} className="create-task-btn">
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="tasks-list">
            {filteredTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                users={users}
                canEdit={canEdit}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>

      {showTaskModal && canEdit && (
        <TaskModal
          task={editingTask}
          projectId={id}
          users={users}
          onClose={handleModalClose}
          onSave={handleTaskSaved}
        />
      )}
    </div>
  );
};


export default ProjectDetail;
