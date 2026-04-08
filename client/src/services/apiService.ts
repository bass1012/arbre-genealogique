// src/services/apiService.ts
import authService from "./authService";

// En production, utiliser des URLs relatives (nginx fait le proxy)
// En développement, utiliser localhost:5001
const API_URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : (process.env.REACT_APP_API_URL || "http://localhost:5001");

// URL de base pour les assets (photos, uploads)
const ASSETS_URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : (process.env.REACT_APP_API_URL || "http://localhost:5001");

// Fonction pour construire l'URL complète d'une image
export const getImageUrl = (photoUrl: string | undefined | null): string | undefined => {
  if (!photoUrl) return undefined;
  
  // Si c'est déjà une URL complète (http/https) ou une data URL (base64), la retourner telle quelle
  if (photoUrl.startsWith('http') || photoUrl.startsWith('data:')) {
    return photoUrl;
  }
  
  // Sinon, c'est un chemin relatif, ajouter le préfixe du serveur
  return `${ASSETS_URL}${photoUrl}`;
};

class ApiService {
  // Méthodes génériques pour compatibilité
  async get(endpoint: string) {
    return this.request(endpoint);
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;
    const token = authService.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `Erreur HTTP ${response.status}` }));
      throw new Error(error.message || `Erreur HTTP ${response.status}`);
    }

    return await response.json();
  }

  // Personnes
  getPersonnes() {
    return this.request("/api/personnes");
  }

  getPersonneById(id: string) {
    return this.request(`/api/personnes/${id}`);
  }

  createPersonne(data: any) {
    return this.request("/api/personnes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updatePersonne(id: string, data: any) {
    return this.request(`/api/personnes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deletePersonne(id: string) {
    return this.request(`/api/personnes/${id}`, {
      method: "DELETE",
    });
  }

  // Relations
  getRelations() {
    return this.request("/api/relations");
  }

  getRelationsByPersonne(personneId: string) {
    return this.request(`/api/relations/personne/${personneId}`);
  }

  getFamille(personneId: string) {
    return this.request(`/api/relations/famille/${personneId}`);
  }

  createRelation(data: any) {
    return this.request("/api/relations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateRelation(id: string, data: any) {
    return this.request(`/api/relations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deleteRelation(id: string) {
    return this.request(`/api/relations/${id}`, {
      method: "DELETE",
    });
  }

  // Admin
  getUsers() {
    return this.request("/api/admin/users");
  }

  createUser(data: any) {
    return this.request("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateUser(id: string, data: any) {
    return this.request(`/api/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deleteUser(id: string) {
    return this.request(`/api/admin/users/${id}`, {
      method: "DELETE",
    });
  }

  getFamilles() {
    return this.request("/api/admin/familles");
  }

  createFamille(data: any) {
    return this.request("/api/admin/familles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  deleteFamille(id: string) {
    return this.request(`/api/admin/familles/${id}`, {
      method: "DELETE",
    });
  }

  // Upload
  uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append("photo", file);
    const token = authService.getToken();

    return fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }).then((res) => res.json());
  }
}

const apiService = new ApiService();
export default apiService;
