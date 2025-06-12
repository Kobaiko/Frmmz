
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Users, Clock, FileVideo, MessageCircle, Download, Eye } from "lucide-react";

export const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState("30d");

  // Sample data - in real app this would come from API
  const projectData = [
    { name: 'Week 1', projects: 12, comments: 45, views: 234 },
    { name: 'Week 2', projects: 19, comments: 67, views: 456 },
    { name: 'Week 3', projects: 15, comments: 34, views: 323 },
    { name: 'Week 4', projects: 22, comments: 89, views: 567 }
  ];

  const storageData = [
    { name: 'Video', value: 45.2, color: '#3B82F6' },
    { name: 'Images', value: 12.8, color: '#10B981' },
    { name: 'Audio', value: 8.3, color: '#F59E0B' },
    { name: 'Documents', value: 3.7, color: '#EF4444' }
  ];

  const teamActivityData = [
    { name: 'Mon', uploads: 15, comments: 23, reviews: 8 },
    { name: 'Tue', uploads: 12, comments: 19, reviews: 12 },
    { name: 'Wed', uploads: 18, comments: 31, reviews: 15 },
    { name: 'Thu', uploads: 14, comments: 25, reviews: 9 },
    { name: 'Fri', uploads: 20, comments: 35, reviews: 18 },
    { name: 'Sat', uploads: 8, comments: 12, reviews: 5 },
    { name: 'Sun', uploads: 6, comments: 8, reviews: 3 }
  ];

  const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            <div className="flex items-center mt-1">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {change}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400">Track workspace performance and team activity</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-gray-600 text-gray-300">
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Projects"
          value="24"
          change="+12.5%"
          icon={FileVideo}
          trend="up"
        />
        <StatCard
          title="Team Members"
          value="18"
          change="+2"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Total Comments"
          value="1,247"
          change="+23.8%"
          icon={MessageCircle}
          trend="up"
        />
        <StatCard
          title="Asset Views"
          value="5,432"
          change="-5.2%"
          icon={Eye}
          trend="down"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="overview" className="text-gray-300">Overview</TabsTrigger>
          <TabsTrigger value="projects" className="text-gray-300">Projects</TabsTrigger>
          <TabsTrigger value="team" className="text-gray-300">Team Activity</TabsTrigger>
          <TabsTrigger value="storage" className="text-gray-300">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Project Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={projectData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151', 
                        borderRadius: '6px',
                        color: '#F9FAFB'
                      }} 
                    />
                    <Line type="monotone" dataKey="projects" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="comments" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Storage Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={storageData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}GB`}
                    >
                      {storageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { user: "Sarah Johnson", action: "uploaded video", asset: "Final_Cut_v3.mp4", time: "2 minutes ago" },
                  { user: "Mike Chen", action: "commented on", asset: "Project_Draft.mp4", time: "15 minutes ago" },
                  { user: "Alex Rivera", action: "approved", asset: "Commercial_Spot.mp4", time: "1 hour ago" },
                  { user: "Emma Davis", action: "shared", asset: "Client_Review_Pack", time: "3 hours ago" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {activity.user.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm">
                          <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium">{activity.asset}</span>
                        </p>
                        <p className="text-gray-400 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Project Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={projectData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151', 
                      borderRadius: '6px',
                      color: '#F9FAFB'
                    }} 
                  />
                  <Bar dataKey="projects" fill="#3B82F6" />
                  <Bar dataKey="views" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Team Activity Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={teamActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151', 
                      borderRadius: '6px',
                      color: '#F9FAFB'
                    }} 
                  />
                  <Bar dataKey="uploads" fill="#3B82F6" />
                  <Bar dataKey="comments" fill="#10B981" />
                  <Bar dataKey="reviews" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Storage Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Used</span>
                    <span className="text-white">70.0 GB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Available</span>
                    <span className="text-white">30.0 GB</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  {storageData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-gray-300 text-sm">{item.name}</span>
                      </div>
                      <span className="text-white text-sm">{item.value} GB</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Storage Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={projectData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151', 
                          borderRadius: '6px',
                          color: '#F9FAFB'
                        }} 
                      />
                      <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
