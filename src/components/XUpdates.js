import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const XIntegration = ({ user }) => {
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    // Function to fetch tweets from your backend
    const fetchTweets = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/tweets');
        const data = await response.json();
        setTweets(data);
      } catch (error) {
        console.error('Error fetching tweets:', error);
      }
    };

    fetchTweets();
  }, [user]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Latest Updates from Your Charities on X</h2>
      {tweets.map((tweet) => (
        <Card key={tweet.id}>
          <CardHeader>
            <CardTitle>{tweet.author.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{tweet.text}</p>
            <a 
              href={`https://twitter.com/${tweet.author.username}/status/${tweet.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View on X
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default XIntegration;