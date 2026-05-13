import { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import PropTypes from "prop-types";
import { useLocation } from 'react-router-dom';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);
  const contextValue = useMemo(
    () => ({ isSidebarOpen, toggleSidebar, closeSidebar }),
    [isSidebarOpen, toggleSidebar, closeSidebar]
  );

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      closeSidebar();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, closeSidebar]);

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  );
};

UIProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
