import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './WelcomePage.module.css';
import './SharedStyles.css';
import logoSvg from '../assets/logo.png';
import heroImage from '../assets/joe1980_light_trails_tracing_the_activity_of_two_young_people_b68a16e7-3e53-4c8b-b824-9edc7aa00c80_0.png';
import { 
  RiBarChartLine, 
  RiLightbulbLine, 
  RiRefreshLine, 
  RiPieChartLine,
  RiFacebookFill,
  RiTwitterFill,
  RiInstagramFill,
  RiArrowRightLine,
  RiCheckLine,
  RiGroupLine,
  RiBuildingLine,
  RiHeartLine,
  RiMailLine,
  RiRobotLine,
  RiHandCoinLine,
  RiTrophyLine,
  RiShieldCheckLine
} from 'react-icons/ri';

const WelcomePage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [platformStats, setPlatformStats] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      
      // Check if stats section is visible
      const statsSection = document.getElementById('stats-section');
      if (statsSection) {
        const rect = statsSection.getBoundingClientRect();
        setStatsVisible(rect.top < window.innerHeight && rect.bottom > 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch platform stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/platform-stats`
        );
        setPlatformStats(response.data);
      } catch (error) {
        console.error('Error fetching platform stats:', error);
        // Use demo data as fallback
        setPlatformStats({
          totalDonations: { formatted: '$282' },
          matchingUnlocked: { formatted: '$0' },
          activeDonors: { formatted: '5' },
          supportedCharities: { formatted: '5' }
        });
      }
    };
    
    fetchStats();
  }, []);

  const stats = platformStats ? [
    { value: platformStats.totalDonations.formatted, label: 'Donations Tracked', animate: statsVisible },
    { value: platformStats.matchingUnlocked.formatted, label: 'Matching Unlocked', animate: statsVisible },
    { value: platformStats.activeDonors.formatted, label: 'Active Donors', animate: statsVisible },
    { value: platformStats.supportedCharities.formatted, label: 'Charities Supported', animate: statsVisible }
  ] : [
    { value: '...', label: 'Donations Tracked', animate: false },
    { value: '...', label: 'Matching Unlocked', animate: false },
    { value: '...', label: 'Active Donors', animate: false },
    { value: '...', label: 'Charities Supported', animate: false }
  ];

  return (
    <div className={styles.welcomePage}>
      {/* Navigation Header */}
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.headerContent}>
          <div className={styles.logoContainer}>
            <img src={logoSvg} alt="Do-Nation Logo" className={styles.logo} />
          </div>
          <nav className={styles.nav}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#how-it-works" className={styles.navLink}>How It Works</a>
            <a href="#pricing" className={styles.navLink}>Pricing</a>
            <Link to="/login" className={styles.loginButton}>Log In</Link>
            <Link to="/signup" className={styles.signupButton}>Sign Up Free</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Transform Your Giving.<br/>
              <span className={styles.heroTitleGradient}>Amplify Your Impact.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              The intelligent donation platform that automatically tracks your charitable giving, 
              unlocks corporate matching, and shows your real impact – all in one place.
            </p>
            <div className={styles.heroActions}>
              <Link to="/signup" className={styles.primaryCta}>
                Start Your Impact Journey
                <RiArrowRightLine className={styles.ctaIcon} />
              </Link>
              <a href="#demo" className={styles.secondaryCta}>
                See How It Works
              </a>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>$2,000</span>
                <span className={styles.heroStatLabel}>Avg. yearly matching left unclaimed</span>
              </div>
              <div className={styles.heroStatDivider}></div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>2 min</span>
                <span className={styles.heroStatLabel}>Setup time</span>
              </div>
            </div>
          </div>
          <div className={styles.heroImageContainer}>
            <img src={heroImage} alt="Impact Dashboard" className={styles.heroImage} />
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className={styles.trustSection}>
        <div className={styles.trustContent}>
          <p className={styles.trustText}>Trusted by leading organizations</p>
          <div className={styles.trustLogos}>
            {/* Placeholder for partner logos */}
            <div className={styles.trustLogo}>Partner 1</div>
            <div className={styles.trustLogo}>Partner 2</div>
            <div className={styles.trustLogo}>Partner 3</div>
            <div className={styles.trustLogo}>Partner 4</div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Everything you need to maximize your impact</h2>
          <p className={styles.sectionSubtitle}>
            One platform. Complete visibility. Maximum impact.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <RiRobotLine className={styles.featureIcon} />
            </div>
            <h3 className={styles.featureTitle}>Automated Donation Tracking</h3>
            <p className={styles.featureDescription}>
              Simply forward receipts to your unique email or connect your inbox. 
              Our AI extracts details, categorizes giving, and builds your complete history.
            </p>
            <ul className={styles.featureList}>
              <li><RiCheckLine /> Email receipt scanning</li>
              <li><RiCheckLine /> PDF data extraction</li>
              <li><RiCheckLine /> Tax-ready reports</li>
            </ul>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <RiHandCoinLine className={styles.featureIcon} />
            </div>
            <h3 className={styles.featureTitle}>Corporate Matching Made Easy</h3>
            <p className={styles.featureDescription}>
              Unlock millions in unused corporate matching funds. Instant matching, 
              real-time notifications, zero paperwork.
            </p>
            <ul className={styles.featureList}>
              <li><RiCheckLine /> Automatic qualification</li>
              <li><RiCheckLine /> Micro-matching on all donations</li>
              <li><RiCheckLine /> No deadlines to miss</li>
            </ul>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <RiBarChartLine className={styles.featureIcon} />
            </div>
            <h3 className={styles.featureTitle}>Impact Analytics That Inspire</h3>
            <p className={styles.featureDescription}>
              Beautiful visualizations show your giving trends, impact scores, 
              and progress toward meaningful goals.
            </p>
            <ul className={styles.featureList}>
              <li><RiCheckLine /> Real-time dashboards</li>
              <li><RiCheckLine /> Achievement badges</li>
              <li><RiCheckLine /> Community comparisons</li>
            </ul>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <RiLightbulbLine className={styles.featureIcon} />
            </div>
            <h3 className={styles.featureTitle}>Smart Giving Insights</h3>
            <p className={styles.featureDescription}>
              AI-powered recommendations help you discover high-impact charities 
              and optimize your giving strategy.
            </p>
            <ul className={styles.featureList}>
              <li><RiCheckLine /> Charity recommendations</li>
              <li><RiCheckLine /> Tax optimization tips</li>
              <li><RiCheckLine /> Personalized insights</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats-section" className={styles.statsSection}>
        <div className={styles.statsContent}>
          <h2 className={styles.statsTitle}>Making a real difference, together</h2>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={`${styles.statCard} ${stat.animate ? styles.animate : ''}`}>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className={styles.userTypes}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Built for everyone who gives</h2>
        </div>

        <div className={styles.userTypeCards}>
          <div className={styles.userTypeCard}>
            <div className={styles.userTypeIcon}>
              <RiGroupLine />
            </div>
            <h3>For Individual Donors</h3>
            <p>Your complete giving command center. Track donations, earn achievements, create campaigns.</p>
            <Link to="/signup" className={styles.userTypeLink}>
              Start Free <RiArrowRightLine />
            </Link>
          </div>

          <div className={styles.userTypeCard}>
            <div className={styles.userTypeIcon}>
              <RiBuildingLine />
            </div>
            <h3>For Businesses</h3>
            <p>Transform your CSR program. Create matching campaigns, engage teams, track ROI.</p>
            <Link to="/business" className={styles.userTypeLink}>
              Learn More <RiArrowRightLine />
            </Link>
          </div>

          <div className={styles.userTypeCard}>
            <div className={styles.userTypeIcon}>
              <RiHeartLine />
            </div>
            <h3>For Charities</h3>
            <p>Connect with committed supporters. Verified profiles, donor engagement, impact reporting.</p>
            <Link to="/charities" className={styles.userTypeLink}>
              Get Verified <RiArrowRightLine />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Get started in minutes</h2>
        </div>
        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3>Sign Up Free</h3>
            <p>Create your account with Google, Microsoft, or email in seconds</p>
          </div>
          <div className={styles.stepConnector}></div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3>Connect Your Giving</h3>
            <p>Forward receipts or connect your email for automatic tracking</p>
          </div>
          <div className={styles.stepConnector}></div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3>Unlock Matching</h3>
            <p>Automatically qualify for corporate matching programs</p>
          </div>
          <div className={styles.stepConnector}></div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <h3>Track Impact</h3>
            <p>Watch your giving story unfold with beautiful analytics</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className={styles.testimonialCard}>
          <p className={styles.testimonialText}>
            "Do-Nation transformed how I think about giving. I discovered I was already donating $3,000 
            a year – and qualified for another $2,000 in matching!"
          </p>
          <div className={styles.testimonialAuthor}>
            <strong>Sarah M.</strong>
            <span>Teacher</span>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className={styles.security}>
        <div className={styles.securityContent}>
          <RiShieldCheckLine className={styles.securityIcon} />
          <h3>Your data, protected</h3>
          <p>Bank-level encryption • SOC 2 compliant • GDPR compliant • No data selling</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to amplify your impact?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of donors making their giving count.
          </p>
          <div className={styles.ctaActions}>
            <Link to="/signup" className={styles.primaryCta}>
              Start Free Today
              <RiArrowRightLine className={styles.ctaIcon} />
            </Link>
            <a href="#demo" className={styles.secondaryCta}>
              Schedule Demo
            </a>
          </div>
          <p className={styles.ctaNote}>No credit card required • Set up in under 2 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerMain}>
            <div className={styles.footerBrand}>
              <img src={logoSvg} alt="Do-Nation" className={styles.footerLogo} />
              <p>Making charitable giving smarter, easier, and more impactful.</p>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.footerColumn}>
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#security">Security</a>
              </div>
              <div className={styles.footerColumn}>
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#careers">Careers</a>
                <a href="#blog">Blog</a>
              </div>
              <div className={styles.footerColumn}>
                <h4>Support</h4>
                <a href="#help">Help Center</a>
                <a href="#contact">Contact</a>
                <a href="#api">API Docs</a>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <div className={styles.footerLegal}>
              <p>&copy; 2024 Do-Nation. All rights reserved.</p>
              <a href="/privacy_policy.html">Privacy Policy</a>
              <a href="/terms_of_service.html">Terms of Service</a>
            </div>
            <div className={styles.socialIcons}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <RiFacebookFill />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <RiTwitterFill />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <RiInstagramFill />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;