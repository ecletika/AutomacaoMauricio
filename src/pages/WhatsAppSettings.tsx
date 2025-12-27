import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  MessageSquare, 
  Settings, 
  Bot, 
  Save,
  Loader2,
  Copy,
  Check,
  Webhook
} from "lucide-react";

interface WhatsAppConfig {
  id?: string;
  is_bot_active: boolean;
  welcome_message: string;
  business_context: string;
  escalation_keywords: string[];
}

export default function WhatsAppSettings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [config, setConfig] = useState<WhatsAppConfig>({
    is_bot_active: true,
    welcome_message: `Olá! 👋 Como posso ajudar?
1️⃣ Suporte
2️⃣ Financeiro
3️⃣ Comercial
4️⃣ Falar com atendente`,
    business_context: "Somos uma empresa de tecnologia que oferece soluções de automação.",
    escalation_keywords: ["atendente", "humano", "pessoa", "ajuda real"],
  });
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [saving, setSaving] = useState(false);
  const [keywordsInput, setKeywordsInput] = useState("");
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-webhook`;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchConfig();
    }
  }, [user]);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("whatsapp_config")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setConfig({
          id: data.id,
          is_bot_active: data.is_bot_active,
          welcome_message: data.welcome_message || config.welcome_message,
          business_context: data.business_context || config.business_context,
          escalation_keywords: data.escalation_keywords || config.escalation_keywords,
        });
        setKeywordsInput((data.escalation_keywords || []).join(", "));
      } else {
        setKeywordsInput(config.escalation_keywords.join(", "));
      }
    } catch (error) {
      console.error("Error fetching config:", error);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const keywords = keywordsInput
        .split(",")
        .map(k => k.trim())
        .filter(k => k.length > 0);

      const configData = {
        user_id: user.id,
        is_bot_active: config.is_bot_active,
        welcome_message: config.welcome_message,
        business_context: config.business_context,
        escalation_keywords: keywords,
      };

      if (config.id) {
        const { error } = await supabase
          .from("whatsapp_config")
          .update(configData)
          .eq("id", config.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("whatsapp_config")
          .insert(configData);
        if (error) throw error;
      }

      toast({ title: "Configurações salvas!" });
      fetchConfig();
    } catch (error) {
      console.error("Error saving config:", error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
    toast({ title: "URL copiada!" });
  };

  if (loading || loadingConfig) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/integrations")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações WhatsApp
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure o bot de atendimento automático
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {/* Webhook URL */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5" />
              URL do Webhook
            </CardTitle>
            <CardDescription>
              Configure esta URL no seu provedor de WhatsApp (Meta, Twilio, Z-API, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={webhookUrl} readOnly className="font-mono text-sm" />
              <Button variant="outline" onClick={copyWebhookUrl}>
                {copiedWebhook ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Este webhook aceita formatos de Meta, Twilio, Z-API e formato genérico.
            </p>
          </CardContent>
        </Card>

        {/* Bot Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Status do Bot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Bot de atendimento automático</p>
                <p className="text-sm text-muted-foreground">
                  {config.is_bot_active 
                    ? "O bot responderá mensagens automaticamente" 
                    : "Mensagens serão enviadas diretamente para atendentes"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={config.is_bot_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                  {config.is_bot_active ? "Ativo" : "Inativo"}
                </Badge>
                <Switch
                  checked={config.is_bot_active}
                  onCheckedChange={(checked) => setConfig({ ...config, is_bot_active: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Message */}
        <Card>
          <CardHeader>
            <CardTitle>Mensagem de Boas-vindas</CardTitle>
            <CardDescription>
              Mensagem enviada quando um cliente inicia uma conversa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={config.welcome_message}
              onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
              placeholder="Olá! Como posso ajudar?"
              rows={5}
            />
          </CardContent>
        </Card>

        {/* Business Context */}
        <Card>
          <CardHeader>
            <CardTitle>Contexto do Negócio</CardTitle>
            <CardDescription>
              Informações sobre sua empresa que a IA usará para responder perguntas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={config.business_context}
              onChange={(e) => setConfig({ ...config, business_context: e.target.value })}
              placeholder="Descreva seu negócio, produtos, serviços..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Quanto mais detalhado, melhores serão as respostas do bot.
            </p>
          </CardContent>
        </Card>

        {/* Escalation Keywords */}
        <Card>
          <CardHeader>
            <CardTitle>Palavras de Escalação</CardTitle>
            <CardDescription>
              Quando o cliente usar essas palavras, será transferido para um atendente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder="atendente, humano, pessoa"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Separe as palavras por vírgula
            </p>
          </CardContent>
        </Card>

        {/* Navigation to Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#25D366]" />
              Painel de Atendimento
            </CardTitle>
            <CardDescription>
              Veja e responda conversas que precisam de atendimento humano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/whatsapp-attendance")} className="w-full">
              Abrir Painel de Atendimento
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Configurações
          </Button>
        </div>
      </main>
    </div>
  );
}
