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
    { number: "50,000+", label: "Active Professionals", icon: "👥", color: "var(--primary-gradient)" },
    { number: "250,000+", label: "Projects Completed", icon: "✅", color: "linear-gradient(135deg, var(--success), #059669)" },
    { number: "4.9/5", label: "Average Rating", icon: "⭐", color: "linear-gradient(135deg, var(--warning), #D97706)" },
    { number: "500+", label: "Skill Categories", icon: "🎯", color: "linear-gradient(135deg, #8B5CF6, #EC4899)" }
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
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Hero Section */}
      <section className="hero-section" style={{
        background: 'linear-gradient(135deg, var(--bg-primary), var(--bg-secondary))',
        padding: 'var(--space-2xl) 0',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 107, 53, 0.15) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}></div>

        <div className="container">
          <div className="hero-content" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-2xl)',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-lg)',
                marginBottom: 'var(--space-xl)'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--primary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  {/* Placeholder for your logo */}
                  ⧗
                </div>
                <div>
                  <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    background: 'var(--primary-gradient)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0,
                    lineHeight: '1'
                  }}>
                    TimeSlice
                  </h1>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '600' }}>
                    Premium Freelance Marketplace
                  </div>
                </div>
              </div>
              
              <h2 style={{
                fontSize: '3.5rem',
                fontWeight: '800',
                lineHeight: '1.1',
                marginBottom: 'var(--space-xl)',
                color: 'var(--text-primary)'
              }}>
                Where Top Talent Meets 
                <span style={{ 
                  background: 'var(--primary-gradient)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'block'
                }}>
                  Premium Projects
                </span>
              </h2>
              
              <p style={{
                fontSize: '1.2rem',
                lineHeight: '1.7',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2xl)',
                maxWidth: '600px'
              }}>
                Join the most exclusive freelance community where quality professionals collaborate 
                on meaningful projects. No race to the bottom - just fair compensation and exceptional work.
              </p>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 'var(--space-lg)', 
                margin: 'var(--space-2xl) 0',
                padding: 'var(--space-xl)',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-lg)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-cyan)' }}>
                    {stats[currentStat].number}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {stats[currentStat].label}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-orange)' }}>
                    $2.8M+
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Paid to Freelancers
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                <Link 
                  to="/register" 
                  className="btn btn-primary btn-lg"
                  style={{
                    background: 'var(--primary-gradient)',
                    color: 'white',
                    textDecoration: 'none',
                    padding: 'var(--space-lg) var(--space-2xl)',
                    borderRadius: 'var(--radius-xl)',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    boxShadow: 'var(--shadow-lg)',
                    border: 'none'
                  }}
                >
                  Join as Professional
                </Link>
                <Link 
                  to="/login" 
                  className="btn btn-secondary btn-lg"
                  style={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    color: 'var(--text-primary)', 
                    border: '2px solid rgba(255,255,255,0.3)',
                    textDecoration: 'none',
                    padding: 'var(--space-lg) var(--space-2xl)',
                    borderRadius: 'var(--radius-xl)',
                    fontWeight: '700',
                    fontSize: '1.1rem'
                  }}
                >
                  Sign In
                </Link>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: 'var(--space-2xl)', 
                fontSize: '1rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <span style={{ color: 'var(--success)' }}>✅</span>
                  No Platform Fees
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <span style={{ color: 'var(--success)' }}>✅</span>
                  Verified Professionals
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <span style={{ color: 'var(--success)' }}>✅</span>
                  Premium Projects Only
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{
                width: '500px',
                height: '600px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-xl)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 'var(--space-2xl)',
                boxShadow: 'var(--shadow-xl)'
              }}>
                <div style={{ fontSize: '5rem' }}>⧗</div>
                <div style={{ textAlign: 'center', color: 'var(--text-primary)' }}>
                  <h3 style={{ marginBottom: 'var(--space-sm)', fontSize: '1.8rem', fontWeight: '700' }}>
                    Premium Marketplace
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
                    Quality over quantity. Professional collaboration at its finest.
                  </p>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 'var(--space-lg)',
                  width: '100%',
                  padding: '0 var(--space-2xl)'
                }}>
                  <div style={{ 
                    background: 'rgba(0,212,255,0.15)', 
                    padding: 'var(--space-lg)', 
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgba(0,212,255,0.3)'
                  }}>
                    <div style={{ fontWeight: '700', marginBottom: 'var(--space-xs)', fontSize: '1.1rem' }}>
                      React Expert Needed
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      $150/hour • Remote
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: 'rgba(255,107,53,0.15)', 
                    padding: 'var(--space-lg)', 
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgba(255,107,53,0.3)'
                  }}>
                    <div style={{ fontWeight: '700', marginBottom: 'var(--space-xs)', fontSize: '1.1rem' }}>
                      UX/UI Designer
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      $120/hour • Contract
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: 'var(--space-2xl) 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="grid grid-4">
            {stats.map((stat, index) => (
              <div key={index} style={{
                textAlign: 'center',
                padding: 'var(--space-2xl) var(--space-lg)',
                borderRadius: 'var(--radius-lg)',
                background: stat.color,
                color: 'white',
                transform: currentStat === index ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform var(--transition-normal)',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>{stat.icon}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: 'var(--space-xs)' }}>
                  {stat.number}
                </div>
                <div style={{ fontSize: '1rem', opacity: 0.9, fontWeight: '500' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: 'var(--space-2xl) 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div className="page-header">
            <h2 className="page-title">
              Why Top Professionals Choose TimeSlice
            </h2>
            <p className="page-subtitle">
              Built by freelancers, for freelancers. Every feature designed to maximize your success.
            </p>
          </div>
          
          <div className="grid grid-3">
            {features.map((feature, index) => (
              <div key={index} className="card" style={{ textAlign: 'center', height: 'fit-content' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-lg)' }}>{feature.icon}</div>
                <div className="badge badge-primary" style={{ 
                  marginBottom: 'var(--space-lg)',
                  fontSize: '0.8rem',
                  fontWeight: '700'
                }}>
                  {feature.highlight}
                </div>
                <h3 style={{ 
                  marginBottom: 'var(--space-lg)', 
                  color: 'var(--text-primary)',
                  fontSize: '1.3rem',
                  fontWeight: '700'
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  marginBottom: 'var(--space-xl)', 
                  lineHeight: '1.7',
                  fontSize: '1rem'
                }}>
                  {feature.description}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--space-sm)',
                      fontSize: '0.9rem',
                      color: 'var(--success)'
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>✓</span>
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
      <section style={{ 
        padding: 'var(--space-2xl) 0', 
        background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))' 
      }}>
        <div className="container">
          <div className="page-header">
            <h2 className="page-title">
              Success Stories from Our Community
            </h2>
            <p className="page-subtitle">
              Real results from real professionals who've transformed their careers on TimeSlice
            </p>
          </div>
          
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="card" style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: 'var(--space-2xl)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)', opacity: 0.3 }}>"</div>
              <p style={{ 
                fontSize: '1.4rem', 
                lineHeight: '1.7', 
                marginBottom: 'var(--space-xl)', 
                fontStyle: 'italic',
                color: 'var(--text-primary)'
              }}>
                {testimonials[currentTestimonial].text}
              </p>
              <div style={{ fontSize: '1.8rem', color: 'var(--warning)', marginBottom: 'var(--space-xl)' }}>
                {renderStars(testimonials[currentTestimonial].rating)}
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-lg)', 
                justifyContent: 'center', 
                marginBottom: 'var(--space-xl)' 
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'var(--primary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '1.5rem',
                  color: 'white'
                }}>
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '700', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                    {testimonials[currentTestimonial].role}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {testimonials[currentTestimonial].company}
                  </div>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 'var(--space-xl)', 
                marginBottom: 'var(--space-lg)' 
              }}>
                <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                  {testimonials[currentTestimonial].completedTasks} tasks completed
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                  {testimonials[currentTestimonial].earnings}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', justifyContent: 'center' }}>
                {testimonials[currentTestimonial].skills.map((skill, idx) => (
                  <span key={idx} className="badge badge-primary">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 'var(--space-sm)', 
              marginTop: 'var(--space-xl)' 
            }}>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: 'none',
                    background: index === currentTestimonial ? 'var(--primary-cyan)' : 'rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-normal)'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Categories */}
      <section style={{ padding: 'var(--space-2xl) 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div className="page-header">
            <h2 className="page-title">
              Explore In-Demand Skills
            </h2>
            <p className="page-subtitle">
              From emerging technologies to established expertise - find or offer skills that matter
            </p>
          </div>
          
          <div className="grid grid-auto">
            {skillCategories.map((category, index) => (
              <div
                key={index}
                className="card"
                style={{
                  cursor: 'pointer',
                  position: 'relative',
                  textAlign: 'center'
                }}
              >
                {category.trending && (
                  <div className="badge badge-success" style={{
                    position: 'absolute',
                    top: 'var(--space-lg)',
                    right: 'var(--space-lg)',
                    fontSize: '0.7rem',
                    fontWeight: '700'
                  }}>
                    TRENDING
                  </div>
                )}
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-lg)' }}>{category.icon}</div>
                <h3 style={{ 
                  marginBottom: 'var(--space-sm)', 
                  color: 'var(--text-primary)', 
                  fontSize: '1.2rem',
                  fontWeight: '700'
                }}>
                  {category.name}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                  {category.count} professionals
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: 'var(--space-2xl) 0', 
        background: 'linear-gradient(135deg, var(--bg-primary), var(--bg-secondary))',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ 
            fontSize: '3.5rem', 
            fontWeight: '800', 
            marginBottom: 'var(--space-lg)', 
            color: 'var(--text-primary)'
          }}>
            Ready to Join the Elite?
          </h2>
          <p style={{ 
            fontSize: '1.3rem', 
            marginBottom: 'var(--space-2xl)', 
            color: 'var(--text-secondary)',
            maxWidth: '700px',
            margin: '0 auto var(--space-2xl)'
          }}>
            Start with 100 free credits. No credit card required. Join thousands of professionals who've elevated their careers.
          </p>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 'var(--space-lg)', 
            marginBottom: 'var(--space-2xl)',
            flexWrap: 'wrap'
          }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Join as Professional
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg" style={{ 
              background: 'rgba(255,255,255,0.1)', 
              color: 'var(--text-primary)', 
              border: '2px solid rgba(255,255,255,0.3)' 
            }}>
              Post a Project
            </Link>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 'var(--space-2xl)',
            flexWrap: 'wrap'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-sm)', 
              color: 'var(--text-secondary)',
              fontSize: '1.1rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>✨</span>
              <span>100 Free Credits</span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-sm)', 
              color: 'var(--text-secondary)',
              fontSize: '1.1rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>🚀</span>
              <span>Instant Access</span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-sm)', 
              color: 'var(--text-secondary)',
              fontSize: '1.1rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>🛡️</span>
              <span>Verified Community</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        background: 'var(--bg-secondary)', 
        color: 'var(--text-primary)', 
        padding: 'var(--space-2xl) 0 var(--space-lg)',
        textAlign: 'center',
        borderTop: '1px solid var(--border-primary)'
      }}>
        <div className="container">
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <h3 style={{ 
              background: 'var(--primary-gradient)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '2rem',
              fontWeight: '800',
              marginBottom: 'var(--space-sm)'
            }}>
              TimeSlice
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>The premium freelance marketplace</p>
          </div>
          
          <div style={{ 
            borderTop: '1px solid var(--border-primary)', 
            paddingTop: 'var(--space-xl)',
            color: 'var(--text-muted)'
          }}>
            <p>&copy; 2024 TimeSlice. Elevating freelance collaboration worldwide.</p>
          </div>
        </div>
      </footer>
      
      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .hero-content {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          
          .hero-content h2 {
            font-size: 2.5rem !important;
          }
          
          .page-title {
            font-size: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;