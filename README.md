# TaskFlow - Gestion de tâches collaboratives

Une application web full-stack pour gérer des tâches en équipe avec fonctionnalités de drag & drop (style Trello simplifié).

## 🚀 Fonctionnalités

### ✅ Implémentées
- **Authentification** : Inscription/Connexion avec JWT
- **Gestion des tableaux (Boards)** : CRUD complet
- **Gestion des tâches (Tasks)** : CRUD avec statuts (À faire, En cours, Terminé)
- **Drag & Drop** : Déplacement des tâches entre colonnes
- **Partage de tableaux** : Invitation d'utilisateurs à collaborer
- **Gestion des utilisateurs** : Attribution des tâches, affichage des membres

### 🎯 Objectifs du projet (à implémenter)
- [ ] **Authentification** : Système de connexion/sécurité avec JWT
- [ ] **CRUD des tableaux** : Création, lecture, mise à jour, suppression
- [ ] **CRUD des tâches** : Ajout, édition, suppression, déplacement
- [ ] **Drag & Drop** : Déplacement fluide des tâches entre colonnes
- [ ] **Partage** : Invitation d'autres utilisateurs sur un tableau
- [x] **Squelette du projet** : Structure complète backend + frontend

### 💡 Bonus (Optionnel)
- [ ] Notifications en temps réel (WebSocket)
- [ ] Historique des modifications
- [ ] Filtres par tag/date/primorité
- [ ] Recherche de tâches
- [ ] Export des données (PDF, CSV)

## 🛠 Technos Utilisées

### Backend
- **Node.js** + **Express** - Serveur API
- **MongoDB** + **Mongoose** - Base de données NoSQL
- **JWT** (jsonwebtoken) - Authentification
- **bcrypt** - Hashage des mots de passe
- **TypeScript** - Typage statique

### Frontend
- **React** 18 + **TypeScript** - Framework UI
- **Material-UI** (@mui/material) - Composants UI
- **@dnd-kit** - Drag & Drop
- **React Router** 6 - Navigation
- **Axios** - Requêtes HTTP

## 📁 Structure du Projet

```
taskflow/
├── backend/                      # API Node.js + Express
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts            # Connexion MongoDB
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── boardController.ts
│   │   │   └── taskController.ts
│   │   ├── middlewares/
│   │   │   ├── auth.ts          # Middleware JWT
│   │   │   └── errorHandler.ts  # Gestion des erreurs
│   │   ├── models/
│   │   │   ├── Board.ts
│   │   │   ├── Task.ts
│   │   │   └── User.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── board.ts
│   │   │   └── task.ts
│   │   ├── app.ts               # Configuration Express
│   │   └── server.ts            # Lancement du serveur
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                     # React + TypeScript
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Column.tsx       # Colonne Kanban
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── TaskCard.tsx     # Carte de tâche
│   │   │   └── TaskForm.tsx     # Formulaire tâche
│   │   ├── hooks/
│   │   │   ├── useAuth.ts       # Gestion authentification
│   │   │   └── useBoard.ts      # Gestion tableaux/tâches
│   │   ├── pages/
│   │   │   ├── BoardPage.tsx    # Page tableau
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── services/
│   │   │   └── api.ts           # Appels API
│   │   ├── types/
│   │   │   └── index.ts         # Interfaces TypeScript
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
├── README.md
└── .env.example                 # Variables d'environnement
```

## 🏃‍♂️ Démarrage rapide

### Prérequis
- Node.js 18+ 
- npm ou yarn
- MongoDB (local ou cloud)

### Installation

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Modifier .env avec vos informations (MONGODB_URI, JWT_SECRET, etc.)
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Modifier .env avec l'URL de votre API
npm start
```

### Accès
- Backend : `http://localhost:5000/api`
- Frontend : `http://localhost:3000`

## 🎯 Étapes pour compléter le projet

### 1. Configurer la base de données
- [ ] Installer MongoDB localement ou créer un compte MongoDB Atlas
- [ ] Mettre à jour `MONGODB_URI` dans `.env`

### 2. Tester l'API
- Utiliser Postman ou Thunder Client pour tester les endpoints :
  - `POST /api/auth/register` - Créer un utilisateur
  - `POST /api/auth/login` - Se connecter
  - `GET /api/boards` - Lister les tableaux (nécessite auth)
  - `POST /api/boards` - Créer un tableau

### 3. Implémenter les fonctionnalités manquantes
- [ ] **Drag & Drop** : Actuellement le DndContext est configuré, il faut finaliser l'intégration
- [ ] **Partage de tableaux** : Implémenter l'interface utilisateur pour inviter des membres
- [ ] **Notifications** : Ajouter WebSocket pour les mises à jour en temps réel

### 4. Déploiement
- **Backend** : Heroku, Render, ou Railway
- **Frontend** : Vercel, Netlify, ou GitHub Pages
- **Base de données** : MongoDB Atlas

## 📝 API Documentation

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter |
| POST | `/api/auth/logout` | Se déconnecter |
| GET | `/api/auth/me` | Obtenir l'utilisateur courant |

### Tableaux (Boards)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/boards` | Lister tous les tableaux |
| GET | `/api/boards/:id` | Obtenir un tableau |
| POST | `/api/boards` | Créer un tableau |
| PUT | `/api/boards/:id` | Mettre à jour |
| DELETE | `/api/boards/:id` | Supprimer |
| POST | `/api/boards/:id/members` | Ajouter un membre |
| DELETE | `/api/boards/:id/members/:memberId` | Retirer un membre |

### Tâches (Tasks)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/tasks/board/:boardId` | Lister les tâches d'un tableau |
| GET | `/api/tasks/:id` | Obtenir une tâche |
| POST | `/api/tasks/board/:boardId` | Créer une tâche |
| PUT | `/api/tasks/:id` | Mettre à jour |
| PATCH | `/api/tasks/:id/status` | Mettre à jour le statut |
| DELETE | `/api/tasks/:id` | Supprimer |

## 🤝 Contribution

Ce projet est conçu pour être un projet personnel de démonstration. Feel free to fork et à l'améliorer !

## 📄 Licence

MIT - Libre pour usage personnel et professionnel.
