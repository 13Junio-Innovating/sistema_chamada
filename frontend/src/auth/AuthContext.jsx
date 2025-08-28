import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import * as jwt_decode from "jwt-decode";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const decoded = jwt_decode(token);
      if (decoded?.exp && decoded.exp * 1000 > Date.now()) {
        setUser({ id: decoded.id, name: decoded.name, email: decoded.email });
      } else {
        localStorage.removeItem("token");
      }
    } catch {
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {loading ? <div>Carregando...</div> : children}
    </AuthContext.Provider>
  );
}
