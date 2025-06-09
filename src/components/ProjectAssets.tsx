
import { useState } from "react";
import { ArrowLeft, Plus, Upload, Folder, Lock, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectAssetsProps {
  projectName: string;
  onBack: () => void;
  onStartVideo: () => void;
}

export const ProjectAssets = ({ projectName, onBack, onStartVideo }: ProjectAssetsProps) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    // Handle file drop
    const files = Array.from(e.dataTransfer.files);
    console.log('Files dropped:', files);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800">
        <div className="container mx-auto px-4 py-3">
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
                <h1 className="text-xl font-semibold text-white">{projectName}</h1>
                <p className="text-sm text-gray-400">0 Items</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Asset
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Folder
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                    <Folder className="h-4 w-4 mr-2" />
                    New Folder
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                    <Lock className="h-4 w-4 mr-2" />
                    New Restricted Folder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="container mx-auto px-4 py-8">
        <div 
          className={`border-2 border-dashed rounded-lg p-16 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 bg-gray-700 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            
            <h3 className="text-xl font-medium text-white mb-2">
              Drag files and folders to begin.
            </h3>
            
            <p className="text-gray-400 mb-6">
              Or use the upload button to add your assets
            </p>
            
            <div className="space-y-3">
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Upload
              </Button>
              
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  console.log('Files selected:', files);
                }}
              />
              
              <div className="text-center">
                <Button 
                  variant="link" 
                  className="text-blue-400 hover:text-blue-300"
                  onClick={onStartVideo}
                >
                  Or start with video feedback →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
