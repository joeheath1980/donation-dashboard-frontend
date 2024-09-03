import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002'; // Make sure this matches your backend server port

// Search for tweets from specific charities
export const searchTweets = async (charityNames, retries = 3) => {
  console.log('Searching for tweets with charities:', charityNames);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/search-tweets`, { charityNames });
      const tweets = response.data;

      console.log('Processed tweets:', tweets);
      return tweets;
    } catch (error) {
      console.error(`Error fetching tweets (Attempt ${attempt}/${retries}):`, error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      if (attempt === retries) {
        throw error; // Rethrow the error after all retries have failed
      }
      // Wait for 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};
