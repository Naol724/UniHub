const fs = require('fs');

const envVars = {
  'PORT': '5000',
  'NODE_ENV': 'development',
  'MONGODB_URI': 'mongodb+srv://gonfanaol39_db_user:WGHlbvt6QOEcIuG2@cluster0.unt6mmg.mongodb.net/unihub?retryWrites=true&w=majority&appName=Cluster0',
  'JWT_SECRET': 'db2fcfa3cd899391bad7c60a20e4dea2a1f2929206d6dcd7d9d3f238fbe341362dd3bcbca09f58e5f017697fcae8956e15898c872a6e3cbd21b510da123de03',
  'JWT_EXPIRE': '7d',
  'MAX_FILE_SIZE': '10485760',
  'UPLOAD_PATH': './uploads',
  'EMAIL_HOST': 'smtp.gmail.com',
  'EMAIL_PORT': '587',
  'EMAIL_USER': 'your-email@gmail.com',
  'EMAIL_PASS': 'your-app-password',
  'FRONTEND_URL': 'http://localhost:3000'
};

const envContent = Object.keys(envVars).map(key => `${key}=${envVars[key]}`).join('\n');

fs.writeFileSync('.env', envContent);
console.log('✅ .env file created successfully!');
