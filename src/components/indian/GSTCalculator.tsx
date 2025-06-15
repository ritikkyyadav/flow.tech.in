
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, IndianRupee } from "lucide-react";
import { calculateGST, extractGSTFromTotal, formatIndianCurrency } from "@/utils/indianUtils";

export const GSTCalculator = () => {
  const [amount, setAmount] = useState<string>('');
  const [gstRate, setGstRate] = useState<string>('18');
  const [calculationType, setCalculationType] = useState<'add' | 'extract'>('add');
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    const numAmount = parseFloat(amount);
    const numGstRate = parseFloat(gstRate);
    
    if (isNaN(numAmount) || numAmount <= 0) return;
    
    if (calculationType === 'add') {
      setResult(calculateGST(numAmount, numGstRate));
    } else {
      setResult(extractGSTFromTotal(numAmount, numGstRate));
    }
  };

  const reset = () => {
    setAmount('');
    setResult(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          GST Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="calculation-type">Calculation Type</Label>
            <Select value={calculationType} onValueChange={(value: 'add' | 'extract') => setCalculationType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add GST to Amount</SelectItem>
                <SelectItem value="extract">Extract GST from Total</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gst-rate">GST Rate (%)</Label>
            <Select value={gstRate} onValueChange={setGstRate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0% (Exempt)</SelectItem>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="12">12%</SelectItem>
                <SelectItem value="18">18%</SelectItem>
                <SelectItem value="28">28%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">
            {calculationType === 'add' ? 'Base Amount (₹)' : 'Total Amount with GST (₹)'}
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleCalculate} className="flex-1">
            Calculate GST
          </Button>
          <Button onClick={reset} variant="outline">
            Reset
          </Button>
        </div>

        {result && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">GST Calculation Result</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base Amount:</span>
                <span className="font-mono">{formatIndianCurrency(result.baseAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST ({result.gstRate}%):</span>
                <span className="font-mono">{formatIndianCurrency(result.gstAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-blue-300 pt-2 font-semibold">
                <span>Total Amount:</span>
                <span className="font-mono">{formatIndianCurrency(result.totalWithGST || result.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
