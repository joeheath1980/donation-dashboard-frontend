import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './CarouselComponent.module.css';
import { FaSpinner, FaBuilding, FaHandHoldingHeart, FaDollarSign, FaBullseye } from 'react-icons/fa';

const CarouselComponent = ({ items, isLoading, error }) => {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <FaSpinner className={styles.spinner} />
        <p>Finding matching opportunities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <h3>Unable to Load Matching Opportunities</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateContent}>
          <h3>No Matching Opportunities Available</h3>
          <p>We're working on finding matching opportunities that align with your interests. Check back soon!</p>
          <div className={styles.emptyStateTips}>
            <h4>Tips to Find More Matches:</h4>
            <ul>
              <li>Add or update your preferred causes in your profile</li>
              <li>Follow charities that interest you</li>
              <li>Make sure your cause areas match the available opportunities</li>
              <li>Check back regularly as new opportunities are added daily</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.carouselWrapper}>
        <Slider {...settings}>
          {items.map((item, index) => (
            <div key={item.id || index} className={styles.carouselItemWrapper}>
              <div className={styles.carouselItem}>
                <div className={styles.brandSection}>
                  <FaBuilding className={styles.icon} />
                  <h3 className={styles.brandName}>{item.businessName}</h3>
                </div>
                
                <div className={styles.charitySection}>
                  <FaHandHoldingHeart className={styles.icon} />
                  <div className={styles.charityName}>{item.charity || 'Any eligible charity'}</div>
                </div>

                <div className={styles.matchSection}>
                  <FaDollarSign className={styles.icon} />
                  <div className={styles.matchAmount}>
                    <span className={styles.amount}>{item.contribution}</span>
                    <span className={styles.multiplier}>({item.multiplier} Match)</span>
                  </div>
                </div>

                <div className={styles.causeSection}>
                  <FaBullseye className={styles.icon} />
                  <div className={styles.causeDescription}>
                    {item.causeDescription || `Supporting ${item.cause?.toLowerCase() || 'various'} initiatives`}
                  </div>
                </div>

                <div className={styles.validitySection}>
                  <div className={styles.validUntil}>Valid until {item.validUntil}</div>
                </div>

                <div className={styles.buttonWrapper}>
                  {item.onMatch ? (
                    <button 
                      className={`${styles.matchButton} ${item.accepted ? styles.matchedButton : ''}`} 
                      onClick={item.onMatch} 
                      disabled={item.accepted}
                    >
                      {item.accepted ? 'Matched' : 'Match'}
                    </button>
                  ) : (
                    <a href={item.projectLink} className={styles.learnMoreButton} target="_blank" rel="noopener noreferrer">
                      Learn More
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} ${styles.slickArrow} ${styles.slickPrev}`}
      style={{ ...style, display: 'block' }}
      onClick={onClick}
    />
  );
};

const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} ${styles.slickArrow} ${styles.slickNext}`}
      style={{ ...style, display: 'block' }}
      onClick={onClick}
    />
  );
};

export default CarouselComponent;