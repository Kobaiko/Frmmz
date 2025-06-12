
import { useState, useEffect, useCallback } from "react";

interface RealtimeEvent {
  type: 'comment_added' | 'user_joined' | 'user_left' | 'playback_sync' | 'cursor_moved';
  data: any;
  userId: string;
  timestamp: number;
}

interface UseRealtimeSyncProps {
  roomId: string;
  userId: string;
  onEvent?: (event: RealtimeEvent) => void;
}

export const useRealtimeSync = ({ roomId, userId, onEvent }: UseRealtimeSyncProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');

  // Simulate WebSocket connection
  useEffect(() => {
    console.log(`🔗 Connecting to real-time room: ${roomId}`);
    
    // Simulate connection delay
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
      setActiveUsers([userId, 'user_2', 'user_3']);
      console.log('✅ Real-time connection established');
    }, 1000);

    // Simulate periodic events
    const eventTimer = setInterval(() => {
      const events: RealtimeEvent[] = [
        {
          type: 'user_joined',
          data: { name: 'New User' },
          userId: 'user_' + Math.random().toString(36).substr(2, 5),
          timestamp: Date.now()
        },
        {
          type: 'comment_added',
          data: { 
            comment: 'Great scene!', 
            timestamp: Math.random() * 120,
            content: 'This is a sample real-time comment'
          },
          userId: 'user_2',
          timestamp: Date.now()
        }
      ];

      const randomEvent = events[Math.floor(Math.random() * events.length)];
      onEvent?.(randomEvent);
    }, 15000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(eventTimer);
      setIsConnected(false);
      console.log('🔌 Disconnected from real-time room');
    };
  }, [roomId, userId, onEvent]);

  const sendEvent = useCallback((event: Omit<RealtimeEvent, 'userId' | 'timestamp'>) => {
    if (!isConnected) {
      console.warn('Cannot send event: not connected to real-time room');
      return;
    }

    const fullEvent: RealtimeEvent = {
      ...event,
      userId,
      timestamp: Date.now()
    };

    console.log('📤 Sending real-time event:', fullEvent);
    
    // Simulate sending to other users
    setTimeout(() => {
      onEvent?.(fullEvent);
    }, 100);
  }, [isConnected, userId, onEvent]);

  const syncPlayback = useCallback((currentTime: number, isPlaying: boolean) => {
    sendEvent({
      type: 'playback_sync',
      data: { currentTime, isPlaying }
    });
  }, [sendEvent]);

  const broadcastCursor = useCallback((position: { x: number; y: number }) => {
    sendEvent({
      type: 'cursor_moved',
      data: position
    });
  }, [sendEvent]);

  return {
    isConnected,
    activeUsers,
    connectionQuality,
    sendEvent,
    syncPlayback,
    broadcastCursor
  };
};
