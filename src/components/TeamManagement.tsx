
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Crown, 
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Activity,
  Clock,
  CheckCircle
} from "lucide-react";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'collaborator' | 'reviewer' | 'viewer';
  status: 'active' | 'invited' | 'inactive';
  lastActive: Date;
  joinedAt: Date;
  permissions: string[];
}

interface TeamManagementProps {
  projectId: string;
  currentUserId: string;
}

export const TeamManagement = ({ projectId, currentUserId }: TeamManagementProps) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@company.com',
      role: 'owner',
      status: 'active',
      lastActive: new Date(),
      joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      permissions: ['all']
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@company.com',
      role: 'admin',
      status: 'active',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      permissions: ['manage_users', 'manage_content', 'approve']
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@agency.com',
      role: 'collaborator',
      status: 'active',
      lastActive: new Date(Date.now() - 5 * 60 * 1000),
      joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      permissions: ['upload', 'comment', 'share']
    }
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('collaborator');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-400" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-400" />;
      case 'collaborator': return <Edit className="h-4 w-4 text-green-400" />;
      case 'reviewer': return <Eye className="h-4 w-4 text-purple-400" />;
      case 'viewer': return <Eye className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRoleColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner': return 'bg-yellow-600';
      case 'admin': return 'bg-blue-600';
      case 'collaborator': return 'bg-green-600';
      case 'reviewer': return 'bg-purple-600';
      case 'viewer': return 'bg-gray-600';
    }
  };

  const getStatusIndicator = (member: TeamMember) => {
    const minutesAgo = Math.floor((Date.now() - member.lastActive.getTime()) / (1000 * 60));
    
    if (minutesAgo < 5) {
      return <div className="w-3 h-3 bg-green-400 rounded-full" title="Online" />;
    } else if (minutesAgo < 60) {
      return <div className="w-3 h-3 bg-yellow-400 rounded-full" title="Recently active" />;
    } else {
      return <div className="w-3 h-3 bg-gray-400 rounded-full" title="Offline" />;
    }
  };

  const handleInviteUser = () => {
    if (!inviteEmail) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'invited',
      lastActive: new Date(),
      joinedAt: new Date(),
      permissions: getPermissionsForRole(inviteRole)
    };

    setTeamMembers(prev => [...prev, newMember]);
    setInviteEmail('');
    setIsInviteDialogOpen(false);
  };

  const getPermissionsForRole = (role: TeamMember['role']): string[] => {
    switch (role) {
      case 'owner': return ['all'];
      case 'admin': return ['manage_users', 'manage_content', 'approve', 'upload', 'comment', 'share'];
      case 'collaborator': return ['upload', 'comment', 'share'];
      case 'reviewer': return ['comment', 'approve'];
      case 'viewer': return ['view'];
      default: return [];
    }
  };

  const handleRoleChange = (memberId: string, newRole: TeamMember['role']) => {
    setTeamMembers(prev => prev.map(member => 
      member.id === memberId 
        ? { ...member, role: newRole, permissions: getPermissionsForRole(newRole) }
        : member
    ));
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center space-x-2">
              <Users className="h-5 w-5 text-pink-400" />
              <span>Team Members ({teamMembers.length})</span>
            </CardTitle>
            
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-pink-600 hover:bg-pink-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Invite Team Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-gray-300">Role</Label>
                    <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as TeamMember['role'])}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
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
                  <div className="flex space-x-3">
                    <Button onClick={handleInviteUser} className="bg-pink-600 hover:bg-pink-700 flex-1">
                      Send Invitation
                    </Button>
                    <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)} className="border-gray-600">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Team Members List */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="bg-gray-700 border-gray-600">
          <TabsTrigger value="members" className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white">
            All Members
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white">
            Activity
          </TabsTrigger>
          <TabsTrigger value="permissions" className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white">
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          {teamMembers.map((member) => (
            <Card key={member.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-gray-600">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1">
                        {getStatusIndicator(member)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{member.name}</span>
                        {member.status === 'invited' && (
                          <Badge variant="secondary" className="bg-yellow-600 text-white text-xs">
                            Invited
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>{member.email}</span>
                        <span>•</span>
                        <span>Last active {formatLastActive(member.lastActive)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(member.role)}
                      <Badge className={getRoleColor(member.role)}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                    </div>

                    {member.id !== currentUserId && (
                      <div className="flex space-x-2">
                        <Select 
                          value={member.role} 
                          onValueChange={(value) => handleRoleChange(member.id, value as TeamMember['role'])}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="reviewer">Reviewer</SelectItem>
                            <SelectItem value="collaborator">Collaborator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Activity className="h-4 w-4 text-green-400" />
                  <span className="text-white">Mike Johnson uploaded "Final_Edit_v3.mp4"</span>
                  <span className="text-gray-400 text-sm">2 minutes ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                  <span className="text-white">Jane Smith approved Stage 1 review</span>
                  <span className="text-gray-400 text-sm">15 minutes ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-pink-400" />
                  <span className="text-white">John Doe invited new member</span>
                  <span className="text-gray-400 text-sm">1 hour ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Role Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['owner', 'admin', 'collaborator', 'reviewer', 'viewer'].map((role) => (
                <div key={role} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getRoleIcon(role as TeamMember['role'])}
                    <span className="text-white font-medium capitalize">{role}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getPermissionsForRole(role as TeamMember['role']).map((permission) => (
                      <Badge key={permission} variant="secondary" className="bg-gray-600 text-gray-300 text-xs">
                        {permission.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
