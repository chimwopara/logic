#!/bin/bash

echo "🚀 AI Code Challenge Generator Setup Script"
echo "==========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your Anthropic API key"
    echo "   Get your key from: https://console.anthropic.com/"
else
    echo "✅ .env file already exists"
fi

# Copy the uploaded files if they exist
if [ -f /mnt/user-data/uploads/logicbody.html ]; then
    echo "📋 Copying logicbody.html from uploads..."
    cp /mnt/user-data/uploads/logicbody.html ./logicbody.html
fi

if [ -f /mnt/user-data/uploads/c.js ]; then
    echo "📋 Using original c.js as reference..."
    # We'll use our modified c.js that supports dynamic challenges
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your Anthropic API key"
echo "2. Run 'npm start' to start the server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Happy coding! 🎉"
