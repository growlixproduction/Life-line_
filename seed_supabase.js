import { supabase } from './supabaseClient.js';
import { defaultHospitalData } from './src/scripts/data.js';

async function seedAllDataToSupabase() {
  console.log('🚀 STARTING FULL SUPABASE DATABASE SEEDING...');

  // 1. HOSPITAL SETTINGS (Branding, Hero, Director, Doctor Order, Facilities, Gallery, Departments)
  console.log('\n1. Seeding hospital_settings...');
  const settingsToSave = [
    {
      setting_key: 'branding',
      setting_value: JSON.stringify({
        name: defaultHospitalData.name,
        tagline: defaultHospitalData.tagline,
        address: defaultHospitalData.address,
        emergencyPhone: defaultHospitalData.emergencyPhone,
        opdPhone: defaultHospitalData.opdPhone,
        whatsapp: defaultHospitalData.whatsapp,
        email: defaultHospitalData.email,
        topAnnouncement: defaultHospitalData.topAnnouncement,
        stats: defaultHospitalData.stats
      })
    },
    {
      setting_key: 'hero',
      setting_value: JSON.stringify(defaultHospitalData.hero)
    },
    {
      setting_key: 'director',
      setting_value: JSON.stringify(defaultHospitalData.director)
    },
    {
      setting_key: 'doctor_order',
      setting_value: JSON.stringify(defaultHospitalData.doctors.map(d => d.id))
    },
    {
      setting_key: 'departments',
      setting_value: JSON.stringify(defaultHospitalData.departments)
    },
    {
      setting_key: 'facilities',
      setting_value: JSON.stringify(defaultHospitalData.facilities)
    },
    {
      setting_key: 'gallery',
      setting_value: JSON.stringify(defaultHospitalData.gallery)
    }
  ];

  for (const s of settingsToSave) {
    const { error } = await supabase
      .from('hospital_settings')
      .upsert([s], { onConflict: 'setting_key' });
    if (error) console.error(`❌ Setting ${s.setting_key} failed:`, error.message);
    else console.log(`  ✓ Setting '${s.setting_key}' saved.`);
  }

  // 2. DOCTORS
  console.log('\n2. Seeding doctors...');
  const doctorRows = defaultHospitalData.doctors.map(d => ({
    id: d.id,
    name: d.name,
    specialty_id: d.specialty,
    specialty_name: d.specialtyName,
    qualifications: d.degree || '',
    experience: d.experience || '10+ Years',
    opd_time: d.timings || '10:00 AM - 04:00 PM',
    opd_days: 'Mon - Sat',
    fee: parseFloat(String(d.fee || '').replace(/[^0-9.]/g, '')) || 500,
    bio: d.bio || `${d.name} is a specialist in ${d.specialtyName} at Life Line Hospital Ambikapur.`,
    image: d.image || ''
  }));

  for (const doc of doctorRows) {
    const { error } = await supabase
      .from('doctors')
      .upsert([doc], { onConflict: 'id' });
    if (error) console.error(`❌ Doctor ${doc.name} failed:`, error.message);
    else console.log(`  ✓ Doctor '${doc.name}' (${doc.id}) saved.`);
  }

  // 3. DEPARTMENTS
  console.log('\n3. Seeding departments...');
  const deptRows = defaultHospitalData.departments.map(d => ({
    id: d.id,
    name: d.name,
    icon: d.icon || 'activity',
    short_desc: d.shortDesc || '',
    full_description: d.fullDescription || '',
    key_treatments: Array.isArray(d.procedures) ? d.procedures.join('\n') : (d.key_treatments || ''),
    icon_bg: '#e0f2fe'
  }));

  for (const dept of deptRows) {
    const { error } = await supabase
      .from('departments')
      .upsert([dept], { onConflict: 'id' });
    if (error) console.error(`❌ Department ${dept.name} failed:`, error.message);
    else console.log(`  ✓ Department '${dept.name}' (${dept.id}) saved.`);
  }

  // 4. BLOGS
  console.log('\n4. Seeding blogs...');
  const blogRows = defaultHospitalData.blogs.map(b => ({
    id: b.id,
    title: b.title,
    category: b.category || 'Health Guidance',
    author: b.author || 'Life Line Medical Editorial',
    date_str: b.date || new Date().toISOString().split('T')[0],
    read_time: b.readTime || '5 min read',
    excerpt: b.excerpt || '',
    content: b.content || b.excerpt || '',
    image: b.image || ''
  }));

  for (const blog of blogRows) {
    const { error } = await supabase
      .from('blogs')
      .upsert([blog], { onConflict: 'id' });
    if (error) console.error(`❌ Blog ${blog.title} failed:`, error.message);
    else console.log(`  ✓ Blog '${blog.title}' (${blog.id}) saved.`);
  }

  // 5. FACILITIES
  console.log('\n5. Seeding facilities...');
  // Clear existing facilities to avoid duplicates
  await supabase.from('facilities').delete().neq('id', 0);
  const facilityRows = defaultHospitalData.facilities.map(f => ({
    title: f.title,
    description: f.desc || f.description || '',
    icon: f.icon || 'hospital',
    image: f.image || '',
    category: f.category || 'General Care'
  }));

  const { error: facErr, data: facData } = await supabase.from('facilities').insert(facilityRows).select();
  if (facErr) console.error('❌ Facilities insert failed:', facErr.message);
  else console.log(`  ✓ Inserted ${facData.length} facilities.`);

  // 6. GALLERY
  console.log('\n6. Seeding gallery...');
  await supabase.from('gallery').delete().neq('id', 0);
  const galleryRows = defaultHospitalData.gallery.map(g => ({
    title: g.title,
    category: g.category || 'Hospital Campus',
    image: g.image || '',
    description: g.caption || ''
  }));

  const { error: galErr, data: galData } = await supabase.from('gallery').insert(galleryRows).select();
  if (galErr) console.error('❌ Gallery insert failed:', galErr.message);
  else console.log(`  ✓ Inserted ${galData.length} gallery items.`);

  // 7. APPOINTMENTS
  console.log('\n7. Seeding appointments...');
  const apptRows = defaultHospitalData.appointments.map(a => ({
    id: a.id,
    booking_id: a.id,
    patient_name: a.patientName,
    patient_phone: a.patientPhone,
    department: a.department,
    doctor_name: a.doctor,
    appointment_date: a.date,
    preferred_time: a.time,
    status: a.status || 'Pending',
    notes: a.notes || ''
  }));

  for (const appt of apptRows) {
    const { error } = await supabase
      .from('appointments')
      .upsert([appt], { onConflict: 'id' });
    if (error) console.error(`❌ Appointment ${appt.id} failed:`, error.message);
    else console.log(`  ✓ Appointment '${appt.id}' saved.`);
  }

  console.log('\n========================================');
  console.log('🎉 ALL DATA PUSHED TO SUPABASE LIVE DATABASE SUCCESSFULLY!');
  console.log('========================================');
}

seedAllDataToSupabase().catch(err => console.error('Seed exception:', err));
