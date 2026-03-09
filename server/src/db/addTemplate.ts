// cretae it by pnpm template:add "Woman Yelling at Cat" "https://i.imgflip.com/345v97.jpg"
import 'dotenv/config';
import { db } from './connection';
import { nanoid } from 'nanoid';
import { uploadImage } from '../lib/cloudinary';
import https from 'https';

const fetchImageBuffer = (url: string): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
  });

const addTemplate = async (name: string, imageUrl: string): Promise<void> => {
  console.log(`Adding template: ${name}...`);

  const buffer = await fetchImageBuffer(imageUrl);
  const { url } = await uploadImage(buffer, 'templates');

  await db
    .insertInto('meme_templates')
    .values({
      id: nanoid(),
      name,
      cloudinary_url: url,
      thumbnail_url: url,
      created_at: new Date(),
    })
    .execute();

  console.log(`✓ "${name}" added successfully`);
  process.exit(0);
};

// Get args from command line
const [, , name, imageUrl] = process.argv;

if (!name || !imageUrl) {
  console.error(
    'Usage: pnpm template:add "Template Name" "https://image-url.jpg"'
  );
  process.exit(1);
}

addTemplate(name, imageUrl).catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
