
import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
}

interface UserPresence {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'viewing' | 'commenting' | 'editing' | 'idle';
  lastSeen: Date;
  currentAsset?: string;
  cursorPosition?: { x: number; y: number };
  isTyping?: boolean;
  color: string;
}

interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  userName: string;
  userColor: string;
  timestamp: number;
}

interface RealtimeCollaborationState {
  users: UserPresence[];
  cursors: CursorPosition[];
  currentUser: User;
  isConnected: boolean;
}

export const useRealtimeCollaboration = (projectId: string, currentUser: User) => {
  const [state, setState] = useState<RealtimeCollaborationState>({
    users: [],
    cursors: [],
    currentUser,
    isConnected: false
  });

  // Simulate WebSocket connection
  useEffect(() => {
    console.log(`Connecting to real-time collaboration for project: ${projectId}`);
    
    // Simulate connection delay
    const connectTimer = setTimeout(() => {
      setState(prev => ({ ...prev, isConnected: true }));
      console.log('Real-time collaboration connected');
    }, 1000);

    // Simulate other users joining
    const mockUsers: UserPresence[] = [
      {
        id: 'user-1',
        name: 'Sarah Chen',
        email: 'sarah@studio.com',
        status: 'viewing',
        lastSeen: new Date(),
        currentAsset: 'video-001',
        color: '#FF6B6B'
      },
      {
        id: 'user-2',
        name: 'Mike Johnson',
        email: 'mike@client.com',
        status: 'commenting',
        lastSeen: new Date(Date.now() - 2 * 60 * 1000),
        currentAsset: 'video-001',
        color: '#4ECDC4'
      },
      {
        id: 'user-3',
        name: 'Emma Wilson',
        email: 'emma@agency.com',
        status: 'editing',
        lastSeen: new Date(Date.now() - 30 * 1000),
        color: '#45B7D1'
      }
    ];

    const userTimer = setTimeout(() => {
      setState(prev => ({ ...prev, users: mockUsers }));
    }, 2000);

    return () => {
      clearTimeout(connectTimer);
      clearTimeout(userTimer);
      console.log('Real-time collaboration disconnected');
    };
  }, [projectId]);

  const updateUserStatus = useCallback((status: UserPresence['status']) => {
    console.log(`User status updated: ${status}`);
    // In a real implementation, this would send the status to the server
  }, []);

  const updateCursorPosition = useCallback((x: number, y: number) => {
    const newCursor: CursorPosition = {
      x,
      y,
      userId: currentUser.id,
      userName: currentUser.name,
      userColor: currentUser.color,
      timestamp: Date.now()
    };
    
    setState(prev => ({
      ...prev,
      cursors: [
        ...prev.cursors.filter(cursor => cursor.userId !== currentUser.id),
        newCursor
      ]
    }));
  }, [currentUser]);

  const setTypingStatus = useCallback((isTyping: boolean) => {
    console.log(`Typing status: ${isTyping}`);
    // In a real implementation, this would broadcast typing status
  }, []);

  const broadcastActivity = useCallback((type: string, data: any) => {
    console.log(`Broadcasting activity: ${type}`, data);
    // In a real implementation, this would send activity to other users
  }, []);

  return {
    ...state,
    updateUserStatus,
    updateCursorPosition,
    setTypingStatus,
    broadcastActivity
  };
};
