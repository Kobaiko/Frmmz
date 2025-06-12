
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { Users, Eye, MessageCircle, Edit } from "lucide-react";

interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'viewing' | 'commenting' | 'editing';
  cursor?: { x: number; y: number };
}

interface RealtimePresenceProps {
  projectId: string;
  currentUserId: string;
}

export const RealtimePresence = ({ projectId, currentUserId }: RealtimePresenceProps) => {
  const [activeUsers, setActiveUsers] = useState<User[]>([
    {
      id: 'user_1',
      name: 'Sarah Chen',
      status: 'viewing'
    },
    {
      id: 'user_2', 
      name: 'Mike Rodriguez',
      status: 'commenting'
    },
    {
      id: 'user_3',
      name: 'Alex Kim',
      status: 'editing'
    }
  ]);

  const { isConnected, connectionQuality } = useRealtimeSync({
    roomId: projectId,
    userId: currentUserId,
    onEvent: (event) => {
      console.log('Real-time event:', event);
    }
  });

  const getStatusIcon = (status: User['status']) => {
    switch (status) {
      case 'viewing': return <Eye className="h-3 w-3" />;
      case 'commenting': return <MessageCircle className="h-3 w-3" />;
      case 'editing': return <Edit className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'viewing': return 'bg-blue-600';
      case 'commenting': return 'bg-green-600';
      case 'editing': return 'bg-pink-600';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className="text-xs text-gray-400">
          {connectionQuality === 'excellent' ? 'Live' : connectionQuality}
        </span>
      </div>

      {/* Active Users */}
      <div className="flex items-center space-x-1">
        <Users className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-400">{activeUsers.length}</span>
      </div>

      {/* User Avatars */}
      <div className="flex -space-x-2">
        {activeUsers.slice(0, 4).map((user) => (
          <div key={user.id} className="relative group">
            <Avatar className="h-8 w-8 border-2 border-gray-800">
              <AvatarFallback className="bg-gray-700 text-white text-xs">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            {/* Status Indicator */}
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(user.status)} flex items-center justify-center`}>
              {getStatusIcon(user.status)}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
              {user.name} - {user.status}
            </div>
          </div>
        ))}
        
        {activeUsers.length > 4 && (
          <div className="h-8 w-8 bg-gray-700 rounded-full border-2 border-gray-800 flex items-center justify-center">
            <span className="text-xs text-white">+{activeUsers.length - 4}</span>
          </div>
        )}
      </div>
    </div>
  );
};
