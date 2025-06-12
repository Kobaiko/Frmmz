
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FolderTree, 
  Users, 
  Clock, 
  Target, 
  FileVideo, 
  Image,
  FileAudio,
  File,
  Calendar,
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProjectManagementProps {
  projectId: string;
  onClose: () => void;
}

export const ProjectManagement = ({ projectId, onClose }: ProjectManagementProps) => {
  const [projectData] = useState({
    name: "Summer Campaign 2024",
    description: "Complete video campaign for summer product launch",
    status: "in-progress",
    progress: 65,
    deadline: "2024-07-15",
    budget: "$50,000",
    teamSize: 8,
    totalAssets: 156,
    completedTasks: 23,
    totalTasks: 35
  });

  const [folders] = useState([
    { id: '1', name: 'Raw Footage', assetCount: 45, type: 'video', size: '12.5 GB' },
    { id: '2', name: 'Audio Files', assetCount: 23, type: 'audio', size: '2.1 GB' },
    { id: '3', name: 'Graphics', assetCount: 67, type: 'image', size: '890 MB' },
    { id: '4', name: 'Final Cuts', assetCount: 12, type: 'video', size: '8.2 GB' },
    { id: '5', name: 'Client Reviews', assetCount: 9, type: 'mixed', size: '1.5 GB' }
  ]);

  const [tasks] = useState([
    { id: '1', title: 'Color grading - Scene 1', assignee: 'Sarah Johnson', status: 'completed', dueDate: '2024-06-10' },
    { id: '2', title: 'Audio mixing - Track 3', assignee: 'Mike Chen', status: 'in-progress', dueDate: '2024-06-12' },
    { id: '3', title: 'Client feedback review', assignee: 'Emily Davis', status: 'pending', dueDate: '2024-06-13' },
    { id: '4', title: 'Final export - Version 2', assignee: 'John Smith', status: 'pending', dueDate: '2024-06-15' }
  ]);

  const [milestones] = useState([
    { id: '1', title: 'First Cut Complete', date: '2024-06-01', status: 'completed' },
    { id: '2', title: 'Client Review Round 1', date: '2024-06-08', status: 'completed' },
    { id: '3', title: 'Color & Audio Final', date: '2024-06-15', status: 'in-progress' },
    { id: '4', title: 'Final Delivery', date: '2024-06-22', status: 'pending' }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <FileVideo className="h-4 w-4 text-blue-500" />;
      case 'audio': return <FileAudio className="h-4 w-4 text-green-500" />;
      case 'image': return <Image className="h-4 w-4 text-purple-500" />;
      default: return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{projectData.name}</h1>
          <p className="text-gray-400">{projectData.description}</p>
        </div>
        <Button onClick={onClose} variant="outline" className="border-gray-600 text-gray-300">
          <X className="h-4 w-4 mr-2" />
          Close
        </Button>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Progress</p>
                <p className="text-white text-2xl font-bold">{projectData.progress}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={projectData.progress} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Team Size</p>
                <p className="text-white text-2xl font-bold">{projectData.teamSize}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Assets</p>
                <p className="text-white text-2xl font-bold">{projectData.totalAssets}</p>
              </div>
              <FolderTree className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tasks</p>
                <p className="text-white text-2xl font-bold">{projectData.completedTasks}/{projectData.totalTasks}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="folders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="folders" className="text-gray-300">Folders & Assets</TabsTrigger>
          <TabsTrigger value="tasks" className="text-gray-300">Tasks</TabsTrigger>
          <TabsTrigger value="timeline" className="text-gray-300">Timeline</TabsTrigger>
          <TabsTrigger value="settings" className="text-gray-300">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="folders" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Project Folders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {folders.map(folder => (
                  <div key={folder.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(folder.type)}
                      <div>
                        <h3 className="text-white font-medium">{folder.name}</h3>
                        <p className="text-gray-400 text-sm">{folder.assetCount} assets • {folder.size}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{folder.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Project Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(task.status)}
                      <div>
                        <h3 className="text-white font-medium">{task.title}</h3>
                        <p className="text-gray-400 text-sm">Assigned to {task.assignee} • Due {task.dueDate}</p>
                      </div>
                    </div>
                    <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones.map(milestone => (
                  <div key={milestone.id} className="flex items-center space-x-4">
                    <div className="flex flex-col items-center">
                      {getStatusIcon(milestone.status)}
                      <div className="w-px h-8 bg-gray-600 mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{milestone.title}</h3>
                      <p className="text-gray-400 text-sm">{milestone.date}</p>
                    </div>
                    <Badge variant={milestone.status === 'completed' ? 'default' : 'secondary'}>
                      {milestone.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Project Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Project Name</Label>
                <Input
                  defaultValue={projectData.name}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Description</Label>
                <Input
                  defaultValue={projectData.description}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Status</Label>
                <Select defaultValue={projectData.status}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Under Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Auto-backup</Label>
                  <p className="text-sm text-gray-500">Automatically backup project daily</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
