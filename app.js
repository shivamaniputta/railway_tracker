// Preseeded database of popular trains with route details
const trainDatabase = [
  {
    trainNumber: '12002',
    trainName: 'NDLS - RKMP Shatabdi Express',
    type: 'Shatabdi',
    duration: '8h 31m',
    days: [1, 1, 1, 1, 1, 1, 1], // runs all days (Sunday to Saturday)
    stations: [
      { name: 'New Delhi', code: 'NDLS', arrivalTime: 'Starts', departureTime: '06:00', delayText: 'On Time', distance: 0, platform: '1' },
      { name: 'Mathura Jn', code: 'MTJ', arrivalTime: '07:19', departureTime: '07:21', delayText: 'On Time', distance: 141, platform: '1' },
      { name: 'Agra Cantt', code: 'AGC', arrivalTime: '07:50', departureTime: '07:55', delayText: 'On Time', distance: 195, platform: '1' },
      { name: 'Dhaulpur', code: 'DHO', arrivalTime: '08:39', departureTime: '08:40', delayText: 'On Time', distance: 248, platform: '2' },
      { name: 'Morena', code: 'MRA', arrivalTime: '08:57', departureTime: '08:58', delayText: 'On Time', distance: 275, platform: '1' },
      { name: 'Gwalior', code: 'GWL', arrivalTime: '09:23', departureTime: '09:28', delayText: 'On Time', distance: 313, platform: '1' },
      { name: 'VGL Jhansi', code: 'VGLJ', arrivalTime: '10:45', departureTime: '10:50', delayText: 'On Time', distance: 411, platform: '1' },
      { name: 'Lalitpur Jn', code: 'LAR', arrivalTime: '11:42', departureTime: '11:43', delayText: 'On Time', distance: 501, platform: '2' },
      { name: 'Bina Jn', code: 'BINA', departureTime: '12:42', arrivalTime: '12:40', delayText: 'On Time', distance: 564, platform: '3' },
      { name: 'Bhopal Jn', code: 'BPL', arrivalTime: '14:07', departureTime: '14:10', delayText: 'On Time', distance: 703, platform: '1' },
      { name: 'Rani Kamalapati', code: 'RKMP', arrivalTime: '14:31', departureTime: 'Ends', delayText: 'On Time', distance: 709, platform: '1' }
    ]
  },
  {
    trainNumber: '22436',
    trainName: 'NDLS - BSB Vande Bharat Express',
    type: 'Vande Bharat',
    duration: '8h 00m',
    days: [1, 1, 0, 1, 1, 1, 1], // does not run on Tuesday (index 2)
    stations: [
      { name: 'New Delhi', code: 'NDLS', arrivalTime: 'Starts', departureTime: '06:00', delayText: 'On Time', distance: 0, platform: '11' },
      { name: 'Kanpur Central', code: 'CNB', arrivalTime: '10:08', departureTime: '10:10', delayText: 'On Time', distance: 440, platform: '1' },
      { name: 'Prayagraj Jn', code: 'PRYJ', arrivalTime: '12:08', departureTime: '12:10', delayText: 'On Time', distance: 635, platform: '6' },
      { name: 'Varanasi Jn', code: 'BSB', arrivalTime: '14:00', departureTime: 'Ends', delayText: 'On Time', distance: 755, platform: '1' }
    ]
  },
  {
    trainNumber: '12952',
    trainName: 'NDLS - MMCT Mumbai Rajdhani',
    type: 'Rajdhani',
    duration: '15h 50m',
    days: [1, 1, 1, 1, 1, 1, 1],
    stations: [
      { name: 'New Delhi', code: 'NDLS', arrivalTime: 'Starts', departureTime: '16:55', delayText: 'On Time', distance: 0, platform: '3' },
      { name: 'Kota Jn', code: 'KOTA', arrivalTime: '21:30', departureTime: '21:40', delayText: 'On Time', distance: 465, platform: '1' },
      { name: 'Ratlam Jn', code: 'RTM', arrivalTime: '00:33', departureTime: '00:35', delayText: 'On Time', distance: 732, platform: '4' },
      { name: 'Vadodara Jn', code: 'BRC', arrivalTime: '03:40', departureTime: '03:50', delayText: 'On Time', distance: 993, platform: '2' },
      { name: 'Surat', code: 'ST', arrivalTime: '05:13', departureTime: '05:18', delayText: 'On Time', distance: 1123, platform: '1' },
      { name: 'Mumbai Central', code: 'MMCT', arrivalTime: '08:35', departureTime: 'Ends', delayText: 'On Time', distance: 1386, platform: '1' }
    ]
  },
  {
    trainNumber: '12050',
    trainName: 'NZM - VGLJ Gatimaan Express',
    type: 'Gatimaan',
    duration: '4h 25m',
    days: [1, 1, 1, 1, 1, 0, 1], // does not run on Friday (index 5)
    stations: [
      { name: 'H Nizamuddin', code: 'NZM', arrivalTime: 'Starts', departureTime: '08:10', delayText: 'On Time', distance: 0, platform: '5' },
      { name: 'Agra Cantt', code: 'AGC', arrivalTime: '09:50', departureTime: '09:55', delayText: 'On Time', distance: 188, platform: '1' },
      { name: 'Gwalior', code: 'GWL', arrivalTime: '11:13', departureTime: '11:15', delayText: 'On Time', distance: 306, platform: '1' },
      { name: 'VGL Jhansi', code: 'VGLJ', arrivalTime: '12:35', departureTime: 'Ends', delayText: 'On Time', distance: 403, platform: '1' }
    ]
  }
];

// Active State variables
let activeSearchTab = 'stations';
let currentTrain = null;
let currentStationIndex = 0;
let simulationInterval = null;
let currentSpeed = 0;
let voiceEnabled = false;
let isLiveFromApi = false;

// Initialize Lucide Icons & Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initialize icons
  lucide.createIcons();

  // Load theme preference
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  // Theme button handler
  document.getElementById('btn-theme-toggle').addEventListener('click', toggleTheme);

  // Voice button handler
  document.getElementById('btn-voice-toggle').addEventListener('click', toggleVoice);

  // Train Search Autocomplete
  const searchInput = document.getElementById('input-train-no');
  const suggestionsBox = document.getElementById('suggestions-box');

  searchInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase().trim();
    if (!val) {
      suggestionsBox.style.display = 'none';
      return;
    }

    const matches = trainDatabase.filter(t => 
      t.trainNumber.includes(val) || t.trainName.toLowerCase().includes(val)
    );

    if (matches.length > 0) {
      suggestionsBox.innerHTML = matches.map(t => `
        <div class="suggestion-item" onclick="selectSuggestion('${t.trainNumber}')">
          <span class="s-name">${t.trainName}</span>
          <span class="s-num">${t.trainNumber}</span>
        </div>
      `).join('');
      suggestionsBox.style.display = 'block';
    } else {
      suggestionsBox.style.display = 'none';
    }
  });

  // Hide suggestions on click outside
  document.addEventListener('click', (e) => {
    if (e.target !== searchInput && e.target !== suggestionsBox) {
      suggestionsBox.style.display = 'none';
    }
  });
});

// Switch Tab Logic
function switchSearchTab(tab) {
  activeSearchTab = tab;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  if (tab === 'stations') {
    document.getElementById('tab-stations').classList.add('active');
    document.getElementById('content-stations').classList.add('active');
  } else {
    document.getElementById('tab-number').classList.add('active');
    document.getElementById('content-number').classList.add('active');
  }
}

// Swap Source & Destination
function swapStations() {
  const source = document.getElementById('input-source');
  const dest = document.getElementById('input-destination');
  const temp = source.value;
  source.value = dest.value;
  dest.value = temp;
}

// Theme toggling
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (theme === 'dark') {
    icon.setAttribute('data-lucide', 'sun');
  } else {
    icon.setAttribute('data-lucide', 'moon');
  }
  lucide.createIcons();
}

// Voice synthesis toggler
function toggleVoice() {
  voiceEnabled = !voiceEnabled;
  const btn = document.getElementById('btn-voice-toggle');
  const icon = document.getElementById('voice-icon');

  if (voiceEnabled) {
    btn.classList.add('active');
    icon.setAttribute('data-lucide', 'volume-2');
    speakVoice("Voice alerts enabled");
  } else {
    btn.classList.remove('active');
    icon.setAttribute('data-lucide', 'volume-x');
  }
  lucide.createIcons();
}

function speakVoice(text) {
  if (!voiceEnabled || !('speechSynthesis' in window)) return;
  
  // Play alert chime first
  const chime = document.getElementById('audio-chime');
  if (chime) {
    chime.volume = 0.5;
    chime.play().catch(e => console.log('Chime playback error:', e));
  }

  // Speak announcement after a short delay
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    // Find an English/Indian voice if possible
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(v => v.lang.includes('EN-IN') || v.name.includes('Indian') || v.name.includes('Veena'));
    if (indianVoice) {
      utterance.voice = indianVoice;
    }
    utterance.rate = 0.95; // speed
    window.speechSynthesis.speak(utterance);
  }, 1000);
}

// Autocomplete suggestion select
function selectSuggestion(trainNo) {
  document.getElementById('input-train-no').value = trainNo;
  document.getElementById('suggestions-box').style.display = 'none';
}

// Handle Train Number/Name Search
function handleNumberSearch(e) {
  if (e) e.preventDefault();
  const val = document.getElementById('input-train-no').value.trim();
  
  // Find numeric code
  const trainMatch = val.match(/\d{5}/) || trainDatabase.find(t => t.trainName.toLowerCase().includes(val.toLowerCase()) || t.trainNumber === val);
  const trainNo = trainMatch ? (trainMatch.trainNumber || trainMatch[0]) : val;
  
  trackTrain(trainNo);
}

// Handle Stations Search
function handleStationsSearch(e) {
  e.preventDefault();
  const source = document.getElementById('input-source').value;
  const dest = document.getElementById('input-destination').value;

  if (source === dest) {
    alert("Source and Destination stations cannot be the same.");
    return;
  }

  document.getElementById('span-source').textContent = source;
  document.getElementById('span-destination').textContent = dest;

  // Filter trains from our preseeded database running between stations
  const matchingTrains = trainDatabase.filter(t => {
    const sourceIdx = t.stations.findIndex(st => st.code === source);
    const destIdx = t.stations.findIndex(st => st.code === dest);
    return sourceIdx !== -1 && destIdx !== -1 && sourceIdx < destIdx;
  });

  const listContainer = document.getElementById('trains-list-container');
  if (matchingTrains.length > 0) {
    listContainer.innerHTML = matchingTrains.map(t => {
      const sourceSt = t.stations.find(st => st.code === source);
      const destSt = t.stations.find(st => st.code === dest);
      
      return `
        <div class="train-result-card">
          <div class="train-main-info">
            <span class="train-type-badge">${t.type}</span>
            <h3>${t.trainName}</h3>
            <div class="train-sub-info">
              <span class="train-no">#${t.trainNumber}</span>
              <span class="train-no">Daily Operation</span>
            </div>
          </div>
          <div class="train-route-visual">
            <div class="route-endpoint">
              <span class="endpoint-time">${sourceSt.departureTime || sourceSt.arrivalTime}</span>
              <span class="endpoint-code">${sourceSt.code}</span>
            </div>
            <div class="route-duration-line">
              <span class="duration-val">${t.duration}</span>
              <div class="visual-line">
                <i data-lucide="train" class="visual-line-train"></i>
              </div>
            </div>
            <div class="route-endpoint">
              <span class="endpoint-time">${destSt.arrivalTime}</span>
              <span class="endpoint-code">${destSt.code}</span>
            </div>
          </div>
          <div class="train-frequency">
            <span class="freq-label">Runs On:</span>
            <div class="days-grid">
              ${['S','M','T','W','T','F','S'].map((day, idx) => `
                <span class="day-dot ${t.days[idx] ? 'active' : ''}">${day}</span>
              `).join('')}
            </div>
          </div>
          <button class="track-btn" onclick="trackTrainDirect('${t.trainNumber}')">
            <i data-lucide="navigation"></i>
            <span>Track Live</span>
          </button>
        </div>
      `;
    }).join('');
  } else {
    listContainer.innerHTML = `
      <div class="search-glass-card" style="text-align: center; padding: 3rem;">
        <i data-lucide="alert-circle" style="width: 48px; height: 48px; color: var(--warning); margin: 0 auto 1rem;"></i>
        <h3 style="margin-bottom: 0.5rem;">No Direct Trains Found</h3>
        <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto 1.5rem;">We couldn't find any direct trains between ${source} and ${dest} in our local pre-seeded database. You can directly track any train by number.</p>
        <button class="back-btn" style="margin: 0 auto;" onclick="switchSearchTab('number')">Search by Train Number</button>
      </div>
    `;
  }

  // Transitions
  document.getElementById('section-landing').classList.add('hidden');
  document.getElementById('section-results').classList.remove('hidden');
  lucide.createIcons();
}

function showLandingView() {
  document.getElementById('section-results').classList.add('hidden');
  document.getElementById('section-tracker').classList.add('hidden');
  document.getElementById('section-landing').classList.remove('hidden');
  stopSimulation();
}

function trackTrainDirect(trainNo) {
  trackTrain(trainNo);
}

// core track function
async function trackTrain(trainNo) {
  // Show loading
  document.getElementById('section-landing').classList.add('hidden');
  document.getElementById('section-results').classList.add('hidden');
  document.getElementById('section-tracker').classList.remove('hidden');

  document.getElementById('track-train-name').textContent = "Locating Train...";
  document.getElementById('track-train-no').textContent = `#${trainNo}`;
  document.getElementById('hero-current-status').textContent = "Fetching live server reports...";

  stopSimulation();

  try {
    // Try to fetch live status from scraping server API
    console.log(`Requesting status for ${trainNo} from scraper...`);
    let apiUrl = `/api/status?trainNo=${trainNo}`;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      apiUrl = `http://localhost:3000/api/status/${trainNo}`;
    }
    const res = await fetch(apiUrl);
    
    if (!res.ok) {
      throw new Error("Scraper server not running or returned error.");
    }
    
    const data = await res.json();
    if (data.error || !data.stations || data.stations.length === 0) {
      throw new Error(data.error || "Scraping failed to find station details.");
    }

    // Load active train data from fetched scraper results
    currentTrain = data;
    isLiveFromApi = true;
    console.log("Scraped data successfully loaded!", data);

  } catch (err) {
    console.warn("API Scraping unavailable. Falling back to local simulation.", err);
    
    // Fallback: Check if train in our local database
    const localTrain = trainDatabase.find(t => t.trainNumber === trainNo);
    
    if (localTrain) {
      // deep clone local train
      currentTrain = JSON.parse(JSON.stringify(localTrain));
      isLiveFromApi = false;
    } else {
      // Create a dummy dynamic route for unknown train numbers to allow testing!
      currentTrain = createDummyTrain(trainNo);
      isLiveFromApi = false;
    }
  }

  // Setup tracker UI and run simulation
  initTrackerUI();
  startSimulation();
}

// Generate a mock train route dynamically for any arbitrary 5-digit number
function createDummyTrain(trainNo) {
  return {
    trainNumber: trainNo,
    trainName: `Special Express Train (${trainNo})`,
    type: 'Express',
    duration: '6h 15m',
    stations: [
      { name: 'Origin Terminal', code: 'ORG', arrivalTime: 'Starts', departureTime: '10:00', delayText: 'On Time', distance: 0, platform: '2' },
      { name: 'City Central', code: 'CTC', arrivalTime: '11:15', departureTime: '11:20', delayText: 'On Time', distance: 110, platform: '1' },
      { name: 'Junction Town', code: 'JNT', arrivalTime: '13:05', departureTime: '13:10', delayText: 'On Time', distance: 280, platform: '3' },
      { name: 'River Valley', code: 'RVY', arrivalTime: '14:55', departureTime: '14:58', delayText: 'On Time', distance: 430, platform: '2' },
      { name: 'Destination Terminal', code: 'DST', arrivalTime: '16:15', departureTime: 'Ends', delayText: 'On Time', distance: 550, platform: '1' }
    ]
  };
}

// Set up UI nodes
function initTrackerUI() {
  document.getElementById('track-train-name').textContent = currentTrain.trainName;
  document.getElementById('track-train-no').textContent = `#${currentTrain.trainNumber}`;
  
  // Find current station index
  // For live API: find the index which has isCurrent = true (confirmtkt has circle blink)
  // For local: start at index 0 or random
  if (isLiveFromApi) {
    const currentIdx = currentTrain.stations.findIndex(st => st.isCurrent);
    currentStationIndex = currentIdx !== -1 ? currentIdx : 0;
  } else {
    // start near beginning but dynamic
    currentStationIndex = 0;
  }

  updateTimeline();
  drawSVGMap();
}

// Draw timeline station elements
function updateTimeline() {
  const timeline = document.getElementById('route-timeline');
  timeline.innerHTML = currentTrain.stations.map((st, idx) => {
    let stateClass = 'upcoming';
    if (idx < currentStationIndex) stateClass = 'passed';
    else if (idx === currentStationIndex) stateClass = 'current';

    // check delays
    let delayClass = 'on-time';
    if (st.delayText && (st.delayText.toLowerCase().includes('delay') || st.delayText.toLowerCase().includes('late'))) {
      delayClass = 'delayed';
    }

    return `
      <div class="timeline-item ${stateClass} ${delayClass}">
        <div class="timeline-node-info">
          <span class="timeline-st-name">${st.name}</span>
          <span class="timeline-st-code">${st.code}</span>
        </div>
        <div class="timeline-time-row">
          <div class="time-box">Arr: <span>${st.arrivalTime}</span></div>
          <div class="time-box">Dep: <span>${st.departureTime}</span></div>
          <div class="time-box">Platform: <span>${st.platform || '1'}</span></div>
        </div>
        <div class="timeline-delay-info">${st.delayText || 'On Time'}</div>
      </div>
    `;
  }).join('');
}

// Generate the beautiful SVG line map representing stations
function drawSVGMap() {
  const container = document.getElementById('live-map-container');
  const stations = currentTrain.stations;
  const numStations = stations.length;

  const width = Math.max(600, numStations * 95);
  const height = 180;
  const paddingY = 80;
  const paddingX = 50;
  const stepX = (width - paddingX * 2) / (numStations - 1);

  // Map out node coordinates
  const nodes = stations.map((st, idx) => ({
    x: paddingX + idx * stepX,
    y: paddingY,
    ...st
  }));

  // Create SVG elements
  let svgContent = `<svg viewBox="0 0 ${width} ${height}" class="map-svg" xmlns="http://www.w3.org/2000/svg">`;

  // Draw background shadow line
  svgContent += `<line x1="${nodes[0].x}" y1="${nodes[0].y}" x2="${nodes[numStations - 1].x}" y2="${nodes[numStations - 1].y}" class="map-line" />`;

  // Draw active path (passed stations)
  const currentX = nodes[currentStationIndex].x;
  svgContent += `<line x1="${nodes[0].x}" y1="${nodes[0].y}" x2="${currentX}" y2="${nodes[0].y}" class="map-line-active" />`;

  // Draw node circles & text labels
  nodes.forEach((node, idx) => {
    let nodeClass = 'upcoming';
    if (idx < currentStationIndex) nodeClass = 'passed';
    else if (idx === currentStationIndex) nodeClass = 'current';

    // Node circles
    svgContent += `
      <circle 
        cx="${node.x}" 
        cy="${node.y}" 
        r="${nodeClass === 'current' ? 10 : 8}" 
        class="map-node ${nodeClass}" 
        onclick="focusStation(${idx})"
        title="${node.name}" 
      />
    `;

    // Station Name label (offset alternatively up/down for neat look)
    const labelY = node.y + (idx % 2 === 0 ? 30 : -25);
    const codeY = labelY + (idx % 2 === 0 ? 14 : -12);

    svgContent += `
      <text 
        x="${node.x}" 
        y="${labelY}" 
        class="map-node-label ${nodeClass === 'current' ? 'current-label' : ''}"
      >${node.name.length > 12 ? node.name.substring(0, 10) + '..' : node.name}</text>
      
      <text 
        x="${node.x}" 
        y="${codeY}" 
        style="font-size: 9px; fill: var(--text-muted); font-weight: bold; text-anchor: middle;"
      >${node.code}</text>
    `;
  });

  // Draw train icon on top of current station node
  const activeNode = nodes[currentStationIndex];
  svgContent += `
    <g transform="translate(${activeNode.x - 12}, ${activeNode.y - 32})" class="map-train-indicator">
      <!-- Outer Train Icon path -->
      <path d="M4 18h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2zM12 4v14M6 18l-2 4h16l-2-4" 
            stroke="white" stroke-width="2" fill="var(--accent)" stroke-linejoin="round" />
    </g>
  `;

  svgContent += `</svg>`;
  container.innerHTML = svgContent;
}

// Start simulation / live updates loop
function startSimulation() {
  if (isLiveFromApi) {
    // API live mode updates (no local index increment, but speed fluctuates to feel alive)
    currentSpeed = 75; // initial simulated speed
    document.getElementById('tracker-speed-val').textContent = `${currentSpeed} km/h`;
    
    // Update live panel UI values
    updateLivePanelUI();

    simulationInterval = setInterval(() => {
      // Fluctuate speed slightly
      currentSpeed = Math.floor(65 + Math.random() * 45);
      document.getElementById('tracker-speed-val').textContent = `${currentSpeed} km/h`;
      
      // announce current station if we haven't already
      const activeSt = currentTrain.stations[currentStationIndex];
      if (activeSt && !activeSt.announced) {
        announceArrival(activeSt);
        activeSt.announced = true;
      }
    }, 8000);
  } else {
    // Local simulation mode - advances stations every 15 seconds
    currentSpeed = 0;
    document.getElementById('tracker-speed-val').textContent = `0 km/h`;
    updateLivePanelUI();
    
    // Announce starting station immediately
    const startSt = currentTrain.stations[currentStationIndex];
    announceArrival(startSt);
    startSt.announced = true;

    let timeToNextStation = false;

    simulationInterval = setInterval(() => {
      const activeSt = currentTrain.stations[currentStationIndex];
      const nextSt = currentTrain.stations[currentStationIndex + 1];

      if (!nextSt) {
        // Train reached destination
        currentSpeed = 0;
        document.getElementById('tracker-speed-val').textContent = `0 km/h`;
        updateLivePanelUI();
        return;
      }

      if (timeToNextStation) {
        // Arrive at next station
        currentStationIndex++;
        currentSpeed = 0;
        document.getElementById('tracker-speed-val').textContent = `0 km/h`;
        
        const arrivedSt = currentTrain.stations[currentStationIndex];
        announceArrival(arrivedSt);
        
        updateTimeline();
        drawSVGMap();
        updateLivePanelUI();

        timeToNextStation = false; // reset flag (train stops)
      } else {
        // Depart and start travelling
        currentSpeed = Math.floor(90 + Math.random() * 35);
        document.getElementById('tracker-speed-val').textContent = `${currentSpeed} km/h`;
        
        // slight delay simulation
        const randomDelay = Math.random() > 0.6;
        if (randomDelay) {
          nextSt.delayText = `Delay by ${Math.floor(5 + Math.random() * 20)} min`;
        }

        updateLivePanelUI();
        timeToNextStation = true; // flag to arrive on next interval
      }
    }, 12000);
  }
}

// Announce station arrival via text-to-speech
function announceArrival(station) {
  if (station.arrivalTime === 'Starts') {
    speakVoice(`Attention passengers, train ${currentTrain.trainName} is ready to depart from platform number ${station.platform || '1'}. Have a safe journey.`);
  } else if (station.departureTime === 'Ends') {
    speakVoice(`Attention passengers, train ${currentTrain.trainName} has arrived at its final destination, ${station.name}. Thank you for traveling with Rail Pulse.`);
  } else {
    speakVoice(`Attention passengers, train ${currentTrain.trainName} is arriving shortly at platform number ${station.platform || '1'}.`);
  }
}

// Update text and info cards in live tracker panel
function updateLivePanelUI() {
  const stations = currentTrain.stations;
  const currentSt = stations[currentStationIndex];
  const nextSt = stations[currentStationIndex + 1];

  // Title / Running status card updates
  const delayCard = document.getElementById('dashboard-delay-status');
  const delayVal = document.getElementById('tracker-delay-val');
  
  if (currentSt.delayText === 'On Time' || currentSt.delayText === 'Right Time') {
    delayCard.className = 'q-card delay-status on-time';
    delayVal.textContent = 'On Time';
  } else if (currentSt.delayText && (currentSt.delayText.toLowerCase().includes('delay') || currentSt.delayText.toLowerCase().includes('late'))) {
    delayCard.className = 'q-card delay-status delayed';
    delayVal.textContent = currentSt.delayText;
  } else {
    delayCard.className = 'q-card delay-status on-time';
    delayVal.textContent = 'Right Time';
  }

  // Hero Live Status Card texts
  const heroStatusText = document.getElementById('hero-current-status');
  const heroLastUpdated = document.getElementById('hero-last-updated');

  if (currentSt.departureTime === 'Ends') {
    heroStatusText.textContent = `Reached final destination: ${currentSt.name}`;
  } else if (currentSpeed > 0 && nextSt) {
    heroStatusText.textContent = `Travelling to ${nextSt.name} (Speed: ${currentSpeed} km/h)`;
  } else {
    heroStatusText.textContent = `Halted at ${currentSt.name} (Platform ${currentSt.platform || '1'})`;
  }

  if (currentTrain.lastUpdated) {
    heroLastUpdated.textContent = `Last Updated: ${currentTrain.lastUpdated}`;
  } else {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    heroLastUpdated.textContent = `Last Updated: Today ${timeNow}`;
  }

  // Bottom Detail Cards
  document.getElementById('lbl-next-halt').textContent = nextSt ? nextSt.name : 'Terminated';
  document.getElementById('lbl-next-platform').textContent = nextSt ? `PF - ${nextSt.platform || '1'}` : 'Ends';

  // Distance covered card text
  const totalDist = stations[stations.length - 1].distance || 700;
  const coveredDist = currentSt.distance || 0;
  document.getElementById('lbl-distance-covered').textContent = `${coveredDist} / ${totalDist} km`;
}

// User focuses a station node by clicking on it
function focusStation(index) {
  // Update index and UI values to show that station's tracking status
  if (!isLiveFromApi) {
    currentStationIndex = index;
    currentSpeed = 0;
    document.getElementById('tracker-speed-val').textContent = `0 km/h`;
    
    updateTimeline();
    drawSVGMap();
    updateLivePanelUI();
  }
}

// Stop interval loops
function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
}

// Go back button inside dashboard
function goBackFromTracker() {
  document.getElementById('section-tracker').classList.add('hidden');
  
  if (activeSearchTab === 'stations') {
    document.getElementById('section-results').classList.remove('hidden');
  } else {
    document.getElementById('section-landing').classList.remove('hidden');
  }
  
  stopSimulation();
}
