
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  ArrowLeft, 
  Share2, 
  Link, 
  Users, 
  Calendar as CalendarIcon, 
  Shield, 
  Download, 
  Eye,
  Lock,
  Globe,
  Copy,
  QrCode,
  Settings,
  BarChart3
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AdvancedSharingProps {
  onClose: () => void;
}

export const AdvancedSharing = ({ onClose }: AdvancedSharingProps) => {
  const [activeTab, setActiveTab] = useState("shares");
  const [expirationDate, setExpirationDate] = useState<Date>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const activeShares = [
    {
      id: "share-001",
      name: "Client Review - Summer Campaign",
      url: "https://frmzz.com/share/abc123",
      type: "review",
      recipients: 5,
      views: 23,
      downloads: 3,
      expires: "2024-06-30",
      passwordProtected: true,
      downloadEnabled: false,
      commentsEnabled: true,
      status: "active"
    },
    {
      id: "share-002", 
      name: "Final Delivery - Product Launch",
      url: "https://frmzz.com/share/def456",
      type: "delivery",
      recipients: 2,
      views: 8,
      downloads: 8,
      expires: "2024-07-15",
      passwordProtected: false,
      downloadEnabled: true,
      commentsEnabled: false,
      status: "active"
    },
    {
      id: "share-003",
      name: "Team Collaboration - Internal Review",
      url: "https://frmzz.com/share/ghi789",
      type: "collaboration",
      recipients: 12,
      views: 45,
      downloads: 0,
      expires: "Never",
      passwordProtected: false,
      downloadEnabled: false,
      commentsEnabled: true,
      status: "active"
    }
  ];

  const shareTemplates = [
    {
      id: "client-review",
      name: "Client Review",
      description: "Secure review link for client feedback",
      settings: {
        passwordProtected: true,
        downloadEnabled: false,
        commentsEnabled: true,
        viewTracking: true,
        expiration: "7 days"
      }
    },
    {
      id: "final-delivery",
      name: "Final Delivery",
      description: "Download link for final assets",
      settings: {
        passwordProtected: true,
        downloadEnabled: true,
        commentsEnabled: false,
        viewTracking: true,
        expiration: "30 days"
      }
    },
    {
      id: "team-collab",
      name: "Team Collaboration",
      description: "Internal sharing for team members",
      settings: {
        passwordProtected: false,
        downloadEnabled: false,
        commentsEnabled: true,
        viewTracking: false,
        expiration: "Never"
      }
    }
  ];

  const getShareTypeIcon = (type: string) => {
    switch (type) {
      case 'review': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'delivery': return <Download className="h-4 w-4 text-green-500" />;
      case 'collaboration': return <Users className="h-4 w-4 text-purple-500" />;
      default: return <Share2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Share URL has been copied to your clipboard."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onClose} variant="ghost" size="icon" className="text-gray-400">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">Advanced Sharing</h2>
            <p className="text-gray-400">Manage and control access to your content</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Share2 className="h-4 w-4 mr-2" />
          Create Share
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Shares</p>
                <p className="text-white text-2xl font-bold">{activeShares.length}</p>
              </div>
              <Link className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Views</p>
                <p className="text-white text-2xl font-bold">{activeShares.reduce((sum, share) => sum + share.views, 0)}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Downloads</p>
                <p className="text-white text-2xl font-bold">{activeShares.reduce((sum, share) => sum + share.downloads, 0)}</p>
              </div>
              <Download className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Recipients</p>
                <p className="text-white text-2xl font-bold">{activeShares.reduce((sum, share) => sum + share.recipients, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sharing Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="shares" className="text-gray-300">Active Shares</TabsTrigger>
          <TabsTrigger value="templates" className="text-gray-300">Templates</TabsTrigger>
          <TabsTrigger value="create" className="text-gray-300">Create Share</TabsTrigger>
          <TabsTrigger value="analytics" className="text-gray-300">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="shares" className="space-y-6">
          <div className="space-y-4">
            {activeShares.map((share) => (
              <Card key={share.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getShareTypeIcon(share.type)}
                      <div>
                        <h3 className="text-white font-medium">{share.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{share.recipients} recipients</span>
                          <span>•</span>
                          <span>{share.views} views</span>
                          <span>•</span>
                          <span>Expires: {share.expires}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="border-green-600 text-green-400">
                        {share.status}
                      </Badge>
                      {share.passwordProtected && <Lock className="h-4 w-4 text-yellow-500" />}
                      {share.downloadEnabled && <Download className="h-4 w-4 text-blue-500" />}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-700 rounded">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300 text-sm flex-1 truncate">{share.url}</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(share.url)}
                      className="p-1 h-auto"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-gray-600">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Analytics
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-600">
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-600">
                        <QrCode className="h-4 w-4 mr-1" />
                        QR Code
                      </Button>
                    </div>
                    <Button size="sm" variant="destructive">
                      Revoke Access
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shareTemplates.map((template) => (
              <Card key={template.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                  <p className="text-gray-400 text-sm">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Password Protected</span>
                      <Badge variant={template.settings.passwordProtected ? "default" : "secondary"}>
                        {template.settings.passwordProtected ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Downloads</span>
                      <Badge variant={template.settings.downloadEnabled ? "default" : "secondary"}>
                        {template.settings.downloadEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Comments</span>
                      <Badge variant={template.settings.commentsEnabled ? "default" : "secondary"}>
                        {template.settings.commentsEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Expiration</span>
                      <span className="text-white text-sm">{template.settings.expiration}</span>
                    </div>
                  </div>
                  <Button className="w-full" size="sm">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white">Create New Share</CardTitle>
              <p className="text-gray-400">Configure sharing settings for your content</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-300">Share Name</Label>
                <Input 
                  placeholder="Enter share name"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300">Share Type</Label>
                <Select>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select share type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="review">Client Review</SelectItem>
                    <SelectItem value="delivery">Final Delivery</SelectItem>
                    <SelectItem value="collaboration">Team Collaboration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Password Protection</Label>
                    <p className="text-sm text-gray-500">Require password to access</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Enable Downloads</Label>
                    <p className="text-sm text-gray-500">Allow recipients to download</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Enable Comments</Label>
                    <p className="text-sm text-gray-500">Allow feedback and comments</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">View Tracking</Label>
                    <p className="text-sm text-gray-500">Track who viewed content</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Expiration Date</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-gray-700 border-gray-600 text-white"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expirationDate ? format(expirationDate, "PPP") : "Select expiration date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                    <Calendar
                      mode="single"
                      selected={expirationDate}
                      onSelect={(date) => {
                        setExpirationDate(date);
                        setIsCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Create Share
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  Save as Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Share Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Most Viewed Share</span>
                    <span className="text-white font-medium">Team Collaboration</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Avg. View Time</span>
                    <span className="text-white font-medium">3m 42s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Download Rate</span>
                    <span className="text-white font-medium">15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Comment Rate</span>
                    <span className="text-white font-medium">28%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Security Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Password Protected</span>
                    <span className="text-white font-medium">67%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Expired Links</span>
                    <span className="text-white font-medium">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Revoked Access</span>
                    <span className="text-white font-medium">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Failed Access Attempts</span>
                    <span className="text-white font-medium">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
