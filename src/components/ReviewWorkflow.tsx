
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApprovalStages } from "./ApprovalStages";
import { ReviewStatus } from "./ReviewStatus";
import { ReviewAnalytics } from "./ReviewAnalytics";
import { WorkflowTemplates } from "./WorkflowTemplates";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  Calendar,
  BarChart3,
  Settings
} from "lucide-react";

export interface ReviewStage {
  id: string;
  name: string;
  description: string;
  approvers: string[];
  requiredApprovals: number;
  currentApprovals: number;
  status: 'pending' | 'in-progress' | 'approved' | 'rejected';
  deadline?: Date;
  order: number;
}

export interface WorkflowData {
  id: string;
  name: string;
  projectId: string;
  assetId: string;
  stages: ReviewStage[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

interface ReviewWorkflowProps {
  assetId: string;
  projectId: string;
  onWorkflowComplete?: (workflowId: string) => void;
}

export const ReviewWorkflow = ({ assetId, projectId, onWorkflowComplete }: ReviewWorkflowProps) => {
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowData | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Mock workflow data - in real app this would come from API
  const mockWorkflow: WorkflowData = {
    id: 'workflow-1',
    name: 'Creative Review Process',
    projectId,
    assetId,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    stages: [
      {
        id: 'stage-1',
        name: 'Initial Review',
        description: 'Creative team initial feedback',
        approvers: ['Creative Director', 'Art Director'],
        requiredApprovals: 1,
        currentApprovals: 1,
        status: 'approved',
        order: 1
      },
      {
        id: 'stage-2',
        name: 'Client Review',
        description: 'Client feedback and approval',
        approvers: ['Client Stakeholder', 'Account Manager'],
        requiredApprovals: 2,
        currentApprovals: 1,
        status: 'in-progress',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        order: 2
      },
      {
        id: 'stage-3',
        name: 'Final Approval',
        description: 'Executive sign-off',
        approvers: ['Executive Producer'],
        requiredApprovals: 1,
        currentApprovals: 0,
        status: 'pending',
        order: 3
      }
    ]
  };

  const getWorkflowProgress = () => {
    const completedStages = mockWorkflow.stages.filter(stage => stage.status === 'approved').length;
    return (completedStages / mockWorkflow.stages.length) * 100;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleCreateWorkflow = (template: any) => {
    setActiveWorkflow(mockWorkflow);
    setShowTemplates(false);
    console.log('Creating workflow from template:', template);
  };

  const handleStageUpdate = (stageId: string, updates: Partial<ReviewStage>) => {
    console.log('Updating stage:', stageId, updates);
    // In real app, update the workflow stage
  };

  if (showTemplates) {
    return (
      <WorkflowTemplates
        onSelectTemplate={handleCreateWorkflow}
        onCancel={() => setShowTemplates(false)}
      />
    );
  }

  if (!activeWorkflow) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-pink-400" />
            <span>Review Workflow</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-400">
            Set up a structured review and approval process for this asset.
          </p>
          <div className="flex space-x-3">
            <Button 
              onClick={() => setShowTemplates(true)}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Settings className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300"
            >
              <Users className="h-4 w-4 mr-2" />
              Quick Approval
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">{activeWorkflow.name}</h2>
              <div className="flex items-center space-x-4 mt-2">
                <Badge 
                  variant="secondary" 
                  className="bg-blue-600 text-white"
                >
                  {activeWorkflow.status}
                </Badge>
                <span className="text-gray-400 text-sm flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Started {activeWorkflow.createdAt.toLocaleDateString()}
                </span>
              </div>
            </div>
            <ReviewStatus workflow={activeWorkflow} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">{Math.round(getWorkflowProgress())}% Complete</span>
            </div>
            <Progress 
              value={getWorkflowProgress()} 
              className="h-2 bg-gray-700"
            />
          </div>
        </CardContent>
      </Card>

      {/* Workflow Tabs */}
      <Tabs defaultValue="stages" className="w-full">
        <TabsList className="bg-gray-700 border-gray-600">
          <TabsTrigger 
            value="stages" 
            className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
          >
            Approval Stages
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
          >
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="stages" className="mt-6">
          <ApprovalStages 
            stages={activeWorkflow.stages}
            onStageUpdate={handleStageUpdate}
          />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <ReviewAnalytics workflow={activeWorkflow} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
