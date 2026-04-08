// src/components/Auth/Register.tsx
import React, { useState } from 'react';
import './Auth.css';

interface RegisterProps {
  onRegister: (data: RegisterData) => Promise<void>;
  onSwitchToLogin: () => void;
}

export interface RegisterData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  nomFamille: string;
  descriptionFamille?: string;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    nomFamille: '',
    descriptionFamille: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      await onRegister(formData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h1>🌳 Arbre Généalogique</h1>
          <h2>Créer votre espace familial</h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-section">
            <h3>Vos informations</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prenom">Prénom *</label>
                <input
                  id="prenom"
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  placeholder="Jean"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="nom">Nom *</label>
                <input
                  id="nom"
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  placeholder="Dupont"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="votre@email.com"
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Mot de passe *</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmer *</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Votre famille</h3>
            <div className="form-group">
              <label htmlFor="nomFamille">Nom de la famille *</label>
              <input
                id="nomFamille"
                type="text"
                name="nomFamille"
                value={formData.nomFamille}
                onChange={handleChange}
                required
                placeholder="Famille Dupont"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="descriptionFamille">Description (optionnel)</label>
              <textarea
                id="descriptionFamille"
                name="descriptionFamille"
                value={formData.descriptionFamille}
                onChange={handleChange}
                placeholder="Courte description de votre arbre familial..."
                rows={3}
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Création...' : 'Créer mon espace familial'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Vous avez déjà un compte ?{' '}
            <button onClick={onSwitchToLogin} className="auth-link-btn">
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
