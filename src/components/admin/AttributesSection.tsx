import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RotateCcw } from 'lucide-react';

interface AttributesSectionProps {
  attributes: {
    strength: number;
    dexterity: number;
    intelligence: number;
    focus: number;
    constitution: number;
  };
  onAttributesChange: (attributes: any) => void;
}

const ATTRIBUTE_LABELS = {
  strength: 'Strength',
  dexterity: 'Dexterity', 
  intelligence: 'Intelligence',
  focus: 'Focus',
  constitution: 'Constitution',
};

const TOTAL_POINTS = 190;

export function AttributesSection({ attributes, onAttributesChange }: AttributesSectionProps) {
  const totalUsed = Object.values(attributes).reduce((sum, value) => sum + value, 0);
  const availablePoints = TOTAL_POINTS - totalUsed;

  const handleAttributeChange = (attribute: string, value: number[]) => {
    const newValue = value[0];
    const currentValue = attributes[attribute as keyof typeof attributes];
    const difference = newValue - currentValue;
    
    // Check if we have enough points
    if (difference > availablePoints) {
      return;
    }
    
    onAttributesChange({
      ...attributes,
      [attribute]: newValue,
    });
  };

  const resetAttributes = () => {
    onAttributesChange({
      strength: 0,
      dexterity: 0,
      intelligence: 0,
      focus: 0,
      constitution: 0,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Attributes</CardTitle>
            <CardDescription>
              Allocate attribute points for your build
            </CardDescription>
          </div>
          <Button variant="outline" onClick={resetAttributes}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Points
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Points Summary */}
          <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
            <div className="text-3xl font-bold text-primary mb-2">
              {availablePoints}
            </div>
            <div className="text-sm text-muted-foreground">
              POINTS AVAILABLE
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {totalUsed}/{TOTAL_POINTS} points used
            </div>
          </div>

          {/* Attribute Sliders */}
          <div className="space-y-6">
            {Object.entries(ATTRIBUTE_LABELS).map(([key, label]) => {
              const value = attributes[key as keyof typeof attributes];
              
              return (
                <div key={key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">{label}</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Value: {value}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAttributeChange(key, [0])}
                        className="h-6 px-2 text-xs"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                  
                  <div className="px-3">
                    <Slider
                      value={[value]}
                      onValueChange={(newValue) => handleAttributeChange(key, newValue)}
                      max={Math.min(200, value + availablePoints)}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Attribute breakpoints */}
                  <div className="flex justify-between text-xs text-muted-foreground px-3">
                    <span>0</span>
                    <span className={value >= 50 ? 'text-green-500 font-medium' : ''}>50</span>
                    <span className={value >= 100 ? 'text-blue-500 font-medium' : ''}>100</span>
                    <span className={value >= 150 ? 'text-purple-500 font-medium' : ''}>150</span>
                    <span className={value >= 200 ? 'text-orange-500 font-medium' : ''}>200</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Attribute Tips */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2 text-sm">Attribute Breakpoints</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>• 50 points: First major bonus</div>
              <div>• 100 points: Second major bonus</div>
              <div>• 150 points: Third major bonus</div>
              <div>• 200 points: Maximum bonus</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}