import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from '../Carousel.module.css';
import { FaHeart, FaBook, FaTree, FaHandHoldingHeart, FaGlobeAmericas } from 'react-icons/fa';

const getIcon = (title) => {
  if (title.toLowerCase().includes('health')) return FaHeart;
  if (title.toLowerCase().includes('education')) return FaBook;
  if (title.toLowerCase().includes('environment')) return FaTree;
  if (title.toLowerCase().includes('humanitarian')) return FaHandHoldingHeart;
  return FaGlobeAmericas;
};

const CarouselComponent = ({ title, items }) => {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
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
      <h2 className={styles.carouselTitle}>{title}</h2>
      <div className={styles.carouselWrapper}>
        <Slider {...settings}>
          {items.map((item, index) => {
            const Icon = getIcon(item.title);
            return (
              <div key={index} className={styles.carouselItemWrapper}>
                <div className={styles.carouselItem}>
                  <Icon className={styles.itemIcon} />
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