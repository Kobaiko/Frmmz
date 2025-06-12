
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Workflow, 
  Plus, 
  Settings, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Play,
  Pause,
  Edit,
  Trash2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdvancedWorkflowsProps {
  onClose: () => void;
}

export const AdvancedWorkflows = ({ onClose }: AdvancedWorkflowsProps) => {
  const [workflows, setWorkflows] = useState([
    {
      id: 'video-review',
      name: 'Video Review & Approval',
      description: 'Standard workflow for video content review and approval',
      status: 'active',
      stages: [
        { name: 'Upload', assignedTo: 'Creator', status: 'completed', duration: '1 day' },
        { name: 'Initial Review', assignedTo: 'Editor', status: 'completed', duration: '2 days' },
        { name: 'Client Review', assignedTo: 'Client', status: 'in-progress', duration: '3 days' },
        { name: 'Final Approval', assignedTo: 'Director', status: 'pending', duration: '1 day' },
        { name: 'Delivery', assignedTo: 'Producer', status: 'pending', duration: '1 day' }
      ],
      automation: {
        autoNotifications: true,
        autoEscalation: true,
        autoAssignment: false
      },
      projectsUsing: 12
    },
    {
      id: 'commercial-production',
      name: 'Commercial Production',
      description: 'End-to-end commercial production workflow',
      status: 'active',
      stages: [
        { name: 'Concept Development', assignedTo: 'Creative Director', status: 'completed', duration: '5 days' },
        { name: 'Pre-production', assignedTo: 'Producer', status: 'completed', duration: '7 days' },
        { name: 'Production', assignedTo: 'Director', status: 'in-progress', duration: '3 days' },
        { name: 'Post-production', assignedTo: 'Editor', status: 'pending', duration: '14 days' },
        { name: 'Client Review', assignedTo: 'Client', status: 'pending', duration: '5 days' },
        { name: 'Final Delivery', assignedTo: 'Producer', status: 'pending', duration: '2 days' }
      ],
      automation: {
        autoNotifications: true,
        autoEscalation: false,
        autoAssignment: true
      },
      projectsUsing: 8
    }
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    stages: [
      { name: 'Stage 1', assignedTo: '', duration: '1 day' }
    ]
  });

  const handleCreateWorkflow = () => {
    const workflow = {
      id: Math.random().toString(36).substr(2, 9),
      ...newWorkflow,
      status: 'draft',
      automation: {
        autoNotifications: true,
        autoEscalation: false,
        autoAssignment: false
      },
      projectsUsing: 0,
      stages: newWorkflow.stages.map(stage => ({
        ...stage,
        status: 'pending'
      }))
    };
    
    setWorkflows([...workflows, workflow]);
    setShowCreateDialog(false);
    setNewWorkflow({
      name: '',
      description: '',
      stages: [{ name: 'Stage 1', assignedTo: '', duration: '1 day' }]
    });
    
    toast({
      title: "Workflow created",
      description: `${newWorkflow.name} workflow has been created successfully.`
    });
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    setWorkflows(workflows.filter(w => w.id !== workflowId));
    toast({
      title: "Workflow deleted",
      description: "Workflow has been deleted successfully."
    });
  };

  const addStage = () => {
    setNewWorkflow(prev => ({
      ...prev,
      stages: [...prev.stages, { name: `Stage ${prev.stages.length + 1}`, assignedTo: '', duration: '1 day' }]
    }));
  };

  const removeStage = (index: number) => {
    setNewWorkflow(prev => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index)
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Pause className="h-4 w-4 text-gray-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600">Active</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-600">Paused</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Advanced Workflows</h1>
          <p className="text-gray-400">Create and manage custom approval workflows</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
          <Button onClick={onClose} variant="outline" className="border-gray-600 text-gray-300">
            Close
          </Button>
        </div>
      </div>

      <Tabs defaultValue="workflows" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="workflows" className="text-gray-300">
            <Workflow className="h-4 w-4 mr-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="active" className="text-gray-300">
            <Play className="h-4 w-4 mr-2" />
            Active Processes
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-gray-300">
            <Settings className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workflows.map(workflow => (
              <Card key={workflow.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">{workflow.name}</CardTitle>
                      <p className="text-gray-400 text-sm mt-1">{workflow.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(workflow.status)}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedWorkflow(workflow)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {workflow.stages.map((stage, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-gray-700 rounded">
                        {getStatusIcon(stage.status)}
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{stage.name}</p>
                          <p className="text-gray-400 text-xs">
                            {stage.assignedTo} • {stage.duration}
                          </p>
                        </div>
                        {index < workflow.stages.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{workflow.projectsUsing} projects using</span>
                    <div className="flex space-x-4">
                      {workflow.automation.autoNotifications && (
                        <span className="text-blue-400">Auto-notify</span>
                      )}
                      {workflow.automation.autoEscalation && (
                        <span className="text-yellow-400">Auto-escalate</span>
                      )}
                      {workflow.automation.autoAssignment && (
                        <span className="text-green-400">Auto-assign</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Active Workflow Processes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { project: 'Commercial Campaign A', workflow: 'Commercial Production', stage: 'Production', progress: 60, dueDate: '2024-01-20' },
                  { project: 'Social Media Series', workflow: 'Video Review & Approval', stage: 'Client Review', progress: 80, dueDate: '2024-01-18' },
                  { project: 'Corporate Video', workflow: 'Video Review & Approval', stage: 'Final Approval', progress: 90, dueDate: '2024-01-16' }
                ].map((process, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">{process.project}</h3>
                      <p className="text-gray-400 text-sm">{process.workflow} • {process.stage}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-20 bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${process.progress}%` }}
                          />
                        </div>
                        <span className="text-gray-400 text-sm">{process.progress}%</span>
                      </div>
                      <p className="text-gray-500 text-xs">Due: {process.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg. Completion Time</p>
                    <p className="text-white text-2xl font-bold">8.5 days</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Bottleneck Stage</p>
                    <p className="text-white text-xl font-bold">Client Review</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Success Rate</p>
                    <p className="text-white text-2xl font-bold">94%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Workflow Name</Label>
                <Input
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter workflow name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Description</Label>
                <Input
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Brief description"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300">Workflow Stages</Label>
                <Button size="sm" onClick={addStage} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Stage
                </Button>
              </div>
              
              <div className="space-y-3">
                {newWorkflow.stages.map((stage, index) => (
                  <div key={index} className="grid grid-cols-3 gap-3 items-end">
                    <div className="space-y-2">
                      <Label className="text-gray-400 text-sm">Stage Name</Label>
                      <Input
                        value={stage.name}
                        onChange={(e) => {
                          const newStages = [...newWorkflow.stages];
                          newStages[index].name = e.target.value;
                          setNewWorkflow(prev => ({ ...prev, stages: newStages }));
                        }}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-400 text-sm">Assigned To</Label>
                      <Select value={stage.assignedTo} onValueChange={(value) => {
                        const newStages = [...newWorkflow.stages];
                        newStages[index].assignedTo = value;
                        setNewWorkflow(prev => ({ ...prev, stages: newStages }));
                      }}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="Creator">Creator</SelectItem>
                          <SelectItem value="Editor">Editor</SelectItem>
                          <SelectItem value="Director">Director</SelectItem>
                          <SelectItem value="Producer">Producer</SelectItem>
                          <SelectItem value="Client">Client</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        value={stage.duration}
                        onChange={(e) => {
                          const newStages = [...newWorkflow.stages];
                          newStages[index].duration = e.target.value;
                          setNewWorkflow(prev => ({ ...prev, stages: newStages }));
                        }}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="1 day"
                      />
                      {newWorkflow.stages.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeStage(index)}
                          className="border-red-600 text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
              <Button onClick={handleCreateWorkflow} className="bg-blue-600 hover:bg-blue-700">
                Create Workflow
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
