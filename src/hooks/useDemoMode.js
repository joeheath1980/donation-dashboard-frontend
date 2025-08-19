import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

export const useDemoMode = () => {
  const [demoMode, setDemoMode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDemoStatus = async () => {
      try {
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/api/demo/status`
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