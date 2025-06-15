
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, MessageCircle } from "lucide-react";
import { useAssets } from "@/hooks/useAssets";
import { SimpleVideoPlayer } from "./SimpleVideoPlayer";
import { StorageDebugger } from "./StorageDebugger";

interface AssetViewerProps {
  assetId: string;
  onBack: () => void;
}

export const AssetViewer = ({ assetId, onBack }: AssetViewerProps) => {
  const { assets, loading } = useAssets();
  const [asset, setAsset] = useState<any>(null);
  const [showDebugger, setShowDebugger] = useState(false);

  useEffect(() => {
    if (assets && assets.length > 0) {
      const foundAsset = assets.find(a => a.id === assetId);
      setAsset(foundAsset);
      console.log('🎬 Asset found:', foundAsset);
    }
  }, [assets, assetId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-400">Loading asset...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Asset not found</h2>
          <Button onClick={onBack} className="bg-pink-600 hover:bg-pink-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{asset.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                <span>{asset.file_type}</span>
                <span>•</span>
                <span>{Math.round(asset.file_size / 1024 / 1024)} MB</span>
                <span>•</span>
                <span>Uploaded {new Date(asset.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowDebugger(!showDebugger)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {showDebugger ? 'Hide' : 'Show'} Debug
            </Button>
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <MessageCircle className="h-4 w-4 mr-2" />
              Comment
            </Button>
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Debug Panel */}
      {showDebugger && <StorageDebugger />}

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {asset.file_type === 'video' ? (
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <SimpleVideoPlayer
                src={asset.file_url}
                onError={(error) => console.error('❌ Video player error:', error)}
                onLoad={() => console.log('✅ Video loaded successfully')}
              />
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg p-8 text-center">
              <p className="text-gray-400">Preview not available for {asset.file_type} files</p>
              <Button 
                onClick={() => window.open(asset.file_url, '_blank')}
                className="bg-blue-600 hover:bg-blue-700 mt-4"
              >
                <Download className="h-4 w-4 mr-2" />
                Open File
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
