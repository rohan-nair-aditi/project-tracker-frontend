// src/pages/Projects/Projects.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import projectService from '../../services/projectService';
import ProjectModal from '../../components/ProjectModal/ProjectModal';
import './Projects.scss';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all tasks and comments.')) {
      try {
        await projectService.deleteProject(projectId);
        setProjects(projects.filter(p => p.id !== projectId));
      } catch (err) {
        setError('Failed to delete project');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const handleProjectSaved = () => {
    fetchProjects();
    handleModalClose();
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

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>My Projects</h1>
        <button onClick={handleCreateProject} className="create-btn">
          Create New Project
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {projects.length === 0 ? (
        <div className="empty-state">
          <h2>No projects yet</h2>
          <p>Create your first project to get started with task management</p>
          <button onClick={handleCreateProject} className="create-btn-large">
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>
                  <Link to={`/projects/${project.id}`}>{project.title}</Link>
                </h3>
                <div className="project-actions">
                  <button 
                    onClick={() => handleEditProject(project)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteProject(project.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="project-status">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(project.status) }}
                >
                  {project.status}
                </span>
              </div>

              <p className="project-description">
                {project.description || 'No description provided'}
              </p>

              <div className="project-meta">
                <div className="meta-item">
                  <span className="label">Tasks:</span>
                  <span className="value">{project.task_count || 0}</span>
                </div>
                <div className="meta-item">
                  <span className="label">Created:</span>
                  <span className="value">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="label">Updated:</span>
                  <span className="value">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="project-footer">
                <Link to={`/projects/${project.id}`} className="view-btn">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editingProject}
          onClose={handleModalClose}
          onSave={handleProjectSaved}
        />
      )}
    </div>
  );
};

export default Projects;


