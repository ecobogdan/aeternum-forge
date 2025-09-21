import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit } from 'lucide-react';
import { ItemSelector } from './ItemSelector';
import { PerkSelector } from './PerkSelector';

interface ItemSlotProps {
  slot: string;
  label: string;
  selectedItem: any;
  onItemChange: (item: any) => void;
}

const RARITY_COLORS = {
  common: 'bg-gray-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-orange-500',
  artifact: 'bg-red-500',
};

export function ItemSlot({ slot, label, selectedItem, onItemChange }: ItemSlotProps) {
  const [isSelectingItem, setIsSelectingItem] = useState(false);
  const [isEditingPerks, setIsEditingPerks] = useState(false);

  const handleItemSelect = (item: any) => {
    onItemChange({
      ...item,
      customPerks: item.perks || [],
      gearScore: item.gear_score_max || 725,
    });
    setIsSelectingItem(false);
  };

  const handlePerkChange = (perkIndex: number, perk: any) => {
    if (!selectedItem) return;
    
    const updatedPerks = [...(selectedItem.customPerks || [])];
    updatedPerks[perkIndex] = perk;
    
    onItemChange({
      ...selectedItem,
      customPerks: updatedPerks,
    });
  };

  const handleGearScoreChange = (gearScore: number) => {
    if (!selectedItem) return;
    
    onItemChange({
      ...selectedItem,
      gearScore,
    });
  };

  const rarityColor = selectedItem?.rarity 
    ? RARITY_COLORS[selectedItem.rarity as keyof typeof RARITY_COLORS] || 'bg-gray-500'
    : 'bg-gray-500';

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium">{label}</Label>
          {selectedItem && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingPerks(true)}
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSelectingItem(true)}
              >
                <Search className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
        
        {selectedItem ? (
          <div className="space-y-3">
            {/* Item Display */}
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-md ${rarityColor} flex items-center justify-center text-white text-xs font-bold`}>
                {selectedItem.icon ? (
                  <img 
                    src={`https://cdn.nwdb.info/${selectedItem.icon}`} 
                    alt={selectedItem.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  selectedItem.tier || '?'
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold truncate">{selectedItem.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    T{selectedItem.tier}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {selectedItem.rarity}
                  </Badge>
                </div>
                
                {/* Gear Score */}
                <div className="mt-2">
                  <Label className="text-xs text-muted-foreground">Gear Score</Label>
                  <Input
                    type="number"
                    value={selectedItem.gearScore || selectedItem.gear_score_max || 725}
                    onChange={(e) => handleGearScoreChange(parseInt(e.target.value))}
                    className="h-6 text-xs mt-1"
                    min="1"
                    max="725"
                  />
                </div>
              </div>
            </div>
            
            {/* Perks Preview */}
            {selectedItem.customPerks && selectedItem.customPerks.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Perks</Label>
                <div className="space-y-1">
                  {selectedItem.customPerks.slice(0, 2).map((perk: any, index: number) => (
                    <div key={index} className="text-xs p-2 bg-muted rounded text-muted-foreground">
                      {perk?.name || 'Empty Slot'}
                    </div>
                  ))}
                  {selectedItem.customPerks.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{selectedItem.customPerks.length - 2} more perks...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full h-20 border-2 border-dashed"
            onClick={() => setIsSelectingItem(true)}
          >
            <Plus className="w-6 h-6 mr-2" />
            Select {label}
          </Button>
        )}
        
        {/* Item Selection Dialog */}
        <Dialog open={isSelectingItem} onOpenChange={setIsSelectingItem}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Select {label}</DialogTitle>
            </DialogHeader>
            <ItemSelector
              slot={slot}
              onItemSelect={handleItemSelect}
              onClose={() => setIsSelectingItem(false)}
            />
          </DialogContent>
        </Dialog>
        
        {/* Perk Editing Dialog */}
        <Dialog open={isEditingPerks} onOpenChange={setIsEditingPerks}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Edit Perks - {selectedItem?.name}</DialogTitle>
            </DialogHeader>
            <PerkSelector
              item={selectedItem}
              onPerkChange={handlePerkChange}
              onClose={() => setIsEditingPerks(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}