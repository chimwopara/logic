const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Store for serving modified logicbody.html
let modifiedLogicBody = null;

// Read the original logicbody.html
const fs = require('fs');
const originalLogicBody = fs.readFileSync(path.join(__dirname, 'logicbody.html'), 'utf8');

// API endpoint to generate challenge using Claude Haiku
app.post('/api/generate-challenge', async (req, res) => {
    const { question, language, difficulty, isCustomLanguage } = req.body;
    
    try {
        // Generate the challenge using Claude Haiku API
        const challenge = await generateChallengeWithAI(question, language, difficulty, isCustomLanguage);
        res.json({ challenge });
    } catch (error) {
        console.error('Error generating challenge:', error);
        res.status(500).json({ error: 'Failed to generate challenge' });
    }
});

// Function to call Claude Haiku API
async function generateChallengeWithAI(question, language, difficulty, isCustomLanguage) {
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'YOUR_API_KEY_HERE';
    
    // Comprehensive language mapping
    const languageMap = {
        // Popular Languages
        'python': 'Python',
        'javascript': 'JavaScript',
        'java': 'Java',
        'typescript': 'TypeScript',
        'c': 'C',
        'cpp': 'C++',
        'csharp': 'C#',
        'go': 'Go',
        'rust': 'Rust',
        'swift': 'Swift',
        'kotlin': 'Kotlin',
        'ruby': 'Ruby',
        'php': 'PHP',
        'r': 'R',
        'sql': 'SQL',
        'bash': 'Bash/Shell Script',
        'perl': 'Perl',
        'scala': 'Scala',
        'dart': 'Dart',
        'lua': 'Lua',
        // Web Languages
        'html': 'HTML',
        'css': 'CSS',
        'react': 'React/JSX',
        'vue': 'Vue',
        // Other Languages
        'matlab': 'MATLAB',
        'haskell': 'Haskell',
        'elixir': 'Elixir',
        'julia': 'Julia',
        'cobol': 'COBOL',
        'fortran': 'Fortran'
    };
    
    // Language-specific examples for better prompting
    const languageExamples = {
        'python': 'Use def, print(), if/elif/else, proper indentation (4 spaces), no semicolons',
        'javascript': 'Use function/const/let, console.log(), {}, semicolons optional but preferred',
        'java': 'Use public class, public static void main, System.out.println, semicolons required',
        'typescript': 'Use type annotations, interfaces, function/const/let, console.log()',
        'c': 'Use #include <stdio.h>, int main(), printf, return 0, semicolons required',
        'cpp': 'Use #include <iostream>, using namespace std, cout <<, return 0',
        'csharp': 'Use using System, class Program, static void Main, Console.WriteLine',
        'go': 'Use package main, import "fmt", func main(), fmt.Println()',
        'rust': 'Use fn main(), println!(), let mut for mutable variables, semicolons',
        'swift': 'Use func, print(), var/let, no semicolons needed',
        'kotlin': 'Use fun main(), println(), val/var, no semicolons needed',
        'ruby': 'Use def/end, puts/print, no semicolons, blocks with do/end',
        'php': 'Use <?php ?>, echo/print, $ for variables, semicolons required',
        'r': 'Use <- for assignment, print(), function(), no semicolons needed',
        'sql': 'Use SELECT, FROM, WHERE, JOIN, GROUP BY, semicolons to end statements',
        'bash': 'Use #!/bin/bash, echo, if/then/fi, for/do/done, no semicolons in new lines',
        'perl': 'Use print, sub for functions, $ for scalars, @ for arrays, semicolons',
        'scala': 'Use def, println, val/var, optional semicolons',
        'dart': 'Use void main(), print(), var/final/const, semicolons required',
        'lua': 'Use function/end, print(), local for variables, no semicolons',
        'html': 'Use proper tags like <html>, <body>, <div>, <p>, proper nesting',
        'css': 'Use selectors, properties with colons, semicolons after each property',
        'react': 'Use JSX syntax, components, useState/useEffect hooks, export default',
        'vue': 'Use <template>, <script>, <style> sections, export default',
        'matlab': 'Use function/end, disp(), % for comments, semicolons suppress output',
        'haskell': 'Use pure functions, :: for type signatures, where clauses',
        'elixir': 'Use def/defmodule, IO.puts, pattern matching, pipe operator |>',
        'julia': 'Use function/end, println(), no semicolons needed',
        'cobol': 'Use DIVISION sections, DISPLAY, proper column formatting',
        'fortran': 'Use PROGRAM/END PROGRAM, PRINT *, proper column formatting'
    };
    
    const displayLanguage = isCustomLanguage ? language : (languageMap[language] || language);
    const examples = isCustomLanguage ? 
        'Use appropriate syntax for ' + language : 
        (languageExamples[language] || 'Use appropriate syntax for this language');
    
    const prompt = `Generate a coding challenge in the exact format shown below for the following:
Question: ${question}
Language: ${displayLanguage}
Difficulty: ${difficulty}
${isCustomLanguage ? 'Note: This is a custom/specialized language, so make reasonable assumptions about its syntax based on similar languages.' : ''}

Create a challenge object with this EXACT structure adapted for ${displayLanguage}:
{
    "goal": "Clear description of what the code should accomplish",
    "concepts": "List of programming concepts used",
    "language": "${displayLanguage}",
    "sequence": [
        {
            "correct": "exact code line here",
            "distractors": [
                {
                    "text": "wrong option 1",
                    "reason": "detailed explanation why this is wrong for ${displayLanguage}"
                },
                {
                    "text": "wrong option 2", 
                    "reason": "detailed explanation why this is wrong for ${displayLanguage}"
                }
            ],
            "indent": 0,
            "explanation": "What this line does - this serves as the hint"
        }
    ]
}

Language-specific requirements for ${displayLanguage}:
${examples}

Important requirements:
1. Each step in sequence should be a single line of code
2. Include proper indentation levels (0, 1, 2, etc.)
3. Provide 2 realistic distractors for each correct answer
4. Explanations should be educational and helpful
5. For ${displayLanguage}, use appropriate syntax and conventions
6. Break down the solution into logical steps (aim for 5-15 steps for most problems)
7. Include all necessary imports/includes/headers at the beginning
8. Keep the solution concise but complete
9. The explanation field serves as the hint that users can see if they need help
10. Distractors should be plausible mistakes for ${displayLanguage} specifically
11. Make sure the code would actually work in ${displayLanguage}

Respond with ONLY the JSON object, no additional text.`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307', // Cheapest Claude model
                max_tokens: 2000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.content[0].text;
        
        // Parse the JSON response
        const challenge = JSON.parse(content);
        
        // Validate the structure
        if (!challenge.goal || !challenge.concepts || !Array.isArray(challenge.sequence)) {
            throw new Error('Invalid challenge structure');
        }
        
        return challenge;
        
    } catch (error) {
        console.error('Error calling Claude API:', error);
        // Return a fallback challenge if API fails
        return getFallbackChallenge(language, question);
    }
}

// Fallback challenge generator (comprehensive templates)
function getFallbackChallenge(language, question) {
    const templates = {
        'c': {
            goal: question || "Print 'Hello World' to the console",
            concepts: "Basic I/O, main function",
            language: "C",
            sequence: [
                { correct: '#include <stdio.h>', distractors: [{ text: '#include <stdlib.h>', reason: 'Need stdio.h for printf' }], indent: 0, explanation: "Include standard I/O library" },
                { correct: 'int main() {', distractors: [{ text: 'void main() {', reason: 'Standard C requires main to return int' }], indent: 0, explanation: "Main function" },
                { correct: 'printf("Hello World\\n");', distractors: [{ text: 'print("Hello World");', reason: 'C uses printf' }], indent: 1, explanation: "Print message" },
                { correct: 'return 0;', distractors: [{ text: 'return 1;', reason: '0 indicates success' }], indent: 1, explanation: "Return success" },
                { correct: '}', distractors: [{ text: 'end;', reason: 'C uses braces' }], indent: 0, explanation: "Close main" }
            ]
        },
        'python': {
            goal: question || "Print 'Hello World' to the console",
            concepts: "Basic output, functions",
            language: "Python",
            sequence: [
                { correct: 'def main():', distractors: [{ text: 'function main():', reason: 'Python uses def' }], indent: 0, explanation: "Define main function" },
                { correct: '    print("Hello World")', distractors: [{ text: 'print "Hello World"', reason: 'Python 3 needs parentheses' }], indent: 1, explanation: "Print message" },
                { correct: '', distractors: [{ text: 'pass', reason: 'Not needed here' }], indent: 0, explanation: "Empty line" },
                { correct: 'if __name__ == "__main__":', distractors: [{ text: 'if __name__ == "main":', reason: 'Should be __main__' }], indent: 0, explanation: "Check if script runs directly" },
                { correct: '    main()', distractors: [{ text: 'main', reason: 'Need parentheses to call' }], indent: 1, explanation: "Call main" }
            ]
        },
        'javascript': {
            goal: question || "Print 'Hello World' to the console",
            concepts: "Console output, functions",
            language: "JavaScript",
            sequence: [
                { correct: 'function main() {', distractors: [{ text: 'def main() {', reason: 'JavaScript uses function' }], indent: 0, explanation: "Define function" },
                { correct: '    console.log("Hello World");', distractors: [{ text: 'print("Hello World");', reason: 'JavaScript uses console.log' }], indent: 1, explanation: "Output to console" },
                { correct: '}', distractors: [{ text: '};', reason: 'No semicolon after function brace' }], indent: 0, explanation: "Close function" },
                { correct: '', distractors: [{ text: 'break;', reason: 'Not needed here' }], indent: 0, explanation: "Empty line" },
                { correct: 'main();', distractors: [{ text: 'main', reason: 'Need parentheses to call' }], indent: 0, explanation: "Call function" }
            ]
        },
        'r': {
            goal: question || "Print 'Hello World' to the console",
            concepts: "Basic output, functions",
            language: "R",
            sequence: [
                { correct: 'main <- function() {', distractors: [{ text: 'main = function() {', reason: 'R convention uses <-' }], indent: 0, explanation: "Define function" },
                { correct: '  print("Hello World")', distractors: [{ text: 'echo("Hello World")', reason: 'R uses print()' }], indent: 1, explanation: "Print message" },
                { correct: '}', distractors: [{ text: 'end', reason: 'R uses braces' }], indent: 0, explanation: "Close function" },
                { correct: '', distractors: [{ text: 'return', reason: 'Not needed here' }], indent: 0, explanation: "Empty line" },
                { correct: 'main()', distractors: [{ text: 'call main()', reason: 'Direct call, no keyword' }], indent: 0, explanation: "Call function" }
            ]
        },
        'html': {
            goal: question || "Create a basic HTML page with 'Hello World'",
            concepts: "HTML structure, tags",
            language: "HTML",
            sequence: [
                { correct: '<!DOCTYPE html>', distractors: [{ text: '<DOCTYPE html>', reason: 'Need the !' }], indent: 0, explanation: "Document type declaration" },
                { correct: '<html>', distractors: [{ text: '<HTML>', reason: 'Lowercase is standard' }], indent: 0, explanation: "Root element" },
                { correct: '  <head>', distractors: [{ text: '<header>', reason: 'head, not header for metadata' }], indent: 1, explanation: "Head section" },
                { correct: '    <title>Hello World</title>', distractors: [{ text: '<title>Hello World<title>', reason: 'Need closing slash' }], indent: 2, explanation: "Page title" },
                { correct: '  </head>', distractors: [{ text: '</header>', reason: 'Match opening tag' }], indent: 1, explanation: "Close head" },
                { correct: '  <body>', distractors: [{ text: '<content>', reason: 'body is the standard tag' }], indent: 1, explanation: "Body section" },
                { correct: '    <h1>Hello World</h1>', distractors: [{ text: '<h1>Hello World</h>', reason: 'Need the 1 in closing tag' }], indent: 2, explanation: "Main heading" },
                { correct: '  </body>', distractors: [{ text: '<body/>', reason: 'Use proper closing tag' }], indent: 1, explanation: "Close body" },
                { correct: '</html>', distractors: [{ text: '<html/>', reason: 'Use proper closing tag' }], indent: 0, explanation: "Close html" }
            ]
        },
        'go': {
            goal: question || "Print 'Hello World' to the console",
            concepts: "Package, imports, main function",
            language: "Go",
            sequence: [
                { correct: 'package main', distractors: [{ text: 'package Main', reason: 'Package names are lowercase' }], indent: 0, explanation: "Package declaration" },
                { correct: '', distractors: [{ text: ';', reason: 'Empty line, no semicolon' }], indent: 0, explanation: "Empty line" },
                { correct: 'import "fmt"', distractors: [{ text: 'include "fmt"', reason: 'Go uses import' }], indent: 0, explanation: "Import fmt package" },
                { correct: '', distractors: [{ text: ';', reason: 'Empty line' }], indent: 0, explanation: "Empty line" },
                { correct: 'func main() {', distractors: [{ text: 'function main() {', reason: 'Go uses func' }], indent: 0, explanation: "Main function" },
                { correct: '    fmt.Println("Hello World")', distractors: [{ text: 'println("Hello World")', reason: 'Need fmt.Println' }], indent: 1, explanation: "Print message" },
                { correct: '}', distractors: [{ text: '};', reason: 'No semicolon after brace' }], indent: 0, explanation: "Close main" }
            ]
        },
        'rust': {
            goal: question || "Print 'Hello World' to the console",
            concepts: "Main function, macros",
            language: "Rust",
            sequence: [
                { correct: 'fn main() {', distractors: [{ text: 'func main() {', reason: 'Rust uses fn' }], indent: 0, explanation: "Main function" },
                { correct: '    println!("Hello World");', distractors: [{ text: 'println("Hello World");', reason: 'println! is a macro, needs !' }], indent: 1, explanation: "Print macro" },
                { correct: '}', distractors: [{ text: '};', reason: 'No semicolon after function brace' }], indent: 0, explanation: "Close main" }
            ]
        },
        'default': {
            goal: question || "Write a simple program",
            concepts: "Basic programming",
            language: "Generic",
            sequence: [
                { correct: '// Start of program', distractors: [{ text: '# Start', reason: 'Using comment style' }], indent: 0, explanation: "Program start" },
                { correct: 'main() {', distractors: [{ text: 'start() {', reason: 'Main is standard' }], indent: 0, explanation: "Main function" },
                { correct: '    output("Hello World");', distractors: [{ text: 'display("Hello World");', reason: 'Using output' }], indent: 1, explanation: "Output message" },
                { correct: '}', distractors: [{ text: 'end', reason: 'Using braces' }], indent: 0, explanation: "End program" }
            ]
        }
    };
    
    // Return specific template or default
    return templates[language] || templates['default'];
}

// Serve the logicbody.html file
app.get('/logicbody.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'logicbody.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
    console.log('Make sure to set ANTHROPIC_API_KEY environment variable');
});
