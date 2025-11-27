# ================================================================================
# DOCKERFILE - Frontend CodeArena (React + Vite)
# ================================================================================
# Ce Dockerfile crée une image optimisée pour le frontend React en deux étapes:
# 1. Build stage: Compile l'application React avec Vite
# 2. Production stage: Sert les fichiers statiques avec Nginx
# ================================================================================

# ================================
# STAGE 1: Build
# ================================
# Utilise Node.js 20 Alpine (image légère) pour compiler l'application
FROM node:20-alpine AS builder

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de dépendances
# Copier package.json et package-lock.json en premier pour profiter du cache Docker
COPY package*.json ./

# Installer les dépendances de production et de développement
# --frozen-lockfile assure que les versions exactes sont installées
RUN npm ci --frozen-lockfile

# Copier tout le code source de l'application
COPY . .

# Build de l'application React avec Vite
# Génère les fichiers statiques optimisés dans /app/dist
RUN npm run build

# ================================
# STAGE 2: Production
# ================================
# Utilise Nginx Alpine pour servir les fichiers statiques
FROM nginx:alpine

# Copier les fichiers buildés depuis le stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la configuration Nginx personnalisée
# Cette config gère le routing React (SPA)
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80 pour le trafic HTTP
EXPOSE 80

# Commande par défaut pour démarrer Nginx
# daemon off; garde Nginx au premier plan (requis pour Docker)
CMD ["nginx", "-g", "daemon off;"]

# ================================================================================
# NOTES:
# - Image finale très légère (~25MB) grâce à Alpine
# - Build multi-stage réduit la taille de l'image finale
# - Nginx sert les fichiers statiques avec haute performance
# - Configuration Nginx inclut le support pour React Router (SPA)
# ================================================================================
