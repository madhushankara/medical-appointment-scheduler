# Build production app
Write-Host "Building production app..." -ForegroundColor Green
$env:NODE_ENV = "production"
$env:GENERATE_SOURCEMAP = "false"
npm run build

# Clear Heroku cache
Write-Host "Clearing Heroku cache..." -ForegroundColor Green
heroku builds:clear --app medical-scheduler-client

# Set proper buildpack
Write-Host "Setting Node.js buildpack..." -ForegroundColor Green
heroku buildpacks:clear --app medical-scheduler-client
heroku buildpacks:set heroku/nodejs --app medical-scheduler-client

# IMPORTANT: Force production mode on Heroku
Write-Host "Setting production environment variables..." -ForegroundColor Green
heroku config:set NODE_ENV=production --app medical-scheduler-client
heroku config:set NPM_CONFIG_PRODUCTION=true --app medical-scheduler-client

# Deploy to Heroku
Write-Host "Deploying to Heroku..." -ForegroundColor Green
git add .
git commit -m "Deploy production build"
heroku git:remote -a medical-scheduler-client
git push heroku master -f

# Open app
Write-Host "Opening application..." -ForegroundColor Green
heroku open --app medical-scheduler-client
