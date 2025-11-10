// Check if we have dynamic challenge data from sessionStorage
let challengesData = [];
let currentLanguage = 'C';

// Try to load challenge from sessionStorage first
const challengeDataStr = sessionStorage.getItem('currentChallengeData');
if (challengeDataStr) {
    const data = JSON.parse(challengeDataStr);
    challengesData = data.challengesData;
    currentLanguage = data.language ? data.language.toUpperCase() : 'C';
    
    // Update the page title and headers if logicbody.html is loaded
    document.addEventListener('DOMContentLoaded', () => {
        // Update title
        const titleElement = document.querySelector('title');
        if (titleElement) {
            titleElement.textContent = `Code Challenge - ${currentLanguage}`;
        }
        
        // Update any headers that mention C
        const headers = document.querySelectorAll('h1, h2, h3');
        headers.forEach(header => {
            if (header.textContent.includes('C Sequence')) {
                header.textContent = header.textContent.replace('C Sequence', `${currentLanguage} Code`);
            }
        });
        
        // Add language indicator if it exists
        const languageIndicator = document.createElement('div');
        languageIndicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        languageIndicator.textContent = `Language: ${currentLanguage}`;
        document.body.appendChild(languageIndicator);
    });
} else {
    // Fallback to default challenges if no dynamic challenge is available
    challengesData = [
        // Default challenge for testing
        {
            goal: "Print 'Hello World' using a simple C program.",
            concepts: "Basic I/O, main function, printf",
            language: "C",
            sequence: [
                { 
                    correct: '#include <stdio.h>', 
                    distractors: [
                        {text: '#include <stdlib.h>', reason: 'stdlib.h is for different functions, we need stdio.h for printf'}, 
                        {text: '#import <stdio.h>', reason: 'C uses #include, not #import'}
                    ], 
                    indent: 0, 
                    explanation: "Include the Standard Input/Output library for functions like printf." 
                },
                { 
                    correct: 'int main() {', 
                    distractors: [
                        {text: 'void main() {', reason: 'Standard C requires main to return int'}, 
                        {text: 'function main() {', reason: 'C uses type declarations, not function keyword'}
                    ], 
                    indent: 0, 
                    explanation: "The main function where program execution begins." 
                },
                { 
                    correct: 'printf("Hello World\\n");', 
                    distractors: [
                        {text: 'print("Hello World");', reason: 'C uses printf, not print'}, 
                        {text: 'console.log("Hello World");', reason: 'console.log is JavaScript, not C'}
                    ], 
                    indent: 1, 
                    explanation: "Print the message to the console." 
                },
                { 
                    correct: 'return 0;', 
                    distractors: [
                        {text: 'exit(0);', reason: 'return is preferred in main function'}, 
                        {text: 'return 1;', reason: '0 indicates successful execution'}
                    ], 
                    indent: 1, 
                    explanation: "Return 0 to indicate successful program execution." 
                },
                { 
                    correct: '}', 
                    distractors: [
                        {text: 'end;', reason: 'C uses braces, not end keyword'}, 
                        {text: '};', reason: 'No semicolon after closing brace of function'}
                    ], 
                    indent: 0, 
                    explanation: "Close the main function block." 
                }
            ]
        }
    ];
}

// Export for use in logicbody.html
window.challengesData = challengesData;

// Function to notify parent window when challenge is completed
function notifyChallengeComplete(success, stepsUsed) {
    if (window.parent !== window) {
        window.parent.postMessage({
            type: 'challengeCompleted',
            success: success,
            stepsUsed: stepsUsed,
            language: currentLanguage
        }, '*');
    }
}

// Override or extend any necessary functions from logicbody.html
// to integrate with our star system
if (typeof window.onChallengeComplete === 'function') {
    const originalComplete = window.onChallengeComplete;
    window.onChallengeComplete = function(success, stepsUsed) {
        originalComplete(success, stepsUsed);
        notifyChallengeComplete(success, stepsUsed);
    };
}
