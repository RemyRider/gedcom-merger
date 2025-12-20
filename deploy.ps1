# 🚀 Script de déploiement automatique Netlify (Windows)
# Version: 1.8.6
# Site: gedcom-merger

$ErrorActionPreference = "Stop"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 Déploiement automatique - Fusionneur GEDCOM v1.8.6" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: Exécutez ce script depuis le répertoire gedcom-merger-v1.8.6" -ForegroundColor Red
    exit 1
}

# Vérifier que le dossier dist existe
if (-not (Test-Path "dist")) {
    Write-Host "⚠️  Le dossier dist/ n'existe pas. Lancement du build..." -ForegroundColor Yellow
    npm run build
}

Write-Host "✅ Dossier dist/ trouvé" -ForegroundColor Green
Write-Host ""

# Vérifier si Netlify CLI est installé
$netlifyCli = Get-Command netlify -ErrorAction SilentlyContinue
if (-not $netlifyCli) {
    Write-Host "⚠️  Netlify CLI n'est pas installé." -ForegroundColor Yellow
    Write-Host "📦 Installation de Netlify CLI..." -ForegroundColor Yellow
    npm install -g netlify-cli
    Write-Host "✅ Netlify CLI installé" -ForegroundColor Green
    Write-Host ""
}

# Vérifier l'authentification Netlify
Write-Host "🔐 Vérification de l'authentification Netlify..." -ForegroundColor Cyan
try {
    netlify status 2>&1 | Out-Null
} catch {
    Write-Host "⚠️  Vous n'êtes pas connecté à Netlify." -ForegroundColor Yellow
    Write-Host "🔑 Lancement de la connexion..." -ForegroundColor Yellow
    netlify login
}

Write-Host "✅ Authentification OK" -ForegroundColor Green
Write-Host ""

# Déployer
Write-Host "📤 Déploiement en cours vers gedcom-merger..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
netlify deploy `
    --prod `
    --site gedcom-merger `
    --dir=dist `
    --message "Déploiement automatique v1.8.6 - Corrections CONT/CONC + système multi-onglets"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Déploiement terminé avec succès !" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 URL du site: https://gedcom-merger.netlify.app" -ForegroundColor White
Write-Host ""
Write-Host "📋 Vérifications recommandées:" -ForegroundColor Yellow
Write-Host "   • Page se charge avec v1.8.6"
Write-Host "   • Upload fichier GEDCOM fonctionne"
Write-Host "   • Détection doublons opérationnelle"
Write-Host "   • Système multi-onglets actif"
Write-Host ""
Write-Host "🎉 Votre application est en ligne !" -ForegroundColor Green
