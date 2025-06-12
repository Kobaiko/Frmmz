
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Palette, 
  Camera, 
  Cloud, 
  Slack, 
  Github, 
  FileText, 
  Zap, 
  Settings, 
  Plus,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface IntegrationHubProps {
  onClose: () => void;
}

export const IntegrationHub = ({ onClose }: IntegrationHubProps) => {
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [integrations, setIntegrations] = useState([
    {
      id: 'adobe-premiere',
      name: 'Adobe Premiere Pro',
      description: 'Direct integration with Premiere Pro for seamless editing workflows',
      icon: Palette,
      category: 'creative',
      status: 'connected',
      config: { autoSync: true, proxySettings: 'auto' }
    },
    {
      id: 'adobe-after-effects',
      name: 'Adobe After Effects',
      description: 'Connect with After Effects for motion graphics and VFX',
      icon: Palette,
      category: 'creative',
      status: 'available',
      config: {}
    },
    {
      id: 'camera-to-cloud',
      name: 'Camera to Cloud',
      description: 'Direct upload from professional cameras',
      icon: Camera,
      category: 'capture',
      status: 'connected',
      config: { autoUpload: true, qualitySettings: 'original' }
    },
    {
      id: 'aws-s3',
      name: 'AWS S3',
      description: 'Connect your own S3 bucket for storage',
      icon: Cloud,
      category: 'storage',
      status: 'available',
      config: {}
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications and updates in Slack',
      icon: Slack,
      category: 'communication',
      status: 'connected',
      config: { channels: ['#video-team', '#general'], notifications: true }
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Version control for project assets',
      icon: Github,
      category: 'development',
      status: 'available',
      config: {}
    },
    {
      id: 'asana',
      name: 'Asana',
      description: 'Sync project tasks and deadlines',
      icon: FileText,
      category: 'project-management',
      status: 'available',
      config: {}
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect with 5000+ apps through Zapier',
      icon: Zap,
      category: 'automation',
      status: 'available',
      config: {}
    }
  ]);

  const categories = [
    { value: 'all', label: 'All Integrations' },
    { value: 'creative', label: 'Creative Tools' },
    { value: 'capture', label: 'Capture & Upload' },
    { value: 'storage', label: 'Storage' },
    { value: 'communication', label: 'Communication' },
    { value: 'project-management', label: 'Project Management' },
    { value: 'automation', label: 'Automation' }
  ];

  const [activeCategory, setActiveCategory] = useState('all');

  const filteredIntegrations = activeCategory === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.category === activeCategory);

  const handleConnect = (integration: any) => {
    setSelectedIntegration(integration);
    setShowConnectDialog(true);
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'available', config: {} }
        : integration
    ));
    toast({
      title: "Integration disconnected",
      description: `${integrations.find(i => i.id === integrationId)?.name} has been disconnected.`
    });
  };

  const handleConfigSave = (integrationId: string, config: any) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'connected', config }
        : integration
    ));
    setShowConnectDialog(false);
    toast({
      title: "Integration connected",
      description: `${selectedIntegration?.name} has been connected successfully.`
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Integration Hub</h1>
          <p className="text-gray-400">Connect Frmzz with your favorite tools and services</p>
        </div>
        <Button onClick={onClose} variant="outline" className="border-gray-600 text-gray-300">
          Close
        </Button>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="browse" className="text-gray-300">
            Browse Integrations
          </TabsTrigger>
          <TabsTrigger value="connected" className="text-gray-300">
            Connected ({integrations.filter(i => i.status === 'connected').length})
          </TabsTrigger>
          <TabsTrigger value="api" className="text-gray-300">
            API & Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => (
              <Button
                key={category.value}
                variant={activeCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.value)}
                className={activeCategory === category.value 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "border-gray-600 text-gray-300 hover:bg-gray-700"
                }
              >
                {category.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map(integration => {
              const IconComponent = integration.icon;
              return (
                <Card key={integration.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{integration.name}</CardTitle>
                          <Badge 
                            variant={integration.status === 'connected' ? 'default' : 'secondary'}
                            className={integration.status === 'connected' ? 'bg-green-600' : ''}
                          >
                            {integration.status}
                          </Badge>
                        </div>
                      </div>
                      {getStatusIcon(integration.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-400 text-sm">{integration.description}</p>
                    
                    <div className="flex space-x-2">
                      {integration.status === 'connected' ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-gray-600 text-gray-300 flex-1"
                            onClick={() => handleConnect(integration)}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Configure
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-600 text-red-400 hover:bg-red-600"
                            onClick={() => handleDisconnect(integration.id)}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 w-full"
                          onClick={() => handleConnect(integration)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="connected" className="space-y-6">
          <div className="space-y-4">
            {integrations.filter(i => i.status === 'connected').map(integration => {
              const IconComponent = integration.icon;
              return (
                <Card key={integration.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{integration.name}</h3>
                          <p className="text-gray-400 text-sm">{integration.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-500 text-sm">Connected</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-gray-600 text-gray-300"
                          onClick={() => handleConnect(integration)}
                        >
                          Configure
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-600 text-red-400"
                          onClick={() => handleDisconnect(integration.id)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">API Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    value="frmzz_api_key_********************"
                    readOnly
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700">Regenerate</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Webhook URL</Label>
                <Input
                  placeholder="https://yourapp.com/webhook"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Enable Webhooks</Label>
                  <p className="text-sm text-gray-500">Receive real-time notifications</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Connect/Configure Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedIntegration?.status === 'connected' ? 'Configure' : 'Connect'} {selectedIntegration?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedIntegration?.id === 'adobe-premiere' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Auto-sync projects</Label>
                  <p className="text-sm text-gray-500">Automatically sync Premiere Pro projects</p>
                </div>
                <Switch defaultChecked={selectedIntegration.config.autoSync} />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Proxy Settings</Label>
                <select className="w-full bg-gray-700 border-gray-600 text-white rounded px-3 py-2">
                  <option value="auto">Auto</option>
                  <option value="low">Low Quality</option>
                  <option value="medium">Medium Quality</option>
                  <option value="high">High Quality</option>
                </select>
              </div>
            </div>
          )}

          {selectedIntegration?.id === 'slack' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Slack Workspace</Label>
                <Input placeholder="your-workspace.slack.com" className="bg-gray-700 border-gray-600 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Channels to notify</Label>
                <Input placeholder="#video-team, #general" className="bg-gray-700 border-gray-600 text-white" />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowConnectDialog(false)} className="border-gray-600 text-gray-300">
              Cancel
            </Button>
            <Button 
              onClick={() => handleConfigSave(selectedIntegration?.id, selectedIntegration?.config)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {selectedIntegration?.status === 'connected' ? 'Save Changes' : 'Connect'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
