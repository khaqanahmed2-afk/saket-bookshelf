# Saket Pustak Kendra - Production Deployment Script (PowerShell)
# This script automates the build and deployment process for Windows

Write-Host "🚀 Saket Pustak Kendra - Production Deployment" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if backend URL is set
Write-Host "Step 1: Checking backend URL..." -ForegroundColor Yellow
if (-not $env:VITE_API_URL) {
    Write-Host "ERROR: VITE_API_URL is not set!" -ForegroundColor Red
    Write-Host "Please set it first:"
    Write-Host '  $env:VITE_API_URL="https://your-backend-url.com"'
    Write-Host ""
    Write-Host "Or create .env.production file with:"
    Write-Host "  VITE_API_URL=https://your-backend-url.com"
    exit 1
}

Write-Host "✓ Backend URL: $env:VITE_API_URL" -ForegroundColor Green
Write-Host ""

# Step 2: Install dependencies
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Build the project
Write-Host "Step 3: Building project for production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build completed successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Verify build output
Write-Host "Step 4: Verifying build output..." -ForegroundColor Yellow
if (-not (Test-Path "dist\public")) {
    Write-Host "ERROR: dist\public directory not found" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "dist\public\index.html")) {
    Write-Host "ERROR: index.html not found in dist\public" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build output verified" -ForegroundColor Green
Write-Host ""

# Step 5: Deploy to Firebase
Write-Host "Step 5: Deploying to Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Firebase deployment failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Deployed successfully to Firebase" -ForegroundColor Green
Write-Host ""

# Step 6: Success message
Write-Host "========================================" -ForegroundColor Green
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your site is now live at:"
Write-Host "  https://saketpustakkendra.in" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Visit https://saketpustakkendra.in and test"
Write-Host "  2. Check browser console for errors"
Write-Host "  3. Test API calls in Network tab"
Write-Host "  4. Validate schemas at:"
Write-Host "     https://search.google.com/test/rich-results"
Write-Host "  5. Submit sitemap to Google Search Console"
Write-Host ""
