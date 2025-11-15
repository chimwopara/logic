// Daily Challenge System with Competitions
// daily-challenges.js

class DailyChallengeManager {
    constructor() {
        this.currentDate = new Date().toDateString();
        this.loadTodaysChallenge();
        this.friendsLeague = new FriendsLeague();
    }
    
    // Load or generate today's daily challenge
    loadTodaysChallenge() {
        const stored = localStorage.getItem('dailyChallenge');
        
        if (stored) {
            const data = JSON.parse(stored);
            
            // Check if it's still today's challenge
            if (data.date === this.currentDate) {
                this.challenge = data;
                return;
            }
        }
        
        // Generate new daily challenge for today
        this.generateDailyChallenge();
    }
    
    // Generate a new daily challenge
    async generateDailyChallenge() {
        const sharedChallenges = JSON.parse(localStorage.getItem('sharedChallenges') || '[]');
        
        // Filter for suitable daily challenges:
        // - Medium difficulty
        // - 10-25 steps (not too short, not too long)
        // - Good rating if available
        // - Various languages
        
        const suitable = sharedChallenges.filter(c => 
            c.difficulty === 'medium' && 
            c.steps >= 10 && 
            c.steps <= 25 &&
            (c.rating || 3.0) >= 3.5
        );
        
        let selectedChallenge;
        
        if (suitable.length > 0) {
            // Pick a random suitable challenge
            selectedChallenge = suitable[Math.floor(Math.random() * suitable.length)];
        } else if (sharedChallenges.length > 0) {
            // Fallback to any challenge
            selectedChallenge = sharedChallenges[Math.floor(Math.random() * sharedChallenges.length)];
        } else {
            // Fallback to generating via API (production) or use default
            selectedChallenge = this.getDefaultChallenge();
        }
        
        this.challenge = {
            date: this.currentDate,
            challengeSerial: selectedChallenge.serial,
            challenge: selectedChallenge,
            participants: [],
            leaderboard: [],
            startTime: new Date().toISOString(),
            endTime: this.getEndOfDay().toISOString()
        };
        
        localStorage.setItem('dailyChallenge', JSON.stringify(this.challenge));
    }
    
    // Get end of day timestamp
    getEndOfDay() {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return end;
    }
    
    // Default challenge if none available
    getDefaultChallenge() {
        return {
            serial: 'default',
            title: 'Fizz Buzz Classic',
            question: 'Write a program that prints numbers 1-100, but for multiples of 3 print Fizz, for multiples of 5 print Buzz, and for multiples of both print FizzBuzz',
            language: 'python',
            difficulty: 'medium',
            steps: 15,
            challengeData: {} // Would have full challenge structure
        };
    }
    
    // Check if user has completed today's challenge
    hasCompletedToday(userId) {
        return this.challenge.participants.includes(userId);
    }
    
    // Submit a completion
    submitCompletion(userId, username, completionTime, linesUsed) {
        // Prevent duplicate submissions
        if (this.hasCompletedToday(userId)) {
            return { rank: this.getRank(userId), alreadyCompleted: true };
        }
        
        this.challenge.participants.push(userId);
        
        const entry = {
            userId,
            username,
            time: completionTime,
            lines: linesUsed,
            timestamp: new Date().toISOString(),
            efficiency: this.calculateEfficiency(linesUsed, this.challenge.challenge.steps)
        };
        
        this.challenge.leaderboard.push(entry);
        
        // Sort leaderboard by time (fastest first)
        this.challenge.leaderboard.sort((a, b) => {
            return this.timeToSeconds(a.time) - this.timeToSeconds(b.time);
        });
        
        localStorage.setItem('dailyChallenge', JSON.stringify(this.challenge));
        
        // Update user's streak
        const streakInfo = this.updateStreak(userId);
        
        // Determine rewards
        const rank = this.getRank(userId);
        const rewards = this.calculateRewards(rank, streakInfo.count);
        
        // Award lines
        this.awardLines(userId, rewards.totalLines);
        
        return {
            rank,
            streak: streakInfo,
            rewards,
            alreadyCompleted: false
        };
    }
    
    // Convert time string to seconds
    timeToSeconds(timeString) {
        const [minutes, seconds] = timeString.split(':').map(Number);
        return minutes * 60 + seconds;
    }
    
    // Calculate efficiency score
    calculateEfficiency(linesUsed, totalSteps) {
        const bestCase = totalSteps * 2; // hint + correct answer
        const worstCase = totalSteps * 6; // all options
        
        if (linesUsed <= bestCase) return 100;
        if (linesUsed >= worstCase) return 0;
        
        return Math.round(100 - ((linesUsed - bestCase) / (worstCase - bestCase)) * 100);
    }
    
    // Get user's rank
    getRank(userId) {
        return this.challenge.leaderboard.findIndex(e => e.userId === userId) + 1;
    }
    
    // Update user's streak
    updateStreak(userId) {
        const streaks = JSON.parse(localStorage.getItem('userStreaks') || '{}');
        const userStreak = streaks[userId] || { count: 0, lastDate: null, bestStreak: 0 };
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        // Check if continuing streak
        if (userStreak.lastDate === yesterdayStr || userStreak.count === 0) {
            userStreak.count += 1;
        } else {
            // Streak broken
            userStreak.count = 1;
        }
        
        // Update best streak
        if (userStreak.count > userStreak.bestStreak) {
            userStreak.bestStreak = userStreak.count;
        }
        
        userStreak.lastDate = this.currentDate;
        streaks[userId] = userStreak;
        
        localStorage.setItem('userStreaks', JSON.stringify(streaks));
        
        return userStreak;
    }
    
    // Calculate rewards based on rank and streak
    calculateRewards(rank, streakCount) {
        let rankBonus = 0;
        let streakBonus = 0;
        let participationBonus = 10;
        
        // Rank-based rewards
        if (rank === 1) {
            rankBonus = 500;
        } else if (rank === 2) {
            rankBonus = 200;
        } else if (rank === 3) {
            rankBonus = 200;
        } else if (rank <= 10) {
            rankBonus = 100;
        }
        
        // Streak-based rewards
        const streakBonuses = {
            3: 50,
            7: 150,
            14: 300,
            30: 1000,
            50: 2000,
            100: 5000
        };
        
        streakBonus = streakBonuses[streakCount] || 0;
        
        return {
            rankBonus,
            streakBonus,
            participationBonus,
            totalLines: rankBonus + streakBonus + participationBonus
        };
    }
    
    // Award lines to user
    awardLines(userId, lines) {
        // In production, this would update the database
        // For now, update localStorage
        
        if (userId === 'current_user') {
            let monthlyLines = parseInt(localStorage.getItem('monthlyLines') || '0');
            monthlyLines += lines;
            localStorage.setItem('monthlyLines', monthlyLines.toString());
        }
        
        // Record transaction
        const lineHistory = JSON.parse(localStorage.getItem('lineHistory') || '[]');
        lineHistory.push({
            timestamp: new Date().toISOString(),
            type: 'daily_challenge_reward',
            amount: lines,
            challengeSerial: this.challenge.challengeSerial
        });
        localStorage.setItem('lineHistory', JSON.stringify(lineHistory));
    }
    
    // Get leaderboard
    getLeaderboard(limit = 10) {
        return this.challenge.leaderboard.slice(0, limit);
    }
    
    // Get friends leaderboard
    getFriendsLeaderboard() {
        return this.friendsLeague.getFriendsLeaderboard(this.challenge.challengeSerial);
    }
    
    // Get user's stats for today
    getUserStats(userId) {
        const entry = this.challenge.leaderboard.find(e => e.userId === userId);
        if (!entry) return null;
        
        return {
            rank: this.getRank(userId),
            time: entry.time,
            lines: entry.lines,
            efficiency: entry.efficiency,
            timestamp: entry.timestamp
        };
    }
    
    // Get time remaining for today's challenge
    getTimeRemaining() {
        const now = new Date();
        const end = this.getEndOfDay();
        const diff = end - now;
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    }
}

// Friends League System
class FriendsLeague {
    constructor() {
        this.friends = JSON.parse(localStorage.getItem('friendsList') || '[]');
    }
    
    // Add a friend
    addFriend(friendUserId, friendUsername) {
        if (!this.friends.find(f => f.userId === friendUserId)) {
            this.friends.push({
                userId: friendUserId,
                username: friendUsername,
                addedAt: new Date().toISOString()
            });
            localStorage.setItem('friendsList', JSON.stringify(this.friends));
            return true;
        }
        return false;
    }
    
    // Remove a friend
    removeFriend(friendUserId) {
        this.friends = this.friends.filter(f => f.userId !== friendUserId);
        localStorage.setItem('friendsList', JSON.stringify(this.friends));
    }
    
    // Get all friends
    getFriends() {
        return this.friends;
    }
    
    // Get friends leaderboard for a specific challenge
    getFriendsLeaderboard(challengeSerial) {
        // Get completions from localStorage (in production, from database)
        const allCompletions = JSON.parse(
            localStorage.getItem(`challenge_${challengeSerial}_completions`) || '[]'
        );
        
        const friendIds = this.friends.map(f => f.userId);
        friendIds.push('current_user'); // Add self
        
        const friendCompletions = allCompletions.filter(c => friendIds.includes(c.userId));
        
        // Sort by time
        return friendCompletions.sort((a, b) => {
            const [aMin, aSec] = a.time.split(':').map(Number);
            const [bMin, bSec] = b.time.split(':').map(Number);
            return (aMin * 60 + aSec) - (bMin * 60 + bSec);
        });
    }
    
    // Challenge a friend
    challengeFriend(friendUserId, challengeSerial, wagerLines = 100) {
        const challenge = {
            id: Date.now().toString(),
            from: 'current_user',
            to: friendUserId,
            challengeSerial: challengeSerial,
            wagerLines: wagerLines,
            sentAt: new Date().toISOString(),
            status: 'pending' // pending, accepted, declined, completed
        };
        
        const challenges = JSON.parse(localStorage.getItem('friendChallenges') || '[]');
        challenges.push(challenge);
        localStorage.setItem('friendChallenges', JSON.stringify(challenges));
        
        return challenge;
    }
    
    // Accept a friend challenge
    acceptChallenge(challengeId) {
        const challenges = JSON.parse(localStorage.getItem('friendChallenges') || '[]');
        const challenge = challenges.find(c => c.id === challengeId);
        
        if (challenge) {
            challenge.status = 'accepted';
            challenge.acceptedAt = new Date().toISOString();
            localStorage.setItem('friendChallenges', JSON.stringify(challenges));
        }
        
        return challenge;
    }
    
    // Complete a friend challenge
    completeChallenge(challengeId, userId, completionTime, linesUsed) {
        const challenges = JSON.parse(localStorage.getItem('friendChallenges') || '[]');
        const challenge = challenges.find(c => c.id === challengeId);
        
        if (!challenge) return null;
        
        // Record completion
        if (!challenge.completions) {
            challenge.completions = [];
        }
        
        challenge.completions.push({
            userId,
            time: completionTime,
            lines: linesUsed,
            timestamp: new Date().toISOString()
        });
        
        // Check if both users have completed
        if (challenge.completions.length >= 2) {
            challenge.status = 'completed';
            
            // Determine winner (fastest time)
            const [comp1, comp2] = challenge.completions;
            const time1 = this.timeToSeconds(comp1.time);
            const time2 = this.timeToSeconds(comp2.time);
            
            const winner = time1 < time2 ? comp1.userId : comp2.userId;
            const loser = winner === comp1.userId ? comp2.userId : comp1.userId;
            
            challenge.winner = winner;
            challenge.loser = loser;
            
            // Award lines to winner (deduct from loser)
            this.awardChallengeWin(winner, loser, challenge.wagerLines);
        }
        
        localStorage.setItem('friendChallenges', JSON.stringify(challenges));
        
        return challenge;
    }
    
    // Award lines for winning friend challenge
    awardChallengeWin(winnerId, loserId, wagerLines) {
        // In production, update database
        if (winnerId === 'current_user') {
            let monthlyLines = parseInt(localStorage.getItem('monthlyLines') || '0');
            monthlyLines += wagerLines;
            localStorage.setItem('monthlyLines', monthlyLines.toString());
        }
        
        // Record transaction
        const lineHistory = JSON.parse(localStorage.getItem('lineHistory') || '[]');
        lineHistory.push({
            timestamp: new Date().toISOString(),
            type: 'friend_challenge_win',
            amount: wagerLines,
            opponent: loserId
        });
        localStorage.setItem('lineHistory', JSON.stringify(lineHistory));
    }
    
    // Convert time string to seconds
    timeToSeconds(timeString) {
        const [minutes, seconds] = timeString.split(':').map(Number);
        return minutes * 60 + seconds;
    }
    
    // Get pending friend challenges
    getPendingChallenges(userId) {
        const challenges = JSON.parse(localStorage.getItem('friendChallenges') || '[]');
        return challenges.filter(c => 
            c.to === userId && 
            c.status === 'pending'
        );
    }
    
    // Get active friend challenges
    getActiveChallenges(userId) {
        const challenges = JSON.parse(localStorage.getItem('friendChallenges') || '[]');
        return challenges.filter(c => 
            (c.from === userId || c.to === userId) && 
            c.status === 'accepted'
        );
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DailyChallengeManager, FriendsLeague };
} else {
    window.DailyChallengeManager = DailyChallengeManager;
    window.FriendsLeague = FriendsLeague;
}

// Usage Example:
/*

// Initialize daily challenge manager
const dailyChallenge = new DailyChallengeManager();

// Display today's challenge
function displayDailyChallenge() {
    const challenge = dailyChallenge.challenge;
    const timeRemaining = dailyChallenge.getTimeRemaining();
    const leaderboard = dailyChallenge.getLeaderboard(10);
    
    const html = `
        <div class="daily-challenge-card">
            <h2>🔥 Daily Challenge</h2>
            <p class="time-remaining">⏰ ${timeRemaining} remaining</p>
            
            <div class="challenge-info">
                <h3>${challenge.challenge.title}</h3>
                <p>${challenge.challenge.question}</p>
                <div class="challenge-meta">
                    <span>${challenge.challenge.language}</span>
                    <span>${challenge.challenge.difficulty}</span>
                    <span>${challenge.challenge.steps} steps</span>
                </div>
            </div>
            
            <div class="leaderboard">
                <h4>🏆 Top 10</h4>
                ${leaderboard.map((entry, idx) => `
                    <div class="leaderboard-entry rank-${idx + 1}">
                        <span class="rank">#${idx + 1}</span>
                        <span class="username">${entry.username}</span>
                        <span class="time">${entry.time}</span>
                        <span class="efficiency">${entry.efficiency}%</span>
                    </div>
                `).join('')}
            </div>
            
            <button onclick="startDailyChallenge()">Start Challenge</button>
        </div>
    `;
    
    document.getElementById('dailyChallengeContainer').innerHTML = html;
}

// When user completes the daily challenge
function onDailyChallengeComplete(completionTime, linesUsed) {
    const result = dailyChallenge.submitCompletion(
        'current_user',
        'CurrentUsername',
        completionTime,
        linesUsed
    );
    
    if (result.alreadyCompleted) {
        alert('You already completed today\'s challenge!');
        return;
    }
    
    const message = `
        🎉 Daily Challenge Complete!
        
        Rank: #${result.rank}
        Streak: ${result.streak.count} days
        
        Rewards:
        ${result.rewards.rankBonus > 0 ? `Rank Bonus: +${result.rewards.rankBonus} lines\n` : ''}
        ${result.rewards.streakBonus > 0 ? `Streak Bonus: +${result.rewards.streakBonus} lines\n` : ''}
        Participation: +${result.rewards.participationBonus} lines
        
        Total: +${result.rewards.totalLines} lines!
    `;
    
    alert(message);
    
    // Refresh displays
    displayDailyChallenge();
    updateLinesDisplay();
}

*/
