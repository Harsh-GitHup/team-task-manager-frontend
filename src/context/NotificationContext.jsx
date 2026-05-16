import { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import PropTypes from "prop-types";
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { getApiBaseUrl } from '../config/runtime';
import { NotificationContext } from './notificationContext';

let sharedSocket = null;

export const NotificationProvider = ({ children }) => {
  const { user, setUserRole } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]); // List of notification objects
  const [chatNotifications, setChatNotifications] = useState({});
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const isInitialized = useRef(false);
  const messageFrameRef = useRef(null);
  const notificationFrameRef = useRef(null);
  const pendingMessagesRef = useRef([]);
  const pendingNotificationsRef = useRef([]);
  const seenEventKeysRef = useRef(new Set());

  const getMessageKey = (message) => {
    if (!message) return null;
    return `message:${message.id ?? message.team_id ?? ''}:${message.sender_id ?? ''}:${message.created_at ?? ''}`;
  };

  const getNotificationKey = (notif) => {
    if (!notif) return null;
    return `notification:${notif.id ?? notif.type ?? ''}:${notif.user_id ?? ''}:${notif.team_id ?? ''}:${notif.created_at ?? ''}`;
  };

  const rememberEventKey = (key) => {
    if (!key) return false;
    if (seenEventKeysRef.current.has(key)) return false;
    seenEventKeysRef.current.add(key);
    return true;
  };

  const flushPendingMessages = useCallback(() => {
    messageFrameRef.current = null;
    const pendingMessages = pendingMessagesRef.current;
    if (pendingMessages.length === 0) return;
    pendingMessagesRef.current = [];

    const currentPath = globalThis.location?.pathname || '';
    const isChatPage = currentPath.startsWith('/chat');
    const acceptedMessages = [];

    for (const message of pendingMessages) {
      if (String(message.sender_id) === String(user.id)) continue;

      if (isChatPage && currentPath.includes(String(message.team_id))) continue;

      const messageKey = getMessageKey(message);
      if (!rememberEventKey(messageKey)) continue;

      acceptedMessages.push({
        id: message.id ?? Date.now() + Math.random(),
        type: 'message',
        title: `New message from ${message.name || message.email || 'someone'}`,
        content: message.message,
        team_id: message.team_id,
        created_at: new Date().toISOString(),
        link: '/chat',
      });
    }

    if (acceptedMessages.length === 0) return;

    setNotifications((prev) => [...acceptedMessages, ...prev].slice(0, 20));
    setUnreadCount((prev) => prev + acceptedMessages.length);

    const teamIncrements = acceptedMessages.reduce((acc, item) => {
      const teamId = String(item.team_id);
      acc[teamId] = (acc[teamId] || 0) + 1;
      return acc;
    }, {});

    setChatNotifications((prev) => {
      const next = { ...prev };
      for (const [teamId, increment] of Object.entries(teamIncrements)) {
        next[teamId] = (next[teamId] || 0) + increment;
      }
      return next;
    });
  }, [user]);

  const flushPendingNotifications = useCallback(() => {
    notificationFrameRef.current = null;
    const pendingNotifications = pendingNotificationsRef.current;
    if (pendingNotifications.length === 0) return;
    pendingNotificationsRef.current = [];

    const acceptedNotifications = [];
    for (const notif of pendingNotifications) {
      const notificationKey = getNotificationKey(notif);
      if (!rememberEventKey(notificationKey)) continue;
      acceptedNotifications.push({
        id: notif.id ?? Date.now() + Math.random(),
        ...notif,
      });
    }

    if (acceptedNotifications.length === 0) return;

    setNotifications((prev) => [...acceptedNotifications, ...prev].slice(0, 20));
    setUnreadCount((prev) => prev + acceptedNotifications.length);
  }, []);

  useEffect(() => {
    if (!user) {
      if (isInitialized.current) {
        setNotifications([]);
        setUnreadCount(0);
        setChatNotifications({});
      }
      if (sharedSocket) {
        sharedSocket.disconnect();
        sharedSocket = null;
        socketRef.current = null;
      }
      isInitialized.current = false;
      seenEventKeysRef.current.clear();
      queueMicrotask(() => setSocket(null));
      return;
    }

    const socketUrl = getApiBaseUrl();
    console.debug("[NotificationContext] resolved socketUrl:", socketUrl);
    if (!sharedSocket) {
      sharedSocket = io(socketUrl, {
        autoConnect: false,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
      });
    }

    const newSocket = sharedSocket;
    socketRef.current = newSocket;
    queueMicrotask(() => setSocket(newSocket));

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    newSocket.auth = token ? { token } : {};

    const handleConnect = () => {
      if (user?.company_id) {
        newSocket.emit('join_company', user.company_id);
      }
    };

    const handleNewMessage = (message) => {
      pendingMessagesRef.current.push(message);
      if (messageFrameRef.current === null) {
        messageFrameRef.current = requestAnimationFrame(flushPendingMessages);
      }
    };

    const handleNewNotification = (notif) => {
      if (String(notif.user_id) === String(user.id)) return;

      pendingNotificationsRef.current.push(notif);
      if (notificationFrameRef.current === null) {
        notificationFrameRef.current = requestAnimationFrame(flushPendingNotifications);
      }
    };

    const handleRoleChanged = (data) => {
      if (String(data.user_id) === String(user.id)) {
        if (setUserRole && typeof setUserRole === 'function') {
          setUserRole(data.new_role);
        }
      }
    };

    newSocket.off('connect', handleConnect);
    newSocket.off('new_message', handleNewMessage);
    newSocket.off('new_notification', handleNewNotification);
    newSocket.off('role_changed', handleRoleChanged);

    newSocket.on('connect', handleConnect);
    newSocket.on('new_message', handleNewMessage);
    newSocket.on('new_notification', handleNewNotification);
    newSocket.on('role_changed', handleRoleChanged);

    if (!newSocket.connected && !newSocket.connecting) {
      newSocket.connect();
    } else if (newSocket.connected) {
      handleConnect();
    }

    return () => {
      newSocket.off('connect', handleConnect);
      newSocket.off('new_message', handleNewMessage);
      newSocket.off('new_notification', handleNewNotification);
      newSocket.off('role_changed', handleRoleChanged);
      if (messageFrameRef.current !== null) {
        cancelAnimationFrame(messageFrameRef.current);
        messageFrameRef.current = null;
      }
      if (notificationFrameRef.current !== null) {
        cancelAnimationFrame(notificationFrameRef.current);
        notificationFrameRef.current = null;
      }
      pendingMessagesRef.current = [];
      pendingNotificationsRef.current = [];
      if (socketRef.current === newSocket) {
        socketRef.current = null;
      }
      setSocket(currentSocket => (currentSocket === newSocket ? null : currentSocket));
    };
  }, [user, setUserRole, flushPendingMessages, flushPendingNotifications]);

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
