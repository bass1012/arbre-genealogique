-- Schema SQL pour l'arbre généalogique
-- À importer dans phpMyAdmin LWS

-- Créer la base de données
-- DATABASE: sites2748375 (déjà créée par LWS)
USE sites2748375;

-- Table des familles
CREATE TABLE IF NOT EXISTS familles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  createdBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  familleId INT NOT NULL,
  role ENUM('superadmin', 'gestionnaire', 'membre', 'lecteur') DEFAULT 'membre',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (familleId) REFERENCES familles(id) ON DELETE CASCADE
);

-- Table des personnes
CREATE TABLE IF NOT EXISTS personnes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  nomJeuneFille VARCHAR(255),
  surnoms JSON,
  dateNaissance DATE,
  lieuNaissance VARCHAR(255),
  dateDeces DATE,
  lieuDeces VARCHAR(255),
  causeDeces VARCHAR(255),
  profession VARCHAR(255),
  genre ENUM('homme', 'femme', 'autre'),
  photo VARCHAR(500),
  photoPublicId VARCHAR(255),
  biographie TEXT,
  notes TEXT,
  nationalite VARCHAR(100),
  religion VARCHAR(100),
  niveauEtudes VARCHAR(100),
  familleId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (familleId) REFERENCES familles(id) ON DELETE CASCADE,
  INDEX idx_famille (familleId),
  INDEX idx_recherche (nom, prenom, nomJeuneFille),
  INDEX idx_dates (dateNaissance, dateDeces)
);

-- Table des relations
CREATE TABLE IF NOT EXISTS relations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  personneId INT NOT NULL,
  typeRelation ENUM('parent', 'enfant', 'conjoint', 'frere_soeur') NOT NULL,
  personneLieeId INT NOT NULL,
  dateDebut DATE,
  dateFin DATE,
  details TEXT,
  familleId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (personneId) REFERENCES personnes(id) ON DELETE CASCADE,
  FOREIGN KEY (personneLieeId) REFERENCES personnes(id) ON DELETE CASCADE,
  FOREIGN KEY (familleId) REFERENCES familles(id) ON DELETE CASCADE
);

-- Table des documents
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  personneId INT NOT NULL,
  type ENUM('acte_naissance', 'acte_deces', 'acte_mariage', 'photo', 'diplome', 'contrat_travail', 'document_identite', 'certificat', 'autre') NOT NULL,
  titre VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  urlPublicId VARCHAR(255),
  date DATE,
  description TEXT,
  taille INT,
  formatFichier VARCHAR(50),
  familleId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (personneId) REFERENCES personnes(id) ON DELETE CASCADE,
  FOREIGN KEY (familleId) REFERENCES familles(id) ON DELETE CASCADE
);

-- Index pour optimisation
CREATE INDEX idx_personnes_famille ON personnes(familleId);
CREATE INDEX idx_personnes_nom ON personnes(nom);
CREATE INDEX idx_personnes_prenom ON personnes(prenom);
CREATE INDEX idx_relations_personne ON relations(personneId);
CREATE INDEX idx_documents_personne ON documents(personneId);
