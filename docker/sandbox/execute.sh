#!/bin/sh
# ================================================================================
# Script d'exécution sécurisée de code - CodeArena Sandbox
# ================================================================================
# Ce script exécute le code utilisateur avec des limites strictes
# Usage: ./execute.sh <language> <code_file> <test_input>
# ================================================================================

set -e

LANGUAGE=$1
CODE_FILE=$2
TEST_INPUT=$3
TIMEOUT=${EXECUTION_TIMEOUT:-5}

# Créer un fichier temporaire pour le code
WORK_DIR="/sandbox/code"
OUTPUT_DIR="/sandbox/output"
mkdir -p "$WORK_DIR" "$OUTPUT_DIR"

# Fonction pour nettoyer les fichiers temporaires
cleanup() {
    rm -rf "$WORK_DIR"/*
    rm -rf "$OUTPUT_DIR"/*
}

trap cleanup EXIT

# Copier le code dans le répertoire de travail
cp "$CODE_FILE" "$WORK_DIR/solution.$LANGUAGE"

# ================================================================================
# EXÉCUTION SELON LE LANGAGE
# ================================================================================

case "$LANGUAGE" in
    javascript|js)
        echo "Executing JavaScript..."
        timeout "$TIMEOUT" node "$WORK_DIR/solution.$LANGUAGE" <<< "$TEST_INPUT" > "$OUTPUT_DIR/output.txt" 2>&1
        ;;

    python|py)
        echo "Executing Python..."
        timeout "$TIMEOUT" python3 "$WORK_DIR/solution.$LANGUAGE" <<< "$TEST_INPUT" > "$OUTPUT_DIR/output.txt" 2>&1
        ;;

    java)
        echo "Executing Java..."
        cd "$WORK_DIR"
        # Compiler le code Java
        timeout 10 javac "solution.java" 2>&1 || {
            echo "Compilation Error" > "$OUTPUT_DIR/output.txt"
            exit 1
        }
        # Exécuter le code compilé
        timeout "$TIMEOUT" java Solution <<< "$TEST_INPUT" > "$OUTPUT_DIR/output.txt" 2>&1
        ;;

    cpp|c++)
        echo "Executing C++..."
        cd "$WORK_DIR"
        # Compiler le code C++
        timeout 10 g++ -o solution "solution.$LANGUAGE" 2>&1 || {
            echo "Compilation Error" > "$OUTPUT_DIR/output.txt"
            exit 1
        }
        # Exécuter le binaire
        timeout "$TIMEOUT" ./solution <<< "$TEST_INPUT" > "$OUTPUT_DIR/output.txt" 2>&1
        ;;

    *)
        echo "Unsupported language: $LANGUAGE"
        exit 1
        ;;
esac

# Vérifier le statut d'exécution
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "SUCCESS"
    cat "$OUTPUT_DIR/output.txt"
elif [ $EXIT_CODE -eq 124 ]; then
    echo "TIMEOUT"
    echo "Time Limit Exceeded: Execution took longer than ${TIMEOUT}s"
else
    echo "ERROR"
    cat "$OUTPUT_DIR/output.txt"
fi

exit $EXIT_CODE
