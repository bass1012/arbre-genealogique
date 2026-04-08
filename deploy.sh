#!/bin/bash
# Script de déploiement vers le serveur VPS
# Usage: ./deploy.sh [client|server|all]

set -e

VPS_HOST="ubuntu@57.131.47.244"
VPS_PATH="/var/www/arbre-genealogique"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
echo_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
echo_error() { echo -e "${RED}[ERROR]${NC} $1"; }

deploy_client() {
    echo_info "=== Déploiement du CLIENT ==="
    
    cd "$SCRIPT_DIR/client"
    
    echo_info "Building client..."
    npm run build
    
    echo_info "Uploading to VPS..."
    rsync -avz --delete build/ "$VPS_HOST:$VPS_PATH/client/build/"
    
    echo_info "Client déployé avec succès!"
}

deploy_server() {
    echo_info "=== Déploiement du SERVER ==="
    
    cd "$SCRIPT_DIR/server"
    
    echo_info "Building server..."
    npm run build
    
    echo_info "Uploading to VPS..."
    rsync -avz dist/ "$VPS_HOST:$VPS_PATH/server/dist/"
    
    echo_info "Restarting PM2..."
    ssh "$VPS_HOST" "cd $VPS_PATH/server && pm2 restart arbre-genealogique-api"
    
    echo_info "Server déployé avec succès!"
}

show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  client    Déployer uniquement le frontend"
    echo "  server    Déployer uniquement le backend"
    echo "  all       Déployer frontend + backend (par défaut)"
    echo "  status    Vérifier le statut du serveur"
    echo "  logs      Afficher les logs du serveur"
    echo "  help      Afficher cette aide"
}

check_status() {
    echo_info "=== Statut du serveur ==="
    ssh "$VPS_HOST" "pm2 status && echo '' && pm2 logs arbre-genealogique-api --lines 5 --nostream"
}

show_logs() {
    echo_info "=== Logs du serveur (Ctrl+C pour quitter) ==="
    ssh "$VPS_HOST" "pm2 logs arbre-genealogique-api"
}

# Main
case "${1:-all}" in
    client)
        deploy_client
        ;;
    server)
        deploy_server
        ;;
    all)
        deploy_client
        deploy_server
        ;;
    status)
        check_status
        ;;
    logs)
        show_logs
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        echo_error "Option inconnue: $1"
        show_usage
        exit 1
        ;;
esac

echo_info "=== Terminé! ==="
