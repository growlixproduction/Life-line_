export const defaultHospitalData = {
  name: "Life Line Hospital Ambikapur",
  tagline: "Leading Multispecialty Healthcare & Advanced Trauma Center in Surguja Division",
  topAnnouncement: "24x7 Emergency & Trauma Care | Emergency: +91 7879596337, +91 7879714048 | Ayushman Bharat Cashless Facility Available",
  address: "Namnakala, Opposite Polytechnic College, Outer Ring Road, Ambikapur, Surguja, Chhattisgarh - 497001",
  emergencyPhone: "+91 7879596337",
  opdPhone: "+91 7879714048",
  whatsapp: "+91 7879596337",
  email: "Lifelinehospitalabikapur2017@gmail.com",
  logoUrl: "",
  hero: {
    badge: "24x7 Trauma & Multispecialty Care Active",
    titleMain: "World-Class Healthcare Right in",
    titleHighlight: "Ambikapur",
    description: "Life Line Hospital brings together renowned specialist doctors, 50 Beds, 3 Operation Theatres, modern ICU infrastructure, and 24/7 emergency care to serve Northern Chhattisgarh.",
    imageUrl: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/asset-hospital_hero.png",
    floatingTitle: "24x7 Emergency Care",
    floatingSubtitle: "Trauma & Cardiac Team Ready"
  },
  stats: {
    specialties: "15+",
    doctors: "14+",
    beds: "50",
    patients: "25,000+",
    satisfaction: "99.4%"
  },
  departments: [
    {
      id: "cardiology",
      name: "Cardiology & Cath Lab",
      icon: "heart-pulse",
      shortDesc: "Comprehensive heart care, 24x7 Cath Lab, Angioplasty & TMT.",
      head: "Dr. Sitanshu Sekhar Mohanti & Dr. Satish Chainsingh Suryawanshi (MD, DM Cardiology)",
      fullDescription: "Life Line Hospital's Department of Cardiology & Cath Lab provides round-the-clock emergency cardiac care, interventional cardiology, and non-invasive diagnostic cardiac evaluation in Ambikapur. Equipped with a digital Cath Lab, our cardiac team performs life-saving primary angioplasties during heart attack emergencies.",
      procedures: [
        "Emergency Coronary Angiography & PPCI Angioplasty",
        "Single & Dual Chamber Pacemaker Implantation",
        "2D/4D Color Doppler Echocardiography (ECHO)",
        "Treadmill Stress Test (TMT) & Holter Monitoring",
        "Intensive Cardiac Care Unit (ICCU) Management"
      ],
      equipment: [
        "Flat-Panel Digital Cath Lab",
        "High-Resolution Echocardiogram Machine",
        "Treadmill Stress Test (TMT) Setup",
        "24x7 ICCU Cardiac Monitors & Defibrillators"
      ]
    },
    {
      id: "orthopedics",
      name: "Orthopedics & Joint Replacement",
      icon: "bone",
      shortDesc: "Knee & Hip replacements, Arthroscopy & 24x7 Complex Trauma Care.",
      head: "Dr. Rupesh Gupta (MS Ortho)",
      fullDescription: "The Department of Orthopedics & Joint Replacement offers specialized surgical and non-surgical care for bone, joint, and spine disorders. Our team specializes in computer-assisted Total Knee Replacement (TKR), Total Hip Replacement (THR), Arthroscopic Keyhole Knee Surgery, and complex fracture fixation.",
      procedures: [
        "Total Knee Replacement (TKR) & Total Hip Replacement (THR)",
        "Arthroscopic ACL / Meniscus Repair Keyhole Surgery",
        "Complex Poly-Trauma & Fracture Fixation",
        "Spine Surgery (Discectomy & Spinal Fusion)",
        "Pediatric Orthopedics & Deformity Correction"
      ],
      equipment: [
        "Laminar Airflow Operation Theatre",
        "High-Frequency C-Arm Image Intensifier",
        "Arthroscopy HD Camera Tower",
        "Orthopedic Surgical Power Drills & Instruments"
      ]
    },
    {
      id: "neurology",
      name: "Neurology & Neurosurgery",
      icon: "brain",
      shortDesc: "Brain & Spine surgery, Stroke emergency unit & Nerve care.",
      head: "Dr. Nitesh Kumar Dubey (MBBS, MS, MCh Neurosurgery)",
      fullDescription: "Providing advanced neuro-surgical care and neurological treatment in Surguja district. Our neurosurgery team handles complex brain tumors, head injury trauma emergencies, brain hemorrhage evacuation, micro-discectomy for slipped disc, and acute stroke management.",
      procedures: [
        "Emergency Brain Trauma & Intracranial Hemorrhage Surgery",
        "Micro-Neurosurgical Brain Tumor Excision",
        "Lumbar & Cervical Micro-Discectomy Spine Surgery",
        "Acute Stroke Thrombolysis & Emergency Management",
        "Nerve Conduction Velocity (NCV) & EEG Evaluation"
      ],
      equipment: [
        "High-Definition Surgical Neuro-Microscope",
        "Dedicated Neuro ICU Monitors",
        "3T High-Field MRI Scanner",
        "128-Slice CT Scanner"
      ]
    },
    {
      id: "pediatrics",
      name: "Pediatrics & Neonatology (NICU)",
      icon: "baby",
      shortDesc: "Level-3 NICU, Newborn care, Pediatric Surgery & Vaccination.",
      head: "Dr. Sonal Gardia (MD Pediatrics, DCH)",
      fullDescription: "The Center for Pediatrics & Neonatology offers dedicated Level-3 NICU (Neonatal Intensive Care Unit) for premature and critical newborns. Equipped with advanced incubators, neonatal ventilators, LED phototherapy, and specialized pediatric OPD care.",
      procedures: [
        "Level-3 Neonatal Intensive Care (Premature & Low Birth Weight Babies)",
        "Neonatal Mechanical Ventilation & Surfactant Therapy",
        "Neonatal Jaundice LED Phototherapy & Exchange Transfusion",
        "Complete Pediatric Immunization & Growth Tracking",
        "Pediatric Emergency Trauma & Infectious Disease Care"
      ],
      equipment: [
        "Servo-Controlled Neonatal Incubators",
        "Neonatal Mechanical Ventilators & CPAP",
        "Double-Surface LED Phototherapy Units",
        "Pediatric Pulse Oximetry & Monitors"
      ]
    },
    {
      id: "gynecology",
      name: "Obstetrics & Gynecology",
      icon: "sparkles",
      shortDesc: "Painless delivery, High-risk pregnancy & Laparoscopy.",
      head: "Dr. Shroti Asati, Dr. Bhavna Gardia & Dr. Pravdha Gupta (MS Obs & Gynae)",
      fullDescription: "Providing comprehensive women's health services, maternity care, and gynecological surgeries. Our department specializes in painless epidural deliveries, high-risk pregnancy management, laparoscopic hysterectomy, ovarian cystectomy, and infertility workup.",
      procedures: [
        "Normal & Epidural Painless Delivery / Emergency C-Section",
        "High-Risk Pregnancy & Recurrent Miscarriage Care",
        "Total Laparoscopic Hysterectomy (TLH Keyhole Uterus Surgery)",
        "Laparoscopic Ovarian Cyst & Fibroid Excision",
        "Infertility Workup, Follicular Monitoring & HSG"
      ],
      equipment: [
        "4D Fetal Ultrasound Sonography Machine",
        "Fetal Doppler & Cardiotocography (CTG) Monitor",
        "HD Laparoscopy Camera Tower",
        "Maternity Labor Suites"
      ]
    },
    {
      id: "surgery",
      name: "General & Laparoscopic Surgery",
      icon: "activity",
      shortDesc: "Keyhole laparoscopic surgeries for gallbladder, hernia & appendix.",
      head: "Dr. Prassan Mohan Tripathi, Dr. Chandranshu Tripathi & Dr. Akhilesh Kumar Bharat (MS Surgery, DNB)",
      fullDescription: "Equipped with modern laparoscopic keyhole surgical towers to perform minimally invasive abdominal surgeries with faster recovery, smaller incisions, and minimal pain. Handling routine and emergency general surgeries round-the-clock.",
      procedures: [
        "Laparoscopic Cholecystectomy (Gallbladder Stone Removal)",
        "Laparoscopic Hernia Repair (Inguinal, Umbilical, Ventral)",
        "Laparoscopic Appendectomy (Appendix Removal)",
        "Laser Proctology for Piles, Fissure & Fistula",
        "Emergency Abdominal Trauma & Perforation Surgery"
      ],
      equipment: [
        "4K HD Laparoscopy Tower System",
        "Harmonic Scalpel Energy Device",
        "Electrosurgical High-Frequency Cautery",
        "Infection-Controlled Modular OT"
      ]
    },
    {
      id: "urology",
      name: "Urology & Kidney Care",
      icon: "activity",
      shortDesc: "Laser stone removal (RIRS/PCNL), Prostate surgery & Kidney care.",
      head: "Visiting Urologist Specialist",
      fullDescription: "Comprehensive treatment for kidney stones, prostate enlargement, urinary tract infections, and urological cancers. Featuring advanced Holmium Laser technology for incisionless kidney stone fragmentation and TURP prostate surgery.",
      procedures: [
        "RIRS (Laser Kidney Stone Removal without Incisions)",
        "PCNL (Keyhole Surgery for Large Kidney Stones)",
        "URSL (Laser Ureteric Stone Removal)",
        "TURP (Laser / Bipolar Prostate Surgery)",
        "Hemodialysis Unit & Chronic Kidney Disease Care"
      ],
      equipment: [
        "Holmium Laser Stone Machine",
        "Rigid & Flexible Fiberoptic Ureteroscopes",
        "C-Arm Fluoroscopy Imaging",
        "Hemodialysis Machine Units"
      ]
    },
    {
      id: "radiology",
      name: "Radiology & Diagnostic Pathology",
      icon: "scan",
      shortDesc: "CT-Scan, Digital X-Ray, USG, TMT & Pathology Lab.",
      head: "Radiologist & Imaging Specialist",
      fullDescription: "Providing 24x7 imaging and diagnostic laboratory services. Equipped with high-resolution 3T MRI, 128-Slice CT Scan, 3D/4D Color Ultrasound, Digital Mammography, Digital X-Ray, and NABL-standard automated pathology laboratory.",
      procedures: [
        "3T Whole Body MRI & Brain MR Angiography",
        "128-Slice Whole Body CT Scan & CT Angiography",
        "3D / 4D Color Doppler Ultrasound & Fetal Scan",
        "High-Frequency Digital X-Ray & Special Procedures",
        "24x7 Automated Clinical Biochemistry & Pathology"
      ],
      equipment: [
        "3T High-Field MRI Machine",
        "128-Slice CT Scanner",
        "3D/4D Color Doppler Ultrasound",
        "Automated Clinical Pathology Analyzer"
      ]
    },
    {
      id: "mdmedicine",
      name: "MD Medicine & Critical Care",
      icon: "stethoscope",
      shortDesc: "Internal medicine, critical care, fever clinic & chronic disease management.",
      head: "Dr. Amit Asati (MD Medicine)",
      fullDescription: "The Department of MD Medicine provides comprehensive internal medicine services including diagnosis and treatment of complex medical conditions, critical care ICU management, fever clinic, diabetes care, hypertension management, and emergency medical stabilization.",
      procedures: [
        "Critical Care & ICU Management",
        "Fever Clinic & Infectious Disease Treatment",
        "Diabetes & Hypertension Management",
        "Chronic Disease Management & Follow-Up",
        "Emergency Medical Stabilization & Resuscitation"
      ],
      equipment: [
        "Multi-Parameter ICU Monitors",
        "Advanced Blood Gas Analyzer",
        "Central Venous Pressure Monitoring",
        "Continuous Glucose Monitoring System"
      ]
    },
    {
      id: "dental",
      name: "Dental & Orthodontics",
      icon: "smile",
      shortDesc: "Orthodontic braces, dental implants, root canal & oral surgery.",
      head: "Dr. Suneedh Gupta (BDS, MDS Orthodontics)",
      fullDescription: "The Department of Dental & Orthodontics provides comprehensive dental care including orthodontic treatment with metal and ceramic braces, dental implants, root canal therapy, wisdom tooth extraction, cosmetic dentistry, and preventive oral health care.",
      procedures: [
        "Orthodontic Treatment (Metal & Ceramic Braces)",
        "Dental Implant Surgery",
        "Root Canal Treatment (RCT)",
        "Wisdom Tooth Extraction & Oral Surgery",
        "Cosmetic Dentistry & Teeth Whitening"
      ],
      equipment: [
        "Digital Dental X-Ray (RVG)",
        "Dental Chair with LED Curing Light",
        "Orthodontic Instruments & Brackets System",
        "Dental Sterilization Autoclave"
      ]
    },
    {
      id: "anaesthesiology",
      name: "Anaesthesiology & Critical Care",
      icon: "syringe",
      shortDesc: "Expert anaesthesia for all surgeries, ICU management & pain clinic.",
      head: "Dr. Shivam Kumar Sharma (MBBS, DA, FIPM)",
      fullDescription: "The Department of Anaesthesiology provides expert anaesthesia support for all surgical procedures including general, spinal, and epidural anaesthesia. Our team manages pre-operative assessment, intra-operative monitoring, post-operative pain management, and critical care ventilator management in ICU.",
      procedures: [
        "General Anaesthesia for Major Surgeries",
        "Spinal & Epidural Anaesthesia",
        "Epidural Painless Delivery Anaesthesia",
        "ICU Ventilator & Critical Care Management",
        "Chronic Pain Management & Pain Clinic"
      ],
      equipment: [
        "Advanced Anaesthesia Workstations",
        "Multi-Parameter Patient Monitors",
        "Mechanical Ventilators (ICU Grade)",
        "Ultrasound-Guided Regional Block System"
      ]
    }
  ],
  doctors: [
    {
      id: "doc-1",
      name: "Dr. Amit Asati",
      specialty: "mdmedicine",
      specialtyName: "MD Medicine & Critical Care",
      designation: "Senior Consultant Physician",
      degree: "MD (Medicine)",
      experience: "15+ Years Exp",
      timings: "05:00 AM - 12:00 PM",
      fee: "₹500",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/asset-doctor_male_1.png"
    },
    {
      id: "doc-2",
      name: "Dr. Shroti Asati",
      specialty: "gynecology",
      specialtyName: "Obstetrics & Gynecology",
      designation: "Consultant Gynecologist",
      degree: "MS (Obs & Gynae)",
      experience: "12+ Years Exp",
      timings: "05:00 AM - 12:00 PM",
      fee: "₹500",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/doctor-doc-2-1786613716821.jpeg"
    },
    {
      id: "doc-3",
      name: "Dr. Nitesh Dubey",
      specialty: "neurology",
      specialtyName: "Neurology & Neurosurgery",
      designation: "Neurosurgeon",
      degree: "MBBS, MS, MCh (Neurosurgery)",
      experience: "10+ Years Exp",
      timings: "09:00 AM - 02:00 PM",
      fee: "₹500",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/doctor-1786812234750.png"
    },
    {
      id: "doc-4",
      name: "Dr. Prassan Mohan Tripathi",
      specialty: "surgery",
      specialtyName: "General & Laparoscopic Surgery",
      designation: "Consultant Laparoscopic Surgeon",
      degree: "MS (Surgery), FIAGES",
      experience: "14+ Years Exp",
      timings: "11:00 AM - 03:00 PM",
      fee: "₹600",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/asset-doctor_male_3.png"
    },
    {
      id: "doc-5",
      name: "Dr. Sitanshu Sekhar Mohanti",
      specialty: "cardiology",
      specialtyName: "Cardiology & Cath Lab",
      designation: "Interventional Cardiologist",
      degree: "MD, DM (Cardiology)",
      experience: "16+ Years Exp",
      timings: "10:00 AM - 04:00 PM",
      fee: "₹600",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/doctor-1786812007574.png"
    },
    {
      id: "doc-6",
      name: "Dr. Satish Chainsingh Suryawanshi",
      specialty: "cardiology",
      specialtyName: "Interventional Cardiology",
      designation: "Interventional Cardiologist",
      degree: "MBBS, MD, DM (Cardiology)",
      experience: "15+ Years Exp",
      timings: "11:00 AM - 04:00 PM",
      fee: "₹700",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/asset-doctor_male_1.png"
    },
    {
      id: "doc-7",
      name: "Dr. Bhavna Gardia",
      specialty: "gynecology",
      specialtyName: "Obstetrics & Gynecology",
      designation: "Consultant Gynecologist",
      degree: "MBBS, MD (Obs & Gynae)",
      experience: "11+ Years Exp",
      timings: "09:00 AM - 02:00 PM",
      fee: "₹400",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/asset-doctor_female_2.png"
    },
    {
      id: "doc-8",
      name: "Dr. Akhilesh Ku. Bharat",
      specialty: "surgery",
      specialtyName: "General & Laparoscopic Surgery",
      designation: "General Surgeon",
      degree: "MBBS, DNB (General Surgery)",
      experience: "13+ Years Exp",
      timings: "01:00 PM - 03:00 PM",
      fee: "₹600",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/asset-doctor_male_2.png"
    },
    {
      id: "doc-9",
      name: "Dr. Suneedh Gupta",
      specialty: "dental",
      specialtyName: "Dental & Orthodontics",
      designation: "Orthodontist & Dental Surgeon",
      degree: "BDS, MDS (Orthodontics)",
      experience: "10+ Years Exp",
      timings: "24x7 On Duty",
      fee: "₹500",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/asset-doctor_male_3.png"
    },
    {
      id: "doc-10",
      name: "Dr. Shivam Ku. Sharma",
      specialty: "anaesthesiology",
      specialtyName: "Anaesthesiology & Critical Care",
      designation: "Consultant Anaesthesiologist",
      degree: "MBBS, DA (NBE), FIPM",
      experience: "9+ Years Exp",
      timings: "10:00 AM - 04:00 PM",
      fee: "₹450",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/asset-doctor_male_4.png"
    },
    {
      id: "doc-11",
      name: "Dr. Pravdha Gupta",
      specialty: "gynecology",
      specialtyName: "Gynecology & Infertility",
      designation: "Gynecologist Specialist",
      degree: "MS (Obs & Gynae), DNB",
      experience: "10+ Years Exp",
      timings: "10:00 AM - 03:00 PM",
      fee: "₹500",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/doctor-1786663768660.png"
    },
    {
      id: "doc-12",
      name: "Dr. Rupesh Gupta",
      specialty: "orthopedics",
      specialtyName: "Orthopedics & Trauma",
      designation: "Orthopedic Surgeon",
      degree: "MS (Ortho)",
      experience: "12+ Years Exp",
      timings: "11:00 AM - 05:00 PM",
      fee: "₹500",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/asset-doctor_male_1.png"
    },
    {
      id: "doc-13",
      name: "Dr. Sonal Gardia",
      specialty: "pediatrics",
      specialtyName: "Pediatrics & NICU Specialist",
      designation: "NICU Child Specialist",
      degree: "MD (Pediatrics)",
      experience: "8+ Years Exp",
      timings: "09:30 AM - 02:30 PM",
      fee: "₹400",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/doctor-1786663797971.png"
    },
    {
      id: "doc-14",
      name: "Dr. Chandranshu Tripathi",
      specialty: "surgery",
      specialtyName: "General & Minimally Invasive Surgery",
      designation: "General Surgeon",
      degree: "MS (General Surgery)",
      experience: "11+ Years Exp",
      timings: "10:00 AM - 04:00 PM",
      fee: "₹500",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/doctor-1786663816812.png"
    }
  ],
  tpaInsurance: [
    "Star Health",
    "Niva Bupa",
    "MD India",
    "Health Care",
    "SBI General Insurance",
    "CSPTCL GOVT",
    "TATA AIG Insurance",
    "Universal Sompo General Insurance"
  ],
  facilities: [
    {
      id: "fac-1",
      title: "Super Deluxe Emergency & 24x7 Casualty",
      desc: "Round-the-clock emergency casualty, trauma response beds, and resident emergency medical officers ready 365 days a year.",
      icon: "siren",
      category: "24x7 Emergency",
      image: "",
      features: ["24x7 Resident RMOs", "Super Deluxe Trauma Beds", "Immediate Critical Care Response"]
    },
    {
      id: "fac-2",
      title: "Intensive Care Unit (ICU & Critical Care)",
      desc: "Equipped Intensive Care Unit with central cardiac monitoring, high-end ventilators, central oxygen supply, and continuous 24-hour intensivist care.",
      icon: "heart-pulse",
      category: "Critical Care",
      image: "",
      features: ["Advanced Mechanical Ventilators", "Multipara Vital Monitors", "24x7 Intensive Care Unit"]
    },
    {
      id: "fac-3",
      title: "3 Operation Theatres (3 OTs)",
      desc: "3 sterile Operation Theatres engineered with HEPA-filtered laminar airflow for infection-free orthopedics, neurosurgery, and laparoscopy.",
      icon: "scissors",
      category: "Surgical Suite",
      image: "",
      features: ["3 Operation Theatres", "Laminar Airflow & HEPA Filters", "C-Arm & Laparoscopy Towers"]
    },
    {
      id: "fac-4",
      title: "50-Bed Inpatient Wards (General & Private)",
      desc: "50-bed total inpatient capacity featuring clean General Wards, Semi-Private Rooms, Private Wards, and Super Deluxe AC Rooms.",
      icon: "bed",
      category: "Inpatient Ward",
      image: "",
      features: ["50 Total Beds Capacity", "General & Private AC Wards", "Super Deluxe Patient Rooms"]
    },
    {
      id: "fac-5",
      title: "Cardiology & 24x7 Cath Lab Suite",
      desc: "Flat-panel digital Cath Lab suite for emergency Coronary Angiography, Primary Angioplasty (PPCI), Pacemaker implantation, and TMT.",
      icon: "heart",
      category: "Cardiac Unit",
      image: "",
      features: ["24x7 Cath Lab Operational", "Emergency PPCI Angioplasty", "2D/4D ECHO & TMT Setup"]
    },
    {
      id: "fac-6",
      title: "Pathology & Diagnostic Center (CT, X-Ray, USG)",
      desc: "24x7 imaging and diagnostic laboratory featuring 128-Slice CT-Scan, High-Frequency Digital X-Ray, 3D/4D Color Ultrasound (USG), TMT, and automated Pathology.",
      icon: "scan",
      category: "24x7 Diagnostics",
      image: "",
      features: ["128-Slice CT-Scan & 3T MRI", "Digital X-Ray & 4D USG", "24x7 Automated Pathology Lab"]
    },
    {
      id: "fac-7",
      title: "In-House 24x7 Pharmacy",
      desc: "Round-the-clock fully stocked hospital pharmacy offering genuine prescribed medicines, surgical disposables, and emergency life-saving drugs.",
      icon: "pill",
      category: "24x7 Pharmacy",
      image: "",
      features: ["24x7 Open 365 Days", "100% Genuine Medicines", "Emergency Surgical Supplies"]
    },
    {
      id: "fac-8",
      title: "24x7 Emergency Ambulance Service",
      desc: "24-hour dedicated emergency ambulance equipped with oxygen support, patient stretcher, and trained medical technician response team.",
      icon: "truck",
      category: "24 Hours Available",
      image: "",
      features: ["24-Hour Emergency Ambulance", "Oxygen & Stretcher Equipped", "Prompt Patient Transport"]
    },
    {
      id: "fac-9",
      title: "Ayushman Bharat & Govt. Schemes Cashless Counter",
      desc: "Dedicated ground-floor TPA desk providing 100% cashless inpatient admissions, surgeries, and ICU care under Ayushman Bharat PM-JAY.",
      icon: "shield-check",
      category: "Govt. Schemes Available",
      image: "",
      features: ["Ayushman Bharat PM-JAY", "Dr. Khoobchand Baghel Scheme", "100% Cashless Admission"]
    }
  ],
  blogs: [
    {
      id: "blog-1",
      title: "Understanding Early Heart Attack Symptoms & Emergency First-Aid",
      category: "Cardiology",
      author: "Dr. Sitanshu Sekhar Mohanti",
      date: "2026-08-05",
      readTime: "5 min read",
      excerpt: "Learn the crucial early warning signs of a cardiac event including chest tightness and shortness of breath.",
      content: "Heart attacks are among the leading causes of medical emergencies. Immediate first aid saves lives.",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/asset-screenshot_2026_08_11_164157.png"
    },
    {
      id: "blog-2",
      title: "Total Knee Replacement: When Is It Time to Consult an Orthopedic Surgeon?",
      category: "Orthopedics",
      author: "Dr. Nitesh Dubey",
      date: "2026-08-01",
      readTime: "6 min read",
      excerpt: "Severe knee pain affecting daily walking? Discover modern joint replacement options.",
      content: "Modern joint replacement allows patients to walk pain-free within 24 to 48 hours.",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/asset-screenshot_2026_08_11_164052.png"
    },
    {
      id: "blog-3",
      title: "Essential Care Guidelines During High-Risk Pregnancy",
      category: "Gynecology",
      author: "Dr. Shroti Asati",
      date: "2026-07-28",
      readTime: "4 min read",
      excerpt: "Key precautions and prenatal monitoring tips for mothers.",
      content: "A high-risk pregnancy requires close medical monitoring to ensure safety.",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/asset-screenshot_2026_08_11_164117.png"
    }
  ],
  gallery: [
    {
      id: "gal-1",
      title: "Life Line Hospital Main Campus Building",
      category: "Hospital Campus",
      caption: "Outer Ring Road, Namnakala, Ambikapur Campus",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/asset-screenshot_2026_08_11_163953.png"
    },
    {
      id: "gal-2",
      title: "Advanced Modular Operation Theatre (OT)",
      category: "OT & ICU",
      caption: "Laminar Airflow & HEPA Filter Surgery Suite",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/asset-screenshot_2026_08_11_164052.png"
    },
    {
      id: "gal-3",
      title: "24x7 Critical Care Intensive Unit (ICU)",
      category: "OT & ICU",
      caption: "Level-3 NICU, PICU & Cardiac Emergency Beds",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/asset-screenshot_2026_08_11_164117.png"
    },
    {
      id: "gal-4",
      title: "Digital Flat-Panel Cath Lab Suite",
      category: "Diagnostics & MRI",
      caption: "24x7 Emergency Angioplasty & Cardiac Diagnostics",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/asset-screenshot_2026_08_11_164157.png"
    },
    {
      id: "gal-5",
      title: "CT-Scan & MRI Diagnostic Center",
      category: "Diagnostics & MRI",
      caption: "128-Slice CT Scan, 3T MRI & High-Freq Digital X-Ray",
      image: "https://wduxusyodnfqnhtdtltl.supabase.co/storage/v1/object/public/hospital-assets/asset-screenshot_2026_08_11_164223.png"
    }
  ],
  testimonials: [
    {
      patientName: "Rajeshwar Surguja",
      location: "Ambikapur",
      treatment: "Emergency Cardiology & ICU",
      comment: "Life Line Hospital saved my father during a midnight cardiac emergency. Exceptional care!",
      rating: 5
    },
    {
      patientName: "Priyanka Singh",
      location: "Bishrampur",
      treatment: "Normal Delivery",
      comment: "Extremely clean hospital with caring nursing staff. Dr. Shroti Asati ma’am guided us smoothly.",
      rating: 5
    },
    {
      patientName: "Suresh Kumar Sahu",
      location: "Surajpur",
      treatment: "Laparoscopic Surgery",
      comment: "Got my gallbladder stone surgery done via keyhole laparoscopy. Discharged in 2 days pain free!",
      rating: 5
    }
  ],
  appointments: [
    {
      id: "LLH-894210",
      patientName: "Rameshwar Prasad Sahu",
      patientPhone: "9827154321",
      department: "Cardiology & Cath Lab",
      doctor: "Dr. Sitanshu Sekhar Mohanti",
      date: "2026-08-12",
      time: "10:00 AM - 12:00 PM",
      status: "Pending",
      type: "OPD Booking",
      notes: "Chest discomfort OPD consultation",
      createdTime: "2026-08-11 11:30 AM"
    },
    {
      id: "LLH-731904",
      patientName: "Sunita Verma",
      patientPhone: "7879123456",
      department: "Obstetrics & Gynecology",
      doctor: "Dr. Shroti Asati",
      date: "2026-08-11",
      time: "05:00 AM - 12:00 PM",
      status: "Confirmed",
      type: "OPD Booking",
      notes: "Prenatal routine checkup",
      createdTime: "2026-08-11 09:15 AM"
    }
  ]
,
  director: {
    name: "Dr. Life Line Director",
    title: "Founder & Managing Director",
    qualification: "MBBS, MS (General Surgery)",
    experience: "20+ Years",
    photo: "",
    tagline: "Bringing World-Class Healthcare to Every Doorstep of Surguja Division",
    bio: "Life Line Hospital Ambikapur was founded with one mission — to ensure that every patient in Surguja, Surajpur, Balrampur and surrounding districts receives world-class medical care without traveling to distant cities. Our hospital stands as a testament to that commitment, with 24x7 emergency care, advanced surgical suites, and a dedicated team of specialist doctors.",
    journey: "Born from a deep commitment to serve the people of Northern Chhattisgarh, Life Line Hospital was established to bridge the critical healthcare gap in Surguja division. Over the years, we have grown from a small setup to a 50+ bed multispecialty center equipped with a Cath Lab, 3 Modular Operation Theatres, Level-3 NICU, Laminar Airflow ICU, and 24x7 Casualty — all under one roof in Ambikapur.",
    achievements: [
      "Established Northern CG first 24x7 Digital Cath Lab for Emergency Angioplasty",
      "1000+ Successful Total Knee and Hip Replacement Surgeries in Surguja",
      "Ayushman Bharat Cashless Facility serving 25,000+ tribal patients",
      "Level-3 NICU with Advanced Neonatal Ventilators and LED Phototherapy",
      "24x7 Emergency Trauma Center with Resident Surgeons and Intensivists"
    ],
    socialLinks: { linkedin: "", facebook: "", twitter: "" }
  }
};

export function getHospitalData() {
  try {
    const saved = localStorage.getItem('lifeLineHospitalData');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.hero && parsed.hero.imageUrl && (parsed.hero.imageUrl.includes('unsplash') || parsed.hero.imageUrl.includes('placeholder'))) {
        parsed.hero.imageUrl = defaultHospitalData.hero.imageUrl;
      }
      if (parsed.blogs) {
        parsed.blogs.forEach(b => {
          if (b.image && b.image.includes('unsplash')) {
            b.image = '/Screenshot 2026-08-11 164052.png';
          }
        });
      }
      if (!parsed.gallery || parsed.gallery.length === 0 || parsed.gallery.some(g => g.image && g.image.includes('unsplash'))) {
        parsed.gallery = JSON.parse(JSON.stringify(defaultHospitalData.gallery));
      }
      if (!parsed.appointments) {
        parsed.appointments = [...defaultHospitalData.appointments];
      }
      if (!parsed.director) {
        parsed.director = JSON.parse(JSON.stringify(defaultHospitalData.director));
      }
      return parsed;
    }
  } catch (e) {
    console.error('Could not read saved data from localStorage:', e);
  }
  return JSON.parse(JSON.stringify(defaultHospitalData));
}

export function saveHospitalData(data) {
  try {
    localStorage.setItem('lifeLineHospitalData', JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage quota warning, attempting cleanup:', e);
    try {
      // Clear legacy doc_photo_ keys to free up localStorage space
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('doc_photo_')) {
          localStorage.removeItem(key);
        }
      }
      localStorage.setItem('lifeLineHospitalData', JSON.stringify(data));
    } catch (err) {
      console.error('Critical localStorage save failure:', err);
    }
  }
}
