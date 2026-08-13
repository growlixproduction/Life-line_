import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './supabaseClient.js';
import { defaultHospitalData as hospitalData } from './src/scripts/data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve Static Frontend Assets
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

/* =====================================================
   EXPRESS REST API ENDPOINTS (PURE SUPABASE BACKEND)
   ===================================================== */

// GET: All Settings (Branding, Hero, etc. from Supabase hospital_settings)
app.get('/api/settings', async (req, res) => {
  try {
    const { data, error } = await supabase.from('hospital_settings').select('*');
    if (!error && data) {
      const settingsObj = {};
      data.forEach(item => {
        try {
          settingsObj[item.setting_key] = JSON.parse(item.setting_value);
        } catch (e) {
          settingsObj[item.setting_key] = item.setting_value;
        }
      });
      return res.json(settingsObj);
    }
  } catch (err) {
    console.error('Error fetching settings from Supabase:', err.message);
  }
  res.json({});
});

// POST: Save Setting (Upserts into Supabase hospital_settings)
app.post('/api/settings', async (req, res) => {
  const { settingKey, settingValue } = req.body;
  if (!settingKey) {
    return res.status(400).json({ error: 'settingKey is required.' });
  }

  const strValue = typeof settingValue === 'object' ? JSON.stringify(settingValue) : String(settingValue);

  try {
    const { data, error } = await supabase
      .from('hospital_settings')
      .upsert([{ setting_key: settingKey, setting_value: strValue }], { onConflict: 'setting_key' })
      .select();

    if (error) throw error;

    console.log(`⚡ Setting '${settingKey}' updated in Supabase successfully!`);
    res.json({ success: true, settingKey, data });
  } catch (err) {
    console.error('Error saving setting to Supabase:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST: Upload Image to Supabase Storage Bucket 'hospital-assets'
app.post('/api/upload-image', async (req, res) => {
  const { fileName, base64Data } = req.body;
  if (!base64Data) {
    return res.status(400).json({ error: 'Base64 image data is required.' });
  }

  try {
    let fileExt = fileName ? fileName.split('.').pop().toLowerCase() : 'jpg';
    if (fileExt === 'blob' || fileExt === 'data') fileExt = 'jpg';
    const cleanFileName = `asset-${Date.now()}.${fileExt}`;
    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');

    const mimeType = fileExt === 'png' ? 'image/png' : (fileExt === 'webp' ? 'image/webp' : 'image/jpeg');

    const { data, error } = await supabase.storage
      .from('hospital-assets')
      .upload(cleanFileName, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      console.error('❌ Supabase Storage Error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    const { data: publicUrlData } = supabase.storage
      .from('hospital-assets')
      .getPublicUrl(cleanFileName);

    console.log('⚡ UPLOAD SUCCESS TO SUPABASE BUCKET:', publicUrlData.publicUrl);
    return res.json({ url: publicUrlData.publicUrl });
  } catch (err) {
    console.error('Image upload exception:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET: Hospital Info Metadata
app.get('/api/hospital-info', (req, res) => {
  res.json({
    name: hospitalData.name,
    tagline: hospitalData.tagline,
    address: hospitalData.address,
    emergencyPhone: hospitalData.emergencyPhone,
    opdPhone: hospitalData.opdPhone,
    whatsapp: hospitalData.whatsapp,
    email: hospitalData.email,
    stats: hospitalData.stats
  });
});

// GET: All Doctors (from Supabase with data.js Fallback)
app.get('/api/doctors', async (req, res) => {
  try {
    const { data: supaDocs, error } = await supabase.from('doctors').select('*').order('created_at', { ascending: false });
    if (!error && supaDocs && supaDocs.length > 0) {
      return res.json(supaDocs);
    }
  } catch (err) {
    console.log('Supabase doctors fallback notice:', err.message);
  }
  res.json(hospitalData.doctors);
});

// POST: Save or Update Doctor (Upserts into Supabase doctors table)
app.post('/api/doctors', async (req, res) => {
  const doctor = req.body;
  if (!doctor || !doctor.name) {
    return res.status(400).json({ error: 'Doctor name is required.' });
  }

  const docRecord = {
    id: doctor.id || ('doc-' + Date.now()),
    name: doctor.name,
    specialty_id: doctor.specialty || doctor.specialty_id || 'general',
    specialty_name: doctor.specialtyName || doctor.specialty_name || 'General OPD',
    qualifications: doctor.degree || doctor.qualifications || '',
    experience: doctor.experience || '10+ Years',
    opd_time: doctor.timings || doctor.opd_time || '10:00 AM - 04:00 PM',
    fee: parseFloat(String(doctor.fee || '').replace(/[^0-9.]/g, '')) || 500,
    image: doctor.image || ''
  };

  try {
    const { data, error } = await supabase
      .from('doctors')
      .upsert([docRecord], { onConflict: 'id' })
      .select();

    if (error) throw error;

    console.log(`⚡ Doctor '${docRecord.name}' saved to Supabase successfully!`);
    res.status(201).json({ success: true, doctor: docRecord, data });
  } catch (err) {
    console.error('Error saving doctor to Supabase:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Doctor by ID (Deletes from Supabase doctors table)
app.delete('/api/doctors/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('doctors').delete().eq('id', id);
    if (error) throw error;
    console.log(`⚡ Doctor ID '${id}' deleted from Supabase successfully!`);
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting doctor from Supabase:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET: All Blogs (from Supabase with data.js Fallback)
app.get('/api/blogs', async (req, res) => {
  try {
    const { data: supaBlogs, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
    if (!error && supaBlogs && supaBlogs.length > 0) {
      return res.json(supaBlogs);
    }
  } catch (err) {
    console.log('Supabase blogs fallback notice:', err.message);
  }
  res.json(hospitalData.blogs);
});

// POST: Save or Update Blog (Upserts into Supabase blogs table)
app.post('/api/blogs', async (req, res) => {
  const blog = req.body;
  if (!blog || !blog.title) {
    return res.status(400).json({ error: 'Blog title is required.' });
  }

  const blogRecord = {
    id: blog.id || ('blog-' + Date.now()),
    title: blog.title,
    category: blog.category || 'Health Guidance',
    author: blog.author || 'Life Line Medical Editorial',
    date_str: blog.date || blog.date_str || new Date().toISOString().split('T')[0],
    read_time: blog.readTime || blog.read_time || '6 min read',
    excerpt: blog.excerpt || '',
    content: blog.content || blog.excerpt || '',
    image: blog.image || ''
  };

  try {
    const { data, error } = await supabase
      .from('blogs')
      .upsert([blogRecord], { onConflict: 'id' })
      .select();

    if (error) throw error;

    console.log(`⚡ Blog '${blogRecord.title}' saved to Supabase successfully!`);
    res.status(201).json({ success: true, blog: blogRecord, data });
  } catch (err) {
    console.error('Error saving blog to Supabase:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Blog by ID (Deletes from Supabase blogs table)
app.delete('/api/blogs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) throw error;
    console.log(`⚡ Blog ID '${id}' deleted from Supabase successfully!`);
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting blog from Supabase:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET: All Departments
app.get('/api/departments', async (req, res) => {
  try {
    const { data, error } = await supabase.from('departments').select('*').order('created_at', { ascending: true });
    if (!error && data) {
      return res.json(data);
    }
  } catch (err) {
    console.error('Error fetching departments from Supabase:', err.message);
  }
  res.json(hospitalData.departments);
});

// POST: Save Department
app.post('/api/departments', async (req, res) => {
  const dept = req.body;
  if (!dept || !dept.id || !dept.name) {
    return res.status(400).json({ error: 'Department ID and Name are required.' });
  }
  const payload = {
    id: dept.id,
    name: dept.name,
    icon: dept.icon || 'activity',
    short_desc: dept.shortDesc || '',
    full_description: dept.fullDescription || '',
    key_treatments: Array.isArray(dept.procedures) ? dept.procedures.join('\n') : ''
  };
  try {
    const { data, error } = await supabase.from('departments').upsert([payload], { onConflict: 'id' }).select();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error saving uploader department to Supabase:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Delete Department
app.delete('/api/departments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('departments').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error deleting department from Supabase:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST: Patient OPD Appointment Booking (Inserts directly into Supabase)
app.post('/api/appointments', async (req, res) => {
  const { patientName, patientPhone, departmentId, doctorId, appointmentDate, preferredTime } = req.body;

  if (!patientName || !patientPhone || !appointmentDate) {
    return res.status(400).json({ error: 'Patient name, phone, and date are required.' });
  }

  const bookingId = 'LIFE-' + Math.floor(100000 + Math.random() * 900000);
  const doctorObj = hospitalData.doctors.find(d => d.id === doctorId);
  const deptObj = hospitalData.departments.find(d => d.id === departmentId);
  const departmentName = deptObj ? deptObj.name : 'General OPD';
  const doctorName = doctorObj ? doctorObj.name : 'Consultant Specialist';

  try {
    const { data, error } = await supabase.from('appointments').insert([
      {
        booking_id: bookingId,
        patient_name: patientName,
        patient_phone: patientPhone,
        department: departmentName,
        doctor_name: doctorName,
        appointment_date: appointmentDate,
        preferred_time: preferredTime || 'Morning 10-12 PM',
        status: 'Pending'
      }
    ]).select();

    if (error) {
      console.error('Supabase appointment insert error:', error.message);
    } else {
      console.log('⚡ Appointment saved to Supabase:', bookingId);
    }

    res.status(201).json({
      success: true,
      message: 'OPD Appointment successfully registered at Life Line Hospital Ambikapur',
      bookingId,
      patientName,
      departmentName,
      doctorName,
      appointmentDate
    });
  } catch (err) {
    console.error('Error handling appointment booking:', err.message);
    res.status(201).json({
      success: true,
      message: 'OPD Appointment received.',
      bookingId
    });
  }
});

// POST: Contact Form Submission (Inserts directly into Supabase)
app.post('/api/contact', async (req, res) => {
  const { fullName, phone, queryType, message } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({ error: 'Name and phone number are required.' });
  }

  const inquiryId = 'INQ-' + Date.now();

  try {
    const { data, error } = await supabase.from('contact_inquiries').insert([
      {
        inquiry_id: inquiryId,
        full_name: fullName,
        phone: phone,
        query_type: queryType || 'General OPD Inquiry',
        message: message || ''
      }
    ]).select();

    if (error) {
      console.error('Supabase contact insert error:', error.message);
    } else {
      console.log('⚡ Contact inquiry saved to Supabase:', inquiryId);
    }

    res.status(201).json({
      success: true,
      message: 'Inquiry received. Life Line Hospital team will call you shortly.',
      inquiryId
    });
  } catch (err) {
    console.error('Error saving contact inquiry:', err.message);
    res.status(201).json({ success: true, message: 'Inquiry received.' });
  }
});

// GET: Admin Appointments List (Fetches directly from Supabase)
app.get('/api/admin/appointments', async (req, res) => {
  try {
    const { data: supaApps, error } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(supaApps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SPA Fallback Route for Single Page App
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🏥 Life Line Hospital Express & Pure Supabase Server`);
  console.log(`⚡ Supabase Project ID: wduxusyodnfqnhtdtltl`);
  console.log(`🌐 Running on Port: ${PORT}`);
  console.log(`====================================================`);
});
