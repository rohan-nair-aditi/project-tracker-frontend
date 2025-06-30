// src/components/CommentModal/CommentModal.js
import React, { useState, useEffect } from 'react';
import commentService from '../../services/commentService';
import './CommentModal.scss';

const CommentModal = ({ taskId, taskTitle, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const data = await commentService.getComments(taskId);
      setComments(data);
    } catch (err) {
      setError('Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      await commentService.createComment(taskId, newComment.trim());
      setNewComment('');
      fetchComments();
    } catch (err) {
      setError('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Comments - {taskTitle}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="comments-container">
          {loading ? (
            <div className="loading">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="empty-comments">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">
                      {comment.first_name} {comment.last_name} ({comment.username})
                    </span>
                    <span className="comment-date">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <div className="comment-content">
                    {comment.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="comment-form">
            <div className="form-group">
              <label htmlFor="newComment">Add a comment</label>
              <textarea
                id="newComment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment here..."
                rows="3"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={submitting || !newComment.trim()}>
                {submitting ? 'Adding...' : 'Add Comment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;

