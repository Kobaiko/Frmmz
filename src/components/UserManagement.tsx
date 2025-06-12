
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Users, 
  Shield, 
  Settings, 
  UserPlus,
  UserMinus,
  Crown,
  Eye,
  Edit,
  Trash2,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UserManagementProps {
  onClose: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'collaborator' | 'reviewer' | 'viewer';
  status: 'active' | 'pending' | 'suspended';
  lastActive: string;
  projectsAccess: number;
  avatar?: string;
  joinDate: string;
}

export const UserManagement = ({ onClose }: UserManagementProps) => {
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  
  const users: User[] = [
    {
      id: "user-001",
      name: "Yair Kivalko",
      email: "yair@company.com",
      role: "owner",
      status: "active",
      lastActive: "Online now",
      projectsAccess: 15,
      avatar: "/placeholder.svg",
      joinDate: "2023-01-15"
    },
    {
      id: "user-002",
      name: "Sarah Johnson",
      email: "sarah@company.com",
      role: "admin",
      status: "active",
      lastActive: "2 hours ago",
      projectsAccess: 12,
      joinDate: "2023-02-20"
    },
    {
      id: "user-003",
      name: "Mike Chen",
      email: "mike@company.com",
      role: "collaborator",
      status: "active",
      lastActive: "1 day ago",
      projectsAccess: 8,
      joinDate: "2023-03-10"
    },
    {
      id: "user-004",
      name: "Emily Davis",
      email: "emily@freelancer.com",
      role: "reviewer",
      status: "pending",
      lastActive: "Never",
      projectsAccess: 3,
      joinDate: "2024-06-01"
    },
    {
      id: "user-005",
      name: "John Smith",
      email: "john@client.com",
      role: "viewer",
      status: "active",
      lastActive: "3 days ago",
      projectsAccess: 2,
      joinDate: "2024-05-15"
    }
  ];

  const roles = [
    { 
      id: 'owner', 
      name: 'Owner', 
      description: 'Full control over workspace and billing',
      permissions: ['All permissions', 'Billing management', 'User management', 'Workspace settings']
    },
    { 
      id: 'admin', 
      name: 'Admin', 
      description: 'Manage users and workspace settings',
      permissions: ['User management', 'Project creation', 'Workspace settings', 'Integration management']
    },
    { 
      id: 'collaborator', 
      name: 'Collaborator', 
      description: 'Create and edit projects and assets',
      permissions: ['Project creation', 'Asset upload', 'Comment and review', 'Share creation']
    },
    { 
      id: 'reviewer', 
      name: 'Reviewer', 
      description: 'Review and comment on shared content',
      permissions: ['View shared content', 'Add comments', 'Approve/reject content']
    },
    { 
      id: 'viewer', 
      name: 'Viewer', 
      description: 'View-only access to shared content',
      permissions: ['View shared content', 'Download (if permitted)']
    }
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'collaborator': return <Users className="h-4 w-4 text-green-500" />;
      case 'reviewer': return <Eye className="h-4 w-4 text-purple-500" />;
      case 'viewer': return <Eye className="h-4 w-4 text-gray-500" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-600';
      case 'admin': return 'bg-blue-600';
      case 'collaborator': return 'bg-green-600';
      case 'reviewer': return 'bg-purple-600';
      case 'viewer': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'suspended': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const activeUsers = users.filter(user => user.status === 'active').length;
  const pendingUsers = users.filter(user => user.status === 'pending').length;
  const totalProjects = Math.max(...users.map(user => user.projectsAccess));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onClose} variant="ghost" size="icon" className="text-gray-400">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">User Management</h2>
            <p className="text-gray-400">Manage workspace members and permissions</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-white text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Users</p>
                <p className="text-white text-2xl font-bold">{activeUsers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Invites</p>
                <p className="text-white text-2xl font-bold">{pendingUsers}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Projects</p>
                <p className="text-white text-2xl font-bold">{totalProjects}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="users" className="text-gray-300">Users</TabsTrigger>
          <TabsTrigger value="roles" className="text-gray-300">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="invites" className="text-gray-300">Pending Invites</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Search and Filter */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="collaborator">Collaborator</SelectItem>
                      <SelectItem value="reviewer">Reviewer</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gray-600 text-white">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-white font-medium">{user.name}</h3>
                          {getRoleIcon(user.role)}
                        </div>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>Joined {user.joinDate}</span>
                          <span>•</span>
                          <span>Last active: {user.lastActive}</span>
                          <span>•</span>
                          <span>{user.projectsAccess} projects</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <Badge className={`${getRoleBadgeColor(user.role)} text-white mb-2`}>
                          {user.role}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(user.status)}
                          <span className="text-sm text-gray-300 capitalize">{user.status}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="ghost" className="text-gray-400 p-2">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 p-2">
                          <Mail className="h-4 w-4" />
                        </Button>
                        {user.role !== 'owner' && (
                          <Button size="sm" variant="ghost" className="text-red-400 p-2">
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <Card key={role.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(role.id)}
                    <CardTitle className="text-white">{role.name}</CardTitle>
                  </div>
                  <p className="text-gray-400 text-sm">{role.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-white font-medium mb-2">Permissions:</h4>
                      <ul className="space-y-1">
                        {role.permissions.map((permission, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{permission}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-3 border-t border-gray-700">
                      <p className="text-gray-400 text-sm">
                        {users.filter(user => user.role === role.id).length} users with this role
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="invites" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Send Invitation</CardTitle>
              <p className="text-gray-400">Invite new users to join your workspace</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Email Address</Label>
                  <Input 
                    type="email"
                    placeholder="user@example.com"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Role</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="collaborator">Collaborator</SelectItem>
                      <SelectItem value="reviewer">Reviewer</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Pending Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.filter(user => user.status === 'pending').map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">{user.email}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                        <span className="text-gray-400 text-sm">Invited {user.joinDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                        Resend
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
