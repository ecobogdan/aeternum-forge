import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ItemSlot } from './ItemSlot';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BuildItemsSectionProps {
  items: Record<string, any>;
  onItemsChange: (items: Record<string, any>) => void;
}

const ITEM_SLOTS = {
  left: ['helmet', 'chest', 'gloves', 'pants', 'shoes'],
  right: ['weapon1', 'weapon2', 'shield', 'amulet', 'ring', 'earring', 'heartrune'],
};

const SLOT_LABELS = {
  helmet: 'Helmet',
  chest: 'Chest',
  gloves: 'Gloves',
  pants: 'Pants', 
  shoes: 'Shoes',
  weapon1: 'Weapon 1',
  weapon2: 'Weapon 2',
  shield: 'Shield',
  amulet: 'Amulet',
  ring: 'Ring',
  earring: 'Earring',
  heartrune: 'Heartrune',
};

export function BuildItemsSection({ items, onItemsChange }: BuildItemsSectionProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [itemsCache, setItemsCache] = useState<Record<string, any[]>>({});

  const handleItemChange = (slot: string, item: any) => {
    onItemsChange({
      ...items,
      [slot]: item,
    });
  };

  const refreshItemCache = async () => {
    setIsRefreshing(true);
    try {
      // Refresh cache for all item types
      const itemTypes = ['helmet', 'chest', 'gloves', 'pants', 'shoes', 'amulet', 'ring', 'earring', 'weapons', 'shield', 'heartrune'];
      
      for (const itemType of itemTypes) {
        toast.loading(`Refreshing ${itemType} items...`);
        
        const { error } = await supabase.functions.invoke('fetch-nwdb-items', {
          body: {
            itemType,
            forceRefresh: true,
          },
        });
        
        if (error) {
          console.error(`Error refreshing ${itemType}:`, error);
          toast.error(`Failed to refresh ${itemType} items`);
        }
      }
      
      toast.success('Item cache refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing cache:', error);
      toast.error('Failed to refresh item cache');
    } finally {
      setIsRefreshing(false);
      toast.dismiss();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Items & Equipment</CardTitle>
            <CardDescription>
              Configure your build's equipment and gear
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={refreshItemCache}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Items
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Armor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary mb-4">Armor</h3>
            {ITEM_SLOTS.left.map((slot) => (
              <ItemSlot
                key={slot}
                slot={slot}
                label={SLOT_LABELS[slot as keyof typeof SLOT_LABELS]}
                selectedItem={items[slot]}
                onItemChange={(item) => handleItemChange(slot, item)}
              />
            ))}
          </div>
          
          {/* Right Column - Weapons & Accessories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary mb-4">Weapons & Accessories</h3>
            {ITEM_SLOTS.right.map((slot) => (
              <ItemSlot
                key={slot}
                slot={slot}
                label={SLOT_LABELS[slot as keyof typeof SLOT_LABELS]}
                selectedItem={items[slot]}
                onItemChange={(item) => handleItemChange(slot, item)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}