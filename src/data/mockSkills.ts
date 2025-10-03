// Mock skill data for when NWDB API is unavailable
import { NWDBSkill } from '@/services/nwdbSkillService';

export const MOCK_SKILL_DATA: { [weaponName: string]: { [treeName: string]: NWDBSkill[] } } = {
  "Bow": {
    "Skirmisher": [
      {
        id: "ability_bow_poisonshot",
        type: "ability",
        name: "Poison Shot",
        description: "Shoot an arrow that deals 50% weapon damage. On hit or land, this arrow creates 3m radius poison cloud that lasts 6s. Foes entering the cloud are poisoned and take 20% weapon damage per second for 7s.",
        icon: "lyshineui/images/icons/abilities/bowAbility5.png",
        rarity: 0,
        WeaponTag: "Bow",
        skillTree: "Skirmisher",
        UICategory: "Attack",
        cooldown: 20
      },
      {
        id: "ability_bow_evadeshot",
        type: "ability",
        name: "Evade Shot",
        description: "Leap back 5m and shoot an arrow dealing 90% weapon damage to your target.",
        icon: "lyshineui/images/icons/abilities/bowAbility2.png",
        rarity: 0,
        WeaponTag: "Bow",
        skillTree: "Skirmisher",
        UICategory: "Attack",
        cooldown: 15
      },
      {
        id: "ability_bow_rainofarrows",
        type: "ability",
        name: "Rain of Arrows",
        description: "Shoot a barrage of arrows that covers a 4m radius area and deals 150% weapon damage.",
        icon: "lyshineui/images/icons/abilities/bowAbility6.png",
        rarity: 0,
        WeaponTag: "Bow",
        skillTree: "Skirmisher",
        UICategory: "Attack",
        cooldown: 20
      },
      {
        id: "passive_bow_skirmish_hastewhenfoesnear",
        type: "ability",
        name: "Catch Me If You Can",
        description: "If surrounded by 3 or more foes within 3m of you, gain 20% haste.",
        icon: "lyshineui/images/icons/abilities/bowPassive1.png",
        rarity: 0,
        WeaponTag: "Bow",
        skillTree: "Skirmisher",
        UICategory: "Passive"
      },
      {
        id: "passive_bow_skirmish_cdrvslow",
        type: "ability",
        name: "Closing In",
        description: "Hitting a foe below 50% health reduces all bow ability cooldowns by 5%.",
        icon: "lyshineui/images/icons/abilities/bowPassive3.png",
        rarity: 0,
        WeaponTag: "Bow",
        skillTree: "Skirmisher",
        UICategory: "Passive"
      },
      {
        id: "ultimate_bow_skirmish",
        type: "ability",
        name: "Evasive Tactics",
        description: "Gain Empower and deal 15% more damage for 5s after dodging.",
        icon: "lyshineui/images/icons/abilities/bowPassive5.png",
        rarity: 0,
        WeaponTag: "Bow",
        skillTree: "Skirmisher",
        UICategory: "Passive"
      }
    ],
    "Hunter": [
      {
        id: "ability_bow_rapidshot",
        type: "ability",
        name: "Rapid Shot",
        description: "Shoot 3 consecutive arrows. First Arrow: 100% weapon damage. Second Arrow: 100% weapon damage. Third Arrow: 125% weapon damage.",
        icon: "lyshineui/images/icons/abilities/bowAbility1.png",
        rarity: 0,
        WeaponTag: "Bow",
        skillTree: "Hunter",
        UICategory: "Attack",
        cooldown: 14
      },
      {
        id: "ability_bow_penetratingshot",
        type: "ability",
        name: "Penetrating Shot",
        description: "Shoot an arrow that deals 150% weapon damage and passes through targets. This attack has a range of 100m.",
        icon: "lyshineui/images/icons/abilities/bowAbility3.png",
        rarity: 0,
        WeaponTag: "Bow",
        skillTree: "Hunter",
        UICategory: "Attack",
        cooldown: 18
      },
      {
        id: "ability_bow_splintershot",
        type: "ability",
        name: "Explosive Arrow",
        description: "Fire an arrow that deals 50% weapon damage on hit, then explodes on impact dealing an additional 135% damage to all targets within a 2.5m radius.",
        icon: "lyshineui/images/icons/abilities/bow_ability_explosion.png",
        rarity: 0,
        WeaponTag: "Bow",
        skillTree: "Hunter",
        UICategory: "Attack",
        cooldown: 22
      },
      {
        id: "passive_bow_hunter_dmgvsdist",
        type: "ability",
        name: "Long Range",
        description: "Deal 10% more base damage to foes at least 10m away.",
        icon: "lyshineui/images/icons/abilities/bowPassive4.png",
        rarity: 0,
        WeaponTag: "Bow",
        skillTree: "Hunter",
        UICategory: "Passive"
      },
      {
        id: "passive_bow_hunter_crit",
        type: "ability",
        name: "Bullseye",
        description: "Increases critical chance of bow shots by 10%.",
        icon: "lyshineui/images/icons/abilities/bowPassive18.png",
        rarity: 0,
        WeaponTag: "Bow",
        skillTree: "Hunter",
        UICategory: "Passive"
      },
      {
        id: "ultimate_bow_hunter",
        type: "ability",
        name: "Concussion",
        description: "When you land a headshot, deal 20% more damage.",
        icon: "lyshineui/images/icons/abilities/bowPassive19.png",
        rarity: 0,
        WeaponTag: "Bow",
        skillTree: "Hunter",
        UICategory: "Passive"
      }
    ]
  },
  "Fire Staff": {
    "Fire Mage": [
      {
        id: "ability_firestaff_pillaroffire",
        type: "ability",
        name: "Pillar of Fire",
        description: "Invoke a burst of flames with a 2.5m radius at the target area that deals 155% weapon damage. Costs 15 mana.",
        icon: "lyshineui/images/icons/abilities/firestaffAbility2.png",
        rarity: 0,
        WeaponTag: "Fire Staff",
        skillTree: "Fire Mage",
        UICategory: "Attack",
        cooldown: 15
      },
      {
        id: "ability_firestaff_meteorshower",
        type: "ability",
        name: "Meteor Shower",
        description: "Summon down a 4.5m radius rain of meteors for 6s up to 20m away. Deals 100% weapon damage to targets upon entering the area, then deals an additional 50% weapon damage every 1s while targets remain inside. Costs 25 mana.",
        icon: "lyshineui/images/icons/abilities/firestaffAbility3.png",
        rarity: 0,
        WeaponTag: "Fire Staff",
        skillTree: "Fire Mage",
        UICategory: "Attack",
        cooldown: 18
      },
      {
        id: "ability_firestaff_fireball",
        type: "ability",
        name: "Fireball",
        description: "Cast forth a heavy fireball that deals 150% weapon damage in a 3m radius on impact, and an additional 20% base damage to hostile AI targets. Costs 25 mana.",
        icon: "lyshineui/images/icons/abilities/firestaffAbility1.png",
        rarity: 0,
        WeaponTag: "Fire Staff",
        skillTree: "Fire Mage",
        UICategory: "Attack",
        cooldown: 15
      },
      {
        id: "passive_firestaff_firemage_manaonhit",
        type: "ability",
        name: "Spell Focus",
        description: "Heavy attacks will now restore 5% of your max mana on hit. (Can only be triggered once every 0.5s.)",
        icon: "lyshineui/images/icons/abilities/firestaffPassive1.png",
        rarity: 0,
        WeaponTag: "Fire Staff",
        skillTree: "Fire Mage",
        UICategory: "Passive"
      }
    ]
  }
};