import { AppDataSource } from './src/data-source';

async function run() {
  try {
    await AppDataSource.initialize();
    
    const typesToDrop = [
      'user_status_enum',
      'user_role_enum',
      'module_status_enum',
      'sandbox_status_enum',
      'sandbox_event_type_enum',
      'analysis_status_enum',
      'confidence_level_enum',
      'stack_profile_status_enum'
    ];

    for (const type of typesToDrop) {
      try {
        await AppDataSource.query(`DROP TYPE IF EXISTS "${type}" CASCADE`);
        console.log(`Dropped type: ${type}`);
      } catch (err) {
        console.warn(`Could not drop type ${type}: ${err.message}`);
      }
    }

    console.log('Cleanup completed.');
    await AppDataSource.destroy();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
