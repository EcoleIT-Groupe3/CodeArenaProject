# CodeArena - Documentation Base de Données

## Vue d'ensemble

Cette base de données PostgreSQL (via Supabase) gère toute la logique backend de la plateforme CodeArena, une plateforme de compétition de code en temps réel.

## Structure de la Base de Données

### Tables Principales

#### 1. `users` - Utilisateurs
Stocke les profils utilisateurs et leurs statistiques.

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  score integer DEFAULT 0,
  rank integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

**Colonnes:**
- `id`: Identifiant unique (UUID)
- `username`: Nom d'utilisateur unique
- `email`: Adresse email unique
- `password_hash`: Mot de passe haché (géré par Supabase Auth)
- `score`: Score total cumulé
- `rank`: Classement global
- `created_at`: Date de création du compte

#### 2. `problems` - Problèmes
Contient les défis de programmation.

```sql
CREATE TABLE problems (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  difficulty text DEFAULT 'Medium',
  test_cases jsonb NOT NULL,
  time_limit integer DEFAULT 5000,
  memory_limit integer DEFAULT 256,
  created_at timestamptz DEFAULT now()
);
```

**Colonnes:**
- `id`: Identifiant unique
- `title`: Titre du problème
- `description`: Description détaillée
- `difficulty`: Niveau ('Easy', 'Medium', 'Hard')
- `test_cases`: Cas de test en JSON `[{input, output}]`
- `time_limit`: Limite de temps en ms
- `memory_limit`: Limite de mémoire en MB
- `created_at`: Date de création

**Exemple de test_cases:**
```json
[
  {"input": "[2,7,11,15], 9", "output": "[0,1]"},
  {"input": "[3,2,4], 6", "output": "[1,2]"}
]
```

#### 3. `contests` - Concours
Gère les événements de compétition.

```sql
CREATE TABLE contests (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  problem_ids jsonb DEFAULT '[]',
  status text DEFAULT 'upcoming',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
```

**Colonnes:**
- `id`: Identifiant unique
- `title`: Titre du concours
- `description`: Description
- `start_time`: Date/heure de début
- `end_time`: Date/heure de fin
- `problem_ids`: Liste des IDs de problèmes (JSON)
- `status`: 'upcoming', 'active', 'completed'
- `created_by`: Créateur du concours
- `created_at`: Date de création

#### 4. `contest_participants` - Participants
Suit la participation aux concours.

```sql
CREATE TABLE contest_participants (
  id uuid PRIMARY KEY,
  contest_id uuid REFERENCES contests(id),
  user_id uuid REFERENCES auth.users(id),
  score integer DEFAULT 0,
  rank integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(contest_id, user_id)
);
```

#### 5. `submissions` - Soumissions
Enregistre toutes les soumissions de code.

```sql
CREATE TABLE submissions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  problem_id uuid REFERENCES problems(id),
  contest_id uuid REFERENCES contests(id),
  code text NOT NULL,
  language text NOT NULL,
  status text DEFAULT 'pending',
  result jsonb DEFAULT '{}',
  score integer DEFAULT 0,
  execution_time integer DEFAULT 0,
  memory_used integer DEFAULT 0,
  submitted_at timestamptz DEFAULT now()
);
```

**Status possibles:**
- `pending`: En attente
- `running`: En cours d'exécution
- `accepted`: Accepté (tous les tests passés)
- `wrong_answer`: Mauvaise réponse
- `error`: Erreur de compilation/exécution
- `timeout`: Dépassement du temps limite

## Sécurité - Row Level Security (RLS)

Toutes les tables ont RLS activé avec des politiques strictes.

### Politiques RLS

#### Users
```sql
-- Lecture: tous les utilisateurs authentifiés
CREATE POLICY "Users can read all user profiles"
  ON users FOR SELECT TO authenticated
  USING (true);

-- Modification: seulement son propre profil
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE TO authenticated
  USING (auth.uid() = id);
```

#### Problems
```sql
-- Lecture publique pour utilisateurs authentifiés
CREATE POLICY "Anyone can read problems"
  ON problems FOR SELECT TO authenticated
  USING (true);
```

#### Submissions
```sql
-- Lecture de toutes les soumissions (pour classements)
CREATE POLICY "Users can read all submissions"
  ON submissions FOR SELECT TO authenticated
  USING (true);

-- Création uniquement de ses propres soumissions
CREATE POLICY "Users can create submissions"
  ON submissions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

## Index pour Performance

```sql
-- Index pour les requêtes fréquentes
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX idx_users_score ON users(score DESC);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_contests_status ON contests(status);
```

## Installation

### 1. Avec Supabase CLI

```bash
# Se connecter à Supabase
supabase login

# Appliquer la migration
supabase db push

# Ou exécuter directement
supabase db execute -f database/migrations/001_create_schema.sql
```

### 2. Via l'interface Supabase

1. Ouvrez le SQL Editor dans votre projet Supabase
2. Copiez le contenu de `database/migrations/001_create_schema.sql`
3. Exécutez le script
4. Exécutez les seeds pour les données de test

### 3. Avec psql

```bash
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  -f database/migrations/001_create_schema.sql
```

## Données de Test

Pour insérer des données de test:

```bash
# Problèmes exemple
psql ... -f database/seeds/001_sample_problems.sql

# Concours exemple
psql ... -f database/seeds/002_sample_contests.sql
```

## Requêtes Utiles

### Classement Global
```sql
SELECT
  username,
  score,
  rank,
  created_at
FROM users
ORDER BY score DESC
LIMIT 10;
```

### Problèmes par Difficulté
```sql
SELECT
  difficulty,
  COUNT(*) as problem_count
FROM problems
GROUP BY difficulty;
```

### Soumissions Récentes
```sql
SELECT
  u.username,
  p.title,
  s.status,
  s.score,
  s.submitted_at
FROM submissions s
JOIN users u ON s.user_id = u.id
JOIN problems p ON s.problem_id = p.id
ORDER BY s.submitted_at DESC
LIMIT 20;
```

### Statistiques de Concours
```sql
SELECT
  c.title,
  COUNT(cp.id) as participants,
  c.status,
  c.start_time
FROM contests c
LEFT JOIN contest_participants cp ON c.id = cp.contest_id
GROUP BY c.id, c.title, c.status, c.start_time
ORDER BY c.start_time DESC;
```

## Maintenance

### Nettoyage des Anciennes Soumissions
```sql
-- Supprimer les soumissions de plus de 6 mois
DELETE FROM submissions
WHERE submitted_at < NOW() - INTERVAL '6 months';
```

### Recalculer les Rangs
```sql
-- Mettre à jour les rangs basés sur les scores
WITH ranked_users AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY score DESC) as new_rank
  FROM users
)
UPDATE users
SET rank = ranked_users.new_rank
FROM ranked_users
WHERE users.id = ranked_users.id;
```

## Backup

```bash
# Backup complet
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  -f backup_$(date +%Y%m%d).sql

# Backup spécifique
pg_dump ... -t users -t problems -t submissions > backup_partial.sql
```

## Diagramme ERD

```
users (1) ----< (*) submissions
  |                      |
  |                      v
  |                   problems (1)
  |
  v
contest_participants (*) >---- (1) contests
```

## Variables d'Environnement

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon
```

## Support

Pour toute question, consultez:
- [Documentation Supabase](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
