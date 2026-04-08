// src/services/mockDataService.ts - Service de données simulées pour contourner OVH

export interface User {
  _id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  familleId: number;
}

export interface Famille {
  _id: number;
  nom: string;
  description?: string;
}

export interface Personne {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  genre: string;
  photo?: string;
  familleId: number;
}

export interface Relation {
  id: number;
  personne1: {_id: number; nom: string; prenom: string};
  personne2: {_id: number; nom: string; prenom: string};
  type: string;
  dateDebut?: string;
  dateFin?: string;
  details?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  famille: {_id: number; nom: string; description: string};
}

class MockDataService {
  private users: User[] = [];
  private familles: Famille[] = [];
  private personnes: Personne[] = [];
  private relations: Relation[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedUsers = localStorage.getItem('mockUsers');
      const savedFamilles = localStorage.getItem('mockFamilles');
      const savedPersonnes = localStorage.getItem('mockPersonnes');
      const savedRelations = localStorage.getItem('mockRelations');

      this.users = savedUsers ? JSON.parse(savedUsers) : this.getDefaultUsers();
      this.familles = savedFamilles ? JSON.parse(savedFamilles) : this.getDefaultFamilles();
      this.personnes = savedPersonnes ? JSON.parse(savedPersonnes) : this.getDefaultPersonnes();
      this.relations = savedRelations ? JSON.parse(savedRelations) : this.getDefaultRelations();
    } catch (error) {
      this.users = this.getDefaultUsers();
      this.familles = this.getDefaultFamilles();
      this.personnes = this.getDefaultPersonnes();
      this.relations = this.getDefaultRelations();
    }
  }

  private saveToStorage() {
    localStorage.setItem('mockUsers', JSON.stringify(this.users));
    localStorage.setItem('mockFamilles', JSON.stringify(this.familles));
    localStorage.setItem('mockPersonnes', JSON.stringify(this.personnes));
    localStorage.setItem('mockRelations', JSON.stringify(this.relations));
  }

  private getDefaultUsers(): User[] {
    return [
      {
        _id: 1,
        email: 'bassirou2010@gmail.com',
        nom: 'OUEDRAOGO',
        prenom: 'Bassirou',
        role: 'gestionnaire',
        familleId: 1
      },
      {
        _id: 2,
        email: 'test@example.com',
        nom: 'TEST',
        prenom: 'User',
        role: 'membre',
        familleId: 1
      },
      {
        _id: 3,
        email: 'aminata@example.com',
        nom: 'OUEDRAOGO',
        prenom: 'Aminata',
        role: 'membre',
        familleId: 1
      }
    ];
  }

  private getDefaultFamilles(): Famille[] {
    return [
      {
        _id: 1,
        nom: 'OUEDRAOGO',
        description: 'Famille OUEDRAOGO'
      }
    ];
  }

  private getDefaultPersonnes(): Personne[] {
    return [
      {
        id: 1,
        nom: 'OUEDRAOGO',
        prenom: 'Bassirou',
        dateNaissance: '1990-01-01',
        genre: 'homme',
        familleId: 1
      },
      {
        id: 2,
        nom: 'OUEDRAOGO',
        prenom: 'Aminata',
        dateNaissance: '1992-05-15',
        genre: 'femme',
        familleId: 1
      },
      {
        id: 3,
        nom: 'OUEDRAOGO',
        prenom: 'Mohamed',
        dateNaissance: '1985-03-20',
        genre: 'homme',
        familleId: 1
      },
      {
        id: 4,
        nom: 'OUEDRAOGO',
        prenom: 'Fatou',
        dateNaissance: '1988-07-10',
        genre: 'femme',
        familleId: 1
      }
    ];
  }

  private getDefaultRelations(): Relation[] {
    return [
      {
        id: 1,
        personne1: {_id: 1, nom: 'OUEDRAOGO', prenom: 'Bassirou'},
        personne2: {_id: 2, nom: 'OUEDRAOGO', prenom: 'Aminata'},
        type: 'conjoint',
        dateDebut: '2020-01-01',
        details: 'Mariage'
      },
      {
        id: 2,
        personne1: {_id: 3, nom: 'OUEDRAOGO', prenom: 'Mohamed'},
        personne2: {_id: 1, nom: 'OUEDRAOGO', prenom: 'Bassirou'},
        type: 'parent',
        dateDebut: '1990-01-01',
        details: 'Père'
      },
      {
        id: 3,
        personne1: {_id: 4, nom: 'OUEDRAOGO', prenom: 'Fatou'},
        personne2: {_id: 1, nom: 'OUEDRAOGO', prenom: 'Bassirou'},
        type: 'parent',
        dateDebut: '1990-01-01',
        details: 'Mère'
      }
    ];
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = this.users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Pour le compte admin, vérifier le mot de passe spécifique
    if (user.email === 'bassirou2010@gmail.com') {
      if (password !== 'Keep0ut@2026!') {
        throw new Error('Email ou mot de passe incorrect');
      }
    } else {
      // Pour les autres utilisateurs, accepter n'importe quel mot de passe (pour la démo)
      // En production, il faudrait vérifier le vrai mot de passe
      if (!password || password.length < 4) {
        throw new Error('Mot de passe incorrect (minimum 4 caractères)');
      }
    }
    
    return {
      token: 'mock-token-' + Date.now(),
      user,
      famille: {
        _id: 1,
        nom: 'OUEDRAOGO',
        description: 'Famille OUEDRAOGO'
      }
    };
  }

  async register(userData: any): Promise<AuthResponse> {
    const newUser: User = {
      _id: this.users.length + 1,
      email: userData.email,
      nom: userData.nom,
      prenom: userData.prenom,
      role: userData.role || 'membre',
      familleId: 1
    };

    this.users.push(newUser);

    return {
      token: 'mock-token-' + Date.now(),
      user: newUser,
      famille: {
        _id: 1,
        nom: 'OUEDRAOGO',
        description: 'Famille OUEDRAOGO'
      }
    };
  }

  async getPersonnes(): Promise<Personne[]> {
    return [...this.personnes];
  }

  async getRelations(): Promise<Relation[]> {
    return [...this.relations];
  }

  async createPersonne(personneData: any): Promise<Personne> {
    const newPersonne: Personne = {
      id: this.personnes.length + 1,
      ...personneData,
      familleId: 1
    };

    this.personnes.push(newPersonne);
    return newPersonne;
  }

  async createRelation(relationData: any): Promise<Relation> {
    const newRelation: Relation = {
      id: this.relations.length + 1,
      ...relationData
    };

    this.relations.push(newRelation);
    return newRelation;
  }

  // Admin endpoints
  async getUsers(): Promise<any[]> {
    return this.users.map(user => ({
      ...user,
      familleId: {
        _id: user.familleId,
        nom: 'OUEDRAOGO'
      },
      createdAt: new Date().toISOString()
    }));
  }

  async getFamilles(): Promise<Famille[]> {
    return [...this.familles];
  }

  async createUser(userData: any): Promise<User> {
    const newUser: User = {
      _id: this.users.length + 1,
      email: userData.email,
      nom: userData.nom,
      prenom: userData.prenom,
      role: userData.role || 'membre',
      familleId: userData.familleId || 1
    };

    this.users.push(newUser);
    this.saveToStorage();
    return newUser;
  }

  async updateUser(userId: number, userData: any): Promise<User> {
    const index = this.users.findIndex(u => u._id === userId);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...userData };
      this.saveToStorage();
      return this.users[index];
    }
    throw new Error('Utilisateur non trouvé');
  }

  async deleteUser(userId: number): Promise<void> {
    this.users = this.users.filter(u => u._id !== userId);
    this.saveToStorage();
  }

  async createFamille(familleData: any): Promise<Famille> {
    const newFamille: Famille = {
      _id: this.familles.length + 1,
      nom: familleData.nom,
      description: familleData.description
    };

    this.familles.push(newFamille);
    this.saveToStorage();
    return newFamille;
  }

  async deleteFamille(familleId: number): Promise<void> {
    this.familles = this.familles.filter(f => f._id !== familleId);
    this.saveToStorage();
  }
}

const mockDataService = new MockDataService();
export default mockDataService;
