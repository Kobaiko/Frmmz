
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Phone, 
  Calendar,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Settings
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'collaborator' | 'reviewer' | 'viewer';
  status: 'active' | 'pending' | 'suspended';
  lastActive: Date;
  projects: number;
  joinedAt: Date;
  permissions: string[];
}

interface UserManagementProps {
  workspaceId: string;
  currentUserId: string;
}

export const UserManagement = ({ workspaceId, currentUserId }: UserManagementProps) => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@company.com',
      role: 'owner',
      status: 'active',
      lastActive: new Date(),
      projects: 12,
      joinedAt: new Date('2024-01-15'),
      permissions: ['all']
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@company.com',
      role: 'admin',
      status: 'active',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      projects: 8,
      joinedAt: new Date('2024-02-01'),
      permissions: ['manage_users', 'manage_projects', 'view_analytics']
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@external.com',
      role: 'collaborator',
      status: 'pending',
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
      projects: 3,
      joinedAt: new Date('2024-03-10'),
      permissions: ['view_projects', 'comment', 'upload']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-600';
      case 'admin': return 'bg-blue-600';
      case 'collaborator': return 'bg-green-600';
      case 'reviewer': return 'bg-yellow-600';
      case 'viewer': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'suspended': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const handleInviteUser = (email: string, role: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name: email.split('@')[0],
      email,
      role: role as any,
      status: 'pending',
      lastActive: new Date(),
      projects: 0,
      joinedAt: new Date(),
      permissions: getRolePermissions(role)
    };

    setUsers([...users, newUser]);
    setShowInviteDialog(false);
    toast({
      title: "Invitation sent",
      description: `Invited ${email} as ${role}`
    });
  };

  const getRolePermissions = (role: string): string[] => {
    switch (role) {
      case 'owner': return ['all'];
      case 'admin': return ['manage_users', 'manage_projects', 'view_analytics', 'manage_settings'];
      case 'collaborator': return ['view_projects', 'comment', 'upload', 'create_shares'];
      case 'reviewer': return ['view_projects', 'comment', 'approve'];
      case 'viewer': return ['view_projects'];
      default: return [];
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const InviteUserDialog = () => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('collaborator');

    return (
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogTrigger asChild>
          <Button className="bg-pink-600 hover:bg-pink-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Invite New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="bg-gray-700 border-gray-600 text-white mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="collaborator">Collaborator</SelectItem>
                  <SelectItem value="reviewer">Reviewer</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleInviteUser(email, role)}
                disabled={!email}
                className="bg-pink-600 hover:bg-pink-700"
              >
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-gray-400">Manage workspace members and permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-gray-600 text-gray-300">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <InviteUserDialog />
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="collaborator">Collaborator</SelectItem>
                <SelectItem value="reviewer">Reviewer</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
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
                      <h3 className="font-semibold text-white">{user.name}</h3>
                      <Badge className={`${getRoleColor(user.role)} text-white text-xs`}>
                        {user.role}
                      </Badge>
                      <Badge className={`${getStatusColor(user.status)} text-white text-xs`}>
                        {user.status}
                      </Badge>
                    </div>
                    <p className="text-gray-400">{user.email}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{user.projects} projects</span>
                      <span>•</span>
                      <span>Joined {user.joinedAt.toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Last active {user.lastActive.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-gray-400">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-xl font-bold text-white">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Active</p>
                <p className="text-xl font-bold text-white">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-xl font-bold text-white">
                  {users.filter(u => u.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">This Month</p>
                <p className="text-xl font-bold text-white">
                  {users.filter(u => 
                    u.joinedAt.getMonth() === new Date().getMonth()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
