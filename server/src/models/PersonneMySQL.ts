// src/models/PersonneMySQL.ts
import mysql from 'mysql2/promise';

interface Personne {
  id: number;
  nom: string;
  prenom: string;
  nomJeuneFille?: string;
  surnoms?: string;
  dateNaissance?: Date;
  lieuNaissance?: string;
  dateDeces?: Date;
  lieuDeces?: string;
  causeDeces?: string;
  profession?: string;
  genre?: 'homme' | 'femme' | 'autre';
  photo?: string;
  photoPublicId?: string;
  biographie?: string;
  notes?: string;
  nationalite?: string;
  religion?: string;
  niveauEtudes?: string;
  familleId: number;
  createdAt: Date;
  updatedAt: Date;
}

class PersonneModel {
  private db: mysql.Connection;

  constructor(db: mysql.Connection) {
    this.db = db;
  }

  async create(personneData: Omit<Personne, 'id' | 'createdAt' | 'updatedAt'>): Promise<Personne> {
    const [result] = await this.db.execute(
      `INSERT INTO personnes (
        nom, prenom, nomJeuneFille, surnoms, dateNaissance, lieuNaissance,
        dateDeces, lieuDeces, causeDeces, profession, genre, photo,
        photoPublicId, biographie, notes, nationalite, religion, niveauEtudes, familleId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        personneData.nom,
        personneData.prenom,
        personneData.nomJeuneFille || null,
        personneData.surnoms ? JSON.stringify(personneData.surnoms) : null,
        personneData.dateNaissance || null,
        personneData.lieuNaissance || null,
        personneData.dateDeces || null,
        personneData.lieuDeces || null,
        personneData.causeDeces || null,
        personneData.profession || null,
        personneData.genre || null,
        personneData.photo || null,
        personneData.photoPublicId || null,
        personneData.biographie || null,
        personneData.notes || null,
        personneData.nationalite || null,
        personneData.religion || null,
        personneData.niveauEtudes || null,
        personneData.familleId
      ]
    );
    
    return this.findById((result as any).insertId);
  }

  async findById(id: number): Promise<Personne | null> {
    const [rows] = await this.db.execute(
      'SELECT * FROM personnes WHERE id = ?',
      [id]
    );
    return (rows as Personne[])[0] || null;
  }

  async findByFamille(familleId: number): Promise<Personne[]> {
    const [rows] = await this.db.execute(
      'SELECT * FROM personnes WHERE familleId = ? ORDER BY nom, prenom',
      [familleId]
    );
    return rows as Personne[];
  }

  async search(familleId: number, query: string): Promise<Personne[]> {
    const [rows] = await this.db.execute(
      `SELECT * FROM personnes 
       WHERE familleId = ? AND (
         nom LIKE ? OR prenom LIKE ? OR nomJeuneFille LIKE ? OR biographie LIKE ?
       ) ORDER BY nom, prenom`,
      [familleId, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    );
    return rows as Personne[];
  }

  async update(id: number, personneData: Partial<Personne>): Promise<Personne | null> {
    const [result] = await this.db.execute(
      `UPDATE personnes SET 
        nom = ?, prenom = ?, nomJeuneFille = ?, dateNaissance = ?, lieuNaissance = ?,
        dateDeces = ?, lieuDeces = ?, causeDeces = ?, profession = ?, genre = ?,
        photo = ?, photoPublicId = ?, biographie = ?, notes = ?, nationalite = ?,
        religion = ?, niveauEtudes = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ? AND familleId = ?`,
      [
        personneData.nom,
        personneData.prenom,
        personneData.nomJeuneFille || null,
        personneData.dateNaissance || null,
        personneData.lieuNaissance || null,
        personneData.dateDeces || null,
        personneData.lieuDeces || null,
        personneData.causeDeces || null,
        personneData.profession || null,
        personneData.genre || null,
        personneData.photo || null,
        personneData.photoPublicId || null,
        personneData.biographie || null,
        personneData.notes || null,
        personneData.nationalite || null,
        personneData.religion || null,
        personneData.niveauEtudes || null,
        id,
        personneData.familleId
      ]
    );
    
    return this.findById(id);
  }

  async delete(id: number, familleId: number): Promise<boolean> {
    const [result] = await this.db.execute(
      'DELETE FROM personnes WHERE id = ? AND familleId = ?',
      [id, familleId]
    );
    return (result as any).affectedRows > 0;
  }
}

export default PersonneModel;
