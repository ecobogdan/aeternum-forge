import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { Grid, Plus, Trash2, RotateCcw, Share2, Calculator } from "lucide-react";

interface MatrixRow {
  id: string;
  item: string;
  quantity: number;
  price: number;
  multiplier: number;
  total: number;
}

const MatrixCalculator = () => {
  const [rows, setRows] = useState<MatrixRow[]>([
    { id: '1', item: '', quantity: 0, price: 0, multiplier: 1, total: 0 }
  ]);
  const [targetSellPrice, setTargetSellPrice] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    calculateTotals();
    localStorage.setItem('matrixCalculatorData', JSON.stringify({ rows, targetSellPrice }));
  }, [rows, targetSellPrice]);

  useEffect(() => {
    const saved = localStorage.getItem('matrixCalculatorData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.rows) setRows(data.rows);
        if (data.targetSellPrice) setTargetSellPrice(data.targetSellPrice);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  const calculateTotals = () => {
    setRows(prev => prev.map(row => ({
      ...row,
      total: row.quantity * row.price * row.multiplier
    })));
  };

  const addRow = () => {
    const newRow: MatrixRow = {
      id: Date.now().toString(),
      item: '',
      quantity: 0,
      price: 0,
      multiplier: 1,
      total: 0
    };
    setRows(prev => [...prev, newRow]);
  };

  const removeRow = (id: string) => {
    setRows(prev => prev.filter(row => row.id !== id));
  };

  const updateRow = (id: string, field: keyof MatrixRow, value: string | number) => {
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const resetCalculator = () => {
    setRows([{ id: '1', item: '', quantity: 0, price: 0, multiplier: 1, total: 0 }]);
    setTargetSellPrice(0);
    localStorage.removeItem('matrixCalculatorData');
    toast({
      title: "Calculator Reset",
      description: "All data has been reset",
    });
  };

  const shareCalculation = () => {
    const data = { rows, targetSellPrice };
    const encoded = btoa(JSON.stringify(data));
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Link Copied!",
      description: "Matrix calculation copied to clipboard",
    });
  };

  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);
  const profit = targetSellPrice - grandTotal;
  const roi = grandTotal > 0 ? (profit / grandTotal) * 100 : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Grid className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Matrix Calculator</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Track multiple investments, calculate totals, and analyze profit margins with this flexible matrix calculator.
          </p>
        </div>

        <div className="space-y-8">
          {/* Matrix Table */}
          <Card className="gradient-card border-gaming-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Investment Matrix
                </CardTitle>
                <Button onClick={addRow} variant="gaming" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Row
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-full space-y-4">
                  {/* Header */}
                  <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-muted-foreground">
                    <div>Item</div>
                    <div>Quantity</div>
                    <div>Price</div>
                    <div>Multiplier</div>
                    <div>Total</div>
                    <div>Actions</div>
                  </div>
                  
                  {/* Rows */}
                  {rows.map((row) => (
                    <div key={row.id} className="grid grid-cols-6 gap-4 items-center">
                      <Input
                        value={row.item}
                        onChange={(e) => updateRow(row.id, 'item', e.target.value)}
                        placeholder="Item name"
                        className="bg-gaming-surface border-gaming-border"
                      />
                      <Input
                        type="number"
                        min="0"
                        value={row.quantity || ''}
                        onChange={(e) => updateRow(row.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="bg-gaming-surface border-gaming-border"
                      />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.price || ''}
                        onChange={(e) => updateRow(row.id, 'price', parseFloat(e.target.value) || 0)}
                        className="bg-gaming-surface border-gaming-border"
                      />
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={row.multiplier || ''}
                        onChange={(e) => updateRow(row.id, 'multiplier', parseFloat(e.target.value) || 1)}
                        className="bg-gaming-surface border-gaming-border"
                      />
                      <div className="font-mono text-sm">{row.total.toFixed(2)}</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="gradient-card border-gaming-border">
              <CardHeader>
                <CardTitle>Cost Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-2xl font-bold">
                    <span>Grand Total:</span>
                    <span className="text-primary">{grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total investment across {rows.length} items
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card border-gaming-border">
              <CardHeader>
                <CardTitle>Profit Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetPrice">Target Sell Price</Label>
                    <Input
                      id="targetPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={targetSellPrice || ''}
                      onChange={(e) => setTargetSellPrice(parseFloat(e.target.value) || 0)}
                      className="bg-gaming-surface border-gaming-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Profit:</span>
                      <span className={profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>ROI:</span>
                      <span className={roi >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={resetCalculator}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button variant="gaming" onClick={shareCalculation}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MatrixCalculator;