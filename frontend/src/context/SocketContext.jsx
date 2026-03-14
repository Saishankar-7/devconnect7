import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      // Initialize Socket connection globally (uses production URL if deployed)
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      console.log('Attempting socket connection to:', socketUrl);

      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Socket Connected! ID:', newSocket.id);
        // Register the user globally
        newSocket.emit('register', user._id);
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket Connection Error:', err.message);
      });

      newSocket.on('disconnect', (reason) => {
        console.warn('Socket Disconnected:', reason);
      });

      setSocket(newSocket);

      return () => {
        console.log('Cleaning up socket connection...');
        newSocket.disconnect();
      };
    } else {
      // Disconnect socket if user signs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
