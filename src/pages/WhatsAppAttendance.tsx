import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  MessageSquare, 
  User, 
  Bot, 
  Send, 
  Phone,
  Clock,
  UserCheck,
  XCircle,
  RefreshCw,
  Loader2,
  AlertCircle
} from "lucide-react";

interface Message {
  id: string;
  sender: string;
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  phone_number: string;
  customer_name: string | null;
  status: string;
  current_intent: string | null;
  last_message_at: string;
  created_at: string;
  whatsapp_messages: Message[];
}

export default function WhatsAppAttendance() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState("waiting");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchConversations();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel("whatsapp-updates")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "whatsapp_conversations" },
          () => fetchConversations()
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "whatsapp_messages" },
          (payload) => {
            if (selectedConversation?.id === payload.new.conversation_id) {
              setSelectedConversation(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  whatsapp_messages: [...prev.whatsapp_messages, payload.new as Message]
                };
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, selectedConversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.whatsapp_messages]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
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
        .in("status", ["active", "waiting_human", "with_human"])
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      // Sort messages within each conversation
      const sortedData = (data || []).map(conv => ({
        ...conv,
        whatsapp_messages: (conv.whatsapp_messages || []).sort(
          (a: Message, b: Message) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      }));

      setConversations(sortedData);
      
      // Update selected conversation if it exists
      if (selectedConversation) {
        const updated = sortedData.find(c => c.id === selectedConversation.id);
        if (updated) {
          setSelectedConversation(updated);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase.functions.invoke("whatsapp-agent", {
        body: {
          action: "send_message",
          conversation_id: selectedConversation.id,
          message: newMessage,
          agent_id: user.id,
        },
      });

      if (error) throw error;

      setNewMessage("");
      toast({ title: "Mensagem enviada!" });
      fetchConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAssign = async (conversationId: string) => {
    if (!user) return;
    try {
      await supabase.functions.invoke("whatsapp-agent", {
        body: {
          action: "assign",
          conversation_id: conversationId,
          agent_id: user.id,
        },
      });
      toast({ title: "Conversa atribuída a você!" });
      fetchConversations();
    } catch (error) {
      console.error("Error assigning:", error);
    }
  };

  const handleClose = async (conversationId: string) => {
    try {
      await supabase.functions.invoke("whatsapp-agent", {
        body: {
          action: "close",
          conversation_id: conversationId,
        },
      });
      toast({ title: "Atendimento encerrado" });
      setSelectedConversation(null);
      fetchConversations();
    } catch (error) {
      console.error("Error closing:", error);
    }
  };

  const handleReturnToBot = async (conversationId: string) => {
    try {
      await supabase.functions.invoke("whatsapp-agent", {
        body: {
          action: "return_to_bot",
          conversation_id: conversationId,
        },
      });
      toast({ title: "Conversa devolvida ao bot" });
      setSelectedConversation(null);
      fetchConversations();
    } catch (error) {
      console.error("Error returning to bot:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      waiting_human: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      with_human: "bg-green-500/20 text-green-400 border-green-500/30",
      active: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      closed: "bg-muted text-muted-foreground border-border",
    };
    const labels = {
      waiting_human: "Aguardando",
      with_human: "Em atendimento",
      active: "Bot ativo",
      closed: "Encerrado",
    };
    return (
      <Badge className={styles[status as keyof typeof styles] || styles.closed}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getIntentBadge = (intent: string | null) => {
    if (!intent) return null;
    const styles: Record<string, string> = {
      support: "bg-purple-500/20 text-purple-400",
      financial: "bg-green-500/20 text-green-400",
      sales: "bg-blue-500/20 text-blue-400",
      human_request: "bg-red-500/20 text-red-400",
      greeting: "bg-yellow-500/20 text-yellow-400",
    };
    return (
      <Badge variant="outline" className={styles[intent] || ""}>
        {intent}
      </Badge>
    );
  };

  const filteredConversations = conversations.filter(conv => {
    if (activeTab === "waiting") return conv.status === "waiting_human";
    if (activeTab === "active") return conv.status === "with_human";
    if (activeTab === "bot") return conv.status === "active";
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#25D366]" />
              Atendimento WhatsApp
            </h1>
            <p className="text-sm text-muted-foreground">
              {conversations.filter(c => c.status === "waiting_human").length} aguardando atendimento
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchConversations}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 border-r border-border bg-card/30 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-3 m-2">
              <TabsTrigger value="waiting" className="text-xs">
                Aguardando
                {conversations.filter(c => c.status === "waiting_human").length > 0 && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center">
                    {conversations.filter(c => c.status === "waiting_human").length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs">Meus</TabsTrigger>
              <TabsTrigger value="bot" className="text-xs">Bot</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-2">
                {loadingConversations ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center text-muted-foreground p-8">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma conversa</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <Card
                      key={conv.id}
                      className={`cursor-pointer transition-all hover:bg-accent/50 ${
                        selectedConversation?.id === conv.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium text-sm truncate">
                                {conv.customer_name || conv.phone_number}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {conv.whatsapp_messages[conv.whatsapp_messages.length - 1]?.content || "Sem mensagens"}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {getStatusBadge(conv.status)}
                            <span className="text-xs text-muted-foreground">
                              {new Date(conv.last_message_at).toLocaleTimeString("pt-BR", { 
                                hour: "2-digit", 
                                minute: "2-digit" 
                              })}
                            </span>
                          </div>
                        </div>
                        {conv.current_intent && (
                          <div className="mt-2">
                            {getIntentBadge(conv.current_intent)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-border p-4 bg-card/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {selectedConversation.customer_name || selectedConversation.phone_number}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(selectedConversation.status)}
                      {getIntentBadge(selectedConversation.current_intent)}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Iniciado {new Date(selectedConversation.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedConversation.status === "waiting_human" && (
                      <Button size="sm" onClick={() => handleAssign(selectedConversation.id)}>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Atender
                      </Button>
                    )}
                    {selectedConversation.status === "with_human" && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReturnToBot(selectedConversation.id)}
                        >
                          <Bot className="w-4 h-4 mr-2" />
                          Devolver ao Bot
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleClose(selectedConversation.id)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Encerrar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-2xl mx-auto">
                  {selectedConversation.whatsapp_messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "user" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          msg.sender === "user"
                            ? "bg-muted text-foreground rounded-tl-none"
                            : msg.sender === "bot"
                            ? "bg-primary/20 text-foreground rounded-tr-none"
                            : "bg-primary text-primary-foreground rounded-tr-none"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {msg.sender === "user" ? (
                            <User className="w-3 h-3" />
                          ) : msg.sender === "bot" ? (
                            <Bot className="w-3 h-3" />
                          ) : (
                            <UserCheck className="w-3 h-3" />
                          )}
                          <span className="text-xs opacity-70">
                            {msg.sender === "user" ? "Cliente" : msg.sender === "bot" ? "Bot" : "Agente"}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                        <p className="text-xs opacity-50 mt-1 text-right">
                          {new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              {selectedConversation.status === "with_human" && (
                <div className="border-t border-border p-4 bg-card/50">
                  <div className="flex gap-2 max-w-2xl mx-auto">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      className="min-h-[60px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={sendingMessage || !newMessage.trim()}
                      className="self-end"
                    >
                      {sendingMessage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {selectedConversation.status === "waiting_human" && (
                <div className="border-t border-border p-6 bg-yellow-500/10 text-center">
                  <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm font-medium">Cliente aguardando atendimento</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Clique em "Atender" para iniciar o atendimento
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Selecione uma conversa para começar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
