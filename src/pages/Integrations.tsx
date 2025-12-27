import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Webhook, 
  Send, 
  Mail, 
  Calendar, 
  Github, 
  MessageSquare,
  Cloud,
  Database,
  FileText,
  Copy,
  Check,
  Loader2,
  Plus,
  Trash2
} from "lucide-react";

interface Integration {
  id: string;
  type: string;
  name: string;
  status: string;
  config: unknown;
  credentials: unknown;
  last_sync_at: string | null;
  created_at: string;
}

const integrationTypes = [
  { type: "webhook", name: "Webhooks", icon: Webhook, color: "bg-primary", available: true },
  { type: "telegram", name: "Telegram", icon: Send, color: "bg-[#0088CC]", available: true },
  { type: "gmail", name: "Gmail", icon: Mail, color: "bg-[#EA4335]", available: false },
  { type: "google_calendar", name: "Google Calendar", icon: Calendar, color: "bg-[#4285F4]", available: false },
  { type: "github", name: "GitHub", icon: Github, color: "bg-foreground", available: false },
  { type: "whatsapp", name: "WhatsApp", icon: MessageSquare, color: "bg-[#25D366]", available: true },
  { type: "zoho", name: "Zoho", icon: FileText, color: "bg-[#C8202B]", available: false },
  { type: "microsoft365", name: "Microsoft 365", icon: Cloud, color: "bg-[#0078D4]", available: false },
  { type: "aws", name: "AWS", icon: Cloud, color: "bg-[#FF9900]", available: false },
  { type: "postgresql", name: "PostgreSQL", icon: Database, color: "bg-[#336791]", available: false },
];

export default function Integrations() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  // Webhook state
  const [webhookName, setWebhookName] = useState("");
  const [creatingWebhook, setCreatingWebhook] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Telegram state
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [savingTelegram, setSavingTelegram] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchIntegrations();
    }
  }, [user]);

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error: unknown) {
      console.error("Error fetching integrations:", error);
    } finally {
      setLoadingIntegrations(false);
    }
  };

  const createWebhook = async () => {
    if (!webhookName.trim() || !user) return;
    
    setCreatingWebhook(true);
    try {
      const { data, error } = await supabase
        .from("integrations")
        .insert({
          user_id: user.id,
          type: "webhook",
          name: webhookName,
          status: "active",
          config: {},
          credentials: {},
        })
        .select()
        .single();

      if (error) throw error;

      setIntegrations([data, ...integrations]);
      setWebhookName("");
      toast({
        title: "Webhook criado!",
        description: "Use a URL gerada para receber dados externos.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao criar webhook",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCreatingWebhook(false);
    }
  };

  const deleteIntegration = async (id: string) => {
    try {
      const { error } = await supabase
        .from("integrations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setIntegrations(integrations.filter(i => i.id !== id));
      toast({
        title: "Integração removida",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao remover",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const copyWebhookUrl = (id: string) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-receiver?id=${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "URL copiada!" });
  };

  const testTelegramBot = async () => {
    if (!telegramBotToken.trim()) return;
    
    setTestingTelegram(true);
    try {
      const { data, error } = await supabase.functions.invoke("telegram-bot", {
        body: { action: "test", bot_token: telegramBotToken },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Bot válido!",
          description: `Conectado como @${data.bot.username}`,
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Token inválido";
      toast({
        title: "Erro ao testar bot",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTestingTelegram(false);
    }
  };

  const saveTelegramIntegration = async () => {
    if (!telegramBotToken.trim() || !telegramChatId.trim() || !user) return;
    
    setSavingTelegram(true);
    try {
      const { data, error } = await supabase.functions.invoke("telegram-bot", {
        body: { 
          action: "save", 
          user_id: user.id,
          bot_token: telegramBotToken,
          chat_id: telegramChatId,
        },
      });

      if (error) throw error;

      if (data.success) {
        await fetchIntegrations();
        setTelegramBotToken("");
        setTelegramChatId("");
        toast({
          title: "Telegram conectado!",
          description: "Agora você pode usar o bot em suas automações.",
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSavingTelegram(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-500/20 text-green-400 border-green-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      error: "bg-red-500/20 text-red-400 border-red-500/30",
      inactive: "bg-muted text-muted-foreground border-border",
    };
    return colors[status as keyof typeof colors] || colors.inactive;
  };

  if (loading || loadingIntegrations) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const webhooks = integrations.filter(i => i.type === "webhook");
  const telegramIntegration = integrations.find(i => i.type === "telegram");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Integrações</h1>
            <p className="text-sm text-muted-foreground">Conecte seus serviços favoritos</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="webhook">Webhooks</TabsTrigger>
            <TabsTrigger value="telegram">Telegram</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {integrationTypes.map((integration) => {
                const isConnected = integrations.some(i => i.type === integration.type);
                return (
                  <Card 
                    key={integration.type}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      integration.available ? "hover:border-primary/50" : "opacity-60"
                    }`}
                    onClick={() => {
                      if (integration.type === "whatsapp") {
                        navigate("/whatsapp-settings");
                      } else if (integration.available) {
                        setActiveTab(integration.type);
                      }
                    }}
                  >
                    <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
                      <div className={`w-12 h-12 rounded-xl ${integration.color} flex items-center justify-center`}>
                        <integration.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{integration.name}</p>
                        {isConnected ? (
                          <Badge className="mt-1 bg-green-500/20 text-green-400 text-xs">Conectado</Badge>
                        ) : integration.available ? (
                          <Badge variant="outline" className="mt-1 text-xs">Disponível</Badge>
                        ) : (
                          <Badge variant="secondary" className="mt-1 text-xs">Em breve</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="webhook" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="w-5 h-5" />
                  Criar Novo Webhook
                </CardTitle>
                <CardDescription>
                  Webhooks permitem receber dados de qualquer serviço externo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="webhookName">Nome do Webhook</Label>
                    <Input
                      id="webhookName"
                      placeholder="Ex: Notificações Stripe"
                      value={webhookName}
                      onChange={(e) => setWebhookName(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={createWebhook} disabled={creatingWebhook || !webhookName.trim()}>
                      {creatingWebhook ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      Criar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {webhooks.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Seus Webhooks</h3>
                {webhooks.map((webhook) => (
                  <Card key={webhook.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{webhook.name}</h4>
                            <Badge className={getStatusBadge(webhook.status)}>{webhook.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                            {import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-receiver?id={webhook.id}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => copyWebhookUrl(webhook.id)}>
                            {copiedId === webhook.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => deleteIntegration(webhook.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="telegram" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Conectar Telegram Bot
                </CardTitle>
                <CardDescription>
                  Use um bot do Telegram para enviar notificações automáticas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
                  <p><strong>Como configurar:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Abra o Telegram e pesquise por @BotFather</li>
                    <li>Envie /newbot e siga as instruções</li>
                    <li>Copie o token do bot gerado</li>
                    <li>Inicie uma conversa com seu bot e envie /start</li>
                    <li>Use @userinfobot para descobrir seu Chat ID</li>
                  </ol>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="botToken">Bot Token</Label>
                    <Input
                      id="botToken"
                      type="password"
                      placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                      value={telegramBotToken}
                      onChange={(e) => setTelegramBotToken(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="chatId">Chat ID</Label>
                    <Input
                      id="chatId"
                      placeholder="123456789"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={testTelegramBot} disabled={testingTelegram || !telegramBotToken}>
                    {testingTelegram && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Testar Bot
                  </Button>
                  <Button onClick={saveTelegramIntegration} disabled={savingTelegram || !telegramBotToken || !telegramChatId}>
                    {savingTelegram && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Salvar Integração
                  </Button>
                </div>
              </CardContent>
            </Card>

            {telegramIntegration && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0088CC] flex items-center justify-center">
                        <Send className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium">Telegram Bot</h4>
                        <p className="text-xs text-muted-foreground">
                          Conectado · Chat ID: {(telegramIntegration.credentials as { chat_id?: string })?.chat_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusBadge(telegramIntegration.status)}>
                        {telegramIntegration.status}
                      </Badge>
                      <Button variant="outline" size="icon" onClick={() => deleteIntegration(telegramIntegration.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
