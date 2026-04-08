#!/bin/bash
# Script pour démarrer l'environnement de développement local
# Usage: ./dev.sh [client|server|all]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
echo_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

start_server() {
    echo_info "Démarrage du serveur backend sur http://localhost:5000"
    cd "$SCRIPT_DIR/server"
    npm run dev
}

start_client() {
    echo_info "Démarrage du client sur http://localhost:3000"
    cd "$SCRIPT_DIR/client"
    npm start
}

start_all() {
    echo_info "Démarrage de l'environnement complet..."
    echo_warn "Ouvrez 2 terminaux et lancez:"
    echo "  Terminal 1: ./dev.sh server"
    echo "  Terminal 2: ./dev.sh client"
    echo ""
    echo_info "Ou utilisez: npm run dev dans /server et npm start dans /client"
}

case "${1:-all}" in
    server)
        start_server
        ;;
    client)
        start_client
        ;;
    all|*)
        start_all
        ;;
esac
