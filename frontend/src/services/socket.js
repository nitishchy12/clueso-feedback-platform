import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(userId = null) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners(userId);
    
    return this.socket;
  }

  setupEventListeners(userId) {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 Connected to server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Join user-specific room for dashboard updates
      if (userId) {
        this.socket.emit('join-dashboard', userId);
      }
      
      // Show success toast only after reconnection
      if (this.reconnectAttempts > 0) {
        toast.success('Reconnected to server');
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from server:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error('Unable to connect to server. Please refresh the page.');
      }
    });

    // Feedback events
    this.socket.on('feedback:new', (data) => {
      console.log('📝 New feedback received:', data);
      
      // Show notification
      toast.success(`New ${data.category} feedback from ${data.user.name}`);
      
      // Notify listeners
      this.notifyListeners('feedback:new', data);
    });

    this.socket.on('feedback:updated', (data) => {
      console.log('📝 Feedback updated:', data);
      
      // Notify listeners
      this.notifyListeners('feedback:updated', data);
    });

    this.socket.on('feedback:deleted', (data) => {
      console.log('📝 Feedback deleted:', data);
      
      // Notify listeners
      this.notifyListeners('feedback:deleted', data);
    });

    // Dashboard events
    this.socket.on('dashboard:update', (data) => {
      console.log('📊 Dashboard update:', data);
      
      // Notify listeners
      this.notifyListeners('dashboard:update', data);
    });
  }

  // Subscribe to events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  // Unsubscribe from events
  off(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  // Notify all listeners for an event
  notifyListeners(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Emit events to server
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  }

  // Join a specific room
  joinRoom(room) {
    this.emit('join-room', room);
  }

  // Leave a specific room
  leaveRoom(room) {
    this.emit('leave-room', room);
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socket: this.socket,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Force reconnection
  reconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.connect();
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

// React hook for using socket in components
export const useSocket = () => {
  return socketService;
};

// Higher-order component for socket connection
export const withSocket = (WrappedComponent) => {
  return function SocketWrapper(props) {
    return <WrappedComponent {...props} socket={socketService} />;
  };
};

export default socketService;