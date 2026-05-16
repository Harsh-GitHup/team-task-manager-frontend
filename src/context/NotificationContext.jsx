import { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { io } from 'socket.io-client';
import API from '../api';
import { AuthContext } from './AuthContext';
import { getApiBaseUrl } from '../config/runtime';
import { NotificationContext } from './notificationContext';

let sharedSocket = null;

export const NotificationProvider = ({ children }) => {
  const { user, setUserRole } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [chatNotifications, setChatNotifications] = useState({});
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const isInitialized = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const messageFrameRef = useRef(null);
  const notificationFrameRef = useRef(null);
  const pendingMessagesRef = useRef([]);
  const pendingNotificationsRef = useRef([]);
  const seenEventKeysRef = useRef(new Set());
  const serverNotificationsLoadedRef = useRef(null);
  const notificationStorageKey = user?.id ? `team-task-manager:notifications:${user.id}` : null;

  const getMessageKey = useCallback((message) => {
    if (!message) return null;
    return `message:${message.id ?? message.team_id ?? ''}:${message.sender_id ?? ''}:${message.created_at ?? ''}`;
  }, []);

  const getNotificationKey = useCallback((notif) => {
    if (!notif) return null;
    return `notification:${notif.id ?? notif.type ?? ''}:${notif.user_id ?? notif.actor_user_id ?? ''}:${notif.team_id ?? ''}:${notif.created_at ?? ''}`;
  }, []);

  const rememberEventKey = useCallback((key) => {
    if (!key) return false;
    if (seenEventKeysRef.current.has(key)) return false;
    seenEventKeysRef.current.add(key);
    return true;
  }, []);

  const mergeNotifications = useCallback((existingNotifications, incomingNotifications) => {
    const seenIds = new Set(existingNotifications.map((item) => String(item.id)));
    const next = [...existingNotifications];
    let addedCount = 0;

    for (const notif of incomingNotifications) {
      if (seenIds.has(String(notif.id))) continue;
      next.unshift(notif);
      seenIds.add(String(notif.id));
      addedCount += 1;
    }

    return {
      notifications: next.slice(0, 20),
      addedCount,
    };
  }, []);

  useEffect(() => {
    if (!notificationStorageKey) {
      queueMicrotask(() => setIsHydrated(false));
      return;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      try {
        const raw = localStorage.getItem(notificationStorageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.notifications)) {
            setNotifications(parsed.notifications.slice(0, 20));
          }
          if (typeof parsed.unreadCount === 'number') {
            setUnreadCount(parsed.unreadCount);
          }
          if (parsed.chatNotifications && typeof parsed.chatNotifications === 'object') {
            setChatNotifications(parsed.chatNotifications);
          }
          if (Array.isArray(parsed.seenEventKeys)) {
            seenEventKeysRef.current = new Set(parsed.seenEventKeys);
          }
        } else {
          setNotifications([]);
          setUnreadCount(0);
          setChatNotifications({});
          seenEventKeysRef.current.clear();
        }
      } catch {
        setNotifications([]);
        setUnreadCount(0);
        setChatNotifications({});
        seenEventKeysRef.current.clear();
      } finally {
        isInitialized.current = true;
        setIsHydrated(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [notificationStorageKey]);

  useEffect(() => {
    if (!user || !isHydrated || !notificationStorageKey) return;

    const userKey = String(user.id);
    if (serverNotificationsLoadedRef.current === userKey) return;

    let cancelled = false;

    const loadUnreadNotifications = async () => {
      try {
        const res = await API.get('/notifications');
        if (cancelled) return;

        const serverNotifications = Array.isArray(res.data) ? res.data : [];
        const normalizedNotifications = serverNotifications.map((notif) => ({
          ...notif,
          user_id: notif.actor_user_id ?? notif.user_id ?? null,
        }));

        const existingIds = new Set(notifications.map((item) => String(item.id)));
        const uniqueServerNotifications = normalizedNotifications.filter((notif) => !existingIds.has(String(notif.id)));

        if (uniqueServerNotifications.length > 0) {
          const merged = mergeNotifications(notifications, uniqueServerNotifications);
          setNotifications(merged.notifications);
          setUnreadCount((prev) => prev + merged.addedCount);

          setChatNotifications((prev) => {
            const next = { ...prev };
            for (const notif of uniqueServerNotifications) {
              if (notif.type !== 'message' || notif.team_id == null) continue;
              const teamId = String(notif.team_id);
              next[teamId] = (next[teamId] || 0) + 1;
            }
            return next;
          });
        }

        serverNotificationsLoadedRef.current = userKey;
      } catch (err) {
        console.warn('Failed to load stored notifications', err);
      }
    };

    loadUnreadNotifications();

    return () => {
      cancelled = true;
    };
  }, [user, isHydrated, notificationStorageKey, notifications, mergeNotifications]);

  useEffect(() => {
    if (!notificationStorageKey || !isHydrated) return;

    try {
      localStorage.setItem(notificationStorageKey, JSON.stringify({
        notifications,
        unreadCount,
        chatNotifications,
        seenEventKeys: Array.from(seenEventKeysRef.current),
      }));
    } catch {
      /* ignore storage write errors */
    }
  }, [notificationStorageKey, notifications, unreadCount, chatNotifications, isHydrated]);

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
  }, [user, getMessageKey, rememberEventKey]);

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
  }, [getNotificationKey, rememberEventKey]);

  useEffect(() => {
    if (!user) {
      if (isInitialized.current) {
        setNotifications([]);
        setUnreadCount(0);
        setChatNotifications({});
      }
      serverNotificationsLoadedRef.current = null;
      if (sharedSocket) {
        sharedSocket.disconnect();
        sharedSocket = null;
        socketRef.current = null;
      }
      isInitialized.current = false;
      queueMicrotask(() => setIsHydrated(false));
      seenEventKeysRef.current.clear();
      queueMicrotask(() => setSocket(null));
      return;
    }

    if (!isHydrated) return;

    const socketUrl = getApiBaseUrl();
    console.debug('[NotificationContext] resolved socketUrl:', socketUrl);
    if (!sharedSocket) {
      sharedSocket = io(socketUrl, {
        autoConnect: false,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
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
      if (String(data.user_id) === String(user.id) && typeof setUserRole === 'function') {
        setUserRole(data.new_role);
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
      setSocket((currentSocket) => (currentSocket === newSocket ? null : currentSocket));
    };
  }, [user, isHydrated, setUserRole, flushPendingMessages, flushPendingNotifications]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setChatNotifications({});
    if (user) {
      API.post('/notifications/mark-read', { all: true }).catch(() => {});
    }
  }, [user]);

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
    if (user) {
      API.post('/notifications/mark-read', { all: true }).catch(() => {});
    }
  }, [user]);

  const markVisibleNotificationsRead = useCallback((ids) => {
    if (!user || !Array.isArray(ids) || ids.length === 0) return;

    API.post('/notifications/read-on-open', { ids }).catch(() => {});
    setUnreadCount(0);
  }, [user]);

  const clearTeamUnread = useCallback((teamId) => {
    setChatNotifications((prev) => {
      const newState = { ...prev };
      delete newState[teamId];
      return newState;
    });
    setNotifications((prev) => prev.filter((n) => !(n.type === 'message' && String(n.team_id) === String(teamId))));
  }, []);

  const value = useMemo(() => ({
    socket,
    unreadCount,
    notifications,
    chatNotifications,
    clearAll,
    clearUnread,
    markVisibleNotificationsRead,
    clearTeamUnread,
  }), [socket, unreadCount, notifications, chatNotifications, clearAll, clearUnread, markVisibleNotificationsRead, clearTeamUnread]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
