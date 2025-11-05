// Game State
let secretNumber;
let attempts;
let maxNumber;
let gameActive = false;

// Sound Effects
const sounds = {
    click: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3'),
    win: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'),
    lose: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-game-over-213.mp3'),
    correct: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3'),
    wrong: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3')
};

// Load best scores from localStorage
let bestScores = {
    10: parseInt(localStorage.getItem('bestScore_10')) || null,
    50: parseInt(localStorage.getItem('bestScore_50')) || null,
    100: parseInt(localStorage.getItem('bestScore_100')) || null
};

// DOM Elements
const difficultyScreen = document.getElementById('difficulty-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const rangeDisplay = document.getElementById('range');
const hintElement = document.getElementById('hint');
const attemptsDisplay = document.getElementById('attempts');
const finalAttemptsDisplay = document.getElementById('final-attempts');
const bestScoreDisplay = document.getElementById('best-score');
const guessInput = document.getElementById('guess-input');
const submitButton = document.getElementById('submit-guess');
const resultMessage = document.getElementById('result-message');
const resultIcon = document.querySelector('.result-icon');

// DOM Elements
const guessForm = document.getElementById('guess-form');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Update best score display on menu screen
    updateBestScoresDisplay();
    
    // Handle form submission
    if (guessForm) {
        guessForm.addEventListener('submit', (e) => {
            e.preventDefault();
            playSound('click');
            checkGuess();
        });
    }
    
    // Handle enter key in input
    if (guessInput) {
        guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                playSound('click');
                checkGuess();
            }
        });
        
        // Handle input validation
        guessInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value.length > 3) {
                e.target.value = value.slice(0, 3);
            }
        });
    }
    
    // Add click animation to all buttons
    document.querySelectorAll('button').forEach(button => {
        if (button.type !== 'submit') { // Don't double-trigger form submission
            button.addEventListener('click', () => playSound('click'));
        }
    });
    
    // Initialize tooltips
    initializeTooltips();
});

function startGame(max) {
    playSound('click');
    maxNumber = max;
    secretNumber = Math.floor(Math.random() * max) + 1;
    attempts = 0;
    gameActive = true;
    
    // Update UI
    rangeDisplay.textContent = `1-${max}`;
    document.getElementById('attempts').textContent = '0';
    hintElement.innerHTML = '<i class="fas fa-lightbulb"></i><span>Take a guess!</span>';
    hintElement.className = 'hint';
    guessInput.value = '';
    guessInput.focus();
    guessInput.min = '1';
    guessInput.max = max.toString();
    
    // Animate transition
    animateScreenChange(difficultyScreen, gameScreen);
    
    // Update best score display for current difficulty
    updateBestScoreDisplay(max);
}

function checkGuess() {
    if (!gameActive || !guessInput) return;
    
    const guess = parseInt(guessInput.value.trim());
    
    // Validate input
    if (isNaN(guess) || guess < 1 || guess > maxNumber) {
        showHint(`Please enter a number between 1 and ${maxNumber}`, 'error');
        playSound('wrong');
        shakeElement(guessInput);
        return;
    }
    
    attempts++;
    const attemptsDisplay = document.getElementById('attempts');
    if (attemptsDisplay) attemptsDisplay.textContent = attempts;
    
    // Animate the guess
    animateGuess(guess);
    
    // Check guess
    if (guess < secretNumber) {
        showHint('Higher! <i class="fas fa-arrow-up"></i>', 'hint');
        playSound('wrong');
    } else if (guess > secretNumber) {
        showHint('Lower! <i class="fas fa-arrow-down"></i>', 'hint');
        playSound('wrong');
    } else {
        // Correct guess
        showResult();
        return;
    }
    
    // Add pulse animation to input for next guess
    if (guessInput) {
        guessInput.value = '';
        guessInput.focus();
        guessInput.classList.add('pulse');
        setTimeout(() => {
            if (guessInput) guessInput.classList.remove('pulse');
        }, 500);
    }
}

function showHint(message, type = 'hint') {
    hintElement.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'lightbulb'}"></i><span>${message}</span>`;
    hintElement.className = `hint ${type}`;
    
    // Add animation
    hintElement.style.animation = 'none';
    hintElement.offsetHeight; // Trigger reflow
    hintElement.style.animation = 'fadeIn 0.3s';
}

function animateGuess(guess) {
    const diff = Math.abs(guess - secretNumber);
    const maxDiff = maxNumber / 2;
    const closeness = 1 - (diff / maxDiff);
    
    // Add visual feedback based on how close the guess was
    if (diff <= maxNumber * 0.1) {
        // Very close
        document.body.style.setProperty('--hint-color', 'rgba(76, 175, 80, 0.2)');
    } else if (diff <= maxNumber * 0.3) {
        // Somewhat close
        document.body.style.setProperty('--hint-color', 'rgba(255, 193, 7, 0.2)');
    } else {
        // Not close
        document.body.style.setProperty('--hint-color', 'rgba(244, 67, 54, 0.1)');
    }
}

function showResult() {
    gameActive = false;
    playSound('win');
    
    // Update best score if needed
    const currentBest = bestScores[maxNumber];
    const isNewBest = !currentBest || attempts < currentBest;
    
    if (isNewBest) {
        bestScores[maxNumber] = attempts;
        localStorage.setItem(`bestScore_${maxNumber}`, attempts);
        resultMessage.innerHTML = '🎉 New Best Score!';
        resultIcon.innerHTML = '<i class="fas fa-trophy"></i>';
        resultIcon.classList.add('celebrate');
        playSound('correct');
    } else {
        resultMessage.textContent = attempts <= 3 ? '🎉 Amazing!' : attempts <= 7 ? '🎯 Great Job!' : '👍 You did it!';
        resultIcon.innerHTML = attempts <= 5 ? '<i class="fas fa-star"></i>' : '<i class="fas fa-thumbs-up"></i>';
        resultIcon.classList.remove('celebrate');
    }
    
    // Update result screen
    finalAttemptsDisplay.textContent = attempts;
    bestScoreDisplay.textContent = bestScores[maxNumber] || '-';
    
    // Show confetti for new best score
    if (isNewBest) {
        createConfetti();
    }
    
    // Animate to result screen
    animateScreenChange(gameScreen, resultScreen);
    
    // Update best scores display
    updateBestScoresDisplay();
}

function backToMenu() {
    playSound('click');
    animateScreenChange(resultScreen, difficultyScreen);
}

function playAgain() {
    playSound('click');
    animateScreenChange(resultScreen, gameScreen, () => {
        hintElement.innerHTML = '<i class="fas fa-lightbulb"></i><span>Take a guess!</span>';
        hintElement.className = 'hint';
        guessInput.value = '';
        guessInput.focus();
        gameActive = true;
    });
}

// Helper Functions
function playSound(soundName) {
    if (sounds[soundName]) {
        const sound = sounds[soundName].cloneNode();
        sound.volume = 0.3;
        sound.play().catch(e => console.log('Audio play failed:', e));
    }
}

function animateScreenChange(fromScreen, toScreen, callback) {
    fromScreen.style.animation = 'fadeOut 0.3s forwards';
    
    setTimeout(() => {
        fromScreen.classList.remove('active');
        toScreen.classList.add('active');
        toScreen.style.animation = 'fadeIn 0.5s forwards';
        
        if (typeof callback === 'function') {
            callback();
        }
    }, 300);
}

function shakeElement(element) {
    element.style.animation = 'shake 0.5s';
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

function updateBestScoresDisplay() {
    // Update best scores on difficulty buttons
    for (const [difficulty, score] of Object.entries(bestScores)) {
        const scoreElement = document.getElementById(`best-score-${difficulty}`);
        if (scoreElement) {
            scoreElement.textContent = score ? `Best: ${score}` : '';
            scoreElement.style.display = score ? 'block' : 'none';
        }
    }
    
    // Update best score on result screen if on result screen
    if (resultScreen.classList.contains('active')) {
        bestScoreDisplay.textContent = bestScores[maxNumber] || '-';
    }
}

function createConfetti() {
    const colors = ['#6c63ff', '#4caf50', '#ff9800', '#f44336', '#2196f3'];
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '1000';
    
    document.body.appendChild(container);
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.position = 'absolute';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.borderRadius = '50%';
        confetti.style.opacity = '0.8';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        container.appendChild(confetti);
        
        const animation = confetti.animate([
            { top: '-10px', transform: 'rotate(0deg)' },
            { top: '100vh', transform: 'rotate(360deg)' }
        ], {
            duration: 2000 + Math.random() * 3000,
            easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
            delay: Math.random() * 2000
        });
        
        animation.onfinish = () => {
            confetti.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        };
    }
    
    // Auto-remove container after animation
    setTimeout(() => {
        if (document.body.contains(container)) {
            container.remove();
        }
    }, 5000);
}

function initializeTooltips() {
    // Add tooltips to buttons
    const tooltips = {
        'easy': 'Perfect for beginners! Numbers from 1 to 10',
        'medium': 'A bit more challenging! Numbers from 1 to 50',
        'hard': 'For the pros! Numbers from 1 to 100'
    };
    
    Object.entries(tooltips).forEach(([className, text]) => {
        const button = document.querySelector(`.${className}`);
        if (button) {
            button.setAttribute('data-tooltip', text);
        }
    });
}
