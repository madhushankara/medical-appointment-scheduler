# Comprehensive deployment script for separate frontend and backend with full deployment steps

# 1. Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $herokuVersion = heroku --version
    Write-Host "✓ Heroku CLI detected: $herokuVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Heroku CLI not found! Please install it first." -ForegroundColor Red
    exit 1
}
try {
    $gitVersion = git --version
    Write-Host "✓ Git detected: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git not found! Please install it first." -ForegroundColor Red
    exit 1
}
try {
    $herokuAccount = heroku whoami
    Write-Host "✓ Logged in as: $herokuAccount" -ForegroundColor Green
} catch {
    Write-Host "✗ Not logged into Heroku! Please run 'heroku login' first." -ForegroundColor Yellow
    exit 1
}

# 2. (Optional) Delete existing apps 
$confirmDelete = Read-Host "Do you want to delete existing Heroku apps? (y/N)"
if ($confirmDelete -eq "y" -or $confirmDelete -eq "Y") {
    Write-Host "Deleting existing apps..." -ForegroundColor Yellow
    heroku apps:destroy --app medical-scheduler-api --confirm medical-scheduler-api
    heroku apps:destroy --app medical-scheduler-client --confirm medical-scheduler-client
}

# 3. App configuration and creation
$backendAppName = "medical-scheduler-api"
$frontendAppName = "medical-scheduler-client"
$backendUrl = "https://$backendAppName.herokuapp.com/api"

Write-Host "`nDeployment Configuration:" -ForegroundColor Cyan
Write-Host "- Backend App: $backendAppName" -ForegroundColor White
Write-Host "- Frontend App: $frontendAppName" -ForegroundColor White
Write-Host "- API URL: $backendUrl" -ForegroundColor White

$confirm = Read-Host "`nDo you want to proceed with deployment? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Deployment canceled." -ForegroundColor Yellow
    exit 0
}

Write-Host "`nChecking if Heroku apps exist..." -ForegroundColor Yellow
$backendExists = $false
try { heroku apps:info --app $backendAppName | Out-Null; $backendExists = $true; Write-Host "✓ Backend app exists" -ForegroundColor Green } catch { Write-Host "Backend app does not exist. Will create it." -ForegroundColor Yellow }
$frontendExists = $false
try { heroku apps:info --app $frontendAppName | Out-Null; $frontendExists = $true; Write-Host "✓ Frontend app exists" -ForegroundColor Green } catch { Write-Host "Frontend app does not exist. Will create it." -ForegroundColor Yellow }

if (-not $backendExists) {
    Write-Host "`nCreating backend app..." -ForegroundColor Yellow
    heroku create $backendAppName --buildpack heroku/go
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to create backend app. Exiting." -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Backend app created successfully" -ForegroundColor Green
}
if (-not $frontendExists) {
    Write-Host "`nCreating frontend app..." -ForegroundColor Yellow
    heroku create $frontendAppName --buildpack heroku/nodejs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to create frontend app. Exiting." -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Frontend app created successfully" -ForegroundColor Green
}

# 4. Configure backend
Write-Host "`nConfiguring backend app..." -ForegroundColor Yellow
try {
    heroku addons:info postgresql --app $backendAppName | Out-Null
    Write-Host "✓ PostgreSQL addon already exists" -ForegroundColor Green
} catch {
    Write-Host "Adding PostgreSQL addon..." -ForegroundColor Yellow
    heroku addons:create heroku-postgresql:mini-dev --app $backendAppName
    if ($LASTEXITCODE -eq 0) { Write-Host "✓ PostgreSQL addon added successfully" -ForegroundColor Green } else { Write-Host "Warning: Failed to add PostgreSQL addon." -ForegroundColor Yellow }
}
Write-Host "Setting backend environment variables..." -ForegroundColor Yellow
heroku config:set NODE_ENV=production --app $backendAppName
heroku config:set DB_TYPE=postgres --app $backendAppName
heroku config:set JWT_SECRET=jwt_secret_971a3c8e4d72f59b8e1c0a5b6d8e7f2a --app $backendAppName
heroku config:set HUGGINGFACE_TOKEN=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 --app $backendAppName
heroku config:set PORT=8080 --app $backendAppName
Write-Host "✓ Backend environment configured" -ForegroundColor Green

# 5. Configure frontend
Write-Host "`nConfiguring frontend app..." -ForegroundColor Yellow
heroku config:set NODE_ENV=production --app $frontendAppName
heroku config:set NPM_CONFIG_PRODUCTION=true --app $frontendAppName
heroku config:set REACT_APP_API_URL=$backendUrl --app $frontendAppName
heroku config:set REACT_APP_DEBUG_MODE=false --app $frontendAppName
heroku config:set REACT_APP_EMAILJS_PUBLIC_KEY=Zz0gh57bJE9NCCZsv --app $frontendAppName
heroku config:set REACT_APP_EMAILJS_SERVICE_ID=service_780diqb --app $frontendAppName
heroku config:set REACT_APP_EMAILJS_TEMPLATE_APPOINTMENT=template_w4wezob --app $frontendAppName
heroku config:set REACT_APP_EMAILJS_TEMPLATE_REGISTRATION=template_c23sb4o --app $frontendAppName
Write-Host "✓ Frontend environment configured" -ForegroundColor Green

# 6. Create Procfile for backend
Write-Host "`nCreating/updating backend Procfile..." -ForegroundColor Yellow
Set-Content -Path "backend\Procfile" -Value "web: go run cmd/server/main.go"
Write-Host "✓ Backend Procfile created" -ForegroundColor Green

# 7. Build frontend for production
Write-Host "`nBuilding frontend for production..." -ForegroundColor Cyan
Set-Location frontend
$env:REACT_APP_API_URL = $backendUrl
$env:NODE_ENV = "production"
$env:GENERATE_SOURCEMAP = "false"
npm run build
Set-Location ..

# 8. Deploy backend
Write-Host "`nDeploying backend..." -ForegroundColor Cyan
Set-Location backend
git init
git add .
git commit -m "Deploy backend to Heroku" || echo No changes to commit
git remote remove heroku 2>nul
git remote add heroku "https://git.heroku.com/$backendAppName.git"
git push heroku master -f
Set-Location $originalLocation

# 9. Deploy frontend
Write-Host "`nDeploying frontend..." -ForegroundColor Cyan
Set-Location frontend
git init
git add .
git commit -m "Deploy frontend to Heroku" || echo No changes to commit
git remote remove heroku 2>nul
git remote add heroku "https://git.heroku.com/$frontendAppName.git"
git push heroku master -f
Set-Location $originalLocation

# 10. Restore original git repo if it existed
if (Test-Path .git.bak) {
    Write-Host "`nRestoring original git repository..." -ForegroundColor Yellow
    if (Test-Path .git) { rmdir /s /q .git }
    Rename-Item .git.bak .git
    Write-Host "✓ Original git repository restored" -ForegroundColor Green
}

# 11. Display results and open apps
Write-Host "`n=======================================================" -ForegroundColor Green
Write-Host "   Deployment Complete!" -ForegroundColor Green 
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "Backend URL: https://$backendAppName.herokuapp.com" -ForegroundColor Cyan
Write-Host "Frontend URL: https://$frontendAppName.herokuapp.com" -ForegroundColor Cyan
Write-Host "API Endpoint: $backendUrl" -ForegroundColor Cyan

$openApps = Read-Host "`nDo you want to open the deployed apps in your browser? (Y/n)"
if ($openApps -ne "n" -and $openApps -ne "N") {
    Write-Host "Opening applications in your browser..." -ForegroundColor Yellow
    heroku open --app $backendAppName
    heroku open --app $frontendAppName
}

Write-Host "`nThank you for using the Medical Scheduler Deployment Script!" -ForegroundColor Cyan
