
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Globe,
  Server,
  Database
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SecuritySettings {
  twoFactorAuth: boolean;
  ssoEnabled: boolean;
  passwordComplexity: 'low' | 'medium' | 'high';
  sessionTimeout: number;
  downloadRestrictions: boolean;
  watermarking: boolean;
  ipWhitelist: string[];
  auditLogging: boolean;
  dataRetention: number;
  encryptionAtRest: boolean;
}

interface ComplianceStandard {
  id: string;
  name: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  lastAudit: Date;
  requirements: number;
  completed: number;
}

interface SecurityComplianceProps {
  workspaceId: string;
}

export const SecurityCompliance = ({ workspaceId }: SecurityComplianceProps) => {
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorAuth: true,
    ssoEnabled: false,
    passwordComplexity: 'high',
    sessionTimeout: 480,
    downloadRestrictions: true,
    watermarking: true,
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    auditLogging: true,
    dataRetention: 2555,
    encryptionAtRest: true
  });

  const [complianceStandards] = useState<ComplianceStandard[]>([
    {
      id: 'soc2',
      name: 'SOC 2 Type II',
      status: 'compliant',
      lastAudit: new Date('2024-01-15'),
      requirements: 127,
      completed: 127
    },
    {
      id: 'gdpr',
      name: 'GDPR',
      status: 'compliant',
      lastAudit: new Date('2024-02-01'),
      requirements: 89,
      completed: 89
    },
    {
      id: 'hipaa',
      name: 'HIPAA',
      status: 'partial',
      lastAudit: new Date('2024-01-20'),
      requirements: 164,
      completed: 142
    },
    {
      id: 'iso27001',
      name: 'ISO 27001',
      status: 'non-compliant',
      lastAudit: new Date('2023-12-15'),
      requirements: 114,
      completed: 67
    }
  ]);

  const [auditLogs] = useState([
    {
      id: '1',
      timestamp: new Date(),
      user: 'john@company.com',
      action: 'Downloaded asset',
      resource: 'video_final_v3.mp4',
      ipAddress: '192.168.1.100'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      user: 'jane@company.com',
      action: 'Modified permissions',
      resource: 'Project Alpha',
      ipAddress: '10.0.1.50'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      user: 'admin@company.com',
      action: 'Created share link',
      resource: 'marketing_video.mp4',
      ipAddress: '192.168.1.10'
    }
  ]);

  const updateSetting = (key: keyof SecuritySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Security setting updated",
      description: `${key} has been updated successfully`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-600';
      case 'partial': return 'bg-yellow-600';
      case 'non-compliant': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4" />;
      case 'partial': return <Clock className="h-4 w-4" />;
      case 'non-compliant': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Security & Compliance</h2>
          <p className="text-gray-400">Manage security settings and compliance standards</p>
        </div>
        <Button variant="outline" className="border-gray-600 text-gray-300">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Tabs defaultValue="security" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="security" className="text-gray-300">Security Settings</TabsTrigger>
          <TabsTrigger value="compliance" className="text-gray-300">Compliance</TabsTrigger>
          <TabsTrigger value="audit" className="text-gray-300">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          {/* Authentication & Access */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Authentication & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-400">Require 2FA for all users</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Single Sign-On (SSO)</h4>
                  <p className="text-sm text-gray-400">Enable SAML/LDAP authentication</p>
                </div>
                <Switch
                  checked={settings.ssoEnabled}
                  onCheckedChange={(checked) => updateSetting('ssoEnabled', checked)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Password Complexity</label>
                  <Select 
                    value={settings.passwordComplexity} 
                    onValueChange={(value) => updateSetting('passwordComplexity', value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Session Timeout (minutes)</label>
                  <Input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Download Restrictions</h4>
                  <p className="text-sm text-gray-400">Control who can download assets</p>
                </div>
                <Switch
                  checked={settings.downloadRestrictions}
                  onCheckedChange={(checked) => updateSetting('downloadRestrictions', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Watermarking</h4>
                  <p className="text-sm text-gray-400">Add watermarks to shared content</p>
                </div>
                <Switch
                  checked={settings.watermarking}
                  onCheckedChange={(checked) => updateSetting('watermarking', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Encryption at Rest</h4>
                  <p className="text-sm text-gray-400">Encrypt stored data using AES-256</p>
                </div>
                <Switch
                  checked={settings.encryptionAtRest}
                  onCheckedChange={(checked) => updateSetting('encryptionAtRest', checked)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Data Retention (days)</label>
                <Input
                  type="number"
                  value={settings.dataRetention}
                  onChange={(e) => updateSetting('dataRetention', parseInt(e.target.value))}
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid gap-4">
            {complianceStandards.map((standard) => (
              <Card key={standard.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(standard.status)}`}>
                        {getStatusIcon(standard.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{standard.name}</h3>
                        <p className="text-sm text-gray-400">
                          Last audit: {standard.lastAudit.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(standard.status)} text-white`}>
                      {standard.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Requirements</span>
                      <span className="text-white">{standard.completed}/{standard.requirements}</span>
                    </div>
                    <Progress 
                      value={(standard.completed / standard.requirements) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-white font-medium">{log.action}</p>
                        <p className="text-sm text-gray-400">
                          {log.user} • {log.resource} • {log.ipAddress}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {log.timestamp.toLocaleString()}
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
