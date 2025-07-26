# Set environment variables properly for Windows
$env:NODE_ENV = "production"
$env:GENERATE_SOURCEMAP = "false"

# Run the build
npm run build

# Serve the production build locally
npx serve -s build
