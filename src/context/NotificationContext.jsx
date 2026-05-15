import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { NotificationContext } from './notificationContext';
import { getApiBaseUrl } from '../config/runtime';

let sharedSocket = null;

export function NotificationProvider({ children }) {
  const authCtx = useContext(AuthContext) || {};
  const user = authCtx.user;
  const setUserRole = authCtx.setUserRole;
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [chatNotifications, setChatNotifications] = useState({});

  useEffect(() => {
    if (!user) {
      // avoid sync setState in effect body — schedule reset next tick
      requestAnimationFrame(() => {
        setSocket(null);
        setUnreadCount(0);
        setNotifications([]);
        setChatNotifications({});
      });
      return;
    }

    const socketUrl = getApiBaseUrl();
    console.debug('[NotificationContext] resolved socketUrl:', socketUrl);

    try {
      if (!sharedSocket) {
        sharedSocket = io(socketUrl, {
          autoConnect: false,
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        });
      }
    } catch (err) {
      // Fail gracefully if socket initialization fails
      console.warn('[NotificationContext] socket init failed', err);
      sharedSocket = null;
    }

    const activeSocket = sharedSocket;
    socketRef.current = activeSocket;

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    activeSocket.auth = token ? { token } : {};

    const handleConnect = () => {
      if (user?.company_id) {
        try {
          activeSocket.emit('join_company', user.company_id);
        } catch (err) {
          console.warn('join_company emit failed', err);
        }
      }
    };

    const handleConnectError = (err) => {
      console.warn('[NotificationContext] socket connect_error', err);
    };

    const handleNewMessage = (message) => {
      if (!message) return;
      if (String(message.sender_id) === String(user.id)) return;

      const senderName =
        message.name ||
        message.sender_name ||
        message.user_name ||
        message.senderName ||
        message.email ||
        message.sender_email ||
        message.senderEmail ||
        'someone';

      const currentPath = globalThis.location?.pathname || '';
      const isChatPage = currentPath.startsWith('/chat');

      if (!isChatPage || !currentPath.includes(String(message.team_id))) {
        const notif = {
          id: Date.now() + Math.random(),
          type: 'message',
          title: `New message from ${senderName}`,
          content: message.message,
          team_id: message.team_id,
          created_at: new Date().toISOString(),
          link: '/chat',
        };

        setNotifications((prev) => [notif, ...prev].slice(0, 20));
        setUnreadCount((prev) => prev + 1);
        setChatNotifications((prev) => ({
          ...prev,
          [message.team_id]: (prev[message.team_id] || 0) + 1,
        }));
      }
    };

    const handleNewNotification = (notif) => {
      if (!notif) return;
      if (notif?.user_id && String(notif.user_id) === String(user.id)) return;

      setNotifications((prev) => [
        { id: Date.now() + Math.random(), ...notif },
        ...prev,
      ].slice(0, 20));
      setUnreadCount((prev) => prev + 1);
    };

    const handleRoleChanged = (data) => {
      if (!data) return;
      if (String(data.user_id) === String(user.id) && typeof setUserRole === 'function') {
        setUserRole(data.new_role);
      }
    };

    if (activeSocket) {
      activeSocket.off('connect', handleConnect);
      activeSocket.off('connect_error', handleConnectError);
      activeSocket.off('new_message', handleNewMessage);
      activeSocket.off('new_notification', handleNewNotification);
      activeSocket.off('role_changed', handleRoleChanged);

      activeSocket.on('connect', handleConnect);
      activeSocket.on('connect_error', handleConnectError);
      activeSocket.on('new_message', handleNewMessage);
      activeSocket.on('new_notification', handleNewNotification);
      activeSocket.on('role_changed', handleRoleChanged);
    }

    if (activeSocket) {
      if (!activeSocket.connected && !activeSocket.connecting) {
        try {
          activeSocket.connect();
        } catch (err) {
          console.warn('[NotificationContext] socket connect failed', err);
        }
      } else if (activeSocket.connected) {
        handleConnect();
      }
    }

    // schedule setState to avoid "setState in effect" lint error
    requestAnimationFrame(() => {
      setSocket(activeSocket);
    });

    return () => {
      if (activeSocket) {
        activeSocket.off('connect', handleConnect);
        activeSocket.off('connect_error', handleConnectError);
        activeSocket.off('new_message', handleNewMessage);
        activeSocket.off('new_notification', handleNewNotification);
        activeSocket.off('role_changed', handleRoleChanged);
      }
      // If user logged out, clear local socket auth so next login re-inits
      if (!user && sharedSocket?.disconnect) {
        try {
          sharedSocket.auth = {};
        } catch {
          /* ignore */
        }
      }
    };
    //// eslint-disable-next-line react-hooks/exhaustive-deps
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
    setChatNotifications((prev) => {
      const next = { ...prev };
      delete next[teamId];
      return next;
    });
    setNotifications((prev) => prev.filter((n) => !(n.type === 'message' && String(n.team_id) === String(teamId))));
  };

  const value = useMemo(
    () => ({
      socket,
      unreadCount,
      notifications,
      chatNotifications,
      clearAll,
      clearUnread,
      clearTeamUnread,
      setNotifications,
      setUnreadCount,
    }),
    [socket, unreadCount, notifications, chatNotifications],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
