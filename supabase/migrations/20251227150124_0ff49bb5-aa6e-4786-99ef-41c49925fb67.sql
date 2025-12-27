-- Create enum for conversation status
CREATE TYPE public.conversation_status AS ENUM ('active', 'waiting_human', 'with_human', 'closed');

-- Create enum for message sender
CREATE TYPE public.message_sender AS ENUM ('user', 'bot', 'agent');

-- Create enum for detected intent
CREATE TYPE public.detected_intent AS ENUM ('greeting', 'support', 'financial', 'sales', 'human_request', 'unknown', 'farewell');

-- Create whatsapp_conversations table
CREATE TABLE public.whatsapp_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  customer_name TEXT,
  status conversation_status NOT NULL DEFAULT 'active',
  current_intent detected_intent,
  assigned_agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  context JSONB DEFAULT '{}'::jsonb,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(phone_number)
);

-- Create whatsapp_messages table
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  sender message_sender NOT NULL,
  content TEXT NOT NULL,
  intent detected_intent,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create whatsapp_config table for bot settings
CREATE TABLE public.whatsapp_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_bot_active BOOLEAN NOT NULL DEFAULT true,
  welcome_message TEXT DEFAULT 'Olá! 👋 Como posso ajudar?
1️⃣ Suporte
2️⃣ Financeiro
3️⃣ Comercial
4️⃣ Falar com atendente',
  business_context TEXT DEFAULT 'Somos uma empresa de tecnologia que oferece soluções de automação.',
  escalation_keywords TEXT[] DEFAULT ARRAY['atendente', 'humano', 'pessoa', 'ajuda real'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whatsapp_conversations (authenticated users can manage)
CREATE POLICY "Authenticated users can view conversations" ON public.whatsapp_conversations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update conversations" ON public.whatsapp_conversations FOR UPDATE TO authenticated USING (true);

-- RLS Policies for whatsapp_messages (authenticated users can view and insert)
CREATE POLICY "Authenticated users can view messages" ON public.whatsapp_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert messages" ON public.whatsapp_messages FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for whatsapp_config
CREATE POLICY "Users can view their own config" ON public.whatsapp_config FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own config" ON public.whatsapp_config FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own config" ON public.whatsapp_config FOR UPDATE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_whatsapp_conversations_updated_at BEFORE UPDATE ON public.whatsapp_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_whatsapp_config_updated_at BEFORE UPDATE ON public.whatsapp_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for conversations and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;