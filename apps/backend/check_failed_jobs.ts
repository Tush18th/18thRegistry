import { Queue } from 'bullmq';

async function run() {
  const queue = new Queue('repo-sync', { connection: { host: 'localhost', port: 6379 } });
  
  const failedJobs = await queue.getFailed();
  console.log(`Found ${failedJobs.length} failed jobs.`);
  
  for (const job of failedJobs.slice(-5)) {
    console.log(`Job ${job.id} failed reason:`, job.failedReason);
    if (job.stacktrace) {
      console.log(`Stack trace:\n`, job.stacktrace[0]);
    }
  }

  await queue.close();
}

run().catch(console.error);
