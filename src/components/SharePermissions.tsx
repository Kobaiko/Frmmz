
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Mail, 
  Shield, 
  Clock, 
  Eye,
  Download,
  MessageSquare,
  UserPlus,
  Trash2,
  Copy,
  Lock,
  Globe
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SharePermission {
  id: string;
  email: string;
  name: string;
  role: 'viewer' | 'reviewer' | 'approver' | 'editor';
  permissions: {
    canView: boolean;
    canComment: boolean;
    canDownload: boolean;
    canApprove: boolean;
    canShare: boolean;
  };
  expiresAt?: Date;
  lastAccess?: Date;
  avatar?: string;
}

interface SharePermissionsProps {
  shareId: string;
  permissions: SharePermission[];
  onPermissionUpdate: (permission: SharePermission) => void;
  onPermissionRemove: (permissionId: string) => void;
  onAddPermission: (email: string, role: string) => void;
}

export const SharePermissions = ({
  shareId,
  permissions,
  onPermissionUpdate,
  onPermissionRemove,
  onAddPermission
}: SharePermissionsProps) => {
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('viewer');
  const [isPublicShare, setIsPublicShare] = useState(false);

  const rolePermissions = {
    viewer: { canView: true, canComment: false, canDownload: false, canApprove: false, canShare: false },
    reviewer: { canView: true, canComment: true, canDownload: false, canApprove: false, canShare: false },
    approver: { canView: true, canComment: true, canDownload: true, canApprove: true, canShare: false },
    editor: { canView: true, canComment: true, canDownload: true, canApprove: true, canShare: true }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'viewer': return 'bg-gray-600';
      case 'reviewer': return 'bg-blue-600';
      case 'approver': return 'bg-green-600';
      case 'editor': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const handleAddUser = () => {
    if (!newUserEmail) return;
    
    onAddPermission(newUserEmail, newUserRole);
    setNewUserEmail('');
    setNewUserRole('viewer');
    
    toast({
      title: "User added",
      description: `${newUserEmail} has been given ${newUserRole} access`
    });
  };

  const handleRoleChange = (permission: SharePermission, newRole: string) => {
    const updatedPermission = {
      ...permission,
      role: newRole as SharePermission['role'],
      permissions: rolePermissions[newRole as keyof typeof rolePermissions]
    };
    onPermissionUpdate(updatedPermission);
  };

  const copyShareLink = () => {
    const shareUrl = `https://frmzz.com/share/${shareId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied",
      description: "Share link has been copied to your clipboard"
    });
  };

  return (
    <div className="space-y-6">
      {/* Share Link Section */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Share Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 p-2 bg-gray-700 rounded text-gray-300 text-sm">
              https://frmzz.com/share/{shareId}
            </div>
            <Button size="sm" onClick={copyShareLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Public Access</Label>
              <p className="text-sm text-gray-500">Allow anyone with the link to view</p>
            </div>
            <Switch checked={isPublicShare} onCheckedChange={setIsPublicShare} />
          </div>
        </CardContent>
      </Card>

      {/* Add New User */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Add People
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter email address"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="flex-1 bg-gray-700 border-gray-600 text-white"
            />
            <Select value={newUserRole} onValueChange={setNewUserRole}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="reviewer">Reviewer</SelectItem>
                <SelectItem value="approver">Approver</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddUser} disabled={!newUserEmail}>
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Permissions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              People with access ({permissions.length})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {permissions.map((permission) => (
              <div key={permission.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={permission.avatar} />
                    <AvatarFallback className="bg-gray-600 text-white">
                      {permission.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">{permission.name}</span>
                      <Badge className={getRoleColor(permission.role)}>
                        {permission.role}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{permission.email}</span>
                      {permission.lastAccess && (
                        <>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Last access: {permission.lastAccess.toLocaleDateString()}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {permission.permissions.canView && <Eye className="h-4 w-4 text-green-500" />}
                    {permission.permissions.canComment && <MessageSquare className="h-4 w-4 text-blue-500" />}
                    {permission.permissions.canDownload && <Download className="h-4 w-4 text-purple-500" />}
                    {permission.permissions.canApprove && <Shield className="h-4 w-4 text-yellow-500" />}
                  </div>
                  
                  <Select 
                    value={permission.role} 
                    onValueChange={(value) => handleRoleChange(permission, value)}
                  >
                    <SelectTrigger className="w-24 bg-gray-600 border-gray-500 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="reviewer">Reviewer</SelectItem>
                      <SelectItem value="approver">Approver</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onPermissionRemove(permission.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permission Legend */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Permission Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge className="bg-gray-600">Viewer</Badge>
                <span className="text-gray-300">Can view content only</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-600">Reviewer</Badge>
                <span className="text-gray-300">Can view and comment</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-600">Approver</Badge>
                <span className="text-gray-300">Can approve and download</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-purple-600">Editor</Badge>
                <span className="text-gray-300">Full access including sharing</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
