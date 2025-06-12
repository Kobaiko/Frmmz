
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Share2, 
  Users, 
  Lock, 
  Calendar, 
  Eye, 
  Download, 
  MessageSquare,
  Copy,
  Mail,
  Link,
  Shield,
  Clock,
  X
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdvancedSharingProps {
  onClose: () => void;
}

export const AdvancedSharing = ({ onClose }: AdvancedSharingProps) => {
  const [showCreateShare, setShowCreateShare] = useState(false);
  const [shareSettings, setShareSettings] = useState({
    password: '',
    expiration: '',
    allowDownload: true,
    allowComments: true,
    requireApproval: false,
    trackViews: true
  });

  const [shares] = useState([
    {
      id: '1',
      name: 'Client Review - Final Cut',
      url: 'https://frmzz.com/share/abc123',
      recipients: ['client@company.com', 'director@studio.com'],
      permissions: 'view-comment',
      expiration: '2024-06-30',
      views: 24,
      comments: 8,
      status: 'active'
    },
    {
      id: '2', 
      name: 'Team Collaboration',
      url: 'https://frmzz.com/share/def456',
      recipients: ['team@company.com'],
      permissions: 'view-download-comment',
      expiration: 'never',
      views: 156,
      comments: 34,
      status: 'active'
    },
    {
      id: '3',
      name: 'External Stakeholder Review',
      url: 'https://frmzz.com/share/ghi789',
      recipients: ['stakeholder@external.com'],
      permissions: 'view-only',
      expiration: '2024-06-15',
      views: 12,
      comments: 3,
      status: 'expired'
    }
  ]);

  const [permissions] = useState([
    { id: 'view-only', name: 'View Only', description: 'Recipients can only view content' },
    { id: 'view-comment', name: 'View & Comment', description: 'Recipients can view and add comments' },
    { id: 'view-download', name: 'View & Download', description: 'Recipients can view and download content' },
    { id: 'view-download-comment', name: 'Full Access', description: 'Recipients can view, download, and comment' }
  ]);

  const handleCreateShare = () => {
    toast({
      title: "Share created",
      description: "Your share link has been created and copied to clipboard."
    });
    setShowCreateShare(false);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard."
    });
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'view-only': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'view-comment': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'view-download': return <Download className="h-4 w-4 text-purple-500" />;
      case 'view-download-comment': return <Users className="h-4 w-4 text-orange-500" />;
      default: return <Lock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Advanced Sharing</h1>
          <p className="text-gray-400">Manage shares and permissions for your content</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowCreateShare(true)} className="bg-blue-600 hover:bg-blue-700">
            <Share2 className="h-4 w-4 mr-2" />
            Create Share
          </Button>
          <Button onClick={onClose} variant="outline" className="border-gray-600 text-gray-300">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="active" className="text-gray-300">Active Shares</TabsTrigger>
          <TabsTrigger value="analytics" className="text-gray-300">Share Analytics</TabsTrigger>
          <TabsTrigger value="settings" className="text-gray-300">Default Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <div className="grid gap-4">
            {shares.map(share => (
              <Card key={share.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-white font-medium">{share.name}</h3>
                        <Badge variant={share.status === 'active' ? 'default' : 'secondary'}>
                          {share.status}
                        </Badge>
                        {getPermissionIcon(share.permissions)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Recipients</p>
                          <p className="text-white">{share.recipients.length} people</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Views</p>
                          <p className="text-white">{share.views}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Comments</p>
                          <p className="text-white">{share.comments}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Expires</p>
                          <p className="text-white">{share.expiration === 'never' ? 'Never' : share.expiration}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {share.recipients.map((recipient, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {recipient}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                        onClick={() => handleCopyLink(share.url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Views</p>
                    <p className="text-white text-2xl font-bold">192</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Comments</p>
                    <p className="text-white text-2xl font-bold">45</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Shares</p>
                    <p className="text-white text-2xl font-bold">{shares.filter(s => s.status === 'active').length}</p>
                  </div>
                  <Share2 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Default Share Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Default Permission Level</Label>
                <Select defaultValue="view-comment">
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {permissions.map(permission => (
                      <SelectItem key={permission.id} value={permission.id}>
                        {permission.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Require Password by Default</Label>
                  <p className="text-sm text-gray-500">New shares will require password protection</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Track Views</Label>
                  <p className="text-sm text-gray-500">Monitor who views shared content</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Auto-expire Shares</Label>
                  <p className="text-sm text-gray-500">Automatically expire shares after 30 days</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Share Dialog */}
      <Dialog open={showCreateShare} onOpenChange={setShowCreateShare}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Share</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Share Name</Label>
              <Input
                placeholder="Enter share name"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Recipients (email addresses)</Label>
              <Input
                placeholder="user@example.com, user2@example.com"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Permission Level</Label>
              <Select defaultValue="view-comment">
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {permissions.map(permission => (
                    <SelectItem key={permission.id} value={permission.id}>
                      <div>
                        <p className="font-medium">{permission.name}</p>
                        <p className="text-sm text-gray-400">{permission.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Password (optional)</Label>
                <Input
                  type="password"
                  placeholder="Set password"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Expiration Date</Label>
                <Input
                  type="date"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Allow Downloads</Label>
                <p className="text-sm text-gray-500">Recipients can download assets</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Allow Comments</Label>
                <p className="text-sm text-gray-500">Recipients can add comments</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowCreateShare(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateShare}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Share
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
