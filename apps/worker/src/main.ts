import { Worker } from 'bull';
import * as Redis from 'redis';

// Import job processors
import { processIngestionJob } from './jobs/ingestion/processor';
import { processValidationJob } from './jobs/validation/processor';
import { processGenerationJob } from './jobs/generation/processor';
import { processExportJob } from './jobs/export/processor';

async function startWorker() {
  const redisClient = Redis.createClient({ url: process.env.REDIS_URL });

  await redisClient.connect();

  // Create queues
  const ingestionQueue = new Worker('ingestion', processIngestionJob, {
    connection: redisClient,
  });

  const validationQueue = new Worker('validation', processValidationJob, {
    connection: redisClient,
  });

  const generationQueue = new Worker('generation', processGenerationJob, {
    connection: redisClient,
  });

  const exportQueue = new Worker('export', processExportJob, {
    connection: redisClient,
  });

  console.log('Worker started and listening for jobs...');

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await ingestionQueue.close();
    await validationQueue.close();
    await generationQueue.close();
    await exportQueue.close();
    await redisClient.quit();
    process.exit(0);
  });
}

startWorker().catch(console.error);