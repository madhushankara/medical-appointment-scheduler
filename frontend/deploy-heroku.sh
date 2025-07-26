#!/bin/bash

# Build the app for production
npm run build

# Clear existing Heroku app
echo "Clearing existing Heroku application..."
heroku builds:clear --app medical-scheduler-client

# Ensure proper buildpack
echo "Setting Node.js buildpack..."
heroku buildpacks:clear --app medical-scheduler-client
heroku buildpacks:set heroku/nodejs --app medical-scheduler-client

# Deploy to Heroku
echo "Deploying to Heroku..."
git add .
git commit -m "Production-ready deployment"
git push heroku main -f

# Open the app
echo "Opening app..."
heroku open --app medical-scheduler-client

echo "Deployment complete!"
