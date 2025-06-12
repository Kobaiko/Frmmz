
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Edit, Play } from "lucide-react";

interface UserPresence {
  id: string;
  name: string;
  avatar?: string;
  activity: 'viewing' | 'editing' | 'commenting' | 'playing';
  timestamp?: number;
  cursor?: { x: number; y: number };
}

interface PresenceIndicatorProps {
  assetId: string;
  currentUserId: string;
}

export const PresenceIndicator = ({ assetId, currentUserId }: PresenceIndicatorProps) => {
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([
    {
      id: '2',
      name: 'Jane Smith',
      activity: 'viewing',
      timestamp: 45.2
    },
    {
      id: '3', 
      name: 'Mike Johnson',
      activity: 'commenting',
      timestamp: 32.7
    }
  ]);

  const getActivityIcon = (activity: UserPresence['activity']) => {
    switch (activity) {
      case 'viewing': return <Eye className="h-3 w-3" />;
      case 'editing': return <Edit className="h-3 w-3" />;
      case 'playing': return <Play className="h-3 w-3" />;
      default: return <Eye className="h-3 w-3" />;
    }
  };

  const getActivityColor = (activity: UserPresence['activity']) => {
    switch (activity) {
      case 'viewing': return 'bg-blue-500';
      case 'editing': return 'bg-green-500';
      case 'commenting': return 'bg-purple-500';
      case 'playing': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp || timestamp < 0) return '';
    const minutes = Math.floor(timestamp / 60);
    const seconds = Math.floor(timestamp % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (activeUsers.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2">
        <div className="flex -space-x-2">
          {activeUsers.slice(0, 3).map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger>
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-gray-800">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-gray-600 text-xs">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${getActivityColor(user.activity)} flex items-center justify-center`}>
                    {getActivityIcon(user.activity)}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 border-gray-700">
                <div className="text-sm">
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-gray-400 capitalize">
                    {user.activity}
                    {user.timestamp && ` at ${formatTimestamp(user.timestamp)}`}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        
        {activeUsers.length > 3 && (
          <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
            +{activeUsers.length - 3} more
          </Badge>
        )}
        
        <span className="text-gray-400 text-sm">
          {activeUsers.length} viewing
        </span>
      </div>
    </TooltipProvider>
  );
};
