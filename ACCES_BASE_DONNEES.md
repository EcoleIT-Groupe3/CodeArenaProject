# Accès Complet à la Base de Données CodeArena

Ce document fournit toutes les informations nécessaires pour accéder et reproduire la base de données.

## 📋 Informations de Connexion

### Supabase Project
- **URL du Projet**: `https://0ec90b57d6e95fcbda19832f.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw`

### Variables d'Environnement

Créez un fichier `.env` avec:

```env
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw
```

## 🗄️ Structure de la Base de Données

La base contient 5 tables principales:

### 1. users
- Profils utilisateurs
- Scores et classements
- **3 colonnes**: id, username, email, password_hash, score, rank, created_at

### 2. problems
- Problèmes de programmation
- 3 problèmes exemple déjà insérés:
  - Two Sum (Easy)
  - Reverse String (Easy)
  - Fibonacci Number (Medium)
- **Colonnes**: id, title, description, difficulty, test_cases, time_limit, memory_limit, created_at

### 3. contests
- Concours de programmation
- **Colonnes**: id, title, description, start_time, end_time, problem_ids, status, created_by, created_at

### 4. contest_participants
- Participation aux concours
- **Colonnes**: id, contest_id, user_id, score, rank, joined_at

### 5. submissions
- Soumissions de code
- **Colonnes**: id, user_id, problem_id, contest_id, code, language, status, result, score, execution_time, memory_used, submitted_at

## 📁 Fichiers SQL Disponibles

Tous les scripts SQL sont disponibles dans le dossier `database/`:

```
database/
├── migrations/
│   └── 001_create_schema.sql      # Schéma complet avec RLS
├── seeds/
│   ├── 001_sample_problems.sql    # 3 problèmes exemple
│   └── 002_sample_contests.sql    # Concours exemple
├── queries/
│   └── useful_queries.sql         # 50+ requêtes utiles
├── README.md                       # Documentation détaillée
└── SCHEMA.md                       # Diagramme ERD et détails
```

## 🚀 Reproduction de la Base de Données

### Option 1: Via l'Interface Supabase

1. Connectez-vous à Supabase avec votre projet
2. Ouvrez **SQL Editor**
3. Exécutez dans l'ordre:
   ```sql
   -- Étape 1: Créer la structure
   -- Coller le contenu de: database/migrations/001_create_schema.sql

   -- Étape 2: Insérer les données de test
   -- Coller le contenu de: database/seeds/001_sample_problems.sql
   -- Coller le contenu de: database/seeds/002_sample_contests.sql
   ```

### Option 2: Via Supabase CLI

```bash
# Installer la CLI
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref 0ec90b57d6e95fcbda19832f

# Exécuter les migrations
supabase db execute -f database/migrations/001_create_schema.sql
supabase db execute -f database/seeds/001_sample_problems.sql
supabase db execute -f database/seeds/002_sample_contests.sql
```

### Option 3: Via psql (Ligne de commande PostgreSQL)

```bash
# Remplacer [PASSWORD] et [HOST] par vos valeurs
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  -f database/migrations/001_create_schema.sql
```

## 🔍 Vérification de l'Installation

Après l'installation, exécutez ces requêtes pour vérifier:

```sql
-- Vérifier que toutes les tables existent
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- Résultat attendu: users, problems, contests, contest_participants, submissions

-- Vérifier les problèmes insérés
SELECT id, title, difficulty FROM problems;
-- Résultat attendu: 3 problèmes

-- Vérifier les politiques RLS
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
-- Résultat attendu: 10 politiques
```

## 📊 Requêtes Utiles

### Voir tous les problèmes
```sql
SELECT title, difficulty,
       jsonb_array_length(test_cases) as test_count
FROM problems
ORDER BY difficulty;
```

### Créer un utilisateur test (via l'app)
Utilisez l'interface de l'application pour créer un compte, ou:

```sql
-- Note: Normalement fait via Supabase Auth
INSERT INTO users (username, email, password_hash)
VALUES ('testuser', 'test@example.com', 'hash_here');
```

### Voir le leaderboard
```sql
SELECT rank, username, score
FROM users
ORDER BY score DESC
LIMIT 10;
```

## 🔒 Sécurité (RLS)

Toutes les tables ont Row Level Security (RLS) activé:

- **users**: Lecture publique, modification limitée à son profil
- **problems**: Lecture publique
- **contests**: Lecture publique, création authentifiée
- **submissions**: Création limitée à ses propres soumissions
- **contest_participants**: Inscription limitée à soi-même

### Désactiver temporairement RLS (développement uniquement)

```sql
-- ⚠️ ATTENTION: Ne faites cela qu'en développement local
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- Pour réactiver:
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

## 📈 Statistiques de la Base

```sql
-- Nombre de tables
SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';
-- Résultat: 5 tables

-- Nombre de politiques RLS
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
-- Résultat: 10 politiques

-- Nombre d'index
SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';
-- Résultat: 8+ index
```

## 🔧 Connexion depuis l'Application

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://0ec90b57d6e95fcbda19832f.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw'
);

// Exemple: Lire les problèmes
const { data, error } = await supabase
  .from('problems')
  .select('*')
  .order('created_at', { ascending: false });
```

### Python

```python
from supabase import create_client, Client

url = "https://0ec90b57d6e95fcbda19832f.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw"
supabase: Client = create_client(url, key)

# Exemple: Lire les problèmes
response = supabase.table('problems').select("*").execute()
```

## 📝 Export/Backup

### Export complet en SQL

```bash
# Via Supabase Dashboard
# Settings → Database → Database Backups

# Via pg_dump
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  --schema=public > backup_codearena.sql
```

### Export des données en JSON

```sql
-- Export problems en JSON
COPY (SELECT row_to_json(t) FROM (
  SELECT * FROM problems
) t) TO '/tmp/problems.json';
```

## 🆘 Troubleshooting

### Erreur: "new row violates row-level security policy"
**Solution**: Assurez-vous d'être authentifié ou vérifiez les politiques RLS

### Erreur: "relation does not exist"
**Solution**: Exécutez d'abord le script de migration 001_create_schema.sql

### Erreur de connexion
**Solution**: Vérifiez que votre URL et clé Supabase sont correctes

## 📚 Documentation Supplémentaire

- `database/README.md` - Documentation complète de la base
- `database/SCHEMA.md` - Schéma détaillé avec ERD
- `database/queries/useful_queries.sql` - Plus de 50 requêtes prêtes à l'emploi
- `INSTALLATION.md` - Guide d'installation complet de l'application

## 🎯 Prochaines Étapes

1. Exécutez les scripts de migration
2. Insérez les données de test
3. Vérifiez l'installation avec les requêtes de test
4. Configurez votre application avec les variables d'environnement
5. Lancez l'application!

---

**Note**: Cette base de données est configurée pour le développement. Pour la production, ajoutez:
- Backups automatiques
- Monitoring
- Rate limiting
- Validation plus stricte
- Chiffrement additionnel
