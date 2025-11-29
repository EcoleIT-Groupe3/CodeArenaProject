#!/bin/bash

echo "Building CodeArena Docker Sandbox Image..."
echo ""

echo "Building codearena-sandbox-python..."
docker build -f Dockerfile.python -t codearena-sandbox-python .

if [ $? -eq 0 ]; then
  echo "✓ codearena-sandbox-python built successfully"
else
  echo "✗ Failed to build codearena-sandbox-python"
  exit 1
fi

echo ""
echo "Docker sandbox image built successfully!"
echo ""
echo "Available image:"
docker images | grep codearena-sandbox-python
