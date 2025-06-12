
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Palette, 
  Upload, 
  Eye, 
  Monitor, 
  Smartphone, 
  Tablet,
  Globe,
  Image as ImageIcon,
  Type,
  Layout,
  Save,
  RotateCcw
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BrandSettings {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  companyName: string;
  customMessage: string;
  showCompanyInfo: boolean;
  customDomain?: string;
  footerText: string;
}

interface BrandedSharingProps {
  settings: BrandSettings;
  onSettingsUpdate: (settings: BrandSettings) => void;
  onSave: () => void;
  onReset: () => void;
}

export const BrandedSharing = ({
  settings,
  onSettingsUpdate,
  onSave,
  onReset
}: BrandedSharingProps) => {
  const [activePreview, setActivePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleColorChange = (field: keyof BrandSettings, value: string) => {
    onSettingsUpdate({
      ...settings,
      [field]: value
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        onSettingsUpdate({
          ...settings,
          logo: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const getPreviewSize = () => {
    switch (activePreview) {
      case 'desktop': return 'w-full h-96';
      case 'tablet': return 'w-2/3 h-80 mx-auto';
      case 'mobile': return 'w-1/3 h-96 mx-auto';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Brand Settings */}
      <div className="space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Brand Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="text-gray-300">Company Logo</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="border-gray-600"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                {settings.logo && (
                  <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                    <img src={settings.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>
            </div>

            {/* Company Information */}
            <div className="space-y-2">
              <Label className="text-gray-300">Company Name</Label>
              <Input
                value={settings.companyName}
                onChange={(e) => onSettingsUpdate({ ...settings, companyName: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Custom Message</Label>
              <Textarea
                value={settings.customMessage}
                onChange={(e) => onSettingsUpdate({ ...settings, customMessage: e.target.value })}
                placeholder="Welcome message for your clients..."
                className="bg-gray-700 border-gray-600 text-white"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Show Company Info</Label>
                <p className="text-sm text-gray-500">Display company details on share pages</p>
              </div>
              <Switch 
                checked={settings.showCompanyInfo} 
                onCheckedChange={(checked) => onSettingsUpdate({ ...settings, showCompanyInfo: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Type className="h-5 w-5 mr-2" />
              Color Scheme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-12 h-8 rounded border border-gray-600"
                  />
                  <Input
                    value={settings.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Secondary Color</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-12 h-8 rounded border border-gray-600"
                  />
                  <Input
                    value={settings.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Background Color</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="w-12 h-8 rounded border border-gray-600"
                  />
                  <Input
                    value={settings.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Text Color</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.textColor}
                    onChange={(e) => handleColorChange('textColor', e.target.value)}
                    className="w-12 h-8 rounded border border-gray-600"
                  />
                  <Input
                    value={settings.textColor}
                    onChange={(e) => handleColorChange('textColor', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Custom Domain
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Custom Domain (Optional)</Label>
              <Input
                value={settings.customDomain || ''}
                onChange={(e) => onSettingsUpdate({ ...settings, customDomain: e.target.value })}
                placeholder="review.yourcompany.com"
                className="bg-gray-700 border-gray-600 text-white"
              />
              <p className="text-sm text-gray-500">Use your own domain for share links</p>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Footer Text</Label>
              <Input
                value={settings.footerText}
                onChange={(e) => onSettingsUpdate({ ...settings, footerText: e.target.value })}
                placeholder="© 2024 Your Company. All rights reserved."
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-2">
          <Button onClick={onSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Brand Settings
          </Button>
          <Button onClick={onReset} variant="outline" className="border-gray-600">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Live Preview
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant={activePreview === 'desktop' ? 'default' : 'outline'}
                  onClick={() => setActivePreview('desktop')}
                  className={activePreview === 'desktop' ? '' : 'border-gray-600'}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={activePreview === 'tablet' ? 'default' : 'outline'}
                  onClick={() => setActivePreview('tablet')}
                  className={activePreview === 'tablet' ? '' : 'border-gray-600'}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={activePreview === 'mobile' ? 'default' : 'outline'}
                  onClick={() => setActivePreview('mobile')}
                  className={activePreview === 'mobile' ? '' : 'border-gray-600'}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`${getPreviewSize()} border border-gray-600 rounded-lg overflow-hidden`}>
              <div 
                className="h-full flex flex-col"
                style={{ 
                  backgroundColor: settings.backgroundColor,
                  color: settings.textColor
                }}
              >
                {/* Header */}
                <div 
                  className="p-4 border-b"
                  style={{ borderColor: settings.secondaryColor + '40' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {settings.logo && (
                        <img src={settings.logo} alt="Logo" className="h-8 w-auto" />
                      )}
                      <div>
                        <h1 className="font-bold" style={{ color: settings.primaryColor }}>
                          {settings.companyName || 'Your Company'}
                        </h1>
                        <p className="text-sm opacity-75">Creative Review</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                  {settings.customMessage && (
                    <div className="mb-4 p-3 rounded" style={{ backgroundColor: settings.primaryColor + '20' }}>
                      <p className="text-sm">{settings.customMessage}</p>
                    </div>
                  )}
                  
                  <div className="bg-gray-900 rounded aspect-video flex items-center justify-center mb-4">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-50">Video Preview</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        style={{ 
                          backgroundColor: settings.primaryColor,
                          color: settings.backgroundColor
                        }}
                      >
                        Add Comment
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        style={{ 
                          borderColor: settings.secondaryColor,
                          color: settings.secondaryColor
                        }}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div 
                  className="p-3 border-t text-center text-xs opacity-75"
                  style={{ borderColor: settings.secondaryColor + '40' }}
                >
                  {settings.footerText || `© 2024 ${settings.companyName || 'Your Company'}. All rights reserved.`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
