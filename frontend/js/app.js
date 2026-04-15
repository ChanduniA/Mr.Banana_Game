// Game Data & Config
// Initialize EmailJS
emailjs.init("TR8mvTaOb-IbCfdcT");

// NOTE: mockUsers replaced by Firestore — accounts now persist across sessions
const FRUITS = ['🍌', '🍎', '🍊', '🍇', '🍓', '🍉', '🍍', '🍒', '🍑', '🥭', '🥝', '🥥', '🍋', '🍐', '🍈'];

// Banana Arithmetic Config
const BANANA_TIMERS = {
    easy:   100,
    medium:  75,
    hard:    50
};

const BANANA_LEVEL_LABELS = {
    easy:   'Junior Banana',
    medium: 'Senior Banana',
    hard:   'Professor Banana'
};

const LEVELS = {
    easy: { pairs: 8, rows: 4, cols: 4, label: 'Easy', title: "You are now a proud Junior Banana!", desc: "Great Start, Keep Going!" },
    medium: { pairs: 10, rows: 4, cols: 5, label: 'Medium', title: "You've mastered the path of a Senior Banana!", desc: "Great Progress, Keep Climbing!" },
    hard: { pairs: 15, rows: 5, cols: 6, label: 'Hard', title: "You are now the Legendary Professor Banana!", desc: "Ultimate Achievement, You're a True Master!" }
};

// Application State
let state = {
    player: null,
    currentLevel: null,
    currentLevelKey: null,
    score: 0,
    hasFoundFirstPair: false,
    lockBoard: false,
    firstCard: null,
    secondCard: null,
    matchedPairs: 0,
    expectedOTP: null
};

// Banana Arithmetic State
let bananaState = {
    timeLeft: 100,
    totalTime: 100,
    score: 0,
    puzzlesSolved: 0,
    currentSolution: null,
    timerInterval: null,
    levelKey: null
};

// DOM Elements
const views = {
    auth: document.getElementById('view-auth'),
    otp: document.getElementById('view-otp'),
    level: document.getElementById('view-level'),
    game: document.getElementById('view-game'),
    banana: document.getElementById('view-banana'),
    leaderboard: document.getElementById('view-leaderboard')
};

const dom = {
    authForm: document.getElementById('auth-form'),
    playerEmailInput: document.getElementById('player-email-input'),
    playerNameInput: document.getElementById('player-name-input'),
    playerPasswordInput: document.getElementById('player-password-input'),
    mainAuthBtn: document.getElementById('main-auth-btn'),
    authToggleText: document.getElementById('auth-toggle-text'),
    authTitle: document.getElementById('auth-title'),
    authSubtitle: document.getElementById('auth-subtitle'),
    authMessage: document.getElementById('auth-message'),
    
    // OTP DOM Elements
    otpBoxes: [
        document.getElementById('otp1'),
        document.getElementById('otp2'),
        document.getElementById('otp3'),
        document.getElementById('otp4')
    ],
    verifyOtpBtn: document.getElementById('verify-otp-btn'),
    cancelOtpBtn: document.getElementById('cancel-otp-btn'),
    otpMessage: document.getElementById('otp-message'),

    welcomeMessage: document.getElementById('welcome-message'),
    levelButtons: document.querySelectorAll('.level-btn'),
    
    levelIndicator: document.getElementById('level-indicator'),
    scoreDisplay: document.getElementById('score-display'),
    cardGrid: document.getElementById('card-grid'),
    
    restartBtn: document.getElementById('restart-btn'),
    backBtn: document.getElementById('back-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    levelLogoutBtn: document.getElementById('level-logout-btn'),
    winModal: document.getElementById('win-modal'),
    winMessage: document.getElementById('win-message'),
    winOkBtn: document.getElementById('win-ok-btn'),

    // Banana Arithmetic DOM
    bananaBackBtn: document.getElementById('banana-back-btn'),
    bananaLevelLabel: document.getElementById('banana-level-label'),
    bananaScoreDisplay: document.getElementById('banana-score-display'),
    bananaTimerDisplay: document.getElementById('banana-timer-display'),
    timerRingCircle: document.getElementById('timer-ring-circle'),
    bananaPuzzleImg: document.getElementById('banana-puzzle-img'),
    puzzleLoading: document.getElementById('puzzle-loading'),
    bananaAnswerInput: document.getElementById('banana-answer-input'),
    bananaSubmitBtn: document.getElementById('banana-submit-btn'),
    bananaFeedbackCorrect: document.getElementById('banana-feedback-correct'),
    bananaFeedbackWrong: document.getElementById('banana-feedback-wrong'),
    bananaPuzzlesCount: document.getElementById('banana-puzzles-count'),
    bananaEndModal: document.getElementById('banana-end-modal'),
    bananaEndScore: document.getElementById('banana-end-score'),
    bananaEndPuzzles: document.getElementById('banana-end-puzzles'),
    bananaPlayAgainBtn: document.getElementById('banana-play-again-btn'),
    bananaEndBackBtn: document.getElementById('banana-end-back-btn'),

    // Leaderboard DOM
    leaderboardBtn: document.getElementById('leaderboard-btn'),
    leaderboardBackBtn: document.getElementById('leaderboard-back-btn'),
    lbLoading: document.getElementById('lb-loading'),
    lbEmpty: document.getElementById('lb-empty'),
    lbTable: document.getElementById('lb-table'),
    lbTbody: document.getElementById('lb-tbody'),
    lbTabs: document.querySelectorAll('.lb-tab'),
    lbFilterBtns: document.querySelectorAll('.lb-filter-btn')
};

// Helper: Switch Views
function showView(viewName) {
    Object.values(views).forEach(v => {
        v.classList.remove('active');
        v.classList.add('hidden');
    });
    views[viewName].classList.remove('hidden');
    
    // Slight delay to allow CSS reflow for fade in animation
    setTimeout(() => {
        views[viewName].classList.add('active');
    }, 10);
}

// ----- Authentication -----
let isRegisterMode = false;

dom.authToggleText.addEventListener('click', () => {
    SoundEngine.click();
    isRegisterMode = !isRegisterMode;
    if (isRegisterMode) {
        dom.authTitle.textContent = "Register now";
        dom.authSubtitle.textContent = "Please set your name and password";
        dom.mainAuthBtn.textContent = "Register";
        dom.authToggleText.textContent = "Already have an account? Login here";
        dom.playerEmailInput.classList.remove('hidden');
    } else {
        dom.authTitle.textContent = "Welcome to the Game";
        dom.authSubtitle.textContent = "Please enter your name to start playing!";
        dom.mainAuthBtn.textContent = "Login";
        dom.authToggleText.textContent = "No account? Register here";
        dom.playerEmailInput.classList.add('hidden');
    }
    dom.playerNameInput.value = "";
    dom.playerPasswordInput.value = "";
    dom.authMessage.classList.add('hidden');
});

dom.authForm.addEventListener('submit', (e) => {
    SoundEngine.click();
    e.preventDefault();
    if (isRegisterMode) {
        handleRegister();
    } else {
        handleAuth();
    }
});

async function handleRegister() {
    const email = dom.playerEmailInput.value.trim();
    const name = dom.playerNameInput.value.trim();
    const pass = dom.playerPasswordInput.value.trim();
    if (!name || !pass || !email) return;

    dom.mainAuthBtn.disabled = true;
    dom.authMessage.textContent = 'Checking...';
    dom.authMessage.style.color = '#fce205';
    dom.authMessage.classList.remove('hidden');

    try {
        // Check if username already taken in Firestore
        const userDoc = await db.collection('users').doc(name).get();
        if (userDoc.exists) {
            dom.authMessage.textContent = 'Username already exists.';
            dom.authMessage.style.color = 'var(--danger-color)';
            setTimeout(() => dom.authMessage.classList.add('hidden'), 2500);
        } else {
            // Save new user to Firestore
            await db.collection('users').doc(name).set({
                name: name,
                email: email,
                password: pass,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            dom.authMessage.textContent = 'Account registered! Switching to login...';
            dom.authMessage.style.color = '#2ecc71';
            setTimeout(() => {
                isRegisterMode = false;
                dom.authTitle.textContent = 'Welcome to the Game';
                dom.authSubtitle.textContent = 'Please enter your name to start playing!';
                dom.mainAuthBtn.textContent = 'Login';
                dom.authToggleText.textContent = 'No account? Register here';
                dom.playerEmailInput.classList.add('hidden');
                dom.playerNameInput.value = name;
                dom.playerPasswordInput.value = pass;
                dom.authMessage.classList.add('hidden');
            }, 1000);
        }
    } catch (err) {
        console.error('Register error:', err);
        dom.authMessage.textContent = 'Error saving account. Try again.';
        dom.authMessage.style.color = 'var(--danger-color)';
        setTimeout(() => dom.authMessage.classList.add('hidden'), 3000);
    } finally {
        dom.mainAuthBtn.disabled = false;
    }
}

async function handleAuth() {
    const name = dom.playerNameInput.value.trim();
    const pass = dom.playerPasswordInput.value.trim();
    if (!name || !pass) return;

    dom.mainAuthBtn.disabled = true;
    dom.authMessage.textContent = 'Checking credentials...';
    dom.authMessage.style.color = '#fce205';
    dom.authMessage.classList.remove('hidden');

    try {
        // Fetch user from Firestore
        const userDoc = await db.collection('users').doc(name).get();
        if (!userDoc.exists || userDoc.data().password !== pass) {
            dom.authMessage.textContent = 'Invalid username or password.';
            dom.authMessage.style.color = 'var(--danger-color)';
            setTimeout(() => dom.authMessage.classList.add('hidden'), 2500);
            dom.mainAuthBtn.disabled = false;
            return;
        }

        // Credentials valid — store email for OTP, send via EmailJS
        state.player = name;
        state.playerEmail = userDoc.data().email;
        state.expectedOTP = Math.floor(1000 + Math.random() * 9000).toString();

        dom.authMessage.textContent = 'Sending OTP email...';
        dom.authMessage.style.color = '#2ecc71';

        const templateParams = {
            otp_code: state.expectedOTP,
            user_email: state.playerEmail,
            to_name: name
        };

        emailjs.send('service_hkoai68', 'template_aifkfos', templateParams)
            .then(() => {
                showView('otp');
                dom.playerNameInput.value = '';
                dom.playerPasswordInput.value = '';
                dom.authMessage.classList.add('hidden');
                dom.otpBoxes.forEach(box => box.value = '');
                dom.otpMessage.classList.add('hidden');
            }, (error) => {
                console.error('EmailJS error:', error);
                dom.authMessage.textContent = 'Failed to send email. Try again.';
                dom.authMessage.style.color = 'var(--danger-color)';
                setTimeout(() => dom.authMessage.classList.add('hidden'), 3000);
            });
    } catch (err) {
        console.error('Login error:', err);
        dom.authMessage.textContent = 'Login error. Check your connection.';
        dom.authMessage.style.color = 'var(--danger-color)';
        setTimeout(() => dom.authMessage.classList.add('hidden'), 3000);
    } finally {
        dom.mainAuthBtn.disabled = false;
    }
}

// ----- OTP Logic -----
dom.otpBoxes.forEach((box, index) => {
    box.addEventListener('input', (e) => {
        // Auto-advance
        if (e.target.value.length === 1 && index < 3) {
            dom.otpBoxes[index + 1].focus();
        }
    });
    box.addEventListener('keydown', (e) => {
        // Auto-backspace
        if (e.key === "Backspace" && e.target.value === "" && index > 0) {
            dom.otpBoxes[index - 1].focus();
        }
    });
});

dom.verifyOtpBtn.addEventListener('click', () => {
    SoundEngine.click();
    const enteredCode = dom.otpBoxes.map(box => box.value).join('');
    if (enteredCode === state.expectedOTP) {
        // Validation Passes
        dom.welcomeMessage.textContent = `Welcome ${state.player}!`;
        showView('level');
        state.expectedOTP = null; // Reset
    } else {
        dom.otpMessage.classList.remove('hidden');
        setTimeout(() => dom.otpMessage.classList.add('hidden'), 3000);
        dom.otpBoxes.forEach(box => box.value = '');
        dom.otpBoxes[0].focus();
    }
});

dom.cancelOtpBtn.addEventListener('click', () => {
    SoundEngine.click();
    state.player = null;
    state.expectedOTP = null;
    showView('auth');
});

// ----- Level Selection -----
dom.levelButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        SoundEngine.click();
        const levelKey = btn.dataset.level;
        startGame(levelKey);
    });
});

// ----- Game Initialization -----
function startGame(levelKey) {
    state.currentLevel = LEVELS[levelKey];
    state.currentLevelKey = levelKey;
    dom.levelIndicator.textContent = `Level : ${state.currentLevel.label}`;
    showView('game');
    initBoard();
}

function initBoard() {
    // Reset Game State
    state.score = 0;
    state.hasFoundFirstPair = false;
    state.lockBoard = false;
    state.firstCard = null;
    state.secondCard = null;
    state.matchedPairs = 0;
    updateScore();
    
    // Clear Board
    dom.cardGrid.innerHTML = '';
    
    // Setup grid classes
    dom.cardGrid.className = `card-grid grid-${state.currentLevel.label.toLowerCase()}`;
    
    // Generate Cards Array
    const neededFruits = FRUITS.slice(0, state.currentLevel.pairs);
    const deck = [...neededFruits, ...neededFruits]; // Duplicate to make pairs
    
    // Shuffle Deck (Fisher-Yates)
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    // Inject into DOM
    deck.forEach(fruit => {
        const cardElt = document.createElement('div');
        cardElt.classList.add('memory-card');
        cardElt.dataset.fruit = fruit;
        
        const frontFace = document.createElement('div');
        frontFace.classList.add('card-front');
        frontFace.textContent = fruit;
        
        const backFace = document.createElement('div');
        backFace.classList.add('card-back');
        
        cardElt.appendChild(frontFace);
        cardElt.appendChild(backFace);
        
        cardElt.addEventListener('click', flipCard);
        
        dom.cardGrid.appendChild(cardElt);
    });
}

// ----- File Logic -----
function flipCard() {
    if (state.lockBoard) return;
    if (this === state.firstCard) return;

    SoundEngine.flip(); // Play flip sound on every card flip
    this.classList.add('flip');

    if (!state.firstCard) {
        // First click
        state.firstCard = this;
        return;
    }

    // Second click
    state.secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = state.firstCard.dataset.fruit === state.secondCard.dataset.fruit;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    state.firstCard.removeEventListener('click', flipCard);
    state.secondCard.removeEventListener('click', flipCard);
    
    // Add matched visual styling
    state.firstCard.querySelector('.card-front').classList.add('matched');
    state.secondCard.querySelector('.card-front').classList.add('matched');

    // Score Logic
    state.score += 10;
    state.hasFoundFirstPair = true;
    state.matchedPairs++;
    updateScore();

    // Check for win
    if (state.matchedPairs === state.currentLevel.pairs) {
        // Save flip card score to Firestore
        saveScore('flipcard', state.currentLevelKey, state.score);
        setTimeout(() => {
            dom.winMessage.innerHTML = `${state.currentLevel.title}<br>
            <span style="margin-top: 15px; display: inline-block; font-size: 1.3rem; color: var(--primary-color); font-weight: bold;">Score : ${state.score}</span><br>
            <span style="font-size: 1.1rem; opacity: 0.9; display: inline-block; margin-bottom: 20px;">${state.currentLevel.desc}</span><br>
            <span style="font-size: 1.2rem; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; display: block;">Ready for the Next Challenge?</span>`;
            dom.winModal.classList.remove('hidden');
        }, 500);
    }

    resetBoard();
}

function unflipCards() {
    state.lockBoard = true;

    // Score Logic
    if (state.hasFoundFirstPair) {
        state.score -= 2;
        updateScore();
    }

    setTimeout(() => {
        state.firstCard.classList.remove('flip');
        state.secondCard.classList.remove('flip');

        resetBoard();
    }, 1000);
}

function resetBoard() {
    [state.firstCard, state.secondCard] = [null, null];
    state.lockBoard = false;
}

function updateScore() {
    dom.scoreDisplay.textContent = state.score;
}

// ----- Game Controls -----
dom.restartBtn.addEventListener('click', () => {
    SoundEngine.click();
    dom.cardGrid.style.opacity = 0;
    setTimeout(() => {
        initBoard();
        dom.cardGrid.style.opacity = 1;
    }, 300);
});

dom.backBtn.addEventListener('click', () => {
    SoundEngine.click();
    showView('level');
});

dom.logoutBtn.addEventListener('click', () => {
    SoundEngine.click();
    state.player = null;
    dom.playerNameInput.value = "";
    dom.playerPasswordInput.value = "";
    dom.playerEmailInput.value = "";
    showView('auth');
});

dom.levelLogoutBtn.addEventListener('click', () => {
    SoundEngine.click();
    state.player = null;
    dom.playerNameInput.value = "";
    dom.playerPasswordInput.value = "";
    dom.playerEmailInput.value = "";
    showView('auth');
});

dom.winOkBtn.addEventListener('click', () => {
    dom.winModal.classList.add('hidden');
    // Transition to Banana Arithmetic game
    startBananaGame(state.currentLevelKey);
});

// ========== BANANA ARITHMETIC GAME ==========

const TIMER_RADIUS = 52; // must match SVG r attribute
const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;

function setTimerRing(timeLeft, totalTime) {
    const fraction = timeLeft / totalTime;
    const offset = TIMER_CIRCUMFERENCE * (1 - fraction);
    dom.timerRingCircle.style.strokeDashoffset = offset;
    // Colour shift: green -> yellow -> red
    if (fraction > 0.5) {
        dom.timerRingCircle.style.stroke = '#2ecc71';
    } else if (fraction > 0.25) {
        dom.timerRingCircle.style.stroke = '#fce205';
    } else {
        dom.timerRingCircle.style.stroke = '#ff4d4d';
    }
}

function startBananaGame(levelKey) {
    bananaState.levelKey = levelKey;
    bananaState.timeLeft = BANANA_TIMERS[levelKey];
    bananaState.totalTime = BANANA_TIMERS[levelKey];
    bananaState.score = 0;
    bananaState.puzzlesSolved = 0;
    bananaState.currentSolution = null;

    // Update UI labels
    dom.bananaLevelLabel.textContent = BANANA_LEVEL_LABELS[levelKey];
    dom.bananaScoreDisplay.textContent = '0';
    dom.bananaPuzzlesCount.textContent = '0';
    dom.bananaTimerDisplay.textContent = bananaState.timeLeft;
    dom.bananaAnswerInput.value = '';
    dom.bananaFeedbackCorrect.classList.add('hidden');
    dom.bananaFeedbackWrong.classList.add('hidden');
    dom.bananaEndModal.classList.add('hidden');

    // Init ring
    dom.timerRingCircle.style.strokeDasharray = TIMER_CIRCUMFERENCE;
    setTimerRing(bananaState.timeLeft, bananaState.totalTime);

    showView('banana');
    fetchBananaPuzzle();
    startBananaTimer();
}

function startBananaTimer() {
    clearInterval(bananaState.timerInterval);
    SoundEngine.tickStart(); // Start ticking when banana countdown begins
    bananaState.timerInterval = setInterval(() => {
        bananaState.timeLeft--;
        dom.bananaTimerDisplay.textContent = bananaState.timeLeft;
        setTimerRing(bananaState.timeLeft, bananaState.totalTime);

        if (bananaState.timeLeft <= 0) {
            clearInterval(bananaState.timerInterval);
            SoundEngine.tickStop(); // Stop ticking when time runs out
            endBananaGame();
        }
    }, 1000);
}

function fetchBananaPuzzle() {
    // Show loading, hide old image
    dom.bananaPuzzleImg.style.opacity = '0';
    dom.puzzleLoading.classList.remove('hidden');
    dom.bananaAnswerInput.value = '';
    dom.bananaAnswerInput.disabled = true;
    dom.bananaSubmitBtn.disabled = true;

    // Use a CORS proxy-free approach: fetch JSON from Banana API
    fetch('https://marcconrad.com/uob/banana/api.php?out=json')
        .then(res => res.json())
        .then(data => {
            // data.question = image URL, data.solution = answer digit
            bananaState.currentSolution = String(data.solution);
            dom.bananaPuzzleImg.src = data.question;
            dom.bananaPuzzleImg.onload = () => {
                dom.puzzleLoading.classList.add('hidden');
                dom.bananaPuzzleImg.style.opacity = '1';
                dom.bananaAnswerInput.disabled = false;
                dom.bananaSubmitBtn.disabled = false;
                dom.bananaAnswerInput.focus();
            };
            dom.bananaPuzzleImg.onerror = () => {
                // Fallback: if image fails still enable input
                dom.puzzleLoading.textContent = 'Puzzle image loaded!';
                dom.puzzleLoading.classList.add('hidden');
                dom.bananaAnswerInput.disabled = false;
                dom.bananaSubmitBtn.disabled = false;
            };
        })
        .catch(() => {
            dom.puzzleLoading.textContent = 'Failed to load puzzle. Retrying...';
            setTimeout(fetchBananaPuzzle, 2000);
        });
}

function showBananaFeedback(correct) {
    const el = correct ? dom.bananaFeedbackCorrect : dom.bananaFeedbackWrong;
    const other = correct ? dom.bananaFeedbackWrong : dom.bananaFeedbackCorrect;
    other.classList.add('hidden');
    el.classList.remove('hidden');
    el.classList.remove('feedback-animate');
    // Trigger reflow for re-animation
    void el.offsetWidth;
    el.classList.add('feedback-animate');
    setTimeout(() => el.classList.add('hidden'), 1500);
}

function checkBananaAnswer() {
    const inputVal = dom.bananaAnswerInput.value.trim();
    if (inputVal === '') return;

    if (inputVal === bananaState.currentSolution) {
        // Correct!
        bananaState.score += 10;
        bananaState.puzzlesSolved++;
        dom.bananaScoreDisplay.textContent = bananaState.score;
        dom.bananaPuzzlesCount.textContent = bananaState.puzzlesSolved;
        showBananaFeedback(true);
        // Load next puzzle after short delay
        setTimeout(() => fetchBananaPuzzle(), 600);
    } else {
        // Wrong – clear input, no penalty
        showBananaFeedback(false);
        dom.bananaAnswerInput.value = '';
        dom.bananaAnswerInput.focus();
    }
}

function endBananaGame() {
    dom.bananaAnswerInput.disabled = true;
    dom.bananaSubmitBtn.disabled = true;
    dom.bananaEndScore.textContent = bananaState.score;
    dom.bananaEndPuzzles.textContent = bananaState.puzzlesSolved;
    dom.bananaEndModal.classList.remove('hidden');
    // Save banana score to Firestore
    saveScore('banana', bananaState.levelKey, bananaState.score, { puzzlesSolved: bananaState.puzzlesSolved });
}

// Banana event listeners
dom.bananaSubmitBtn.addEventListener('click', checkBananaAnswer);

dom.bananaAnswerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkBananaAnswer();
});

dom.bananaBackBtn.addEventListener('click', () => {
    clearInterval(bananaState.timerInterval);
    SoundEngine.tickStop(); // Stop ticking when leaving banana game
    dom.bananaEndModal.classList.add('hidden');
    showView('level');
});

dom.bananaPlayAgainBtn.addEventListener('click', () => {
    SoundEngine.tickStop(); // Stop any leftover tick before restarting
    dom.bananaEndModal.classList.add('hidden');
    startBananaGame(bananaState.levelKey);
});

dom.bananaEndBackBtn.addEventListener('click', () => {
    SoundEngine.tickStop(); // Stop ticking when going back from end modal
    dom.bananaEndModal.classList.add('hidden');
    clearInterval(bananaState.timerInterval);
    showView('level');
});

// ========== FIRESTORE HELPERS ==========

// Save score to Firestore
function saveScore(gameType, level, score, extra = {}) {
    if (!state.player) return;
    db.collection('scores').add({
        playerName: state.player,
        gameType: gameType,
        level: level,
        score: score,
        puzzlesSolved: extra.puzzlesSolved || 0,
        playedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(err => console.error('Error saving score:', err));
}

// ========== LEADERBOARD ==========

let lbCurrentGame = 'flipcard';
let lbCurrentLevel = 'all';

function openLeaderboard() {
    lbCurrentGame = 'flipcard';
    lbCurrentLevel = 'all';
    // Reset UI
    dom.lbTabs.forEach(t => t.classList.remove('active'));
    document.getElementById('lb-tab-flipcard').classList.add('active');
    dom.lbFilterBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('.lb-filter-btn[data-level="all"]').classList.add('active');
    showView('leaderboard');
    loadLeaderboard();
}

async function loadLeaderboard() {
    dom.lbLoading.classList.remove('hidden');
    dom.lbLoading.textContent = 'Loading scores...';
    dom.lbEmpty.classList.add('hidden');
    dom.lbTable.classList.add('hidden');
    dom.lbTbody.innerHTML = '';

    try {
        // Simple query — no composite index needed
        // Fetch top 200 by score, then filter client-side
        const snapshot = await db.collection('scores')
            .orderBy('score', 'desc')
            .limit(200)
            .get();

        dom.lbLoading.classList.add('hidden');

        // Filter by current game type and level
        let scores = [];
        snapshot.forEach(doc => {
            const d = doc.data();
            if (d.gameType !== lbCurrentGame) return;
            if (lbCurrentLevel !== 'all' && d.level !== lbCurrentLevel) return;
            scores.push(d);
        });

        // Re-sort after filtering & take top 10
        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 10);

        if (scores.length === 0) {
            dom.lbEmpty.classList.remove('hidden');
            return;
        }

        const rankMedals = ['🥇', '🥈', '🥉'];
        scores.forEach((d, i) => {
            const rank = i + 1;
            const isMe = d.playerName === state.player;
            const date = d.playedAt ? d.playedAt.toDate().toLocaleDateString() : '-';
            const levelLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }[d.level] || d.level;
            const rankDisplay = rank <= 3 ? rankMedals[rank - 1] : `#${rank}`;

            const tr = document.createElement('tr');
            if (isMe) tr.classList.add('lb-my-row');
            tr.innerHTML = `
                <td class="lb-rank">${rankDisplay}</td>
                <td class="lb-player">${isMe ? '⭐ ' : ''}${d.playerName}</td>
                <td class="lb-score">${d.score}</td>
                <td class="lb-level">${levelLabel}</td>
                <td class="lb-date">${date}</td>
            `;
            dom.lbTbody.appendChild(tr);
        });

        dom.lbTable.classList.remove('hidden');
    } catch (err) {
        console.error('Leaderboard error:', err);
        dom.lbLoading.classList.remove('hidden');
        dom.lbLoading.textContent = 'Failed to load scores. Please try again.';
    }
}

// Leaderboard event listeners
dom.leaderboardBtn.addEventListener('click', () => { SoundEngine.click(); openLeaderboard(); });

dom.leaderboardBackBtn.addEventListener('click', () => { SoundEngine.click(); showView('level'); });

dom.lbTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        SoundEngine.click();
        dom.lbTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        lbCurrentGame = tab.dataset.game;
        loadLeaderboard();
    });
});

dom.lbFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        SoundEngine.click();
        dom.lbFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        lbCurrentLevel = btn.dataset.level;
        loadLeaderboard();
    });
});

// ----- Global Hover Sound on all buttons -----
document.querySelectorAll('.btn, .auth-toggle-badge').forEach(btn => {
    btn.addEventListener('mouseenter', () => SoundEngine.hover());
});
