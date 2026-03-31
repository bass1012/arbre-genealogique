// src/models/UserMySQL.ts
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

interface User {
  id: number;
  email: string;
  password: string;
  nom: string;
  prenom: string;
  familleId: number;
  role: 'admin' | 'membre' | 'lecteur';
  createdAt: Date;
  updatedAt: Date;
}

class UserModel {
  private db: mysql.Connection;

  constructor(db: mysql.Connection) {
    this.db = db;
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User | null> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [result] = await this.db.execute(
      `INSERT INTO users (email, password, nom, prenom, familleId, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userData.email, hashedPassword, userData.nom, userData.prenom, userData.familleId, userData.role]
    );
    
    return this.findById((result as any).insertId);
  }

  async findById(id: number): Promise<User | null> {
    const [rows] = await this.db.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return (rows as User[])[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await this.db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return (rows as User[])[0] || null;
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    const [rows] = await this.db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return (rows as User[])[0] || null;
  }

  async comparePassword(candidatePassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }
}

export default UserModel;
