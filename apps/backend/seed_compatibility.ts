import { AppDataSource } from './src/data-source';
import { ModuleEntity } from './src/modules/modules/entities/module.entity';

async function seed() {
  await AppDataSource.initialize();
  
  const m = await AppDataSource.getRepository(ModuleEntity).findOne({ 
    where: { vendor: 'Magento', name: 'SampleMinimal' } 
  });

  if (!m) {
    console.error('SampleMinimal module not found');
    process.exit(1);
  }

  console.log('Seeding compatibility for:', m.id);

  await AppDataSource.query(`
    INSERT INTO compatibility_results (
      "moduleId", status, "confidenceScore", "magentoRecommendation", 
      "phpRecommendation", infrastructure, warnings, stale
    ) VALUES (
      $1, 'completed', 
      '{"score": 95, "level": "strong_inference"}', 
      '{"recommended": "2.4.7-p3", "supportedRange": ">=2.4.0"}', 
      '{"recommended": "8.3", "minimum": "8.1"}', 
      '[]', '[]', false
    ) ON CONFLICT DO NOTHING
  `, [m.id]);

  console.log('Seeding complete.');
  await AppDataSource.destroy();
}

seed().catch(console.error);
