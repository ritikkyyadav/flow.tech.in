
import React from 'react';
import { FixedCategoryChart } from './FixedCategoryChart';
import { ChartDataService } from '@/services/chartDataService';
import { Transaction } from '@/contexts/TransactionContext';

interface EnhancedCategoryChartProps {
  data: Transaction[];
  loading?: boolean;
  className?: string;
}

export const EnhancedCategoryChart: React.FC<EnhancedCategoryChartProps> = ({ 
  data, 
  loading = false, 
  className = "" 
}) => {
  const categoryData = ChartDataService.prepareCategoryData(data);

  return (
    <FixedCategoryChart 
      data={categoryData}
      loading={loading}
      className={className}
    />
  );
};
