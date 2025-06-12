
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { 
  HardDrive,
  Cloud,
  Server,
  Settings,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  Database,
  Lock,
  Zap
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface StorageProvider {
  id: string;
  name: string;
  type: 'cloud' | 'enterprise' | 'local';
  icon: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  isDefault: boolean;
  totalSpace: number; // in GB
  usedSpace: number; // in GB
  syncEnabled: boolean;
  features: string[];
  region?: string;
  lastSync?: Date;
}

interface StorageRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  targetStorage: string;
  isActive: boolean;
}

export const StorageIntegration = () => {
  const [storageProviders, setStorageProviders] = useState<StorageProvider[]>([]);
  const [storageRules, setStorageRules] = useState<StorageRule[]>([]);
  const [showAddProvider, setShowAddProvider] = useState(false);

  useEffect(() => {
    // Sample storage providers
    setStorageProviders([
      {
        id: 'aws-s3',
        name: 'AWS S3',
        type: 'cloud',
        icon: '☁️',
        status: 'connected',
        isDefault: true,
        totalSpace: 1000,
        usedSpace: 650,
        syncEnabled: true,
        features: ['Automatic Backup', 'CDN Distribution', 'Encryption', 'Versioning'],
        region: 'us-east-1',
        lastSync: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: 'google-cloud',
        name: 'Google Cloud Storage',
        type: 'cloud',
        icon: '🌐',
        status: 'connected',
        isDefault: false,
        totalSpace: 500,
        usedSpace: 120,
        syncEnabled: false,
        features: ['Global CDN', 'Auto-scaling', 'Machine Learning'],
        region: 'us-central1',
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'enterprise-nas',
        name: 'Enterprise NAS',
        type: 'enterprise',
        icon: '🏢',
        status: 'connected',
        isDefault: false,
        totalSpace: 2000,
        usedSpace: 1200,
        syncEnabled: true,
        features: ['RAID Protection', 'Local Network', 'Compliance Ready'],
        lastSync: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: 'dropbox',
        name: 'Dropbox Business',
        type: 'cloud',
        icon: '📦',
        status: 'disconnected',
        isDefault: false,
        totalSpace: 250,
        usedSpace: 0,
        syncEnabled: false,
        features: ['Team Collaboration', 'Smart Sync', 'Admin Controls']
      }
    ]);

    // Sample storage rules
    setStorageRules([
      {
        id: '1',
        name: 'Archive Old Assets',
        condition: 'Assets older than 90 days',
        action: 'Move to cold storage',
        targetStorage: 'AWS S3 Glacier',
        isActive: true
      },
      {
        id: '2',
        name: 'High-Priority Backup',
        condition: 'Assets tagged as "critical"',
        action: 'Backup to multiple locations',
        targetStorage: 'AWS S3 + Google Cloud',
        isActive: true
      },
      {
        id: '3',
        name: 'Local Cache',
        condition: 'Recently accessed assets',
        action: 'Cache locally',
        targetStorage: 'Enterprise NAS',
        isActive: false
      }
    ]);
  }, []);

  const getStatusColor = (status: StorageProvider['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-600';
      case 'syncing': return 'bg-blue-600';
      case 'disconnected': return 'bg-gray-600';
      case 'error': return 'bg-red-600';
    }
  };

  const getStatusIcon = (status: StorageProvider['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'syncing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'disconnected': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: StorageProvider['type']) => {
    switch (type) {
      case 'cloud': return <Cloud className="h-5 w-5" />;
      case 'enterprise': return <Server className="h-5 w-5" />;
      case 'local': return <HardDrive className="h-5 w-5" />;
    }
  };

  const handleSetDefault = (providerId: string) => {
    setStorageProviders(prev => prev.map(provider => ({
      ...provider,
      isDefault: provider.id === providerId
    })));
    toast({
      title: "Default storage updated",
      description: "The default storage provider has been changed."
    });
  };

  const handleToggleSync = (providerId: string, enabled: boolean) => {
    setStorageProviders(prev => prev.map(provider => 
      provider.id === providerId 
        ? { ...provider, syncEnabled: enabled }
        : provider
    ));
    toast({
      title: enabled ? "Sync enabled" : "Sync disabled",
      description: `Automatic sync has been ${enabled ? 'enabled' : 'disabled'} for this storage provider.`
    });
  };

  const handleConnect = (providerId: string) => {
    setStorageProviders(prev => prev.map(provider => 
      provider.id === providerId 
        ? { ...provider, status: 'connected', lastSync: new Date() }
        : provider
    ));
    toast({
      title: "Storage connected",
      description: "Storage provider has been successfully connected."
    });
  };

  const handleDisconnect = (providerId: string) => {
    setStorageProviders(prev => prev.map(provider => 
      provider.id === providerId 
        ? { ...provider, status: 'disconnected', syncEnabled: false, isDefault: false }
        : provider
    ));
    toast({
      title: "Storage disconnected",
      description: "Storage provider has been disconnected."
    });
  };

  const handleToggleRule = (ruleId: string, active: boolean) => {
    setStorageRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: active }
        : rule
    ));
  };

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

  const totalStorage = storageProviders.reduce((sum, provider) => 
    provider.status === 'connected' ? sum + provider.totalSpace : sum, 0
  );
  
  const usedStorage = storageProviders.reduce((sum, provider) => 
    provider.status === 'connected' ? sum + provider.usedSpace : sum, 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Storage Integration</h2>
          <p className="text-gray-400">Manage storage providers and data distribution</p>
        </div>
        <Button 
          onClick={() => setShowAddProvider(true)}
          className="bg-pink-600 hover:bg-pink-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Storage
        </Button>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Storage</p>
                <p className="text-2xl font-bold text-white">{totalStorage} GB</p>
              </div>
              <Database className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Used Storage</p>
                <p className="text-2xl font-bold text-white">{usedStorage} GB</p>
              </div>
              <HardDrive className="h-8 w-8 text-purple-400" />
            </div>
            <div className="mt-3">
              <Progress value={(usedStorage / totalStorage) * 100} className="h-2" />
              <p className="text-xs text-gray-400 mt-1">
                {((usedStorage / totalStorage) * 100).toFixed(1)}% used
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Connected Providers</p>
                <p className="text-2xl font-bold text-white">
                  {storageProviders.filter(p => p.status === 'connected').length}
                </p>
              </div>
              <Cloud className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storage Providers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Storage Providers</h3>
        {storageProviders.map((provider) => (
          <Card key={provider.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(provider.type)}
                    <span className="text-2xl">{provider.icon}</span>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-white font-medium">{provider.name}</h4>
                      {provider.isDefault && (
                        <Badge className="bg-pink-600">Default</Badge>
                      )}
                      <Badge className={getStatusColor(provider.status)}>
                        {getStatusIcon(provider.status)}
                        <span className="ml-1">{provider.status}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{provider.usedSpace} GB / {provider.totalSpace} GB</span>
                      {provider.region && (
                        <>
                          <span>•</span>
                          <span>{provider.region}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>Last sync: {formatLastSync(provider.lastSync)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {provider.status === 'connected' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Auto Sync</span>
                      <Switch 
                        checked={provider.syncEnabled}
                        onCheckedChange={(checked) => handleToggleSync(provider.id, checked)}
                      />
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    {provider.status === 'connected' && !provider.isDefault && (
                      <Button 
                        onClick={() => handleSetDefault(provider.id)}
                        variant="outline" 
                        size="sm"
                        className="border-gray-600"
                      >
                        Set Default
                      </Button>
                    )}
                    
                    {provider.status === 'disconnected' ? (
                      <Button 
                        onClick={() => handleConnect(provider.id)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Connect
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" className="border-gray-600">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDisconnect(provider.id)}
                          variant="outline" 
                          size="sm"
                          className="border-red-600 text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Features and Progress */}
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {provider.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  {provider.status === 'connected' && (
                    <div className="text-right">
                      <Progress 
                        value={(provider.usedSpace / provider.totalSpace) * 100} 
                        className="w-32 h-2" 
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {((provider.usedSpace / provider.totalSpace) * 100).toFixed(1)}% full
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Storage Rules */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Storage Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {storageRules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Switch 
                  checked={rule.isActive}
                  onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                />
                <div>
                  <p className="text-white font-medium">{rule.name}</p>
                  <div className="text-sm text-gray-400">
                    <span>{rule.condition}</span>
                    <span className="mx-2">→</span>
                    <span>{rule.action}</span>
                    <span className="mx-2">→</span>
                    <span className="text-blue-400">{rule.targetStorage}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="border-gray-600">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="border-red-600 text-red-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <Button variant="outline" className="w-full border-gray-600 border-dashed">
            <Plus className="h-4 w-4 mr-2" />
            Add Storage Rule
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
