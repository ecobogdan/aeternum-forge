import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const ITEM_TYPE_ENDPOINTS = {
  helmet: 'https://nwdb.info/db/items/armors/helmet/page',
  chest: 'https://nwdb.info/db/items/armors/chest/page',
  gloves: 'https://nwdb.info/db/items/armors/gloves/page',
  pants: 'https://nwdb.info/db/items/armors/pants/page',
  shoes: 'https://nwdb.info/db/items/armors/shoes/page',
  amulet: 'https://nwdb.info/db/items/armors/amulet/page',
  ring: 'https://nwdb.info/db/items/armors/ring/page',
  earring: 'https://nwdb.info/db/items/armors/earring/page',
  weapons: 'https://nwdb.info/db/items/weapons/page',
  shield: 'https://nwdb.info/db/items/weapons/shield/page',
  heartrune: 'https://nwdb.info/db/items/heartgem-runes/page',
};

async function fetchAllPages(baseUrl: string): Promise<any[]> {
  try {
    console.log(`Fetching first page from: ${baseUrl}/1.json`);
    const firstResponse = await fetch(`${baseUrl}/1.json`);
    const firstData = await firstResponse.json();
    
    const totalPages = firstData.pageCount || 1;
    const allItems = [...firstData.data];
    
    console.log(`Found ${totalPages} pages for ${baseUrl}`);
    
    // Fetch remaining pages in parallel (but limit concurrent requests)
    const batchSize = 5;
    for (let i = 2; i <= totalPages; i += batchSize) {
      const batch = [];
      for (let j = i; j < i + batchSize && j <= totalPages; j++) {
        batch.push(fetch(`${baseUrl}/${j}.json`).then(r => r.json()));
      }
      
      const batchResults = await Promise.all(batch);
      for (const result of batchResults) {
        if (result.data) {
          allItems.push(...result.data);
        }
      }
    }
    
    console.log(`Fetched ${allItems.length} items from ${baseUrl}`);
    return allItems;
  } catch (error) {
    console.error(`Error fetching from ${baseUrl}:`, error);
    return [];
  }
}

async function processItem(item: any, itemType: string) {
  return {
    id: item.id,
    name: item.name,
    icon: item.icon,
    tier: item.tier,
    rarity: item.rarity,
    gear_score_max: item.gearScoreMax,
    item_type: itemType,
    perks: item.perks || [],
    has_random_perks: item.hasRandomPerks || false,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { itemType, forceRefresh = false } = await req.json();
    
    console.log(`Fetching items for type: ${itemType}`);
    
    // Check if we should refresh cache (if items are older than 1 day or forceRefresh)
    if (!forceRefresh) {
      const { data: existingItems } = await supabase
        .from('nwdb_items')
        .select('*')
        .eq('item_type', itemType)
        .gte('cached_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      if (existingItems && existingItems.length > 0) {
        console.log(`Returning cached items for ${itemType}`);
        return new Response(JSON.stringify({ items: existingItems }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    const endpoint = ITEM_TYPE_ENDPOINTS[itemType as keyof typeof ITEM_TYPE_ENDPOINTS];
    if (!endpoint) {
      throw new Error(`Unknown item type: ${itemType}`);
    }
    
    const rawItems = await fetchAllPages(endpoint);
    const processedItems = await Promise.all(
      rawItems.map(item => processItem(item, itemType))
    );
    
    // Delete old cached items for this type
    await supabase
      .from('nwdb_items')
      .delete()
      .eq('item_type', itemType);
    
    // Insert new items in batches
    const batchSize = 100;
    for (let i = 0; i < processedItems.length; i += batchSize) {
      const batch = processedItems.slice(i, i + batchSize);
      const { error } = await supabase
        .from('nwdb_items')
        .insert(batch);
      
      if (error) {
        console.error('Error inserting batch:', error);
      }
    }
    
    console.log(`Successfully cached ${processedItems.length} items for ${itemType}`);
    
    return new Response(JSON.stringify({ items: processedItems }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-nwdb-items function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});