
import React from 'react';
import { FixedIncomeExpenseChart } from './FixedIncomeExpenseChart';
import { ChartDataService } from '@/services/chartDataService';

interface IncomeExpenseChartProps {
  data: any[];
  loading?: boolean;
  className?: string;
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ 
  data, 
  loading = false, 
  className = "" 
}) => {
  // Convert the data to the expected format if needed
  const formattedData = data.map(item => ({
    month: item.month,
    income: item.income || 0,
    expenses: item.expenses || 0,
    net: (item.income || 0) - (item.expenses || 0)
  }));

  return (
    <FixedIncomeExpenseChart 
      data={formattedData}
      loading={loading}
      className={className}
    />
  );
};
