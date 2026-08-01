import { hospitalData } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  renderDepartments();
  renderDoctors();
  renderFacilities();
  renderGallery();
  renderTestimonials();
  initBookingModal();
  initContactForm();
  handleRouteHash();
});

/* Single Page View Switching */
function initNavigation() {
  const navLinks = document.querySelectorAll('[data-view-target]');
  const pageViews = document.querySelectorAll('.page-view');

  function switchView(targetId) {
    pageViews.forEach(view => {
      if (view.id === targetId) {
        view.classList.add('active-view');
      } else {
        view.classList.remove('active-view');
      }
    });

    navLinks.forEach(link => {
      if (link.getAttribute('data-view-target') === targetId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-view-target');
      window.location.hash = targetId;
      switchView(targetId);
    });
  });

  window.addEventListener('hashchange', handleRouteHash);
}

function handleRouteHash() {
  const hash = window.location.hash.replace('#', '') || 'home-view';
  const targetView = document.getElementById(hash);
  if (targetView) {
    document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active-view'));
    targetView.classList.add('active-view');

    document.querySelectorAll('[data-view-target]').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-view-target') === hash);
    });
  }
}

/* Render Departments */
function renderDepartments() {
  const gridContainer = document.getElementById('departments-grid-container');
  const megaMenuContainer = document.getElementById('mega-menu-dept-list');
  const deptSelectModal = document.getElementById('modal-dept-select');
  const deptSelectQuick = document.getElementById('quick-dept-select');

  if (gridContainer) {
    gridContainer.innerHTML = hospitalData.departments.map(dept => `
      <div class="dept-card" data-dept-id="${dept.id}">
        <div class="dept-icon">
          <i data-lucide="${dept.icon || 'activity'}"></i>
        </div>
        <h3 class="dept-name">${dept.name}</h3>
        <p class="dept-desc">${dept.shortDesc}</p>
        <a href="#doctors-view" class="dept-link" data-view-target="doctors-view" onclick="filterDoctorsByDept('${dept.id}')">
          View Specialists & Treatments <i data-lucide="arrow-right"></i>
        </a>
      </div>
    `).join('');
  }

  if (megaMenuContainer) {
    megaMenuContainer.innerHTML = hospitalData.departments.map(dept => `
      <a href="#departments-view" class="dropdown-link" data-view-target="departments-view">
        <div class="dropdown-icon"><i data-lucide="${dept.icon || 'activity'}"></i></div>
        <div>
          <div style="font-weight: 700;">${dept.name}</div>
          <div style="font-size: 0.775rem; color: #64748b;">${dept.head}</div>
        </div>
      </a>
    `).join('');
  }

  // Populate Select Dropdowns
  const deptOptionsHtml = hospitalData.departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  if (deptSelectModal) deptSelectModal.innerHTML = `<option value="">Select Specialty / Department</option>` + deptOptionsHtml;
  if (deptSelectQuick) deptSelectQuick.innerHTML = `<option value="">Choose Department</option>` + deptOptionsHtml;

  if (window.lucide) window.lucide.createIcons();
}

/* Render Doctors Directory with Search & Filter */
function renderDoctors(filterDept = 'all', searchQuery = '') {
  const doctorsContainer = document.getElementById('doctors-grid-container');
  const doctorSelectModal = document.getElementById('modal-doc-select');
  if (!doctorsContainer) return;

  let filtered = hospitalData.doctors;

  if (filterDept !== 'all') {
    filtered = filtered.filter(d => d.specialty === filterDept);
  }

  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.specialtyName.toLowerCase().includes(q) ||
      d.degree.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    doctorsContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border-radius: 12px;">
        <i data-lucide="user-x" style="width: 48px; height: 48px; color: #94a3b8; margin-bottom: 12px;"></i>
        <h3>No doctors found matching your filter</h3>
        <p style="color: #64748b; margin-top: 6px;">Try clearing search or selecting a different specialty department.</p>
      </div>
    `;
  } else {
    doctorsContainer.innerHTML = filtered.map(doc => `
      <div class="doctor-card">
        <div class="doctor-img-wrap">
          <img src="${doc.image}" alt="${doc.name}" loading="lazy">
          <span class="doctor-badge">${doc.specialtyName}</span>
        </div>
        <div class="doctor-info">
          <span class="doctor-dept">${doc.designation}</span>
          <h3 class="doctor-name">${doc.name}</h3>
          <p class="doctor-degree">${doc.degree}</p>
          <span class="doctor-exp">${doc.experience}</span>
          <p style="font-size: 0.825rem; color: #64748b; margin-top: 8px;">
            <i data-lucide="clock" style="width: 14px; height: 14px; display: inline;"></i> ${doc.timings}
          </p>
        </div>
        <div class="doctor-footer">
          <div>
            <span style="font-size: 0.75rem; color: #64748b; display: block;">OPD Fee</span>
            <span class="doctor-fee">${doc.fee}</span>
          </div>
          <button class="btn btn-primary" onclick="openBookingForDoctor('${doc.id}')" style="padding: 8px 16px; font-size: 0.85rem;">
            Book OPD
          </button>
        </div>
      </div>
    `).join('');
  }

  // Populate doctor modal dropdown
  if (doctorSelectModal) {
    doctorSelectModal.innerHTML = `<option value="">Select Doctor</option>` + 
      hospitalData.doctors.map(doc => `<option value="${doc.id}">${doc.name} (${doc.specialtyName})</option>`).join('');
  }

  if (window.lucide) window.lucide.createIcons();
}

window.filterDoctorsByDept = function(deptId) {
  const deptSelect = document.getElementById('doctor-dept-filter');
  if (deptSelect) deptSelect.value = deptId;
  renderDoctors(deptId);
};

/* Attach Doctor Search Event */
document.addEventListener('input', (e) => {
  if (e.target.id === 'doctor-search-input') {
    const dept = document.getElementById('doctor-dept-filter')?.value || 'all';
    renderDoctors(dept, e.target.value);
  }
});

document.addEventListener('change', (e) => {
  if (e.target.id === 'doctor-dept-filter') {
    const search = document.getElementById('doctor-search-input')?.value || '';
    renderDoctors(e.target.value, search);
  }
});

/* Render Facilities */
function renderFacilities() {
  const container = document.getElementById('facilities-grid-container');
  if (!container) return;

  container.innerHTML = hospitalData.facilities.map(fac => `
    <div class="facility-card">
      <div class="facility-img-wrap">
        <img src="${fac.image}" alt="${fac.title}" loading="lazy">
      </div>
      <div class="facility-content">
        <h3 class="facility-title">${fac.title}</h3>
        <p class="facility-desc">${fac.desc}</p>
      </div>
    </div>
  `).join('');
}

/* Render Gallery & Lightbox */
function renderGallery(filterCategory = 'all') {
  const container = document.getElementById('gallery-grid-container');
  if (!container) return;

  let items = hospitalData.gallery;
  if (filterCategory !== 'all') {
    items = items.filter(g => g.category === filterCategory);
  }

  container.innerHTML = items.map(item => `
    <div class="gallery-item" onclick="openLightbox('${item.image}', '${item.title}', '${item.caption}')">
      <img src="${item.image}" alt="${item.title}" loading="lazy">
      <div class="gallery-overlay">
        <h4 style="font-weight: 700;">${item.title}</h4>
        <p style="font-size: 0.8rem; opacity: 0.9;">${item.caption}</p>
      </div>
    </div>
  `).join('');
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
  const container = document.getElementById('testimonials-grid-container');
  if (!container) return;

  container.innerHTML = hospitalData.testimonials.map(t => `
    <div class="testimonial-card">
      <div class="stars">★★★★★</div>
      <p class="quote-text">"${t.quote}"</p>
      <div class="author-info">
        <div class="author-avatar">${t.author.charAt(0)}</div>
        <div class="author-details">
          <h4>${t.author}</h4>
          <p>${t.location} • <strong style="color: #028090;">${t.department}</strong></p>
        </div>
      </div>
    </div>
  `).join('');
}

/* Appointment Modal Handling */
function initBookingModal() {
  const modal = document.getElementById('booking-modal');
  const closeBtn = document.getElementById('close-booking-modal');
  const bookingForm = document.getElementById('appointment-booking-form');

  window.openBookingModal = function() {
    if (modal) modal.classList.add('active');
  };

  window.openBookingForDoctor = function(docId) {
    openBookingModal();
    const docSelect = document.getElementById('modal-doc-select');
    if (docSelect) docSelect.value = docId;
  };

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const patientName = document.getElementById('patient-name').value;
      const patientPhone = document.getElementById('patient-phone').value;
      const docSelect = document.getElementById('modal-doc-select');
      const selectedDoc = hospitalData.doctors.find(d => d.id === docSelect.value)?.name || 'Consultant Specialist';
      const apptDate = document.getElementById('appointment-date').value;

      const apptId = 'SANJ-' + Math.floor(100000 + Math.random() * 900000);

      const modalBody = modal.querySelector('.modal-body');
      modalBody.innerHTML = `
        <div style="text-align: center; padding: 20px 10px;">
          <div style="width: 64px; height: 64px; background: #e0f7f4; color: #00a896; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
            <i data-lucide="check-circle" style="width: 36px; height: 36px;"></i>
          </div>
          <h2 style="color: #015965; font-size: 1.5rem; margin-bottom: 8px;">Appointment Confirmed!</h2>
          <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 24px;">Your OPD token has been registered at Life Line Hospital Ambikapur.</p>

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
              <strong>${selectedDoc}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b; font-size: 0.85rem;">Scheduled Date:</span>
              <strong>${apptDate || 'Tomorrow Morning'}</strong>
            </div>
          </div>

          <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 20px;">
            <i data-lucide="info" style="width: 14px; height: 14px; display: inline;"></i> Please arrive 15 minutes before your schedule with your ID card.
          </p>

          <button class="btn btn-primary" onclick="location.reload()" style="width: 100%;">
            Done & Return to Homepage
          </button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    });
  }
}

/* Contact Form Handling */
function initContactForm() {
  const form = document.getElementById('hospital-contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('contact-success-alert');
    if (alertBox) {
      alertBox.style.display = 'block';
      form.reset();
      setTimeout(() => alertBox.style.display = 'none', 6000);
    }
  });
}
