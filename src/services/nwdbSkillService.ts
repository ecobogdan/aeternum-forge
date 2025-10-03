// Service to fetch and process NWDB skill data
import { MOCK_SKILL_DATA } from '@/data/mockSkills';

export interface NWDBSkill {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  rarity: number;
  WeaponTag: string;
  skillTree: string;
  UICategory: string;
  cooldown?: number;
}

export interface SkillTree {
  name: string;
  weapon: string;
  skills: NWDBSkill[];
}

class NWDBSkillService {
  private skillsCache: NWDBSkill[] = [];
  private skillTreesCache: { [weaponName: string]: SkillTree[] } = {};

  async getAllSkills(): Promise<NWDBSkill[]> {
    if (this.skillsCache.length > 0) {
      return this.skillsCache;
    }

    const allSkills: NWDBSkill[] = [];
    
    // Fetch multiple pages of skills
    for (let page = 1; page <= 12; page++) {
      try {
        const response = await fetch(`https://nwdb.info/db/abilities/page/${page}.json`);
        const data = await response.json();
        
        if (data.success && data.data) {
          allSkills.push(...data.data);
        }
      } catch (error) {
        console.error(`Failed to fetch skills page ${page}:`, error);
      }
    }

    this.skillsCache = allSkills;
    return allSkills;
  }

  async getSkillTreesByWeapon(): Promise<{ [weaponName: string]: SkillTree[] }> {
    if (Object.keys(this.skillTreesCache).length > 0) {
      return this.skillTreesCache;
    }

    try {
      const skills = await this.getAllSkills();
      const weaponTrees: { [weaponName: string]: SkillTree[] } = {};

      // Group skills by weapon and skill tree
      skills.forEach(skill => {
        const weapon = skill.WeaponTag;
        const treeName = skill.skillTree;

        if (!weapon || !treeName) return;

        if (!weaponTrees[weapon]) {
          weaponTrees[weapon] = [];
        }

        let tree = weaponTrees[weapon].find(t => t.name === treeName);
        if (!tree) {
          tree = {
            name: treeName,
            weapon: weapon,
            skills: []
          };
          weaponTrees[weapon].push(tree);
        }

        tree.skills.push(skill);
      });

      this.skillTreesCache = weaponTrees;
      return weaponTrees;
    } catch (error) {
      console.warn('Failed to fetch skills from NWDB, using mock data:', error);
      return this.getMockSkillTrees();
    }
  }

  private getMockSkillTrees(): { [weaponName: string]: SkillTree[] } {
    const weaponTrees: { [weaponName: string]: SkillTree[] } = {};
    
    Object.entries(MOCK_SKILL_DATA).forEach(([weaponName, trees]) => {
      weaponTrees[weaponName] = Object.entries(trees).map(([treeName, skills]) => ({
        name: treeName,
        weapon: weaponName,
        skills: skills
      }));
    });

    return weaponTrees;
  }

  getSkillIconUrl(iconPath: string): string {
    // Convert NWDB icon path to full URL
    if (iconPath.startsWith('lyshineui/')) {
      return `https://cdn.nwdb.info/db/images/live/v56/${iconPath}`;
    }
    return `https://cdn.nwdb.info/db/images/live/v56/lyshineui/images/icons/abilities/${iconPath}`;
  }

  // Organize skills in a tree structure for visual layout
  organizeSkillsForTree(skills: NWDBSkill[]): any[] {
    // Sort skills by type and name for consistent layout
    const abilities = skills.filter(s => s.UICategory === 'Attack').sort((a, b) => a.name.localeCompare(b.name));
    const passives = skills.filter(s => s.UICategory === 'Passive').sort((a, b) => a.name.localeCompare(b.name));
    const upgrades = skills.filter(s => s.id.includes('upgrade_')).sort((a, b) => a.name.localeCompare(b.name));
    const ultimates = skills.filter(s => s.id.includes('ultimate_')).sort((a, b) => a.name.localeCompare(b.name));

    // Create a layout structure
    const layout: any[] = [];
    let currentRow = 0;
    let currentCol = 0;

    // Add main abilities first
    abilities.forEach((skill, index) => {
      layout.push({
        ...skill,
        position: { row: currentRow, col: currentCol },
        tier: 1,
        isMainAbility: true
      });
      currentCol++;
      if (currentCol >= 3) {
        currentCol = 0;
        currentRow++;
      }
    });

    // Add passives in middle tiers
    currentRow = Math.max(currentRow, 1);
    currentCol = 0;
    passives.forEach((skill, index) => {
      layout.push({
        ...skill,
        position: { row: currentRow, col: currentCol },
        tier: 2,
        isPassive: true
      });
      currentCol++;
      if (currentCol >= 4) {
        currentCol = 0;
        currentRow++;
      }
    });

    // Add ultimates at the bottom
    if (ultimates.length > 0) {
      currentRow = Math.max(currentRow + 1, 4);
      ultimates.forEach((skill, index) => {
        layout.push({
          ...skill,
          position: { row: currentRow, col: 1 + index },
          tier: 4,
          isUltimate: true
        });
      });
    }

    return layout;
  }
}

export const nwdbSkillService = new NWDBSkillService();