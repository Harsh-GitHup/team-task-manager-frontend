import { useContext } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;