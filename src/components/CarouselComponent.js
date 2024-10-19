import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './CarouselComponent.module.css';

const CarouselComponent = ({ items }) => {
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

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.carouselWrapper}>
        <Slider {...settings}>
          {items.map((item, index) => (
            <div key={index} className={styles.carouselItemWrapper}>
              <div className={styles.carouselItem}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <div className={styles.itemContent}>
                  <div className={styles.charityLabel}>Charity</div>
                  <div className={styles.charityName}>{item.charity}</div>
                  <div className={styles.contributionLabel}>Your Contribution</div>
                  <div className={styles.contributionAmount}>{item.contribution}</div>
                  <div className={styles.multiplierLabel}>Multiplier</div>
                  <div className={styles.multiplierValue}>{item.multiplier}</div>
                  <div className={styles.validUntilLabel}>Valid Until</div>
                  <div className={styles.validUntilDate}>{item.validUntil}</div>
                </div>
                <div className={styles.buttonWrapper}>
                  {item.onMatch ? (
                    <button className={styles.matchButton} onClick={item.onMatch} disabled={item.accepted}>
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