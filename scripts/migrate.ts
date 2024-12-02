import { migrateToSupabase, verifyMigration, rollbackMigration } from '../src/utils/migration/migrateToSupabase';

async function main() {
  try {
    console.log('Starting migration to Supabase...');
    
    // Run migration
    const result = await migrateToSupabase();
    
    console.log('\nMigration Results:');
    console.log('Templates:', {
      migrated: result.templates.migrated,
      failed: result.templates.failed
    });
    console.log('Progress:', {
      migrated: result.progress.migrated,
      failed: result.progress.failed
    });
    console.log('Responses:', {
      migrated: result.responses.migrated,
      failed: result.responses.failed
    });

    // Verify migration
    console.log('\nVerifying migration...');
    const isVerified = await verifyMigration();
    
    if (isVerified) {
      console.log('Migration verified successfully!');
    } else {
      console.log('Migration verification failed. Rolling back...');
      await rollbackMigration();
      console.log('Rollback complete.');
    }

    // Log any errors
    if (result.templates.errors.length > 0) {
      console.log('\nTemplate Errors:');
      result.templates.errors.forEach((error, i) => 
        console.log(`${i + 1}. ${error.message}`)
      );
    }
    
    if (result.progress.errors.length > 0) {
      console.log('\nProgress Errors:');
      result.progress.errors.forEach((error, i) => 
        console.log(`${i + 1}. ${error.message}`)
      );
    }
    
    if (result.responses.errors.length > 0) {
      console.log('\nResponse Errors:');
      result.responses.errors.forEach((error, i) => 
        console.log(`${i + 1}. ${error.message}`)
      );
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main(); 