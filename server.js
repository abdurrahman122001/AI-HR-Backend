require('dotenv').config();
const { startWatcher } = require('./controllers/emailController');
const http = require('http');

const PORT = process.env.PORT || 3000;

// Healthcheck endpoint so Railway sees a live web server
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('OK');
}).listen(PORT, () => {
  console.log(`🚀 HTTP server listening on port ${PORT}`);
});

// Now start your IMAP watcher
startWatcher();
