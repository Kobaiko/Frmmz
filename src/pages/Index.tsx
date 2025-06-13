
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

// Mock projects data
const mockProjects: Project[] = [
  {
    id: 'main-project',
    name: 'VideoFeedback Campaign',
    description: 'Main campaign videos and promotional content',
    status: 'active',
    priority: 'high',
    progress: 75,
    dueDate: new Date('2024-12-31'),
    createdAt: new Date('2024-06-01'),
    teamMembers: 6,
    assetsCount: 12,
    commentsCount: 23,
    tags: ['campaign', 'video', 'marketing'],
    owner: 'Alex Chen',
    lastActivity: new Date('2024-06-12')
  },
  {
    id: 'product-demo',
    name: 'Product Demo Series',
    description: 'Demo videos for new product features',
    status: 'active',
    priority: 'medium',
    progress: 45,
    dueDate: new Date('2024-07-15'),
    createdAt: new Date('2024-05-15'),
    teamMembers: 4,
    assetsCount: 8,
    commentsCount: 15,
    tags: ['demo', 'product', 'features'],
    owner: 'Sarah Kim',
    lastActivity: new Date('2024-06-11')
  },
  {
    id: 'social-content',
    name: 'Social Media Content',
    description: 'Short-form content for social platforms',
    status: 'completed',
    priority: 'low',
    progress: 100,
    dueDate: new Date('2024-06-01'),
    createdAt: new Date('2024-04-20'),
    teamMembers: 3,
    assetsCount: 25,
    commentsCount: 8,
    tags: ['social', 'short-form', 'content'],
    owner: 'Mike Johnson',
    lastActivity: new Date('2024-06-01')
  }
];

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

  const handleCreateProjectSubmit = (name: string, template: string) => {
    console.log('Creating project:', name, 'with template:', template);
    setShowCreateProject(false);
    // TODO: Implement project creation logic
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
