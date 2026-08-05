/**
 * STORAGE ENGINE - LocalStorage Mock Database for Mohammad Ashif Portfolio
 */

/**
 * DEMO ADMIN CREDENTIALS
 * IMPORTANT SECURITY NOTE FOR PRODUCTION:
 * In a real production environment, admin authentication MUST be handled via 
 * server-side endpoints over HTTPS with encrypted passwords (e.g. bcrypt/Argon2) 
 * and HTTP-only session tokens or JWTs. Client-side credential comparison is 
 * strictly for offline/prototype demonstration purposes.
 */
const DEMO_ADMIN_CREDENTIALS = {
  email: 'mohdashif.dev@gmail.com',
  password: '@Freelencing2026',
  pin: 'ashif2026'
};

const STORAGE_KEYS = {
  PROJECTS: 'ashif_projects',
  CERTIFICATES: 'ashif_certificates',
  ACHIEVEMENTS: 'ashif_achievements',
  SKILLS: 'ashif_skills',
  EXPERIENCE: 'ashif_experience',
  EDUCATION: 'ashif_education',
  SERVICES: 'ashif_services',
  TESTIMONIALS: 'ashif_testimonials',
  BLOGS: 'ashif_blogs',
  MESSAGES: 'ashif_messages',
  VISITORS: 'ashif_visitors',
  ANALYTICS: 'ashif_analytics',
  SETTINGS: 'ashif_settings',
  AUTH: 'ashif_auth_token'
};

// Initial Seed Data for First Load - Real Projects & Personal Info
const SEED_DATA = {
  projects: [
    {
      id: 'proj_startup',
      title: 'Startup Landing Page',
      description: 'A modern and responsive startup landing page designed with a premium UI, smooth animations, strong call-to-action sections, and a conversion-focused design for startups and businesses.',
      image: 'https://image.thum.io/get/width/800/crop/600/https://startup-landing-page-tau.vercel.app/',
      fallbackImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      category: 'Landing Page',
      technology: ['HTML5', 'CSS3', 'JavaScript', 'Tailwind CSS', 'Vercel'],
      github: 'https://github.com/ashiffrontend/startup-landing-page',
      demo: 'https://startup-landing-page-tau.vercel.app/',
      featured: true,
      likes: 42,
      views: 1840,
      features: [
        'Modern Hero Section',
        'Responsive Design',
        'Smooth Animations',
        'Feature Sections',
        'Pricing Section',
        'Contact Section',
        'SEO Friendly'
      ],
      completionDate: '2026-07-15'
    },
    {
      id: 'proj_school',
      title: 'Evergreen Public School',
      description: 'A professional school website designed to showcase school information, facilities, teachers, gallery, admission details, and contact information with a modern responsive interface.',
      image: 'https://image.thum.io/get/width/800/crop/600/https://evergreen-public-school-beta.vercel.app/',
      fallbackImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
      category: 'Education Website',
      technology: ['HTML5', 'CSS3', 'JavaScript', 'Responsive UI', 'Vercel'],
      github: 'https://github.com/ashiffrontend/evergreen-public-school',
      demo: 'https://evergreen-public-school-beta.vercel.app/',
      featured: true,
      likes: 38,
      views: 1420,
      features: [
        'School Information',
        'Gallery',
        'Facilities Section',
        'Teacher Section',
        'Admission Information',
        'Responsive Design',
        'Contact Integration'
      ],
      completionDate: '2026-06-20'
    },
    {
      id: 'proj_hospital',
      title: 'Hospital Website',
      description: 'A modern healthcare website designed for hospitals and clinics with appointment information, services, doctors section, and patient-friendly UI.',
      image: 'https://image.thum.io/get/width/800/crop/600/https://hospital-website-gold-eight.vercel.app/',
      fallbackImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      category: 'Healthcare Website',
      technology: ['HTML5', 'CSS3', 'JavaScript', 'Healthcare UI', 'Vercel'],
      github: 'https://github.com/ashiffrontend/hospital-website',
      demo: 'https://hospital-website-gold-eight.vercel.app/',
      featured: true,
      likes: 51,
      views: 2190,
      features: [
        'Doctor Section',
        'Medical Services',
        'Appointment Section',
        'Contact',
        'Responsive Layout',
        'Professional Healthcare Design'
      ],
      completionDate: '2026-05-10'
    },
    {
      id: 'proj_bike',
      title: 'Bike Showroom Website',
      description: 'A premium bike showroom website featuring modern vehicle presentation, showroom information, gallery, and customer-focused sections.',
      image: 'https://image.thum.io/get/width/800/crop/600/https://bike-showroom-website.vercel.app/',
      fallbackImage: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
      category: 'Business Website',
      technology: ['HTML5', 'CSS3', 'JavaScript', 'EMI Calculator', 'Vercel'],
      github: 'https://github.com/ashiffrontend/bike-showroom-website',
      demo: 'https://bike-showroom-website.vercel.app/',
      featured: true,
      likes: 29,
      views: 1120,
      features: [
        'Bike Showcase',
        'Gallery',
        'EMI Calculator',
        'Responsive Design',
        'Modern UI',
        'Contact Buttons'
      ],
      completionDate: '2026-04-18'
    },
    {
      id: 'proj_pharmacy',
      title: 'Pharmacy Website',
      description: 'A modern pharmacy website designed to present medicines, healthcare products, services, and customer support information.',
      image: 'https://image.thum.io/get/width/800/crop/600/https://pharmacy-website-gilt.vercel.app/',
      fallbackImage: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80',
      category: 'Healthcare / E-commerce',
      technology: ['HTML5', 'CSS3', 'JavaScript', 'E-commerce UI', 'WhatsApp API'],
      github: 'https://github.com/ashiffrontend/pharmacy-website',
      demo: 'https://pharmacy-website-gilt.vercel.app/',
      featured: true,
      likes: 34,
      views: 1310,
      features: [
        'Product Showcase',
        'Medicine Categories',
        'Search UI',
        'Contact Support',
        'Responsive Design',
        'WhatsApp Integration'
      ],
      completionDate: '2026-03-25'
    },
    {
      id: 'proj_car',
      title: 'Car Showroom',
      description: 'A luxury automobile dealership website featuring vehicle galleries, model specification filters, finance calculators, and instant inquiry booking.',
      image: 'https://image.thum.io/get/width/800/crop/600/https://car-showroom-mauve.vercel.app/',
      fallbackImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      category: 'Business Website',
      technology: ['HTML5', 'CSS3', 'JavaScript', 'Filter UI', 'Vercel'],
      github: 'https://github.com/ashiffrontend/car-showroom',
      demo: 'https://car-showroom-mauve.vercel.app/',
      featured: true,
      likes: 45,
      views: 1950,
      features: [
        'Luxury Car Gallery',
        'Model Comparison Grid',
        'Custom Specs Selector',
        'Test Drive Booking',
        'Responsive Layout'
      ],
      completionDate: '2026-03-01'
    },
    {
      id: 'proj_agriculture',
      title: 'Green Farm Agriculture',
      description: 'An agritech and organic farming platform promoting sustainable agriculture produce, farming machinery rentals, and farm-to-table supply connection.',
      image: 'https://image.thum.io/get/width/800/crop/600/https://greenfarm-agriculture-website.vercel.app/',
      fallbackImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      category: 'Agriculture & Business',
      technology: ['HTML5', 'CSS3', 'JavaScript', 'Agritech UI', 'Vercel'],
      github: 'https://github.com/ashiffrontend/greenfarm-agriculture-website',
      demo: 'https://greenfarm-agriculture-website.vercel.app/',
      featured: true,
      likes: 27,
      views: 980,
      features: [
        'Organic Produce Catalog',
        'Machinery Rental Guide',
        'Agricultural Tips Blog',
        'Supplier Contact Form',
        'Eco Design Palette'
      ],
      completionDate: '2026-02-14'
    },
    {
      id: 'proj_travel',
      title: 'Travel Agency',
      description: 'A vibrant travel booking web app with destination search, day-by-day tour package itineraries, customer feedback, and custom trip enquiry.',
      image: 'https://image.thum.io/get/width/800/crop/600/https://travel-agency-teal-five.vercel.app/',
      fallbackImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
      category: 'Tourism & Travel',
      technology: ['HTML5', 'CSS3', 'JavaScript', 'Travel UI', 'Vercel'],
      github: 'https://github.com/ashiffrontend/travel-agency',
      demo: 'https://travel-agency-teal-five.vercel.app/',
      featured: true,
      likes: 39,
      views: 1640,
      features: [
        'Destination Search & Filter',
        'Tour Package Cards',
        'Interactive Itinerary',
        'Traveler Reviews',
        'Enquiry Integration'
      ],
      completionDate: '2026-01-28'
    },
    {
      id: 'proj_realestate',
      title: 'Real Estate Website',
      description: 'A comprehensive real estate listing portal with property price & location filters, virtual tour schedule, floor plans, and agent contact modules.',
      image: 'https://image.thum.io/get/width/800/crop/600/https://real-estate-website-mocha-seven.vercel.app/',
      fallbackImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
      category: 'Real Estate',
      technology: ['HTML5', 'CSS3', 'JavaScript', 'Real Estate UI', 'Vercel'],
      github: 'https://github.com/ashiffrontend/real-estate-website',
      demo: 'https://real-estate-website-mocha-seven.vercel.app/',
      featured: true,
      likes: 48,
      views: 2050,
      features: [
        'Property Search Filters',
        'Floor Plan Showcase',
        'Neighborhood Ratings',
        'Schedule Tour Form',
        'Agent Contact'
      ],
      completionDate: '2026-01-10'
    },
    {
      id: 'proj_fashion',
      title: 'Fashion Store',
      description: 'A modern fashion & clothing e-commerce storefront with collection filter grid, product modal preview, shopping cart UI, and flash deal banners.',
      image: 'https://image.thum.io/get/width/800/crop/600/https://fashion-store-ochre-eight.vercel.app/',
      fallbackImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
      category: 'E-Commerce',
      technology: ['HTML5', 'CSS3', 'JavaScript', 'E-Commerce UI', 'Vercel'],
      github: 'https://github.com/ashiffrontend/fashion-store',
      demo: 'https://fashion-store-ochre-eight.vercel.app/',
      featured: true,
      likes: 56,
      views: 2480,
      features: [
        'Trend Collection Grid',
        'Product Quick View Modal',
        'Cart State Management',
        'Deal Countdown Banner',
        'Mobile Optimized'
      ],
      completionDate: '2025-12-15'
    }
  ],
  certificates: [
    {
      id: 'c1',
      title: 'Meta Certified Senior Frontend Developer',
      organization: 'Meta / Coursera',
      issueDate: '2025-08-14',
      image: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80',
      downloadUrl: '#'
    },
    {
      id: 'c2',
      title: 'Advanced JavaScript & Modern Web Performance',
      organization: 'Frontend Masters',
      issueDate: '2025-04-10',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
      downloadUrl: '#'
    }
  ],
  achievements: [
    {
      id: 'a1',
      name: '1st Place Winner - Global Web UX Hackathon',
      description: 'Built a lightweight accessibility-focused web application under 24 hours competing against 800+ global developer teams.',
      year: '2026',
      category: 'Hackathons'
    },
    {
      id: 'a2',
      name: 'Google Summer of Code Alumni',
      description: 'Contributed core UI component optimizations to open-source developer tooling libraries.',
      year: '2025',
      category: 'Open Source'
    }
  ],
  // EXACT SKILLS REQUESTED BY USER
  skills: [
    { id: 's1', icon: '🌐', name: 'HTML5', percentage: 98, category: 'Frontend' },
    { id: 's2', icon: '🎨', name: 'CSS3', percentage: 96, category: 'Frontend' },
    { id: 's3', icon: '⚡', name: 'JavaScript', percentage: 95, category: 'Frontend' },
    { id: 's4', icon: '📱', name: 'Responsive Web Design', percentage: 98, category: 'Design & UX' },
    { id: 's5', icon: '💻', name: 'Frontend Development', percentage: 97, category: 'Engineering' },
    { id: 's6', icon: '🚀', name: 'Landing Page Design', percentage: 96, category: 'Design & UX' },
    { id: 's7', icon: '🌐', name: 'Website Development', percentage: 95, category: 'Engineering' },
    { id: 's8', icon: '✨', name: 'UI Design', percentage: 94, category: 'Design & UX' },
    { id: 's9', icon: '📐', name: 'CSS Grid', percentage: 95, category: 'Frontend' },
    { id: 's10', icon: '📦', name: 'Flexbox', percentage: 98, category: 'Frontend' },
    { id: 's11', icon: '🌿', name: 'Git', percentage: 92, category: 'Tools & Version Control' },
    { id: 's12', icon: '🐙', name: 'GitHub', percentage: 94, category: 'Tools & Version Control' },
    { id: 's13', icon: '▲', name: 'Vercel', percentage: 92, category: 'Deployment' },
    { id: 's14', icon: '🔍', name: 'SEO', percentage: 90, category: 'Optimization' },
    { id: 's15', icon: '📲', name: 'PWA', percentage: 88, category: 'Engineering' }
  ],
  experience: [
    {
      id: 'e1',
      company: 'Frontend Web Development Internship',
      role: 'Frontend Developer Intern',
      duration: '6 Months Internship Experience',
      description: 'Gained 6 months of hands-on internship experience crafting responsive web interfaces, building 10+ real-world projects, and optimizing web performance with modern JavaScript, HTML5, and CSS3.'
    },
    {
      id: 'e2',
      company: 'Freelance & Open Source Development',
      role: 'Frontend Web Developer',
      duration: '1 Year Web Development Experience',
      description: 'Built 10+ real-world projects including custom business landing pages, interactive web applications, and UI component libraries.'
    }
  ],
  education: [
    {
      id: 'ed1',
      school: 'Aliah University',
      college: 'Department of Computer Science & Application',
      degree: 'Bachelor of Computer Applications (BCA)',
      year: '2024 - 2027 (Graduating 2027)',
      cgpa: 'Enrolled'
    }
  ],
  services: [
    {
      id: 'pkg_starter',
      title: 'Starter Landing Page',
      category: 'Startups & Campaigns',
      description: 'Single-page high-converting landing page crafted for startups, local campaigns, and product launches.',
      priceINR: '₹999',
      priceUSD: '$20',
      advanceINR: '₹199 Only',
      advanceUSD: '$4',
      buttonText: 'Book Now – ₹199',
      badge: '',
      icon: '<i class="fa-solid fa-paper-plane" style="color: var(--primary-blue);"></i>',
      features: [
        'Single Page Website',
        'Mobile Responsive',
        'WhatsApp Button',
        'Contact Form',
        'Basic SEO',
        'Delivery in 2–3 Days'
      ]
    },
    {
      id: 'pkg_business',
      title: 'Business Website',
      category: 'Local Shops & Services',
      description: 'Multi-page professional business website ideal for showrooms, clinics, services, and local brands.',
      priceINR: '₹1,499',
      priceUSD: '$30',
      advanceINR: '₹299 Only',
      advanceUSD: '$6',
      buttonText: 'Book Now – ₹299',
      badge: 'Popular',
      icon: '<i class="fa-solid fa-briefcase" style="color: var(--primary-blue);"></i>',
      features: [
        'Up to 5 Pages',
        'Premium UI Design',
        'Google Maps',
        'WhatsApp Integration',
        'Contact Form',
        'Gallery',
        'Mobile Responsive'
      ]
    },
    {
      id: 'pkg_professional',
      title: 'Professional Website',
      category: 'Growth & Brands',
      description: 'Comprehensive business portal with fast loading speed, rich galleries, and complete social media integration.',
      priceINR: '₹2,499',
      priceUSD: '$50',
      advanceINR: '₹499 Only',
      advanceUSD: '$10',
      buttonText: 'Book Now – ₹499',
      badge: 'Best Value',
      icon: '<i class="fa-solid fa-gem" style="color: var(--primary-blue);"></i>',
      features: [
        'Up to 8 Pages',
        'Premium Design',
        'Contact Forms',
        'SEO Ready',
        'Fast Loading',
        'Social Media Integration',
        'Gallery',
        'Responsive Design'
      ]
    },
    {
      id: 'pkg_pro',
      title: 'Business Pro',
      category: 'Advanced Web Apps',
      description: 'High-performance custom web platform featuring blog, analytics, advanced forms, and micro-animations.',
      priceINR: '₹3,999',
      priceUSD: '$80',
      advanceINR: '₹799 Only',
      advanceUSD: '$15',
      buttonText: 'Book Now – ₹799',
      badge: 'Advanced',
      icon: '<i class="fa-solid fa-crown" style="color: var(--primary-blue);"></i>',
      features: [
        'Custom Website',
        'Modern UI',
        'Blog',
        'Advanced Forms',
        'Analytics',
        'Premium Animations',
        'Google Maps',
        'WhatsApp'
      ]
    },
    {
      id: 'pkg_custom',
      title: 'Custom Projects',
      category: 'Enterprise & Institutions',
      description: 'Tailor-made web portals designed for specialized requirements across healthcare, education, and corporate clients.',
      priceINR: '₹4,999',
      priceUSD: '$100',
      advanceINR: '₹999',
      advanceUSD: '$20',
      buttonText: 'Request Quote',
      badge: 'Custom',
      icon: '<i class="fa-solid fa-layer-group" style="color: var(--primary-blue);"></i>',
      suitableFor: [
        'Real Estate',
        'Hospital',
        'School',
        'Coaching',
        'Pharmacy',
        'Restaurant',
        'Gym',
        'Company',
        'Custom Business Websites'
      ],
      features: [
        'Tailor-made Architecture',
        'Custom Database & API',
        'Specialized Admin Workflows',
        'Priority Direct Support'
      ]
    }
  ],
  testimonials: [
    {
      id: 't1',
      clientName: 'Sarah Jenkins',
      company: 'CEO, BrightSky SaaS',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      review: 'Mohammad Ashif delivered our web application redesign ahead of schedule! His eye for Apple-grade design details and slick CSS animations transformed our user conversion rate.'
    },
    {
      id: 't2',
      clientName: 'David Miller',
      company: 'Founder, Nexus Fintech',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      review: 'One of the best frontend developers I have worked with. Clean code, responsive layout across all devices, and an incredible admin panel. Highly recommended!'
    }
  ],
  blogs: [
    {
      id: 'b1',
      title: 'Building 60FPS UI Animations with Pure CSS Variables',
      excerpt: 'Learn how to leverage GPU-accelerated CSS transforms and custom properties for smooth Apple-style web animations.',
      content: 'Detailed article on CSS GPU composition layers and performance profiling...',
      tag: 'CSS Architecture',
      date: '2026-06-12',
      readTime: '5 min read'
    },
    {
      id: 'b2',
      title: 'Mastering Vanilla JavaScript LocalStorage as a Light Database',
      excerpt: 'How to build robust local state synchronization and caching systems without heavy framework dependencies.',
      content: 'In-depth guide covering JSON serialization, storage limits, tab syncing, and event buses...',
      tag: 'JavaScript',
      date: '2026-04-05',
      readTime: '7 min read'
    }
  ],
  messages: [
    {
      id: 'msg1',
      senderName: 'Alex Thorne',
      email: 'alex@thorne.io',
      subject: 'New Web Project Collaboration',
      serviceRequested: 'Custom Business Website',
      message: 'Hi Mohammad! Loved your portfolio design. We are looking to rebuild our company platform with a similar aesthetic.',
      date: '2026-07-29 14:30',
      replied: false
    }
  ],
  visitors: {
    today: 0,
    yesterday: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
    total: 0,
    uniqueVisitors: 0,
    onlineVisitors: 0,
    returningVisitors: 0,
    pageViews: 0,
    mostViewedProject: 'No data available',
    latestViewedProject: 'No data available',
    weeklyGraph: [],
    topPages: [],
    sources: [],
    browsers: [],
    devices: [],
    countries: [],
    operatingSystems: []
  },
  analytics: {
    pageViews: 0,
    resumeDownloads: 0,
    githubClicks: 0,
    linkedinClicks: 0,
    liveDemoClicks: 0,
    hireMeClicks: 0,
    contactClicks: 0,
    emailClicks: 0,
    callClicks: 0,
    whatsappClicks: 0,
    projectViews: 0,
    projectLikes: 0,
    contactSubmits: 0,
    detailsClicks: 0,
    servicesClicks: 0,
    blogClicks: 0,
    certificatesClicks: 0,
    testimonialsClicks: 0,
    projectGithubClicks: 0
  },
  settings: {
    siteName: 'Mohammad Ashif | Frontend Web Developer',
    developerName: 'Mohammad Ashif',
    developerTitle: 'Frontend Web Developer | BCA Student @ Aliah University (\'27)',
    bio: 'BCA Student at Aliah University (Graduating 2027) • Frontend Web Developer • 6 Months Internship Experience • 1 Year Web Development Experience • Built 10+ Real-World Projects • Available for Freelance & Remote Work',
    email: 'mohdashif.dev@gmail.com',
    phone: '+91 6202782715',
    phoneNote: 'WhatsApp Msg Only',
    whatsappDirect: 'https://wa.me/916202782715?text=Hi%20Mohammad%20Ashif,%20I%20would%20like%20to%20discuss%20a%20project!',
    github: 'https://github.com/ashiffrontend',
    linkedin: 'https://www.linkedin.com/in/mohd-ashif-095963425/',
    whatsapp: 'https://whatsapp.com/channel/0029VbC6oUdHAdNeVu2Ijp2c',
    website: 'https://mohdashif.dev',
    location: 'Kolkata / New Delhi, India',
    resumeUrl: 'assets/resume/Mohammad_Ashif_Resume.pdf',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    logoText: 'MA',
    defaultTheme: 'light',
    adminPin: 'ashif2026',
    gaMeasurementId: 'G-XXXXXXXXXX',
    clarityId: 'XXXXXX'
  }
};

class LocalStorageEngine {
  constructor() {
    this.init();
  }

  init() {
    // Seed initial data if missing or update settings/projects if with old defaults
    Object.keys(SEED_DATA).forEach(key => {
      const storageKey = STORAGE_KEYS[key.toUpperCase()];
      if (storageKey) {
        if (!localStorage.getItem(storageKey)) {
          localStorage.setItem(storageKey, JSON.stringify(SEED_DATA[key]));
        } else if (key === 'projects') {
          // Sync new real projects if old dummy data exists or if list is incomplete
          try {
            const current = JSON.parse(localStorage.getItem(storageKey));
            if (!Array.isArray(current) || current.length < 10 || current.some(p => p.id === 'p1' || p.title.includes('Vercel-Style') || p.title.includes('Apple Glassmorphic') || !p.likes)) {
              localStorage.setItem(storageKey, JSON.stringify(SEED_DATA.projects));
            }
          } catch(e) {}
        } else if (key === 'services') {
          // Sync new services if old pricing data exists
          try {
            const current = JSON.parse(localStorage.getItem(storageKey));
            if (!Array.isArray(current) || current.some(s => s.id === 'srv1' || s.id === 'srv_landing' || !s.advanceINR)) {
              localStorage.setItem(storageKey, JSON.stringify(SEED_DATA.services));
            }
          } catch(e) {}
        } else if (key === 'settings') {
          // Sync new settings defaults
          try {
            const current = JSON.parse(localStorage.getItem(storageKey));
            current.whatsapp = 'https://whatsapp.com/channel/0029VbC6oUdHAdNeVu2Ijp2c';
            current.email = 'mohdashif.dev@gmail.com';
            current.github = 'https://github.com/ashiffrontend';
            current.linkedin = 'https://www.linkedin.com/in/mohd-ashif-095963425/';
            current.phone = '+91 6202782715';
            current.phoneNote = 'WhatsApp Msg Only';
            current.whatsappDirect = 'https://wa.me/916202782715?text=Hi%20Mohammad%20Ashif,%20I%20would%20like%20to%20discuss%20a%20project!';
            if (!current.bio || current.bio.includes('Senior Frontend Developer with passion') || current.bio.includes('10+ years')) {
              current.bio = SEED_DATA.settings.bio;
              current.developerTitle = SEED_DATA.settings.developerTitle;
              current.website = SEED_DATA.settings.website;
            }
            localStorage.setItem(storageKey, JSON.stringify(current));
          } catch(e) {}
        }
      }
    });
  }

  getItem(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`Error reading ${key} from LocalStorage:`, e);
      return null;
    }
  }

  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Error setting ${key} in LocalStorage:`, e);
      return false;
    }
  }

  // Specialized Getters & Setters
  getProjects() { return this.getItem(STORAGE_KEYS.PROJECTS) || []; }
  saveProjects(projects) { return this.setItem(STORAGE_KEYS.PROJECTS, projects); }

  likeProject(projectId) {
    const projects = this.getProjects();
    const proj = projects.find(p => p.id === projectId);
    if (proj) {
      proj.likes = (proj.likes || 0) + 1;
      this.saveProjects(projects);
      this.trackEvent('projectLikes');
      return proj.likes;
    }
    return 0;
  }

  incrementProjectView(projectId) {
    const projects = this.getProjects();
    const proj = projects.find(p => p.id === projectId);
    if (proj) {
      proj.views = (proj.views || 0) + 1;
      this.saveProjects(projects);
      this.trackEvent('projectViews');
      return proj.views;
    }
    return 0;
  }

  bookmarkProject(projectId) {
    const bookmarks = this.getItem('ashif_project_bookmarks') || [];
    const index = bookmarks.indexOf(projectId);
    let isBookmarked = false;
    if (index > -1) {
      bookmarks.splice(index, 1);
    } else {
      bookmarks.push(projectId);
      isBookmarked = true;
    }
    this.setItem('ashif_project_bookmarks', bookmarks);
    return isBookmarked;
  }

  isProjectBookmarked(projectId) {
    const bookmarks = this.getItem('ashif_project_bookmarks') || [];
    return bookmarks.includes(projectId);
  }

  getCertificates() { return this.getItem(STORAGE_KEYS.CERTIFICATES) || []; }
  saveCertificates(certs) { return this.setItem(STORAGE_KEYS.CERTIFICATES, certs); }

  getAchievements() { return this.getItem(STORAGE_KEYS.ACHIEVEMENTS) || []; }
  saveAchievements(ach) { return this.setItem(STORAGE_KEYS.ACHIEVEMENTS, ach); }

  getSkills() { return this.getItem(STORAGE_KEYS.SKILLS) || []; }
  saveSkills(skills) { return this.setItem(STORAGE_KEYS.SKILLS, skills); }

  getExperience() { return this.getItem(STORAGE_KEYS.EXPERIENCE) || []; }
  saveExperience(exp) { return this.setItem(STORAGE_KEYS.EXPERIENCE, exp); }

  getEducation() { return this.getItem(STORAGE_KEYS.EDUCATION) || []; }
  saveEducation(edu) { return this.setItem(STORAGE_KEYS.EDUCATION, edu); }

  getServices() { return this.getItem(STORAGE_KEYS.SERVICES) || []; }
  saveServices(srv) { return this.setItem(STORAGE_KEYS.SERVICES, srv); }

  getTestimonials() { return this.getItem(STORAGE_KEYS.TESTIMONIALS) || []; }
  saveTestimonials(t) { return this.setItem(STORAGE_KEYS.TESTIMONIALS, t); }

  getBlogs() { return this.getItem(STORAGE_KEYS.BLOGS) || []; }
  saveBlogs(b) { return this.setItem(STORAGE_KEYS.BLOGS, b); }

  getMessages() { return this.getItem(STORAGE_KEYS.MESSAGES) || []; }
  addMessage(msg) {
    const messages = this.getMessages();
    const newMsg = {
      id: 'msg_' + Date.now(),
      date: new Date().toLocaleString(),
      replied: false,
      ...msg
    };
    messages.unshift(newMsg);
    this.setItem(STORAGE_KEYS.MESSAGES, messages);
    this.trackEvent('contactClicks');
    return newMsg;
  }

  getVisitors() { 
    const v = this.getItem(STORAGE_KEYS.VISITORS);
    if (!v) return SEED_DATA.visitors;
    return { ...SEED_DATA.visitors, ...v };
  }
  saveVisitors(v) { return this.setItem(STORAGE_KEYS.VISITORS, v); }

  incrementVisitor() {
    const visitors = this.getVisitors();
    visitors.today = (visitors.today || 0) + 1;
    visitors.total = (visitors.total || 0) + 1;
    visitors.weekly = (visitors.weekly || 0) + 1;
    visitors.monthly = (visitors.monthly || 0) + 1;
    visitors.pageViews = (visitors.pageViews || 0) + 1;
    
    // Track unique visitor via session flag
    if (!sessionStorage.getItem('ashif_visited_session')) {
      sessionStorage.setItem('ashif_visited_session', 'true');
      visitors.uniqueVisitors = (visitors.uniqueVisitors || 0) + 1;
    } else {
      visitors.returningVisitors = (visitors.returningVisitors || 0) + 1;
    }

    this.saveVisitors(visitors);
    return visitors;
  }

  getAnalytics() { 
    const a = this.getItem(STORAGE_KEYS.ANALYTICS);
    if (!a) return SEED_DATA.analytics;
    return { ...SEED_DATA.analytics, ...a };
  }
  trackEvent(eventName) {
    const analytics = this.getAnalytics();
    if (analytics[eventName] !== undefined) {
      analytics[eventName] += 1;
      this.setItem(STORAGE_KEYS.ANALYTICS, analytics);
    } else {
      analytics[eventName] = 1;
      this.setItem(STORAGE_KEYS.ANALYTICS, analytics);
    }
  }

  getSettings() { 
    const s = this.getItem(STORAGE_KEYS.SETTINGS);
    if (!s) return SEED_DATA.settings;
    return { ...SEED_DATA.settings, ...s };
  }
  saveSettings(s) { 
    const result = this.setItem(STORAGE_KEYS.SETTINGS, s); 
    window.dispatchEvent(new CustomEvent('ashif_profile_updated', { detail: s }));
    return result;
  }

  // Backup & Restore
  backupData() {
    const backup = {};
    Object.keys(STORAGE_KEYS).forEach(k => {
      backup[k] = this.getItem(STORAGE_KEYS[k]);
    });
    return JSON.stringify(backup, null, 2);
  }

  restoreData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      Object.keys(parsed).forEach(k => {
        if (STORAGE_KEYS[k]) {
          this.setItem(STORAGE_KEYS[k], parsed[k]);
        }
      });
      return true;
    } catch (e) {
      console.error('Failed to restore data:', e);
      return false;
    }
  }
}

const ashifStorage = new LocalStorageEngine();
window.ashifStorage = ashifStorage;
window.DEMO_ADMIN_CREDENTIALS = DEMO_ADMIN_CREDENTIALS;
