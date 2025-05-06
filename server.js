require('dotenv').config();
const { startWatcher } = require('./controllers/emailController');
const http = require('http');

// Bind to the port Railway provides (or fallback to 3000 locally)
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end('HR Bot alive');
}).listen(PORT, () => {
  console.log(`🌐 HTTP healthcheck listening on port ${PORT}`);
});

startWatcher();
