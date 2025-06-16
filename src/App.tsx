
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthPage } from "@/components/AuthPage";
import { ProjectsDashboard } from "@/components/ProjectsDashboard";
import { ProjectAssetsView } from "@/components/ProjectAssetsView";
import { AssetViewer } from "@/components/AssetViewer";
import "./App.css";

const queryClient = new QueryClient();

interface AppState {
  view: 'dashboard' | 'project' | 'asset';
  selectedProjectId?: string;
  selectedProjectName?: string;
  selectedAssetId?: string;
}

const AppContent = () => {
  const { user, loading } = useAuth();
  const [appState, setAppState] = useState<AppState>({ view: 'dashboard' });

  // Debug logging for development
  useEffect(() => {
    console.log('🚀 App starting up');
    console.log('🌐 Current URL:', window.location.href);
    console.log('📍 Origin:', window.location.origin);
    console.log('🔧 Port:', window.location.port);
    console.log('👤 User:', user);
    console.log('📱 App State:', appState);
  }, [user, appState]);

  const handleProjectSelect = (projectId: string, projectName: string) => {
    console.log('📂 Project selected:', projectId, projectName);
    setAppState({ 
      view: 'project', 
      selectedProjectId: projectId,
      selectedProjectName: projectName 
    });
  };

  const handleAssetOpen = (assetId: string) => {
    console.log('🎬 Asset opened:', assetId);
    setAppState(prev => ({ 
      ...prev, 
      view: 'asset', 
      selectedAssetId: assetId 
    }));
  };

  const handleBackToDashboard = () => {
    console.log('🏠 Back to dashboard');
    setAppState({ view: 'dashboard' });
  };

  const handleBackToProject = () => {
    console.log('📂 Back to project');
    setAppState(prev => ({ 
      ...prev, 
      view: 'project',
      selectedAssetId: undefined 
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-400">Loading Frmzz...</p>
          <p className="text-gray-600 text-sm mt-1">Port: {window.location.port || '80'}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={() => {}} />;
  }

  // Force dashboard view if we don't have proper state
  if (appState.view === 'asset' && !appState.selectedAssetId) {
    console.log('⚠️ Asset view without asset ID, redirecting to dashboard');
    setAppState({ view: 'dashboard' });
    return null;
  }

  if (appState.view === 'project' && (!appState.selectedProjectId || !appState.selectedProjectName)) {
    console.log('⚠️ Project view without project data, redirecting to dashboard');
    setAppState({ view: 'dashboard' });
    return null;
  }

  // Render based on current view
  switch (appState.view) {
    case 'asset':
      return (
        <AssetViewer
          assetId={appState.selectedAssetId!}
          onBack={handleBackToProject}
        />
      );

    case 'project':
      return (
        <ProjectAssetsView
          projectId={appState.selectedProjectId!}
          projectName={appState.selectedProjectName!}
          onBack={handleBackToDashboard}
          onAssetOpen={handleAssetOpen}
        />
      );

    case 'dashboard':
    default:
      return (
        <ProjectsDashboard
          onProjectSelect={handleProjectSelect}
        />
      );
  }
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router>
            <Routes>
              <Route path="/*" element={<AppContent />} />
            </Routes>
            <Toaster />
          </Router>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
