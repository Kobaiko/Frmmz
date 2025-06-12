
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Lock, 
  Eye, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Key,
  Globe,
  Database,
  Clock,
  Download,
  Settings,
  Users,
  Activity
} from "lucide-react";

interface SecurityEvent {
  id: string;
  type: 'login' | 'access' | 'export' | 'share' | 'admin';
  user: string;
  action: string;
  timestamp: string;
  ip: string;
  location: string;
  risk: 'low' | 'medium' | 'high';
}

export const SecurityCompliance = () => {
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [auditLogging, setAuditLogging] = useState(true);
  const [encryptionAtRest, setEncryptionAtRest] = useState(true);

  const securityScore = 92;
  
  const complianceStatus = [
    { standard: "SOC 2 Type II", status: "certified", expiryDate: "Dec 2024", icon: CheckCircle, color: "text-green-500" },
    { standard: "GDPR", status: "compliant", expiryDate: "Ongoing", icon: CheckCircle, color: "text-green-500" },
    { standard: "HIPAA", status: "ready", expiryDate: "On request", icon: Shield, color: "text-blue-500" },
    { standard: "ISO 27001", status: "in-progress", expiryDate: "Q2 2024", icon: Clock, color: "text-yellow-500" }
  ];

  const recentSecurityEvents: SecurityEvent[] = [
    {
      id: "1",
      type: "login",
      user: "sarah.johnson@company.com",
      action: "Successful login",
      timestamp: "2 hours ago",
      ip: "192.168.1.100",
      location: "New York, US",
      risk: "low"
    },
    {
      id: "2",
      type: "export",
      user: "mike.chen@company.com",
      action: "Exported video assets",
      timestamp: "4 hours ago",
      ip: "203.0.113.45",
      location: "San Francisco, US",
      risk: "medium"
    },
    {
      id: "3",
      type: "admin",
      user: "admin@company.com",
      action: "Modified user permissions",
      timestamp: "6 hours ago",
      ip: "198.51.100.22",
      location: "Chicago, US",
      risk: "high"
    },
    {
      id: "4",
      type: "share",
      user: "emily.davis@company.com",
      action: "Created external share",
      timestamp: "8 hours ago",
      ip: "192.0.2.33",
      location: "Los Angeles, US",
      risk: "low"
    }
  ];

  const dataRetentionPolicies = [
    { type: "Video Assets", retention: "7 years", autoDelete: true, encrypted: true },
    { type: "Comments & Reviews", retention: "3 years", autoDelete: true, encrypted: true },
    { type: "User Activity Logs", retention: "1 year", autoDelete: false, encrypted: true },
    { type: "Audit Trails", retention: "10 years", autoDelete: false, encrypted: true }
  ];

  const accessControls = [
    { feature: "Multi-Factor Authentication", enabled: mfaEnabled, critical: true },
    { feature: "Single Sign-On (SSO)", enabled: ssoEnabled, critical: true },
    { feature: "Role-Based Access Control", enabled: true, critical: true },
    { feature: "Session Management", enabled: true, critical: false },
    { feature: "IP Whitelisting", enabled: false, critical: false },
    { feature: "Device Management", enabled: true, critical: false }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-500 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-500 bg-yellow-100 border-yellow-200';
      default: return 'text-green-500 bg-green-100 border-green-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return Users;
      case 'access': return Eye;
      case 'export': return Download;
      case 'share': return Globe;
      case 'admin': return Settings;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Security & Compliance</h2>
          <p className="text-gray-400">Enterprise-grade security and compliance management</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-gray-600 text-gray-300">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Shield className="h-4 w-4 mr-2" />
            Security Audit
          </Button>
        </div>
      </div>

      {/* Security Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-600 rounded-full">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Security Score</p>
                <p className="text-3xl font-bold text-white">{securityScore}/100</p>
                <Progress value={securityScore} className="w-20 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-600 rounded-full">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Active Sessions</p>
                <p className="text-3xl font-bold text-white">247</p>
                <p className="text-green-500 text-sm">+12% from last week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-600 rounded-full">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Security Incidents</p>
                <p className="text-3xl font-bold text-white">0</p>
                <p className="text-green-500 text-sm">No incidents this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Security Tabs */}
      <Tabs defaultValue="compliance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="compliance" className="text-gray-300">Compliance</TabsTrigger>
          <TabsTrigger value="access" className="text-gray-300">Access Control</TabsTrigger>
          <TabsTrigger value="audit" className="text-gray-300">Audit Logs</TabsTrigger>
          <TabsTrigger value="data" className="text-gray-300">Data Protection</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {complianceStatus.map((compliance, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <compliance.icon className={`h-6 w-6 ${compliance.color}`} />
                      <h3 className="text-white font-medium">{compliance.standard}</h3>
                    </div>
                    <Badge 
                      className={
                        compliance.status === 'certified' || compliance.status === 'compliant' 
                          ? 'bg-green-600 text-white' 
                          : compliance.status === 'ready'
                          ? 'bg-blue-600 text-white'
                          : 'bg-yellow-600 text-white'
                      }
                    >
                      {compliance.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Status</span>
                      <span className="text-white capitalize">{compliance.status}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Expires</span>
                      <span className="text-white">{compliance.expiryDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Access Control Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {accessControls.map((control, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${control.critical ? 'bg-red-600' : 'bg-blue-600'}`}>
                      <Key className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{control.feature}</h4>
                      {control.critical && (
                        <Badge variant="destructive" className="text-xs mt-1">Critical</Badge>
                      )}
                    </div>
                  </div>
                  <Switch 
                    checked={control.enabled} 
                    onCheckedChange={(checked) => {
                      if (control.feature === "Multi-Factor Authentication") setMfaEnabled(checked);
                      if (control.feature === "Single Sign-On (SSO)") setSsoEnabled(checked);
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Recent Security Events</CardTitle>
                <Switch 
                  checked={auditLogging} 
                  onCheckedChange={setAuditLogging}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSecurityEvents.map((event) => {
                  const EventIcon = getEventIcon(event.type);
                  return (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <EventIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-white font-medium">{event.action}</p>
                          <p className="text-gray-400 text-sm">{event.user} • {event.timestamp}</p>
                          <p className="text-gray-500 text-xs">{event.ip} • {event.location}</p>
                        </div>
                      </div>
                      <Badge className={getRiskColor(event.risk)}>
                        {event.risk} risk
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Data Encryption</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-blue-500" />
                    <span className="text-white">Encryption at Rest</span>
                  </div>
                  <Switch checked={encryptionAtRest} onCheckedChange={setEncryptionAtRest} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-green-500" />
                    <span className="text-white">Encryption in Transit</span>
                  </div>
                  <Badge className="bg-green-600 text-white">TLS 1.3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-purple-500" />
                    <span className="text-white">Key Management</span>
                  </div>
                  <Badge className="bg-purple-600 text-white">AES-256</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Data Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dataRetentionPolicies.map((policy, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                      <div>
                        <p className="text-white font-medium text-sm">{policy.type}</p>
                        <p className="text-gray-400 text-xs">Retention: {policy.retention}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {policy.encrypted && (
                          <Badge variant="outline" className="text-xs border-green-600 text-green-500">
                            Encrypted
                          </Badge>
                        )}
                        {policy.autoDelete && (
                          <Badge variant="outline" className="text-xs border-blue-600 text-blue-500">
                            Auto-delete
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
