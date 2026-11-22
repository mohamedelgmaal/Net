🎬 Netflix Clone – Full Stack Web Application

A full-stack Netflix-inspired web application built with React, Node.js, Express.js, and MongoDB. The project replicates key Netflix user experiences, including movie discovery, user authentication, and account management.

🚀 Features

🎥 Movie Experience

- Browse movies and explore movie posters.
- Fetch movie data using TMDB API.
- Search and discover movies.
- Access available movie video content.

🔐 Authentication & User Management

- User registration and login using email and password.
- Google OAuth authentication.
- Email verification using OTP.
- Forgot password functionality.
- Password reset functionality.
- Secure password hashing.
- Protected authentication routes.

🛡️ Security

- JWT-based authentication.
- Helmet security middleware.
- Express Rate Limiting.
- Secure password handling.
- Environment variables for sensitive configuration.

🛠️ Technologies Used

Frontend

- React.js
- Redux Toolkit
- React Router DOM
- Axios
- React Toastify
- Material UI
- CSS

Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcryptjs
- Nodemailer
- Google OAuth

External Services

- TMDB API
- Google Authentication
- Email OTP Verification

📁 Project Structure

Netflix/
│
├── backend/
│   ├── middleware/
│   ├── services/
│   ├── user/
│   ├── db.connection.js
│   ├── index.js
│   ├── movie.controller.js
│   ├── movie.router.js
│   ├── user.router.js
│   ├── package.json
│   └── .env.example
│
├── front/
│   ├── public/
│   ├── image/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── redux/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── .gitignore

⚙️ Installation & Setup

1. Clone the Repository

git clone YOUR_REPOSITORY_URL
cd Netflix

2. Backend Setup

cd backend
npm install

Configure your environment variables in a ".env" file using ".env.example" as a reference.

Start the backend server:

npm run dev

3. Frontend Setup

Open another terminal:

cd front
npm install
npm start

🔑 Environment Variables

Configure the following backend environment variables:

PORT=5000
NODE_ENV=development
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
TMDB_API_KEY=your_tmdb_bearer_token
CLIENT_URL=http://localhost:3000
TRUST_PROXY=0

Additional credentials may be required for Google OAuth and email verification.

Never upload your actual ".env" file or expose API keys and credentials publicly.

🎯 Project Goals

This project demonstrates practical full-stack development skills, including frontend development, REST API integration, database management, authentication systems, email verification, and backend security.

👨‍💻 Developer

Mohamed Elgmaal

Junior Full Stack Developer

Technologies: React.js | Node.js | Express.js | MongoDB | JavaScript

---

This is an educational project inspired by Netflix. It is not affiliated with or endorsed by Netflix.
