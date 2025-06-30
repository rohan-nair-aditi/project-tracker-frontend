// src/components/TaskItem/TaskItem.js
import React, { useState } from 'react';
import CommentModal from '../CommentModal/CommentModal';
import './TaskItem.scss';

const TaskItem = ({ task, users, onEdit, onDelete }) => {
  const [showComments, setShowComments] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#e74c3c';
      case 'medium':
        return '#f39c12';
      case 'low':
        return '#27ae60';
      default:
        return '#95a5a6';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return '#95a5a6';
      case 'in-progress':
        return '#f39c12';
      case 'done':
        return '#27ae60';
      default:
        return '#95a5a6';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && task.status !== 'done';
  };

  const getAssignedUser = () => {
    if (!task.assigned_to) return 'Unassigned';
    const user = users.find(u => u.id === task.assigned_to);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown User';
  };

  return (
    <>
      <div className={`task-item ${isOverdue(task.due_date) ? 'overdue' : ''}`}>
        <div className="task-header">
          <div className="task-title-section">
            <h3 className="task-title">{task.title}</h3>
            <div className="task-badges">
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(task.status) }}
              >
                {task.status.replace('-', ' ')}
              </span>
              <span 
                className="priority-badge"
                style={{ backgroundColor: getPriorityColor(task.priority) }}
              >
                {task.priority}
              </span>
            </div>
          </div>
          <div className="task-actions">
            <button onClick={() => setShowComments(true)} className="comments-btn">
              Comments
            </button>
            <button onClick={() => onEdit(task)} className="edit-btn">
              Edit
            </button>
            <button onClick={() => onDelete(task.id)} className="delete-btn">
              Delete
            </button>
          </div>
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        <div className="task-meta">
          <div className="meta-item">
            <span className="label">Assigned to:</span>
            <span className="value">{getAssignedUser()}</span>
          </div>
          <div className="meta-item">
            <span className="label">Due date:</span>
            <span className={`value ${isOverdue(task.due_date) ? 'overdue-text' : ''}`}>
              {formatDate(task.due_date)}
            </span>
          </div>
          <div className="meta-item">
            <span className="label">Created:</span>
            <span className="value">
              {new Date(task.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {showComments && (
        <CommentModal
          taskId={task.id}
          taskTitle={task.title}
          onClose={() => setShowComments(false)}
        />
      )}
    </>
  );
};

export default TaskItem;

