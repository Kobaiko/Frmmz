
import { 
  Settings,
  Play,
  Check,
  ZoomIn,
  ZoomOut,
  Shrink,
  Maximize2,
  MessageSquare,
  Pencil,
  Image,
  ArrowDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface VideoSettingsMenuProps {
  quality: string;
  availableQualities: string[];
  onQualityChange: (quality: string) => void;
  guides: {
    enabled: boolean;
    ratio: string;
    mask: boolean;
  };
  onGuidesToggle: () => void;
  onGuidesRatioChange: (ratio: string) => void;
  onGuidesMaskToggle: () => void;
  zoom: string;
  onZoomChange: (zoom: string) => void;
  encodeComments: boolean;
  setEncodeComments: (value: boolean) => void;
  annotations: boolean;
  setAnnotations: (value: boolean) => void;
  onSetFrameAsThumb: () => void;
  onDownloadStill: () => void;
  currentTime: number;
  formatTime: (seconds: number) => string;
}

export const VideoSettingsMenu = ({
  quality,
  availableQualities,
  onQualityChange,
  guides,
  onGuidesToggle,
  onGuidesRatioChange,
  onGuidesMaskToggle,
  zoom,
  onZoomChange,
  encodeComments,
  setEncodeComments,
  annotations,
  setAnnotations,
  onSetFrameAsThumb,
  onDownloadStill,
  currentTime,
  formatTime
}: VideoSettingsMenuProps) => {
  const getQualityLabel = (qual: string) => {
    const labels: { [key: string]: string } = {
      '2160p': '4K',
      '1080p': 'HD',
      '720p': 'HD',
      '540p': 'SD',
      '360p': 'SD'
    };
    return labels[qual] || '';
  };

  const handleDownloadStill = () => {
    onDownloadStill();
    console.log('Still image downloaded');
  };

  const handleSetFrameAsThumb = () => {
    onSetFrameAsThumb();
    console.log('Frame set as thumbnail');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:text-white hover:bg-gray-800 p-2 border-0 focus:border-0 focus:ring-0 focus-visible:ring-0"
        >
          <Settings size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-72 bg-gray-800 border-gray-600 text-white shadow-xl z-50"
        align="end"
        sideOffset={5}
      >
        {/* Quality Sub-menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[state=open]:bg-gray-700 px-4 py-3 cursor-pointer border-none text-white">
            <div className="flex items-center space-x-3">
              <Play size={16} className="text-gray-300" />
              <span className="text-white">Quality</span>
            </div>
            <div className="flex items-center space-x-3 ml-auto">
              <span className="text-sm text-gray-300">{quality}</span>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded text-white font-medium">
                {getQualityLabel(quality)}
              </span>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-gray-800 border-gray-600 text-white shadow-xl z-50">
            {availableQualities.map((qual) => (
              <DropdownMenuItem
                key={qual}
                className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
                onClick={() => onQualityChange(qual)}
              >
                <span className="text-white">{qual}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-xs bg-blue-600 px-2 py-1 rounded text-white font-medium">
                    {getQualityLabel(qual)}
                  </span>
                  {quality === qual && <Check size={16} className="text-white" />}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* Separator after Quality */}
        <DropdownMenuSeparator className="bg-gray-600 my-1" />
        
        {/* Guides Sub-menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[state=open]:bg-gray-700 px-4 py-3 cursor-pointer border-none text-white">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 border border-gray-300 rounded" />
              <span className="text-white">Guides</span>
            </div>
            <span className="text-sm text-gray-300 ml-auto">{guides.enabled ? guides.ratio : 'Off'}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-gray-800 border-gray-600 text-white shadow-xl z-50">
            {['2.35', '1.85', '16:9', '9:16', '4:3', '1:1'].map((ratio) => (
              <DropdownMenuItem
                key={ratio}
                className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
                onClick={() => onGuidesRatioChange(ratio)}
              >
                <span className="text-white">{ratio}</span>
                {guides.ratio === ratio && guides.enabled && <Check size={16} className="text-white" />}
              </DropdownMenuItem>
            ))}
            
            {/* Mask toggle */}
            <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 cursor-pointer p-0">
              <div className="flex items-center justify-between w-full px-4 py-3">
                <span className="text-white">Mask</span>
                <Switch
                  checked={guides.mask}
                  onCheckedChange={onGuidesMaskToggle}
                  className="data-[state=checked]:bg-blue-600 scale-75"
                />
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
              onClick={onGuidesToggle}
            >
              <span className="text-white">Off</span>
              {!guides.enabled && <Check size={16} className="text-white" />}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* Zoom Sub-menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[state=open]:bg-gray-700 px-4 py-3 cursor-pointer border-none text-white">
            <div className="flex items-center space-x-3">
              <ZoomIn size={16} className="text-gray-300" />
              <span className="text-white">Zoom</span>
            </div>
            <span className="text-sm text-gray-300 ml-auto">{zoom}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-gray-800 border-gray-600 text-white shadow-xl z-50">
            <DropdownMenuItem
              className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
              onClick={() => onZoomChange('Fit')}
            >
              <div className="flex items-center space-x-3">
                <Shrink size={16} className="text-gray-300" />
                <span className="text-white">Fit</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">T</span>
                {zoom === 'Fit' && <Check size={16} className="text-white" />}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
              onClick={() => onZoomChange('Fill')}
            >
              <div className="flex items-center space-x-3">
                <Maximize2 size={16} className="text-gray-300" />
                <span className="text-white">Fill</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">Y</span>
                {zoom === 'Fill' && <Check size={16} className="text-white" />}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
              onClick={() => onZoomChange('Zoom In')}
            >
              <div className="flex items-center space-x-3">
                <ZoomIn size={16} className="text-gray-300" />
                <span className="text-white">Zoom In</span>
              </div>
              <span className="ml-auto bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">+</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
              onClick={() => onZoomChange('Zoom Out')}
            >
              <div className="flex items-center space-x-3">
                <ZoomOut size={16} className="text-gray-300" />
                <span className="text-white">Zoom Out</span>
              </div>
              <span className="ml-auto bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">-</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
              onClick={() => onZoomChange('100%')}
            >
              <div className="flex items-center space-x-3">
                <ZoomIn size={16} className="text-gray-300" />
                <span className="text-white">Zoom to 100%</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">⌘0</span>
                {zoom === '100%' && <Check size={16} className="text-white" />}
              </div>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* View on Asset Sub-menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center justify-between hover:bg-gray-700 focus:bg-gray-700 data-[state=open]:bg-gray-700 px-4 py-3 cursor-pointer border-none text-white">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 border border-gray-300 rounded-sm" />
              <span className="text-white">View on Asset</span>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-gray-800 border-gray-600 text-white shadow-xl z-50">
            {/* Encode Comments */}
            <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 cursor-pointer p-0">
              <div className="flex items-center justify-between w-full px-4 py-3">
                <div className="flex items-center space-x-3">
                  <MessageSquare size={16} className="text-gray-300" />
                  <span className="text-white">Encode Comments</span>
                </div>
                <Switch
                  checked={encodeComments}
                  onCheckedChange={(checked) => {
                    setEncodeComments(checked);
                    console.log(`Encode Comments ${checked ? 'enabled' : 'disabled'}`);
                  }}
                  className="data-[state=checked]:bg-blue-600 scale-75"
                />
              </div>
            </DropdownMenuItem>

            {/* Annotations */}
            <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 cursor-pointer p-0">
              <div className="flex items-center justify-between w-full px-4 py-3">
                <div className="flex items-center space-x-3">
                  <Pencil size={16} className="text-gray-300" />
                  <span className="text-white">Annotations</span>
                </div>
                <Switch
                  checked={annotations}
                  onCheckedChange={(checked) => {
                    setAnnotations(checked);
                    console.log(`Annotations ${checked ? 'enabled' : 'disabled'}`);
                  }}
                  className="data-[state=checked]:bg-blue-600 scale-75"
                />
              </div>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* Separator before Set Frame as Thumb */}
        <DropdownMenuSeparator className="bg-gray-600 my-1" />
        
        {/* Set Frame as Thumb */}
        <DropdownMenuItem 
          className="hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
          onClick={handleSetFrameAsThumb}
        >
          <div className="flex items-center space-x-3">
            <Image size={16} className="text-gray-300" />
            <span className="text-white">Set Frame as Thumb</span>
          </div>
        </DropdownMenuItem>
        
        {/* Download Still */}
        <DropdownMenuItem 
          className="hover:bg-gray-700 focus:bg-gray-700 data-[highlighted]:bg-gray-700 px-4 py-3 cursor-pointer text-white"
          onClick={handleDownloadStill}
        >
          <div className="flex items-center space-x-3">
            <ArrowDown size={16} className="text-gray-300" />
            <span className="text-white">Download Still</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
