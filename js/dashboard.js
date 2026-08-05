/**
 * ADMIN DASHBOARD VIEWS & CRUD ENGINE
 */

let analyticsPollInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  renderAdminDashboardViews();

  // Setup live 3-second auto refresh for admin analytics
  if (!analyticsPollInterval) {
    analyticsPollInterval = setInterval(() => {
      fetchRealAnalyticsData();
    }, 3000);
  }
});

function renderAdminDashboardViews() {
  if (!window.ashifStorage) return;

  renderDashboardKPIs();
  renderProjectsTable();
  renderTestimonialsAdmin();
  renderBlogAdmin();
  renderClientsInvoicesAdmin();
  renderNotificationsAdmin();
  renderSkillsAdmin();
  renderCertificatesAdmin();
  renderAchievementsAdmin();
  renderServicesAdmin();
  renderMessagesAdmin();
  renderClickAnalyticsAdmin();
  renderVisitorAnalyticsAdmin();
  renderResumeAdmin();
  renderProfileAdmin();
  renderSettingsAdmin();

  fetchRealAnalyticsData();
}

async function fetchRealAnalyticsData() {
  try {
    const res = await fetch('/api/analytics/stats');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.visitors && data.summary) {
        window.ashifStorage.saveVisitors(data.visitors);
        window.ashifStorage.setItem(STORAGE_KEYS.ANALYTICS, data.summary);
        
        // Update live KPI counts & charts
        updateLiveAnalyticsUI(data.visitors, data.summary);
      }
    }
  } catch (err) {
    console.debug("Backend analytics polling fallback...");
  }
}

function updateLiveAnalyticsUI(v, a) {
  const kpiVisitors = document.getElementById('kpi-total-visitors');
  if (kpiVisitors) kpiVisitors.textContent = (v.total || 0).toLocaleString();

  renderOverviewCharts(v.weeklyGraph || []);
  renderVisitorAnalyticsAdminUI(v);
  renderClickAnalyticsAdminUI(a);
}

/* -------------------------------------------------------------------------- */
/* 1. Dashboard Overview KPIs & Main Chart                                    */
/* -------------------------------------------------------------------------- */
function renderDashboardKPIs() {
  const projects = window.ashifStorage.getProjects();
  const certs = window.ashifStorage.getCertificates();
  const visitors = window.ashifStorage.getVisitors();
  const messages = window.ashifStorage.getMessages();
  const skills = window.ashifStorage.getSkills();

  const kpiProjects = document.getElementById('kpi-total-projects');
  const kpiCerts = document.getElementById('kpi-total-certs');
  const kpiVisitors = document.getElementById('kpi-total-visitors');
  const kpiMessages = document.getElementById('kpi-total-messages');
  const kpiSkills = document.getElementById('kpi-total-skills');

  if (kpiProjects) kpiProjects.textContent = projects.length;
  if (kpiCerts) kpiCerts.textContent = certs.length;
  if (kpiVisitors) kpiVisitors.textContent = (visitors.total || 0).toLocaleString();
  if (kpiMessages) kpiMessages.textContent = messages.length;
  if (kpiSkills) kpiSkills.textContent = skills.length;

  const unreadCount = messages.filter(m => !m.replied).length;
  const badge = document.getElementById('unread-messages-badge');
  if (badge) {
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
  }

  renderOverviewCharts(visitors.weeklyGraph || []);
}

function renderOverviewCharts(weeklyGraphData = []) {
  const chartWrapper = document.getElementById('visitor-trend-chart');
  if (!chartWrapper) return;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  let values = [0, 0, 0, 0, 0, 0, 0];
  let labels = days;

  if (weeklyGraphData && weeklyGraphData.length > 0) {
    labels = weeklyGraphData.map(item => item.day || 'Day');
    values = weeklyGraphData.map(item => item.count || 0);
  }

  const maxVal = Math.max(...values, 1);
  const totalVisits = values.reduce((sum, v) => sum + v, 0);

  if (totalVisits === 0) {
    chartWrapper.innerHTML = `
      <div style="height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px dashed var(--border-light); border-radius: var(--radius-md); color: var(--text-muted); text-align: center; padding: 1.5rem;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
        <strong style="font-size: 1rem; color: var(--text-main);">No Traffic Recorded Yet</strong>
        <p style="font-size: 0.85rem; margin-top: 0.25rem;">Visit your main portfolio page to generate real-time analytics data!</p>
      </div>
    `;
    return;
  }

  const barsSvg = labels.map((day, idx) => {
    const height = Math.max((values[idx] / maxVal) * 150, 4);
    const x = idx * 62 + 20;
    const y = 180 - height;
    return `
      <g class="chart-bar-group">
        <rect x="${x}" y="${y}" width="36" height="${height}" rx="6" fill="url(#barGrad)"/>
        <text x="${x + 18}" y="205" font-size="12" fill="var(--text-muted)" text-anchor="middle">${day}</text>
        <text x="${x + 18}" y="${y - 8}" font-size="11" font-weight="bold" fill="var(--primary-blue)" text-anchor="middle">${values[idx]}</text>
      </g>
    `;
  }).join('');

  chartWrapper.innerHTML = `
    <svg width="100%" height="220" viewBox="0 0 460 220" style="overflow: visible;">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2563eb"/>
          <stop offset="100%" stop-color="#38bdf8"/>
        </linearGradient>
      </defs>
      ${barsSvg}
    </svg>
  `;
}

/* -------------------------------------------------------------------------- */
/* 2. Projects Manager (CRUD)                                                 */
/* -------------------------------------------------------------------------- */
function renderProjectsTable() {
  const tableBody = document.getElementById('projects-table-body');
  if (!tableBody) return;

  const projects = window.ashifStorage.getProjects();

  tableBody.innerHTML = projects.map(p => `
    <tr>
      <td><img src="${p.image}" class="table-thumb" alt="${p.title}" /></td>
      <td><strong>${p.title}</strong></td>
      <td><span class="admin-badge-pill">${p.category}</span></td>
      <td>${(p.technology || []).join(', ')}</td>
      <td>${p.featured ? '⭐ Yes' : 'No'}</td>
      <td>${p.completionDate || '2026'}</td>
      <td>
        <div class="action-btn-group">
          <button class="btn-icon-sm" onclick="openProjectModal('${p.id}')" title="Edit">✏️</button>
          <button class="btn-icon-sm delete" onclick="deleteProject('${p.id}')" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openProjectModal(projectId = null) {
  const overlay = document.getElementById('admin-modal-overlay');
  const body = document.getElementById('admin-modal-body');
  if (!overlay || !body) return;

  const projects = window.ashifStorage.getProjects();
  const p = projectId ? projects.find(item => item.id === projectId) : null;

  body.innerHTML = `
    <h3 style="margin-bottom: 1.25rem;">${p ? 'Edit Project' : 'Add New Project'}</h3>
    <form id="project-form" style="display: flex; flex-direction: column; gap: 1rem;">
      <input type="hidden" id="project-id" value="${p ? p.id : ''}" />
      
      <div class="form-group">
        <label>Project Name *</label>
        <input type="text" id="p-title" class="form-input" value="${p ? p.title : ''}" placeholder="e.g. Startup Landing Page" required />
      </div>

      <div class="form-group">
        <label>Category *</label>
        <select id="p-category" class="form-select">
          <option value="Landing Page" ${p && p.category === 'Landing Page' ? 'selected' : ''}>Landing Page</option>
          <option value="Education Website" ${p && p.category === 'Education Website' ? 'selected' : ''}>Education Website</option>
          <option value="Healthcare Website" ${p && p.category === 'Healthcare Website' ? 'selected' : ''}>Healthcare Website</option>
          <option value="Business Website" ${p && p.category === 'Business Website' ? 'selected' : ''}>Business Website</option>
          <option value="Healthcare / E-commerce" ${p && p.category === 'Healthcare / E-commerce' ? 'selected' : ''}>Healthcare / E-commerce</option>
          <option value="Web Apps" ${p && p.category === 'Web Apps' ? 'selected' : ''}>Web Apps</option>
          <option value="UI Design" ${p && p.category === 'UI Design' ? 'selected' : ''}>UI Design</option>
        </select>
      </div>

      <div class="form-group">
        <label>Project Image / Screenshot URL *</label>
        <input type="text" id="p-image" class="form-input" value="${p ? p.image : ''}" placeholder="assets/projects/startup.png or URL" required />
        <div style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem;">
          <span>Or Upload Screenshot From Device:</span>
          <input type="file" id="p-image-file" accept="image/*" style="font-size: 0.8rem;" />
        </div>
      </div>

      <div class="form-group">
        <label>Description *</label>
        <textarea id="p-desc" class="form-textarea" placeholder="Detailed description of the project..." required>${p ? p.description : ''}</textarea>
      </div>

      <div class="form-group">
        <label>Project Features (comma or line separated)</label>
        <textarea id="p-features" class="form-textarea" style="height: 70px;" placeholder="Modern Hero Section, Responsive Design, Smooth Animations">${p && p.features ? p.features.join(', ') : ''}</textarea>
      </div>

      <div class="form-group">
        <label>Technology Stack (comma separated)</label>
        <input type="text" id="p-tech" class="form-input" value="${p ? (p.technology || []).join(', ') : ''}" placeholder="HTML5, CSS3, JavaScript, Vercel" />
      </div>

      <div class="form-group">
        <label>GitHub Repository Link</label>
        <input type="url" id="p-github" class="form-input" value="${p ? p.github || '' : ''}" placeholder="https://github.com/ashiffrontend/..." />
      </div>

      <div class="form-group">
        <label>Live Demo URL</label>
        <input type="url" id="p-demo" class="form-input" value="${p ? p.demo || '' : ''}" placeholder="https://....vercel.app/" />
      </div>

      <div class="form-group">
        <label>Completion Date</label>
        <input type="date" id="p-date" class="form-input" value="${p ? p.completionDate || '2026-07-15' : '2026-08-01'}" />
      </div>

      <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
        <input type="checkbox" id="p-featured" ${p && p.featured ? 'checked' : ''} />
        <label for="p-featured" style="cursor: pointer; font-weight: 500;">Featured Project</label>
      </div>

      <button type="submit" class="btn btn-primary" style="margin-top: 1rem; padding: 0.75rem;">Save Project Details</button>
    </form>
  `;

  overlay.classList.add('show');

  // Device File Upload listener
  const fileInput = document.getElementById('p-image-file');
  const imageInput = document.getElementById('p-image');
  if (fileInput) {
    fileInput.addEventListener('change', (evt) => {
      const file = evt.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (imageInput) imageInput.value = e.target.result;
          if (window.showToast) window.showToast('Screenshot uploaded from device!', 'success');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  document.getElementById('project-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('project-id').value || 'p_' + Date.now();
    const rawFeatures = document.getElementById('p-features').value;
    const featuresArr = rawFeatures.split(/,|\n/).map(s => s.trim()).filter(Boolean);

    const newProject = {
      id,
      title: document.getElementById('p-title').value,
      category: document.getElementById('p-category').value,
      image: document.getElementById('p-image').value,
      description: document.getElementById('p-desc').value,
      features: featuresArr,
      technology: document.getElementById('p-tech').value.split(',').map(s => s.trim()).filter(Boolean),
      github: document.getElementById('p-github').value,
      demo: document.getElementById('p-demo').value,
      completionDate: document.getElementById('p-date').value,
      featured: document.getElementById('p-featured').checked
    };

    let allProjects = window.ashifStorage.getProjects();
    const existingIdx = allProjects.findIndex(item => item.id === id);
    if (existingIdx >= 0) {
      allProjects[existingIdx] = newProject;
    } else {
      allProjects.unshift(newProject);
    }

    window.ashifStorage.saveProjects(allProjects);
    overlay.classList.remove('show');
    if (window.showToast) window.showToast('Project saved successfully!', 'success');
    renderAdminDashboardViews();
  });
}

function deleteProject(id) {
  if (confirm('Are you sure you want to delete this project?')) {
    let projects = window.ashifStorage.getProjects();
    projects = projects.filter(p => p.id !== id);
    window.ashifStorage.saveProjects(projects);
    if (window.showToast) window.showToast('Project deleted.', 'info');
    renderAdminDashboardViews();
  }
}

/* -------------------------------------------------------------------------- */
/* 3. Skills Manager                                                         */
/* -------------------------------------------------------------------------- */
function renderSkillsAdmin() {
  const container = document.getElementById('skills-admin-list');
  if (!container) return;
  const skills = window.ashifStorage.getSkills();

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
      ${skills.map((s, index) => `
        <div class="glass-card" style="padding: 1rem; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.5rem;">${s.icon || '⚡'}</span>
            <div>
              <strong>${s.name}</strong>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${s.category} • ${s.percentage}%</div>
            </div>
          </div>
          <div class="action-btn-group">
            <button class="btn-icon-sm" onclick="moveSkill('${s.id}', -1)" ${index === 0 ? 'disabled style="opacity:0.3"' : ''} title="Move Up">⬆️</button>
            <button class="btn-icon-sm" onclick="moveSkill('${s.id}', 1)" ${index === skills.length - 1 ? 'disabled style="opacity:0.3"' : ''} title="Move Down">⬇️</button>
            <button class="btn-icon-sm" onclick="addSkillModal('${s.id}')" title="Edit">✏️</button>
            <button class="btn-icon-sm delete" onclick="deleteSkill('${s.id}')" title="Delete">🗑️</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function addSkillModal(skillId = null) {
  const overlay = document.getElementById('admin-modal-overlay');
  const body = document.getElementById('admin-modal-body');
  if (!overlay || !body) return;

  const skills = window.ashifStorage.getSkills();
  const s = skillId ? skills.find(item => item.id === skillId) : null;

  body.innerHTML = `
    <h3>${s ? 'Edit Skill' : 'Add New Skill'}</h3>
    <form id="skill-form" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
      <input type="hidden" id="s-id" value="${s ? s.id : ''}" />
      <div class="form-group">
        <label>Skill Icon / Emoji *</label>
        <input type="text" id="s-icon" class="form-input" placeholder="e.g. ⚡" value="${s ? (s.icon || '⚡') : '⚡'}" required />
      </div>
      <div class="form-group">
        <label>Skill Name *</label>
        <input type="text" id="s-name" class="form-input" placeholder="e.g. React.js" value="${s ? s.name : ''}" required />
      </div>
      <div class="form-group">
        <label>Proficiency Percentage (1 - 100) *</label>
        <input type="number" id="s-perc" class="form-input" min="1" max="100" placeholder="e.g. 95" value="${s ? s.percentage : 90}" required />
      </div>
      <div class="form-group">
        <label>Category *</label>
        <input type="text" id="s-cat" class="form-input" placeholder="e.g. Frontend" value="${s ? s.category : 'Frontend'}" required />
      </div>
      <button type="submit" class="btn btn-primary" style="padding: 0.75rem;">Save Skill</button>
    </form>
  `;

  overlay.classList.add('show');

  document.getElementById('skill-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    let currentSkills = window.ashifStorage.getSkills();
    const id = document.getElementById('s-id').value || 's_' + Date.now();
    const newSkill = {
      id,
      icon: document.getElementById('s-icon').value,
      name: document.getElementById('s-name').value,
      percentage: Number(document.getElementById('s-perc').value),
      category: document.getElementById('s-cat').value
    };

    const idx = currentSkills.findIndex(item => item.id === id);
    if (idx >= 0) {
      currentSkills[idx] = newSkill;
    } else {
      currentSkills.push(newSkill);
    }

    window.ashifStorage.saveSkills(currentSkills);
    overlay.classList.remove('show');
    if (window.showToast) window.showToast('Skill saved & updated!', 'success');
    renderAdminDashboardViews();
  });
}

function moveSkill(id, direction) {
  let skills = window.ashifStorage.getSkills();
  const idx = skills.findIndex(s => s.id === id);
  if (idx < 0) return;
  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= skills.length) return;

  const temp = skills[idx];
  skills[idx] = skills[targetIdx];
  skills[targetIdx] = temp;

  window.ashifStorage.saveSkills(skills);
  renderAdminDashboardViews();
}

function deleteSkill(id) {
  if (confirm('Delete this skill?')) {
    let skills = window.ashifStorage.getSkills();
    skills = skills.filter(s => s.id !== id);
    window.ashifStorage.saveSkills(skills);
    if (window.showToast) window.showToast('Skill removed.', 'info');
    renderAdminDashboardViews();
  }
}

/* -------------------------------------------------------------------------- */
/* 4. Certificates Manager                                                   */
/* -------------------------------------------------------------------------- */
function renderCertificatesAdmin() {
  const container = document.getElementById('certs-admin-list');
  if (!container) return;
  const certs = window.ashifStorage.getCertificates();

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">
      ${certs.map(c => `
        <div class="glass-card" style="padding: 1rem; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <img src="${c.image}" style="width: 50px; height: 38px; object-fit: cover; border-radius: 4px;" alt="${c.title}" onerror="this.src='https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=200&q=80'" />
            <div>
              <strong style="font-size: 0.95rem;">${c.title}</strong>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${c.organization} (${c.issueDate})</div>
            </div>
          </div>
          <div class="action-btn-group">
            <a href="${c.image}" target="_blank" class="btn-icon-sm" title="Preview / Download">👁️</a>
            <button class="btn-icon-sm delete" onclick="deleteCertificate('${c.id}')" title="Delete">🗑️</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function addCertificateModal() {
  const overlay = document.getElementById('admin-modal-overlay');
  const body = document.getElementById('admin-modal-body');
  if (!overlay || !body) return;

  body.innerHTML = `
    <h3>Upload Certificate</h3>
    <form id="cert-form" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
      <div class="form-group">
        <label>Certificate Title *</label>
        <input type="text" id="c-title" class="form-input" placeholder="e.g. Meta Frontend Developer Professional" required />
      </div>
      <div class="form-group">
        <label>Issuing Organization *</label>
        <input type="text" id="c-org" class="form-input" placeholder="e.g. Meta / Coursera" required />
      </div>
      <div class="form-group">
        <label>Issue Date</label>
        <input type="date" id="c-date" class="form-input" value="2025-08-14" required />
      </div>
      <div class="form-group">
        <label>Certificate Image File or Image URL *</label>
        <input type="file" id="c-file" accept="image/*" class="form-input" style="margin-bottom: 0.5rem;" />
        <input type="url" id="c-img" class="form-input" placeholder="https://images.unsplash.com/..." />
      </div>
      <button type="submit" class="btn btn-primary" style="padding: 0.75rem;">Save Certificate</button>
    </form>
  `;

  overlay.classList.add('show');

  const fileInput = document.getElementById('c-file');
  const urlInput = document.getElementById('c-img');
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        urlInput.value = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('cert-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const certs = window.ashifStorage.getCertificates();
    certs.unshift({
      id: 'c_' + Date.now(),
      title: document.getElementById('c-title').value,
      organization: document.getElementById('c-org').value,
      issueDate: document.getElementById('c-date').value,
      image: document.getElementById('c-img').value || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80'
    });
    window.ashifStorage.saveCertificates(certs);
    overlay.classList.remove('show');
    if (window.showToast) window.showToast('Certificate added!', 'success');
    renderAdminDashboardViews();
  });
}

function deleteCertificate(id) {
  if (confirm('Delete certificate?')) {
    let certs = window.ashifStorage.getCertificates();
    certs = certs.filter(c => c.id !== id);
    window.ashifStorage.saveCertificates(certs);
    if (window.showToast) window.showToast('Certificate deleted.', 'info');
    renderAdminDashboardViews();
  }
}

/* -------------------------------------------------------------------------- */
/* 5. Achievements Manager                                                   */
/* -------------------------------------------------------------------------- */
function renderAchievementsAdmin() {
  const container = document.getElementById('achievements-admin-list');
  if (!container) return;
  const items = window.ashifStorage.getAchievements();

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      ${items.map(a => `
        <div class="glass-card" style="padding: 1.25rem; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <strong style="font-size: 1.05rem;">${a.name} (${a.year})</strong>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${a.description}</p>
          </div>
          <div class="action-btn-group">
            <button class="btn-icon-sm" onclick="addAchievementModal('${a.id}')" title="Edit">✏️</button>
            <button class="btn-icon-sm delete" onclick="deleteAchievement('${a.id}')" title="Delete">🗑️</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function addAchievementModal(achieveId = null) {
  const overlay = document.getElementById('admin-modal-overlay');
  const body = document.getElementById('admin-modal-body');
  if (!overlay || !body) return;

  const items = window.ashifStorage.getAchievements();
  const a = achieveId ? items.find(i => i.id === achieveId) : null;

  body.innerHTML = `
    <h3>${a ? 'Edit Achievement' : 'Add Achievement'}</h3>
    <form id="achieve-form" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
      <input type="hidden" id="a-id" value="${a ? a.id : ''}" />
      <div class="form-group">
        <label>Achievement Title *</label>
        <input type="text" id="a-name" class="form-input" value="${a ? a.name : ''}" placeholder="e.g. Winner - Vercel AI Hackathon" required />
      </div>
      <div class="form-group">
        <label>Year *</label>
        <input type="text" id="a-year" class="form-input" value="${a ? a.year : '2026'}" placeholder="e.g. 2026" required />
      </div>
      <div class="form-group">
        <label>Category *</label>
        <input type="text" id="a-cat" class="form-input" value="${a ? a.category : 'Hackathons'}" placeholder="e.g. Hackathons" required />
      </div>
      <div class="form-group">
        <label>Description *</label>
        <textarea id="a-desc" class="form-textarea" placeholder="Brief details..." required>${a ? a.description : ''}</textarea>
      </div>
      <button type="submit" class="btn btn-primary" style="padding: 0.75rem;">Save Achievement</button>
    </form>
  `;

  overlay.classList.add('show');

  document.getElementById('achieve-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    let current = window.ashifStorage.getAchievements();
    const id = document.getElementById('a-id').value || 'a_' + Date.now();
    const newItem = {
      id,
      name: document.getElementById('a-name').value,
      year: document.getElementById('a-year').value,
      category: document.getElementById('a-cat').value,
      description: document.getElementById('a-desc').value
    };

    const idx = current.findIndex(i => i.id === id);
    if (idx >= 0) {
      current[idx] = newItem;
    } else {
      current.unshift(newItem);
    }

    window.ashifStorage.saveAchievements(current);
    overlay.classList.remove('show');
    if (window.showToast) window.showToast('Achievement saved!', 'success');
    renderAdminDashboardViews();
  });
}

function deleteAchievement(id) {
  if (confirm('Delete achievement?')) {
    let items = window.ashifStorage.getAchievements();
    items = items.filter(i => i.id !== id);
    window.ashifStorage.saveAchievements(items);
    renderAdminDashboardViews();
  }
}

/* -------------------------------------------------------------------------- */
/* 6. Services Admin                                                          */
/* -------------------------------------------------------------------------- */
function renderServicesAdmin() {
  const container = document.getElementById('services-admin-list');
  if (!container) return;
  const srv = window.ashifStorage.getServices();

  container.innerHTML = `
    <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
      <button class="btn btn-primary" onclick="addServiceModal()">+ Add New Service</button>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
      ${srv.map(s => `
        <div class="glass-card" style="padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${s.icon || '🚀'}</div>
            <strong>${s.title}</strong>
            <div style="font-size: 0.9rem; font-weight: 700; color: var(--primary-blue); margin: 0.25rem 0;">${s.price}</div>
            <p style="font-size: 0.825rem; color: var(--text-secondary); margin-bottom: 1rem;">${s.description}</p>
          </div>
          <div class="action-btn-group" style="justify-content: flex-end;">
            <button class="btn-icon-sm" onclick="addServiceModal('${s.id}')" title="Edit">✏️</button>
            <button class="btn-icon-sm delete" onclick="deleteService('${s.id}')" title="Delete">🗑️</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function addServiceModal(srvId = null) {
  const overlay = document.getElementById('admin-modal-overlay');
  const body = document.getElementById('admin-modal-body');
  if (!overlay || !body) return;

  const srv = window.ashifStorage.getServices();
  const item = srvId ? srv.find(s => s.id === srvId) : null;

  body.innerHTML = `
    <h3>${item ? 'Edit Service' : 'Add New Service'}</h3>
    <form id="srv-form" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
      <input type="hidden" id="srv-id" value="${item ? item.id : ''}" />
      <div class="form-group">
        <label>Service Emoji Icon *</label>
        <input type="text" id="srv-icon" class="form-input" value="${item ? (item.icon || '🚀') : '🚀'}" placeholder="e.g. 💻" required />
      </div>
      <div class="form-group">
        <label>Service Title *</label>
        <input type="text" id="srv-title" class="form-input" value="${item ? item.title : ''}" placeholder="e.g. High-Converting Landing Pages" required />
      </div>
      <div class="form-group">
        <label>Pricing / Est. Rate *</label>
        <input type="text" id="srv-price" class="form-input" value="${item ? item.price : ''}" placeholder="e.g. Starting at $299" required />
      </div>
      <div class="form-group">
        <label>Description *</label>
        <textarea id="srv-desc" class="form-textarea" placeholder="Service offerings..." required>${item ? item.description : ''}</textarea>
      </div>
      <button type="submit" class="btn btn-primary" style="padding: 0.75rem;">Save Service</button>
    </form>
  `;

  overlay.classList.add('show');

  document.getElementById('srv-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    let services = window.ashifStorage.getServices();
    const id = document.getElementById('srv-id').value || 'srv_' + Date.now();
    const newSrv = {
      id,
      icon: document.getElementById('srv-icon').value,
      title: document.getElementById('srv-title').value,
      price: document.getElementById('srv-price').value,
      description: document.getElementById('srv-desc').value
    };

    const idx = services.findIndex(s => s.id === id);
    if (idx >= 0) {
      services[idx] = newSrv;
    } else {
      services.push(newSrv);
    }

    window.ashifStorage.saveServices(services);
    overlay.classList.remove('show');
    if (window.showToast) window.showToast('Service saved!', 'success');
    renderAdminDashboardViews();
  });
}

function deleteService(id) {
  if (confirm('Delete this service?')) {
    let srv = window.ashifStorage.getServices();
    srv = srv.filter(s => s.id !== id);
    window.ashifStorage.saveServices(srv);
    renderAdminDashboardViews();
  }
}

/* -------------------------------------------------------------------------- */
/* 7. Messages Inbox                                                          */
/* -------------------------------------------------------------------------- */
function renderMessagesAdmin() {
  const container = document.getElementById('messages-admin-list');
  if (!container) return;

  const messages = window.ashifStorage.getMessages();

  if (messages.length === 0) {
    container.innerHTML = `<div class="glass-card" style="text-align: center; padding: 3rem; color: var(--text-muted);">No contact messages received yet.</div>`;
    return;
  }

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      ${messages.map(m => `
        <div class="glass-card ${!m.replied ? 'unread' : ''}" style="padding: 1.25rem; border-left: 4px solid ${m.replied ? '#10b981' : '#2563eb'};">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <div>
              <strong style="font-size: 1.05rem;">${m.senderName}</strong>
              <span style="font-size: 0.85rem; color: var(--text-muted); margin-left: 0.5rem;">(${m.email})</span>
            </div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${m.date}</span>
          </div>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--sky-blue); margin-bottom: 0.5rem;">
            Subject: ${m.subject} • Service: ${m.serviceRequested || 'General'}
          </div>
          <p style="font-size: 0.9rem; color: var(--text-primary); background: var(--bg-hover); padding: 0.85rem; border-radius: 8px; margin-bottom: 0.75rem;">${m.message}</p>
          <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
            <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;" onclick="toggleReplyStatus('${m.id}')">
              ${m.replied ? '✓ Replied' : 'Mark as Replied'}
            </button>
            <button class="btn-icon-sm delete" onclick="deleteMessage('${m.id}')">🗑️ Delete</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function toggleReplyStatus(id) {
  let messages = window.ashifStorage.getMessages();
  const msg = messages.find(m => m.id === id);
  if (msg) {
    msg.replied = !msg.replied;
    window.ashifStorage.setItem(STORAGE_KEYS.MESSAGES, messages);
    renderAdminDashboardViews();
  }
}

function deleteMessage(id) {
  if (confirm('Delete this message from Local Storage?')) {
    let messages = window.ashifStorage.getMessages();
    messages = messages.filter(m => m.id !== id);
    window.ashifStorage.setItem(STORAGE_KEYS.MESSAGES, messages);
    renderAdminDashboardViews();
  }
}

/* -------------------------------------------------------------------------- */
/* 8. Visitor Analytics Dashboard Cards & Charts                              */
/* -------------------------------------------------------------------------- */
function renderVisitorAnalyticsAdmin() {
  const v = window.ashifStorage.getVisitors();
  renderVisitorAnalyticsAdminUI(v);
}

function renderVisitorAnalyticsAdminUI(v = {}) {
  const container = document.getElementById('visitor-analytics-panel');
  if (!container) return;

  const topPagesList = Array.isArray(v.topPages) ? v.topPages : [];
  const sourcesList = Array.isArray(v.sources) ? v.sources : [];
  const devicesList = Array.isArray(v.devices) ? v.devices : [];
  const browsersList = Array.isArray(v.browsers) ? v.browsers : [];
  const osList = Array.isArray(v.operatingSystems) ? v.operatingSystems : [];
  const countriesList = Array.isArray(v.countries) ? v.countries : [];

  container.innerHTML = `
    <!-- Visitor Cards Grid -->
    <div class="kpi-grid" style="margin-bottom: 2rem;">
      <div class="kpi-card">
        <div class="kpi-header"><span>Today's Visitors</span><div class="kpi-icon">📅</div></div>
        <div class="kpi-value">${(v.today || 0).toLocaleString()}</div>
        <div class="kpi-trend up">Live Count</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header"><span>Weekly Visitors</span><div class="kpi-icon">📊</div></div>
        <div class="kpi-value">${(v.weekly || 0).toLocaleString()}</div>
        <div class="kpi-trend up">Last 7 Days</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header"><span>Monthly Visitors</span><div class="kpi-icon">📆</div></div>
        <div class="kpi-value">${(v.monthly || 0).toLocaleString()}</div>
        <div class="kpi-trend up">Last 30 Days</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header"><span>Total Visitors</span><div class="kpi-icon">👁</div></div>
        <div class="kpi-value">${(v.total || 0).toLocaleString()}</div>
        <div class="kpi-trend up">Lifetime Visits</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header"><span>Unique Visitors</span><div class="kpi-icon">👤</div></div>
        <div class="kpi-value">${(v.uniqueVisitors || 0).toLocaleString()}</div>
        <div class="kpi-trend up">Unique Sessions</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header"><span>Online Visitors</span><div class="kpi-icon">🟢</div></div>
        <div class="kpi-value" style="color: #10b981;">${(v.onlineVisitors || 0).toLocaleString()}</div>
        <div class="kpi-trend up">Active Right Now</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header"><span>Returning Visitors</span><div class="kpi-icon">🔄</div></div>
        <div class="kpi-value">${(v.returningVisitors || 0).toLocaleString()}</div>
        <div class="kpi-trend neutral">Repeat Views</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header"><span>Total Page Views</span><div class="kpi-icon">📄</div></div>
        <div class="kpi-value">${(v.pageViews || 0).toLocaleString()}</div>
        <div class="kpi-trend up">Impressions</div>
      </div>
    </div>

    <!-- Analytics Breakdown Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
      
      <!-- Top Pages -->
      <div class="glass-card" style="padding: 1.5rem;">
        <h3 style="font-size: 1.1rem; margin-bottom: 1rem;">📄 Top Viewed Pages</h3>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${topPagesList.length > 0 ? topPagesList.map(p => `
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem;">
              <div>
                <strong>${p.name}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${p.path}</div>
              </div>
              <span class="admin-badge-pill">${p.views.toLocaleString()} views</span>
            </div>
          `).join('') : '<div style="color: var(--text-muted); font-size: 0.875rem;">No page views recorded yet.</div>'}
        </div>
      </div>

      <!-- Traffic Sources -->
      <div class="glass-card" style="padding: 1.5rem;">
        <h3 style="font-size: 1.1rem; margin-bottom: 1rem;">🌐 Traffic Sources</h3>
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          ${sourcesList.length > 0 ? sourcesList.map(s => `
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
                <span>${s.name}</span>
                <strong>${s.percent}%</strong>
              </div>
              <div class="skill-progress-track">
                <div class="skill-progress-bar" style="width: ${s.percent}%"></div>
              </div>
            </div>
          `).join('') : '<div style="color: var(--text-muted); font-size: 0.875rem;">No referrer sources recorded yet.</div>'}
        </div>
      </div>

      <!-- Devices Breakdown -->
      <div class="glass-card" style="padding: 1.5rem;">
        <h3 style="font-size: 1.1rem; margin-bottom: 1rem;">💻 Device Distribution</h3>
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          ${devicesList.length > 0 ? devicesList.map(d => `
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
                <span>${d.name}</span>
                <strong>${d.percent}%</strong>
              </div>
              <div class="skill-progress-track">
                <div class="skill-progress-bar" style="width: ${d.percent}%"></div>
              </div>
            </div>
          `).join('') : '<div style="color: var(--text-muted); font-size: 0.875rem;">No device statistics recorded yet.</div>'}
        </div>
      </div>

      <!-- Browser & OS -->
      <div class="glass-card" style="padding: 1.5rem;">
        <h3 style="font-size: 1.1rem; margin-bottom: 1rem;">🧭 Browser & Operating System</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.85rem;">
          <div>
            <strong style="color: var(--primary-blue); font-size: 0.8rem; text-transform: uppercase;">Browsers</strong>
            <ul style="list-style: none; margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.4rem;">
              ${browsersList.length > 0 ? browsersList.map(b => `<li>${b.name}: <strong>${b.percent}%</strong></li>`).join('') : '<li style="color: var(--text-muted);">No browsers tracked</li>'}
            </ul>
          </div>
          <div>
            <strong style="color: var(--sky-blue); font-size: 0.8rem; text-transform: uppercase;">Operating System</strong>
            <ul style="list-style: none; margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.4rem;">
              ${osList.length > 0 ? osList.map(o => `<li>${o.name}: <strong>${o.percent}%</strong></li>`).join('') : '<li style="color: var(--text-muted);">No OS tracked</li>'}
            </ul>
          </div>
        </div>
      </div>

      <!-- Countries Breakdown -->
      <div class="glass-card" style="padding: 1.5rem;">
        <h3 style="font-size: 1.1rem; margin-bottom: 1rem;">🌍 Top Visitor Countries</h3>
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          ${countriesList.length > 0 ? countriesList.map(c => `
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
                <span>🌐 ${c.name} (${c.code || 'IN'})</span>
                <strong>${c.percent}%</strong>
              </div>
              <div class="skill-progress-track">
                <div class="skill-progress-bar" style="width: ${c.percent}%"></div>
              </div>
            </div>
          `).join('') : '<div style="color: var(--text-muted); font-size: 0.875rem;">No country logs recorded yet.</div>'}
        </div>
      </div>

      <!-- Session Duration & Analytics Integrations -->
      <div class="glass-card" style="padding: 1.5rem; grid-column: 1 / -1;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-size: 1.1rem;">⏱️ Live Database Analytics Status</h3>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary-blue); margin-top: 0.25rem;">Active Real-Time Tracking</div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Measured across ${(v.total || 0).toLocaleString()} live recorded session events</span>
          </div>

          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <div style="background: var(--bg-card); border: 1px solid var(--border-light); padding: 0.75rem 1rem; border-radius: var(--radius-md);">
              <div style="font-size: 0.75rem; color: var(--text-muted);">Database Provider</div>
              <strong style="color: #10b981; font-size: 0.9rem;">Node.js / Express DB</strong>
            </div>

            <div style="background: var(--bg-card); border: 1px solid var(--border-light); padding: 0.75rem 1rem; border-radius: var(--radius-md);">
              <div style="font-size: 0.75rem; color: var(--text-muted);">Live Sync</div>
              <strong style="color: #10b981; font-size: 0.9rem;">3s Polling Enabled</strong>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/* 9. Click & Conversion Analytics                                           */
/* -------------------------------------------------------------------------- */
function renderClickAnalyticsAdmin() {
  const a = window.ashifStorage.getAnalytics();
  renderClickAnalyticsAdminUI(a);
}

function renderClickAnalyticsAdminUI(a = {}) {
  const container = document.getElementById('click-analytics-panel');
  if (!container) return;

  container.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-header"><span>Clicks on Resume</span><div class="kpi-icon">📄</div></div>
        <div class="kpi-value">${(a.resumeDownloads || 0).toLocaleString()}</div>
        <div class="kpi-trend up">Resume Downloads</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header"><span>Clicks on GitHub</span><div class="kpi-icon">🐙</div></div>
        <div class="kpi-value">${(a.githubClicks || 0).toLocaleString()}</div>
        <div class="kpi-trend up">GitHub Profile Views</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header"><span>Clicks on LinkedIn</span><div class="kpi-icon">💼</div></div>
        <div class="kpi-value">${(a.linkedinClicks || 0).toLocaleString()}</div>
        <div class="kpi-trend up">LinkedIn Leads</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header"><span>Clicks on Contact</span><div class="kpi-icon">✉️</div></div>
        <div class="kpi-value">${(a.contactClicks || 0).toLocaleString()}</div>
        <div class="kpi-trend up">Contact Form Scrolls</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header"><span>Clicks on Hire Me</span><div class="kpi-icon">🤝</div></div>
        <div class="kpi-value">${(a.hireMeClicks || 0).toLocaleString()}</div>
        <div class="kpi-trend up">Direct CTA Taps</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header"><span>Live Demo Clicks</span><div class="kpi-icon">🚀</div></div>
        <div class="kpi-value">${(a.liveDemoClicks || 0).toLocaleString()}</div>
        <div class="kpi-trend up">Project Demo Views</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header"><span>WhatsApp Clicks</span><div class="kpi-icon">💬</div></div>
        <div class="kpi-value">${(a.whatsappClicks || 0).toLocaleString()}</div>
        <div class="kpi-trend up">Direct Chats</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header"><span>Email Clicks</span><div class="kpi-icon">📧</div></div>
        <div class="kpi-value">${(a.emailClicks || 0).toLocaleString()}</div>
        <div class="kpi-trend up">Direct Emails</div>
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/* 10. Resume Manager                                                        */
/* -------------------------------------------------------------------------- */
function renderResumeAdmin() {
  const container = document.getElementById('resume-admin-panel');
  if (!container) return;
  const s = window.ashifStorage.getSettings();

  container.innerHTML = `
    <div class="glass-card" style="padding: 1.5rem; max-width: 700px;">
      <h3 style="margin-bottom: 0.75rem;">📄 Resume File & Download Management</h3>
      <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
        Upload a new PDF resume or specify a direct document URL. This file is directly downloaded when users click "Download Resume".
      </p>

      <form id="resume-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div class="form-group">
          <label>Upload New Resume PDF File</label>
          <input type="file" id="res-file-input" accept=".pdf,application/pdf" class="form-input" />
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">Select a PDF from your device to save directly into Local Storage.</span>
        </div>

        <div class="form-group">
          <label>Resume Download URL / Path</label>
          <input type="text" id="res-url" class="form-input" value="${s.resumeUrl || ''}" placeholder="assets/resume/Mohammad_Ashif_Resume.pdf or data:application/pdf;base64,..." required />
        </div>

        <div style="display: flex; gap: 0.85rem; flex-wrap: wrap;">
          <button type="submit" class="btn btn-primary" style="padding: 0.75rem 1.25rem;">💾 Update & Save Resume</button>
          
          ${s.resumeUrl ? `<a href="${s.resumeUrl}" download="Mohammad_Ashif_Resume.pdf" target="_blank" class="btn btn-secondary" style="padding: 0.75rem 1.25rem;">📥 Download Preview</a>` : ''}
          
          ${s.resumeUrl ? `<button type="button" class="btn btn-secondary" id="delete-resume-btn" style="padding: 0.75rem 1.25rem; color: #ef4444;">🗑️ Delete Resume</button>` : ''}
        </div>
      </form>
    </div>
  `;

  const fileInput = document.getElementById('res-file-input');
  const urlInput = document.getElementById('res-url');

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        if (window.showToast) window.showToast('Please select a valid PDF document.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        urlInput.value = evt.target.result;
        if (window.showToast) window.showToast('PDF file loaded into input field! Click Save.', 'success');
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('delete-resume-btn')?.addEventListener('click', () => {
    if (confirm('Delete saved resume file?')) {
      const current = window.ashifStorage.getSettings();
      current.resumeUrl = '';
      window.ashifStorage.saveSettings(current);
      if (window.showToast) window.showToast('Resume file deleted.', 'info');
      renderAdminDashboardViews();
    }
  });

  document.getElementById('resume-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const current = window.ashifStorage.getSettings();
    current.resumeUrl = document.getElementById('res-url').value;
    window.ashifStorage.saveSettings(current);
    if (window.showToast) window.showToast('Resume updated & synced with live portfolio!', 'success');
  });
}

/* -------------------------------------------------------------------------- */
/* 11. Profile Management                                                    */
/* -------------------------------------------------------------------------- */
function renderProfileAdmin() {
  const container = document.getElementById('profile-admin-panel');
  if (!container) return;
  const s = window.ashifStorage.getSettings();
  const currentWebsite = s.website || s.siteUrl || window.location.origin;

  container.innerHTML = `
    <div class="profile-admin-grid">
      <!-- Left Column: Form & Profile Controls -->
      <div class="glass-card" style="padding: 1.5rem;">
        
        <!-- Profile Photo Section -->
        <div style="margin-bottom: 1.5rem;">
          <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem;">🖼️ Profile Photo</h3>
          
          <div id="prof-dropzone" class="image-dropzone" style="margin-bottom: 1rem;">
            <div class="profile-avatar-circle" style="width: 90px; height: 90px; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, #2563eb, #38bdf8); display: flex; align-items: center; justify-content: center; position: relative;">
              <img id="admin-avatar-preview" src="${s.profileImage || ''}" alt="Profile Avatar" style="width: 100%; height: 100%; object-fit: cover; display: ${s.profileImage ? 'block' : 'none'};" onerror="this.style.display='none'; document.getElementById('admin-avatar-fallback').style.display='flex';" />
              <div id="admin-avatar-fallback" class="avatar-fallback" style="display: ${!s.profileImage ? 'flex' : 'none'}; font-size: 2rem; font-weight: 800; color: #ffffff; align-items: center; justify-content: center; width: 100%; height: 100%;">
                ${(s.developerName || 'MA').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
              </div>
            </div>

            <div style="text-align: center;">
              <strong style="font-size: 0.9rem; display: block;">Drag & Drop Profile Image Here</strong>
              <span style="font-size: 0.78rem; color: var(--text-muted);">PNG, JPG, WEBP up to 5MB</span>
            </div>

            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center; margin-top: 0.25rem;">
              <label class="btn btn-secondary btn-sm" style="cursor: pointer;">
                📷 Upload Image
                <input type="file" id="prof-file-input" accept="image/*" style="display: none;" />
              </label>

              <label class="btn btn-secondary btn-sm" style="cursor: pointer;">
                🔄 Change Photo
                <input type="file" id="prof-change-input" accept="image/*" style="display: none;" />
              </label>

              <button type="button" class="btn btn-secondary btn-sm" id="remove-photo-btn" style="color: #ef4444;">
                🗑️ Remove Photo
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Image URL Direct Link</label>
            <input type="url" id="prof-img" class="form-input" value="${s.profileImage || ''}" placeholder="https://images.unsplash.com/..." />
          </div>
        </div>

        <form id="profile-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- Personal Information Section -->
          <div>
            <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem; border-top: 1px solid var(--border-light); padding-top: 1rem;">👤 Personal Information</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label>Full Name *</label>
                <input type="text" id="prof-name" class="form-input" value="${s.developerName || ''}" placeholder="e.g. Mohammad Ashif" required />
              </div>

              <div class="form-group">
                <label>Professional Title *</label>
                <input type="text" id="prof-title" class="form-input" value="${s.developerTitle || ''}" placeholder="e.g. Senior Frontend Developer" required />
              </div>
            </div>

            <div class="form-group" style="margin-top: 1rem;">
              <label>Short Bio</label>
              <textarea id="prof-bio" class="form-textarea" rows="3" placeholder="Brief professional summary...">${s.bio || ''}</textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
              <div class="form-group">
                <label>Location</label>
                <input type="text" id="prof-loc" class="form-input" value="${s.location || ''}" placeholder="e.g. New Delhi, India" />
              </div>

              <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="prof-email" class="form-input" value="${s.email || ''}" placeholder="mohdashif.dev@gmail.com" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
              <div class="form-group">
                <label>Phone Number</label>
                <input type="text" id="prof-phone" class="form-input" value="${s.phone || ''}" placeholder="+91 98765 43210" />
              </div>

              <div class="form-group">
                <label>Resume File Upload (PDF)</label>
                <input type="file" id="prof-resume-file" accept=".pdf,application/pdf" class="form-input" />
              </div>
            </div>

            <div class="form-group" style="margin-top: 1rem;">
              <label>Resume File URL / Path</label>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <input type="text" id="prof-resume" class="form-input" value="${s.resumeUrl || ''}" placeholder="assets/resume/Mohammad_Ashif_Resume.pdf" />
                <a id="prof-resume-download-btn" href="${s.resumeUrl || '#'}" download="Mohammad_Ashif_Resume.pdf" target="_blank" class="btn btn-secondary" style="white-space: nowrap; ${!s.resumeUrl ? 'opacity: 0.5; pointer-events: none;' : ''}">
                  📥 Test Download
                </a>
              </div>
            </div>
          </div>

          <!-- Social Links Section -->
          <div>
            <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem; border-top: 1px solid var(--border-light); padding-top: 1rem;">🔗 Social Links & Web Presence</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label>GitHub Profile URL</label>
                <input type="url" id="prof-github" class="form-input" value="${s.github || ''}" placeholder="https://github.com/ashiffrontend" />
              </div>

              <div class="form-group">
                <label>LinkedIn Profile URL</label>
                <input type="url" id="prof-linkedin" class="form-input" value="${s.linkedin || ''}" placeholder="https://www.linkedin.com/in/mohd-ashif-095963425/" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
              <div class="form-group">
                <label>Portfolio Website URL</label>
                <input type="url" id="prof-website" class="form-input" value="${currentWebsite}" placeholder="https://myportfolio.com" />
              </div>

              <div class="form-group">
                <label>Contact Email Link</label>
                <input type="email" id="prof-email-social" class="form-input" value="${s.email || ''}" placeholder="mohdashif.dev@gmail.com" />
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.25rem; border-top: 1px solid var(--border-light); padding-top: 1.25rem; flex-wrap: wrap;">
            <button type="button" id="cancel-profile-btn" class="btn btn-secondary">Cancel</button>
            <button type="button" id="reset-profile-btn" class="btn btn-secondary">Reset</button>
            <button type="submit" id="save-profile-btn" class="btn btn-primary" style="padding: 0.75rem 1.5rem; font-weight: 600;">
              💾 Save Changes
            </button>
          </div>

        </form>
      </div>

      <!-- Right Column: Live Profile Preview Card -->
      <div>
        <div class="profile-preview-card">
          <span style="display: inline-block; padding: 0.2rem 0.6rem; font-size: 0.72rem; font-weight: 700; background: rgba(37, 99, 235, 0.1); color: var(--primary-blue); border-radius: 20px; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.5px;">Live Preview Card</span>
          
          <div class="profile-preview-avatar">
            <img id="card-preview-img" src="${s.profileImage || ''}" alt="Avatar Preview" style="display: ${s.profileImage ? 'block' : 'none'};" onerror="this.style.display='none'; document.getElementById('card-preview-fallback').style.display='flex';" />
            <div id="card-preview-fallback" class="avatar-fallback" style="display: ${!s.profileImage ? 'flex' : 'none'};">
              ${(s.developerName || 'MA').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
            </div>
          </div>

          <h3 id="card-preview-name">${s.developerName || 'Mohammad Ashif'}</h3>
          <div class="preview-title" id="card-preview-title">${s.developerTitle || 'Senior Frontend Developer'}</div>
          <p class="preview-bio" id="card-preview-bio">${s.bio || 'Developer Bio preview...'}</p>

          <div class="profile-preview-details">
            <div><i class="fa-solid fa-location-dot" style="width: 16px; color: var(--primary-blue);"></i> <span id="card-preview-loc">${s.location || 'Not specified'}</span></div>
            <div><i class="fa-solid fa-envelope" style="width: 16px; color: #EA4335;"></i> <span id="card-preview-email">${s.email || 'Not specified'}</span></div>
            <div><i class="fa-solid fa-phone" style="width: 16px; color: #10b981;"></i> <span id="card-preview-phone">${s.phone || 'Not specified'}</span></div>
            <div><i class="fa-solid fa-globe" style="width: 16px; color: #2563EB;"></i> <span id="card-preview-website">${currentWebsite}</span></div>
          </div>

          <div class="profile-preview-socials" style="margin-bottom: 1.25rem;">
            <a id="card-social-github" href="${s.github || 'https://github.com/ashiffrontend'}" target="_blank" rel="noopener noreferrer" class="social-icon social-github" title="GitHub Profile - Mohammad Ashif" aria-label="GitHub Profile"><i class="fa-brands fa-github"></i></a>
            <a id="card-social-linkedin" href="${s.linkedin || 'https://www.linkedin.com/in/mohd-ashif-095963425/'}" target="_blank" rel="noopener noreferrer" class="social-icon social-linkedin" title="LinkedIn Profile - Mohammad Ashif" aria-label="LinkedIn Profile"><i class="fa-brands fa-linkedin-in"></i></a>
            <a id="card-social-email" href="mailto:${s.email || 'mohdashif.dev@gmail.com'}" class="social-icon social-email" title="Send Email - Mohammad Ashif" aria-label="Email"><i class="fa-solid fa-envelope"></i></a>
            <a id="card-social-website" href="${currentWebsite}" target="_blank" rel="noopener noreferrer" class="social-icon social-website" title="Portfolio Website - mohdashif.dev" aria-label="Portfolio Website"><i class="fa-solid fa-globe"></i></a>
          </div>

          <a id="card-preview-resume-link" href="${s.resumeUrl || '#'}" download="Resume.pdf" target="_blank" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 0.65rem; font-size: 0.85rem; ${!s.resumeUrl ? 'opacity:0.5; pointer-events:none;' : ''}">
            📄 Download Resume
          </a>
        </div>
      </div>
    </div>
  `;

  // Dynamic Live Binds & DOM Elements
  const profForm = document.getElementById('profile-form');
  const profFileInput = document.getElementById('prof-file-input');
  const profChangeInput = document.getElementById('prof-change-input');
  const removePhotoBtn = document.getElementById('remove-photo-btn');
  const dropzone = document.getElementById('prof-dropzone');
  
  const imgUrlInput = document.getElementById('prof-img');
  const adminAvatarImg = document.getElementById('admin-avatar-preview');
  const adminAvatarFallback = document.getElementById('admin-avatar-fallback');
  const cardAvatarImg = document.getElementById('card-preview-img');
  const cardAvatarFallback = document.getElementById('card-preview-fallback');

  const nameInput = document.getElementById('prof-name');
  const titleInput = document.getElementById('prof-title');
  const bioInput = document.getElementById('prof-bio');
  const locInput = document.getElementById('prof-loc');
  const emailInput = document.getElementById('prof-email');
  const phoneInput = document.getElementById('prof-phone');
  const resumeUrlInput = document.getElementById('prof-resume');
  const resumeFileInput = document.getElementById('prof-resume-file');
  const resumeDownloadBtn = document.getElementById('prof-resume-download-btn');

  const githubInput = document.getElementById('prof-github');
  const linkedinInput = document.getElementById('prof-linkedin');
  const websiteInput = document.getElementById('prof-website');
  const emailSocialInput = document.getElementById('prof-email-social');

  const saveBtn = document.getElementById('save-profile-btn');
  const resetBtn = document.getElementById('reset-profile-btn');
  const cancelBtn = document.getElementById('cancel-profile-btn');

  // Preview Card Elements
  const cardName = document.getElementById('card-preview-name');
  const cardTitle = document.getElementById('card-preview-title');
  const cardBio = document.getElementById('card-preview-bio');
  const cardLoc = document.getElementById('card-preview-loc');
  const cardEmail = document.getElementById('card-preview-email');
  const cardPhone = document.getElementById('card-preview-phone');
  const cardWebsite = document.getElementById('card-preview-website');

  const cardGithubLink = document.getElementById('card-social-github');
  const cardLinkedinLink = document.getElementById('card-social-linkedin');
  const cardEmailLink = document.getElementById('card-social-email');
  const cardWebsiteLink = document.getElementById('card-social-website');
  const cardResumeLink = document.getElementById('card-preview-resume-link');

  // Function to Update Image Preview
  const updateImagePreviews = (src) => {
    imgUrlInput.value = src || '';
    if (src) {
      if (adminAvatarImg) { adminAvatarImg.src = src; adminAvatarImg.style.display = 'block'; }
      if (adminAvatarFallback) { adminAvatarFallback.style.display = 'none'; }
      if (cardAvatarImg) { cardAvatarImg.src = src; cardAvatarImg.style.display = 'block'; }
      if (cardAvatarFallback) { cardAvatarFallback.style.display = 'none'; }
    } else {
      if (adminAvatarImg) { adminAvatarImg.style.display = 'none'; }
      if (adminAvatarFallback) { adminAvatarFallback.style.display = 'flex'; }
      if (cardAvatarImg) { cardAvatarImg.style.display = 'none'; }
      if (cardAvatarFallback) { cardAvatarFallback.style.display = 'flex'; }
    }
  };

  // Function to sync inputs with live preview card
  const syncLivePreviewCard = () => {
    if (cardName) cardName.innerText = nameInput.value.trim() || 'Mohammad Ashif';
    if (cardTitle) cardTitle.innerText = titleInput.value.trim() || 'Senior Frontend Developer';
    if (cardBio) cardBio.innerText = bioInput.value.trim() || 'Developer Bio preview...';
    if (cardLoc) cardLoc.innerText = locInput.value.trim() || 'Not specified';
    if (cardEmail) cardEmail.innerText = emailInput.value.trim() || 'Not specified';
    if (cardPhone) cardPhone.innerText = phoneInput.value.trim() || 'Not specified';
    if (cardWebsite) cardWebsite.innerText = websiteInput.value.trim() || window.location.origin;

    if (cardGithubLink) cardGithubLink.href = githubInput.value.trim() || '#';
    if (cardLinkedinLink) cardLinkedinLink.href = linkedinInput.value.trim() || '#';
    if (cardEmailLink) cardEmailLink.href = emailSocialInput.value.trim() ? `mailto:${emailSocialInput.value.trim()}` : '#';
    if (cardWebsiteLink) cardWebsiteLink.href = websiteInput.value.trim() || '#';

    const rUrl = resumeUrlInput.value.trim();
    if (cardResumeLink) {
      cardResumeLink.href = rUrl || '#';
      cardResumeLink.style.opacity = rUrl ? '1' : '0.5';
      cardResumeLink.style.pointerEvents = rUrl ? 'auto' : 'none';
    }
    if (resumeDownloadBtn) {
      resumeDownloadBtn.href = rUrl || '#';
      resumeDownloadBtn.style.opacity = rUrl ? '1' : '0.5';
      resumeDownloadBtn.style.pointerEvents = rUrl ? 'auto' : 'none';
    }

    // Avatar fallbacks initials
    const initials = (nameInput.value.trim() || 'MA').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
    if (adminAvatarFallback) adminAvatarFallback.innerText = initials;
    if (cardAvatarFallback) cardAvatarFallback.innerText = initials;
  };

  // Attach Input Event Listeners for Live Sync
  [nameInput, titleInput, bioInput, locInput, emailInput, phoneInput, resumeUrlInput, githubInput, linkedinInput, websiteInput, emailSocialInput].forEach(elem => {
    elem?.addEventListener('input', syncLivePreviewCard);
  });

  // Photo Input Changes
  const handlePhotoFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      if (window.showToast) window.showToast('Please select a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      updateImagePreviews(e.target.result);
      if (window.showToast) window.showToast('Photo uploaded & updated in preview!', 'success');
    };
    reader.readAsDataURL(file);
  };

  profFileInput?.addEventListener('change', (e) => handlePhotoFile(e.target.files[0]));
  profChangeInput?.addEventListener('change', (e) => handlePhotoFile(e.target.files[0]));

  imgUrlInput?.addEventListener('input', () => {
    updateImagePreviews(imgUrlInput.value.trim());
  });

  removePhotoBtn?.addEventListener('click', () => {
    updateImagePreviews('');
    if (window.showToast) window.showToast('Profile photo removed.', 'info');
  });

  // Drag & Drop Handlers
  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone?.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });
  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoFile(e.dataTransfer.files[0]);
    }
  });

  // Resume File Upload
  resumeFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        if (window.showToast) window.showToast('Please select a valid PDF file.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        resumeUrlInput.value = evt.target.result;
        syncLivePreviewCard();
        if (window.showToast) window.showToast('PDF Resume uploaded to input field!', 'success');
      };
      reader.readAsDataURL(file);
    }
  });

  // Reset Button
  resetBtn?.addEventListener('click', () => {
    renderProfileAdmin();
    if (window.showToast) window.showToast('Profile inputs reset to last saved state.', 'info');
  });

  // Cancel Button
  cancelBtn?.addEventListener('click', () => {
    renderProfileAdmin();
    if (window.showToast) window.showToast('Changes cancelled.', 'info');
  });

  // Form Submission & Save Function
  profForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = nameInput.value.trim();
    const profTitle = titleInput.value.trim();

    // Validation
    if (!fullName || !profTitle) {
      if (window.showToast) {
        window.showToast('Validation Error: Full Name and Professional Title are required fields.', 'error');
      }
      return;
    }

    // Loading Animation
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '⏳ Saving Changes...';
    }

    setTimeout(() => {
      const current = window.ashifStorage.getSettings();
      current.profileImage = imgUrlInput.value.trim();
      current.developerName = fullName;
      current.developerTitle = profTitle;
      current.bio = bioInput.value.trim();
      current.location = locInput.value.trim();
      current.email = emailInput.value.trim();
      current.phone = phoneInput.value.trim();
      current.resumeUrl = resumeUrlInput.value.trim();
      current.github = githubInput.value.trim();
      current.linkedin = linkedinInput.value.trim();
      current.website = websiteInput.value.trim();
      current.siteUrl = websiteInput.value.trim();

      // Save to Local Storage
      window.ashifStorage.saveSettings(current);

      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '💾 Save Changes';
      }

      // Success Toast
      if (window.showToast) {
        window.showToast('Profile saved successfully & live portfolio updated!', 'success');
      }

      // Re-render header & preview updates
      renderProfileAdmin();
    }, 450);
  });
}

/* -------------------------------------------------------------------------- */
/* 12. Settings & Data Backup/Restore/Reset                                  */
/* -------------------------------------------------------------------------- */
function renderSettingsAdmin() {
  const container = document.getElementById('settings-admin-panel');
  if (!container) return;
  const s = window.ashifStorage.getSettings();

  container.innerHTML = `
    <div class="glass-card" style="padding: 1.5rem; max-width: 700px;">
      <h3>⚙️ Portfolio Configuration & Branding</h3>
      
      <form id="settings-form" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
        <div class="form-group">
          <label>Logo Text / Initials</label>
          <input type="text" id="set-logo" class="form-input" value="${s.logoText || 'MA'}" />
        </div>

        <div class="form-group">
          <label>Contact Email Address</label>
          <input type="email" id="set-email" class="form-input" value="${s.email}" required />
        </div>

        <div class="form-group">
          <label>Phone / WhatsApp Number</label>
          <input type="text" id="set-phone" class="form-input" value="${s.phone}" />
        </div>

        <div class="form-group">
          <label>GitHub Profile URL</label>
          <input type="url" id="set-github" class="form-input" value="${s.github}" />
        </div>

        <div class="form-group">
          <label>LinkedIn Profile URL</label>
          <input type="url" id="set-linkedin" class="form-input" value="${s.linkedin}" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label>Google Analytics 4 ID</label>
            <input type="text" id="set-ga" class="form-input" value="${s.gaMeasurementId || 'G-XXXXXXXXXX'}" placeholder="G-XXXXXXXXXX" />
          </div>
          <div class="form-group">
            <label>Microsoft Clarity ID</label>
            <input type="text" id="set-clarity" class="form-input" value="${s.clarityId || 'XXXXXX'}" placeholder="XXXXXX" />
          </div>
        </div>

        <button type="submit" class="btn btn-primary" style="padding: 0.75rem;">Save Settings</button>
      </form>

      <hr style="margin: 2rem 0; border-color: var(--border-light);" />

      <h3>💾 Local Storage Backup, Restore & Reset</h3>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
        Export full portfolio dataset into a backup JSON file, restore a saved backup, or reset the website data.
      </p>

      <div style="display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap; align-items: center;">
        <button class="btn btn-secondary" onclick="exportDataBackup()">📥 Export Backup JSON</button>
        
        <label class="btn btn-secondary" style="cursor: pointer; margin: 0;">
          📤 Restore JSON File
          <input type="file" id="restore-json-input" accept=".json" style="display: none;" onchange="importDataBackup(event)" />
        </label>

        <button class="btn btn-secondary" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3);" onclick="resetWebsiteData()">⚠️ Reset Website Data</button>
      </div>
    </div>
  `;

  document.getElementById('settings-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const current = window.ashifStorage.getSettings();
    current.logoText = document.getElementById('set-logo').value;
    current.email = document.getElementById('set-email').value;
    current.phone = document.getElementById('set-phone').value;
    current.github = document.getElementById('set-github').value;
    current.linkedin = document.getElementById('set-linkedin').value;
    current.gaMeasurementId = document.getElementById('set-ga').value;
    current.clarityId = document.getElementById('set-clarity').value;
    window.ashifStorage.saveSettings(current);
    if (window.showToast) window.showToast('Settings saved successfully!', 'success');
  });
}

function resetWebsiteData() {
  if (confirm('Are you sure you want to reset all portfolio data back to default initial seed settings? This action clears custom edits.')) {
    localStorage.clear();
    location.reload();
  }
}

function exportDataBackup() {
  const json = window.ashifStorage.backupData();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mohammad_ashif_portfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}

function importDataBackup(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const success = window.ashifStorage.restoreData(evt.target.result);
    if (success) {
      if (window.showToast) window.showToast('Data restored successfully!', 'success');
      renderAdminDashboardViews();
    } else {
      if (window.showToast) window.showToast('Failed to parse backup JSON file.', 'error');
    }
  };
  reader.readAsText(file);
}

/* -------------------------------------------------------------------------- */
/* Testimonials Admin Manager                                                 */
/* -------------------------------------------------------------------------- */
function renderTestimonialsAdmin() {
  const container = document.getElementById('testimonials-admin-list');
  if (!container) return;

  const testimonials = window.ashifStorage.getItem('ashif_testimonials') || [
    { id: 'test_1', clientName: 'David Miller', role: 'CEO, Horizon Startups', rating: 5, comment: 'Mohammad Ashif delivered our landing page in under 48 hours with pixel-perfect UI!', approved: true, featured: true },
    { id: 'test_2', clientName: 'Priya Sharma', role: 'Director, Evergreen Academy', rating: 5, comment: 'The Evergreen Public School website transformed our online admission inquiries!', approved: true, featured: true }
  ];

  container.innerHTML = `
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Client Name</th>
            <th>Role / Company</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${testimonials.map(t => `
            <tr>
              <td><strong>${t.clientName}</strong></td>
              <td>${t.role}</td>
              <td>${'⭐'.repeat(t.rating)}</td>
              <td style="max-width: 280px; font-size: 0.85rem;">"${t.comment}"</td>
              <td><span class="admin-badge-pill" style="background: ${t.approved ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${t.approved ? '#22c55e' : '#ef4444'};">${t.approved ? 'Approved' : 'Pending'}</span></td>
              <td>
                <div class="action-btn-group">
                  <button class="btn-icon-sm" onclick="toggleTestimonialApproval('${t.id}')" title="Approve / Reject">${t.approved ? '❌' : '✅'}</button>
                  <button class="btn-icon-sm delete" onclick="deleteTestimonial('${t.id}')" title="Delete">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openAddTestimonialModal() {
  const overlay = document.getElementById('admin-modal-overlay');
  const body = document.getElementById('admin-modal-body');
  if (!overlay || !body) return;

  body.innerHTML = `
    <h3 style="margin-bottom: 1.25rem;">Add Client Testimonial</h3>
    <form id="add-testimonial-form" style="display: flex; flex-direction: column; gap: 1rem;">
      <div class="form-group">
        <label>Client Name *</label>
        <input type="text" id="test-name" class="form-input" placeholder="e.g. Rahul Verma" required />
      </div>
      <div class="form-group">
        <label>Role / Company *</label>
        <input type="text" id="test-role" class="form-input" placeholder="e.g. Founder, Nexus Tech" required />
      </div>
      <div class="form-group">
        <label>Rating (1 - 5 Stars) *</label>
        <select id="test-rating" class="form-select">
          <option value="5" selected>⭐⭐⭐⭐⭐ (5/5)</option>
          <option value="4">⭐⭐⭐⭐ (4/5)</option>
          <option value="3">⭐⭐⭐ (3/5)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Client Review / Feedback *</label>
        <textarea id="test-comment" class="form-textarea" rows="3" placeholder="Write client feedback..." required></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Save Testimonial</button>
    </form>
  `;

  overlay.classList.add('show');

  document.getElementById('add-testimonial-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const list = window.ashifStorage.getItem('ashif_testimonials') || [];
    list.unshift({
      id: 'test_' + Date.now(),
      clientName: document.getElementById('test-name').value.trim(),
      role: document.getElementById('test-role').value.trim(),
      rating: parseInt(document.getElementById('test-rating').value),
      comment: document.getElementById('test-comment').value.trim(),
      approved: true,
      featured: true,
      createdAt: new Date().toISOString().split('T')[0]
    });
    window.ashifStorage.setItem('ashif_testimonials', list);
    overlay.classList.remove('show');
    if (window.showToast) window.showToast('Testimonial added & published!', 'success');
    renderTestimonialsAdmin();
  });
}

function toggleTestimonialApproval(id) {
  const list = window.ashifStorage.getItem('ashif_testimonials') || [];
  const t = list.find(item => item.id === id);
  if (t) {
    t.approved = !t.approved;
    window.ashifStorage.setItem('ashif_testimonials', list);
    renderTestimonialsAdmin();
    if (window.showToast) window.showToast(`Testimonial status updated: ${t.approved ? 'Approved' : 'Unapproved'}`, 'info');
  }
}

function deleteTestimonial(id) {
  if (confirm('Delete this testimonial permanently?')) {
    let list = window.ashifStorage.getItem('ashif_testimonials') || [];
    list = list.filter(item => item.id !== id);
    window.ashifStorage.setItem('ashif_testimonials', list);
    renderTestimonialsAdmin();
    if (window.showToast) window.showToast('Testimonial deleted.', 'info');
  }
}

/* -------------------------------------------------------------------------- */
/* Blog CMS Admin Manager                                                    */
/* -------------------------------------------------------------------------- */
function renderBlogAdmin() {
  const container = document.getElementById('blog-admin-list');
  if (!container) return;

  const posts = window.ashifStorage.getItem('ashif_blog_posts') || [
    { id: 'post_1', title: 'Building High-Performance Websites with Modern Web Tech', category: 'Web Development', published: true, date: '2026-02-15' }
  ];

  container.innerHTML = `
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Article Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${posts.map(p => `
            <tr>
              <td><strong>${p.title}</strong></td>
              <td><span class="admin-badge-pill">${p.category}</span></td>
              <td><span class="admin-badge-pill" style="background: ${p.published ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)'}; color: ${p.published ? '#22c55e' : '#f59e0b'};">${p.published ? 'Published' : 'Draft'}</span></td>
              <td>${p.date}</td>
              <td>
                <div class="action-btn-group">
                  <button class="btn-icon-sm" onclick="deleteBlogPost('${p.id}')">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openAddBlogPostModal() {
  const overlay = document.getElementById('admin-modal-overlay');
  const body = document.getElementById('admin-modal-body');
  if (!overlay || !body) return;

  body.innerHTML = `
    <h3 style="margin-bottom: 1.25rem;">Write New Blog Post</h3>
    <form id="add-post-form" style="display: flex; flex-direction: column; gap: 1rem;">
      <div class="form-group">
        <label>Article Title *</label>
        <input type="text" id="post-title" class="form-input" placeholder="e.g. How to Scale Frontend Web Applications" required />
      </div>
      <div class="form-group">
        <label>Category *</label>
        <input type="text" id="post-category" class="form-input" placeholder="e.g. Web Development / Performance" required />
      </div>
      <div class="form-group">
        <label>Content Summary *</label>
        <textarea id="post-summary" class="form-textarea" rows="2" placeholder="Brief summary for social cards & SEO..." required></textarea>
      </div>
      <div class="form-group">
        <label>Full Post Content *</label>
        <textarea id="post-content" class="form-textarea" rows="5" placeholder="Write full article body..." required></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Publish Article</button>
    </form>
  `;

  overlay.classList.add('show');

  document.getElementById('add-post-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const posts = window.ashifStorage.getItem('ashif_blog_posts') || [];
    posts.unshift({
      id: 'post_' + Date.now(),
      title: document.getElementById('post-title').value.trim(),
      category: document.getElementById('post-category').value.trim(),
      summary: document.getElementById('post-summary').value.trim(),
      content: document.getElementById('post-content').value.trim(),
      published: true,
      date: new Date().toISOString().split('T')[0]
    });
    window.ashifStorage.setItem('ashif_blog_posts', posts);
    overlay.classList.remove('show');
    if (window.showToast) window.showToast('Blog article published!', 'success');
    renderBlogAdmin();
  });
}

function deleteBlogPost(id) {
  if (confirm('Delete this blog post?')) {
    let posts = window.ashifStorage.getItem('ashif_blog_posts') || [];
    posts = posts.filter(item => item.id !== id);
    window.ashifStorage.setItem('ashif_blog_posts', posts);
    renderBlogAdmin();
  }
}

/* -------------------------------------------------------------------------- */
/* Clients & Invoices Admin Manager                                           */
/* -------------------------------------------------------------------------- */
function renderClientsInvoicesAdmin() {
  const container = document.getElementById('clients-invoices-admin-list');
  if (!container) return;

  const invoices = window.ashifStorage.getItem('ashif_invoices') || [
    { id: 'INV-101', client: 'Nexus Tech Studio', amount: '₹1,999', service: 'Hospital Website', date: '2026-03-20', status: 'Paid' },
    { id: 'INV-102', client: 'Evergreen Public School', amount: '₹1,999', service: 'School Portal', date: '2026-03-10', status: 'Paid' }
  ];

  container.innerHTML = `
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Client Name</th>
            <th>Service Rendered</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${invoices.map(inv => `
            <tr>
              <td><strong>${inv.id}</strong></td>
              <td>${inv.client}</td>
              <td>${inv.service}</td>
              <td><strong style="color: var(--primary-blue);">${inv.amount}</strong></td>
              <td>${inv.date}</td>
              <td><span class="admin-badge-pill" style="background: rgba(34, 197, 94, 0.15); color: #22c55e;">${inv.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openAddInvoiceModal() {
  const overlay = document.getElementById('admin-modal-overlay');
  const body = document.getElementById('admin-modal-body');
  if (!overlay || !body) return;

  body.innerHTML = `
    <h3 style="margin-bottom: 1.25rem;">Generate Client Invoice</h3>
    <form id="add-invoice-form" style="display: flex; flex-direction: column; gap: 1rem;">
      <div class="form-group">
        <label>Client Name *</label>
        <input type="text" id="inv-client" class="form-input" placeholder="e.g. Apex Health Clinic" required />
      </div>
      <div class="form-group">
        <label>Service Provided *</label>
        <input type="text" id="inv-service" class="form-input" placeholder="e.g. Healthcare Website Development" required />
      </div>
      <div class="form-group">
        <label>Invoice Amount (₹ / $) *</label>
        <input type="text" id="inv-amount" class="form-input" placeholder="e.g. ₹1,999 / $40" required />
      </div>
      <button type="submit" class="btn btn-primary">Generate Invoice Record</button>
    </form>
  `;

  overlay.classList.add('show');

  document.getElementById('add-invoice-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const invoices = window.ashifStorage.getItem('ashif_invoices') || [];
    invoices.unshift({
      id: 'INV-' + Math.floor(100 + Math.random() * 900),
      client: document.getElementById('inv-client').value.trim(),
      service: document.getElementById('inv-service').value.trim(),
      amount: document.getElementById('inv-amount').value.trim(),
      date: new Date().toISOString().split('T')[0],
      status: 'Paid'
    });
    window.ashifStorage.setItem('ashif_invoices', invoices);
    overlay.classList.remove('show');
    if (window.showToast) window.showToast('Invoice logged successfully!', 'success');
    renderClientsInvoicesAdmin();
  });
}

/* -------------------------------------------------------------------------- */
/* Notifications Admin Manager                                               */
/* -------------------------------------------------------------------------- */
function renderNotificationsAdmin() {
  const container = document.getElementById('notifications-admin-list');
  if (!container) return;

  const notifications = window.ashifStorage.getItem('ashif_notifications') || [
    { id: 'notif_1', type: 'New Enquiry', message: 'Enquiry received from Siddharth Verma for Hospital Website.', time: 'Today' },
    { id: 'notif_2', type: 'Resume Download', message: 'Portfolio visitor downloaded your resume from India.', time: 'Yesterday' }
  ];

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      ${notifications.map(n => `
        <div style="padding: 1rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem;">
              <span class="admin-badge-pill">${n.type}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${n.time}</span>
            </div>
            <p style="font-size: 0.9rem; font-weight: 500;">${n.message}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function markAllNotificationsRead() {
  if (window.showToast) window.showToast('All notifications marked as read.', 'info');
}

window.renderAdminDashboardViews = renderAdminDashboardViews;
window.openProjectModal = openProjectModal;
window.deleteProject = deleteProject;
window.addSkillModal = addSkillModal;
window.moveSkill = moveSkill;
window.deleteSkill = deleteSkill;
window.addCertificateModal = addCertificateModal;
window.deleteCertificate = deleteCertificate;
window.addAchievementModal = addAchievementModal;
window.deleteAchievement = deleteAchievement;
window.addServiceModal = addServiceModal;
window.deleteService = deleteService;
window.toggleReplyStatus = toggleReplyStatus;
window.deleteMessage = deleteMessage;
window.exportDataBackup = exportDataBackup;
window.importDataBackup = importDataBackup;
window.resetWebsiteData = resetWebsiteData;
window.openAddTestimonialModal = openAddTestimonialModal;
window.toggleTestimonialApproval = toggleTestimonialApproval;
window.deleteTestimonial = deleteTestimonial;
window.openAddBlogPostModal = openAddBlogPostModal;
window.deleteBlogPost = deleteBlogPost;
window.openAddInvoiceModal = openAddInvoiceModal;
window.markAllNotificationsRead = markAllNotificationsRead;

export {
  renderAdminDashboardViews,
  openProjectModal,
  deleteProject,
  addSkillModal,
  moveSkill,
  deleteSkill,
  addCertificateModal,
  deleteCertificate,
  addAchievementModal,
  deleteAchievement,
  addServiceModal,
  deleteService,
  toggleReplyStatus,
  deleteMessage,
  exportDataBackup,
  importDataBackup,
  resetWebsiteData,
  openAddTestimonialModal,
  toggleTestimonialApproval,
  deleteTestimonial,
  openAddBlogPostModal,
  deleteBlogPost,
  openAddInvoiceModal,
  markAllNotificationsRead
};

