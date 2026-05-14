import { createContext, useState, useEffect, useContext, useMemo, useRef } from 'react';
import PropTypes from "prop-types";
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user, setUserRole } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]); // List of notification objects
  const [chatNotifications, setChatNotifications] = useState({});
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!user) {
      if (isInitialized.current) {
        setNotifications([]);
        setUnreadCount(0);
        setChatNotifications({});
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      isInitialized.current = false;
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    console.debug("[NotificationContext] resolved socketUrl:", socketUrl);
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket']
    });
    socketRef.current = newSocket;
    queueMicrotask(() => setSocket(newSocket));

    // Join company room for global notifications
    if (user.company_id) {
      newSocket.emit("join_company", user.company_id);
    }

    // Handle new chat messages
    newSocket.on("new_message", (message) => {
      // Don't notify for own messages
      if (String(message.sender_id) === String(user.id)) return;

      const currentPath = globalThis.location.pathname;
      const isChatPage = currentPath.startsWith('/chat');

      if (!isChatPage || !currentPath.includes(message.team_id)) {
        const notif = {
          id: Date.now() + Math.random(),
          type: 'message',
          title: `New message from ${message.name || message.email}`,
          content: message.message,
          team_id: message.team_id,
          created_at: new Date().toISOString(),
          link: '/chat'
        };

        setNotifications(prev => [notif, ...prev].slice(0, 20));
        setUnreadCount(prev => prev + 1);

        // Track per-team count for Sidebar/Chat badges
        setChatNotifications(prev => ({
          ...prev,
          [message.team_id]: (prev[message.team_id] || 0) + 1
        }));
      }
    });

    // Handle activity notifications (Project/Task updates)
    newSocket.on("new_notification", (notif) => {
      // Don't notify for own actions
      if (String(notif.user_id) === String(user.id)) return;

      const fullNotif = {
        id: Date.now() + Math.random(),
        ...notif
      };
      setNotifications(prev => [fullNotif, ...prev].slice(0, 20));
      setUnreadCount(prev => prev + 1);
    });

    // Handle real-time role changes
    newSocket.on("role_changed", (data) => {
      // If this user's role was changed, update their auth context
      if (String(data.user_id) === String(user.id)) {
        if (setUserRole && typeof setUserRole === 'function') {
          setUserRole(data.new_role);
        }
      }
    });

    return () => {
      newSocket.disconnect();
      if (socketRef.current === newSocket) {
        socketRef.current = null;
      }
      setSocket(currentSocket => (currentSocket === newSocket ? null : currentSocket));
    };
  }, [user, setUserRole]);

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    setChatNotifications({});
  };

  const clearUnread = () => {
    setUnreadCount(0);
  };

  const clearTeamUnread = (teamId) => {
    setChatNotifications(prev => {
      const newState = { ...prev };
      delete newState[teamId];
      return newState;
    });
    // Also remove from general notification list if they are messages for this team
    setNotifications(prev => prev.filter(n => !(n.type === 'message' && String(n.team_id) === String(teamId))));
  };

  const value = useMemo(() => ({
    socket,
    unreadCount,
    notifications,
    chatNotifications,
    clearAll,
    clearUnread,
    clearTeamUnread
  }), [socket, unreadCount, notifications, chatNotifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
