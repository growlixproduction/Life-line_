import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './supabaseClient.js';
import { defaultHospitalData } from './src/scripts/data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadFile(filePath, remoteName, mimeType) {
  const fileBuffer = fs.readFileSync(filePath);
  const { data, error } = await supabase.storage
    .from('hospital-assets')
    .upload(remoteName, fileBuffer, {
      contentType: mimeType,
      upsert: true
    });

  if (error) {
    console.error(`❌ Upload failed for ${remoteName}:`, error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('hospital-assets')
    .getPublicUrl(remoteName);

  console.log(`  ✓ Uploaded '${remoteName}' -> ${urlData.publicUrl}`);
  return urlData.publicUrl;
}

async function uploadAllImages() {
  console.log('🚀 UPLOADING ALL LOCAL ASSETS TO SUPABASE STORAGE BUCKET...\n');

  const urlMap = {};

  // 1. Upload all files from public/assets/images
  const assetsImagesDir = path.join(__dirname, 'public', 'assets', 'images');
  if (fs.existsSync(assetsImagesDir)) {
    const files = fs.readdirSync(assetsImagesDir);
    for (const file of files) {
      if (/\.(png|jpe?g|webp)$/i.test(file)) {
        const fullPath = path.join(assetsImagesDir, file);
        const remoteName = `asset-${file.toLowerCase().replace(/[^a-z0-9.]/g, '_')}`;
        const mimeType = file.endsWith('.png') ? 'image/png' : (file.endsWith('.webp') ? 'image/webp' : 'image/jpeg');
        const publicUrl = await uploadFile(fullPath, remoteName, mimeType);
        if (publicUrl) {
          urlMap[`/assets/images/${file}`] = publicUrl;
          urlMap[`/assets/images/${file.toLowerCase()}`] = publicUrl;
        }
      }
    }
  }

  // 2. Upload Screenshots from public/
  const publicDir = path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir);
    for (const file of files) {
      if (/\.(png|jpe?g|webp)$/i.test(file)) {
        const fullPath = path.join(publicDir, file);
        const remoteName = `asset-${file.toLowerCase().replace(/[^a-z0-9.]/g, '_')}`;
        const mimeType = file.endsWith('.png') ? 'image/png' : (file.endsWith('.webp') ? 'image/webp' : 'image/jpeg');
        const publicUrl = await uploadFile(fullPath, remoteName, mimeType);
        if (publicUrl) {
          urlMap[`/${file}`] = publicUrl;
        }
      }
    }
  }

  console.log('\n--- UPLOADED ASSET URL MAP ---');
  console.log(JSON.stringify(urlMap, null, 2));

  // 3. Update data.js with permanent Supabase URLs
  console.log('\nUpdating src/scripts/data.js and Supabase database...');
  
  // Hero Image
  if (urlMap['/assets/images/hospital_hero.png']) {
    defaultHospitalData.hero.imageUrl = urlMap['/assets/images/hospital_hero.png'];
  }

  // Doctors
  defaultHospitalData.doctors.forEach(doc => {
    if (doc.image && urlMap[doc.image]) {
      doc.image = urlMap[doc.image];
    } else if (doc.image && doc.image.startsWith('/assets/images/')) {
      const matched = Object.keys(urlMap).find(k => k.toLowerCase() === doc.image.toLowerCase());
      if (matched) doc.image = urlMap[matched];
    }
  });

  // Blogs
  defaultHospitalData.blogs.forEach(blog => {
    if (blog.image && urlMap[blog.image]) {
      blog.image = urlMap[blog.image];
    }
  });

  // Gallery
  defaultHospitalData.gallery.forEach(gal => {
    if (gal.image && urlMap[gal.image]) {
      gal.image = urlMap[gal.image];
    }
  });

  // 4. Update Supabase Database Tables with online URLs
  console.log('\nSyncing updated URLs to Supabase database tables...');

  // Update doctors table
  for (const doc of defaultHospitalData.doctors) {
    await supabase.from('doctors').upsert([{
      id: doc.id,
      name: doc.name,
      specialty_id: doc.specialty,
      specialty_name: doc.specialtyName,
      qualifications: doc.degree || '',
      experience: doc.experience || '10+ Years Exp',
      opd_time: doc.timings || '10:00 AM - 04:00 PM',
      opd_days: 'Mon - Sat',
      fee: parseFloat(String(doc.fee || '').replace(/[^0-9.]/g, '')) || 500,
      image: doc.image || ''
    }], { onConflict: 'id' });
    console.log(`  ✓ Doctor '${doc.name}' online photo: ${doc.image}`);
  }

  // Update blogs table
  for (const blog of defaultHospitalData.blogs) {
    await supabase.from('blogs').upsert([{
      id: blog.id,
      title: blog.title,
      category: blog.category,
      author: blog.author,
      date_str: blog.date,
      read_time: blog.readTime,
      excerpt: blog.excerpt,
      content: blog.content,
      image: blog.image
    }], { onConflict: 'id' });
    console.log(`  ✓ Blog '${blog.title}' online photo: ${blog.image}`);
  }

  // Update gallery table
  await supabase.from('gallery').delete().neq('id', 0);
  const galleryRows = defaultHospitalData.gallery.map(g => ({
    title: g.title,
    category: g.category || 'Hospital Campus',
    image: g.image || '',
    description: g.caption || ''
  }));
  await supabase.from('gallery').insert(galleryRows);
  console.log(`  ✓ Gallery items updated with Supabase URLs.`);

  // Update hospital_settings
  await supabase.from('hospital_settings').upsert([
    { setting_key: 'hero', setting_value: JSON.stringify(defaultHospitalData.hero) },
    { setting_key: 'gallery', setting_value: JSON.stringify(defaultHospitalData.gallery) },
    { setting_key: 'facilities', setting_value: JSON.stringify(defaultHospitalData.facilities) },
    { setting_key: 'doctor_order', setting_value: JSON.stringify(defaultHospitalData.doctors.map(d => d.id)) }
  ], { onConflict: 'setting_key' });
  console.log(`  ✓ hospital_settings updated with Supabase URLs.`);

  console.log('\n========================================');
  console.log('🎉 ALL LOCAL IMAGES UPLOADED & STORED IN SUPABASE LIVE STORAGE!');
  console.log('========================================');
}

uploadAllImages().catch(console.error);
