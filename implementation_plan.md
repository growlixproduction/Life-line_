# Implementation Plan - Sanjeevani Hospital Ambikapur Demo Website

Creating a modern, high-aesthetic, multi-page light-themed website for **Sanjeevani Hospital Ambikapur** (Surguja, Chhattisgarh). The application will showcase multispecialty healthcare, expert doctors, advanced facilities, media gallery, and an interactive appointment booking system.

## Proposed Architecture & Tech Stack

- **Location**: `C:\Users\PC\.gemini\antigravity-ide\scratch\sanjeevani-hospital-ambikapur`
- **Framework**: Modern Vite web application with responsive UI, CSS custom properties design tokens, interactive JavaScript modules, and smooth micro-animations.
- **Design System**: 
  - **Color Palette**: Clean Medical Teal (`#028090`, `#00A896`), Cyan Blue (`#05668D`), Soft Warm Amber (`#F4A261`), Crisp White (`#FFFFFF`), Light Slate Gray (`#F8FAFC`, `#E2E8F0`).
  - **Typography**: Google Fonts (Outfit / Plus Jakarta Sans & Inter) for clean legibility.
  - **Navigation**: Multi-level glassmorphism header with hover dropdowns for Departments, Facilities, and Hospital Info.

---

## User Review Required

> [!IMPORTANT]
> The website will be generated under `C:\Users\PC\.gemini\antigravity-ide\scratch\sanjeevani-hospital-ambikapur`. After creation, we recommend setting this path as your active workspace.

---

## Proposed Key Pages & Components

### 1. Header & Navigation (Dropdown System)
- **Top Utility Bar**: Emergency 24/7 Helpline, Ambikapur Address, OPD Timings, Ambulance Quick Call.
- **Main Dropdown Navigation**:
  - **Home**
  - **About Us** (Vision & Mission, Founder's Desk, Accreditations)
  - **Departments** (Cardiology, Orthopedics, Neurology, Pediatrics, Gynecology, Oncology, Radiology, Surgery)
  - **Doctors** (Find a Specialist, Consultation Schedule)
  - **Facilities** (ICU/CCU/NICU, Modular OTs, 24/7 Pharmacy, CT/MRI, Deluxe Rooms)
  - **Media Gallery** (Photos, Video Tours, Health Camps)
  - **Contact Us** (Map, Direct Inquiry, Emergency Contacts)
- **Call-to-Action**: "Book Appointment" & "Emergency 24x7" sticky button.

### 2. Home Page Features
- **Hero Section**: Dynamic carousel/banner highlighting 24x7 Emergency, Expert Doctors, and Advanced Healthcare in Ambikapur.
- **Quick Action Bar**: Fast access to Book OPD, Emergency Call, Find Doctor, View Test Reports.
- **Stats Counter**: 25+ Specialties, 50+ Expert Doctors, 200+ Beds, 10,000+ Happy Patients.
- **Featured Departments Grid**: Interactive cards leading to department specifics.
- **Top Doctors Carousel / Spotlight**: Doctor profile cards with qualification badges and booking buttons.
- **Facilities Spotlight**: Highlighting modern surgical & diagnostic technology.
- **Patient Testimonials & Reviews**: Slider showcasing patient satisfaction.

### 3. Departments & Treatments Page
- Filterable department catalogue.
- Detailed treatment listings (e.g. Angioplasty, Knee Replacement, Laparoscopy, Neonatal Care, CT Scan & MRI).

### 4. Doctors Directory Page
- Live instant search by doctor name or specialty.
- Doctor details: Qualification (MBBS, MD, MS, DM), Experience, Days & OPD Timings, Languages spoken.

### 5. Facilities & Infrastructure Page
- High-definition cards with photo representations of ICUs, Dialysis Unit, Modular OTs, Emergency Ward, Blood Bank, and Private Suites.

### 6. Media Gallery Page
- Filterable image lightbox gallery (Hospital Campus, Operation Theatres, Medical Equipment, Community Health Camps).

### 7. Contact Us & Location Page
- Complete Ambikapur details (Near Ring Road / Manendragarh Road, Ambikapur, Chhattisgarh).
- Interactive Contact & Feedback form.
- Emergency & Ambulance direct numbers.

### 8. Interactive Appointment Booking System Modal
- Step-by-step modal for selecting Specialty -> Doctor -> Preferred Date & Time Slot -> Patient Information.
- Digital Appointment Confirmation slip view.

---

## Verification Plan

### Automated Verification
- Verify build & script execution using `npm run build` or local preview command.
- Ensure all asset links, styles, and scripts load without console errors.

### Manual Verification
- Check responsive behavior across desktop, tablet, and mobile views.
- Test dropdown navigation hover and click interactions.
- Test search filtering for Doctors and Treatments.
- Test the appointment booking modal workflow.
