const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

async function setupAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio');
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('❌ Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const admin = new Admin({
            username: 'admin',
            password: 'admin123' // This will be hashed automatically
        });

        await admin.save();
        console.log('✅ Admin user created successfully');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('⚠️  Please change the password after first login!');

    } catch (error) {
        console.error('❌ Setup failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

setupAdmin();
