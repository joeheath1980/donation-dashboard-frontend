import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './CarouselComponent.module.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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

const CarouselComponent = ({ items }) => {
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
          {items.map((item, index) => (
            <div key={index} className={styles.carouselItemWrapper}>
              <div className={styles.carouselItem}>
                {item.content}
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default CarouselComponent;