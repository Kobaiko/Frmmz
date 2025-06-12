
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Layers, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  Zap,
  Settings,
  Play,
  Pause
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdobeApp {
  id: string;
  name: string;
  icon: string;
  version: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync: Date;
  autoSync: boolean;
  features: string[];
}

interface SyncActivity {
  id: string;
  app: string;
  action: 'import' | 'export' | 'sync';
  assetName: string;
  status: 'completed' | 'in-progress' | 'failed';
  timestamp: Date;
  progress?: number;
}

export const AdobeIntegration = () => {
  const [adobeApps, setAdobeApps] = useState<AdobeApp[]>([]);
  const [syncActivities, setSyncActivities] = useState<SyncActivity[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Sample Adobe apps data
    setAdobeApps([
      {
        id: 'premiere',
        name: 'Premiere Pro',
        icon: '🎬',
        version: '2024',
        status: 'connected',
        lastSync: new Date(Date.now() - 30 * 60 * 1000),
        autoSync: true,
        features: ['Direct Import', 'Auto Sync', 'Version Tracking', 'Comment Sync']
      },
      {
        id: 'aftereffects',
        name: 'After Effects',
        icon: '✨',
        version: '2024',
        status: 'connected',
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
        autoSync: false,
        features: ['Direct Import', 'Composition Sync', 'Render Queue']
      },
      {
        id: 'photoshop',
        name: 'Photoshop',
        icon: '🎨',
        version: '2024',
        status: 'disconnected',
        lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
        autoSync: false,
        features: ['Asset Import', 'Layer Export', 'Smart Objects']
      }
    ]);

    setSyncActivities([
      {
        id: '1',
        app: 'Premiere Pro',
        action: 'import',
        assetName: 'Demo_Video_v3.mov',
        status: 'completed',
        timestamp: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: '2',
        app: 'After Effects',
        action: 'sync',
        assetName: 'Title_Animation.aep',
        status: 'in-progress',
        timestamp: new Date(),
        progress: 65
      }
    ]);
  }, []);

  const getStatusColor = (status: AdobeApp['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-600';
      case 'syncing': return 'bg-blue-600';
      case 'disconnected': return 'bg-gray-600';
      case 'error': return 'bg-red-600';
    }
  };

  const getStatusIcon = (status: AdobeApp['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'syncing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'disconnected': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleConnectApp = (appId: string) => {
    setAdobeApps(prev => prev.map(app => 
      app.id === appId 
        ? { ...app, status: 'connected', lastSync: new Date() }
        : app
    ));
    toast({
      title: "App connected",
      description: "Adobe application has been successfully connected."
    });
  };

  const handleToggleAutoSync = (appId: string, enabled: boolean) => {
    setAdobeApps(prev => prev.map(app => 
      app.id === appId 
        ? { ...app, autoSync: enabled }
        : app
    ));
    toast({
      title: enabled ? "Auto sync enabled" : "Auto sync disabled",
      description: `Auto sync has been ${enabled ? 'enabled' : 'disabled'} for this application.`
    });
  };

  const handleSyncAll = () => {
    setIsSyncing(true);
    setAdobeApps(prev => prev.map(app => 
      app.status === 'connected' 
        ? { ...app, status: 'syncing' }
        : app
    ));

    setTimeout(() => {
      setAdobeApps(prev => prev.map(app => 
        app.status === 'syncing' 
          ? { ...app, status: 'connected', lastSync: new Date() }
          : app
      ));
      setIsSyncing(false);
      toast({
        title: "Sync completed",
        description: "All connected Adobe applications have been synchronized."
      });
    }, 3000);
  };

  const formatLastSync = (date: Date) => {
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
          <h2 className="text-2xl font-bold text-white">Adobe Creative Cloud Integration</h2>
          <p className="text-gray-400">Connect and sync with your Adobe applications</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="bg-pink-600 hover:bg-pink-700"
          >
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync All
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <div>
                <p className="text-white font-medium">Creative Cloud Status</p>
                <p className="text-gray-400 text-sm">
                  {isConnected ? 'Connected and ready to sync' : 'Disconnected - Check your Creative Cloud app'}
                </p>
              </div>
            </div>
            <Button variant="outline" className="border-gray-600">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Adobe Applications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Connected Applications</h3>
        {adobeApps.map((app) => (
          <Card key={app.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{app.icon}</div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-white font-medium">{app.name}</h4>
                      <Badge className={getStatusColor(app.status)}>
                        {getStatusIcon(app.status)}
                        <span className="ml-1">{app.status}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Version {app.version}</span>
                      <span>•</span>
                      <span>Last sync: {formatLastSync(app.lastSync)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Auto Sync</span>
                    <Switch 
                      checked={app.autoSync}
                      onCheckedChange={(checked) => handleToggleAutoSync(app.id, checked)}
                    />
                  </div>
                  
                  {app.status === 'disconnected' ? (
                    <Button 
                      onClick={() => handleConnectApp(app.id)}
                      variant="outline"
                      size="sm"
                      className="border-gray-600"
                    >
                      Connect
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="border-gray-600">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {app.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Sync Activity */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Sync Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {syncActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {activity.action === 'import' ? (
                    <Download className="h-4 w-4 text-blue-400" />
                  ) : activity.action === 'export' ? (
                    <Upload className="h-4 w-4 text-green-400" />
                  ) : (
                    <RefreshCw className="h-4 w-4 text-purple-400" />
                  )}
                  <div>
                    <p className="text-white font-medium">{activity.assetName}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span>{activity.app}</span>
                      <span>•</span>
                      <span>{activity.action}</span>
                      <span>•</span>
                      <span>{formatLastSync(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {activity.status === 'in-progress' && activity.progress && (
                  <div className="flex items-center space-x-2">
                    <Progress value={activity.progress} className="w-20 h-2" />
                    <span className="text-sm text-gray-400">{activity.progress}%</span>
                  </div>
                )}
                <Badge 
                  className={
                    activity.status === 'completed' ? 'bg-green-600' :
                    activity.status === 'in-progress' ? 'bg-blue-600' :
                    'bg-red-600'
                  }
                >
                  {activity.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Integration Settings */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Integration Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Real-time Sync</p>
              <p className="text-gray-400 text-sm">Automatically sync changes as they happen</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Sync Comments</p>
              <p className="text-gray-400 text-sm">Include Frmzz comments in Adobe projects</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Version Tracking</p>
              <p className="text-gray-400 text-sm">Track version changes across applications</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
