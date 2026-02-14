import { Client } from '@upstash/qstash';

console.log('Setting up cron schedule for episodes', process.env.QSTASH_TOKEN, process.env.QSTASH_CRON_SECRET_KEY);
const qstash = new Client({ token: process.env.QSTASH_TOKEN! });
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yourfantasysurvivor.com';

await qstash.schedules.create({
  destination: `${BASE_URL}/api/notifications/episodes`,
  cron: '0 15 * * 6', // 15 UTC = 10am ET on Saturday
  headers: { authorization: `Bearer ${process.env.QSTASH_CRON_SECRET_KEY}` },
});

console.log('Cron schedule created');
