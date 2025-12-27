import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TelegramMessage {
  chat_id: string | number;
  text: string;
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
}

async function sendTelegramMessage(botToken: string, message: TelegramMessage) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
  
  const data = await response.json();
  console.log("Telegram response:", data);
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, integration_id, bot_token, chat_id, message, user_id } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === "test") {
      // Test the bot connection
      const testResponse = await fetch(`https://api.telegram.org/bot${bot_token}/getMe`);
      const testData = await testResponse.json();
      
      if (!testData.ok) {
        throw new Error("Invalid bot token");
      }

      return new Response(
        JSON.stringify({ success: true, bot: testData.result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "send") {
      // Get integration credentials
      const { data: integration, error } = await supabase
        .from("integrations")
        .select("*")
        .eq("id", integration_id)
        .eq("type", "telegram")
        .single();

      if (error || !integration) {
        throw new Error("Integration not found");
      }

      const credentials = integration.credentials as { bot_token: string; chat_id: string };
      
      const result = await sendTelegramMessage(credentials.bot_token, {
        chat_id: credentials.chat_id,
        text: message,
        parse_mode: "HTML",
      });

      if (!result.ok) {
        throw new Error(result.description || "Failed to send message");
      }

      // Update last sync
      await supabase
        .from("integrations")
        .update({ last_sync_at: new Date().toISOString(), status: "active" })
        .eq("id", integration_id);

      return new Response(
        JSON.stringify({ success: true, result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "save") {
      // Save or update Telegram integration
      const { data: existing } = await supabase
        .from("integrations")
        .select("id")
        .eq("user_id", user_id)
        .eq("type", "telegram")
        .maybeSingle();

      const integrationData = {
        user_id,
        type: "telegram" as const,
        name: "Telegram Bot",
        credentials: { bot_token, chat_id },
        status: "active" as const,
        config: {},
      };

      let result;
      if (existing) {
        result = await supabase
          .from("integrations")
          .update(integrationData)
          .eq("id", existing.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("integrations")
          .insert(integrationData)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      return new Response(
        JSON.stringify({ success: true, integration: result.data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action");
  } catch (error: unknown) {
    console.error("Telegram bot error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
