
import React, { useState } from 'react';
import { ResponsiveLayout } from '@/components/mobile/ResponsiveLayout';
import { BudgetProvider } from '@/contexts/BudgetContext';
import { BudgetSetupForm } from '@/components/budget/BudgetSetupForm';
import { BudgetOverview } from '@/components/budget/BudgetOverview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Plus, BarChart3 } from 'lucide-react';

const BudgetContent = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
            <p className="text-gray-600">Set limits, track spending, and stay on budget</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="setup" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Setup Budgets</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <BudgetOverview />
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            <BudgetSetupForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const Budget = () => {
  return (
    <ResponsiveLayout title="Budget Management" activeTab="budget">
      <BudgetProvider>
        <BudgetContent />
      </BudgetProvider>
    </ResponsiveLayout>
  );
};

export default Budget;
