# Clueso Clone – AI-Powered Feedback Management System

<p align="center">
  <img src="./assets/landing-page.png" alt="Clueso Landing Page" width="900"/>
</p>

🔗 **Live Demo**
- Frontend: https://clueso-feedback-frontend.onrender.com
- Backend API: https://clueso-feedback-backend.onrender.com

📹 **Demo Video** - https://your-video-link-here

## 🎯 Project Overview

This project is a full-stack implementation inspired by Clueso.io, a platform designed to collect, organize, and analyze user feedback intelligently. The system provides real-time feedback collection, AI-powered insights, and an intuitive dashboard for managing user responses.

### Problem Statement
Organizations struggle to manage scattered user feedback across multiple channels. This platform centralizes feedback collection, automatically categorizes submissions, and generates actionable insights using AI.

## ✨ Key Features

### 1. **User Authentication & Authorization**
- Secure signup and login system
- JWT-based session management
- Protected routes and API endpoints
- Password hashing with bcrypt

### 2. **Interactive Dashboard**
- Real-time feedback statistics
- Visual feedback categorization (Bug, Feature Request, General)
- Latest feedback timeline
- AI-generated insights panel

### 3. **Feedback Collection System**
- User-friendly feedback submission form
- Automatic categorization
- Timestamp tracking
- User attribution

### 4. **Real-Time Updates (WebSocket Integration)**
- Live dashboard updates when new feedback arrives
- Near real-time synchronization across multiple clients using Socket.IO
- Socket.IO implementation for bidirectional communication

### 5. **AI-Powered Insights**
- Automated feedback summarization
- Trend analysis and pattern detection
- Sentiment categorization
- Actionable recommendations

### 6. **Robust Error Handling**
- Input validation on client and server
- Graceful error messages
- Loading states and user feedback
- Edge case management

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JWT (JSON Web Tokens) |
| **Real-Time** | Socket.IO |
| **AI Integration** | OpenAI API / Mock Service |

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   Browser (Next.js Frontend)       │
│   - Dashboard UI                    │
│   - Feedback Forms                  │
│   - Real-time Updates               │
└──────────────┬──────────────────────┘
               │
               │ HTTP/REST APIs + WebSocket
               │
┌──────────────▼──────────────────────┐
│   Backend (Node.js + Express)       │
│   - Authentication Middleware       │
│   - API Routes                      │
│   - Socket.IO Server                │
└──────────────┬──────────────────────┘
               │
               │ Mongoose ODM
               │
┌──────────────▼──────────────────────┐
│   MongoDB Database                  │
│   - Users Collection                │
│   - Feedback Collection             │
│   - Insights Collection             │
└─────────────────────────────────────┘
               │
               │ API Calls
               │
┌──────────────▼──────────────────────┐
│   AI Layer (OpenAI / Mock)          │
│   - Feedback Summarization          │
│   - Trend Analysis                  │
└─────────────────────────────────────┘
```

## 🚀 Getting Started

### 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Docker & Docker Compose** - [Download here](https://www.docker.com/get-started)
- **Git** - [Download here](https://git-scm.com/)

### 🔧 Installation & Setup

#### Option 1: Docker Setup (Recommended - Easiest)

```bash
# 1. Clone the repository
git clone https://github.com/nitishchy12/clueso-feedback-platform.git
cd clueso-feedback-platform

# 2. Start all services with Docker
docker-compose up -d

# 3. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# MongoDB: localhost:27017

# 4. View logs (optional)
docker-compose logs -f

# 5. Stop services when done
docker-compose down
```

#### Option 2: Manual Setup (For Development)

```bash
# 1. Clone the repository
git clone https://github.com/nitishchy12/clueso-feedback-platform.git
cd clueso-feedback-platform

# 2. Install root dependencies
npm install

# 3. Install all project dependencies
npm run install-all

# 4. Set up environment variables
# Backend: Copy backend/.env.example to backend/.env
# Frontend: Copy frontend/.env.local.example to frontend/.env.local

# 5. Start MongoDB (if running locally)
# Make sure MongoDB is running on localhost:27017

# 6. Start the application
npm run dev

# Frontend will be available at: http://localhost:3000
# Backend API will be available at: http://localhost:5000
```

### 🌍 Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clueso
JWT_SECRET=your_super_secret_jwt_key_here
OPENAI_API_KEY=your_openai_api_key_optional
NODE_ENV=development
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 🧪 Testing the Application

1. **Open your browser** and go to `http://localhost:3000`
2. **Sign up** for a new account or use demo credentials:
   - Email: `demo@clueso.io`
   - Password: `Demo123!`
3. **Submit feedback** to test the system
4. **Check the dashboard** for real-time updates and AI insights

### 🛠️ Development Commands

```bash
# Start development servers
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Install dependencies for both frontend and backend
npm run install-all

# Start only backend
npm run dev-backend

# Start only frontend
npm run dev-frontend
```

## 🐳 Docker Setup

### Prerequisites
- Docker and Docker Compose
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/nitishchy12/clueso-feedback-platform.git
cd clueso-feedback-platform

# Start all services (MongoDB + Backend + Frontend)
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Docker Commands (Advanced)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start (after code changes)
docker-compose up --build -d

# Remove all containers and volumes (clean reset)
docker-compose down -v
```

### 🔧 Troubleshooting

#### Common Issues

**Port Already in Use**
```bash
# Kill processes on ports 3000 and 5000
npx kill-port 3000
npx kill-port 5000
```

**MongoDB Connection Issues**
- Ensure MongoDB is running (for manual setup)
- Check connection string in environment variables
- For Docker setup, MongoDB runs automatically

**Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run install-all
```

**Docker Issues**
```bash
# Reset Docker containers
docker-compose down -v
docker-compose up --build -d
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Feedback
- `GET /api/feedback` - Get all feedback (protected)
- `POST /api/feedback` - Submit new feedback (protected)
- `GET /api/feedback/stats` - Get feedback statistics (protected)

### Insights
- `GET /api/insights` - Get AI-generated insights (protected)

## 🌐 Real-Time Features

The application uses Socket.IO for real-time communication:

**Events:**
- `feedback:new` - Emitted when new feedback is submitted
- `feedback:update` - Dashboard receives live updates
- `connect` / `disconnect` - Connection management

## 🚀 Deployment

This project is fully deployed using Docker and Render.

### Backend
- **Platform**: Render (Docker Web Service)
- **Database**: MongoDB Atlas
- **Authentication**: JWT
- **Environment Variables**: Managed via Render Dashboard

### Frontend
- **Platform**: Render (Docker Web Service)
- **Communicates**: With backend via REST APIs

### Database
- **MongoDB Atlas**: Cloud-hosted
- **Security**: Secure access via credentials and IP rules

The system is production-ready and accessible publicly.

## 🤖 AI Integration

**Mock AI Service**: Enabled by default for consistent execution. Architecture supports seamless OpenAI integration.

## 📝 Assumptions & Design Decisions

1. **AI Service**: Mock AI service implemented as fallback when OpenAI API key is unavailable
2. **Browser Extension**: Not included in this implementation (focused on core web platform)
3. **File Uploads**: Text-based feedback only (no attachments)
4. **Scalability**: Designed for moderate traffic; production deployment would require load balancing
5. **Security**: JWT tokens expire after 24 hours; passwords hashed with bcrypt (10 rounds)

## 📊 Future Enhancements

- Email notifications for feedback responses
- Advanced analytics dashboard
- Multi-language support
- Feedback voting system
- Admin panel for user management
- Export feedback to CSV/PDF

## 👨‍💻 Author

Built as a technical assessment project demonstrating full-stack development skills, real-time communication, and AI integration.

## 📄 License

MIT License - Free to use for educational purposes.

---

**Note**: This is an educational project inspired by Clueso.io. All code is original and written specifically for this implementation.
