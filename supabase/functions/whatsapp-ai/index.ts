import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface ConversationContext {
  lastIntent?: string;
  messageCount?: number;
  customerName?: string;
}

interface ClassificationResult {
  intent: string;
  confidence: number;
  requiresHuman: boolean;
  response: string;
}

async function classifyAndRespond(
  message: string, 
  conversationHistory: Array<{ sender: string; content: string }>,
  businessContext: string,
  welcomeMessage: string,
  escalationKeywords: string[]
): Promise<ClassificationResult> {
  
  // Check for escalation keywords
  const lowerMessage = message.toLowerCase();
  const needsEscalation = escalationKeywords.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );

  if (needsEscalation) {
    return {
      intent: "human_request",
      confidence: 1.0,
      requiresHuman: true,
      response: "Entendi! 🙋 Vou transferir você para um atendente humano. Aguarde um momento, por favor."
    };
  }

  // Check for simple menu selections
  if (/^[1-4]$/.test(message.trim())) {
    const menuOptions: Record<string, { intent: string; response: string }> = {
      "1": { 
        intent: "support", 
        response: "Você escolheu Suporte. 🔧\n\nPor favor, descreva brevemente seu problema ou dúvida técnica que posso ajudar a resolver." 
      },
      "2": { 
        intent: "financial", 
        response: "Você escolheu Financeiro. 💰\n\nPosso ajudar com:\n• Boletos e faturas\n• Pagamentos\n• Dúvidas sobre cobranças\n\nComo posso ajudar?" 
      },
      "3": { 
        intent: "sales", 
        response: "Você escolheu Comercial. 🛒\n\nEstou aqui para ajudar com:\n• Informações sobre produtos/serviços\n• Orçamentos\n• Novas contratações\n\nO que gostaria de saber?" 
      },
      "4": { 
        intent: "human_request", 
        response: "Entendi! 🙋 Vou transferir você para um atendente humano. Aguarde um momento, por favor." 
      },
    };

    const selection = menuOptions[message.trim()];
    return {
      intent: selection.intent,
      confidence: 1.0,
      requiresHuman: selection.intent === "human_request",
      response: selection.response
    };
  }

  // Check for greetings
  const greetings = ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite", "hello", "hi", "hey"];
  if (greetings.some(g => lowerMessage.includes(g)) && message.length < 30) {
    return {
      intent: "greeting",
      confidence: 0.9,
      requiresHuman: false,
      response: welcomeMessage
    };
  }

  // Use AI for complex messages
  try {
    const systemPrompt = `Você é um assistente virtual de atendimento ao cliente.

CONTEXTO DO NEGÓCIO:
${businessContext}

REGRAS IMPORTANTES:
1. Seja educado, claro e objetivo
2. Use linguagem informal-profissional (adequada para WhatsApp)
3. Respostas curtas (máximo 3-4 linhas quando possível)
4. NUNCA invente informações sobre produtos, preços ou prazos
5. Se não souber algo, sugira falar com um atendente
6. Detecte frustração ou urgência - nesses casos, ofereça atendente humano
7. Não responda sobre assuntos fora do escopo do negócio

INTENÇÕES POSSÍVEIS:
- support: Problemas técnicos, bugs, dúvidas de uso
- financial: Boletos, pagamentos, cobranças
- sales: Vendas, produtos, orçamentos
- human_request: Usuário quer falar com humano
- unknown: Não conseguiu entender

Responda no formato JSON:
{
  "intent": "intenção_detectada",
  "confidence": 0.0 a 1.0,
  "requiresHuman": true/false,
  "response": "sua resposta ao cliente"
}`;

    const conversationForAI = conversationHistory.slice(-5).map(msg => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.content
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationForAI,
          { role: "user", content: message }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      console.error("AI Gateway error:", response.status);
      throw new Error("AI Gateway error");
    }

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);
    
    return {
      intent: aiResponse.intent || "unknown",
      confidence: aiResponse.confidence || 0.5,
      requiresHuman: aiResponse.requiresHuman || false,
      response: aiResponse.response || "Desculpe, não entendi. Poderia reformular? Ou digite 4 para falar com um atendente."
    };
  } catch (error) {
    console.error("Error calling AI:", error);
    return {
      intent: "unknown",
      confidence: 0.0,
      requiresHuman: false,
      response: "Desculpe, estou com dificuldades para processar sua mensagem. Tente novamente ou digite 4 para falar com um atendente. 🙏"
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone_number, message, customer_name } = await req.json();

    if (!phone_number || !message) {
      return new Response(
        JSON.stringify({ error: "phone_number and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing message from ${phone_number}: ${message}`);

    // Get or create conversation
    let { data: conversation, error: convError } = await supabase
      .from("whatsapp_conversations")
      .select("*")
      .eq("phone_number", phone_number)
      .maybeSingle();

    if (convError) {
      console.error("Error fetching conversation:", convError);
      throw convError;
    }

    if (!conversation) {
      const { data: newConv, error: insertError } = await supabase
        .from("whatsapp_conversations")
        .insert({
          phone_number,
          customer_name: customer_name || null,
          status: "active",
        })
        .select()
        .single();

      if (insertError) throw insertError;
      conversation = newConv;
    }

    // Get default config
    const { data: config } = await supabase
      .from("whatsapp_config")
      .select("*")
      .limit(1)
      .maybeSingle();

    const welcomeMessage = config?.welcome_message || `Olá! 👋 Como posso ajudar?
1️⃣ Suporte
2️⃣ Financeiro
3️⃣ Comercial
4️⃣ Falar com atendente`;

    const businessContext = config?.business_context || "Somos uma empresa de tecnologia.";
    const escalationKeywords = config?.escalation_keywords || ["atendente", "humano", "pessoa"];
    const isBotActive = config?.is_bot_active ?? true;

    // Save user message
    await supabase.from("whatsapp_messages").insert({
      conversation_id: conversation.id,
      sender: "user",
      content: message,
    });

    // Check if conversation is with human agent
    if (conversation.status === "with_human") {
      return new Response(
        JSON.stringify({ 
          success: true, 
          response: null,
          status: "with_human",
          message: "Conversation is being handled by human agent"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If bot is inactive, don't respond
    if (!isBotActive) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          response: null,
          status: "bot_inactive",
          message: "Bot is currently inactive"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get conversation history
    const { data: history } = await supabase
      .from("whatsapp_messages")
      .select("sender, content")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .limit(20);

    // Process with AI
    const result = await classifyAndRespond(
      message,
      history || [],
      businessContext,
      welcomeMessage,
      escalationKeywords
    );

    // Save bot response
    await supabase.from("whatsapp_messages").insert({
      conversation_id: conversation.id,
      sender: "bot",
      content: result.response,
      intent: result.intent as any,
    });

    // Update conversation status
    const updateData: Record<string, unknown> = {
      current_intent: result.intent,
      last_message_at: new Date().toISOString(),
    };

    if (result.requiresHuman) {
      updateData.status = "waiting_human";
    }

    await supabase
      .from("whatsapp_conversations")
      .update(updateData)
      .eq("id", conversation.id);

    console.log(`Response for ${phone_number}: ${result.intent} - ${result.response.substring(0, 50)}...`);

    return new Response(
      JSON.stringify({
        success: true,
        conversation_id: conversation.id,
        intent: result.intent,
        confidence: result.confidence,
        response: result.response,
        requires_human: result.requiresHuman,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error processing message:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
