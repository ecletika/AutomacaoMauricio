-- Create whatsapp_settings table
CREATE TABLE IF NOT EXISTS whatsapp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT,
  business_name TEXT,
  api_provider TEXT CHECK (api_provider IN ('twilio', 'meta', 'whatsapp-business-api')),
  api_key TEXT,
  api_secret TEXT,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT false,
  auto_response_enabled BOOLEAN DEFAULT true,
  business_hours_start TIME,
  business_hours_end TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create whatsapp_conversations table
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  customer_name TEXT,
  status TEXT CHECK (status IN ('active', 'waiting_human', 'with_human', 'closed')) DEFAULT 'active',
  current_intent TEXT,
  assigned_agent_id UUID REFERENCES auth.users(id),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create whatsapp_messages table
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
  sender TEXT CHECK (sender IN ('user', 'bot', 'agent')) NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create auto_responses table
CREATE TABLE IF NOT EXISTS auto_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_keyword TEXT,
  intent TEXT,
  response_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversation_context table for AI memory
CREATE TABLE IF NOT EXISTS conversation_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
  context_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON whatsapp_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_phone ON whatsapp_conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON whatsapp_conversations(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON whatsapp_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_auto_responses_user ON auto_responses(user_id);

-- Enable Row Level Security
ALTER TABLE whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_context ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whatsapp_settings
CREATE POLICY "Users can view own settings" ON whatsapp_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON whatsapp_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON whatsapp_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for whatsapp_conversations
CREATE POLICY "Users can view own conversations" ON whatsapp_conversations
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = assigned_agent_id);

CREATE POLICY "Users can insert own conversations" ON whatsapp_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON whatsapp_conversations
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = assigned_agent_id);

-- RLS Policies for whatsapp_messages
CREATE POLICY "Users can view messages from own conversations" ON whatsapp_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM whatsapp_conversations 
      WHERE id = conversation_id 
      AND (user_id = auth.uid() OR assigned_agent_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages" ON whatsapp_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM whatsapp_conversations 
      WHERE id = conversation_id 
      AND (user_id = auth.uid() OR assigned_agent_id = auth.uid())
    )
  );

-- RLS Policies for auto_responses
CREATE POLICY "Users can view own auto responses" ON auto_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own auto responses" ON auto_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own auto responses" ON auto_responses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own auto responses" ON auto_responses
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for conversation_context
CREATE POLICY "Users can view context from own conversations" ON conversation_context
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM whatsapp_conversations 
      WHERE id = conversation_id 
      AND (user_id = auth.uid() OR assigned_agent_id = auth.uid())
    )
  );

CREATE POLICY "System can manage context" ON conversation_context
  FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_whatsapp_settings_updated_at
  BEFORE UPDATE ON whatsapp_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_conversations_updated_at
  BEFORE UPDATE ON whatsapp_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auto_responses_updated_at
  BEFORE UPDATE ON auto_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_context_updated_at
  BEFORE UPDATE ON conversation_context
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update last_message_at on new message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE whatsapp_conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for last_message_at
CREATE TRIGGER update_last_message_trigger
  AFTER INSERT ON whatsapp_messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();
