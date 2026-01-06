import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Settings,
  Bot,
  Users,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Smartphone,
  ArrowRight
} from "lucide-react";

interface Stats {
  totalConversations: number;
  activeConversations: number;
  waitingHuman: number;
  withHuman: number;
  closedToday: number;
  botActive: boolean;
}

export default function WhatsAppHub() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats>({
    totalConversations: 0,
    activeConversations: 0,
    waitingHuman: 0,
    withHuman: 0,
    closedToday: 0,
    botActive: true,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchRecentMessages();

      const interval = setInterval(() => {
        fetchStats();
        fetchRecentMessages();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data: conversations } = await supabase
        .from("whatsapp_conversations")
        .select("status, created_at");

      const { data: config } = await supabase
        .from("whatsapp_config")
        .select("is_bot_active")
        .maybeSingle();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newStats: Stats = {
        totalConversations: conversations?.length || 0,
        activeConversations: conversations?.filter(c => c.status === "active").length || 0,
        waitingHuman: conversations?.filter(c => c.status === "waiting_human").length || 0,
        withHuman: conversations?.filter(c => c.status === "with_human").length || 0,
        closedToday: conversations?.filter(c =>
          c.status === "closed" &&
          new Date(c.created_at) >= today
        ).length || 0,
        botActive: config?.is_bot_active ?? true,
      };

      setStats(newStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRecentMessages = async () => {
    try {
      const { data } = await supabase
        .from("whatsapp_conversations")
        .select(`
          id,
          phone_number,
          customer_name,
          status,
          last_message_at,
          whatsapp_messages (
            content,
            sender,
            created_at
          )
        `)
        .in("status", ["waiting_human", "with_human", "active"])
        .order("last_message_at", { ascending: false })
        .limit(5);

      if (data) {
        const formatted = data.map(conv => ({
          ...conv,
          lastMessage: conv.whatsapp_messages?.[conv.whatsapp_messages.length - 1],
        }));
        setRecentMessages(formatted);
      }
    } catch (error) {
      console.error("Error fetching recent messages:", error);
    }
  };

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                Central do WhatsApp
              </h1>
              <p className="text-muted-foreground text-lg">
                Gerencie todas as suas conversas e configurações em um só lugar
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/dashboard")}
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2"
            onClick={() => navigate("/whatsapp-attendance")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-blue-500" />
                Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Responda clientes em tempo real
              </p>
              {stats.waitingHuman > 0 && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  {stats.waitingHuman} aguardando
                </Badge>
              )}
              <ArrowRight className="w-5 h-5 text-muted-foreground mt-2" />
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2"
            onClick={() => navigate("/whatsapp-settings")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-5 h-5 text-purple-500" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Configure o bot e mensagens
              </p>
              <Badge className={stats.botActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                Bot {stats.botActive ? "Ativo" : "Inativo"}
              </Badge>
              <ArrowRight className="w-5 h-5 text-muted-foreground mt-2" />
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="w-5 h-5 text-[#25D366]" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Webhook</span>
                  <Badge className="bg-green-500/20 text-green-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Conectado
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">IA</span>
                  <Badge className="bg-green-500/20 text-green-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Online
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalConversations}</div>
              <p className="text-xs text-muted-foreground mt-1">conversas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-500" />
                Bot Ativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{stats.activeConversations}</div>
              <p className="text-xs text-muted-foreground mt-1">conversas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                Aguardando
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{stats.waitingHuman}</div>
              <p className="text-xs text-muted-foreground mt-1">clientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{stats.withHuman}</div>
              <p className="text-xs text-muted-foreground mt-1">em andamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Finalizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.closedToday}</div>
              <p className="text-xs text-muted-foreground mt-1">hoje</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Atividade Recente
            </CardTitle>
            <CardDescription>
              Últimas conversas ativas no WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma conversa ativa no momento</p>
                <p className="text-sm mt-1">As novas mensagens aparecerão aqui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      navigate("/whatsapp-attendance");
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-[#25D366]" />
                        <span className="font-medium">
                          {conv.customer_name || conv.phone_number}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {conv.status === "waiting_human" ? "Aguardando" :
                           conv.status === "with_human" ? "Em atendimento" : "Bot"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage?.content || "Sem mensagens"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-xs text-muted-foreground">
                        {new Date(conv.last_message_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert for pending conversations */}
        {stats.waitingHuman > 0 && (
          <Card className="mt-6 border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-yellow-500" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {stats.waitingHuman} {stats.waitingHuman === 1 ? "cliente aguardando" : "clientes aguardando"} atendimento
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Clientes solicitaram falar com um atendente humano
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={() => navigate("/whatsapp-attendance")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Atender Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
