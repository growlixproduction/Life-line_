-- =====================================================
-- LIFE LINE HOSPITAL AMBIKAPUR — COMPLETE MYSQL DATABASE SCHEMA
-- Hostinger Database Name: u239297722_lifeline_db
-- =====================================================

CREATE DATABASE IF NOT EXISTS `u239297722_lifeline_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `u239297722_lifeline_db`;

-- 1. APPOINTMENTS TABLE (Patient OPD Bookings)
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` VARCHAR(50) UNIQUE NOT NULL,
  `patient_name` VARCHAR(100) NOT NULL,
  `patient_phone` VARCHAR(20) NOT NULL,
  `department` VARCHAR(100) NOT NULL,
  `doctor_name` VARCHAR(100) NOT NULL,
  `appointment_date` DATE NOT NULL,
  `preferred_time` VARCHAR(50) DEFAULT 'Morning 10-12 PM',
  `status` VARCHAR(30) DEFAULT 'Pending',
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. DOCTORS TABLE (Medical Specialists & OPD Schedule)
CREATE TABLE IF NOT EXISTS `doctors` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `specialty_id` VARCHAR(50) NOT NULL,
  `specialty_name` VARCHAR(100) NOT NULL,
  `qualifications` VARCHAR(255),
  `experience` VARCHAR(50),
  `opd_time` VARCHAR(100),
  `opd_days` VARCHAR(100) DEFAULT 'Mon-Sat',
  `fee` DECIMAL(10,2) DEFAULT 500.00,
  `bio` TEXT,
  `image` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. DEPARTMENTS TABLE (Medical Centers of Excellence)
CREATE TABLE IF NOT EXISTS `departments` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(50),
  `short_desc` VARCHAR(255),
  `full_description` TEXT,
  `key_treatments` TEXT,
  `icon_bg` VARCHAR(50) DEFAULT '#e6f7f5',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. FACILITIES TABLE (ICU, Cath Lab, Radiology, NICU, OT)
CREATE TABLE IF NOT EXISTS `facilities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `icon` VARCHAR(50),
  `image` TEXT,
  `category` VARCHAR(50) DEFAULT 'Critical Care',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. BLOGS TABLE (Health Guides & Emergency Advice Articles)
CREATE TABLE IF NOT EXISTS `blogs` (
  `id` VARCHAR(50) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `author` VARCHAR(100) DEFAULT 'Life Line Medical Editorial',
  `date_str` VARCHAR(50),
  `read_time` VARCHAR(30) DEFAULT '6 min read',
  `excerpt` TEXT,
  `content` LONGTEXT NOT NULL,
  `image` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. GALLERY TABLE (Hospital Infrastructure & Equipment Photos)
CREATE TABLE IF NOT EXISTS `gallery` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) DEFAULT 'Facilities',
  `image` TEXT NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. TESTIMONIALS TABLE (Patient Reviews & Recovery Stories)
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_name` VARCHAR(100) NOT NULL,
  `location` VARCHAR(100) DEFAULT 'Ambikapur',
  `treatment` VARCHAR(100),
  `comment` TEXT NOT NULL,
  `rating` INT DEFAULT 5,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. CONTACT INQUIRIES TABLE (Patient Queries & Callbacks)
CREATE TABLE IF NOT EXISTS `contact_inquiries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `inquiry_id` VARCHAR(50) UNIQUE NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100),
  `query_type` VARCHAR(100) DEFAULT 'General OPD Inquiry',
  `message` TEXT,
  `status` VARCHAR(30) DEFAULT 'New',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. HOSPITAL SETTINGS TABLE (CMS Config & Announcement Bar)
CREATE TABLE IF NOT EXISTS `hospital_settings` (
  `setting_key` VARCHAR(50) PRIMARY KEY,
  `setting_value` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
