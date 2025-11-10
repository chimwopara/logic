# AI Code Challenge Generator

An interactive web application that uses AI (Claude Haiku) to generate coding challenges in multiple programming languages. Users can solve challenges in an interactive interface and earn/spend stars based on their performance.

## Features

- 🤖 **AI-Powered Challenge Generation**: Uses Claude Haiku (Anthropic's most cost-effective model) to generate coding challenges based on user questions
- 🌟 **Star System**: 
  - Earn 1 star for completing challenges correctly
  - Challenges with >50 steps cost 1 star per step over 50
  - Purchase 100 stars for $4.99
- 📚 **Multi-Language Support**: C, C++, Python, Java, JavaScript
- 📝 **Challenge History**: Track and revisit previous challenges
- 🎯 **Interactive Solving Interface**: Based on the logicbody.html framework with drag-and-drop code assembly
- 💾 **Persistent Storage**: Saves progress and stars using localStorage

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Anthropic API key (for Claude Haiku)

### Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up your Anthropic API key**:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and add your Anthropic API key:
     ```
     ANTHROPIC_API_KEY=your_actual_api_key_here
     ```
   - Get your API key from: https://console.anthropic.com/

4. **Start the server**:
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   - Open your browser and go to: `http://localhost:3000`

## How to Use

### Creating a New Challenge

1. Click "➕ New Challenge" in the sidebar
2. Enter your coding question (e.g., "Write a function to calculate factorial")
3. Select the programming language
4. Choose difficulty level
5. Click "🚀 Generate Challenge"
6. The AI will create an interactive challenge that opens in the right panel

### Solving Challenges

- The challenge appears in the logicbody.html interface
- Drag and drop code lines in the correct order
- Use hints if needed (shows the explanation for each line)
- Complete the challenge to earn stars
- Challenges with many steps may cost stars

### Star System

- **Starting Stars**: New users begin with 10 stars
- **Earning Stars**: Complete challenges correctly (+1 star)
- **Spending Stars**: Challenges with >50 steps cost 1 star per extra step
- **Buying Stars**: Purchase 100 stars for $4.99 (simulated in demo)

### Viewing History

- The left sidebar shows your recent challenges
- Click any history item to reload that challenge
- History is preserved using localStorage

## File Structure

```
project/
├── index.html          # Main application interface
├── app.js             # Frontend JavaScript logic
├── server.js          # Express server with AI integration
├── logicbody.html     # Interactive challenge solving interface
├── c.js               # Dynamic challenge loader
├── package.json       # Node.js dependencies
├── .env.example       # Environment variables template
└── README.md          # This file
```

## API Integration

The application uses Claude 3 Haiku (claude-3-haiku-20240307) for generating challenges. This is Anthropic's most cost-effective model, perfect for this use case.

### API Costs (Approximate)
- Claude 3 Haiku: ~$0.25 per million input tokens, ~$1.25 per million output tokens
- Average challenge generation: ~0.001 USD per request

## Payment Integration

The current implementation includes a simulated payment system. For production deployment, integrate with:
- Stripe
- PayPal
- Square
- Or any other payment gateway

## Customization

### Modifying Themes
Edit the CSS variables in `index.html` and `logicbody.html` to change colors and styling.

### Adding Languages
1. Update the language select options in `index.html`
2. Modify the `languageMap` in `server.js`
3. Add language-specific templates in the `getFallbackChallenge` function

### Adjusting Star Economics
Modify these values in `app.js`:
- Starting stars: Line with `let stars = parseInt(localStorage.getItem('userStars') || '10');`
- Step threshold: Line checking `if (stepCount > 50)`
- Purchase amount: Line with `stars += 100;`

## Troubleshooting

### "Failed to generate challenge"
- Check your Anthropic API key in `.env`
- Verify internet connection
- Check server console for error messages

### Challenge not loading
- Clear browser cache and localStorage
- Ensure all files are in the correct location
- Check browser console for errors

### Stars not updating
- localStorage might be disabled in your browser
- Try a different browser or incognito mode

## Security Notes

- **Never commit your `.env` file** with real API keys
- Use environment variables for production deployment
- Implement proper authentication for production use
- Add rate limiting to prevent API abuse
- Validate and sanitize all user inputs

## Future Enhancements

- Real payment gateway integration
- User accounts with cloud storage
- Social features (share challenges, leaderboards)
- More programming languages
- Code execution and validation
- Difficulty progression system
- Achievement badges
- Multi-step tutorials

## License

MIT License - Feel free to modify and use for your projects!

## Support

For issues or questions, please check the troubleshooting section or create an issue in the project repository.
