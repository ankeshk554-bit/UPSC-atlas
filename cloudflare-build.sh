#!/bin/bash

# Cloudflare Pages build script
echo "Installing dependencies..."
npm ci

echo "Building with Vite..."
npm run build

echo "Build completed successfully!"
