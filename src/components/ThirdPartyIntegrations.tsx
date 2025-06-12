
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Plus,
  Settings,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  RefreshCw,
  Trash2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'project-management' | 'communication' | 'storage' | 'analytics' | 'creative-tools';
  icon: string;
  status: 'connected' | 'available' | 'pending' | 'error';
  isActive: boolean;
  setupUrl?: string;
  features: string[];
  lastSync?: Date;
}

interface IntegrationCategory {
  id: string;
  name: string;
  count: number;
}

export const ThirdPartyIntegrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [categories, setCategories] = useState<IntegrationCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Sample integrations data
    const sampleIntegrations: Integration[] = [
      {
        id: 'slack',
        name: 'Slack',
        description: 'Get notifications and updates in your Slack channels',
        category: 'communication',
        icon: '💬',
        status: 'connected',
        isActive: true,
        features: ['Notifications', 'Comment Sync', 'Project Updates'],
        lastSync: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: 'notion',
        name: 'Notion',
        description: 'Sync project data and comments with Notion databases',
        category: 'project-management',
        icon: '📋',
        status: 'connected',
        isActive: false,
        features: ['Database Sync', 'Comment Export', 'Project Templates'],
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'dropbox',
        name: 'Dropbox',
        description: 'Store and sync assets with your Dropbox account',
        category: 'storage',
        icon: '📦',
        status: 'available',
        isActive: false,
        features: ['File Sync', 'Auto Backup', 'Version History']
      },
      {
        id: 'asana',
        name: 'Asana',
        description: 'Create tasks and track project progress in Asana',
        category: 'project-management',
        icon: '✅',
        status: 'available',
        isActive: false,
        features: ['Task Creation', 'Progress Tracking', 'Team Sync']
      },
      {
        id: 'google-analytics',
        name: 'Google Analytics',
        description: 'Track video engagement and sharing analytics',
        category: 'analytics',
        icon: '📊',
        status: 'pending',
        isActive: false,
        features: ['Engagement Tracking', 'Share Analytics', 'Custom Reports']
      },
      {
        id: 'figma',
        name: 'Figma',
        description: 'Import designs and sync feedback with Figma projects',
        category: 'creative-tools',
        icon: '🎨',
        status: 'available',
        isActive: false,
        features: ['Design Import', 'Comment Sync', 'Asset Export']
      }
    ];

    setIntegrations(sampleIntegrations);

    // Calculate categories
    const categoryCount = sampleIntegrations.reduce((acc, integration) => {
      acc[integration.category] = (acc[integration.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setCategories([
      { id: 'all', name: 'All Integrations', count: sampleIntegrations.length },
      { id: 'project-management', name: 'Project Management', count: categoryCount['project-management'] || 0 },
      { id: 'communication', name: 'Communication', count: categoryCount['communication'] || 0 },
      { id: 'storage', name: 'Storage', count: categoryCount['storage'] || 0 },
      { id: 'analytics', name: 'Analytics', count: categoryCount['analytics'] || 0 },
      { id: 'creative-tools', name: 'Creative Tools', count: categoryCount['creative-tools'] || 0 }
    ]);
  }, []);

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-600';
      case 'available': return 'bg-gray-600';
      case 'pending': return 'bg-yellow-600';
      case 'error': return 'bg-red-600';
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'available': return <Plus className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleConnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'connected', lastSync: new Date() }
        : integration
    ));
    toast({
      title: "Integration connected",
      description: "The integration has been successfully connected."
    });
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'available', isActive: false, lastSync: undefined }
        : integration
    ));
    toast({
      title: "Integration disconnected",
      description: "The integration has been disconnected."
    });
  };

  const handleToggleActive = (integrationId: string, active: boolean) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, isActive: active }
        : integration
    ));
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatLastSync = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Third-Party Integrations</h2>
          <p className="text-gray-400">Connect with your favorite tools and services</p>
        </div>
        <Button className="bg-pink-600 hover:bg-pink-700">
          <Plus className="h-4 w-4 mr-2" />
          Request Integration
        </Button>
      </div>

      {/* Search and Categories */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={selectedCategory === category.id ? 'bg-pink-600' : 'border-gray-600'}
            >
              {category.name} ({category.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map((integration) => (
          <Card key={integration.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{integration.icon}</div>
                  <div>
                    <h3 className="text-white font-medium">{integration.name}</h3>
                    <Badge className={getStatusColor(integration.status)} variant="secondary">
                      {getStatusIcon(integration.status)}
                      <span className="ml-1">{integration.status}</span>
                    </Badge>
                  </div>
                </div>
                {integration.status === 'connected' && (
                  <Switch 
                    checked={integration.isActive}
                    onCheckedChange={(checked) => handleToggleActive(integration.id, checked)}
                    size="sm"
                  />
                )}
              </div>

              <p className="text-gray-400 text-sm mb-3">{integration.description}</p>

              {/* Features */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {integration.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {integration.features.length > 3 && (
                    <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                      +{integration.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Last Sync */}
              {integration.status === 'connected' && (
                <div className="text-xs text-gray-400 mb-3">
                  Last sync: {formatLastSync(integration.lastSync)}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                {integration.status === 'available' && (
                  <Button 
                    onClick={() => handleConnect(integration.id)}
                    size="sm" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Connect
                  </Button>
                )}
                
                {integration.status === 'connected' && (
                  <>
                    <Button variant="outline" size="sm" className="border-gray-600">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => handleDisconnect(integration.id)}
                      variant="outline" 
                      size="sm" 
                      className="border-red-600 text-red-400 hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                {integration.status === 'pending' && (
                  <Button size="sm" disabled className="flex-1">
                    <Clock className="h-4 w-4 mr-1" />
                    Pending
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <Zap className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No integrations found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or category filter</p>
          <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};
