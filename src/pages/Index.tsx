
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

// Mock data for assets
const mockAssets = [
  {
    id: "1",
    name: "Commercial_Final_V2.mp4",
    type: "video" as const,
    thumbnail: "/placeholder.svg",
    duration: "2:34",
    fileSize: "245 MB",
    status: "ready" as const,
    uploadedBy: "John Doe",
    uploadedAt: new Date(),
    lastModified: new Date(),
    comments: 5,
    views: 23,
    tags: ["commercial", "final"],
    resolution: "1920x1080"
  },
  {
    id: "2", 
    name: "Behind_Scenes.mp4",
    type: "video" as const,
    thumbnail: "/placeholder.svg",
    duration: "5:12",
    fileSize: "512 MB", 
    status: "needs_review" as const,
    uploadedBy: "Jane Smith",
    uploadedAt: new Date(),
    lastModified: new Date(),
    comments: 2,
    views: 8,
    tags: ["behind-scenes"],
    resolution: "1920x1080"
  }
];

const Index = () => {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const handleAssetSelect = (assetId: string) => {
    console.log('🔄 Selecting asset:', assetId);
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleAssetOpen = (assetId: string) => {
    console.log('📹 Opening asset viewer for video:', assetId);
    setSelectedAssetId(assetId);
  };

  const handleBackToGrid = () => {
    console.log('🔙 Returning to asset grid');
    setSelectedAssetId(null);
  };

  const handleSelectAll = () => {
    setSelectedAssets(mockAssets.map(asset => asset.id));
  };

  const handleClearSelection = () => {
    setSelectedAssets([]);
  };

  const handleCreateProject = (name: string, template: string) => {
    console.log('Creating project:', name, 'with template:', template);
    // TODO: Implement project creation logic
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
        <ProjectHeader projectId="main-project" />
        <div className="flex-1 p-6">
          <AssetGrid 
            assets={mockAssets}
            viewMode="grid"
            selectedAssets={selectedAssets}
            onAssetSelect={handleAssetSelect}
            onAssetOpen={handleAssetOpen}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
          />
        </div>
      </div>
      <CreateProjectDialog 
        open={showCreateProject} 
        onOpenChange={setShowCreateProject}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
};

export default Index;
