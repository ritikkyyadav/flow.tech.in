
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, TrendingUp, TrendingDown, FileText, MessageSquare } from "lucide-react";

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export const QuickActions = ({ onAction }: QuickActionsProps) => {
  const actions = [
    {
      id: 'add-expense',
      label: 'Add Expense',
      icon: TrendingDown,
      color: 'bg-red-50 hover:bg-red-100 border-red-200',
      iconColor: 'text-red-600'
    },
    {
      id: 'add-income',
      label: 'Add Income',
      icon: TrendingUp,
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      iconColor: 'text-green-600'
    },
    {
      id: 'create-invoice',
      label: 'Create Invoice',
      icon: FileText,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      id: 'ai-assistant',
      label: 'AI Assistant',
      icon: MessageSquare,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-black mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className={`h-20 flex-col space-y-2 ${action.color}`}
              onClick={() => onAction(action.id)}
            >
              <action.icon className={`w-6 h-6 ${action.iconColor}`} />
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
