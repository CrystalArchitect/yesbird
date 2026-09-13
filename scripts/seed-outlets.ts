#!/usr/bin/env node

/**
 * Seed script for populating Yesbird outlets database with real media outlets.
 * Run with: npx tsx scripts/seed-outlets.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createOutlet } from '../src/lib/pitch-store';

interface SeedOutlet {
  name: string;
  website: string;
  categories: string[];
  contacts: Array<{
    name: string;
    email: string;
    role: string;
  }>;
}

async function seedOutlets() {
  try {
    console.log('🌱 Starting outlet database seeding...\n');

    // Load seed data
    const dataPath = resolve(__dirname, 'seed-outlets-data.json');
    const seedData = JSON.parse(readFileSync(dataPath, 'utf-8')) as SeedOutlet[];

    console.log(`📦 Found ${seedData.length} outlets to seed\n`);

    let createdCount = 0;
    for (const outletData of seedData) {
      try {
        const outlet = await createOutlet({
          name: outletData.name,
          website: outletData.website,
          categories: outletData.categories,
          contacts: outletData.contacts,
          tags: [],
        });

        console.log(`✅ Created: ${outlet.name}`);
        console.log(`   ID: ${outlet.id}`);
        console.log(`   Contacts: ${outlet.contacts.length}`);
        console.log(`   Categories: ${outlet.categories.join(', ')}\n`);

        createdCount++;
      } catch (err) {
        console.error(`❌ Failed to create "${outletData.name}":`, err);
      }
    }

    console.log(`\n✨ Seeding complete! Created ${createdCount}/${seedData.length} outlets`);
    process.exit(createdCount === seedData.length ? 0 : 1);
  } catch (err) {
    console.error('💥 Seeding failed:', err);
    process.exit(1);
  }
}

seedOutlets();
