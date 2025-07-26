# Frontend Deployment

## Heroku Setup

1. Set the Heroku remote for your frontend:

```bash
cd frontend
heroku git:remote -a medical-scheduler-client
```

2. Make sure your package.json is at the root of your frontend directory

3. Add the following buildpacks to your Heroku app:

```bash
heroku buildpacks:set heroku/nodejs
```

4. Update your package.json to include a proper start script for production:

```json
"scripts": {
  "start": "serve -s build",
  "build": "react-scripts build",
  "heroku-postbuild": "npm run build"
}
```

5. Install serve as a dependency:

```bash
npm install serve --save
```

6. Deploy by pushing your frontend code:

```bash
git subtree push --prefix frontend heroku main
```

Note: Make sure the API URL environment variable points to your Heroku backend
