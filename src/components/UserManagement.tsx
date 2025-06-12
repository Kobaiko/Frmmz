
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  UserPlus, 
  Crown, 
  Shield, 
  Eye, 
  Edit, 
  MessageSquare,
  Settings,
  Mail,
  Phone,
  Calendar,
  Activity,
  X
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UserManagementProps {
  onClose: () => void;
}

export const UserManagement = ({ onClose }: UserManagementProps) => {
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [users] = useState([
    {
      id: '1',
      name: 'Yair Kivalko',
      email: 'yair@example.com',
      role: 'owner',
      status: 'active',
      lastActive: '2 minutes ago',
      avatar: '/avatars/yair.jpg',
      projects: 12,
      comments: 156,
      phone: '+1 (555) 123-4567',
      joinDate: '2023-01-15'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'admin',
      status: 'active',
      lastActive: '1 hour ago',
      avatar: '/avatars/sarah.jpg',
      projects: 8,
      comments: 89,
      phone: '+1 (555) 234-5678',
      joinDate: '2023-02-20'
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike@example.com',
      role: 'collaborator',
      status: 'active',
      lastActive: '3 hours ago',
      avatar: '/avatars/mike.jpg',
      projects: 15,
      comments: 234,
      phone: '+1 (555) 345-6789',
      joinDate: '2023-03-10'
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily@example.com',
      role: 'reviewer',
      status: 'inactive',
      lastActive: '2 days ago',
      avatar: '/avatars/emily.jpg',
      projects: 3,
      comments: 45,
      phone: '+1 (555) 456-7890',
      joinDate: '2023-04-05'
    },
    {
      id: '5',
      name: 'John Smith',
      email: 'john@example.com',
      role: 'viewer',
      status: 'pending',
      lastActive: 'Never',
      avatar: '/avatars/john.jpg',
      projects: 0,
      comments: 0,
      phone: '+1 (555) 567-8901',
      joinDate: '2024-06-01'
    }
  ]);

  const [roles] = useState([
    { 
      id: 'owner', 
      name: 'Owner', 
      description: 'Full administrative access and billing control',
      icon: Crown,
      permissions: ['all']
    },
    { 
      id: 'admin', 
      name: 'Admin', 
      description: 'Manage users, projects, and workspace settings',
      icon: Shield,
      permissions: ['manage-users', 'manage-projects', 'workspace-settings']
    },
    { 
      id: 'collaborator', 
      name: 'Collaborator', 
      description: 'Create projects, upload assets, and collaborate',
      icon: Users,
      permissions: ['create-projects', 'upload-assets', 'comment']
    },
    { 
      id: 'reviewer', 
      name: 'Reviewer', 
      description: 'Review content and add comments',
      icon: MessageSquare,
      permissions: ['view-projects', 'comment', 'approve']
    },
    { 
      id: 'viewer', 
      name: 'Viewer', 
      description: 'View content only, no editing permissions',
      icon: Eye,
      permissions: ['view-projects']
    }
  ]);

  const getRoleIcon = (role: string) => {
    const roleData = roles.find(r => r.id === role);
    const IconComponent = roleData?.icon || Users;
    return <IconComponent className="h-4 w-4" />;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-600';
      case 'admin': return 'bg-red-600';
      case 'collaborator': return 'bg-blue-600';
      case 'reviewer': return 'bg-green-600';
      case 'viewer': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-yellow-500';
      case 'pending': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const handleInviteUser = () => {
    toast({
      title: "Invitation sent",
      description: "User invitation has been sent successfully."
    });
    setShowInviteUser(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400">Manage team members and permissions</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowInviteUser(true)} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
          <Button onClick={onClose} variant="outline" className="border-gray-600 text-gray-300">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="users" className="text-gray-300">Team Members</TabsTrigger>
          <TabsTrigger value="roles" className="text-gray-300">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="activity" className="text-gray-300">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-4">
            {users.map(user => (
              <Card key={user.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-blue-600 text-white">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${getStatusColor(user.status)}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-white font-medium text-lg">{user.name}</h3>
                          <Badge className={getRoleColor(user.role)}>
                            {getRoleIcon(user.role)}
                            <span className="ml-1 capitalize">{user.role}</span>
                          </Badge>
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">{user.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">{user.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Activity className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">Last active: {user.lastActive}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">Joined: {user.joinDate}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-gray-400">Projects</p>
                            <p className="text-white font-medium">{user.projects}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Comments</p>
                            <p className="text-white font-medium">{user.comments}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid gap-4">
            {roles.map(role => {
              const IconComponent = role.icon;
              return (
                <Card key={role.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getRoleColor(role.id)}`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-lg">{role.name}</h3>
                        <p className="text-gray-400 mb-3">{role.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.map((permission, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {permission.replace('-', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">Users</p>
                        <p className="text-white font-medium">
                          {users.filter(user => user.role === role.id).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { user: 'Sarah Johnson', action: 'uploaded new asset', target: 'Video_Final_v3.mp4', time: '2 minutes ago' },
                  { user: 'Mike Chen', action: 'added comment on', target: 'Scene 4 - Color Grade', time: '15 minutes ago' },
                  { user: 'Emily Davis', action: 'approved', target: 'Audio Mix Final', time: '1 hour ago' },
                  { user: 'John Smith', action: 'joined workspace', target: '', time: '2 hours ago' },
                  { user: 'Yair Kivalko', action: 'created project', target: 'Summer Campaign 2024', time: '3 hours ago' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-white">
                        <span className="font-medium">{activity.user}</span>{' '}
                        <span className="text-gray-400">{activity.action}</span>{' '}
                        {activity.target && <span className="text-blue-400">{activity.target}</span>}
                      </p>
                      <p className="text-gray-500 text-sm">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite User Dialog */}
      <Dialog open={showInviteUser} onOpenChange={setShowInviteUser}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Invite New User</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
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
              <Select defaultValue="collaborator">
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {roles.filter(role => role.id !== 'owner').map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(role.id)}
                        <span>{role.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Personal Message (optional)</Label>
              <Input
                placeholder="Welcome to our team!"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Send welcome email</Label>
                <p className="text-sm text-gray-500">User will receive an invitation email</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowInviteUser(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleInviteUser}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Send Invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
