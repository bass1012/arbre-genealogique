// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import authService, { User, Famille } from "../services/authService";

interface AuthContextType {
  user: User | null;
  famille: Famille | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
  setAuthData: (token: string, user: User, famille: Famille | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [famille, setFamille] = useState<Famille | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    const checkAuth = async () => {
      const savedUser = authService.getUser();
      const savedFamille = authService.getFamille();

      if (savedUser && authService.isAuthenticated()) {
        // Restaurer l'utilisateur et la famille depuis localStorage
        setUser(savedUser);
        setFamille(savedFamille);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    setFamille(response.famille);
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    setUser(response.user);
    setFamille(response.famille);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setFamille(null);
  };

  const setAuthData = (token: string, user: User, famille: Famille | null) => {
    setUser(user);
    setFamille(famille);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        famille,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
        setAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
