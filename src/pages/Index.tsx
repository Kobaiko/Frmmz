
import { useState } from "react";
import { AssetViewer } from "@/components/AssetViewer";
import { AssetGrid } from "@/components/AssetGrid";
import { Sidebar } from "@/components/Sidebar";
import { ProjectHeader } from "@/components/ProjectHeader";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";

export interface Comment {
  id: string;
  timestamp: number;
  text: string;
  author: string;
  createdAt: Date;
  parentId?: string;
  attachments?: any[];
  isInternal?: boolean;
  hasDrawing?: boolean;
}

const Index = () => {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);

  const handleAssetSelect = (assetId: string) => {
    console.log('📹 Opening asset viewer for video:', assetId);
    setSelectedAssetId(assetId);
  };

  const handleBackToGrid = () => {
    console.log('🔙 Returning to asset grid');
    setSelectedAssetId(null);
  };

  // If an asset is selected, show the AssetViewer for ALL video types
  if (selectedAssetId) {
    return (
      <AssetViewer 
        assetId={selectedAssetId} 
        onBack={handleBackToGrid}
      />
    );
  }

  // Default view - show the main dashboard
  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <ProjectHeader onCreateProject={() => setShowCreateProject(true)} />
        <div className="flex-1 p-6">
          <AssetGrid onAssetSelect={handleAssetSelect} />
        </div>
      </div>
      <CreateProjectDialog 
        open={showCreateProject} 
        onOpenChange={setShowCreateProject} 
      />
    </div>
  );
};

export default Index;
