# Schéma de la Base de Données CodeArena

## Diagramme Entité-Relation (ERD)

```
┌─────────────────────┐
│      auth.users     │ (Supabase Auth)
│  ─────────────────  │
│  id (PK)            │
│  email              │
│  encrypted_password │
└──────────┬──────────┘
           │
           │ (1:1)
           │
┌──────────▼──────────┐         ┌─────────────────────┐
│       users         │         │      problems       │
│  ─────────────────  │         │  ─────────────────  │
│  id (PK, FK)        │         │  id (PK)            │
│  username           │         │  title              │
│  email              │         │  description        │
│  password_hash      │         │  difficulty         │
│  score              │         │  test_cases (JSON)  │
│  rank               │         │  time_limit         │
│  created_at         │         │  memory_limit       │
└──────────┬──────────┘         │  created_at         │
           │                    └──────────┬──────────┘
           │                               │
           │ (1:N)                         │ (1:N)
           │                               │
           │         ┌─────────────────────▼────────┐
           │         │      submissions             │
           │         │  ──────────────────────────  │
           │         │  id (PK)                     │
           └─────────┤  user_id (FK)                │
                     │  problem_id (FK)             │
           ┌─────────┤  contest_id (FK, nullable)   │
           │         │  code                        │
           │         │  language                    │
           │         │  status                      │
           │         │  result (JSON)               │
           │         │  score                       │
           │         │  execution_time              │
           │         │  memory_used                 │
           │         │  submitted_at                │
           │         └──────────────────────────────┘
           │                               ▲
           │                               │
           │         ┌─────────────────────┘
           │         │ (N:1)
           │         │
┌──────────▼─────────┴─┐         ┌─────────────────────┐
│ contest_participants │         │      contests       │
│  ──────────────────  │ (N:1)   │  ─────────────────  │
│  id (PK)             ├─────────┤  id (PK)            │
│  contest_id (FK)     │         │  title              │
│  user_id (FK)        │         │  description        │
│  score               │         │  start_time         │
│  rank                │         │  end_time           │
│  joined_at           │         │  problem_ids (JSON) │
└──────────────────────┘         │  status             │
                                 │  created_by (FK)    │
                                 │  created_at         │
                                 └─────────────────────┘
```

## Tables Détaillées

### 1. users

Stocke les profils utilisateurs et leurs statistiques globales.

| Colonne        | Type         | Contraintes           | Description                    |
|----------------|--------------|-----------------------|--------------------------------|
| id             | uuid         | PRIMARY KEY           | ID unique utilisateur          |
| username       | text         | UNIQUE, NOT NULL      | Nom d'utilisateur              |
| email          | text         | UNIQUE, NOT NULL      | Email                          |
| password_hash  | text         | NOT NULL              | Mot de passe haché             |
| score          | integer      | DEFAULT 0             | Score total                    |
| rank           | integer      | DEFAULT 0             | Classement global              |
| created_at     | timestamptz  | DEFAULT now()         | Date de création               |

**Index:**
- `idx_users_score` sur `score DESC`

**RLS Policies:**
- SELECT: tous les utilisateurs authentifiés
- UPDATE: uniquement son propre profil

---

### 2. problems

Contient les défis de programmation.

| Colonne        | Type         | Contraintes           | Description                    |
|----------------|--------------|-----------------------|--------------------------------|
| id             | uuid         | PRIMARY KEY           | ID unique problème             |
| title          | text         | NOT NULL              | Titre du problème              |
| description    | text         | NOT NULL              | Description détaillée          |
| difficulty     | text         | DEFAULT 'Medium'      | Easy, Medium, Hard             |
| test_cases     | jsonb        | NOT NULL              | Cas de test JSON               |
| time_limit     | integer      | DEFAULT 5000          | Limite temps (ms)              |
| memory_limit   | integer      | DEFAULT 256           | Limite mémoire (MB)            |
| created_at     | timestamptz  | DEFAULT now()         | Date de création               |

**Format test_cases:**
```json
[
  {"input": "données entrée", "output": "résultat attendu"},
  {"input": "...", "output": "..."}
]
```

**Index:**
- `idx_problems_difficulty` sur `difficulty`

**RLS Policies:**
- SELECT: tous les utilisateurs authentifiés

---

### 3. contests

Gère les événements de compétition.

| Colonne        | Type         | Contraintes           | Description                    |
|----------------|--------------|-----------------------|--------------------------------|
| id             | uuid         | PRIMARY KEY           | ID unique concours             |
| title          | text         | NOT NULL              | Titre du concours              |
| description    | text         | DEFAULT ''            | Description                    |
| start_time     | timestamptz  | NOT NULL              | Date/heure début               |
| end_time       | timestamptz  | NOT NULL              | Date/heure fin                 |
| problem_ids    | jsonb        | DEFAULT '[]'          | Liste IDs problèmes            |
| status         | text         | DEFAULT 'upcoming'    | upcoming/active/completed      |
| created_by     | uuid         | FK auth.users         | Créateur du concours           |
| created_at     | timestamptz  | DEFAULT now()         | Date de création               |

**Index:**
- `idx_contests_status` sur `status`
- `idx_contests_start_time` sur `start_time`

**RLS Policies:**
- SELECT: tous les utilisateurs authentifiés
- INSERT: uniquement si created_by = auth.uid()

---

### 4. contest_participants

Suit la participation aux concours.

| Colonne        | Type         | Contraintes                    | Description                    |
|----------------|--------------|--------------------------------|--------------------------------|
| id             | uuid         | PRIMARY KEY                    | ID unique participation        |
| contest_id     | uuid         | FK contests, CASCADE           | Référence concours             |
| user_id        | uuid         | FK auth.users, CASCADE         | Référence utilisateur          |
| score          | integer      | DEFAULT 0                      | Score dans ce concours         |
| rank           | integer      | DEFAULT 0                      | Rang dans ce concours          |
| joined_at      | timestamptz  | DEFAULT now()                  | Date d'inscription             |

**Contraintes:**
- UNIQUE(contest_id, user_id) - Un utilisateur par concours

**Index:**
- `idx_contest_participants_contest_id` sur `contest_id`
- `idx_contest_participants_user_id` sur `user_id`

**RLS Policies:**
- SELECT: tous les utilisateurs authentifiés
- INSERT: uniquement si user_id = auth.uid()
- UPDATE: uniquement si user_id = auth.uid()

---

### 5. submissions

Enregistre toutes les soumissions de code.

| Colonne          | Type         | Contraintes                    | Description                    |
|------------------|--------------|--------------------------------|--------------------------------|
| id               | uuid         | PRIMARY KEY                    | ID unique soumission           |
| user_id          | uuid         | FK auth.users, CASCADE         | Auteur de la soumission        |
| problem_id       | uuid         | FK problems, CASCADE           | Problème résolu                |
| contest_id       | uuid         | FK contests, SET NULL          | Concours (optionnel)           |
| code             | text         | NOT NULL                       | Code source                    |
| language         | text         | NOT NULL                       | Langage programmation          |
| status           | text         | DEFAULT 'pending'              | État de la soumission          |
| result           | jsonb        | DEFAULT '{}'                   | Résultats détaillés            |
| score            | integer      | DEFAULT 0                      | Points obtenus                 |
| execution_time   | integer      | DEFAULT 0                      | Temps exécution (ms)           |
| memory_used      | integer      | DEFAULT 0                      | Mémoire utilisée (MB)          |
| submitted_at     | timestamptz  | DEFAULT now()                  | Date de soumission             |

**Status possibles:**
- `pending`: En attente d'exécution
- `running`: En cours d'exécution
- `accepted`: Tous les tests réussis
- `wrong_answer`: Au moins un test échoué
- `error`: Erreur de compilation/exécution
- `timeout`: Dépassement du temps

**Index:**
- `idx_submissions_user_id` sur `user_id`
- `idx_submissions_problem_id` sur `problem_id`
- `idx_submissions_contest_id` sur `contest_id`

**RLS Policies:**
- SELECT: tous les utilisateurs authentifiés
- INSERT: uniquement si user_id = auth.uid()

---

## Relations

### Relations Principales

1. **users → submissions** (1:N)
   - Un utilisateur peut avoir plusieurs soumissions
   - CASCADE DELETE: si l'utilisateur est supprimé, ses soumissions le sont aussi

2. **problems → submissions** (1:N)
   - Un problème peut avoir plusieurs soumissions
   - CASCADE DELETE: si le problème est supprimé, ses soumissions le sont aussi

3. **contests → contest_participants** (1:N)
   - Un concours peut avoir plusieurs participants
   - CASCADE DELETE: si le concours est supprimé, les participations le sont aussi

4. **contests → submissions** (1:N, optional)
   - Un concours peut avoir plusieurs soumissions
   - SET NULL: si le concours est supprimé, les soumissions gardent leur référence NULL

5. **auth.users → users** (1:1)
   - Chaque utilisateur Auth a un profil utilisateur
   - Liaison via l'ID

6. **auth.users → contest_participants** (1:N)
   - Un utilisateur peut participer à plusieurs concours
   - CASCADE DELETE

7. **auth.users → contests** (1:N)
   - Un utilisateur peut créer plusieurs concours
   - Référence via created_by

---

## Sécurité RLS

Toutes les tables ont Row Level Security (RLS) activé.

### Principe de Sécurité

- **Lecture**: Généralement accessible à tous les utilisateurs authentifiés
- **Écriture**: Restreint aux propriétaires des données
- **Modification**: Uniquement ses propres données

### Fonction d'Authentification

```sql
auth.uid()  -- Retourne l'UUID de l'utilisateur connecté
```

---

## Types de Données JSON

### test_cases (problems)

```typescript
interface TestCase {
  input: string;   // Données d'entrée
  output: string;  // Résultat attendu
}

type TestCases = TestCase[];
```

### problem_ids (contests)

```typescript
type ProblemIds = string[];  // Array d'UUIDs
```

### result (submissions)

```typescript
interface TestResult {
  testCase: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  executionTime: number;
}

type SubmissionResult = TestResult[];
```

---

## Contraintes et Validations

### Contraintes CHECK (à ajouter si nécessaire)

```sql
-- Vérifier que la difficulté est valide
ALTER TABLE problems
ADD CONSTRAINT check_difficulty
CHECK (difficulty IN ('Easy', 'Medium', 'Hard'));

-- Vérifier que le statut de concours est valide
ALTER TABLE contests
ADD CONSTRAINT check_contest_status
CHECK (status IN ('upcoming', 'active', 'completed'));

-- Vérifier que le statut de soumission est valide
ALTER TABLE submissions
ADD CONSTRAINT check_submission_status
CHECK (status IN ('pending', 'running', 'accepted', 'wrong_answer', 'error', 'timeout'));

-- Vérifier que end_time > start_time
ALTER TABLE contests
ADD CONSTRAINT check_contest_dates
CHECK (end_time > start_time);

-- Vérifier que le score est >= 0
ALTER TABLE users
ADD CONSTRAINT check_user_score
CHECK (score >= 0);

ALTER TABLE submissions
ADD CONSTRAINT check_submission_score
CHECK (score >= 0);
```

---

## Triggers (à implémenter)

### Mise à jour automatique du rang

```sql
-- Trigger pour recalculer les rangs après mise à jour du score
CREATE OR REPLACE FUNCTION update_user_ranks()
RETURNS TRIGGER AS $$
BEGIN
  WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY score DESC, created_at) as new_rank
    FROM users
  )
  UPDATE users u
  SET rank = r.new_rank
  FROM ranked r
  WHERE u.id = r.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ranks
AFTER UPDATE OF score ON users
FOR EACH STATEMENT
EXECUTE FUNCTION update_user_ranks();
```

### Mise à jour du score utilisateur après soumission

```sql
CREATE OR REPLACE FUNCTION update_user_score_on_submission()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' THEN
    UPDATE users
    SET score = score + NEW.score
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_score
AFTER INSERT OR UPDATE ON submissions
FOR EACH ROW
EXECUTE FUNCTION update_user_score_on_submission();
```

---

## Vues Utiles

### Vue: Problèmes avec statistiques

```sql
CREATE VIEW problem_stats AS
SELECT
  p.id,
  p.title,
  p.difficulty,
  COUNT(s.id) as total_submissions,
  COUNT(s.id) FILTER (WHERE s.status = 'accepted') as solved_count,
  ROUND(
    COUNT(s.id) FILTER (WHERE s.status = 'accepted')::numeric /
    NULLIF(COUNT(s.id), 0) * 100,
    2
  ) as solve_rate
FROM problems p
LEFT JOIN submissions s ON p.id = s.problem_id
GROUP BY p.id;
```

### Vue: Leaderboard

```sql
CREATE VIEW leaderboard AS
SELECT
  u.rank,
  u.username,
  u.score,
  COUNT(s.id) as total_submissions,
  COUNT(s.id) FILTER (WHERE s.status = 'accepted') as problems_solved
FROM users u
LEFT JOIN submissions s ON u.id = s.user_id
GROUP BY u.id, u.rank, u.username, u.score
ORDER BY u.rank;
```

---

## Performance

### Stratégies d'Optimisation

1. **Index sur colonnes fréquemment interrogées**
   - user_id, problem_id, contest_id
   - score (DESC pour classements)
   - status, difficulty
   - dates (created_at, submitted_at, start_time)

2. **Partitionnement** (pour grandes bases)
   - Partitionner `submissions` par mois
   - Archiver les anciennes soumissions

3. **Caching**
   - Cache Redis pour le leaderboard
   - Cache des problèmes
   - Cache des statistiques

4. **Matérialized Views**
   - Vues matérialisées pour statistiques complexes
   - Rafraîchissement périodique

---

## Migration et Versioning

Les migrations suivent le pattern:
```
XXX_description_de_la_migration.sql
```

Où XXX est un numéro séquentiel (001, 002, etc.)

---

## Backup et Restauration

### Backup complet

```bash
pg_dump -h localhost -U postgres -d codearena > backup.sql
```

### Backup spécifique

```bash
pg_dump -h localhost -U postgres -d codearena \
  -t users -t problems -t submissions > backup_partial.sql
```

### Restauration

```bash
psql -h localhost -U postgres -d codearena < backup.sql
```
