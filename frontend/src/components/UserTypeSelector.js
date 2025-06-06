import React from 'react';

const UserTypeSelector = ({ selectedType, onChange }) => {
  const userTypes = [
    {
      value: 'helper',
      title: '🤝 Professional Helper',
      subtitle: 'I want to offer my skills and expertise',
      description: 'Join as a verified professional to provide services, build your reputation, and grow your freelance career in our premium community.',
      features: [
        'Browse premium projects from verified clients',
        'Set your own rates and availability',
        'Build a professional portfolio and reputation',
        'Access to exclusive high-paying opportunities',
        'Direct communication with quality clients',
        'Skill verification and certifications'
      ],
      color: 'linear-gradient(135deg, #10B981, #059669)',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      icon: '🤝',
      stats: {
        avgEarning: '$85/hour',
        activeProjects: '15,000+',
        successRate: '94%'
      }
    },
    {
      value: 'client',
      title: '📋 Project Owner',
      subtitle: 'I need help with projects and tasks',
      description: 'Post projects and connect with skilled professionals who deliver exceptional results. Our curated network ensures quality matches.',
      features: [
        'Access to verified, skilled professionals',
        'Application-based hiring for quality control',
        'Project management and collaboration tools',
        'Transparent pricing with no hidden fees',
        'Dedicated support for project success',
        'Flexible hiring options and timelines'
      ],
      color: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
      bgColor: 'rgba(59, 130, 246, 0.15)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      icon: '📋',
      stats: {
        avgSavings: '35% vs competitors',
        qualityScore: '4.9/5',
        timeToHire: '< 24 hours'
      }
    }
  ];

  const UserTypeCard = ({ userType, isSelected, onSelect }) => (
    <div
      onClick={() => onSelect(userType.value)}
      style={{
        background: isSelected ? userType.bgColor : 'var(--bg-card)',
        border: `2px solid ${isSelected ? userType.borderColor : 'var(--border-primary)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-xl)',
        cursor: 'pointer',
        transition: 'all var(--transition-normal)',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--border-accent)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--border-primary)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
    >
      {/* Gradient accent bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: isSelected ? userType.color : 'transparent'
      }}></div>

      {/* Selection indicator */}
      <div style={{
        position: 'absolute',
        top: 'var(--space-lg)',
        right: 'var(--space-lg)',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        border: `2px solid ${isSelected ? userType.borderColor : 'var(--border-muted)'}`,
        background: isSelected ? userType.color : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all var(--transition-normal)'
      }}>
        {isSelected && (
          <div style={{
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: 'bold'
          }}>
            ✓
          </div>
        )}
      </div>

      {/* Header */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: 'var(--space-md)',
          textAlign: 'center'
        }}>
          {userType.icon}
        </div>
        
        <h3 style={{
          fontSize: '1.4rem',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-sm)',
          textAlign: 'center'
        }}>
          {userType.title}
        </h3>
        
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-lg)',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          {userType.subtitle}
        </p>
        
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
          lineHeight: '1.6',
          textAlign: 'center'
        }}>
          {userType.description}
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-sm)',
        marginBottom: 'var(--space-xl)',
        padding: 'var(--space-lg)',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-primary)'
      }}>
        {Object.entries(userType.stats).map(([key, value], index) => (
          <div key={key} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-xs)'
            }}>
              {value}
            </div>
            <div style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {key === 'avgEarning' ? 'Avg Earning' :
               key === 'activeProjects' ? 'Active Projects' :
               key === 'successRate' ? 'Success Rate' :
               key === 'avgSavings' ? 'Avg Savings' :
               key === 'qualityScore' ? 'Quality Score' :
               key === 'timeToHire' ? 'Time to Hire' : key}
            </div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ flex: 1 }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)'
        }}>
          ✨ What you get:
        </h4>
        
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-sm)'
        }}>
          {userType.features.map((feature, index) => (
            <li key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-sm)',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.5'
            }}>
              <span style={{
                color: isSelected ? userType.borderColor.replace('0.3', '1') : 'var(--success)',
                fontSize: '1rem',
                flexShrink: 0,
                marginTop: '0.1rem'
              }}>
                ✓
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Call to Action */}
      <div style={{
        marginTop: 'var(--space-xl)',
        padding: 'var(--space-lg)',
        background: isSelected ? userType.color : 'rgba(255,255,255,0.05)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center'
      }}>
        <div style={{
          color: isSelected ? 'white' : 'var(--text-primary)',
          fontWeight: '700',
          fontSize: '0.9rem'
        }}>
          {isSelected ? '🎉 Perfect Choice!' : 'Choose This Path'}
        </div>
        {isSelected && (
          <div style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '0.8rem',
            marginTop: 'var(--space-xs)'
          }}>
            Continue to complete your profile
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{
        marginBottom: 'var(--space-xl)',
        textAlign: 'center'
      }}>
        <h3 style={{
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-sm)',
          fontSize: '1.2rem',
          fontWeight: '700'
        }}>
          How do you want to use TimeSlice?
        </h3>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1rem',
          margin: 0
        }}>
          Choose your primary role. You can always do both once you're a member!
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: 'var(--space-xl)',
        marginBottom: 'var(--space-xl)'
      }}>
        {userTypes.map(userType => (
          <UserTypeCard
            key={userType.value}
            userType={userType}
            isSelected={selectedType === userType.value}
            onSelect={onChange}
          />
        ))}
      </div>

      {/* Additional Info */}
      {selectedType && (
        <div className="alert alert-success" style={{
          background: userTypes.find(t => t.value === selectedType)?.bgColor,
          border: `1px solid ${userTypes.find(t => t.value === selectedType)?.borderColor}`,
          color: 'var(--text-primary)'
        }}>
          <span style={{ fontSize: '1.5rem' }}>
            {userTypes.find(t => t.value === selectedType)?.icon}
          </span>
          <div>
            <strong>
              Welcome to the {selectedType === 'helper' ? 'Helper' : 'Client'} community!
            </strong>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
              {selectedType === 'helper' 
                ? 'You\'ll be able to browse projects, apply for opportunities, and build your professional reputation.'
                : 'You\'ll be able to post projects, review applications from verified professionals, and manage your collaborations.'
              }
            </p>
          </div>
        </div>
      )}

      {/* Flexible Role Notice */}
      <div style={{
        textAlign: 'center',
        padding: 'var(--space-lg)',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-primary)',
        marginTop: 'var(--space-xl)'
      }}>
        <div style={{
          fontSize: '1.5rem',
          marginBottom: 'var(--space-sm)'
        }}>
          🔄
        </div>
        <div style={{
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          lineHeight: '1.6'
        }}>
          <strong style={{ color: 'var(--text-primary)' }}>Flexible by Design:</strong><br />
          Your primary role determines your initial dashboard and experience, but all TimeSlice members 
          can both offer and request services. Switch modes anytime!
        </div>
      </div>

      {/* Mobile Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default UserTypeSelector;