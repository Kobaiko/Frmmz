
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

  const handleProjectSelect = (projectId: string, projectName: string) => {
    setAppState({ 
      view: 'project', 
      selectedProjectId: projectId,
      selectedProjectName: projectName 
    });
  };

  const handleAssetOpen = (assetId: string) => {
    setAppState(prev => ({ 
      ...prev, 
      view: 'asset', 
      selectedAssetId: assetId 
    }));
  };

  const handleBackToDashboard = () => {
    setAppState({ view: 'dashboard' });
  };

  const handleBackToProject = () => {
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
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={() => {}} />;
  }

  // Render based on current view
  switch (appState.view) {
    case 'asset':
      if (!appState.selectedAssetId) {
        return <Navigate to="/" replace />;
      }
      return (
        <AssetViewer
          assetId={appState.selectedAssetId}
          onBack={handleBackToProject}
        />
      );

    case 'project':
      if (!appState.selectedProjectId || !appState.selectedProjectName) {
        return <Navigate to="/" replace />;
      }
      return (
        <ProjectAssetsView
          projectId={appState.selectedProjectId}
          projectName={appState.selectedProjectName}
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
