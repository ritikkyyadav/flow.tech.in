
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, Printer, FileText, Table } from "lucide-react";

interface ReportFiltersProps {
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onExport: (format: 'pdf' | 'excel') => void;
  onPrint: () => void;
  isGenerating: boolean;
}

export const ReportFilters = ({ 
  dateRange, 
  onDateRangeChange, 
  onExport, 
  onPrint, 
  isGenerating 
}: ReportFiltersProps) => {
  const [quickSelect, setQuickSelect] = useState('custom');

  const handleQuickSelect = (period: string) => {
    setQuickSelect(period);
    const today = new Date();
    let start: Date;
    let end = new Date();

    switch (period) {
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'thisQuarter':
        const quarterStart = Math.floor(today.getMonth() / 3) * 3;
        start = new Date(today.getFullYear(), quarterStart, 1);
        break;
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      case 'lastYear':
        start = new Date(today.getFullYear() - 1, 0, 1);
        end = new Date(today.getFullYear() - 1, 11, 31);
        break;
      default:
        return;
    }

    onDateRangeChange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  };

  return (
    <Card className="print:hidden">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          {/* Date Range Selection */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quick-select" className="text-sm font-medium text-gray-700">
                Quick Select
              </Label>
              <Select value={quickSelect} onValueChange={handleQuickSelect}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="thisQuarter">This Quarter</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="lastYear">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start-date" className="text-sm font-medium text-gray-700">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="end-date" className="text-sm font-medium text-gray-700">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('pdf')}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Export PDF'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('excel')}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Table className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Export Excel'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onPrint}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
