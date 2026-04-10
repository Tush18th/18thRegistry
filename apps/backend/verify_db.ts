import { AppDataSource } from './src/data-source';
import { SandboxSessionEntity } from './src/modules/sandbox/entities/sandbox-session.entity';
import { SandboxEventEntity } from './src/modules/sandbox/entities/sandbox-event.entity';

async function verify() {
  await AppDataSource.initialize();
  
  const sessions = await AppDataSource.getRepository(SandboxSessionEntity).find({
    order: { createdAt: 'DESC' },
    take: 1,
    relations: ['module']
  });
  const lastSession = sessions[0];

  if (!lastSession) {
    console.log('No sessions found');
    process.exit(0);
  }

  console.log('\n--- SESSION DETAILS ---');
  console.log(`ID: ${lastSession.id}`);
  console.log(`Status: ${lastSession.status}`);
  console.log(`Module: ${lastSession.module?.vendor}_${lastSession.module?.name}`);
  console.log(`Failure Stage: ${lastSession.failureStage || 'None'}`);
  console.log(`Failure Reason: ${lastSession.failureReason || 'None'}`);

  const events = await AppDataSource.getRepository(SandboxEventEntity).find({
    where: { sessionId: lastSession.id },
    order: { createdAt: 'ASC' }
  });

  console.log('\n--- EVENTS ---');
  events.forEach(e => {
    console.log(`[${e.createdAt.toISOString()}] [${e.type}] ${e.message}`);
  });

  await AppDataSource.destroy();
}

verify().catch(console.error);
