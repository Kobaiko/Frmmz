
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eye, Users, Circle } from "lucide-react";

interface User {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  status: 'online' | 'away' | 'offline';
  currentAsset?: string;
  lastSeen: Date;
}

interface PresenceSystemProps {
  currentAssetId?: string;
  onUserClick?: (userId: string) => void;
}

export const PresenceSystem = ({ currentAssetId, onUserClick }: PresenceSystemProps) => {
  const [activeUsers, setActiveUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Alex Chen',
      color: '#FF6B6B',
      status: 'online',
      currentAsset: currentAssetId,
      lastSeen: new Date()
    },
    {
      id: '2',
      name: 'Sarah Kim',
      color: '#4ECDC4',
      status: 'online',
      currentAsset: currentAssetId,
      lastSeen: new Date()
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      color: '#45B7D1',
      status: 'away',
      lastSeen: new Date(Date.now() - 300000) // 5 minutes ago
    }
  ]);

  const getCurrentViewers = () => {
    return activeUsers.filter(user => 
      user.status === 'online' && user.currentAsset === currentAssetId
    );
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
    }
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const currentViewers = getCurrentViewers();

  return (
    <div className="space-y-4">
      {/* Current Viewers */}
      {currentAssetId && currentViewers.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Eye className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-white">
              Currently Viewing ({currentViewers.length})
            </span>
          </div>
          
          <div className="flex -space-x-2">
            {currentViewers.map((user) => (
              <div
                key={user.id}
                className="relative cursor-pointer hover:z-10 transition-transform hover:scale-110"
                onClick={() => onUserClick?.(user.id)}
              >
                <Avatar className="h-8 w-8 border-2 border-gray-700">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback 
                    className="text-white text-xs"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(user.status)}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Team Members */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Users className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-white">
            Team Members ({activeUsers.length})
          </span>
        </div>
        
        <div className="space-y-2">
          {activeUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-700 cursor-pointer"
              onClick={() => onUserClick?.(user.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback 
                      className="text-white text-xs"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Circle 
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${getStatusColor(user.status)} rounded-full border border-gray-800`}
                  />
                </div>
                <span className="text-sm text-white">{user.name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {user.currentAsset === currentAssetId && user.status === 'online' && (
                  <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                    Viewing
                  </Badge>
                )}
                <span className="text-xs text-gray-400">
                  {formatLastSeen(user.lastSeen)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
