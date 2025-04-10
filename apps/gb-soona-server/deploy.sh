set -e  # Arrête le script si une commande échoue

echo "🛡️ Sauvegarde du .env"
cp .env .env.bak

echo "⬇️ Pull Git"
git pull origin main

echo "🔄 Restauration du .env"
mv .env.bak .env

echo "🐳 Restart et rebuild des conteneurs"
docker compose down
docker compose up -d --build

# Attendre que le conteneur 'server' soit prêt
echo "⏳ Attente du démarrage du conteneur 'server'..."
sleep 5

echo "🔍 Vérification des changements dans schema.prisma"
if git diff --name-only HEAD~1 HEAD | grep -q "schema.prisma"; then
  echo "🛠️ Schéma Prisma modifié : génération + déploiement des migrations"
  docker compose exec server npx prisma generate
  docker compose exec server npx prisma migrate deploy
else
  echo "✅ Aucun changement détecté dans le schéma Prisma"
fi

echo "🚀 Déploiement terminé !"