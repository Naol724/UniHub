#!/usr/bin/env node

/**
 * Cache Cleanup Script
 * Run this script to clear all caches, service workers, and rebuild the app
 * Usage: node clear-cache.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Starting cache cleanup...\n');

// Directories to delete
const dirsToDelete = [
  'dist',
  'node_modules/.vite',
  '.vite',
];

// Delete directories
dirsToDelete.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    console.log(`🗑️  Deleting ${dir}...`);
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ Deleted ${dir}`);
    } catch (error) {
      console.error(`❌ Failed to delete ${dir}:`, error.message);
    }
  } else {
    console.log(`⏭️  ${dir} doesn't exist, skipping`);
  }
});

console.log('\n📦 Reinstalling dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies reinstalled');
} catch (error) {
  console.error('❌ Failed to reinstall dependencies:', error.message);
  process.exit(1);
}

console.log('\n✨ Cache cleanup complete!');
console.log('\n📝 Next steps:');
console.log('1. Clear your browser cache (Ctrl+Shift+Delete)');
console.log('2. Unregister service workers in DevTools → Application → Service Workers');
console.log('3. Run: npm run dev');
console.log('4. Hard refresh the page (Ctrl+Shift+R)\n');
