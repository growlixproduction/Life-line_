# Walkthrough - Sanjeevani Hospital Ambikapur Demo Website

We have built a high-aesthetic, light-themed, professional website and Express.js backend for **Sanjeevani Hospital Ambikapur** (Surguja, Chhattisgarh).

## Accomplished Features

### 1. Modern Light Theme Design & Glassmorphism Header
- Pristine color palette: Medical Teal (`#028090`), Turquoise (`#00A896`), Warm Amber (`#F4A261`), Emergency Red (`#E63946`), Light Slate (`#F8FAFC`).
- Google Fonts (`Outfit` & `Plus Jakarta Sans`) typography.
- Glassmorphism sticky header with top utility bar showing 24/7 Helpline (+91 7774 234 999), OPD Timings, and Ambikapur Address.

### 2. Multi-Level & Mega Dropdown Navigation System
- **Home View**: Dynamic hero banner, quick OPD search bar, live hospital statistics counter, featured departments, doctor spotlight, facility cards, and patient reviews.
- **About Us View**: Vision, mission, founder message, and NABH / Ayushman Bharat cashless accreditations.
- **Departments & Treatments Mega Menu**: Dropdown listing all 8+ specialties with icons (Cardiology, Orthopedics, Neurology, Pediatrics/NICU, OB-GYN, Laparoscopic Surgery, Urology, Radiology).
- **Doctors Directory View**: Interactive live search & filter by specialty, qualification, experience, and OPD timings.
- **Facilities View**: Showcase of 25-Bed ICU, 3T MRI, 128-slice CT scan, modular zero-infection OTs, and 24/7 ACLS Ambulances.
- **Media Gallery View**: Filterable lightbox photo gallery (Campus, Infrastructure, Diagnostics, Health Camps).
- **Contact Us View**: Ambikapur location details, contact form with instant validation, emergency contacts, and direct WhatsApp call triggers.

### 3. Express.js Node.js Server & REST APIs
- Created `server.js` running on `http://localhost:3000`.
- Serving static frontend distribution built with Vite.
- REST API Endpoints:
  - `GET /api/hospital-info`
  - `GET /api/departments`
  - `GET /api/doctors`
  - `GET /api/facilities`
  - `GET /api/gallery`
  - `POST /api/appointments` (Registers patient OPD bookings and generates digital receipt reference IDs)
  - `POST /api/contact` (Handles feedback and inquiry submissions)

---

## Project Location & Files

All project files are saved in:
`C:\Users\PC\.gemini\antigravity-ide\scratch\sanjeevani-hospital-ambikapur`

- [index.html](file:///C:/Users/PC/.gemini/antigravity-ide/scratch/sanjeevani-hospital-ambikapur/index.html)
- [server.js](file:///C:/Users/PC/.gemini/antigravity-ide/scratch/sanjeevani-hospital-ambikapur/server.js)
- [src/scripts/data.js](file:///C:/Users/PC/.gemini/antigravity-ide/scratch/sanjeevani-hospital-ambikapur/src/scripts/data.js)
- [src/scripts/main.js](file:///C:/Users/PC/.gemini/antigravity-ide/scratch/sanjeevani-hospital-ambikapur/src/scripts/main.js)
- [src/styles/main.css](file:///C:/Users/PC/.gemini/antigravity-ide/scratch/sanjeevani-hospital-ambikapur/src/styles/main.css)

---

## Verification & Execution

1. **Vite Production Build**: Verified using `npm run build` (Clean build with zero errors).
2. **Node.js Express Server**: Active and running locally at [http://localhost:3000](http://localhost:3000).
