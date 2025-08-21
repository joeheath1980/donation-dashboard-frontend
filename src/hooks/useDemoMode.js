import { useState, useEffect } from 'react';
import apiServices from '../services/api.service';
import { API_CONFIG } from '../config/api.config';

export const useDemoMode = () => {
  const [demoMode, setDemoMode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDemoStatus = async () => {
      try {
        const api = apiServices.client;
        const response = await api.get(`/api/demo/status`);
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
