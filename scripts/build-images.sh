#!/bin/bash
# ================================================================================
# Script de construction des images Docker - CodeArena
# ================================================================================

set -e

# Variables
REGISTRY="${DOCKER_REGISTRY:-docker.io}"
NAMESPACE="${DOCKER_NAMESPACE:-codearena}"
VERSION="${VERSION:-latest}"

echo "🚀 Building CodeArena Docker Images"
echo "Registry: $REGISTRY"
echo "Namespace: $NAMESPACE"
echo "Version: $VERSION"
echo "================================"

# Build Frontend
echo "📦 Building Frontend..."
docker build -t $REGISTRY/$NAMESPACE/frontend:$VERSION \
  -f docker/frontend/Dockerfile .
echo "✅ Frontend built successfully"

# Build Backend
echo "📦 Building Backend..."
docker build -t $REGISTRY/$NAMESPACE/backend:$VERSION \
  -f docker/backend/Dockerfile \
  docker/backend/
echo "✅ Backend built successfully"

# Build Sandbox
echo "📦 Building Sandbox..."
docker build -t $REGISTRY/$NAMESPACE/sandbox:$VERSION \
  -f docker/sandbox/Dockerfile .
echo "✅ Sandbox built successfully"

echo ""
echo "✅ All images built successfully!"
echo ""
echo "📤 To push images to registry:"
echo "   docker push $REGISTRY/$NAMESPACE/frontend:$VERSION"
echo "   docker push $REGISTRY/$NAMESPACE/backend:$VERSION"
echo "   docker push $REGISTRY/$NAMESPACE/sandbox:$VERSION"
