// Artifact Objective Service - TypeScript implementation based on artifact_objective_service.py
// Handles artifact objective parsing and formatting

export interface NameLink {
  name: string;
  link: string | null;
}

export type FetchLookup = (id: string) => Promise<NameLink | null>;

const TASK_PERK_RE = /task_perk\d+_/i;

function coerceInt(value: any): number | null {
  try {
    return parseInt(String(value));
  } catch (error) {
    return null;
  }
}

function extractZoneId(poiTag: string): string | null {
  const token = (poiTag || "").trim();
  if (!token) return null;
  
  const last = token.split("_").pop();
  if (last && /^\d+$/.test(last)) {
    return last;
  }
  
  const match = token.match(/(\d+)/);
  return match ? match[1] : null;
}

function prettifyIdentifier(identifier: string): string {
  const raw = (identifier || "").replace(/_/g, " ").trim();
  if (!raw) return "";
  
  const spaced = raw.replace(/(?<=\w)([A-Z])/g, " $1");
  const tokens = spaced.split(/\s+/);
  if (!tokens.length) return spaced;
  
  const norm = (token: string) => 
    /^[A-Z]+$/.test(token) ? token : token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
  
  return tokens.map(norm).join(" ");
}

function fallbackLocationLabel(identifier: string): string | null {
  const token = (identifier || "").trim();
  if (!token) return null;
  
  let cleaned = token
    .replace(/^(Dungeon|Activity)/, "")
    .replace(/\d+$/, "");
  
  cleaned = cleaned.replace(/(?<!^)(?=[A-Z])/g, " ").trim();
  return cleaned || null;
}

async function formatKillContribution(
  entry: any,
  fetchCreature: FetchLookup,
  fetchZone: FetchLookup,
  fetchGamemode: FetchLookup
): Promise<string | null> {
  const qty = coerceInt(entry.TargetQty);
  const killEnemy = String(entry.KillEnemyType || "").trim();
  
  let targetName: string | null = null;
  let targetLink: string | null = null;
  
  if (killEnemy) {
    const lookup = await fetchCreature(killEnemy);
    if (lookup) {
      targetName = lookup.name;
      targetLink = lookup.link;
    } else {
      targetName = prettifyIdentifier(killEnemy);
    }
  }
  
  if (!targetName) return null;
  
  const target = targetLink ? `[${targetName}](${targetLink})` : targetName;
  
  const parts = ["Defeat"];
  if (qty && qty > 1) {
    parts.push(String(qty));
  }
  parts.push(target);
  
  let zoneId = extractZoneId(String(entry.POITag || ""));
  if (!zoneId) {
    const territory = coerceInt(entry.TerritoryID);
    if (territory && territory > 0) {
      zoneId = String(territory);
    }
  }
  
  let location: string | null = null;
  let preposition = "at";
  
  if (zoneId) {
    const zoneLookup = await fetchZone(zoneId);
    if (zoneLookup && zoneLookup.name) {
      location = zoneLookup.link ? `[${zoneLookup.name}](${zoneLookup.link})` : zoneLookup.name;
    }
  }
  
  if (!location) {
    const gamemodeId = String(entry.GameModeID || "").trim();
    if (gamemodeId) {
      const gmLookup = await fetchGamemode(gamemodeId);
      if (gmLookup && gmLookup.name) {
        preposition = "in";
        location = gmLookup.link ? `[${gmLookup.name}](${gmLookup.link})` : gmLookup.name;
      } else if (gmLookup === null) {
        const fallback = fallbackLocationLabel(gamemodeId);
        if (fallback) {
          preposition = "in";
          location = fallback;
        }
      }
    }
  }
  
  let text = parts.join(" ");
  if (location) {
    text += ` ${preposition} ${location}`;
  }
  
  return text;
}

function formatGameEvent(entry: any): string | null {
  const qty = coerceInt(entry.TargetQty);
  if (qty && qty > 1) {
    return `Capture ${qty} Forts`;
  }
  return "Capture the Fort";
}

export async function buildArtifactObjectives(
  itemId: string,
  tasks: any[],
  fetchCreature: FetchLookup,
  fetchZone: FetchLookup,
  fetchGamemode: FetchLookup
): Promise<string[]> {
  if (!itemId) return [];
  
  const iid = String(itemId).toLowerCase();
  const relevant: any[] = [];
  
  for (const entry of tasks || []) {
    if (!entry || typeof entry !== 'object') continue;
    
    const taskId = String(entry.TaskID || "");
    if (!taskId || !taskId.toLowerCase().includes(iid)) continue;
    if (!TASK_PERK_RE.test(taskId.toLowerCase())) continue;
    
    relevant.push(entry);
  }
  
  relevant.sort((a, b) => String(a.TaskID || "").localeCompare(String(b.TaskID || "")));
  
  const results: string[] = [];
  
  for (const entry of relevant) {
    const taskType = String(entry.Type || "").trim();
    let text: string | null = null;
    
    if (taskType === "TaskKillContribution") {
      text = await formatKillContribution(entry, fetchCreature, fetchZone, fetchGamemode);
    } else if (taskType === "TaskGameEvent") {
      text = formatGameEvent(entry);
    }
    
    if (text) {
      results.push(text);
    }
  }
  
  return results;
}
