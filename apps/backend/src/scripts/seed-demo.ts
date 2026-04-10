import 'dotenv/config';
import { DataSource } from 'typeorm';

/**
 * Demo Seed Script
 * Seeds: StackProfiles + Demo Magento Modules
 * Run: npx ts-node -r tsconfig-paths/register src/scripts/seed-demo.ts
 */

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/module_registry',
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  synchronize: false,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('✅ DB connected');

  // Ensure uuid-ossp is available
  await AppDataSource.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

  // ── 1. Seed Stack Profiles ─────────────────────────────────────────────────
  await AppDataSource.query(`
    INSERT INTO stack_profiles (
      id, "magentoVersion", "phpVersion", "dbVersion", "searchEngine",
      "redisVersion", "rabbitmqAvailable", status, notes,
      "dockerImages", "createdAt", "updatedAt"
    ) VALUES
      (
        'm247-php83', '2.4.7-p3', '8.3', 'MariaDB 10.6', 'OpenSearch 2.x',
        '7.x', false, 'active',
        'Latest LTS release. Recommended for new projects.',
        '{"phpFpm":"magento/magento2-php:8.3-fpm","nginx":"nginx:alpine","db":"mariadb:10.6","redis":"redis:7-alpine"}',
        NOW(), NOW()
      ),
      (
        'm246-php82', '2.4.6-p6', '8.2', 'MariaDB 10.6', 'OpenSearch 2.x',
        '7.x', false, 'active',
        'Stable production-grade release. Widely deployed.',
        '{"phpFpm":"magento/magento2-php:8.2-fpm","nginx":"nginx:alpine","db":"mariadb:10.6","redis":"redis:7-alpine"}',
        NOW(), NOW()
      ),
      (
        'm246-php81', '2.4.6-p3', '8.1', 'MySQL 8.0', 'Elasticsearch 7.x',
        '6.x', false, 'deprecated',
        'Legacy release - PHP 8.1 EOL. Kept for backward compat testing.',
        '{"phpFpm":"magento/magento2-php:8.1-fpm","nginx":"nginx:alpine","db":"mysql:8.0","redis":"redis:6-alpine"}',
        NOW(), NOW()
      ),
      (
        'm247-php83-rmq', '2.4.7-p3', '8.3', 'MariaDB 10.6', 'OpenSearch 2.x',
        '7.x', true, 'experimental',
        'High-throughput variant with RabbitMQ for async processing.',
        '{"phpFpm":"magento/magento2-php:8.3-fpm","nginx":"nginx:alpine","db":"mariadb:10.6","redis":"redis:7-alpine","rabbitmq":"rabbitmq:3-management-alpine"}',
        NOW(), NOW()
      )
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('✅ Stack profiles seeded (4 profiles)');

  // ── 2. Seed Demo Modules ───────────────────────────────────────────────────
  const demoModules = [
    {
      name: 'CustomerSegmentation',
      vendor: 'Digitech',
      namespace: 'Digitech_CustomerSegmentation',
      description: 'Advanced customer segmentation engine using behavioral analytics and purchase history patterns. Enables dynamic rule-based customer groups for targeted marketing campaigns.',
      version: '2.1.0',
      status: 'approved',
      capabilities: ['observer', 'plugin', 'api', 'graphql'],
      category: 'Customer',
    },
    {
      name: 'InventoryReservation',
      vendor: 'Digitech',
      namespace: 'Digitech_InventoryReservation',
      description: 'Multi-warehouse inventory reservation system with real-time stock allocation. Prevents overselling across distributed fulfillment centers with atomic lock mechanisms.',
      version: '1.4.2',
      status: 'approved',
      capabilities: ['plugin', 'observer', 'api'],
      category: 'Inventory',
    },
    {
      name: 'CheckoutOptimizer',
      vendor: 'Digitech',
      namespace: 'Digitech_CheckoutOptimizer',
      description: 'One-page checkout performance module. Reduces checkout friction with address auto-completion, smart payment method ordering, and session-aware cart persistence.',
      version: '3.0.1',
      status: 'approved',
      capabilities: ['plugin', 'observer', 'frontend'],
      category: 'Checkout',
    },
    {
      name: 'PriceCalculationEngine',
      vendor: 'Digitech',
      namespace: 'Digitech_PriceCalculationEngine',
      description: 'Rule-based dynamic pricing engine with B2B tier pricing support. Handles complex discount matrices, custom pricelists, and currency-aware rounding strategies.',
      version: '4.2.0',
      status: 'approved',
      capabilities: ['plugin', 'api', 'cron'],
      category: 'Pricing',
    },
    {
      name: 'ElasticSearchEnhancer',
      vendor: 'Digitech',
      namespace: 'Digitech_ElasticSearchEnhancer',
      description: 'Extends native Magento search with typo-tolerance, synonym management, faceted navigation tuning, and ML-based relevance scoring via OpenSearch.',
      version: '2.0.5',
      status: 'approved',
      capabilities: ['plugin', 'observer', 'api', 'graphql'],
      category: 'Search',
    },
    {
      name: 'B2BQuoteWorkflow',
      vendor: 'Digitech',
      namespace: 'Digitech_B2BQuoteWorkflow',
      description: 'Complete B2B quote request and approval workflow with multi-level approval chains, quote versioning, negotiated pricing persistence, and PDF generation.',
      version: '1.8.3',
      status: 'pending',
      capabilities: ['api', 'observer', 'cron', 'plugin'],
      category: 'B2B',
    },
    {
      name: 'AuditTrailLogger',
      vendor: 'Digitech',
      namespace: 'Digitech_AuditTrailLogger',
      description: 'Comprehensive audit trail system for all admin and API operations. Captures user actions, entity changes, and security events with tamper-proof log storage.',
      version: '1.2.0',
      status: 'approved',
      capabilities: ['observer', 'plugin'],
      category: 'Security',
    },
    {
      name: 'SampleMinimal',
      vendor: 'Magento',
      namespace: 'Magento_SampleMinimal',
      description: '[Magento Sample] A minimal skeleton Magento 2 module. Use this for testing the Clone & Adapt transformation pipeline.',
      version: '1.0.0',
      status: 'approved',
      capabilities: ['test'],
      category: 'Samples',
    },
  ];

  for (const mod of demoModules) {
    await AppDataSource.query(`
      INSERT INTO "module" (
        id, name, vendor, namespace, description, version, status,
        capabilities, category, "repoUrl", "repoPath", "defaultBranch",
        "createdAt", "updatedAt"
      ) VALUES (
        uuid_generate_v4(),
        $1, $2, $3, $4, $5, $6,
        $7::jsonb, $8,
        'https://github.com/magento/magento2-samples.git',
        'sample-module-minimal',
        'master',
        NOW(), NOW()
      )
      ON CONFLICT (namespace) DO UPDATE SET
        "repoUrl" = 'https://github.com/magento/magento2-samples.git',
        "repoPath" = 'sample-module-minimal',
        "defaultBranch" = 'master';
    `, [
      mod.name,
      mod.vendor,
      mod.namespace,
      mod.description,
      mod.version,
      mod.status,
      JSON.stringify(mod.capabilities),
      mod.category,
    ]);
    console.log(`  ✅ ${mod.namespace}`);
  }

  console.log('\n🎉 Demo seed complete! 4 stack profiles + 8 modules ready.');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
