# ================================================================================
# DOCKERFILE - Backend CodeArena (Node.js API)
# ================================================================================
# Ce Dockerfile crée une image pour le backend Node.js avec:
# - Support pour l'exécution de code utilisateur (sandbox)
# - API REST pour les problèmes, défis quotidiens, leaderboard
# - Connexion à Supabase pour la base de données
# ================================================================================

# Utilise Node.js 20 Alpine (image légère)
FROM node:20-alpine

# Installer les dépendances système nécessaires pour le sandbox
# - python3: pour exécuter du code Python
# - g++: pour compiler du code C++
# - openjdk11: pour exécuter du code Java
RUN apk add --no-cache \
    python3 \
    py3-pip \
    g++ \
    openjdk11-jre

# Créer un utilisateur non-root pour la sécurité
# L'application s'exécutera avec cet utilisateur
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances de production uniquement
# --omit=dev n'installe pas les devDependencies
RUN npm ci --omit=dev --frozen-lockfile

# Copier le code source de l'application
COPY . .

# Changer le propriétaire des fichiers vers l'utilisateur nodejs
RUN chown -R nodejs:nodejs /app

# Passer à l'utilisateur non-root
USER nodejs

# Exposer le port 3000 pour l'API
EXPOSE 3000

# Variables d'environnement par défaut
# Ces valeurs seront remplacées par les ConfigMaps/Secrets Kubernetes
ENV NODE_ENV=production \
    PORT=3000

# Healthcheck pour vérifier que l'API répond
# Kubernetes utilisera cela pour vérifier la santé du pod
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Commande pour démarrer l'application
CMD ["node", "server.js"]

# ================================================================================
# NOTES:
# - Image Alpine pour une taille réduite (~150MB)
# - Utilisateur non-root pour la sécurité
# - Healthcheck intégré pour Kubernetes
# - Support multi-langage pour l'exécution de code
# ================================================================================
