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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, buildData, buildId } = await req.json();
    
    console.log(`Build action: ${action}`);
    
    switch (action) {
      case 'create': {
        const { error, data } = await supabase
          .from('builds')
          .insert(buildData)
          .select()
          .single();
        
        if (error) throw error;
        
        return new Response(JSON.stringify({ build: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'update': {
        const { error, data } = await supabase
          .from('builds')
          .update(buildData)
          .eq('id', buildId)
          .select()
          .single();
        
        if (error) throw error;
        
        return new Response(JSON.stringify({ build: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'delete': {
        const { error } = await supabase
          .from('builds')
          .delete()
          .eq('id', buildId);
        
        if (error) throw error;
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'get': {
        const { error, data } = await supabase
          .from('builds')
          .select('*')
          .eq('id', buildId)
          .single();
        
        if (error) throw error;
        
        return new Response(JSON.stringify({ build: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'list': {
        const { error, data } = await supabase
          .from('builds')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return new Response(JSON.stringify({ builds: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in manage-builds function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});