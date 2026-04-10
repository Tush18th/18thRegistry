import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { IngestionProcessor } from './src/modules/ingestion/ingestion.processor';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // Get the registered Singleton processor
  const processor = app.get(IngestionProcessor);
  
  const zipPath = path.join(__dirname, '18th_DummyModule.zip');
  const buffer = fs.readFileSync(zipPath);

  console.log('Running Manual Ingestion...');
  
  // Fake the BullMQ Job structure
  const fakeJob: any = {
    id: 'manual-1',
    name: 'process-zip',
    data: {
      fileBuffer: { data: Array.from(buffer) },
      fileName: '18th_DummyModule.zip'
    }
  };

  try {
    const res = await processor.process(fakeJob);
    console.log('Manual ingestion result:', res);
  } catch (err) {
    console.error('Manual ingestion failed:', err);
  }

  await app.close();
}

bootstrap();
