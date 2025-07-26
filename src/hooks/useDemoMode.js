import { useState, useEffect } from 'react';
import axios from 'axios';

export const useDemoMode = () => {
  const [demoMode, setDemoMode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDemoStatus = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/demo/status`
        );
        setDemoMode(response.data);
      } catch (error) {
        console.error('Error fetching demo mode status:', error);
        setDemoMode({ enabled: false });
      } finally {
        setLoading(false);
      }
    };

    fetchDemoStatus();
  }, []);

  return { demoMode, loading };
};