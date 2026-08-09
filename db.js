import mysql from 'mysql2/promise';
import { hospitalData } from './src/scripts/data.js';

// Hostinger Business Web Hosting Unique MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u239297722_lifeusr2',
  password: process.env.DB_PASSWORD || 'LifeLine#2026DbSecret',
  database: process.env.DB_NAME || 'u239297722_lifeline2',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Auto-Initialize All 9 Hostinger MySQL Database Tables & Seed Data
export async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('⚡ Connected to Unique Hostinger MySQL Database (u239297722_lifeline2) successfully!');

    // 1. Appointments Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id VARCHAR(50) UNIQUE NOT NULL,
        patient_name VARCHAR(100) NOT NULL,
        patient_phone VARCHAR(20) NOT NULL,
        department VARCHAR(100) NOT NULL,
        doctor_name VARCHAR(100) NOT NULL,
        appointment_date DATE NOT NULL,
        preferred_time VARCHAR(50) DEFAULT 'Morning 10-12 PM',
        status VARCHAR(30) DEFAULT 'Pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Doctors Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        specialty_id VARCHAR(50) NOT NULL,
        specialty_name VARCHAR(100) NOT NULL,
        qualifications VARCHAR(255),
        experience VARCHAR(50),
        opd_time VARCHAR(100),
        opd_days VARCHAR(100) DEFAULT 'Mon-Sat',
        fee DECIMAL(10,2) DEFAULT 500.00,
        bio TEXT,
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Departments Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(50),
        short_desc VARCHAR(255),
        full_description TEXT,
        key_treatments TEXT,
        icon_bg VARCHAR(50) DEFAULT '#e6f7f5',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Facilities Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS facilities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(50),
        image TEXT,
        category VARCHAR(50) DEFAULT 'Critical Care',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Blogs Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        author VARCHAR(100) DEFAULT 'Life Line Medical Editorial',
        date_str VARCHAR(50),
        read_time VARCHAR(30) DEFAULT '6 min read',
        excerpt TEXT,
        content LONGTEXT NOT NULL,
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Gallery Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        category VARCHAR(50) DEFAULT 'Facilities',
        image TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Testimonials Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_name VARCHAR(100) NOT NULL,
        location VARCHAR(100) DEFAULT 'Ambikapur',
        treatment VARCHAR(100),
        comment TEXT NOT NULL,
        rating INT DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8. Contact Inquiries Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        inquiry_id VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        query_type VARCHAR(100) DEFAULT 'General OPD Inquiry',
        message TEXT,
        status VARCHAR(30) DEFAULT 'New',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 9. Hospital Settings Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hospital_settings (
        setting_key VARCHAR(50) PRIMARY KEY,
        setting_value LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ All 9 Hostinger MySQL Database Tables verified & ready!');

    // Auto-Seed Data if Doctors table is empty
    const [docCheck] = await connection.query('SELECT COUNT(*) as count FROM doctors');
    if (docCheck[0].count === 0 && hospitalData.doctors) {
      console.log('🌱 Seeding initial doctors data into MySQL...');
      for (const doc of hospitalData.doctors) {
        await connection.query(
          `INSERT IGNORE INTO doctors (id, name, specialty_id, specialty_name, qualifications, experience, opd_time, fee, image)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [doc.id, doc.name, doc.specialty, doc.specialtyName, doc.degree, doc.experience, doc.time, doc.fee, doc.image]
        );
      }
    }

    // Auto-Seed Blogs if Blogs table is empty
    const [blogCheck] = await connection.query('SELECT COUNT(*) as count FROM blogs');
    if (blogCheck[0].count === 0 && hospitalData.blogs) {
      console.log('🌱 Seeding initial rich medical articles into MySQL...');
      for (const b of hospitalData.blogs) {
        await connection.query(
          `INSERT IGNORE INTO blogs (id, title, category, date_str, excerpt, content, image)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [b.id, b.title, b.category, b.date, b.excerpt, b.content, b.image]
        );
      }
    }

    connection.release();
  } catch (err) {
    console.error('⚠️ Hostinger MySQL Auto-Init Notice:', err.message);
  }
}

export default pool;
