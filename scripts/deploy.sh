#!/bin/bash
# ================================================================================
# Script de déploiement Kubernetes - CodeArena
# ================================================================================

set -e

NAMESPACE="codearena"

echo "🚀 Deploying CodeArena to Kubernetes"
echo "Namespace: $NAMESPACE"
echo "================================"

# Créer le namespace
echo "📦 Creating namespace..."
kubectl apply -f k8s/config/namespace.yaml

# Créer les ConfigMaps et Secrets
echo "🔧 Creating ConfigMaps and Secrets..."
kubectl apply -f k8s/config/configmap.yaml
kubectl apply -f k8s/config/secret.yaml

# Déployer Redis
echo "📊 Deploying Redis..."
kubectl apply -f k8s/redis/

# Déployer le Backend
echo "⚙️  Deploying Backend..."
kubectl apply -f k8s/backend/

# Déployer le Frontend
echo "🎨 Deploying Frontend..."
kubectl apply -f k8s/frontend/

# Déployer le Sandbox
echo "🔒 Deploying Sandbox..."
kubectl apply -f k8s/sandbox/

# Déployer l'Ingress
echo "🌐 Deploying Ingress..."
kubectl apply -f k8s/ingress/

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Check status with:"
echo "   kubectl get pods -n $NAMESPACE"
echo "   kubectl get services -n $NAMESPACE"
echo "   kubectl get ingress -n $NAMESPACE"
