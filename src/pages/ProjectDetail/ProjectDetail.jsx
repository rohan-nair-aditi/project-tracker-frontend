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
      setError('Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        setTasks(tasks.filter(t => t.id !== taskId));
      } catch (err) {
        setError('Failed to delete task');
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
          </div>
          {project.description && (
            <p className="project-description">{project.description}</p>
          )}
        </div>
        <div className="header-actions">
          <button onClick={handleCreateTask} className="create-task-btn">
            Create New Task
          </button>
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
            <p>Create a new task to get started</p>
            <button onClick={handleCreateTask} className="create-task-btn">
              Create Task
            </button>
          </div>
        ) : (
          <div className="tasks-list">
            {filteredTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                users={users}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>

      {showTaskModal && (
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