// Simple test script to check server setup
console.log('🔍 Testing server setup...\n');

// Test 1: Check if all required modules can be loaded
console.log('1. Testing module imports...');
try {
  const express = require('express');
  const cors = require('cors');
  const bodyParser = require('body-parser');
  const path = require('path');
  const mongoose = require('mongoose');
  const session = require('express-session');
  const nodemailer = require('nodemailer');
  const bcrypt = require('bcryptjs');
  require('dotenv').config();
  console.log('✅ All modules imported successfully');
} catch (error) {
  console.error('❌ Module import failed:', error.message);
  process.exit(1);
}

// Test 2: Check environment variables
console.log('\n2. Testing environment variables...');
const requiredEnvVars = ['SESSION_SECRET'];
const optionalEnvVars = ['MONGODB_URI', 'EMAIL_USER', 'EMAIL_PASS'];

console.log('Required variables:');
requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`⚠️  ${varName}: Not set (using default)`);
  }
});

console.log('\nOptional variables:');
optionalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`⚠️  ${varName}: Not set`);
  }
});

// Test 3: Check if models can be loaded
console.log('\n3. Testing model imports...');
try {
  const Booking = require('./models/Booking');
  const Admin = require('./models/Admin');
  console.log('✅ Models loaded successfully');
} catch (error) {
  console.error('❌ Model import failed:', error.message);
}

// Test 4: Check if routes can be loaded
console.log('\n4. Testing route imports...');
try {
  const bookingRoutes = require('./routes/booking');
  const adminRoutes = require('./routes/admin');
  console.log('✅ Routes loaded successfully');
} catch (error) {
  console.error('❌ Route import failed:', error.message);
}

console.log('\n🎉 Setup test completed!');
console.log('\nTo start the server, run: npm run dev');
console.log('To create admin user, run: node setup-admin.js');
