
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvancedFilteringProps {
  onFilterChange: (filters: any) => void;
}

export const AdvancedFiltering = ({ onFilterChange }: AdvancedFilteringProps) => {
  const [dateRange, setDateRange] = useState('last30days');
  const [transactionType, setTransactionType] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [amountRange, setAmountRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const dateRangeOptions = [
    { value: 'last7days', label: 'Last 7 days' },
    { value: 'last30days', label: 'Last 30 days' },
    { value: 'last3months', label: 'Last 3 months' },
    { value: 'lastyear', label: 'Last year' },
    { value: 'custom', label: 'Custom' }
  ];

  const categoryOptions = [
    'Food & Dining', 'Transportation', 'Utilities', 'Entertainment', 
    'Healthcare', 'Shopping', 'Education', 'Travel', 'Business', 'Others'
  ];

  const amountRangeOptions = [
    { value: 'all', label: 'All amounts' },
    { value: 'under100', label: 'Under ₹100' },
    { value: '100to1000', label: '₹100 - ₹1,000' },
    { value: '1000to10000', label: '₹1,000 - ₹10,000' },
    { value: 'above10000', label: 'Above ₹10,000' }
  ];

  const handleFilterChange = () => {
    const filters = {
      dateRange,
      transactionType,
      categories,
      amountRange
    };
    onFilterChange(filters);
  };

  const clearFilters = () => {
    setDateRange('last30days');
    setTransactionType('all');
    setCategories([]);
    setAmountRange('all');
    onFilterChange({
      dateRange: 'last30days',
      transactionType: 'all',
      categories: [],
      amountRange: 'all'
    });
  };

  const toggleCategory = (category: string) => {
    setCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const hasActiveFilters = dateRange !== 'last30days' || 
                          transactionType !== 'all' || 
                          categories.length > 0 || 
                          amountRange !== 'all';

  return (
    <div className="space-y-4">
      {/* Quick Filter Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={transactionType} onValueChange={setTransactionType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center space-x-2",
              showFilters && "bg-blue-50 text-blue-700 border-blue-200"
            )}
          >
            <Filter className="w-4 h-4" />
            <span>More Filters</span>
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs rounded-full w-2 h-2"></span>
            )}
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
          <Button size="sm" onClick={handleFilterChange}>
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Extended Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categories */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={cn(
                      "px-3 py-1 text-xs rounded-full border transition-colors",
                      categories.includes(category)
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Range */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Amount Range
              </label>
              <Select value={amountRange} onValueChange={setAmountRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {amountRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Filter Presets */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Quick Presets
            </label>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTransactionType('expense');
                  setCategories(['Business']);
                }}
              >
                Business Only
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTransactionType('expense');
                  setCategories(['Food & Dining', 'Entertainment', 'Shopping']);
                }}
              >
                Personal Only
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
