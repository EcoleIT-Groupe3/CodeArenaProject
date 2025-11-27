const fs = require('fs');
const path = require('path');
const pool = require('../src/config/database');

async function runSeeds() {
  try {
    console.log('🌱 Starting database seeding...');

    const seedsDir = path.join(__dirname, 'seeds');
    const files = fs.readdirSync(seedsDir).sort();

    for (const file of files) {
      if (file.endsWith('.sql')) {
        console.log(`📄 Running seed: ${file}`);
        const sql = fs.readFileSync(path.join(seedsDir, file), 'utf8');
        await pool.query(sql);
        console.log(`✅ Seed ${file} completed`);
      }
    }

    console.log('🎉 All seeds completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeeds();
