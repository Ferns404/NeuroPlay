// =================================================================
// ============== ANIMATED BACKGROUND LOGIC ========================
// =================================================================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let stars = [];
const numStars = 100;
const connectionDistance = 100;

function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 1.5 + 0.5;
        this.alpha = Math.random() * 0.5 + 0.5;
        this.velocity = { x: (Math.random() - 0.5) * 0.2, y: (Math.random() - 0.5) * 0.2 };
        this.twinkleSpeed = Math.random() * 0.03;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fill();
    }
    update() {
        this.alpha += Math.sin(Date.now() * this.twinkleSpeed) * 0.05;
        if (this.alpha > 1) this.alpha = 1;
        if (this.alpha < 0.1) this.alpha = 0.1;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        if (this.x < 0 || this.x > canvas.width) this.velocity.x *= -1;
        if (this.y < 0 || this.y > canvas.height) this.velocity.y *= -1;
        this.draw();
    }
}

function createStars() {
    stars = [];
    for (let i = 0; i < numStars; i++) { stars.push(new Star()); }
}

function drawConstellations() {
    for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
            const dist = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
            if (dist < connectionDistance) {
                ctx.beginPath();
                ctx.moveTo(stars[i].x, stars[i].y);
                ctx.lineTo(stars[j].x, stars[j].y);
                const opacity = 1 - (dist / connectionDistance);
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => star.update());
    drawConstellations();
}

setCanvasSize();
createStars();
animate();
window.addEventListener('resize', () => { setCanvasSize(); createStars(); });

// =================================================================
// ============== ORIGINAL GAME LOGIC ==============================
// =================================================================
const colors = ["Red", "Blue", "Green", "Yellow", "Purple", "Cyan"];
const colorCodes = {
  Red: "#ff4444",
  Blue: "#448aff",
  Green: "#00e676",
  Yellow: "#ffeb3b",
  Purple: "#aa00ff",
  Cyan: "#00e5ff"
};

let trials = 20;
let currentTrial = 0;
let startTime;
let gameResults = [];

const wordDisplay = document.getElementById("word-display");
const gameDiv = document.getElementById("game");
const instructionsDiv = document.getElementById("instructions");
const resultsDiv = document.getElementById("results");
const metricsP = document.getElementById("metrics");
const performanceMsg = document.getElementById("performance-msg");
const optionsDiv = document.getElementById("color-options");

// Add event listener to the start button in the instruction card
document.querySelector('#instructions .start-btn').addEventListener('click', startGame);

// Add event listener to the play again button in the results card
document.querySelector('#results .start-btn').addEventListener('click', startGame);


function startGame() {
  instructionsDiv.classList.add("hidden");
  resultsDiv.classList.add("hidden");
  gameDiv.classList.remove("hidden");
  currentTrial = 0;
  gameResults = [];
  nextTrial();
}

function nextTrial() {
  if (currentTrial >= trials) {
    endGame();
    return;
  }
  const word = colors[Math.floor(Math.random() * colors.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  wordDisplay.textContent = word;
  wordDisplay.style.color = colorCodes[color];
  optionsDiv.innerHTML = "";
  colors.forEach(c => {
    const btn = document.createElement("button");
    btn.textContent = c;
    btn.className = "color-btn";
    btn.onclick = () => checkAnswer(c, color);
    optionsDiv.appendChild(btn);
  });
  startTime = Date.now();
  currentTrial++;
}

function checkAnswer(selected, correct) {
  const rt = Date.now() - startTime;
  const isCorrect = selected === correct;
  gameResults.push({ correct: isCorrect, rt: rt });
  nextTrial();
}

async function endGame() {
  gameDiv.classList.add("hidden");
  
  const totalTrials = gameResults.length;
  if (totalTrials === 0) {
    metricsP.innerHTML = "No trials were completed.";
    performanceMsg.textContent = "Try again!";
    resultsDiv.classList.remove("hidden");
    return;
  }

  const correctCount = gameResults.filter(r => r.correct).length;
  const incorrectCount = totalTrials - correctCount;
  const totalTimeMs = gameResults.reduce((sum, r) => sum + r.rt, 0);

  const avgReactionTimeSec = (totalTimeMs / totalTrials) / 1000;
  const errorRate = (incorrectCount / totalTrials) * 100;
  const selectiveAttentionAccuracy = (correctCount / totalTrials) * 100;
  const focusScore = Math.max(0, 100 - errorRate - (avgReactionTimeSec * 10));
  const totalSeconds = Math.floor(totalTimeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const totalTimeFormatted = `${minutes}:${String(seconds).padStart(2, '0')}`;

  let msg = "Good Job!";
  if (selectiveAttentionAccuracy < 60) msg = "Keep Practicing!";
  else if (selectiveAttentionAccuracy > 90 && avgReactionTimeSec < 1) msg = "Excellent Focus!";
  else if (selectiveAttentionAccuracy > 75) msg = "Nice Work!";
  performanceMsg.textContent = msg;

  metricsP.innerHTML = `
    Average Reaction Time: ${avgReactionTimeSec.toFixed(2)} sec avg <br>
    Error Rate: ${errorRate.toFixed(1)}% <br>
    Focus Score: ${focusScore.toFixed(1)}% <br>
    Accuracy: ${selectiveAttentionAccuracy.toFixed(1)}% <br>
    Total Time: ${totalTimeFormatted}
  `;

  // **** CHANGE: Get the shared session ID ****
  const sessionId = getOrCreateDiagnosisSessionId();

  const finalMetricsPayload = {
    user_id: "test_user_01",
    session_id: sessionId, // Use the shared session ID
    session_type: "diagnosis", // This is a diagnosis game
    game_name: "Stroop",
    avg_reaction_time_sec: parseFloat(avgReactionTimeSec.toFixed(4)),
    error_rate_percent: parseFloat(errorRate.toFixed(4)),
    focus_score_percent: parseFloat(focusScore.toFixed(4)),
    accuracy_percent: parseFloat(selectiveAttentionAccuracy.toFixed(4)),
    total_time_sec: totalSeconds
  };

  console.log("Metrics payload for backend:", finalMetricsPayload);
  
  await sendResultsToBackend(finalMetricsPayload);
  resultsDiv.classList.remove("hidden");
}

// **** NEW HELPER FUNCTION for Diagnosis Session ****
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
