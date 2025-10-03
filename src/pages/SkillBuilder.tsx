<<<<<<< HEAD
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import cat0 from "@/skills/0.png";
import cat2 from "@/skills/2.png";
import cat3 from "@/skills/3.png";
import cat6 from "@/skills/6.png";

const weaponMenuOrder = [
  "Flail",
  "Greatsword",
  "Sword",
  "Rapier",
  "Fire Staff",
  "Life Staff",
  "Bow",
  "War Hammer",
  "Musket",
  "Hatchet",
  "Blunderbuss",
  "Great Axe",
  "Ice Gauntlet",
  "Void Gauntlet",
  "Spear",
] as const;

type WeaponKey = typeof weaponMenuOrder[number];

const weaponApiMap: Record<WeaponKey, string> = {
  Flail: "Flail",
  Greatsword: "Greatsword",
  Sword: "Sword",
  Rapier: "Rapier",
  "Fire Staff": "Fire",
  "Life Staff": "Heal",
  Bow: "Bow",
  "War Hammer": "Warhammer",
  Musket: "Rifle",
  Hatchet: "Axe",
  Blunderbuss: "Blunderbuss",
  "Great Axe": "GreatAxe",
  "Ice Gauntlet": "Ice",
  "Void Gauntlet": "VoidGauntlet",
  Spear: "Spear",
};

const apiToMenu = Object.entries(weaponApiMap).reduce<Record<string, WeaponKey>>((acc, [menu, api]) => {
  acc[api] = menu as WeaponKey;
  return acc;
}, {} as Record<string, WeaponKey>);

const weaponTreeNames: Record<WeaponKey, [string, string]> = {
  Flail: ["CLERIC", "BASTION"],
  Greatsword: ["ONSLAUGHT", "DEFIANCE"],
  Sword: ["SWORDMASTER", "DEFENDER"],
  Rapier: ["BLOOD", "GRACE"],
  "Fire Staff": ["FIRE MAGE", "PYROMANCER"],
  "Life Staff": ["HEALING", "PROTECTOR"],
  Bow: ["SKIRMISHER", "HUNTER"],
  "War Hammer": ["JUGGERNAUT", "CROWD CRUSHER"],
  Musket: ["SHARPSHOOTER", "TRAPPER"],
  Hatchet: ["BERSERKER", "THROWING"],
  Blunderbuss: ["CONTAINMENT", "CHAOS"],
  "Great Axe": ["REAPER", "MAULER"],
  "Ice Gauntlet": ["ICE TEMPEST", "BUILDER"],
  "Void Gauntlet": ["ANNIHILATION", "DECAY"],
  Spear: ["ZONER", "IMPALER"],
};

type ApiSkill = {
  id: string;
  name: string;
  description: string;
  previousAbilityId?: string | null;
  category: number;
  weapon: string;
  tree: number;
  row: number;
  column: number;
  ultimate: boolean;
  slottable: boolean;
  cooldown: number;
  icon?: string | null;
  unlockDefault?: boolean;
};

type ProcessedSkill = ApiSkill & {
  sanitizedDescription: string;
  iconKey: string | null;
  imageSrc?: string;
  gifSrc?: string;
};

type TreeLayout = {
  rows: Record<number, ProcessedSkill[]>;
  rowOrder: number[];
  ultimate: ProcessedSkill[];
  maxColumn: number;
};

type DependencyLine = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type WeaponMeta = {
  weaponKey: WeaponKey;
  skills: ProcessedSkill[];
  skillMap: Map<string, ProcessedSkill>;
  trees: Record<number, TreeLayout>;
};

const skillIconModules = import.meta.glob("../skills/imgs/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const sanitizeIconKey = (value: string | undefined | null): string | null => {
  if (!value) {
    return null;
  }
  const withoutQuery = value.split("?")[0] ?? value;
  const base = withoutQuery
    .split("/")
    .pop()
    ?.replace(/\.(png|jpg|jpeg)$/i, "");
  if (!base) {
    return null;
  }
  return base
    .replace(/%20/g, "")
    .replace(/\s+/g, "")
    .replace(/[()]/g, "")
    .replace(/-+/g, "_")
    .toLowerCase();
};

const skillIconMap = Object.entries(skillIconModules).reduce<Record<string, string>>((acc, [path, src]) => {
  const key = sanitizeIconKey(path);
  if (key) {
    acc[key] = src;
  }
  return acc;
}, {});

// Import GIFs
const skillGifModules = import.meta.glob("../skills/gifs/*.gif", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const sanitizeGifKey = (skillId: string): string => {
  return skillId
    .replace(/%20/g, "")
    .replace(/\s+/g, "")
    .replace(/[()]/g, "")
    .replace(/-+/g, "_")
    .toLowerCase();
};

const skillGifMap = Object.entries(skillGifModules).reduce<Record<string, string>>((acc, [path, src]) => {
  const filename = path.split("/").pop()?.replace(/\.gif$/i, "");
  if (filename) {
    acc[filename] = src;
  }
  return acc;
}, {});

const categoryBackgroundMap: Record<number, string> = {
  0: cat0,
  2: cat2,
  3: cat3,
  6: cat6,
};

const MAX_POINTS_PER_CATEGORY = 19;

const sanitizeDescription = (value: string) => {
  return value
    .replace(/\$\{([^}]+)\}/g, "$1")
    .replace(/(\d+)\.0+(\d*)/g, (match, wholePart, decimalPart) => {
      // If decimal part is all zeros or very small floating point errors, remove decimals
      if (decimalPart === "" || /^0+$/.test(decimalPart) || parseFloat(`0.${decimalPart}`) < 0.0001) {
        return wholePart;
      }
      // Otherwise, round to reasonable precision
      return parseFloat(match).toFixed(1).replace(/\.0$/, "");
    });
};

const fetchSkills = async (): Promise<ApiSkill[]> => {
  const response = await fetch("https://nwdb.info/build/skills.json");
  if (!response.ok) {
    throw new Error("Failed to fetch skills data");
  }
  const payload = await response.json();
  if (!payload?.data || !Array.isArray(payload.data)) {
    throw new Error("Unexpected skills payload");
  }
  return payload.data as ApiSkill[];
};

const createEmptySelectionState = () =>
  weaponMenuOrder.reduce<Record<WeaponKey, string[]>>((acc, weapon) => {
    acc[weapon] = [];
    return acc;
  }, {} as Record<WeaponKey, string[]>);

const findPreviousRowWithSkills = (layout: TreeLayout | undefined, row: number) => {
  if (!layout) {
    return null;
  }
  const previousRows = layout.rowOrder.filter((value) => value < row);
  if (!previousRows.length) {
    return null;
  }
  return previousRows[previousRows.length - 1] ?? null;
};

const hasRowSelection = (
  layout: TreeLayout | undefined,
  row: number,
  selected: Set<string>,
  meta: WeaponMeta,
) => {
  if (!layout) {
    return false;
  }
  const nodes = layout.rows[row];
  if (!nodes) {
    return false;
  }
  return nodes.some((skill) => selected.has(skill.id) || skill.unlockDefault);
};

const canSelectSkill = (
  skill: ProcessedSkill,
  selected: Set<string>,
  meta: WeaponMeta,
): boolean => {
  if (selected.has(skill.id)) {
    return true;
  }

  // unlockDefault skills are always available and don't count toward point limit
  if (skill.unlockDefault) {
    return true;
  }

  if (selected.size >= MAX_POINTS_PER_CATEGORY) {
    return false;
  }

  if (skill.previousAbilityId && !selected.has(skill.previousAbilityId)) {
    return false;
  }

  const layout = meta.trees[skill.tree];

  if (!skill.ultimate) {
    const previousRow = findPreviousRowWithSkills(layout, skill.row);
    if (previousRow !== null && !hasRowSelection(layout, previousRow, selected, meta)) {
      return false;
    }
    return true;
  }

  if (!layout) {
    return false;
  }

  const everyRowSatisfied = layout.rowOrder.every((rowIndex) =>
    hasRowSelection(layout, rowIndex, selected, meta),
  );
  if (!everyRowSatisfied) {
    return false;
  }

  return selected.size >= 10;
};

const isSkillValid = (
  skill: ProcessedSkill,
  selected: Set<string>,
  meta: WeaponMeta,
): boolean => {
  // unlockDefault skills are always valid
  if (skill.unlockDefault) {
    return true;
  }

  if (skill.previousAbilityId && !selected.has(skill.previousAbilityId)) {
    return false;
  }

  const layout = meta.trees[skill.tree];

  if (!skill.ultimate) {
    const previousRow = findPreviousRowWithSkills(layout, skill.row);
    if (previousRow !== null && !hasRowSelection(layout, previousRow, selected, meta)) {
      return false;
    }
    return true;
  }

  if (!layout) {
    return false;
  }

  const setWithoutSkill = new Set(selected);
  setWithoutSkill.delete(skill.id);

  if (setWithoutSkill.size < 10) {
    return false;
  }

  return layout.rowOrder.every((rowIndex) => hasRowSelection(layout, rowIndex, setWithoutSkill, meta));
};

const enforceSelectionRules = (
  selected: Set<string>,
  meta: WeaponMeta,
): Set<string> => {
  const result = new Set(selected);
  
  // Add all unlockDefault skills to the result
  meta.skills.forEach(skill => {
    if (skill.unlockDefault) {
      result.add(skill.id);
    }
  });
  
  let changed = true;

  while (changed) {
    changed = false;
    for (const id of Array.from(result)) {
      const skill = meta.skillMap.get(id);
      if (!skill) {
        continue;
      }
      // Don't remove unlockDefault skills
      if (skill.unlockDefault) {
        continue;
      }
      if (!isSkillValid(skill, result, meta)) {
        result.delete(id);
        changed = true;
      }
    }
  }

  return result;
};

const SkillBuilder = () => {
  const [activeWeapon, setActiveWeapon] = useState<WeaponKey>("Flail");
  const [selectionState, setSelectionState] = useState<Record<WeaponKey, string[]>>(
    () => createEmptySelectionState(),
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["nwdb-skills"],
    queryFn: fetchSkills,
    staleTime: 1000 * 60 * 60,
  });

  const processedData = useMemo(() => {
    if (!data) {
      return null;
    }

    const record: Partial<Record<WeaponKey, WeaponMeta>> = {};

    data.forEach((raw) => {
      const menuWeapon = apiToMenu[raw.weapon];
      if (!menuWeapon) {
        return;
      }

      const meta: WeaponMeta = record[menuWeapon] ?? {
        weaponKey: menuWeapon,
        skills: [],
        skillMap: new Map<string, ProcessedSkill>(),
        trees: {},
      };

      const iconKey = sanitizeIconKey(raw.icon) ?? sanitizeIconKey(raw.id);
      const gifKey = sanitizeGifKey(raw.id);
      const skill: ProcessedSkill = {
        ...raw,
        previousAbilityId: raw.previousAbilityId ?? undefined,
        sanitizedDescription: sanitizeDescription(raw.description),
        iconKey,
        imageSrc: iconKey ? skillIconMap[iconKey] : undefined,
        gifSrc: skillGifMap[gifKey],
      };

      meta.skills.push(skill);
      meta.skillMap.set(skill.id, skill);

      const treeLayout: TreeLayout = meta.trees[skill.tree] ?? {
        rows: {},
        rowOrder: [],
        ultimate: [],
        maxColumn: 0,
      };

      treeLayout.maxColumn = Math.max(treeLayout.maxColumn, skill.column);

      if (skill.ultimate) {
        treeLayout.ultimate.push(skill);
      } else {
        if (!treeLayout.rows[skill.row]) {
          treeLayout.rows[skill.row] = [];
          treeLayout.rowOrder.push(skill.row);
        }
        treeLayout.rows[skill.row].push(skill);
      }

      meta.trees[skill.tree] = treeLayout;
      record[menuWeapon] = meta;
    });

    for (const meta of Object.values(record)) {
      if (!meta) {
        continue;
      }

      Object.values(meta.trees).forEach((layout) => {
        layout.rowOrder.sort((a, b) => a - b);
        layout.rowOrder.forEach((row) => {
          layout.rows[row].sort((a, b) => a.column - b.column);
        });
        layout.ultimate.sort((a, b) => a.column - b.column);
      });
    }

    return record as Record<WeaponKey, WeaponMeta>;
  }, [data]);

  const activeMeta = activeWeapon && processedData ? processedData[activeWeapon] : undefined;

  const activeSelectionSet = useMemo(
    () => new Set(selectionState[activeWeapon] ?? []),
    [activeWeapon, selectionState],
  );

  const totalSelected = useMemo(() => {
    if (!activeMeta) {
      return 0;
    }
    return (selectionState[activeWeapon] ?? []).filter(id => {
      const skill = activeMeta.skillMap.get(id);
      return skill && !skill.unlockDefault;
    }).length;
  }, [activeMeta, selectionState, activeWeapon]);

  const treeSelectionCounts = useMemo(() => {
    if (!activeMeta) {
      return {} as Record<number, number>;
    }
    const counts: Record<number, number> = {};
    activeSelectionSet.forEach((id) => {
      const skill = activeMeta.skillMap.get(id);
      if (!skill || skill.unlockDefault) {
        return;
      }
      counts[skill.tree] = (counts[skill.tree] ?? 0) + 1;
    });
    return counts;
  }, [activeMeta, activeSelectionSet]);

  const handleToggleSkill = (skill: ProcessedSkill) => {
    if (!activeMeta) {
      return;
    }

    // Don't allow toggling unlockDefault skills
    if (skill.unlockDefault) {
      return;
    }

    setSelectionState((prev) => {
      const currentSet = new Set(prev[activeWeapon] ?? []);

      if (currentSet.has(skill.id)) {
        currentSet.delete(skill.id);
        const validated = enforceSelectionRules(currentSet, activeMeta);
        return {
          ...prev,
          [activeWeapon]: Array.from(validated),
        };
      }

      if (!canSelectSkill(skill, currentSet, activeMeta)) {
        return prev;
      }

      if (currentSet.size >= MAX_POINTS_PER_CATEGORY) {
        return prev;
      }

      currentSet.add(skill.id);
      return {
        ...prev,
        [activeWeapon]: Array.from(currentSet),
      };
    });
  };

  const handleReset = () => {
    if (!activeMeta) {
      return;
    }
    
    setSelectionState((prev) => {
      const unlockDefaultSkills = activeMeta.skills
        .filter(skill => skill.unlockDefault)
        .map(skill => skill.id);
      
      return {
        ...prev,
        [activeWeapon]: unlockDefaultSkills,
      };
    });
  };

  return (
    <Layout
      title="Skill Builder | NW-Builds"
      description="Plan your New World weapon builds with the interactive NW-Builds Skill Builder."
      canonical="/tools/new-world-skill-builder"
    >
      <section className="py-12">
        <div className="container px-4 space-y-8">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-primary">Skill Builder</h1>
                <p className="text-muted-foreground">
                  Select abilities, respect dependencies, and craft weapon builds for every combat style.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-md border border-border/60 bg-background/80 px-3 py-2 text-sm">
                  <span className="font-semibold text-primary">Total Points:&nbsp;</span>
                  <span>{totalSelected} / {MAX_POINTS_PER_CATEGORY}</span>
                </div>
                <Button variant="outline" onClick={handleReset}>
                  Reset Skills
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {weaponMenuOrder.map((weapon) => {
                const isActive = weapon === activeWeapon;
                const weaponCount = selectionState[weapon]?.length ?? 0;
                return (
                  <Button
                    key={weapon}
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "h-10 rounded-full px-4 text-sm",
                      !isActive && "bg-background/80",
                    )}
                    onClick={() => setActiveWeapon(weapon)}
                  >
                    <span>{weapon}</span>
                    <span className="ml-2 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-foreground/10 px-2 py-1 text-xs font-semibold">
                      {weaponCount + '/' + MAX_POINTS_PER_CATEGORY}
                    </span>
                  </Button>
                );
              })}
            </div>
          </header>

          {isLoading && (
            <div className="rounded-lg border border-border/60 bg-background/80 p-8 text-center text-muted-foreground">
              Loading skill data...
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-destructive">
              {(error as Error)?.message ?? "Unable to load skill data."}
            </div>
          )}

          {!isLoading && !isError && activeMeta && (
            <div className="grid gap-6">
              <div className="flex flex-col gap-8 lg:flex-row">
                {[0, 1].map((treeIndex) => {
                  const layout = activeMeta.trees[treeIndex];
                  if (!layout) {
                    return null;
                  }

                  const treeNames = weaponTreeNames[activeWeapon];
                  const treeLabel = treeNames ? treeNames[treeIndex] : (treeIndex === 0 ? "Tree I" : "Tree II");
                  const treeCount = treeSelectionCounts[treeIndex] ?? 0;

                  return (
                    <WeaponTree
                      key={treeIndex}
                      layout={layout}
                      meta={activeMeta}
                      treeIndex={treeIndex}
                      treeLabel={treeLabel}
                      treeCount={treeCount}
                      selected={activeSelectionSet}
                      onToggle={handleToggleSkill}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

interface WeaponTreeProps {
  layout: TreeLayout;
  meta: WeaponMeta;
  treeIndex: number;
  treeLabel: string;
  treeCount: number;
  selected: Set<string>;
  onToggle: (skill: ProcessedSkill) => void;
}

const WeaponTree = ({ layout, meta, treeIndex, treeLabel, treeCount, selected, onToggle }: WeaponTreeProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [lines, setLines] = useState<DependencyLine[]>([]);
  const linesCacheRef = useRef<DependencyLine[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const areLinesEqual = (prev: DependencyLine[], next: DependencyLine[]) => {
    if (prev.length !== next.length) {
      return false;
    }
    for (let i = 0; i < prev.length; i += 1) {
      const a = prev[i];
      const b = next[i];
      if (a.id !== b.id || a.x1 !== b.x1 || a.y1 !== b.y1 || a.x2 !== b.x2 || a.y2 !== b.y2) {
        return false;
      }
    }
    return true;
  };

  const dependencies = useMemo(
    () =>
      meta.skills
        .filter((skill) => skill.tree === treeIndex && skill.previousAbilityId)
        .map((skill) => {
          const parent = skill.previousAbilityId ? meta.skillMap.get(skill.previousAbilityId) : undefined;
          if (!parent || parent.tree !== treeIndex) {
            return null;
          }

          return { parent: parent.id, child: skill.id };
        })
        .filter((value): value is { parent: string; child: string } => Boolean(value)),
    [meta, treeIndex],
  );

  const updateLinesRef = useRef<() => void>();
  
  const updateLines = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const nextLines: DependencyLine[] = [];

    dependencies.forEach(({ parent, child }) => {
      const parentNode = nodeRefs.current[parent];
      const childNode = nodeRefs.current[child];

      if (!parentNode || !childNode) {
        return;
      }

      const parentRect = parentNode.getBoundingClientRect();
      const childRect = childNode.getBoundingClientRect();

      nextLines.push({
        id: parent + "-" + child,
        x1: parentRect.left + parentRect.width / 2 - containerRect.left,
        y1: parentRect.top + parentRect.height / 2 - containerRect.top,
        x2: childRect.left + childRect.width / 2 - containerRect.left,
        y2: childRect.top + childRect.height / 2 - containerRect.top,
      });
    });

    if (!areLinesEqual(linesCacheRef.current, nextLines)) {
      linesCacheRef.current = nextLines;
      setLines(nextLines);
    }
    setCanvasSize((prev) => {
      const width = containerRect.width;
      const height = containerRect.height;
      if (prev.width === width && prev.height === height) {
        return prev;
      }
      return { width, height };
    });
  }, [dependencies]);

  updateLinesRef.current = updateLines;

  useEffect(() => {
    nodeRefs.current = {};
    linesCacheRef.current = [];
    setLines([]);
  }, [layout]);

  const registerNode = useCallback(
    (skillId: string) => (node: HTMLButtonElement | null) => {
      nodeRefs.current[skillId] = node;
      // Only update lines if we have a node and the component is stable
      if (node && containerRef.current && updateLinesRef.current) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          updateLinesRef.current?.();
        });
      }
    },
    [],
  );

  useLayoutEffect(() => {
    updateLines();
  }, [updateLines, layout]);

  useEffect(() => {
    const handleResize = () => updateLines();
    window.addEventListener("resize", handleResize);

    const observer = new ResizeObserver(() => updateLines());
    const container = containerRef.current;
    if (container) {
      observer.observe(container);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [updateLines]);

  const columnCount = layout.maxColumn + 1;
  const totalRows = layout.rowOrder.length + (layout.ultimate.length ? 1 : 0);
  const columnTemplate = "repeat(" + Math.max(columnCount, 1) + ", minmax(0, 1fr))";
  const rowTemplate = "repeat(" + Math.max(totalRows, 1) + ", minmax(75px, auto))";

  return (
    <div className="flex-1 rounded-xl border border-border/60 bg-background/60 p-4 shadow-lg shadow-black/10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-primary">
          {treeLabel}
          <span className="ml-3 inline-flex min-w-[2rem] items-center justify-center rounded-md bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">
            {treeCount}
          </span>
        </h2>
      </div>
      <div className="relative" ref={containerRef}>
        {canvasSize.width > 0 && canvasSize.height > 0 && (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={"0 0 " + canvasSize.width + " " + canvasSize.height}
            preserveAspectRatio="none"
          >
            {lines.map((line) => (
              <line
                key={line.id}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={3}
                strokeLinecap="round"
              />
            ))}
          </svg>
        )}
        <div
          className="relative grid gap-6 justify-items-center"
          style={{
            gridTemplateColumns: columnTemplate,
            gridTemplateRows: rowTemplate,
          }}
        >
          {layout.rowOrder.map((rowIndex, visualRow) =>
            layout.rows[rowIndex].map((skill) => {
              const isSelected = selected.has(skill.id) || skill.unlockDefault;
              const isLocked = !isSelected && !canSelectSkill(skill, selected, meta);

              return (
                <SkillNode
                  key={skill.id}
                  skill={skill}
                  selected={isSelected}
                  locked={isLocked}
                  onToggle={() => onToggle(skill)}
                  style={{ gridColumn: String(skill.column + 1), gridRow: String(visualRow + 1) }}
                  nodeRef={registerNode(skill.id)}
                />
              );
            })
          )}

          {layout.ultimate.map((skill) => {
            const isSelected = selected.has(skill.id) || skill.unlockDefault;
            const isLocked = !isSelected && !canSelectSkill(skill, selected, meta);
            const targetColumn = Math.ceil(Math.max(columnCount, 1) / 2);
            const explicitColumn = typeof skill.column === "number" ? skill.column + 1 : targetColumn;

            return (
              <SkillNode
                key={skill.id}
                skill={skill}
                selected={isSelected}
                locked={isLocked}
                onToggle={() => onToggle(skill)}
                style={{
                  gridColumn: String(explicitColumn),
                  gridRow: String(layout.rowOrder.length + 1),
                }}
                nodeRef={registerNode(skill.id)}
              />
            );
          })}
        </div>
=======
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
>>>>>>> 037983faadfcc98299e2af7549d0913ba9fd3185
      </div>
    </div>
  );
};

<<<<<<< HEAD

interface SkillNodeProps {
  skill: ProcessedSkill;
  selected: boolean;
  locked: boolean;
  onToggle: () => void;
  style?: CSSProperties;
  nodeRef?: (node: HTMLButtonElement | null) => void;
}

const SkillNode = ({ skill, selected, locked, onToggle, style, nodeRef }: SkillNodeProps) => {
  const baseSize = skill.slottable ? 80 : 64;
  const size = skill.ultimate ? baseSize * 1.5 : baseSize;
  const borderClasses = selected
    ? "border-primary"
    : locked
    ? "border-border/60"
    : "border-blue-500/80 ring-2 ring-blue-500/50";
  
  const opacityClasses = selected
    ? "opacity-100"
    : locked
    ? "opacity-30"
    : "opacity-40";
    
  const interactivityClasses =
    locked && !selected
      ? "cursor-not-allowed"
      : skill.unlockDefault
      ? "cursor-default"
      : "cursor-pointer hover:-translate-y-1 hover:opacity-100 hover:border-blue-500 hover:ring-blue-500/80 hover:shadow-xl hover:shadow-blue-500/30";
  const shapeClass = skill.slottable ? "rounded-xl" : "rounded-full";
  const paddingClass = skill.ultimate ? "p-3" : skill.slottable ? "p-2" : "p-1.5";
  const backgroundSrc = categoryBackgroundMap[skill.category];
  const placementStyle: CSSProperties = style ?? {};
  const buttonStyle: CSSProperties = {
    ...placementStyle,
    width: size,
    height: size,
    backgroundImage: backgroundSrc ? "url(" + backgroundSrc + ")" : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  const handleClick = () => {
    if (locked && !selected) {
      return;
    }
    if (skill.unlockDefault) {
      return;
    }
    onToggle();
  };

  const cooldownText = skill.cooldown > 0 ? "Cooldown: " + skill.cooldown + "s" : "Passive";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          ref={nodeRef}
          type="button"
          onClick={handleClick}
          style={buttonStyle}
          className={cn(
            "flex items-center justify-center border bg-black/30 backdrop-blur-sm transition-all duration-150 relative overflow-hidden",
            shapeClass,
            borderClasses,
            opacityClasses,
            interactivityClasses,
            paddingClass,
          )}
        >
          {skill.imageSrc ? (
            <img
              src={skill.imageSrc}
              alt={skill.name}
              className={cn(
                "h-full w-full object-contain",
                skill.slottable ? "rounded-lg" : "rounded-full",
              )}
              draggable={false}
            />
          ) : (
            <span className="text-xs font-semibold text-muted-foreground text-center px-1">{skill.name}</span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm whitespace-pre-wrap text-left">
        <div className="font-semibold text-primary">{skill.name}</div>
        {skill.gifSrc && (
          <div className="mt-2 mb-2">
            <img
              src={skill.gifSrc}
              alt={`${skill.name} animation`}
              className="w-full h-auto rounded-md border border-border/20"
              draggable={false}
            />
          </div>
        )}
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {skill.sanitizedDescription}
        </p>
        <div className="mt-2 text-xs text-primary/80">{cooldownText}</div>
      </TooltipContent>
    </Tooltip>
  );
};


export default SkillBuilder;
=======
export default SkillBuilder;
>>>>>>> 037983faadfcc98299e2af7549d0913ba9fd3185
