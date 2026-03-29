# DevConnect

DevConnect is a professional networking platform that connects developers looking for job referrals with employees who can provide them. It features real-time chat, notifications, and an integrated resume viewer.

## 🚀 Features

- **Authentication System**: Secure JWT-based login and registration with BCrypt password hashing.
- **Role-based Experience**: Separate dashboards for Job Seekers (Developers) and Referrers (Employees).
- **Referral Tracking**: Submit, track, and manage referral requests with real-time status updates (Pending, Accepted, Rejected).
- **Real-time Chat**: Fully integrated chat system with real-time messaging using Socket.io, including typing indicators.
- **Instant Notifications**: Real-time notifications for new chat messages and referral status changes.
- **Rich Profiles**: Customizable user profiles with avatar and resume uploads powered by Cloudinary.
- **Discover Experts**: Powerful search system to find other professionals by name or company.
- **Resume Viewer**: Integrated PDF/Doc viewer for quick candidate evaluation.

## 🛠️ Tech Stack

### Frontend
- **React.js**: Functional components and Hooks.
- **Vite**: Ultra-fast build tool.
- **Socket.io Client**: For real-time communication.
- **Axios**: Promised-based HTTP client for API requests.
- **CSS Modules**: Scoped and modular styling.

### Backend
- **Node.js**: JavaScript runtime environment.
- **Express.js**: Fast, unopinionated, minimalist web framework.
- **MongoDB**: NoSQL database for flexible data storage (via Mongoose).
- **Socket.io**: Real-time bidirectional event-based communication.
- **JWT**: JSON Web Tokens for secure authentication.
- **Cloudinary**: Cloud-based image and file management.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

## ⚙️ Project Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd DevConnect
```

### 2. Backend Configuration
Navigate to the `backend/` directory and create a `.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Install dependencies and start the server:
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Configuration
Navigate to the `frontend/` directory and create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Install dependencies and start the development server:
```bash
cd frontend
npm install
npm run dev
```


