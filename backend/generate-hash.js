#!/usr/bin/env node

/**
 * Script to generate bcrypt hash for passwords
 * Usage: node generate-hash.js
 */

import bcrypt from 'bcryptjs';

async function generateHash() {
  try {
    // Password to hash
    const password = 'admin123456';
    
    console.log('🔐 Password Hashing Utility\n');
    console.log(`Generating hash for password: "${password}"\n`);

    // Generate salt and hash
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    console.log('✅ Hash Generated Successfully:\n');
    console.log(hash);
    console.log('\n📋 Use this hash in your database:\n');
    console.log(`INSERT INTO users (name, email, phone, password_hash, role, is_verified, created_at, updated_at)`);
    console.log(`VALUES ('Admin User', 'admin@tour.com', '+201000000000', '${hash}', 'admin', true, NOW(), NOW());`);

    // Test verification
    console.log('\n🧪 Testing verification...');
    const isValid = await bcrypt.compare(password, hash);
    console.log(`Password matches hash: ${isValid ? '✅ YES' : '❌ NO'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateHash();
