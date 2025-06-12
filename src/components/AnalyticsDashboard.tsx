
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Clock, 
  MessageSquare, 
  Play, 
  Download,
  FileVideo,
  Eye,
  Calendar,
  Filter
} from "lucide-react";

interface AnalyticsDashboardProps {
  workspaceId: string;
  dateRange: string;
}

export const AnalyticsDashboard = ({ workspaceId, dateRange }: AnalyticsDashboardProps) => {
  const [selectedMetric, setSelectedMetric] = useState("overview");

  // Mock data - in real implementation, this would come from API
  const overviewStats = [
    { label: "Total Videos", value: "2,847", change: "+12%", icon: FileVideo, color: "text-blue-500" },
    { label: "Active Users", value: "394", change: "+8%", icon: Users, color: "text-green-500" },
    { label: "Comments", value: "15,692", change: "+23%", icon: MessageSquare, color: "text-purple-500" },
    { label: "Watch Time", value: "847h", change: "+15%", icon: Clock, color: "text-orange-500" }
  ];

  const usageData = [
    { name: "Jan", uploads: 65, reviews: 45, approvals: 30 },
    { name: "Feb", uploads: 78, reviews: 52, approvals: 38 },
    { name: "Mar", uploads: 85, reviews: 61, approvals: 42 },
    { name: "Apr", uploads: 92, reviews: 68, approvals: 48 },
    { name: "May", uploads: 105, reviews: 75, approvals: 55 },
    { name: "Jun", uploads: 118, reviews: 82, approvals: 62 }
  ];

  const collaborationData = [
    { name: "Comments", value: 45, color: "#8884d8" },
    { name: "Approvals", value: 30, color: "#82ca9d" },
    { name: "Reviews", value: 25, color: "#ffc658" }
  ];

  const projectPerformance = [
    { name: "Campaign A", completion: 95, onTime: true, team: 8 },
    { name: "Campaign B", completion: 78, onTime: false, team: 12 },
    { name: "Campaign C", completion: 88, onTime: true, team: 6 },
    { name: "Campaign D", completion: 92, onTime: true, team: 10 }
  ];

  const userActivity = [
    { name: "Sarah Johnson", role: "Creative Director", activity: 92, lastActive: "2 hours ago" },
    { name: "Mike Chen", role: "Video Editor", activity: 88, lastActive: "30 min ago" },
    { name: "Emily Davis", role: "Producer", activity: 85, lastActive: "1 hour ago" },
    { name: "Alex Rodriguez", role: "Motion Designer", activity: 79, lastActive: "4 hours ago" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-gray-400">Insights and metrics for your video collaboration</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="text-gray-300 border-gray-600">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="text-gray-300 border-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {dateRange}
          </Button>
          <Button variant="outline" size="sm" className="text-gray-300 border-gray-600">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500 text-xs">{stat.change}</span>
                  </div>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="overview" className="text-gray-300">Usage Trends</TabsTrigger>
          <TabsTrigger value="collaboration" className="text-gray-300">Collaboration</TabsTrigger>
          <TabsTrigger value="projects" className="text-gray-300">Projects</TabsTrigger>
          <TabsTrigger value="users" className="text-gray-300">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Upload & Review Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }} 
                  />
                  <Bar dataKey="uploads" fill="#3B82F6" name="Uploads" />
                  <Bar dataKey="reviews" fill="#10B981" name="Reviews" />
                  <Bar dataKey="approvals" fill="#F59E0B" name="Approvals" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Collaboration Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={collaborationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {collaborationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-4 mt-4">
                  {collaborationData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-300 text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Avg. Review Time</span>
                    <Badge variant="secondary" className="bg-blue-600 text-white">2.3 hours</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Avg. Approval Time</span>
                    <Badge variant="secondary" className="bg-green-600 text-white">4.7 hours</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Comment Response Time</span>
                    <Badge variant="secondary" className="bg-purple-600 text-white">1.2 hours</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Client Response Time</span>
                    <Badge variant="secondary" className="bg-orange-600 text-white">8.4 hours</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Project Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectPerformance.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="text-white font-medium">{project.name}</h4>
                        <p className="text-gray-400 text-sm">{project.team} team members</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-white font-medium">{project.completion}%</p>
                        <Badge 
                          variant={project.onTime ? "default" : "destructive"}
                          className={project.onTime ? "bg-green-600" : "bg-red-600"}
                        >
                          {project.onTime ? "On Time" : "Delayed"}
                        </Badge>
                      </div>
                      <div className="w-16 h-2 bg-gray-600 rounded-full">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${project.completion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userActivity.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{user.name}</h4>
                        <p className="text-gray-400 text-sm">{user.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-white font-medium">{user.activity}% active</p>
                        <p className="text-gray-400 text-sm">{user.lastActive}</p>
                      </div>
                      <div className="w-16 h-2 bg-gray-600 rounded-full">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${user.activity}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
