const fs = require('fs');
const crypto = require('crypto');

// Generate a random secret key
const secretKey = crypto.randomBytes(32).toString('hex');

// Create .env content
const envContent = `# Session Secret (auto-generated)
SESSION_SECRET=${secretKey}

# Domain
DOMAIN=http://localhost:3000

# Optional: MongoDB URI (if you want to use MongoDB later)
# MONGODB_URI=mongodb://localhost:27017/portfolio

# Optional: Email Configuration (not needed for basic functionality)
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password
`;

// Write .env file
fs.writeFileSync('.env', envContent);

console.log('✅ .env file created successfully!');
console.log(`🔑 Secret key generated: ${secretKey}`);
console.log('\n📝 Your .env file contains:');
console.log('   - SESSION_SECRET (auto-generated)');
console.log('   - DOMAIN (set to localhost:3000)');
console.log('   - Email settings (commented out - not needed)');
console.log('\n🚀 You can now run: npm run dev-sqlite');
