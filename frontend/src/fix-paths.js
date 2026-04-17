const fs = require('fs');
const path = require('path');

const moves = [
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

moves.forEach(move => {
  try {
    fs.renameSync(move.from, move.to);
    console.log(`✅ Moved: ${move.from} → ${move.to}`);
  } catch (error) {
    console.error(`❌ Error moving ${move.from}:`, error.message);
  }
});

console.log('🎉 All files moved successfully!');
