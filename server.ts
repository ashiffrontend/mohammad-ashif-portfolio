import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import { createServer as createViteServer } from "vite";

const app = express();
app.set("trust proxy", 1);
const PORT = 3000;

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_ashif_portfolio_2026";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "super_secret_refresh_jwt_key_ashif_portfolio_2026";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "mohdashif.dev@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "secure_admin_password_2026";

// MongoDB Mongoose User Model Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: "Mohammad Ashif" },
  role: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now }
});

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

// MongoDB Database Connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
let isMongoConnected = false;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      isMongoConnected = true;
      console.log("✅ MongoDB database connected successfully");
      const adminInDb = await (UserModel as any).findOne({ role: "admin" });
      if (!adminInDb) {
        await UserModel.create({
          email: ADMIN_EMAIL.toLowerCase(),
          passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
          name: "Mohammad Ashif",
          role: "admin"
        });
        console.log("🔒 Admin account provisioned in MongoDB database");
      }
    })
    .catch((err) => {
      console.warn("MongoDB connection status:", err.message);
    });
}

// Security & Middleware Configuration
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts and external assets (FontAwesome, Unsplash, etc.)
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting for public API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
  validate: { xForwardedForHeader: false, forwardedHeader: false }
});
app.use("/api/", apiLimiter);

// In-Memory Data Store with Persistent MongoDB Interface Fallback
interface StoreData {
  users: any[];
  projects: any[];
  visitors: any[];
  analytics: {
    pageViews: number;
    resumeDownloads: number;
    githubClicks: number;
    linkedinClicks: number;
    liveDemoClicks: number;
    hireMeClicks: number;
    contactClicks: number;
    emailClicks: number;
    callClicks: number;
    whatsappClicks: number;
    projectViews: number;
    projectLikes: number;
    contactSubmits: number;
    detailsClicks: number;
    servicesClicks: number;
    blogClicks: number;
    certificatesClicks: number;
    testimonialsClicks: number;
    projectGithubClicks: number;
  };
  enquiries: any[];
  testimonials: any[];
  blogPosts: any[];
  services: any[];
  notifications: any[];
  clients: any[];
  invoices: any[];
  otps: Map<string, { otp: string; expires: number }>;
}

// Initialized Seed Data
const memoryDb: StoreData = {
  users: [
    {
      id: "usr_admin",
      email: ADMIN_EMAIL,
      passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
      name: "Mohammad Ashif",
      role: "admin",
      createdAt: new Date().toISOString()
    }
  ],
  projects: [
    {
      id: "proj_startup",
      title: "Startup Landing Page",
      description: "A modern and responsive startup landing page designed with a premium UI, smooth animations, strong call-to-action sections, and a conversion-focused design for startups and businesses.",
      image: "https://image.thum.io/get/width/800/crop/600/https://startup-landing-page-tau.vercel.app/",
      fallbackImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      category: "Landing Page",
      technology: ["HTML5", "CSS3", "JavaScript", "Tailwind CSS", "Vercel"],
      github: "https://github.com/ashiffrontend/startup-landing-page",
      demo: "https://startup-landing-page-tau.vercel.app/",
      featured: true,
      likes: 42,
      views: 1840,
      features: ["Modern Hero Section", "Responsive Design", "Call to Action", "Services Grid", "Contact Section"],
      completionDate: "2026-03-15"
    },
    {
      id: "proj_school",
      title: "Evergreen Public School",
      description: "A professional school website designed to showcase school information, facilities, teachers, gallery, admission details, and contact information with a modern responsive interface.",
      image: "https://image.thum.io/get/width/800/crop/600/https://evergreen-public-school-beta.vercel.app/",
      fallbackImage: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80",
      category: "Education Website",
      technology: ["HTML5", "CSS3", "JavaScript", "Responsive UI", "Vercel"],
      github: "https://github.com/ashiffrontend/evergreen-public-school",
      demo: "https://evergreen-public-school-beta.vercel.app/",
      featured: true,
      likes: 38,
      views: 1420,
      features: ["School Information", "Gallery", "Facilities", "Teachers List", "Admission Info", "Contact Form"],
      completionDate: "2026-03-10"
    },
    {
      id: "proj_hospital",
      title: "Hospital Website",
      description: "A modern healthcare website designed for hospitals and clinics with appointment information, services, doctors section, and patient-friendly UI.",
      image: "https://image.thum.io/get/width/800/crop/600/https://hospital-website-gold-eight.vercel.app/",
      fallbackImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
      category: "Healthcare Website",
      technology: ["HTML5", "CSS3", "JavaScript", "Healthcare UI", "Vercel"],
      github: "https://github.com/ashiffrontend/hospital-website",
      demo: "https://hospital-website-gold-eight.vercel.app/",
      featured: true,
      likes: 51,
      views: 2190,
      features: ["Doctor Section", "Medical Services", "Appointment Info", "Emergency Hotline", "Department Showcase"],
      completionDate: "2026-03-05"
    },
    {
      id: "proj_bike",
      title: "Bike Showroom Website",
      description: "A premium bike showroom website featuring modern vehicle presentation, showroom information, gallery, and customer-focused sections.",
      image: "https://image.thum.io/get/width/800/crop/600/https://bike-showroom-website.vercel.app/",
      fallbackImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
      category: "Business Website",
      technology: ["HTML5", "CSS3", "JavaScript", "EMI Calculator", "Vercel"],
      github: "https://github.com/ashiffrontend/bike-showroom-website",
      demo: "https://bike-showroom-website.vercel.app/",
      featured: true,
      likes: 29,
      views: 1120,
      features: ["Bike Showcase", "Gallery", "Specs Grid", "Test Drive Booking", "Contact Section"],
      completionDate: "2026-02-28"
    },
    {
      id: "proj_pharmacy",
      title: "Pharmacy Website",
      description: "A modern pharmacy website designed to present medicines, healthcare products, services, and customer support information.",
      image: "https://image.thum.io/get/width/800/crop/600/https://pharmacy-website-gilt.vercel.app/",
      fallbackImage: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80",
      category: "Healthcare / E-commerce",
      technology: ["HTML5", "CSS3", "JavaScript", "E-commerce UI", "WhatsApp API"],
      github: "https://github.com/ashiffrontend/pharmacy-website",
      demo: "https://pharmacy-website-gilt.vercel.app/",
      featured: true,
      likes: 34,
      views: 1310,
      features: ["Product Showcase", "Medicine Categories", "Prescription Upload UI", "WhatsApp Integration"],
      completionDate: "2026-02-20"
    },
    {
      id: "proj_car",
      title: "Car Showroom",
      description: "A luxury automobile dealership website featuring vehicle galleries, model specification filters, finance calculators, and instant inquiry booking.",
      image: "https://image.thum.io/get/width/800/crop/600/https://car-showroom-mauve.vercel.app/",
      fallbackImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
      category: "Business Website",
      technology: ["HTML5", "CSS3", "JavaScript", "Filter UI", "Vercel"],
      github: "https://github.com/ashiffrontend/car-showroom",
      demo: "https://car-showroom-mauve.vercel.app/",
      featured: true,
      likes: 45,
      views: 1950,
      features: ["Luxury Car Gallery", "Model Comparison Grid", "Custom Specs Selector", "Test Drive Booking"],
      completionDate: "2026-02-10"
    },
    {
      id: "proj_agriculture",
      title: "Green Farm Agriculture",
      description: "An agritech and organic farming platform promoting sustainable agriculture produce, farming machinery rentals, and farm-to-table supply connection.",
      image: "https://image.thum.io/get/width/800/crop/600/https://greenfarm-agriculture-website.vercel.app/",
      fallbackImage: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
      category: "Agriculture & Business",
      technology: ["HTML5", "CSS3", "JavaScript", "Agritech UI", "Vercel"],
      github: "https://github.com/ashiffrontend/greenfarm-agriculture-website",
      demo: "https://greenfarm-agriculture-website.vercel.app/",
      featured: true,
      likes: 27,
      views: 980,
      features: ["Organic Produce Catalog", "Machinery Rental Guide", "Agricultural Tips Blog", "Supplier Contact Form"],
      completionDate: "2026-01-25"
    },
    {
      id: "proj_travel",
      title: "Travel Agency",
      description: "A vibrant travel booking web app with destination search, day-by-day tour package itineraries, customer feedback, and custom trip enquiry.",
      image: "https://image.thum.io/get/width/800/crop/600/https://travel-agency-teal-five.vercel.app/",
      fallbackImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
      category: "Tourism & Travel",
      technology: ["HTML5", "CSS3", "JavaScript", "Travel UI", "Vercel"],
      github: "https://github.com/ashiffrontend/travel-agency",
      demo: "https://travel-agency-teal-five.vercel.app/",
      featured: true,
      likes: 39,
      views: 1640,
      features: ["Destination Search & Filter", "Tour Package Cards", "Interactive Itinerary", "Traveler Reviews"],
      completionDate: "2026-01-15"
    },
    {
      id: "proj_realestate",
      title: "Real Estate Website",
      description: "A comprehensive real estate listing portal with property price & location filters, virtual tour schedule, floor plans, and agent contact modules.",
      image: "https://image.thum.io/get/width/800/crop/600/https://real-estate-website-mocha-seven.vercel.app/",
      fallbackImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
      category: "Real Estate",
      technology: ["HTML5", "CSS3", "JavaScript", "Real Estate UI", "Vercel"],
      github: "https://github.com/ashiffrontend/real-estate-website",
      demo: "https://real-estate-website-mocha-seven.vercel.app/",
      featured: true,
      likes: 48,
      views: 2050,
      features: ["Property Search Filters", "Floor Plan Showcase", "Neighborhood Ratings", "Schedule Tour Form"],
      completionDate: "2025-12-28"
    },
    {
      id: "proj_fashion",
      title: "Fashion Store",
      description: "A modern fashion & clothing e-commerce storefront with collection filter grid, product modal preview, shopping cart UI, and flash deal banners.",
      image: "https://image.thum.io/get/width/800/crop/600/https://fashion-store-ochre-eight.vercel.app/",
      fallbackImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
      category: "E-Commerce",
      technology: ["HTML5", "CSS3", "JavaScript", "E-Commerce UI", "Vercel"],
      github: "https://github.com/ashiffrontend/fashion-store",
      demo: "https://fashion-store-ochre-eight.vercel.app/",
      featured: true,
      likes: 56,
      views: 2480,
      features: ["Trend Collection Grid", "Product Quick View Modal", "Cart State Management", "Deal Countdown Banner"],
      completionDate: "2025-12-10"
    }
  ],
  visitors: [],
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
  enquiries: [
    {
      enquiryId: "ENQ-92841",
      senderName: "Siddharth Verma",
      email: "siddharth@techstudio.io",
      phone: "+91 98112 34567",
      company: "Nexus Tech Studio",
      country: "India",
      budget: "School / Hospital (₹1,999 / $40)",
      timeline: "Standard (2-3 Days)",
      projectType: "Hospital Website",
      subject: "[ENQ-92841] Hospital Website Request - Siddharth Verma",
      message: "Looking for a custom patient portal and online doctor schedule booking website similar to your hospital demo.",
      attachmentName: "Requirements_Doc.pdf",
      contactMethod: "WhatsApp",
      status: "New",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
    }
  ],
  testimonials: [
    {
      id: "test_1",
      clientName: "David Miller",
      role: "CEO, Horizon Startups",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      rating: 5,
      comment: "Mohammad Ashif delivered our landing page in under 48 hours. Clean code, outstanding speed, and pixel-perfect design!",
      approved: true,
      featured: true,
      createdAt: "2026-03-01"
    },
    {
      id: "test_2",
      clientName: "Priya Sharma",
      role: "Director, Evergreen Academy",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
      rating: 5,
      comment: "The Evergreen Public School website transformed our online admission inquiries. Highly recommended senior engineer!",
      approved: true,
      featured: true,
      createdAt: "2026-02-18"
    }
  ],
  blogPosts: [
    {
      id: "post_1",
      title: "Building High-Performance Websites with Modern Web Technologies",
      slug: "building-high-performance-websites-2026",
      summary: "Key strategies for optimizing Lighthouse performance scores above 95 while maintaining rich aesthetic visuals.",
      content: "Performance is the foundation of digital user experience. In this post, we explore lazy loading, code splitting, image optimization with WebP, and clean CSS architecture...",
      category: "Web Development",
      tags: ["Performance", "JavaScript", "SEO"],
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      published: true,
      createdAt: "2026-02-15"
    }
  ],
  services: [
    {
      id: "srv_1",
      title: "Starter Website Package",
      price: "₹999 / $20",
      duration: "24-48 Hours",
      description: "High-converting single page or landing page with modern layout, responsive design, and contact form.",
      features: ["Single Page / Landing Page", "Fully Mobile Responsive", "Contact Form Integration", "Basic SEO Optimization", "Fast Loading Speed"]
    },
    {
      id: "srv_2",
      title: "Business Website Package",
      price: "₹1,499 / $30",
      duration: "2-3 Days",
      description: "Multi-page corporate website with services showcase, testimonials, gallery, and admin management.",
      features: ["3-5 Custom Pages", "Modern UI/UX Design", "Admin Control Panel", "WhatsApp & Call Integration", "SSL & Domain Setup Guide"]
    },
    {
      id: "srv_3",
      title: "School / Hospital Portal",
      price: "₹1,999 / $40",
      duration: "3-4 Days",
      description: "Feature-rich educational or healthcare portal with appointment booking, facilities, gallery, and dynamic content.",
      features: ["Custom Portal Architecture", "Appointment / Admission Forms", "Interactive Photo Gallery", "Staff & Department Manager", "Full Admin Dashboard"]
    },
    {
      id: "srv_4",
      title: "E-Commerce & Custom SaaS",
      price: "₹2,999+ / $50+",
      duration: "5-7 Days",
      description: "Full-stack online store or web application with user auth, product manager, shopping cart, and analytics.",
      features: ["Custom Full-Stack Code", "User Authentication & Roles", "Database Storage (MongoDB)", "Shopping Cart & Checkout UI", "Real Visitor Analytics"]
    }
  ],
  notifications: [
    {
      id: "notif_1",
      type: "New Enquiry",
      message: "New project enquiry received from Siddharth Verma for Hospital Website.",
      read: false,
      createdAt: new Date().toISOString()
    }
  ],
  clients: [
    { id: "cli_1", name: "Nexus Tech Studio", email: "siddharth@techstudio.io", totalSpent: "₹1,999", status: "Active" }
  ],
  invoices: [
    { id: "inv_101", client: "Nexus Tech Studio", amount: "₹1,999", date: "2026-03-20", status: "Paid" }
  ],
  otps: new Map()
};

// Nodemailer Transporter Setup
const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || ADMIN_EMAIL,
    pass: process.env.SMTP_PASS || ""
  }
});

// Helper Function: Send Notification Email
async function sendNotificationEmail(subject: string, htmlContent: string) {
  if (!process.env.SMTP_PASS) {
    console.log(`[Email System Mock] ${subject} -> To: ${ADMIN_EMAIL}`);
    return;
  }
  try {
    await mailTransporter.sendMail({
      from: `"Mohammad Ashif Portfolio" <${process.env.SMTP_USER || ADMIN_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject,
      html: htmlContent
    });
  } catch (err) {
    console.error("Error sending email notification:", err);
  }
}

// Authentication Middleware
function authenticateToken(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

// ==========================================
// AUTHENTICATION API ROUTES
// ==========================================

// Login
app.post("/api/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Invalid Email or Password" });
  }

  let user: any = null;

  if (isMongoConnected) {
    try {
      user = await (UserModel as any).findOne({ email: email.toLowerCase() });
    } catch (err) {
      console.error("MongoDB user lookup error:", err);
    }
  }

  if (!user) {
    user = memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid Email or Password" });
  }

  const passwordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!passwordValid) {
    return res.status(401).json({ success: false, message: "Invalid Email or Password" });
  }

  const userId = user._id ? user._id.toString() : (user.id || "usr_admin");
  const userName = user.name || "Mohammad Ashif";
  const userRole = user.role || "admin";

  const accessToken = jwt.sign(
    { id: userId, email: user.email, role: userRole, name: userName },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    success: true,
    message: "Login successful",
    accessToken,
    refreshToken,
    user: { id: userId, email: user.email, role: userRole, name: userName }
  });
});

// User Registration (Client / Visitor)
app.post("/api/auth/register", (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required" });
  }

  const existing = memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: "Email is already registered" });
  }

  const newUser = {
    id: "usr_" + Date.now(),
    name,
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    role: role === "admin" ? "client" : (role || "client"),
    createdAt: new Date().toISOString()
  };

  memoryDb.users.push(newUser);

  const accessToken = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: "1d" });

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    accessToken,
    user: { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }
  });
});

// Forgot Password OTP Trigger
app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  memoryDb.otps.set(email.toLowerCase(), { otp, expires: Date.now() + 600000 }); // 10 minutes

  await sendNotificationEmail(
    "Password Reset OTP - Mohammad Ashif Portfolio",
    `<p>Your OTP for resetting password is: <strong style="font-size: 1.25rem;">${otp}</strong>. Valid for 10 minutes.</p>`
  );

  res.json({ success: true, message: "OTP sent to your email address" });
});

// Verify OTP & Reset Password
app.post("/api/auth/reset-password", (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: "Email, OTP, and new password required" });
  }

  const stored = memoryDb.otps.get(email.toLowerCase());
  if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }

  const user = memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    user.passwordHash = bcrypt.hashSync(newPassword, 10);
  }

  memoryDb.otps.delete(email.toLowerCase());
  res.json({ success: true, message: "Password reset successful. Please sign in." });
});

// Current User Session
app.get("/api/auth/me", authenticateToken, (req: any, res: Response) => {
  res.json({ success: true, user: req.user });
});

// ==========================================
// PROJECTS API ROUTES
// ==========================================

app.get("/api/projects", (req: Request, res: Response) => {
  res.json({ success: true, count: memoryDb.projects.length, data: memoryDb.projects });
});

app.post("/api/projects", authenticateToken, (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  const newProj = {
    id: "proj_" + Date.now(),
    ...req.body,
    likes: 0,
    views: 0,
    completionDate: new Date().toISOString().split("T")[0]
  };

  memoryDb.projects.unshift(newProj);
  res.status(201).json({ success: true, message: "Project added successfully", data: newProj });
});

app.put("/api/projects/:id", authenticateToken, (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  const index = memoryDb.projects.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: "Project not found" });

  memoryDb.projects[index] = { ...memoryDb.projects[index], ...req.body };
  res.json({ success: true, message: "Project updated successfully", data: memoryDb.projects[index] });
});

app.delete("/api/projects/:id", authenticateToken, (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  memoryDb.projects = memoryDb.projects.filter(p => p.id !== req.params.id);
  res.json({ success: true, message: "Project deleted successfully" });
});

app.post("/api/projects/:id/like", (req: Request, res: Response) => {
  const proj = memoryDb.projects.find(p => p.id === req.params.id);
  if (proj) {
    proj.likes = (proj.likes || 0) + 1;
    memoryDb.analytics.projectLikes++;
    return res.json({ success: true, likes: proj.likes });
  }
  res.status(404).json({ success: false, message: "Project not found" });
});

app.post("/api/projects/:id/view", (req: Request, res: Response) => {
  const proj = memoryDb.projects.find(p => p.id === req.params.id);
  if (proj) {
    proj.views = (proj.views || 0) + 1;
    memoryDb.analytics.projectViews++;
    return res.json({ success: true, views: proj.views });
  }
  res.status(404).json({ success: false, message: "Project not found" });
});

// ==========================================
// ENQUIRY / HIRE ME API ROUTES
// ==========================================

app.post("/api/enquiry", async (req: Request, res: Response) => {
  const { senderName, email, phone, company, country, budget, timeline, projectType, message, attachmentName, contactMethod } = req.body;

  if (!senderName || !email || !message) {
    return res.status(400).json({ success: false, message: "Name, email, and message details are required." });
  }

  const enquiryId = "ENQ-" + Math.floor(10000 + Math.random() * 90000);
  const enquiryRecord = {
    enquiryId,
    senderName,
    email,
    phone: phone || "Not Provided",
    company: company || "N/A",
    country: country || "India",
    budget: budget || "Starter",
    timeline: timeline || "Standard",
    projectType: projectType || "Website Development",
    message,
    attachmentName: attachmentName || "None",
    contactMethod: contactMethod || "WhatsApp",
    status: "New",
    createdAt: new Date().toISOString()
  };

  memoryDb.enquiries.unshift(enquiryRecord);
  memoryDb.analytics.contactSubmits++;

  // Log admin notification
  memoryDb.notifications.unshift({
    id: "notif_" + Date.now(),
    type: "New Enquiry",
    message: `Enquiry #${enquiryId} from ${senderName} (${projectType} - ${budget})`,
    read: false,
    createdAt: new Date().toISOString()
  });

  // Trigger Email Notification to mohdashif.dev@gmail.com
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #2563eb; margin-bottom: 5px;">🚀 New Project Enquiry #${enquiryId}</h2>
      <p style="color: #64748b; font-size: 14px;">Received on Mohammad Ashif Portfolio</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
      
      <table style="width: 100%; font-size: 14px; text-align: left; line-height: 1.6;">
        <tr><td><strong>Client Name:</strong></td><td>${senderName}</td></tr>
        <tr><td><strong>Email:</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td><strong>Phone / WhatsApp:</strong></td><td>${phone}</td></tr>
        <tr><td><strong>Company:</strong></td><td>${company}</td></tr>
        <tr><td><strong>Country:</strong></td><td>${country}</td></tr>
        <tr><td><strong>Project Type:</strong></td><td>${projectType}</td></tr>
        <tr><td><strong>Budget Tier:</strong></td><td><strong>${budget}</strong></td></tr>
        <tr><td><strong>Timeline:</strong></td><td>${timeline}</td></tr>
        <tr><td><strong>Contact Preference:</strong></td><td>${contactMethod}</td></tr>
      </table>

      <div style="background: #f8fafc; padding: 12px; border-left: 4px solid #2563eb; margin-top: 15px; border-radius: 4px;">
        <strong>Project Details & Scope:</strong>
        <p style="margin-top: 5px; white-space: pre-line;">${message}</p>
      </div>

      <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">Attachment: ${attachmentName}</p>
    </div>
  `;

  await sendNotificationEmail(`[${enquiryId}] ${projectType} Request - ${senderName}`, emailHtml);

  res.status(201).json({
    success: true,
    message: "Enquiry submitted successfully!",
    enquiryId,
    data: enquiryRecord
  });
});

app.get("/api/enquiries", authenticateToken, (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });
  res.json({ success: true, count: memoryDb.enquiries.length, data: memoryDb.enquiries });
});

// ==========================================
// ANALYTICS & VISITOR TRACKING API
// ==========================================

const DB_FILE = path.join(process.cwd(), "db_analytics.json");

// Load persistent database if exists
if (fs.existsSync(DB_FILE)) {
  try {
    const saved = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    if (saved.analytics) memoryDb.analytics = { ...memoryDb.analytics, ...saved.analytics };
    if (Array.isArray(saved.visitors)) memoryDb.visitors = saved.visitors;
    if (Array.isArray(saved.enquiries)) memoryDb.enquiries = saved.enquiries;
  } catch (e) {
    console.warn("Could not load db_analytics.json:", e);
  }
}

function persistAnalytics() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify({
      analytics: memoryDb.analytics,
      visitors: memoryDb.visitors,
      enquiries: memoryDb.enquiries
    }, null, 2));
  } catch (e) {
    console.warn("Could not save db_analytics.json:", e);
  }
}

app.post("/api/analytics/track", (req: Request, res: Response) => {
  const { eventType, page, referrer, browser, os, device, country, sessionId, ip, screenSize, language } = req.body;

  // Increment specific tracking counters
  if (eventType === "pageView") {
    memoryDb.analytics.pageViews++;
  } else if (eventType === "resumeDownload") {
    memoryDb.analytics.resumeDownloads++;
  } else if (eventType === "githubClick") {
    memoryDb.analytics.githubClicks++;
  } else if (eventType === "linkedinClick") {
    memoryDb.analytics.linkedinClicks++;
  } else if (eventType === "liveDemoClick") {
    memoryDb.analytics.liveDemoClicks++;
  } else if (eventType === "hireMeClick") {
    memoryDb.analytics.hireMeClicks++;
  } else if (eventType === "contactClick") {
    memoryDb.analytics.contactClicks++;
  } else if (eventType === "emailClick") {
    memoryDb.analytics.emailClicks++;
  } else if (eventType === "callClick") {
    memoryDb.analytics.callClicks++;
  } else if (eventType === "whatsappClick") {
    memoryDb.analytics.whatsappClicks++;
  } else if (eventType === "detailsClick") {
    memoryDb.analytics.detailsClicks++;
  } else if (eventType === "servicesClick") {
    memoryDb.analytics.servicesClicks++;
  } else if (eventType === "blogClick") {
    memoryDb.analytics.blogClicks++;
  } else if (eventType === "certificatesClick") {
    memoryDb.analytics.certificatesClicks++;
  } else if (eventType === "testimonialsClick") {
    memoryDb.analytics.testimonialsClicks++;
  } else if (eventType === "projectGithubClick") {
    memoryDb.analytics.projectGithubClicks++;
  }

  const clientIp = ip || (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
  const sid = sessionId || clientIp;

  const visitorLog = {
    id: "v_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    sessionId: sid,
    eventType: eventType || "pageView",
    page: page || "/",
    referrer: referrer || "Direct",
    browser: browser || "Chrome",
    os: os || "Windows",
    device: device || "Desktop",
    country: country || "India",
    screenSize: screenSize || "Responsive",
    language: language || "en-US",
    ip: clientIp,
    timestamp: new Date().toISOString()
  };

  memoryDb.visitors.unshift(visitorLog);
  if (memoryDb.visitors.length > 2000) memoryDb.visitors.pop(); // Keep last 2000 logs

  persistAnalytics();
  res.json({ success: true, timestamp: visitorLog.timestamp });
});

app.get("/api/analytics/stats", (req: Request, res: Response) => {
  const logs = memoryDb.visitors || [];
  const now = new Date();
  const nowMs = now.getTime();

  // Helper date boundaries
  const todayStr = now.toISOString().split("T")[0];
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const oneWeekAgoMs = nowMs - 7 * 24 * 60 * 60 * 1000;
  const oneMonthAgoMs = nowMs - 30 * 24 * 60 * 60 * 1000;
  const oneYearAgoMs = nowMs - 365 * 24 * 60 * 60 * 1000;
  const onlineThresholdMs = nowMs - 3 * 60 * 1000; // active in last 3 minutes

  // Visitor Counts
  let todayCount = 0;
  let yesterdayCount = 0;
  let weeklyCount = 0;
  let monthlyCount = 0;
  let yearlyCount = 0;
  const uniqueSessions = new Set<string>();
  const sessionCounts: Record<string, number> = {};
  const onlineSessions = new Set<string>();

  const pageViewLogs = logs.filter(l => l.eventType === "pageView" || !l.eventType);

  pageViewLogs.forEach(log => {
    const logDate = new Date(log.timestamp);
    const logMs = logDate.getTime();
    const logDayStr = log.timestamp.split("T")[0];

    if (logDayStr === todayStr) todayCount++;
    if (logDayStr === yesterdayStr) yesterdayCount++;
    if (logMs >= oneWeekAgoMs) weeklyCount++;
    if (logMs >= oneMonthAgoMs) monthlyCount++;
    if (logMs >= oneYearAgoMs) yearlyCount++;

    if (log.sessionId) {
      uniqueSessions.add(log.sessionId);
      sessionCounts[log.sessionId] = (sessionCounts[log.sessionId] || 0) + 1;
    }

    if (logMs >= onlineThresholdMs) {
      onlineSessions.add(log.sessionId || log.id);
    }
  });

  // Calculate returning visitors
  let returningCount = 0;
  Object.values(sessionCounts).forEach(cnt => {
    if (cnt > 1) returningCount++;
  });

  // Calculate 7-day Weekly Trend
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyGraph: { day: string; date: string; count: number }[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split("T")[0];
    const dayName = daysOfWeek[d.getDay()];
    const countForDay = pageViewLogs.filter(l => l.timestamp.startsWith(dStr)).length;
    weeklyGraph.push({ day: dayName, date: dStr, count: countForDay });
  }

  // Distribution Aggregations
  const getDistribution = (key: keyof typeof logs[0]) => {
    const counts: Record<string, number> = {};
    const totalItems = pageViewLogs.length || 1;
    pageViewLogs.forEach(l => {
      const val = (l[key] as string) || "Unknown";
      counts[val] = (counts[val] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / totalItems) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Top Pages Aggregation
  const pageCounts: Record<string, number> = {};
  pageViewLogs.forEach(l => {
    const p = l.page || "/";
    pageCounts[p] = (pageCounts[p] || 0) + 1;
  });
  const pageNameMap: Record<string, string> = {
    "/": "Home Portfolio",
    "/#projects": "Projects Showcase",
    "/#skills": "Tech Stack & Skills",
    "/#services": "Services & Pricing",
    "/#contact": "Contact Form",
    "/admin": "Admin Dashboard",
    "/#certificates": "Certificates",
    "/#testimonials": "Testimonials"
  };
  const topPages = Object.entries(pageCounts)
    .map(([path, views]) => ({
      path,
      name: pageNameMap[path] || (path.startsWith("/#") ? path.replace("/#", "").toUpperCase() : path),
      views
    }))
    .sort((a, b) => b.views - a.views);

  // Most Viewed & Latest Viewed Project
  const sortedProjectsByViews = [...memoryDb.projects].sort((a, b) => (b.views || 0) - (a.views || 0));
  const mostViewed = sortedProjectsByViews[0] && sortedProjectsByViews[0].views > 0
    ? sortedProjectsByViews[0].title
    : "No data available";

  const latestViewed = memoryDb.visitors.find(v => v.page && v.page.includes("project"))
    ? memoryDb.visitors.find(v => v.page && v.page.includes("project"))?.page
    : "No data available";

  res.json({
    success: true,
    visitors: {
      today: todayCount,
      yesterday: yesterdayCount,
      weekly: weeklyCount,
      monthly: monthlyCount,
      yearly: yearlyCount,
      total: pageViewLogs.length,
      uniqueVisitors: uniqueSessions.size,
      onlineVisitors: onlineSessions.size,
      returningVisitors: returningCount,
      pageViews: memoryDb.analytics.pageViews,
      mostViewedProject: mostViewed,
      latestViewedProject: latestViewed,
      weeklyGraph,
      topPages,
      sources: getDistribution("referrer"),
      devices: getDistribution("device"),
      browsers: getDistribution("browser"),
      operatingSystems: getDistribution("os"),
      countries: getDistribution("country")
    },
    summary: memoryDb.analytics,
    recentVisitors: memoryDb.visitors.slice(0, 15),
    activeProjects: memoryDb.projects.length,
    enquiriesCount: memoryDb.enquiries.length
  });
});

// ==========================================
// TESTIMONIALS, BLOG & SERVICES API
// ==========================================

app.get("/api/testimonials", (req: Request, res: Response) => {
  res.json({ success: true, data: memoryDb.testimonials.filter(t => t.approved) });
});

app.get("/api/blog", (req: Request, res: Response) => {
  res.json({ success: true, data: memoryDb.blogPosts.filter(b => b.published) });
});

app.get("/api/services", (req: Request, res: Response) => {
  res.json({ success: true, data: memoryDb.services });
});

app.get("/api/notifications", authenticateToken, (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin required" });
  res.json({ success: true, data: memoryDb.notifications });
});

// ==========================================
// DEDICATED ADMIN ROUTE & SUBDOMAIN COMPATIBILITY
// Compatible with /admin and subdomains like admin.mohdashifportfolio.com
// ==========================================
app.get("/admin", (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), "admin.html"));
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const host = (req.headers.host || "").toLowerCase();
  const pathName = req.path;

  if ((host.startsWith("admin.") || pathName === "/admin" || pathName.startsWith("/admin/")) && !pathName.startsWith("/api/")) {
    return res.sendFile(path.join(process.cwd(), "admin.html"));
  }
  next();
});

// ==========================================
// SERVE CLIENT & VITE MIDDLEWARE SETUP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Mohammad Ashif Full Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
