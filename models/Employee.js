// src/models/Employee.js
const { Schema, model } = require('mongoose');

const EmployeeSchema = new Schema({
  name:       { type: String, required: true },
  position:   { type: String, required: true },
  department: { type: String },
}, { timestamps: true });

module.exports = model('Employee', EmployeeSchema);
