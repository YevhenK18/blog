const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});


const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'No token' });
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.userId = decoded.id;
        next();
    });
};


app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
            [username, email, hashedPassword]
        );
        res.status(201).json({ message: 'User registered', userId: result.rows[0].id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});


app.get('/user', authenticate, async (req, res) => {
    const result = await pool.query('SELECT username FROM users WHERE id = $1', [req.userId]);
    res.json(result.rows[0]);
});


app.post('/posts', authenticate, async (req, res) => {
    const { title, content } = req.body;
    const result = await pool.query(
        'INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
        [req.userId, title, content]
    );
    res.json(result.rows[0]);
});


app.get('/posts', async (req, res) => {
    const result = await pool.query(`
        SELECT p.*, u.username, 
               COUNT(CASE WHEN r.reaction_type = true THEN 1 END) as likes,
               COUNT(CASE WHEN r.reaction_type = false THEN 1 END) as dislikes
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN reactions r ON p.id = r.post_id
        GROUP BY p.id, u.username
        ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
});


app.put('/posts/:id', authenticate, async (req, res) => {
    const { title, content } = req.body;
    const postId = req.params.id;
    const result = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    if (result.rows[0].user_id !== req.userId) return res.status(403).json({ error: 'Not authorized' });
    await pool.query(
        'UPDATE posts SET title = $1, content = $2 WHERE id = $3',
        [title, content, postId]
    );
    res.json({ message: 'Post updated' });
});


app.delete('/posts/:id', authenticate, async (req, res) => {
    const postId = req.params.id;
    const result = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    if (result.rows[0].user_id !== req.userId) return res.status(403).json({ error: 'Not authorized' });

    
    await pool.query('DELETE FROM reactions WHERE post_id = $1', [postId]);
    
    await pool.query('DELETE FROM comments WHERE post_id = $1', [postId]);
    
    await pool.query('DELETE FROM posts WHERE id = $1', [postId]);

    res.json({ message: 'Post deleted' });
});


app.post('/posts/:id/reaction', authenticate, async (req, res) => {
    const { reaction_type } = req.body;
    const postId = req.params.id;
    try {
        await pool.query(
            'INSERT INTO reactions (user_id, post_id, reaction_type) VALUES ($1, $2, $3) ON CONFLICT (user_id, post_id) DO UPDATE SET reaction_type = $3',
            [req.userId, postId, reaction_type]
        );
        res.json({ message: 'Reaction added' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/posts/:id/comments', authenticate, async (req, res) => {
    const { content } = req.body;
    const postId = req.params.id;
    const result = await pool.query(
        'INSERT INTO comments (user_id, post_id, content) VALUES ($1, $2, $3) RETURNING *',
        [req.userId, postId, content]
    );
    res.json(result.rows[0]);
});


app.get('/posts/:id/comments', async (req, res) => {
    const postId = req.params.id;
    const result = await pool.query(`
        SELECT c.*, u.username
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.post_id = $1
        ORDER BY c.created_at ASC
    `, [postId]);
    res.json(result.rows);
});


app.delete('/comments/:id', authenticate, async (req, res) => {
    const commentId = req.params.id;
    const result = await pool.query('SELECT user_id FROM comments WHERE id = $1', [commentId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Comment not found' });
    if (result.rows[0].user_id !== req.userId) return res.status(403).json({ error: 'Not authorized' });
    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
    res.json({ message: 'Comment deleted' });
});

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));