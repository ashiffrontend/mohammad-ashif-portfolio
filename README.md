# Mohammad Ashif - Personal Portfolio & Secure Admin Dashboard

A premium, production-ready, highly responsive personal portfolio and secure admin control panel for **Mohammad Ashif** (Senior Frontend Developer & UI/UX Specialist).

Built with **HTML5, CSS3, and Vanilla JavaScript** inspired by Apple + Vercel + Framer + Linear design principles.

---

## 🌟 Key Features

### Public Portfolio Website (`index.html`)
- **Modern Aesthetic**: Glassmorphism cards, Apple/Vercel typography (Poppins + Inter), smooth gradient text, and subtle particle canvas background.
- **Light & Dark Mode**: Default light theme with instant dark theme toggle and persistent state memory.
- **Animated Hero Section**: Professional intro, animated typing effect, glowing status pill, profile card, social badges, and quick CTA buttons.
- **Live Visitor Counter Widget**: Animated counter in navbar (`👁 12,458 Visitors`) with expand dropdown showing Today, Online, Monthly, and Total counts.
- **Dynamic Projects Showcase**: Search box, category filters (Web Apps, UI/UX, Landing Pages, Full Stack), featured tags, and direct GitHub / Live Demo links.
- **Interactive Lightbox**: Preview full-size project screenshots and verified certificate images in a slick glass modal.
- **Contact Form & Local Storage Inbox**: Client messages automatically persist to LocalStorage and appear in the Admin Inbox with toast notifications.
- **Gently Pulsing Blue Heart Footer**: Automatic current year display and blue gradient author credit.

### Secure Admin Dashboard (`admin.html`)
- **PIN Authentication**: Secure login screen (Default PIN: `ashif2026` or quick demo login button).
- **Vercel/Linear Style Interface**: Collapsible sidebar, active tab indicators, and unread message badges.
- **15 Integrated Control Modules**:
  1. 📊 **Dashboard Overview**: Key performance metrics (Total Projects, Certificates, Visitors, Messages, Skills) and SVG weekly growth chart.
  2. 🚀 **Project Management**: Full CRUD (Add, Edit, Delete, Category Filter, Tech Stack, Featured Toggle).
  3. 📜 **Certificates**: Upload, preview, and delete.
  4. 🏆 **Achievements**: Track awards and hackathons.
  5. ⚡ **Skills**: Proficiency sliders and categories.
  6. 💼 **Experience**: Work history timeline.
  7. 🎓 **Education**: Degrees and CGPA records.
  8. 🛠️ **Services**: Pricing cards and service descriptions.
  9. ⭐ **Testimonials**: Client reviews and star ratings.
  10. ✍️ **Blogs**: Articles and publishing dates.
  11. ✉️ **Messages Inbox**: View form submissions, toggle reply status, or delete.
  12. 👥 **Visitor Analytics**: Detailed breakdown of devices, browsers, and location traffic.
  13. 📈 **Interaction Metrics**: Track resume downloads, GitHub clicks, live demo views, and contact taps.
  14. 📄 **Resume Manager**: Update resume download URL and live preview.
  15. ⚙️ **Settings & Backup**: Update contact info, change admin PIN, and export/import full JSON data backups.

---

## 📁 Project Structure

```
/
├── index.html          # Public Portfolio Entry Point
├── admin.html          # Secure Admin Dashboard Entry Point
├── robots.txt          # Search Engine Directive
├── sitemap.xml         # XML Sitemap
├── css/
│   ├── style.css       # Main Theme & Component Styles
│   ├── admin.css       # Admin Dashboard Vercel UI Styles
│   ├── animations.css  # Keyframe Animations & Glassmorphism
│   └── responsive.css  # Mobile First Breakpoints (320px - 1400px+)
├── js/
│   ├── storage.js      # LocalStorage Mock Database & Seed Engine
│   ├── theme.js        # Light/Dark Theme Switcher & Memory
│   ├── visitor.js      # Traffic & Visitor Analytics Parser
│   ├── counter.js      # Animated Counter & Visitor Badge Widget
│   ├── script.js       # Public Website Interaction Controller
│   ├── admin.js        # Admin PIN Auth & Sidebar Navigation
│   └── dashboard.js    # Admin Dashboard Sub-screens & CRUD Handlers
└── README.md           # Documentation
```

---

## 🔑 Admin Credentials

- **Default Admin PIN**: `ashif2026`
- **Quick Demo Access**: Click the **🔑 Quick Demo Login** button on `admin.html`.
