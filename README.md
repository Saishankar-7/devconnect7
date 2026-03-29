# DevConnect

DevConnect is a professional networking platform that connects developers seeking job referrals with employees who can provide them. It offers a premium, real-time experience with integrated chat, personalized resume viewing, and a reputation-based rating system for referrers.

## 🚀 Key Features

### 💻 For Job Seekers (Freshers)
- **Direct Referrals**: Easily find and request referrals from employees at top companies.
- **Integrated Resume Viewer**: A seamless, same-tab viewing experience for PDF and Word resumes, now with personalized headers.
- **Real-time Interaction**: Chat directly with potential referrers and receive instant notifications for request status updates.
- **Professional Presence**: Showcase your skills, GitHub projects, and portfolio in a modern, dark-themed profile.

### 🏢 For Referrers (Employees)
- **Employee Rating System**: Earn reputation points for every referral you accept. Your rating is visible on your dashboard and discovery cards.
- **Efficient Candidate Evaluation**: Access applicant resumes directly from the Discovery page or their specialized profile view.
- **Streamlined Workflow**: Manage all incoming requests from a centralized dashboard with easy "Accept" and "Reject" actions.
- **Personalized Branding**: Display your current company and experience to attract the right candidates.

## 🛠️ Technology Stack

### Frontend
- **React.js**: Modern functional components with Hooks and Context API for global state management.
- **Vite**: High-performance development and build environment.
- **Socket.io Client**: For real-time chat and instantaneous notifications.
- **Axios**: Promised-based HTTP client for secure communication with the backend.
- **Vanilla CSS**: Custom, premium styling featuring glassmorphism, HSL-tailored colors, and smooth micro-animations.

### Backend
- **Node.js & Express.js**: Fast and scalable server architecture.
- **MongoDB & Mongoose**: Flexible NoSQL database with schema modeling.
- **Socket.io**: Real-time, event-based communication for chat and alerts.
- **JWT (JSON Web Tokens)**: Secure, cross-tab authentication and authorization.
- **Cloudinary**: Cloud storage for avatars and resumes, ensuring high availability and fast delivery.

## 📋 Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Cloudinary Account](https://cloudinary.com/) (Free tier available)

## ⚙️ Project Setup

### 1. Clone & Install
```bash
git clone <your-repository-url>
cd DevConnect
# Install all dependencies (Backend and Frontend)
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run the Application
In separate terminal windows:
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```
