# Guide d'Installation CodeArena

Ce guide vous permet de reproduire l'installation complète de la plateforme CodeArena.

## Prérequis

- Node.js 18+ et npm
- Un compte Supabase (gratuit)
- Git

## Étape 1: Cloner le Projet

```bash
# Cloner depuis la branche bd_codearena
git clone -b bd_codearena <votre-repo-url>
cd project

# Ou si vous avez déjà le projet
git checkout bd_codearena
```

## Étape 2: Configuration Supabase

### 2.1 Créer un Projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte (si nécessaire)
3. Créez un nouveau projet
4. Notez les informations de connexion

### 2.2 Configurer la Base de Données

#### Option A: Via l'Interface Supabase

1. Ouvrez votre projet Supabase
2. Allez dans **SQL Editor**
3. Créez une nouvelle requête
4. Copiez le contenu de `database/migrations/001_create_schema.sql`
5. Exécutez le script
6. Répétez pour les fichiers seeds si vous voulez des données de test

#### Option B: Via Supabase CLI

```bash
# Installer la CLI Supabase
npm install -g supabase

# Se connecter
supabase login

# Lier votre projet
supabase link --project-ref votre-project-ref

# Appliquer les migrations
supabase db push

# Ou exécuter directement
supabase db execute -f database/migrations/001_create_schema.sql
supabase db execute -f database/seeds/001_sample_problems.sql
supabase db execute -f database/seeds/002_sample_contests.sql
```

## Étape 3: Configuration des Variables d'Environnement

Créez un fichier `.env` à la racine du projet:

```bash
# .env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anonyme
```

Pour obtenir ces valeurs:
1. Dans Supabase, allez dans **Settings** > **API**
2. Copiez **Project URL** → `VITE_SUPABASE_URL`
3. Copiez **anon public** → `VITE_SUPABASE_ANON_KEY`

## Étape 4: Installation des Dépendances

```bash
npm install
```

### Dépendances Principales

Le projet utilise:
- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **@supabase/supabase-js** - Client Supabase
- **@monaco-editor/react** - Éditeur de code
- **lucide-react** - Icônes
- **socket.io** - Temps réel (préparation future)

## Étape 5: Démarrage du Projet

### Mode Développement

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

### Build Production

```bash
npm run build
```

Les fichiers de production seront dans le dossier `dist/`

### Prévisualisation Production

```bash
npm run preview
```

## Étape 6: Vérification

### 6.1 Vérifier la Base de Données

Connectez-vous à Supabase et exécutez:

```sql
-- Vérifier les tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Vérifier les problèmes
SELECT title, difficulty FROM problems;

-- Vérifier les politiques RLS
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```

### 6.2 Tester l'Application

1. Ouvrez `http://localhost:5173`
2. Créez un compte
3. Connectez-vous
4. Parcourez les problèmes
5. Essayez de soumettre une solution

## Étape 7: Déploiement (Optionnel)

### Déploiement sur Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Configurer les variables d'environnement dans Vercel Dashboard
```

### Déploiement sur Netlify

```bash
# Build
npm run build

# Déployer le dossier dist/
# Via l'interface web Netlify ou CLI
```

## Structure des Fichiers

```
project/
├── database/
│   ├── migrations/
│   │   └── 001_create_schema.sql      # Schema complet
│   ├── seeds/
│   │   ├── 001_sample_problems.sql    # Données de test
│   │   └── 002_sample_contests.sql    # Concours test
│   └── README.md                       # Doc base de données
├── src/
│   ├── components/
│   │   ├── AuthForm.tsx               # Formulaire auth
│   │   ├── CodeEditor.tsx             # Éditeur Monaco
│   │   ├── ContestList.tsx            # Liste concours
│   │   ├── Dashboard.tsx              # Tableau de bord
│   │   ├── Leaderboard.tsx            # Classement
│   │   └── ProblemList.tsx            # Liste problèmes
│   ├── contexts/
│   │   └── AuthContext.tsx            # Context auth
│   ├── lib/
│   │   └── supabase.ts                # Client Supabase
│   ├── App.tsx                        # Composant principal
│   └── main.tsx                       # Point d'entrée
├── .env                                # Variables d'environnement
├── package.json                        # Dépendances
├── tailwind.config.js                 # Config Tailwind
├── vite.config.ts                     # Config Vite
└── tsconfig.json                      # Config TypeScript
```

## Problèmes Courants

### Erreur de Connexion Supabase

```
Error: Invalid API key
```

**Solution:** Vérifiez que votre `.env` contient les bonnes valeurs.

### Erreur RLS

```
Error: new row violates row-level security policy
```

**Solution:** Assurez-vous que les politiques RLS sont bien créées et que l'utilisateur est authentifié.

### Problème de Build

```
Error: Module not found
```

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Commandes Utiles

```bash
# Développement
npm run dev              # Démarre le serveur dev
npm run build           # Build pour production
npm run preview         # Prévisualise le build

# Linting (si configuré)
npm run lint            # Vérifie le code

# Tests (à ajouter)
npm test                # Lance les tests
```

## Prochaines Étapes

Une fois l'installation réussie:

1. **Personnalisation**: Modifiez les couleurs dans `tailwind.config.js`
2. **Ajout de Problèmes**: Insérez plus de problèmes dans la base
3. **Concours**: Créez des concours avec dates réelles
4. **Docker**: Implémentez l'exécution sandboxée
5. **Socket.io**: Ajoutez les mises à jour temps réel
6. **Tests**: Ajoutez des tests unitaires et e2e

## Ressources

- [Documentation React](https://react.dev)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Tailwind](https://tailwindcss.com/docs)
- [Documentation Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Documentation TypeScript](https://www.typescriptlang.org/docs/)

## Support

Pour toute question ou problème:
1. Consultez la documentation dans `/database/README.md`
2. Vérifiez les logs dans la console du navigateur
3. Consultez les logs Supabase dans le dashboard

## Licence

MIT
