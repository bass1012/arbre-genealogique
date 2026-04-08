// src/AppWrapper.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import JoinFamily from "./components/Auth/JoinFamily";
import App from "./App";

const AppWrapper: React.FC = () => {
  const { user, famille, isAuthenticated, login, register, loading, setAuthData } = useAuth();
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  // Vérifier l'URL pour une invitation
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/rejoindre\/([a-zA-Z0-9]+)$/);
    if (match) {
      setInvitationCode(match[1]);
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
  };

  const handleRegister = async (data: any) => {
    await register(data);
  };

  const handleJoinSuccess = (token: string, userData: any, familleData: any) => {
    // Normaliser les données (API renvoie 'id', frontend attend '_id')
    const user = {
      _id: userData.id || userData._id,
      email: userData.email,
      nom: userData.nom,
      prenom: userData.prenom,
      role: userData.role
    };
    
    const famille = familleData ? {
      _id: familleData.id || familleData._id,
      nom: familleData.nom,
      description: familleData.description
    } : null;
    
    // Sauvegarder les données d'auth
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('famille', JSON.stringify(famille));
    
    // Mettre à jour le contexte
    setAuthData(token, user, famille);
    
    // Nettoyer l'URL et le state
    setInvitationCode(null);
    window.history.replaceState({}, '', '/');
  };

  const handleCancelJoin = () => {
    setInvitationCode(null);
    window.history.replaceState({}, '', '/');
  };

  if (loading) {
    return <div className="loading-screen">Chargement...</div>;
  }

  // Page de rejoindre avec invitation
  if (invitationCode && !isAuthenticated) {
    return (
      <JoinFamily 
        invitationCode={invitationCode} 
        onJoinSuccess={handleJoinSuccess}
        onCancel={handleCancelJoin}
      />
    );
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <Register 
          onRegister={handleRegister} 
          onSwitchToLogin={() => setShowRegister(false)} 
        />
      );
    }
    return (
      <Login 
        onLogin={handleLogin} 
        onSwitchToRegister={() => setShowRegister(true)} 
      />
    );
  }

  return <App user={user!} famille={famille!} />;
};

export default AppWrapper;
