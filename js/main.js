// Initialize Leaflet map
var map = L.map('map').setView([20, 0], 2);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let earthquakeData = [];

// Async function to load earthquake data
async function loadEarthquakeData() {
    const data = await d3.csv("data/query.csv");
    data.forEach(d => {
        d.latitude = +d.latitude;
        d.longitude = +d.longitude;
        d.magnitude = +d.mag;
        d.depth = +d.depth;
        d.time = new Date(d.time);
    });
    earthquakeData = data;
    updateVisualization();
}

// Define color scale for magnitude
var colorScale = d3.scaleSequential(d3.interpolateReds)
    .domain([3, 8]); // Magnitude range

function updateVisualization(filters = {}) {
    map.eachLayer(layer => {
        if (layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });

    let filteredData = earthquakeData.filter(d => {
        return (!filters.magnitude || filters.magnitude.includes(d.magnitude)) &&
               (!filters.startTime || d.time >= filters.startTime) &&
               (!filters.endTime || d.time <= filters.endTime) &&
               (!filters.depth || d.depth >= filters.depth[0] && d.depth <= filters.depth[1]);
    });

    filteredData.forEach(d => {
        L.circleMarker([d.latitude, d.longitude], {
            radius: d.magnitude * 2,
            fillColor: colorScale(d.magnitude),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map)
        .bindPopup(`
            <strong>Location:</strong> ${d.place} <br>
            <strong>Magnitude:</strong> ${d.magnitude} <br>
            <strong>Depth:</strong> ${d.depth} km <br>
            <strong>Time:</strong> ${d.time.toUTCString()}
        `);
    });
}

// Animation Controls
let animationInterval;
function startAnimation(startTime, endTime, speed) {
    let currentTime = new Date(startTime);
    clearInterval(animationInterval);
    animationInterval = setInterval(() => {
        if (currentTime > endTime) {
            clearInterval(animationInterval);
            return;
        }
        updateVisualization({ startTime: currentTime });
        currentTime.setUTCDate(currentTime.getUTCDate() + 1);
    }, speed);
}

// Load the data
loadEarthquakeData();
