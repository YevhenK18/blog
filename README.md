# MiniBlog

A full-stack social media platform built with React, Node.js, and PostgreSQL, allowing users to create, edit, delete posts, comment, and react with likes or dislikes, featuring a responsive Bootstrap-based UI.

## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features
- **User Authentication**: Secure registration and login with JWT-based authentication.
- **Post Management**: Create, edit, and delete posts (only by the post author).
- **Comments**: Add, view, and delete comments (only by the comment author), with a toggle to show/hide comments.
- **Reactions**: Like or dislike posts with real-time updates.
- **Responsive Design**: Built with Bootstrap for a clean, mobile-friendly interface.
- **Authorization**: Only logged-in users can interact with posts; non-authors cannot edit or delete others' content.

## Technologies
- **Frontend**:
  - React
  - React Router
  - Bootstrap
  - Axios
- **Backend**:
  - Node.js
  - Express
  - PostgreSQL
  - JWT (JSON Web Tokens)
  - Bcrypt
- **Tools**:
  - Git
  - npm
  - dotenv

## Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- Git

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/YevhenK18/miniblog.git
   cd miniblog
   ```

2. **Set up the backend**:
   - Navigate to the server directory:
     ```bash
     cd server
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the `server` directory with the following:
     ```env
     DB_HOST=localhost
     DB_USER=your_postgres_user
     DB_PASSWORD=your_postgres_password
     DB_NAME=miniblog
     PORT=5000
     JWT_SECRET=your_jwt_secret
     ```
   - Set up the PostgreSQL database:
     ```sql
     CREATE DATABASE miniblog;
     \c miniblog
     CREATE TABLE users (
         id SERIAL PRIMARY KEY,
         username VARCHAR(255) UNIQUE NOT NULL,
         email VARCHAR(255) UNIQUE NOT NULL,
         password VARCHAR(255) NOT NULL
     );
     CREATE TABLE posts (
         id SERIAL PRIMARY KEY,
         user_id INTEGER REFERENCES users(id),
         title VARCHAR(255) NOT NULL,
         content TEXT NOT NULL,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );
     CREATE TABLE comments (
         id SERIAL PRIMARY KEY,
         user_id INTEGER REFERENCES users(id),
         post_id INTEGER REFERENCES posts(id),
         content TEXT NOT NULL,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );
     CREATE TABLE reactions (
         id SERIAL PRIMARY KEY,
         user_id INTEGER REFERENCES users(id),
         post_id INTEGER REFERENCES posts(id),
         reaction_type BOOLEAN NOT NULL,
         UNIQUE(user_id, post_id)
     );
     ```

3. **Set up the frontend**:
   - Navigate to the client directory:
     ```bash
     cd client
     ```
   - Install dependencies:
     ```bash
     npm install
     ```

4. **Run the application**:
   - Start the backend server:
     ```bash
     cd server
     npm start
     ```
   - Start the frontend development server:
     ```bash
     cd client
     npm start
     ```
   - Open `http://localhost:3000` in your browser.

## Usage
- **Register** or **log in** to access full functionality.
- Create a post using the form at the top of the homepage (visible only to logged-in users).
- Interact with posts by liking, disliking, or commenting (requires login).
- Edit or delete your own posts and comments via the respective buttons.
- Toggle comments visibility with the "Show Comments" button.

## Project Structure
```
miniblog/
├── client/                   # Frontend (React)
│   ├── src/
│   │   ├── components/       # Reusable components (Navbar, Post)
│   │   ├── pages/            # Page components (Home, Login, Register)
│   │   ├── App.js            # Main app component
│   │   ├── index.css         # Global styles
│   │   └── index.js          # Entry point
├── server/                   # Backend (Node.js/Express)
│   ├── server.js             # Main server file
│   ├── .env                  # Environment variables
│   └── package.json          # Backend dependencies
├── README.md                 # Project documentation
└── package.json              # Root project metadata
```

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
