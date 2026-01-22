@echo off
echo ==========================================
echo    INICIANDO WEB CAPTURE VIBE LIGAR 🚀
echo ==========================================

echo [1/3] Iniciando Servidor Backend (Porta 3001)...
start "Backend - NAO FECHAR" cmd /k "cd server && npm run dev"

echo [2/3] Iniciando Frontend React (Porta 5173)...
start "Frontend - NAO FECHAR" cmd /k "cd client && npm run dev"

echo [3/3] Aguardando servicos subirem...
timeout /t 7

echo Abrindo navegador...
start http://localhost:5173

echo ==========================================
echo    PRONTO! O APP ESTA RODANDO.
echo    Pode minimizar os terminais pretos,
echo    mas NAO OS FECHE.
echo ==========================================
pause
