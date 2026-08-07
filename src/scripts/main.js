import { getHospitalData, saveHospitalData, defaultHospitalData } from './data.js';

let appState = getHospitalData();

// Force clean high-res image if imageUrl is relative or local path
if (!appState.hero || !appState.hero.imageUrl || !appState.hero.imageUrl.startsWith('http')) {
  if (!appState.hero) appState.hero = { ...defaultHospitalData.hero };
  appState.hero.imageUrl = 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&auto=format&fit=crop&q=80';
  saveHospitalData(appState);
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

document.addEventListener('DOMContentLoaded', () => {
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
});

/* Render all site elements dynamically from state */
function renderSiteFromState() {
  renderHeroAndHeaderFromData();
  renderDepartments();
  renderDoctors();
  renderFacilities();
  renderBlogs();
  if (typeof renderAllBlogsPage === 'function') renderAllBlogsPage();
  renderGallery();
  renderTestimonials();
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
    
    // Accept http URLs and base64 data URLs (from device upload)
    const imgUrl = appState.hero.imageUrl || '';
    const validHeroImg = (imgUrl.startsWith('http') || imgUrl.startsWith('data:image'))
      ? imgUrl
      : 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&auto=format&fit=crop&q=80';

    if (heroImgEl) heroImgEl.src = validHeroImg;
    if (heroImgMobileEl) heroImgMobileEl.src = validHeroImg;
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

    document.querySelectorAll('[data-view-target]').forEach(link => {
      if (link.getAttribute('data-view-target') === targetId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Hide nav & announcement bar when in admin
    if (targetId === 'admin-view') {
      document.body.classList.add('admin-mode-active');
    } else {
      document.body.classList.remove('admin-mode-active');
    }

    if (targetId === 'blogs-view' && typeof renderAllBlogsPage === 'function') {
      renderAllBlogsPage();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(initScrollAnimations, 100);
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-view-target]');
    if (link) {
      const targetId = link.getAttribute('data-view-target');
      if (targetId && document.getElementById(targetId)) {
        e.preventDefault();
        window.location.hash = targetId;
        switchView(targetId);
        closeMobileDrawer();
      }
    }
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

    // Hide nav & announcement bar when in admin
    if (hash === 'admin-view') {
      document.body.classList.add('admin-mode-active');
    } else {
      document.body.classList.remove('admin-mode-active');
    }

    if (hash === 'blogs-view' && typeof renderAllBlogsPage === 'function') {
      renderAllBlogsPage();
    }

    setTimeout(initScrollAnimations, 100);
  }
}

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

/* IntersectionObserver Scroll Animations */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.reveal-on-scroll:not(.is-visible)');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
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
      counter.textContent = prefix + (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
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
      <a href="#doctors-view" class="dept-link" data-view-target="doctors-view" onclick="filterDoctorsByDept('${dept.id}')">
        View Specialists & OPD <i data-lucide="arrow-right"></i>
      </a>
    </div>
  `).join('');

  gridContainers.forEach(container => container.innerHTML = deptCardsHtml);

  if (megaMenuContainer) {
    megaMenuContainer.innerHTML = appState.departments.map(dept => `
      <a href="#departments-view" class="dropdown-link" data-view-target="departments-view">
        <div class="dropdown-icon"><i data-lucide="${dept.icon || 'activity'}"></i></div>
        <div>
          <div style="font-weight: 700;">${dept.name}</div>
          <div style="font-size: 0.775rem; color: #64748b;">${dept.head || 'Specialist Head'}</div>
        </div>
      </a>
    `).join('');
  }

  const deptOptionsHtml = appState.departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  if (deptSelectModal) deptSelectModal.innerHTML = `<option value="">Select Specialty / Department</option>` + deptOptionsHtml;
  if (deptSelectQuick) deptSelectQuick.innerHTML = `<option value="">Choose Department</option>` + deptOptionsHtml;

  if (window.lucide) window.lucide.createIcons();
}

/* Render Doctors Directory */
function renderDoctors(filterDept = 'all', searchQuery = '') {
  const doctorContainers = document.querySelectorAll('.doctors-grid');
  const doctorSelectModal = document.getElementById('modal-doc-select');
  if (!doctorContainers.length) return;

  let filtered = appState.doctors;

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

  let htmlContent = '';
  if (filtered.length === 0) {
    htmlContent = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: white; border-radius: 16px; border: 1px dashed #cbd5e1;">
        <i data-lucide="user-x" style="width: 48px; height: 48px; color: #94a3b8; margin-bottom: 12px;"></i>
        <h3 style="color: #0f172a;">No doctors found matching your criteria</h3>
        <p style="color: #64748b; margin-top: 6px; font-size: 0.9rem;">Try searching for another specialty or clear your filter.</p>
      </div>
    `;
  } else {
    htmlContent = filtered.map((doc, idx) => `
      <div class="doctor-card reveal-on-scroll delay-${(idx % 4 + 1) * 100}">
        <div class="doctor-img-wrap">
          <img src="${doc.image}" alt="${doc.name}" loading="lazy">
          <span class="doctor-badge">${doc.specialtyName}</span>
        </div>
        <div class="doctor-info">
          <span class="doctor-dept">${doc.designation}</span>
          <h3 class="doctor-name">${doc.name}</h3>
          <p class="doctor-degree">${doc.degree}</p>
          <div>
            <span class="doctor-exp">${doc.experience}</span>
          </div>
          <p style="font-size: 0.825rem; color: #64748b; margin-top: 6px;">
            <i data-lucide="clock" style="width: 14px; height: 14px; display: inline;"></i> ${doc.timings}
          </p>
        </div>
        <div class="doctor-footer">
          <div>
            <span style="font-size: 0.725rem; color: #64748b; display: block; text-transform: uppercase; font-weight: 700;">OPD Fee</span>
            <span class="doctor-fee">${doc.fee}</span>
          </div>
          <button class="btn btn-primary" onclick="openBookingForDoctor('${doc.id}')" style="padding: 8px 16px; font-size: 0.85rem;">
            Book OPD
          </button>
        </div>
      </div>
    `).join('');
  }

  doctorContainers.forEach(container => container.innerHTML = htmlContent);

  if (doctorSelectModal) {
    doctorSelectModal.innerHTML = `<option value="">Select Doctor</option>` + 
      appState.doctors.map(doc => `<option value="${doc.id}">${doc.name} (${doc.specialtyName})</option>`).join('');
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
  if (!containers.length) return;

  const html = appState.facilities.map((fac, idx) => `
    <div class="facility-card reveal-on-scroll delay-${(idx % 3 + 1) * 100}">
      <div class="facility-img-wrap">
        <img src="${fac.image.startsWith('http') ? fac.image : 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80'}" alt="${fac.title}" loading="lazy">
      </div>
      <div class="facility-content">
        <h3 class="facility-title">${fac.title}</h3>
        <p class="facility-desc">${fac.desc}</p>
      </div>
    </div>
  `).join('');

  containers.forEach(c => c.innerHTML = html);
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

/* Render Gallery & Lightbox */
function renderGallery(filterCategory = 'all') {
  const container = document.getElementById('gallery-grid-container');
  if (!container) return;

  let items = appState.gallery;
  if (filterCategory !== 'all') {
    items = items.filter(g => g.category === filterCategory);
  }

  container.innerHTML = items.map((item, idx) => {
    const validImg = (item.image && item.image.startsWith('http')) ? item.image : 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80';
    return `
      <div class="gallery-item reveal-on-scroll delay-${(idx % 3 + 1) * 100}" onclick="openLightbox('${validImg}', '${item.title}', '${item.caption}')">
        <img src="${validImg}" alt="${item.title}" loading="lazy">
        <div class="gallery-overlay">
          <h4 style="font-weight: 700; font-size: 1.1rem;">${item.title}</h4>
          <p style="font-size: 0.825rem; opacity: 0.9; margin-top: 4px;">${item.caption}</p>
        </div>
      </div>
    `;
  }).join('');
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
  if (!containers.length) return;

  const html = appState.testimonials.map((t, idx) => `
    <div class="testimonial-card reveal-on-scroll delay-${(idx % 3 + 1) * 100}">
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

  containers.forEach(c => c.innerHTML = html);
}

/* Appointment Booking Modal */
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

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));

  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const patientName = document.getElementById('patient-name').value;
      const patientPhone = document.getElementById('patient-phone').value;
      const docSelect = document.getElementById('modal-doc-select');
      const selectedDoc = appState.doctors.find(d => d.id === docSelect.value)?.name || 'Consultant Specialist';
      const apptDate = document.getElementById('appointment-date').value;

      const apptId = 'SANJ-' + Math.floor(100000 + Math.random() * 900000);

      const modalBody = modal.querySelector('.modal-body');
      modalBody.innerHTML = `
        <div style="text-align: center; padding: 20px 10px;">
          <div style="width: 64px; height: 64px; background: #e0f7f4; color: #00a896; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
            <i data-lucide="check-circle" style="width: 36px; height: 36px;"></i>
          </div>
          <h2 style="color: #014e59; font-size: 1.5rem; margin-bottom: 8px;">Appointment Confirmed!</h2>
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

/* ===================================================
   ADMIN PANEL CONTROLLER & REAL-TIME MANAGEMENT SYSTEM
   =================================================== */
function initAdminPanel() {
  const adminNavItems = document.querySelectorAll('.admin-nav-item');
  const adminTabPanes = document.querySelectorAll('.admin-tab-pane');

  adminNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-admin-tab');
      adminNavItems.forEach(i => i.classList.remove('active'));
      adminTabPanes.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const targetPane = document.getElementById(tabId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  populateAdminForms();
  renderAdminDoctorsTable();
  renderAdminBlogsTable();

  // Attach Form Submit Handlers
  const siteForm = document.getElementById('admin-site-settings-form');
  if (siteForm) {
    siteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      appState.name = document.getElementById('admin-input-name').value;
      appState.topAnnouncement = document.getElementById('admin-input-announcement').value;
      appState.emergencyPhone = document.getElementById('admin-input-emergency').value;
      appState.opdPhone = document.getElementById('admin-input-opd').value;
      appState.whatsapp = document.getElementById('admin-input-whatsapp').value;
      appState.email = document.getElementById('admin-input-email').value;
      appState.address = document.getElementById('admin-input-address').value;

      saveHospitalData(appState);
      renderSiteFromState();
      showToast('Hospital Branding & Contact Info Updated Successfully!');
    });
  }

  const heroForm = document.getElementById('admin-hero-settings-form');
  if (heroForm) {
    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      appState.hero = {
        ...appState.hero,
        badge: document.getElementById('admin-hero-badge').value,
        titleMain: document.getElementById('admin-hero-title-main').value,
        titleHighlight: document.getElementById('admin-hero-title-highlight').value,
        description: document.getElementById('admin-hero-desc').value,
        imageUrl: document.getElementById('admin-hero-img').value,
        floatingTitle: document.getElementById('admin-hero-float-title').value,
        floatingSubtitle: document.getElementById('admin-hero-float-sub').value
      };

      saveHospitalData(appState);
      renderSiteFromState();
      showToast('Hero Banner & Headline Updated Successfully!');
    });
  }

  const doctorForm = document.getElementById('admin-doctor-form');
  if (doctorForm) {
    doctorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const docId = document.getElementById('admin-doc-id').value || ('doc-' + Date.now());
      const name = document.getElementById('admin-doc-name').value;
      const specialty = document.getElementById('admin-doc-specialty').value;
      const specialtyName = document.getElementById('admin-doc-specialty-name').value;
      const designation = document.getElementById('admin-doc-designation').value;
      const degree = document.getElementById('admin-doc-degree').value;
      const experience = document.getElementById('admin-doc-exp').value;
      const timings = document.getElementById('admin-doc-timings').value;
      const fee = document.getElementById('admin-doc-fee').value;
      const image = document.getElementById('admin-doc-image').value || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80';

      const existingIndex = appState.doctors.findIndex(d => d.id === docId);
      const newDoctor = { id: docId, name, specialty, specialtyName, designation, degree, experience, timings, fee, image };

      if (existingIndex >= 0) {
        appState.doctors[existingIndex] = newDoctor;
      } else {
        appState.doctors.push(newDoctor);
      }

      saveHospitalData(appState);
      renderDoctors();
      renderAdminDoctorsTable();
      doctorForm.reset();
      document.getElementById('admin-doc-id').value = '';
      showToast('Doctor Profile Saved Successfully!');
    });
  }

  const blogForm = document.getElementById('admin-blog-form');
  if (blogForm) {
    blogForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const blogId = document.getElementById('admin-blog-id').value || ('blog-' + Date.now());
      const title = document.getElementById('admin-blog-title').value;
      const category = document.getElementById('admin-blog-cat').value;
      const excerpt = document.getElementById('admin-blog-excerpt').value;
      const content = document.getElementById('admin-blog-content')?.value || excerpt;
      const image = document.getElementById('admin-blog-image').value || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80';
      const customDate = document.getElementById('admin-blog-date')?.value;
      const date = customDate || new Date().toISOString().split('T')[0];

      const existingIndex = appState.blogs.findIndex(b => b.id === blogId);
      const newBlog = { id: blogId, title, category, excerpt, content, date, image };

      if (existingIndex >= 0) {
        appState.blogs[existingIndex] = newBlog;
      } else {
        appState.blogs.unshift(newBlog);
      }

      saveHospitalData(appState);
      renderBlogs();
      renderAdminBlogsTable();
      clearBlogForm();
      showToast('Health Blog Article Published Successfully!');
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
  }

  // Update Summary Stats
  const statDocs = document.getElementById('admin-stat-docs');
  const statDepts = document.getElementById('admin-stat-depts');
  const statBlogs = document.getElementById('admin-stat-blogs');

  if (statDocs) statDocs.textContent = appState.doctors.length;
  if (statDepts) statDepts.textContent = appState.departments.length;
  if (statBlogs) statBlogs.textContent = appState.blogs ? appState.blogs.length : 0;
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
 * Handle device file upload — converts to base64 and fills URL input + triggers preview.
 */
function handleHeroImageUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert('Image too large (max 5MB). Please compress or use a URL instead.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    const urlInput = document.getElementById('admin-hero-img');
    if (urlInput) {
      urlInput.value = base64;
      updateHeroImgPreview(base64);
    }
  };
  reader.readAsDataURL(file);
}

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

    preview.onload = () => {
      if (clearBtn) clearBtn.style.display = 'block';
      if (wrap)     { wrap.style.borderColor = 'rgba(2,128,144,0.5)'; wrap.style.borderStyle = 'solid'; wrap.style.boxShadow = '0 6px 24px rgba(2,128,144,0.2)'; }
    };
    preview.onerror = () => {
      preview.style.display = 'none';
      if (pholder) { pholder.style.display = 'flex'; pholder.innerHTML = '<span style="font-size:0.75rem;color:#ef4444;">⚠️ Cannot load</span>'; }
      if (clearBtn) clearBtn.style.display = 'none';
      if (wrap) { wrap.style.borderColor = 'rgba(239,68,68,0.4)'; wrap.style.borderStyle = 'dashed'; }
    };
  } else {
    preview.style.display = 'none';
    if (pholder) {
      pholder.style.display = 'flex';
      pholder.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span style="font-size:0.75rem;">Photo Preview</span>`;
    }
    if (clearBtn) clearBtn.style.display = 'none';
    if (wrap) { wrap.style.borderColor = 'rgba(2,128,144,0.3)'; wrap.style.borderStyle = 'dashed'; wrap.style.boxShadow = '0 4px 20px rgba(2,128,144,0.08)'; }
  }
}

function handleDocImageUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { alert('Image too large (max 5MB).'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    const urlInput = document.getElementById('admin-doc-image');
    if (urlInput) { urlInput.value = base64; updateDocImgPreview(base64); }
  };
  reader.readAsDataURL(file);
}

function clearDocImgPreview() {
  const urlInput  = document.getElementById('admin-doc-image');
  const fileInput = document.getElementById('admin-doc-img-file');
  if (urlInput)  urlInput.value = '';
  if (fileInput) fileInput.value = '';
  updateDocImgPreview('');
}

window.updateDocImgPreview  = updateDocImgPreview;
window.handleDocImageUpload = handleDocImageUpload;
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
  if (file.size > 5 * 1024 * 1024) { alert('Image too large (max 5MB).'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    const urlInput = document.getElementById('admin-blog-image');
    if (urlInput) { urlInput.value = base64; updateBlogImgPreview(base64); }
  };
  reader.readAsDataURL(file);
}

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
  const tbody = document.getElementById('admin-doctors-table-body');
  if (!tbody) return;

  tbody.innerHTML = appState.doctors.map(doc => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${doc.image}" alt="${doc.name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
          <strong>${doc.name}</strong>
        </div>
      </td>
      <td>${doc.specialtyName}</td>
      <td>${doc.degree}</td>
      <td>${doc.timings}</td>
      <td><strong>${doc.fee}</strong></td>
      <td>
        <button class="admin-btn admin-btn-primary" onclick="editDoctorInAdmin('${doc.id}')">Edit</button>
        <button class="admin-btn admin-btn-danger" onclick="deleteDoctorInAdmin('${doc.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
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

window.editDoctorInAdmin = function(docId) {
  const doc = appState.doctors.find(d => d.id === docId);
  if (!doc) return;

  document.getElementById('admin-doc-id').value = doc.id;
  document.getElementById('admin-doc-name').value = doc.name;
  document.getElementById('admin-doc-specialty').value = doc.specialty;
  document.getElementById('admin-doc-specialty-name').value = doc.specialtyName;
  document.getElementById('admin-doc-designation').value = doc.designation;
  document.getElementById('admin-doc-degree').value = doc.degree;
  document.getElementById('admin-doc-exp').value = doc.experience;
  document.getElementById('admin-doc-timings').value = doc.timings;
  document.getElementById('admin-doc-fee').value = doc.fee;
  document.getElementById('admin-doc-image').value = doc.image || '';

  // Show photo preview when editing
  if (typeof updateDocImgPreview === 'function') {
    updateDocImgPreview(doc.image || '');
  }

  document.querySelector('[data-admin-tab="admin-tab-doctors"]')?.click();
  // Scroll form into view
  setTimeout(() => {
    document.getElementById('admin-doctor-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);
};


window.deleteDoctorInAdmin = function(docId) {
  if (confirm('Are you sure you want to remove this doctor from directory?')) {
    appState.doctors = appState.doctors.filter(d => d.id !== docId);
    saveHospitalData(appState);
    renderDoctors();
    renderAdminDoctorsTable();
    showToast('Doctor profile removed.');
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


window.deleteBlogInAdmin = function(blogId) {
  if (confirm('Delete this health blog article?')) {
    appState.blogs = appState.blogs.filter(b => b.id !== blogId);
    saveHospitalData(appState);
    renderBlogs();
    renderAdminBlogsTable();
    showToast('Blog article deleted.');
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
