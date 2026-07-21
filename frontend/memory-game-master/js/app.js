/*
 * Global variable declarations
 */
const deck = document.querySelector('.deck');
const ul = document.createDocumentFragment();
let cardsList = [];
let cards = [];
const moves = document.querySelector('.moves');
const restartBtn = document.querySelector('.restart');
const min = document.querySelector('.min');
const sec = document.querySelector('.sec');

let openCards = [];
let matchedCards = [];
let movesCounter = 0;

// === METRICS: variables to track gameplay ===
let clickTimestamps = [];
let wrongAttempts = 0;
let startTimestamp = null;
let endTimestamp = null;
let playerTime;
let timerOn = false;

// === NEW: ERROR FORGIVENESS LOGIC ===
const FORGIVENESS_WINDOW = 3; 
let forgivenErrors = 0;


// Initialize the game for the first time
document.addEventListener('DOMContentLoaded', initGame);

/*
 * Game Initialization
 */
function initGame() {
    // Reset all state variables
    resetGameState();

    // Create the card elements
    createCardElements();
    
    // Shuffle and add cards to the deck
    const shuffledCards = shuffle(cardsList);
    deck.innerHTML = ''; // Clear previous cards
    for (const card of shuffledCards) {
        deck.appendChild(card);
    }

    // Update the 'cards' NodeList with the newly created cards
    cards = document.querySelectorAll('.card');

    // Add click listeners to the cards
    for (const card of cards) {
        card.addEventListener('click', show);
    }
    
    // Reset timer display
    min.textContent = '00';
    sec.textContent = '00';
    moves.textContent = '0 Moves';
    starScore('.stars');
}


function createCardElements() {
    cardsList = []; // Clear the list before creating new cards
    const cardTypes = [1, 2, 3, 4, 5, 6, 7, 8];
    const allCardTypes = [...cardTypes, ...cardTypes]; // Create pairs

    for (const type of allCardTypes) {
        const li = document.createElement('li');
        li.className = 'card';
        const svg = `<svg role="img" class="icon fallback fallback-png-${type}" title="0${type}"></svg>`;
        li.innerHTML = svg;
        cardsList.push(li);
    }
}


/*
 * Event Listeners
 */
restartBtn.addEventListener('click', function() {
    restart();
});

deck.addEventListener('click', function(e) {
    if (!timerOn && e.target.classList.contains('card') && openCards.length < 2) {
        startTimer();
    }
});


/*
 * Timer Functions
 */
function startTimer() {
    timerOn = true;
    if (!startTimestamp) {
        startTimestamp = Date.now();
    }
    let secondCounter = 0;
    let minuteCounter = 0;
    min.textContent = '00';
    sec.textContent = '00';
    playerTime = setInterval(() => {
        if (secondCounter === 59) {
            secondCounter = 0;
            minuteCounter++;
            min.textContent = minuteCounter < 10 ? '0' + minuteCounter : minuteCounter;
        }
        secondCounter++;
        sec.textContent = secondCounter < 10 ? '0' + secondCounter : secondCounter;
    }, 1000);
}

function stopTimer() {
    timerOn = false;
    clearInterval(playerTime);
}

/*
 * Core Game Logic
 */
function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function show(e) {
    const clickedCard = e.target;
    if (openCards.length >= 2 || !clickedCard.classList.contains('card') || clickedCard.classList.contains('open') || clickedCard.classList.contains('match')) {
        return;
    }
    clickTimestamps.push(Date.now());
    clickedCard.classList.add('open', 'show');
    clickedCard.firstElementChild.classList.add('display-icon');
    openCards.push(clickedCard);
    if (openCards.length === 2) {
        movesCounter++;
        moves.textContent = `${movesCounter} ${movesCounter === 1 ? 'Move' : 'Moves'}`;
        starScore('.stars');
        match();
    }
}

function match() {
    const [card1, card2] = openCards;
    const title1 = card1.firstElementChild.getAttribute('title');
    const title2 = card2.firstElementChild.getAttribute('title');

    if (title1 === title2) {
        card1.className = 'card match';
        card2.className = 'card match';
        matchedCards.push(card1, card2);
        openCards = [];
        if (matchedCards.length === 16) {
            endTimestamp = Date.now();
            stopTimer();
            setTimeout(showFinalScore, 500);
        }
    } else {
        if (forgivenErrors < FORGIVENESS_WINDOW) {
            forgivenErrors++;
            console.log(`Discovery move #${forgivenErrors}. Not counted as an error.`);
        } else {
            wrongAttempts++;
        }

        card1.style.animation = 'shake 0.5s';
        card2.style.animation = 'shake 0.5s';
        setTimeout(() => {
            card1.classList.remove('open', 'show');
            card2.classList.remove('open', 'show');
            card1.firstElementChild.classList.remove('display-icon');
            card2.firstElementChild.classList.remove('display-icon');
            card1.style.animation = '';
            card2.style.animation = '';
            openCards = [];
        }, 1000);
    }
}


async function showFinalScore() {
    const modal = document.querySelector('.modal');
    const closeModal = document.querySelector('.close');
    const playAgain = document.querySelector('.play-again');
    const score = document.querySelector('#total-time');
    const container = document.querySelector('.container');
    const backdrop = document.querySelector('.backdrop');
    
    // **** NEW: Add event listener for the new Next Game button ****
    const nextGameBtn = document.getElementById('next-game-btn');
    if (nextGameBtn) {
        nextGameBtn.addEventListener('click', () => {
            // Navigate to the new diagnosis-stroop game
            window.location.href = "../diagnosis-stroop/index.html";
        });
    }

    playAgain.addEventListener('click', () => {
        closeModal.click();
        restart();
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        backdrop.style.display = 'none';
    });

    const total_time_sec = startTimestamp ? Math.round((endTimestamp - startTimestamp) / 1000) : 0;
    
    let avg_reaction_time_sec = 0;
    if (clickTimestamps.length > 1) {
        let sumIntervals = 0;
        for (let i = 1; i < clickTimestamps.length; i++) {
            sumIntervals += (clickTimestamps[i] - clickTimestamps[i - 1]);
        }
        avg_reaction_time_sec = (sumIntervals / (clickTimestamps.length - 1)) / 1000;
    }

    const total_trials = movesCounter - forgivenErrors;
    const error_rate_percent = total_trials > 0 ? (wrongAttempts / total_trials) * 100 : 0;
    const correct_trials = total_trials - wrongAttempts;
    const accuracy_percent = total_trials > 0 ? (correct_trials / total_trials) * 100 : 100;
    const focus_score_percent = Math.max(0, 100 - error_rate_percent - (avg_reaction_time_sec * 10));

    const sessionId = getOrCreateDiagnosisSessionId();

    const finalMetricsPayload = {
        user_id: "test_user_01",
        session_id: sessionId,
        session_type: "diagnosis",
        game_name: "Memory",
        avg_reaction_time_sec: parseFloat(avg_reaction_time_sec.toFixed(3)),
        error_rate_percent: parseFloat(error_rate_percent.toFixed(2)),
        focus_score_percent: parseFloat(focus_score_percent.toFixed(2)),
        accuracy_percent: parseFloat(accuracy_percent.toFixed(2)),
        total_time_sec: total_time_sec
    };

    console.log("Metrics payload for backend:", finalMetricsPayload);
    
    await sendResultsToBackend(finalMetricsPayload);

    document.getElementById('metric-reaction').textContent = `${avg_reaction_time_sec.toFixed(2)} sec avg`;
    document.getElementById('metric-error').textContent = `${error_rate_percent.toFixed(1)}%`;
    document.getElementById('metric-focus').textContent = `${focus_score_percent.toFixed(1)}%`;
    document.getElementById('metric-accuracy').textContent = `${accuracy_percent.toFixed(1)}%`;
    const minutes = Math.floor(total_time_sec / 60);
    const seconds = total_time_sec % 60;
    document.getElementById('metric-total').textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
    score.textContent = `${minutes}m ${String(seconds).padStart(2, '0')}s`;

    modal.style.display = 'block';
    backdrop.style.display = 'block';
    backdrop.classList.add('backdrop-show');
    backdrop.style.height = container.offsetHeight + 'px';
    starScore('.modal-stars', 'none', '#f5ce67');
}

function restart() {
    stopTimer();
    initGame();
}

function resetGameState() {
    openCards = [];
    matchedCards = [];
    movesCounter = 0;
    clickTimestamps = [];
    wrongAttempts = 0;
    forgivenErrors = 0;
    startTimestamp = null;
    endTimestamp = null;
    timerOn = false;
    playerTime = null;
}

function starScore(name, display, color) {
    const stars = document.querySelector(name).children;
    const comment = document.querySelector('.comment');
    if (movesCounter > 16) {
        stars[2].style.display = 'none';
        stars[1].style.display = 'none';
        stars[0].style.display = 'inline-block';
        stars[0].style.color = color || 'orange';
        if (comment) comment.textContent = 'Good Effort!';
    } else if (movesCounter > 12) {
        stars[2].style.display = 'none';
        stars[1].style.display = 'inline-block';
        stars[0].style.display = 'inline-block';
        stars[1].style.color = color || 'orange';
        stars[0].style.color = color || 'orange';
        if (comment) comment.textContent = 'Great Job!';
    } else {
        stars[0].style.display = 'inline-block';
        stars[1].style.display = 'inline-block';
        stars[2].style.display = 'inline-block';
        for(let star of stars) {
             star.style.color = color || 'orange';
        }
        if (comment) comment.textContent = 'Excellent!';
    }
}

function getOrCreateDiagnosisSessionId(isFirstGame = false) {
    const storageKey = 'currentDiagnosisSessionId';
    if (isFirstGame) {
        const newSessionId = crypto.randomUUID();
        sessionStorage.setItem(storageKey, newSessionId);
        console.log('Started new diagnosis session:', newSessionId);
        return newSessionId;
    }
    let sessionId = sessionStorage.getItem(storageKey);
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem(storageKey, sessionId);
        console.log('No diagnosis session found, created a new one as fallback:', sessionId);
    }
    return sessionId;
}

async function sendResultsToBackend(metricsPayload) {
    const apiUrl = 'http://127.0.0.1:8000/save_result';
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metricsPayload),
        });
        if (response.ok) {
            const result = await response.json();
            console.log('Success! Result saved to database:', result);
        } else {
            const errorData = await response.json();
            console.error('Backend Error:', errorData);
        }
    } catch (error) {
        console.error('Connection Error: Is the backend server running?', error);
        alert("Could not connect to the server. Please ensure the backend is running and try again.");
    }
}

