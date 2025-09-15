import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiServices from '../services/api.service';
import styles from './WelcomePage.module.css';
import './SharedStyles.css';
import logoSvg from '../assets/logodark.png';
import heroImage from '../assets/joe1980_light_trails_tracing_the_activity_of_two_young_people_b68a16e7-3e53-4c8b-b824-9edc7aa00c80_0.png';
import impactImage from '../assets/22849491-979d-4fb2-b7a9-9857db6dcb82.jpeg';
import { API_CONFIG } from '../config/api.config';
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
        const api = apiServices.client;
        const response = await api.get(`/api/platform-stats`);
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
            {/* Pricing hidden during beta */}
          <Link to="/login" className={styles.loginButton}>Log In</Link>
            <Link to="/signup" className={styles.signupButton}>Request Access</Link>
          </nav>
        </div>
      </header>

      {/* Beta Banner */}
      <div className={styles.betaBanner}>
        We’re in beta. To request access, email
        {' '}<a href="mailto:joeheath@do-nation.space">joeheath@do-nation.space</a>.
      </div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Transform Your Giving.<br/>
              <span className={styles.heroTitleGradient}>Amplify Your Impact.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              The intelligent donation platform that helps you track your charitable giving,
              helps unlock corporate matching, and shows your real impact — all in one place.
            </p>
            <div className={styles.heroActions}>
              <Link to="/signup" className={styles.primaryCta}>
                Request Beta Access
                <RiArrowRightLine className={styles.ctaIcon} />
              </Link>
              <a href="#demo" className={styles.secondaryCta}>
                See How It Works
              </a>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>Matching, simplified</span>
                <span className={styles.heroStatLabel}>Guidance to help access employer programs</span>
              </div>
              <div className={styles.heroStatDivider}></div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>Quick setup</span>
                <span className={styles.heroStatLabel}>Get started quickly</span>
              </div>
            </div>
          </div>
          <div className={styles.heroImageContainer}>
            <img src={heroImage} alt="Impact Dashboard" className={styles.heroImage} />
          </div>
        </div>
      </section>

      {/* Trust/Status Indicators */}
      <section className={styles.trustSection}>
        <div className={styles.trustContent}>
          <p className={styles.trustText}>Private beta underway with early users</p>
          <div className={styles.trustLogos}>
            {/* Placeholder for partner logos */}
            <div className={styles.trustLogo}>Early User</div>
            <div className={styles.trustLogo}>Early User</div>
            <div className={styles.trustLogo}>Early User</div>
            <div className={styles.trustLogo}>Early User</div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Everything you need to maximise your impact</h2>
          <p className={styles.sectionSubtitle}>
            One platform. Complete visibility. Maximum impact.
          </p>
          <p className={styles.betaNote}>Beta: Some features are limited while we finish testing.</p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <RiRobotLine className={styles.featureIcon} />
            </div>
            <h3 className={styles.featureTitle}>Automated Donation Tracking</h3>
            <p className={styles.featureDescription}>
              Simply forward receipts to your unique email or connect your inbox.
              Our AI extracts details, categorises giving, and builds your complete history.
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
              Discover and track matching opportunities with less effort. Matching features are in active beta.
            </p>
            <ul className={styles.featureList}>
              <li><RiCheckLine /> Matching discovery and guidance</li>
              <li><RiCheckLine /> Notifications for key steps</li>
              <li><RiCheckLine /> Progress tracking</li>
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
              and optimise your giving strategy.
            </p>
            <ul className={styles.featureList}>
              <li><RiCheckLine /> Charity recommendations</li>
              <li><RiCheckLine /> Tax optimisation tips</li>
              <li><RiCheckLine /> Personalised insights</li>
            </ul>
          </div>
        </div>
      </section>


      {/* Why Do-Nation Section */}
      <section className={styles.whySection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Why choose Do-Nation?</h2>
          <p className={styles.sectionSubtitle}>
            We're building the future of charitable giving, one feature at a time
          </p>
        </div>
        <div className={styles.whyGrid}>
          <div className={styles.whyCard}>
            <RiMailLine className={styles.whyIcon} />
            <h3>Effortless Tracking</h3>
            <p>Just forward receipts to your unique email. We handle the rest automatically.</p>
          </div>
          <div className={styles.whyCard}>
            <RiTrophyLine className={styles.whyIcon} />
            <h3>Gamified Giving</h3>
            <p>Earn achievements, track streaks, and celebrate milestones as you give.</p>
          </div>
          <div className={styles.whyCard}>
            <RiPieChartLine className={styles.whyIcon} />
            <h3>Clear Impact</h3>
            <p>See exactly where your money goes and the difference you're making.</p>
          </div>
          <div className={styles.whyCard}>
            <RiRefreshLine className={styles.whyIcon} />
            <h3>Tax Ready</h3>
            <p>Generate comprehensive reports for Gift Aid claims and tax returns instantly.</p>
          </div>
        </div>
      </section>

      {/* Visual Impact Section */}
      <section className={styles.visualImpact}>
        <div className={styles.visualImpactContent}>
          <div className={styles.visualImpactText}>
            <h2 className={styles.visualImpactTitle}>See Your Impact Come to Life</h2>
            <p className={styles.visualImpactDescription}>
              Every donation creates ripples of change. Track your giving journey with beautiful visualisations
              that show how your contributions grow into meaningful impact over time.
            </p>
            <div className={styles.visualImpactFeatures}>
              <div className={styles.visualImpactFeature}>
                <RiBarChartLine className={styles.visualImpactIcon} />
                <span>Real-time impact tracking</span>
              </div>
              <div className={styles.visualImpactFeature}>
                <RiTrophyLine className={styles.visualImpactIcon} />
                <span>Achievement milestones</span>
              </div>
              <div className={styles.visualImpactFeature}>
                <RiHeartLine className={styles.visualImpactIcon} />
                <span>Community impact scores</span>
              </div>
            </div>
          </div>
          <div className={styles.visualImpactImageContainer}>
            <img src={impactImage} alt="Visualise Your Impact" className={styles.visualImpactImage} />
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
            <p>Your complete giving command centre. Track donations, earn achievements, create campaigns.</p>
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


      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        </div>
        <div className={styles.faqContainer}>
          <div className={styles.faqItem}>
            <h3>How does the beta work?</h3>
            <p>We're currently in private beta, onboarding users gradually to ensure a great experience. Request access and we'll be in touch within 48 hours.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>Is it really free?</h3>
            <p>Yes! During beta, all features are completely free. We're focused on building the best platform for charitable giving.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>How do you track my donations?</h3>
            <p>Simply forward your donation receipts to your unique Do-Nation email address, or connect your inbox for automatic scanning. Our AI extracts the details securely.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>Which charities are supported?</h3>
            <p>We support all registered UK charities and major international organisations. If your favourite charity isn't listed, we'll add it for you.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>How does corporate matching work?</h3>
            <p>We help you discover if your employer offers donation matching, guide you through the application process, and track your matching funds automatically.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>Is my data secure?</h3>
            <p>Absolutely. We use bank-level encryption, never sell your data, and you can delete everything at any time. Read our privacy policy for full details.</p>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className={styles.security}>
        <div className={styles.securityContent}>
          <RiShieldCheckLine className={styles.securityIcon} />
          <div>
            <h3>Your data, protected</h3>
            <p>Bank-level encryption • Privacy-first design • GDPR compliant • No data selling</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to amplify your impact?</h2>
          <p className={styles.ctaSubtitle}>Join our beta community of early users.</p>
          <div className={styles.ctaActions}>
            <Link to="/signup" className={styles.primaryCta}>
              Request Access
              <RiArrowRightLine className={styles.ctaIcon} />
            </Link>
            <a href="#demo" className={styles.secondaryCta}>
              Schedule Demo
            </a>
          </div>
          <p className={styles.ctaNote}>Beta access by request • Setup in minutes</p>
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
                {/* Pricing hidden during beta */}
                <a href="#about">Roadmap</a>
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
                <a href="#help">Help Centre</a>
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
