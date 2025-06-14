
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  FileText, 
  BarChart3, 
  Download, 
  Target, 
  Calculator,
  Camera,
  Mic
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsPanelProps {
  onRefresh: () => void;
  className?: string;
}

export const QuickActionsPanel = ({ onRefresh, className }: QuickActionsPanelProps) => {
  const quickActions = [
    {
      id: 'add-transaction',
      label: 'Add Transaction',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      primary: true
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      icon: FileText,
      color: 'bg-green-500 hover:bg-green-600',
      primary: false
    },
    {
      id: 'create-invoice',
      label: 'Create Invoice',
      icon: FileText,
      color: 'bg-purple-500 hover:bg-purple-600',
      primary: false
    },
    {
      id: 'set-budget',
      label: 'Set Budget',
      icon: Target,
      color: 'bg-orange-500 hover:bg-orange-600',
      primary: false
    },
    {
      id: 'export-data',
      label: 'Export Data',
      icon: Download,
      color: 'bg-gray-500 hover:bg-gray-600',
      primary: false
    },
    {
      id: 'calculator',
      label: 'Calculator',
      icon: Calculator,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      primary: false
    }
  ];

  const contextualActions = [
    {
      id: 'scan-receipt',
      label: 'Scan Receipt',
      icon: Camera,
      description: 'Add expense from receipt'
    },
    {
      id: 'voice-entry',
      label: 'Voice Entry',
      icon: Mic,
      description: 'Add transaction by voice'
    }
  ];

  const handleActionClick = (actionId: string) => {
    console.log(`Action clicked: ${actionId}`);
    
    switch (actionId) {
      case 'add-transaction':
        // Would open transaction modal
        onRefresh();
        break;
      case 'generate-report':
        // Would generate and download report
        break;
      case 'create-invoice':
        // Would open invoice builder
        break;
      case 'set-budget':
        // Would open budget settings
        break;
      case 'export-data':
        // Would export data
        break;
      default:
        console.log(`Action ${actionId} not implemented yet`);
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Primary Actions */}
        <div className="space-y-3 mb-6">
          {quickActions.filter(action => action.primary).map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.id}
                onClick={() => handleActionClick(action.id)}
                className={cn(
                  "w-full flex items-center justify-center space-x-3 py-3 text-white font-medium",
                  action.color
                )}
              >
                <IconComponent className="w-5 h-5" />
                <span>{action.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Secondary Actions Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {quickActions.filter(action => !action.primary).map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.id}
                onClick={() => handleActionClick(action.id)}
                variant="outline"
                className={cn(
                  "h-16 flex flex-col items-center justify-center space-y-1 text-white border-gray-600 hover:bg-gray-700",
                  action.color.replace('bg-', 'hover:bg-').replace('hover:bg-', 'hover:bg-')
                )}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs">{action.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Contextual Actions */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-300 mb-2">Smart Features</div>
          {contextualActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.id}
                onClick={() => handleActionClick(action.id)}
                variant="ghost"
                className="w-full flex items-center justify-start space-x-3 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <IconComponent className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs text-gray-400">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Recently Used */}
        <div className="mt-6 pt-4 border-t border-gray-600">
          <div className="text-sm font-medium text-gray-300 mb-2">Recently Used</div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              Add Expense
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              Set Budget
            </Button>
          </div>
        </div>

        {/* Context Awareness */}
        <div className="mt-4 p-3 bg-gray-700 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Smart Suggestion</div>
          <div className="text-sm text-gray-200">
            Based on your spending pattern, consider setting a budget for dining out this month.
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 text-xs text-gray-300 border-gray-600 hover:bg-gray-600"
          >
            Set Dining Budget
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
