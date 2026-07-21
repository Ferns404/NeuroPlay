const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Breathing guide elements
const breathingCircle = document.getElementById('breathing-circle');
const breathingText = document.getElementById('breathing-text');

// Modal and button elements
const finishBtn = document.getElementById('finish-btn');
const resultsModal = document.getElementById('results-modal');
const restartBtn = document.getElementById('restart-btn');
const nextGameBtn = document.getElementById('next-game-btn');


// Metric display elements
const metricDuration = document.getElementById('metric-duration');
const metricConnections = document.getElementById('metric-connections');
const metricBreaths = document.getElementById('metric-breaths');
const metricPacing = document.getElementById('metric-pacing');

// Game state and configuration
let stars = [];
const STAR_COUNT = 80;
const STAR_RADIUS = 3;
const NEON_BLUE = 'rgba(0, 245, 255, 1)';
const NEON_PINK = 'rgba(255, 0, 255, 1)';

let lines = [];
let selectedStar = null;

// --- Metrics Tracking ---
let startTime;
let breathCyclesCompleted = 0;

// --- Breathing Cycle Logic ---
const breathPhases = [
    { phase: 'Breathe In...', duration: 4000, scale: 1.5 },
    { phase: 'Hold...', duration: 4000, scale: 1.5 },
    { phase: 'Breathe Out...', duration: 6000, scale: 1.0 },
];
let currentPhaseIndex = 0;
let breathTimeout;

function startBreathingCycle() {
    function runPhase() {
        const phase = breathPhases[currentPhaseIndex];
        breathingText.textContent = phase.phase;
        breathingCircle.style.transform = `scale(${phase.scale})`;

        // This logic now works correctly because startTime is set on load.
        // It prevents counting the very first "Breathe In" as a full cycle.
        if (currentPhaseIndex === 0 && startTime) {
            breathCyclesCompleted++;
        }
        
        breathTimeout = setTimeout(() => {
            currentPhaseIndex = (currentPhaseIndex + 1) % breathPhases.length;
            runPhase();
        }, phase.duration);
    }
    // We subtract 1 from the initial count because the first "Breathe In" is not a full cycle.
    breathCyclesCompleted = -1; 
    runPhase();
}

// --- Canvas and Drawing Logic ---
function resizeCanvas() {
    const container = document.querySelector('.game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

function generateStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
        });
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = NEON_PINK;
    ctx.lineWidth = 2;
    ctx.shadowColor = NEON_PINK;
    ctx.shadowBlur = 10;
    lines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.stroke();
    });
    ctx.fillStyle = NEON_BLUE;
    ctx.shadowColor = NEON_BLUE;
    ctx.shadowBlur = 15;
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, STAR_RADIUS, 0, Math.PI * 2);
        ctx.fill();
    });
    if (selectedStar) {
        ctx.fillStyle = NEON_PINK;
        ctx.shadowColor = NEON_PINK;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(selectedStar.x, selectedStar.y, STAR_RADIUS * 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// --- Game Interaction Logic ---
function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
}

function findNearestStar(pos) {
    let nearestStar = null;
    let minDistance = Infinity;
    stars.forEach(star => {
        const dist = Math.sqrt((star.x - pos.x)**2 + (star.y - pos.y)**2);
        if (dist < minDistance) {
            minDistance = dist;
            nearestStar = star;
        }
    });
    return minDistance < 30 ? nearestStar : null; 
}

function handleCanvasClick(event) {
    // The startTime is now set on page load, so we don't need to set it here.
    const pos = getMousePos(event);
    const clickedStar = findNearestStar(pos);
    if (clickedStar) {
        if (!selectedStar) {
            selectedStar = clickedStar;
        } else {
            if (selectedStar !== clickedStar) {
                lines.push({ start: selectedStar, end: clickedStar });
            }
            selectedStar = null;
        }
        draw();
    }
}

// --- Game Flow and Metrics Display ---
async function showMetrics() {
    const endTime = Date.now();
    const durationMs = startTime ? endTime - startTime : 0;
    
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    metricDuration.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
    metricConnections.textContent = lines.length;
    metricBreaths.textContent = breathCyclesCompleted;
    const pacing = lines.length > 1 ? (totalSeconds / lines.length) : 0;
    metricPacing.textContent = `${pacing.toFixed(1)} s`;

    const sessionId = getOrCreateSessionId();
    
    const finalMetricsPayload = {
        user_id: "test_user_01",
        session_id: sessionId,
        session_type: "improvement",
        game_name: "Breathing",
        avg_reaction_time_sec: 0,
        error_rate_percent: 0,
        focus_score_percent: 100,
        accuracy_percent: 100,
        total_time_sec: totalSeconds,
    };

    console.log("Metrics payload for backend:", finalMetricsPayload);
    await sendResultsToBackend(finalMetricsPayload);
    resultsModal.style.display = 'flex';
}

function init() {
    // **FIX:** Start the session timer as soon as the game initializes
    startTime = Date.now(); 
    resizeCanvas();
    generateStars();
    draw();
    clearTimeout(breathTimeout); 
    startBreathingCycle();
}

function resetGame() {
    startTime = null;
    breathCyclesCompleted = 0;
    lines = [];
    selectedStar = null;
    resultsModal.style.display = 'none';
    
    // **FIX:** Re-initialize the game fully to restart timers and animations
    init();
}

// --- Event Listeners ---
window.addEventListener('resize', () => {
    resizeCanvas();
    generateStars();
    draw();
});
canvas.addEventListener('click', handleCanvasClick);
finishBtn.addEventListener('click', showMetrics);
restartBtn.addEventListener('click', resetGame);
nextGameBtn.addEventListener('click', () => {
    window.location.href = "../n-back/index.html"; 
});

// Initial setup
init();

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

