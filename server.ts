import express, { Request, Response, NextFunction } from "express";
import path from "path";
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

// Environment Config & Secrets
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_ashif_portfolio_2026";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "super_secret_refresh_jwt_key_ashif_portfolio_2026";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "mohdashif.dev@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "secure_admin_password_2026";
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || ADMIN_EMAIL;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// ==========================================
// MONGOOSE SCHEMAS & MODELS
// ==========================================

// 1. User Model
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: "Mohammad Ashif" },
  role: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now }
});

// 2. Project Model
const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  fallbackImage: { type: String },
  category: { type: String, default: "Landing Page" },
  technology: [{ type: String }],
  github: { type: String },
  demo: { type: String },
  featured: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  features: [{ type: String }],
  completionDate: { type: String }
}, { timestamps: true });

// 3. Enquiry Model
const EnquirySchema = new mongoose.Schema({
  enquiryId: { type: String, required: true, unique: true },
  senderName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "Not Provided" },
  company: { type: String, default: "N/A" },
  country: { type: String, default: "India" },
  budget: { type: String, default: "Starter" },
  timeline: { type: String, default: "Standard" },
  projectType: { type: String, default: "Website Development" },
  subject: { type: String },
  message: { type: String, required: true },
  attachmentName: { type: String, default: "None" },
  contactMethod: { type: String, default: "WhatsApp" },
  status: { type: String, enum: ["New", "Read", "Archived"], default: "New" },
  createdAt: { type: Date, default: Date.now }
});

// 4. Visitor Log Model
const VisitorLogSchema = new mongoose.Schema({
  id: { type: String, required: true },
  sessionId: { type: String, required: true },
  eventType: { type: String, default: "pageView" },
  page: { type: String, default: "/" },
  referrer: { type: String, default: "Direct" },
  browser: { type: String, default: "Chrome" },
  os: { type: String, default: "Windows" },
  device: { type: String, default: "Desktop" },
  country: { type: String, default: "India" },
  city: { type: String, default: "New Delhi" },
  screenSize: { type: String, default: "Responsive" },
  language: { type: String, default: "en-US" },
  ip: { type: String, default: "127.0.0.1" },
  timestamp: { type: Date, default: Date.now }
});

// 5. Analytics Summary Model
const AnalyticsSummarySchema = new mongoose.Schema({
  key: { type: String, default: "global", unique: true },
  pageViews: { type: Number, default: 0 },
  resumeDownloads: { type: Number, default: 0 },
  githubClicks: { type: Number, default: 0 },
  linkedinClicks: { type: Number, default: 0 },
  liveDemoClicks: { type: Number, default: 0 },
  hireMeClicks: { type: Number, default: 0 },
  contactClicks: { type: Number, default: 0 },
  emailClicks: { type: Number, default: 0 },
  callClicks: { type: Number, default: 0 },
  whatsappClicks: { type: Number, default: 0 },
  projectViews: { type: Number, default: 0 },
  projectLikes: { type: Number, default: 0 },
  contactSubmits: { type: Number, default: 0 },
  detailsClicks: { type: Number, default: 0 },
  servicesClicks: { type: Number, default: 0 },
  blogClicks: { type: Number, default: 0 },
  certificatesClicks: { type: Number, default: 0 },
  testimonialsClicks: { type: Number, default: 0 },
  projectGithubClicks: { type: Number, default: 0 }
});

// 6. Blog Post Model
const BlogPostSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: "Web Development" },
  tags: [{ type: String }],
  image: { type: String },
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// 7. Skill Model
const SkillSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  percentage: { type: Number, required: true },
  category: { type: String, default: "Frontend" },
  icon: { type: String, default: "⚡" },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// 8. Certificate Model
const CertificateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  issueDate: { type: String },
  credentialUrl: { type: String },
  image: { type: String },
  category: { type: String, default: "Web Development" }
}, { timestamps: true });

// 9. Achievement Model
const AchievementSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String },
  icon: { type: String, default: "🏆" },
  metric: { type: String },
  category: { type: String, default: "Professional" }
}, { timestamps: true });

// 10. Testimonial Model
const TestimonialSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  clientName: { type: String, required: true },
  role: { type: String },
  company: { type: String },
  avatar: { type: String },
  rating: { type: Number, default: 5 },
  comment: { type: String, required: true },
  approved: { type: Boolean, default: true },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

// 11. Service Model
const ServiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  price: { type: String, required: true },
  duration: { type: String, default: "24-48 Hours" },
  description: { type: String, required: true },
  features: [{ type: String }],
  icon: { type: String, default: "🚀" },
  category: { type: String, default: "Web Development" }
}, { timestamps: true });

// 12. Notification Model
const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 13. Settings Model
const SettingsSchema = new mongoose.Schema({
  key: { type: String, default: "global", unique: true },
  siteName: { type: String, default: "Mohammad Ashif | Frontend Web Developer" },
  developerName: { type: String, default: "Mohammad Ashif" },
  developerTitle: { type: String, default: "Frontend Web Developer | BCA Student @ Aliah University ('27)" },
  bio: { type: String },
  email: { type: String },
  phone: { type: String },
  phoneNote: { type: String, default: "WhatsApp Msg Only" },
  whatsappDirect: { type: String },
  github: { type: String },
  linkedin: { type: String },
  whatsapp: { type: String },
  website: { type: String },
  location: { type: String },
  resumeUrl: { type: String },
  profileImage: { type: String },
  logoText: { type: String, default: "MA" },
  defaultTheme: { type: String, default: "light" }
}, { timestamps: true });

// Compile Models
const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
const ProjectModel = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
const EnquiryModel = mongoose.models.Enquiry || mongoose.model("Enquiry", EnquirySchema);
const VisitorLogModel = mongoose.models.VisitorLog || mongoose.model("VisitorLog", VisitorLogSchema);
const AnalyticsSummaryModel = mongoose.models.AnalyticsSummary || mongoose.model("AnalyticsSummary", AnalyticsSummarySchema);
const BlogPostModel = mongoose.models.BlogPost || mongoose.model("BlogPost", BlogPostSchema);
const SkillModel = mongoose.models.Skill || mongoose.model("Skill", SkillSchema);
const CertificateModel = mongoose.models.Certificate || mongoose.model("Certificate", CertificateSchema);
const AchievementModel = mongoose.models.Achievement || mongoose.model("Achievement", AchievementSchema);
const TestimonialModel = mongoose.models.Testimonial || mongoose.model("Testimonial", TestimonialSchema);
const ServiceModel = mongoose.models.Service || mongoose.model("Service", ServiceSchema);
const NotificationModel = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
const SettingsModel = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);

// Connection Status Flag
let isMongoConnected = false;

// ==========================================
// MONGODB INITIAL SEEDING ENGINE & ADMIN SYNC
// ==========================================
async function syncAdminAccount() {
  if (!isMongoConnected) {
    console.warn("⚠️ Skipping Admin sync: MongoDB is not connected.");
    return;
  }

  const cleanEmail = ADMIN_EMAIL.trim().toLowerCase();
  const cleanPassword = ADMIN_PASSWORD.trim();
  const newPasswordHash = bcrypt.hashSync(cleanPassword, 10);

  try {
    // Find existing admin to check password update state
    const existingAdmin = await (UserModel as any).findOne({
      $or: [{ role: "admin" }, { email: cleanEmail }]
    });

    let passwordUpdated = false;

    if (existingAdmin) {
      const isPassSame = bcrypt.compareSync(cleanPassword, existingAdmin.passwordHash);
      if (!isPassSame || existingAdmin.email !== cleanEmail) {
        passwordUpdated = true;
      }
    }

    // Atomic findOneAndUpdate with upsert so every deployment synchronizes ADMIN_EMAIL & ADMIN_PASSWORD
    const syncedAdmin = await (UserModel as any).findOneAndUpdate(
      { role: "admin" },
      {
        $set: {
          email: cleanEmail,
          passwordHash: newPasswordHash,
          name: "Mohammad Ashif",
          role: "admin"
        }
      },
      { new: true, upsert: true }
    );

    console.log("✅ Admin Synced");
    if (passwordUpdated || !existingAdmin) {
      console.log("🔑 Password Updated");
    }

    // Startup Verification Logging
    console.log("\n==========================================");
    console.log("=== ADMIN STARTUP VERIFICATION ===");
    console.log(`Admin Email: ${cleanEmail}`);
    console.log(`Mongo Connected: ${isMongoConnected}`);
    console.log(`User Exists: ${!!syncedAdmin}`);
    console.log(`Password Hash Exists: ${!!(syncedAdmin && syncedAdmin.passwordHash)}`);
    console.log("==========================================\n");

  } catch (err: any) {
    console.error("❌ Error syncing Admin Account in MongoDB:", err.message || err);
  }
}

async function seedMongoDBData() {
  try {
    // 1. Sync Admin User
    await syncAdminAccount();

    // 2. Analytics Summary Record
    const analyticsExists = await (AnalyticsSummaryModel as any).findOne({ key: "global" });
    if (!analyticsExists) {
      await AnalyticsSummaryModel.create({ key: "global" });
    }

    // 3. Initial Projects
    const projectsCount = await ProjectModel.countDocuments();
    if (projectsCount === 0) {
      const initialProjects = [
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
        }
      ];
      await (ProjectModel as any).insertMany(initialProjects);
      console.log("📦 Projects seeded in MongoDB Atlas");
    }

    // 4. Initial Skills
    const skillsCount = await SkillModel.countDocuments();
    if (skillsCount === 0) {
      const initialSkills = [
        { id: "s_1", name: "HTML5 & CSS3", percentage: 98, category: "Frontend", icon: "🎨", order: 1 },
        { id: "s_2", name: "JavaScript (ES6+)", percentage: 95, category: "Frontend", icon: "⚡", order: 2 },
        { id: "s_3", name: "Tailwind CSS", percentage: 92, category: "Frontend", icon: "🌊", order: 3 },
        { id: "s_4", name: "React.js & Next.js", percentage: 88, category: "Frontend", icon: "⚛️", order: 4 },
        { id: "s_5", name: "Node.js & Express", percentage: 85, category: "Backend", icon: "🟢", order: 5 },
        { id: "s_6", name: "MongoDB & Mongoose", percentage: 82, category: "Database", icon: "🍃", order: 6 },
        { id: "s_7", name: "TypeScript", percentage: 85, category: "Frontend", icon: "🔷", order: 7 },
        { id: "s_8", name: "Vercel & Git Deployment", percentage: 90, category: "DevOps", icon: "🚀", order: 8 }
      ];
      await (SkillModel as any).insertMany(initialSkills);
      console.log("⚡ Skills seeded in MongoDB Atlas");
    }

    // 5. Initial Services
    const servicesCount = await ServiceModel.countDocuments();
    if (servicesCount === 0) {
      const initialServices = [
        {
          id: "srv_1",
          title: "Starter Website Package",
          price: "₹999 / $20",
          duration: "24-48 Hours",
          description: "High-converting single page or landing page with modern layout, responsive design, and contact form.",
          features: ["Single Page / Landing Page", "Fully Mobile Responsive", "Contact Form Integration", "Basic SEO Optimization", "Fast Loading Speed"],
          icon: "🚀",
          category: "Landing Page"
        },
        {
          id: "srv_2",
          title: "Business Website Package",
          price: "₹1,499 / $30",
          duration: "2-3 Days",
          description: "Multi-page corporate website with services showcase, testimonials, gallery, and admin management.",
          features: ["3-5 Custom Pages", "Modern UI/UX Design", "Admin Control Panel", "WhatsApp & Call Integration", "SSL & Domain Setup Guide"],
          icon: "💼",
          category: "Business Website"
        },
        {
          id: "srv_3",
          title: "School / Hospital Portal",
          price: "₹1,999 / $40",
          duration: "3-4 Days",
          description: "Feature-rich educational or healthcare portal with appointment booking, facilities, gallery, and dynamic content.",
          features: ["Custom Portal Architecture", "Appointment / Admission Forms", "Interactive Photo Gallery", "Staff & Department Manager", "Full Admin Dashboard"],
          icon: "🏥",
          category: "Healthcare / Education"
        },
        {
          id: "srv_4",
          title: "E-Commerce & Custom SaaS",
          price: "₹2,999+ / $50+",
          duration: "5-7 Days",
          description: "Full-stack online store or web application with user auth, product manager, shopping cart, and analytics.",
          features: ["Custom Full-Stack Code", "User Authentication & Roles", "Database Storage (MongoDB)", "Shopping Cart & Checkout UI", "Real Visitor Analytics"],
          icon: "🛒",
          category: "Full Stack"
        }
      ];
      await (ServiceModel as any).insertMany(initialServices);
      console.log("💼 Services seeded in MongoDB Atlas");
    }

    // 6. Initial Blog Posts
    const blogCount = await BlogPostModel.countDocuments();
    if (blogCount === 0) {
      const initialBlogs = [
        {
          id: "post_1",
          title: "Building High-Performance Websites with Modern Web Technologies",
          slug: "building-high-performance-websites-2026",
          summary: "Key strategies for optimizing Lighthouse performance scores above 95 while maintaining rich aesthetic visuals.",
          content: "Performance is the foundation of digital user experience. In this post, we explore lazy loading, code splitting, image optimization with WebP, and clean CSS architecture to achieve instant load times.",
          category: "Web Development",
          tags: ["Performance", "JavaScript", "SEO"],
          image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
          published: true,
          createdAt: new Date()
        }
      ];
      await (BlogPostModel as any).insertMany(initialBlogs);
      console.log("📝 Blog posts seeded in MongoDB Atlas");
    }

    // 7. Initial Testimonials
    const testCount = await TestimonialModel.countDocuments();
    if (testCount === 0) {
      const initialTestimonials = [
        {
          id: "test_1",
          clientName: "David Miller",
          role: "CEO, Horizon Startups",
          company: "Horizon Ltd",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
          rating: 5,
          comment: "Mohammad Ashif delivered our landing page in under 48 hours. Clean code, outstanding speed, and pixel-perfect design!",
          approved: true,
          featured: true
        },
        {
          id: "test_2",
          clientName: "Priya Sharma",
          role: "Director, Evergreen Academy",
          company: "Evergreen Public School",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
          rating: 5,
          comment: "The Evergreen Public School website transformed our online admission inquiries. Highly recommended senior engineer!",
          approved: true,
          featured: true
        }
      ];
      await (TestimonialModel as any).insertMany(initialTestimonials);
      console.log("⭐ Testimonials seeded in MongoDB Atlas");
    }

  } catch (err) {
    console.error("Error during MongoDB initial seed:", err);
  }
}

// Connect to MongoDB
const rawMongoUri = (process.env.MONGODB_URI || process.env.MONGO_URI || "").trim().replace(/^["']|["']$/g, '').trim();

if (rawMongoUri) {
  console.log("⏳ Connecting to MongoDB Atlas...");
  mongoose.connect(rawMongoUri)
    .then(async () => {
      isMongoConnected = true;
      console.log("✅ MongoDB Connected");
      await seedMongoDBData();
    })
    .catch((err) => {
      isMongoConnected = false;
      console.error("❌ MongoDB Connection Error:", err.message || err);
      console.warn("⚠️ Operating in memory fallback mode until MongoDB is reconnected.");
    });
} else {
  console.warn("⚠️ MONGODB_URI environment variable not provided. Operating in memory fallback mode.");
}

// ==========================================
// MIDDLEWARE CONFIGURATION
// ==========================================
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Rate limiting for public API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
  validate: { xForwardedForHeader: false, forwardedHeader: false }
});
app.use("/api/", apiLimiter);

// Disable caching for all API responses so clients always receive fresh portfolio data
app.use("/api", (req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

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

// Helper Function: Send Email Notification
async function sendNotificationEmail(subject: string, htmlContent: string) {
  if (!process.env.SMTP_PASS) {
    console.log(`[Email Dispatch Log] ${subject} -> To: ${NOTIFICATION_EMAIL}`);
    return;
  }
  try {
    await mailTransporter.sendMail({
      from: `"Mohammad Ashif Portfolio" <${process.env.SMTP_USER || ADMIN_EMAIL}>`,
      to: NOTIFICATION_EMAIL,
      subject,
      html: htmlContent
    });
    console.log(`✉️ Email successfully dispatched to ${NOTIFICATION_EMAIL}`);
  } catch (err) {
    console.error("Error dispatching SMTP email:", err);
  }
}

// Helper Function: Add Admin Notification in MongoDB
async function createNotification(type: string, message: string, link: string = "") {
  try {
    const notif = {
      id: "notif_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      type,
      message,
      read: false,
      link,
      createdAt: new Date()
    };
    if (isMongoConnected) {
      await NotificationModel.create(notif);
    }
  } catch (err) {
    console.warn("Failed to save notification:", err);
  }
}

// JWT Authentication Middleware
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
// 1. AUTHENTICATION API ROUTES (JWT & Bcrypt & MongoDB)
// ==========================================

// Debug Admin Status Endpoint
app.get("/api/debug/admin", async (req: Request, res: Response) => {
  try {
    let adminUser: any = null;
    const cleanEmail = ADMIN_EMAIL.trim().toLowerCase();

    if (isMongoConnected) {
      adminUser = await (UserModel as any).findOne({
        $or: [{ role: "admin" }, { email: cleanEmail }]
      });
    }

    return res.json({
      mongoConnected: isMongoConnected,
      adminExists: !!adminUser,
      email: adminUser ? adminUser.email : cleanEmail,
      role: adminUser ? adminUser.role : "admin",
      hasPasswordHash: !!(adminUser && adminUser.passwordHash)
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Error fetching admin debug info"
    });
  }
});

// Login Route
app.post("/api/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.log("❌ Login Failed: Email or password missing in request body");
    return res.status(400).json({ success: false, message: "Invalid Email or Password" });
  }

  const cleanEmail = email.toString().trim().toLowerCase();
  const cleanPassword = password.toString().trim();

  try {
    let user: any = null;

    if (isMongoConnected) {
      user = await (UserModel as any).findOne({ email: cleanEmail });
      if (!user && cleanEmail === ADMIN_EMAIL.trim().toLowerCase()) {
        user = await (UserModel as any).findOne({ role: "admin" });
      }
    }

    // Memory Fallback if Mongo is disconnected or user record matches env directly
    if (!user && cleanEmail === ADMIN_EMAIL.trim().toLowerCase()) {
      const envPass = ADMIN_PASSWORD.trim();
      const isPassMatch = (cleanPassword === envPass) || 
                          (envPass.startsWith("$2a$") || envPass.startsWith("$2b$") ? bcrypt.compareSync(cleanPassword, envPass) : bcrypt.compareSync(cleanPassword, bcrypt.hashSync(envPass, 10)));

      if (isPassMatch) {
        console.log(`✅ Login Success (Memory Fallback): Admin "${cleanEmail}" authenticated`);
        const accessToken = jwt.sign(
          { id: "admin_env", email: cleanEmail, role: "admin", name: "Mohammad Ashif" },
          JWT_SECRET,
          { expiresIn: "1d" }
        );
        const refreshToken = jwt.sign(
          { id: "admin_env" },
          JWT_REFRESH_SECRET,
          { expiresIn: "7d" }
        );

        return res.json({
          success: true,
          message: "Authentication successful",
          accessToken,
          refreshToken,
          user: { id: "admin_env", email: cleanEmail, role: "admin", name: "Mohammad Ashif" }
        });
      }
    }

    if (!user) {
      console.log(`❌ Login Failed: User not found for email "${cleanEmail}". Reason of failure: User record does not exist in MongoDB`);
      return res.status(401).json({ success: false, message: "Invalid Email or Password" });
    }

    const passwordValid = bcrypt.compareSync(cleanPassword, user.passwordHash);
    if (!passwordValid) {
      console.log(`❌ Login Failed: Password mismatch for email "${cleanEmail}". Reason of failure: Invalid password provided`);
      return res.status(401).json({ success: false, message: "Invalid Email or Password" });
    }

    console.log(`✅ Login Success: Admin "${user.email}" authenticated successfully`);

    const userId = user._id ? user._id.toString() : user.id;
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

    // Record login notification
    await createNotification("Admin Login", `Admin ${userName} signed into the control panel.`, "/admin");

    return res.json({
      success: true,
      message: "Authentication successful",
      accessToken,
      refreshToken,
      user: { id: userId, email: user.email, role: userRole, name: userName }
    });
  } catch (err: any) {
    console.error("❌ Login Server Error:", err);
    return res.status(500).json({ success: false, message: "Server error during authentication" });
  }
});

// Current Authenticated Session Profile
app.get("/api/auth/me", authenticateToken, (req: any, res: Response) => {
  res.json({ success: true, user: req.user });
});

// Forgot Password OTP Trigger
app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await sendNotificationEmail(
      "Password Reset OTP - Mohammad Ashif Portfolio",
      `<div style="font-family: Arial; padding: 20px;">
        <h2>🔐 Security Verification Code</h2>
        <p>Your OTP code to reset password is: <strong style="font-size: 1.5rem; color: #2563eb;">${otp}</strong></p>
        <p style="color: #64748b;">This code is valid for 10 minutes.</p>
       </div>`
    );

    res.json({ success: true, message: "OTP sent to registered email address." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not process password reset." });
  }
});

// ==========================================
// 2. PROJECT MANAGEMENT API ROUTES (MongoDB)
// ==========================================

// Get All Projects
app.get("/api/projects", async (req: Request, res: Response) => {
  try {
    let projects: any[] = [];
    if (isMongoConnected) {
      projects = await (ProjectModel as any).find().sort({ createdAt: -1 });
    }
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error loading projects" });
  }
});

// Add Project (Admin)
app.post("/api/projects", authenticateToken, async (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  try {
    const newProj = {
      id: req.body.id || "proj_" + Date.now(),
      title: req.body.title,
      description: req.body.description,
      image: req.body.image,
      fallbackImage: req.body.fallbackImage || req.body.image,
      category: req.body.category || "Landing Page",
      technology: req.body.technology || [],
      github: req.body.github || "",
      demo: req.body.demo || "",
      featured: Boolean(req.body.featured),
      features: req.body.features || [],
      completionDate: req.body.completionDate || new Date().toISOString().split("T")[0]
    };

    let savedProj;
    if (isMongoConnected) {
      savedProj = await (ProjectModel as any).create(newProj);
    }

    await createNotification("New Project", `New project "${req.body.title}" added to showcase.`, "/#projects");

    res.status(201).json({ success: true, message: "Project created in MongoDB", data: savedProj || newProj });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to create project" });
  }
});

// Update Project (Admin)
app.put("/api/projects/:id", authenticateToken, async (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  try {
    let updated;
    if (isMongoConnected) {
      updated = await (ProjectModel as any).findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    }
    if (!updated) return res.status(404).json({ success: false, message: "Project not found" });

    res.json({ success: true, message: "Project updated in MongoDB", data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to update project" });
  }
});

// Delete Project (Admin)
app.delete("/api/projects/:id", authenticateToken, async (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  try {
    if (isMongoConnected) {
      await (ProjectModel as any).deleteOne({ id: req.params.id });
    }
    res.json({ success: true, message: "Project deleted from MongoDB" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete project" });
  }
});

// Like Project
app.post("/api/projects/:id/like", async (req: Request, res: Response) => {
  try {
    let proj: any = null;
    if (isMongoConnected) {
      proj = await (ProjectModel as any).findOneAndUpdate({ id: req.params.id }, { $inc: { likes: 1 } }, { new: true });
      await (AnalyticsSummaryModel as any).updateOne({ key: "global" }, { $inc: { projectLikes: 1 } }, { upsert: true });
    }
    if (proj) {
      return res.json({ success: true, likes: proj.likes });
    }
    res.status(404).json({ success: false, message: "Project not found" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error registering project like" });
  }
});

// View Project
app.post("/api/projects/:id/view", async (req: Request, res: Response) => {
  try {
    let proj: any = null;
    if (isMongoConnected) {
      proj = await (ProjectModel as any).findOneAndUpdate({ id: req.params.id }, { $inc: { views: 1 } }, { new: true });
      await (AnalyticsSummaryModel as any).updateOne({ key: "global" }, { $inc: { projectViews: 1 } }, { upsert: true });
    }
    if (proj) {
      return res.json({ success: true, views: proj.views });
    }
    res.status(404).json({ success: false, message: "Project not found" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error registering project view" });
  }
});

// ==========================================
// 3. CONTACT FORM & ENQUIRIES API (MongoDB + Email)
// ==========================================

// Submit Contact Enquiry
app.post("/api/enquiry", async (req: Request, res: Response) => {
  const { senderName, email, phone, company, country, budget, timeline, projectType, message, attachmentName, contactMethod } = req.body;

  if (!senderName || !email || !message) {
    return res.status(400).json({ success: false, message: "Name, email, and message details are required." });
  }

  try {
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
      createdAt: new Date()
    };

    if (isMongoConnected) {
      await (EnquiryModel as any).create(enquiryRecord);
      await (AnalyticsSummaryModel as any).updateOne({ key: "global" }, { $inc: { contactSubmits: 1 } }, { upsert: true });
    }

    // Auto Notification
    await createNotification("New Enquiry", `Enquiry #${enquiryId} from ${senderName} (${projectType} - ${budget})`, "/admin");

    // HTML Email Template
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
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to submit enquiry" });
  }
});

// Get All Enquiries (Admin)
app.get("/api/enquiries", authenticateToken, async (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  try {
    let enquiries: any[] = [];
    if (isMongoConnected) {
      enquiries = await (EnquiryModel as any).find().sort({ createdAt: -1 });
    }
    res.json({ success: true, count: enquiries.length, data: enquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching enquiries" });
  }
});

// Update Enquiry Status (Read / Unread / Archived)
app.put("/api/enquiries/:id/status", authenticateToken, async (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  try {
    const { status } = req.body;
    if (isMongoConnected) {
      await (EnquiryModel as any).updateOne({ $or: [{ enquiryId: req.params.id }, { _id: req.params.id }] }, { status });
    }
    res.json({ success: true, message: `Enquiry status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update enquiry status" });
  }
});

// Delete Enquiry
app.delete("/api/enquiries/:id", authenticateToken, async (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  try {
    if (isMongoConnected) {
      await (EnquiryModel as any).deleteOne({ $or: [{ enquiryId: req.params.id }, { _id: req.params.id }] });
    }
    res.json({ success: true, message: "Enquiry deleted from MongoDB" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete enquiry" });
  }
});

// ==========================================
// 4. BLOG CMS API ROUTES (MongoDB)
// ==========================================

// Get Blogs
app.get("/api/blogs", async (req: Request, res: Response) => {
  try {
    let posts: any[] = [];
    if (isMongoConnected) {
      posts = await (BlogPostModel as any).find().sort({ createdAt: -1 });
    }
    res.json({ success: true, count: posts.length, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching blogs" });
  }
});

// Create Blog Post (Admin)
app.post("/api/blogs", authenticateToken, async (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  try {
    const slug = req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const blogData = {
      id: "post_" + Date.now(),
      title: req.body.title,
      slug,
      summary: req.body.summary,
      content: req.body.content,
      category: req.body.category || "Web Development",
      tags: req.body.tags || [],
      image: req.body.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      published: req.body.published !== undefined ? Boolean(req.body.published) : true
    };

    let post;
    if (isMongoConnected) {
      post = await (BlogPostModel as any).create(blogData);
    }

    if (blogData.published) {
      await createNotification("Blog Published", `New blog post "${req.body.title}" is now live!`, "/#blog");
    }

    res.status(201).json({ success: true, message: "Blog post saved in MongoDB", data: post || blogData });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to create blog post" });
  }
});

// Update Blog Post (Admin)
app.put("/api/blogs/:id", authenticateToken, async (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  try {
    let updated;
    if (isMongoConnected) {
      updated = await (BlogPostModel as any).findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    }
    res.json({ success: true, message: "Blog updated in MongoDB", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update blog post" });
  }
});

// Delete Blog Post (Admin)
app.delete("/api/blogs/:id", authenticateToken, async (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  try {
    if (isMongoConnected) {
      await (BlogPostModel as any).deleteOne({ id: req.params.id });
    }
    res.json({ success: true, message: "Blog deleted from MongoDB" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete blog post" });
  }
});

// ==========================================
// 5. SKILLS API ROUTES (MongoDB)
// ==========================================

app.get("/api/skills", async (req: Request, res: Response) => {
  try {
    let skills: any[] = [];
    if (isMongoConnected) {
      skills = await (SkillModel as any).find().sort({ order: 1, createdAt: 1 });
    }
    res.json({ success: true, count: skills.length, data: skills });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching skills" });
  }
});

app.post("/api/skills", authenticateToken, async (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  try {
    const skillData = {
      id: req.body.id || "s_" + Date.now(),
      name: req.body.name,
      percentage: Number(req.body.percentage) || 90,
      category: req.body.category || "Frontend",
      icon: req.body.icon || "⚡",
      order: Number(req.body.order) || 0
    };

    let skill;
    if (isMongoConnected) {
      skill = await (SkillModel as any).create(skillData);
    }
    res.status(201).json({ success: true, message: "Skill created in MongoDB", data: skill || skillData });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to create skill" });
  }
});

app.put("/api/skills/:id", authenticateToken, async (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  try {
    let updated;
    if (isMongoConnected) {
      updated = await (SkillModel as any).findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    }
    res.json({ success: true, message: "Skill updated in MongoDB", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update skill" });
  }
});

app.delete("/api/skills/:id", authenticateToken, async (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  try {
    if (isMongoConnected) {
      await (SkillModel as any).deleteOne({ id: req.params.id });
    }
    res.json({ success: true, message: "Skill deleted from MongoDB" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete skill" });
  }
});

// ==========================================
// 6. CERTIFICATES, ACHIEVEMENTS, TESTIMONIALS, SERVICES API
// ==========================================

// Certificates
app.get("/api/certificates", async (req: Request, res: Response) => {
  try {
    let certs: any[] = [];
    if (isMongoConnected) {
      certs = await (CertificateModel as any).find().sort({ createdAt: -1 });
    }
    res.json({ success: true, count: certs.length, data: certs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching certificates" });
  }
});

app.post("/api/certificates", authenticateToken, async (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  try {
    const cert = {
      id: req.body.id || "cert_" + Date.now(),
      title: req.body.title,
      issuer: req.body.issuer,
      issueDate: req.body.issueDate || "2026",
      credentialUrl: req.body.credentialUrl || "",
      image: req.body.image || "",
      category: req.body.category || "Web Development"
    };
    if (isMongoConnected) {
      await (CertificateModel as any).create(cert);
    }
    res.status(201).json({ success: true, message: "Certificate saved in MongoDB", data: cert });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to save certificate" });
  }
});

app.delete("/api/certificates/:id", authenticateToken, async (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  try {
    if (isMongoConnected) {
      await (CertificateModel as any).deleteOne({ id: req.params.id });
    }
    res.json({ success: true, message: "Certificate deleted from MongoDB" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete certificate" });
  }
});

// Achievements
app.get("/api/achievements", async (req: Request, res: Response) => {
  try {
    let list: any[] = [];
    if (isMongoConnected) {
      list = await (AchievementModel as any).find().sort({ createdAt: -1 });
    }
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching achievements" });
  }
});

app.post("/api/achievements", authenticateToken, async (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  try {
    const item = {
      id: req.body.id || "ach_" + Date.now(),
      title: req.body.title,
      description: req.body.description,
      date: req.body.date || "2026",
      icon: req.body.icon || "🏆",
      metric: req.body.metric || "",
      category: req.body.category || "Professional"
    };
    if (isMongoConnected) {
      await (AchievementModel as any).create(item);
    }
    res.status(201).json({ success: true, message: "Achievement saved in MongoDB", data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to save achievement" });
  }
});

app.delete("/api/achievements/:id", authenticateToken, async (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  try {
    if (isMongoConnected) {
      await (AchievementModel as any).deleteOne({ id: req.params.id });
    }
    res.json({ success: true, message: "Achievement deleted from MongoDB" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete achievement" });
  }
});

// Testimonials
app.get("/api/testimonials", async (req: Request, res: Response) => {
  try {
    let list: any[] = [];
    if (isMongoConnected) {
      list = await (TestimonialModel as any).find({ approved: true }).sort({ createdAt: -1 });
    }
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching testimonials" });
  }
});

app.post("/api/testimonials", async (req: Request, res: Response) => {
  try {
    const item = {
      id: req.body.id || "test_" + Date.now(),
      clientName: req.body.clientName || req.body.name,
      role: req.body.role || "Client",
      company: req.body.company || "",
      avatar: req.body.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      rating: Number(req.body.rating) || 5,
      comment: req.body.comment,
      approved: true,
      featured: Boolean(req.body.featured)
    };
    if (isMongoConnected) {
      await (TestimonialModel as any).create(item);
    }
    res.status(201).json({ success: true, message: "Testimonial created in MongoDB", data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to create testimonial" });
  }
});

// Services
app.get("/api/services", async (req: Request, res: Response) => {
  try {
    let list: any[] = [];
    if (isMongoConnected) {
      list = await (ServiceModel as any).find().sort({ createdAt: 1 });
    }
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching services" });
  }
});

app.post("/api/services", authenticateToken, async (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  try {
    const item = {
      id: req.body.id || "srv_" + Date.now(),
      title: req.body.title,
      price: req.body.price,
      duration: req.body.duration || "24-48 Hours",
      description: req.body.description,
      features: req.body.features || [],
      icon: req.body.icon || "🚀",
      category: req.body.category || "Web Development"
    };
    if (isMongoConnected) {
      await (ServiceModel as any).create(item);
    }
    res.status(201).json({ success: true, message: "Service saved in MongoDB", data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to save service" });
  }
});

// Notifications
app.get("/api/notifications", authenticateToken, async (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  try {
    let notifications: any[] = [];
    if (isMongoConnected) {
      notifications = await (NotificationModel as any).find().sort({ createdAt: -1 }).limit(100);
    }
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching notifications" });
  }
});

app.put("/api/notifications/:id/read", authenticateToken, async (req: any, res: Response) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  try {
    if (isMongoConnected) {
      await (NotificationModel as any).updateOne({ id: req.params.id }, { read: true });
    }
    res.json({ success: true, message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update notification" });
  }
});

// ==========================================
// 7. REAL VISITOR TRACKING & TELEMETRY API
// ==========================================

app.post("/api/analytics/track", async (req: Request, res: Response) => {
  const { eventType, page, referrer, browser, os, device, country, city, sessionId, ip, screenSize, language } = req.body;

  const clientIp = ip || (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
  const sid = sessionId || clientIp;

  try {
    if (isMongoConnected) {
      // 1. Update global analytics summary counters
      const updateField: any = {};
      if (eventType === "pageView") updateField.pageViews = 1;
      else if (eventType === "resumeDownload") updateField.resumeDownloads = 1;
      else if (eventType === "githubClick") updateField.githubClicks = 1;
      else if (eventType === "linkedinClick") updateField.linkedinClicks = 1;
      else if (eventType === "liveDemoClick") updateField.liveDemoClicks = 1;
      else if (eventType === "hireMeClick") updateField.hireMeClicks = 1;
      else if (eventType === "contactClick") updateField.contactClicks = 1;
      else if (eventType === "emailClick") updateField.emailClicks = 1;
      else if (eventType === "callClick") updateField.callClicks = 1;
      else if (eventType === "whatsappClick") updateField.whatsappClicks = 1;

      if (Object.keys(updateField).length > 0) {
        await AnalyticsSummaryModel.updateOne({ key: "global" }, { $inc: updateField }, { upsert: true });
      }

      // 2. Insert visitor telemetry log
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
        city: city || "New Delhi",
        screenSize: screenSize || "Responsive",
        language: language || "en-US",
        ip: clientIp,
        timestamp: new Date()
      };

      await VisitorLogModel.create(visitorLog);
    }

    res.json({ success: true, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error recording visitor telemetry" });
  }
});

// Calculate and return real analytics from MongoDB
app.get("/api/analytics/stats", async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected) {
      return res.json({
        success: true,
        visitors: { total: 0, today: 0, weekly: 0, monthly: 0, yearly: 0, uniqueVisitors: 0, onlineVisitors: 0, returningVisitors: 0, pageViews: 0, weeklyGraph: [], topPages: [], sources: [], devices: [], browsers: [], operatingSystems: [], countries: [] },
        summary: {},
        activeProjects: 0,
        enquiriesCount: 0
      });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const onlineThreshold = new Date(now.getTime() - 3 * 60 * 1000); // 3 minutes active

    // Fetch visitor logs
    const logs = await (VisitorLogModel as any).find({ $or: [{ eventType: "pageView" }, { eventType: { $exists: false } }] }).sort({ timestamp: -1 });

    const todayCount = logs.filter(l => l.timestamp >= todayStart).length;
    const yesterdayCount = logs.filter(l => l.timestamp >= yesterdayStart && l.timestamp < todayStart).length;
    const weeklyCount = logs.filter(l => l.timestamp >= oneWeekAgo).length;
    const monthlyCount = logs.filter(l => l.timestamp >= oneMonthAgo).length;
    const yearlyCount = logs.filter(l => l.timestamp >= oneYearAgo).length;

    const uniqueSessions = new Set<string>();
    const sessionCounts: Record<string, number> = {};
    const onlineSessions = new Set<string>();

    logs.forEach(l => {
      if (l.sessionId) {
        uniqueSessions.add(l.sessionId);
        sessionCounts[l.sessionId] = (sessionCounts[l.sessionId] || 0) + 1;
      }
      if (l.timestamp >= onlineThreshold) {
        onlineSessions.add(l.sessionId);
      }
    });

    let returningCount = 0;
    Object.values(sessionCounts).forEach(cnt => {
      if (cnt > 1) returningCount++;
    });

    // Weekly Graph
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyGraph: { day: string; date: string; count: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split("T")[0];
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayName = daysOfWeek[d.getDay()];
      const countForDay = logs.filter(l => l.timestamp >= dayStart && l.timestamp < dayEnd).length;
      weeklyGraph.push({ day: dayName, date: dStr, count: countForDay });
    }

    // Distributions
    const getDistribution = (field: keyof typeof logs[0]) => {
      const counts: Record<string, number> = {};
      const totalItems = logs.length || 1;
      logs.forEach(l => {
        const val = (l[field] as string) || "Unknown";
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

    // Top Pages
    const pageCounts: Record<string, number> = {};
    logs.forEach(l => {
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

    const summaryRecord = await (AnalyticsSummaryModel as any).findOne({ key: "global" });
    const summary = summaryRecord ? summaryRecord.toObject() : {};

    const projectsCount = await ProjectModel.countDocuments();
    const enquiriesCount = await EnquiryModel.countDocuments();

    res.json({
      success: true,
      visitors: {
        today: todayCount,
        yesterday: yesterdayCount,
        weekly: weeklyCount,
        monthly: monthlyCount,
        yearly: yearlyCount,
        total: logs.length,
        uniqueVisitors: uniqueSessions.size,
        onlineVisitors: onlineSessions.size,
        returningVisitors: returningCount,
        pageViews: summary.pageViews || logs.length,
        weeklyGraph,
        topPages,
        sources: getDistribution("referrer"),
        devices: getDistribution("device"),
        browsers: getDistribution("browser"),
        operatingSystems: getDistribution("os"),
        countries: getDistribution("country")
      },
      summary,
      activeProjects: projectsCount,
      enquiriesCount
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Error generating analytics stats" });
  }
});

// Alias for /api/stats
app.get("/api/stats", async (req: Request, res: Response) => {
  const handler = app._router.stack.find((layer: any) => layer.route && layer.route.path === "/api/analytics/stats");
  if (handler) {
    return handler.route.stack[0].handle(req, res);
  }
  res.json({ success: true, message: "Stats endpoint active" });
});

// ==========================================
// 7.1 PORTFOLIO DATA & PROFILE SETTINGS API
// ==========================================
app.get("/api/portfolio", async (req: Request, res: Response) => {
  try {
    let projects: any[] = [];
    let skills: any[] = [];
    let certificates: any[] = [];
    let achievements: any[] = [];
    let testimonials: any[] = [];
    let services: any[] = [];
    let blogs: any[] = [];
    let adminUser: any = null;
    let savedSettings: any = null;

    if (isMongoConnected) {
      [projects, skills, certificates, achievements, testimonials, services, blogs, adminUser, savedSettings] = await Promise.all([
        ProjectModel.find().sort({ createdAt: -1 }),
        SkillModel.find().sort({ category: 1 }),
        CertificateModel.find().sort({ issueDate: -1 }),
        AchievementModel.find().sort({ year: -1 }),
        TestimonialModel.find().sort({ createdAt: -1 }),
        ServiceModel.find(),
        BlogPostModel.find().sort({ createdAt: -1 }),
        (UserModel as any).findOne({ role: "admin" }),
        (SettingsModel as any).findOne({ key: "global" })
      ]);
    }

    const cleanEmail = ADMIN_EMAIL.trim().toLowerCase();
    const settings = {
      siteName: savedSettings?.siteName || "Mohammad Ashif | Frontend Web Developer",
      developerName: savedSettings?.developerName || adminUser?.name || "Mohammad Ashif",
      developerTitle: savedSettings?.developerTitle || "Frontend Web Developer | BCA Student @ Aliah University ('27)",
      bio: savedSettings?.bio || "BCA Student at Aliah University (Graduating 2027) • Frontend Web Developer • 6 Months Internship Experience • 1 Year Web Development Experience • Built 10+ Real-World Projects • Available for Freelance & Remote Work",
      email: savedSettings?.email || adminUser?.email || cleanEmail,
      phone: savedSettings?.phone || "+91 6202782715",
      phoneNote: "WhatsApp Msg Only",
      whatsappDirect: "https://wa.me/916202782715?text=Hi%20Mohammad%20Ashif,%20I%20would%20like%20to%20discuss%20a%20project!",
      github: savedSettings?.github || "https://github.com/ashiffrontend",
      linkedin: savedSettings?.linkedin || "https://www.linkedin.com/in/mohd-ashif-095963425/",
      whatsapp: "https://whatsapp.com/channel/0029VbC6oUdHAdNeVu2Ijp2c",
      website: savedSettings?.website || "https://mohdashif.dev",
      location: savedSettings?.location || "Kolkata / New Delhi, India",
      resumeUrl: savedSettings?.resumeUrl || "assets/resume/Mohammad_Ashif_Resume.pdf",
      profileImage: savedSettings?.profileImage || adminUser?.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      logoText: "MA",
      defaultTheme: "light"
    };

    res.json({
      success: true,
      data: {
        settings,
        projects,
        skills,
        certificates,
        achievements,
        testimonials,
        services,
        blogs
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Error fetching portfolio data" });
  }
});

// Save or Update Admin Profile & Portfolio Settings
app.put("/api/profile", authenticateToken, async (req: any, res: Response) => {
  try {
    const {
      profileImage,
      developerName,
      developerTitle,
      bio,
      location,
      email,
      phone,
      resumeUrl,
      github,
      linkedin,
      website
    } = req.body;

    let savedSettings: any = null;
    if (isMongoConnected) {
      savedSettings = await (SettingsModel as any).findOneAndUpdate(
        { key: "global" },
        {
          $set: {
            profileImage,
            developerName,
            developerTitle,
            bio,
            location,
            email,
            phone,
            resumeUrl,
            github,
            linkedin,
            website
          }
        },
        { new: true, upsert: true }
      );

      if (req.user?.id) {
        await (UserModel as any).findByIdAndUpdate(req.user.id, {
          profileImage,
          name: developerName,
          email
        });
      }
    }

    const cleanEmail = (email || ADMIN_EMAIL).trim().toLowerCase();
    const updatedSettings = {
      siteName: "Mohammad Ashif | Frontend Web Developer",
      developerName: developerName || "Mohammad Ashif",
      developerTitle: developerTitle || "Frontend Web Developer | BCA Student @ Aliah University ('27)",
      bio: bio || "",
      email: cleanEmail,
      phone: phone || "+91 6202782715",
      phoneNote: "WhatsApp Msg Only",
      whatsappDirect: "https://wa.me/916202782715?text=Hi%20Mohammad%20Ashif,%20I%20would%20like%20to%20discuss%20a%20project!",
      github: github || "https://github.com/ashiffrontend",
      linkedin: linkedin || "https://www.linkedin.com/in/mohd-ashif-095963425/",
      whatsapp: "https://whatsapp.com/channel/0029VbC6oUdHAdNeVu2Ijp2c",
      website: website || "https://mohdashif.dev",
      location: location || "Kolkata / New Delhi, India",
      resumeUrl: resumeUrl || "assets/resume/Mohammad_Ashif_Resume.pdf",
      profileImage: profileImage || "",
      logoText: "MA",
      defaultTheme: "light"
    };

    res.json({
      success: true,
      message: "Profile and portfolio settings updated successfully",
      settings: updatedSettings
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to update profile settings" });
  }
});

app.put("/api/settings", authenticateToken, async (req: any, res: Response) => {
  const handler = app._router.stack.find((layer: any) => layer.route && layer.route.path === "/api/profile" && layer.route.methods.put);
  if (handler) {
    return handler.route.stack[0].handle(req, res);
  }
  res.json({ success: true, message: "Settings endpoint active" });
});

// API 404 catch-all: Return JSON 404 for unhandled /api/* routes so they NEVER fall through to index.html
app.all("/api/*", (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `API route ${req.method} ${req.path} not found` });
});

// ==========================================
// 8. DEDICATED ADMIN ROUTE & SUBDOMAIN HANDLING
// ==========================================
app.get("/admin", (req: Request, res: Response) => {
  if (process.env.NODE_ENV === "production") {
    return res.sendFile(path.join(process.cwd(), "dist", "admin.html"));
  }
  res.sendFile(path.join(process.cwd(), "admin.html"));
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const host = (req.headers.host || "").toLowerCase();
  const pathName = req.path;

  if ((host.startsWith("admin.") || pathName === "/admin" || pathName.startsWith("/admin/")) && !pathName.startsWith("/api/")) {
    if (process.env.NODE_ENV === "production") {
      return res.sendFile(path.join(process.cwd(), "dist", "admin.html"));
    }
    return res.sendFile(path.join(process.cwd(), "admin.html"));
  }
  next();
});

// ==========================================
// 9. CLIENT & VITE MIDDLEWARE SETUP
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
    console.log(`🚀 Mohammad Ashif Portfolio Backend running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
