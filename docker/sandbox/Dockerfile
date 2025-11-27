# ================================================================================
# DOCKERFILE - Sandbox CodeArena (Exécution sécurisée de code)
# ================================================================================
# Ce Dockerfile crée une image pour exécuter du code utilisateur de manière sécurisée
# avec support pour JavaScript, Python, Java et C++
# ================================================================================

# Utilise Alpine comme base pour une image légère
FROM alpine:3.19

# Installer tous les langages et outils nécessaires
RUN apk add --no-cache \
    nodejs \
    npm \
    python3 \
    py3-pip \
    openjdk11-jre \
    g++ \
    gcc \
    make

# Créer un utilisateur sandbox avec UID/GID spécifiques
# Cet utilisateur aura des permissions très limitées
RUN addgroup -g 2000 -S sandbox && \
    adduser -S sandbox -u 2000 -G sandbox

# Créer les répertoires nécessaires
RUN mkdir -p /sandbox/code /sandbox/output && \
    chown -R sandbox:sandbox /sandbox

# Installer des limites système pour la sécurité
# Ces limites empêchent les abus de ressources
RUN echo "sandbox hard nproc 20" >> /etc/security/limits.conf && \
    echo "sandbox hard nofile 256" >> /etc/security/limits.conf && \
    echo "sandbox hard cpu 10" >> /etc/security/limits.conf && \
    echo "sandbox hard as 512000" >> /etc/security/limits.conf

# Passer à l'utilisateur sandbox
USER sandbox

# Définir le répertoire de travail
WORKDIR /sandbox

# Copier le script d'exécution
COPY --chown=sandbox:sandbox docker/sandbox/execute.sh /sandbox/execute.sh
RUN chmod +x /sandbox/execute.sh

# Variables d'environnement
ENV EXECUTION_TIMEOUT=5 \
    MEMORY_LIMIT=256M

# Point d'entrée pour exécuter le code
ENTRYPOINT ["/sandbox/execute.sh"]

# ================================================================================
# NOTES DE SÉCURITÉ:
# - Utilisateur non-root avec permissions minimales
# - Limites strictes sur les ressources (CPU, mémoire, processus)
# - Isolation complète du système hôte
# - Timeout d'exécution pour éviter les boucles infinies
# - Aucun accès réseau (NetworkPolicy Kubernetes)
# ================================================================================
