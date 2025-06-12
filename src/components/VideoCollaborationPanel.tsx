
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Clock, MessageSquare, Eye, Bell, Settings } from "lucide-react";

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  role: string;
  currentTimestamp?: number;
  lastActive?: string;
}

interface VideoCollaborationPanelProps {
  collaborators: Collaborator[];
  currentUser: string;
  videoLength: number;
  onUserClick?: (userId: string) => void;
}

export const VideoCollaborationPanel = ({ 
  collaborators, 
  currentUser, 
  videoLength,
  onUserClick 
}: VideoCollaborationPanelProps) => {
  const [notifications, setNotifications] = useState(true);

  const onlineCollaborators = collaborators.filter(c => c.status === 'online');
  const recentActivity = [
    { user: 'Sarah Johnson', action: 'Added comment at 2:34', time: '2 min ago' },
    { user: 'Mike Chen', action: 'Approved final cut', time: '5 min ago' },
    { user: 'Emily Davis', action: 'Started watching', time: '8 min ago' },
  ];

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg">Collaboration</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotifications(!notifications)}
              className={`p-2 ${notifications ? 'text-blue-400' : 'text-gray-400'}`}
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 text-gray-400">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {onlineCollaborators.length} online
          </span>
          <span className="flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            {collaborators.filter(c => c.currentTimestamp !== undefined).length} watching
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="users" className="text-gray-300">Active Users</TabsTrigger>
            <TabsTrigger value="activity" className="text-gray-300">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-3 mt-4">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
                onClick={() => onUserClick?.(collaborator.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={collaborator.avatar} />
                      <AvatarFallback className="bg-gray-600 text-white text-sm">
                        {collaborator.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-700 ${getStatusColor(collaborator.status)}`} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-white text-sm font-medium">{collaborator.name}</p>
                      {collaborator.name === currentUser && (
                        <Badge variant="secondary" className="text-xs px-2 py-0">You</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <span>{collaborator.role}</span>
                      {collaborator.currentTimestamp !== undefined && (
                        <>
                          <span>•</span>
                          <span>Watching at {formatTimestamp(collaborator.currentTimestamp)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {collaborator.status === 'online' && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="activity" className="space-y-3 mt-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
                <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">
                    <span className="font-medium">{activity.user}</span>{' '}
                    <span className="text-gray-300">{activity.action}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
