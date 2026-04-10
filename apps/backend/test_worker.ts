import { Queue, Worker, QueueEvents } from 'bullmq';
import * as path from 'path';
import * as fs from 'fs';
import * as unzipper from 'unzipper';
import * as os from 'os';
import fastGlob from 'fast-glob';
import * as fse from 'fs-extra';
import * as xml2js from 'xml2js';

const redisConfig = { host: 'localhost', port: 6379 };

async function testWorker() {
  // First, drain the queue to remove stale jobs
  const queue = new Queue('repo-sync-vnew', { connection: redisConfig });
  const counts = await queue.getJobCounts('wait', 'active', 'completed', 'failed', 'delayed');
  console.log('Current job counts:', counts);

  // Drain old jobs
  await queue.drain(true);
  console.log('Queue drained.');

  // Now manually process a ZIP upload inline to test the pipeline
  const zipPath = path.join(__dirname, '18th_DummyModule.zip');
  const zipBuffer = fs.readFileSync(zipPath);

  const job = await queue.add('process-zip', {
    fileBuffer: { type: 'Buffer', data: Array.from(zipBuffer) },
    fileName: '18th_DummyModule.zip'
  });
  console.log('Manual job enqueued:', job.id);

  const queueEvents = new QueueEvents('repo-sync-vnew', { connection: redisConfig });

  const result = await job.waitUntilFinished(queueEvents, 30000).catch(e => {
    console.error('Job failed or timed out:', e.message);
    return null;
  });

  console.log('Job result:', JSON.stringify(result, null, 2));

  await queueEvents.close();
  await queue.close();
}

testWorker().catch(console.error);
