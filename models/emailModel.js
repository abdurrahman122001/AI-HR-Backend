const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  sender: String,
  subject: String,
  body: String,
  replySent: Boolean,
});

module.exports = mongoose.model('Email', emailSchema);
