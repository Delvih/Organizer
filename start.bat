@echo off
title File Organizer Pro
chcp 65001 >nul

echo.
echo  ================================================
echo   FILE ORGANIZER PRO — Запуск
echo  ================================================
echo.

cd /d "%~dp0"

:: Ищем Python
set PYTHON_CMD=

python --version >nul 2>&1
if not errorlevel 1 ( set PYTHON_CMD=python & goto :found )

py --version >nul 2>&1
if not errorlevel 1 ( set PYTHON_CMD=py & goto :found )

python3 --version >nul 2>&1
if not errorlevel 1 ( set PYTHON_CMD=python3 & goto :found )

for %%p in (
    "%LOCALAPPDATA%\Programs\Python\Python314\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
    "C:\Python314\python.exe"
    "C:\Python313\python.exe"
    "C:\Python312\python.exe"
    "C:\Python311\python.exe"
) do (
    if exist %%p ( set PYTHON_CMD=%%p & goto :found )
)

echo  [ОШИБКА] Python не найден.
echo  Установите с https://python.org
echo  При установке отметьте: Add Python to PATH
pause
exit /b 1

:found
echo  Python: %PYTHON_CMD%
for /f "tokens=*" %%v in ('%PYTHON_CMD% --version 2^>^&1') do echo  Версия: %%v
echo.

echo  Проверка зависимостей...
%PYTHON_CMD% -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo  Установка Flask...
    %PYTHON_CMD% -m pip install flask flask-cors werkzeug --quiet
)
echo  Зависимости — OK
echo.
echo  Адрес: http://localhost:5000
echo  Браузер откроется через 3 секунды.
echo  Для остановки закройте это окно.
echo  ------------------------------------------------

:: Открываем браузер через PowerShell — без проблем с кавычками
start /b powershell -NoProfile -Command "Start-Sleep 3; Start-Process 'http://localhost:5000'"

%PYTHON_CMD% app.py

pause