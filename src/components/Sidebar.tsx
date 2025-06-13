
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Home,
  Folder,
  Users,
  Settings,
  Bell,
  Search,
  Plus,
  Star,
  Clock,
  Share2,
  Archive,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  PlayCircle
} from "lucide-react";

interface SidebarProps {
  onNavigateToProjects?: () => void;
}

export const Sidebar = ({ onNavigateToProjects }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    projects: true,
    recent: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const handleProjectsClick = () => {
    console.log('🏠 Navigate to projects dashboard');
    onNavigateToProjects?.();
  };

  const sidebarItems = [
    { icon: Home, label: "Dashboard", badge: null, active: true, onClick: handleProjectsClick },
    { icon: Folder, label: "All Projects", badge: "12", active: false, onClick: handleProjectsClick },
    { icon: Users, label: "Team", badge: null, active: false, onClick: () => console.log('Team clicked') },
    { icon: Star, label: "Starred", badge: null, active: false, onClick: () => console.log('Starred clicked') },
    { icon: Clock, label: "Recent", badge: null, active: false, onClick: () => console.log('Recent clicked') },
    { icon: Share2, label: "Shared with me", badge: "3", active: false, onClick: () => console.log('Shared clicked') },
    { icon: Archive, label: "Archive", badge: null, active: false, onClick: () => console.log('Archive clicked') },
  ];

  const recentProjects = [
    { name: "VideoFeedback Campaign", status: "active" },
    { name: "Product Demo Series", status: "review" },
    { name: "Social Media Content", status: "completed" },
  ];

  return (
    <div className={`bg-gray-900 border-r border-gray-800 h-screen flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
                <PlayCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-white font-semibold">Frmzz</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        
        {!isCollapsed && (
          <Button 
            onClick={handleProjectsClick}
            className="w-full mt-3 bg-pink-600 hover:bg-pink-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        )}
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-2 py-2">
          {sidebarItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={item.onClick}
              className={`w-full justify-start mb-1 text-gray-300 hover:text-white hover:bg-gray-800 ${
                item.active ? 'bg-gray-800 text-white' : ''
              } ${isCollapsed ? 'px-2' : 'px-3'}`}
            >
              <item.icon className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          ))}
        </nav>

        {!isCollapsed && (
          <>
            <Separator className="my-4 mx-4 bg-gray-700" />
            
            {/* Recent Projects */}
            <div className="px-2">
              <Button
                variant="ghost"
                onClick={() => toggleSection('recent')}
                className="w-full justify-start mb-2 text-gray-400 hover:text-white hover:bg-gray-800 px-3"
              >
                {expandedSections.recent ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                <span>Recent Projects</span>
              </Button>

              {expandedSections.recent && (
                <div className="ml-6 space-y-1">
                  {recentProjects.map((project, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      onClick={handleProjectsClick}
                      className="w-full justify-start text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-2"
                    >
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        project.status === 'active' ? 'bg-green-500' :
                        project.status === 'review' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="truncate">{project.name}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">John Doe</p>
              <p className="text-gray-400 text-xs truncate">john@example.com</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
