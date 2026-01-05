const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const BASE_PATH = '/volume1/Gurktaler/zweipunktnull';
const PORT = 3002;

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    
    if (req.method === 'GET' && url.pathname === '/api/json') {
      const filePath = path.join(BASE_PATH, url.searchParams.get('path') || '');
      const data = await fs.readFile(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    }
    else if (req.method === 'POST' && url.pathname === '/api/json') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        const filePath = path.join(BASE_PATH, url.searchParams.get('path') || '');
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, body, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      });
    }
    else if (req.method === 'DELETE' && url.pathname === '/api/json') {
      const filePath = path.join(BASE_PATH, url.searchParams.get('path') || '');
      await fs.unlink(filePath);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    }
    else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Gurktaler API Server running on port ${PORT}`);
});
