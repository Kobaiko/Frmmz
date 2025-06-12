
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Eye, 
  MessageCircle, 
  Clock, 
  Activity,
  Video,
  Edit,
  Download,
  Share2
} from "lucide-react";

interface RealtimeCollaborationProps {
  projectId: string;
  currentUser: string;
}

export const RealtimeCollaboration = ({ projectId, currentUser }: RealtimeCollaborationProps) => {
  const [activeUsers, setActiveUsers] = useState([
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
      status: 'online',
      activity: 'Viewing video timeline',
      location: 'Video Player',
      lastSeen: new Date(),
      isViewing: true
    },
    {
      id: '2',
      name: 'Mike Chen',
      avatar: '/avatars/mike.jpg',
      status: 'online',
      activity: 'Adding comments',
      location: 'Scene 3 - 02:34',
      lastSeen: new Date(),
      isViewing: true
    },
    {
      id: '3',
      name: 'Emily Davis',
      avatar: '/avatars/emily.jpg',
      status: 'idle',
      activity: 'Reviewing assets',
      location: 'Asset Library',
      lastSeen: new Date(Date.now() - 5 * 60 * 1000),
      isViewing: false
    }
  ]);

  const [recentActivity, setRecentActivity] = useState([
    {
      id: '1',
      user: 'Sarah Johnson',
      action: 'added a comment',
      target: 'Scene 3 - 02:34',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      type: 'comment'
    },
    {
      id: '2',
      user: 'Mike Chen',
      action: 'approved',
      target: 'Final Color Grade',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: 'approval'
    },
    {
      id: '3',
      user: 'Emily Davis',
      action: 'uploaded',
      target: 'Audio_Final_v2.wav',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      type: 'upload'
    },
    {
      id: '4',
      user: 'John Smith',
      action: 'downloaded',
      target: 'Project_Export.mp4',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      type: 'download'
    }
  ]);

  const [collaborationStats] = useState({
    totalUsers: 8,
    activeNow: 3,
    commentsToday: 24,
    approvalsToday: 6
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate user activity updates
      setActiveUsers(prev => prev.map(user => ({
        ...user,
        lastSeen: user.status === 'online' ? new Date() : user.lastSeen
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'approval':
        return <Badge className="h-4 w-4 text-green-500" />;
      case 'upload':
        return <Video className="h-4 w-4 text-purple-500" />;
      case 'download':
        return <Download className="h-4 w-4 text-orange-500" />;
      case 'edit':
        return <Edit className="h-4 w-4 text-yellow-500" />;
      case 'share':
        return <Share2 className="h-4 w-4 text-cyan-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'away':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Collaboration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-white text-2xl font-bold">{collaborationStats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Now</p>
                <p className="text-white text-2xl font-bold">{collaborationStats.activeNow}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Comments Today</p>
                <p className="text-white text-2xl font-bold">{collaborationStats.commentsToday}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Approvals Today</p>
                <p className="text-white text-2xl font-bold">{collaborationStats.approvalsToday}</p>
              </div>
              <Badge className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Users */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Active Users ({activeUsers.filter(u => u.status === 'online').length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(user.status)}`} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-gray-400 text-sm">{user.activity}</p>
                    <p className="text-gray-500 text-xs">{user.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={user.status === 'online' ? 'default' : 'secondary'} className="text-xs">
                    {user.status}
                  </Badge>
                  <p className="text-gray-500 text-xs mt-1">{formatTimeAgo(user.lastSeen)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    <span className="font-medium">{activity.user}</span>{' '}
                    <span className="text-gray-400">{activity.action}</span>{' '}
                    <span className="text-blue-400">{activity.target}</span>
                  </p>
                  <p className="text-gray-500 text-xs">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Live Collaboration Indicators */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Live Collaboration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-400">Real-time sync enabled</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-gray-400">{activeUsers.filter(u => u.isViewing).length} users viewing</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-gray-400">Live comments active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
