import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { DataSource } from 'typeorm';
import { ensureDatabaseExtensions } from './database/db-initializer';

const logger = new Logger('Bootstrap');

await app.listen(3001);
console.log('✅ Backend running at http://localhost:3001');

// ─── Singleton Guard ────────────────────────────────────────────────
// Prevents double-bootstrap when watch mode triggers rapid restarts.
let isBootstrapping = false;

async function bootstrap() {
  if (isBootstrapping) {
    logger.warn('Bootstrap already in progress — skipping duplicate call.');
    return;
  }
  isBootstrapping = true;

  const port = parseInt(process.env.PORT || '3001', 10);

  // ─── Pre-flight: ensure uuid-ossp extension ─────────────────────
  try {
    const tempDs = new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/module_registry',
      synchronize: false,
    });
    await tempDs.initialize();
    await ensureDatabaseExtensions(tempDs);
    await tempDs.destroy();
  } catch (err) {
    logger.warn(`Pre-flight DB extension check skipped: ${err.message}`);
  }

  // ─── Create & configure the Nest app ────────────────────────────
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Graceful shutdown: release the port promptly on SIGINT / SIGTERM
  app.enableShutdownHooks();

  // ─── Listen with EADDRINUSE retry ───────────────────────────────
  // On Windows + watch mode the previous process may not have fully
  // released the socket yet. We retry up to 3 times with a delay.
  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await app.listen(port);
      logger.log(`Application is running on: ${await app.getUrl()}`);
      return; // success — exit the loop
    } catch (err: any) {
      if (err.code === 'EADDRINUSE' && attempt < MAX_RETRIES) {
        const delay = attempt * 1500; // 1.5s, 3s
        logger.warn(
          `Port ${port} in use (attempt ${attempt}/${MAX_RETRIES}). ` +
          `Retrying in ${delay}ms…`,
        );
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err; // fatal — rethrow
      }
    }
  }
}

bootstrap().catch((err) => {
  logger.error(`Fatal bootstrap failure: ${err.message}`, err.stack);
  process.exit(1);
});
