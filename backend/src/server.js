require('dotenv').config();
const http = require('http');
const app = require('./app'); // Assuming app.js handles Express app setup and routing
const connectDB = require('./config/db');
const { Server } = require('socket.io');

// Connect Database
connectDB();

const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

const Message = require('./models/Message');
const Notification = require('./models/Notification');
const User = require('./models/User');
const users = new Map();

// Attach io and users map to app so controllers can emit events
app.set('io', io);
app.set('connectedUsers', users);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Register user with their socketId
  socket.on('register', (userId) => {
    users.set(userId, socket.id);
  });

  // Join a specific chat room
  socket.on('joinRoom', (room) => {
    socket.join(room);
  });

  // Handle incoming messages
  socket.on('sendMessage', async (data) => {
    const { senderId, receiverId, content, room } = data;
    
    try {
      // Save message to database
      const newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        content
      });
      await newMessage.save();

      // Emit to the specific chat room
      io.to(room).emit('receiveMessage', newMessage);

      // Create Notification for the receiver
      const senderObj = await User.findById(senderId).select('name');
      const notification = new Notification({
        recipient: receiverId,
        sender: senderId,
        type: 'message',
        message: `New message from ${senderObj ? senderObj.name : 'someone'}`,
        linkURL: `/chat/${senderId}`
      });
      await notification.save();

      // Emit new notification directly to receiver if they're online
      const receiverSocketId = users.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newNotification', notification);
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (let [key, value] of users.entries()) {
      if (value === socket.id) {
        users.delete(key);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
