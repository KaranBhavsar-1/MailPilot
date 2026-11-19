import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  signupUser,
  loginUser,
  getCurrentUser,
} from "../api/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing login when application starts
  const refreshUser = async () => {
    const token = localStorage.getItem("mailpilot_token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await getCurrentUser();
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem("mailpilot_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (credentials) => {
    const response = await loginUser(credentials);

    localStorage.setItem(
      "mailpilot_token",
      response.data.token
    );

    setUser(response.data.user);

    return response.data;
  };

  // Signup
  const signup = async (details) => {
    const response = await signupUser(details);

    localStorage.setItem(
      "mailpilot_token",
      response.data.token
    );

    setUser(response.data.user);

    return response.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("mailpilot_token");
    setUser(null);
  };

  useEffect(() => {
    refreshUser();

    const handleLogout = () => setUser(null);

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};