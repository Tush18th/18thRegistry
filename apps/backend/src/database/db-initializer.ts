import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

const logger = new Logger('DbInitializer');

/**
 * Runs critical one-time database setup BEFORE TypeORM's entity sync.
 * This ensures the uuid-ossp extension is always present so TypeORM
 * can use uuid_generate_v4() as a default column value.
 */
export async function ensureDatabaseExtensions(dataSource: DataSource): Promise<void> {
  try {
    await dataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    logger.log('PostgreSQL extension "uuid-ossp" is ready.');
  } catch (error) {
    logger.warn(`Could not create uuid-ossp extension: ${error.message}`);
    // Non-fatal: the extension may already exist or superuser privilege may be needed.
  }
}
