/**
 * PUBLIC WEBSITE CONTROLLER - Mohammad Ashif Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarAndScroll();
  initTypingEffect();
  initParticleCanvas();
  renderAllSections();
  initProjectFiltersAndSearch();
  initContactForm();
  initToastAndLightboxes();
  initAnalyticsTrackers();
  initScrollReveal();
});

/* -------------------------------------------------------------------------- */
/* 1. Navbar & Scroll Functions                                               */
/* -------------------------------------------------------------------------- */
function initNavbarAndScroll() {
  const navbar = document.getElementById('navbar');
  const scrollBar = document.getElementById('scroll-progress-bar');
  const backToTopBtn = document.getElementById('back-to-top');
  const hamburger = document.getElementById('hamburger');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (scrollBar) scrollBar.style.width = scrollPercent + '%';

    if (scrollTop > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    if (scrollTop > 400) {
      backToTopBtn?.classList.add('show');
    } else {
      backToTopBtn?.classList.remove('show');
    }
  });

  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  hamburger?.addEventListener('click', () => {
    mobileDrawer?.classList.toggle('open');
  });

  // Close drawer on link click
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileDrawer?.classList.remove('open');
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 2. Typing Effect                                                           */
/* -------------------------------------------------------------------------- */
function initTypingEffect() {
  const typingText = document.getElementById('typing-text');
  if (!typingText) return;

  const roles = [
    'Frontend Developer',
    'UI/UX Specialist',
    'Web Performance Architect',
    'JavaScript Expert'
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentRole = roles[roleIndex];
    if (isDeleting) {
      typingText.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typingText.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
    }

    let typeSpeed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentRole.length) {
      typeSpeed = 2000; // Pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typeSpeed = 400;
    }

    setTimeout(type, typeSpeed);
  }

  type();
}

/* -------------------------------------------------------------------------- */
/* 3. Particle Glow Canvas Background                                         */
/* -------------------------------------------------------------------------- */
function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = Array.from({ length: 30 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 2.5 + 1,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    alpha: Math.random() * 0.5 + 0.2
  }));

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(37, 99, 235, ${p.alpha})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#2563eb';
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* -------------------------------------------------------------------------- */
/* 4. Render All Sections From Storage                                        */
/* -------------------------------------------------------------------------- */
function renderAllSections() {
  if (!window.ashifStorage) return;

  updateProfileElements();
  renderSkills();
  renderProjects(window.ashifStorage.getProjects());
  renderAchievements();
  renderCertificates();
  renderServices();
  renderTestimonials();
  renderBlogs();
  updateFooterDetails();
}

function updateProfileElements() {
  if (!window.ashifStorage) return;
  const s = window.ashifStorage.getSettings();

  // Hero Avatar Image & Fallback
  const heroImg = document.getElementById('hero-profile-img');
  const heroFallback = document.getElementById('hero-profile-fallback');

  if (heroImg && heroFallback) {
    if (s.profileImage && s.profileImage.trim() !== '') {
      heroImg.src = s.profileImage;
      heroImg.style.display = 'block';
      heroFallback.style.display = 'none';

      heroImg.onerror = () => {
        heroImg.style.display = 'none';
        heroFallback.style.display = 'flex';
      };
    } else {
      heroImg.style.display = 'none';
      heroFallback.style.display = 'flex';
    }
  }

  // Fallback initials
  const initials = (s.developerName || 'MA').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
  if (heroFallback) heroFallback.innerText = initials;

  // Developer Name & Title
  const heroTitleName = document.querySelector('.hero-title .gradient-text');
  if (heroTitleName && s.developerName) heroTitleName.textContent = s.developerName;

  const heroDesc = document.querySelector('.hero-description');
  if (heroDesc && s.bio) heroDesc.textContent = s.bio;

  // Resume Download Button Link
  const resumeBtn = document.getElementById('resume-download-btn');
  if (resumeBtn && s.resumeUrl) {
    resumeBtn.onclick = () => {
      const a = document.createElement('a');
      a.href = s.resumeUrl;
      a.download = `${(s.developerName || 'Developer').replace(/\s+/g, '_')}_Resume.pdf`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
  }

  // Contact Phone & Email Elements
  const phoneVal = document.getElementById('contact-phone-val');
  if (phoneVal) {
    const rawPhone = s.phone || '+91 6202782715';
    const waUrl = s.whatsappDirect || `https://wa.me/916202782715?text=Hi%20Mohammad%20Ashif,%20I%20would%20like%20to%20discuss%20a%20project!`;
    phoneVal.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none; font-weight: 800; font-size: 1.05rem;" title="Send WhatsApp Message">
          ${rawPhone}
        </a>
        <span style="font-size: 0.72rem; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.12); padding: 0.15rem 0.5rem; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.25);">
          WhatsApp Msg Only
        </span>
      </div>
      <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 0.78rem; color: #10b981; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem; margin-top: 0.2rem;">
        <i class="fa-solid fa-paper-plane"></i> Send Direct Message on WhatsApp
      </a>
    `;
  }

  // Social Links in Hero & Footer
  const heroSocials = document.getElementById('hero-social-links');
  if (heroSocials) {
    const waChat = s.whatsappDirect || 'https://wa.me/916202782715?text=Hi%20Mohammad%20Ashif';
    heroSocials.innerHTML = `
      ${s.github ? `<a href="${s.github}" target="_blank" rel="noopener noreferrer" class="social-icon social-github track-click" data-event="githubClicks" title="GitHub Profile - Mohammad Ashif" aria-label="GitHub Profile"><i class="fa-brands fa-github"></i></a>` : ''}
      ${s.linkedin ? `<a href="${s.linkedin}" target="_blank" rel="noopener noreferrer" class="social-icon social-linkedin track-click" data-event="linkedinClicks" title="LinkedIn Profile - Mohammad Ashif" aria-label="LinkedIn Profile"><i class="fa-brands fa-linkedin-in"></i></a>` : ''}
      ${s.email ? `<a href="mailto:${s.email}" class="social-icon social-email track-click" data-event="emailClicks" title="Send Email - Mohammad Ashif" aria-label="Email"><i class="fa-solid fa-envelope"></i></a>` : ''}
      <a href="${waChat}" target="_blank" rel="noopener noreferrer" class="social-icon social-whatsapp track-click" data-event="contactClicks" title="WhatsApp Message (+91 6202782715 - Msg Only)" aria-label="WhatsApp Chat"><i class="fa-brands fa-whatsapp"></i></a>
    `;
  }

  const footerConnect = document.getElementById('footer-connect-links');
  if (footerConnect) {
    const waChat = s.whatsappDirect || 'https://wa.me/916202782715?text=Hi%20Mohammad%20Ashif';
    footerConnect.innerHTML = `
      ${s.github ? `<li><a href="${s.github}" target="_blank" rel="noopener noreferrer" class="track-click" data-event="githubClicks">GitHub</a></li>` : ''}
      ${s.linkedin ? `<li><a href="${s.linkedin}" target="_blank" rel="noopener noreferrer" class="track-click" data-event="linkedinClicks">LinkedIn</a></li>` : ''}
      ${s.email ? `<li><a href="mailto:${s.email}" class="track-click" data-event="emailClicks">Email Me</a></li>` : ''}
      <li><a href="${waChat}" target="_blank" rel="noopener noreferrer" class="track-click" data-event="contactClicks">WhatsApp Message (+91 6202782715)</a></li>
      ${s.whatsapp ? `<li><a href="${s.whatsapp}" target="_blank" rel="noopener noreferrer" class="track-click" data-event="contactClicks">WhatsApp Channel</a></li>` : ''}
    `;
  }
}

// Global Event Listeners for Profile Synchronization across windows & tabs
window.addEventListener('storage', () => {
  if (typeof renderAllSections === 'function') renderAllSections();
});
window.addEventListener('ashif_profile_updated', () => {
  if (typeof renderAllSections === 'function') renderAllSections();
});

function renderSkills() {
  const container = document.getElementById('skills-grid');
  if (!container) return;
  const skills = window.ashifStorage.getSkills();

  container.innerHTML = skills.map(skill => `
    <div class="glass-card skill-card hover-lift">
      <div class="skill-header">
        <div class="skill-title-group">
          <div class="skill-icon-badge">${skill.icon || '⚡'}</div>
          <div>
            <span class="skill-name">${skill.name}</span>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">${skill.category || 'Frontend'}</div>
          </div>
        </div>
        <span class="skill-percent">${skill.percentage}%</span>
      </div>
      <div class="skill-progress-track">
        <div class="skill-progress-bar" style="width: ${skill.percentage}%"></div>
      </div>
    </div>
  `).join('');
}

function renderProjects(projectsList) {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  if (!projectsList || projectsList.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; background: var(--card-bg); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);"><p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 1rem;">No projects found matching your search criteria.</p><button class="btn btn-secondary" onclick="resetProjectFilters()">Reset Filters</button></div>`;
    return;
  }

  container.innerHTML = projectsList.map(p => {
    const isBookmarked = window.ashifStorage ? window.ashifStorage.isProjectBookmarked(p.id) : false;
    const fallback = p.fallbackImage || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';

    return `
      <div class="glass-card project-card hover-lift" data-category="${p.category}" id="project-card-${p.id}">
        <div class="project-thumb-container">
          <img src="${p.image}" alt="${p.title}" loading="lazy" referrerPolicy="no-referrer" onerror="this.onerror=null; this.src='${fallback}';" />
          <div class="project-overlay-badge-group" style="position: absolute; top: 0.75rem; left: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap; z-index: 2;">
            ${p.featured ? `<span class="project-featured-tag" style="background: rgba(37, 99, 235, 0.9); backdrop-filter: blur(4px); color: #fff; padding: 0.25rem 0.65rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700;">★ Featured</span>` : ''}
            <span class="project-date-tag" style="background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); color: #fff; padding: 0.25rem 0.65rem; border-radius: var(--radius-full); font-size: 0.75rem;">${p.category}</span>
          </div>

          <!-- Quick Action Buttons on Hover Overlay -->
          <div class="project-thumb-overlay-actions" style="position: absolute; top: 0.75rem; right: 0.75rem; display: flex; gap: 0.4rem; z-index: 2;">
            <button class="btn-icon-sm project-bookmark-btn ${isBookmarked ? 'active' : ''}" onclick="event.stopPropagation(); toggleBookmarkProject('${p.id}')" title="${isBookmarked ? 'Bookmarked' : 'Bookmark Project'}" style="background: rgba(15,23,42,0.7); backdrop-filter: blur(4px); color: ${isBookmarked ? '#f59e0b' : '#fff'}; border: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer;">
              ${isBookmarked ? '🔖' : '📑'}
            </button>
            <button class="btn-icon-sm" onclick="event.stopPropagation(); shareProject('${p.id}')" title="Share Project" style="background: rgba(15,23,42,0.7); backdrop-filter: blur(4px); color: #fff; border: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer;">
              🔗
            </button>
          </div>
        </div>

        <div class="project-body" style="display: flex; flex-direction: column; flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <span class="project-category" style="font-weight: 600; font-size: 0.8rem; color: var(--primary-blue);">${p.category}</span>
            <div style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.775rem; color: var(--text-muted);">
              <span>👁 ${p.views || 120}</span>
              <button onclick="event.stopPropagation(); handleLikeProject('${p.id}')" style="background: none; border: none; cursor: pointer; font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.25rem; font-weight: 600;" id="like-count-${p.id}">
                ❤️ <span>${p.likes || 15}</span>
              </button>
            </div>
          </div>

          <h3 class="project-title" style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; cursor: pointer;" onclick="openCaseStudyModal('${p.id}')">${p.title}</h3>
          <p class="project-desc" style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 0.75rem;">${p.description}</p>

          ${Array.isArray(p.features) && p.features.length > 0 ? `
            <div class="project-features-tags" style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.85rem;">
              ${p.features.slice(0, 4).map(f => `<span class="feature-pill" style="font-size: 0.725rem; padding: 0.2rem 0.55rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-secondary);"><i class="fa-solid fa-check" style="font-size: 0.6rem; color: #10b981; margin-right: 0.25rem;"></i> ${f}</span>`).join('')}
            </div>
          ` : ''}

          <div class="project-tech-stack" style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: auto; margin-bottom: 1.15rem;">
            ${(p.technology || []).map(t => `<span class="tech-badge" style="font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; background: rgba(37, 99, 235, 0.08); color: var(--primary-blue); border-radius: var(--radius-full);">${t}</span>`).join('')}
          </div>

          <div class="project-actions" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: auto;">
            ${p.demo ? `<a href="${p.demo}" target="_blank" rel="noopener noreferrer" onclick="trackProjectClick('${p.id}', 'live')" class="btn btn-primary track-click" data-event="liveDemoClicks" style="flex: 1; min-width: 100px; padding: 0.5rem 0.75rem; font-size: 0.825rem; text-align: center;"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.75rem; margin-right: 0.35rem;"></i> Live Demo</a>` : ''}
            ${p.github ? `<a href="${p.github}" target="_blank" rel="noopener noreferrer" onclick="trackProjectClick('${p.id}', 'github')" class="btn btn-secondary track-click" data-event="githubClicks" style="flex: 1; min-width: 90px; padding: 0.5rem 0.75rem; font-size: 0.825rem; text-align: center;"><i class="fa-brands fa-github" style="font-size: 0.85rem; margin-right: 0.35rem;"></i> GitHub</a>` : ''}
            <button onclick="openHireModal('${p.title}')" class="btn btn-sky btn-project-hire track-click" data-event="hireMeClicks" style="padding: 0.5rem 0.85rem; font-size: 0.825rem;"><i class="fa-solid fa-rocket" style="font-size: 0.75rem; margin-right: 0.35rem;"></i> Hire Me</button>
            <button onclick="openCaseStudyModal('${p.id}')" class="btn btn-secondary" style="padding: 0.5rem 0.65rem; font-size: 0.825rem;" title="View Case Study Breakdown">📖 Case Study</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderAchievements() {
  const container = document.getElementById('achievements-grid');
  if (!container) return;
  const items = window.ashifStorage.getAchievements();

  container.innerHTML = items.map(a => `
    <div class="glass-card achievement-card hover-lift">
      <div class="achievement-icon">🏆</div>
      <h4 style="font-size: 1.1rem;">${a.name}</h4>
      <p style="font-size: 0.875rem; color: var(--text-secondary);">${a.description}</p>
      <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; color: var(--sky-blue); margin-top: auto;">
        <span>${a.category}</span>
        <span>${a.year}</span>
      </div>
    </div>
  `).join('');
}

function renderCertificates() {
  const container = document.getElementById('certificates-grid');
  if (!container) return;
  const certs = window.ashifStorage.getCertificates();

  container.innerHTML = certs.map(c => `
    <div class="glass-card hover-lift" style="overflow: hidden; cursor: pointer;" onclick="openImageLightbox('${c.image}', '${c.title}')">
      <img src="${c.image}" alt="${c.title}" style="width: 100%; height: 160px; object-fit: cover;" />
      <div style="padding: 1.25rem;">
        <h4 style="font-size: 1rem; margin-bottom: 0.25rem;">${c.title}</h4>
        <p style="font-size: 0.825rem; color: var(--text-muted);">${c.organization} • ${c.issueDate}</p>
      </div>
    </div>
  `).join('');
}

/* -------------------------------------------------------------------------- */
/* Location & Currency Detection                                              */
/* -------------------------------------------------------------------------- */
function detectVisitorLocationCurrency() {
  const pref = localStorage.getItem('ashif_currency_pref');

  if (pref === 'INR') {
    return { currency: 'INR', symbol: '₹', region: 'India', isIndia: true, isManual: true };
  }
  if (pref === 'USD') {
    return { currency: 'USD', symbol: '$', region: 'International', isIndia: false, isManual: true };
  }

  let isIndia = false;

  // 1. Check browser timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('India')) {
      isIndia = true;
    }
  } catch (e) {}

  // 2. Check browser languages
  if (!isIndia && typeof navigator !== 'undefined') {
    const langs = navigator.languages || [navigator.language || ''];
    for (const lang of langs) {
      if (lang && (lang.endsWith('-IN') || lang.endsWith('_IN') || lang.toLowerCase() === 'hi' || lang.toLowerCase() === 'bn')) {
        isIndia = true;
        break;
      }
    }
  }

  return {
    currency: isIndia ? 'INR' : 'USD',
    symbol: isIndia ? '₹' : '$',
    region: isIndia ? 'India (IN)' : 'International',
    isIndia: isIndia,
    isManual: false
  };
}

window.setCurrencyPreference = function(pref) {
  if (pref === 'auto') {
    localStorage.removeItem('ashif_currency_pref');
  } else {
    localStorage.setItem('ashif_currency_pref', pref);
  }
  renderServices();
  if (window.showToast) {
    const loc = detectVisitorLocationCurrency();
    window.showToast(`Switched currency view to ${loc.currency} (${loc.symbol})`, 'info');
  }
};

window.selectServiceForContact = function(serviceTitle, priceStr, advanceStr) {
  window.open('https://ashif-freelance-platform.vercel.app/', '_blank');
};

function renderServices() {
  const container = document.getElementById('services-grid');
  if (!container) return;

  const loc = detectVisitorLocationCurrency();
  const services = window.ashifStorage.getServices();

  // Update button active states
  const autoBtn = document.getElementById('btn-curr-auto');
  const inrBtn = document.getElementById('btn-curr-inr');
  const usdBtn = document.getElementById('btn-curr-usd');
  const pref = localStorage.getItem('ashif_currency_pref');

  if (autoBtn) autoBtn.classList.toggle('active', !pref);
  if (inrBtn) inrBtn.classList.toggle('active', pref === 'INR');
  if (usdBtn) usdBtn.classList.toggle('active', pref === 'USD');

  // Update label
  const labelText = document.getElementById('location-label-text');
  if (labelText) {
    labelText.innerHTML = `Pricing shown according to your location (${loc.region} • <strong>${loc.currency} ${loc.symbol}</strong>)`;
  }

  container.innerHTML = services.map(s => {
    const displayPrice = loc.isIndia ? (s.priceINR || '₹999') : (s.priceUSD || '$20');
    const advanceText = loc.isIndia ? (s.advanceINR || '₹199 Only') : (s.advanceUSD || '$4');
    const btnText = s.buttonText || (s.id === 'pkg_custom' ? 'Request Quote' : `Book Now – ${advanceText}`);
    const featuresList = Array.isArray(s.features) ? s.features : [];
    const suitableList = Array.isArray(s.suitableFor) ? s.suitableFor : [];

    let badgeHtml = '';
    if (s.badge) {
      let badgeClass = 'badge-popular';
      const bLower = s.badge.toLowerCase();
      if (bLower.includes('best') || bLower.includes('value')) badgeClass = 'badge-bestvalue';
      else if (bLower.includes('adv') || bLower.includes('pro')) badgeClass = 'badge-advanced';
      else if (bLower.includes('cust')) badgeClass = 'badge-custom';

      badgeHtml = `<span class="package-badge ${badgeClass}"><i class="fa-solid fa-star"></i> ${s.badge}</span>`;
    }

    return `
      <div class="glass-card service-card hover-lift" id="${s.id}">
        <div class="service-card-top">
          <div class="service-icon">${s.icon || '<i class="fa-solid fa-paper-plane"></i>'}</div>
          <div class="package-badge-wrapper">
            ${badgeHtml}
            <span class="service-category-badge">${s.category || 'Web Solution'}</span>
          </div>
        </div>

        <h3 class="service-title">${s.title}</h3>
        <p class="service-desc">${s.description}</p>

        <!-- Price & Booking Advance Box -->
        <div class="service-price-box">
          <div class="service-price-label">${s.id === 'pkg_custom' ? 'Starting From' : 'Package Price'}</div>
          <div class="service-price-amount">${displayPrice}</div>
          <div class="booking-advance-pill">
            <i class="fa-solid fa-shield-halved"></i>
            <span>${s.id === 'pkg_custom' ? 'Advance' : 'Booking Advance'}: <strong>${advanceText}</strong></span>
          </div>
        </div>

        <!-- Suitable For Chips (if present) -->
        ${suitableList.length > 0 ? `
          <div class="suitable-for-box">
            <div class="suitable-for-title">Suitable For:</div>
            <div class="suitable-chips-flex">
              ${suitableList.map(st => `<span class="suitable-chip">${st}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Features List -->
        ${featuresList.length > 0 ? `
          <div class="service-features-list">
            ${featuresList.map(f => `
              <div class="service-feature-item">
                <i class="fa-solid fa-check" style="color: #10b981; font-weight: 800; font-size: 0.9rem;"></i>
                <span>${f}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <a href="https://ashif-freelance-platform.vercel.app/" target="_blank" rel="noopener noreferrer" class="btn btn-primary service-order-btn">
          <span>${btnText}</span>
          <i class="fa-solid fa-arrow-right" style="font-size: 0.85rem;"></i>
        </a>
      </div>
    `;
  }).join('');
}

function renderTestimonials() {
  const container = document.getElementById('testimonials-grid');
  if (!container) return;
  const list = window.ashifStorage.getTestimonials();

  container.innerHTML = list.map(t => `
    <div class="glass-card testimonial-card hover-lift">
      <div class="star-rating">
        ${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}
      </div>
      <p style="font-style: italic; font-size: 0.925rem; color: var(--text-primary);">"${t.review}"</p>
      <div class="testimonial-user">
        <img src="${t.photo}" alt="${t.clientName}" class="user-avatar" />
        <div>
          <h4 style="font-size: 0.95rem;">${t.clientName}</h4>
          <p style="font-size: 0.8rem; color: var(--text-muted);">${t.company}</p>
        </div>
      </div>
    </div>
  `).join('');
}

function renderBlogs() {
  const container = document.getElementById('blogs-grid');
  if (!container) return;
  const blogs = window.ashifStorage.getBlogs();

  container.innerHTML = blogs.map(b => `
    <div class="glass-card blog-card hover-lift">
      <div class="blog-content">
        <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary-blue); text-transform: uppercase;">${b.tag}</span>
        <h3 style="font-size: 1.15rem;">${b.title}</h3>
        <p style="font-size: 0.875rem; color: var(--text-secondary); flex: 1;">${b.excerpt}</p>
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">
          <span>${b.date}</span>
          <span>${b.readTime}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function updateFooterDetails() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* -------------------------------------------------------------------------- */
/* 5. Project Filters, Sorting & Interactive Controls                          */
/* -------------------------------------------------------------------------- */
function initProjectFiltersAndSearch() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('project-search-input');
  const sortSelect = document.getElementById('project-sort-select');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyProjectFilters();
    });
  });

  searchInput?.addEventListener('input', () => {
    applyProjectFilters();
  });

  sortSelect?.addEventListener('change', () => {
    applyProjectFilters();
  });

  initHireMeForm();
}

function applyProjectFilters() {
  if (!window.ashifStorage) return;
  const activeCategory = document.querySelector('.filter-btn.active')?.dataset.filter || 'All';
  const searchTerm = (document.getElementById('project-search-input')?.value || '').toLowerCase();
  const sortOption = document.getElementById('project-sort-select')?.value || 'featured';

  let projects = window.ashifStorage.getProjects();

  if (activeCategory !== 'All') {
    projects = projects.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
  }

  if (searchTerm.trim() !== '') {
    projects = projects.filter(p => 
      p.title.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      (p.features || []).some(f => f.toLowerCase().includes(searchTerm)) ||
      (p.technology || []).some(t => t.toLowerCase().includes(searchTerm))
    );
  }

  // Sorting logic
  if (sortOption === 'popular') {
    projects.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (sortOption === 'views') {
    projects.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else if (sortOption === 'newest') {
    projects.sort((a, b) => new Date(b.completionDate || '2026-01-01') - new Date(a.completionDate || '2026-01-01'));
  } else if (sortOption === 'title') {
    projects.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    // Featured first
    projects.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  renderProjects(projects);
}

function resetProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(b => b.classList.remove('active'));
  filterBtns[0]?.classList.add('active');

  const searchInput = document.getElementById('project-search-input');
  if (searchInput) searchInput.value = '';

  const sortSelect = document.getElementById('project-sort-select');
  if (sortSelect) sortSelect.value = 'featured';

  applyProjectFilters();
}

/* Interactive Project Handlers */
function handleLikeProject(projectId) {
  if (!window.ashifStorage) return;
  const newLikes = window.ashifStorage.likeProject(projectId);
  const countEl = document.querySelector(`#like-count-${projectId} span`);
  if (countEl) countEl.textContent = newLikes;
  showToast('❤️ Project Liked! Thanks for your feedback.', 'success');
}

function toggleBookmarkProject(projectId) {
  if (!window.ashifStorage) return;
  const isBookmarked = window.ashifStorage.bookmarkProject(projectId);
  showToast(isBookmarked ? '🔖 Project saved to bookmarks!' : 'Removed from bookmarks.', 'info');
  applyProjectFilters();
}

function shareProject(projectId) {
  const projects = window.ashifStorage ? window.ashifStorage.getProjects() : [];
  const p = projects.find(item => item.id === projectId);
  const shareUrl = p ? (p.demo || window.location.href) : window.location.href;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('🔗 Project demo link copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Project link: ' + shareUrl, 'info');
    });
  } else {
    showToast('Project link: ' + shareUrl, 'info');
  }
}

function trackProjectClick(projectId, type) {
  if (window.ashifStorage) {
    window.ashifStorage.incrementProjectView(projectId);
  }
}

/* Case Study Lightbox Modal */
function openCaseStudyModal(projectId) {
  const projects = window.ashifStorage ? window.ashifStorage.getProjects() : [];
  const p = projects.find(item => item.id === projectId);
  if (!p) return;

  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content-body');
  if (!overlay || !content) return;

  const fallback = p.fallbackImage || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';

  content.innerHTML = `
    <div style="padding: 0.5rem;">
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
        <span class="project-featured-tag" style="background: var(--primary-blue); color: #fff; padding: 0.25rem 0.65rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700;">${p.category}</span>
        <span style="font-size: 0.75rem; color: var(--text-muted); align-self: center;">Completed: ${p.completionDate || '2026'}</span>
      </div>

      <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 0.75rem; color: var(--text-primary);">${p.title}</h2>
      
      <div style="border-radius: var(--radius-md); overflow: hidden; margin-bottom: 1.25rem; border: 1px solid var(--border-color); background: #000;">
        <img src="${p.image}" alt="${p.title}" style="width: 100%; max-height: 380px; object-fit: cover;" onerror="this.onerror=null; this.src='${fallback}';" />
      </div>

      <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.35rem;">Overview & Business Impact</h4>
      <p style="font-size: 0.925rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.25rem;">${p.description}</p>

      <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem;">Key Technical Features</h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; margin-bottom: 1.25rem;">
        ${(p.features || []).map(f => `
          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; padding: 0.5rem; background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <i class="fa-solid fa-check-circle" style="color: #10b981;"></i>
            <span>${f}</span>
          </div>
        `).join('')}
      </div>

      <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem;">Technologies & Tools</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.5rem;">
        ${(p.technology || []).map(t => `<span class="tech-badge" style="font-size: 0.8rem; font-weight: 600; padding: 0.25rem 0.7rem; background: rgba(37, 99, 235, 0.1); color: var(--primary-blue); border-radius: var(--radius-full);">${t}</span>`).join('')}
      </div>

      <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
        ${p.demo ? `<a href="${p.demo}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="flex: 1; min-width: 120px; text-align: center;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Launch Live Website</a>` : ''}
        ${p.github ? `<a href="${p.github}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="flex: 1; min-width: 110px; text-align: center;"><i class="fa-brands fa-github"></i> View GitHub Code</a>` : ''}
        <button onclick="document.getElementById('modal-overlay').classList.remove('show'); openHireModal('${p.title}');" class="btn btn-sky" style="flex: 1; min-width: 140px; text-align: center;"><i class="fa-solid fa-rocket"></i> Hire Me for Similar App</button>
      </div>
    </div>
  `;

  overlay.classList.add('show');
}

/* Premium Hire Me Modal Handlers */
function openHireModal(projectTitle = '') {
  const overlay = document.getElementById('hire-modal-overlay');
  const detailsInput = document.getElementById('hire-details');
  const successBox = document.getElementById('hire-success-box');
  const form = document.getElementById('hire-project-form');

  if (successBox) successBox.style.display = 'none';
  if (form) form.style.display = 'flex';

  if (projectTitle && detailsInput && !detailsInput.value) {
    detailsInput.value = `Hi Mohammad Ashif, I saw your "${projectTitle}" project and would like to build a similar high-quality website for my business!`;
  }

  if (overlay) overlay.classList.add('show');
}

function closeHireModal() {
  const overlay = document.getElementById('hire-modal-overlay');
  if (overlay) overlay.classList.remove('show');
}

function initHireMeForm() {
  const form = document.getElementById('hire-project-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('hire-name').value.trim();
    const email = document.getElementById('hire-email').value.trim();
    const phone = document.getElementById('hire-phone').value.trim();
    const company = document.getElementById('hire-company')?.value.trim() || '';
    const country = document.getElementById('hire-country').value.trim();
    const budget = document.getElementById('hire-budget').value;
    const timeline = document.getElementById('hire-timeline').value;
    const projectType = document.getElementById('hire-type').value;
    const details = document.getElementById('hire-details').value.trim();
    const contactMethod = document.getElementById('hire-contact-method')?.value || 'WhatsApp';
    
    const fileInput = document.getElementById('hire-attachment');
    const attachmentName = fileInput && fileInput.files.length > 0 ? fileInput.files[0].name : 'None';

    const enquiryId = 'ENQ-' + Math.floor(10000 + Math.random() * 90000);

    const messageData = {
      enquiryId,
      senderName: name,
      email: email,
      phone: phone,
      company: company,
      country: country,
      budget: budget,
      timeline: timeline,
      projectType: projectType,
      subject: `[${enquiryId}] ${projectType} Request - ${name}`,
      serviceRequested: projectType,
      message: details,
      attachmentName: attachmentName,
      contactMethod: contactMethod,
      targetEmail: 'mohdashif.dev@gmail.com'
    };

    if (window.ashifStorage) {
      window.ashifStorage.addMessage(messageData);
      window.ashifStorage.trackEvent('hireMeClicks');
    }

    // Attempt backend sync if available
    fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    }).catch(() => {});

    // Show Success State inside modal
    form.style.display = 'none';
    const successBox = document.getElementById('hire-success-box');
    const displayId = document.getElementById('enquiry-id-display');
    const waBtn = document.getElementById('whatsapp-direct-link');

    if (displayId) displayId.textContent = '#' + enquiryId;

    if (waBtn) {
      const waText = encodeURIComponent(`Hi Mohammad Ashif, I submitted project enquiry #${enquiryId}.\nName: ${name}\nProject: ${projectType}\nBudget: ${budget}\nDetails: ${details}`);
      waBtn.href = `https://wa.me/916202782715?text=${waText}`;
    }

    if (successBox) successBox.style.display = 'block';
    showToast(`✅ Project Enquiry #${enquiryId} submitted successfully!`, 'success');
  });
}

window.openHireModal = openHireModal;
window.closeHireModal = closeHireModal;
window.openCaseStudyModal = openCaseStudyModal;
window.handleLikeProject = handleLikeProject;
window.toggleBookmarkProject = toggleBookmarkProject;
window.shareProject = shareProject;
window.trackProjectClick = trackProjectClick;
window.resetProjectFilters = resetProjectFilters;

/* -------------------------------------------------------------------------- */
/* 6. Contact Form & Service Select                                           */
/* -------------------------------------------------------------------------- */
function selectServiceForContact(serviceTitle) {
  const serviceSelect = document.getElementById('contact-service-select');
  const contactSection = document.getElementById('contact');
  if (serviceSelect) serviceSelect.value = serviceTitle;
  contactSection?.scrollIntoView({ behavior: 'smooth' });
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const service = document.getElementById('contact-service-select').value;
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (window.ashifStorage) {
      window.ashifStorage.addMessage({
        senderName: name,
        email: email,
        subject: subject || 'General Inquiry',
        serviceRequested: service,
        message: message
      });
    }

    showToast('Thank you! Your message has been sent successfully.', 'success');
    form.reset();
  });
}

/* -------------------------------------------------------------------------- */
/* 7. Toast & Lightbox Modals                                                 */
/* -------------------------------------------------------------------------- */
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span>${msg}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function openImageLightbox(imgSrc, title) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content-body');
  if (!overlay || !content) return;

  content.innerHTML = `
    <h3 style="margin-bottom: 1rem; font-size: 1.25rem;">${title}</h3>
    <img src="${imgSrc}" alt="${title}" style="width: 100%; max-height: 70vh; object-fit: contain; border-radius: var(--radius-md);" />
  `;

  overlay.classList.add('show');
}

function initToastAndLightboxes() {
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const overlay = document.getElementById('modal-overlay');

  modalCloseBtn?.addEventListener('click', () => overlay?.classList.remove('show'));
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('show');
  });
}

/* -------------------------------------------------------------------------- */
/* 8. Analytics Click Trackers                                                */
/* -------------------------------------------------------------------------- */
function initAnalyticsTrackers() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button, .track-click');
    if (!target) return;

    let eventName = target.dataset.event;
    const href = target.getAttribute('href') || '';
    const text = (target.textContent || '').toLowerCase();

    // Auto-detect event type if not explicitly set on element
    if (!eventName) {
      if (href.includes('github.com') || text.includes('github')) {
        eventName = href.includes('github.com/ashiffrontend/') && !href.endsWith('ashiffrontend') ? 'projectGithubClick' : 'githubClick';
      } else if (href.includes('linkedin.com') || text.includes('linkedin')) {
        eventName = 'linkedinClick';
      } else if (href.includes('wa.me') || href.includes('whatsapp') || text.includes('whatsapp')) {
        eventName = 'whatsappClick';
      } else if (href.startsWith('mailto:') || text.includes('email')) {
        eventName = 'emailClick';
      } else if (href.startsWith('tel:') || text.includes('call')) {
        eventName = 'callClick';
      } else if (text.includes('resume') || href.includes('resume')) {
        eventName = 'resumeDownload';
      } else if (text.includes('hire me') || target.id === 'hire-me-btn' || href.includes('#contact')) {
        eventName = 'hireMeClick';
      } else if (text.includes('live demo') || text.includes('preview') || target.classList.contains('demo-btn')) {
        eventName = 'liveDemoClick';
      } else if (href.includes('#services') || text.includes('services')) {
        eventName = 'servicesClick';
      } else if (href.includes('#blog') || text.includes('blog')) {
        eventName = 'blogClick';
      } else if (href.includes('#certificates') || text.includes('certificate')) {
        eventName = 'certificatesClick';
      } else if (href.includes('#testimonials') || text.includes('testimonial')) {
        eventName = 'testimonialsClick';
      } else if (href.includes('#contact') || text.includes('contact')) {
        eventName = 'contactClick';
      }
    }

    if (eventName) {
      if (window.trackCustomEvent) {
        window.trackCustomEvent(eventName);
      } else if (window.ashifStorage) {
        window.ashifStorage.trackEvent(eventName);
      }
    }
  });

  const resumeBtn = document.getElementById('resume-download-btn');
  resumeBtn?.addEventListener('click', () => {
    if (window.trackCustomEvent) {
      window.trackCustomEvent('resumeDownload');
    } else if (window.ashifStorage) {
      window.ashifStorage.trackEvent('resumeDownloads');
    }
    showToast('Downloading Mohammad Ashif Resume...', 'success');
  });
}

/* -------------------------------------------------------------------------- */
/* 9. Scroll Reveal Animations                                                */
/* -------------------------------------------------------------------------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => observer.observe(el));
}

window.openImageLightbox = openImageLightbox;
window.selectServiceForContact = selectServiceForContact;
window.showToast = showToast;

window.addEventListener('ashif_profile_updated', () => renderAllSections());
window.addEventListener('storage', () => renderAllSections());
