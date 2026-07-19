const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

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

    // Extract day and date from second col-xs-3 block
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

    // Extract arrives, departs, delay from col-xs-2 blocks
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

  // Deduce station codes
  result.stations.forEach(st => {
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
        'V Lakshmibai Jhansi Jhs': 'VGLJ',
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
  });

  return result;
}

// Create HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Route: Live train status from ConfirmTkt
  if (pathname.startsWith('/api/status/')) {
    const trainNo = pathname.substring('/api/status/'.length).trim();
    
    if (!/^\d{5}$/.test(trainNo)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid train number. Must be a 5-digit number.' }));
      return;
    }

    try {
      console.log(`Scraping status for train: ${trainNo}...`);
      const targetUrl = `https://www.confirmtkt.com/train-running-status/${trainNo}`;
      
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`ConfirmTkt server returned status ${response.status}`);
      }

      const html = await response.text();
      const trainData = parseTrainStatus(html);

      if (!trainData.trainNumber) {
        trainData.trainNumber = trainNo;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(trainData));
    } catch (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch running status. Please check the train number and try again.', details: err.message }));
    }
    return;
  }

  // Serve static files
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Access Denied');
    return;
  }

  const extname = path.extname(filePath);
  let contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 File Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
