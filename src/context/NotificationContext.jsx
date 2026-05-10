import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatNotifications, setChatNotifications] = useState({});
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    if (!user) return;

    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");
    
    socket.on("new_message", (message) => {
      const currentPath = globalThis.location.pathname;
      const isChatPage = currentPath.startsWith('/chat');
      
      if (!isChatPage || !currentPath.includes(message.team_id)) {
        setChatNotifications(prev => ({
          ...prev,
          [message.team_id]: (prev[message.team_id] || 0) + 1
        }));
        setUnreadCount(prev => prev + 1);
        setRecentMessages(prev => [message, ...prev].slice(0, 5));
      }
    });

    return () => socket.disconnect();
  }, [user]);

  const clearUnread = (teamId) => {
    setChatNotifications(prev => {
      const count = prev[teamId] || 0;
      setUnreadCount(total => Math.max(0, total - count));
      const newState = { ...prev };
      delete newState[teamId];
      return newState;
    });
    setRecentMessages(prev => prev.filter(m => String(m.team_id) !== String(teamId)));
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, chatNotifications, recentMessages, clearUnread }}>
      {children}
    </NotificationContext.Provider>
  );
};
