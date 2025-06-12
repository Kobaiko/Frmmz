
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Plus, 
  Play, 
  Settings, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Zap,
  GitBranch,
  Mail,
  Bell
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdvancedWorkflowsProps {
  onClose: () => void;
}

export const AdvancedWorkflows = ({ onClose }: AdvancedWorkflowsProps) => {
  const [activeTab, setActiveTab] = useState("templates");
  
  const workflowTemplates = [
    {
      id: "client-review",
      name: "Client Review Process",
      description: "Automated workflow for client feedback and approvals",
      steps: 5,
      estimatedTime: "2-3 days",
      category: "review",
      active: true
    },
    {
      id: "content-approval",
      name: "Content Approval Chain",
      description: "Multi-stage approval process for sensitive content",
      steps: 4,
      estimatedTime: "1-2 days",
      category: "approval",
      active: false
    },
    {
      id: "post-production",
      name: "Post-Production Pipeline",
      description: "Automated workflow from rough cut to final delivery",
      steps: 8,
      estimatedTime: "1-2 weeks",
      category: "production",
      active: true
    }
  ];

  const automationRules = [
    {
      id: "auto-notify",
      name: "Auto-notify stakeholders",
      description: "Automatically notify team members when assets are uploaded",
      trigger: "Asset Upload",
      action: "Send Notification",
      enabled: true
    },
    {
      id: "approval-reminder",
      name: "Approval reminders",
      description: "Send reminders for pending approvals after 24 hours",
      trigger: "Pending Approval",
      action: "Send Email",
      enabled: true
    },
    {
      id: "version-stack",
      name: "Auto-version stacking",
      description: "Automatically stack related file versions",
      trigger: "Similar Filename",
      action: "Stack Versions",
      enabled: false
    }
  ];

  const activeWorkflows = [
    {
      id: "wf-001",
      name: "Summer Campaign Review",
      template: "Client Review Process",
      status: "in-progress",
      currentStep: "Client Feedback",
      progress: 60,
      assignee: "Sarah Johnson",
      dueDate: "2024-06-15"
    },
    {
      id: "wf-002",
      name: "Product Launch Video",
      template: "Post-Production Pipeline",
      status: "pending",
      currentStep: "Color Grading",
      progress: 35,
      assignee: "Mike Chen",
      dueDate: "2024-06-20"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'in-progress': return 'bg-blue-600';
      case 'pending': return 'bg-yellow-600';
      case 'overdue': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress': return <Play className="h-4 w-4 text-blue-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onClose} variant="ghost" size="icon" className="text-gray-400">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">Advanced Workflows</h2>
            <p className="text-gray-400">Automate your video production processes</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Workflows</p>
                <p className="text-white text-2xl font-bold">12</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed Today</p>
                <p className="text-white text-2xl font-bold">8</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg. Completion</p>
                <p className="text-white text-2xl font-bold">2.3d</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Automation Rules</p>
                <p className="text-white text-2xl font-bold">{automationRules.filter(r => r.enabled).length}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="templates" className="text-gray-300">Templates</TabsTrigger>
          <TabsTrigger value="active" className="text-gray-300">Active Workflows</TabsTrigger>
          <TabsTrigger value="automation" className="text-gray-300">Automation</TabsTrigger>
          <TabsTrigger value="analytics" className="text-gray-300">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowTemplates.map((template) => (
              <Card key={template.id} className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                    <Badge className={template.active ? 'bg-green-600' : 'bg-gray-600'}>
                      {template.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">{template.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Steps:</span>
                      <span className="text-white">{template.steps}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Est. Time:</span>
                      <span className="text-white">{template.estimatedTime}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      Use Template
                    </Button>
                    <Button size="sm" variant="outline" className="border-gray-600">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <div className="space-y-4">
            {activeWorkflows.map((workflow) => (
              <Card key={workflow.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(workflow.status)}
                      <div>
                        <h3 className="text-white font-medium">{workflow.name}</h3>
                        <p className="text-gray-400 text-sm">{workflow.template}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(workflow.status)}>
                      {workflow.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Current Step</p>
                      <p className="text-white">{workflow.currentStep}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Assignee</p>
                      <p className="text-white">{workflow.assignee}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Due Date</p>
                      <p className="text-white">{workflow.dueDate}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-sm">Progress</span>
                      <span className="text-white text-sm">{workflow.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${workflow.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="border-gray-600">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="border-gray-600">
                      Edit Workflow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Automation Rules</CardTitle>
              <p className="text-gray-400">Configure automatic actions for your workflows</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <GitBranch className="h-5 w-5 text-blue-500" />
                        <div>
                          <h4 className="text-white font-medium">{rule.name}</h4>
                          <p className="text-gray-400 text-sm">{rule.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">Trigger: {rule.trigger}</span>
                            <span className="text-xs text-gray-500">Action: {rule.action}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Switch 
                        checked={rule.enabled}
                        onCheckedChange={(checked) => {
                          toast({
                            title: `Automation ${checked ? 'enabled' : 'disabled'}`,
                            description: `${rule.name} has been ${checked ? 'enabled' : 'disabled'}.`
                          });
                        }}
                      />
                      <Button variant="ghost" size="sm" className="text-gray-400">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Workflow Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Average Completion Time</span>
                    <span className="text-white font-medium">2.3 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Success Rate</span>
                    <span className="text-white font-medium">94%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Bottleneck Step</span>
                    <span className="text-white font-medium">Client Review</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Most Used Template</span>
                    <span className="text-white font-medium">Client Review Process</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-white text-sm">Workflow completed</p>
                      <p className="text-gray-400 text-xs">Summer Campaign Review • 2 min ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Bell className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-white text-sm">Approval reminder sent</p>
                      <p className="text-gray-400 text-xs">Product Launch Video • 5 min ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Play className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-white text-sm">Workflow started</p>
                      <p className="text-gray-400 text-xs">New Project Review • 15 min ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
