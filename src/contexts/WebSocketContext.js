import React, { createContext, useContext, useEffect, useRef } from 'react';
import websocketService from '../services/websocketService';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

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
          if (data.type === 'budget_low') {
            toast.warning(
              <div>
                <strong>⚠️ Campaign Budget Low</strong>
                <p>{data.campaignName} has only ${data.remainingBudget} left!</p>
              </div>,
              { position: 'top-right', autoClose: 5000 }
            );
          } else {
            toast.info(
              <div>
                <strong>📢 Campaign Update</strong>
                <p>{data.message}</p>
              </div>,
              { position: 'top-right', autoClose: 5000 }
            );
          }
        });

        const unsubscribeBudget = websocketService.on('budgetAlert', (data) => {
          toast.warning(
            <div>
              <strong>💰 Budget Alert</strong>
              <p>Campaign "{data.campaignName}" is {data.percentage}% depleted</p>
            </div>,
            { position: 'top-right', autoClose: 5000 }
          );
        });

        const unsubscribeStreak = websocketService.on('streakUpdate', (data) => {
          if (data.milestone) {
            toast.success(
              <div>
                <strong>🔥 Streak Milestone!</strong>
                <p>You've reached a {data.currentStreak} day giving streak!</p>
              </div>,
              { position: 'top-center', autoClose: 6000 }
            );
          }
        });

        // Cleanup function
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