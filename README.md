# Clueso.io Clone - AI-Powered Feedback Management System

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
- Instant synchronization across multiple clients
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

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd clueso-clone
```

2. **Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clueso
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_key_or_leave_blank_for_mock
```

Start backend server:
```bash
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

Create `.env.local` file in frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Start frontend development server:
```bash
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
clueso-clone/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js              # Landing page
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── dashboard/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── FeedbackForm.js
│   │   │   ├── FeedbackList.js
│   │   │   └── InsightsPanel.js
│   │   └── services/
│   │       ├── api.js               # API client
│   │       └── socket.js            # Socket.IO client
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Feedback.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── feedback.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── feedbackController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── services/
│   │   │   └── aiService.js
│   │   └── server.js
│   ├── package.json
│   └── .env
│
└── README.md
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

## 🤖 AI Integration

### Implementation Options

**Option A: OpenAI Integration (Recommended)**
- Uses GPT-3.5/4 for intelligent summarization
- Analyzes feedback patterns and sentiment
- Generates actionable insights

**Option B: Mock Service (Fallback)**
- Rule-based categorization
- Keyword extraction
- Statistical analysis

*Current implementation supports both modes based on API key availability.*

## 📝 Assumptions & Design Decisions

1. **AI Service**: Mock AI service implemented as fallback when OpenAI API key is unavailable
2. **Browser Extension**: Not included in this implementation (focused on core web platform)
3. **File Uploads**: Text-based feedback only (no attachments)
4. **Scalability**: Designed for moderate traffic; production deployment would require load balancing
5. **Security**: JWT tokens expire after 24 hours; passwords hashed with bcrypt (10 rounds)

## 🧪 Testing

Run backend tests:
```bash
cd backend
npm test
```

Run frontend tests:
```bash
cd frontend
npm test
```

## 🚢 Deployment Considerations

- **Frontend**: Deploy on Vercel/Netlify
- **Backend**: Deploy on Railway/Render/Heroku
- **Database**: MongoDB Atlas for production
- **Environment Variables**: Configure in deployment platform

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
