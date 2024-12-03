import { addProfileData } from '../src/migrations/add-profile-data';

async function main() {
  try {
    console.log('Adding profile_data to users table...');
    await addProfileData();
    console.log('Successfully added profile_data!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main(); 