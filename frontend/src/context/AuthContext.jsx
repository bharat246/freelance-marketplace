import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const token = localStorage.getItem("fm_token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      localStorage.removeItem("fm_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("token");

    if (window.location.pathname === "/oauth-success" && oauthToken) {
      localStorage.setItem("fm_token", oauthToken);
      window.history.replaceState({}, "", "/dashboard");
    }

    refresh();
  }, []);

  async function login(payload) {
    const { data } = await api.post("/auth/login", payload);

    localStorage.setItem("fm_token", data.token);
    setUser(data.user);

    return data;
  }

  async function register(payload) {
    const { data } = await api.post("/auth/register", payload);

    localStorage.setItem("fm_token", data.token);
    setUser(data.user);

    return data;
  }

  function logout() {
    localStorage.removeItem("fm_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);