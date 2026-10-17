const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Remove existing admin(s)
    await User.deleteMany({ role: 'admin' });
    console.log('Cleared old admin user(s).');

    // Create fresh admin with new credentials
    await User.create({
      name: 'Pritam Sudhakar Hajare',
      email: 'PritamHajare@somvalliowner',
      password: 'priTamhaJareadmin108',
      phone: '+916307048821',
      role: 'admin'
    });

    console.log('✅ Admin credentials updated successfully!');
    console.log('   Username (Email): PritamHajare@somvalliowner');
    console.log('   Password        : priTamhaJareadmin108');
    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
