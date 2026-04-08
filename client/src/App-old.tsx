// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Button, Card, List, Form, Input, DatePicker, Space, Tag, Popconfirm, message } from 'antd';
import { UserOutlined, TeamOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, UnorderedListOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import './App.css';
import RelationForm from './components/RelationForm';
import FamilyTree from './components/FamilyTree';

const { Header, Content } = Layout;

interface Personne {
  _id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
}

interface Relation {
  _id: string;
  type: string;
  personne1: {
    _id: string;
    nom: string;
    prenom: string;
  };
  personne2: {
    _id: string;
    nom: string;
    prenom: string;
  };
  dateDebut?: string;
  details?: string;
}

function App() {
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [showRelationForm, setShowRelationForm] = useState(false);
  const [nouvellePersonne, setNouvellePersonne] = useState({
    nom: '',
    prenom: '',
    dateNaissance: ''
  });

  // Charger les personnes
  const chargerPersonnes = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/personnes`);
      const data = await response.json();
      setPersonnes(data);
    } catch (error) {
      console.error('Erreur lors du chargement des personnes:', error);
    }
  };

  // Charger les relations
  const chargerRelations = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/relations`);
      const data = await response.json();
      setRelations(data);
    } catch (error) {
      console.error('Erreur lors du chargement des relations:', error);
    }
  };

  // Charger les données au démarrage
  useEffect(() => {
    chargerPersonnes();
    chargerRelations();
  }, []);

  // Gestionnaire d'ajout de personne
  const ajouterPersonne = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/personnes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nouvellePersonne),
      });
      
      if (response.ok) {
        await chargerPersonnes();
        setNouvellePersonne({ nom: '', prenom: '', dateNaissance: '' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la personne:', error);
    }
  };

  // Gestionnaire d'ajout de relation
  const handleRelationAdded = async () => {
    await chargerRelations();
  };

  // Gestionnaire de suppression de relation
  const supprimerRelation = async (relationId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette relation ?')) {
      return;
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/relations/${relationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await chargerRelations();
      } else {
        alert('Erreur lors de la suppression de la relation');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la relation:', error);
      alert('Erreur lors de la suppression de la relation');
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Arbre Généalogique</h1>
      </header>
      
      <main className="app-main">
        <div className="app-main-content">
          <section className="form-section">
            <h2>Ajouter une personne</h2>
            <form onSubmit={ajouterPersonne} className="person-form">
            <div className="form-group">
              <label htmlFor="nom">Nom:</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={nouvellePersonne.nom}
                onChange={(e) => setNouvellePersonne({...nouvellePersonne, nom: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="prenom">Prénom:</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={nouvellePersonne.prenom}
                onChange={(e) => setNouvellePersonne({...nouvellePersonne, prenom: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="dateNaissance">Date de naissance:</label>
              <input
                type="date"
                id="dateNaissance"
                name="dateNaissance"
                value={nouvellePersonne.dateNaissance}
                onChange={(e) => setNouvellePersonne({...nouvellePersonne, dateNaissance: e.target.value})}
                required
              />
            </div>
            
            <button type="submit" className="submit-btn">Ajouter</button>
          </form>

          <div className="relation-actions">
            <button 
              onClick={() => setShowRelationForm(!showRelationForm)}
              className="toggle-relation-btn"
            >
              {showRelationForm ? 'Masquer le formulaire de relation' : 'Ajouter une relation'}
            </button>
          </div>

        {showRelationForm && personnes.length > 0 && (
          <RelationForm
            personnes={personnes}
            onRelationAdded={handleRelationAdded}
          />
        )}
      </section>

        <section className="list-section">
          <div className="lists-container">
            <div className="person-list-container">
              <h2>Liste des personnes ({personnes.length})</h2>
              <ul className="person-list">
                {personnes.map((personne) => (
                  <li
                    key={personne._id}
                    className={
                      'person-item' +
                      (selectedPersonId === personne._id ? ' selected' : '')
                    }
                    onClick={() => setSelectedPersonId(personne._id)}
                  >
                    <div className="person-info">
                      <span className="person-name">
                        {personne.prenom} {personne.nom}
                        {selectedPersonId === personne._id && (
                          <span className="selected-indicator">✓</span>
                        )}
                      </span>
                      <span className="person-dob">
                        Né(e) le: {new Date(personne.dateNaissance).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relation-list-container">
              <h2>Relations familiales ({relations.length})</h2>
              {relations.length > 0 ? (
                <ul className="relation-list">
                  {relations.map((relation) => (
                    <li key={relation._id} className="relation-item">
                      <div className="relation-info">
                        <span className="relation-type">{relation.type}</span>
                        <span className="relation-persons">
                          {relation.personne1.prenom} {relation.personne1.nom}
                          &nbsp;→&nbsp;
                          {relation.personne2.prenom} {relation.personne2.nom}
                        </span>
                        {relation.dateDebut && (
                          <span className="relation-date">
                            {new Date(relation.dateDebut).toLocaleDateString()}
                          </span>
                        )}
                        <button
                          onClick={() => supprimerRelation(relation._id)}
                          className="delete-btn"
                          title="Supprimer cette relation"
                        >
                          🗑️
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Aucune relation définie</p>
              )}
            </div>
          </div>
        </section>
        </div>

        <section className="tree-view">
          <h2 style={{ textAlign: 'center', padding: '1rem 0', margin: 0, color: '#1976d2' }}>Arbre Généalogique</h2>
          {personnes.length > 0 ? (
            <FamilyTree
              people={personnes}
              relations={relations}
              rootId={selectedPersonId || personnes[0]._id}
              onSelectRoot={(id) => setSelectedPersonId(id)}
            />
          ) : (
            <p>Ajoutez au moins une personne pour afficher l'arbre généalogique.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;