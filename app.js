// Star System Management
let stars = parseInt(localStorage.getItem('userStars') || '10');
let challengeHistory = JSON.parse(localStorage.getItem('challengeHistory') || '[]');
let currentChallenge = null;

// Subscription and Daily Limit Management
let isSubscribed = localStorage.getItem('isSubscribed') === 'true';
let subscriptionExpiry = localStorage.getItem('subscriptionExpiry');
let dailyChallenges = JSON.parse(localStorage.getItem('dailyChallenges') || '[]');
let lastResetDate = localStorage.getItem('lastResetDate') || new Date().toDateString();

// Check and reset daily challenges if new day
function checkDailyReset() {
    const today = new Date().toDateString();
    if (today !== lastResetDate) {
        dailyChallenges = [];
        localStorage.setItem('dailyChallenges', JSON.stringify(dailyChallenges));
        localStorage.setItem('lastResetDate', today);
        lastResetDate = today;
    }
}

// Check subscription status
function checkSubscriptionStatus() {
    if (subscriptionExpiry) {
        const expiryDate = new Date(subscriptionExpiry);
        const now = new Date();
        if (expiryDate < now) {
            isSubscribed = false;
            localStorage.setItem('isSubscribed', 'false');
            localStorage.removeItem('subscriptionExpiry');
        }
    }
    updateSubscriptionUI();
}

// Update subscription UI
function updateSubscriptionUI() {
    const statusBadge = document.getElementById('statusBadge');
    const subscribeBtn = document.getElementById('subscribeBtn');
    const dailyLimit = document.getElementById('dailyLimit');
    const limitCount = document.getElementById('limitCount');
    
    if (isSubscribed) {
        statusBadge.className = 'status-badge premium';
        statusBadge.innerHTML = '<span class="status-icon">🚀</span><span class="status-text">Premium</span>';
        subscribeBtn.textContent = '✅ Subscribed';
        subscribeBtn.classList.add('subscribed');
        dailyLimit.style.display = 'none';
    } else {
        statusBadge.className = 'status-badge free';
        statusBadge.innerHTML = '<span class="status-icon">⭐</span><span class="status-text">Free Plan</span>';
        subscribeBtn.textContent = '🚀 Go Unlimited - $5.99/mo';
        subscribeBtn.classList.remove('subscribed');
        dailyLimit.style.display = 'block';
        
        const used = dailyChallenges.length;
        limitCount.textContent = `${used}/3`;
        if (used >= 3) {
            limitCount.classList.add('maxed');
        } else {
            limitCount.classList.remove('maxed');
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    updateStarDisplay();
    loadHistory();
    checkDailyReset();
    checkSubscriptionStatus();
    
    // Language selector change handler
    const languageSelect = document.getElementById('languageSelect');
    const customLanguageInput = document.getElementById('customLanguageInput');
    
    languageSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customLanguageInput.style.display = 'block';
            customLanguageInput.focus();
        } else {
            customLanguageInput.style.display = 'none';
            customLanguageInput.value = '';
        }
    });
});

// Update star count display
function updateStarDisplay() {
    document.getElementById('starCount').textContent = stars;
}

// Save stars to localStorage
function saveStars() {
    localStorage.setItem('userStars', stars.toString());
    updateStarDisplay();
}

// New Challenge
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
    
    // Check daily limit for free users
    checkDailyReset();
    if (!isSubscribed && dailyChallenges.length >= 3) {
        showError('Daily limit reached (3 challenges). Subscribe for unlimited access or wait until tomorrow!');
        showSubscriptionModal();
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
        
        // Check if user has enough stars for custom language (1000 stars)
        if (stars < 1000) {
            showError('Custom languages require 1000 stars. You currently have ' + stars + ' stars.');
            return;
        }
        
        language = customLang;
        isCustomLanguage = true;
    }
    
    // Check if user has enough stars (minimum 1 for regular challenges)
    if (!isCustomLanguage && stars < 1) {
        showError('You need at least 1 star to generate a challenge. Please purchase more stars.');
        return;
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
        
        // Deduct stars for custom language immediately
        if (isCustomLanguage) {
            stars -= 1000;
            saveStars();
            showSuccess('Custom language challenge generated! 1000 stars deducted.');
        }
        
        // Calculate star cost for steps
        const stepCount = data.challenge.sequence.length;
        let starCost = -1; // Earn 1 star for correct answer
        
        if (stepCount > 50) {
            starCost = stepCount - 50; // Cost 1 star per step over 50
        }
        
        // Update stars (will be positive if earning, negative if costing)
        if (!isCustomLanguage) {
            stars += starCost;
            saveStars();
        }
        
        // Track daily challenge for free users
        if (!isSubscribed) {
            const today = new Date().toISOString();
            dailyChallenges.push(today);
            localStorage.setItem('dailyChallenges', JSON.stringify(dailyChallenges));
            updateSubscriptionUI();
        }
        
        // Save challenge to history
        const challengeEntry = {
            id: Date.now().toString(),
            title: question.substring(0, 50) + (question.length > 50 ? '...' : ''),
            question,
            language: isCustomLanguage ? `Custom: ${language}` : language,
            difficulty,
            challenge: data.challenge,
            timestamp: new Date().toISOString(),
            starCost: isCustomLanguage ? 1000 : starCost,
            isCustom: isCustomLanguage
        };
        
        challengeHistory.unshift(challengeEntry);
        if (challengeHistory.length > 20) {
            challengeHistory = challengeHistory.slice(0, 20);
        }
        localStorage.setItem('challengeHistory', JSON.stringify(challengeHistory));
        
        // Create a temporary c.js file with the challenge
        await createChallengeFile(data.challenge);
        
        // Load the challenge in the viewer
        loadChallenge(challengeEntry);
        
        // Show success message
        let message = '';
        if (isCustomLanguage) {
            message = `Custom language challenge generated! (${language})`;
        } else if (stepCount > 50) {
            message = `Challenge generated! This solution has ${stepCount} steps, costing ${stepCount - 50} star(s).`;
        } else {
            message = 'Challenge generated! Complete it correctly to earn 1 star!';
        }
        showSuccess(message);
        
        // Refresh history
        loadHistory();
        
    } catch (error) {
        console.error('Error generating challenge:', error);
        showError('Failed to generate challenge. Please try again.');
    } finally {
        generateBtn.disabled = false;
        loadingIndicator.classList.remove('active');
    }
}

// Create challenge file for logicbody.html
async function createChallengeFile(challenge) {
    // Store the current challenge in sessionStorage for logicbody.html to access
    sessionStorage.setItem('currentChallenge', JSON.stringify(challenge));
}

// Load challenge in viewer
function loadChallenge(challengeEntry) {
    currentChallenge = challengeEntry;
    
    // Prepare the challenge data with language info
    const challengeData = {
        challengesData: [challengeEntry.challenge],
        language: challengeEntry.language || 'c'
    };
    
    // Store in sessionStorage for the iframe to access
    sessionStorage.setItem('currentChallengeData', JSON.stringify(challengeData));
    
    // Show the viewer
    document.getElementById('creatorPanel').style.display = 'none';
    document.getElementById('challengeViewer').classList.add('active');
    
    // Load logicbody.html in iframe with query parameter including language
    const iframe = document.getElementById('challengeFrame');
    iframe.src = `logicbody.html?challenge=current&lang=${challengeEntry.language || 'c'}`;
}

// Load history
function loadHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    challengeHistory.forEach(entry => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.onclick = () => loadHistoryItem(entry);
        
        const date = new Date(entry.timestamp);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Format language display
        let languageDisplay = entry.language;
        let languageClass = 'history-item-language';
        if (entry.isCustom) {
            languageDisplay = entry.language.replace('Custom: ', '');
            languageClass += ' custom-language';
        }
        
        historyItem.innerHTML = `
            <div class="history-item-title">${entry.title}</div>
            <div class="history-item-date">${dateStr}</div>
            <span class="${languageClass}">${languageDisplay.toUpperCase()}</span>
            ${entry.isCustom ? '<span style="color: #facc15; margin-left: 5px;">⭐1000</span>' : ''}
        `;
        
        historyList.appendChild(historyItem);
    });
}

// Load history item
function loadHistoryItem(entry) {
    loadChallenge(entry);
}

// Purchase Modal
function showPurchaseModal() {
    document.getElementById('purchaseModal').classList.add('active');
}

function closePurchaseModal() {
    document.getElementById('purchaseModal').classList.remove('active');
}

// Subscription Modal
function showSubscriptionModal() {
    document.getElementById('subscriptionModal').classList.add('active');
}

function closeSubscriptionModal() {
    document.getElementById('subscriptionModal').classList.remove('active');
}

// Process Subscription (Simulated - in production, integrate with payment gateway)
async function processSubscription() {
    // Simulate payment processing
    closeSubscriptionModal();
    
    // In production, this would integrate with Stripe, PayPal, etc.
    // For now, we'll simulate a successful subscription
    
    setTimeout(() => {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        
        isSubscribed = true;
        localStorage.setItem('isSubscribed', 'true');
        localStorage.setItem('subscriptionExpiry', expiryDate.toISOString());
        
        updateSubscriptionUI();
        showSuccess('Successfully subscribed! Enjoy unlimited challenges! 🎉');
    }, 500);
}

// Cancel Subscription
function cancelSubscription() {
    if (confirm('Are you sure you want to cancel your subscription?')) {
        isSubscribed = false;
        localStorage.setItem('isSubscribed', 'false');
        localStorage.removeItem('subscriptionExpiry');
        updateSubscriptionUI();
        showSuccess('Subscription cancelled. You can resubscribe anytime.');
    }
}

// Process Purchase (Simulated - in production, integrate with payment gateway)
async function processPurchase() {
    // Simulate payment processing
    closePurchaseModal();
    
    // In production, this would integrate with Stripe, PayPal, etc.
    // For now, we'll simulate a successful purchase
    
    setTimeout(() => {
        stars += 100;
        saveStars();
        showSuccess('Successfully purchased 100 stars! 🎉');
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
    document.getElementById('errorMessage').classList.remove('active');
    document.getElementById('successMessage').classList.remove('active');
}

// Listen for messages from the iframe (for star updates when challenge is completed)
window.addEventListener('message', (event) => {
    if (event.data.type === 'challengeCompleted') {
        if (event.data.success && currentChallenge) {
            // Award star for successful completion
            if (currentChallenge.challenge.sequence.length <= 50) {
                stars += 1;
                saveStars();
                showSuccess('Congratulations! You earned 1 star! ⭐');
            }
        }
    }
    
    // Handle share challenge action from iframe
    if (event.data.action === 'shareChallenge') {
        if (typeof window.shareCurrentChallenge === 'function') {
            window.shareCurrentChallenge();
        }
    }
});
