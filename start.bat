@echo off
TITLE Frieren Bot - Startup Script
SETLOCAL

echo ====================================================
echo    Frieren Bot - Startup and Update Script
echo ====================================================
echo.

:: 0. Stop existing processes to avoid file locks
echo [0/6] Checking for running processes...
call pm2 stop all >nul 2>&1
echo Done.
echo.

:: 1. Install root dependencies
echo [1/6] Checking dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [!] npm install error!
    pause
    exit /b %ERRORLEVEL%
)
echo.

:: 2. Database configuration
echo [2/6] Configuring database (Prisma)...
call npx prisma generate
call npx prisma db push
if %ERRORLEVEL% NEQ 0 (
    echo [!] Prisma configuration error!
    pause
    exit /b %ERRORLEVEL%
)
echo.

:: 2.5. Check yt-dlp (required for music)
echo [2.5/6] Checking yt-dlp...
where yt-dlp >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo yt-dlp bulunamadi, winget ile yukleniyor...
    winget install yt-dlp.yt-dlp --silent --accept-package-agreements --accept-source-agreements
) else (
    echo yt-dlp mevcut, guncelleniyor...
    winget upgrade yt-dlp.yt-dlp --silent --accept-package-agreements --accept-source-agreements >nul 2>&1
)
if not exist "node_modules\yt-dlp-exec\bin" mkdir "node_modules\yt-dlp-exec\bin"
powershell -NoProfile -Command ^
    "$env:PATH = [Environment]::GetEnvironmentVariable('PATH','Machine') + ';' + [Environment]::GetEnvironmentVariable('PATH','User'); $p = (Get-Command yt-dlp -ErrorAction SilentlyContinue).Source; if ($p) { Copy-Item $p 'node_modules\yt-dlp-exec\bin\yt-dlp.exe' -Force; Write-Host 'yt-dlp OK.' } else { Write-Host '[!] yt-dlp PATH''de bulunamadi, kurulum basarisiz olabilir.' }"
echo.


echo [2.6/6] Checking ffmpeg...
where ffmpeg >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ffmpeg bulunamadi, winget ile yukleniyor...
    winget install Gyan.FFmpeg --silent --accept-package-agreements --accept-source-agreements
) else (
    echo ffmpeg mevcut.
)
if not exist "node_modules\ffmpeg-static" mkdir "node_modules\ffmpeg-static"
powershell -NoProfile -Command ^
    "$env:PATH = [Environment]::GetEnvironmentVariable('PATH','Machine') + ';' + [Environment]::GetEnvironmentVariable('PATH','User'); $p = (Get-Command ffmpeg -ErrorAction SilentlyContinue).Source; if ($p) { Copy-Item $p 'node_modules\ffmpeg-static\ffmpeg.exe' -Force; Write-Host 'ffmpeg OK.' } else { Write-Host '[!] ffmpeg PATH''de bulunamadi, kurulum basarisiz olabilir.' }"
echo.


echo [3/6] Deploying slash commands...
call node src/deploy-commands.js
if %ERRORLEVEL% NEQ 0 (
    echo [!] Command deployment error!
    pause
    exit /b %ERRORLEVEL%
)
echo.


echo [4/6] Setting up dashboard...
cd dashboard
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [!] Dashboard install error!
    cd ..
    pause
    exit /b %ERRORLEVEL%
)
call npx prisma generate --schema=../prisma/schema.prisma
cd ..
echo.

:: 5. Dashboard build
echo [5/6] Building dashboard (this may take a while)...
cd dashboard
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [!] Dashboard build error!
    cd ..
    pause
    exit /b %ERRORLEVEL%
)
cd ..
echo.

:: 6. Start with PM2
echo [6/6] Starting systems with PM2...
call pm2 -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] PM2 not found! Installing...
    call npm install -g pm2
)

echo Cleaning up and starting...
call pm2 delete all >nul 2>&1
call pm2 start ecosystem.config.js
call pm2 save

echo.
echo ====================================================
echo    SETUP COMPLETE! Bot and Panel are running.
echo ====================================================
echo.
echo Music system: yt-dlp + ffmpeg-static
echo Dashboard:    http://localhost:9931
echo.
pause
