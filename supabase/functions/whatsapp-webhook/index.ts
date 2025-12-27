import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// This webhook receives messages from WhatsApp providers (Meta, Twilio, Z-API, etc.)
// You need to configure your provider to send webhooks to this URL

serve(async (req) => {
  // Handle webhook verification (required by Meta/Facebook)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    // Verify webhook (for Meta WhatsApp API)
    const VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN") || "flowsync_webhook_token";
    
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified successfully");
      return new Response(challenge, { status: 200 });
    }
    
    return new Response("Forbidden", { status: 403 });
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Webhook received:", JSON.stringify(payload).substring(0, 500));

    // Handle Meta WhatsApp Business API format
    if (payload.object === "whatsapp_business_account") {
      for (const entry of payload.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === "messages") {
            const value = change.value;
            
            for (const message of value.messages || []) {
              const phoneNumber = message.from;
              const messageText = message.text?.body || message.button?.text || "";
              const customerName = value.contacts?.[0]?.profile?.name;

              if (messageText) {
                // Process with AI
                const aiResponse = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-ai`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
                  },
                  body: JSON.stringify({
                    phone_number: phoneNumber,
                    message: messageText,
                    customer_name: customerName,
                  }),
                });

                const result = await aiResponse.json();
                console.log("AI processed:", result);

                // If there's a response and we should send it
                if (result.response) {
                  // TODO: Implement actual WhatsApp send here based on your provider
                  // For Meta: POST to https://graph.facebook.com/v17.0/{phone_number_id}/messages
                  // For Twilio: Use Twilio API
                  // For Z-API: POST to their API
                  
                  console.log(`Would send to ${phoneNumber}: ${result.response}`);
                }
              }
            }
          }
        }
      }
    }
    
    // Handle Z-API format
    else if (payload.phone || payload.chatId) {
      const phoneNumber = payload.phone || payload.chatId?.replace("@c.us", "");
      const messageText = payload.text?.message || payload.body || "";
      const customerName = payload.senderName || payload.pushname;

      if (messageText && phoneNumber) {
        const aiResponse = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-ai`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
          body: JSON.stringify({
            phone_number: phoneNumber,
            message: messageText,
            customer_name: customerName,
          }),
        });

        const result = await aiResponse.json();
        console.log("AI processed (Z-API):", result);
      }
    }

    // Handle Twilio format
    else if (payload.From && payload.Body) {
      const phoneNumber = payload.From.replace("whatsapp:", "");
      const messageText = payload.Body;

      const aiResponse = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          message: messageText,
        }),
      });

      const result = await aiResponse.json();
      console.log("AI processed (Twilio):", result);
    }

    // Generic format (for testing)
    else if (payload.phone_number && payload.message) {
      const aiResponse = await fetch(`${SUPABASE_URL}/functions/v1/whatsapp-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await aiResponse.json();
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
