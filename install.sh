#!/bin/bash
# Installation Script for AI Code Challenge Generator

echo "Installing AI Code Challenge Generator..."
echo "========================================"

# Install Node.js dependencies
echo "Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit the .env file and add your Anthropic API key!"
    echo "   Get your key from: https://console.anthropic.com/"
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "To start the application:"
echo "  npm start"
echo ""
echo "Then open: http://localhost:3000"
