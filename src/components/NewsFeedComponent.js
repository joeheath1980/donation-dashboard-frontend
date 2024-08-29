import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../NewsFeed.module.css'; // Create this CSS module

function NewsFeedComponent() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      const token = localStorage.getItem('token');
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:3002/api/news/personalized', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const fetchedNews = response.data;
        console.log('News fetched:', fetchedNews);
        setNews(fetchedNews);
      } catch (error) {
        console.error('Error fetching news:', error.message);
        setError('Failed to load news. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (isLoading) return <div className={styles.loading}>Loading news...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.newsFeed}>
      <h3 className={styles.newsFeedTitle}>Cause Feed</h3>
      {news.length > 0 ? (
        <ul className={styles.newsList}>
          {news.map((article, index) => (
            <li key={index} className={styles.newsItem}>
              <h4 className={styles.newsItemTitle}>{article.title}</h4>
              <p className={styles.newsItemContent}>{article.content}</p>
              <a href={article.link} className={styles.newsItemLink}>Read more</a>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.noNews}>No news available.</p>
      )}
    </div>
  );
}

export default NewsFeedComponent;
