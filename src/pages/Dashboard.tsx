import { useEffect, useState } from "react";
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
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut,
  Loader2
} from "lucide-react";

interface Stats {
  totalConversations: number;
  activeConversations: number;
  waitingHuman: number;
  closedToday: number;
  avgResponseTime: string;
  botResolutionRate: number;
}

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalConversations: 0,
    activeConversations: 0,
    waitingHuman: 0,
    closedToday: 0,
    avgResponseTime: "0min",
    botResolutionRate: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      // Get all conversations
      const { data: conversations } = await supabase
        .from("whatsapp_conversations")
        .select("*");

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const totalConversations = conversations?.length || 0;
      const activeConversations = conversations?.filter(c => c.status === "active").length || 0;
      const waitingHuman = conversations?.filter(c => c.status === "waiting_human").length || 0;
      const closedToday = conversations?.filter(c => {
        const closedDate = new Date(c.updated_at);
        return c.status === "closed" && closedDate >= today;
      }).length || 0;

      // Calculate bot resolution rate (conversations closed without human intervention)
      const botResolved = conversations?.filter(c => 
        c.status === "closed" && !c.assigned_agent_id
      ).length || 0;
      const botResolutionRate = totalConversations > 0 
        ? Math.round((botResolved / totalConversations) * 100) 
        : 0;

      setStats({
        totalConversations,
        activeConversations,
        waitingHuman,
        closedToday,
        avgResponseTime: "< 1min",
        botResolutionRate,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#25D366]" />
              WhatsApp Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Bem-vindo, {user?.email}
            </p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Conversas</CardTitle>
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConversations}</div>
              <p className="text-xs text-muted-foreground">Todas as conversas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
              <Bot className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeConversations}</div>
              <p className="text-xs text-muted-foreground">Sendo atendidas pelo bot</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aguardando Atendimento</CardTitle>
              <AlertCircle className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.waitingHuman}</div>
              <p className="text-xs text-muted-foreground">Precisam de atendente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Encerradas Hoje</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.closedToday}</div>
              <p className="text-xs text-muted-foreground">Conversas finalizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
              <p className="text-xs text-muted-foreground">Resposta do bot</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.botResolutionRate}%</div>
              <p className="text-xs text-muted-foreground">Resolvidas pelo bot</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/whatsapp-attendance")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#25D366]" />
                Painel de Atendimento
              </CardTitle>
              <CardDescription>
                Veja e responda conversas que precisam de atendimento humano
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.waitingHuman > 0 && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  {stats.waitingHuman} aguardando
                </Badge>
              )}
              {stats.waitingHuman === 0 && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Nenhuma conversa aguardando
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/whatsapp-settings")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações do Bot
              </CardTitle>
              <CardDescription>
                Configure mensagens automáticas, contexto do negócio e mais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Configurar
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Como Começar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Configure o Bot</h3>
                <p className="text-sm text-muted-foreground">
                  Acesse as configurações e personalize as mensagens automáticas e o contexto do seu negócio.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Conecte seu WhatsApp</h3>
                <p className="text-sm text-muted-foreground">
                  Configure o webhook no seu provedor de WhatsApp (Meta, Twilio, Z-API) apontando para a URL fornecida nas configurações.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Comece a Atender</h3>
                <p className="text-sm text-muted-foreground">
                  O bot responderá automaticamente. Quando necessário, você será notificado para atendimento humano no painel.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
