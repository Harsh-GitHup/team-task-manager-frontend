import { useMemo, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user"))
    );

    const login = (data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setUser(null);
    };

    const setUserRole = useCallback((newRole) => {
        setUser((prevUser) => {
            if (prevUser) {
                const updatedUser = { ...prevUser, role: newRole };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                return updatedUser;
            }
            return prevUser;
        });
    }, []);

    const value = useMemo(
        () => ({ user, login, logout, setUserRole }),
        [user, setUserRole]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};