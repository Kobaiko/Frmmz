
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Settings, 
  Building, 
  Palette, 
  Globe, 
  CreditCard, 
  Download,
  Upload,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WorkspaceConfig {
  name: string;
  description: string;
  logo?: string;
  primaryColor: string;
  timezone: string;
  language: string;
  subdomain: string;
  customDomain?: string;
  storageLimit: number;
  userLimit: number;
  features: string[];
}

interface BillingInfo {
  plan: 'free' | 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'annual';
  nextBilling: Date;
  amount: number;
  usage: {
    storage: number;
    users: number;
    projects: number;
  };
}

interface WorkspaceSettingsProps {
  workspaceId: string;
  isOwner: boolean;
}

export const WorkspaceSettings = ({ workspaceId, isOwner }: WorkspaceSettingsProps) => {
  const [config, setConfig] = useState<WorkspaceConfig>({
    name: 'Creative Studio',
    description: 'Professional video production and collaboration workspace',
    primaryColor: '#FF0080',
    timezone: 'America/New_York',
    language: 'en',
    subdomain: 'creative-studio',
    storageLimit: 500,
    userLimit: 25,
    features: ['advanced_sharing', 'custom_branding', 'analytics', 'api_access']
  });

  const [billing] = useState<BillingInfo>({
    plan: 'pro',
    billingCycle: 'monthly',
    nextBilling: new Date('2024-07-15'),
    amount: 99,
    usage: {
      storage: 230,
      users: 18,
      projects: 45
    }
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const updateConfig = (key: keyof WorkspaceConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Settings updated",
      description: `${key} has been updated successfully`
    });
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-600';
      case 'pro': return 'bg-blue-600';
      case 'enterprise': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const DeleteWorkspaceDialog = () => {
    const [confirmText, setConfirmText] = useState('');
    const canDelete = confirmText === config.name;

    return (
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Workspace
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
              Delete Workspace
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-900/20 border border-red-600/30 p-4 rounded-lg">
              <p className="text-red-400 text-sm">
                This action cannot be undone. This will permanently delete the workspace,
                all projects, assets, and user data.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">
                Type <strong>{config.name}</strong> to confirm
              </label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={config.name}
                className="bg-gray-700 border-gray-600 text-white mt-1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Handle deletion
                  toast({
                    title: "Workspace deletion initiated",
                    description: "This process may take a few minutes to complete"
                  });
                  setShowDeleteDialog(false);
                }}
                disabled={!canDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Workspace
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (!isOwner) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-8 text-center">
          <Settings className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">Access Restricted</h3>
          <p className="text-gray-500">Only workspace owners can access these settings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Workspace Settings</h2>
          <p className="text-gray-400">Configure your workspace preferences and billing</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={`${getPlanColor(billing.plan)} text-white`}>
            {billing.plan.toUpperCase()} Plan
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="general" className="text-gray-300">General</TabsTrigger>
          <TabsTrigger value="branding" className="text-gray-300">Branding</TabsTrigger>
          <TabsTrigger value="billing" className="text-gray-300">Billing</TabsTrigger>
          <TabsTrigger value="danger" className="text-gray-300">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Workspace Name</label>
                  <Input
                    value={config.name}
                    onChange={(e) => updateConfig('name', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Subdomain</label>
                  <Input
                    value={config.subdomain}
                    onChange={(e) => updateConfig('subdomain', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Description</label>
                <Textarea
                  value={config.description}
                  onChange={(e) => updateConfig('description', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Timezone</label>
                  <Select value={config.timezone} onValueChange={(value) => updateConfig('timezone', value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">GMT</SelectItem>
                      <SelectItem value="Europe/Paris">CET</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Language</label>
                  <Select value={config.language} onValueChange={(value) => updateConfig('language', value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Brand Customization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Logo</label>
                <div className="mt-1 flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                    {config.logo ? (
                      <img src={config.logo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <Building className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <Button variant="outline" className="border-gray-600 text-gray-300">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Primary Color</label>
                <div className="mt-1 flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-lg border border-gray-600"
                    style={{ backgroundColor: config.primaryColor }}
                  />
                  <Input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => updateConfig('primaryColor', e.target.value)}
                    className="w-20 h-12 bg-gray-700 border-gray-600"
                  />
                  <Input
                    value={config.primaryColor}
                    onChange={(e) => updateConfig('primaryColor', e.target.value)}
                    placeholder="#FF0080"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Custom Domain</label>
                <Input
                  value={config.customDomain || ''}
                  onChange={(e) => updateConfig('customDomain', e.target.value)}
                  placeholder="your-domain.com"
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pro plan required for custom domains
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Current Plan</p>
                  <p className="text-xl font-bold text-white">{billing.plan.toUpperCase()}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Monthly Cost</p>
                  <p className="text-xl font-bold text-white">${billing.amount}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Next Billing</p>
                  <p className="text-xl font-bold text-white">
                    {billing.nextBilling.toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Storage Used</span>
                  <span className="text-white">{billing.usage.storage}GB / {config.storageLimit}GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Users</span>
                  <span className="text-white">{billing.usage.users} / {config.userLimit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Projects</span>
                  <span className="text-white">{billing.usage.projects}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button className="bg-pink-600 hover:bg-pink-700">
                  Upgrade Plan
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-6">
          <Card className="bg-gray-800 border-red-600/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-900/20 border border-red-600/30 p-4 rounded-lg">
                <h4 className="font-medium text-red-400 mb-2">Delete Workspace</h4>
                <p className="text-sm text-gray-300 mb-4">
                  Permanently delete this workspace and all of its data. This action cannot be undone.
                </p>
                <DeleteWorkspaceDialog />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
