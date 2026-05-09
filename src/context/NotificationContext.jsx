import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatNotifications, setChatNotifications] = useState({}); // { teamId: count }

  useEffect(() => {
    if (!user) return;

    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

    // Join all teams the user is part of (we'd ideally fetch teams first)
    // For simplicity, we'll listen to a global or team-specific channel
    
    socket.on("new_message", (message) => {
      // If we are not on the chat page for this team, increment unread count
      const currentPath = window.location.pathname;
      const isChatPage = currentPath.startsWith('/chat');
      
      // We'll refine this logic: if isChatPage and currentTeamId matches, don't increment
      // For now, simple global increment if not on chat
      if (!isChatPage || !currentPath.includes(message.team_id)) {
        setChatNotifications(prev => ({
          ...prev,
          [message.team_id]: (prev[message.team_id] || 0) + 1
        }));
        setUnreadCount(prev => prev + 1);
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
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, chatNotifications, clearUnread }}>
      {children}
    </NotificationContext.Provider>
  );
};
