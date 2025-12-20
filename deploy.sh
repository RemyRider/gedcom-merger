#!/bin/bash

# 🚀 Script de déploiement automatique Netlify
# Version: 1.8.6
# Site: gedcom-merger

set -e  # Arrêter en cas d'erreur

echo "═══════════════════════════════════════════════════════"
echo "🚀 Déploiement automatique - Fusionneur GEDCOM v1.8.6"
echo "═══════════════════════════════════════════════════════"
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Exécutez ce script depuis le répertoire gedcom-merger-v1.8.6"
    exit 1
fi

# Vérifier que le dossier dist existe
if [ ! -d "dist" ]; then
    echo "⚠️  Le dossier dist/ n'existe pas. Lancement du build..."
    npm run build
fi

echo "✅ Dossier dist/ trouvé"
echo ""

# Vérifier si Netlify CLI est installé
if ! command -v netlify &> /dev/null; then
    echo "⚠️  Netlify CLI n'est pas installé."
    echo "📦 Installation de Netlify CLI..."
    npm install -g netlify-cli
    echo "✅ Netlify CLI installé"
    echo ""
fi

# Vérifier l'authentification Netlify
echo "🔐 Vérification de l'authentification Netlify..."
if ! netlify status &> /dev/null; then
    echo "⚠️  Vous n'êtes pas connecté à Netlify."
    echo "🔑 Lancement de la connexion..."
    netlify login
fi

echo "✅ Authentification OK"
echo ""

# Déployer
echo "📤 Déploiement en cours vers gedcom-merger..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
netlify deploy \
    --prod \
    --site gedcom-merger \
    --dir=dist \
    --message "Déploiement automatique v1.8.6 - Corrections CONT/CONC + système multi-onglets"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ Déploiement terminé avec succès !"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "🌐 URL du site: https://gedcom-merger.netlify.app"
echo ""
echo "📋 Vérifications recommandées:"
echo "   • Page se charge avec v1.8.6"
echo "   • Upload fichier GEDCOM fonctionne"
echo "   • Détection doublons opérationnelle"
echo "   • Système multi-onglets actif"
echo ""
echo "🎉 Votre application est en ligne !"
