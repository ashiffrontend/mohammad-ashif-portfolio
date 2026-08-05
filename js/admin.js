/**
 * ADMIN AUTHENTICATION & NAVIGATION CONTROLLER
 * Full JWT + Refresh Token + Role Management for Mohammad Ashif
 */

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
  initAdminNavigation();
});

function checkAdminAuth() {
  const authOverlay = document.getElementById('admin-auth-overlay');
  const loginForm = document.getElementById('admin-login-form');
  const emailInput = document.getElementById('admin-email-input');
  const passwordInput = document.getElementById('admin-password-input');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');
  const forgotPasswordLink = document.getElementById('forgot-password-link');

  const token = localStorage.getItem('ashif_jwt_token');

  // Verify JWT session with backend
  if (token) {
    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.user && data.user.role === 'admin') {
        sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');
        if (authOverlay) authOverlay.style.display = 'none';
        if (window.renderAdminDashboardViews) window.renderAdminDashboardViews();
      } else {
        // Invalid or expired token
        localStorage.removeItem('ashif_jwt_token');
        localStorage.removeItem('ashif_refresh_token');
        sessionStorage.removeItem(STORAGE_KEYS.AUTH);
        if (authOverlay) authOverlay.style.display = 'flex';
      }
    })
    .catch(() => {
      if (sessionStorage.getItem(STORAGE_KEYS.AUTH) !== 'true') {
        if (authOverlay) authOverlay.style.display = 'flex';
      }
    });
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH);
    if (authOverlay) authOverlay.style.display = 'flex';
  }

  // Login form handler with real database authentication
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const enteredEmail = emailInput?.value.trim();
    const enteredPassword = passwordInput?.value.trim();

    if (!enteredEmail || !enteredPassword) {
      if (window.showToast) window.showToast('Invalid Email or Password', 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: enteredEmail, password: enteredPassword, role: 'admin' })
      });
      const data = await res.json();

      if (res.ok && data.success && data.accessToken) {
        localStorage.setItem('ashif_jwt_token', data.accessToken);
        if (data.refreshToken) localStorage.setItem('ashif_refresh_token', data.refreshToken);
        sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');

        if (authOverlay) authOverlay.style.display = 'none';
        if (window.showToast) window.showToast(`Welcome back, ${data.user?.name || 'Admin'}!`, 'success');
        if (window.renderAdminDashboardViews) window.renderAdminDashboardViews();
      } else {
        if (window.showToast) window.showToast('Invalid Email or Password', 'error');
      }
    } catch(err) {
      if (window.showToast) window.showToast('Invalid Email or Password', 'error');
    }
  });

  // Forgot password OTP modal trigger
  forgotPasswordLink?.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = prompt('Enter your registered admin email for password reset OTP:');
    if (!email) return;

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        const otp = prompt('An OTP has been dispatched! Enter the 6-digit OTP code below:');
        if (otp) {
          const newPass = prompt('Enter your new secure password:');
          if (newPass) {
            const resetRes = await fetch('/api/auth/reset-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, otp, newPassword: newPass })
            });
            const resetData = await resetRes.json();
            if (resetData.success) {
              if (window.showToast) window.showToast('Password reset successfully! Please sign in.', 'success');
            } else {
              if (window.showToast) window.showToast('Invalid Email or Password', 'error');
            }
          }
        }
      } else {
        if (window.showToast) window.showToast('Invalid Email or Password', 'error');
      }
    } catch(err) {
      if (window.showToast) window.showToast('Unable to process request.', 'error');
    }
  });

  // Logout handler
  const handleLogout = async () => {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem('ashif_jwt_token');
    localStorage.removeItem('ashif_refresh_token');
    window.location.reload();
  };

  logoutBtn?.addEventListener('click', handleLogout);
  sidebarLogoutBtn?.addEventListener('click', handleLogout);
}

function initAdminNavigation() {
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const viewPanels = document.querySelectorAll('.view-panel');
  const sidebarToggleBtn = document.getElementById('admin-sidebar-toggle');
  const sidebar = document.getElementById('admin-sidebar');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (link.id === 'sidebar-logout-btn') return;

      const targetViewId = link.dataset.target;
      if (!targetViewId) return;

      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      viewPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === targetViewId) {
          panel.classList.add('active');
        }
      });

      sidebar?.classList.remove('open');
    });
  });

  sidebarToggleBtn?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
  });
}
