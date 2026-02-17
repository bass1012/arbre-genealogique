// src/config/databaseMySQL.ts
import mysql from 'mysql2/promise';

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
}

const config: DatabaseConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'arbre_genealogique',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Créer le pool de connexions
const pool = mysql.createPool(config);

// Test de connexion
pool.getConnection()
  .then(connection => {
    console.log('✅ Connecté à MySQL');
    connection.release();
  })
  .catch(error => {
    console.error('❌ Erreur de connexion MySQL:', error);
  });

export default pool;
