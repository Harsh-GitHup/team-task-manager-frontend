import { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import PropTypes from "prop-types";
import { useLocation } from 'react-router-dom';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  return (
    <UIContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar }}>
      {children}
    </UIContext.Provider>
  );
};

UIProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
