import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, RotateCcw, ExternalLink } from 'lucide-react';
import { nwdbSkillService, NWDBSkill, SkillTree } from '@/services/nwdbSkillService';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SkillAllocation {
  [weaponName: string]: {
    [skillId: string]: number;
  };
}

const SkillBuilder = () => {
  const [skillTrees, setSkillTrees] = useState<{ [weaponName: string]: SkillTree[] }>({});
  const [selectedWeapon, setSelectedWeapon] = useState<string>('Bow');
  const [skillAllocations, setSkillAllocations] = useState<SkillAllocation>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSkillData();
  }, []);

  const loadSkillData = async () => {
    try {
      setLoading(true);
      const trees = await nwdbSkillService.getSkillTreesByWeapon();
      setSkillTrees(trees);
      
      // Set first available weapon as default
      const weapons = Object.keys(trees);
      if (weapons.length > 0 && !trees[selectedWeapon]) {
        setSelectedWeapon(weapons[0]);
      }
    } catch (err) {
      setError('Failed to load skill data');
      console.error('Error loading skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeaponPoints = (weaponName: string) => {
    const weaponAllocation = skillAllocations[weaponName] || {};
    return Object.values(weaponAllocation).reduce((sum: number, points: number) => sum + points, 0);
  };

  const getSkillPoints = (weaponName: string, skillId: string) => {
    return skillAllocations[weaponName]?.[skillId] || 0;
  };

  const getMaxSkillRank = (skill: NWDBSkill) => {
    // Main abilities and ultimates are usually 1 point
    if (skill.UICategory === 'Attack' || skill.id.includes('ultimate_')) {
      return 1;
    }
    // Upgrades are usually 1 point
    if (skill.id.includes('upgrade_')) {
      return 1;
    }
    // Passives can be multi-rank
    return skill.id.includes('passive_') ? 3 : 1;
  };

  const allocateSkillPoint = (weaponName: string, skillId: string, increment: boolean = true) => {
    const currentPoints = getSkillPoints(weaponName, skillId);
    const skill = findSkillById(skillId);
    if (!skill) return;

    const maxRank = getMaxSkillRank(skill);
    let newPoints = currentPoints;

    if (increment && currentPoints < maxRank) {
      newPoints = currentPoints + 1;
    } else if (!increment && currentPoints > 0) {
      newPoints = currentPoints - 1;
    }

    if (newPoints !== currentPoints) {
      setSkillAllocations(prev => ({
        ...prev,
        [weaponName]: {
          ...prev[weaponName],
          [skillId]: newPoints
        }
      }));
    }
  };

  const findSkillById = (skillId: string): NWDBSkill | null => {
    for (const weapon of Object.values(skillTrees)) {
      for (const tree of weapon) {
        const skill = tree.skills.find(s => s.id === skillId);
        if (skill) return skill;
      }
    }
    return null;
  };

  const resetAllSkills = () => {
    setSkillAllocations({});
  };

  const resetWeaponSkills = (weaponName: string) => {
    setSkillAllocations(prev => ({
      ...prev,
      [weaponName]: {}
    }));
  };

  const takeScreenshot = () => {
    // Implementation would capture the skill trees
    console.log('Taking screenshot...');
  };

  const renderSkillNode = (skill: NWDBSkill, weaponName: string, position: { row: number; col: number }) => {
    const currentPoints = getSkillPoints(weaponName, skill.id);
    const maxRank = getMaxSkillRank(skill);
    const isActive = currentPoints > 0;
    const isMaxed = currentPoints >= maxRank;
    const iconUrl = nwdbSkillService.getSkillIconUrl(skill.icon);

    return (
      <TooltipProvider key={skill.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="absolute cursor-pointer group"
              style={{
                left: `${position.col * 90 + 45}px`,
                top: `${position.row * 90 + 45}px`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => allocateSkillPoint(weaponName, skill.id, true)}
              onContextMenu={(e) => {
                e.preventDefault();
                allocateSkillPoint(weaponName, skill.id, false);
              }}
            >
              <div className={`
                w-16 h-16 rounded-full border-2 flex items-center justify-center
                transition-all duration-200 hover:scale-110 relative overflow-hidden
                ${isActive 
                  ? isMaxed 
                    ? 'border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/30' 
                    : 'border-blue-400 bg-blue-400/20 shadow-lg shadow-blue-400/30'
                  : 'border-slate-600 bg-slate-800/80 hover:border-slate-500'
                }
              `}>
                <img 
                  src={iconUrl}
                  alt={skill.name}
                  className={`w-10 h-10 object-contain ${isActive ? '' : 'opacity-60 grayscale'}`}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `<span class="text-xs text-center">${skill.name.slice(0, 3)}</span>`;
                  }}
                />
                
                {/* Ultimate indicator */}
                {skill.id.includes('ultimate_') && (
                  <div className="absolute inset-0 border-2 border-purple-500 rounded-full animate-pulse"></div>
                )}
              </div>
              
              {/* Points indicator */}
              {currentPoints > 0 && (
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold z-10">
                  {maxRank > 1 ? `${currentPoints}/${maxRank}` : '✓'}
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent 
            className="max-w-sm p-4 bg-slate-900 border border-slate-700"
            side="top"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-white">{skill.name}</h4>
                {skill.cooldown && (
                  <Badge variant="outline" className="text-xs">
                    {skill.cooldown}s CD
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {skill.description.replace(/\$\{[\d.]+\}/g, (match) => {
                  return match.slice(2, -1); // Remove ${ and }
                })}
              </p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{skill.UICategory}</span>
                <span className="text-slate-400">{currentPoints}/{maxRank} points</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderSkillTree = (tree: SkillTree, weaponName: string) => {
    const organizedSkills = nwdbSkillService.organizeSkillsForTree(tree.skills);
    const treePoints = tree.skills.reduce((sum, skill) => sum + getSkillPoints(weaponName, skill.id), 0);

    return (
      <div key={tree.name} className="relative bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-slate-800/80 border-b border-slate-700">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wider uppercase">
              {tree.name}
            </h3>
            <p className="text-sm text-slate-400">{tree.weapon}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-slate-700 text-white border-slate-600">
              {treePoints}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 p-0"
              onClick={() => {
                // Reset this tree
                const newAllocations = { ...skillAllocations };
                if (newAllocations[weaponName]) {
                  tree.skills.forEach(skill => {
                    delete newAllocations[weaponName][skill.id];
                  });
                  setSkillAllocations(newAllocations);
                }
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Skill Tree Grid */}
        <div className="relative p-6" style={{ height: '500px', width: '100%' }}>
          {/* Grid background */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 6 }).map((_, row) =>
              Array.from({ length: 5 }).map((_, col) => (
                <div
                  key={`${row}-${col}`}
                  className="absolute border border-slate-700/30 rounded"
                  style={{
                    left: `${col * 90}px`,
                    top: `${row * 90}px`,
                    width: '80px',
                    height: '80px'
                  }}
                />
              ))
            )}
          </div>

          {/* Skill Nodes */}
          {organizedSkills.map((skill) => 
            renderSkillNode(skill, weaponName, skill.position)
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">New World Skill Builder</h1>
            <Skeleton className="h-4 w-64 mx-auto bg-slate-800" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            <Skeleton className="h-96 bg-slate-800" />
            <Skeleton className="h-96 bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Failed to Load Skill Data</h1>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button onClick={loadSkillData} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const availableWeapons = Object.keys(skillTrees);
  const selectedWeaponTrees = skillTrees[selectedWeapon] || [];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">New World Skill Builder</h1>
          <p className="text-slate-400">
            Click{' '}
            <a 
              href="https://nwdb.info/experience-table/attribute-bonuses" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
            >
              here <ExternalLink className="w-3 h-3" />
            </a>{' '}
            to view the Attribute bonuses
          </p>
        </div>

        {/* Weapon Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {availableWeapons.map((weaponName) => {
            const points = getWeaponPoints(weaponName);
            return (
              <Button
                key={weaponName}
                variant={selectedWeapon === weaponName ? "default" : "outline"}
                className={`
                  relative px-4 py-2 text-sm font-medium transition-colors
                  ${selectedWeapon === weaponName 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
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
          <Button 
            variant="outline" 
            onClick={() => resetWeaponSkills(selectedWeapon)}
            className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Reset {selectedWeapon}
          </Button>
        </div>

        {/* Skill Trees */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {selectedWeaponTrees.map(tree => renderSkillTree(tree, selectedWeapon))}
        </div>

        {/* Instructions */}
        <div className="text-center mt-8 text-slate-400 text-sm space-y-2">
          <p>Left click to add points • Right click to remove points</p>
          <p>Hover over skills to see detailed descriptions</p>
          <p className="text-xs">Data sourced from NWDB.info</p>
        </div>
      </div>
    </div>
  );
};

export default SkillBuilder;