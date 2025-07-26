# Clear any existing buildpacks
heroku buildpacks:clear --app medical-scheduler-client

# Set the Node.js buildpack
heroku buildpacks:set heroku/nodejs --app medical-scheduler-client

# Verify the buildpack was set correctly
heroku buildpacks --app medical-scheduler-client
