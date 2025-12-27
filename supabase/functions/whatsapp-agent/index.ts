import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, conversation_id, message, agent_id, phone_number, status } = await req.json();

    console.log(`Agent action: ${action}`, { conversation_id, agent_id });

    switch (action) {
      case "send_message": {
        if (!conversation_id || !message || !agent_id) {
          return new Response(
            JSON.stringify({ error: "conversation_id, message, and agent_id are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Save agent message
        const { error: msgError } = await supabase.from("whatsapp_messages").insert({
          conversation_id,
          sender: "agent",
          content: message,
        });

        if (msgError) throw msgError;

        // Update conversation
        await supabase
          .from("whatsapp_conversations")
          .update({ 
            status: "with_human",
            assigned_agent_id: agent_id,
            last_message_at: new Date().toISOString(),
          })
          .eq("id", conversation_id);

        // Get conversation details for sending via WhatsApp
        const { data: conv } = await supabase
          .from("whatsapp_conversations")
          .select("phone_number")
          .eq("id", conversation_id)
          .single();

        return new Response(
          JSON.stringify({ 
            success: true, 
            phone_number: conv?.phone_number,
            message: "Message saved and ready to send via WhatsApp provider"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "assign": {
        if (!conversation_id || !agent_id) {
          return new Response(
            JSON.stringify({ error: "conversation_id and agent_id are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        await supabase
          .from("whatsapp_conversations")
          .update({ 
            status: "with_human",
            assigned_agent_id: agent_id,
          })
          .eq("id", conversation_id);

        return new Response(
          JSON.stringify({ success: true, message: "Conversation assigned to agent" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "close": {
        if (!conversation_id) {
          return new Response(
            JSON.stringify({ error: "conversation_id is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Send closing message
        await supabase.from("whatsapp_messages").insert({
          conversation_id,
          sender: "bot",
          content: "Atendimento encerrado. Obrigado pelo contato! 🙏 Se precisar de algo mais, é só enviar uma mensagem.",
        });

        await supabase
          .from("whatsapp_conversations")
          .update({ 
            status: "closed",
            assigned_agent_id: null,
          })
          .eq("id", conversation_id);

        return new Response(
          JSON.stringify({ success: true, message: "Conversation closed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "return_to_bot": {
        if (!conversation_id) {
          return new Response(
            JSON.stringify({ error: "conversation_id is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        await supabase
          .from("whatsapp_conversations")
          .update({ 
            status: "active",
            assigned_agent_id: null,
          })
          .eq("id", conversation_id);

        return new Response(
          JSON.stringify({ success: true, message: "Conversation returned to bot" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_conversations": {
        const { data: conversations, error } = await supabase
          .from("whatsapp_conversations")
          .select(`
            *,
            whatsapp_messages (
              id,
              sender,
              content,
              created_at
            )
          `)
          .in("status", ["waiting_human", "with_human", "active"])
          .order("last_message_at", { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, conversations }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error: unknown) {
    console.error("Agent action error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
