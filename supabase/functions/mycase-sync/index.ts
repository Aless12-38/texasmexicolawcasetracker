import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const MYCASE_API_URL = 'https://api.mycase.com/v2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Get MyCase data
    const myCaseResponse = await fetch(`${MYCASE_API_URL}/matters`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('MYCASE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!myCaseResponse.ok) {
      throw new Error('Failed to fetch MyCase data');
    }

    const matters = await myCaseResponse.json();

    // Transform MyCase matters to our case format
    const cases = matters.data.map((matter: any) => ({
      type: 'upcoming', // Default type, can be customized based on matter data
      case_number: matter.case_number,
      client_name: matter.client_name,
      offense: matter.matter_type,
      court: matter.court,
      court_date: matter.next_court_date,
      next_step: matter.next_action,
      follow_up: matter.notes,
      checklist: {
        DME: { checked: false, notes: '' },
        'Scan OCR': { checked: false, notes: '' },
        Organized: { checked: false, notes: '' },
        'Checklist DME': { checked: false, notes: '' },
        'Justice Text Added': { checked: false, notes: '' },
        Dropbox: { checked: false, notes: '' },
      },
      transcripts: {
        videos: { total: 0, items: [] },
        audio: { total: 0, items: [] },
      },
    }));

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Insert cases into Supabase
    const { error } = await supabaseClient
      .from('cases')
      .upsert(cases, { 
        onConflict: 'case_number',
        ignoreDuplicates: false 
      });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});