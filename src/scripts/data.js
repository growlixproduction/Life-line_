export const hospitalData = {
  name: "Life Line Hospital Ambikapur",
  tagline: "Leading Multispecialty Healthcare & Advanced Trauma Center in Surguja Division",
  address: "Near Ring Road, Opp. Collectorate Office Road, Ambikapur, Surguja District, Chhattisgarh - 497001",
  emergencyPhone: "+91 7774 234 999",
  opdPhone: "+91 7774 235 888",
  whatsapp: "+91 94252 88990",
  email: "info@lifelinehospitalambikapur.com",
  timingOPD: "Monday to Saturday: 9:00 AM - 8:00 PM (Emergency 24x7)",
  established: 2012,
  stats: {
    specialties: "25+",
    doctors: "45+",
    beds: "200+",
    surgeries: "15,000+",
    emergencyResponse: "< 10 Mins"
  },
  departments: [
    {
      id: "cardiology",
      name: "Cardiology & Cardiac Surgery",
      icon: "heart-pulse",
      shortDesc: "Comprehensive heart care including 24/7 Cath Lab, Angioplasty & Echo.",
      overview: "Life Line Hospital houses Ambikapur's most advanced Cardiac Sciences department, offering round-the-clock emergency angioplasty, pacemaker implantations, color doppler, and non-invasive cardiac evaluation.",
      head: "Dr. Rajeshwar Sharma (MD, DM Cardiology)",
      treatments: [
        "Primary & Emergency Angioplasty (PPCI)",
        "Coronary Angiography",
        "Pacemaker & ICD Implantation",
        "2D & 4D Echocardiography",
        "TMT (Treadmill Test) & Holter Monitoring",
        "Hypertension & Heart Failure Clinic"
      ]
    },
    {
      id: "orthopedics",
      name: "Orthopedics & Joint Replacement",
      icon: "bone",
      shortDesc: "Knee & Hip replacements, Arthroscopy & 24x7 Complex Trauma Care.",
      overview: "Equipped with laminar airflow operation theatres, computer-navigated surgical tools, and a dedicated physiotherapy unit for fast mobility restoration.",
      head: "Dr. Alok K. Verma (MS Ortho, Fellow Joint Replacement)",
      treatments: [
        "Total Knee Replacement (TKR)",
        "Total Hip Replacement (THR)",
        "Arthroscopic Knee & Shoulder Surgeries",
        "Complex Trauma & Fracture Fixation",
        "Pediatric Orthopedics & Deformity Correction",
        "Spine Surgery & Slip Disc Care"
      ]
    },
    {
      id: "neurology",
      name: "Neurology & Neurosurgery",
      icon: "brain",
      shortDesc: "Brain & Spine surgery, Stroke emergency unit, Epilepsy & Nerve care.",
      overview: "Dedicated Stroke Unit with thrombolytic therapy capability within the golden hour, backed by 128-slice CT, high-end MRI, and neuro-intensive care.",
      head: "Dr. S. P. Singh (MCh Neurosurgery, AIIMS Alumnus)",
      treatments: [
        "Acute Ischemic Stroke Thrombolysis",
        "Brain Tumor Resection",
        "Microscopic Spine Surgery",
        "Head Injury & Neuro Trauma Emergency",
        "Epilepsy & Migraine Management",
        "Parkinson's & Movement Disorders"
      ]
    },
    {
      id: "pediatrics",
      name: "Pediatrics & Neonatology (NICU)",
      icon: "baby",
      shortDesc: "Level-3 NICU & PICU, Newborn care, Pediatric Surgery & Vaccination.",
      overview: "Equipped with advanced warmers, ventilators, phototherapy units, and specialized neonatologists caring for premature and critically ill newborns.",
      head: "Dr. Sunita Gupta (MD Pediatrics, Fellow Neonatology)",
      treatments: [
        "Level-III Neonatal ICU Care",
        "Premature Baby Care (from 28 weeks)",
        "Pediatric Intensive Care (PICU)",
        "Childhood Vaccination & Growth Tracking",
        "Pediatric Surgery & Congenital Care",
        "Asthma & Childhood Allergy Clinic"
      ]
    },
    {
      id: "gynaecology",
      name: "Obstetrics & Gynecology",
      icon: "sparkles",
      shortDesc: "Painless delivery, High-risk pregnancy, Laparoscopy & Infertility clinic.",
      overview: "Complete care for women at every stage of life—from routine maternity and painless labor to advanced laparoscopic hysterectomy and fertility guidance.",
      head: "Dr. Ananya Mishra (MS OB-GYN, DNB)",
      treatments: [
        "Painless & Normal Delivery",
        "High-Risk Pregnancy Management",
        "Advanced Laparoscopic Hysterectomy",
        "Infertility Evaluation & IUI",
        "PCOS & Hormonal Disorder Clinic",
        "Cervical Cancer Screening & HPV Vaccine"
      ]
    },
    {
      id: "surgery",
      name: "General & Laparoscopic Surgery",
      icon: "scalpel",
      shortDesc: "Keyhole laparoscopic surgeries for Gallbladder, Hernia & Appendicitis.",
      overview: "Minimal access surgery minimizing pain, scars, and hospital stay with state-of-the-art 4K laparoscopic surgical stack.",
      head: "Dr. Manish Tiwari (MS General Surgery, FIAGES)",
      treatments: [
        "Laparoscopic Cholecystectomy (Gallbladder)",
        "Laparoscopic Hernia Repair (Inguinal/Ventral)",
        "Laparoscopic Appendectomy",
        "Laser Piles, Fissure & Fistula Treatment",
        "Thyroid & Breast Surgery",
        "Trauma & Emergency Abdominal Surgeries"
      ]
    },
    {
      id: "urology",
      name: "Urology & Kidney Stone Care",
      icon: "activity",
      shortDesc: "Laser stone removal (RIRS/PCNL), Prostate surgery & Dialysis.",
      overview: "Advanced endourology center offering stitchless laser procedures for kidney stones and enlarged prostate.",
      head: "Dr. Vikramaditya Roy (MCh Urology)",
      treatments: [
        "Laser Kidney Stone Removal (URSL / PCNL / RIRS)",
        "Stitchless Prostate Surgery (TURP / Laser)",
        "Hemodialysis (24x7 Dialysis Unit)",
        "Stricture Urethra & Reconstructive Urology",
        "Uro-Oncology (Bladder/Kidney Tumors)"
      ]
    },
    {
      id: "radiology",
      name: "Radiology & Diagnostic Pathology",
      icon: "scan",
      shortDesc: "3T MRI, 128-Slice CT, 4D Ultrasound & NABL standard 24/7 Lab.",
      overview: "Precision imaging and automated pathological testing serving Ambikapur and neighboring districts with fast, accurate reporting.",
      head: "Dr. Priya Deshmukh (MD Radio-diagnosis)",
      treatments: [
        "3T Whole Body MRI & Angio",
        "128-Slice Contrast CT Scan",
        "4D Color Doppler & Anomaly Scans",
        "Digital Mammography & X-Ray",
        "Fully Automated 24x7 Pathology Lab",
        "FNAC & Image-Guided Biopsies"
      ]
    }
  ],
  doctors: [
    {
      id: "doc-1",
      name: "Dr. Rajeshwar Sharma",
      specialty: "cardiology",
      specialtyName: "Cardiology",
      degree: "MBBS, MD (Medicine), DM (Cardiology)",
      experience: "16+ Years Experience",
      designation: "Chief Interventional Cardiologist",
      timings: "Mon - Sat: 10:00 AM - 4:00 PM",
      fee: "₹600",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80",
      bio: "Former Consultant at Fortis Healthcare. Expert in emergency primary angioplasty, complex coronary interventions, and cardiac pacemakers.",
      availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    },
    {
      id: "doc-2",
      name: "Dr. Alok K. Verma",
      specialty: "orthopedics",
      specialtyName: "Orthopedics",
      degree: "MBBS, MS (Ortho), Fellow Joint Replacement (Germany)",
      experience: "14+ Years Experience",
      designation: "Senior Joint Replacement & Trauma Surgeon",
      timings: "Mon - Sat: 11:00 AM - 5:00 PM",
      fee: "₹500",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&auto=format&fit=crop&q=80",
      bio: "Has successfully performed over 3,000 total knee and hip replacements. Specialist in sports injuries and arthroscopic surgery.",
      availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    },
    {
      id: "doc-3",
      name: "Dr. Sunita Gupta",
      specialty: "pediatrics",
      specialtyName: "Pediatrics & NICU",
      degree: "MBBS, MD (Pediatrics), Fellowship in Neonatology",
      experience: "12+ Years Experience",
      designation: "Head of Neonatology & Pediatrics",
      timings: "Mon - Sat: 9:30 AM - 3:00 PM",
      fee: "₹450",
      image: "https://images.unsplash.com/photo-1594824813566-78a99478f729?w=500&auto=format&fit=crop&q=80",
      bio: "Expert in newborn critical care, managing extremely low birth weight infants, pediatric emergencies, and immunization.",
      availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    },
    {
      id: "doc-4",
      name: "Dr. Ananya Mishra",
      specialty: "gynaecology",
      specialtyName: "Obstetrics & Gynecology",
      degree: "MBBS, MS (OB-GYN), DNB, FMAS",
      experience: "13+ Years Experience",
      designation: "Senior Gynecologist & Laparoscopic Surgeon",
      timings: "Mon - Sat: 10:30 AM - 4:30 PM",
      fee: "₹500",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=80",
      bio: "Specializes in high-risk pregnancy care, painless labor management, and minimally invasive gynecological laparoscopy.",
      availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    },
    {
      id: "doc-5",
      name: "Dr. S. P. Singh",
      specialty: "neurology",
      specialtyName: "Neurology & Neurosurgery",
      degree: "MBBS, MS, MCh (Neurosurgery - AIIMS New Delhi)",
      experience: "18+ Years Experience",
      designation: "Director of Neurosciences",
      timings: "Mon - Fri: 12:00 PM - 5:00 PM",
      fee: "₹700",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&auto=format&fit=crop&q=80",
      bio: "Leading neurosurgeon in Chhattisgarh for brain tumor surgeries, spinal disc implants, and acute stroke management.",
      availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"]
    },
    {
      id: "doc-6",
      name: "Dr. Manish Tiwari",
      specialty: "surgery",
      specialtyName: "Laparoscopic Surgery",
      degree: "MBBS, MS (Gen Surgery), FIAGES, FALS",
      experience: "15+ Years Experience",
      designation: "Chief Laparoscopic & Bariatric Surgeon",
      timings: "Mon - Sat: 10:00 AM - 6:00 PM",
      fee: "₹500",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=500&auto=format&fit=crop&q=80",
      bio: "Pioneer in keyhole surgeries for hernia, gallbladder, appendicitis, and laser proctology in Surguja district.",
      availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    },
    {
      id: "doc-7",
      name: "Dr. Vikramaditya Roy",
      specialty: "urology",
      specialtyName: "Urology",
      degree: "MBBS, MS, MCh (Urology)",
      experience: "11+ Years Experience",
      designation: "Consultant Urologist & Renal Transplant Specialist",
      timings: "Tue, Thu, Sat: 11:30 AM - 5:30 PM",
      fee: "₹600",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80",
      bio: "Specialist in Holmium Laser stone removal (RIRS/PCNL), prostate laser surgery, and 24x7 renal care.",
      availableDays: ["Tue", "Thu", "Sat"]
    },
    {
      id: "doc-8",
      name: "Dr. Priya Deshmukh",
      specialty: "radiology",
      specialtyName: "Radiology",
      degree: "MBBS, MD (Radiodiagnosis)",
      experience: "10+ Years Experience",
      designation: "Head of Diagnostic Imaging",
      timings: "Mon - Sat: 9:00 AM - 5:00 PM",
      fee: "₹400",
      image: "https://images.unsplash.com/photo-1594824813566-78a99478f729?w=500&auto=format&fit=crop&q=80",
      bio: "Expert in neuro-imaging, musculoskeletal MRI, fetal Doppler scans, and interventional radiological procedures.",
      availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    }
  ],
  facilities: [
    {
      id: "icu",
      title: "25-Bed Ultra-Modern ICU & CCU",
      desc: "Isolated positive-pressure units equipped with Mindray multi-para monitors, Dräger ventilators, and dedicated 1:1 nursing ratios.",
      icon: "activity",
      image: "/assets/images/icu_ot.png"
    },
    {
      id: "ambulance",
      title: "24x7 Ventilator Ambulance Service",
      desc: "Advanced Cardiac Life Support (ACLS) ambulances with built-in ventilator, defibrillator, emergency meds, and trained paramedics.",
      icon: "truck",
      image: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "radiology-center",
      title: "3T MRI & 128-Slice CT Scan",
      desc: "High-resolution diagnostic imaging providing instant digital reporting for stroke, cardiac, musculoskeletal, and abdominal scans.",
      icon: "scan",
      image: "/assets/images/radiology.png"
    },
    {
      id: "ot",
      title: "Modular Operation Theatres",
      desc: "Ultra-clean laminar airflow theatres with HEPA filtration system, Storz 4K laparoscopic suites, and C-arm imaging support.",
      icon: "check-circle",
      image: "/assets/images/icu_ot.png"
    },
    {
      id: "pharmacy",
      title: "24x7 In-House Pharmacy & Blood Bank",
      desc: "Fully stocked pharmacy with temperature-monitored refrigerated meds and blood storage facility for all major blood groups.",
      icon: "pill",
      image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "rooms",
      title: "Suite, Deluxe & General Wards",
      desc: "Ergonomically designed patient rooms featuring automated electric beds, attendant couches, central oxygen, Wi-Fi, and cable TV.",
      icon: "bed",
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80"
    }
  ],
  gallery: [
    {
      title: "Life Line Hospital Main Building",
      category: "campus",
      image: "/assets/images/hospital_hero.png",
      caption: "Exterior view of Life Line Hospital Ambikapur on Ring Road."
    },
    {
      title: "Advanced Operation Theatre",
      category: "infrastructure",
      image: "/assets/images/icu_ot.png",
      caption: "Laminar airflow zero-infection surgery suite."
    },
    {
      title: "3T MRI Diagnostic Wing",
      category: "diagnostics",
      image: "/assets/images/radiology.png",
      caption: "High resolution Siemens 3T MRI Scanner in action."
    },
    {
      title: "Expert Doctor Panel",
      category: "team",
      image: "/assets/images/doctors_team.png",
      caption: "Multispecialty doctor consultation team at Life Line."
    },
    {
      title: "Level 3 Neonatal ICU",
      category: "infrastructure",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80",
      caption: "State-of-the-art incubator & warmer setup for newborns."
    },
    {
      title: "Free Community Health Camp",
      category: "events",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80",
      caption: "Free cardiac and diabetes screening drive in Surguja villages."
    }
  ],
  testimonials: [
    {
      quote: "When my father suffered an acute heart attack at midnight in Ambikapur, Life Line's cardiac team performed emergency angioplasty within 40 minutes. They truly saved his life!",
      author: "Rameshwar Sahu",
      location: "Ambikapur City",
      rating: 5,
      department: "Cardiology"
    },
    {
      quote: "I underwent Total Knee Replacement surgery by Dr. Alok Verma. After 3 weeks of rehabilitation, I can walk comfortably without any pain. Best hospital in Northern Chhattisgarh!",
      author: "Savitri Devi",
      location: "Surajpur District",
      rating: 5,
      department: "Orthopedics"
    },
    {
      quote: "We delivered our premature twins at 30 weeks. The NICU team led by Dr. Sunita took care of our babies like family. We are forever grateful to Life Line Hospital.",
      author: "Vikram & Sunayana Patel",
      location: "Manendragarh",
      rating: 5,
      department: "Pediatrics & NICU"
    }
  ],
  insurancePartners: [
    "Ayushman Bharat PM-JAY",
    "Star Health Insurance",
    "HDFC ERGO",
    "ICICI Lombard",
    "Care Health Insurance",
    "Aditya Birla Health",
    "CGHS / ECHS Cashless Panel",
    "SBI General Insurance"
  ]
};
