import { getHospitalData, saveHospitalData, defaultHospitalData } from './data.js';

export const SUPABASE_URL = 'https://wduxusyodnfqnhtdtltl.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkdXh1c3lvZG5mcW5odGR0bHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNjg4MjAsImV4cCI6MjEwMTg0NDgyMH0.AqnZ5CmvMioiFQoID7yUstsG6TnsFT6v0W01ebHveoI';
export const SUPABASE_STORAGE_URL = SUPABASE_URL;
export const SUPABASE_STORAGE_KEY = SUPABASE_ANON_KEY;

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

async function uploadImageToSupabase(fileName, base64Data) {
  if (isLocal) {
    try {
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, base64Data })
      });
      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
    } catch (e) {
      console.warn('Local image upload fail:', e);
    }
  } else {
    try {
      const mimeMatch = base64Data.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const uploadUrl = `${SUPABASE_STORAGE_URL}/storage/v1/object/hospital-assets/${fileName}`;
      
      const base64Parts = base64Data.split(',');
      const byteCharacters = atob(base64Parts[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apiKey': SUPABASE_ANON_KEY,
          'Content-Type': mimeType,
          'x-upsert': 'true'
        },
        body: blob
      });

      if (uploadRes.ok) {
        return `${SUPABASE_STORAGE_URL}/storage/v1/object/public/hospital-assets/${fileName}`;
      }
    } catch (err) {
      console.warn('Direct upload failed:', err);
    }
  }
  return base64Data;
}

async function saveSettingToSupabase(settingKey, settingValue) {
  // Always save directly to Supabase (regardless of localhost/production)
  try {
    const strValue = typeof settingValue === 'object' ? JSON.stringify(settingValue) : String(settingValue);
    const dbUrl = `${SUPABASE_STORAGE_URL}/rest/v1/hospital_settings`;
    const res = await fetch(dbUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apiKey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ setting_key: settingKey, setting_value: strValue })
    });
    if (!res.ok) console.warn('Supabase settings save returned', res.status);
  } catch (err) {
    console.warn('Supabase settings save failed:', err.message);
  }
  // Also try local api as fallback
  if (isLocal) {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settingKey, settingValue })
      });
    } catch (e) { /* ignore local api errors */ }
  }
}

let appState = getHospitalData();

// Set default hero image only if nothing valid is stored (or if it's an old Unsplash URL)
if (!appState.hero) appState.hero = { ...defaultHospitalData.hero };
const _storedHeroUrl = appState.hero.imageUrl || '';
if (!_storedHeroUrl || _storedHeroUrl.includes('unsplash.com') || _storedHeroUrl.includes('placeholder')) {
  // No valid upload — use the permanent local default
  appState.hero.imageUrl = '/assets/images/hospital_hero.png';
  saveHospitalData(appState);
}

// Ensure appState.facilities contains all 9 official facilities
if (!appState.facilities || appState.facilities.length < 9 || !appState.facilities[0].id) {
  appState.facilities = JSON.parse(JSON.stringify(defaultHospitalData.facilities));
  saveHospitalData(appState);
} else {
  let facUpdated = false;
  appState.facilities.forEach(fac => {
    if (fac.image && fac.image.includes('unsplash.com')) {
      fac.image = "";
      facUpdated = true;
    }
  });
  if (facUpdated) saveHospitalData(appState);
}
// Ensure appState.appointments contains active bookings
if (!appState.appointments || appState.appointments.length === 0) {
  appState.appointments = JSON.parse(JSON.stringify(defaultHospitalData.appointments));
  saveHospitalData(appState);
}

// Ensure director data is initialized (only if never set before)
if (!appState.director) {
  appState.director = JSON.parse(JSON.stringify(defaultHospitalData.director));
  saveHospitalData(appState);
}

// Ensure default departments are present in appState
if (!appState.departments || appState.departments.length < defaultHospitalData.departments.length) {
  appState.departments = JSON.parse(JSON.stringify(defaultHospitalData.departments));
  saveHospitalData(appState);
} else {
  let deptUpdated = false;
  defaultHospitalData.departments.forEach(defDept => {
    const exists = appState.departments.some(d => d.id === defDept.id);
    if (!exists) {
      appState.departments.push(JSON.parse(JSON.stringify(defDept)));
      deptUpdated = true;
    }
  });
  if (deptUpdated) saveHospitalData(appState);
}

// Ensure doctors in appState are synced with latest default department assignments
if (defaultHospitalData.doctors && appState.doctors) {
  let docUpdated = false;
  defaultHospitalData.doctors.forEach(defDoc => {
    const existingIndex = appState.doctors.findIndex(d => d.id === defDoc.id || d.name === defDoc.name);
    if (existingIndex >= 0) {
      const existing = appState.doctors[existingIndex];
      if (existing.specialty !== defDoc.specialty || existing.specialtyName !== defDoc.specialtyName) {
        existing.specialty = defDoc.specialty;
        existing.specialtyName = defDoc.specialtyName;
        existing.degree = defDoc.degree;
        existing.designation = defDoc.designation;
        docUpdated = true;
      }
    } else {
      appState.doctors.push(JSON.parse(JSON.stringify(defDoc)));
      docUpdated = true;
    }
  });
  if (docUpdated) saveHospitalData(appState);
}

// Preserve custom doctor arrangement order if saved in localStorage
try {
  const savedDocOrder = JSON.parse(localStorage.getItem('lifeLine_doctor_order') || '[]');
  if (Array.isArray(savedDocOrder) && savedDocOrder.length > 0 && appState.doctors) {
    appState.doctors.sort((a, b) => {
      const idxA = savedDocOrder.indexOf(a.id);
      const idxB = savedDocOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  }
} catch (e) {
  console.warn('Doctor order restore notice:', e);
}

// Sync rich detailed blog content from defaultHospitalData if stored blogs don't have markdown headers or full content
if (appState.blogs && defaultHospitalData.blogs) {
  let updated = false;
  defaultHospitalData.blogs.forEach(defaultBlog => {
    const existingIndex = appState.blogs.findIndex(b => b.id === defaultBlog.id);
    if (existingIndex >= 0) {
      const existing = appState.blogs[existingIndex];
      if (!existing.content || !existing.content.includes('#') || existing.content.length < 1000) {
        appState.blogs[existingIndex] = { ...defaultBlog };
        updated = true;
      }
    } else {
      appState.blogs.push(defaultBlog);
      updated = true;
    }
  });
  if (updated) saveHospitalData(appState);
}

function initApp() {
  populateDepartmentDropdowns();
  renderSiteFromState();
  initNavigation();
  initMobileDrawer();
  initStickyHeader();
  initBackToTop();
  initBookingModal();
  initContactForm();
  initAdminPanel();
  handleRouteHash();
  initScrollAnimations();
  initAnimatedCounters();
  
  // Expose all critical globals explicitly after all functions are defined
  window.handleRouteHash = handleRouteHash;
  window.switchAdminTab = switchAdminTab;
  window.adminExitToPublic = adminExitToPublic;
  window.populateAdminForms = populateAdminForms;
  if (typeof populateDirectorAdminForm === 'function') window.populateDirectorAdminForm = populateDirectorAdminForm;
  
  // Sync all dynamic content live from Supabase database
  syncFromSupabase();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

window.addEventListener('load', () => {
  if (typeof window.handleRouteHash === 'function') window.handleRouteHash();
});

/* Sync All Dynamic Data Directly from Supabase Backend */
async function syncFromSupabase() {
  try {
    // 1. Fetch Hospital Settings (Branding & Hero)
    let settings = null;
    try {
      const supaSettings = await fetch(`${SUPABASE_STORAGE_URL}/rest/v1/hospital_settings?select=*`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_STORAGE_KEY}`,
          'apiKey': SUPABASE_STORAGE_KEY
        }
      });
      if (supaSettings.ok) {
        const rawSettings = await supaSettings.json();
        settings = {};
        rawSettings.forEach(item => {
          try {
            settings[item.setting_key] = JSON.parse(item.setting_value);
          } catch (e) {
            settings[item.setting_key] = item.setting_value;
          }
        });
      }
    } catch (settingsSupaErr) {
      console.log('Supabase settings direct fetch error:', settingsSupaErr.message);
    }

    if (!settings) {
      try {
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) settings = await settingsRes.json();
      } catch (settingsLocalErr) {
        console.log('Local settings fetch error:', settingsLocalErr.message);
      }
    }

    if (settings) {
      if (settings.branding && typeof settings.branding === 'object') {
        Object.assign(appState, settings.branding);
      }
      if (settings.hero && typeof settings.hero === 'object') {
        appState.hero = { ...defaultHospitalData.hero, ...settings.hero };
      }
      // Load director from hospital_settings
      if (settings.director && typeof settings.director === 'object' && settings.director.name) {
        appState.director = { ...defaultHospitalData.director, ...settings.director };
      }
      if (settings.departments && Array.isArray(settings.departments) && settings.departments.length > 0) {
        appState.departments = settings.departments;
      }
      if (settings.facilities && Array.isArray(settings.facilities) && settings.facilities.length > 0) {
        appState.facilities = settings.facilities;
      }
      if (settings.gallery && Array.isArray(settings.gallery) && settings.gallery.length > 0) {
        appState.gallery = settings.gallery;
      }
      if (settings.doctor_order && Array.isArray(settings.doctor_order) && settings.doctor_order.length > 0) {
        try {
          localStorage.setItem('lifeLine_doctor_order', JSON.stringify(settings.doctor_order));
        } catch (e) {}
      }
    }

    // 2. Fetch Doctors directly from Supabase REST API (with /api/doctors fallback)
    try {
      let docs = null;
      const supaRes = await fetch(`${SUPABASE_STORAGE_URL}/rest/v1/doctors?select=*&order=created_at.asc`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_STORAGE_KEY}`,
          'apiKey': SUPABASE_STORAGE_KEY
        }
      });
      if (supaRes.ok) {
        docs = await supaRes.json();
      } else {
        const docsRes = await fetch('/api/doctors');
        if (docsRes.ok) docs = await docsRes.json();
      }

      if (Array.isArray(docs) && docs.length > 0) {
        const localImgMap = new Map((appState.doctors || []).map(d => [d.id, d.image]));
        appState.doctors = docs.map(d => {
          const cleanId = String(d.id || '').replace(/^doc-?/, '');
          const cleanNameKey = String(d.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const cachedPhoto = localStorage.getItem('doc_photo_' + d.id) ||
                              localStorage.getItem('doc_photo_doc-' + cleanId) ||
                              localStorage.getItem('doc_photo_' + cleanId) ||
                              localStorage.getItem('doc_photo_name_' + cleanNameKey);

          const localImg = localImgMap.get(d.id);
          let finalImg = cachedPhoto || '';
          if (!finalImg && d.image && d.image.length > 5 && (d.image.startsWith('data:image') || d.image.startsWith('http') || d.image.startsWith('/storage') || d.image.startsWith('/assets'))) {
            finalImg = d.image;
          }
          if (!finalImg && localImg && localImg.length > 5) {
            finalImg = localImg;
          }
          const defDoc = (defaultHospitalData.doctors || []).find(def => def.name === d.name || def.id === d.id);
          if (!finalImg && defDoc && defDoc.image) {
            finalImg = defDoc.image;
          }
          if (!finalImg) {
            finalImg = '/assets/images/doctor_male_1.png';
          }

          return {
            id: d.id,
            name: d.name,
            specialty: d.specialty_id || d.specialty || 'general',
            specialtyName: d.specialty_name || d.specialtyName || 'General OPD',
            designation: d.designation || d.specialty_name || 'Consultant Specialist',
            degree: d.qualifications || d.degree || '',
            experience: d.experience || '10+ Years Exp',
            timings: d.opd_time || d.timings || '10:00 AM - 04:00 PM',
            fee: typeof d.fee === 'number' ? `₹${d.fee}` : (d.fee || '₹500'),
            image: finalImg
          };
        });

        // Preserve custom drag-and-drop doctor order
        try {
          const savedOrder = JSON.parse(localStorage.getItem('lifeLine_doctor_order') || '[]');
          if (Array.isArray(savedOrder) && savedOrder.length > 0) {
            appState.doctors.sort((a, b) => {
              const idxA = savedOrder.indexOf(a.id);
              const idxB = savedOrder.indexOf(b.id);
              if (idxA !== -1 && idxB !== -1) return idxA - idxB;
              if (idxA !== -1) return -1;
              if (idxB !== -1) return 1;
              return 0;
            });
          }
        } catch (e) {}
      }
    } catch (docFetchErr) {
      console.log('Supabase doctors sync notice:', docFetchErr.message);
    }

    // 3. Fetch Blogs
    try {
      let blogs = null;
      const supaBlogs = await fetch(`${SUPABASE_STORAGE_URL}/rest/v1/blogs?select=*&order=created_at.desc`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_STORAGE_KEY}`,
          'apiKey': SUPABASE_STORAGE_KEY
        }
      });
      if (supaBlogs.ok) {
        blogs = await supaBlogs.json();
      } else {
        const blogsRes = await fetch('/api/blogs');
        if (blogsRes.ok) blogs = await blogsRes.json();
      }

      if (Array.isArray(blogs) && blogs.length > 0) {
        appState.blogs = blogs.map(b => ({
          id: b.id,
          title: b.title,
          category: b.category,
          date: b.date_str || b.date,
          excerpt: b.excerpt,
          content: b.content,
          image: b.image
        }));
      }
    } catch (blogFetchErr) {
      console.log('Supabase blogs sync notice:', blogFetchErr.message);
    }

    // 4. Fetch Departments
    try {
      let depts = null;
      const supaDepts = await fetch(`${SUPABASE_STORAGE_URL}/rest/v1/departments?select=*&order=created_at.asc`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_STORAGE_KEY}`,
          'apiKey': SUPABASE_STORAGE_KEY
        }
      });
      if (supaDepts.ok) {
        depts = await supaDepts.json();
      } else {
        const deptsRes = await fetch('/api/departments');
        if (deptsRes.ok) depts = await deptsRes.json();
      }

      if (Array.isArray(depts) && depts.length > 0) {
        appState.departments = depts.map(d => ({
          id: d.id,
          name: d.name,
          icon: d.icon || 'activity',
          shortDesc: d.short_desc || d.shortDesc || '',
          head: d.head || '',
          fullDescription: d.full_description || d.fullDescription || '',
          procedures: typeof d.key_treatments === 'string' ? d.key_treatments.split('\n').filter(Boolean) : (Array.isArray(d.procedures) ? d.procedures : []),
          equipment: Array.isArray(d.equipment) ? d.equipment : []
        }));
      }
    } catch (deptFetchErr) {
      console.log('Supabase departments sync notice:', deptFetchErr.message);
    }

    // 5. Fetch Facilities
    try {
      const supaFac = await fetch(`${SUPABASE_STORAGE_URL}/rest/v1/facilities?select=*&order=created_at.asc`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_STORAGE_KEY}`,
          'apiKey': SUPABASE_STORAGE_KEY
        }
      });
      if (supaFac.ok) {
        const facs = await supaFac.json();
        if (Array.isArray(facs) && facs.length > 0) {
          appState.facilities = facs.map((f, i) => ({
            id: `fac-${f.id || (i + 1)}`,
            title: f.title,
            desc: f.description || '',
            icon: f.icon || 'hospital',
            image: f.image || '',
            category: f.category || 'General Care',
            features: []
          }));
        }
      }
    } catch (facErr) {
      console.log('Supabase facilities sync notice:', facErr.message);
    }

    // 6. Fetch Gallery
    try {
      const supaGal = await fetch(`${SUPABASE_STORAGE_URL}/rest/v1/gallery?select=*&order=created_at.asc`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_STORAGE_KEY}`,
          'apiKey': SUPABASE_STORAGE_KEY
        }
      });
      if (supaGal.ok) {
        const gals = await supaGal.json();
        if (Array.isArray(gals) && gals.length > 0) {
          appState.gallery = gals.map((g, i) => ({
            id: `gal-${g.id || (i + 1)}`,
            title: g.title,
            category: g.category || 'Hospital Campus',
            caption: g.description || '',
            image: g.image || ''
          }));
        }
      }
    } catch (galErr) {
      console.log('Supabase gallery sync notice:', galErr.message);
    }

    // 7. Fetch Appointments
    try {
      const supaAppts = await fetch(`${SUPABASE_STORAGE_URL}/rest/v1/appointments?select=*&order=created_at.desc`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_STORAGE_KEY}`,
          'apiKey': SUPABASE_STORAGE_KEY
        }
      });
      if (supaAppts.ok) {
        const rawAppts = await supaAppts.json();
        if (Array.isArray(rawAppts) && rawAppts.length > 0) {
          appState.appointments = rawAppts.map(a => ({
            id: a.booking_id || `LLH-${a.id}`,
            patientName: a.patient_name || 'Patient',
            patientPhone: a.patient_phone || '',
            department: a.department || '',
            doctor: a.doctor_name || '',
            date: a.appointment_date || '',
            time: a.preferred_time || '',
            status: a.status || 'Pending',
            notes: a.notes || '',
            createdTime: a.created_at ? new Date(a.created_at).toLocaleString() : ''
          }));
        }
      }
    } catch (apptsErr) {
      console.log('Supabase appointments sync notice:', apptsErr.message);
    }
    // Re-render frontend and admin panel from updated Supabase state
    saveHospitalData(appState);
    renderSiteFromState();
    if (typeof handleRouteHash === 'function') handleRouteHash();
    if (typeof renderDoctors === 'function') renderDoctors();
    if (typeof renderAdminDoctorsGrid === 'function') renderAdminDoctorsGrid();
    if (typeof renderAdminDoctorsTable === 'function') renderAdminDoctorsTable();
    if (typeof renderAdminBlogsTable === 'function') renderAdminBlogsTable();
    if (typeof renderAdminFacilitiesTable === 'function') renderAdminFacilitiesTable();
    if (typeof renderAdminAppointmentsTable === 'function') renderAdminAppointmentsTable();
    if (typeof renderAdminGalleryTable === 'function') renderAdminGalleryTable();
    if (typeof renderAdminDepartmentsTable === 'function') renderAdminDepartmentsTable();
    if (typeof populateAdminForms === 'function') populateAdminForms();
    if (typeof populateDepartmentDropdowns === 'function') populateDepartmentDropdowns();
  } catch (err) {
    console.log('Supabase sync notice:', err.message);
  }
}

// --- Specialty Departments Management & Populators ---
function populateDepartmentDropdowns() {
  const depts = appState.departments || defaultHospitalData.departments || [];

  const docSpecialtySelect = document.getElementById('admin-doc-specialty');
  if (docSpecialtySelect) {
    docSpecialtySelect.innerHTML = depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  }

  const adminDocFilter = document.getElementById('admin-doc-dept-filter');
  if (adminDocFilter) {
    adminDocFilter.innerHTML = `<option value="all">All Departments</option>` + 
      depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  }

  const bookingDeptSelect = document.getElementById('modal-dept-select');
  if (bookingDeptSelect) {
    bookingDeptSelect.innerHTML = `<option value="">Choose Department *</option>` + 
      depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('') +
      `<option value="other">Other Checkup / General OPD</option>`;
  }

  const quickDeptSelect = document.getElementById('quick-dept-select');
  if (quickDeptSelect) {
    quickDeptSelect.innerHTML = `<option value="">Choose Department</option>` + 
      depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  }

  const visitorFilters = document.querySelectorAll('.doctor-dept-filter');
  visitorFilters.forEach(select => {
    select.innerHTML = `<option value="all">All Specialties</option>` + 
      depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  });
}

function renderAdminDepartmentsTable() {
  const tbody = document.getElementById('admin-departments-table-body');
  const depts = appState.departments || defaultHospitalData.departments || [];
  if (!tbody) return;

  tbody.innerHTML = depts.map(d => `
    <tr>
      <td><strong>${d.id}</strong></td>
      <td>${d.name}</td>
      <td><span class="blog-cat-badge" style="position: static; text-transform: none; background: #e0f2fe; color: #0369a1; border-color: #bae6fd;">${d.icon || 'activity'}</span></td>
      <td>${d.head || 'N/A'}</td>
      <td>
        <button class="admin-btn admin-btn-primary" onclick="editDeptInAdmin('${d.id}')">Edit</button>
        <button class="admin-btn admin-btn-danger" onclick="deleteDeptInAdmin('${d.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

window.editDeptInAdmin = function(deptId) {
  const depts = appState.departments || defaultHospitalData.departments || [];
  const dept = depts.find(d => d.id === deptId);
  if (!dept) return;

  const idIn = document.getElementById('admin-dept-id');
  if (idIn) {
    idIn.value = dept.id;
    idIn.disabled = false; // Make editable!
  }
  document.getElementById('admin-dept-original-id').value = dept.id;
  document.getElementById('admin-dept-edit-mode').value = 'true';
  document.getElementById('admin-dept-name').value = dept.name;
  document.getElementById('admin-dept-icon').value = dept.icon || 'activity';
  document.getElementById('admin-dept-head').value = dept.head || '';
  document.getElementById('admin-dept-shortdesc').value = dept.shortDesc || '';
  document.getElementById('admin-dept-fulldesc').value = dept.fullDescription || '';
  document.getElementById('admin-dept-procedures').value = Array.isArray(dept.procedures) ? dept.procedures.join('\n') : '';

  const titleEl = document.getElementById('admin-dept-form-title');
  if (titleEl) titleEl.textContent = `Edit Department: ${dept.name}`;
  document.getElementById('admin-dept-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.clearDeptForm = function() {
  const idIn = document.getElementById('admin-dept-id');
  if (idIn) {
    idIn.value = '';
    idIn.disabled = false;
  }
  document.getElementById('admin-dept-original-id').value = '';
  document.getElementById('admin-dept-edit-mode').value = 'false';
  document.getElementById('admin-dept-name').value = '';
  document.getElementById('admin-dept-icon').value = '';
  document.getElementById('admin-dept-head').value = '';
  document.getElementById('admin-dept-shortdesc').value = '';
  document.getElementById('admin-dept-fulldesc').value = '';
  document.getElementById('admin-dept-procedures').value = '';
  
  const titleEl = document.getElementById('admin-dept-form-title');
  if (titleEl) titleEl.textContent = 'Add New Department';
};

window.deleteDeptInAdmin = async function(deptId) {
  const depts = appState.departments || defaultHospitalData.departments || [];
  const dept = depts.find(d => d.id === deptId);
  const name = dept ? dept.name : deptId;

  if (confirm(`Are you sure you want to delete the department "${name}"?\nWarning: This will also remove it from selection filters.`)) {
    try {
      await fetch(`${SUPABASE_STORAGE_URL}/rest/v1/departments?id=eq.${deptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SUPABASE_STORAGE_KEY}`,
          'apiKey': SUPABASE_STORAGE_KEY
        }
      });
      if (isLocal) {
        try { await fetch(`/api/departments/${deptId}`, { method: 'DELETE' }); } catch(e){}
      }
      showToast('Specialty Department deleted live from Database!');
      
      appState.departments = depts.filter(d => d.id !== deptId);
      saveHospitalData(appState);
      saveSettingToSupabase('departments', appState.departments);
      
      populateDepartmentDropdowns();
      renderAdminDepartmentsTable();
      renderSiteFromState();
    } catch (err) {
      console.error(err);
      showToast('Error deleting department.');
    }
  }
};

/* Render all site elements dynamically from state */
function renderSiteFromState() {
  renderHeroAndHeaderFromData();
  renderDepartments();
  renderDoctors();
  renderFacilities();
  renderBlogs();
  renderGallery();
  if (typeof renderAllBlogsPage === 'function') renderAllBlogsPage();
  renderGallery();
  renderTestimonials();
  renderDirectorSection();
  renderHomeDirectorSpotlight();
}

/* Update Header, Top Bar, Hero Banner from appState */
function renderHeroAndHeaderFromData() {
  const topTextEl = document.getElementById('top-bar-announcement-text');
  const emergencyPhoneEls = document.querySelectorAll('.dynamic-emergency-phone');
  const opdPhoneEls = document.querySelectorAll('.dynamic-opd-phone');
  const addressEls = document.querySelectorAll('.dynamic-address');
  const heroBadgeEl = document.getElementById('hero-badge-text');
  const heroTitleMainEl = document.getElementById('hero-title-main');
  const heroTitleHighlightEl = document.getElementById('hero-title-highlight');
  const heroDescEl = document.getElementById('hero-desc-text');
  const heroImgEl = document.getElementById('hero-banner-img');
  const heroImgMobileEl = document.getElementById('hero-banner-img-mobile');
  const floatingTitleEl = document.getElementById('floating-card-title');
  const floatingSubEl = document.getElementById('floating-card-subtitle');

  if (topTextEl && appState.topAnnouncement) topTextEl.textContent = appState.topAnnouncement;
  if (appState.emergencyPhone) {
    emergencyPhoneEls.forEach(el => el.textContent = appState.emergencyPhone);
  }
  if (appState.opdPhone) {
    opdPhoneEls.forEach(el => el.textContent = appState.opdPhone);
  }
  if (appState.address) {
    addressEls.forEach(el => el.textContent = appState.address);
  }

  if (appState.hero) {
    if (heroBadgeEl && appState.hero.badge) heroBadgeEl.textContent = appState.hero.badge;
    if (heroTitleMainEl && appState.hero.titleMain) heroTitleMainEl.textContent = appState.hero.titleMain;
    if (heroTitleHighlightEl && appState.hero.titleHighlight) heroTitleHighlightEl.textContent = appState.hero.titleHighlight;
    if (heroDescEl && appState.hero.description) heroDescEl.textContent = appState.hero.description;
    
    const LOCAL_HERO = '/assets/images/hospital_hero.png';
    let imgUrl = (appState.hero && appState.hero.imageUrl) ? appState.hero.imageUrl : LOCAL_HERO;
    if (heroImgEl && heroImgEl.src !== imgUrl) heroImgEl.src = imgUrl;
    if (heroImgMobileEl && heroImgMobileEl.src !== imgUrl) heroImgMobileEl.src = imgUrl;

    if (floatingTitleEl && appState.hero.floatingTitle) floatingTitleEl.textContent = appState.hero.floatingTitle;
    if (floatingSubEl && appState.hero.floatingSubtitle) floatingSubEl.textContent = appState.hero.floatingSubtitle;
  }
}

/* Sticky Header on Scroll */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* Single Page View Switching */
function initNavigation() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-view-target], a[href^="#"]');
    if (link) {
      const href = link.getAttribute('href') || '';
      let targetId = link.getAttribute('data-view-target') || (href.startsWith('#') ? href.slice(1) : '');
      if (targetId) {
        if (targetId === 'admin' || targetId === 'admin-view') {
          e.preventDefault();
          window.location.hash = 'admin';
          handleRouteHash();
          closeMobileDrawer();
          return;
        }
        if (targetId === 'login' || targetId === 'admin-login' || targetId === 'admin-login-view') {
          e.preventDefault();
          window.location.hash = 'login';
          handleRouteHash();
          closeMobileDrawer();
          return;
        }

        const exactEl = document.getElementById(targetId) || document.getElementById(targetId + '-view');
        if (exactEl) {
          e.preventDefault();
          window.location.hash = targetId;
          handleRouteHash();
          closeMobileDrawer();
        }
      }
    }
  });

  window.addEventListener('hashchange', handleRouteHash);
  window.addEventListener('popstate', handleRouteHash);

  let curHash = window.location.hash;
  setInterval(() => {
    if (window.location.hash !== curHash) {
      curHash = window.location.hash;
      handleRouteHash();
    }
  }, 100);
}

function getRoutePath() {
  const rawHash = window.location.hash || '';
  const hash = rawHash.replace(/^#\/?/, '').replace(/\/$/, '').toLowerCase();
  const rawPath = window.location.pathname || '';
  const path = rawPath.replace(/^\//, '').replace(/\/$/, '').toLowerCase();

  if (hash === 'admin' || hash === 'admin-view' || hash === 'admin.html' || path === 'admin' || path === 'admin.html' || path === 'admin-view') return 'admin';
  if (hash === 'login' || hash === 'admin-login' || hash === 'admin-login-view' || hash === 'login.html' || path === 'login' || path === 'login.html' || path === 'admin-login') return 'login';

  if (hash.startsWith('department-')) return hash;
  if (hash) return hash;
  if (path && path !== 'index.html' && path !== 'index') return path;

  return 'home-view';
}

function handleRouteHash() {
  const route = getRoutePath();

  const earlyStyle = document.getElementById('early-route-style');
  if (earlyStyle) earlyStyle.remove();

  // Close any open modals and reset body scroll when navigating
  if (typeof closeDoctorEditorModal === 'function') closeDoctorEditorModal();
  if (typeof closeDoctorDetailsModal === 'function') closeDoctorDetailsModal();
  if (typeof closeBookingModal === 'function') closeBookingModal();
  document.body.style.overflow = '';

  if (route === 'login') {
    document.querySelectorAll('.page-view').forEach(v => {
      v.classList.remove('active-view');
      v.style.display = 'none';
    });
    const loginView = document.getElementById('admin-login-view');
    if (loginView) {
      loginView.classList.add('active-view');
      loginView.style.display = 'flex';
    }
    document.body.classList.add('admin-mode-active');
    document.documentElement.classList.add('admin-mode-active');
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  if (route === 'admin') {
    // 🔐 Auth gate — must be logged in to see dashboard
    const isAuthed = localStorage.getItem('admin_authenticated') === 'true' ||
                     sessionStorage.getItem('admin_authenticated') === 'true';
    if (!isAuthed) {
      // Not logged in — send to login page
      window.location.hash = 'login';
      document.querySelectorAll('.page-view').forEach(v => {
        v.classList.remove('active-view');
        v.style.display = 'none';
      });
      const loginView = document.getElementById('admin-login-view');
      if (loginView) {
        loginView.classList.add('active-view');
        loginView.style.display = 'flex';
      }
      document.body.classList.add('admin-mode-active');
      document.documentElement.classList.add('admin-mode-active');
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    document.querySelectorAll('.page-view').forEach(v => {
      v.classList.remove('active-view');
      v.style.display = 'none';
    });
    const adminView = document.getElementById('admin-view');
    if (adminView) {
      adminView.classList.add('active-view');
      adminView.style.display = 'block';
    }
    document.body.classList.add('admin-mode-active');
    document.documentElement.classList.add('admin-mode-active');

    if (typeof populateAdminForms === 'function') populateAdminForms();
    if (typeof renderAdminDoctorsTable === 'function') renderAdminDoctorsTable();
    if (typeof renderAdminDoctorsGrid === 'function') renderAdminDoctorsGrid();
    if (typeof renderAdminBlogsTable === 'function') renderAdminBlogsTable();
    if (typeof renderAdminFacilitiesTable === 'function') renderAdminFacilitiesTable();
    if (typeof renderAdminAppointmentsTable === 'function') renderAdminAppointmentsTable();
    if (typeof renderAdminGalleryTable === 'function') renderAdminGalleryTable();
    if (typeof renderAdminDepartmentsTable === 'function') renderAdminDepartmentsTable();
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // Public pages
  document.body.classList.remove('admin-mode-active');
  document.documentElement.classList.remove('admin-mode-active');

  let targetId = route;
  if (route.startsWith('department-') && route !== 'department-detail-view') {
    const currentDeptId = route.replace('department-', '');
    targetId = 'department-detail-view';
    setTimeout(() => renderDepartmentDetailPage(currentDeptId), 10);
  } else if (!document.getElementById(targetId)) {
    if (route.includes('doctor')) targetId = 'doctors-view';
    else if (route.includes('blog')) targetId = 'blogs-view';
    else if (route.includes('dept') || route.includes('department')) targetId = 'departments-view';
    else if (route.includes('facility') || route.includes('facilities')) targetId = 'facilities-view';
    else if (route.includes('contact')) targetId = 'contact-view';
    else if (route.includes('overview') || route.includes('about')) targetId = 'overview-view';
    else targetId = 'home-view';
  }

  document.querySelectorAll('.page-view').forEach(v => {
    v.classList.remove('active-view');
    v.style.display = 'none';
  });
  const targetView = document.getElementById(targetId);
  if (targetView) {
    targetView.classList.add('active-view');
    targetView.style.display = 'block';
    document.querySelectorAll('[data-view-target]').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-view-target') === route || link.getAttribute('data-view-target') === targetId);
    });
  }

  if (targetId === 'blogs-view' && typeof renderAllBlogsPage === 'function') {
    renderAllBlogsPage();
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
  setTimeout(initScrollAnimations, 50);
  if (window.lucide) window.lucide.createIcons();
}
window.handleRouteHash = handleRouteHash;

function switchAdminTab(tabId) {
  if (!tabId) return;

  const navItems = document.querySelectorAll('.admin-nav-item');
  const tabPanes = document.querySelectorAll('.admin-tab-pane');
  const quickChips = document.querySelectorAll('.admin-quicktab-chip');
  const bottomItems = document.querySelectorAll('.admin-app-bottom-item');

  navItems.forEach(item => {
    if (item.getAttribute('data-admin-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  quickChips.forEach(chip => {
    if (chip.getAttribute('data-admin-tab') === tabId) {
      chip.classList.add('active');
      try {
        chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } catch (err) {}
    } else {
      chip.classList.remove('active');
    }
  });

  bottomItems.forEach(item => {
    if (item.getAttribute('data-admin-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  tabPanes.forEach(pane => {
    if (pane.id === tabId) {
      pane.classList.add('active');
      pane.style.setProperty('display', 'block', 'important');
    } else {
      pane.classList.remove('active');
      pane.style.setProperty('display', 'none', 'important');
    }
  });

  // Call relevant renderers for the selected tab
  if (tabId === 'admin-tab-overview' && typeof populateAdminForms === 'function') populateAdminForms();
  if (tabId === 'admin-tab-settings' && typeof populateAdminForms === 'function') populateAdminForms();
  if (tabId === 'admin-tab-hero' && typeof populateAdminForms === 'function') populateAdminForms();
  if (tabId === 'admin-tab-doctors') {
    if (typeof renderAdminDoctorsGrid === 'function') renderAdminDoctorsGrid();
    if (typeof renderAdminDoctorsTable === 'function') renderAdminDoctorsTable();
  }
  if (tabId === 'admin-tab-blogs' && typeof renderAdminBlogsTable === 'function') renderAdminBlogsTable();
  if (tabId === 'admin-tab-departments' && typeof renderAdminDepartmentsTable === 'function') renderAdminDepartmentsTable();
  if (tabId === 'admin-tab-facilities' && typeof renderAdminFacilitiesTable === 'function') renderAdminFacilitiesTable();
  if (tabId === 'admin-tab-appointments' && typeof renderAdminAppointmentsTable === 'function') renderAdminAppointmentsTable();
  if (tabId === 'admin-tab-gallery' && typeof renderAdminGalleryTable === 'function') renderAdminGalleryTable();
  if (tabId === 'admin-tab-director' && typeof populateDirectorAdminForm === 'function') populateDirectorAdminForm();

  // Update mobile topbar active pill
  const pillEl = document.getElementById('admin-mobile-active-pill');
  if (pillEl) {
    const titles = {
      'admin-tab-overview': '📊 Overview',
      'admin-tab-doctors': '👨‍⚕️ Doctors',
      'admin-tab-appointments': '📅 Appts',
      'admin-tab-blogs': '📝 Blogs',
      'admin-tab-departments': '🏥 Depts',
      'admin-tab-facilities': '🏢 Facilities',
      'admin-tab-gallery': '🖼️ Gallery',
      'admin-tab-director': '👤 Director',
      'admin-tab-settings': '⚙️ Site Info',
      'admin-tab-hero': '🖼️ Hero Banner'
    };
    pillEl.textContent = titles[tabId] || 'Admin Console';
  }

  if (typeof toggleAdminMobileDrawer === 'function') {
    toggleAdminMobileDrawer(false);
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
  if (window.lucide) window.lucide.createIcons();
}
window.switchAdminTab = switchAdminTab;

function adminExitToPublic() {
  document.body.classList.remove('admin-mode-active');
  document.documentElement.classList.remove('admin-mode-active');
  window.location.hash = 'home-view';
  handleRouteHash();
}
window.adminExitToPublic = adminExitToPublic;

/* ===================================================
   ADMIN AUTHENTICATION & SECURITY ENGINE
   =================================================== */

window.isAdminAuthenticated = function() {
  return localStorage.getItem('admin_authenticated') === 'true' || 
         sessionStorage.getItem('admin_authenticated') === 'true';
};

window.openAdminLoginModal = function() {
  window.location.hash = 'login';
  handleRouteHash();
};

window.closeAdminLoginModal = function() {
  // Just set hash; hashchange event will trigger handleRouteHash
  window.location.hash = 'home-view';
};

window.handleDedicatedAdminLoginSubmit = function(e) {
  if (e) e.preventDefault();
  const user = (document.getElementById('page-admin-username')?.value || document.getElementById('admin-username')?.value || '').trim();
  const pass = (document.getElementById('page-admin-password')?.value || document.getElementById('admin-password')?.value || '').trim();
  const errorEl = document.getElementById('page-admin-login-error') || document.getElementById('admin-login-error');

  const isValidUser = (user.toLowerCase() === 'lifelife' || user.toLowerCase() === 'lifeline');
  const isValidPass = (pass === 'Lifeline@01');

  if (isValidUser && isValidPass) {
    if (errorEl) errorEl.style.display = 'none';
    
    // Always store permanently in localStorage so user logs in ONLY ONCE!
    localStorage.setItem('admin_authenticated', 'true');
    sessionStorage.setItem('admin_authenticated', 'true');

    // Cleanly switch active views immediately
    document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active-view'));
    const adminView = document.getElementById('admin-view');
    if (adminView) adminView.classList.add('active-view');
    document.body.classList.add('admin-mode-active');

    window.location.hash = 'admin';
    handleRouteHash();
    showToast('🔐 Welcome Admin! Redirected to Dashboard.');
  } else {
    if (errorEl) errorEl.style.display = 'block';
  }
};

window.togglePasswordVisibility = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.innerHTML = '<i data-lucide="eye-off" style="width: 18px; height: 18px;"></i>';
  } else {
    input.type = 'password';
    if (btn) btn.innerHTML = '<i data-lucide="eye" style="width: 18px; height: 18px;"></i>';
  }
  if (window.lucide) window.lucide.createIcons();
};

window.toggleAdminMobileDrawer = function(forceOpen) {
  const drawer = document.getElementById('admin-mobile-drawer');
  if (!drawer) return;
  if (typeof forceOpen === 'boolean') {
    if (forceOpen) drawer.classList.add('open');
    else drawer.classList.remove('open');
  } else {
    drawer.classList.toggle('open');
  }
  if (window.lucide) window.lucide.createIcons();
};

window.handleAdminLoginSubmit = function(e) {
  return window.handleDedicatedAdminLoginSubmit(e);
};

window.adminLogout = function() {
  localStorage.removeItem('admin_authenticated');
  sessionStorage.removeItem('admin_authenticated');
  document.body.classList.remove('admin-mode-active');
  document.documentElement.classList.remove('admin-mode-active');

  // Route to login page
  window.location.hash = 'login';
  handleRouteHash();
  showToast('🔒 Admin session locked & logged out.');
};

window.openAdminPortal = function() {
  window.location.hash = 'admin';
  handleRouteHash();
};

window.switchView = function(viewId) {
  if (!viewId) return;
  const cleanId = viewId.replace('#', '');
  if (cleanId === 'admin' || cleanId === 'admin-view') {
    window.location.hash = 'admin';
  } else if (cleanId === 'login' || cleanId === 'admin-login' || cleanId === 'admin-login-view') {
    window.location.hash = 'login';
  } else {
    window.location.hash = cleanId;
  }
  handleRouteHash();
};

/* Mobile Drawer Control */
function initMobileDrawer() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const overlay = document.getElementById('mobile-drawer-overlay');
  const closeBtn = document.getElementById('close-drawer-btn');

  if (toggleBtn) toggleBtn.addEventListener('click', openMobileDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeMobileDrawer);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeMobileDrawer();
    });
  }
}

function openMobileDrawer() {
  const overlay = document.getElementById('mobile-drawer-overlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.classList.add('drawer-open');
  }
}

function closeMobileDrawer() {
  const overlay = document.getElementById('mobile-drawer-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.classList.remove('drawer-open');
  }
}

/* Back To Top Button */
function initBackToTop() {
  const backBtn = document.getElementById('back-to-top-btn');
  if (!backBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backBtn.classList.add('visible');
    } else {
      backBtn.classList.remove('visible');
    }
  }, { passive: true });

  backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* Scroll Animations */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  elements.forEach(el => el.classList.add('is-visible'));
}

/* Animated Counters for Key Stats */
function initAnimatedCounters() {
  const statsContainer = document.querySelector('.stats-section');
  if (!statsContainer) return;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(statsContainer);
}

function animateCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  counters.forEach(counter => {
    const target = parseFloat(counter.getAttribute('data-target'));
    const suffix = counter.getAttribute('data-suffix') || '';
    const prefix = counter.getAttribute('data-prefix') || '';
    const formatComma = counter.getAttribute('data-format') === 'comma';
    const isDecimal = target % 1 !== 0;
    const duration = 2000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      let formattedVal = isDecimal ? current.toFixed(1) : Math.floor(current);
      if (formatComma) formattedVal = Number(formattedVal).toLocaleString('en-IN');
      counter.textContent = prefix + formattedVal + suffix;
    }, stepTime);
  });
}

/* Render Departments */
function renderDepartments() {
  const gridContainers = document.querySelectorAll('.departments-grid');
  const megaMenuContainer = document.getElementById('mega-menu-dept-list');
  const deptSelectModal = document.getElementById('modal-dept-select');
  const deptSelectQuick = document.getElementById('quick-dept-select');

  const deptCardsHtml = appState.departments.map((dept, idx) => `
    <div class="dept-card reveal-on-scroll delay-${(idx % 4 + 1) * 100}" data-dept-id="${dept.id}">
      <div class="dept-icon">
        <i data-lucide="${dept.icon || 'activity'}"></i>
      </div>
      <h3 class="dept-name">${dept.name}</h3>
      <p class="dept-desc">${dept.shortDesc}</p>
      <a href="#department-${dept.id}" class="dept-link" data-view-target="department-${dept.id}">
        View Department Details &amp; OPD <i data-lucide="arrow-right"></i>
      </a>
    </div>
  `).join('');

  gridContainers.forEach(container => container.innerHTML = deptCardsHtml);

  if (megaMenuContainer) {
    megaMenuContainer.innerHTML = appState.departments.map(dept => `
      <a href="#department-${dept.id}" class="dropdown-link" data-view-target="department-${dept.id}">
        <div class="dropdown-icon"><i data-lucide="${dept.icon || 'activity'}"></i></div>
        <div>
          <div style="font-weight: 700;">${dept.name}</div>
          <div style="font-size: 0.775rem; color: #64748b;">${dept.head || 'Specialist Head'}</div>
        </div>
      </a>
    `).join('');
  }

  const deptOptionsHtml = appState.departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('') +
    `<option value="other">Other / General Consultation (Receptionist Decision)</option>`;
  if (deptSelectModal) deptSelectModal.innerHTML = `<option value="">Select Specialty / Department</option>` + deptOptionsHtml;
  if (deptSelectQuick) deptSelectQuick.innerHTML = `<option value="">Choose Department</option>` + deptOptionsHtml;

  if (typeof initDeptDocFilterSync === 'function') {
    initDeptDocFilterSync();
  }

  if (window.lucide) window.lucide.createIcons();
}

const DEPARTMENT_DETAILS_MAP = {
  cardiology: {
    id: "cardiology",
    name: "Cardiology & Cath Lab",
    icon: "heart-pulse",
    head: "Dr. Sitanshu Sekhar Mohanti & Dr. Satish Chainsingh Suryawanshi (MD, DM Cardiology)",
    shortDesc: "Comprehensive heart care, 24x7 Cath Lab, Angioplasty & TMT.",
    fullDescription: "Life Line Hospital's Department of Cardiology & Cath Lab provides round-the-clock emergency cardiac care, interventional cardiology, and non-invasive diagnostic evaluation in Ambikapur. Equipped with a digital Cath Lab, our cardiac team performs life-saving primary angioplasties during acute heart attack emergencies.",
    procedures: [
      "Emergency Coronary Angiography & Primary Angioplasty (PPCI)",
      "Single & Dual Chamber Permanent Pacemaker Implantation",
      "2D / 4D Color Doppler Echocardiography (ECHO)",
      "Treadmill Stress Testing (TMT) & Holter Monitoring",
      "Intensive Cardiac Care Unit (ICCU) Management",
      "Hypertension & Heart Failure Specialized Therapy"
    ],
    equipment: [
      "Flat-Panel Digital Cath Lab Suite",
      "High-Resolution Color Doppler ECHO Machine",
      "Treadmill Stress Test (TMT) Setup",
      "24x7 ICCU Monitors, Defibrillators & IABP",
      "Emergency Cardiac Ambulance"
    ]
  },
  orthopedics: {
    id: "orthopedics",
    name: "Orthopedics & Joint Replacement",
    icon: "bone",
    head: "Dr. Rupesh Gupta (MS Ortho)",
    shortDesc: "Knee & Hip replacements, Arthroscopy & 24x7 Complex Trauma Care.",
    fullDescription: "The Department of Orthopedics & Joint Replacement offers comprehensive surgical and non-surgical care for bone, joint, ligament, and spine disorders. Our team specializes in computer-navigated Total Knee Replacement (TKR), Total Hip Replacement (THR), Arthroscopic Keyhole Joint Repair, and 24x7 complex fracture trauma surgery.",
    procedures: [
      "Total Knee Replacement (TKR) & Total Hip Replacement (THR)",
      "Arthroscopic Keyhole ACL / Ligament & Meniscus Repair",
      "Complex Fracture Trauma & Poly-Trauma Fixation",
      "Micro-Discectomy & Spinal Fusion Surgery",
      "Pediatric Orthopedics & Bone Deformity Correction",
      "Joint Pain Injection Therapy & Rehabilitation"
    ],
    equipment: [
      "Laminar Airflow Operation Theatre (Zero Bacteria Air)",
      "High-Frequency C-Arm Image Intensifier",
      "Arthroscopy HD Camera & Light Tower",
      "Orthopedic Surgical Power Drill Systems",
      "Specialized Physiotherapy & Rehab Unit"
    ]
  },
  neurology: {
    id: "neurology",
    name: "Neurology & Neurosurgery",
    icon: "brain",
    head: "Dr. Nitesh Kumar Dubey (MBBS, MS, MCh Neurosurgery)",
    shortDesc: "Brain & Spine surgery, Stroke emergency unit & Nerve care.",
    fullDescription: "Providing advanced neuro-surgical procedures and specialized neurological care in Surguja division. Our neurosurgery team handles complex brain tumors, head injury trauma emergencies, brain hemorrhage evacuation, spinal disc surgeries, and acute ischemic stroke thrombolysis.",
    procedures: [
      "Emergency Brain Trauma & Intracranial Hemorrhage Surgery",
      "Micro-Neurosurgical Brain Tumor Excision",
      "Lumbar & Cervical Micro-Discectomy Spine Surgery",
      "Acute Ischemic Stroke Emergency Thrombolysis",
      "Nerve Conduction Velocity (NCV) & EEG Evaluation",
      "Epilepsy, Paralysis & Migraine Management"
    ],
    equipment: [
      "High-Definition Surgical Neuro-Microscope",
      "Dedicated Neuro ICU Monitors & Ventilators",
      "3T High-Field MRI Scanner",
      "128-Slice CT Scanner System",
      "24x7 Stroke Emergency Trauma Response"
    ]
  },
  pediatrics: {
    id: "pediatrics",
    name: "Pediatrics & Neonatology (NICU)",
    icon: "baby",
    head: "Dr. Sonal Gardia (MD Pediatrics, DCH)",
    shortDesc: "Level-3 NICU, Newborn care, Pediatric Surgery & Vaccination.",
    fullDescription: "The Center for Pediatrics & Neonatology offers a dedicated Level-3 NICU (Neonatal Intensive Care Unit) for premature, low birth weight, and critically ill newborns. Equipped with advanced radiant warmers, neonatal ventilators, LED phototherapy, and specialized pediatric OPD care.",
    procedures: [
      "Level-3 Neonatal Intensive Care (Premature & Low Birth Weight)",
      "Neonatal Mechanical Ventilation & Surfactant Therapy",
      "Neonatal Jaundice Double-Surface LED Phototherapy",
      "Pediatric Emergency Trauma & Critical Illness Care",
      "Complete Child Vaccination & Growth Monitoring",
      "Pediatric Infectious Disease & Asthma Care"
    ],
    equipment: [
      "Servo-Controlled Neonatal Incubators & Radiant Warmers",
      "Neonatal Mechanical Ventilators & CPAP Units",
      "Double-Surface LED Phototherapy Units",
      "Pediatric Pulse Oximetry & Vital Monitors",
      "24x7 Newborn Emergency Transport Unit"
    ]
  },
  gynecology: {
    id: "gynecology",
    name: "Obstetrics & Gynecology",
    icon: "sparkles",
    head: "Dr. Shroti Asati, Dr. Bhavna Gardia & Dr. Pravdha Gupta (MS Obs & Gynae)",
    shortDesc: "Painless delivery, High-risk pregnancy & Laparoscopy.",
    fullDescription: "Providing comprehensive women's health services, maternity care, and advanced gynecological surgeries. Our department specializes in painless epidural deliveries, high-risk pregnancy management, total laparoscopic hysterectomy, ovarian cyst removal, and infertility workup.",
    procedures: [
      "Normal & Epidural Painless Delivery / Emergency C-Section",
      "High-Risk Pregnancy & Recurrent Miscarriage Management",
      "Total Laparoscopic Hysterectomy (TLH Keyhole Uterus Surgery)",
      "Laparoscopic Ovarian Cyst & Fibroid Excision",
      "Infertility Workup, Follicular Monitoring & HSG",
      "Adolescent & Menopausal Health Consultation"
    ],
    equipment: [
      "4D Fetal Ultrasound Sonography Machine",
      "Fetal Doppler & Cardiotocography (CTG) Monitor",
      "HD Laparoscopy Camera Tower",
      "Fully Equipped Labor Suites & OT",
      "24x7 Gynecological Emergency Desk"
    ]
  },
  surgery: {
    id: "surgery",
    name: "General & Laparoscopic Surgery",
    icon: "activity",
    head: "Dr. Prassan Mohan Tripathi, Dr. Chandranshu Tripathi & Dr. Akhilesh Kumar Bharat (MS Surgery, DNB)",
    shortDesc: "Keyhole laparoscopic surgeries for gallbladder, hernia & appendix.",
    fullDescription: "Equipped with modern laparoscopic keyhole surgical towers to perform minimally invasive abdominal surgeries with faster recovery, minimal pain, and minimal scarring. Handling routine and emergency general surgeries round-the-clock.",
    procedures: [
      "Laparoscopic Cholecystectomy (Gallbladder Stone Removal)",
      "Laparoscopic Hernia Repair (Inguinal, Umbilical, Ventral)",
      "Laparoscopic Appendectomy (Appendix Removal)",
      "Laser Proctology for Piles, Fissure & Fistula",
      "Emergency Abdominal Trauma & Perforation Surgery",
      "Thyroid, Breast & Soft Tissue Tumor Surgeries"
    ],
    equipment: [
      "4K HD Laparoscopy Tower System",
      "Harmonic Scalpel Energy Cutting Device",
      "Electrosurgical High-Frequency Cautery",
      "Infection-Controlled Modular Operation Theatre",
      "Post-Operative Recovery Ward"
    ]
  },
  urology: {
    id: "urology",
    name: "Urology & Kidney Care",
    icon: "activity",
    head: "Visiting Urologist Specialist",
    shortDesc: "Laser stone removal (RIRS/PCNL), Prostate surgery & Kidney care.",
    fullDescription: "Comprehensive treatment for kidney stones, prostate enlargement, urinary tract infections, and urological cancers. Featuring advanced Holmium Laser technology for incisionless kidney stone fragmentation and TURP prostate surgery.",
    procedures: [
      "RIRS (Laser Kidney Stone Removal without Incisions)",
      "PCNL (Keyhole Surgery for Large Kidney Stones)",
      "URSL (Laser Ureteric Stone Removal)",
      "TURP (Laser / Bipolar Prostate Surgery)",
      "Hemodialysis Unit & Chronic Kidney Disease Care",
      "Urological Cancer & Reconstructive Surgery"
    ],
    equipment: [
      "Holmium Laser Stone Fragmentation System",
      "Rigid & Flexible Fiberoptic Ureteroscopes",
      "C-Arm Fluoroscopy Imaging System",
      "Hemodialysis Machine Units",
      "Urodynamics Evaluation Setup"
    ]
  },
  radiology: {
    id: "radiology",
    name: "Radiology & Diagnostic Pathology",
    icon: "scan",
    head: "Radiologist & Imaging Specialist",
    shortDesc: "CT-Scan, Digital X-Ray, USG, TMT & Pathology Lab.",
    fullDescription: "Providing 24x7 imaging and diagnostic laboratory services. Equipped with high-resolution 3T MRI, 128-Slice CT Scan, 3D/4D Color Ultrasound, Digital X-Ray, and NABL-standard automated pathology laboratory.",
    procedures: [
      "3T Whole Body MRI & Brain MR Angiography",
      "128-Slice Whole Body CT Scan & CT Angiography",
      "3D / 4D Color Doppler Ultrasound & Fetal Scan",
      "High-Frequency Digital X-Ray & Special Contrast Studies",
      "Treadmill Test (TMT) & ECG",
      "24x7 Automated Clinical Pathology & Biochemistry"
    ],
    equipment: [
      "3T High-Field MRI Machine",
      "128-Slice Multidetector CT Scanner",
      "3D/4D Color Doppler Ultrasound Unit",
      "Automated Hematology & Biochemistry Analyzers",
      "Digital Radiography (DR) X-Ray System"
    ]
  },
  mdmedicine: {
    id: "mdmedicine",
    name: "MD Medicine & Critical Care",
    icon: "stethoscope",
    head: "Dr. Amit Asati (MD Medicine)",
    shortDesc: "Internal medicine, critical care, fever clinic & chronic disease management.",
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
  dental: {
    id: "dental",
    name: "Dental & Orthodontics",
    icon: "smile",
    head: "Dr. Suneedh Gupta (BDS, MDS Orthodontics)",
    shortDesc: "Orthodontic braces, dental implants, root canal & oral surgery.",
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
  anaesthesiology: {
    id: "anaesthesiology",
    name: "Anaesthesiology & Critical Care",
    icon: "syringe",
    head: "Dr. Shivam Kumar Sharma (MBBS, DA, FIPM)",
    shortDesc: "Expert anaesthesia for all surgeries, ICU management & pain clinic.",
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
};

/* Render Department Detail Page */
window.renderDepartmentDetailPage = function(deptId) {
  const normId = (deptId || '').toLowerCase().trim();
  const staticDetails = DEPARTMENT_DETAILS_MAP[normId] || Object.values(DEPARTMENT_DETAILS_MAP).find(d => d.name.toLowerCase().includes(normId)) || DEPARTMENT_DETAILS_MAP['cardiology'];
  
  const deptState = (appState.departments && appState.departments.find(d => d.id === normId)) || {};
  const dept = { ...staticDetails, ...deptState };

  const breadcrumbTitle = document.getElementById('dept-detail-breadcrumb-title');
  const titleEl = document.getElementById('dept-detail-title');
  const headTag = document.getElementById('dept-detail-head-tag');
  const shortDescEl = document.getElementById('dept-detail-shortdesc');
  const fullDescEl = document.getElementById('dept-detail-fulldesc');
  const iconWrap = document.getElementById('dept-detail-icon-wrap');
  const proceduresGrid = document.getElementById('dept-detail-procedures-grid');
  const equipmentGrid = document.getElementById('dept-detail-equipment-grid');
  const doctorsGrid = document.getElementById('dept-detail-doctors-grid');
  const otherList = document.getElementById('dept-detail-other-list');

  if (breadcrumbTitle) breadcrumbTitle.textContent = dept.name;
  if (titleEl) titleEl.textContent = dept.name;
  if (headTag) headTag.textContent = dept.head || 'Specialist Head';
  if (shortDescEl) shortDescEl.textContent = dept.shortDesc || '';
  if (fullDescEl) fullDescEl.textContent = dept.fullDescription || dept.shortDesc || '';
  if (iconWrap) iconWrap.innerHTML = `<i data-lucide="${dept.icon || 'activity'}" style="width: 26px; height: 26px;"></i>`;

  // Render Procedures
  if (proceduresGrid) {
    const procedures = dept.procedures && dept.procedures.length > 0 ? dept.procedures : staticDetails.procedures;
    proceduresGrid.innerHTML = procedures.map(p => `
      <div style="background: #f8fafc; padding: 16px 18px; border-radius: 12px; border-left: 4px solid #028090; display: flex; align-items: center; gap: 10px;">
        <span style="color: #028090; font-weight: 800;">✓</span>
        <span style="font-size: 0.925rem; font-weight: 700; color: #014e59;">${p}</span>
      </div>
    `).join('');
  }

  // Render Equipment
  if (equipmentGrid) {
    const equipment = dept.equipment && dept.equipment.length > 0 ? dept.equipment : staticDetails.equipment;
    equipmentGrid.innerHTML = equipment.map(eq => `
      <div style="background: #f0f9ff; padding: 14px 16px; border-radius: 12px; border: 1px solid #bae6fd; font-size: 0.875rem; font-weight: 700; color: #028090;">
        ⚡ ${eq}
      </div>
    `).join('');
  }

  // Render Doctors belonging to this department
  if (doctorsGrid) {
    const deptDocs = appState.doctors.filter(d => 
      d.specialty === dept.id || 
      (d.specialtyName && d.specialtyName.toLowerCase().includes(dept.id.toLowerCase())) ||
      (d.specialtyName && dept.name.toLowerCase().includes(d.specialtyName.toLowerCase()))
    );

    if (deptDocs.length === 0) {
      doctorsGrid.innerHTML = `<p style="color: #64748b; font-size: 0.9rem;">Consultant doctor panel active for OPD. Book appointment for schedule.</p>`;
    } else {
      doctorsGrid.innerHTML = deptDocs.map(doc => {
        const validImg = getDoctorImage(doc);
        const imgHtml = validImg ? `
          <img src="${validImg}" alt="${doc.name}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
        ` : `
          <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg,#028090,#00c4a7); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem;">
            ${(doc.name || 'D').replace(/^Dr\.\s*/i, '').charAt(0)}
          </div>
        `;

        return `
          <div style="background: #f8fafc; padding: 18px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
                ${imgHtml}
                <div>
                  <h4 style="font-size: 1rem; color: #014e59; font-weight: 800; margin: 0;">${doc.name}</h4>
                  <span style="font-size: 0.775rem; color: #64748b;">${doc.degree}</span>
                </div>
              </div>
              <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 12px;">
                ⏱️ ${doc.timings || 'OPD Consultation'}
              </p>
            </div>
            <button class="btn btn-primary" onclick="openBookingForDoctor('${doc.id}')" style="padding: 7px 14px; font-size: 0.8rem; width: 100%; justify-content: center;">
              Book OPD Consultation
            </button>
          </div>
        `;
      }).join('');
    }
  }

  // Render Other Departments List
  if (otherList) {
    const others = appState.departments.filter(d => d.id !== dept.id);
    otherList.innerHTML = others.map(d => `
      <a href="#department-${d.id}" data-view-target="department-${d.id}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; text-decoration: none; color: #014e59; font-weight: 700; font-size: 0.875rem;">
        <span>${d.name}</span>
        <span style="color: #028090;">→</span>
      </a>
    `).join('');
  }

  if (window.lucide) window.lucide.createIcons();
};

/* Render Doctors Directory */
function getDoctorImage(doc) {
  if (!doc) return '/assets/images/doctors_team.png';
  const cleanId = String(doc.id || '').replace(/^doc-?/, '');
  const cleanNameKey = String(doc.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const cachedPhoto = localStorage.getItem('doc_photo_' + doc.id) ||
                      localStorage.getItem('doc_photo_doc-' + cleanId) ||
                      localStorage.getItem('doc_photo_' + cleanId) ||
                      localStorage.getItem('doc_photo_name_' + cleanNameKey);

  if (cachedPhoto && cachedPhoto.length > 5 && !cachedPhoto.includes('unsplash.com') && !cachedPhoto.includes('placeholder')) {
    return cachedPhoto;
  }

  let img = (doc.image && doc.image.length > 5) ? doc.image : (doc.imageUrl || '');
  img = String(img || '').trim().replace(/[\r\n]+/g, '');
  if (img && img.length > 5 && !img.includes('unsplash.com') && !img.includes('placeholder')) {
    return img;
  }
  return '/assets/images/doctors_team.png';
}

function renderDoctors(filterDept = 'all', searchQuery = '') {
  const doctorContainers = document.querySelectorAll('.doctors-grid');
  const doctorSelectModal = document.getElementById('modal-doc-select');
  if (!doctorContainers.length && !doctorSelectModal) return;

  let filtered = appState.doctors || [];

  if (filterDept && filterDept !== 'all') {
    filtered = filtered.filter(d => (d.specialty || '').toLowerCase() === filterDept.toLowerCase());
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(d => 
      (d.name || '').toLowerCase().includes(q) || 
      (d.specialtyName || d.specialty || '').toLowerCase().includes(q) ||
      (d.degree || '').toLowerCase().includes(q)
    );
  }

  const html = filtered.map(doc => {
    const photoUrl = getDoctorImage(doc);
    const feeText = String(doc.fee || '₹500').startsWith('₹') ? doc.fee : `₹${doc.fee}`;

    return `
      <div class="doctor-card" onclick="openDoctorDetailsModal('${doc.id}')" style="cursor: pointer; background: white; border-radius: 16px; border: 1px solid rgba(2,128,144,0.12); padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); display: flex; flex-direction: column; justify-content: space-between; transition: all 0.3s ease;">
        <div>
          <div style="position: relative; aspect-ratio: 1 / 1; width: 100%; border-radius: 12px; overflow: hidden; margin-bottom: 16px; background: #e6f7f5;">
            <img src="${photoUrl}" alt="${doc.name}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;">
            <span style="position: absolute; top: 10px; right: 10px; background: rgba(2,128,144,0.9); color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.725rem; font-weight: 700;">
              ${(typeof appState !== 'undefined' && appState.departments && appState.departments.find(d => d.id === doc.specialty)?.name) || doc.specialtyName || doc.specialty}
            </span>
          </div>

          <span style="font-size: 0.75rem; color: #028090; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${doc.designation || 'Consultant Specialist'}</span>
          <h3 style="font-size: 1.1rem; color: #014e59; font-weight: 800; margin: 4px 0 6px 0;">${doc.name}</h3>
          <p style="font-size: 0.825rem; color: #64748b; margin-bottom: 8px; font-weight: 500;">${doc.degree}</p>

          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px;">
            <span style="background: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 6px; font-size: 0.725rem; font-weight: 600;">⏱️ ${doc.timings || '10:00 AM - 02:00 PM'}</span>
            <span style="background: #e6f7f5; color: #028090; padding: 3px 8px; border-radius: 6px; font-size: 0.725rem; font-weight: 700;">🎖️ ${doc.experience || '10+ Years Exp'}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: 10px;">
          <div>
            <span style="display: block; font-size: 0.7rem; color: #94a3b8; font-weight: 700;">OPD FEE</span>
            <strong style="font-size: 1rem; color: #014e59;">${feeText}</strong>
          </div>
        </div>
      </div>
    `;
  }).join('');

  doctorContainers.forEach(container => {
    container.innerHTML = html || `<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 30px;">No doctors found matching criteria.</p>`;
  });

  if (doctorSelectModal) {
    doctorSelectModal.innerHTML = `<option value="">Select Doctor (Optional)</option>` + 
      (appState.doctors || []).map(doc => `<option value="${doc.id}">${doc.name} (${doc.specialtyName || doc.specialty})</option>`).join('') +
      `<option value="receptionist_assign">Any Duty Doctor (Receptionist Will Assign)</option>`;
  }

  if (window.lucide) window.lucide.createIcons();
}

window.filterDoctorsByDept = function(deptId) {
  document.querySelectorAll('.doctor-dept-filter').forEach(select => select.value = deptId);
  renderDoctors(deptId);
};

document.addEventListener('input', (e) => {
  if (e.target.classList.contains('doctor-search-input')) {
    const deptFilter = document.querySelector('.doctor-dept-filter')?.value || 'all';
    renderDoctors(deptFilter, e.target.value);
  }
});

document.addEventListener('change', (e) => {
  if (e.target.classList.contains('doctor-dept-filter')) {
    const searchVal = document.querySelector('.doctor-search-input')?.value || '';
    renderDoctors(e.target.value, searchVal);
  }
});

/* Render Facilities */
function renderFacilities() {
  const containers = document.querySelectorAll('.facilities-grid');
  const facilitiesList = (appState.facilities && appState.facilities.length > 0) ? appState.facilities : defaultHospitalData.facilities;
  if (!containers.length || !Array.isArray(facilitiesList)) return;

  const html = facilitiesList.map((fac, idx) => {
    const hasCustomImg = fac.image && fac.image.trim().length > 10;
    const features = fac.features || [
      "24x7 Medical Response",
      "Advanced Clinical Infrastructure",
      "NABH Quality Standards"
    ];
    const featuresHtml = features.map(f => `
      <div style="display: flex; align-items: center; gap: 8px; font-size: 0.825rem; font-weight: 700; color: #014e59;">
        <span style="color: #028090;">✓</span>
        <span>${f}</span>
      </div>
    `).join('');

    return `
      <div class="facility-card reveal-on-scroll delay-${(idx % 3 + 1) * 100}" style="background: white; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04); display: flex; flex-direction: column; justify-content: space-between; position: relative;">
        
        <div>
          ${hasCustomImg ? `
            <!-- Custom Uploaded Facility Image Banner -->
            <div style="width: 100%; height: 200px; overflow: hidden; position: relative; background: #0f172a;">
              <img src="${fac.image}" alt="${fac.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">
              <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(1,78,89,0.75) 0%, transparent 60%);"></div>
              
              <div style="position: absolute; top: 14px; left: 14px; right: 14px; display: flex; align-items: center; justify-content: space-between;">
                <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(255,255,255,0.92); backdrop-filter: blur(8px); color: #028090; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
                  <i data-lucide="${fac.icon || 'activity'}" style="width: 22px; height: 22px;"></i>
                </div>
                <span style="background: rgba(1,78,89,0.85); backdrop-filter: blur(8px); color: white; padding: 5px 14px; border-radius: 999px; font-size: 0.75rem; font-weight: 800; border: 1px solid rgba(255,255,255,0.25);">
                  ${fac.category || 'Hospital Facility'}
                </span>
              </div>
            </div>
          ` : `
            <!-- Default Clean Layout without stock photo -->
            <div style="padding: 24px 24px 0 24px; display: flex; align-items: center; justify-content: space-between;">
              <div style="width: 52px; height: 52px; border-radius: 16px; background: linear-gradient(135deg, #e0f7f4 0%, #ccfbf1 100%); color: #028090; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(2,128,144,0.12);">
                <i data-lucide="${fac.icon || 'activity'}" style="width: 26px; height: 26px;"></i>
              </div>
              <span style="background: #f0f9ff; color: #028090; padding: 5px 14px; border-radius: 999px; font-size: 0.775rem; font-weight: 800; border: 1px solid #bae6fd;">
                ${fac.category || 'Hospital Facility'}
              </span>
            </div>
          `}

          <!-- Card Content Body -->
          <div style="padding: 24px;">
            <h3 style="font-size: 1.25rem; font-weight: 800; color: #014e59; margin-bottom: 10px; line-height: 1.3;">
              ${fac.title}
            </h3>
            <p style="font-size: 0.88rem; color: #64748b; line-height: 1.6; margin-bottom: 18px;">
              ${fac.desc}
            </p>

            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; background: #f8fafc; padding: 14px 16px; border-radius: 14px; border: 1px solid #f1f5f9;">
              ${featuresHtml}
            </div>
          </div>
        </div>

        <div style="padding: 0 24px 24px;">
          <button class="btn btn-primary" onclick="openBookingModal()" style="width: 100%; justify-content: center; font-size: 0.85rem; font-weight: 700; padding: 10px 16px;">
            Inquire / Book Facility
          </button>
        </div>

      </div>
    `;
  }).join('');

  containers.forEach(c => c.innerHTML = html);
  if (window.lucide) window.lucide.createIcons();
}



/* Render Health Blogs on Homepage */
function renderBlogs() {
  const container = document.getElementById('blogs-grid-container');
  if (!container || !appState.blogs) return;

  container.innerHTML = appState.blogs.map((b, idx) => `
    <div class="blog-card reveal-on-scroll delay-${(idx % 2 + 1) * 100}">
      <div class="blog-img-wrap" onclick="openBlogModal('${b.id}')" style="cursor: pointer;">
        <img src="${b.image}" alt="${b.title}" loading="lazy">
        <span class="blog-cat-badge">${b.category}</span>
      </div>
      <div class="blog-content">
        <span class="blog-date"><i data-lucide="calendar" style="width: 14px; height: 14px; display: inline;"></i> ${b.date}</span>
        <h3 class="blog-title" onclick="openBlogModal('${b.id}')" style="cursor: pointer;">${b.title}</h3>
        <p class="blog-excerpt">${b.excerpt}</p>
        <button class="btn btn-outline" style="padding: 7px 16px; font-size: 0.825rem; width: fit-content;" onclick="openBlogModal('${b.id}')">
          Read Full Article <i data-lucide="arrow-right"></i>
        </button>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

/* Render Health Blogs on Dedicated Blogs Page View */
function renderAllBlogsPage(categoryFilter = 'all') {
  const container = document.getElementById('all-blogs-grid-container');
  if (!container || !appState.blogs) return;

  let blogsToRender = appState.blogs;
  if (categoryFilter !== 'all') {
    blogsToRender = blogsToRender.filter(b => b.category.toLowerCase().includes(categoryFilter.toLowerCase()));
  }

  if (blogsToRender.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: #f8fafc; border-radius: 16px; color: #64748b;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 12px; opacity: 0.5;">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
        <h4 style="font-size: 1.1rem; color: #014e59; margin-bottom: 6px;">No Articles Found</h4>
        <p style="font-size: 0.9rem;">No health articles found in "${categoryFilter}" category.</p>
      </div>`;
    return;
  }

  container.innerHTML = blogsToRender.map((b, idx) => `
    <div class="blog-card reveal-on-scroll delay-${(idx % 3 + 1) * 100}">
      <div class="blog-img-wrap" onclick="openBlogModal('${b.id}')" style="cursor: pointer;">
        <img src="${b.image}" alt="${b.title}" loading="lazy">
        <span class="blog-cat-badge">${b.category}</span>
      </div>
      <div class="blog-content">
        <span class="blog-date"><i data-lucide="calendar" style="width: 14px; height: 14px; display: inline;"></i> ${b.date}</span>
        <h3 class="blog-title" onclick="openBlogModal('${b.id}')" style="cursor: pointer;">${b.title}</h3>
        <p class="blog-excerpt">${b.excerpt}</p>
        <button class="btn btn-outline" style="padding: 7px 16px; font-size: 0.825rem; width: fit-content;" onclick="openBlogModal('${b.id}')">
          Read Full Article <i data-lucide="arrow-right"></i>
        </button>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

function filterBlogs(category, btnElement) {
  const container = document.getElementById('blog-category-filters');
  if (container) {
    container.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  }
  if (btnElement) btnElement.classList.add('active');
  renderAllBlogsPage(category);
}
window.filterBlogs = filterBlogs;

/* Open Full Blog Article Detail Page View */
function openBlogModal(blogId) {
  const blog = appState.blogs.find(b => b.id === blogId);
  if (!blog) return;

  const breadcrumbCat = document.getElementById('detail-breadcrumb-cat');
  const catBadge      = document.getElementById('detail-cat-badge');
  const dateTag       = document.getElementById('detail-date-tag');
  const titleEl       = document.getElementById('detail-title');
  const coverImg      = document.getElementById('detail-cover-img');
  const bodyEl        = document.getElementById('detail-body-content');
  const sidebarEl     = document.getElementById('detail-sidebar-articles');

  if (breadcrumbCat) breadcrumbCat.textContent = blog.category;
  if (catBadge)      catBadge.textContent = blog.category;
  if (dateTag)       dateTag.textContent = '📅 ' + blog.date;
  if (titleEl)       titleEl.textContent = blog.title;
  if (coverImg)      coverImg.src = blog.image;

  if (bodyEl) {
    const rawContent = blog.content || blog.excerpt || '';
    const blocks = rawContent.split(/\n\n+/).map(b => b.trim()).filter(Boolean);

    const formattedContent = blocks.map((block, idx) => {
      let formatted = block.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      if (block.startsWith('#')) {
        const titleText = block.replace(/^#+\s*/, '');
        return `<h2 style="font-size: 1.45rem; color: #014e59; margin: 36px 0 16px; font-weight: 800; border-bottom: 2px solid #e0f7f4; padding-bottom: 8px;">${titleText}</h2>`;
      }

      if (block.startsWith('>') || block.startsWith('💡')) {
        const quoteText = block.replace(/^>\s*/, '');
        return `<blockquote style="background: linear-gradient(135deg, #e0f7f4 0%, #f0f9ff 100%); padding: 22px 26px; border-radius: 14px; border-left: 4px solid #00c4a7; margin: 28px 0; font-size: 1.05rem; color: #014e59; font-weight: 600; line-height: 1.7;">${quoteText}</blockquote>`;
      }

      if (block.includes('\n- ') || block.startsWith('- ') || block.startsWith('* ') || block.includes('\n1. ') || block.startsWith('1. ')) {
        const items = block.split('\n').map(item => item.replace(/^([-*]|\d+\.)\s*/, '').trim()).filter(Boolean);
        const listHtml = items.map(it => `<li style="margin-bottom: 10px; line-height: 1.75;">${it.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('');
        return `<ul style="padding-left: 24px; margin-bottom: 24px; color: #334155; font-size: 1.025rem;">${listHtml}</ul>`;
      }

      if (idx === 0) {
        return `<p style="font-size: 1.15rem; font-weight: 500; color: #0f172a; line-height: 1.8; margin-bottom: 26px; border-left: 4px solid #028090; padding: 16px 20px; background: #f8fafc; border-radius: 0 14px 14px 0;">${formatted}</p>`;
      }

      return `<p style="margin-bottom: 22px; line-height: 1.85; font-size: 1.05rem; color: #334155;">${formatted.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    bodyEl.innerHTML = `
      ${formattedContent}

      <div style="background: linear-gradient(135deg, #e0f7f4 0%, #f0f9ff 100%); padding: 24px; border-radius: 16px; border: 1px solid rgba(2,128,144,0.2); margin: 36px 0;">
        <h3 style="font-size: 1.1rem; color: #028090; font-weight: 800; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;">
          <span>💡</span> Life Line Hospital Emergency &amp; Medical Guidelines
        </h3>
        <p style="font-size: 0.95rem; color: #1e293b; margin-bottom: 12px; line-height: 1.6;">
          Our 24x7 Cath Lab, Level-3 ICU, Trauma Care Unit, 3T MRI/CT Radiology, and Emergency Ambulance service are active round-the-clock for Ambikapur and Surguja district.
        </p>
        <div style="font-size: 0.9rem; font-weight: 700; color: #014e59;">
          24x7 Emergency Line: <a href="tel:+917774234999" style="color: #e63946; text-decoration: none;">+91 7774 234 999</a>
        </div>
      </div>

      <p style="font-size: 0.85rem; color: #94a3b8; font-style: italic; margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
        * Disclaimer: This article is published for general health awareness by Life Line Hospital Editorial Team and does not replace personal medical advice.
      </p>
    `;
  }

  // Populate Sidebar Articles
  if (sidebarEl) {
    const otherBlogs = appState.blogs.filter(b => b.id !== blogId).slice(0, 3);
    sidebarEl.innerHTML = otherBlogs.map(b => `
      <div onclick="openBlogModal('${b.id}')" style="display: flex; gap: 12px; cursor: pointer; align-items: center; padding: 8px; border-radius: 10px; transition: background 0.2s ease;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
        <img src="${b.image}" alt="${b.title}" style="width: 64px; height: 64px; border-radius: 10px; object-fit: cover; flex-shrink: 0;">
        <div>
          <span style="font-size: 0.72rem; color: #028090; font-weight: 700; text-transform: uppercase;">${b.category}</span>
          <h5 style="font-size: 0.85rem; color: #014e59; font-weight: 700; line-height: 1.35; margin: 2px 0 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${b.title}</h5>
        </div>
      </div>
    `).join('');
  }

  // Switch View to blog-detail-view
  const pageViews = document.querySelectorAll('.page-view');
  pageViews.forEach(view => {
    if (view.id === 'blog-detail-view') {
      view.classList.add('active-view');
    } else {
      view.classList.remove('active-view');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (window.lucide) window.lucide.createIcons();
}

function closeBlogModal() {
  const pageViews = document.querySelectorAll('.page-view');
  pageViews.forEach(view => {
    if (view.id === 'blogs-view') {
      view.classList.add('active-view');
    } else {
      view.classList.remove('active-view');
    }
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.openBlogModal = openBlogModal;
window.closeBlogModal = closeBlogModal;

function getGalleryImage(item) {
  if (!item) return '/Screenshot 2026-08-11 163953.png';
  const img = String(item.image || '').trim();
  if (!img || img.includes('unsplash')) return '/Screenshot 2026-08-11 163953.png';
  if (img.startsWith('http') || img.startsWith('data:image') || img.startsWith('/')) return img;
  return '/Screenshot 2026-08-11 163953.png';
}

function renderGallery(filterCategory = 'all') {
  const container = document.getElementById('gallery-grid-container');
  if (!container) return;

  let items = appState.gallery || defaultHospitalData.gallery || [];
  if (filterCategory !== 'all') {
    items = items.filter(g => g.category === filterCategory);
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: #f8fafc; border-radius: 16px; border: 1px dashed #cbd5e1;">
        <i data-lucide="image" style="width: 48px; height: 48px; color: #94a3b8; margin-bottom: 12px;"></i>
        <h4 style="color: #014e59; margin-bottom: 4px;">No Photos Found in this Category</h4>
        <p style="color: #64748b; font-size: 0.875rem;">Upload new photos from the Admin Portal Media & Gallery settings.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = items.map((item, idx) => {
    const validImg = getGalleryImage(item);
    const safeTitle = (item.title || 'Hospital Photo').replace(/'/g, "\\'");
    const safeCaption = (item.caption || '').replace(/'/g, "\\'");
    return `
      <div class="gallery-item reveal-on-scroll delay-${(idx % 3 + 1) * 100}" onclick="openLightbox('${validImg}', '${safeTitle}', '${safeCaption}')" style="cursor: pointer;">
        <img src="${validImg}" alt="${item.title}" loading="lazy">
        <div class="gallery-overlay">
          <span class="gallery-tag-badge">${item.category || 'Hospital'}</span>
          <h4 class="gallery-title-text">${item.title}</h4>
          <p class="gallery-caption-text">${item.caption || ''}</p>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

window.filterGallery = function(cat, btn) {
  document.querySelectorAll('.gallery-filters .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderGallery(cat);
};

window.openLightbox = function(src, title, caption) {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const titleEl = document.getElementById('lightbox-title');
  const capEl = document.getElementById('lightbox-caption');

  if (modal && img) {
    img.src = src;
    if (titleEl) titleEl.textContent = title;
    if (capEl) capEl.textContent = caption;
    modal.classList.add('active');
  }
};

/* Render Testimonials */
function renderTestimonials() {
  const containers = document.querySelectorAll('.testimonials-grid');
  if (!containers.length || !Array.isArray(appState.testimonials)) return;

  const html = appState.testimonials.map((t, idx) => {
    const authorName = t.author || t.patientName || t.patient_name || 'Patient';
    const firstInitial = authorName ? authorName.charAt(0).toUpperCase() : 'P';
    const quoteText = t.quote || t.comment || 'Excellent healthcare and medical care.';
    const locationText = t.location || 'Ambikapur';
    const deptText = t.department || t.treatment || 'General OPD';
    const ratingStars = '★'.repeat(t.rating || 5);

    return `
      <div class="testimonial-card reveal-on-scroll delay-${(idx % 3 + 1) * 100}">
        <div class="stars" style="color: #f59e0b; margin-bottom: 8px;">${ratingStars}</div>
        <p class="quote-text">"${quoteText}"</p>
        <div class="author-info" style="display: flex; align-items: center; gap: 12px; margin-top: 16px;">
          <div class="author-avatar" style="width: 40px; height: 40px; border-radius: 50%; background: #028090; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;">${firstInitial}</div>
          <div class="author-details">
            <h4 style="font-weight: 700; font-size: 0.95rem; margin: 0;">${authorName}</h4>
            <p style="font-size: 0.8rem; color: #64748b; margin: 2px 0 0 0;">${locationText} • <strong style="color: #028090;">${deptText}</strong></p>
          </div>
        </div>
      </div>
    `;
  }).join('');

  containers.forEach(c => c.innerHTML = html);
}

function initDeptDocFilterSync() {
  const deptSelectModal = document.getElementById('modal-dept-select');
  const doctorSelectModal = document.getElementById('modal-doc-select');
  const otherGroup = document.getElementById('other-checkup-group');

  if (!deptSelectModal || !doctorSelectModal) return;
  if (deptSelectModal._hasSyncListener) return;
  deptSelectModal._hasSyncListener = true;

  deptSelectModal.addEventListener('change', (e) => {
    const selectedDeptId = e.target.value;

    if (selectedDeptId === 'other') {
      if (otherGroup) otherGroup.style.display = 'block';
      doctorSelectModal.innerHTML = `<option value="receptionist_assign">Any Duty Doctor / General OPD (Receptionist Will Assign)</option>`;
      return;
    }

    if (otherGroup) otherGroup.style.display = 'none';

    let docs = appState.doctors || [];
    if (selectedDeptId) {
      docs = docs.filter(d => 
        d.specialty === selectedDeptId || 
        (d.specialtyName && d.specialtyName.toLowerCase().includes(selectedDeptId.toLowerCase())) ||
        (d.specialtyName && selectedDeptId.toLowerCase().includes(d.specialtyName.toLowerCase()))
      );
    }

    let options = `<option value="">Select Doctor (Optional - Receptionist Can Assign)</option>`;
    if (docs.length > 0) {
      options += docs.map(d => `<option value="${d.id}">${d.name} (${d.specialtyName})</option>`).join('');
    } else {
      options += appState.doctors.map(d => `<option value="${d.id}">${d.name} (${d.specialtyName})</option>`).join('');
    }
    options += `<option value="receptionist_assign">Any Specialist in this Dept (Receptionist Will Assign)</option>`;

    doctorSelectModal.innerHTML = options;
  });
}
window.initDeptDocFilterSync = initDeptDocFilterSync;

/* Appointment Booking Modal */
function initBookingModal() {
  const modal = document.getElementById('booking-modal');
  const closeBtn = document.getElementById('close-booking-modal');
  const modalBody = modal ? modal.querySelector('.modal-body') : null;
  const originalModalHtml = modalBody ? modalBody.innerHTML : '';

  function setupFormListener() {
    const bookingForm = document.getElementById('appointment-booking-form');
    if (!bookingForm) return;

    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('patient-name');
      const phoneInput = document.getElementById('patient-phone');
      const patientName = nameInput ? nameInput.value.trim() : 'Patient';
      const patientPhone = phoneInput ? phoneInput.value.trim() : '';
      const docSelect = document.getElementById('modal-doc-select');
      const deptSelect = document.getElementById('modal-dept-select');
      const apptDate = document.getElementById('appointment-date') ? document.getElementById('appointment-date').value : '';
      const checkupDetailInput = document.getElementById('patient-checkup-detail');
      const checkupDetail = checkupDetailInput ? checkupDetailInput.value.trim() : '';

      let docName = 'Duty Specialist (Receptionist Will Assign)';
      if (docSelect && docSelect.value) {
        const found = appState.doctors.find(d => d.id === docSelect.value);
        if (found) docName = found.name;
        else if (docSelect.options[docSelect.selectedIndex]) docName = docSelect.options[docSelect.selectedIndex].text;
      }

      const apptId = 'LLH-' + Math.floor(100000 + Math.random() * 900000);
      const deptName = (deptSelect && deptSelect.options[deptSelect.selectedIndex]) ? deptSelect.options[deptSelect.selectedIndex].text : 'General OPD';

      const newAppt = {
        id: apptId,
        patientName,
        patientPhone,
        department: deptName,
        doctor: docName,
        date: apptDate || new Date().toISOString().split('T')[0],
        time: 'Morning OPD (05:00 AM - 12:00 PM)',
        status: 'Pending',
        type: deptSelect?.value === 'other' ? 'Other Checkup' : 'OPD Booking',
        notes: checkupDetail || 'Registered via OPD Modal',
        createdTime: new Date().toLocaleString()
      };

      if (!appState.appointments) appState.appointments = [];
      appState.appointments.unshift(newAppt);
      saveHospitalData(appState);

      if (typeof renderAdminAppointmentsTable === 'function') {
        renderAdminAppointmentsTable();
      }

      try {
        if (isLocal) {
          fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAppt)
          }).catch(err => console.log('DB Post notice:', err));
        } else {
          const apptPayload = {
            booking_id: newAppt.id,
            patient_name: newAppt.patientName,
            patient_phone: newAppt.patientPhone,
            department: newAppt.department,
            doctor_name: newAppt.doctor,
            appointment_date: newAppt.date,
            preferred_time: newAppt.time,
            status: newAppt.status,
            notes: newAppt.notes
          };
          fetch(`${SUPABASE_STORAGE_URL}/rest/v1/appointments`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'apiKey': SUPABASE_ANON_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(apptPayload)
          }).catch(err => console.log('Direct appt save fail:', err));
        }
      } catch (err) { console.log(err); }

      if (modalBody) {
        modalBody.innerHTML = `
          <div style="text-align: center; padding: 20px 10px;">
            <div style="width: 64px; height: 64px; background: #e0f7f4; color: #00a896; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
              <i data-lucide="check-circle" style="width: 36px; height: 36px;"></i>
            </div>
            <h2 style="color: #014e59; font-size: 1.5rem; margin-bottom: 8px;">Appointment Confirmed!</h2>
            <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 24px;">Your OPD token has been registered at Life Line Hospital Ambikapur and saved to database.</p>

            <div style="background: #f8fafc; border: 1px dashed #028090; border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="color: #64748b; font-size: 0.85rem;">Booking Ref:</span>
                <strong style="color: #028090; font-family: monospace; font-size: 1rem;">${apptId}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #64748b; font-size: 0.85rem;">Patient Name:</span>
                <strong>${patientName}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #64748b; font-size: 0.85rem;">Contact:</span>
                <strong>${patientPhone}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #64748b; font-size: 0.85rem;">Doctor:</span>
                <strong>${docName}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b; font-size: 0.85rem;">Scheduled Date:</span>
                <strong>${apptDate || 'Tomorrow Morning'}</strong>
              </div>
            </div>

            <button class="btn btn-primary" onclick="document.getElementById('booking-modal').classList.remove('active')" style="width: 100%;">
              Done &amp; Close
            </button>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  window.openBookingModal = function() {
    if (modal) {
      if (modalBody && !document.getElementById('appointment-booking-form')) {
        modalBody.innerHTML = originalModalHtml;
        setupFormListener();
        renderDoctors();
      }
      modal.classList.add('active');
    }

    const quickDept = document.getElementById('quick-dept-select');
    const quickDate = document.getElementById('quick-date-input');
    const quickPhone = document.getElementById('quick-phone-input');

    const modalDept = document.getElementById('modal-dept-select');
    const modalDate = document.getElementById('appointment-date');
    const modalPhone = document.getElementById('patient-phone');

    if (quickDept && quickDept.value && modalDept) modalDept.value = quickDept.value;
    if (quickDate && quickDate.value && modalDate) modalDate.value = quickDate.value;
    if (quickPhone && quickPhone.value && modalPhone) modalPhone.value = quickPhone.value;
  };

  setupFormListener();

  window.openBookingForDoctor = function(docId) {
    openBookingModal();
    const docSelect = document.getElementById('modal-doc-select');
    if (docSelect) docSelect.value = docId;

    // Pre-select the corresponding specialty department
    const doc = appState.doctors.find(d => d.id === docId);
    if (doc) {
      const deptSelect = document.getElementById('modal-dept-select');
      if (deptSelect) deptSelect.value = doc.specialty;
    }
  };

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));

  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });


}

/* Contact Form Handling */
function initContactForm() {
  const form = document.getElementById('hospital-contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = form.querySelector('input[type="text"]')?.value || 'Patient';
    const phone = form.querySelector('input[type="tel"]')?.value || '';
    const message = form.querySelector('textarea')?.value || 'General Inquiry';

    const inqId = 'LLH-INQ-' + Math.floor(10000 + Math.random() * 90000);
    const newInquiry = {
      id: inqId,
      patientName: fullName,
      patientPhone: phone,
      department: 'General Hospital Inquiry',
      doctor: 'Front Desk Helpline',
      date: new Date().toISOString().split('T')[0],
      time: 'Web Contact Message',
      status: 'Pending',
      type: 'Web Inquiry',
      notes: message,
      createdTime: new Date().toLocaleString()
    };

    if (!appState.appointments) appState.appointments = [];
    appState.appointments.unshift(newInquiry);
    saveHospitalData(appState);

    if (typeof renderAdminAppointmentsTable === 'function') {
      renderAdminAppointmentsTable();
    }

    const alertBox = document.getElementById('contact-success-alert');
    if (alertBox) {
      alertBox.style.display = 'block';
      alertBox.innerHTML = `✓ Thank you ${fullName}! Your inquiry (${inqId}) has been registered. Our helpline will contact you at ${phone}.`;
      form.reset();
      setTimeout(() => alertBox.style.display = 'none', 6000);
    }
  });
}

/* ============ DIRECTOR PROFILE - VISITOR RENDER ============ */
function renderDirectorSection() {
  const dir = (appState && appState.director && appState.director.name)
    ? appState.director
    : (defaultHospitalData ? defaultHospitalData.director : null);
  if (!dir || !dir.name) return;

  const el = id => document.getElementById(id);
  const setText = (id, val) => { const e = el(id); if (e) e.textContent = val || ''; };

  setText('director-name-display', dir.name);
  setText('director-title-display', dir.title || '');
  setText('director-qual-display', dir.qualification || '');
  if (el('director-exp-badge')) el('director-exp-badge').textContent = dir.experience ? dir.experience + ' Experience' : '';
  setText('director-tagline-display', dir.tagline || '');
  setText('director-bio-display', dir.bio || '');
  setText('director-journey-display', dir.journey || '');

  // Photo
  const photoImg = el('director-photo-img');
  const photoPlaceholder = el('director-photo-placeholder');
  if (photoImg) {
    if (dir.photo && dir.photo.length > 5) {
      photoImg.src = dir.photo;
      photoImg.style.display = 'block';
      if (photoPlaceholder) photoPlaceholder.style.display = 'none';
    } else {
      photoImg.style.display = 'none';
      if (photoPlaceholder) photoPlaceholder.style.display = 'flex';
    }
  }

  // Achievements
  const achEl = el('director-achievements-list');
  if (achEl && Array.isArray(dir.achievements)) {
    achEl.innerHTML = dir.achievements.map(a =>
      `<li style="display:flex;align-items:flex-start;gap:10px;color:#475569;font-size:0.9rem;line-height:1.5;">
        <span style="width:22px;height:22px;border-radius:50%;background:#e0f7f4;color:#028090;font-size:0.8rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">✓</span>
        <span>${a}</span>
      </li>`
    ).join('');
  }
}

function renderHomeDirectorSpotlight() {
  // Read directly from appState (most up-to-date after admin save)
  const dir = (appState && appState.director && appState.director.name)
    ? appState.director
    : (defaultHospitalData ? defaultHospitalData.director : null);
  if (!dir || !dir.name) return;

  // Helper
  const el = id => document.getElementById(id);
  const setText = (id, val) => { const e = el(id); if (e) e.textContent = val || ''; };

  setText('home-director-name', dir.name);
  setText('home-director-sig-name', dir.name);
  setText('home-director-qual', dir.qualification || '');
  setText('home-director-exp', dir.experience ? dir.experience + ' Experience' : '');
  setText('home-director-tagline', dir.tagline || '');
  setText('home-director-bio', dir.bio || '');

  // Title span
  const titleEl = el('home-director-title');
  if (titleEl) titleEl.textContent = dir.title || '';

  // Watermark: last part of name
  const wmEl = el('home-director-watermark');
  if (wmEl) {
    const parts = (dir.name || '').replace(/^Dr\.?\s*/i,'').trim().split(' ');
    wmEl.textContent = parts[parts.length - 1] || '';
  }

  // Photo
  const photoImg = el('home-director-photo');
  const photoPH = el('home-director-photo-placeholder');
  if (photoImg) {
    if (dir.photo && dir.photo.length > 5) {
      photoImg.src = dir.photo;
      photoImg.style.display = 'block';
      if (photoPH) photoPH.style.display = 'none';
    } else {
      photoImg.style.display = 'none';
      if (photoPH) photoPH.style.display = 'flex';
    }
  }
}

function populateDirectorAdminForm() {
  const dir = (appState && appState.director) ? appState.director : (defaultHospitalData ? defaultHospitalData.director : null);
  if (!dir) return;

  const get = id => document.getElementById(id);
  if (get('admin-dir-name')) get('admin-dir-name').value = dir.name || '';
  if (get('admin-dir-title')) get('admin-dir-title').value = dir.title || '';
  if (get('admin-dir-qualification')) get('admin-dir-qualification').value = dir.qualification || '';
  if (get('admin-dir-experience')) get('admin-dir-experience').value = dir.experience || '';
  if (get('admin-dir-tagline')) get('admin-dir-tagline').value = dir.tagline || '';
  if (get('admin-dir-bio')) get('admin-dir-bio').value = dir.bio || '';
  if (get('admin-dir-journey')) get('admin-dir-journey').value = dir.journey || '';
  if (get('admin-dir-achievements')) get('admin-dir-achievements').value = Array.isArray(dir.achievements) ? dir.achievements.join('\n') : '';
  if (get('admin-dir-photo')) get('admin-dir-photo').value = dir.photo || '';
  if (get('admin-dir-linkedin')) get('admin-dir-linkedin').value = (dir.socialLinks && dir.socialLinks.linkedin) ? dir.socialLinks.linkedin : '';
  if (get('admin-dir-facebook')) get('admin-dir-facebook').value = (dir.socialLinks && dir.socialLinks.facebook) ? dir.socialLinks.facebook : '';
  if (get('admin-dir-twitter')) get('admin-dir-twitter').value = (dir.socialLinks && dir.socialLinks.twitter) ? dir.socialLinks.twitter : '';

  if (typeof updateDirPhotoPreview === 'function') updateDirPhotoPreview(dir.photo || '');
}
window.populateDirectorAdminForm = populateDirectorAdminForm;

/* ============ DIRECTOR ADMIN - PHOTO PREVIEW ============ */
window.updateDirPhotoPreview = function(url) {
  const img = document.getElementById('dir-photo-preview');
  const placeholder = document.getElementById('dir-photo-placeholder-admin');
  if (img) {
    if (url && url.length > 5) {
      img.src = url;
      img.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
    } else {
      img.style.display = 'none';
      if (placeholder) placeholder.style.display = 'flex';
    }
  }
};

/* ============ DIRECTOR ADMIN - FILE UPLOAD ============ */
window.handleDirectorPhotoUpload = function(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function(e) {
    const base64 = e.target.result;
    const urlInput = document.getElementById('admin-dir-photo');
    updateDirPhotoPreview(base64);
    if (urlInput) urlInput.value = base64;

    // Upload to Supabase
    try {
      showToast('Uploading director photo...');
      const fileName = 'director-photo-' + Date.now() + '.png';
      const uploadedUrl = await uploadImageToSupabase(fileName, base64);
      if (urlInput) urlInput.value = uploadedUrl;
      updateDirPhotoPreview(uploadedUrl);
      showToast('Director photo uploaded!');
    } catch (err) {
      console.warn('Director photo upload warning:', err);
    }
  };
  reader.readAsDataURL(file);
};

/* ============ DIRECTOR ADMIN - FORM SUBMIT ============ */
window.handleDirectorFormSubmit = async function(e) {
  if (e) e.preventDefault();

  const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

  const dirData = {
    name: get('admin-dir-name'),
    title: get('admin-dir-title'),
    qualification: get('admin-dir-qualification'),
    experience: get('admin-dir-experience'),
    tagline: get('admin-dir-tagline'),
    bio: get('admin-dir-bio'),
    journey: get('admin-dir-journey'),
    achievements: get('admin-dir-achievements').split('\n').map(s => s.trim()).filter(Boolean),
    photo: get('admin-dir-photo'),
    socialLinks: {
      linkedin: get('admin-dir-linkedin'),
      facebook: get('admin-dir-facebook'),
      twitter: get('admin-dir-twitter')
    }
  };

  if (!dirData.name) {
    alert('Please enter the Director\'s name.');
    return;
  }

  appState.director = dirData;
  saveHospitalData(appState);
  renderDirectorSection();
  renderHomeDirectorSpotlight();
  if (window.lucide) window.lucide.createIcons();

  // Save to Supabase settings
  try {
    await saveSettingToSupabase('director', dirData);
    showToast('Director Profile saved to Supabase!');
  } catch (err) {
    showToast('Director Profile saved locally.');
  }
};

/* ============ DIRECTOR ADMIN - RESET FORM ============ */
window.resetDirectorForm = function() {
  const dir = defaultHospitalData ? defaultHospitalData.director : null;
  if (dir) {
    appState.director = JSON.parse(JSON.stringify(dir));
    saveHospitalData(appState);
    populateDirectorAdminForm();
    renderDirectorSection();
    renderHomeDirectorSpotlight();
    showToast('Director form reset to defaults.');
  }
};


function initAdminPanel() {
  document.addEventListener('click', (e) => {
    const navItem = e.target.closest('.admin-nav-item');
    if (navItem) {
      const tabId = navItem.getAttribute('data-admin-tab');
      if (tabId) {
        window.switchAdminTab(tabId);
      }
    }
  });

  populateAdminForms();
  populateDirectorAdminForm();
  renderAdminDoctorsTable();
  renderAdminBlogsTable();
  if (typeof renderAdminFacilitiesTable === 'function') renderAdminFacilitiesTable();
  if (typeof renderAdminAppointmentsTable === 'function') renderAdminAppointmentsTable();

  // Attach Form Submit Handlers
  const siteForm = document.getElementById('admin-site-settings-form');
  if (siteForm) {
    siteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const brandingData = {
        name: document.getElementById('admin-input-name').value,
        topAnnouncement: document.getElementById('admin-input-announcement').value,
        emergencyPhone: document.getElementById('admin-input-emergency').value,
        opdPhone: document.getElementById('admin-input-opd').value,
        whatsapp: document.getElementById('admin-input-whatsapp').value,
        email: document.getElementById('admin-input-email').value,
        address: document.getElementById('admin-input-address').value
      };

      Object.assign(appState, brandingData);
      saveHospitalData(appState);
      renderSiteFromState();

      try {
        await saveSettingToSupabase('branding', brandingData);
        showToast('Hospital Branding & Contact Info Saved Live to Supabase!');
      } catch (err) {
        showToast('Branding updated locally.');
      }
    });
  }

  const heroForm = document.getElementById('admin-hero-settings-form');
  if (heroForm) {
    heroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const heroData = {
        badge: document.getElementById('admin-hero-badge').value,
        titleMain: document.getElementById('admin-hero-title-main').value,
        titleHighlight: document.getElementById('admin-hero-title-highlight').value,
        description: document.getElementById('admin-hero-desc').value,
        imageUrl: document.getElementById('admin-hero-img').value,
        floatingTitle: document.getElementById('admin-hero-float-title').value,
        floatingSubtitle: document.getElementById('admin-hero-float-sub').value
      };

      // Auto Upload Base64 image to Supabase Storage Bucket if needed
      if (heroData.imageUrl && heroData.imageUrl.startsWith('data:image')) {
        showToast('Uploading hero image to Supabase Storage Bucket...');
        try {
          const fileName = `hero-banner-${Date.now()}.png`;
          heroData.imageUrl = await uploadImageToSupabase(fileName, heroData.imageUrl);
          document.getElementById('admin-hero-img').value = heroData.imageUrl;
        } catch (uploadErr) {
          console.error('Upload notice:', uploadErr);
        }
      }

      appState.hero = heroData;
      saveHospitalData(appState);
      renderSiteFromState();

      try {
        await saveSettingToSupabase('hero', heroData);
        showToast('Hero Banner Settings Saved Live to Supabase!');
      } catch (err) {
        showToast('Hero Banner updated locally.');
      }
    });
  }

function populateAdminForms() {
  if (appState) {
    const docsStat = document.getElementById('admin-stat-docs');
    const deptsStat = document.getElementById('admin-stat-depts');
    const blogsStat = document.getElementById('admin-stat-blogs');

    if (docsStat) docsStat.textContent = (appState.doctors && Array.isArray(appState.doctors)) ? appState.doctors.length : 0;
    if (deptsStat) deptsStat.textContent = (appState.departments && Array.isArray(appState.departments)) ? appState.departments.length : 0;
    if (blogsStat) blogsStat.textContent = (appState.blogs && Array.isArray(appState.blogs)) ? appState.blogs.length : 0;

    const elName = document.getElementById('admin-input-name');
    const elAnnounce = document.getElementById('admin-input-announcement');
    const elEmerg = document.getElementById('admin-input-emergency');
    const elOpd = document.getElementById('admin-input-opd');
    const elWa = document.getElementById('admin-input-whatsapp');
    const elEmail = document.getElementById('admin-input-email');
    const elAddress = document.getElementById('admin-input-address');

    if (elName) elName.value = appState.name || '';
    if (elAnnounce) elAnnounce.value = appState.topAnnouncement || '';
    if (elEmerg) elEmerg.value = appState.emergencyPhone || '';
    if (elOpd) elOpd.value = appState.opdPhone || '';
    if (elWa) elWa.value = appState.whatsapp || '';
    if (elEmail) elEmail.value = appState.email || '';
    if (elAddress) elAddress.value = appState.address || '';

    if (appState.hero) {
      const hBadge = document.getElementById('admin-hero-badge');
      const hMain = document.getElementById('admin-hero-title-main');
      const hHighlight = document.getElementById('admin-hero-title-highlight');
      const hDesc = document.getElementById('admin-hero-desc');
      const hImg = document.getElementById('admin-hero-img');
      const hFloatTitle = document.getElementById('admin-hero-float-title');
      const hFloatSub = document.getElementById('admin-hero-float-sub');

      if (hBadge) hBadge.value = appState.hero.badge || '';
      if (hMain) hMain.value = appState.hero.titleMain || '';
      if (hHighlight) hHighlight.value = appState.hero.titleHighlight || '';
      if (hDesc) hDesc.value = appState.hero.description || '';
      if (hImg) {
        hImg.value = appState.hero.imageUrl || '';
        if (typeof updateHeroImgPreview === 'function') {
          updateHeroImgPreview(appState.hero.imageUrl || '');
        }
      }
      if (hFloatTitle) hFloatTitle.value = appState.hero.floatingTitle || '';
      if (hFloatSub) hFloatSub.value = appState.hero.floatingSubtitle || '';
    }
  }
}
window.populateAdminForms = populateAdminForms;

window.handleDoctorFormSubmit = function(e) {
  if (e) e.preventDefault();
  
  const nameEl = document.getElementById('admin-doc-name');
  if (!nameEl || !nameEl.value.trim()) {
    alert('Please enter Doctor Name.');
    if (nameEl) nameEl.focus();
    return;
  }

  const name = nameEl.value.trim();
  let docId = document.getElementById('admin-doc-id')?.value;
  
  let existingIndex = -1;
  if (docId && appState.doctors) {
    const cleanId = String(docId).replace(/^doc-?/, '');
    existingIndex = appState.doctors.findIndex(d => 
      String(d.id) === String(docId) || 
      String(d.id).replace(/^doc-?/, '') === cleanId
    );
  }
  if (existingIndex < 0 && appState.doctors) {
    existingIndex = appState.doctors.findIndex(d => d.name.toLowerCase().trim() === name.toLowerCase().trim());
  }

  if (existingIndex >= 0) {
    docId = appState.doctors[existingIndex].id;
  } else if (!docId) {
    docId = 'doc-' + Date.now();
  }

  const isConfirmed = confirm(`Are you sure you want to save Doctor Profile for '${name}'?`);
  if (!isConfirmed) return;

  const specialty = document.getElementById('admin-doc-specialty')?.value || 'general';
  const specialtyName = document.getElementById('admin-doc-specialty-name')?.value.trim() || specialty;
  const designation = document.getElementById('admin-doc-designation')?.value.trim() || 'Consultant Specialist';
  const degree = document.getElementById('admin-doc-degree')?.value.trim() || 'MD / MS';
  const experience = document.getElementById('admin-doc-exp')?.value.trim() || '10+ Years Exp';
  const timings = document.getElementById('admin-doc-timings')?.value.trim() || '10:00 AM - 02:00 PM';

  let rawFee = document.getElementById('admin-doc-fee')?.value.trim() || '₹500';
  const formattedFee = rawFee.startsWith('₹') ? rawFee : `₹${rawFee}`;

  let image = document.getElementById('admin-doc-image')?.value.trim().replace(/[\r\n]+/g, '') || '';
  const previewImg = document.getElementById('doc-img-preview');
  if (!image && previewImg && previewImg.style.display !== 'none' && previewImg.src) {
    image = previewImg.src.replace(/[\r\n]+/g, '');
  }

  image = image || '';

  if (image && image.length > 5) {
    const cleanId = String(docId).replace(/^doc-?/, '');
    const cleanNameKey = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    try {
      localStorage.setItem('doc_photo_' + docId, image);
      localStorage.setItem('doc_photo_doc-' + cleanId, image);
      localStorage.setItem('doc_photo_' + cleanId, image);
      localStorage.setItem('doc_photo_name_' + cleanNameKey, image);
    } catch (err) {
      console.warn('Photo cache write notice:', err);
    }
  }

  const newDoctor = { id: docId, name, specialty, specialtyName, designation, degree, experience, timings, fee: formattedFee, image };

  if (!appState.doctors) appState.doctors = [];
  if (existingIndex >= 0) {
    appState.doctors[existingIndex] = newDoctor;
  } else {
    appState.doctors.push(newDoctor);
  }

  saveHospitalData(appState);
  renderDoctors();
  renderAdminDoctorsTable();
  
  if (typeof closeDoctorEditorModal === 'function') closeDoctorEditorModal();
  showToast(`⚡ Doctor '${name}' profile saved live!`);

  setTimeout(() => {
    saveDoctorToSupabase(newDoctor).catch(err => console.warn('Supabase DB save notice:', err));
  }, 10);

  clearDoctorForm();
};

window.saveDoctorProfile = window.handleDoctorFormSubmit;
window.submitDoctorProfile = window.handleDoctorFormSubmit;

  const deptForm = document.getElementById('admin-dept-form');
  if (deptForm) {
    deptForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('admin-dept-id').value.trim().toLowerCase();
      const name = document.getElementById('admin-dept-name').value.trim();
      const icon = document.getElementById('admin-dept-icon').value.trim();
      const head = document.getElementById('admin-dept-head').value.trim();
      const shortDesc = document.getElementById('admin-dept-shortdesc').value.trim();
      const fullDescription = document.getElementById('admin-dept-fulldesc').value.trim();
      const proceduresStr = document.getElementById('admin-dept-procedures').value;
      const procedures = proceduresStr.split('\n').map(p => p.trim()).filter(Boolean);

      const deptData = {
        id,
        name,
        icon,
        head,
        shortDesc,
        fullDescription,
        procedures,
        equipment: []
      };

      const originalId = document.getElementById('admin-dept-original-id').value;
      const isEdit = document.getElementById('admin-dept-edit-mode').value === 'true';

      // Handle ID Change (Delete old row, insert new row, update referencing doctors)
      if (isEdit && originalId && originalId !== id) {
        showToast('Updating department ID & cascading doctor records...');
        try {
          if (isLocal) {
            await fetch(`/api/departments/${originalId}`, { method: 'DELETE' });
          } else {
            await fetch(`${SUPABASE_STORAGE_URL}/rest/v1/departments?id=eq.${originalId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${SUPABASE_STORAGE_KEY}`,
                'apiKey': SUPABASE_STORAGE_KEY
              }
            });
          }
          // Remove old from appState
          appState.departments = appState.departments.filter(d => d.id !== originalId);
        } catch (delOldErr) {
          console.error('Error removing old department ID:', delOldErr);
        }

        // Update referencing doctors locally and in DB
        appState.doctors = appState.doctors.map(doc => {
          if (doc.specialty === originalId) {
            doc.specialty = id;
            doc.specialtyName = name;
            
            // Save updated doctor in background
            const docData = { ...doc };
            (async () => {
              try {
                if (isLocal) {
                  await fetch('/api/doctors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(docData)
                  });
                } else {
                  await fetch(`${SUPABASE_STORAGE_URL}/rest/v1/doctors`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${SUPABASE_STORAGE_KEY}`,
                      'apiKey': SUPABASE_STORAGE_KEY,
                      'Content-Type': 'application/json',
                      'Prefer': 'resolution=merge-duplicates'
                    },
                    body: JSON.stringify({
                      id: docData.id,
                      name: docData.name,
                      specialty: docData.specialty,
                      specialty_name: docData.specialtyName,
                      designation: docData.designation,
                      degree: docData.degree,
                      experience: docData.experience,
                      timings: docData.timings,
                      fee: docData.fee,
                      image: docData.image
                    })
                  });
                }
              } catch (docLinkErr) {
                console.error('Failed to update doctor link in DB:', docLinkErr);
              }
            })();
          }
          return doc;
        });
        saveHospitalData(appState);
      }

      try {
        const payload = {
          id,
          name,
          icon: icon || 'activity',
          short_desc: shortDesc,
          full_description: fullDescription,
          key_treatments: procedures.join('\n')
        };
        const supaRes = await fetch(`${SUPABASE_STORAGE_URL}/rest/v1/departments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_STORAGE_KEY}`,
            'apiKey': SUPABASE_STORAGE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(payload)
        });
        if (isLocal) {
          try {
            await fetch('/api/departments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(deptData)
            });
          } catch(e){}
        }
        showToast('⚡ Specialty Department Saved Live to Database!');
      } catch (err) {
        console.warn('DB save notice:', err);
      }

      if (!appState.departments) appState.departments = [];
      const idx = appState.departments.findIndex(d => d.id === id);
      if (idx >= 0) appState.departments[idx] = deptData;
      else appState.departments.push(deptData);

      saveHospitalData(appState);
      saveSettingToSupabase('departments', appState.departments);
      clearDeptForm();
      populateDepartmentDropdowns();
      renderAdminDepartmentsTable();
      renderSiteFromState();
    });
  }

  const blogForm = document.getElementById('admin-blog-form');
  if (blogForm) {
    blogForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const blogId = document.getElementById('admin-blog-id').value || ('blog-' + Date.now());
      const title = document.getElementById('admin-blog-title').value;
      const category = document.getElementById('admin-blog-cat').value;
      const excerpt = document.getElementById('admin-blog-excerpt').value;
      const content = document.getElementById('admin-blog-content')?.value || excerpt;
      const image = document.getElementById('admin-blog-image').value || '/Screenshot 2026-08-11 164052.png';
      const customDate = document.getElementById('admin-blog-date')?.value;
      const date = customDate || new Date().toISOString().split('T')[0];

      const newBlog = { id: blogId, title, category, excerpt, content, date, image };

      try {
        if (newBlog.image && newBlog.image.startsWith('data:image/')) {
          const fileName = `blog-${newBlog.id}-${Date.now()}.png`;
          newBlog.image = await uploadImageToSupabase(fileName, newBlog.image);
        }

        if (isLocal) {
          await fetch('/api/blogs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBlog)
          });
        } else {
          const blogPayload = {
            id: newBlog.id,
            title: newBlog.title,
            category: newBlog.category,
            author: 'Life Line Medical Editorial',
            date_str: newBlog.date,
            read_time: '6 min read',
            excerpt: newBlog.excerpt,
            content: newBlog.content,
            image: newBlog.image || ''
          };
          await fetch(`${SUPABASE_STORAGE_URL}/rest/v1/blogs`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'apiKey': SUPABASE_ANON_KEY,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(blogPayload)
          });
        }
        showToast('Health Blog Published Live to Supabase Database!');
        await syncFromSupabase();
      } catch (err) {
        const existingIndex = appState.blogs.findIndex(b => b.id === blogId);
        if (existingIndex >= 0) appState.blogs[existingIndex] = newBlog;
        else appState.blogs.unshift(newBlog);
        saveHospitalData(appState);
        renderBlogs();
        renderAdminBlogsTable();
      }

      clearBlogForm();
    });
  }
}

function populateAdminForms() {
  const nameInput = document.getElementById('admin-input-name');
  const annInput = document.getElementById('admin-input-announcement');
  const emInput = document.getElementById('admin-input-emergency');
  const opdInput = document.getElementById('admin-input-opd');
  const waInput = document.getElementById('admin-input-whatsapp');
  const emailInput = document.getElementById('admin-input-email');
  const addrInput = document.getElementById('admin-input-address');

  if (nameInput) nameInput.value = appState.name || '';
  if (annInput) annInput.value = appState.topAnnouncement || '';
  if (emInput) emInput.value = appState.emergencyPhone || '';
  if (opdInput) opdInput.value = appState.opdPhone || '';
  if (waInput) waInput.value = appState.whatsapp || '';
  if (emailInput) emailInput.value = appState.email || '';
  if (addrInput) addrInput.value = appState.address || '';

  if (appState.hero) {
    const badgeIn = document.getElementById('admin-hero-badge');
    const titleMainIn = document.getElementById('admin-hero-title-main');
    const titleHighIn = document.getElementById('admin-hero-title-highlight');
    const descIn = document.getElementById('admin-hero-desc');
    const imgIn = document.getElementById('admin-hero-img');
    const floatTitleIn = document.getElementById('admin-hero-float-title');
    const floatSubIn = document.getElementById('admin-hero-float-sub');

    if (badgeIn) badgeIn.value = appState.hero.badge || '';
    if (titleMainIn) titleMainIn.value = appState.hero.titleMain || '';
    if (titleHighIn) titleHighIn.value = appState.hero.titleHighlight || '';
    if (descIn) descIn.value = appState.hero.description || '';
    if (imgIn) {
      const currentUrl = (appState.hero.imageUrl && appState.hero.imageUrl.startsWith('http'))
        ? appState.hero.imageUrl : defaultHospitalData.hero.imageUrl;
      imgIn.value = currentUrl;
      updateHeroImgPreview(currentUrl);
    }
    if (floatTitleIn) floatTitleIn.value = appState.hero.floatingTitle || '';
    if (floatSubIn) floatSubIn.value = appState.hero.floatingSubtitle || '';

    // Overview Image
    const overviewImgIn = document.getElementById('admin-overview-img');
    if (overviewImgIn) {
      overviewImgIn.value = appState.settings && appState.settings.overview_image_url ? appState.settings.overview_image_url : '';
      updateOverviewImgPreview(overviewImgIn.value);
    }
  }

  // Update Summary Stats
  const statDocs = document.getElementById('admin-stat-docs');
  const statDepts = document.getElementById('admin-stat-depts');
  const statBlogs = document.getElementById('admin-stat-blogs');

  if (statDocs) statDocs.textContent = appState.doctors.length;
  if (statDepts) statDepts.textContent = appState.departments.length;
  if (statBlogs) statBlogs.textContent = appState.blogs ? appState.blogs.length : 0;

  renderAdminDoctorsTable();
  renderAdminBlogsTable();
  renderAdminFacilitiesTable();
}

/* ============================================
   IMAGE UPLOAD + PREVIEW HELPERS
   ============================================ */

/**
 * Update the hero image preview box from a URL or base64 string.
 * Called by oninput on the URL text field.
 */
function updateHeroImgPreview(src) {
  const preview   = document.getElementById('hero-img-preview');
  const wrap      = document.getElementById('hero-img-preview-wrap');
  const placeholder = document.getElementById('hero-img-preview-placeholder');
  const badge     = document.getElementById('hero-preview-badge');
  const clearBtn  = document.getElementById('hero-img-clear-btn');
  if (!preview || !placeholder) return;

  if (src && src.length > 8) {
    preview.src = src;
    preview.style.display = 'block';
    placeholder.style.display = 'none';

    preview.onload = () => {
      if (badge)   { badge.style.display = 'block'; }
      if (clearBtn){ clearBtn.style.display = 'block'; }
      if (wrap)    {
        wrap.style.borderColor = 'rgba(2,128,144,0.5)';
        wrap.style.borderStyle = 'solid';
        wrap.style.boxShadow = '0 8px 32px rgba(2,128,144,0.18)';
      }
    };
    preview.onerror = () => {
      preview.style.display = 'none';
      placeholder.style.display = 'flex';
      placeholder.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" opacity="0.7">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span style="font-size:0.85rem;font-weight:600;color:#ef4444;">Cannot load image</span>
        <span style="font-size:0.75rem;color:#94a3b8;">Check the URL and try again</span>`;
      if (badge)   badge.style.display = 'none';
      if (clearBtn)clearBtn.style.display = 'none';
      if (wrap)    { wrap.style.borderColor = 'rgba(239,68,68,0.4)'; wrap.style.borderStyle = 'dashed'; }
    };
  } else {
    preview.style.display = 'none';
    placeholder.style.display = 'flex';
    if (badge)   badge.style.display = 'none';
    if (clearBtn)clearBtn.style.display = 'none';
    if (wrap)    { wrap.style.borderColor = 'rgba(2,128,144,0.3)'; wrap.style.borderStyle = 'dashed'; wrap.style.boxShadow = '0 4px 20px rgba(2,128,144,0.08)'; }
  }
}

function clearHeroImgPreview() {
  const urlInput = document.getElementById('admin-hero-img');
  const fileInput = document.getElementById('admin-hero-img-file');
  if (urlInput)  urlInput.value = '';
  if (fileInput) fileInput.value = '';
  updateHeroImgPreview('');
  // Reset placeholder text
  const placeholder = document.getElementById('hero-img-preview-placeholder');
  if (placeholder) {
    placeholder.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <span style="font-size:0.9rem;font-weight:500;">Image preview will appear here</span>
      <span style="font-size:0.78rem;opacity:0.7;">Upload a file or paste a URL below</span>`;
  }
}

window.clearHeroImgPreview = clearHeroImgPreview;


/**
 * Handle device file upload with interactive Cropper & Resizer modal.
 */
async function handleHeroImageUpload(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    updateHeroImgPreview('loading');
    showToast('Processing & uploading hero photo...');

    try {
      const base64Preview = await compressAndResizeImage(file, 1600, 1200);
      updateHeroImgPreview(base64Preview);
      const urlInput = document.getElementById('admin-hero-img');
      if (urlInput) urlInput.value = base64Preview;

      const publicUrl = await uploadFileDirectToSupabaseBucket(file, 1600, 1200);
      if (urlInput) urlInput.value = publicUrl;
      updateHeroImgPreview(publicUrl);
      showToast('⚡ Hero photo uploaded to Supabase Bucket!');
    } catch (err) {
      console.error('Hero upload error:', err);
      showToast('Hero photo ready locally. Save to apply.');
    }
  }
}

async function handleOverviewImageUpload(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    showToast('Processing overview photo...');
    try {
      const base64Preview = await compressAndResizeImage(file, 1600, 900);
      const urlInput = document.getElementById('admin-overview-img');
      if (urlInput) {
        urlInput.value = base64Preview;
        updateOverviewImgPreview(base64Preview);
      }
      try {
        const publicUrl = await uploadFileDirectToSupabaseBucket(file, 1600, 900);
        if (urlInput) {
          urlInput.value = publicUrl;
          updateOverviewImgPreview(publicUrl);
        }
        showToast('⚡ Overview photo uploaded to Supabase Bucket!');
      } catch (uploadErr) {
        console.error('Overview upload failed, using local version:', uploadErr);
        showToast('Photo saved locally.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading image.');
    }
  }
}

function updateOverviewImgPreview(src) {
  const preview  = document.getElementById('overview-img-preview');
  const wrap     = document.getElementById('overview-img-preview-wrap');
  const pholder  = document.getElementById('overview-img-preview-placeholder');
  const clearBtn = document.getElementById('overview-img-clear-btn');
  const overviewDisplay = document.getElementById('overview-img-display');
  const overviewWrap = document.getElementById('overview-image-wrap');

  if (!preview) return;

  if (src && src.length > 8) {
    preview.src = src;
    preview.style.display = 'block';
    if (pholder) pholder.style.display = 'none';
    if (clearBtn) clearBtn.style.display = 'block';
    if (overviewWrap) overviewWrap.style.display = 'block';
    if (overviewDisplay) overviewDisplay.src = src;
  } else {
    preview.src = '';
    preview.style.display = 'none';
    if (pholder) pholder.style.display = 'flex';
    if (clearBtn) clearBtn.style.display = 'none';
    if (overviewWrap) overviewWrap.style.display = 'none';
    if (overviewDisplay) overviewDisplay.src = '';
  }
}

function clearOverviewImgPreview() {
  const urlInput  = document.getElementById('admin-overview-img');
  const fileInput = document.getElementById('admin-overview-img-file');
  if (urlInput)  urlInput.value = '';
  if (fileInput) fileInput.value = '';
  updateOverviewImgPreview('');
}

window.updateOverviewImgPreview  = updateOverviewImgPreview;
window.handleOverviewImageUpload = handleOverviewImageUpload;
window.clearOverviewImgPreview   = clearOverviewImgPreview;

window.updateHeroImgPreview = updateHeroImgPreview;
window.handleHeroImageUpload = handleHeroImageUpload;

/* ---- DOCTOR IMAGE UPLOAD + PREVIEW ---- */

function updateDocImgPreview(src) {
  const preview  = document.getElementById('doc-img-preview');
  const wrap     = document.getElementById('doc-img-preview-wrap');
  const pholder  = document.getElementById('doc-img-placeholder');
  const clearBtn = document.getElementById('doc-img-clear-btn');
  if (!preview) return;

  if (src && src.length > 8) {
    preview.src = src;
    preview.style.display = 'block';
    if (pholder) pholder.style.display = 'none';
    if (clearBtn) clearBtn.style.display = 'block';
    if (wrap) { wrap.style.borderColor = 'rgba(2,128,144,0.5)'; wrap.style.borderStyle = 'solid'; wrap.style.boxShadow = '0 6px 24px rgba(2,128,144,0.2)'; }
  } else {
    preview.src = '';
    preview.style.display = 'none';
    if (pholder) {
      pholder.style.display = 'flex';
      pholder.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span style="font-size:0.75rem;">Photo Preview</span>`;
    }
    if (clearBtn) clearBtn.style.display = 'none';
    if (wrap) { wrap.style.borderColor = 'rgba(2,128,144,0.3)'; wrap.style.borderStyle = 'dashed'; wrap.style.boxShadow = '0 4px 20px rgba(2,128,144,0.08)'; }
  }
}

function clearDocImgPreview() {
  const urlInput  = document.getElementById('admin-doc-image');
  const fileInput = document.getElementById('admin-doc-img-file');
  if (urlInput)  urlInput.value = '';
  if (fileInput) fileInput.value = '';
  updateDocImgPreview('');
}

window.updateDocImgPreview  = updateDocImgPreview;
window.clearDocImgPreview   = clearDocImgPreview;

function clearDoctorForm() {
  // Reset all text inputs
  ['admin-doc-name','admin-doc-designation','admin-doc-specialty-name',
   'admin-doc-degree','admin-doc-exp','admin-doc-timings','admin-doc-fee',
   'admin-doc-image'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  // Reset specialty dropdown to first option
  const specialty = document.getElementById('admin-doc-specialty');
  if (specialty) specialty.selectedIndex = 0;

  // Clear hidden ID (exit edit mode → becomes Add mode)
  const hiddenId = document.getElementById('admin-doc-id');
  if (hiddenId) hiddenId.value = '';

  // Reset file input
  const fileInput = document.getElementById('admin-doc-img-file');
  if (fileInput) fileInput.value = '';

  // Reset photo preview
  clearDocImgPreview();
}
window.clearDoctorForm = clearDoctorForm;

/* ---- BLOG IMAGE UPLOAD + PREVIEW ---- */

function updateBlogImgPreview(src) {
  const preview  = document.getElementById('blog-img-preview');
  const wrap     = document.getElementById('blog-img-preview-wrap');
  const pholder  = document.getElementById('blog-img-placeholder');
  const badge    = document.getElementById('blog-preview-badge');
  const clearBtn = document.getElementById('blog-img-clear-btn');
  if (!preview) return;

  if (src && src.length > 8) {
    preview.src = src;
    preview.style.display = 'block';
    if (pholder) pholder.style.display = 'none';

    preview.onload = () => {
      if (badge)    badge.style.display = 'block';
      if (clearBtn) clearBtn.style.display = 'block';
      if (wrap)     { wrap.style.borderColor = 'rgba(2,128,144,0.5)'; wrap.style.borderStyle = 'solid'; wrap.style.boxShadow = '0 6px 24px rgba(2,128,144,0.2)'; }
    };
    preview.onerror = () => {
      preview.style.display = 'none';
      if (pholder) { pholder.style.display = 'flex'; pholder.innerHTML = '<span style="font-size:0.8rem;color:#ef4444;">⚠️ Cannot load image</span>'; }
      if (badge)    badge.style.display = 'none';
      if (clearBtn) clearBtn.style.display = 'none';
      if (wrap)     { wrap.style.borderColor = 'rgba(239,68,68,0.4)'; wrap.style.borderStyle = 'dashed'; }
    };
  } else {
    preview.style.display = 'none';
    if (pholder) {
      pholder.style.display = 'flex';
      pholder.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span style="font-size:0.85rem;font-weight:500;">Article cover image preview</span>`;
    }
    if (badge)    badge.style.display = 'none';
    if (clearBtn) clearBtn.style.display = 'none';
    if (wrap)     { wrap.style.borderColor = 'rgba(2,128,144,0.3)'; wrap.style.borderStyle = 'dashed'; wrap.style.boxShadow = '0 4px 20px rgba(2,128,144,0.08)'; }
  }
}

function handleBlogImageUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  openCropperModal(file, (croppedUrl) => {
    const urlInput = document.getElementById('admin-blog-image');
    if (urlInput) {
      urlInput.value = croppedUrl;
      updateBlogImgPreview(croppedUrl);
    }
  }, 16 / 9);
}



/* ================= CROPPING & RESIZING ENGINE ================= */
let activeCropCallback = null;
let activeTargetRatio = 16 / 9;

window.openCropperModal = function(file, onComplete, initialRatio = 16 / 9) {
  if (!file) return;
  activeCropCallback = onComplete;
  activeTargetRatio = initialRatio;

  const reader = new FileReader();
  reader.onload = function(e) {
    const cropperImg = document.getElementById('cropper-modal-img');
    const cropperModal = document.getElementById('cropper-modal');
    if (!cropperImg || !cropperModal) return;

    cropperImg.src = e.target.result;
    cropperModal.style.display = 'flex';

    if (window.currentCropper) {
      window.currentCropper.destroy();
    }

    setTimeout(() => {
      window.currentCropper = new Cropper(cropperImg, {
        aspectRatio: initialRatio,
        viewMode: 1,
        background: true,
        autoCropArea: 0.9,
        responsive: true
      });
    }, 120);
  };
  reader.readAsDataURL(file);
};

window.closeCropperModal = function() {
  const cropperModal = document.getElementById('cropper-modal');
  if (cropperModal) cropperModal.style.display = 'none';
  if (window.currentCropper) {
    window.currentCropper.destroy();
    window.currentCropper = null;
  }
  activeCropCallback = null;
};

window.setCropRatio = function(ratio, btn) {
  if (window.currentCropper) {
    window.currentCropper.setAspectRatio(ratio);
  }
  document.querySelectorAll('.cropper-ratio-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
};

window.cropperRotate = function(degree) {
  if (window.currentCropper) {
    window.currentCropper.rotate(degree);
  }
};

window.cropperZoom = function(delta) {
  if (window.currentCropper) {
    window.currentCropper.zoom(delta);
  }
};

window.applyCroppedImage = async function() {
  if (!window.currentCropper) return;
  const applyBtn = document.getElementById('cropper-apply-btn');
  if (applyBtn) {
    applyBtn.disabled = true;
    applyBtn.textContent = '⏳ Processing & Uploading...';
  }

  try {
    const canvas = window.currentCropper.getCroppedCanvas({
      maxWidth: 1600,
      maxHeight: 1200,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    });

    const dataUrl = canvas.toDataURL('image/webp', 0.88);

    canvas.toBlob(async (blob) => {
      let finalUrl = dataUrl;

      try {
        const fileExt = 'webp';
        const fileName = `cropped_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const uploadUrl = `${SUPABASE_URL}/storage/v1/object/hospital-assets/${fileName}`;

        const uploadRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apiKey': SUPABASE_ANON_KEY,
            'Content-Type': 'image/webp'
          },
          body: blob
        });

        if (uploadRes.ok) {
          finalUrl = `${SUPABASE_STORAGE_URL}/object/public/hospital-assets/${fileName}`;
          console.log('Successfully uploaded cropped image to Supabase:', finalUrl);
        }
      } catch (err) {
        console.warn('Supabase upload warning, using local dataUrl:', err);
      }

      if (typeof activeCropCallback === 'function') {
        activeCropCallback(finalUrl);
      }

      closeCropperModal();
      if (applyBtn) {
        applyBtn.disabled = false;
        applyBtn.textContent = '✂️ Crop, Save & Upload';
      }
    }, 'image/webp', 0.88);

  } catch (err) {
    console.error('Error cropping image:', err);
    if (applyBtn) {
      applyBtn.disabled = false;
      applyBtn.textContent = '✂️ Crop, Save & Upload';
    }
  }
};

function clearBlogImgPreview() {
  const urlInput  = document.getElementById('admin-blog-image');
  const fileInput = document.getElementById('admin-blog-img-file');
  if (urlInput)  urlInput.value = '';
  if (fileInput) fileInput.value = '';
  updateBlogImgPreview('');
}

function clearBlogForm() {
  ['admin-blog-title','admin-blog-cat','admin-blog-date','admin-blog-image','admin-blog-excerpt','admin-blog-content','admin-blog-id'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const fileInput = document.getElementById('admin-blog-img-file');
  if (fileInput) fileInput.value = '';
  clearBlogImgPreview();
}

window.updateBlogImgPreview  = updateBlogImgPreview;
window.handleBlogImageUpload = handleBlogImageUpload;
window.clearBlogImgPreview   = clearBlogImgPreview;
window.clearBlogForm          = clearBlogForm;

function renderAdminDoctorsTable() {
  if (typeof renderAdminDoctorsGrid === 'function') {
    renderAdminDoctorsGrid();
  }
}

function renderAdminBlogsTable() {
  const tbody = document.getElementById('admin-blogs-table-body');
  if (!tbody || !appState.blogs) return;

  tbody.innerHTML = appState.blogs.map(b => `
    <tr>
      <td><strong>${b.title}</strong></td>
      <td><span class="blog-cat-badge" style="position: static;">${b.category}</span></td>
      <td>${b.date}</td>
      <td>
        <button class="admin-btn admin-btn-primary" onclick="editBlogInAdmin('${b.id}')">Edit</button>
        <button class="admin-btn admin-btn-danger" onclick="deleteBlogInAdmin('${b.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

/* ---- FACILITIES MANAGEMENT (ADMIN) ---- */

function updateFacImgPreview(src) {
  const preview  = document.getElementById('fac-img-preview');
  const wrap     = document.getElementById('fac-img-preview-wrap');
  const pholder  = document.getElementById('fac-img-placeholder');
  const clearBtn = document.getElementById('fac-img-clear-btn');
  if (!preview) return;

  if (src && src.length > 8) {
    preview.src = src;
    preview.style.display = 'block';
    if (pholder) pholder.style.display = 'none';
    if (clearBtn) clearBtn.style.display = 'block';
    if (wrap) { wrap.style.borderColor = 'rgba(2,128,144,0.5)'; wrap.style.borderStyle = 'solid'; }
  } else {
    preview.src = '';
    preview.style.display = 'none';
    if (pholder) pholder.style.display = 'flex';
    if (clearBtn) clearBtn.style.display = 'none';
    if (wrap) { wrap.style.borderColor = 'rgba(2,128,144,0.3)'; wrap.style.borderStyle = 'dashed'; }
  }
}

function clearFacImgPreview() {
  const urlInput  = document.getElementById('admin-fac-image');
  const fileInput = document.getElementById('admin-fac-img-file');
  if (urlInput)  urlInput.value = '';
  if (fileInput) fileInput.value = '';
  updateFacImgPreview('');
}

async function handleFacilityImageUpload(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    showToast('Processing facility photo...');
    try {
      const base64Preview = await compressAndResizeImage(file, 1200, 800);
      const urlInput = document.getElementById('admin-fac-image');
      if (urlInput) {
        urlInput.value = base64Preview;
        updateFacImgPreview(base64Preview);
      }
      try {
        const publicUrl = await uploadFileDirectToSupabaseBucket(file, 1200, 800);
        if (urlInput) {
          urlInput.value = publicUrl;
          updateFacImgPreview(publicUrl);
        }
        showToast('⚡ Facility photo uploaded to Supabase Bucket!');
      } catch (uploadErr) {
        console.error('Facility upload failed, using local version:', uploadErr);
        showToast('Photo saved locally.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading image.');
    }
  }
}

window.updateFacImgPreview      = updateFacImgPreview;
window.clearFacImgPreview       = clearFacImgPreview;
window.handleFacilityImageUpload= handleFacilityImageUpload;

function renderAdminFacilitiesTable() {
  const tbody = document.getElementById('admin-facilities-table-body');
  const facilitiesList = (appState.facilities && appState.facilities.length > 0) ? appState.facilities : defaultHospitalData.facilities;
  if (!tbody || !facilitiesList) return;

  tbody.innerHTML = facilitiesList.map(fac => {
    const hasPhoto = fac.image && fac.image.trim().length > 10;
    const statusHtml = hasPhoto ? `
      <span style="background: #e0f2fe; color: #028090; padding: 4px 10px; border-radius: 8px; font-weight: 700; font-size: 0.78rem;">
        📸 Custom Photo Active
      </span>
    ` : `
      <span style="background: #f1f5f9; color: #64748b; padding: 4px 10px; border-radius: 8px; font-weight: 600; font-size: 0.78rem;">
        ⚡ Clean Icon Layout
      </span>
    `;

    return `
      <tr>
        <td><strong>${fac.title}</strong></td>
        <td><span style="background: #f0f9ff; color: #028090; padding: 4px 10px; border-radius: 99px; font-size: 0.78rem; font-weight: 700;">${fac.category}</span></td>
        <td><code>${fac.icon || 'activity'}</code></td>
        <td>${statusHtml}</td>
        <td>
          <button class="admin-btn admin-btn-primary" onclick="editFacilityInAdmin('${fac.id}')">Edit / Photo</button>
          <button class="admin-btn admin-btn-danger" onclick="deleteFacilityInAdmin('${fac.id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

window.renderAdminFacilitiesTable = renderAdminFacilitiesTable;

window.clearFacilityForm = function() {
  ['admin-fac-id', 'admin-fac-title', 'admin-fac-category', 'admin-fac-desc', 'admin-fac-f1', 'admin-fac-f2', 'admin-fac-f3', 'admin-fac-image'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const iconEl = document.getElementById('admin-fac-icon');
  if (iconEl) iconEl.selectedIndex = 0;

  const titleEl = document.getElementById('admin-fac-form-title');
  if (titleEl) titleEl.textContent = 'Add New Hospital Facility';

  clearFacImgPreview();
};

window.editFacilityInAdmin = function(facId) {
  const facilitiesList = (appState.facilities && appState.facilities.length > 0) ? appState.facilities : defaultHospitalData.facilities;
  let fac = facilitiesList.find(f => f.id === facId);
  if (!fac) {
    // Fallback search by title
    fac = facilitiesList.find(f => f.title === facId || f.id === `fac-${facId}`);
  }
  if (!fac) return;

  const titleEl = document.getElementById('admin-fac-form-title');
  if (titleEl) titleEl.textContent = `Edit Facility: ${fac.title}`;

  const idIn = document.getElementById('admin-fac-id');
  const titleIn = document.getElementById('admin-fac-title');
  const catIn = document.getElementById('admin-fac-category');
  const iconIn = document.getElementById('admin-fac-icon');
  const descIn = document.getElementById('admin-fac-desc');
  const f1In = document.getElementById('admin-fac-f1');
  const f2In = document.getElementById('admin-fac-f2');
  const f3In = document.getElementById('admin-fac-f3');
  const imgIn = document.getElementById('admin-fac-image');

  if (idIn) idIn.value = fac.id || `fac-${Date.now()}`;
  if (titleIn) titleIn.value = fac.title || '';
  if (catIn) catIn.value = fac.category || '';
  if (iconIn) iconIn.value = fac.icon || 'activity';
  if (descIn) descIn.value = fac.desc || '';

  const feats = fac.features || [];
  if (f1In) f1In.value = feats[0] || '';
  if (f2In) f2In.value = feats[1] || '';
  if (f3In) f3In.value = feats[2] || '';

  if (imgIn) {
    imgIn.value = fac.image || '';
    updateFacImgPreview(fac.image);
  }

  const formWrap = document.getElementById('admin-facility-form');
  if (formWrap) {
    formWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    formWrap.style.transition = 'box-shadow 0.3s ease';
    formWrap.style.boxShadow = '0 0 0 3px rgba(2,128,144,0.3)';
    setTimeout(() => { formWrap.style.boxShadow = 'none'; }, 1500);
  }
};

window.deleteFacilityInAdmin = function(facId) {
  if (!confirm('Are you sure you want to remove this facility?')) return;
  if (!appState.facilities) appState.facilities = [...defaultHospitalData.facilities];
  appState.facilities = appState.facilities.filter(f => f.id !== facId);
  saveHospitalData(appState);
  renderFacilities();
  renderAdminFacilitiesTable();
  showToast('Facility deleted successfully');
};

window.handleFacilityFormSubmit = function(e) {
  e.preventDefault();
  const id = document.getElementById('admin-fac-id').value || `fac-${Date.now()}`;
  const title = document.getElementById('admin-fac-title').value.trim();
  const category = document.getElementById('admin-fac-category').value.trim();
  const icon = document.getElementById('admin-fac-icon').value;
  const desc = document.getElementById('admin-fac-desc').value.trim();
  const f1 = document.getElementById('admin-fac-f1').value.trim();
  const f2 = document.getElementById('admin-fac-f2').value.trim();
  const f3 = document.getElementById('admin-fac-f3').value.trim();
  const image = document.getElementById('admin-fac-image').value.trim();

  const features = [f1, f2, f3].filter(Boolean);

  const newFac = { id, title, category, icon, desc, image, features };

  if (!appState.facilities) appState.facilities = [...defaultHospitalData.facilities];

  const idx = appState.facilities.findIndex(f => f.id === id);
  if (idx >= 0) appState.facilities[idx] = newFac;
  else appState.facilities.push(newFac);

  saveHospitalData(appState);
  renderFacilities();
  renderAdminFacilitiesTable();
  clearFacilityForm();
  showToast('Facility saved successfully!');
};

/* ---- MEDIA & GALLERY MANAGEMENT (ADMIN) ---- */

function updateGalImgPreview(url) {
  const preview = document.getElementById('gal-img-preview');
  const pholder = document.getElementById('gal-img-placeholder');
  const clearBtn = document.getElementById('gal-img-clear-btn');
  const wrap = document.getElementById('gal-img-preview-wrap');
  if (!preview) return;

  const isValid = url && (url.startsWith('http') || url.startsWith('data:image') || url.startsWith('/'));
  if (isValid) {
    preview.src = url;
    preview.style.display = 'block';
    if (pholder) pholder.style.display = 'none';
    if (clearBtn) clearBtn.style.display = 'block';
    if (wrap) { wrap.style.borderColor = 'rgba(2,128,144,0.5)'; wrap.style.borderStyle = 'solid'; }
  } else {
    preview.src = '';
    preview.style.display = 'none';
    if (pholder) pholder.style.display = 'flex';
    if (clearBtn) clearBtn.style.display = 'none';
    if (wrap) { wrap.style.borderColor = 'rgba(2,128,144,0.3)'; wrap.style.borderStyle = 'dashed'; }
  }
}

function clearGalImgPreview() {
  const urlInput = document.getElementById('admin-gal-image');
  const fileInput = document.getElementById('admin-gal-img-file');
  if (urlInput) urlInput.value = '';
  if (fileInput) fileInput.value = '';
  updateGalImgPreview('');
}

async function handleGalleryImageUpload(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    showToast('Processing gallery photo...');
    try {
      const base64Preview = await compressAndResizeImage(file, 1600, 1200);
      const urlInput = document.getElementById('admin-gal-image');
      if (urlInput) {
        urlInput.value = base64Preview;
        updateGalImgPreview(base64Preview);
      }
      try {
        const publicUrl = await uploadFileDirectToSupabaseBucket(file, 1600, 1200);
        if (urlInput) {
          urlInput.value = publicUrl;
          updateGalImgPreview(publicUrl);
        }
        showToast('⚡ Gallery photo uploaded to Supabase Bucket!');
      } catch (uploadErr) {
        console.error('Gallery upload failed, using local version:', uploadErr);
        showToast('Photo saved locally.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading image.');
    }
  }
}

window.updateGalImgPreview = updateGalImgPreview;
window.clearGalImgPreview = clearGalImgPreview;
window.handleGalleryImageUpload = handleGalleryImageUpload;

function renderAdminGalleryTable() {
  const tbody = document.getElementById('admin-gallery-table-body');
  const galleryList = (appState.gallery && appState.gallery.length > 0) ? appState.gallery : (defaultHospitalData.gallery || []);
  if (!tbody || !galleryList) return;

  if (galleryList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: #64748b; padding: 24px;">No gallery photos added yet. Upload your first photo using the form above!</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = galleryList.map(item => {
    const validImg = getGalleryImage(item);
    return `
      <tr>
        <td>
          <img src="${validImg}" alt="${item.title}" style="width: 70px; height: 45px; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1;">
        </td>
        <td><strong>${item.title}</strong></td>
        <td><span style="background: #e0f2fe; color: #028090; padding: 4px 10px; border-radius: 99px; font-size: 0.78rem; font-weight: 700;">${item.category}</span></td>
        <td style="font-size: 0.85rem; color: #64748b;">${item.caption || 'N/A'}</td>
        <td>
          <button class="admin-btn admin-btn-primary" onclick="editGalleryInAdmin('${item.id}')">Edit / Crop</button>
          <button class="admin-btn admin-btn-danger" onclick="deleteGalleryInAdmin('${item.id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

window.renderAdminGalleryTable = renderAdminGalleryTable;

window.clearGalleryForm = function() {
  ['admin-gal-id', 'admin-gal-title', 'admin-gal-caption', 'admin-gal-image'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const catEl = document.getElementById('admin-gal-category');
  if (catEl) catEl.selectedIndex = 0;

  const titleEl = document.getElementById('admin-gal-form-title');
  if (titleEl) titleEl.textContent = 'Upload & Add Gallery Photo';

  clearGalImgPreview();
};

window.editGalleryInAdmin = function(galId) {
  const galleryList = (appState.gallery && appState.gallery.length > 0) ? appState.gallery : defaultHospitalData.gallery;
  const item = galleryList.find(g => g.id === galId);
  if (!item) return;

  const titleEl = document.getElementById('admin-gal-form-title');
  if (titleEl) titleEl.textContent = `Edit Gallery Photo: ${item.title}`;

  const idIn = document.getElementById('admin-gal-id');
  const titleIn = document.getElementById('admin-gal-title');
  const catIn = document.getElementById('admin-gal-category');
  const capIn = document.getElementById('admin-gal-caption');
  const imgIn = document.getElementById('admin-gal-image');

  if (idIn) idIn.value = item.id;
  if (titleIn) titleIn.value = item.title || '';
  if (catIn) catIn.value = item.category || 'Hospital Campus';
  if (capIn) capIn.value = item.caption || '';
  if (imgIn) {
    imgIn.value = item.image || '';
    updateGalImgPreview(item.image);
  }

  const formWrap = document.getElementById('admin-gallery-form');
  if (formWrap) {
    formWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    formWrap.style.transition = 'box-shadow 0.3s ease';
    formWrap.style.boxShadow = '0 0 0 3px rgba(2,128,144,0.3)';
    setTimeout(() => { formWrap.style.boxShadow = 'none'; }, 1500);
  }
};

window.deleteGalleryInAdmin = function(galId) {
  if (!confirm('Are you sure you want to delete this gallery photo?')) return;
  if (!appState.gallery) appState.gallery = [...defaultHospitalData.gallery];
  appState.gallery = appState.gallery.filter(g => g.id !== galId);
  saveHospitalData(appState);
  renderGallery();
  renderAdminGalleryTable();
  showToast('Gallery photo deleted successfully');
};

window.handleGalleryFormSubmit = function(e) {
  e.preventDefault();
  const id = document.getElementById('admin-gal-id').value || `gal-${Date.now()}`;
  const title = document.getElementById('admin-gal-title').value.trim();
  const category = document.getElementById('admin-gal-category').value;
  const caption = document.getElementById('admin-gal-caption').value.trim();
  const image = document.getElementById('admin-gal-image').value.trim();

  const newItem = { id, title, category, caption, image };

  if (!appState.gallery) appState.gallery = [...defaultHospitalData.gallery];

  const idx = appState.gallery.findIndex(g => g.id === id);
  if (idx >= 0) appState.gallery[idx] = newItem;
  else appState.gallery.push(newItem);

  saveHospitalData(appState);
  renderGallery();
  renderAdminGalleryTable();
  clearGalleryForm();
  showToast('Gallery photo saved successfully!');
};

/* ============================================
   APPOINTMENTS & INQUIRIES ENGINE (ADMIN)
   ============================================ */

function renderAdminAppointmentsTable() {
  const tbody = document.getElementById('admin-appointments-table-body');
  const badgeEl = document.getElementById('admin-badge-appts');
  const statTotal = document.getElementById('stat-total-appts');
  const statPending = document.getElementById('stat-pending-appts');
  const statConfirmed = document.getElementById('stat-confirmed-appts');
  const statCompleted = document.getElementById('stat-completed-appts');

  if (!appState.appointments) appState.appointments = [];

  let appts = appState.appointments;

  const totalCount = appts.length;
  const pendingCount = appts.filter(a => a.status === 'Pending').length;
  const confirmedCount = appts.filter(a => a.status === 'Confirmed').length;
  const completedCount = appts.filter(a => a.status === 'Completed').length;

  if (statTotal) statTotal.textContent = totalCount;
  if (statPending) statPending.textContent = pendingCount;
  const bottomBadgeEl = document.getElementById('admin-bottom-badge-appts');
  if (badgeEl) {
    if (pendingCount > 0) {
      badgeEl.textContent = pendingCount;
      badgeEl.style.display = 'inline-block';
    } else {
      badgeEl.style.display = 'none';
    }
  }
  if (bottomBadgeEl) {
    if (pendingCount > 0) {
      bottomBadgeEl.textContent = pendingCount;
      bottomBadgeEl.style.display = 'inline-block';
    } else {
      bottomBadgeEl.style.display = 'none';
    }
  }
  if (statConfirmed) statConfirmed.textContent = confirmedCount;
  if (statCompleted) statCompleted.textContent = completedCount;

  if (!tbody) return;

  const searchVal = document.getElementById('admin-appt-search') ? document.getElementById('admin-appt-search').value.toLowerCase().trim() : '';
  const filterStatus = document.getElementById('admin-appt-filter-status') ? document.getElementById('admin-appt-filter-status').value : 'ALL';

  if (filterStatus !== 'ALL') {
    appts = appts.filter(a => a.status === filterStatus);
  }

  if (searchVal) {
    appts = appts.filter(a =>
      (a.id && a.id.toLowerCase().includes(searchVal)) ||
      (a.patientName && a.patientName.toLowerCase().includes(searchVal)) ||
      (a.patientPhone && a.patientPhone.includes(searchVal)) ||
      (a.department && a.department.toLowerCase().includes(searchVal)) ||
      (a.doctor && a.doctor.toLowerCase().includes(searchVal))
    );
  }

  if (appts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;">
          <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 4px;">No Appointments Found</div>
          <div style="font-size: 0.825rem;">Patient OPD bookings &amp; inquiries will appear here in real-time.</div>
        </td>
      </tr>
    `;
    updateSelectedApptCount();
    return;
  }

  tbody.innerHTML = appts.map(a => {
    let statusBadge = `<span style="background: #fff7ed; color: #c2410c; padding: 4px 12px; border-radius: 99px; font-weight: 800; font-size: 0.78rem; border: 1px solid #ffedd5;">⏳ Pending</span>`;
    if (a.status === 'Confirmed') {
      statusBadge = `<span style="background: #f0fdf4; color: #15803d; padding: 4px 12px; border-radius: 99px; font-weight: 800; font-size: 0.78rem; border: 1px solid #dcfce7;">✓ Confirmed</span>`;
    } else if (a.status === 'Completed') {
      statusBadge = `<span style="background: #e0f7f4; color: #028090; padding: 4px 12px; border-radius: 99px; font-weight: 800; font-size: 0.78rem; border: 1px solid #b2f5ea;">🏥 Completed</span>`;
    } else if (a.status === 'Cancelled') {
      statusBadge = `<span style="background: #fef2f2; color: #dc2626; padding: 4px 12px; border-radius: 99px; font-weight: 800; font-size: 0.78rem; border: 1px solid #fee2e2;">✕ Cancelled</span>`;
    }

    const waPhone = (a.patientPhone || '').replace(/\D/g, '');
    const waLink = waPhone ? `https://wa.me/91${waPhone.length === 10 ? waPhone : waPhone}?text=${encodeURIComponent(`Hello ${a.patientName}, your OPD appointment at Life Line Hospital Ambikapur (${a.id}) is ${a.status.toLowerCase()}.`)}` : '#';

    return `
      <tr>
        <td style="text-align: center;">
          <input type="checkbox" class="appt-row-checkbox" value="${a.id}" onchange="updateSelectedApptCount()" style="width: 16px; height: 16px; cursor: pointer; accent-color: #e11d48;">
        </td>
        <td><strong style="color: #028090; font-family: monospace;">${a.id}</strong></td>
        <td>
          <div style="font-weight: 700; color: #014e59;">${a.patientName}</div>
          <div style="font-size: 0.8rem; color: #64748b;">📞 ${a.patientPhone}</div>
        </td>
        <td>
          <div style="font-weight: 600;">${a.department || 'General OPD'}</div>
          <div style="font-size: 0.8rem; color: #64748b;">${a.doctor || 'Consultant Specialist'}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: #334155;">${a.date || 'Scheduled'}</div>
          <div style="font-size: 0.75rem; color: #94a3b8;">${a.time || '05:00 AM - 12:00 PM'}</div>
        </td>
        <td>
          <span style="background: #f8fafc; color: #475569; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; border: 1px solid #e2e8f0;">
            ${a.type || 'OPD Booking'}
          </span>
        </td>
        <td>${statusBadge}</td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${a.status === 'Pending' ? `
              <button class="admin-btn admin-btn-primary" onclick="updateAppointmentStatus('${a.id}', 'Confirmed')" title="Confirm Appointment">✓ Confirm</button>
            ` : ''}
            ${a.status === 'Confirmed' ? `
              <button class="admin-btn admin-btn-primary" style="background:#028090;" onclick="updateAppointmentStatus('${a.id}', 'Completed')" title="Mark Completed">🏥 Complete</button>
            ` : ''}
            <button class="admin-btn" style="background:#f1f5f9;color:#475569;" onclick="editAppointmentInAdmin('${a.id}')">Edit</button>
            ${waPhone ? `
              <a href="${waLink}" target="_blank" class="admin-btn" style="background:#25d366;color:white;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;" title="WhatsApp Patient">💬 WA</a>
            ` : ''}
            <button class="admin-btn admin-btn-danger" onclick="deleteAppointmentInAdmin('${a.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (typeof updateSelectedApptCount === 'function') updateSelectedApptCount();
}

window.toggleSelectAllAppts = function(masterCheckbox) {
  const isChecked = masterCheckbox.checked;
  document.querySelectorAll('.appt-row-checkbox').forEach(cb => {
    cb.checked = isChecked;
  });
  document.querySelectorAll('#admin-select-all-appts, #admin-select-all-head').forEach(cb => {
    cb.checked = isChecked;
  });
  updateSelectedApptCount();
};

function updateSelectedApptCount() {
  const selected = document.querySelectorAll('.appt-row-checkbox:checked');
  const countEl = document.getElementById('admin-selected-count');
  if (countEl) countEl.textContent = selected.length;
}
window.updateSelectedApptCount = updateSelectedApptCount;

window.massDeleteAppts = function() {
  const selectedBoxes = Array.from(document.querySelectorAll('.appt-row-checkbox:checked'));
  if (selectedBoxes.length === 0) {
    alert('Please select at least one appointment checkbox to delete.');
    return;
  }

  const idsToDelete = new Set(selectedBoxes.map(cb => cb.value));
  if (!confirm(`Are you sure you want to MASS DELETE ${idsToDelete.size} selected appointment(s)?`)) return;

  if (!appState.appointments) appState.appointments = [];
  appState.appointments = appState.appointments.filter(a => !idsToDelete.has(a.id));

  saveHospitalData(appState);
  renderAdminAppointmentsTable();
  showToast(`⚡ Mass deleted ${idsToDelete.size} appointment(s) successfully!`);
};

window.deleteAllAppts = function() {
  if (!appState.appointments || appState.appointments.length === 0) {
    alert('No appointments to delete.');
    return;
  }

  if (!confirm(`⚠️ DANGER: Are you sure you want to DELETE ALL ${appState.appointments.length} appointments? This cannot be undone!`)) return;

  appState.appointments = [];
  saveHospitalData(appState);
  renderAdminAppointmentsTable();
  showToast('⚡ All appointments cleared successfully!');
};

window.massConfirmAppts = function() {
  const selectedBoxes = Array.from(document.querySelectorAll('.appt-row-checkbox:checked'));
  if (selectedBoxes.length === 0) {
    alert('Please select at least one appointment checkbox.');
    return;
  }

  const idsToConfirm = new Set(selectedBoxes.map(cb => cb.value));
  if (!appState.appointments) return;
  appState.appointments.forEach(a => {
    if (idsToConfirm.has(a.id)) {
      a.status = 'Confirmed';
    }
  });

  saveHospitalData(appState);
  renderAdminAppointmentsTable();
  showToast(`⚡ ${idsToConfirm.size} appointment(s) marked as Confirmed!`);
};

window.renderAdminAppointmentsTable = renderAdminAppointmentsTable;

window.updateAppointmentStatus = function(apptId, newStatus) {
  const appt = appState.appointments.find(a => a.id === apptId);
  if (!appt) return;
  appt.status = newStatus;
  saveHospitalData(appState);
  renderAdminAppointmentsTable();
  showToast(`Appointment ${apptId} marked as ${newStatus}!`);
};

window.deleteAppointmentInAdmin = function(apptId) {
  if (!confirm(`Are you sure you want to delete appointment ${apptId}?`)) return;
  appState.appointments = appState.appointments.filter(a => a.id !== apptId);
  saveHospitalData(appState);
  renderAdminAppointmentsTable();
  showToast('Appointment deleted successfully.');
};

window.clearApptFilters = function() {
  const searchIn = document.getElementById('admin-appt-search');
  const statusIn = document.getElementById('admin-appt-filter-status');
  if (searchIn) searchIn.value = '';
  if (statusIn) statusIn.value = 'ALL';
  renderAdminAppointmentsTable();
};

window.editAppointmentInAdmin = function(apptId) {
  const appt = appState.appointments.find(a => a.id === apptId);
  if (!appt) return;

  const card = document.getElementById('admin-edit-appt-card');
  const title = document.getElementById('admin-edit-appt-title');
  if (card) card.style.display = 'block';
  if (title) title.textContent = `Edit Appointment: ${appt.id}`;

  const idIn = document.getElementById('edit-appt-id');
  const nameIn = document.getElementById('edit-appt-name');
  const phoneIn = document.getElementById('edit-appt-phone');
  const statusIn = document.getElementById('edit-appt-status');
  const deptIn = document.getElementById('edit-appt-dept');
  const docIn = document.getElementById('edit-appt-doc');
  const dateIn = document.getElementById('edit-appt-date');

  if (idIn) idIn.value = appt.id;
  if (nameIn) nameIn.value = appt.patientName || '';
  if (phoneIn) phoneIn.value = appt.patientPhone || '';
  if (statusIn) statusIn.value = appt.status || 'Pending';
  if (deptIn) deptIn.value = appt.department || '';
  if (docIn) docIn.value = appt.doctor || '';
  if (dateIn) dateIn.value = appt.date || '';

  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.closeEditApptForm = function() {
  const card = document.getElementById('admin-edit-appt-card');
  if (card) card.style.display = 'none';
};

window.handleSaveEditAppt = function(e) {
  e.preventDefault();
  const id = document.getElementById('edit-appt-id').value;
  const appt = appState.appointments.find(a => a.id === id);
  if (!appt) return;

  appt.patientName = document.getElementById('edit-appt-name').value.trim();
  appt.patientPhone = document.getElementById('edit-appt-phone').value.trim();
  appt.status = document.getElementById('edit-appt-status').value;
  appt.department = document.getElementById('edit-appt-dept').value.trim();
  appt.doctor = document.getElementById('edit-appt-doc').value.trim();
  appt.date = document.getElementById('edit-appt-date').value.trim();

  saveHospitalData(appState);
  renderAdminAppointmentsTable();
  closeEditApptForm();
  showToast('Appointment updated successfully!');
};

window.openManualApptModal = function() {
  const pName = prompt('Enter Patient Full Name:');
  if (!pName) return;
  const pPhone = prompt('Enter Patient 10-digit Mobile Number:');
  if (!pPhone) return;
  const pDept = prompt('Enter Department/Specialty (or press Enter for General OPD):') || 'General OPD';
  const pDoc = prompt('Enter Assigned Doctor Name (optional):') || 'Duty Specialist';

  const newAppt = {
    id: 'LLH-' + Math.floor(100000 + Math.random() * 900000),
    patientName: pName,
    patientPhone: pPhone,
    department: pDept,
    doctor: pDoc,
    date: new Date().toISOString().split('T')[0],
    time: 'Walk-In OPD',
    status: 'Confirmed',
    type: 'Walk-In Admission',
    createdTime: new Date().toLocaleString()
  };

  if (!appState.appointments) appState.appointments = [];
  appState.appointments.unshift(newAppt);
  saveHospitalData(appState);
  renderAdminAppointmentsTable();
  showToast(`Walk-In Appointment ${newAppt.id} Registered!`);
};

window.openDoctorEditorModal = function(docId) {
  const modal = document.getElementById('doctor-editor-modal');
  const title = document.getElementById('doctor-modal-title');
  if (!modal) return;

  if (docId) {
    const cleanTargetId = String(docId || '').replace(/^doc-?/, '');
    const doc = (appState.doctors || []).find(d => 
      String(d.id || '') === String(docId || '') || 
      String(d.id || '').replace(/^doc-?/, '') === cleanTargetId
    );

    if (doc) {
      if (title) title.innerText = `Edit Profile: ${doc.name}`;
      const idEl = document.getElementById('admin-doc-id');
      const nameEl = document.getElementById('admin-doc-name');
      const specEl = document.getElementById('admin-doc-specialty');
      const specNameEl = document.getElementById('admin-doc-specialty-name');
      const desigEl = document.getElementById('admin-doc-designation');
      const degEl = document.getElementById('admin-doc-degree');
      const expEl = document.getElementById('admin-doc-exp');
      const timEl = document.getElementById('admin-doc-timings');
      const feeEl = document.getElementById('admin-doc-fee');
      const imgEl = document.getElementById('admin-doc-image');

      if (idEl) idEl.value = doc.id || '';
      if (nameEl) nameEl.value = doc.name || '';
      if (specEl) specEl.value = doc.specialty || 'general';
      if (specNameEl) specNameEl.value = doc.specialtyName || doc.specialty || '';
      if (desigEl) desigEl.value = doc.designation || 'Consultant Specialist';
      if (degEl) degEl.value = doc.degree || '';
      if (expEl) expEl.value = doc.experience || '';
      if (timEl) timEl.value = doc.timings || '';
      if (feeEl) feeEl.value = doc.fee || '';
      
      const docImg = getDoctorImage(doc);
      if (imgEl) imgEl.value = docImg || '';
      if (typeof updateDocImgPreview === 'function') updateDocImgPreview(docImg || '');
    }
  } else {
    if (title) title.innerText = 'Add New Specialist Doctor';
    if (typeof clearDoctorForm === 'function') clearDoctorForm();
  }

  modal.style.display = 'flex';
  modal.scrollTop = 0;
  document.body.style.overflow = 'hidden';
};

window.closeDoctorEditorModal = function() {
  const modal = document.getElementById('doctor-editor-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.keyCode === 27) {
    if (typeof closeDoctorEditorModal === 'function') closeDoctorEditorModal();
    if (typeof closeDoctorDetailsModal === 'function') closeDoctorDetailsModal();
    if (typeof closeAdminLoginModal === 'function') closeAdminLoginModal();
    if (typeof closeBookingModal === 'function') closeBookingModal();
    if (typeof closeCropperModal === 'function') closeCropperModal();
    document.body.style.overflow = '';
  }
});

window.editDoctorInAdmin = function(docId) {
  if (typeof openDoctorEditorModal === 'function') {
    openDoctorEditorModal(docId);
  }
};

window.renderAdminDoctorsGrid = function() {
  const grid = document.getElementById('admin-doctors-roster-grid');
  if (!grid) return;

  const searchQuery = (document.getElementById('admin-doc-search')?.value || '').toLowerCase().trim();
  const deptFilter = (document.getElementById('admin-doc-dept-filter')?.value || 'all').toLowerCase();

  let list = appState.doctors || [];

  if (deptFilter !== 'all') {
    list = list.filter(d => (d.specialty || '').toLowerCase() === deptFilter);
  }

  if (searchQuery) {
    list = list.filter(d => 
      (d.name || '').toLowerCase().includes(searchQuery) || 
      (d.specialtyName || d.specialty || '').toLowerCase().includes(searchQuery) ||
      (d.degree || '').toLowerCase().includes(searchQuery)
    );
  }

  if (list.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: white; border-radius: 16px; border: 1px dashed #cbd5e1; color: #64748b;">No doctors match search criteria.</div>`;
    return;
  }

  const totalAllDocs = (appState.doctors || []).length;

  grid.innerHTML = list.map(doc => {
    const photoUrl = getDoctorImage(doc);
    const feeText = String(doc.fee || '₹500').startsWith('₹') ? doc.fee : `₹${doc.fee}`;
    const globalIdx = (appState.doctors || []).findIndex(d => d.id === doc.id);
    const isFirst = globalIdx === 0;
    const isLast = globalIdx === totalAllDocs - 1;

    return `
      <div class="admin-doc-card draggable-doctor-card" 
           draggable="true" 
           data-doc-id="${doc.id}"
           style="background: white; border-radius: 18px; border: 1px solid rgba(2,128,144,0.12); padding: 20px; box-shadow: 0 6px 24px rgba(2,128,144,0.06); display: flex; flex-direction: column; justify-content: space-between; transition: all 0.25s ease;">
        
        <!-- Drag & Order Header Bar -->
        <div class="doc-drag-header">
          <div class="doc-drag-handle" title="Click & drag this card to reposition on visitor page">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
              <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
            </svg>
            <span>Drag to Move</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="doc-order-badge" title="Display position on visitor page">#${globalIdx + 1}</span>
            <div class="doc-order-actions">
              <button type="button" class="doc-order-btn" title="Move Up" onclick="moveDoctorOrder('${doc.id}', -1)" ${isFirst ? 'disabled' : ''}>▲</button>
              <button type="button" class="doc-order-btn" title="Move Down" onclick="moveDoctorOrder('${doc.id}', 1)" ${isLast ? 'disabled' : ''}>▼</button>
            </div>
          </div>
        </div>

        <div>
          <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px;">
            <img src="${photoUrl}" alt="${doc.name}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2.5px solid #028090; box-shadow: 0 4px 14px rgba(2,128,144,0.25); flex-shrink: 0;">
            <div>
              <strong style="color: #014e59; font-size: 1.125rem; font-weight: 800; display: block; line-height: 1.25; margin-bottom: 3px;">${doc.name}</strong>
              <span style="font-size: 0.8rem; color: #028090; font-weight: 700; display: block;">${doc.designation || 'Consultant Specialist'}</span>
            </div>
          </div>

          <div style="margin-bottom: 14px;">
            <span style="background: #e6f7f5; color: #028090; padding: 4px 12px; border-radius: 20px; font-size: 0.775rem; font-weight: 700; display: inline-block; margin-bottom: 10px; border: 1px solid rgba(2,128,144,0.2);">
              ${(typeof appState !== 'undefined' && appState.departments && appState.departments.find(d => d.id === doc.specialty)?.name) || doc.specialtyName || doc.specialty}
            </span>
            <div style="font-size: 0.85rem; color: #475569; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              <span>🎓</span> <span>${doc.degree}</span>
            </div>
            <div style="font-size: 0.825rem; color: #64748b; font-weight: 500; display: flex; align-items: center; gap: 6px;">
              <span>⏱️</span> <span>${doc.timings || '10:00 AM - 02:00 PM'}</span>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 14px; margin-top: 8px;">
          <div>
            <span style="display: block; font-size: 0.68rem; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">OPD FEE</span>
            <strong style="font-size: 1.15rem; color: #014e59; font-weight: 800;">${feeText}</strong>
          </div>
          <div style="display: flex; gap: 8px;">
            <button type="button" onclick="openDoctorEditorModal('${doc.id}')" class="btn btn-primary" style="padding: 7px 14px; font-size: 0.8rem; font-weight: 700; border-radius: 8px;">
              ✏️ Edit
            </button>
            <button type="button" onclick="deleteDoctorInAdmin('${doc.id}')" style="background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; padding: 7px 12px; border-radius: 8px; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: all 0.2s ease;">
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  attachDoctorDragDropHandlers();

  if (window.lucide) window.lucide.createIcons();
};

let activeDraggedDocId = null;

function attachDoctorDragDropHandlers() {
  const cards = document.querySelectorAll('.draggable-doctor-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      activeDraggedDocId = card.getAttribute('data-doc-id');
      card.classList.add('is-dragging');
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', activeDraggedDocId);
      }
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('is-dragging');
      document.querySelectorAll('.draggable-doctor-card').forEach(c => c.classList.remove('drag-target-over'));
      activeDraggedDocId = null;
    });

    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      if (!card.classList.contains('is-dragging')) {
        card.classList.add('drag-target-over');
      }
    });

    card.addEventListener('dragleave', (e) => {
      if (!card.contains(e.relatedTarget)) {
        card.classList.remove('drag-target-over');
      }
    });

    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.classList.remove('drag-target-over');
      const targetDocId = card.getAttribute('data-doc-id');
      const sourceDocId = activeDraggedDocId || (e.dataTransfer ? e.dataTransfer.getData('text/plain') : null);

      if (!sourceDocId || !targetDocId || sourceDocId === targetDocId) return;

      reorderDoctorsList(sourceDocId, targetDocId);
    });
  });
}

function reorderDoctorsList(sourceId, targetId) {
  if (!appState.doctors) return;
  const fromIndex = appState.doctors.findIndex(d => d.id === sourceId);
  const toIndex = appState.doctors.findIndex(d => d.id === targetId);

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;

  const [movedDoc] = appState.doctors.splice(fromIndex, 1);
  appState.doctors.splice(toIndex, 0, movedDoc);

  // Save new ordering to localStorage and Supabase database
  const orderIds = appState.doctors.map(d => d.id);
  localStorage.setItem('lifeLine_doctor_order', JSON.stringify(orderIds));
  saveHospitalData(appState);
  saveSettingToSupabase('doctor_order', orderIds);

  // Re-render UI components live
  renderAdminDoctorsGrid();
  renderDoctors();

  showToast(`✨ Moved ${movedDoc.name} to position #${toIndex + 1}! Visitor page updated live.`);
}

window.moveDoctorOrder = function(docId, delta) {
  if (!appState.doctors) return;
  const currentIndex = appState.doctors.findIndex(d => d.id === docId);
  if (currentIndex < 0) return;

  const newIndex = currentIndex + delta;
  if (newIndex < 0 || newIndex >= appState.doctors.length) return;

  const [movedDoc] = appState.doctors.splice(currentIndex, 1);
  appState.doctors.splice(newIndex, 0, movedDoc);

  // Save new ordering to localStorage and Supabase database
  const orderIds = appState.doctors.map(d => d.id);
  localStorage.setItem('lifeLine_doctor_order', JSON.stringify(orderIds));
  saveHospitalData(appState);
  saveSettingToSupabase('doctor_order', orderIds);

  renderAdminDoctorsGrid();
  renderDoctors();

  showToast(`✨ ${movedDoc.name} moved to #${newIndex + 1}! Saved live.`);
};


async function ensurePublicImageUrl(imageSource, docId) {
  if (!imageSource) return '';
  if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
    return imageSource;
  }
  if (imageSource.startsWith('data:image/')) {
    try {
      const mimeMatch = imageSource.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const ext = mimeType.split('/')[1] || 'jpg';
      const base64Clean = imageSource.replace(/^data:image\/\w+;base64,/, '');

      const byteCharacters = atob(base64Clean);
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([byteArray], { type: mimeType });
      const fileName = `doctor-${docId}-${Date.now()}.${ext}`;

      const uploadEndpoint = `${SUPABASE_STORAGE_URL}/storage/v1/object/hospital-assets/${fileName}`;
      const res = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apiKey': SUPABASE_ANON_KEY,
          'Content-Type': mimeType,
          'x-upsert': 'true'
        },
        body: blob
      });

      if (res.ok || res.status === 200 || res.status === 201) {
        return `${SUPABASE_STORAGE_URL}/storage/v1/object/public/hospital-assets/${fileName}`;
      }
    } catch (err) {
      console.warn('Base64 auto-upload to Supabase bucket notice:', err);
    }
  }
  return imageSource;
}

async function saveDoctorToSupabase(newDoctor) {
  let publicImgUrl = newDoctor.image || '';
  if (publicImgUrl.startsWith('data:image/')) {
    const ext = publicImgUrl.match(/^data:image\/(\w+);base64,/)?.[1] || 'png';
    const fileName = `doctor-${newDoctor.id}-${Date.now()}.${ext}`;
    publicImgUrl = await uploadImageToSupabase(fileName, publicImgUrl);
  }

  newDoctor.image = publicImgUrl;

  try {
    let saveSuccess = false;
    const docPayload = {
      id: newDoctor.id,
      name: newDoctor.name,
      specialty_id: newDoctor.specialty || 'general',
      specialty_name: newDoctor.specialtyName || 'General OPD',
      qualifications: newDoctor.degree || '',
      experience: newDoctor.experience || '10+ Years',
      opd_time: newDoctor.timings || '10:00 AM - 04:00 PM',
      fee: parseFloat(String(newDoctor.fee || '').replace(/[^0-9.]/g, '')) || 500,
      image: newDoctor.image || ''
    };
    const dbRes = await fetch(`${SUPABASE_STORAGE_URL}/rest/v1/doctors`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apiKey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(docPayload)
    });
    if (dbRes.ok) {
      saveSuccess = true;
      console.log('⚡ Doctor saved directly to Supabase REST API successfully.');
    }
    if (isLocal) {
      try {
        await fetch('/api/doctors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newDoctor)
        });
      } catch(e) {}
    }

    if (saveSuccess) {
      const idx = (appState.doctors || []).findIndex(d => d.id === newDoctor.id);
      if (idx >= 0) {
        appState.doctors[idx] = newDoctor;
      } else {
        appState.doctors.push(newDoctor);
      }
      saveHospitalData(appState);
      renderAdminDoctorsGrid();
      if (typeof renderAdminDoctorsTable === 'function') renderAdminDoctorsTable();
    }
  } catch (e) {
    console.warn('DB Save Error:', e);
  }

  return newDoctor;
}

async function deleteDoctorFromSupabase(docId) {
  const dbRes = await fetch(`${SUPABASE_STORAGE_URL}/rest/v1/doctors?id=eq.${docId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apiKey': SUPABASE_ANON_KEY
    }
  });
  if (isLocal) {
    try { await fetch(`/api/doctors/${encodeURIComponent(docId)}`, { method: 'DELETE' }); } catch(e){}
  }
}

window.deleteDoctorInAdmin = async function(docId) {
  const docObj = appState.doctors.find(d => d.id === docId);
  const docName = docObj ? docObj.name : 'this doctor';
  if (confirm(`Are you sure you want to remove ${docName} from the hospital directory?`)) {
    try {
      await deleteDoctorFromSupabase(docId);
      showToast(`⚡ Doctor profile '${docName}' removed live from Supabase!`);
      await syncFromSupabase();
    } catch (err) {
      appState.doctors = appState.doctors.filter(d => d.id !== docId);
      saveHospitalData(appState);
      renderDoctors();
      renderAdminDoctorsTable();
      showToast(`Doctor profile removed.`);
    }
  }
};

window.editBlogInAdmin = function(blogId) {
  const blog = appState.blogs.find(b => b.id === blogId);
  if (!blog) return;

  document.getElementById('admin-blog-id').value = blog.id;
  document.getElementById('admin-blog-title').value = blog.title;
  document.getElementById('admin-blog-cat').value = blog.category;
  document.getElementById('admin-blog-excerpt').value = blog.excerpt;
  const contentEl = document.getElementById('admin-blog-content');
  if (contentEl) contentEl.value = blog.content || blog.excerpt;
  document.getElementById('admin-blog-image').value = blog.image || '';

  const dateEl = document.getElementById('admin-blog-date');
  if (dateEl && blog.date) dateEl.value = blog.date;

  if (typeof updateBlogImgPreview === 'function') {
    updateBlogImgPreview(blog.image || '');
  }

  document.querySelector('[data-admin-tab="admin-tab-blogs"]')?.click();
  setTimeout(() => {
    document.getElementById('admin-blog-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);
};

window.deleteBlogInAdmin = async function(blogId) {
  if (confirm('Delete this health blog article?')) {
    try {
      await fetch(`${SUPABASE_STORAGE_URL}/rest/v1/blogs?id=eq.${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apiKey': SUPABASE_ANON_KEY
        }
      });
      if (isLocal) {
        try { await fetch('/api/blogs/' + blogId, { method: 'DELETE' }); } catch(e){}
      }
      showToast('Blog article deleted live from Supabase!');
      await syncFromSupabase();
    } catch (err) {
      appState.blogs = appState.blogs.filter(b => b.id !== blogId);
      saveHospitalData(appState);
      renderBlogs();
      renderAdminBlogsTable();
      showToast('Blog article deleted.');
    }
  }
};

function showToast(message) {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `<i data-lucide="check-circle" style="width: 20px; height: 20px;"></i> <span>${message}</span>`;
  document.body.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}



async function uploadFileDirectToSupabaseBucket(file, maxWidth = 1600, maxHeight = 1200) {
  const fileExt = file.name ? file.name.split('.').pop().toLowerCase() : 'jpg';
  const cleanExt = (fileExt === 'blob' || fileExt === 'data') ? 'jpg' : fileExt;
  const fileName = `doctor-${Date.now()}.${cleanExt}`;

  // 1. Compress image using Canvas
  const base64Compressed = await compressAndResizeImage(file, maxWidth, maxHeight, 0.85);
  const base64Clean = base64Compressed.replace(/^data:image\/\w+;base64,/, '');

  // Convert base64 to Blob
  const byteCharacters = atob(base64Clean);
  const byteArray = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i);
  }
  const mimeType = cleanExt === 'png' ? 'image/png' : (cleanExt === 'webp' ? 'image/webp' : 'image/jpeg');
  const blob = new Blob([byteArray], { type: mimeType });

  // 2. Try with anon key first (browser CORS-compatible)
  const uploadEndpoint = `${SUPABASE_STORAGE_URL}/storage/v1/object/hospital-assets/${fileName}`;
  let res = await fetch(uploadEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apiKey': SUPABASE_ANON_KEY,
      'Content-Type': mimeType,
      'x-upsert': 'true'
    },
    body: blob
  });

  // 3. Fallback: try with service role key
  if (!res.ok) {
    console.log('Anon key upload failed, trying service role key...');
    res = await fetch(uploadEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_STORAGE_KEY}`,
        'apiKey': SUPABASE_STORAGE_KEY,
        'Content-Type': mimeType,
        'x-upsert': 'true'
      },
      body: blob
    });
  }

  if (res.ok) {
    const publicUrl = `${SUPABASE_STORAGE_URL}/storage/v1/object/public/hospital-assets/${fileName}`;
    console.log('SUPABASE BUCKET UPLOAD SUCCESS:', publicUrl);
    return publicUrl;
  } else {
    const errText = await res.text();
    console.error('Supabase Bucket Error:', errText);
    throw new Error(errText);
  }
}

/* Image Compression Helper using HTML5 Canvas */
function compressAndResizeImage(file, maxWidth = 1600, maxHeight = 1200, quality = 0.85) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// --- Doctor Details Popup Modal ---
window.openDoctorDetailsModal = function(docId) {
  const doc = appState.doctors.find(d => d.id === docId);
  if (!doc) return;

  const modal = document.getElementById('doctor-details-modal');
  const img = document.getElementById('modal-doc-detail-img');
  const specialty = document.getElementById('modal-doc-detail-specialty');
  const designation = document.getElementById('modal-doc-detail-designation');
  const name = document.getElementById('modal-doc-detail-name');
  const degree = document.getElementById('modal-doc-detail-degree');
  const bio = document.getElementById('modal-doc-detail-bio');
  const timings = document.getElementById('modal-doc-detail-timings');
  const exp = document.getElementById('modal-doc-detail-exp');
  const fee = document.getElementById('modal-doc-detail-fee');
  const bookBtn = document.getElementById('modal-doc-detail-book-btn');

  if (!modal) return;

  const photoUrl = getDoctorImage(doc);
  if (img) img.src = photoUrl;
  
  const deptObj = (appState.departments || []).find(d => d.id === doc.specialty);
  const deptName = deptObj ? deptObj.name : (doc.specialtyName || doc.specialty);

  if (specialty) specialty.textContent = deptName;
  if (designation) designation.textContent = doc.designation || 'Consultant Specialist';
  if (name) name.textContent = doc.name;
  if (degree) degree.textContent = doc.degree;
  
  const cleanDocName = doc.name.replace(/^Dr\.\s*/i, '');
  const bioText = `Dr. ${cleanDocName} is a distinguished ${doc.designation || 'Specialist Consultant'} in ${deptName} at Life Line Hospital Ambikapur. Holding a qualification of ${doc.degree}, they bring ${doc.experience || 'extensive years'} of clinical expertise to our medical team. Dr. ${cleanDocName} is highly dedicated to providing advanced care, comprehensive consultations, and medical support.`;
  if (bio) bio.textContent = bioText;

  if (timings) timings.textContent = doc.timings || '10:00 AM - 02:00 PM';
  if (exp) exp.textContent = doc.experience || '10+ Years Exp';
  if (fee) fee.textContent = String(doc.fee || '₹500').startsWith('₹') ? doc.fee : `₹${doc.fee}`;

  if (bookBtn) {
    bookBtn.onclick = function(e) {
      e.stopPropagation();
      closeDoctorDetailsModal();
      openBookingForDoctor(doc.id);
    };
  }

  modal.style.display = 'flex';
};

window.closeDoctorDetailsModal = function() {
  const modal = document.getElementById('doctor-details-modal');
  if (modal) modal.style.display = 'none';
};

// Close modal when clicking outside the card
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('doctor-details-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeDoctorDetailsModal();
      }
    });
  }
});

/* Image Upload & Preview Global Handlers for Admin Panel */
window.handleHeroImageUpload = async function(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    updateHeroImgPreview('loading');
    showToast('Processing & uploading hero photo...');

    try {
      const base64Preview = await compressAndResizeImage(file, 1600, 1200);
      updateHeroImgPreview(base64Preview);
      const urlInput = document.getElementById('admin-hero-img');
      if (urlInput) urlInput.value = base64Preview;

      const publicUrl = await uploadFileDirectToSupabaseBucket(file, 1600, 1200);
      if (urlInput) urlInput.value = publicUrl;
      updateHeroImgPreview(publicUrl);
      showToast('⚡ Hero photo uploaded successfully!');
    } catch (err) {
      console.error('Hero upload error:', err);
      showToast('Hero photo ready locally. Save to apply.');
    }
  }
};

window.updateHeroImgPreview = function(url) {
  const imgEl = document.getElementById('hero-img-preview');
  const badgeEl = document.getElementById('hero-preview-badge');
  const placeholder = document.getElementById('hero-img-preview-placeholder');
  const clearBtn = document.getElementById('hero-img-clear-btn');

  // Accept http, data:image, and local relative paths like /images/...
  const isValid = url && (url.startsWith('http') || url.startsWith('data:image') || url.startsWith('/'));

  if (isValid) {
    if (imgEl) {
      imgEl.src = url;
      imgEl.style.display = 'block';
      imgEl.style.opacity = '1';
    }
    if (badgeEl) badgeEl.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
    if (clearBtn) clearBtn.style.display = 'block';
  } else if (url === 'loading') {
    // Show spinner/loading state — hide old image
    if (imgEl) {
      imgEl.src = '';
      imgEl.style.display = 'none';
    }
    if (badgeEl) badgeEl.style.display = 'none';
    if (clearBtn) clearBtn.style.display = 'none';
    if (placeholder) {
      placeholder.style.display = 'flex';
      placeholder.innerHTML = `
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#028090" stroke-width="2" style="animation:spin 1s linear infinite">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
        <span style="font-size:0.8rem;color:#028090;font-weight:600;">Uploading to Supabase...</span>
        <style>@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}</style>
      `;
    }
  } else {
    if (imgEl) {
      imgEl.src = '';
      imgEl.style.display = 'none';
    }
    if (badgeEl) badgeEl.style.display = 'none';
    if (placeholder) {
      placeholder.style.display = 'flex';
      placeholder.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span style="font-size:0.8rem;">Upload or paste URL</span>';
    }
    if (clearBtn) clearBtn.style.display = 'none';
  }
};

window.clearHeroImgPreview = function() {
  const inputEl = document.getElementById('admin-hero-img');
  const fileEl = document.getElementById('admin-hero-img-file');
  if (inputEl) inputEl.value = '';
  if (fileEl) fileEl.value = '';
  updateHeroImgPreview('');
};

window.handleDocImageUpload = async function(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    showToast('Processing & uploading doctor photo...');

    try {
      const base64Preview = await compressAndResizeImage(file, 1200, 1200);
      updateDocImgPreview(base64Preview);
      const urlInput = document.getElementById('admin-doc-image');
      if (urlInput) urlInput.value = base64Preview;

      const publicUrl = await uploadFileDirectToSupabaseBucket(file, 1200, 1200);
      if (urlInput) urlInput.value = publicUrl;
      updateDocImgPreview(publicUrl);
      showToast('⚡ Doctor photo uploaded successfully!');
    } catch (err) {
      console.error('Doctor upload error:', err);
      showToast('Doctor photo ready locally. Save to apply.');
    }
  }
};

window.handleBlogImageUpload = async function(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    showToast('Processing & uploading blog photo...');

    try {
      const base64Preview = await compressAndResizeImage(file, 1600, 900);
      if (typeof updateBlogImgPreview === 'function') updateBlogImgPreview(base64Preview);
      const urlInput = document.getElementById('admin-blog-image');
      if (urlInput) urlInput.value = base64Preview;

      const publicUrl = await uploadFileDirectToSupabaseBucket(file, 1600, 900);
      if (urlInput) urlInput.value = publicUrl;
      if (typeof updateBlogImgPreview === 'function') updateBlogImgPreview(publicUrl);
      showToast('⚡ Blog photo uploaded successfully!');
    } catch (err) {
      console.error('Blog upload error:', err);
      showToast('Blog photo ready locally. Save to apply.');
    }
  }
};



