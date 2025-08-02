#!/bin/bash

# Build script for Open Access Policies site
# This script builds the Jekyll site and handles the portfolio compilation

echo "🚀 Building Open Access Policies site..."

# Check if bundle is available
if ! command -v bundle &> /dev/null; then
    echo "❌ Bundler not found. Please install Ruby and Bundler first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
bundle install

# Build the site
echo "🔨 Building Jekyll site..."
bundle exec jekyll build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "🌐 Site built to _site/ directory"
    echo ""
    echo "To serve locally, run:"
    echo "bundle exec jekyll serve"
else
    echo "❌ Build failed!"
    exit 1
fi
