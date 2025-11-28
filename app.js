// Line-Based System Management
let monthlyLines = parseInt(localStorage.getItem('monthlyLines') || '0');
let linesUsed = parseInt(localStorage.getItem('linesUsed') || '0');
let membershipTier = localStorage.getItem('membershipTier') || 'free';
let membershipExpiry = localStorage.getItem('membershipExpiry');
let lastResetDate = localStorage.getItem('lastResetDate');
let lineHistory = JSON.parse(localStorage.getItem('lineHistory') || '[]');
let challengeHistory = JSON.parse(localStorage.getItem('challengeHistory') || '[]');
let currentChallenge = null;

// Membership tier definitions
const MEMBERSHIP_TIERS = {
    free: { lines: 1000, price: 0, name: 'Free' },
    boost: { lines: 5000, price: 9.99, name: 'Boost' },
    community: { lines: 25000, price: 29.99, name: 'Community' },
    super: { lines: 50000, price: 49.99, name: 'Super' }
};

// Initialize new users
function initializeNewUser() {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    if (!localStorage.getItem('userInitialized')) {
        // New user - count backwards until next 1st of month
        localStorage.setItem('userInitialized', 'true');
        localStorage.setItem('isNewUser', 'true');
        membershipTier = 'free';
        monthlyLines = 1000; // They start with 1000 but counting down
        linesUsed = 0;
        
        // Set next reset to 1st of next month
        const nextReset = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        localStorage.setItem('lastResetDate', nextReset.toISOString());
        
        saveLineData();
    }
}

// Check and reset monthly lines on 1st of month
function checkMonthlyReset() {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    if (!lastResetDate) {
        lastResetDate = firstOfMonth.toISOString();
        localStorage.setItem('lastResetDate', lastResetDate);
    }
    
    const lastReset = new Date(lastResetDate);
    
    // If it's a new month
    if (today >= firstOfMonth && lastReset < firstOfMonth) {
        const isNewUser = localStorage.getItem('isNewUser') === 'true';
        
        if (isNewUser) {
            // First reset for new user - they now get their full allocation
            localStorage.setItem('isNewUser', 'false');
        }
        
        // Add new monthly allocation (lines roll over)
        const tierAllocation = MEMBERSHIP_TIERS[membershipTier].lines;
        monthlyLines += tierAllocation;
        
        // Reset the usage counter for the new month
        linesUsed = 0;
        
        // Update last reset date
        lastResetDate = firstOfMonth.toISOString();
        localStorage.setItem('lastResetDate', lastResetDate);
        
        saveLineData();
        
        showSuccess(`Monthly lines refreshed! +${tierAllocation} lines added. Total: ${monthlyLines}`);
    }
}

// Save line data to localStorage
function saveLineData() {
    localStorage.setItem('monthlyLines', monthlyLines.toString());
    localStorage.setItem('linesUsed', linesUsed.toString());
    localStorage.setItem('membershipTier', membershipTier);
}

// Update UI with membership and line info
function updateMembershipUI() {
    const statusBadge = document.getElementById('statusBadge');
    const membershipBtn = document.getElementById('membershipBtn');
    const linesDisplay = document.getElementById('linesDisplay');
    const linesCount = document.getElementById('linesCount');
    const tierInfo = MEMBERSHIP_TIERS[membershipTier];
    
    // Update badge
    const icons = { free: '⭐', boost: '🚀', community: '👥', super: '💎' };
    statusBadge.className = `status-badge ${membershipTier}`;
    statusBadge.innerHTML = `<span class="status-icon">${icons[membershipTier]}</span><span class="status-text">${tierInfo.name}</span>`;
    
    // Update lines display
    const remainingLines = monthlyLines - linesUsed;
    linesCount.textContent = `${remainingLines.toLocaleString()} / ${monthlyLines.toLocaleString()}`;
    
    // Update button
    if (membershipTier === 'free') {
        membershipBtn.textContent = '⬆️ Upgrade Membership';
        membershipBtn.classList.remove('active');
    } else {
        membershipBtn.textContent = `✓ ${tierInfo.name} Member`;
        membershipBtn.classList.add('active');
    }
    
    // Update progress bar if exists
    const progressBar = document.getElementById('linesProgress');
    if (progressBar) {
        const percentage = Math.min(100, (remainingLines / monthlyLines) * 100);
        progressBar.style.width = `${percentage}%`;
        if (percentage < 20) {
            progressBar.style.background = '#ef4444';
        } else if (percentage < 50) {
            progressBar.style.background = '#f59e0b';
        } else {
            progressBar.style.background = '#10b981';
        }
    }
}

// Generate unique serial number for challenges
function generateSerialNumber() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let serial = '';
    for (let i = 0; i < 6; i++) {
        serial += chars[Math.floor(Math.random() * chars.length)];
    }
    return serial;
}

// Auto-search for similar challenges
async function searchSimilarChallenges(question, language) {
    const sharedChallenges = JSON.parse(localStorage.getItem('sharedChallenges') || '[]');
    
    // Simple similarity check based on keywords
    const keywords = question.toLowerCase().split(' ').filter(w => w.length > 3);
    const similar = sharedChallenges.filter(ch => {
        const chQuestion = ch.question.toLowerCase();
        const chLang = ch.language.toLowerCase();
        const langMatch = chLang.includes(language.toLowerCase());
        const wordMatches = keywords.filter(k => chQuestion.includes(k)).length;
        return langMatch && wordMatches >= 2;
    });
    
    return similar;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeNewUser();
    checkMonthlyReset();
    updateMembershipUI();
    loadHistory();
    loadChallengeStore();
    loadDailyChallenge();
    
    // Language selector change handler
    const languageSelect = document.getElementById('languageSelect');
    const customLanguageInput = document.getElementById('customLanguageInput');
    
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customLanguageInput.style.display = 'block';
                customLanguageInput.focus();
            } else {
                customLanguageInput.style.display = 'none';
                customLanguageInput.value = '';
            }
        });
    }
});

// New P&L
function newChallenge() {
    document.getElementById('creatorPanel').style.display = 'flex';
    document.getElementById('challengeViewer').classList.remove('active');
    document.getElementById('questionInput').value = '';
    document.getElementById('errorMessage').classList.remove('active');
    document.getElementById('successMessage').classList.remove('active');
}

// Generate Challenge using AI
async function generateChallenge() {
    const question = document.getElementById('questionInput').value.trim();
    let language = document.getElementById('languageSelect').value;
    const customLanguageInput = document.getElementById('customLanguageInput');
    const difficulty = document.getElementById('difficultySelect').value;
    
    if (!question) {
        showError('Please enter a coding question');
        return;
    }
    
    // Check if user has lines
    const remainingLines = monthlyLines - linesUsed;
    if (remainingLines <= 0) {
        showError('You have no lines remaining this month. Upgrade your membership or wait until next month!');
        showMembershipModal();
        return;
    }
    
    // Handle custom language
    let isCustomLanguage = false;
    if (language === 'custom') {
        const customLang = customLanguageInput.value.trim();
        if (!customLang) {
            showError('Please enter a custom language name');
            return;
        }
        language = customLang;
        isCustomLanguage = true;
    }
    
    // Search for similar challenges
    const similarChallenges = await searchSimilarChallenges(question, language);
    
    if (similarChallenges.length > 0) {
        const useExisting = confirm(
            `Found ${similarChallenges.length} similar challenge(s) in the store:\n\n` +
            similarChallenges.slice(0, 3).map(c => `• ${c.title} (${c.language})`).join('\n') +
            '\n\nWould you like to use an existing challenge instead of creating a new one?\n' +
            '(This will save computation and lines!)'
        );
        
        if (useExisting) {
            // Show similar challenges modal
            showSimilarChallengesModal(similarChallenges);
            return;
        }
    }
    
    // Show loading state
    const generateBtn = document.getElementById('generateBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    generateBtn.disabled = true;
    loadingIndicator.classList.add('active');
    hideMessages();
    
    try {
        // Call the API endpoint to generate challenge
        const response = await fetch('/api/generate-challenge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question,
                language,
                difficulty,
                isCustomLanguage
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate challenge');
        }
        
        const data = await response.json();
        
        // Generate unique serial number
        const serialNumber = generateSerialNumber();
        
        // Save challenge to history
        const challengeEntry = {
            id: Date.now().toString(),
            serial: serialNumber,
            title: question.substring(0, 50) + (question.length > 50 ? '...' : ''),
            question,
            language: isCustomLanguage ? `Custom: ${language}` : language,
            difficulty,
            challenge: data.challenge,
            timestamp: new Date().toISOString(),
            isCustom: isCustomLanguage,
            steps: data.challenge.sequence.length,
            createdBy: 'You',
            timesUsed: 0,
            linesEarned: 0
        };
        
        challengeHistory.unshift(challengeEntry);
        if (challengeHistory.length > 50) {
            challengeHistory = challengeHistory.slice(0, 50);
        }
        localStorage.setItem('challengeHistory', JSON.stringify(challengeHistory));
        
        // Auto-add to University
        await addToStore(challengeEntry);
        
        // Load the challenge in the viewer
        loadChallenge(challengeEntry);
        
        showSuccess(`Challenge created! Serial: ${serialNumber}`);
        
        // Refresh history and store
        loadHistory();
        loadChallengeStore();
        
    } catch (error) {
        console.error('Error generating challenge:', error);
        showError('Failed to generate challenge. Please try again.');
    } finally {
        generateBtn.disabled = false;
        loadingIndicator.classList.remove('active');
    }
}

// Add challenge to store automatically
async function addToStore(challengeEntry) {
    const sharedChallenges = JSON.parse(localStorage.getItem('sharedChallenges') || '[]');
    
    const storeEntry = {
        id: challengeEntry.id,
        serial: challengeEntry.serial,
        title: challengeEntry.title,
        question: challengeEntry.question,
        language: challengeEntry.language,
        difficulty: challengeEntry.difficulty,
        challengeData: challengeEntry.challenge,
        steps: challengeEntry.steps,
        sharedAt: new Date().toISOString(),
        sharedBy: 'You',
        timesUsed: 0,
        linesEarned: 0,
        creatorId: 'current_user' // In production, use real user ID
    };
    
    sharedChallenges.unshift(storeEntry);
    localStorage.setItem('sharedChallenges', JSON.stringify(sharedChallenges));
}

// Load challenge in viewer
function loadChallenge(challengeEntry) {
    currentChallenge = challengeEntry;
    
    // Prepare the challenge data with language info
    const challengeData = {
        challengesData: [challengeEntry.challenge],
        language: challengeEntry.language || 'c',
        serial: challengeEntry.serial
    };
    
    // Store in sessionStorage for the iframe to access
    sessionStorage.setItem('currentChallengeData', JSON.stringify(challengeData));
    
    // Show the viewer
    document.getElementById('creatorPanel').style.display = 'none';
    document.getElementById('challengeViewer').classList.add('active');
    
    // Load logicbody.html in iframe
    const iframe = document.getElementById('challengeFrame');
    iframe.src = `logicbody.html?challenge=${challengeEntry.serial}&lang=${challengeEntry.language || 'c'}`;
}

// Load history
function loadHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    historyList.innerHTML = '';
    
    challengeHistory.forEach(entry => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.onclick = () => loadHistoryItem(entry);
        
        const date = new Date(entry.timestamp);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        historyItem.innerHTML = `
            <div class="history-item-title">${entry.title}</div>
            <div class="history-item-date">${dateStr}</div>
            <div class="history-item-meta">
                <span class="history-item-language">${entry.language.toUpperCase()}</span>
                <span class="history-item-serial">#${entry.serial}</span>
            </div>
            ${entry.linesEarned > 0 ? `<span class="lines-earned">+${entry.linesEarned} lines earned</span>` : ''}
        `;
        
        historyList.appendChild(historyItem);
    });
}

// Load history item
function loadHistoryItem(entry) {
    loadChallenge(entry);
}

// Track lines used during challenge
function trackLinesUsed(linesCount) {
    linesUsed += linesCount;
    saveLineData();
    updateMembershipUI();
    
    // Record in history
    lineHistory.push({
        timestamp: new Date().toISOString(),
        lines: linesCount,
        challengeSerial: currentChallenge?.serial,
        type: 'usage'
    });
    localStorage.setItem('lineHistory', JSON.stringify(lineHistory));
}

// Credit lines to challenge creator
function creditLinestoCreator(challengeSerial, linesUsed) {
    const sharedChallenges = JSON.parse(localStorage.getItem('sharedChallenges') || '[]');
    const challenge = sharedChallenges.find(c => c.serial === challengeSerial);
    
    if (challenge && challenge.creatorId !== 'current_user') {
        // In production, this would credit the actual creator
        // For now, track it locally
        challenge.timesUsed += 1;
        challenge.linesEarned = (challenge.linesEarned || 0) + linesUsed;
        
        localStorage.setItem('sharedChallenges', JSON.stringify(sharedChallenges));
        
        // If this is your challenge, credit yourself
        if (challenge.createdBy === 'You') {
            monthlyLines += linesUsed;
            saveLineData();
            updateMembershipUI();
            
            lineHistory.push({
                timestamp: new Date().toISOString(),
                lines: linesUsed,
                challengeSerial: challengeSerial,
                type: 'earned'
            });
            localStorage.setItem('lineHistory', JSON.stringify(lineHistory));
        }
    }
}

// Membership Modal
function showMembershipModal() {
    document.getElementById('membershipModal').classList.add('active');
}

function closeMembershipModal() {
    document.getElementById('membershipModal').classList.remove('active');
}

// Process Membership Upgrade
async function upgradeMembership(tier) {
    closeMembershipModal();
    
    // Simulate payment processing
    setTimeout(() => {
        const tierInfo = MEMBERSHIP_TIERS[tier];
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        
        membershipTier = tier;
        localStorage.setItem('membershipTier', tier);
        localStorage.setItem('membershipExpiry', expiryDate.toISOString());
        
        // Add the tier's lines immediately
        monthlyLines += tierInfo.lines;
        saveLineData();
        
        updateMembershipUI();
        showSuccess(`Upgraded to ${tierInfo.name}! +${tierInfo.lines} lines added! 🎉`);
    }, 500);
}

// Message display functions
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.classList.add('active');
}

function showSuccess(message) {
    const successElement = document.getElementById('successMessage');
    successElement.textContent = message;
    successElement.classList.add('active');
}

function hideMessages() {
    document.getElementById('errorMessage')?.classList.remove('active');
    document.getElementById('successMessage')?.classList.remove('active');
}

// Listen for messages from the iframe
window.addEventListener('message', (event) => {
    if (event.data.type === 'linesUsed') {
        // Track lines used in challenge
        trackLinesUsed(event.data.lines);
        
        // Credit the challenge creator
        if (event.data.challengeSerial) {
            creditLinestoCreator(event.data.challengeSerial, event.data.lines);
        }
    }
    
    if (event.data.type === 'challengeCompleted') {
        if (event.data.success) {
            showSuccess('Challenge completed! Lines have been tracked.');
        }
    }
});

// Load University
function loadChallengeStore() {
    const sharedChallenges = JSON.parse(localStorage.getItem('sharedChallenges') || '[]');
    const grid = document.getElementById('challengeStoreGrid');
    const noChals = document.getElementById('noSharedChallenges');
    
    if (!grid) return;
    
    if (sharedChallenges.length === 0) {
        grid.style.display = 'none';
        if (noChals) noChals.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    if (noChals) noChals.style.display = 'none';
    grid.innerHTML = '';
    
    sharedChallenges.forEach((challenge) => {
        const card = document.createElement('div');
        card.className = 'challenge-card';
        card.innerHTML = `
            <div class="challenge-card-header">
                <h3>${challenge.title}</h3>
                <span class="challenge-serial">#${challenge.serial}</span>
            </div>
            <div class="challenge-card-meta">
                <span class="challenge-language">${challenge.language}</span>
                <span class="challenge-difficulty ${challenge.difficulty}">${challenge.difficulty}</span>
            </div>
            <div class="challenge-card-stats">
                <span>📊 ${challenge.steps} steps</span>
                <span>🔥 ${challenge.timesUsed || 0} uses</span>
                ${challenge.linesEarned > 0 ? `<span>💰 ${challenge.linesEarned} lines earned</span>` : ''}
            </div>
            <div class="challenge-card-footer">
                <span class="challenge-creator">By ${challenge.sharedBy}</span>
                <button onclick="loadSharedChallenge('${challenge.serial}')" class="play-btn">▶️ Play</button>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Load shared challenge by serial
function loadSharedChallenge(serial) {
    const sharedChallenges = JSON.parse(localStorage.getItem('sharedChallenges') || '[]');
    const challenge = sharedChallenges.find(c => c.serial === serial);
    
    if (challenge) {
        const challengeEntry = {
            id: challenge.id,
            serial: challenge.serial,
            title: challenge.title,
            question: challenge.question,
            language: challenge.language,
            difficulty: challenge.difficulty,
            challenge: challenge.challengeData,
            timestamp: challenge.sharedAt,
            isShared: true,
            steps: challenge.steps
        };
        
        closeChallengeStore();
        loadChallenge(challengeEntry);
    }
}

function closeChallengeStore() {
    document.getElementById('challengeStoreModal')?.classList.remove('active');
}

// Daily Challenge System
function loadDailyChallenge() {
    // Implementation for daily challenges with streaks
    // This would connect to a backend in production
}

// Share current challenge via serial URL
window.shareCurrentChallenge = function() {
    if (!currentChallenge) {
        alert('No challenge to share!');
        return;
    }
    
    const shareUrl = `${window.location.origin}/${currentChallenge.serial}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
        alert(`✅ Challenge link copied!\n\n${shareUrl}\n\nSerial: ${currentChallenge.serial}`);
    }).catch(() => {
        prompt('Share this link:', shareUrl);
    });
};
