import React, { createContext, useContext, useEffect, useRef } from 'react';
import websocketService from '../services/websocketService';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const { user, isAuthenticated, getAuthHeaders } = useAuth();
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && user && !isConnectedRef.current) {
      // Extract token from auth headers
      const headers = getAuthHeaders();
      const authHeader = headers.Authorization || headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (token) {
        websocketService.connect(token);
        isConnectedRef.current = true;

        // Set up global notification handlers
        const unsubscribeMatch = websocketService.on('matchNotification', (data) => {
          toast.success(
            <div>
              <strong>🎉 Your donation was matched!</strong>
              <p>{data.businessName} matched your ${data.donationAmount} with ${data.matchAmount}!</p>
            </div>,
            { 
              position: 'top-right', 
              autoClose: 8000
            }
          );
        });

        const unsubscribeCampaign = websocketService.on('campaignUpdate', (data) => {
          toast.info(`Campaign update: ${data.message}`, {
            position: 'top-right',
            autoClose: 5000
          });
        });

        const unsubscribeBudget = websocketService.on('budgetAlert', (data) => {
          toast.warning(
            `Campaign "${data.campaignName}" is ${data.percentage}% depleted`,
            {
              position: 'top-right',
              autoClose: 7000
            }
          );
        });

        const unsubscribeStreak = websocketService.on('streakUpdate', (data) => {
          toast.success(
            `🔥 Streak updated! Current: ${data.current} days`,
            {
              position: 'bottom-right',
              autoClose: 5000
            }
          );
        });

        // Cleanup on unmount
        return () => {
          unsubscribeMatch();
          unsubscribeCampaign();
          unsubscribeBudget();
          unsubscribeStreak();
          websocketService.disconnect();
          isConnectedRef.current = false;
        };
      }
    }
  }, [isAuthenticated, user, getAuthHeaders]);

  return (
    <WebSocketContext.Provider value={websocketService}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};