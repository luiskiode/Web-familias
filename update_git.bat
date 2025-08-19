@echo off
cd /d %~dp0

echo =======================================
echo 🚀 Actualizando proyecto en GitHub Pages
echo =======================================

git add .
git commit -m "Actualización rápida desde script"
git push origin main

echo ✅ Proyecto actualizado en GitHub
pause
