
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, Shield, Database, Bell, CreditCard } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WorkspaceSettingsProps {
  onClose: () => void;
}

export const WorkspaceSettings = ({ onClose }: WorkspaceSettingsProps) => {
  const [workspaceSettings, setWorkspaceSettings] = useState({
    name: "Yair's Workspace",
    description: "Professional video production workspace",
    timezone: "America/New_York",
    storageLimit: "100GB",
    retentionPolicy: "90 days",
    autoApproval: false,
    guestAccess: true,
    downloadTracking: true,
    watermarking: false,
    ssoEnabled: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: false,
    sessionTimeout: "8 hours",
    ipWhitelist: "",
    passwordPolicy: "standard",
    auditLogging: true
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Workspace settings have been updated successfully."
    });
    onClose();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Workspace Settings</h1>
        <Button onClick={onClose} variant="outline" className="border-gray-600 text-gray-300">
          Close
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800">
          <TabsTrigger value="general" className="text-gray-300">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="users" className="text-gray-300">
            <Users className="h-4 w-4 mr-2" />
            Users & Roles
          </TabsTrigger>
          <TabsTrigger value="security" className="text-gray-300">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="storage" className="text-gray-300">
            <Database className="h-4 w-4 mr-2" />
            Storage
          </TabsTrigger>
          <TabsTrigger value="billing" className="text-gray-300">
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Workspace Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Workspace Name</Label>
                <Input
                  value={workspaceSettings.name}
                  onChange={(e) => setWorkspaceSettings(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Description</Label>
                <Input
                  value={workspaceSettings.description}
                  onChange={(e) => setWorkspaceSettings(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Timezone</Label>
                <Select value={workspaceSettings.timezone} onValueChange={(value) => setWorkspaceSettings(prev => ({ ...prev, timezone: value }))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Collaboration Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Guest Access</Label>
                  <p className="text-sm text-gray-500">Allow external users to access shared content</p>
                </div>
                <Switch
                  checked={workspaceSettings.guestAccess}
                  onCheckedChange={(checked) => setWorkspaceSettings(prev => ({ ...prev, guestAccess: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Auto-approval</Label>
                  <p className="text-sm text-gray-500">Automatically approve comments from team members</p>
                </div>
                <Switch
                  checked={workspaceSettings.autoApproval}
                  onCheckedChange={(checked) => setWorkspaceSettings(prev => ({ ...prev, autoApproval: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Download Tracking</Label>
                  <p className="text-sm text-gray-500">Track when assets are downloaded</p>
                </div>
                <Switch
                  checked={workspaceSettings.downloadTracking}
                  onCheckedChange={(checked) => setWorkspaceSettings(prev => ({ ...prev, downloadTracking: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-white">Team Members</h3>
                  <Button className="bg-blue-600 hover:bg-blue-700">Invite Users</Button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Yair Kivalko", email: "yair@example.com", role: "Owner", status: "Active" },
                    { name: "John Smith", email: "john@example.com", role: "Admin", status: "Active" },
                    { name: "Sarah Johnson", email: "sarah@example.com", role: "Collaborator", status: "Pending" }
                  ].map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                          {user.status}
                        </Badge>
                        <Select defaultValue={user.role}>
                          <SelectTrigger className="w-32 bg-gray-600 border-gray-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="Owner">Owner</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Collaborator">Collaborator</SelectItem>
                            <SelectItem value="Reviewer">Reviewer</SelectItem>
                            <SelectItem value="Viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Security & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Two-Factor Authentication Required</Label>
                  <p className="text-sm text-gray-500">Require 2FA for all workspace members</p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorRequired}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorRequired: checked }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Session Timeout</Label>
                <Select value={securitySettings.sessionTimeout} onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: value }))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="1 hour">1 hour</SelectItem>
                    <SelectItem value="4 hours">4 hours</SelectItem>
                    <SelectItem value="8 hours">8 hours</SelectItem>
                    <SelectItem value="24 hours">24 hours</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Audit Logging</Label>
                  <p className="text-sm text-gray-500">Log all user activities for compliance</p>
                </div>
                <Switch
                  checked={securitySettings.auditLogging}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, auditLogging: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Storage Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Storage Usage</Label>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>45.2 GB used</span>
                    <span>100 GB total</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Retention Policy</Label>
                <Select value={workspaceSettings.retentionPolicy} onValueChange={(value) => setWorkspaceSettings(prev => ({ ...prev, retentionPolicy: value }))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="30 days">30 days</SelectItem>
                    <SelectItem value="90 days">90 days</SelectItem>
                    <SelectItem value="1 year">1 year</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Billing & Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">Professional Plan</h3>
                    <p className="text-gray-400">$29/month per user</p>
                  </div>
                  <Badge className="bg-blue-600">Current Plan</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Users</p>
                    <p className="text-white">3 of 10</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Storage</p>
                    <p className="text-white">45.2 GB of 100 GB</p>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Upgrade to Enterprise
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
        <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300">
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          Save Changes
        </Button>
      </div>
    </div>
  );
};
