
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  WifiOff, 
  Wifi, 
  Download, 
  Upload, 
  HardDrive, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  Trash2,
  Eye
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface OfflineAsset {
  id: string;
  name: string;
  type: 'video' | 'image' | 'document';
  size: number;
  downloadProgress: number;
  status: 'queued' | 'downloading' | 'available' | 'failed';
  lastAccessed: Date;
  projectName: string;
}

interface OfflineCapabilitiesProps {
  isOnline?: boolean;
  storageLimit?: number; // in MB
}

export const OfflineCapabilities = ({ 
  isOnline = true, 
  storageLimit = 1024 
}: OfflineCapabilitiesProps) => {
  const [offlineAssets, setOfflineAssets] = useState<OfflineAsset[]>([]);
  const [usedStorage, setUsedStorage] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [queuedDownloads, setQueuedDownloads] = useState(0);

  // Sample offline assets
  useEffect(() => {
    const sampleAssets: OfflineAsset[] = [
      {
        id: '1',
        name: 'Demo Video.mp4',
        type: 'video',
        size: 128, // MB
        downloadProgress: 100,
        status: 'available',
        lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000),
        projectName: 'Demo Project'
      },
      {
        id: '2',
        name: 'Client Review.mp4',
        type: 'video',
        size: 256, // MB
        downloadProgress: 65,
        status: 'downloading',
        lastAccessed: new Date(),
        projectName: 'Client Project'
      },
      {
        id: '3',
        name: 'Thumbnail.jpg',
        type: 'image',
        size: 2, // MB
        downloadProgress: 100,
        status: 'available',
        lastAccessed: new Date(Date.now() - 24 * 60 * 60 * 1000),
        projectName: 'Demo Project'
      }
    ];

    setOfflineAssets(sampleAssets);
    setUsedStorage(sampleAssets.reduce((sum, asset) => 
      asset.status === 'available' ? sum + asset.size : sum, 0
    ));
    setQueuedDownloads(sampleAssets.filter(asset => 
      asset.status === 'queued' || asset.status === 'downloading'
    ).length);
  }, []);

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) return `${(sizeInMB * 1024).toFixed(0)} KB`;
    if (sizeInMB < 1024) return `${sizeInMB.toFixed(1)} MB`;
    return `${(sizeInMB / 1024).toFixed(1)} GB`;
  };

  const getStatusIcon = (status: OfflineAsset['status']) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'downloading': return <Download className="h-4 w-4 text-blue-400" />;
      case 'queued': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: OfflineAsset['status']) => {
    switch (status) {
      case 'available': return 'bg-green-600';
      case 'downloading': return 'bg-blue-600';
      case 'queued': return 'bg-yellow-600';
      case 'failed': return 'bg-red-600';
    }
  };

  const handleDownloadAsset = (assetId: string) => {
    setOfflineAssets(prev => prev.map(asset => 
      asset.id === assetId 
        ? { ...asset, status: 'downloading', downloadProgress: 0 }
        : asset
    ));

    // Simulate download progress
    const progressInterval = setInterval(() => {
      setOfflineAssets(prev => prev.map(asset => {
        if (asset.id === assetId && asset.status === 'downloading') {
          const newProgress = Math.min(asset.downloadProgress + 10, 100);
          const newStatus = newProgress === 100 ? 'available' : 'downloading';
          
          if (newProgress === 100) {
            clearInterval(progressInterval);
            setUsedStorage(current => current + asset.size);
            toast({
              title: "Download completed",
              description: `${asset.name} is now available offline.`
            });
          }
          
          return { ...asset, downloadProgress: newProgress, status: newStatus };
        }
        return asset;
      }));
    }, 500);
  };

  const handleRemoveAsset = (assetId: string) => {
    const asset = offlineAssets.find(a => a.id === assetId);
    if (asset && asset.status === 'available') {
      setUsedStorage(current => current - asset.size);
    }
    
    setOfflineAssets(prev => prev.filter(asset => asset.id !== assetId));
    toast({
      title: "Asset removed",
      description: "Asset has been removed from offline storage."
    });
  };

  const handleClearOfflineStorage = () => {
    setOfflineAssets([]);
    setUsedStorage(0);
    toast({
      title: "Storage cleared",
      description: "All offline assets have been removed."
    });
  };

  const storagePercentage = (usedStorage / storageLimit) * 100;
  const availableAssets = offlineAssets.filter(asset => asset.status === 'available');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Offline Capabilities</h2>
          <div className="flex items-center space-x-2 mt-1">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-400" />
                <span className="text-green-400 text-sm">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-400" />
                <span className="text-red-400 text-sm">Offline</span>
              </>
            )}
          </div>
        </div>
        <Button 
          onClick={handleClearOfflineStorage}
          variant="outline" 
          className="border-gray-600 text-gray-300"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Storage
        </Button>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Used Storage</p>
                <p className="text-2xl font-bold text-white">{formatFileSize(usedStorage)}</p>
              </div>
              <HardDrive className="h-8 w-8 text-blue-400" />
            </div>
            <div className="mt-3">
              <Progress value={storagePercentage} className="h-2" />
              <p className="text-xs text-gray-400 mt-1">
                {formatFileSize(storageLimit - usedStorage)} available
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Available Offline</p>
                <p className="text-2xl font-bold text-white">{availableAssets.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Downloads Queue</p>
                <p className="text-2xl font-bold text-white">{queuedDownloads}</p>
              </div>
              <Download className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offline Mode Notice */}
      {!isOnline && (
        <Card className="bg-yellow-900 border-yellow-600">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <WifiOff className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-yellow-200 font-medium">You're currently offline</p>
                <p className="text-yellow-300 text-sm">
                  You can still access downloaded assets and make comments that will sync when back online.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offline Assets List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Offline Assets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {offlineAssets.length === 0 ? (
            <div className="text-center py-8">
              <HardDrive className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No offline assets</p>
              <p className="text-gray-500 text-sm">Download assets to access them offline</p>
            </div>
          ) : (
            offlineAssets.map((asset) => (
              <div 
                key={asset.id}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(asset.status)}
                    <div>
                      <p className="text-white font-medium">{asset.name}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>{asset.projectName}</span>
                        <span>•</span>
                        <span>{formatFileSize(asset.size)}</span>
                        {asset.status === 'available' && (
                          <>
                            <span>•</span>
                            <span>Last accessed {asset.lastAccessed.toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {asset.status === 'downloading' && (
                    <div className="flex items-center space-x-2">
                      <Progress value={asset.downloadProgress} className="w-20 h-2" />
                      <span className="text-sm text-gray-400">{asset.downloadProgress}%</span>
                    </div>
                  )}
                  
                  <Badge className={getStatusColor(asset.status)}>
                    {asset.status}
                  </Badge>

                  <div className="flex space-x-1">
                    {asset.status === 'available' && (
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {asset.status === 'failed' && isOnline && (
                      <Button 
                        onClick={() => handleDownloadAsset(asset.id)}
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button 
                      onClick={() => handleRemoveAsset(asset.id)}
                      variant="ghost" 
                      size="sm" 
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Auto-Download Settings */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Auto-Download Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Download for Offline Viewing</p>
              <p className="text-gray-400 text-sm">Automatically download new assets in active projects</p>
            </div>
            <Button variant="outline" size="sm" className="border-gray-600">
              Configure
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Wi-Fi Only Downloads</p>
              <p className="text-gray-400 text-sm">Only download when connected to Wi-Fi</p>
            </div>
            <Button variant="default" size="sm" className="bg-pink-600">
              Enabled
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Storage Limit</p>
              <p className="text-gray-400 text-sm">Maximum storage for offline assets</p>
            </div>
            <Button variant="outline" size="sm" className="border-gray-600">
              {formatFileSize(storageLimit)}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
