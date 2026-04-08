# TODO - Arbre Généalogique

## Workflow de développement

### Développement local
```bash
# Terminal 1 - Backend (port 5000)
cd server && npm run dev

# Terminal 2 - Frontend (port 3000)
cd client && npm start
```

Ou utiliser les scripts:
```bash
./dev.sh server   # Démarre le backend
./dev.sh client   # Démarre le frontend
```

### Déploiement vers VPS
```bash
./deploy.sh all      # Déploie client + serveur
./deploy.sh client   # Déploie uniquement le frontend
./deploy.sh server   # Déploie uniquement le backend
./deploy.sh status   # Vérifie le statut PM2
./deploy.sh logs     # Affiche les logs en temps réel
```

### Prérequis local
- MongoDB local sur `mongodb://localhost:27017/arbre-genealogique`
- Ou modifier `server/.env` pour utiliser MongoDB Atlas

---

## En cours
(rien pour le moment)

---

## Complété récemment

### 05/04/2026 - Responsive Mobile
- [x] **Design mobile complet** — Application responsive sur tous les écrans
  - Header: navigation sur 2 lignes, icônes seuls sur petits écrans
  - Tabs: scrollable horizontalement, icônes sans texte sur mobile
  - Arbre généalogique: cartes réduites, toolbar adapté
  - Formulaires: colonnes empilées, boutons pleine largeur
  - Cards/Listes: padding et marges adaptés
  - Breakpoints: 1040px (tablette), 768px (mobile), 480px (petit mobile)

### 04/04/2026 - UI/UX & Fonctionnalités
- [x] **Tri alphabétique** — Listes de personnes triées par nom+prénom
  - App.tsx (personnesFiltrees)
  - RelationForm.tsx (personnesTriees)
  - RelationshipFinder.tsx (personnesTriees)
- [x] **Chercheur de parenté** — Nouvel onglet "Parenté"
  - Algorithme BFS pour trouver le chemin entre 2 personnes
  - Affichage visuel du chemin avec tags colorés
  - Calcul automatique de la relation (père, cousin germain, etc.)
- [x] **Parents externes** — Champs pour parents hors famille
  - `pereExterne` et `mereExterne` dans le modèle Personne
  - Affichage dans FamilyTree avec tooltip
  - Édition dans PersonneFormEtendu et modal
- [x] **Modernisation RelationForm** — Ant Design + palette indigo
- [x] **Connecteurs d'arbre** — Lignes doubles avec points décoratifs
- [x] **Rôle admin** — Support du rôle 'admin' pour l'onglet Invitations
- [x] **Favicon PNG** — Conversion SVG vers PNG avec ImageMagick (fix WAF OVHcloud 403)
  - favicon.ico, favicon-32.png, favicon-16.png générés
  - manifest.json mis à jour pour référencer PNG
- [x] **Espacement listes** — Marges et padding sur items de liste
- [x] **Fix Mixed Content authService** — URLs relatives en production

### Avril 2026 - Configuration initiale
- [x] Configuration environnement dev local
  - [x] `.env` serveur configuré (port 5000)
  - [x] `.env.development` client configuré
  - [x] Script `deploy.sh` créé
  - [x] Script `dev.sh` créé
- [x] Remplacement Cloudinary par stockage local (sharp + uuid)
- [x] Fix Mixed Content (URLs relatives en prod)
- [x] Fix validation dateDeces null
- [x] Fix édition/suppression photo
- [x] Fix aperçu photo dans modal

---

## Backlog
- [ ] Tests automatisés
- [ ] CI/CD pipeline
- [ ] Sauvegarde automatique MongoDB
