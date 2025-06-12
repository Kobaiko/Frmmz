
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  FileVideo,
  Upload,
  Download,
  Share
} from "lucide-react";

interface ProjectStats {
  totalAssets: number;
  pendingReviews: number;
  approvedAssets: number;
  totalComments: number;
  activeCollaborators: number;
  projectProgress: number;
}

interface ActivityItem {
  id: string;
  type: 'upload' | 'comment' | 'approval' | 'share';
  user: string;
  asset: string;
  timestamp: Date;
  description: string;
}

export const ProjectDashboard = () => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  const projectStats: ProjectStats = {
    totalAssets: 47,
    pendingReviews: 8,
    approvedAssets: 32,
    totalComments: 156,
    activeCollaborators: 12,
    projectProgress: 68
  };

  const recentActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'upload',
      user: 'Sarah Chen',
      asset: 'Hero Video v3.mp4',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      description: 'uploaded new version'
    },
    {
      id: '2',
      type: 'comment',
      user: 'Mike Johnson',
      asset: 'Product Demo.mp4',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      description: 'left feedback on color grading'
    },
    {
      id: '3',
      type: 'approval',
      user: 'Emma Wilson',
      asset: 'Social Media Cut.mp4',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      description: 'approved for final delivery'
    },
    {
      id: '4',
      type: 'share',
      user: 'David Kim',
      asset: 'Client Presentation',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      description: 'shared with external stakeholders'
    }
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'upload': return <Upload className="h-4 w-4 text-blue-400" />;
      case 'comment': return <MessageSquare className="h-4 w-4 text-green-400" />;
      case 'approval': return <CheckCircle className="h-4 w-4 text-purple-400" />;
      case 'share': return <Share className="h-4 w-4 text-yellow-400" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Project Dashboard</h2>
          <p className="text-gray-400">Track progress and team activity</p>
        </div>
        <div className="flex items-center space-x-2">
          {(['day', 'week', 'month'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? 'bg-pink-600' : 'border-gray-600 text-gray-300'}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Assets</p>
                <p className="text-2xl font-bold text-white">{projectStats.totalAssets}</p>
                <p className="text-xs text-green-400 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last week
                </p>
              </div>
              <FileVideo className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Pending Reviews</p>
                <p className="text-2xl font-bold text-white">{projectStats.pendingReviews}</p>
                <p className="text-xs text-yellow-400 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Needs attention
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Comments</p>
                <p className="text-2xl font-bold text-white">{projectStats.totalComments}</p>
                <p className="text-xs text-purple-400 flex items-center mt-1">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  +23 today
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Team Members</p>
                <p className="text-2xl font-bold text-white">{projectStats.activeCollaborators}</p>
                <p className="text-xs text-green-400 flex items-center mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  8 online now
                </p>
              </div>
              <Users className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Project Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Overall Completion</span>
              <span className="text-white font-semibold">{projectStats.projectProgress}%</span>
            </div>
            <Progress value={projectStats.projectProgress} className="h-2" />
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{projectStats.approvedAssets}</div>
                <div className="text-sm text-gray-400">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{projectStats.pendingReviews}</div>
                <div className="text-sm text-gray-400">In Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {projectStats.totalAssets - projectStats.approvedAssets - projectStats.pendingReviews}
                </div>
                <div className="text-sm text-gray-400">Draft</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed views */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="activity" className="data-[state=active]:bg-pink-600">
            Recent Activity
          </TabsTrigger>
          <TabsTrigger value="deadlines" className="data-[state=active]:bg-pink-600">
            Upcoming Deadlines
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-pink-600">
            Team Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">{item.user}</span>
                        <span className="text-gray-400">{item.description}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-blue-400">{item.asset}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(item.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deadlines">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-900/20 border border-red-800">
                  <div>
                    <h4 className="font-medium text-white">Client Review</h4>
                    <p className="text-sm text-gray-400">Final cut approval needed</p>
                  </div>
                  <Badge className="bg-red-600 text-white">Due in 2 days</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-900/20 border border-yellow-800">
                  <div>
                    <h4 className="font-medium text-white">Social Media Assets</h4>
                    <p className="text-sm text-gray-400">Instagram and Twitter versions</p>
                  </div>
                  <Badge className="bg-yellow-600 text-white">Due in 5 days</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-900/20 border border-blue-800">
                  <div>
                    <h4 className="font-medium text-white">Final Delivery</h4>
                    <p className="text-sm text-gray-400">All formats and documentation</p>
                  </div>
                  <Badge className="bg-blue-600 text-white">Due in 1 week</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Team Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <h4 className="text-gray-400 font-medium">Team metrics coming soon</h4>
                  <p className="text-gray-500 text-sm">Track individual and team productivity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
