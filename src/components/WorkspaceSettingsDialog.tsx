import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Pen, ChevronRight } from "lucide-react";

interface WorkspaceSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceName: string;
  onWorkspaceNameChange: (name: string) => void;
}

export const WorkspaceSettingsDialog = ({
  open,
  onOpenChange,
  workspaceName,
  onWorkspaceNameChange
}: WorkspaceSettingsDialogProps) => {
  const [tempWorkspaceName, setTempWorkspaceName] = useState(workspaceName);
  const [useAccountSettings, setUseAccountSettings] = useState(false);
  const [projectNotifications, setProjectNotifications] = useState(true);
  const [showWatermarkSubmenu, setShowWatermarkSubmenu] = useState(false);
  const [showWatermarkEdit, setShowWatermarkEdit] = useState(false);
  
  // Watermark settings
  const [watermarkText, setWatermarkText] = useState("Sample Watermark");
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const [watermarkPosition, setWatermarkPosition] = useState("bottom-right");
  const [watermarkSize, setWatermarkSize] = useState("medium");

  const handleSave = () => {
    onWorkspaceNameChange(tempWorkspaceName);
    toast({
      title: "Settings saved",
      description: "Workspace settings have been updated successfully."
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempWorkspaceName(workspaceName);
    setShowWatermarkSubmenu(false);
    setShowWatermarkEdit(false);
    onOpenChange(false);
  };

  const handleWatermarkSave = () => {
    toast({
      title: "Watermark settings saved",
      description: "Watermark has been updated successfully."
    });
    setShowWatermarkEdit(false);
  };

  const getWatermarkPositionStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      color: 'white',
      fontSize: watermarkSize === 'small' ? '12px' : watermarkSize === 'medium' ? '16px' : '20px',
      opacity: watermarkOpacity / 100,
      padding: '8px',
      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
    };

    switch (watermarkPosition) {
      case 'top-left':
        return { ...baseStyle, top: '10px', left: '10px' };
      case 'top-right':
        return { ...baseStyle, top: '10px', right: '10px' };
      case 'bottom-left':
        return { ...baseStyle, bottom: '10px', left: '10px' };
      case 'bottom-right':
        return { ...baseStyle, bottom: '10px', right: '10px' };
      case 'center':
        return { ...baseStyle, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      default:
        return { ...baseStyle, bottom: '10px', right: '10px' };
    }
  };

  if (showWatermarkEdit) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              Watermark Templates
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-6 py-4">
            {/* Demo Preview */}
            <div className="flex-1">
              <div className="bg-black rounded-lg overflow-hidden relative" style={{ aspectRatio: '16/9' }}>
                <img 
                  src="/lovable-uploads/6b1da53a-8d92-4c46-875a-2062a75d3d1a.png" 
                  alt="Demo video preview"
                  className="w-full h-full object-cover"
                />
                <div style={getWatermarkPositionStyle()}>
                  {watermarkText}
                </div>
              </div>
            </div>

            {/* Settings Panel */}
            <div className="w-80 space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Template name</label>
                <Input
                  value="Custom Text (middle)"
                  readOnly
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Block 1/1</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700">
                    Delete
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Add Block
                  </Button>
                </div>
              </div>

              {/* Watermark Text */}
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Watermark</label>
                <textarea
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 text-white rounded px-3 py-2 h-20 resize-none focus:border-blue-400"
                  placeholder="Enter watermark text"
                />
              </div>

              {/* Opacity */}
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Opacity: {watermarkOpacity}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${watermarkOpacity}%, #374151 ${watermarkOpacity}%, #374151 100%)`
                  }}
                />
              </div>

              {/* Rotation */}
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Rotation: 0°</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  defaultValue="0"
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Size and Color */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Size</label>
                  <select
                    value={watermarkSize}
                    onChange={(e) => setWatermarkSize(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:border-blue-400"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Color</label>
                  <div className="flex items-center gap-2">
                    <Input
                      value="#FFFFFF"
                      className="bg-gray-700 border-gray-600 text-white focus:border-blue-400"
                    />
                    <div className="w-8 h-8 bg-white rounded border border-gray-600"></div>
                  </div>
                </div>
              </div>

              {/* Text Effects */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Text Scroll</label>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    ✕
                  </Button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Text Shadow</label>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    ✕
                  </Button>
                </div>
              </div>

              {/* Session-based Watermark */}
              <div className="space-y-3 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Session-based Watermark</span>
                  <span className="text-xs text-blue-400">+ Enterprise</span>
                </div>
                <p className="text-xs text-gray-400">
                  Embed personal identifying info and custom visuals for enhanced security.
                </p>
                
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-300">Name</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-300">Date & time</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-300">Email</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-300">Share creator's custom text</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-300">IP Address</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={() => setShowWatermarkEdit(false)}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleWatermarkSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (showWatermarkSubmenu) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              Watermark Settings
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Current Watermark */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">{watermarkText}</p>
                  <p className="text-gray-400 text-sm">Opacity: {watermarkOpacity}% • Position: {watermarkPosition}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowWatermarkEdit(true)}
                  className="text-gray-400 hover:text-white hover:bg-gray-600"
                >
                  <Pen className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Watermark Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Enable for downloads</span>
                <Switch
                  checked={true}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Enable for playback</span>
                <Switch
                  checked={true}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Enable for shares</span>
                <Switch
                  checked={true}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={() => setShowWatermarkSubmenu(false)}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Back
            </Button>
            <Button
              onClick={() => setShowWatermarkSubmenu(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">
            Workspace settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Workspace Name */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Workspace name</label>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
                <span className="text-xs">📁</span>
              </div>
              <Input
                value={tempWorkspaceName}
                onChange={(e) => setTempWorkspaceName(e.target.value)}
                className="bg-gray-700 border-blue-500 text-white focus:border-blue-400"
              />
            </div>
          </div>

          {/* Watermark */}
          <div className="space-y-3">
            <label className="text-sm text-gray-300">Watermark</label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Use account-level settings for playback and downloads.
              </span>
              <Switch
                checked={useAccountSettings}
                onCheckedChange={setUseAccountSettings}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            
            {!useAccountSettings && (
              <div 
                className="flex items-center justify-between p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                onClick={() => setShowWatermarkSubmenu(true)}
              >
                <span className="text-sm text-gray-300">Configure watermark settings</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>

          {/* Project Notifications */}
          <div className="space-y-3">
            <label className="text-sm text-gray-300">Project Notifications</label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Receive notifications for project updates and changes.
              </span>
              <Switch
                checked={projectNotifications}
                onCheckedChange={setProjectNotifications}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
