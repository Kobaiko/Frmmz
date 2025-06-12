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
  ArrowLeft,
  Download,
  Settings,
  Users,
  Key,
  Activity
} from "lucide-react";

interface SecurityComplianceProps {
  onClose: () => void;
}

export const SecurityCompliance = ({ onClose }: SecurityComplianceProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [auditLogging, setAuditLogging] = useState(true);

  const complianceStatus = [
    { name: "SOC 2 Type II", status: "compliant", score: 100, icon: Shield },
    { name: "GDPR", status: "compliant", score: 95, icon: Lock },
    { name: "HIPAA", status: "ready", score: 90, icon: FileText },
    { name: "ISO 27001", status: "in-progress", score: 78, icon: CheckCircle }
  ];

  const securityMetrics = [
    { label: "Failed Login Attempts", value: "3", change: "-50%", color: "text-green-500" },
    { label: "Active Sessions", value: "127", change: "+5%", color: "text-blue-500" },
    { label: "Data Exports", value: "8", change: "+12%", color: "text-yellow-500" },
    { label: "Permission Changes", value: "15", change: "-20%", color: "text-green-500" }
  ];

  const auditEvents = [
    {
      timestamp: "2024-01-15 14:30:00",
      user: "admin@company.com",
      action: "User role modified",
      resource: "user-management",
      severity: "medium"
    },
    {
      timestamp: "2024-01-15 13:45:00",
      user: "sarah.johnson@company.com",
      action: "Project shared externally",
      resource: "project-share",
      severity: "low"
    },
    {
      timestamp: "2024-01-15 12:20:00",
      user: "system",
      action: "Failed login attempt",
      resource: "authentication",
      severity: "high"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-600';
      case 'ready': return 'bg-blue-600';
      case 'in-progress': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-400';
    }
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
            <h2 className="text-2xl font-bold text-white">Security & Compliance</h2>
            <p className="text-gray-400">Monitor security status and compliance requirements</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="text-gray-300 border-gray-600">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" className="text-gray-300 border-gray-600">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityMetrics.map((metric, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{metric.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
                  <p className={`text-xs mt-1 ${metric.color}`}>{metric.change} from last week</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="overview" className="text-gray-300">Overview</TabsTrigger>
          <TabsTrigger value="compliance" className="text-gray-300">Compliance</TabsTrigger>
          <TabsTrigger value="access" className="text-gray-300">Access Control</TabsTrigger>
          <TabsTrigger value="audit" className="text-gray-300">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-500" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Two-Factor Authentication</span>
                    <Switch checked={mfaEnabled} onCheckedChange={setMfaEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Single Sign-On</span>
                    <Switch checked={ssoEnabled} onCheckedChange={setSsoEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Audit Logging</span>
                    <Switch checked={auditLogging} onCheckedChange={setAuditLogging} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Data Encryption</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">Multiple failed login attempts</p>
                      <p className="text-gray-400 text-xs">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">External share link created</p>
                      <p className="text-gray-400 text-xs">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">New user added to workspace</p>
                      <p className="text-gray-400 text-xs">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {complianceStatus.map((compliance, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <compliance.icon className="h-8 w-8 text-blue-500" />
                      <div>
                        <CardTitle className="text-white">{compliance.name}</CardTitle>
                        <Badge className={`${getStatusColor(compliance.status)} text-white mt-1`}>
                          {compliance.status}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-white">{compliance.score}%</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={compliance.score} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Compliance Score</span>
                      <span className="text-white">{compliance.score}/100</span>
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
              <CardTitle className="text-white flex items-center">
                <Key className="h-5 w-5 mr-2 text-blue-500" />
                Access Control Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Password Policy</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-300 text-sm">Minimum Length</label>
                      <input 
                        type="number" 
                        defaultValue="8"
                        className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">Password Expiry (days)</label>
                      <input 
                        type="number" 
                        defaultValue="90"
                        className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-medium">Session Management</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-300 text-sm">Session Timeout (minutes)</label>
                      <input 
                        type="number" 
                        defaultValue="60"
                        className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">Max Concurrent Sessions</label>
                      <input 
                        type="number" 
                        defaultValue="3"
                        className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                  </div>
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Eye className="h-5 w-5 mr-2 text-blue-500" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(event.severity).replace('text-', 'bg-')}`}></div>
                      <div>
                        <p className="text-white font-medium">{event.action}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span>{event.user}</span>
                          <span>•</span>
                          <span>{event.resource}</span>
                          <span>•</span>
                          <span>{event.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getSeverityColor(event.severity).replace('text-', 'bg-')} text-white`}>
                      {event.severity}
                    </Badge>
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
