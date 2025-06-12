
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  Lock, 
  Key, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Download,
  UserCheck,
  Globe
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SecurityComplianceProps {
  onClose: () => void;
}

export const SecurityCompliance = ({ onClose }: SecurityComplianceProps) => {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: true,
    ssoEnabled: true,
    sessionTimeout: "8 hours",
    passwordPolicy: "strong",
    ipWhitelist: "192.168.1.0/24, 10.0.0.0/8",
    auditLogging: true,
    encryptionAtRest: true,
    dataRetention: "7 years"
  });

  const [complianceStatus] = useState([
    { standard: "SOC 2 Type II", status: "compliant", lastAudit: "2024-01-15", nextAudit: "2025-01-15" },
    { standard: "GDPR", status: "compliant", lastAudit: "2024-01-10", nextAudit: "2024-07-10" },
    { standard: "HIPAA", status: "ready", lastAudit: "N/A", nextAudit: "On request" },
    { standard: "ISO 27001", status: "in-progress", lastAudit: "2024-01-20", nextAudit: "2024-06-20" }
  ]);

  const [accessRequests] = useState([
    { user: "john.doe@external.com", resource: "Project Alpha", level: "Viewer", status: "pending", requested: "2024-01-15" },
    { user: "sarah.smith@client.com", resource: "Campaign Assets", level: "Reviewer", status: "approved", requested: "2024-01-14" },
    { user: "mike.wilson@vendor.com", resource: "Raw Footage", level: "Downloader", status: "denied", requested: "2024-01-13" }
  ]);

  const [auditLogs] = useState([
    { timestamp: "2024-01-15 14:30:22", user: "admin@company.com", action: "User created", resource: "john.doe@company.com", ip: "192.168.1.100" },
    { timestamp: "2024-01-15 14:25:10", user: "sarah.smith@company.com", action: "File downloaded", resource: "video_final.mp4", ip: "192.168.1.101" },
    { timestamp: "2024-01-15 14:20:55", user: "mike.johnson@company.com", action: "Project accessed", resource: "Project Alpha", ip: "192.168.1.102" },
    { timestamp: "2024-01-15 14:15:33", user: "admin@company.com", action: "Permission changed", resource: "Campaign Assets", ip: "192.168.1.100" }
  ]);

  const handleSaveSettings = () => {
    toast({
      title: "Security settings saved",
      description: "Security and compliance settings have been updated successfully."
    });
  };

  const handleAccessRequest = (requestIndex: number, action: 'approve' | 'deny') => {
    toast({
      title: `Access request ${action}d`,
      description: `The access request has been ${action}d successfully.`
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-green-600">Compliant</Badge>;
      case 'ready':
        return <Badge className="bg-blue-600">Ready</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-600">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'denied':
        return <Badge className="bg-red-600">Denied</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Security & Compliance</h1>
          <p className="text-gray-400">Manage security settings and compliance requirements</p>
        </div>
        <Button onClick={onClose} variant="outline" className="border-gray-600 text-gray-300">
          Close
        </Button>
      </div>

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="security" className="text-gray-300">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="compliance" className="text-gray-300">
            <FileCheck className="h-4 w-4 mr-2" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="access" className="text-gray-300">
            <UserCheck className="h-4 w-4 mr-2" />
            Access Control
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-gray-300">
            <Eye className="h-4 w-4 mr-2" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Authentication & Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Two-Factor Authentication Required</Label>
                    <p className="text-sm text-gray-500">Require 2FA for all users</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorRequired}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorRequired: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Single Sign-On (SSO)</Label>
                    <p className="text-sm text-gray-500">Enable SAML/LDAP integration</p>
                  </div>
                  <Switch
                    checked={securitySettings.ssoEnabled}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, ssoEnabled: checked }))}
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
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Password Policy</Label>
                  <Select value={securitySettings.passwordPolicy} onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, passwordPolicy: value }))}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                      <SelectItem value="standard">Standard (8+ chars, mixed case)</SelectItem>
                      <SelectItem value="strong">Strong (12+ chars, complex)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Encryption at Rest</Label>
                    <p className="text-sm text-gray-500">AES-256 encryption for stored data</p>
                  </div>
                  <Switch
                    checked={securitySettings.encryptionAtRest}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, encryptionAtRest: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Audit Logging</Label>
                    <p className="text-sm text-gray-500">Log all user activities</p>
                  </div>
                  <Switch
                    checked={securitySettings.auditLogging}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, auditLogging: checked }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Data Retention Period</Label>
                  <Select value={securitySettings.dataRetention} onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, dataRetention: value }))}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="1 year">1 year</SelectItem>
                      <SelectItem value="3 years">3 years</SelectItem>
                      <SelectItem value="7 years">7 years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">IP Whitelist</Label>
                  <Input
                    value={securitySettings.ipWhitelist}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="192.168.1.0/24, 10.0.0.0/8"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
              Save Security Settings
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {item.status === 'compliant' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : item.status === 'in-progress' ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <Shield className="h-5 w-5 text-blue-500" />
                        )}
                        <h3 className="text-white font-medium">{item.standard}</h3>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-400">Last Audit: {item.lastAudit}</p>
                      <p className="text-gray-400">Next Audit: {item.nextAudit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Pending Access Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accessRequests.map((request, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-white font-medium">{request.user}</p>
                        <p className="text-gray-400 text-sm">
                          Requesting {request.level} access to {request.resource}
                        </p>
                        <p className="text-gray-500 text-xs">Requested: {request.requested}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(request.status)}
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleAccessRequest(index, 'approve')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-400"
                            onClick={() => handleAccessRequest(index, 'deny')}
                          >
                            Deny
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Audit Trail</CardTitle>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="access">Access Events</SelectItem>
                      <SelectItem value="changes">Changes</SelectItem>
                      <SelectItem value="downloads">Downloads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-400 font-mono">{log.timestamp}</span>
                      <span className="text-white">{log.user}</span>
                      <span className="text-blue-400">{log.action}</span>
                      <span className="text-gray-300">{log.resource}</span>
                    </div>
                    <span className="text-gray-400 font-mono">{log.ip}</span>
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
