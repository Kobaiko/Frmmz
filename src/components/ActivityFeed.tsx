
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Upload, 
  MessageSquare, 
  CheckCircle, 
  UserPlus,
  Share,
  Clock,
  Filter
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'upload' | 'comment' | 'approval' | 'share' | 'invite' | 'workflow';
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: Date;
  metadata?: any;
}

interface ActivityFeedProps {
  projectId?: string;
  limit?: number;
}

export const ActivityFeed = ({ projectId, limit = 20 }: ActivityFeedProps) => {
  const [activities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'upload',
      user: { id: '3', name: 'Mike Johnson' },
      action: 'uploaded',
      target: 'Final_Edit_v3.mp4',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      metadata: { fileSize: '145 MB', duration: '2:34' }
    },
    {
      id: '2',
      type: 'comment',
      user: { id: '2', name: 'Jane Smith' },
      action: 'commented on',
      target: 'Final_Edit_v2.mp4',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      metadata: { commentText: 'The color correction looks great!' }
    },
    {
      id: '3',
      type: 'approval',
      user: { id: '2', name: 'Jane Smith' },
      action: 'approved',
      target: 'Creative Review Stage',
      timestamp: new Date(Date.now() - 32 * 60 * 1000)
    },
    {
      id: '4',
      type: 'invite',
      user: { id: '1', name: 'John Doe' },
      action: 'invited',
      target: 'sarah@agency.com',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      id: '5',
      type: 'share',
      user: { id: '3', name: 'Mike Johnson' },
      action: 'shared project with',
      target: 'client team',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ]);

  const [filter, setFilter] = useState<string>('all');

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'upload': return <Upload className="h-4 w-4 text-green-400" />;
      case 'comment': return <MessageSquare className="h-4 w-4 text-blue-400" />;
      case 'approval': return <CheckCircle className="h-4 w-4 text-purple-400" />;
      case 'invite': return <UserPlus className="h-4 w-4 text-pink-400" />;
      case 'share': return <Share className="h-4 w-4 text-yellow-400" />;
      case 'workflow': return <Activity className="h-4 w-4 text-orange-400" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <Activity className="h-5 w-5 text-pink-400" />
            <span>Recent Activity</span>
          </CardTitle>
          
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-pink-600' : 'text-gray-400'}
            >
              All
            </Button>
            <Button
              variant={filter === 'comment' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('comment')}
              className={filter === 'comment' ? 'bg-pink-600' : 'text-gray-400'}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Comments
            </Button>
            <Button
              variant={filter === 'upload' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('upload')}
              className={filter === 'upload' ? 'bg-pink-600' : 'text-gray-400'}
            >
              <Upload className="h-3 w-3 mr-1" />
              Uploads
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {filteredActivities.slice(0, limit).map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
            <div className="flex-shrink-0">
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={activity.user.avatar} />
                  <AvatarFallback className="bg-gray-600 text-xs">
                    {activity.user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white font-medium">{activity.user.name}</span>
                <span className="text-gray-400">{activity.action}</span>
                {activity.target && (
                  <span className="text-blue-400 font-medium truncate">{activity.target}</span>
                )}
              </div>
              
              {activity.metadata && (
                <div className="mt-1 text-sm text-gray-400">
                  {activity.type === 'upload' && activity.metadata.fileSize && (
                    <span>{activity.metadata.fileSize} • {activity.metadata.duration}</span>
                  )}
                  {activity.type === 'comment' && activity.metadata.commentText && (
                    <span>"{activity.metadata.commentText}"</span>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-500 text-xs flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTimestamp(activity.timestamp)}
                </span>
                
                <Badge variant="secondary" className="bg-gray-600 text-gray-300 text-xs capitalize">
                  {activity.type}
                </Badge>
              </div>
            </div>
          </div>
        ))}
        
        {filteredActivities.length === 0 && (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No recent activity</p>
            <p className="text-gray-500 text-sm">Activity will appear here as team members interact with the project</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
