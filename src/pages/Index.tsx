import { useState } from "react";
import { AssetViewer } from "@/components/AssetViewer";
import { AssetGrid } from "@/components/AssetGrid";
import { Sidebar } from "@/components/Sidebar";
import { ProjectHeader } from "@/components/ProjectHeader";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { ProjectManagement } from "@/components/ProjectManagement";
import { ProjectAssetsView } from "@/components/ProjectAssetsView";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import type { Project } from "@/components/ProjectManagement";

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

// Mock projects data - this will be replaced with real data from Supabase
const mockProjects: Project[] = [
  {
    id: "demo-project",
    name: "Demo Project",
    description: "Demo project for testing comments",
    status: "active",
    priority: "medium",
    progress: 0,
    dueDate: undefined,
    createdAt: new Date(),
    owner_id: "demo-user"
  }
];

// Mock data for assets - this will be replaced with real data from Supabase
const mockAssets = [
  {
    id: "demo-asset",
    name: "Demo Video",
    type: "video",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://via.placeholder.com/300x200?text=Demo+Video",
    duration: 596,
    createdAt: new Date()
  }
];

type ViewMode = 'projects' | 'project-assets' | 'asset-viewer';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const handleProjectSelect = (project: Project) => {
    setSelectedProjectId(project.id);
    setCurrentView('project-assets');
  };

  const handleCreateProject = () => {
    setShowCreateProject(true);
  };

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
    setCurrentView('asset-viewer');
  };

  const handleBackToProjects = () => {
    setCurrentView('projects');
    setSelectedProjectId(null);
  };

  const handleBackToAssets = () => {
    setCurrentView('project-assets');
    setSelectedAssetId(null);
  };

  const handleSelectAll = () => {
    setSelectedAssets(mockAssets.map(asset => asset.id));
  };

  const handleClearSelection = () => {
    setSelectedAssets([]);
  };

  const handleCreateProjectSubmit = async (data: { name: string; description?: string }) => {
    console.log('Creating project:', data);
    setShowCreateProject(false);
    // TODO: Implement project creation logic
    return Promise.resolve();
  };

  // Asset Viewer
  if (currentView === 'asset-viewer' && selectedAssetId) {
    return (
      <AssetViewer 
        assetId={selectedAssetId} 
        onBack={handleBackToAssets}
      />
    );
  }

  // Project Assets View
  if (currentView === 'project-assets' && selectedProjectId) {
    const selectedProject = mockProjects.find(p => p.id === selectedProjectId);
    return (
      <div className="min-h-screen bg-black text-white flex">
        <Sidebar onNavigateToProjects={handleBackToProjects} />
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">{selectedProject?.name || 'Project Assets'}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockAssets.map(asset => (
                <div key={asset.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                  <div className="aspect-video bg-gray-700 rounded mb-3 flex items-center justify-center">
                    <Play className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="font-medium mb-2">{asset.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">Duration: {Math.floor(asset.duration / 60)}:{(asset.duration % 60).toString().padStart(2, '0')}</p>
                  <Button 
                    onClick={() => handleAssetOpen(asset.id)}
                    className="w-full bg-pink-600 hover:bg-pink-700"
                  >
                    Open Asset (Test Comments)
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Projects Dashboard (default view)
  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar onNavigateToProjects={handleBackToProjects} />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Projects Dashboard</h1>
          <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-yellow-400 mb-2">Testing Comment Functionality</h3>
            <p className="text-yellow-300 text-sm mb-3">
              The comment features (sort, filter, copy, paste, export) are only available in the asset viewer. 
              Click on the demo project below to access the asset viewer and test the functionality.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {mockProjects.map(project => (
            <div key={project.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => handleProjectSelect(project)}>
              <h3 className="font-medium mb-2">{project.name}</h3>
              <p className="text-sm text-gray-400 mb-3">{project.description}</p>
              <Button className="w-full bg-pink-600 hover:bg-pink-700">
                Open Project
              </Button>
            </div>
          ))}
        </div>

        <Button onClick={handleCreateProject} className="bg-pink-600 hover:bg-pink-700">
          Create New Project
        </Button>
      </div>
      <CreateProjectDialog 
        open={showCreateProject} 
        onOpenChange={setShowCreateProject}
        onCreateProject={handleCreateProjectSubmit}
      />
    </div>
  );
};

export default Index;
