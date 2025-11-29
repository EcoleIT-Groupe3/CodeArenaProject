# CodeArena Docker Sandbox

Ce dossier contient la configuration Docker pour exécuter du code Python de manière sécurisée et isolée.

## Architecture

Le système utilise Docker pour créer un environnement d'exécution isolé :

- **Python** : Image basée sur `python:3.11-alpine`

## Sécurité

Chaque conteneur est configuré avec :
- **Utilisateur non-root** : Exécution avec l'utilisateur `sandbox` (UID 1000)
- **Pas de réseau** : `--network none` pour isoler complètement
- **Limites de ressources** :
  - Mémoire : 256MB max
  - CPU : 0.5 core max
  - Processus : 50 max
- **Système de fichiers en lecture seule** avec `/tmp` writable uniquement
- **Timeout** : 10 secondes max par exécution

## Construction de l'image

```bash
cd sandbox
./build-images.sh
```

Ou manuellement :

```bash
docker build -f Dockerfile.python -t codearena-sandbox-python .
```

## Test de l'exemple

Le fichier d'exemple dans `test-examples/test_python.py` montre comment écrire du code Python.

### Python
```bash
echo "5 3" | docker run -i --rm codearena-sandbox-python python3 -c "a,b=map(int,input().split());print(a+b)"
```

## Utilisation dans le backend

Le service `CodeExecutionService` gère automatiquement :
1. La création du conteneur Docker approprié
2. L'injection du code utilisateur
3. L'exécution avec les test cases
4. La récupération des résultats
5. Le nettoyage du conteneur

## Structure des test cases

Les test cases sont stockés au format JSON dans la base de données :

```json
[
  {"input": "5 3", "output": "8"},
  {"input": "10 20", "output": "30"}
]
```

Le système compare la sortie du programme avec la sortie attendue pour déterminer si le test passe.
