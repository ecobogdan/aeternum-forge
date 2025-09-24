import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PerkSelectorProps {
  item: any;
  onPerkChange: (perkIndex: number, perk: any) => void;
  onClose: () => void;
}

export function PerkSelector({ item, onPerkChange, onClose }: PerkSelectorProps) {
  const [availablePerks, setAvailablePerks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  useEffect(() => {
    fetchPerks();
  }, []);

  const fetchPerks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-nwdb-perks', {
        body: {},
      });

      if (error) throw error;
      
      setAvailablePerks(data.perks || []);
    } catch (error) {
      console.error('Error fetching perks:', error);
      toast.error('Failed to load perks');
    } finally {
      setLoading(false);
    }
  };

  const filteredPerks = useMemo(() => {
    if (!searchTerm) return availablePerks;
    
    return availablePerks.filter(perk => 
      perk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perk.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availablePerks, searchTerm]);

  const handlePerkSelect = (perk: any) => {
    if (selectedSlot !== null) {
      onPerkChange(selectedSlot, perk);
      setSelectedSlot(null);
    }
  };

  const handleRemovePerk = (index: number) => {
    onPerkChange(index, null);
  };

  const maxPerks = item?.tier || 5;
  const currentPerks = item?.customPerks || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading perks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Perks */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Current Perks ({currentPerks.filter(p => p).length}/{maxPerks})
        </Label>
        <div className="grid grid-cols-1 gap-2">
          {Array.from({ length: maxPerks }, (_, index) => {
            const perk = currentPerks[index];
            const isSelected = selectedSlot === index;
            
            return (
              <Card 
                key={index}
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'ring-2 ring-primary' : 'hover:bg-accent'
                }`}
                onClick={() => setSelectedSlot(isSelected ? null : index)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {perk ? (
                        <div>
                          <div className="font-medium text-sm">{perk.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {perk.description}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Empty Slot {index + 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <span className="text-xs font-medium text-primary">
                          Click perk to assign
                        </span>
                      )}
                      {perk && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePerk(index);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Perk Selection */}
      {selectedSlot !== null && (
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Select Perk for Slot {selectedSlot + 1}
          </Label>
          
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search perks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {filteredPerks.map((perk) => (
                <Card 
                  key={perk.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handlePerkSelect(perk)}
                >
                  <CardContent className="p-3">
                    <div className="font-medium text-sm mb-1">{perk.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {perk.description}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
          
          {filteredPerks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? `No perks found matching "${searchTerm}"` : 'No perks available'}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}