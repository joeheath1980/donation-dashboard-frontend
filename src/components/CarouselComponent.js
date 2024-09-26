import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './CarouselComponent.module.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const getIcon = (title) => {
  if (title.toLowerCase().includes('health')) return 'heart';
  if (title.toLowerCase().includes('education')) return 'book';
  if (title.toLowerCase().includes('environment')) return 'tree';
  if (title.toLowerCase().includes('humanitarian')) return 'hands-helping';
  return 'globe';
};

const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div className={`${className} ${styles.arrow} ${styles.nextArrow}`} onClick={onClick}>
      <FaChevronRight />
    </div>
  );
};

const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div className={`${className} ${styles.arrow} ${styles.prevArrow}`} onClick={onClick}>
      <FaChevronLeft />
    </div>
  );
};

const CarouselComponent = ({ title, items }) => {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
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
          {items.map((item, index) => {
            const iconName = getIcon(item.title);
            return (
              <div key={index} className={styles.carouselItemWrapper}>
                <div className={styles.carouselItem}>
                  <i className={`fas fa-${iconName} ${styles.itemIcon}`}></i>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className={styles.itemDescription}>{item.description.split(' ').slice(0, 15).join(' ')}...</p>
                  <a href={item.link} className={styles.readMoreLink}>Learn More</a>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>
    </div>
  );
};

export default CarouselComponent;