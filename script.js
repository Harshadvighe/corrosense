console.log("✅ InfraSense AI Dashboard v3.0 Loaded");

const API = "https://rgzokxja06.execute-api.ap-south-1.amazonaws.com";
const DEVICE_ID = "bridgePillar_01";
let multiChart;

// Initialize Chart
function initChart() {
    const ctx = document.getElementById('multiChart').getContext('2d');
    multiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Corrosion (%)',
                    data: [],
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5
                },
                {
                    label: 'Vibration (Hz)',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5
                },
                {
                    label: 'Risk Score',
                    data: [],
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { color: '#7f8c8d', font: { size: 11 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#7f8c8d', font: { size: 11 }, maxRotation: 45 }
                }
            }
        }
    });
}

// Fetch Data
async function fetchData() {
    const res = await fetch(`${API}/device/${DEVICE_ID}/latest-analysis`);
    const data = await res.json();
    console.log("📡 API Response:", data);
    return data;
}

// Update Dashboard
function updateDashboard(data) {
    if (!data || !data.latest) {
        console.error("❌ No data.latest found");
        return;
    }

    const latest = data.latest;
    console.log("📊 Updating with:", latest);

    // Update metrics
    document.getElementById('riskScore').textContent = latest.risk_score != null ? Number(latest.risk_score).toFixed(3) : '--';
    document.getElementById('corrosion').textContent = latest.corrosion_avg != null ? Number(latest.corrosion_avg).toFixed(1) : '--';
    document.getElementById('vibration').textContent = latest.vibration_avg != null ? Number(latest.vibration_avg).toFixed(2) : '--';
    document.getElementById('temperature').textContent = latest.temperature_avg != null ? Number(latest.temperature_avg) : '--';
    document.getElementById('humidity').textContent = latest.humidity_avg != null ? Number(latest.humidity_avg) : '--';
    document.getElementById('resistivity').textContent = latest.resistivity_avg != null ? Number(latest.resistivity_avg).toFixed(1) : '--';

    // Update status
    const badge = document.getElementById('statusBadge');
    badge.textContent = latest.risk_state || 'SAFE';
    badge.className = 'status-badge ' + (latest.risk_state || 'SAFE');

    // Update chart with last 20 points for better visualization
    if (data.history && data.history.length > 0) {
        const history = data.history.slice(0, 20).reverse();
        const labels = history.map(h => {
            const date = new Date(h.analysisTimestamp * 1000);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        });

        multiChart.data.labels = labels;
        multiChart.data.datasets[0].data = history.map(h => h.corrosion_avg || 0);
        multiChart.data.datasets[1].data = history.map(h => h.vibration_avg || 0);
        multiChart.data.datasets[2].data = history.map(h => (h.risk_score || 0) * 100);
        multiChart.update('none');
    }

    // Update weekly insights
    if (data.daily) {
        const daily = data.daily;

document.getElementById('avgCorrosion').textContent =
    daily.avg_corrosion ? Number(daily.avg_corrosion).toFixed(1) + '%' : '--';

document.getElementById('maxCorrosion').textContent =
    daily.max_corrosion ? Number(daily.max_corrosion).toFixed(1) + '%' : '--';

document.getElementById('avgVibration').textContent =
    daily.avg_vibration ? Number(daily.avg_vibration).toFixed(2) + ' Hz' : '--';

document.getElementById('riskSummary').textContent =
    daily.risk_summary || '--';

document.getElementById('recommendation').textContent =
    daily.inspection_recommendation || 'Continue routine monitoring';
    }

    // Update timestamp
    const timestamp = latest.analysisTimestamp ? new Date(latest.analysisTimestamp * 1000) : new Date();
    document.getElementById('lastUpdate').textContent = 'Last Updated: ' + timestamp.toLocaleString();
}

// Load Data
async function load() {
    try {
        const data = await fetchData();
        updateDashboard(data);
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Initialize
window.onload = function() {
    initChart();
    load();
    setInterval(load, 5000);
};
