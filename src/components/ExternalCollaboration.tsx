
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ExternalLink, 
  Mail, 
  MessageSquare, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Share2,
  UserCheck,
  Globe
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ExternalCollaborator {
  id: string;
  email: string;
  name?: string;
  company?: string;
  status: 'invited' | 'viewed' | 'commented' | 'approved';
  invitedAt: Date;
  lastActivity?: Date;
  commentsCount: number;
  hasDownloaded: boolean;
}

interface ExternalCollaborationProps {
  projectId: string;
  collaborators: ExternalCollaborator[];
  onInviteCollaborator: (email: string, message: string) => void;
  onRemoveCollaborator: (collaboratorId: string) => void;
}

export const ExternalCollaboration = ({
  projectId,
  collaborators,
  onInviteCollaborator,
  onRemoveCollaborator
}: ExternalCollaborationProps) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [allowComments, setAllowComments] = useState(true);
  const [allowDownloads, setAllowDownloads] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);

  const getStatusIcon = (status: ExternalCollaborator['status']) => {
    switch (status) {
      case 'invited': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'viewed': return <Eye className="h-4 w-4 text-green-500" />;
      case 'commented': return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getStatusColor = (status: ExternalCollaborator['status']) => {
    switch (status) {
      case 'invited': return 'bg-blue-600';
      case 'viewed': return 'bg-green-600';
      case 'commented': return 'bg-purple-600';
      case 'approved': return 'bg-green-700';
    }
  };

  const handleSendInvite = () => {
    if (!inviteEmail) return;
    
    onInviteCollaborator(inviteEmail, inviteMessage);
    setInviteEmail('');
    setInviteMessage('');
    
    toast({
      title: "Invitation sent",
      description: `Collaboration invite sent to ${inviteEmail}`
    });
  };

  const generateShareLink = () => {
    const shareUrl = `https://frmzz.com/external/${projectId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Share link copied",
      description: "External collaboration link copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      {/* Invite External Collaborators */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <ExternalLink className="h-5 w-5 mr-2" />
            Invite External Collaborators
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Invite clients and external stakeholders to review and provide feedback
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Email Address</Label>
              <Input
                placeholder="client@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Personal Message (Optional)</Label>
              <Textarea
                placeholder="Hi! I'd love your feedback on this project..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Permission Settings */}
          <div className="space-y-4 p-4 bg-gray-700 rounded-lg">
            <h4 className="text-white font-medium">Access Permissions</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Allow Comments</Label>
                  <p className="text-xs text-gray-500">Enable feedback and reviews</p>
                </div>
                <Switch checked={allowComments} onCheckedChange={setAllowComments} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Allow Downloads</Label>
                  <p className="text-xs text-gray-500">Enable asset downloads</p>
                </div>
                <Switch checked={allowDownloads} onCheckedChange={setAllowDownloads} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Require Approval</Label>
                  <p className="text-xs text-gray-500">Need approval before access</p>
                </div>
                <Switch checked={requireApproval} onCheckedChange={setRequireApproval} />
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleSendInvite} disabled={!inviteEmail} className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
            <Button onClick={generateShareLink} variant="outline" className="border-gray-600">
              <Globe className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* External Collaborators List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              External Collaborators ({collaborators.length})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {collaborators.length === 0 ? (
            <div className="text-center py-8">
              <ExternalLink className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No external collaborators yet</h3>
              <p className="text-gray-500">Invite clients and stakeholders to review your work</p>
            </div>
          ) : (
            <div className="space-y-4">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gray-600 text-white">
                        {collaborator.name?.slice(0, 2).toUpperCase() || collaborator.email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">
                          {collaborator.name || collaborator.email}
                        </span>
                        <Badge className={getStatusColor(collaborator.status)}>
                          {getStatusIcon(collaborator.status)}
                          <span className="ml-1 capitalize">{collaborator.status}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{collaborator.email}</span>
                        {collaborator.company && (
                          <>
                            <span>•</span>
                            <span>{collaborator.company}</span>
                          </>
                        )}
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Invited {collaborator.invitedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Activity Summary */}
                    <div className="flex items-center space-x-3 text-sm text-gray-400">
                      {collaborator.commentsCount > 0 && (
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{collaborator.commentsCount}</span>
                        </div>
                      )}
                      {collaborator.hasDownloaded && (
                        <Download className="h-4 w-4 text-green-500" />
                      )}
                      {collaborator.lastActivity && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{collaborator.lastActivity.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onRemoveCollaborator(collaborator.id)}
                      className="border-red-600 text-red-400 hover:bg-red-600/10"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collaboration Analytics */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Collaboration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {collaborators.filter(c => c.status !== 'invited').length}
              </div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {collaborators.reduce((sum, c) => sum + c.commentsCount, 0)}
              </div>
              <div className="text-sm text-gray-400">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {collaborators.filter(c => c.hasDownloaded).length}
              </div>
              <div className="text-sm text-gray-400">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {collaborators.filter(c => c.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-400">Approved</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
