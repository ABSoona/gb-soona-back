#!/bin/bash
set -e  # Arrête le script si une commande échoue

# Détection du fichier docker-compose à utiliser
if [ -f "docker-compose.vps.yml" ]; then
  COMPOSE_FILE="docker-compose.vps.yml"
  echo "📦 Fichier docker-compose.vps.yml détecté — utilisation pour le déploiement"
else
  COMPOSE_FILE="docker-compose.yml"
  echo "📦 Aucun docker-compose.vps.yml trouvé — utilisation du docker-compose.yml standard"
fi

echo "🛡️  Sauvegarde du .env"
cp .env .env.bak

echo "⬇️  Pull Git"
git pull origin main

echo "🔄  Restauration du .env"
mv .env.bak .env

echo "🐳  Reconstruction et redémarrage des conteneurs"
docker compose -f $COMPOSE_FILE down --remove-orphans
docker compose -f $COMPOSE_FILE up -d --build

# Attendre que le conteneur 'server' soit prêt
echo "⏳  Attente du démarrage du conteneur 'server'..."
sleep 5

echo "🔍  Vérification des changements dans schema.prisma"
if git diff --name-only HEAD~1 HEAD | grep -q "schema.prisma"; then
  echo "🛠️  Schéma Prisma modifié : génération + déploiement des migrations"
  docker compose -f $COMPOSE_FILE exec server npx prisma generate
  docker compose -f $COMPOSE_FILE exec server npx prisma migrate deploy
else
  echo "✅  Aucun changement détecté dans le schéma Prisma"
fi

echo "🚀  Déploiement terminé avec succès !"