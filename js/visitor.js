/**
 * REAL-TIME VISITOR TELEMETRY & DATABASE ANALYTICS TRACKER
 */

(function () {
  function detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    return 'Other';
  }

  function detectOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown OS';
  }

  function detectDevice() {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'Mobile';
    if (/ipad|tablet/i.test(ua)) return 'Tablet';
    return 'Desktop';
  }

  function getSessionId() {
    let sid = sessionStorage.getItem('ashif_session_token');
    if (!sid) {
      sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      sessionStorage.setItem('ashif_session_token', sid);
    }
    return sid;
  }

  async function recordVisit(eventType = 'pageView') {
    const telemetry = {
      eventType,
      page: window.location.pathname + window.location.hash,
      referrer: document.referrer || 'Direct Traffic',
      browser: detectBrowser(),
      os: detectOS(),
      device: detectDevice(),
      country: 'India', // Server resolves IP country or default
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language || 'en-US',
      sessionId: getSessionId()
    };

    try {
      const res = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telemetry)
      });
      if (res.ok) {
        const data = await res.json();
        window.dispatchEvent(new CustomEvent('visitorTracked', { detail: data }));
      }
    } catch (err) {
      // Local fallback tracking if offline
      if (window.ashifStorage && eventType === 'pageView') {
        const updatedVisitors = window.ashifStorage.incrementVisitor();
        window.dispatchEvent(new CustomEvent('visitorUpdated', { detail: updatedVisitors }));
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    recordVisit('pageView');

    // Heartbeat every 30s to keep live online visitor count accurate
    setInterval(() => {
      recordVisit('heartbeat');
    }, 30000);
  });

  window.recordVisit = recordVisit;
  window.trackCustomEvent = function(eventName, extraData = {}) {
    const telemetry = {
      eventType: eventName,
      page: window.location.pathname + window.location.hash,
      referrer: document.referrer || 'Direct Traffic',
      browser: detectBrowser(),
      os: detectOS(),
      device: detectDevice(),
      sessionId: getSessionId(),
      ...extraData
    };

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telemetry)
    }).catch(() => {
      if (window.ashifStorage) window.ashifStorage.trackEvent(eventName);
    });
  };
})();

export const trackCustomEvent = window.trackCustomEvent;
