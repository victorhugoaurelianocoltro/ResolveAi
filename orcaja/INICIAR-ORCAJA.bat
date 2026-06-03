@echo off
chcp 65001 >nul
title ResolveAí - Servidor Local (legado)
cd /d "%~dp0"

echo.
echo  ========================================
echo    ResolveAí - Use INICIAR-RESOLVEAI.bat
echo    (este arquivo ainda funciona)
echo  ========================================
echo.

set "NODE_EXE=node"
where node >nul 2>&1
if %errorlevel% neq 0 (
  set "NODE_EXE=%LOCALAPPDATA%\Programs\cursor\resources\app\resources\helpers\node.exe"
)
if not exist "%NODE_EXE%" (
  echo  Node.js nao encontrado. Abrindo admin direto no navegador...
  echo  Se nao funcionar, instale Live Server no Cursor ou leia COMO-TESTAR-ADMIN.txt
  echo.
  start "" "%~dp0admin.html"
  pause
  exit /b 0
)

echo  Abrindo site e admin no navegador...
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8080/index.html"
start "" "http://127.0.0.1:8080/admin.html"

echo  Iniciando servidor em http://127.0.0.1:8080
echo  PIN do admin: 1234
echo  Para parar: feche esta janela ou Ctrl+C
echo.

"%NODE_EXE%" "%~dp0servidor-local.js"
pause
