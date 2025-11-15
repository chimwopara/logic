const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Serial number routing - serve challenge by serial
app.get('/:serial', (req, res) => {
    const serial = req.params.serial;
    
    // Check if it's a valid 6-character alphanumeric serial
    if (/^[a-z0-9]{6}$/.test(serial)) {
        // Serve index.html with serial parameter
        // The frontend will load the challenge from localStorage/database
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        // Not a serial, treat as normal route
        res.status(404).send('Page not found');
    }
});

// API endpoint to generate challenges
app.post('/api/generate-challenge', async (req, res) => {
    const { question, language, difficulty, isCustomLanguage } = req.body;
    
    try {
        // Call Claude API to generate challenge
        const challenge = await generateChallengeFromAI(question, language, difficulty, isCustomLanguage);
        
        res.json({
            success: true,
            challenge: challenge
        });
    } catch (error) {
        console.error('Error generating challenge:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate challenge',
            message: error.message
        });
    }
});

// API endpoint to track line usage
app.post('/api/track-lines', async (req, res) => {
    const { userId, challengeSerial, linesUsed, challengeCompleted } = req.body;
    
    try {
        // In production, this would update database
        // For now, we'll just log it
        console.log('Line usage:', { userId, challengeSerial, linesUsed, challengeCompleted });
        
        // Update challenge stats
        // This would increment timesUsed and credit creator
        
        res.json({
            success: true,
            message: 'Lines tracked successfully'
        });
    } catch (error) {
        console.error('Error tracking lines:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track lines'
        });
    }
});

// API endpoint to get challenge by serial
app.get('/api/challenge/:serial', (req, res) => {
    const { serial } = req.params;
    
    // In production, query database for challenge
    // For now, return from localStorage (frontend handles this)
    
    res.json({
        success: true,
        serial: serial,
        message: 'Challenge data should be loaded from frontend store'
    });
});

// API endpoint to get daily challenge
app.get('/api/daily-challenge', (req, res) => {
    // In production, this would:
    // 1. Check date
    // 2. Return today's challenge from database
    // 3. Generate new one if needed
    
    res.json({
        success: true,
        message: 'Daily challenge managed by frontend for now'
    });
});

// API endpoint to submit daily challenge completion
app.post('/api/daily-challenge/complete', async (req, res) => {
    const { userId, username, completionTime, linesUsed } = req.body;
    
    try {
        // In production:
        // 1. Verify completion is valid
        // 2. Update leaderboard in database
        // 3. Update user's streak
        // 4. Award lines
        
        console.log('Daily challenge completed:', { userId, username, completionTime, linesUsed });
        
        res.json({
            success: true,
            rank: Math.floor(Math.random() * 100) + 1, // Mock rank
            linesAwarded: 110 // Mock reward
        });
    } catch (error) {
        console.error('Error submitting daily challenge:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit completion'
        });
    }
});

// Generate challenge using Claude API
async function generateChallengeFromAI(question, language, difficulty, isCustomLanguage) {
    const API_KEY = process.env.ANTHROPIC_API_KEY;
    
    if (!API_KEY) {
        throw new Error('ANTHROPIC_API_KEY not configured');
    }
    
    // Language-specific instructions
    const languageInstructions = getLanguageInstructions(language);
    
    const prompt = `You are an expert coding instructor creating an interactive coding challenge.

Generate a step-by-step coding challenge in ${language} for the following problem:
"${question}"

Difficulty: ${difficulty}

${languageInstructions}

Create a challenge with these requirements:
1. Break the solution into ${getDifficultySteps(difficulty)} logical steps
2. Each step should have:
   - The correct code line
   - 2 incorrect alternatives (distractors) with explanations why they're wrong
   - An explanation of why the correct answer is right
   - Proper indentation level (0, 1, 2, etc.)

Format your response EXACTLY as this JSON structure:
{
  "goal": "Clear description of what the code does",
  "concepts": "Key programming concepts covered",
  "language": "${language}",
  "sequence": [
    {
      "correct": "the correct code line",
      "distractors": [
        {"text": "incorrect option 1", "reason": "why this is wrong"},
        {"text": "incorrect option 2", "reason": "why this is wrong"}
      ],
      "indent": 0,
      "explanation": "why the correct answer is right"
    }
  ]
}

Make sure:
- Distractors are plausible but clearly wrong
- Explanations are educational and concise
- Code follows ${language} syntax and best practices
- Steps build logically toward the solution
- Indentation is appropriate for ${language}

Return ONLY the JSON, no other text.`;
    
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 4096,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.content[0].text;
        
        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }
        
        const challenge = JSON.parse(jsonMatch[0]);
        
        // Validate challenge structure
        if (!challenge.sequence || !Array.isArray(challenge.sequence)) {
            throw new Error('Invalid challenge structure');
        }
        
        return challenge;
        
    } catch (error) {
        console.error('Error calling Claude API:', error);
        
        // Return fallback challenge
        return getFallbackChallenge(question, language, difficulty);
    }
}

// Get language-specific instructions
function getLanguageInstructions(language) {
    const instructions = {
        'python': 'Use Python syntax: def, indentation (4 spaces), no semicolons',
        'javascript': 'Use JavaScript syntax: function, let/const, semicolons optional',
        'java': 'Use Java syntax: public class, static, semicolons required',
        'c': 'Use C syntax: #include, int main(), semicolons required',
        'c++': 'Use C++ syntax: #include <iostream>, using namespace std, cout',
        'typescript': 'Use TypeScript syntax: function, type annotations, interfaces',
        'go': 'Use Go syntax: func, := for declarations, no semicolons',
        'rust': 'Use Rust syntax: fn, let mut, ownership concepts',
        'swift': 'Use Swift syntax: func, var/let, no semicolons',
        'kotlin': 'Use Kotlin syntax: fun, val/var, no semicolons',
        'ruby': 'Use Ruby syntax: def, no semicolons, end keyword',
        'php': 'Use PHP syntax: function, $variables, semicolons required',
        'r': 'Use R syntax: function(), <- assignment, vectors',
        'sql': 'Use SQL syntax: SELECT, FROM, WHERE, JOIN',
        'bash': 'Use Bash syntax: #!/bin/bash, variables with $',
        'html': 'Use HTML syntax: proper tag nesting, semantic HTML5',
        'css': 'Use CSS syntax: selectors, properties, values',
        'react': 'Use React/JSX syntax: components, hooks, props'
    };
    
    return instructions[language.toLowerCase()] || `Use ${language} syntax and best practices`;
}

// Get number of steps based on difficulty
function getDifficultySteps(difficulty) {
    const steps = {
        'easy': '5-8',
        'medium': '10-15',
        'hard': '15-25'
    };
    return steps[difficulty] || '10-15';
}

// Fallback challenge if API fails
function getFallbackChallenge(question, language, difficulty) {
    return {
        goal: `Solve: ${question}`,
        concepts: "Basic programming concepts",
        language: language,
        sequence: [
            {
                correct: `// ${question}`,
                distractors: [
                    { text: '/* comment */', reason: 'Wrong comment style for single line' },
                    { text: '# comment', reason: 'This is Python-style comment' }
                ],
                indent: 0,
                explanation: 'Start with a comment describing the problem'
            },
            {
                correct: 'function solution() {',
                distractors: [
                    { text: 'def solution():', reason: 'This is Python syntax, not ' + language },
                    { text: 'void solution() {', reason: 'Should return a value' }
                ],
                indent: 0,
                explanation: 'Define the main function'
            },
            {
                correct: '    // Implementation goes here',
                distractors: [
                    { text: 'implementation', reason: 'Not valid code' },
                    { text: '/* implement */', reason: 'Wrong comment style' }
                ],
                indent: 1,
                explanation: 'Add implementation logic'
            },
            {
                correct: '}',
                distractors: [
                    { text: 'end;', reason: language + ' uses braces, not end keyword' },
                    { text: '};', reason: 'No semicolon after function closing brace' }
                ],
                indent: 0,
                explanation: 'Close the function'
            }
        ]
    };
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Serial number routing enabled: localhost:${PORT}/{serial}`);
    console.log(`🎯 Example: localhost:${PORT}/a3k9m2`);
});
