
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Tag, Clock, User, Download, Eye, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AssetMetadataProps {
  assetId: string;
  assetName: string;
  onClose: () => void;
}

export const AssetMetadata = ({ assetId, assetName, onClose }: AssetMetadataProps) => {
  const [metadata, setMetadata] = useState({
    title: assetName,
    description: "",
    tags: ["video", "production"],
    status: "in-progress",
    priority: "medium",
    assignedTo: "John Doe",
    category: "video",
    resolution: "1920x1080",
    duration: "00:02:30",
    frameRate: "24fps",
    codec: "H.264",
    fileSize: "125MB",
    colorSpace: "Rec. 709",
    customFields: {
      scene: "",
      take: "",
      camera: "",
      location: ""
    }
  });

  const [newTag, setNewTag] = useState("");
  const [versionHistory] = useState([
    { version: "v1.3", date: "2024-01-15", author: "John Doe", changes: "Color correction adjustments" },
    { version: "v1.2", date: "2024-01-14", author: "Sarah Smith", changes: "Audio sync fix" },
    { version: "v1.1", date: "2024-01-13", author: "Mike Johnson", changes: "Initial rough cut" },
    { version: "v1.0", date: "2024-01-12", author: "John Doe", changes: "Original upload" }
  ]);

  const [accessLog] = useState([
    { user: "Sarah Smith", action: "Downloaded", timestamp: "2024-01-15 14:30" },
    { user: "Mike Johnson", action: "Viewed", timestamp: "2024-01-15 12:15" },
    { user: "John Doe", action: "Uploaded", timestamp: "2024-01-15 10:00" }
  ]);

  const handleAddTag = () => {
    if (newTag.trim() && !metadata.tags.includes(newTag.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = () => {
    toast({
      title: "Metadata saved",
      description: "Asset metadata has been updated successfully."
    });
    onClose();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Asset Metadata</h1>
        <Button onClick={onClose} variant="outline" className="border-gray-600 text-gray-300">
          Close
        </Button>
      </div>

      <Tabs defaultValue="metadata" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="metadata" className="text-gray-300">
            <FileText className="h-4 w-4 mr-2" />
            Metadata
          </TabsTrigger>
          <TabsTrigger value="versions" className="text-gray-300">
            <Clock className="h-4 w-4 mr-2" />
            Versions
          </TabsTrigger>
          <TabsTrigger value="access" className="text-gray-300">
            <Eye className="h-4 w-4 mr-2" />
            Access Log
          </TabsTrigger>
          <TabsTrigger value="sharing" className="text-gray-300">
            <Share2 className="h-4 w-4 mr-2" />
            Sharing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metadata" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Title</Label>
                  <Input
                    value={metadata.title}
                    onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Description</Label>
                  <Textarea
                    value={metadata.description}
                    onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Status</Label>
                  <Select value={metadata.status} onValueChange={(value) => setMetadata(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Priority</Label>
                  <Select value={metadata.priority} onValueChange={(value) => setMetadata(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Technical Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-400">Resolution</Label>
                    <p className="text-white">{metadata.resolution}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Duration</Label>
                    <p className="text-white">{metadata.duration}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Frame Rate</Label>
                    <p className="text-white">{metadata.frameRate}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Codec</Label>
                    <p className="text-white">{metadata.codec}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">File Size</Label>
                    <p className="text-white">{metadata.fileSize}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Color Space</Label>
                    <p className="text-white">{metadata.colorSpace}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {metadata.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-600 text-white cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add new tag"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button onClick={handleAddTag} className="bg-blue-600 hover:bg-blue-700">
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Custom Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Scene</Label>
                  <Input
                    value={metadata.customFields.scene}
                    onChange={(e) => setMetadata(prev => ({
                      ...prev,
                      customFields: { ...prev.customFields, scene: e.target.value }
                    }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Take</Label>
                  <Input
                    value={metadata.customFields.take}
                    onChange={(e) => setMetadata(prev => ({
                      ...prev,
                      customFields: { ...prev.customFields, take: e.target.value }
                    }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Camera</Label>
                  <Input
                    value={metadata.customFields.camera}
                    onChange={(e) => setMetadata(prev => ({
                      ...prev,
                      customFields: { ...prev.customFields, camera: e.target.value }
                    }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Location</Label>
                  <Input
                    value={metadata.customFields.location}
                    onChange={(e) => setMetadata(prev => ({
                      ...prev,
                      customFields: { ...prev.customFields, location: e.target.value }
                    }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Version History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {versionHistory.map((version, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-blue-600">{version.version}</Badge>
                      <div>
                        <p className="text-white font-medium">{version.changes}</p>
                        <p className="text-gray-400 text-sm">
                          by {version.author} on {version.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Access Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accessLog.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-white">{log.user}</p>
                        <p className="text-gray-400 text-sm">{log.action}</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">{log.timestamp}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Share Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Share Link</Label>
                <div className="flex space-x-2">
                  <Input
                    value={`https://frmzz.com/share/${assetId}`}
                    readOnly
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700">Copy</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Access Level</Label>
                  <Select defaultValue="view">
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="view">View Only</SelectItem>
                      <SelectItem value="comment">View & Comment</SelectItem>
                      <SelectItem value="download">View & Download</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Expiration</Label>
                  <Select defaultValue="never">
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="1day">1 Day</SelectItem>
                      <SelectItem value="1week">1 Week</SelectItem>
                      <SelectItem value="1month">1 Month</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
        <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300">
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          Save Changes
        </Button>
      </div>
    </div>
  );
};
