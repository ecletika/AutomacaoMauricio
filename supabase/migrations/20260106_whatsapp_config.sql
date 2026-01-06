-- Create whatsapp_config table for bot configuration
CREATE TABLE IF NOT EXISTS whatsapp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_bot_active BOOLEAN DEFAULT true,
  welcome_message TEXT DEFAULT 'Olá! 👋 Como posso ajudar?
1️⃣ Suporte
2️⃣ Financeiro
3️⃣ Comercial
4️⃣ Falar com atendente',
  business_context TEXT DEFAULT 'Somos uma empresa de tecnologia.',
  escalation_keywords TEXT[] DEFAULT ARRAY['atendente', 'humano', 'pessoa'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add intent column to whatsapp_messages if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'whatsapp_messages' AND column_name = 'intent'
  ) THEN
    ALTER TABLE whatsapp_messages ADD COLUMN intent TEXT;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE whatsapp_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whatsapp_config
CREATE POLICY "Users can view own config" ON whatsapp_config
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own config" ON whatsapp_config
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own config" ON whatsapp_config
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_whatsapp_config_updated_at
  BEFORE UPDATE ON whatsapp_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index
CREATE INDEX IF NOT EXISTS idx_whatsapp_config_user ON whatsapp_config(user_id);
