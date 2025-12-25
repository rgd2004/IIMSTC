import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="home-page">
      {/* Animated cursor glow */}
      <div 
        className="cursor-glow" 
        style={{ left: mousePosition.x, top: mousePosition.y }}
      />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>

        <div className="container">
          <div className="hero-content">
            {/* Logo Section */}
            <div className="logo-wrapper" data-aos="fade-down">
              <div className="logo-ring"></div>
              <img
                src="https://res.cloudinary.com/dgrpzfiz7/image/upload/v1765725814/logo_hhyaop.jpg"
                alt="PKC CAG Logo"
                className="pkc-logo"
              />
              <div className="logo-badge">
                <span className="badge-icon">✨</span>
                Trusted Agency
              </div>
            </div>

            <h1 className="brand-name" data-aos="fade-up">
              PKC <span className="gradient-text">CAG</span>
            </h1>

            <div className="hero-badge" data-aos="fade-up" data-aos-delay="100">
              <i className="fas fa-crown"></i>
              <span>#1 Digital Marketing Agency in India</span>
            </div>

            <h2 className="hero-title" data-aos="fade-up" data-aos-delay="200">
              Transform Your Business With
              <span className="gradient-text"> Digital Excellence</span>
            </h2>

            <p className="hero-description" data-aos="fade-up" data-aos-delay="300">
              Elevate your brand with our premium digital marketing solutions.
              From Google Reviews to complete digital transformation — we deliver
              results that matter.
            </p>

            <div className="cta-group" data-aos="fade-up" data-aos-delay="400">
              <Link to="/services" className="btn btn-primary">
                <i className="fas fa-rocket"></i>
                <span>Explore Services</span>
                <div className="btn-shine"></div>
              </Link>

              <Link to="/register" className="btn btn-secondary">
                <i className="fas fa-arrow-right"></i>
                <span>Get Started Free</span>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="trust-badges" data-aos="fade-up" data-aos-delay="500">
              <div className="trust-item">
                <i className="fas fa-check-circle"></i>
                <span>100% Secure</span>
              </div>
              <div className="trust-item">
                <i className="fas fa-shield-alt"></i>
                <span>Verified Agency</span>
              </div>
              <div className="trust-item">
                <i className="fas fa-star"></i>
                <span>5.0 Rating</span>
              </div>
            </div>
          </div>

          {/* HERO STATS */}
          <div className="hero-stats" data-aos="fade-up" data-aos-delay="600">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-number">500+</div>
              <div className="stat-label">Happy Clients</div>
              <div className="stat-glow"></div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-star"></i>
              </div>
              <div className="stat-number">8000+</div>
              <div className="stat-label">Reviews Delivered</div>
              <div className="stat-glow"></div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="stat-number">98%</div>
              <div className="stat-label">Success Rate</div>
              <div className="stat-glow"></div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support</div>
              <div className="stat-glow"></div>
            </div>
          </div>
        </div>

        {/* Floating particles */}
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}></div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <span className="section-label">Why Choose Us</span>
            <h2>Why Choose <span className="gradient-text">PKC CAG</span>?</h2>
            <p className="section-description">
              Experience the difference with our premium services
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card" data-aos="fade-up" data-aos-delay="100">
              <div className="feature-icon lightning">
                <i className="fas fa-bolt"></i>
                <div className="icon-glow"></div>
              </div>
              <h3>Lightning Fast Delivery</h3>
              <p>Get your orders delivered within 24–72 hours</p>
              <div className="card-shine"></div>
            </div>

            <div className="feature-card" data-aos="fade-up" data-aos-delay="200">
              <div className="feature-icon shield">
                <i className="fas fa-shield-alt"></i>
                <div className="icon-glow"></div>
              </div>
              <h3>100% Authentic</h3>
              <p>Real profiles, genuine engagement, trusted results</p>
              <div className="card-shine"></div>
            </div>

            <div className="feature-card" data-aos="fade-up" data-aos-delay="300">
              <div className="feature-icon support">
                <i className="fas fa-headset"></i>
                <div className="icon-glow"></div>
              </div>
              <h3>24/7 Support</h3>
              <p>WhatsApp, Email & Phone support anytime</p>
              <div className="card-shine"></div>
            </div>

            <div className="feature-card" data-aos="fade-up" data-aos-delay="400">
              <div className="feature-icon secure">
                <i className="fas fa-lock"></i>
                <div className="icon-glow"></div>
              </div>
              <h3>Secure Payments</h3>
              <p>Safe & encrypted payments with Razorpay</p>
              <div className="card-shine"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="services-preview">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <span className="section-label">Our Services</span>
            <h2>Our Premium <span className="gradient-text">Services</span></h2>
            <p className="section-description">
              Comprehensive solutions to grow your digital presence
            </p>
          </div>

          <div className="services-grid">
            <div className="service-card" data-aos="zoom-in" data-aos-delay="100">
              <div className="service-number">01</div>
              <div className="service-icon">
                <i className="fas fa-star"></i>
              </div>
              <h3>Google Reviews</h3>
              <p>Boost trust with real 5-star reviews</p>
              <Link to="/services" className="service-link">
                Learn More <i className="fas fa-arrow-right"></i>
              </Link>
              <div className="service-bg"></div>
            </div>

            <div className="service-card" data-aos="zoom-in" data-aos-delay="200">
              <div className="service-number">02</div>
              <div className="service-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Social Media Growth</h3>
              <p>Grow followers & engagement organically</p>
              <Link to="/services" className="service-link">
                Learn More <i className="fas fa-arrow-right"></i>
              </Link>
              <div className="service-bg"></div>
            </div>

            <div className="service-card" data-aos="zoom-in" data-aos-delay="300">
              <div className="service-number">03</div>
              <div className="service-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>SEO Services</h3>
              <p>Rank higher & increase traffic</p>
              <Link to="/services" className="service-link">
                Learn More <i className="fas fa-arrow-right"></i>
              </Link>
              <div className="service-bg"></div>
            </div>

            <div className="service-card" data-aos="zoom-in" data-aos-delay="400">
              <div className="service-number">04</div>
              <div className="service-icon">
                <i className="fas fa-bullhorn"></i>
              </div>
              <h3>Digital Marketing</h3>
              <p>Complete online business solutions</p>
              <Link to="/services" className="service-link">
                Learn More <i className="fas fa-arrow-right"></i>
              </Link>
              <div className="service-bg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <span className="section-label">Testimonials</span>
            <h2>What Our <span className="gradient-text">Clients Say</span></h2>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card" data-aos="fade-up" data-aos-delay="100">
              <div className="quote-icon">
                <i className="fas fa-quote-left"></i>
              </div>
              <p className="testimonial-text">
                "PKC CAG transformed our online presence completely. Highly recommended!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">A</div>
                <div className="author-info">
                  <h4>Amit Sharma</h4>
                  <p>CEO, TechCorp</p>
                </div>
              </div>
              <div className="rating">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
            </div>

            <div className="testimonial-card" data-aos="fade-up" data-aos-delay="200">
              <div className="quote-icon">
                <i className="fas fa-quote-left"></i>
              </div>
              <p className="testimonial-text">
                "Best digital marketing agency! Results were beyond expectations."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">P</div>
                <div className="author-info">
                  <h4>Priya Patel</h4>
                  <p>Founder, StyleHub</p>
                </div>
              </div>
              <div className="rating">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
            </div>

            <div className="testimonial-card" data-aos="fade-up" data-aos-delay="300">
              <div className="quote-icon">
                <i className="fas fa-quote-left"></i>
              </div>
              <p className="testimonial-text">
                "Professional, reliable, and incredibly effective. 5 stars!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">R</div>
                <div className="author-info">
                  <h4>Rajesh Kumar</h4>
                  <p>Owner, FoodMart</p>
                </div>
              </div>
              <div className="rating">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-background">
          <div className="cta-orb cta-orb-1"></div>
          <div className="cta-orb cta-orb-2"></div>
        </div>
        
        <div className="container">
          <div className="cta-content" data-aos="zoom-in">
            <div className="cta-icon">
              <i className="fas fa-rocket"></i>
            </div>
            <h2>Ready to Transform Your Digital Presence?</h2>
            <p>Join 500+ businesses trusting PKC CAG for growth</p>
            
            <Link to="/register" className="btn btn-primary btn-large">
              <span>Get Started Now</span>
              <i className="fas fa-arrow-right"></i>
              <div className="btn-shine"></div>
            </Link>

            <div className="cta-features">
              <div className="cta-feature">
                <i className="fas fa-check"></i>
                <span>No Credit Card Required</span>
              </div>
              <div className="cta-feature">
                <i className="fas fa-check"></i>
                <span>Free Consultation</span>
              </div>
              <div className="cta-feature">
                <i className="fas fa-check"></i>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;