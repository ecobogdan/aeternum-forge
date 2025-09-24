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

async function fetchPerkDetails(perkId: string) {
  try {
    const response = await fetch(`https://nwdb.info/db/perk/${perkId}.json`);
    const perkData = await response.json();
    return {
      id: perkId,
      name: perkData.name || 'Unknown Perk',
      description: perkData.description || '',
    };
  } catch (error) {
    console.error(`Error fetching perk ${perkId}:`, error);
    return {
      id: perkId,
      name: 'Unknown Perk',
      description: '',
    };
  }
}

async function fetchAllPerks() {
  try {
    console.log('Fetching perks from NWDB API');
    
    // First, get the first page to determine total pages
    const firstResponse = await fetch('https://nwdb.info/db/perks/page/1.json');
    const firstData = await firstResponse.json();
    
    const totalPages = firstData.pageCount || 1;
    const allPerks = [...firstData.data];
    
    console.log(`Found ${totalPages} pages of perks`);
    
    // Fetch remaining pages in batches
    const batchSize = 5;
    for (let i = 2; i <= totalPages; i += batchSize) {
      const batch = [];
      for (let j = i; j < i + batchSize && j <= totalPages; j++) {
        batch.push(fetch(`https://nwdb.info/db/perks/page/${j}.json`).then(r => r.json()));
      }
      
      const batchResults = await Promise.all(batch);
      for (const result of batchResults) {
        if (result.data) {
          allPerks.push(...result.data);
        }
      }
    }
    
    console.log(`Fetched ${allPerks.length} perks from NWDB`);
    
    // Process perks to get detailed info
    const processedPerks = await Promise.all(
      allPerks.map(async (perk: any) => {
        return {
          id: perk.id,
          name: perk.name || 'Unknown Perk',
          description: perk.description || '',
        };
      })
    );
    
    return processedPerks;
  } catch (error) {
    console.error('Error fetching perks:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { perkId, forceRefresh = false } = await req.json();
    
    // If specific perk requested, fetch only that perk
    if (perkId) {
      console.log(`Fetching specific perk: ${perkId}`);
      
      // Check cache first
      if (!forceRefresh) {
        const { data: existingPerk } = await supabase
          .from('nwdb_perks')
          .select('*')
          .eq('id', perkId)
          .single();
        
        if (existingPerk) {
          return new Response(JSON.stringify({ perk: existingPerk }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      
      const perkDetails = await fetchPerkDetails(perkId);
      
      // Cache the perk
      await supabase
        .from('nwdb_perks')
        .upsert(perkDetails);
      
      return new Response(JSON.stringify({ perk: perkDetails }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Fetch all perks
    console.log('Fetching all perks');
    
    // Check if we should refresh cache (if perks are older than 1 day or forceRefresh)
    if (!forceRefresh) {
      const { data: existingPerks } = await supabase
        .from('nwdb_perks')
        .select('*')
        .gte('cached_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      if (existingPerks && existingPerks.length > 100) {
        console.log(`Returning ${existingPerks.length} cached perks`);
        return new Response(JSON.stringify({ perks: existingPerks }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    const allPerks = await fetchAllPerks();
    
    // Clear old cache and insert new perks
    await supabase.from('nwdb_perks').delete().neq('id', '');
    
    // Insert perks in batches
    const batchSize = 100;
    for (let i = 0; i < allPerks.length; i += batchSize) {
      const batch = allPerks.slice(i, i + batchSize);
      const { error } = await supabase
        .from('nwdb_perks')
        .insert(batch);
      
      if (error) {
        console.error('Error inserting perk batch:', error);
      }
    }
    
    console.log(`Successfully cached ${allPerks.length} perks`);
    
    return new Response(JSON.stringify({ perks: allPerks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-nwdb-perks function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});