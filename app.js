// Game Data & Config
// Initialize EmailJS
emailjs.init("TR8mvTaOb-IbCfdcT");

const mockUsers = {}; // Mock DB to store user: { pass, email }
const FRUITS = ['🍌', '🍎', '🍊', '🍇', '🍓', '🍉', '🍍', '🍒', '🍑', '🥭', '🥝', '🥥', '🍋', '🍐', '🍈'];

const LEVELS = {
    easy: { pairs: 8, rows: 4, cols: 4, label: 'Easy', title: "You are now a proud Junior Banana!", desc: "Great Start, Keep Going!" },
    medium: { pairs: 10, rows: 4, cols: 5, label: 'Medium', title: "You've mastered the path of a Senior Banana!", desc: "Great Progress, Keep Climbing!" },
    hard: { pairs: 15, rows: 5, cols: 6, label: 'Hard', title: "You are now the Legendary Professor Banana!", desc: "Ultimate Achievement, You're a True Master!" }
};

// Application State
let state = {
    player: null,
    currentLevel: null,
    score: 0,
    hasFoundFirstPair: false,
    lockBoard: false,
    firstCard: null,
    secondCard: null,
    matchedPairs: 0,
    expectedOTP: null
};

// DOM Elements
const views = {
    auth: document.getElementById('view-auth'),
    otp: document.getElementById('view-otp'),
    level: document.getElementById('view-level'),
    game: document.getElementById('view-game')
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
    winOkBtn: document.getElementById('win-ok-btn')
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
    e.preventDefault();
    if (isRegisterMode) {
        handleRegister();
    } else {
        handleAuth();
    }
});

function handleRegister() {
    const email = dom.playerEmailInput.value.trim();
    const name = dom.playerNameInput.value.trim();
    const pass = dom.playerPasswordInput.value.trim();
    if (name !== "" && pass !== "" && email !== "") {
        if (mockUsers[name]) {
            dom.authMessage.textContent = "Username already exists.";
            dom.authMessage.style.color = "var(--danger-color)";
            dom.authMessage.classList.remove('hidden');
            setTimeout(() => dom.authMessage.classList.add('hidden'), 2000);
        } else {
            mockUsers[name] = { pass: pass, email: email };
            dom.authMessage.textContent = "Account registered! Switching to login...";
            dom.authMessage.style.color = "#2ecc71";
            dom.authMessage.classList.remove('hidden');
            setTimeout(() => {
                isRegisterMode = false;
                dom.authTitle.textContent = "Welcome to the Game";
                dom.authSubtitle.textContent = "Please enter your name to start playing!";
                dom.mainAuthBtn.textContent = "Login";
                dom.authToggleText.textContent = "No account? Register here";
                dom.playerEmailInput.classList.add('hidden');
                dom.playerNameInput.value = name;
                dom.playerPasswordInput.value = pass;
                dom.authMessage.classList.add('hidden');
            }, 1000);
        }
    }
}

function handleAuth() {
    const name = dom.playerNameInput.value.trim();
    const pass = dom.playerPasswordInput.value.trim();
    if (name && pass) {
        if (mockUsers[name] && mockUsers[name].pass === pass) {
            state.player = name;
            
            // Generate Mock OTP
            state.expectedOTP = Math.floor(1000 + Math.random() * 9000).toString();
            
            // Show sending message to prevent rapid clicks
            dom.authMessage.textContent = "Sending real OTP email...";
            dom.authMessage.style.color = "#2ecc71";
            dom.authMessage.classList.remove('hidden');

            const templateParams = {
                otp_code: state.expectedOTP,
                user_email: mockUsers[name].email,
                to_name: name
            };

            emailjs.send('service_hkoai68', 'template_aifkfos', templateParams)
                .then(function(response) {
                    console.log('SUCCESS!', response.status, response.text);
                    // Show OTP View
                    showView('otp');
                    
                    // Clear inputs securely
                    dom.playerNameInput.value = "";
                    dom.playerPasswordInput.value = "";
                    dom.authMessage.classList.add('hidden');
                    
                    // Clear prior OTP boxes
                    dom.otpBoxes.forEach(box => box.value = '');
                    dom.otpMessage.classList.add('hidden');
                }, function(error) {
                    console.log('FAILED...', error);
                    dom.authMessage.textContent = "Failed to send email. Try again.";
                    dom.authMessage.style.color = "var(--danger-color)";
                    setTimeout(() => dom.authMessage.classList.add('hidden'), 3000);
                });

        } else {
            dom.authMessage.textContent = "invalid login";
            dom.authMessage.style.color = "var(--danger-color)";
            dom.authMessage.classList.remove('hidden');
            setTimeout(() => dom.authMessage.classList.add('hidden'), 2000);
        }
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
    state.player = null;
    state.expectedOTP = null;
    showView('auth');
});

// ----- Level Selection -----
dom.levelButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const levelKey = btn.dataset.level;
        startGame(levelKey);
    });
});

// ----- Game Initialization -----
function startGame(levelKey) {
    state.currentLevel = LEVELS[levelKey];
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
    // Look like an explicit restart visually
    dom.cardGrid.style.opacity = 0;
    setTimeout(() => {
        initBoard();
        dom.cardGrid.style.opacity = 1;
    }, 300);
});

dom.backBtn.addEventListener('click', () => {
    showView('level');
});

dom.logoutBtn.addEventListener('click', () => {
    state.player = null;
    dom.playerNameInput.value = "";
    dom.playerPasswordInput.value = "";
    dom.playerEmailInput.value = "";
    showView('auth');
});

dom.levelLogoutBtn.addEventListener('click', () => {
    state.player = null;
    dom.playerNameInput.value = "";
    dom.playerPasswordInput.value = "";
    dom.playerEmailInput.value = "";
    showView('auth');
});

dom.winOkBtn.addEventListener('click', () => {
    dom.winModal.classList.add('hidden');
    showView('level');
});
