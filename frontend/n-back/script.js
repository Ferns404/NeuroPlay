document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const instructionsModal = document.getElementById('instructions-modal');
    const resultsModal = document.getElementById('results-modal');
    const startBtn = document.getElementById('start-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const gameHud = document.getElementById('game-hud');
    const trialCounter = document.getElementById('trial-counter');
    const shapeContainer = document.getElementById('shape-container');
    const feedbackIndicator = document.getElementById('feedback-indicator');
    const bgCanvas = document.getElementById('bg-canvas');

    // --- METRIC DISPLAY ELEMENTS ---
    const metricReaction = document.getElementById('metric-reaction');
    const metricError = document.getElementById('metric-error');
    const metricFocus = document.getElementById('metric-focus');
    const metricAccuracy = document.getElementById('metric-accuracy');
    const metricImpulse = document.getElementById('metric-impulse');
    const performanceMsg = document.getElementById('performance-msg');

    // --- GAME CONFIGURATION ---
    const N_BACK_LEVEL = 2;
    const TOTAL_TRIALS = 25;
    const SHAPE_DISPLAY_TIME = 1200; 
    const INTER_TRIAL_INTERVAL = 2000;
    
    // **FIX:** Define shapes and their corresponding colors
    const SHAPES = [
        { type: 'circle', color: 'var(--primary-neon)' },
        { type: 'square', color: 'var(--secondary-neon)' },
        { type: 'triangle', color: 'var(--success-neon)' }
    ];

    // --- GAME STATE & METRICS ---
    let sequence = [];
    let results = [];
    let currentTrial = 0;
    let trialStartTime = 0;
    let gameLoopTimeout;
    let waitingForInput = false;

    // --- BACKGROUND ANIMATION (Unchanged) ---
    const ctx = bgCanvas.getContext('2d');
    let stars = [];
    function resizeCanvas() { bgCanvas.width = window.innerWidth; bgCanvas.height = window.innerHeight; }
    function createStars() {
        stars = [];
        for (let i = 0; i < 100; i++) {
            stars.push({
                x: Math.random() * bgCanvas.width, y: Math.random() * bgCanvas.height,
                radius: Math.random() * 1.5, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5
            });
        }
    }
    function drawAndMoveStars() {
        ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        ctx.fillStyle = 'rgba(0, 245, 255, 0.8)';
        ctx.beginPath();
        for (const star of stars) {
            star.x += star.vx; star.y += star.vy;
            if (star.x < 0 || star.x > bgCanvas.width) star.vx = -star.vx;
            if (star.y < 0 || star.y > bgCanvas.height) star.vy = -star.vy;
            ctx.moveTo(star.x, star.y);
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        }
        ctx.fill();
        requestAnimationFrame(drawAndMoveStars);
    }

    // --- GAME LOGIC ---

    // **FIX:** The sequence now stores full shape objects (type and color)
    function generateSequence() {
        sequence = [];
        for (let i = 0; i < TOTAL_TRIALS; i++) {
            const shapeObject = SHAPES[Math.floor(Math.random() * SHAPES.length)];
            sequence.push(shapeObject);
        }
    }

    function startGame() {
        gameHud.classList.remove('hidden');
        results = [];
        currentTrial = 0;
        generateSequence();
        gameLoop();
    }
    
    // **FIX:** Renders the shape with its specific color
    function showShape() {
        if (currentTrial >= TOTAL_TRIALS) return;
        
        const shapeObject = sequence[currentTrial];
        const shapeDiv = document.createElement('div');
        shapeDiv.className = `shape ${shapeObject.type}`;
        
        // Apply the color directly
        if (shapeObject.type === 'triangle') {
            shapeDiv.style.borderBottomColor = shapeObject.color;
            shapeDiv.style.filter = `drop-shadow(0 5px 10px ${shapeObject.color})`;
        } else {
            shapeDiv.style.backgroundColor = shapeObject.color;
            shapeDiv.style.boxShadow = `0 0 5px ${shapeObject.color}, 0 0 10px ${shapeObject.color}`;
        }

        shapeContainer.innerHTML = ''; // Clear previous shape
        shapeContainer.appendChild(shapeDiv);
        shapeContainer.classList.add('visible');
        trialStartTime = Date.now();
        waitingForInput = true;

        setTimeout(() => {
            shapeContainer.classList.remove('visible');
            if (isMatch() && waitingForInput) {
                recordResult('miss');
                waitingForInput = false;
            }
        }, SHAPE_DISPLAY_TIME);
    }
    
    // **FIX:** Now checks both shape type and color for a match
    function isMatch() {
        if (currentTrial < N_BACK_LEVEL) return false;
        const currentShape = sequence[currentTrial];
        const nBackShape = sequence[currentTrial - N_BACK_LEVEL];
        return currentShape.type === nBackShape.type && currentShape.color === nBackShape.color;
    }
    
    function recordResult(type, rt = null) {
        results.push({ trial: currentTrial, type, rt });
    }

    function gameLoop() {
        if (currentTrial >= TOTAL_TRIALS) {
            endGame();
            return;
        }
        trialCounter.textContent = `Trial: ${currentTrial + 1} / ${TOTAL_TRIALS}`;
        showShape();
        currentTrial++;
        gameLoopTimeout = setTimeout(gameLoop, INTER_TRIAL_INTERVAL);
    }

    function handleKeyPress(e) {
        if (e.code === 'Space' && waitingForInput) {
            e.preventDefault();
            const reactionTime = Date.now() - trialStartTime;
            if (isMatch()) {
                recordResult('hit', reactionTime);
                showFeedback(true);
            } else {
                recordResult('false_alarm');
                showFeedback(false);
            }
            waitingForInput = false;
        }
    }
    
    function showFeedback(correct) {
        feedbackIndicator.classList.remove('correct', 'incorrect');
        setTimeout(() => {
            feedbackIndicator.classList.add(correct ? 'correct' : 'incorrect');
            setTimeout(() => feedbackIndicator.classList.remove('correct', 'incorrect'), 500);
        }, 10);
    }
    
    async function endGame() {
        clearTimeout(gameLoopTimeout);
        gameHud.classList.add('hidden');
        
        const hits = results.filter(r => r.type === 'hit');
        const misses = results.filter(r => r.type === 'miss').length;
        const falseAlarms = results.filter(r => r.type === 'false_alarm').length;
        
        let totalPossibleMatches = 0;
        let totalNonMatches = 0;
        for(let i = N_BACK_LEVEL; i < TOTAL_TRIALS; i++) {
            const currentShape = sequence[i];
            const nBackShape = sequence[i - N_BACK_LEVEL];
            if (currentShape.type === nBackShape.type && currentShape.color === nBackShape.color) {
                totalPossibleMatches++;
            } else {
                totalNonMatches++;
            }
        }
        
        const totalReactionTime = hits.reduce((sum, r) => sum + r.rt, 0);
        const avgReactionTimeSec = hits.length > 0 ? (totalReactionTime / hits.length) / 1000 : 0;
        const totalErrors = misses + falseAlarms;
        const errorRate = TOTAL_TRIALS > 0 ? (totalErrors / TOTAL_TRIALS) * 100 : 0;
        const attentionAccuracy = totalPossibleMatches > 0 ? (hits.length / totalPossibleMatches) * 100 : 100;
        const falseAlarmRate = totalNonMatches > 0 ? (falseAlarms / totalNonMatches) * 100 : 0;
        const impulseControl = 100 - falseAlarmRate;
        const focusScore = Math.max(0, 100 - errorRate - (avgReactionTimeSec * 10));

        metricReaction.textContent = `${avgReactionTimeSec.toFixed(2)}s`;
        metricError.textContent = `${errorRate.toFixed(1)}%`;
        metricFocus.textContent = `${focusScore.toFixed(1)}%`;
        metricAccuracy.textContent = `${attentionAccuracy.toFixed(1)}%`;
        metricImpulse.textContent = `${impulseControl.toFixed(1)}%`;

        let msg = "Great Session!";
        if (attentionAccuracy < 70) msg = "Good Effort, Keep Training!";
        else if (attentionAccuracy > 90 && impulseControl > 90) msg = "Exceptional Focus!";
        performanceMsg.textContent = msg;

        const sessionId = getOrCreateSessionId();

        const totalTimeSec = Math.round(TOTAL_TRIALS * (INTER_TRIAL_INTERVAL / 1000));
        const finalMetricsPayload = {
            user_id: "test_user_01",
            session_id: sessionId,
            session_type: "improvement",
            game_name: "N-Back",
            avg_reaction_time_sec: parseFloat(avgReactionTimeSec.toFixed(4)),
            error_rate_percent: parseFloat(errorRate.toFixed(4)),
            focus_score_percent: parseFloat(focusScore.toFixed(4)),
            accuracy_percent: parseFloat(attentionAccuracy.toFixed(4)),
            total_time_sec: totalTimeSec,
        };

        console.log("Metrics payload for backend:", finalMetricsPayload);
        
        await sendResultsToBackend(finalMetricsPayload);
        resultsModal.classList.remove('hidden');
    }

    // --- EVENT LISTENERS ---
    startBtn.addEventListener('click', () => {
        instructionsModal.classList.add('hidden');
        startGame();
    });
    playAgainBtn.addEventListener('click', () => {
        resultsModal.classList.add('hidden');
        startGame();
    });
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('resize', () => {
        resizeCanvas();
        createStars();
    });

    // --- INITIALIZE ---
    resizeCanvas();
    createStars();
    drawAndMoveStars();
});


function getOrCreateSessionId(isFirstGame = false) {
    const storageKey = 'currentImprovementSessionId';
    if (isFirstGame) {
        const newSessionId = crypto.randomUUID();
        sessionStorage.setItem(storageKey, newSessionId);
        return newSessionId;
    }
    let sessionId = sessionStorage.getItem(storageKey);
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem(storageKey, sessionId);
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

