import mysql from 'mysql2/promise';

// Hostinger MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lifeline_hospital_db',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Auto-Initialize MySQL Database Tables on Server Start
export async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('⚡ Connected to Hostinger MySQL Database successfully!');

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
        preferred_time VARCHAR(50),
        status VARCHAR(30) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Doctors Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        specialty VARCHAR(100) NOT NULL,
        qualifications VARCHAR(255),
        experience VARCHAR(50),
        opd_time VARCHAR(100),
        fee DECIMAL(10,2),
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Blogs Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        date_str VARCHAR(50),
        excerpt TEXT,
        content LONGTEXT NOT NULL,
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Contact Inquiries Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        inquiry_id VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        query_type VARCHAR(100),
        message TEXT,
        status VARCHAR(30) DEFAULT 'New',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ Hostinger MySQL Database Schema verified & updated!');
    connection.release();
  } catch (err) {
    console.error('⚠️ MySQL Connection Error (Running in fallback mode):', err.message);
  }
}

export default pool;
