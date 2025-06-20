import { useState } from "react";
import { AssetViewer } from "@/components/AssetViewer";
import { AssetGrid } from "@/components/AssetGrid";
import { Sidebar } from "@/components/Sidebar";
import { ProjectHeader } from "@/components/ProjectHeader";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { ProjectManagement } from "@/components/ProjectManagement";
import { ProjectAssetsView } from "@/components/ProjectAssetsView";
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
const mockProjects: Project[] = [];

// Mock data for assets - this will be replaced with real data from Supabase
const mockAssets = [];

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
        <div className="flex-1">
          <ProjectAssetsView
            projectId={selectedProjectId}
            projectName={selectedProject?.name || selectedProjectId}
            onBack={handleBackToProjects}
            onAssetOpen={handleAssetOpen}
          />
        </div>
      </div>
    );
  }

  // Projects Dashboard (default view)
  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar onNavigateToProjects={handleBackToProjects} />
      <div className="flex-1 p-6">
        <ProjectManagement
          projects={mockProjects}
          onProjectSelect={handleProjectSelect}
          onCreateProject={handleCreateProject}
        />
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
