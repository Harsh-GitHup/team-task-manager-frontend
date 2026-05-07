import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";

function App() {
  const { user } = useContext(AuthContext);
  const isAuthenticated = Boolean(user);

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 p-6 sm:p-8 bg-slate-950/95">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/admin" element={user?.role === "admin" ? <Admin /> : <Navigate to="/" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </div>
      ) : (
        /* Public Routes: Only show if not logged in */
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;