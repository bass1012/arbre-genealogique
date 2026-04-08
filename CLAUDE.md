## DÉMARRAGE DE SESSION
1. Lire tasks/lessons.md — appliquer toutes les leçons avant de toucher quoi que ce soit
2. Lire tasks/todo.md — comprendre l'état actuel
3. Si aucun des deux n'existe, les créer avant de commencer

## WORKFLOW

### 1. Planifier d'abord
- Passer en mode plan pour toute tâche non triviale (3+ étapes)
- Écrire le plan dans tasks/todo.md avant d'implémenter
- Si quelque chose ne va pas, STOP et re-planifier — ne jamais forcer

### 2. Stratégie sous-agents
- Utiliser des sous-agents pour garder le contexte principal propre
- Une tâche par sous-agent
- Investir plus de compute sur les problèmes difficiles

### 3. Boucle d'auto-amélioration
- Après toute correction : mettre à jour tasks/lessons.md
- Format : [date] | ce qui a mal tourné | règle pour l'éviter
- Relire les leçons à chaque démarrage de session

### 4. Standard de vérification
- Ne jamais marquer comme terminé sans preuve que ça fonctionne
- Lancer les tests, vérifier les logs, comparer le comportement
- Se demander : « Est-ce qu'un staff engineer validerait ça ? »

### 5. Exiger l'élégance
- Pour les changements non triviaux : existe-t-il une solution plus élégante ?
- Si un fix semble bricolé : le reconstruire proprement
- Ne pas sur-ingénieriser les choses simples

### 6. Correction de bugs autonome
- Quand on reçoit un bug : le corriger directement
- Aller dans les logs, trouver la cause racine, résoudre
- Pas besoin d'être guidé étape par étape

## PRINCIPES FONDAMENTAUX
- Simplicité d'abord — toucher un minimum de code
- Pas de paresse — causes racines uniquement, pas de fixes temporaires
- Ne jamais supposer — vérifier chemins, APIs, variables avant utilisation
- Demander une seule fois — une question en amont si nécessaire, ne jamais interrompre en cours de tâche

## GESTION DES TÂCHES
1. Planifier → tasks/todo.md
2. Vérifier → confirmer avant d'implémenter
3. Suivre → marquer comme terminé au fur et à mesure
4. Expliquer → résumé de haut niveau à chaque étape
5. Apprendre → tasks/lessons.md après corrections

## APPRENTISSAGES
(Claude remplit cette section au fil du temps)

## CONVENTIONS UI/UX

### Palette de couleurs
- **Primaire** : Indigo (#6366f1) — utilisé partout (headers, boutons, bordures)
- **Secondaire** : Teal (#14b8a6) — accents
- **Gradients** : De #eef2ff vers #c7d2fe pour les backgrounds
- **Hommes** : Bleu (#3b82f6)
- **Femmes** : Rose (#ec4899)

### Tri alphabétique
- Toutes les listes de personnes sont triées par **nom puis prénom**
- Utiliser `localeCompare` avec options françaises : `localeCompare(b.nom, 'fr', { sensitivity: 'base' })`
- Implémenté dans : App.tsx (personnesFiltrees), RelationForm.tsx, RelationshipFinder.tsx

### Composants existants
- **RelationForm** : Formulaire Ant Design pour créer des relations (parent/enfant/conjoint)
- **RelationshipFinder** : Algorithme BFS pour trouver le chemin de parenté entre deux personnes
- **PersonneFormEtendu** : Formulaire complet avec parents externes (pereExterne, mereExterne)
- **FamilyTree** : Affichage arborescent avec connecteurs doubles et points décoratifs

### Navigation
6 onglets dans la barre de navigation (Segmented) :
1. Liste — vue liste des personnes
2. Arbre — vue arbre généalogique
3. Parenté — chercheur de relations
4. Ajouter personne
5. Ajouter relation
6. Profil