import React, { useEffect, useState } from "react";
import FixoraLogo from "../components/FixoraLogo";
import "./Landing.css";

function Landing({ onLogin, onSignup }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeNav, setActiveNav] = useState("home");
    const [stats, setStats] = useState({
        complaints: "500+",
        resolved: "450+",
        students: "1,000+",
        rate: "90%+"
    });

    // Handle scroll for sticky navbar styling
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 30) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }

            // Simple section spy
            const sections = ["home", "services", "how-it-works", "features", "stats", "feedback", "about", "contact"];
            for (const sectionId of sections) {
                const el = document.getElementById(sectionId);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 160 && rect.bottom >= 160) {
                        setActiveNav(sectionId);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id) => {
        setMobileMenuOpen(false);
        setActiveNav(id);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className="fixora-landing">
            {/* =========================================================
                NAVBAR
            ========================================================= */}
            <header className={`fixora-navbar ${scrolled ? "fixora-navbar-scrolled" : ""}`}>
                <div className="fixora-nav-container">
                    {/* BRAND LOGO */}
                    <div
                        className="fixora-nav-brand"
                        onClick={() => scrollToSection("home")}
                        role="button"
                        tabIndex={0}
                        aria-label="Fixora Home"
                    >
                        <FixoraLogo size={36} showText={true} />
                    </div>

                    {/* DESKTOP NAV LINKS */}
                    <nav className="fixora-nav-links" aria-label="Main Navigation">
                        <button
                            type="button"
                            className={`fixora-nav-link ${activeNav === "home" ? "active" : ""}`}
                            onClick={() => scrollToSection("home")}
                        >
                            Home
                        </button>
                        <button
                            type="button"
                            className={`fixora-nav-link ${activeNav === "services" ? "active" : ""}`}
                            onClick={() => scrollToSection("services")}
                        >
                            Services
                        </button>
                        <button
                            type="button"
                            className={`fixora-nav-link ${activeNav === "how-it-works" ? "active" : ""}`}
                            onClick={() => scrollToSection("how-it-works")}
                        >
                            How It Works
                        </button>
                        <button
                            type="button"
                            className={`fixora-nav-link ${activeNav === "features" ? "active" : ""}`}
                            onClick={() => scrollToSection("features")}
                        >
                            Features
                        </button>
                        <button
                            type="button"
                            className={`fixora-nav-link ${activeNav === "about" ? "active" : ""}`}
                            onClick={() => scrollToSection("about")}
                        >
                            About
                        </button>
                        <button
                            type="button"
                            className={`fixora-nav-link ${activeNav === "contact" ? "active" : ""}`}
                            onClick={() => scrollToSection("contact")}
                        >
                            Contact
                        </button>
                    </nav>

                    {/* RIGHT AUTH BUTTONS */}
                    <div className="fixora-nav-actions">
                        <button
                            type="button"
                            className="fixora-btn-ghost"
                            onClick={onLogin}
                            aria-label="Login to Fixora"
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            className="fixora-btn-gold"
                            onClick={onSignup}
                            aria-label="Get Started with Fixora"
                        >
                            Get Started
                        </button>
                    </div>

                    {/* MOBILE HAMBURGER BUTTON */}
                    <button
                        type="button"
                        className="fixora-hamburger-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileMenuOpen}
                    >
                        <span className={`hamburger-bar ${mobileMenuOpen ? "open" : ""}`}></span>
                        <span className={`hamburger-bar ${mobileMenuOpen ? "open" : ""}`}></span>
                        <span className={`hamburger-bar ${mobileMenuOpen ? "open" : ""}`}></span>
                    </button>
                </div>

                {/* MOBILE NAV DRAWER */}
                {mobileMenuOpen && (
                    <div className="fixora-mobile-menu">
                        <button
                            type="button"
                            className="mobile-nav-link"
                            onClick={() => scrollToSection("home")}
                        >
                            Home
                        </button>
                        <button
                            type="button"
                            className="mobile-nav-link"
                            onClick={() => scrollToSection("services")}
                        >
                            Services
                        </button>
                        <button
                            type="button"
                            className="mobile-nav-link"
                            onClick={() => scrollToSection("how-it-works")}
                        >
                            How It Works
                        </button>
                        <button
                            type="button"
                            className="mobile-nav-link"
                            onClick={() => scrollToSection("features")}
                        >
                            Features
                        </button>
                        <button
                            type="button"
                            className="mobile-nav-link"
                            onClick={() => scrollToSection("about")}
                        >
                            About
                        </button>
                        <button
                            type="button"
                            className="mobile-nav-link"
                            onClick={() => scrollToSection("contact")}
                        >
                            Contact
                        </button>

                        <div className="mobile-menu-divider"></div>

                        <div className="mobile-menu-actions">
                            <button
                                type="button"
                                className="fixora-btn-ghost w-full"
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    onLogin();
                                }}
                            >
                                Login
                            </button>
                            <button
                                type="button"
                                className="fixora-btn-gold w-full"
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    onSignup();
                                }}
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* =========================================================
                HERO SECTION
            ========================================================= */}
            <section id="home" className="fixora-hero-section">
                <div className="hero-glow-sphere"></div>
                <div className="hero-container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="badge-spark">✦</span>
                            <span>Institutional Resolution Platform</span>
                        </div>

                        <h1 className="hero-heading">
                            <span className="gold-text">Fix</span> Your Problems.<br />
                            <span className="gold-gradient-text">Build a Better Campus.</span>
                        </h1>

                        <p className="hero-description">
                            Fixora makes it simple for students to report campus issues, track their complaints,
                            and stay informed until every problem is resolved.
                        </p>

                        <div className="hero-actions">
                            <button
                                type="button"
                                className="fixora-btn-primary-hero"
                                onClick={onSignup}
                            >
                                <span>Report an Issue</span>
                                <span className="btn-arrow">→</span>
                            </button>
                            <button
                                type="button"
                                className="fixora-btn-secondary-hero"
                                onClick={() => scrollToSection("services")}
                            >
                                Explore Services
                            </button>
                        </div>

                        <div className="hero-trust-bar">
                            <div className="trust-item">
                                <span className="trust-icon">⚡</span>
                                <span>Instant Dispatch</span>
                            </div>
                            <div className="trust-divider"></div>
                            <div className="trust-item">
                                <span className="trust-icon">📷</span>
                                <span>Photo &amp; Camera Proof</span>
                            </div>
                            <div className="trust-divider"></div>
                            <div className="trust-item">
                                <span className="trust-icon">⭐</span>
                                <span>Verified Feedback</span>
                            </div>
                        </div>
                    </div>

                    {/* HERO RIGHT: DASHBOARD PREVIEW ILLUSTRATION */}
                    <div className="hero-preview-wrapper">
                        <div className="hero-preview-glow"></div>
                        <div className="hero-preview-card">
                            {/* Card Header */}
                            <div className="preview-card-header">
                                <div className="preview-card-dots">
                                    <span className="dot dot-red"></span>
                                    <span className="dot dot-yellow"></span>
                                    <span className="dot dot-green"></span>
                                </div>
                                <div className="preview-card-title">
                                    <FixoraLogo size={18} showText={true} />
                                    <span className="live-pill">● LIVE TRACKING</span>
                                </div>
                            </div>

                            {/* Complaint Live Item */}
                            <div className="preview-complaint-box">
                                <div className="complaint-box-top">
                                    <span className="complaint-id-tag">Complaint #1042</span>
                                    <span className="status-badge-progress">
                                        <span className="status-ping"></span>
                                        IN PROGRESS
                                    </span>
                                </div>

                                <h3 className="complaint-preview-title">
                                    Projector HDMI Flickering &amp; Audio Loss
                                </h3>

                                <div className="complaint-meta-row">
                                    <span>📍 Academic Block B, Room 302</span>
                                    <span>💡 Electrical &amp; Media</span>
                                </div>

                                {/* Proof Thumbnail */}
                                <div className="complaint-proof-preview">
                                    <div className="proof-thumbnail">
                                        <div className="proof-icon-overlay">📷 Camera Verified Proof</div>
                                    </div>
                                    <div className="proof-info">
                                        <span className="proof-filename">proof-retake-02.jpg</span>
                                        <span className="proof-tag">Verified by Student</span>
                                    </div>
                                </div>

                                {/* Timeline Progress */}
                                <div className="preview-timeline">
                                    <div className="timeline-step completed">
                                        <span className="step-check">✓</span>
                                        <span className="step-label">Submitted</span>
                                    </div>
                                    <div className="timeline-connector completed"></div>
                                    <div className="timeline-step completed">
                                        <span className="step-check">✓</span>
                                        <span className="step-label">Assigned</span>
                                    </div>
                                    <div className="timeline-connector active"></div>
                                    <div className="timeline-step active">
                                        <span className="step-num">3</span>
                                        <span className="step-label">In Progress</span>
                                    </div>
                                    <div className="timeline-connector"></div>
                                    <div className="timeline-step">
                                        <span className="step-num">4</span>
                                        <span className="step-label">Resolved</span>
                                    </div>
                                </div>

                                {/* Assigned Specialist */}
                                <div className="assigned-specialist-box">
                                    <div className="specialist-avatar">👨‍🔧</div>
                                    <div className="specialist-details">
                                        <strong>Alex Turner</strong>
                                        <span>Senior Electrical Technician</span>
                                    </div>
                                    <div className="specialist-rating">
                                        ★ 4.9
                                    </div>
                                </div>
                            </div>

                            {/* Floating Satisfaction Badge */}
                            <div className="hero-floating-badge">
                                <span className="star-icon">⭐</span>
                                <div>
                                    <strong>98.4% Resolution Rate</strong>
                                    <span>Verified by Student Feedback</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                SERVICES SECTION
            ========================================================= */}
            <section id="services" className="fixora-section fixora-services-section">
                <div className="section-container">
                    <div className="section-header text-center">
                        <span className="section-eyebrow">OUR DOMAINS</span>
                        <h2 className="section-title">
                            Everything You Need to <span className="gold-text">Get Things Fixed</span>
                        </h2>
                        <p className="section-subtitle">
                            Comprehensive infrastructure and maintenance services covering every aspect of campus facilities.
                        </p>
                    </div>

                    <div className="services-grid">
                        <div className="service-card">
                            <div className="service-icon-box">🔧</div>
                            <h3 className="service-title">Maintenance</h3>
                            <p className="service-desc">
                                Doors, windows, locks, furniture hardware, and structural carpentry fixes across campus buildings.
                            </p>
                            <span className="service-accent">Rapid Dispatch</span>
                        </div>

                        <div className="service-card">
                            <div className="service-icon-box">💡</div>
                            <h3 className="service-title">Electrical</h3>
                            <p className="service-desc">
                                Class lighting, power outlets, lab apparatus, projector display lines, and safety breakers.
                            </p>
                            <span className="service-accent">Specialist Handled</span>
                        </div>

                        <div className="service-card">
                            <div className="service-icon-box">🚰</div>
                            <h3 className="service-title">Plumbing</h3>
                            <p className="service-desc">
                                Water dispensers, restroom pipelines, washbasin leaks, drainage clearing, and water coolers.
                            </p>
                            <span className="service-accent">High Priority</span>
                        </div>

                        <div className="service-card">
                            <div className="service-icon-box">🌐</div>
                            <h3 className="service-title">Network</h3>
                            <p className="service-desc">
                                Campus Wi-Fi deadzones, LAN ports, router issues, library network access, and portal connectivity.
                            </p>
                            <span className="service-accent">IT Team</span>
                        </div>

                        <div className="service-card">
                            <div className="service-icon-box">🪑</div>
                            <h3 className="service-title">Infrastructure</h3>
                            <p className="service-desc">
                                Lecture theater desks, auditorium seats, whiteboards, air conditioning, and ventilation fans.
                            </p>
                            <span className="service-accent">Campus Care</span>
                        </div>

                        <div className="service-card">
                            <div className="service-icon-box">🛠️</div>
                            <h3 className="service-title">General Issues</h3>
                            <p className="service-desc">
                                Pathway hazards, cleanliness reports, classroom equipment assistance, and grounds safety.
                            </p>
                            <span className="service-accent">Direct Support</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                HOW FIXORA WORKS
            ========================================================= */}
            <section id="how-it-works" className="fixora-section fixora-how-section">
                <div className="section-container">
                    <div className="section-header text-center">
                        <span className="section-eyebrow">SEAMLESS WORKFLOW</span>
                        <h2 className="section-title">
                            How <span className="gold-text">Fixora</span> Works
                        </h2>
                        <p className="section-subtitle">
                            From instant complaint reporting to verified technician resolution in 4 transparent steps.
                        </p>
                    </div>

                    <div className="how-steps-grid">
                        <div className="how-step-card">
                            <div className="step-number-tag">01</div>
                            <div className="step-icon">📢</div>
                            <h3 className="step-title">Report</h3>
                            <p className="step-desc">
                                Submit your complaint with details, location, and proof using your device camera or file upload.
                            </p>
                        </div>

                        <div className="how-step-card">
                            <div className="step-number-tag">02</div>
                            <div className="step-icon">🔄</div>
                            <h3 className="step-title">Track</h3>
                            <p className="step-desc">
                                Track the status of your complaint in real time with live status pills and transparent assignment.
                            </p>
                        </div>

                        <div className="how-step-card">
                            <div className="step-number-tag">03</div>
                            <div className="step-icon">🛠️</div>
                            <h3 className="step-title">Resolve</h3>
                            <p className="step-desc">
                                The responsible team works on the issue. Specialized technicians are dispatched with automated matching.
                            </p>
                        </div>

                        <div className="how-step-card">
                            <div className="step-number-tag">04</div>
                            <div className="step-icon">⭐</div>
                            <h3 className="step-title">Feedback</h3>
                            <p className="step-desc">
                                Confirm whether the issue was properly resolved. Rate with 5 stars or request a reopen if needed.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                FEATURES SECTION
            ========================================================= */}
            <section id="features" className="fixora-section fixora-features-section">
                <div className="section-container">
                    <div className="section-header text-center">
                        <span className="section-eyebrow">POWERFUL CAPABILITIES</span>
                        <h2 className="section-title">
                            Engineered for <span className="gold-text">Speed, Clarity &amp; Trust</span>
                        </h2>
                        <p className="section-subtitle">
                            Every tool required to maintain world-class campus facilities in a single unified system.
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">📸</div>
                            <h3 className="feature-title">Upload Proof</h3>
                            <p className="feature-desc">
                                Upload image files (JPG, PNG, WEBP) or capture live photos in real-time using our integrated camera tool.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🔄</div>
                            <h3 className="feature-title">Real-Time Tracking</h3>
                            <p className="feature-desc">
                                Track complaint progress seamlessly through Pending, In Progress, Resolved, and Reopened stages.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🔔</div>
                            <h3 className="feature-title">Notifications</h3>
                            <p className="feature-desc">
                                Stay updated with instant in-app notification bell alerts whenever status changes or actions occur.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">⭐</div>
                            <h3 className="feature-title">Student Feedback</h3>
                            <p className="feature-desc">
                                Rate resolutions from 1 to 5 stars, confirm if the issue was fixed, and reopen complaints if problems persist.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">📧</div>
                            <h3 className="feature-title">Admin Notifications</h3>
                            <p className="feature-desc">
                                Administrators receive immediate automated email notifications for submitted complaints and student feedback.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🔐</div>
                            <h3 className="feature-title">Secure Account</h3>
                            <p className="feature-desc">
                                Enterprise-grade JWT authentication, role segregation, password view toggle, and token-based reset recovery.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                STATISTICS SECTION
            ========================================================= */}
            <section id="stats" className="fixora-section fixora-stats-section">
                <div className="section-container">
                    <div className="stats-glass-card">
                        <div className="stat-box">
                            <div className="stat-number">{stats.complaints}</div>
                            <div className="stat-label">Complaints Submitted</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-box">
                            <div className="stat-number">{stats.resolved}</div>
                            <div className="stat-label">Issues Resolved</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-box">
                            <div className="stat-number">{stats.students}</div>
                            <div className="stat-label">Active Students</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-box">
                            <div className="stat-number">{stats.rate}</div>
                            <div className="stat-label">Resolution Rate</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                STUDENT FEEDBACK SECTION
            ========================================================= */}
            <section id="feedback" className="fixora-section fixora-feedback-section">
                <div className="section-container">
                    <div className="section-header text-center">
                        <span className="section-eyebrow">VERIFIED EXPERIENCES</span>
                        <h2 className="section-title">
                            Your Feedback Makes <span className="gold-text">Fixora Better</span>
                        </h2>
                        <p className="section-subtitle">
                            See how transparent feedback loops hold campus teams accountable and drive fast repairs.
                        </p>
                    </div>

                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <div className="testimonial-stars">★★★★★</div>
                            <p className="testimonial-quote">
                                "The lecture hall projector had HDMI audio issues for weeks. I submitted a photo on Fixora and a technician was on-site in 2 hours. Super smooth!"
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">P</div>
                                <div>
                                    <strong>Priya Sharma</strong>
                                    <span>Computer Science • B.Tech</span>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card">
                            <div className="testimonial-stars">★★★★★</div>
                            <p className="testimonial-quote">
                                "Being able to upload photos directly from my phone made describing the hostel plumbing leak effortless. The status was updated step-by-step."
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">R</div>
                                <div>
                                    <strong>Rahul Varma</strong>
                                    <span>Mechanical Engineering</span>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card">
                            <div className="testimonial-stars">★★★★★</div>
                            <p className="testimonial-quote">
                                "I love that students have the power to confirm if the work was completed properly and reopen it if it wasn't. Fixora genuinely values student voice."
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">A</div>
                                <div>
                                    <strong>Ananya Patel</strong>
                                    <span>Electronics &amp; Communication</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                ABOUT SECTION
            ========================================================= */}
            <section id="about" className="fixora-section fixora-about-section">
                <div className="section-container">
                    <div className="about-card">
                        <div className="about-content">
                            <span className="section-eyebrow">ABOUT FIXORA</span>
                            <h2 className="about-title">
                                Built for <span className="gold-text">Modern Campus Infrastructure</span>
                            </h2>
                            <p className="about-desc">
                                Fixora was created to eliminate the friction between university students and facilities management.
                                Gone are the days of lost paper slips, forgotten emails, and unaccountable maintenance delays.
                            </p>
                            <p className="about-desc">
                                With verified proof uploads, automated technician dispatching, real-time status timelines, and mandatory
                                student resolution feedback, Fixora empowers campuses with accountability, speed, and transparency.
                            </p>

                            <div className="about-highlights">
                                <div className="highlight-item">
                                    <span className="highlight-icon">✓</span>
                                    <span>100% Digital Workflow</span>
                                </div>
                                <div className="highlight-item">
                                    <span className="highlight-icon">✓</span>
                                    <span>Student-First Governance</span>
                                </div>
                                <div className="highlight-item">
                                    <span className="highlight-icon">✓</span>
                                    <span>Automated Administrator Oversight</span>
                                </div>
                            </div>
                        </div>

                        <div className="about-brand-box">
                            <FixoraLogo size={64} showText={true} />
                            <p className="about-brand-tagline">
                                Fix Today. Better Tomorrow.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                CALL TO ACTION (CTA)
            ========================================================= */}
            <section className="fixora-cta-section">
                <div className="cta-container">
                    <div className="cta-box">
                        <div className="cta-glow"></div>
                        <h2 className="cta-heading">
                            Have an issue? <span className="gold-text">Let's fix it.</span>
                        </h2>
                        <p className="cta-subtitle">
                            Report campus problems, track progress, and make your surroundings better with Fixora.
                        </p>
                        <div className="cta-buttons">
                            <button
                                type="button"
                                className="fixora-btn-primary-cta"
                                onClick={onSignup}
                            >
                                Report an Issue
                            </button>
                            <button
                                type="button"
                                className="fixora-btn-secondary-cta"
                                onClick={onLogin}
                            >
                                Sign In to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                CONTACT SECTION
            ========================================================= */}
            <section id="contact" className="fixora-section fixora-contact-section">
                <div className="section-container">
                    <div className="section-header text-center">
                        <span className="section-eyebrow">GET IN TOUCH</span>
                        <h2 className="section-title">
                            Contact the <span className="gold-text">Fixora Team</span>
                        </h2>
                        <p className="section-subtitle">
                            Need institutional assistance or have system inquiries? We are here to support your campus.
                        </p>
                    </div>

                    <div className="contact-cards-grid">
                        <div className="contact-card">
                            <div className="contact-icon">📧</div>
                            <h3>Institutional Support</h3>
                            <p>campusfixproblem@gmail.com</p>
                            <span>24/7 Monitored Dispatch</span>
                        </div>
                        <div className="contact-card">
                            <div className="contact-icon">🏢</div>
                            <h3>Campus Facilities Office</h3>
                            <p>Main Administrative Block, Room 102</p>
                            <span>Mon - Sat: 8:00 AM - 6:00 PM</span>
                        </div>
                        <div className="contact-card">
                            <div className="contact-icon">⚡</div>
                            <h3>Emergency Hotline</h3>
                            <p>Ext. 4040 / Maintenance Wing</p>
                            <span>Urgent Campus Safety Alerts</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
                FOOTER
            ========================================================= */}
            <footer className="fixora-footer">
                <div className="footer-container">
                    <div className="footer-top">
                        <div className="footer-brand-col">
                            <FixoraLogo size={36} showText={true} />
                            <p className="footer-tagline">
                                Fix Today. Better Tomorrow.
                            </p>
                            <p className="footer-mission">
                                Institutional complaint management and facilities resolution platform dedicated to exceptional campus standards.
                            </p>
                        </div>

                        <div className="footer-links-col">
                            <h4>Platform</h4>
                            <button type="button" onClick={() => scrollToSection("home")}>Home</button>
                            <button type="button" onClick={() => scrollToSection("services")}>Services</button>
                            <button type="button" onClick={() => scrollToSection("how-it-works")}>How It Works</button>
                            <button type="button" onClick={() => scrollToSection("features")}>Features</button>
                        </div>

                        <div className="footer-links-col">
                            <h4>Institution</h4>
                            <button type="button" onClick={() => scrollToSection("about")}>About</button>
                            <button type="button" onClick={() => scrollToSection("feedback")}>Student Feedback</button>
                            <button type="button" onClick={() => scrollToSection("stats")}>Impact Stats</button>
                            <button type="button" onClick={() => scrollToSection("contact")}>Contact</button>
                        </div>

                        <div className="footer-links-col">
                            <h4>Portals</h4>
                            <button type="button" onClick={onLogin}>Student Portal</button>
                            <button type="button" onClick={onLogin}>Technician Workspace</button>
                            <button type="button" onClick={onLogin}>Administrator Portal</button>
                            <button type="button" onClick={onSignup}>Register Account</button>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>© 2026 Fixora. All rights reserved.</p>
                        <div className="footer-legal-links">
                            <span>Privacy Policy</span>
                            <span>•</span>
                            <span>Terms of Service</span>
                            <span>•</span>
                            <span>Campus Safety Guidelines</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Landing;