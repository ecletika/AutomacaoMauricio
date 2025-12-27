import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const webhookId = url.searchParams.get("id");
    
    if (!webhookId) {
      return new Response(
        JSON.stringify({ error: "Missing webhook ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get request body
    const body = req.method === "POST" ? await req.json() : {};
    
    console.log(`Webhook received for ID: ${webhookId}`, body);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the integration
    const { data: integration, error: integrationError } = await supabase
      .from("integrations")
      .select("*, workflows!workflows_trigger_integration_id_fkey(*)")
      .eq("id", webhookId)
      .eq("type", "webhook")
      .maybeSingle();

    if (integrationError || !integration) {
      console.error("Integration not found:", integrationError);
      return new Response(
        JSON.stringify({ error: "Webhook not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update last sync
    await supabase
      .from("integrations")
      .update({ last_sync_at: new Date().toISOString(), status: "active" })
      .eq("id", webhookId);

    // Process workflows triggered by this webhook
    const workflows = integration.workflows || [];
    for (const workflow of workflows) {
      if (workflow.is_active) {
        // Log the workflow execution
        await supabase.from("workflow_logs").insert({
          workflow_id: workflow.id,
          user_id: integration.user_id,
          status: "success",
          input_data: body,
          output_data: { processed: true },
        });

        // Update workflow run count
        await supabase
          .from("workflows")
          .update({ 
            run_count: workflow.run_count + 1, 
            last_run_at: new Date().toISOString() 
          })
          .eq("id", workflow.id);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Webhook processed" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error processing webhook:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
