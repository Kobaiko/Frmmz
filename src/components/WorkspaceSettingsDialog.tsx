
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

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
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [projectNotifications, setProjectNotifications] = useState(true);

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
    onOpenChange(false);
  };

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
                checked={watermarkEnabled}
                onCheckedChange={setWatermarkEnabled}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
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
