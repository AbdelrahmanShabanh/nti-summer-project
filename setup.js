const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up E-Commerce Full Stack Application...\n');

// Check if config.env exists
const configPath = path.join(__dirname, 'config.env');
if (!fs.existsSync(configPath)) {
  console.log('📝 Creating config.env file...');
  const configContent = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-app-password
EMAIL_SERVICE=gmail
CLIENT_URL=http://localhost:4200`;

  fs.writeFileSync(configPath, configContent);
  console.log('✅ config.env file created successfully!');
  console.log('⚠️  Please update the email settings in config.env for email confirmation to work.\n');
} else {
  console.log('✅ config.env file already exists.\n');
}

// Check if client directory exists
const clientPath = path.join(__dirname, 'client');
if (!fs.existsSync(clientPath)) {
  console.log('📁 Creating client directory structure...');
  fs.mkdirSync(clientPath, { recursive: true });
  console.log('✅ Client directory created.\n');
} else {
  console.log('✅ Client directory already exists.\n');
}

console.log('📋 Setup Instructions:');
console.log('1. Install server dependencies: npm install');
console.log('2. Install client dependencies: cd client && npm install');
console.log('3. Start MongoDB service');
console.log('4. Update config.env with your email settings');
console.log('5. Start the server: npm run dev');
console.log('6. Start the client: cd client && npm start');
console.log('\n🎉 Setup complete! Follow the instructions above to get started.'); 