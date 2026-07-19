const https = require('https');

// Helper to fetch HTML using native https module with 6-second timeout
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36'
      },
      timeout: 6000
    };

    const req = https.get(url, options, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Server returned status code: ${res.statusCode}`));
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

// Scraper & Parser Logic
function parseTrainStatus(htmlContent) {
  const cleanHtml = htmlContent.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');

  const result = {
    trainName: '',
    trainNumber: '',
    statusText: '',
    lastUpdated: '',
    stations: []
  };

  const h1Match = cleanHtml.match(/<h1[^>]*class="banner-title"[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    const titleText = h1Match[1].trim();
    const trainNumMatch = titleText.match(/(\d{5})/);
    if (trainNumMatch) {
      result.trainNumber = trainNumMatch[1];
    }
    result.trainName = titleText.replace(/Train running status|Spot your train|Live train status|\|/ig, '').trim();
  }

  const updateStatusMatch = cleanHtml.match(/<div[^>]*class="train-update__status"[^>]*>([\s\S]*?)<\/div>/i);
  if (updateStatusMatch) {
    result.statusText = updateStatusMatch[1].replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, '').trim();
  }

  const updateTimeMatch = cleanHtml.match(/<div[^>]*class="train-update__time"[^>]*>([\s\S]*?)<\/div>/i);
  if (updateTimeMatch) {
    let timeText = updateTimeMatch[1].replace(/&nbsp;/g, ' ').trim();
    timeText = timeText.replace(/\(Disclaimer:.*?\)/i, '').replace(/Last Updated:\s*/i, '').trim();
    result.lastUpdated = timeText;
  }

  const parts = cleanHtml.split(/class="well well-sm"/i);
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (!part.includes('rs__station-row')) continue;

    const station = {
      name: '',
      code: '',
      day: '',
      date: '',
      arrivalTime: '',
      departureTime: '',
      delayText: '',
      isCurrent: false
    };

    if (part.includes('circle blink') || part.includes('blink')) {
      station.isCurrent = true;
    }

    const nameMatch = part.match(/<span[^>]*class="rs__station-name[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
    if (nameMatch) {
      station.name = nameMatch[1].replace(/<[^>]*>/g, '').trim();
    }

    const col3Regex = /<div[^>]*class="[^"]*col-xs-3[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    let col3Match;
    const col3s = [];
    while ((col3Match = col3Regex.exec(part)) !== null) {
      col3s.push(col3Match[1]);
    }

    if (col3s.length >= 2) {
      const dayDateContent = col3s[1];
      const spans = dayDateContent.match(/<span>([\s\S]*?)<\/span>/gi) || dayDateContent.match(/<span[^>]*>([\s\S]*?)<\/span>/gi);
      if (spans && spans.length >= 2) {
        station.day = spans[0].replace(/<[^>]*>/g, '').trim();
        station.date = spans[1].replace(/<[^>]*>/g, '').trim();
      } else {
        const text = dayDateContent.replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        const partsOfText = text.split(' ');
        if (partsOfText.length >= 2) {
          station.day = partsOfText[0] + ' ' + partsOfText[1];
          station.date = partsOfText[2] || '';
        }
      }
    }

    const col2Regex = /<div[^>]*class="[^"]*col-xs-2[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    let col2Match;
    const col2s = [];
    while ((col2Match = col2Regex.exec(part)) !== null) {
      col2s.push(col2Match[1]);
    }

    if (col2s.length >= 3) {
      station.arrivalTime = col2s[0].replace(/&nbsp;/g, '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || 'Starts';
      station.departureTime = col2s[1].replace(/&nbsp;/g, '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || 'Ends';
      
      const delayHtml = col2s[2];
      station.delayText = delayHtml.replace(/&nbsp;/g, ' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    result.stations.push(station);
  }

  result.stations.forEach(st => {
    if (st.name) {
      const codeMatch = st.name.match(/\((.*?)\)/);
      if (codeMatch) {
        st.code = codeMatch[1].trim();
        st.name = st.name.replace(/\(.*?\)/g, '').trim();
      } else {
        const popular = {
          'New Delhi': 'NDLS',
          'Mathura Jn': 'MTJ',
          'Agra Cantt': 'AGC',
          'Dhaulpur': 'DHO',
          'Morena': 'MRA',
          'Gwalior': 'GWL',
          'VGL Jhansi': 'VGLJ',
          'Lalitpur Jn': 'LAR',
          'Bina Jn': 'BINA',
          'Bhopal Jn': 'BPL',
          'Rani Kamalapati': 'RKMP'
        };
        if (popular[st.name]) {
          st.code = popular[st.name];
        } else {
          st.code = st.name.substring(0, 3).toUpperCase();
        }
      }
    } else {
      st.name = 'Unknown Station';
      st.code = 'UNK';
    }
  });

  return result;
}

module.exports = async (req, res) => {
  // Use native Node.js HTTP methods for absolute compatibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Parse trainNo query parameter manually to prevent errors if req.query is undefined
  let trainNo = '';
  if (req.query && req.query.trainNo) {
    trainNo = req.query.trainNo;
  } else {
    // Fallback manual query string parsing
    const urlParts = req.url.split('?');
    if (urlParts.length > 1) {
      const params = new URLSearchParams(urlParts[1]);
      trainNo = params.get('trainNo') || '';
    }
  }

  if (!trainNo || !/^\d{5}$/.test(trainNo)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Invalid train number. Must be a 5-digit number.' }));
    return;
  }

  try {
    const targetUrl = `https://www.confirmtkt.com/train-running-status/${trainNo}`;
    const html = await fetchHtml(targetUrl);
    const trainData = parseTrainStatus(html);

    if (!trainData.trainNumber) {
      trainData.trainNumber = trainNo;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(trainData));
  } catch (err) {
    console.error('Scraper Error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Failed to fetch running status. Please check the train number and try again.', 
      details: err.message 
    }));
  }
};
