# CodeArena - Plateforme de Programmation Compétitive

Application fullstack de coding challenges avec React, Node.js, Express et PostgreSQL.

## 🏗️ Architecture

```
CodeArenaProject/
├── backend/              # API Node.js/Express
│   ├── src/
│   │   ├── config/      # Configuration (DB, Auth)
│   │   ├── controllers/ # Contrôleurs API
│   │   ├── middleware/  # Middlewares (Auth, Errors)
│   │   ├── models/      # Modèles de données
│   │   ├── routes/      # Routes API
│   │   ├── services/    # Logique métier
│   │   └── server.js    # Point d'entrée
│   ├── database/
│   │   ├── migrations/  # Migrations SQL
│   │   └── seeds/       # Données de test
│   ├── Dockerfile
│   └── package.json
│
├── frontend/            # Application React
│   ├── src/
│   │   ├── components/  # Composants réutilisables
│   │   ├── pages/       # Pages de l'application
│   │   ├── services/    # Services API
│   │   └── App.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
└── docker-compose.yml   # Orchestration Docker
```

## 🚀 Démarrage rapide

### Prérequis
- Docker
- Docker Compose

### Installation et lancement

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd CodeArenaProject
```

2. **Lancer l'application avec Docker**
```bash
docker-compose up --build
```

Cette commande va :
- Créer la base de données PostgreSQL
- Lancer le backend sur le port 5000
- Lancer le frontend sur le port 3000
- Exécuter les migrations et seeds automatiquement

3. **Accéder à l'application**
- Frontend : http://localhost:3000
- Backend API : http://localhost:5000/api
- PostgreSQL : localhost:5432

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur (auth requis)

### Problems
- `GET /api/problems` - Liste des problèmes
- `GET /api/problems/:id` - Détails d'un problème
- `GET /api/problems/slug/:slug` - Problème par slug

### Contests
- `GET /api/contests` - Liste des concours
- `GET /api/contests/:id` - Détails d'un concours
- `POST /api/contests/:id/join` - Rejoindre un concours

### Submissions
- `POST /api/submissions` - Soumettre une solution
- `GET /api/submissions/my-submissions` - Mes soumissions

### Leaderboard
- `GET /api/leaderboard` - Classement global

## 🛠️ Développement local

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Base de données
```bash
cd backend
npm run migrate  # Exécuter les migrations
npm run seed     # Insérer les données de test
```

## 🔐 Variables d'environnement

### Backend (.env)
```
PORT=5000
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=codearena
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 🐳 Commandes Docker utiles

```bash
# Lancer les services
docker-compose up

# Lancer en arrière-plan
docker-compose up -d

# Arrêter les services
docker-compose down

# Rebuild complet
docker-compose up --build

# Voir les logs
docker-compose logs -f

# Accéder au container backend
docker exec -it codearena-backend sh

# Accéder à PostgreSQL
docker exec -it codearena-postgres psql -U postgres -d codearena
```

## 📦 Technologies utilisées

### Backend
- Node.js + Express
- PostgreSQL
- JWT (Authentication)
- bcryptjs (Hash passwords)

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- Lucide Icons

### DevOps
- Docker
- Docker Compose
- Nginx

## 👨‍💻 Développement

### Structure des routes backend
Toutes les routes sont préfixées par `/api`

### Authentification
Les routes protégées nécessitent un token JWT dans le header :
```
Authorization: Bearer <token>
```

## 📝 License

MIT
