# 🚀 QUICK START GUIDE

## Step 1: Get Anthropic API Key
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Create an API key
4. Copy the key

## Step 2: Setup
```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Edit .env and add your API key
# Replace 'your_api_key_here' with your actual key
```

## Step 3: Run
```bash
npm start
```

## Step 4: Use
1. Open browser: http://localhost:3000
2. Click "New Challenge"
3. Enter a coding question
4. Select language
5. Click "Generate Challenge"
6. Solve the challenge!

## Features at a Glance

✅ **AI-Powered**: Uses Claude Haiku (cheapest model ~$0.001/request)
✅ **Star System**: Earn/spend stars, buy more for $4.99/100
✅ **History**: Track all your challenges
✅ **Multi-Language**: C, C++, Python, Java, JavaScript
✅ **Interactive**: Drag-drop code assembly interface

## Troubleshooting

**"Failed to generate challenge"**
→ Check your API key in .env

**Challenge not loading**
→ Clear browser cache, refresh page

**Stars not saving**
→ Enable localStorage in browser

## Cost Breakdown
- Claude 3 Haiku: ~$0.25 per 1M input tokens
- Average challenge: ~2000 tokens = ~$0.001
- 100 challenges ≈ $0.10

Enjoy coding! 🎯
