import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, X } from 'lucide-react';

interface AbilitiesSectionProps {
  abilities: any[];
  onAbilitiesChange: (abilities: any[]) => void;
}

const WEAPONS = {
  'Sword and Shield': { category: 'ONE-HANDED', trees: ['Swordmaster', 'Defender'] },
  'Rapier': { category: 'ONE-HANDED', trees: ['Blood', 'Grace'] },
  'Hatchet': { category: 'ONE-HANDED', trees: ['Berserker', 'Throwing'] },
  'Spear': { category: 'TWO-HANDED', trees: ['Zoner', 'Impaler'] },
  'Great Axe': { category: 'TWO-HANDED', trees: ['Reaper', 'Mauler'] },
  'War Hammer': { category: 'TWO-HANDED', trees: ['Juggernaut', 'Crowd Crusher'] },
  'Greatsword': { category: 'TWO-HANDED', trees: ['Onslaught', 'Defiance'] },
  'Bow': { category: 'RANGED', trees: ['Skirmisher', 'Hunter'] },
  'Musket': { category: 'RANGED', trees: ['Sharpshooter', 'Trapper'] },
  'Blunderbuss': { category: 'RANGED', trees: ['Chaos', 'Containment'] },
  'Fire Staff': { category: 'MAGICAL', trees: ['Fire Mage', 'Pyromancer'] },
  'Life Staff': { category: 'MAGICAL', trees: ['Healing', 'Protector'] },
  'Ice Gauntlet': { category: 'MAGICAL', trees: ['Ice Tempest', 'Builder'] },
  'Void Gauntlet': { category: 'MAGICAL', trees: ['Annihilation', 'Decay'] },
  'Flail': { category: 'ONE-HANDED', trees: ['Cleric', 'Bastion'] },
};

// Mock ability data - in a real implementation, this would come from the API
const MOCK_ABILITIES = {
  'Sword and Shield': {
    'Swordmaster': [
      { id: 'reverse_stab', name: 'Reverse Stab', description: 'A quick reverse thrust attack' },
      { id: 'whirling_blade', name: 'Whirling Blade', description: 'Spin attack hitting multiple enemies' },
    ],
    'Defender': [
      { id: 'shield_bash', name: 'Shield Bash', description: 'Stun enemies with your shield' },
      { id: 'defiant_stance', name: 'Defiant Stance', description: 'Reduce incoming damage' },
    ],
  },
  'Great Axe': {
    'Reaper': [
      { id: 'reap', name: 'Reap', description: 'Pull enemies towards you' },
      { id: 'execute', name: 'Execute', description: 'High damage finishing move' },
    ],
    'Mauler': [
      { id: 'charge', name: 'Charge', description: 'Rush forward and knock down enemies' },
      { id: 'gravity_well', name: 'Gravity Well', description: 'Create a vortex that pulls enemies' },
    ],
  },
  // Add more weapons as needed...
};

export function AbilitiesSection({ abilities, onAbilitiesChange }: AbilitiesSectionProps) {
  const [isSelectingAbility, setIsSelectingAbility] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState<string>('');
  const [selectedTree, setSelectedTree] = useState<string>('');

  const MAX_ABILITIES = 20;

  const handleAddAbility = (ability: any, weapon: string, tree: string) => {
    if (abilities.length >= MAX_ABILITIES) {
      return;
    }

    const newAbility = {
      ...ability,
      weapon,
      tree,
      id: `${weapon}-${tree}-${ability.id}`,
    };

    onAbilitiesChange([...abilities, newAbility]);
    setIsSelectingAbility(false);
  };

  const handleRemoveAbility = (abilityId: string) => {
    onAbilitiesChange(abilities.filter(a => a.id !== abilityId));
  };

  const categorizedWeapons = Object.entries(WEAPONS).reduce((acc, [weapon, data]) => {
    if (!acc[data.category]) acc[data.category] = [];
    acc[data.category].push(weapon);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Abilities</CardTitle>
            <CardDescription>
              Select up to {MAX_ABILITIES} abilities from weapon skill trees
            </CardDescription>
          </div>
          <Button 
            onClick={() => setIsSelectingAbility(true)}
            disabled={abilities.length >= MAX_ABILITIES}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Ability
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Selected Abilities Count */}
          <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {abilities.length}/{MAX_ABILITIES}
            </div>
            <div className="text-sm text-muted-foreground">
              Abilities Selected
            </div>
          </div>

          {/* Selected Abilities List */}
          {abilities.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Selected Abilities</h4>
              <div className="grid grid-cols-1 gap-2">
                {abilities.map((ability) => (
                  <Card key={ability.id} className="relative">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{ability.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {ability.weapon}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {ability.tree}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {ability.description}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAbility(ability.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No abilities selected. Click "Add Ability" to get started.
            </div>
          )}
        </div>

        {/* Ability Selection Dialog */}
        <Dialog open={isSelectingAbility} onOpenChange={setIsSelectingAbility}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Select Ability</DialogTitle>
            </DialogHeader>
            
            <div className="flex gap-4 h-96">
              {/* Weapon Categories */}
              <div className="w-1/3 space-y-4">
                {Object.entries(categorizedWeapons).map(([category, weapons]) => (
                  <div key={category}>
                    <h4 className="font-semibold text-sm mb-2">{category}</h4>
                    <div className="space-y-1">
                      {weapons.map((weapon) => (
                        <Button
                          key={weapon}
                          variant={selectedWeapon === weapon ? "default" : "ghost"}
                          className="w-full justify-start text-sm h-8"
                          onClick={() => {
                            setSelectedWeapon(weapon);
                            setSelectedTree('');
                          }}
                        >
                          {weapon}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Skill Trees */}
              {selectedWeapon && (
                <div className="w-1/3">
                  <h4 className="font-semibold text-sm mb-2">Skill Trees</h4>
                  <div className="space-y-1">
                    {WEAPONS[selectedWeapon as keyof typeof WEAPONS]?.trees.map((tree) => (
                      <Button
                        key={tree}
                        variant={selectedTree === tree ? "default" : "ghost"}
                        className="w-full justify-start text-sm h-8"
                        onClick={() => setSelectedTree(tree)}
                      >
                        {tree}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Abilities */}
              {selectedWeapon && selectedTree && (
                <div className="w-1/3">
                  <h4 className="font-semibold text-sm mb-2">Abilities</h4>
                  <ScrollArea className="h-80">
                    <div className="space-y-2">
                      {(MOCK_ABILITIES[selectedWeapon as keyof typeof MOCK_ABILITIES]?.[selectedTree] || []).map((ability) => (
                        <Card 
                          key={ability.id}
                          className="cursor-pointer hover:bg-accent transition-colors"
                          onClick={() => handleAddAbility(ability, selectedWeapon, selectedTree)}
                        >
                          <CardContent className="p-3">
                            <div className="font-medium text-sm mb-1">{ability.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {ability.description}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}