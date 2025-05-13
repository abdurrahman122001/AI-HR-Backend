require('dotenv').config();
const mongoose = require('mongoose');
const { startWatcher } = require('./controllers/emailController');

const PORT = process.env.PORT || 3000;

// 1) Health-check HTTP server so Railway (or any host) keeps it alive
// 2) Connect to MongoDB (no deprecated options)
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('🗄️  Connected to MongoDB');
    // 3) Only start the IMAP watcher once DB is up
    startWatcher();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
