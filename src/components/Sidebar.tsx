
import { Home, Search, Bell, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

export const Sidebar = ({ activeItem = 'home', onItemClick }: SidebarProps) => {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'uploads', icon: Upload, label: 'Uploads' },
  ];

  return (
    <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 space-y-4">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeItem === item.id;
        
        return (
          <Button
            key={item.id}
            variant="ghost"
            size="icon"
            className={`w-10 h-10 ${
              isActive 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            onClick={() => onItemClick?.(item.id)}
            title={item.label}
          >
            <Icon className="h-5 w-5" />
          </Button>
        );
      })}
      
      <div className="flex-1" />
      
      {/* User avatar at bottom */}
      <Button
        variant="ghost"
        size="icon"
        className="w-10 h-10 text-gray-400 hover:text-white hover:bg-gray-800"
        title="Profile"
      >
        <User className="h-5 w-5" />
      </Button>
    </div>
  );
};
