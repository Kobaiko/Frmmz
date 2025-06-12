
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Settings, 
  Plus, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Search,
  Zap,
  Camera,
  Cloud,
  FileVideo,
  Palette,
  Mail,
  MessageSquare,
  Calendar,
  Archive,
  Shield
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'connected' | 'available' | 'disconnected';
  icon: any;
  color: string;
  features: string[];
  lastSync?: string;
  version?: string;
}

export const IntegrationHub = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const integrations: Integration[] = [
    {
      id: "adobe-premiere",
      name: "Adobe Premiere Pro",
      description: "Direct integration with Premiere Pro for seamless editing workflows",
      category: "creative",
      status: "connected",
      icon: Palette,
      color: "bg-purple-600",
      features: ["Direct export", "Timeline sync", "Asset linking"],
      lastSync: "2 hours ago",
      version: "v2.1.0"
    },
    {
      id: "adobe-aftereffects",
      name: "Adobe After Effects",
      description: "Motion graphics and VFX integration",
      category: "creative",
      status: "connected",
      icon: Zap,
      color: "bg-blue-600",
      features: ["Composition sync", "Asset import", "Render queue"],
      lastSync: "1 hour ago",
      version: "v1.8.3"
    },
    {
      id: "camera-to-cloud",
      name: "Camera to Cloud",
      description: "Direct upload from professional cameras",
      category: "capture",
      status: "connected",
      icon: Camera,
      color: "bg-green-600",
      features: ["Real-time upload", "Multiple camera support", "Metadata sync"],
      lastSync: "30 min ago",
      version: "v3.0.1"
    },
    {
      id: "aws-s3",
      name: "AWS S3",
      description: "Cloud storage integration for scalable asset management",
      category: "storage",
      status: "connected",
      icon: Cloud,
      color: "bg-orange-600",
      features: ["Unlimited storage", "CDN integration", "Backup automation"],
      lastSync: "15 min ago",
      version: "v2.4.0"
    },
    {
      id: "slack",
      name: "Slack",
      description: "Team communication and notifications",
      category: "communication",
      status: "available",
      icon: MessageSquare,
      color: "bg-green-500",
      features: ["Comment notifications", "Approval alerts", "Status updates"]
    },
    {
      id: "teams",
      name: "Microsoft Teams",
      description: "Enterprise communication platform",
      category: "communication",
      status: "available",
      icon: MessageSquare,
      color: "bg-blue-500",
      features: ["Video calls", "Chat integration", "File sharing"]
    },
    {
      id: "google-drive",
      name: "Google Drive",
      description: "Cloud storage and collaboration",
      category: "storage",
      status: "disconnected",
      icon: Archive,
      color: "bg-yellow-600",
      features: ["File sync", "Collaborative editing", "Version control"]
    },
    {
      id: "okta",
      name: "Okta",
      description: "Enterprise identity and access management",
      category: "security",
      status: "available",
      icon: Shield,
      color: "bg-indigo-600",
      features: ["SSO", "Multi-factor auth", "User provisioning"]
    }
  ];

  const categories = [
    { id: "all", name: "All Integrations", count: integrations.length },
    { id: "creative", name: "Creative Tools", count: integrations.filter(i => i.category === "creative").length },
    { id: "capture", name: "Capture & Upload", count: integrations.filter(i => i.category === "capture").length },
    { id: "storage", name: "Storage", count: integrations.filter(i => i.category === "storage").length },
    { id: "communication", name: "Communication", count: integrations.filter(i => i.category === "communication").length },
    { id: "security", name: "Security", count: integrations.filter(i => i.category === "security").length }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-600 text-white">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Disconnected</Badge>;
      default:
        return <Badge variant="secondary">Available</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Plus className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Integration Hub</h2>
          <p className="text-gray-400">Connect your favorite tools and services</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-6 bg-gray-800">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-gray-300">
              {category.name} ({category.count})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6 mt-6">
          {/* Integration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${integration.color}`}>
                        <integration.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{integration.name}</CardTitle>
                        {integration.version && (
                          <p className="text-gray-400 text-sm">{integration.version}</p>
                        )}
                      </div>
                    </div>
                    {getStatusIcon(integration.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-300 text-sm">{integration.description}</p>
                  
                  {/* Features */}
                  <div className="space-y-2">
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Status and Actions */}
                  <div className="flex items-center justify-between pt-2">
                    {getStatusBadge(integration.status)}
                    <div className="flex items-center space-x-2">
                      {integration.status === 'connected' && (
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant={integration.status === 'connected' ? 'outline' : 'default'}
                        size="sm"
                        className={integration.status === 'connected' ? 'border-gray-600' : 'bg-blue-600 hover:bg-blue-700'}
                      >
                        {integration.status === 'connected' ? 'Configure' : 'Connect'}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Last Sync */}
                  {integration.lastSync && (
                    <p className="text-gray-500 text-xs">Last sync: {integration.lastSync}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-white text-lg font-medium mb-2">No integrations found</h3>
              <p className="text-gray-400">Try adjusting your search or category filter</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Setup Guide */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-600 rounded-full flex items-center justify-center">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-white font-medium mb-2">Creative Tools</h4>
              <p className="text-gray-400 text-sm">Connect Adobe Creative Cloud for seamless editing workflows</p>
              <Button variant="outline" size="sm" className="mt-3 border-gray-600">
                Get Started
              </Button>
            </div>
            
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-600 rounded-full flex items-center justify-center">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-white font-medium mb-2">Camera Integration</h4>
              <p className="text-gray-400 text-sm">Set up Camera to Cloud for direct uploads from your cameras</p>
              <Button variant="outline" size="sm" className="mt-3 border-gray-600">
                Configure
              </Button>
            </div>
            
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-3 bg-orange-600 rounded-full flex items-center justify-center">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-white font-medium mb-2">Cloud Storage</h4>
              <p className="text-gray-400 text-sm">Connect your preferred cloud storage for expanded capacity</p>
              <Button variant="outline" size="sm" className="mt-3 border-gray-600">
                Setup
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
