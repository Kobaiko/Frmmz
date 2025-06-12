import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Link, 
  Cloud, 
  Camera, 
  Palette, 
  Database,
  ArrowLeft,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";

interface IntegrationHubProps {
  onClose: () => void;
}

export const IntegrationHub = ({ onClose }: IntegrationHubProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const integrations = [
    {
      id: "adobe-premiere",
      name: "Adobe Premiere Pro",
      description: "Direct integration with Adobe Premiere Pro for seamless workflow",
      category: "creative",
      status: "connected",
      icon: Palette,
      features: ["Direct asset access", "Timeline sync", "Auto-save"]
    },
    {
      id: "camera-cloud",
      name: "Camera to Cloud",
      description: "Direct upload from professional cameras",
      category: "camera",
      status: "connected",
      icon: Camera,
      features: ["Real-time upload", "Automatic backup", "Metadata sync"]
    },
    {
      id: "aws-s3",
      name: "AWS S3",
      description: "Custom storage integration with Amazon S3",
      category: "storage",
      status: "pending",
      icon: Cloud,
      features: ["Custom buckets", "Cost optimization", "Global CDN"]
    },
    {
      id: "slack",
      name: "Slack",
      description: "Notifications and updates in your Slack workspace",
      category: "communication",
      status: "available",
      icon: Link,
      features: ["Comment notifications", "Review alerts", "Status updates"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'available': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'available': return <Plus className="h-4 w-4 text-gray-400" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
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
            <h2 className="text-2xl font-bold text-white">Integration Hub</h2>
            <p className="text-gray-400">Connect and manage third-party integrations</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Integration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="overview" className="text-gray-300">Overview</TabsTrigger>
          <TabsTrigger value="creative" className="text-gray-300">Creative Tools</TabsTrigger>
          <TabsTrigger value="storage" className="text-gray-300">Storage</TabsTrigger>
          <TabsTrigger value="enterprise" className="text-gray-300">Enterprise</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id} className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <integration.icon className="h-8 w-8 text-blue-500" />
                    {getStatusIcon(integration.status)}
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{integration.name}</CardTitle>
                    <Badge className={`${getStatusColor(integration.status)} text-white mt-2`}>
                      {integration.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">{integration.description}</p>
                  <div className="space-y-2">
                    {integration.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-gray-300 text-xs">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    variant={integration.status === 'connected' ? 'outline' : 'default'}
                    size="sm"
                  >
                    {integration.status === 'connected' ? 'Configure' : 'Connect'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="creative" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.filter(i => i.category === 'creative').map((integration) => (
              <Card key={integration.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <integration.icon className="h-10 w-10 text-blue-500" />
                    <div>
                      <CardTitle className="text-white">{integration.name}</CardTitle>
                      <p className="text-gray-400 text-sm">{integration.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Auto-sync timeline</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Real-time collaboration</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Asset management</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.filter(i => i.category === 'storage').map((integration) => (
              <Card key={integration.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <integration.icon className="h-10 w-10 text-blue-500" />
                    <div>
                      <CardTitle className="text-white">{integration.name}</CardTitle>
                      <p className="text-gray-400 text-sm">{integration.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-300 text-sm">Bucket Name</label>
                      <input 
                        type="text" 
                        className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded text-white"
                        placeholder="my-frmzz-bucket"
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">Region</label>
                      <select className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded text-white">
                        <option>us-east-1</option>
                        <option>us-west-2</option>
                        <option>eu-west-1</option>
                      </select>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Configure Storage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="enterprise" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Enterprise Integrations</CardTitle>
              <p className="text-gray-400">Advanced integrations for enterprise workflows</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Database className="h-8 w-8 text-blue-500" />
                    <div>
                      <h4 className="text-white font-medium">LDAP/Active Directory</h4>
                      <p className="text-gray-400 text-sm">Enterprise user authentication</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-gray-600 text-gray-300">
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Settings className="h-8 w-8 text-blue-500" />
                    <div>
                      <h4 className="text-white font-medium">SAML SSO</h4>
                      <p className="text-gray-400 text-sm">Single sign-on integration</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-gray-600 text-gray-300">
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Cloud className="h-8 w-8 text-blue-500" />
                    <div>
                      <h4 className="text-white font-medium">Custom API</h4>
                      <p className="text-gray-400 text-sm">Build custom integrations</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-gray-600 text-gray-300">
                    View Docs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
