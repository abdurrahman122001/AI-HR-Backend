require('dotenv').config();
const { startWatcher } = require('./controllers/emailController');

console.log('🚀 Starting HR Email Auto-Reply service…');
startWatcher();
