import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { hospitalData } from './src/scripts/data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-Memory Storage for Demo
const appointmentsDB = [];
const contactInquiriesDB = [];

// Static Files Serving
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// API Endpoints
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

app.get('/api/departments', (req, res) => {
  res.json(hospitalData.departments);
});

app.get('/api/doctors', (req, res) => {
  const { specialty, query } = req.query;
  let doctors = hospitalData.doctors;

  if (specialty && specialty !== 'all') {
    doctors = doctors.filter(d => d.specialty === specialty);
  }

  if (query) {
    const q = query.toLowerCase();
    doctors = doctors.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.specialtyName.toLowerCase().includes(q) ||
      d.degree.toLowerCase().includes(q)
    );
  }

  res.json(doctors);
});

app.get('/api/facilities', (req, res) => {
  res.json(hospitalData.facilities);
});

app.get('/api/gallery', (req, res) => {
  res.json(hospitalData.gallery);
});

// POST: Book Appointment
app.post('/api/appointments', (req, res) => {
  const { patientName, patientPhone, departmentId, doctorId, appointmentDate } = req.body;

  if (!patientName || !patientPhone || !appointmentDate) {
    return res.status(400).json({ error: 'Missing required patient details.' });
  }

  const doctorObj = hospitalData.doctors.find(d => d.id === doctorId);
  const deptObj = hospitalData.departments.find(d => d.id === departmentId);

  const newAppointment = {
    bookingId: 'SANJ-' + Math.floor(100000 + Math.random() * 900000),
    patientName,
    patientPhone,
    department: deptObj ? deptObj.name : 'General OPD',
    doctor: doctorObj ? doctorObj.name : 'Duty Consultant Specialist',
    appointmentDate,
    status: 'Confirmed',
    createdAt: new Date().toISOString()
  };

  appointmentsDB.push(newAppointment);

  res.status(201).json({
    message: 'Appointment successfully registered at Sanjeevani Hospital Ambikapur',
    appointment: newAppointment
  });
});

// POST: Contact Form Submission
app.post('/api/contact', (req, res) => {
  const { fullName, phone, queryType, message } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({ error: 'Name and phone number are required.' });
  }

  const inquiry = {
    id: 'INQ-' + Date.now(),
    fullName,
    phone,
    queryType: queryType || 'General OPD Inquiry',
    message: message || '',
    receivedAt: new Date().toISOString()
  };

  contactInquiriesDB.push(inquiry);

  res.status(201).json({
    message: 'Inquiry received. Hospital team will contact you shortly.',
    inquiry
  });
});

// Serve frontend SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🏥 Sanjeevani Hospital Ambikapur Express Server Running`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
