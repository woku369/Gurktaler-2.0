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
    else if (req.method === 'POST' && url.pathname === '/api/image') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        const { entityType, entityId, dataUrl, index } = JSON.parse(body);
        
        // Extract MIME type and extension
        const mimeMatch = dataUrl.match(/^data:([^;]+);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const extensions = {
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/png': 'png',
          'image/gif': 'gif',
          'image/webp': 'webp',
          'image/bmp': 'bmp'
        };
        const ext = extensions[mimeType] || 'jpg';
        
        // Generate filename and path
        const filename = `${entityId}_${index}.${ext}`;
        const relativePath = `images/${entityType}/${filename}`;
        const fullPath = path.join(BASE_PATH, relativePath);
        
        // Convert base64 to binary
        const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Create directory and write file
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, buffer);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, relativePath: relativePath.replace(/\\/g, '/') }));
      });
    }
    else if (req.method === 'GET' && url.pathname === '/api/image') {
      const relativePath = url.searchParams.get('path') || '';
      const fullPath = path.join(BASE_PATH, relativePath);
      
      // Determine MIME type from extension
      const ext = path.extname(fullPath).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp'
      };
      const mimeType = mimeTypes[ext] || 'image/jpeg';
      
      // Read file and convert to base64
      const buffer = await fs.readFile(fullPath);
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, dataUrl }));
    }
    
    // DELETE /api/image - Delete image
    else if (req.method === 'DELETE' && url.pathname === '/api/image') {
      const relativePath = url.searchParams.get('path') || '';
      const fullPath = path.join(BASE_PATH, relativePath);
      await fs.unlink(fullPath);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    }
    
    // POST /api/backup - Backup erstellen
    else if (req.method === 'POST' && url.pathname === '/api/backup') {
      const { execSync } = require('child_process');
      try {
        const output = execSync('bash /volume1/Gurktaler/zweipunktnull/backup-nas.sh', {
          encoding: 'utf-8',
          timeout: 60000 // 1 Minute Timeout
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Backup erfolgreich erstellt',
          output: output 
        }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: error.message,
          output: error.stdout || error.stderr 
        }));
      }
    }
    
    // GET /api/backups - Liste aller Backups
    else if (req.method === 'GET' && url.pathname === '/api/backups') {
      const backupPath = path.join(BASE_PATH, 'backups');
      try {
        const backups = await fs.readdir(backupPath);
        const backupList = [];
        
        for (const backup of backups) {
          if (backup.startsWith('backup_') || backup.startsWith('safety_backup_')) {
            const fullPath = path.join(backupPath, backup);
            const stats = await fs.stat(fullPath);
            backupList.push({
              name: backup,
              created: stats.mtime,
              size: stats.size
            });
          }
        }
        
        backupList.sort((a, b) => b.created - a.created);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, backups: backupList }));
      } catch (error) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, backups: [] }));
      }
    }
    
    // POST /api/pdf - PDF hochladen
    else if (req.method === 'POST' && url.pathname === '/api/pdf') {
      const boundary = req.headers['content-type']?.split('boundary=')[1];
      if (!boundary) {
        throw new Error('No boundary found in Content-Type');
      }
      
      let body = Buffer.alloc(0);
      req.on('data', chunk => {
        body = Buffer.concat([body, chunk]);
      });
      
      await new Promise((resolve, reject) => {
        req.on('end', resolve);
        req.on('error', reject);
      });
      
      // Parse multipart/form-data
      const bodyStr = body.toString('binary');
      const parts = bodyStr.split(`--${boundary}`);
      
      for (const part of parts) {
        if (part.includes('filename=')) {
          const filenameMatch = part.match(/filename="([^"]+)"/);
          const filename = filenameMatch ? filenameMatch[1] : 'timeline.pdf';
          
          const dataStart = part.indexOf('\r\n\r\n') + 4;
          const dataEnd = part.lastIndexOf('\r\n');
          const fileData = Buffer.from(part.substring(dataStart, dataEnd), 'binary');
          
          const pdfDir = path.join(BASE_PATH, 'pdfs');
          await fs.mkdir(pdfDir, { recursive: true });
          const pdfPath = path.join(pdfDir, filename);
          await fs.writeFile(pdfPath, fileData);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, filename }));
          return;
        }
      }
      
      throw new Error('No file found in request');
    }
    
    // GET /api/pdf/:filename - PDF herunterladen
    else if (req.method === 'GET' && url.pathname.startsWith('/api/pdf/')) {
      const filename = url.pathname.replace('/api/pdf/', '');
      const pdfPath = path.join(BASE_PATH, 'pdfs', filename);
      
      const pdfData = await fs.readFile(pdfPath);
      res.writeHead(200, { 
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`
      });
      res.end(pdfData);
    }
    
    // GET /api/pdfs - Liste aller PDFs
    else if (req.method === 'GET' && url.pathname === '/api/pdfs') {
      const pdfDir = path.join(BASE_PATH, 'pdfs');
      try {
        const files = await fs.readdir(pdfDir);
        const pdfFiles = await Promise.all(
          files
            .filter(f => f.endsWith('.pdf'))
            .map(async (f) => {
              const stat = await fs.stat(path.join(pdfDir, f));
              return {
                filename: f,
                size: stat.size,
                created: stat.mtime
              };
            })
        );
        pdfFiles.sort((a, b) => b.created.getTime() - a.created.getTime());
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, pdfs: pdfFiles }));
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, pdfs: [] }));
      }
    }
    
    // 404 - Not found
    else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
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
