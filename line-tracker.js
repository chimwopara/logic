// Line Tracking System for logicbody.html
// Add this to logicbody.html to track line usage

class LineTracker {
    constructor(challengeSerial) {
        this.challengeSerial = challengeSerial;
        this.linesUsedInChallenge = 0;
        this.viewedOptions = new Set();
        this.startTime = Date.now();
        this.interactions = [];
    }
    
    // Track when user views hint/explanation
    trackHintView(stepIndex) {
        const hintKey = `hint-${stepIndex}`;
        if (!this.viewedOptions.has(hintKey)) {
            this.viewedOptions.add(hintKey);
            this.linesUsedInChallenge += 1;
            
            this.interactions.push({
                type: 'hint',
                stepIndex,
                timestamp: Date.now() - this.startTime,
                lines: 1
            });
            
            this.sendLineUpdate();
            this.updateLocalDisplay();
        }
    }
    
    // Track when user clicks/views a code option
    trackCodeOptionView(stepIndex, optionIndex, isCorrect) {
        const optionKey = `code-${stepIndex}-${optionIndex}`;
        if (!this.viewedOptions.has(optionKey)) {
            this.viewedOptions.add(optionKey);
            this.linesUsedInChallenge += 1;
            
            this.interactions.push({
                type: 'code',
                stepIndex,
                optionIndex,
                isCorrect,
                timestamp: Date.now() - this.startTime,
                lines: 1
            });
            
            this.sendLineUpdate();
            this.updateLocalDisplay();
        }
    }
    
    // Track when user views distractor comment/explanation
    trackDistractorView(stepIndex, distractorIndex) {
        const commentKey = `comment-${stepIndex}-${distractorIndex}`;
        if (!this.viewedOptions.has(commentKey)) {
            this.viewedOptions.add(commentKey);
            this.linesUsedInChallenge += 1;
            
            this.interactions.push({
                type: 'distractor',
                stepIndex,
                distractorIndex,
                timestamp: Date.now() - this.startTime,
                lines: 1
            });
            
            this.sendLineUpdate();
            this.updateLocalDisplay();
        }
    }
    
    // Send line update to parent window
    sendLineUpdate() {
        if (window.parent !== window) {
            window.parent.postMessage({
                type: 'linesUsed',
                lines: this.linesUsedInChallenge,
                challengeSerial: this.challengeSerial,
                timestamp: new Date().toISOString()
            }, '*');
        }
    }
    
    // Update local line display in the iframe
    updateLocalDisplay() {
        const display = document.getElementById('linesUsedDisplay');
        if (display) {
            display.textContent = `${this.linesUsedInChallenge} lines used`;
            
            // Color code based on efficiency
            if (this.linesUsedInChallenge < this.getCurrentStep() * 2) {
                display.className = 'lines-display efficient';
            } else if (this.linesUsedInChallenge < this.getCurrentStep() * 4) {
                display.className = 'lines-display average';
            } else {
                display.className = 'lines-display inefficient';
            }
        }
    }
    
    // Get current step number
    getCurrentStep() {
        // This should reference the actual step counter from logicbody
        return window.currentStepIndex || 0;
    }
    
    // On challenge completion
    complete(success) {
        const completionTime = Math.floor((Date.now() - this.startTime) / 1000); // seconds
        const minutes = Math.floor(completionTime / 60);
        const seconds = completionTime % 60;
        const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (window.parent !== window) {
            window.parent.postMessage({
                type: 'challengeCompleted',
                success: success,
                linesUsed: this.linesUsedInChallenge,
                challengeSerial: this.challengeSerial,
                completionTime: timeString,
                interactions: this.interactions,
                efficiency: this.calculateEfficiency()
            }, '*');
        }
        
        // Save to local storage for this user
        this.saveCompletion(timeString, success);
    }
    
    // Calculate efficiency score
    calculateEfficiency() {
        const totalSteps = this.getCurrentStep();
        const avgLinesPerStep = this.linesUsedInChallenge / totalSteps;
        
        // Best case: 2 lines per step (hint + correct answer)
        // Worst case: 6 lines per step (all options)
        // Score: 100 = best, 0 = worst
        
        const efficiency = Math.max(0, Math.min(100, 
            100 - ((avgLinesPerStep - 2) / 4) * 100
        ));
        
        return Math.round(efficiency);
    }
    
    // Save completion to localStorage
    saveCompletion(timeString, success) {
        const completions = JSON.parse(localStorage.getItem('userCompletions') || '[]');
        
        completions.push({
            challengeSerial: this.challengeSerial,
            timestamp: new Date().toISOString(),
            linesUsed: this.linesUsedInChallenge,
            completionTime: timeString,
            success: success,
            efficiency: this.calculateEfficiency(),
            interactions: this.interactions.length
        });
        
        // Keep last 100 completions
        if (completions.length > 100) {
            completions.shift();
        }
        
        localStorage.setItem('userCompletions', JSON.stringify(completions));
    }
    
    // Get statistics for this challenge
    getStats() {
        return {
            linesUsed: this.linesUsedInChallenge,
            viewedHints: Array.from(this.viewedOptions).filter(k => k.startsWith('hint-')).length,
            viewedCodes: Array.from(this.viewedOptions).filter(k => k.startsWith('code-')).length,
            viewedDistractors: Array.from(this.viewedOptions).filter(k => k.startsWith('comment-')).length,
            efficiency: this.calculateEfficiency(),
            timeElapsed: Math.floor((Date.now() - this.startTime) / 1000)
        };
    }
}

// Integration Example for logicbody.html:
/*

// Initialize tracker when challenge loads
let lineTracker;

function initializeChallenge(challengeData) {
    const serial = getChallengeSerial(); // Get from URL or sessionStorage
    lineTracker = new LineTracker(serial);
    
    // Add line display to UI
    const header = document.querySelector('.challenge-header');
    const linesDisplay = document.createElement('div');
    linesDisplay.id = 'linesUsedDisplay';
    linesDisplay.className = 'lines-display efficient';
    linesDisplay.textContent = '0 lines used';
    header.appendChild(linesDisplay);
    
    // Initialize rest of challenge...
}

// When user clicks hint button
function showHint(stepIndex) {
    lineTracker.trackHintView(stepIndex);
    // ... show hint UI
}

// When user selects/views a code option
function handleCodeSelection(stepIndex, optionIndex, isCorrect) {
    lineTracker.trackCodeOptionView(stepIndex, optionIndex, isCorrect);
    // ... handle selection
}

// When user clicks to see why distractor is wrong
function showDistractorExplanation(stepIndex, distractorIndex) {
    lineTracker.trackDistractorView(stepIndex, distractorIndex);
    // ... show explanation
}

// When challenge is completed
function onChallengeComplete(success) {
    lineTracker.complete(success);
    
    const stats = lineTracker.getStats();
    displayCompletionStats(stats);
}

// Display completion stats
function displayCompletionStats(stats) {
    const statsHTML = `
        <div class="completion-stats">
            <h3>Challenge Complete! 🎉</h3>
            <div class="stat-row">
                <span class="stat-label">Lines Used:</span>
                <span class="stat-value">${stats.linesUsed}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Efficiency:</span>
                <span class="stat-value">${stats.efficiency}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Time:</span>
                <span class="stat-value">${formatTime(stats.timeElapsed)}</span>
            </div>
            <div class="efficiency-bar">
                <div class="bar-fill" style="width: ${stats.efficiency}%"></div>
            </div>
            <p class="efficiency-message">${getEfficiencyMessage(stats.efficiency)}</p>
        </div>
    `;
    
    // Display in modal or completion screen
}

function getEfficiencyMessage(efficiency) {
    if (efficiency >= 90) return "🏆 Incredible! You're a efficiency master!";
    if (efficiency >= 75) return "⭐ Great job! Very efficient solving!";
    if (efficiency >= 50) return "👍 Good work! Room for improvement.";
    return "💪 Keep practicing to improve efficiency!";
}

*/

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LineTracker;
} else {
    window.LineTracker = LineTracker;
}
