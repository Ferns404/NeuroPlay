document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const game = document.getElementById("game");
    const resultsCard = document.getElementById("results");
    const metricsP = document.getElementById("metrics");
    const playAgainBtn = document.getElementById("play-again-btn");
    const nextBtn = document.getElementById("next-btn");

    // --- CONSTELLATION BACKGROUND ---
    const bgCanvas = document.getElementById('bg-canvas');
    const ctx = bgCanvas.getContext('2d');

    let stars = [];
    const numStars = 100;
    const connectionDistance = 100;

    function setCanvasSize() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }

    class Star {
        constructor() {
            this.x = Math.random() * bgCanvas.width;
            this.y = Math.random() * bgCanvas.height;
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
            if (this.x < 0 || this.x > bgCanvas.width) this.velocity.x *= -1;
            if (this.y < 0 || this.y > bgCanvas.height) this.velocity.y *= -1;
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
        ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        stars.forEach(star => star.update());
        drawConstellations();
    }
    
    window.addEventListener('resize', () => {
        setCanvasSize();
        createStars();
    });

    // --- TIMER CLASS ---
    class Timer {
        constructor() {
            this.element = document.createElement("p");
            this.interval = null;
        }
        remove() {
            clearInterval(this.interval);
            if (this.element.parentElement) {
                this.element.remove();
            }
        }
        create() {
            game.appendChild(this.element);
            let i = 0;
            this.interval = setInterval(() => {
                i += 0.01;
                this.element.innerText = i.toFixed(2);
            }, 10);
        }
    }

    // --- SHAPE CLASS ---
    const shapes = ["square", "circle", "rectangle", "triangle"];
    const colors = ["#ff4444", "#448aff", "#00e676", "#ffeb3b", "#aa00ff", "#00e5ff"];

    class Shape {
        constructor({ form, color, position }) {
            this.form = form;
            this.color = color;
            this.position = position;
            this.element = null;
            this.timer = null;
        }
        create() {
            if (this.form === "circle") {
                const circle = document.createElement("button");
                circle.style.backgroundColor = this.color;
                circle.style.borderRadius = "50%";
                circle.style.width = "20vmin";
                circle.style.height = "20vmin";
                this.element = circle;
            } else if (this.form === "rectangle") {
                const rectangle = document.createElement("button");
                rectangle.style.backgroundColor = this.color;
                rectangle.style.width = "25vmin";
                rectangle.style.height = "12vmin";
                this.element = rectangle;
            } else if (this.form === "triangle") {
                const possibilities = ["Right", "Top", "Left", "Bottom"];
                const direction = possibilities[Math.floor(Math.random() * 4)];
                const triangle = document.createElement("div");
                triangle.classList.add(direction);
                triangle.style["border" + direction] = "15vmin solid " + this.color;
                this.element = triangle;
            } else if (this.form === "square") {
                const square = document.createElement("button");
                square.style.backgroundColor = this.color;
                square.style.width = "20vmin";
                square.style.height = "20vmin";
                this.element = square;
            }
            this.element.style.position = "absolute";
            this.element.style.left = this.position.x;
            this.element.style.top = this.position.y;
        }
        remove() {
            if (this.element && this.element.parentElement) {
                this.element.remove();
            }
        }
        onClick(callback) {
            this.element.addEventListener('click', () => {
                let rt = 0;
                try {
                    if (this.timer && this.timer.element && this.timer.element.innerText) {
                        rt = parseFloat(this.timer.element.innerText);
                    }
                } catch (e) { rt = 0; }
                
                if (this.timer) this.timer.remove();
                this.remove();

                const shouldContinue = (typeof callback === "function") ? callback(rt) : true;
                if (!shouldContinue) return;

                setTimeout(() => {
                    const newShape = new Shape({
                        form: shapes[Math.floor(Math.random() * shapes.length)],
                        color: colors[Math.floor(Math.random() * colors.length)],
                        position: {
                            x: `${randomIntFromRange(game.clientWidth * 0.1, game.clientWidth * 0.8)}px`,
                            y: `${randomIntFromRange(game.clientHeight * 0.1, game.clientHeight * 0.8)}px`,
                        }
                    });
                    this.form = newShape.form;
                    this.color = newShape.color;
                    this.position = newShape.position;
                    this.create();
                    document.getElementById('game').appendChild(this.element);
                    this.timer = new Timer();
                    this.timer.create();
                    this.onClick(callback);
                }, 3000 * Math.random());
            });
        }
    }

    function randomIntFromRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    // --- MAIN GAME LOGIC ---
    let trialCount = 0;
    const maxTrials = 20;
    let reactionTimes = [];
    let totalStartTime = null;

    async function showResults() {
        const total_time_sec = totalStartTime ? Math.round((Date.now() - totalStartTime) / 1000) : 0;
        
        const avgReaction = reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
        let stdDev = 0;
        if (reactionTimes.length > 1) {
            const mean = avgReaction;
            const variance = reactionTimes.reduce((acc, r) => acc + Math.pow(r - mean, 2), 0) / reactionTimes.length;
            stdDev = Math.sqrt(variance);
        }
        const originalFocusScore = Math.max(0, 100 - (stdDev * 100));
        const minutes = Math.floor(total_time_sec / 60);
        const seconds = total_time_sec % 60;
        const totalTimeStr = `${minutes}:${String(seconds).padStart(2, "0")}`;

        metricsP.innerHTML = `
            Average Reaction Time: ${avgReaction.toFixed(2)}s<br>
            Focus Score: ${originalFocusScore.toFixed(1)}%<br>
            Total Time: ${totalTimeStr}
        `;

        const error_rate_percent = 0.0;
        const accuracy_percent = 100.0;
        const focus_score_percent = Math.max(0, 100 - error_rate_percent - (avgReaction * 10));

        // **** CHANGE: Get or create the session ID ****
        const sessionId = getOrCreateDiagnosisSessionId(true); // true because this is the first game

        const finalMetricsPayload = {
            user_id: "test_user_01",
            session_id: sessionId, // Use the shared session ID
            session_type: "diagnosis",
            game_name: "Reaction",
            avg_reaction_time_sec: parseFloat(avgReaction.toFixed(3)),
            error_rate_percent: error_rate_percent,
            focus_score_percent: parseFloat(focus_score_percent.toFixed(2)),
            accuracy_percent: accuracy_percent,
            total_time_sec: total_time_sec
        };
        
        console.log("Metrics payload for backend:", finalMetricsPayload);
        
        await sendResultsToBackend(finalMetricsPayload);
        
        resultsCard.classList.remove("hidden");
    }

    function startGame() {
        resultsCard.classList.add("hidden");
        game.innerHTML = '';
        trialCount = 0;
        reactionTimes.length = 0;
        totalStartTime = null;

        const shape = new Shape({
            form: shapes[Math.floor(Math.random() * shapes.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
            position: {
                x: `${randomIntFromRange(game.clientWidth * 0.2, game.clientWidth * 0.8)}px`,
                y: `${randomIntFromRange(game.clientHeight * 0.2, game.clientHeight * 0.8)}px`,
            }
        });
        shape.create();
        
        totalStartTime = Date.now();
        
        shape.onClick((rt) => {
            reactionTimes.push(rt);
            trialCount++;
            if (trialCount >= maxTrials) {
                setTimeout(showResults, 150);
                return false;
            }
            return true;
        });
        
        game.appendChild(shape.element);
    }

    // --- EVENT LISTENERS ---
    playAgainBtn.addEventListener("click", startGame);
    nextBtn.addEventListener("click", () => {
        window.location.href = "../memory-game-master/index.html";
    });

    // --- INITIALIZE ---
    setCanvasSize();
    createStars();
    animate();
    startGame();
});

// --- NEW HELPER FUNCTION for Diagnosis Session ---
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

// --- BACKEND CONNECTION FUNCTION ---
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

