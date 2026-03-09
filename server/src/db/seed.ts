import 'dotenv/config';
import { db } from './connection';
import { nanoid } from 'nanoid';
import { uploadImage } from '../lib/cloudinary';
import https from 'https';

const memeTemplates = [
  { name: 'Drake Pointing', url: 'https://i.imgflip.com/30b1gx.jpg' },
  { name: 'Distracted Boyfriend', url: 'https://i.imgflip.com/1ur9b0.jpg' },
  { name: 'Two Buttons', url: 'https://i.imgflip.com/1g8my4.jpg' },
  { name: 'Change My Mind', url: 'https://i.imgflip.com/24y43o.jpg' },
  { name: 'Expanding Brain', url: 'https://i.imgflip.com/1jwhww.jpg' },
  { name: 'Surprised Pikachu', url: 'https://i.imgflip.com/2kbn1e.jpg' },
  { name: 'This Is Fine', url: 'https://i.imgflip.com/wxica.jpg' },
  { name: 'Gru Plan', url: 'https://i.imgflip.com/26am.jpg' },
];

const fetchImageBuffer = (url: string): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
  });

const seed = async () => {
  console.log('Seeding meme templates...');

  // Clear existing templates
  await db.deleteFrom('meme_templates').execute();

  for (const template of memeTemplates) {
    console.log(`Uploading ${template.name}...`);
    const buffer = await fetchImageBuffer(template.url);
    const { url } = await uploadImage(buffer, 'templates');

    await db
      .insertInto('meme_templates')
      .values({
        id: nanoid(),
        name: template.name,
        cloudinary_url: url,
        thumbnail_url: url,
        created_at: new Date(),
      })
      .execute();

    console.log(`✓ ${template.name} uploaded`);
  }

  console.log(`Seeded ${memeTemplates.length} meme templates`);
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
