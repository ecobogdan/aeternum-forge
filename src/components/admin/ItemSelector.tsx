import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ItemSelectorProps {
  slot: string;
  onItemSelect: (item: any) => void;
  onClose: () => void;
}

const SLOT_TYPE_MAP = {
  helmet: 'helmet',
  chest: 'chest',
  gloves: 'gloves',
  pants: 'pants',
  shoes: 'shoes',
  amulet: 'amulet',
  ring: 'ring',
  earring: 'earring',
  weapon1: 'weapons',
  weapon2: 'weapons',
  shield: 'shield',
  heartrune: 'heartrune',
};

const RARITY_COLORS = {
  common: 'bg-gray-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-orange-500',
  artifact: 'bg-red-500',
};

export function ItemSelector({ slot, onItemSelect, onClose }: ItemSelectorProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const itemType = SLOT_TYPE_MAP[slot as keyof typeof SLOT_TYPE_MAP] || slot;

  useEffect(() => {
    fetchItems();
  }, [itemType]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-nwdb-items', {
        body: { itemType },
      });

      if (error) throw error;
      
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading items...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <ScrollArea className="h-96">
        <div className="grid grid-cols-1 gap-2">
          {filteredItems.map((item) => {
            const rarityColor = RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] || 'bg-gray-500';
            
            return (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => onItemSelect(item)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded ${rarityColor} flex items-center justify-center text-white text-xs font-bold`}>
                      {item.icon ? (
                        <img 
                          src={`https://cdn.nwdb.info/${item.icon}`} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        item.tier || '?'
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium truncate">{item.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          T{item.tier}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{item.rarity}</span>
                        <span>•</span>
                        <span>GS: {item.gear_score_max}</span>
                        {item.perks && item.perks.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{item.perks.length} perks</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? `No items found matching "${searchTerm}"` : 'No items available'}
        </div>
      )}
    </div>
  );
}