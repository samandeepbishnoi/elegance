import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: string;
}

interface RealtimeContextType {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastEvent: RealtimeEvent | null;
  subscribe: (eventType: string, callback: (data: any) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const subscribersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 1000; // 1 second

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  // Check if current page should auto-refresh on updates
  const shouldAutoRefresh = useCallback(() => {
    const pathname = window.location.pathname;
    // Don't refresh admin pages
    const adminPages = ['/admin/login', '/admin/register', '/admin/dashboard'];
    return !adminPages.includes(pathname);
  }, []);

  // Auto-refresh page on specific events
  const handleAutoRefresh = useCallback((eventType: string) => {
    if (!shouldAutoRefresh()) {
      console.log('[SSE] Skipping auto-refresh on admin page');
      return;
    }

    console.log(`[SSE] Auto-refreshing page due to ${eventType}`);
    // Small delay to ensure the backend has finished the operation
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }, [shouldAutoRefresh]);

  // Subscribe to specific event types
  const subscribe = useCallback((eventType: string, callback: (data: any) => void) => {
    if (!subscribersRef.current.has(eventType)) {
      subscribersRef.current.set(eventType, new Set());
    }
    subscribersRef.current.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = subscribersRef.current.get(eventType);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          subscribersRef.current.delete(eventType);
        }
      }
    };
  }, []);

  // Notify subscribers of an event
  const notifySubscribers = useCallback((eventType: string, data: any) => {
    const subscribers = subscribersRef.current.get(eventType);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[SSE] Error in subscriber callback for ${eventType}:`, error);
        }
      });
    }
  }, []);

  // Connect to SSE
  const connect = useCallback(() => {
    // Don't reconnect if already connected or connecting
    if (eventSourceRef.current && eventSourceRef.current.readyState !== EventSource.CLOSED) {
      return;
    }

    console.log('[SSE] Connecting to server...');
    setConnectionStatus('connecting');

    const eventSource = new EventSource(`${backendUrl}/api/stream/updates`, {
      withCredentials: true,
    });

    eventSource.onopen = () => {
      console.log('[SSE] Connection established');
      setIsConnected(true);
      setConnectionStatus('connected');
      reconnectAttemptsRef.current = 0; // Reset reconnect attempts on success
    };

    eventSource.onerror = (error) => {
      console.error('[SSE] Connection error:', error);
      setIsConnected(false);
      setConnectionStatus('error');
      eventSource.close();

      // Attempt to reconnect with exponential backoff
      const delay = Math.min(
        baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current),
        30000 // Max 30 seconds
      );

      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        console.error('[SSE] Max reconnection attempts reached');
        setConnectionStatus('disconnected');
      }
    };

    // Handle connection established event
    eventSource.addEventListener('connected', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      console.log('[SSE] Connected:', data);
    });

    // Handle heartbeat events
    eventSource.addEventListener('heartbeat', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      console.log('[SSE] Heartbeat:', data);
    });

    // Handle store status events
    eventSource.addEventListener('store_status', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      console.log('[SSE] Store status update:', data);
      
      const event: RealtimeEvent = { type: 'store_status', data, timestamp: data.timestamp };
      setLastEvent(event);
      notifySubscribers('store_status', data);
      
      // Auto-refresh page
      handleAutoRefresh('store_status');
    });

    // Handle product update events
    eventSource.addEventListener('product_update', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      console.log('[SSE] Product update:', data);
      
      const event: RealtimeEvent = { type: 'product_update', data, timestamp: data.timestamp };
      setLastEvent(event);
      notifySubscribers('product_update', data);
      
      // Auto-refresh page
      handleAutoRefresh('product_update');
    });

    // Handle discount update events
    eventSource.addEventListener('discount_update', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      console.log('[SSE] Discount update:', data);
      
      const event: RealtimeEvent = { type: 'discount_update', data, timestamp: data.timestamp };
      setLastEvent(event);
      notifySubscribers('discount_update', data);
      
      // Auto-refresh page
      handleAutoRefresh('discount_update');
    });

    // Handle coupon update events
    eventSource.addEventListener('coupon_update', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      console.log('[SSE] Coupon update:', data);
      
      const event: RealtimeEvent = { type: 'coupon_update', data, timestamp: data.timestamp };
      setLastEvent(event);
      notifySubscribers('coupon_update', data);
      
      // Auto-refresh page (only if on checkout/cart page)
      const pathname = window.location.pathname;
      if (pathname === '/checkout' || pathname === '/cart') {
        handleAutoRefresh('coupon_update');
      }
    });

    eventSourceRef.current = eventSource;
  }, [backendUrl, notifySubscribers, handleAutoRefresh]);

  // Disconnect from SSE
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      console.log('[SSE] Disconnecting...');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  // Initialize connection on mount
  useEffect(() => {
    connect();

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[SSE] Page hidden, maintaining connection');
      } else {
        console.log('[SSE] Page visible, checking connection');
        if (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED) {
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connect, disconnect]);

  const value: RealtimeContextType = {
    isConnected,
    connectionStatus,
    lastEvent,
    subscribe,
  };

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
