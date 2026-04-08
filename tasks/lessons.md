# Leçons Apprises

## Format: [date] | problème | règle pour l'éviter

### Déploiement & Configuration
- [01/04/2026] | URLs absolues (http://localhost:5000) causent erreur Mixed Content en prod | Toujours utiliser des URLs relatives en production
- [01/04/2026] | Processus node zombie servait l'ancien code | Vérifier `ps aux | grep node` avant de debugger, tuer les processus orphelins
- [01/04/2026] | Variables nginx échappées avec `\$` au lieu de `$` | Ne pas utiliser echo avec des variables nginx, utiliser base64 ou heredoc

### Validation Backend
- [01/04/2026] | express-validator rejetait `null` pour dateDeces | Utiliser `.optional()` pour les champs nullable

### Photos/Upload
- [02/04/2026] | Photo non visible lors de l'édition | Passer `fileList` avec l'URL existante au composant Upload
- [02/04/2026] | Suppression de photo envoyait `undefined` au lieu de `null` | Envoyer explicitement `null` pour supprimer côté backend
- [02/04/2026] | Aperçu photo ouvrait nouvel onglet | Utiliser `onPreview` avec un Modal au lieu du comportement par défaut

### API Service
- [02/04/2026] | API_URL hardcodé causait Mixed Content | Utiliser `process.env.NODE_ENV === 'production' ? '' : localhost`

### UI/UX
- [04/04/2026] | Formulaires incohérents avec HTML natif vs Ant Design | Toujours utiliser Ant Design (Form, Select, DatePicker) pour la cohérence
- [04/04/2026] | Couleurs jaune/amber incohérentes avec le reste de l'app | Utiliser la palette indigo (#6366f1) partout
- [04/04/2026] | Recherche de personnes difficile dans longues listes | Trier par ordre alphabétique (nom puis prénom) avec `localeCompare('fr')`
- [04/04/2026] | Parents non enregistrés dans la famille non visibles | Ajouter champs `pereExterne` et `mereExterne` pour les parents hors base
- [04/04/2026] | Items de liste collés aux bords | Utiliser `!important` sur margin et padding pour surcharger Ant Design
- [04/04/2026] | SVG bloqué par OVHcloud WAF (403) | Convertir les favicon SVG en PNG
- [05/04/2026] | Favicon ne s'affiche pas malgré PNG | Vérifier aussi manifest.json + utiliser ImageMagick (density 300) pour meilleure qualité
- [05/04/2026] | Cache navigateur persistant pour favicon | Vider cache + cookies, ou tester en navigation privée

### Rôles utilisateur
- [04/04/2026] | Rôle 'admin' non reconnu, onglets manquants | Vérifier tous les checks de rôle incluent 'admin' en plus de 'superadmin'
- [04/04/2026] | Rôles supportés: superadmin, admin, gestionnaire, membre, lecteur | Toujours inclure tous les rôles pertinents dans les conditions

### Architecture frontend
- [04/04/2026] | Logique de tri dupliquée dans plusieurs composants | Utiliser `useMemo` pour créer `personnesTriees` réutilisable
- [04/04/2026] | Algorithme de parenté complexe à maintenir | BFS (Breadth-First Search) est le bon choix pour les chemins de parenté 

### Responsive Mobile
- [05/04/2026] | Navigation Ant Design Segmented trop large sur mobile | Utiliser `overflow-x: auto` et masquer le texte des labels (garder icônes)
- [05/04/2026] | Header trop encombré sur mobile | Utiliser `flex-wrap: wrap` et `order` pour réorganiser les éléments
- [05/04/2026] | Arbre généalogique non lisible sur mobile | Réduire taille des cartes (120-140px) et cacher la minimap
- [05/04/2026] | Breakpoints recommandés | 1040px (tablette), 768px (mobile), 480px (petit mobile)
