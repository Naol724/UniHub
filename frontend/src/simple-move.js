const fs = require('fs');

const files = [
  { from: 'auth/Login.jsx', to: '../Login.jsx' },
  { from: 'auth/Register.jsx', to: '../Register.jsx' },
  { from: 'Dashboard/Dashboard.jsx', to: '../Dashboard.jsx' },
  { from: 'Teams/Teams.jsx', to: '../Teams.jsx' },
  { from: 'Tasks/Tasks.jsx', to: '../Tasks.jsx' },
  { from: 'Messages/Messages.jsx', to: '../Messages.jsx' },
  { from: 'Resources/Resources.jsx', to: '../Resources.jsx' },
  { from: 'Notifications/Notifications.jsx', to: '../Notifications.jsx' },
  { from: 'Profile/Profile.jsx', to: '../Profile.jsx' }
];

files.forEach(file => {
  try {
    if (fs.existsSync(file.from)) {
      fs.renameSync(file.from, file.to);
      console.log(`✅ Moved: ${file.from} → ${file.to}`);
    }
  } catch (error) {
    console.error(`❌ Error moving ${file.from}:`, error.message);
  }
});

console.log('🎉 All file moves completed!');
