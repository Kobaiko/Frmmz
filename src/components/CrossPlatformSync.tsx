
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  Wifi, 
  WifiOff, 
  Sync, 
  Check, 
  Clock, 
  AlertTriangle,
  Download,
  Upload,
  RefreshCw
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SyncDevice {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  platform: string;
  lastSync: Date;
  isOnline: boolean;
  syncStatus: 'synced' | 'syncing' | 'pending' | 'error';
  pendingUploads: number;
  pendingDownloads: number;
}

interface CrossPlatformSyncProps {
  currentDeviceId?: string;
  onSyncDevice?: (deviceId: string) => void;
}

export const CrossPlatformSync = ({ 
  currentDeviceId = 'current-device', 
  onSyncDevice = () => {} 
}: CrossPlatformSyncProps) => {
  const [devices, setDevices] = useState<SyncDevice[]>([]);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sample devices data
  useEffect(() => {
    setDevices([
      {
        id: 'desktop-1',
        name: 'MacBook Pro',
        type: 'desktop',
        platform: 'macOS',
        lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        isOnline: true,
        syncStatus: 'synced',
        pendingUploads: 0,
        pendingDownloads: 0
      },
      {
        id: 'mobile-1',
        name: 'iPhone 15 Pro',
        type: 'mobile',
        platform: 'iOS',
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isOnline: true,
        syncStatus: 'pending',
        pendingUploads: 3,
        pendingDownloads: 1
      },
      {
        id: 'tablet-1',
        name: 'iPad Air',
        type: 'tablet',
        platform: 'iPadOS',
        lastSync: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isOnline: false,
        syncStatus: 'error',
        pendingUploads: 0,
        pendingDownloads: 2
      }
    ]);
  }, []);

  const getDeviceIcon = (type: SyncDevice['type']) => {
    switch (type) {
      case 'desktop': return <Monitor className="h-5 w-5" />;
      case 'mobile': return <Smartphone className="h-5 w-5" />;
      case 'tablet': return <Tablet className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: SyncDevice['syncStatus']) => {
    switch (status) {
      case 'synced': return 'bg-green-600';
      case 'syncing': return 'bg-blue-600';
      case 'pending': return 'bg-yellow-600';
      case 'error': return 'bg-red-600';
    }
  };

  const getStatusIcon = (status: SyncDevice['syncStatus']) => {
    switch (status) {
      case 'synced': return <Check className="h-4 w-4" />;
      case 'syncing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
    }
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

  const handleSyncDevice = async (deviceId: string) => {
    setIsSyncing(true);
    setSyncProgress(0);

    // Simulate sync progress
    const progressInterval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsSyncing(false);
          
          // Update device status
          setDevices(prev => prev.map(device => 
            device.id === deviceId 
              ? { ...device, syncStatus: 'synced', lastSync: new Date(), pendingUploads: 0, pendingDownloads: 0 }
              : device
          ));
          
          toast({
            title: "Sync completed",
            description: "All changes have been synchronized across devices."
          });
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    onSyncDevice(deviceId);
  };

  const handleSyncAll = () => {
    devices.forEach(device => {
      if (device.syncStatus !== 'synced' && device.isOnline) {
        handleSyncDevice(device.id);
      }
    });
  };

  const syncStats = {
    totalDevices: devices.length,
    onlineDevices: devices.filter(d => d.isOnline).length,
    syncedDevices: devices.filter(d => d.syncStatus === 'synced').length,
    pendingUploads: devices.reduce((sum, d) => sum + d.pendingUploads, 0),
    pendingDownloads: devices.reduce((sum, d) => sum + d.pendingDownloads, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Cross-Platform Sync</h2>
          <p className="text-gray-400">Keep your work synchronized across all devices</p>
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
              <Sync className="h-4 w-4 mr-2" />
            )}
            Sync All
          </Button>
        </div>
      </div>

      {/* Sync Progress */}
      {isSyncing && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Syncing devices...</span>
              <span className="text-gray-400">{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Sync Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Devices</p>
                <p className="text-2xl font-bold text-white">{syncStats.totalDevices}</p>
              </div>
              <Monitor className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Online</p>
                <p className="text-2xl font-bold text-white">{syncStats.onlineDevices}</p>
              </div>
              <Wifi className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Uploads</p>
                <p className="text-2xl font-bold text-white">{syncStats.pendingUploads}</p>
              </div>
              <Upload className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Downloads</p>
                <p className="text-2xl font-bold text-white">{syncStats.pendingDownloads}</p>
              </div>
              <Download className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devices List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Connected Devices</h3>
        {devices.map((device) => (
          <Card key={device.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getDeviceIcon(device.type)}
                    {device.isOnline ? (
                      <Wifi className="h-4 w-4 text-green-400" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-white font-medium">{device.name}</h4>
                      {device.id === currentDeviceId && (
                        <Badge className="bg-blue-600">Current</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{device.platform}</span>
                      <span>•</span>
                      <span>Last sync: {formatLastSync(device.lastSync)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(device.syncStatus)}
                      <Badge className={getStatusColor(device.syncStatus)}>
                        {device.syncStatus}
                      </Badge>
                    </div>
                    {(device.pendingUploads > 0 || device.pendingDownloads > 0) && (
                      <div className="text-xs text-gray-400">
                        {device.pendingUploads > 0 && `${device.pendingUploads} uploads`}
                        {device.pendingUploads > 0 && device.pendingDownloads > 0 && ', '}
                        {device.pendingDownloads > 0 && `${device.pendingDownloads} downloads`}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleSyncDevice(device.id)}
                    disabled={!device.isOnline || device.syncStatus === 'synced' || isSyncing}
                    variant="outline"
                    size="sm"
                    className="border-gray-600"
                  >
                    {device.syncStatus === 'syncing' ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sync className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sync Settings */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Sync Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Auto Sync</p>
              <p className="text-gray-400 text-sm">Automatically sync changes across devices</p>
            </div>
            <Button
              onClick={() => setIsAutoSyncEnabled(!isAutoSyncEnabled)}
              variant={isAutoSyncEnabled ? 'default' : 'outline'}
              size="sm"
            >
              {isAutoSyncEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Sync on Mobile Data</p>
              <p className="text-gray-400 text-sm">Allow syncing over cellular connection</p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
