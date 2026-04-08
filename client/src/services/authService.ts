// src/services/authService.ts
import mockDataService from "./mockDataService";

export interface User {
  _id: string | number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
}

export interface Famille {
  _id: string | number;
  nom: string;
  description?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  famille: Famille | null;
}

// En production, utiliser des URLs relatives (nginx fait le proxy)
// En développement, utiliser localhost:5001
const API_URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : (process.env.REACT_APP_API_URL || "http://localhost:5001");

class AuthService {
  // Stocker le token dans localStorage
  setToken(token: string) {
    localStorage.setItem("token", token);
  }

  // Récupérer le token
  getToken(): string | null {
    return localStorage.getItem("token");
  }

  // Supprimer le token
  removeToken() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("famille");
  }

  // Stocker les infos utilisateur
  setUser(user: User) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  // Récupérer les infos utilisateur
  getUser(): User | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  // Stocker les infos de la famille
  setFamille(famille: Famille | null) {
    if (famille) {
      localStorage.setItem("famille", JSON.stringify(famille));
    }
  }

  // Récupérer les infos de la famille
  getFamille(): Famille | null {
    const famille = localStorage.getItem("famille");
    return famille ? JSON.parse(famille) : null;
  }

  // Inscription
  async register(data: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    nomFamille: string;
    descriptionFamille?: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Erreur lors de l'inscription");
    }

    // Stocker le token et les infos
    this.setToken(result.data.token);
    this.setUser(result.data.user);
    this.setFamille(result.data.famille);

    return result.data;
  }

  // Connexion
  async login(email: string, password: string): Promise<AuthResponse> {
    // Mode mock uniquement si explicitement configuré (développement local sans API)
    const useMock = process.env.REACT_APP_USE_MOCK === 'true';
    
    if (useMock) {
      console.warn("Mode mock activé (REACT_APP_USE_MOCK=true)");
      const response = await mockDataService.login(email, password);
      
      this.setToken(response.token);
      this.setUser(response.user);
      this.setFamille(response.famille);

      return {
        token: response.token,
        user: response.user,
        famille: response.famille
      };
    }

    // Appel API réel
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erreur de connexion" }));
      throw new Error(error.message || "Email ou mot de passe incorrect");
    }

    const result = await response.json();
    
    // Stocker le token et les infos
    this.setToken(result.data.token);
    this.setUser(result.data.user);
    this.setFamille(result.data.famille);

    return result.data;
  }

  // Déconnexion
  logout() {
    this.removeToken();
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  // Récupérer le profil de l'utilisateur
  async getProfile(): Promise<{ user: User; famille: Famille | null }> {
    const token = this.getToken();
    if (!token) {
      throw new Error("Non authentifié");
    }

    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Erreur lors de la récupération du profil",
      );
    }

    this.setUser(result.data.user);
    this.setFamille(result.data.famille);

    return result.data;
  }

  // Ajouter le token aux headers des requêtes
  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }
}

const authService = new AuthService();

export default authService;
