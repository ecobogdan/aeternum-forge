import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, RotateCcw } from 'lucide-react';

// Weapon data with skill trees
const WEAPONS = {
  'Flail': {
    trees: {
      'CLERIC': { skills: [], maxPoints: 20 },
      'BASTION': { skills: [], maxPoints: 20 }
    }
  },
  'Greatsword': {
    trees: {
      'ONSLAUGHT': { skills: [], maxPoints: 20 },
      'DEFIANCE': { skills: [], maxPoints: 20 }
    }
  },
  'Sword': {
    trees: {
      'SWORDMASTER': { skills: [], maxPoints: 20 },
      'DEFENDER': { skills: [], maxPoints: 20 }
    }
  },
  'Rapier': {
    trees: {
      'BLOOD': { skills: [], maxPoints: 20 },
      'GRACE': { skills: [], maxPoints: 20 }
    }
  },
  'Fire Staff': {
    trees: {
      'FIRE': { skills: [], maxPoints: 20 },
      'PYROMANCER': { skills: [], maxPoints: 20 }
    }
  },
  'Life Staff': {
    trees: {
      'HEALING': { skills: [], maxPoints: 20 },
      'PROTECTING': { skills: [], maxPoints: 20 }
    }
  },
  'Bow': {
    trees: {
      'SKIRMISHER': { skills: [], maxPoints: 20 },
      'HUNTER': { skills: [], maxPoints: 20 }
    }
  },
  'War Hammer': {
    trees: {
      'JUGGERNAUT': { skills: [], maxPoints: 20 },
      'CROWD CRUSHER': { skills: [], maxPoints: 20 }
    }
  },
  'Musket': {
    trees: {
      'SHARPSHOOTER': { skills: [], maxPoints: 20 },
      'TRAPPER': { skills: [], maxPoints: 20 }
    }
  },
  'Hatchet': {
    trees: {
      'BERSERKER': { skills: [], maxPoints: 20 },
      'THROWING': { skills: [], maxPoints: 20 }
    }
  },
  'Blunderbuss': {
    trees: {
      'CHAOS': { skills: [], maxPoints: 20 },
      'NET': { skills: [], maxPoints: 20 }
    }
  },
  'Great Axe': {
    trees: {
      'REAPER': { skills: [], maxPoints: 20 },
      'MAULER': { skills: [], maxPoints: 20 }
    }
  },
  'Ice Gauntlet': {
    trees: {
      'BUILDER': { skills: [], maxPoints: 20 },
      'ICE TEMPEST': { skills: [], maxPoints: 20 }
    }
  },
  'Void Gauntlet': {
    trees: {
      'ANNIHILATION': { skills: [], maxPoints: 20 },
      'DECAY': { skills: [], maxPoints: 20 }
    }
  },
  'Spear': {
    trees: {
      'ZONER': { skills: [], maxPoints: 20 },
      'IMPALER': { skills: [], maxPoints: 20 }
    }
  }
};

// Sample skill node structure for demonstration
const SAMPLE_SKILLS = [
  { id: 1, name: 'Skill 1', tier: 1, position: { x: 2, y: 0 }, icon: '⚔️', maxRank: 1 },
  { id: 2, name: 'Skill 2', tier: 2, position: { x: 1, y: 1 }, icon: '🛡️', maxRank: 3 },
  { id: 3, name: 'Skill 3', tier: 2, position: { x: 3, y: 1 }, icon: '💥', maxRank: 1 },
  { id: 4, name: 'Skill 4', tier: 3, position: { x: 0, y: 2 }, icon: '🔥', maxRank: 1 },
  { id: 5, name: 'Skill 5', tier: 3, position: { x: 2, y: 2 }, icon: '⚡', maxRank: 1 },
  { id: 6, name: 'Skill 6', tier: 3, position: { x: 4, y: 2 }, icon: '🌟', maxRank: 1 },
  { id: 7, name: 'Ultimate', tier: 4, position: { x: 2, y: 3 }, icon: '💀', maxRank: 1 },
];

interface SkillAllocation {
  [weaponName: string]: {
    [treeName: string]: {
      [skillId: number]: number;
    };
  };
}

const SkillBuilder = () => {
  const [selectedWeapon, setSelectedWeapon] = useState('Flail');
  const [skillAllocations, setSkillAllocations] = useState<SkillAllocation>({});

  const getWeaponPoints = (weaponName: string) => {
    const weaponAllocation = skillAllocations[weaponName] || {};
    let totalPoints = 0;
    Object.values(weaponAllocation).forEach(tree => {
      Object.values(tree as any).forEach((points: number) => {
        totalPoints += points;
      });
    });
    return totalPoints;
  };

  const getTreePoints = (weaponName: string, treeName: string) => {
    const treeAllocation = skillAllocations[weaponName]?.[treeName] || {};
    return Object.values(treeAllocation).reduce((sum: number, points: number) => sum + points, 0);
  };

  const getSkillPoints = (weaponName: string, treeName: string, skillId: number) => {
    return skillAllocations[weaponName]?.[treeName]?.[skillId] || 0;
  };

  const allocateSkillPoint = (weaponName: string, treeName: string, skillId: number, increment: boolean = true) => {
    const currentPoints = getSkillPoints(weaponName, treeName, skillId);
    const skill = SAMPLE_SKILLS.find(s => s.id === skillId);
    if (!skill) return;

    let newPoints = currentPoints;
    if (increment && currentPoints < skill.maxRank) {
      newPoints = currentPoints + 1;
    } else if (!increment && currentPoints > 0) {
      newPoints = currentPoints - 1;
    }

    if (newPoints !== currentPoints) {
      setSkillAllocations(prev => ({
        ...prev,
        [weaponName]: {
          ...prev[weaponName],
          [treeName]: {
            ...prev[weaponName]?.[treeName],
            [skillId]: newPoints
          }
        }
      }));
    }
  };

  const resetAllSkills = () => {
    setSkillAllocations({});
  };

  const takeScreenshot = () => {
    // Placeholder for screenshot functionality
    console.log('Taking screenshot...');
  };

  const renderSkillTree = (weaponName: string, treeName: string) => {
    const treePoints = getTreePoints(weaponName, treeName);
    
    return (
      <div className="relative bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white tracking-wider">
            {treeName}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-slate-700 text-white border-slate-600">
              {treePoints}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              onClick={() => {
                // Reset this tree
                setSkillAllocations(prev => ({
                  ...prev,
                  [weaponName]: {
                    ...prev[weaponName],
                    [treeName]: {}
                  }
                }));
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Skill Tree Grid */}
        <div className="relative" style={{ height: '350px', width: '100%' }}>
          <div className="absolute inset-0">
            {/* Grid background */}
            <div className="grid grid-cols-5 gap-4 h-full w-full">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="border border-slate-700/30 rounded"></div>
              ))}
            </div>

            {/* Skill Nodes */}
            {SAMPLE_SKILLS.map((skill) => {
              const currentPoints = getSkillPoints(weaponName, treeName, skill.id);
              const isActive = currentPoints > 0;
              const isMaxed = currentPoints >= skill.maxRank;
              
              return (
                <div
                  key={skill.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{
                    left: `${(skill.position.x + 1) * 20}%`,
                    top: `${(skill.position.y + 1) * 25}%`
                  }}
                  onClick={() => allocateSkillPoint(weaponName, treeName, skill.id, true)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    allocateSkillPoint(weaponName, treeName, skill.id, false);
                  }}
                >
                  <div className={`
                    w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl
                    transition-all duration-200 hover:scale-110
                    ${isActive 
                      ? isMaxed 
                        ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400' 
                        : 'border-blue-400 bg-blue-400/20 text-blue-400'
                      : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                    }
                  `}>
                    {skill.icon}
                  </div>
                  
                  {/* Points indicator */}
                  {currentPoints > 0 && (
                    <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {currentPoints}
                    </div>
                  )}

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {skill.name} ({currentPoints}/{skill.maxRank})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">New World Skill Builder</h1>
          <p className="text-slate-400">
            Click{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 underline">
              here
            </a>{' '}
            to view the Attribute bonuses
          </p>
        </div>

        {/* Weapon Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {Object.keys(WEAPONS).map((weaponName) => {
            const points = getWeaponPoints(weaponName);
            return (
              <Button
                key={weaponName}
                variant={selectedWeapon === weaponName ? "default" : "outline"}
                className={`
                  relative px-4 py-2 text-sm font-medium transition-colors
                  ${selectedWeapon === weaponName 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                  }
                `}
                onClick={() => setSelectedWeapon(weaponName)}
              >
                {weaponName}
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-slate-700 text-white text-xs"
                >
                  {points}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={takeScreenshot}
            className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Screenshot
          </Button>
          <Button 
            variant="outline" 
            onClick={resetAllSkills}
            className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Skills
          </Button>
        </div>

        {/* Skill Trees */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {Object.entries(WEAPONS[selectedWeapon as keyof typeof WEAPONS].trees).map(([treeName]) => (
            <Card key={treeName} className="bg-slate-800 border-slate-700">
              <CardContent className="p-0">
                {renderSkillTree(selectedWeapon, treeName)}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <div className="text-center mt-8 text-slate-400 text-sm">
          <p>Left click to add points • Right click to remove points</p>
        </div>
      </div>
    </div>
  );
};

export default SkillBuilder;