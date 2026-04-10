import * as path from 'path';
import * as fs from 'fs';
const archiver = require('archiver');

async function createDummyModule() {
  const zipPath = path.join(__dirname, '18th_DummyModule.zip');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`ZIP created: ${archive.pointer()} total bytes at ${zipPath}`);
  });
  archive.on('error', (err: any) => { throw err; });
  archive.pipe(output);

  // Create the module inside a vendor/module directory structure
  // structure: EighteenthDigit/DummyModule/registration.php
  //            EighteenthDigit/DummyModule/etc/module.xml
  //            EighteenthDigit/DummyModule/composer.json
  
  archive.append(
    `<?php \\Magento\\Framework\\Component\\ComponentRegistrar::register(\\Magento\\Framework\\Component\\ComponentRegistrar::MODULE, 'EighteenthDigit_DummyModule', __DIR__);`,
    { name: 'EighteenthDigit/DummyModule/registration.php' }
  );

  archive.append(
    `<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="urn:magento:framework:Module/etc/module.xsd">
    <module name="EighteenthDigit_DummyModule" setup_version="1.0.0">
    </module>
</config>`,
    { name: 'EighteenthDigit/DummyModule/etc/module.xml' }
  );

  archive.append(
    JSON.stringify({
      name: 'eighteenth-digit/module-dummy',
      description: 'A dummy module for 18th registry verification',
      type: 'magento2-module',
      version: '1.0.0',
      require: {
        'php': '~7.4.0||~8.1.0'
      },
      autoload: {
        files: ['registration.php'],
        'psr-4': {
          'EighteenthDigit\\DummyModule\\': ''
        }
      }
    }, null, 2),
    { name: 'EighteenthDigit/DummyModule/composer.json' }
  );

  await archive.finalize();

  console.log('Dummy module ZIP created with correct structure.');
}

createDummyModule().catch(console.error);
