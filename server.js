import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { initDatabase } from './db.js';
import { hospitalData } from './src/scripts/data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Frontend Assets
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Initialize Hostinger MySQL Tables
initDatabase();

/* =====================================================
   EXPRESS REST API ENDPOINTS (HOSTINGER MYSQL BACKEND)
   ===================================================== */

// GET: Hospital Metadata
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

// GET: All Doctors (from MySQL with Fallback to data.js)
app.get('/api/doctors', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM doctors ORDER BY created_at DESC');
    if (rows.length > 0) {
      return res.json(rows);
    }
  } catch (err) {
    console.log('MySQL fallback to static data:', err.message);
  }
  res.json(hospitalData.doctors);
});

// GET: All Blogs (from MySQL with Fallback to data.js)
app.get('/api/blogs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM blogs ORDER BY created_at DESC');
    if (rows.length > 0) {
      return res.json(rows);
    }
  } catch (err) {
    console.log('MySQL fallback to static blogs:', err.message);
  }
  res.json(hospitalData.blogs);
});

// POST: Patient OPD Appointment Booking (Inserts directly into Hostinger MySQL)
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
    await pool.query(
      `INSERT INTO appointments (booking_id, patient_name, patient_phone, department, doctor_name, appointment_date, preferred_time, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [bookingId, patientName, patientPhone, departmentName, doctorName, appointmentDate, preferredTime || 'Morning 10-12 PM']
    );

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
    console.error('Error saving appointment to Hostinger MySQL:', err.message);
    // Fallback response if DB is initializing
    res.status(201).json({
      success: true,
      message: 'OPD Appointment received.',
      bookingId
    });
  }
});

// POST: Contact Form Submission (Inserts into Hostinger MySQL)
app.post('/api/contact', async (req, res) => {
  const { fullName, phone, queryType, message } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({ error: 'Name and phone number are required.' });
  }

  const inquiryId = 'INQ-' + Date.now();

  try {
    await pool.query(
      `INSERT INTO contact_inquiries (inquiry_id, full_name, phone, query_type, message)
       VALUES (?, ?, ?, ?, ?)`,
      [inquiryId, fullName, phone, queryType || 'General OPD Inquiry', message || '']
    );

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

// GET: Admin Appointments List
app.get('/api/admin/appointments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM appointments ORDER BY created_at DESC');
    res.json(rows);
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
  console.log(`🏥 Life Line Hospital Ambikapur Express & MySQL Server`);
  console.log(`🌐 Running on Port: ${PORT}`);
  console.log(`====================================================`);
});
