# Cloudflare Pages Deployment Script for Windows
$ErrorActionPreference = "Stop"

Write-Host "🚀 Memulai proses deployment ke Cloudflare..." -ForegroundColor Cyan

# 1. Jalankan Migrasi Database ke Remote
Write-Host "📦 Menjalankan migrasi D1 ke Remote..." -ForegroundColor Yellow
npx wrangler d1 migrations apply portofolio-db --remote --yes

# 2. Build Project
Write-Host "🏗️ Membangun project (Astro Build)..." -ForegroundColor Yellow
npm run build

# 3. Deploy ke Cloudflare Pages
Write-Host "☁️ Mengunggah ke Cloudflare Pages..." -ForegroundColor Yellow
npx wrangler pages deploy dist --project-name portofolio

Write-Host "✅ Deployment Selesai! Website Anda sudah online." -ForegroundColor Green
