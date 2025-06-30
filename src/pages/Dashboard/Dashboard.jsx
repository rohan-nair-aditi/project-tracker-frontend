// src/pages/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import projectService from '../../services/projectService';
import './Dashboard.scss';

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.firstName || user?.username}!</h1>
        <p>Here's an overview of your projects</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{projects.length}</h3>
          <p>Total Projects</p>
        </div>
        <div className="stat-card">
          <h3>{projects.filter(p => p.status === 'active').length}</h3>
          <p>Active Projects</p>
        </div>
        <div className="stat-card">
          <h3>{projects.filter(p => p.status === 'completed').length}</h3>
          <p>Completed Projects</p>
        </div>
        <div className="stat-card">
          <h3>{projects.reduce((total, p) => total + parseInt(p.task_count || 0), 0)}</h3>
          <p>Total Tasks</p>
        </div>
      </div>

      <div className="recent-projects">
        <div className="section-header">
          <h2>Recent Projects</h2>
          <Link to="/projects" className="view-all-btn">View All Projects</Link>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. Create your first project!</p>
            <Link to="/projects" className="create-btn">Create Project</Link>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.slice(0, 6).map(project => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <h3>
                    <Link to={`/projects/${project.id}`}>{project.title}</Link>
                  </h3>
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
                  <span className="task-count">{project.task_count || 0} tasks</span>
                  <span className="created-date">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;