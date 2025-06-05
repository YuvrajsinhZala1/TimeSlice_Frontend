import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentStat, setCurrentStat] = useState(0);

  // Enhanced testimonials with more realistic data
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior React Developer",
      company: "TechFlow Inc.",
      avatar: "SC",
      rating: 5,
      text: "TimeSlice revolutionized how I find quality development work. The application system ensures I only work with serious clients, and the credit system is fair and transparent.",
      skills: ["React", "Node.js", "TypeScript", "GraphQL"],
      completedTasks: 47,
      earnings: "15,000+ credits earned"
    },
    {
      name: "Marcus Johnson", 
      role: "UX/UI Designer",
      company: "Creative Studio",
      avatar: "MJ",
      rating: 5,
      text: "Unlike other platforms, TimeSlice attracts high-quality projects. The dual-role system lets me both find great design work and get development help for my own projects.",
      skills: ["Figma", "Adobe Creative Suite", "Prototyping", "User Research"],
      completedTasks: 38,
      earnings: "12,500+ credits earned"
    },
    {
      name: "Elena Rodriguez",
      role: "Digital Marketing Strategist", 
      company: "Growth Labs",
      avatar: "ER",
      rating: 5,
      text: "The application process filters out time-wasters. I get matched with professionals who understand my needs and deliver exceptional results every time.",
      skills: ["SEO", "Content Strategy", "Analytics", "PPC"],
      completedTasks: 23,
      earnings: "8,200+ credits earned"
    },
    {
      name: "David Kim",
      role: "Data Scientist",
      company: "Analytics Pro",
      avatar: "DK", 
      rating: 5,
      text: "TimeSlice's credit system and professional community make it the premium choice for data science consulting. Quality over quantity - exactly what I was looking for.",
      skills: ["Python", "Machine Learning", "SQL", "Tableau"],
      completedTasks: 56,
      earnings: "22,100+ credits earned"
    }
  ];

  const stats = [
    { number: "50,000+", label: "Active Professionals", icon: "👥", color: "from-blue-500 to-cyan-500" },
    { number: "250,000+", label: "Projects Completed", icon: "✅", color: "from-green-500 to-emerald-500" },
    { number: "4.9/5", label: "Average Rating", icon: "⭐", color: "from-yellow-500 to-orange-500" },
    { number: "500+", label: "Skill Categories", icon: "🎯", color: "from-purple-500 to-pink-500" }
  ];

  const features = [
    {
      icon: "🎯",
      title: "Smart Matching System",
      description: "Our AI-powered algorithm matches you with the perfect projects or helpers based on skills, experience, and preferences.",
      highlight: "AI-Powered",
      benefits: ["98% match accuracy", "Save 5+ hours weekly", "Better project outcomes"]
    },
    {
      icon: "🛡️",
      title: "Quality Assurance",
      description: "Rigorous verification process and application-based system ensures only serious professionals join our platform.",
      highlight: "Verified Professionals",
      benefits: ["Background verified", "Skill assessments", "Portfolio reviews"]
    },
    {
      icon: "💰",
      title: "Fair Credit Economy", 
      description: "Transparent, blockchain-inspired credit system with no hidden fees. Earn by helping, spend to get help.",
      highlight: "Zero Platform Fees",
      benefits: ["No commission fees", "Instant transactions", "Credit rewards program"]
    },
    {
      icon: "⚡",
      title: "Real-time Collaboration",
      description: "Built-in project management tools, real-time chat, file sharing, and progress tracking for seamless collaboration.",
      highlight: "All-in-One Platform",
      benefits: ["Integrated chat", "File sharing", "Progress tracking"]
    },
    {
      icon: "🏆",
      title: "Reputation & Growth",
      description: "Build your professional reputation with detailed reviews, skill badges, and achievement levels that matter.",
      highlight: "Career Growth",
      benefits: ["Skill certifications", "Achievement badges", "Portfolio building"]
    },
    {
      icon: "🔒",
      title: "Secure & Reliable",
      description: "Enterprise-grade security, escrow protection, and 24/7 support ensure your projects and payments are always safe.",
      highlight: "Bank-Level Security",
      benefits: ["Escrow protection", "24/7 support", "Data encryption"]
    }
  ];

  const skillCategories = [
    { name: "Software Development", count: "15,000+", icon: "💻", trending: true },
    { name: "Design & Creative", count: "8,500+", icon: "🎨", trending: true },
    { name: "Digital Marketing", count: "6,200+", icon: "📈", trending: false },
    { name: "Data & Analytics", count: "4,800+", icon: "📊", trending: true },
    { name: "Content & Writing", count: "7,300+", icon: "✍️", trending: false },
    { name: "Business Consulting", count: "3,900+", icon: "💼", trending: false },
    { name: "AI & Machine Learning", count: "2,100+", icon: "🤖", trending: true },
    { name: "Blockchain & Web3", count: "1,800+", icon: "⛓️", trending: true },
    { name: "Mobile Development", count: "5,200+", icon: "📱", trending: false },
    { name: "DevOps & Cloud", count: "3,400+", icon: "☁️", trending: true },
    { name: "Video & Animation", count: "2,900+", icon: "🎬", trending: false },
    { name: "Music & Audio", count: "1,600+", icon: "🎵", trending: false }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Auto-rotate stats
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stats.length]);

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="brand-container">
                <div className="logo-container">
                  <span style={{ fontSize: '2rem' }}>⧗</span>
                </div>
                <div>
                  <h1 className="hero-title">TimeSlice</h1>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: '500' }}>
                    Premium Freelance Marketplace
                  </div>
                </div>
              </div>
              
              <h2 className="hero-subtitle-main">
                Where Top Talent Meets 
                <span style={{ 
                  background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'block'
                }}>
                  Premium Projects
                </span>
              </h2>
              
              <p className="hero-subtitle">
                Join the most exclusive freelance community where quality professionals collaborate 
                on meaningful projects. No race to the bottom - just fair compensation and exceptional work.
              </p>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '1rem', 
                margin: '2rem 0',
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '1rem',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00D4FF' }}>
                    {stats[currentStat].number}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                    {stats[currentStat].label}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FF6B35' }}>
                    $2.8M+
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                    Paid to Freelancers
                  </div>
                </div>
              </div>
              
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Join as Professional
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg" style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  color: 'white', 
                  border: '2px solid rgba(255,255,255,0.3)' 
                }}>
                  Sign In
                </Link>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '2rem', 
                marginTop: '2rem', 
                fontSize: '0.9rem',
                opacity: 0.8 
              }}>
                <div>✅ No Platform Fees</div>
                <div>✅ Verified Professionals</div>
                <div>✅ Premium Projects Only</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{
                width: '400px',
                height: '500px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '2rem',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '2rem'
              }}>
                <div style={{ fontSize: '4rem' }}>⧗</div>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>Premium Marketplace</h3>
                  <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                    Quality over quantity. Professional collaboration at its finest.
                  </p>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem',
                  width: '100%',
                  padding: '0 2rem'
                }}>
                  <div style={{ 
                    background: 'rgba(0,212,255,0.2)', 
                    padding: '1rem', 
                    borderRadius: '1rem',
                    border: '1px solid rgba(0,212,255,0.3)'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>React Expert Needed</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>$150/hour • Remote</div>
                  </div>
                  
                  <div style={{ 
                    background: 'rgba(255,107,53,0.2)', 
                    padding: '1rem', 
                    borderRadius: '1rem',
                    border: '1px solid rgba(255,107,53,0.3)'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>UX/UI Designer</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>$120/hour • Contract</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '4rem 0', background: 'white' }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '2rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {stats.map((stat, index) => (
              <div key={index} style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                borderRadius: '1rem',
                background: `linear-gradient(135deg, ${index === 0 ? '#00D4FF' : index === 1 ? '#10B981' : index === 2 ? '#F59E0B' : '#8B5CF6'}, ${index === 0 ? '#0066CC' : index === 1 ? '#059669' : index === 2 ? '#D97706' : '#7C3AED'})`,
                color: 'white',
                transform: currentStat === index ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.3s ease'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  {stat.number}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '6rem 0', background: '#F9FAFB' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1F2937' }}>
              Why Top Professionals Choose TimeSlice
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#6B7280', maxWidth: '600px', margin: '0 auto' }}>
              Built by freelancers, for freelancers. Every feature designed to maximize your success.
            </p>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '2rem'
          }}>
            {features.map((feature, index) => (
              <div key={index} className="card" style={{ textAlign: 'center', height: 'fit-content' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <div style={{ 
                  background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  display: 'inline-block',
                  marginBottom: '1rem'
                }}>
                  {feature.highlight}
                </div>
                <h3 style={{ marginBottom: '1rem', color: '#1F2937' }}>{feature.title}</h3>
                <p style={{ color: '#6B7280', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#059669'
                    }}>
                      <span>✓</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '6rem 0', background: 'linear-gradient(135deg, #0A0E27, #1A1F3A)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>
              Success Stories from Our Community
            </h2>
            <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto' }}>
              Real results from real professionals who've transformed their careers on TimeSlice
            </p>
          </div>
          
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '2rem',
              padding: '3rem',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>"</div>
              <p style={{ fontSize: '1.3rem', lineHeight: '1.6', marginBottom: '2rem', fontStyle: 'italic' }}>
                {testimonials[currentTestimonial].text}
              </p>
              <div style={{ fontSize: '1.5rem', color: '#F59E0B', marginBottom: '2rem' }}>
                {renderStars(testimonials[currentTestimonial].rating)}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}>
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                    {testimonials[currentTestimonial].role}
                  </div>
                  <div style={{ opacity: 0.6, fontSize: '0.8rem' }}>
                    {testimonials[currentTestimonial].company}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  {testimonials[currentTestimonial].completedTasks} tasks completed
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  {testimonials[currentTestimonial].earnings}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                {testimonials[currentTestimonial].skills.map((skill, idx) => (
                  <span key={idx} style={{
                    background: 'rgba(0,212,255,0.2)',
                    border: '1px solid rgba(0,212,255,0.3)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.8rem'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: 'none',
                    background: index === currentTestimonial ? '#00D4FF' : 'rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Categories */}
      <section style={{ padding: '6rem 0', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1F2937' }}>
              Explore In-Demand Skills
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#6B7280', maxWidth: '600px', margin: '0 auto' }}>
              From emerging technologies to established expertise - find or offer skills that matter
            </p>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1rem'
          }}>
            {skillCategories.map((category, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                  e.target.style.borderColor = '#00D4FF';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = '#E5E7EB';
                }}
              >
                {category.trending && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }}>
                    TRENDING
                  </div>
                )}
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{category.icon}</div>
                <h3 style={{ marginBottom: '0.5rem', color: '#1F2937', fontSize: '1.1rem' }}>
                  {category.name}
                </h3>
                <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                  {category.count} professionals
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '6rem 0', 
        background: 'linear-gradient(135deg, #0A0E27, #1A1F3A)',
        textAlign: 'center' 
      }}>
        <div className="container">
          <h2 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem', 
            color: 'white'
          }}>
            Ready to Join the Elite?
          </h2>
          <p style={{ 
            fontSize: '1.3rem', 
            marginBottom: '3rem', 
            color: 'rgba(255,255,255,0.8)',
            maxWidth: '600px',
            margin: '0 auto 3rem'
          }}>
            Start with 100 free credits. No credit card required. Join thousands of professionals who've elevated their careers.
          </p>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '1rem', 
            marginBottom: '3rem',
            flexWrap: 'wrap'
          }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Join as Professional
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg" style={{ 
              background: 'rgba(255,255,255,0.1)', 
              color: 'white', 
              border: '2px solid rgba(255,255,255,0.3)' 
            }}>
              Post a Project
            </Link>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '3rem',
            flexWrap: 'wrap',
            opacity: 0.8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
              <span style={{ fontSize: '1.2rem' }}>✨</span>
              <span>100 Free Credits</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
              <span style={{ fontSize: '1.2rem' }}>🚀</span>
              <span>Instant Access</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
              <span style={{ fontSize: '1.2rem' }}>🛡️</span>
              <span>Verified Community</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        background: '#1F2937', 
        color: 'white', 
        padding: '3rem 0 1rem',
        textAlign: 'center'
      }}>
        <div className="container">
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              TimeSlice
            </h3>
            <p style={{ opacity: 0.8 }}>The premium freelance marketplace</p>
          </div>
          
          <div style={{ 
            borderTop: '1px solid rgba(255,255,255,0.1)', 
            paddingTop: '2rem',
            opacity: 0.7
          }}>
            <p>&copy; 2024 TimeSlice. Elevating freelance collaboration worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;