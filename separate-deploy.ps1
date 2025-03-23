# Delete the integrated app
Write-Host "Deleting integrated app..." -ForegroundColor Red
heroku apps:destroy --app medical-scheduler-app --confirm medical-scheduler-app

# Create separate apps for frontend and backend
Write-Host "Creating backend app..." -ForegroundColor Green
heroku create medical-scheduler-api

Write-Host "Creating frontend app..." -ForegroundColor Green
heroku create medical-scheduler-client

# Configure backend app
Write-Host "Setting up backend environment..." -ForegroundColor Green
heroku buildpacks:set heroku/go --app medical-scheduler-api
heroku addons:create heroku-postgresql:mini-dev --app medical-scheduler-api
heroku config:set DB_TYPE=postgres --app medical-scheduler-api
heroku config:set JWT_SECRET=jwt_secret_971a3c8e4d72f59b8e1c0a5b6d8e7f2a --app medical-scheduler-api
heroku config:set HUGGINGFACE_TOKEN=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 --app medical-scheduler-api
heroku config:set PORT=8080 --app medical-scheduler-api

# Configure frontend app
Write-Host "Setting up frontend environment..." -ForegroundColor Green
heroku buildpacks:set heroku/nodejs --app medical-scheduler-client
heroku config:set NODE_ENV=production --app medical-scheduler-client
heroku config:set NPM_CONFIG_PRODUCTION=true --app medical-scheduler-client
heroku config:set REACT_APP_API_URL=https://medical-scheduler-api.herokuapp.com/api --app medical-scheduler-client
heroku config:set REACT_APP_EMAILJS_PUBLIC_KEY=Zz0gh57bJE9NCCZsv --app medical-scheduler-client
heroku config:set REACT_APP_EMAILJS_SERVICE_ID=service_780diqb --app medical-scheduler-client
heroku config:set REACT_APP_EMAILJS_TEMPLATE_APPOINTMENT=template_w4wezob --app medical-scheduler-client
heroku config:set REACT_APP_EMAILJS_TEMPLATE_REGISTRATION=template_c23sb4o --app medical-scheduler-client

# Deploy backend
Write-Host "Deploying backend..." -ForegroundColor Green
cd backend
git init
git add .
git commit -m "Deploy backend to Heroku"
heroku git:remote -a medical-scheduler-api
git push heroku master -f
cd ..

# Deploy frontend
Write-Host "Deploying frontend..." -ForegroundColor Green
cd frontend
git init
git add .
git commit -m "Deploy frontend to Heroku"
heroku git:remote -a medical-scheduler-client
git push heroku master -f
cd ..

Write-Host "Deployment completed! Opening apps..." -ForegroundColor Green
heroku open --app medical-scheduler-api
heroku open --app medical-scheduler-client
