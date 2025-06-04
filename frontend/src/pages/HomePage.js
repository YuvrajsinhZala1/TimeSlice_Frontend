import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Sample testimonials with realistic ratings
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Developer",
      avatar: "SC",
      rating: 5,
      text: "TimeSlice helped me find amazing coding mentors! I learned React in just 2 weeks through their expert helpers.",
      skills: ["JavaScript", "React", "Node.js"],
      completedTasks: 12
    },
    {
      name: "Marcus Johnson", 
      role: "Graphic Designer",
      avatar: "MJ",
      rating: 5,
      text: "As a freelancer, I love helping others with design projects. The credit system is fair and the community is amazing!",
      skills: ["Design", "Photoshop", "Branding"],
      completedTasks: 28
    },
    {
      name: "Elena Rodriguez",
      role: "Marketing Specialist", 
      avatar: "ER",
      rating: 4,
      text: "Got help with my business plan in just 1 hour! The application process ensures you get matched with the right expert.",
      skills: ["Marketing", "Content Strategy"],
      completedTasks: 7
    },
    {
      name: "David Kim",
      role: "Data Analyst",
      avatar: "DK", 
      rating: 5,
      text: "I've completed 45+ tasks helping others with data analysis. It's rewarding to share knowledge and earn credits!",
      skills: ["Python", "Data Analysis", "Excel"],
      completedTasks: 45
    },
    {
      name: "Priya Patel",
      role: "UX Designer",
      avatar: "PP",
      rating: 5,
      text: "The dual role system is brilliant! I can both get help with coding and offer my design expertise to others.",
      skills: ["UX Design", "Figma", "Research"],
      completedTasks: 19
    }
  ];

  const features = [
    {
      icon: "🤝",
      title: "Dual Role System",
      description: "Be both a helper and task seeker. Switch roles anytime based on what you need or can offer.",
      highlight: "Maximum Flexibility"
    },
    {
      icon: "💰",
      title: "Credit Economy", 
      description: "Fair virtual currency system. Earn credits by helping others, spend them to get help yourself.",
      highlight: "No Real Money"
    },
    {
      icon: "⚡",
      title: "Professional Applications",
      description: "No instant booking. Helpers apply with detailed proposals, ensuring perfect skill matches.",
      highlight: "Quality Guaranteed"
    },
    {
      icon: "💬",
      title: "Real-time Chat",
      description: "Built-in messaging system for seamless communication throughout your task collaboration.",
      highlight: "Stay Connected"
    },
    {
      icon: "⭐",
      title: "Reputation System",
      description: "Mutual reviews build trust and help you find the best helpers or most interesting tasks.",
      highlight: "Trust & Quality"
    },
    {
      icon: "🎯",
      title: "Smart Matching",
      description: "Advanced filtering shows you tasks that match your skills and interests perfectly.",
      highlight: "Find Your Match"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Users", icon: "👥" },
    { number: "50,000+", label: "Tasks Completed", icon: "✅" },
    { number: "4.8/5", label: "Average Rating", icon: "⭐" },
    { number: "200+", label: "Skill Categories", icon: "🎯" }
  ];

  const skillCategories = [
    "Programming", "Design", "Writing", "Marketing", "Data Analysis", 
    "Business", "Languages", "Music", "Photography", "Tutoring",
    "Cooking", "Fitness", "Legal Advice", "Career Coaching"
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            {/* Logo and Title */}
            <div className="brand-container">
              <div className="logo-container">
                <div className="hourglass-logo">
                  <div className="hourglass-top"></div>
                  <div className="hourglass-middle"></div>
                  <div className="hourglass-bottom"></div>
                  <div className="sand"></div>
                </div>
              </div>
              <h1 className="hero-title">TimeSlice</h1>
            </div>
            
            <h2 className="hero-subtitle-main">
              Share Skills. Get Help. 
              <span className="hero-highlight"> Build Community.</span>
            </h2>
            <p className="hero-subtitle">
              TimeSlice is the modern peer-to-peer marketplace where you can both offer your expertise 
              and get help from skilled community members using our fair credit system.
            </p>
            <div className="hero-features">
              <div className="hero-feature">
                <span className="feature-icon">⚡</span>
                <span>30-60 min quick tasks</span>
              </div>
              <div className="hero-feature">
                <span className="feature-icon">🔄</span>
                <span>Dual helper/seeker roles</span>
              </div>
              <div className="hero-feature">
                <span className="feature-icon">💫</span>
                <span>No money, just credits</span>
              </div>
            </div>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-hero-primary">
                Join TimeSlice Free
              </Link>
              <Link to="/login" className="btn btn-hero-secondary">
                Sign In
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-cards">
              <div className="task-card floating-card">
                <div className="task-header">
                  <span className="task-icon">💻</span>
                  <div>
                    <h4>React Code Review</h4>
                    <span className="task-credits">25 credits</span>
                  </div>
                </div>
                <p>Need expert to review my React component...</p>
                <div className="task-skills">
                  <span className="skill-tag">React</span>
                  <span className="skill-tag">JavaScript</span>
                </div>
              </div>
              
              <div className="helper-card floating-card">
                <div className="helper-avatar">JD</div>
                <div className="helper-info">
                  <h4>John Doe</h4>
                  <span className="helper-rating">★ 4.9 (120 reviews)</span>
                  <p>Expert React Developer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How TimeSlice Works</h2>
            <p>Get started in 3 simple steps and join our thriving community</p>
          </div>
          
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Create Your Profile</h3>
                <p>Sign up and add your skills. Choose to be a Helper, Task Provider, or both!</p>
                <div className="step-visual">
                  <div className="profile-preview">
                    <div className="profile-avatar">YOU</div>
                    <div className="profile-skills">
                      <span className="skill-badge">React</span>
                      <span className="skill-badge">Design</span>
                      <span className="skill-badge">+3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Browse & Apply</h3>
                <p>Find tasks matching your skills or post your own. Apply with detailed proposals.</p>
                <div className="step-visual">
                  <div className="browse-preview">
                    <div className="task-item">
                      <span className="task-title">Website Redesign</span>
                      <span className="task-credit">30 ⭐</span>
                    </div>
                    <div className="task-item">
                      <span className="task-title">Python Tutoring</span>
                      <span className="task-credit">45 ⭐</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Collaborate & Earn</h3>
                <p>Work together via real-time chat. Complete tasks and earn credits or get help!</p>
                <div className="step-visual">
                  <div className="chat-preview">
                    <div className="chat-message received">
                      <span>Let's start with the homepage design...</span>
                    </div>
                    <div className="chat-message sent">
                      <span>Perfect! I'll share my mockups 🎨</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose TimeSlice?</h2>
            <p>Built for the modern knowledge sharing economy</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon-large">{feature.icon}</div>
                <div className="feature-highlight">{feature.highlight}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>Loved by Our Community</h2>
            <p>Real reviews from real users who've found success on TimeSlice</p>
          </div>
          
          <div className="testimonials-container">
            <div className="testimonial-card active">
              <div className="testimonial-content">
                <div className="quote-icon">"</div>
                <p className="testimonial-text">{testimonials[currentTestimonial].text}</p>
                <div className="testimonial-rating">
                  {renderStars(testimonials[currentTestimonial].rating)}
                </div>
              </div>
              
              <div className="testimonial-author">
                <div className="author-avatar">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div className="author-info">
                  <h4>{testimonials[currentTestimonial].name}</h4>
                  <p>{testimonials[currentTestimonial].role}</p>
                  <span className="author-stats">
                    {testimonials[currentTestimonial].completedTasks} tasks completed
                  </span>
                </div>
              </div>
              
              <div className="testimonial-skills">
                {testimonials[currentTestimonial].skills.map((skill, idx) => (
                  <span key={idx} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
            
            <div className="testimonial-dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Categories */}
      <section className="skills-section">
        <div className="container">
          <div className="section-header">
            <h2>Explore Skills & Categories</h2>
            <p>From coding to cooking, find help or offer expertise in hundreds of categories</p>
          </div>
          
          <div className="skills-grid">
            {skillCategories.map((skill, index) => (
              <div key={index} className="skill-category">
                <span className="skill-name">{skill}</span>
                <span className="skill-count">{Math.floor(Math.random() * 500) + 100}+ experts</span>
              </div>
            ))}
          </div>
          
          <div className="skills-cta">
            <p>Don't see your skill? <strong>We welcome all expertise!</strong></p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Join the Community?</h2>
            <p>Start with 100 free credits. No credit card required.</p>
            <div className="cta-features">
              <div className="cta-feature">
                <span className="cta-icon">✨</span>
                <span>100 Free Credits</span>
              </div>
              <div className="cta-feature">
                <span className="cta-icon">🚀</span>
                <span>Instant Access</span>
              </div>
              <div className="cta-feature">
                <span className="cta-icon">🛡️</span>
                <span>Safe & Secure</span>
              </div>
            </div>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-cta-primary">
                Get Started Free
              </Link>
              <Link to="/login" className="btn btn-cta-secondary">
                Already a Member?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>TimeSlice</h3>
              <p>The peer-to-peer knowledge marketplace</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Platform</h4>
                <Link to="/register">Sign Up</Link>
                <Link to="/login">Sign In</Link>
              </div>
              <div className="footer-column">
                <h4>Community</h4>
                <a href="#how-it-works">How It Works</a>
                <a href="#features">Features</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 TimeSlice. Building the future of skill sharing.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;