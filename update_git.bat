@echo off
cd /d %~dp0

echo =======================================
echo 🚀 Actualizando proyecto en GitHub Pages (FORZADO)
echo =======================================

git add .
git commit -m "Actualización rápida desde script"
git push origin main --force

echo ✅ Proyecto actualizado en GitHub (push forzado)
pause
