import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Post = ({ post, onLike, onDislike, onComment, onDelete, onEdit, isAuthor }) => {
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(post.title);
    const [editContent, setEditContent] = useState(post.content);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (showComments) {
            fetchComments();
        }
    }, [showComments]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/posts/${post.id}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        }
    };

    const handleToggleComments = () => {
        setShowComments(!showComments);
    };

    const handleCommentSubmit = (e) => {
        if (e.key === 'Enter' && commentContent.trim()) {
            onComment(post.id, commentContent);
            setCommentContent('');
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(`http://localhost:5000/comments/${commentId}`, {
                headers: { Authorization: token }
            });
            fetchComments();
        } catch (error) {
            alert('Failed to delete comment: ' + error.response.data.error);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await onEdit(post.id, editTitle, editContent);
            setIsEditing(false);
        } catch (error) {
            alert('Failed to edit post: ' + error.response.data.error);
        }
    };

    const currentUserId = token ? parseInt(JSON.parse(atob(token.split('.')[1])).id) : null;

    return (
        <div className="card mb-4 shadow-sm" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card-body">
                {isEditing ? (
                    <form onSubmit={handleEditSubmit}>
                        <input
                            type="text"
                            className="form-control mb-2"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            required
                        />
                        <textarea
                            className="form-control mb-2"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows="2"
                            required
                        />
                        <button type="submit" className="btn btn-primary btn-sm me-2">Save</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
                    </form>
                ) : (
                    <>
                        <h5 className="card-title fw-bold">{post.title}</h5>
                        <p className="card-text text-muted">{post.content}</p>
                        <p className="text-muted small">Posted by: {post.username}</p>
                    </>
                )}
                <div className="d-flex justify-content-between mb-3">
                    <button
                        className="btn btn-outline-success btn-sm"
                        onClick={() => token ? onLike(post.id) : alert('Please log in or register to interact with posts')}
                    >
                        Like ({post.likes || 0})
                    </button>
                    <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => token ? onDislike(post.id) : alert('Please log in or register to interact with posts')}
                    >
                        Dislike ({post.dislikes || 0})
                    </button>
                    {isAuthor && !isEditing && (
                        <>
                            <button className="btn btn-outline-primary btn-sm" onClick={() => setIsEditing(true)}>
                                Edit
                            </button>
                            <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(post.id)}>
                                Delete
                            </button>
                        </>
                    )}
                </div>
                <div className="mb-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Add a comment..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        onKeyPress={handleCommentSubmit}
                        disabled={!token}
                        title={!token ? 'Please log in to comment' : ''}
                    />
                </div>
                <button className="btn btn-link text-muted p-0" onClick={handleToggleComments}>
                    {showComments ? 'Hide Comments' : 'Show Comments'}
                </button>
                {showComments && (
                    <div className="mt-2">
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment.id} className="border-top pt-2 d-flex justify-content-between">
                                    <div>
                                        <p className="small text-muted mb-0">{comment.content}</p>
                                        <p className="small text-muted">By: {comment.username}</p>
                                    </div>
                                    {token && comment.user_id === currentUserId && (
                                        <button
                                            className="btn btn-link text-danger p-0"
                                            onClick={() => handleDeleteComment(comment.id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="small text-muted">No comments yet.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Post;