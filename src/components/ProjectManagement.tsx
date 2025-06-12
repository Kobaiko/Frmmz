
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Folder,
  Calendar,
  Users,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Settings,
  Archive,
  Star,
  MoreHorizontal
} from "lucide-react";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  dueDate: Date;
  createdAt: Date;
  teamMembers: number;
  assetsCount: number;
  commentsCount: number;
  template?: string;
  tags: string[];
  owner: string;
  lastActivity: Date;
}

interface ProjectManagementProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  onCreateProject: () => void;
}

export const ProjectManagement = ({ projects, onProjectSelect, onCreateProject }: ProjectManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastActivity');

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-400" />;
      case 'archived': return <Archive className="h-4 w-4 text-gray-400" />;
      case 'on-hold': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'completed': return 'bg-blue-600';
      case 'archived': return 'bg-gray-600';
      case 'on-hold': return 'bg-yellow-600';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
    }
  };

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || project.priority === selectedPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'dueDate': return a.dueDate.getTime() - b.dueDate.getTime();
        case 'progress': return b.progress - a.progress;
        case 'lastActivity': return b.lastActivity.getTime() - a.lastActivity.getTime();
        default: return 0;
      }
    });

  const getProjectStats = () => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const overdue = projects.filter(p => p.dueDate < new Date() && p.status !== 'completed').length;
    const avgProgress = projects.reduce((sum, p) => sum + p.progress, 0) / total || 0;

    return { total, active, completed, overdue, avgProgress };
  };

  const stats = getProjectStats();

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Project Management</h2>
          <p className="text-gray-400">{filteredProjects.length} projects</p>
        </div>
        <Button onClick={onCreateProject} className="bg-pink-600 hover:bg-pink-700">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Projects</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Folder className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Projects</p>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Progress</p>
                <p className="text-2xl font-bold text-white">{Math.round(stats.avgProgress)}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px] bg-gray-800 border-gray-700 text-white"
        />

        <div className="flex space-x-2">
          {['all', 'active', 'completed', 'on-hold', 'archived'].map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus(status)}
              className={selectedStatus === status ? 'bg-pink-600' : 'border-gray-600 text-gray-300'}
            >
              {status === 'all' ? 'All' : status.replace('-', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card 
            key={project.id} 
            className="bg-gray-800 border-gray-700 hover:border-pink-500 transition-colors cursor-pointer"
            onClick={() => onProjectSelect(project)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-white text-lg">{project.name}</CardTitle>
                    <Badge className={getPriorityColor(project.priority)}>
                      {project.priority}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Status and Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(project.status)}
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-400">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-1 text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>{project.teamMembers}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-400">
                  <Folder className="h-4 w-4" />
                  <span>{project.assetsCount}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{project.commentsCount}</span>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1 text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(project.dueDate)}</span>
                </div>
                <span className="text-gray-500">
                  {project.lastActivity.toLocaleDateString()}
                </span>
              </div>

              {/* Tags */}
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="border-gray-600 text-gray-400 text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {project.tags.length > 3 && (
                    <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                      +{project.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Folder className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400">No projects found</h3>
          <p className="text-gray-500">Create your first project or adjust your filters</p>
          <Button onClick={onCreateProject} className="mt-4 bg-pink-600 hover:bg-pink-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      )}
    </div>
  );
};
