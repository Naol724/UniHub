/**
 * Promote an existing user to admin by email.
 * Usage: node scripts/makeAdmin.js user@email.com
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/user-model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/makeAdmin.js <email>');
  process.exit(1);
}

const run = async () => {
  const uri = process.env.MONGODB_URI || process.env.DB_URL;
  if (!uri) {
    console.error('MONGODB_URI missing in backend/.env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { role: 'admin' },
    { new: true }
  );
  if (!user) {
    console.error('User not found:', email);
    process.exit(1);
  }
  console.log(`✅ ${user.email} is now role=${user.role}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
