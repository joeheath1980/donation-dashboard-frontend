import io from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(authToken) {
    const wsUrl = process.env.REACT_APP_WEBSOCKET_URL || process.env.REACT_APP_API_URL || 'http://localhost:3002';
    
    this.socket = io(wsUrl, {
      auth: { token: authToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('donation:matched', (data) => {
      this.emit('matchNotification', data);
    });

    this.socket.on('campaign:update', (data) => {
      this.emit('campaignUpdate', data);
    });

    this.socket.on('budget:alert', (data) => {
      this.emit('budgetAlert', data);
    });

    this.socket.on('streak:update', (data) => {
      this.emit('streakUpdate', data);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  subscribeToCampaign(campaignId) {
    if (this.socket) {
      this.socket.emit('subscribe:campaign', campaignId);
    }
  }

  unsubscribeFromCampaign(campaignId) {
    if (this.socket) {
      this.socket.emit('unsubscribe:campaign', campaignId);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  off(event, callback) {
    const callbacks = this.listeners.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in WebSocket listener for ${event}:`, error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export default new WebSocketService();