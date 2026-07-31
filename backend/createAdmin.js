const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('Admin user already exists in the database.');
      console.log('Admin Email:', adminExists.email);
      console.log('Note: Password is encrypted. If you forgot it, we can create a new one or reset it.');
    } else {
      const admin = await User.create({
        name: 'Pritam Sudhakar Hajare',
        email: 'pritamhajare12@gmail.com',
        password: 'adminpassword123',
        phone: '+916307048821',
        role: 'admin'
      });
      console.log('New Admin User Created!');
      console.log('Email: pritamhajare12@gmail.com');
      console.log('Password: adminpassword123');
    }
    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
