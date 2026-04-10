import * as bcrypt from 'bcryptjs';

async function test() {
  const password = 'Admin@18th2024';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash generated:', hash);
  const match = await bcrypt.compare(password, hash);
  console.log('Match:', match);
}

test();
