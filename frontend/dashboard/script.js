// --- **UPDATED**: Use the 'pageshow' event for reliability ---
// This event fires every time the page is displayed, including back-navigation.
window.addEventListener('pageshow', () => {
    // Set up the navigation and action buttons
    initializeButtonHandlers();
    
    // Fetch live data from the backend to populate the dashboard
    fetchDashboardData();
});

/**
 * Fetches live data from the backend and updates all dashboard components.
 */
async function fetchDashboardData() {
    const userId = "test_user_01"; // Our hard-coded user
    const apiUrl = `http://127.0.0.1:8000/get_report/${userId}?report_type=dashboard`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            if (response.status === 404) {
                console.warn("No game data found for user. Displaying empty dashboard.");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Check if the server returned an error payload
        if (data.error) {
            console.error("Backend returned an error:", data.error);
            return;
        }

        // Update the dashboard components with the new data
        updateProgressWidgets(data.averageMetrics);
        updateCognitiveChart(data.progressChart);

    } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
    }
}


/**
 * Updates the four circular progress widgets in the sidebar with live data.
 * @param {object} metrics - An object containing the average metric scores from the API.
 */
function updateProgressWidgets(metrics) {
    if (!metrics) return;

    // Update Reaction Time Circle
    const rtWidget = document.getElementById('metric-reaction-time');
    if (rtWidget) {
        const rtPercent = Math.round(metrics.reactionTime);
        rtWidget.querySelector('.circle-inner').textContent = `${rtPercent}%`;
        rtWidget.style.background = `conic-gradient(var(--accent-blue) ${rtPercent}%, #3e3e60 ${rtPercent}%)`;
    }

    // Update Accuracy Circle
    const accWidget = document.getElementById('metric-accuracy');
    if (accWidget) {
        const accPercent = Math.round(metrics.accuracy);
        accWidget.querySelector('.circle-inner').textContent = `${accPercent}%`;
        accWidget.style.background = `conic-gradient(var(--green-up) ${accPercent}%, #3e3e60 ${accPercent}%)`;
    }

    // Update Focus Score Circle
    const focusWidget = document.getElementById('metric-focus-score');
    if (focusWidget) {
        const focusPercent = Math.round(metrics.focusScore);
        focusWidget.querySelector('.circle-inner').textContent = `${focusPercent}%`;
        focusWidget.style.background = `conic-gradient(var(--primary-purple) ${focusPercent}%, #3e3e60 ${focusPercent}%)`;
    }

    // Update Error Rate Circle
    const errorWidget = document.getElementById('metric-error-rate');
    if (errorWidget) {
        const errorPercent = Math.round(metrics.errorRate);
        errorWidget.querySelector('.circle-inner').textContent = `${errorPercent}%`;
        errorWidget.style.background = `conic-gradient(var(--red-down) ${errorPercent}%, #3e3e60 ${errorPercent}%)`;
    }
}


/**
 * Initializes or updates the cognitive progress line chart with live data.
 * @param {object} chartData - The chart data from the API (labels and scores).
 */
function updateCognitiveChart(chartData) {
    const ctx = document.getElementById('cognitiveChart');
    if (!ctx || !chartData || !chartData.labels || !chartData.focusScores) {
        // If there's no data for the chart, don't try to draw it.
        return;
    };

    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels, // Use live labels from API
            datasets: [
                {
                    label: 'Focus Score',
                    data: chartData.focusScores, // Use live scores from API
                    backgroundColor: 'rgba(26, 188, 156, 0.2)', 
                    borderColor: '#1abc9c', 
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#1abc9c',
                    fill: 'origin',
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 50, 
                    max: 100, 
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#a0a0b0' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#a0a0b0' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1a2e',
                    titleColor: '#ffc300',
                    bodyColor: '#e0e0e0',
                }
            }
        }
    });
}

/**
 * Sets up click handlers for the main action buttons.
 */
function initializeButtonHandlers() {
    const startDiagnosisBtn = document.querySelector('.start-diagnosis-btn');
    if(startDiagnosisBtn) {
        startDiagnosisBtn.addEventListener('click', () => {
            // Clear any old improvement session ID before starting diagnosis
            sessionStorage.removeItem('currentImprovementSessionId');
            window.location.href = "../shape-dash-main/index.html";
        });
    }

    const playFocusBtn = document.querySelector('.play-focus-btn');
    if(playFocusBtn) {
        playFocusBtn.addEventListener('click', () => {
            // Clear any old improvement session ID before starting a new one
            sessionStorage.removeItem('currentImprovementSessionId');
            window.location.href = "../stroop-game/index.html";
        });
    }
}

