# CodeArena - Plateforme de Compétition de Code

![CodeArena](https://img.shields.io/badge/Status-Production%20Ready-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)
![Supabase](https://img.shields.io/badge/Supabase-Enabled-brightgreen)

> Plateforme complète de compétition de programmation en temps réel avec système de classement, exécution de code et gestion de concours.

## 📖 À Propos

CodeArena est une plateforme moderne permettant aux développeurs de:
- Résoudre des défis de programmation
- Participer à des concours en temps réel
- Améliorer leurs compétences
- Se mesurer à d'autres développeurs sur un leaderboard global

## 🌟 Fonctionnalités

### ✅ Implémenté

- **Authentification Complète**
  - Inscription/connexion sécurisée (Supabase Auth)
  - Gestion de session avec JWT
  - Protection des routes

- **Bibliothèque de Problèmes**
  - 3 problèmes exemple (Two Sum, Reverse String, Fibonacci)
  - Niveaux de difficulté (Easy, Medium, Hard)
  - Cas de test multiples
  - Limites de temps et mémoire

- **Éditeur de Code Professionnel**
  - Monaco Editor (moteur VS Code)
  - Support JavaScript, Python, Java
  - Coloration syntaxique
  - Auto-complétion

- **Système de Soumission**
  - Exécution et validation de code
  - Résultats détaillés par cas de test
  - Calcul automatique du score
  - Historique des soumissions

- **Leaderboard Global**
  - Classement en temps réel
  - Statistiques utilisateur
  - Trophées et médailles

- **Gestion de Concours**
  - Création et gestion de concours
  - Planification avec dates
  - Statuts (à venir, actif, terminé)

- **Sécurité**
  - Row Level Security (RLS) sur toutes les tables
  - Politiques d'accès restrictives
  - Validation des entrées

## 🗄️ Base de Données

Cette branche `bd_codearena` contient tous les éléments pour reproduire la base de données:

### Structure

```
database/
├── migrations/
│   └── 001_create_schema.sql      # Schéma complet avec RLS (360+ lignes)
├── seeds/
│   ├── 001_sample_problems.sql    # 3 problèmes exemple
│   └── 002_sample_contests.sql    # Concours de test
├── queries/
│   └── useful_queries.sql         # 50+ requêtes utiles
├── README.md                       # Documentation détaillée de la BD
└── SCHEMA.md                       # Diagramme ERD complet
```

### Tables

| Table                  | Description                          | Lignes de Code |
|------------------------|--------------------------------------|----------------|
| users                  | Profils utilisateurs                 | ~30            |
| problems               | Problèmes de programmation           | ~35            |
| contests               | Concours                             | ~40            |
| contest_participants   | Participation aux concours           | ~35            |
| submissions            | Soumissions de code                  | ~50            |

**Total**: 5 tables, 10 politiques RLS, 8 index

## 📁 Contenu de la Branche

### Documentation

| Fichier                     | Description                                      |
|-----------------------------|--------------------------------------------------|
| `README.md`                 | Ce fichier - Vue d'ensemble du projet            |
| `ACCES_BASE_DONNEES.md`     | Guide complet d'accès à la base de données       |
| `INSTALLATION.md`           | Instructions d'installation pas à pas            |
| `database/README.md`        | Documentation détaillée de la base               |
| `database/SCHEMA.md`        | Diagramme ERD et spécifications                  |

### Scripts SQL

| Fichier                              | Lignes | Description                           |
|--------------------------------------|--------|---------------------------------------|
| `migrations/001_create_schema.sql`   | 360+   | Schéma complet avec RLS               |
| `seeds/001_sample_problems.sql`      | 90+    | 3 problèmes exemple avec cas de test  |
| `seeds/002_sample_contests.sql`      | 60+    | Concours de démonstration             |
| `queries/useful_queries.sql`         | 400+   | Plus de 50 requêtes prêtes à l'emploi |

## 🚀 Démarrage Rapide

### 1. Accès à la Base de Données

Toutes les informations sont dans [`ACCES_BASE_DONNEES.md`](./ACCES_BASE_DONNEES.md):
- URL du projet Supabase
- Clés d'API
- Variables d'environnement

### 2. Création de la Base de Données

```bash
# Option 1: Via Supabase SQL Editor
# Copiez-collez le contenu de database/migrations/001_create_schema.sql

# Option 2: Via Supabase CLI
supabase db execute -f database/migrations/001_create_schema.sql
supabase db execute -f database/seeds/001_sample_problems.sql
```

### 3. Vérification

```sql
-- Vérifier les tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Vérifier les problèmes
SELECT title, difficulty FROM problems;

-- Résultat attendu: 3 problèmes (Two Sum, Reverse String, Fibonacci)
```

## 📊 Schéma de la Base de Données

```
users (1:N) ────> submissions (N:1) ────> problems
  │                     │
  │                     └──> (N:1) contests
  │
  └──> (1:N) contest_participants (N:1) ──> contests
```

### Tables Principales

1. **users** - Profils utilisateurs avec scores
2. **problems** - Défis de programmation
3. **contests** - Événements de compétition
4. **contest_participants** - Inscriptions aux concours
5. **submissions** - Soumissions de code avec résultats

Voir [`database/SCHEMA.md`](./database/SCHEMA.md) pour le diagramme ERD complet.

## 🔒 Sécurité

### Row Level Security (RLS)

Toutes les tables sont protégées par RLS:

- ✅ **users**: Lecture publique, modification limitée
- ✅ **problems**: Lecture publique authentifiée
- ✅ **contests**: Lecture publique, création authentifiée
- ✅ **submissions**: Création limitée à ses propres soumissions
- ✅ **contest_participants**: Inscription limitée à soi-même

### Politiques Implémentées

- 10 politiques RLS actives
- Authentification requise pour toutes les opérations
- Vérification auth.uid() pour les modifications
- Isolation des données par utilisateur

## 📈 Statistiques du Projet

- **Lignes de SQL**: 910+
- **Lignes de Documentation**: 2,260+
- **Requêtes Utiles**: 50+
- **Tables**: 5
- **Index**: 8
- **Politiques RLS**: 10
- **Commits**: 2

## 🛠️ Stack Technique

### Base de Données
- PostgreSQL 14+ (via Supabase)
- Row Level Security (RLS)
- JSONB pour données flexibles
- Index optimisés

### Application (code source dans le projet principal)
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase Client
- Monaco Editor

## 📚 Requêtes Utiles

Le fichier [`database/queries/useful_queries.sql`](./database/queries/useful_queries.sql) contient plus de 50 requêtes, incluant:

### Statistiques
```sql
-- Nombre total d'utilisateurs
SELECT COUNT(*) FROM users;

-- Taux de réussite global
SELECT ROUND(
  COUNT(*) FILTER (WHERE status = 'accepted')::numeric /
  NULLIF(COUNT(*), 0) * 100, 2
) as success_rate FROM submissions;
```

### Classements
```sql
-- Top 10 utilisateurs
SELECT username, score, rank
FROM users
ORDER BY score DESC
LIMIT 10;
```

### Analyses
```sql
-- Problèmes les plus difficiles
SELECT title, COUNT(*) as attempts,
       COUNT(*) FILTER (WHERE status = 'accepted') as solves
FROM problems p
LEFT JOIN submissions s ON p.id = s.problem_id
GROUP BY p.id
ORDER BY solves ASC;
```

## 🔧 Maintenance

### Recalculer les Rangs

```sql
WITH ranked_users AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY score DESC) as new_rank
  FROM users
)
UPDATE users SET rank = ranked_users.new_rank
FROM ranked_users WHERE users.id = ranked_users.id;
```

### Mettre à Jour les Statuts de Concours

```sql
UPDATE contests SET status = 'active'
WHERE status = 'upcoming' AND start_time <= NOW() AND end_time >= NOW();

UPDATE contests SET status = 'completed'
WHERE status = 'active' AND end_time < NOW();
```

## 📖 Documentation Complète

| Document                      | Contenu                                          |
|-------------------------------|--------------------------------------------------|
| `ACCES_BASE_DONNEES.md`       | Informations de connexion complètes              |
| `INSTALLATION.md`             | Guide d'installation étape par étape             |
| `database/README.md`          | Documentation complète de la base de données     |
| `database/SCHEMA.md`          | Schéma détaillé avec ERD et spécifications       |
| `database/queries/useful_queries.sql` | Collection de requêtes prêtes à l'emploi |

## 🎯 Utilisation

### Pour Développeurs

1. Clonez la branche `bd_codearena`
2. Lisez [`ACCES_BASE_DONNEES.md`](./ACCES_BASE_DONNEES.md)
3. Exécutez les scripts de migration
4. Insérez les données de test
5. Connectez votre application

### Pour DBA

1. Consultez [`database/SCHEMA.md`](./database/SCHEMA.md) pour le schéma
2. Utilisez [`database/queries/useful_queries.sql`](./database/queries/useful_queries.sql) pour l'administration
3. Configurez les backups automatiques
4. Surveillez les performances avec les index fournis

## 🤝 Contribution

Pour ajouter de nouveaux problèmes:

```sql
INSERT INTO problems (title, description, difficulty, test_cases)
VALUES (
  'Votre Problème',
  'Description détaillée...',
  'Medium',
  '[{"input": "test", "output": "expected"}]'::jsonb
);
```

## 📄 Licence

MIT

## 🆘 Support

Pour toute question:
1. Consultez la documentation dans `/database/`
2. Vérifiez les requêtes utiles dans `database/queries/`
3. Lisez le guide de troubleshooting dans `ACCES_BASE_DONNEES.md`

## 🎓 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Projet CodeArena** - Plateforme de compétition de code complète et production-ready 🚀

Branche: `bd_codearena` | Base de données complète avec documentation
