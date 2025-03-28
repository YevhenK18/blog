import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Post from '../components/Post';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        const response = await axios.get('http://localhost:5000/posts');
        setPosts(response.data);
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/posts', { title, content }, {
                headers: { Authorization: token }
            });
            setTitle('');
            setContent('');
            fetchPosts();
        } catch (error) {
            alert('Failed to create post: ' + error.response.data.error);
        }
    };

    const handleDeletePost = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/posts/${id}`, {
                headers: { Authorization: token }
            });
            fetchPosts();
        } catch (error) {
            alert('Failed to delete post: ' + error.response.data.error);
        }
    };

    const handleEditPost = async (id, title, content) => {
        try {
            await axios.put(`http://localhost:5000/posts/${id}`, { title, content }, {
                headers: { Authorization: token }
            });
            fetchPosts();
        } catch (error) {
            alert('Failed to edit post: ' + error.response.data.error);
        }
    };

    const handleLike = async (id) => {
        try {
            await axios.post(`http://localhost:5000/posts/${id}/reaction`, { reaction_type: true }, {
                headers: { Authorization: token }
            });
            fetchPosts();
        } catch (error) {
            alert('Failed to like post: ' + error.response.data.error);
        }
    };

    const handleDislike = async (id) => {
        try {
            await axios.post(`http://localhost:5000/posts/${id}/reaction`, { reaction_type: false }, {
                headers: { Authorization: token }
            });
            fetchPosts();
        } catch (error) {
            alert('Failed to dislike post: ' + error.response.data.error);
        }
    };

    const handleComment = async (id, commentContent) => {
        try {
            await axios.post(`http://localhost:5000/posts/${id}/comments`, { content: commentContent }, {
                headers: { Authorization: token }
            });
            fetchPosts();
        } catch (error) {
            alert('Failed to comment: ' + error.response.data.error);
        }
    };

    return (
        <div className="container py-4">
            {token && (
                <div className="card mb-4 shadow-sm" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="card-body p-3">
                        <form onSubmit={handleCreatePost} className="d-flex flex-column">
                            <input
                                type="text"
                                className="form-control mb-2"
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                            <textarea
                                className="form-control mb-2"
                                placeholder="What's on your mind?"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows="2"
                                required
                            />
                            <button type="submit" className="btn btn-primary btn-sm align-self-end">Post</button>
                        </form>
                    </div>
                </div>
            )}
            {posts.map((post) => (
                <Post
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onDislike={handleDislike}
                    onComment={handleComment}
                    onDelete={handleDeletePost}
                    onEdit={handleEditPost}
                    isAuthor={token && post.user_id === parseInt(JSON.parse(atob(token.split('.')[1])).id)}
                />
            ))}
        </div>
    );
};

export default Home;