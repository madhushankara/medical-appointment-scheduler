# Heroku Deployment Steps

After making the changes to the configuration files, follow these steps:

1. Run the buildpack fix script:
   ```
   ./fix-deployment.ps1
   ```

2. Commit and push your changes:
   ```
   git add .
   git commit -m "Fix Heroku deployment configuration"
   git push heroku master -f
   ```

3. If the above push fails, try pushing to a specific branch:
   ```
   git push heroku master:main -f
   ```

4. Monitor the build logs:
   ```
   heroku logs --tail --app medical-scheduler-client
   ```

5. Once deployed, open the app:
   ```
   heroku open --app medical-scheduler-client
   ```

6. If you see any static file-related issues, run:
   ```
   heroku buildpacks:add heroku-community/static --app medical-scheduler-client
   ```

7. If you still have issues with the React routing, make sure the static.json file is correctly located in the root directory.
