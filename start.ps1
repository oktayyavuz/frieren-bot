# Frieren Bot - PowerShell Startup Script
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "✨ Frieren Bot - Otomatik Kurulum ve Baslatma ✨" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Bağımlılıkları kontrol et ve kur
Write-Host "[1/6] Ana proje bagimliliklari kontrol ediliyor..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] npm install hatasi!" -ForegroundColor Red
    pause
    exit $LASTEXITCODE
}

# 2. Veritabanı yapılandırması
Write-Host "[2/6] Veritabani (Prisma) yapilandiriliyor..." -ForegroundColor Yellow
npx prisma generate
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Prisma yapilandirma hatasi!" -ForegroundColor Red
    pause
    exit $LASTEXITCODE
}

# 3. Slash Komutlarını Dağıt
Write-Host "[3/6] Slash komutlari Discord'a gonderiliyor..." -ForegroundColor Yellow
node src/deploy-commands.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Komut dagitim hatasi!" -ForegroundColor Red
    pause
    exit $LASTEXITCODE
}

# 4. Dashboard Bağımlılıkları Kur
Write-Host "[4/6] Web panel bagimliliklari kuruluyor..." -ForegroundColor Yellow
Set-Location dashboard
npx prisma generate
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Dashboard npm install hatasi!" -ForegroundColor Red
    Set-Location ..
    pause
    exit $LASTEXITCODE
}

# 5. Dashboard Build
Write-Host "[5/6] Web panel build ediliyor (Bu biraz zaman alabilir)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Dashboard build hatasi!" -ForegroundColor Red
    Set-Location ..
    pause
    exit $LASTEXITCODE
}
Set-Location ..

# 6. PM2 ile Başlat
Write-Host "[6/6] PM2 ile sistemler baslatiliyor..." -ForegroundColor Yellow
# PM2 kontrolü
if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
    Write-Host "[!] PM2 kurulu degil! Kuruluyor..." -ForegroundColor Magenta
    npm install -g pm2
}

# Durdurma ve Yeniden Başlatma
Write-Host "[!] Mevcut PM2 surecleri temizleniyor..." -ForegroundColor Magenta
pm2 delete all 2>$null
pm2 start ecosystem.config.js
pm2 save

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "✅ KURULUM TAMAMLANDI!" -ForegroundColor Green
Write-Host "🚀 Bot ve Panel arka planda calisiyor." -ForegroundColor Green
Write-Host ""
Write-Host "Yonetim Komutlari:"
Write-Host "- pm2 list          : Durumlari gorun"
Write-Host "- pm2 logs          : Loglari izleyin"
Write-Host "- pm2 stop all      : Her seyi durdurun"
Write-Host "====================================================" -ForegroundColor Green

Read-Host "Kapatmak icin Enter tusuna basin..."
