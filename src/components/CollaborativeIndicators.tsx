
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  MessageSquare, 
  Edit, 
  Eye, 
  Download, 
  Share2,
  Clock,
  Activity,
  Users
} from "lucide-react";

interface ActivityIndicator {
  type: 'comment' | 'edit' | 'view' | 'download' | 'share';
  userId: string;
  userName: string;
  userColor: string;
  timestamp: number;
  assetId?: string;
  assetName?: string;
}

interface CollaborativeIndicatorsProps {
  activities: ActivityIndicator[];
  currentAssetId?: string;
  showGlobalActivities?: boolean;
}

export const CollaborativeIndicators = ({ 
  activities, 
  currentAssetId,
  showGlobalActivities = false 
}: CollaborativeIndicatorsProps) => {
  const [recentActivities, setRecentActivities] = useState<ActivityIndicator[]>([]);

  useEffect(() => {
    // Filter activities based on context and recency (last 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    let filtered = activities.filter(activity => activity.timestamp > fiveMinutesAgo);
    
    if (!showGlobalActivities && currentAssetId) {
      filtered = filtered.filter(activity => activity.assetId === currentAssetId);
    }
    
    // Sort by timestamp (most recent first) and limit to 10
    filtered.sort((a, b) => b.timestamp - a.timestamp);
    setRecentActivities(filtered.slice(0, 10));
  }, [activities, currentAssetId, showGlobalActivities]);

  const getActivityIcon = (type: ActivityIndicator['type']) => {
    switch (type) {
      case 'comment': return <MessageSquare className="h-3 w-3" />;
      case 'edit': return <Edit className="h-3 w-3" />;
      case 'view': return <Eye className="h-3 w-3" />;
      case 'download': return <Download className="h-3 w-3" />;
      case 'share': return <Share2 className="h-3 w-3" />;
    }
  };

  const getActivityColor = (type: ActivityIndicator['type']) => {
    switch (type) {
      case 'comment': return 'bg-blue-600';
      case 'edit': return 'bg-purple-600';
      case 'view': return 'bg-green-600';
      case 'download': return 'bg-orange-600';
      case 'share': return 'bg-pink-600';
    }
  };

  const getActivityDescription = (activity: ActivityIndicator) => {
    const timeAgo = Math.floor((Date.now() - activity.timestamp) / 1000);
    const timeStr = timeAgo < 60 ? 'just now' : `${Math.floor(timeAgo / 60)}m ago`;
    
    switch (activity.type) {
      case 'comment': return `${activity.userName} added a comment ${timeStr}`;
      case 'edit': return `${activity.userName} made changes ${timeStr}`;
      case 'view': return `${activity.userName} is viewing ${timeStr}`;
      case 'download': return `${activity.userName} downloaded ${timeStr}`;
      case 'share': return `${activity.userName} shared ${timeStr}`;
    }
  };

  const groupedActivities = recentActivities.reduce((groups, activity) => {
    const key = `${activity.type}-${activity.userId}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(activity);
    return groups;
  }, {} as Record<string, ActivityIndicator[]>);

  const uniqueActivities = Object.values(groupedActivities).map(group => group[0]);

  if (uniqueActivities.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
        <div className="flex items-center space-x-1">
          <Activity className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-400">Live Activity</span>
        </div>
        
        <div className="h-3 w-px bg-gray-600" />
        
        <div className="flex items-center space-x-1 overflow-x-auto">
          {uniqueActivities.slice(0, 5).map((activity, index) => {
            const groupSize = groupedActivities[`${activity.type}-${activity.userId}`].length;
            
            return (
              <Tooltip key={`${activity.type}-${activity.userId}-${index}`}>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Badge 
                      className={`${getActivityColor(activity.type)} text-white px-2 py-1 text-xs`}
                      variant="secondary"
                    >
                      {getActivityIcon(activity.type)}
                      <span className="ml-1 font-medium" style={{ color: activity.userColor }}>
                        {activity.userName.split(' ')[0]}
                      </span>
                      {groupSize > 1 && (
                        <span className="ml-1 bg-white/20 rounded-full px-1 text-xs">
                          {groupSize}
                        </span>
                      )}
                    </Badge>
                    
                    {/* Pulse animation for very recent activities (last 30 seconds) */}
                    {(Date.now() - activity.timestamp) < 30000 && (
                      <div className="absolute inset-0 rounded animate-pulse bg-white/10" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 border-gray-700">
                  <div className="text-sm">
                    <div className="font-medium text-white">{getActivityDescription(activity)}</div>
                    {activity.assetName && showGlobalActivities && (
                      <div className="text-xs text-gray-400 mt-1">
                        on {activity.assetName}
                      </div>
                    )}
                    {groupSize > 1 && (
                      <div className="text-xs text-gray-400 mt-1">
                        +{groupSize - 1} more {activity.type} activities
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
          
          {uniqueActivities.length > 5 && (
            <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
              +{uniqueActivities.length - 5} more
            </Badge>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
