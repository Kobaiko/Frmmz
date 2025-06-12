
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Eye, 
  MessageSquare, 
  Edit, 
  Mouse, 
  Users,
  Clock
} from "lucide-react";

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
  color: string; // Assigned color for user identification
}

interface PresenceTrackerProps {
  users: UserPresence[];
  currentUser: UserPresence;
  onUserClick?: (user: UserPresence) => void;
}

export const PresenceTracker = ({ users, currentUser, onUserClick }: PresenceTrackerProps) => {
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);

  useEffect(() => {
    // Filter to show only active users (last seen within 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const active = users.filter(user => user.lastSeen > fiveMinutesAgo);
    setActiveUsers(active);
  }, [users]);

  const getStatusIcon = (status: UserPresence['status']) => {
    switch (status) {
      case 'viewing': return <Eye className="h-3 w-3" />;
      case 'commenting': return <MessageSquare className="h-3 w-3" />;
      case 'editing': return <Edit className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: UserPresence['status']) => {
    switch (status) {
      case 'viewing': return 'bg-green-600';
      case 'commenting': return 'bg-blue-600';
      case 'editing': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const formatLastSeen = (lastSeen: Date) => {
    const seconds = Math.floor((Date.now() - lastSeen.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2 p-2 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-400">{activeUsers.length} online</span>
        </div>
        
        <div className="h-4 w-px bg-gray-600" />
        
        <div className="flex items-center space-x-1">
          {activeUsers.slice(0, 5).map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <div 
                  className="relative cursor-pointer"
                  onClick={() => onUserClick?.(user)}
                >
                  <Avatar className="h-8 w-8 border-2" style={{ borderColor: user.color }}>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback 
                      className="text-xs text-white"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Status indicator */}
                  <div 
                    className={`absolute -bottom-1 -right-1 rounded-full p-1 ${getStatusColor(user.status)}`}
                  >
                    {getStatusIcon(user.status)}
                  </div>
                  
                  {/* Typing indicator */}
                  {user.isTyping && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full w-3 h-3 animate-pulse" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 border-gray-700">
                <div className="text-sm">
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-gray-400">{user.email}</div>
                  <div className="flex items-center space-x-1 mt-1">
                    <Badge className={getStatusColor(user.status)} variant="secondary">
                      {getStatusIcon(user.status)}
                      <span className="ml-1 capitalize">{user.status}</span>
                    </Badge>
                  </div>
                  {user.currentAsset && (
                    <div className="text-xs text-gray-500 mt-1">
                      Viewing: {user.currentAsset}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    {formatLastSeen(user.lastSeen)}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {activeUsers.length > 5 && (
            <div className="flex items-center justify-center w-8 h-8 bg-gray-700 rounded-full text-xs text-gray-300">
              +{activeUsers.length - 5}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
