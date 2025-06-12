
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Key,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Plus,
  Activity,
  BarChart3,
  Code,
  ExternalLink,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: Date;
  lastUsed?: Date;
  requestCount: number;
  isActive: boolean;
}

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  rateLimit: string;
}

interface UsageStats {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  topEndpoints: { path: string; requests: number }[];
}

export const APIManagement = () => {
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const endpoints: APIEndpoint[] = [
    { method: 'GET', path: '/api/v1/projects', description: 'List all projects', rateLimit: '1000/hour' },
    { method: 'POST', path: '/api/v1/projects', description: 'Create a new project', rateLimit: '100/hour' },
    { method: 'GET', path: '/api/v1/projects/{id}/assets', description: 'Get project assets', rateLimit: '2000/hour' },
    { method: 'POST', path: '/api/v1/assets/upload', description: 'Upload an asset', rateLimit: '500/hour' },
    { method: 'GET', path: '/api/v1/comments', description: 'Get comments', rateLimit: '3000/hour' },
    { method: 'POST', path: '/api/v1/comments', description: 'Create a comment', rateLimit: '1000/hour' },
    { method: 'GET', path: '/api/v1/shares', description: 'List shares', rateLimit: '1000/hour' },
    { method: 'POST', path: '/api/v1/shares', description: 'Create a share', rateLimit: '200/hour' }
  ];

  useEffect(() => {
    // Sample API keys data
    setAPIKeys([
      {
        id: '1',
        name: 'Production Integration',
        key: 'frmzz_prod_sk_1234567890abcdef',
        permissions: ['read:projects', 'write:assets', 'read:comments'],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
        requestCount: 15420,
        isActive: true
      },
      {
        id: '2',
        name: 'Development Testing',
        key: 'frmzz_test_sk_abcdef1234567890',
        permissions: ['read:projects', 'read:assets'],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 30 * 60 * 1000),
        requestCount: 3240,
        isActive: true
      }
    ]);

    setUsageStats({
      totalRequests: 18660,
      successRate: 99.2,
      averageResponseTime: 145,
      topEndpoints: [
        { path: '/api/v1/projects/{id}/assets', requests: 5420 },
        { path: '/api/v1/comments', requests: 4230 },
        { path: '/api/v1/projects', requests: 3210 },
        { path: '/api/v1/assets/upload', requests: 2890 }
      ]
    });
  }, []);

  const handleCreateAPIKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for the API key.",
        variant: "destructive"
      });
      return;
    }

    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `frmzz_${Math.random().toString(36).substr(2, 24)}`,
      permissions: ['read:projects'],
      createdAt: new Date(),
      requestCount: 0,
      isActive: true
    };

    setAPIKeys(prev => [...prev, newKey]);
    setNewKeyName('');
    setNewKeyDescription('');
    setShowCreateForm(false);
    
    toast({
      title: "API key created",
      description: "Your new API key has been generated successfully."
    });
  };

  const handleRevokeKey = (keyId: string) => {
    setAPIKeys(prev => prev.map(key => 
      key.id === keyId ? { ...key, isActive: false } : key
    ));
    toast({
      title: "API key revoked",
      description: "The API key has been revoked and is no longer active."
    });
  };

  const handleDeleteKey = (keyId: string) => {
    setAPIKeys(prev => prev.filter(key => key.id !== keyId));
    toast({
      title: "API key deleted",
      description: "The API key has been permanently deleted."
    });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied to clipboard",
      description: "API key has been copied to your clipboard."
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const maskKey = (key: string) => {
    return key.substring(0, 12) + '•••••••••••••••••••••';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-600';
      case 'POST': return 'bg-green-600';
      case 'PUT': return 'bg-yellow-600';
      case 'DELETE': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">API Management</h2>
          <p className="text-gray-400">Manage API keys and monitor usage</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-gray-600">
            <ExternalLink className="h-4 w-4 mr-2" />
            Documentation
          </Button>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-pink-600 hover:bg-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </div>
      </div>

      {/* Usage Statistics */}
      {usageStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Requests</p>
                  <p className="text-2xl font-bold text-white">{usageStats.totalRequests.toLocaleString()}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-white">{usageStats.successRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Response</p>
                  <p className="text-2xl font-bold text-white">{usageStats.averageResponseTime}ms</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Keys</p>
                  <p className="text-2xl font-bold text-white">{apiKeys.filter(key => key.isActive).length}</p>
                </div>
                <Key className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create API Key Form */}
      {showCreateForm && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Create New API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Key Name</label>
              <Input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production Integration"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
              <Textarea
                value={newKeyDescription}
                onChange={(e) => setNewKeyDescription(e.target.value)}
                placeholder="Describe what this API key will be used for..."
                className="bg-gray-700 border-gray-600 text-white"
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateAPIKey} className="bg-pink-600 hover:bg-pink-700">
                Create Key
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="p-4 bg-gray-700 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-white font-medium">{apiKey.name}</h3>
                    <Badge className={apiKey.isActive ? 'bg-green-600' : 'bg-red-600'}>
                      {apiKey.isActive ? 'Active' : 'Revoked'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <code className="text-sm text-gray-300 bg-gray-800 px-2 py-1 rounded">
                      {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      {visibleKeys.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCopyKey(apiKey.key)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {apiKey.permissions.map((permission, index) => (
                      <Badge key={index} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Created: {formatDate(apiKey.createdAt)}</span>
                    {apiKey.lastUsed && <span>Last used: {formatDate(apiKey.lastUsed)}</span>}
                    <span>{apiKey.requestCount.toLocaleString()} requests</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {apiKey.isActive && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRevokeKey(apiKey.id)}
                      className="border-yellow-600 text-yellow-400"
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteKey(apiKey.id)}
                    className="border-red-600 text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Available Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {endpoints.map((endpoint, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Badge className={getMethodColor(endpoint.method)}>
                  {endpoint.method}
                </Badge>
                <div>
                  <code className="text-white font-mono text-sm">{endpoint.path}</code>
                  <p className="text-gray-400 text-sm">{endpoint.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Rate limit: {endpoint.rateLimit}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
