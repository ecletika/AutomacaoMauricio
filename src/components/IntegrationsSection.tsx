import { 
  MessageSquare, 
  Mail, 
  Database, 
  Cloud, 
  Github, 
  Calendar,
  CreditCard,
  FileText,
  BarChart3,
  Send,
  Webhook,
  Bot
} from "lucide-react";

const integrations = [
  { name: "Slack", icon: MessageSquare, color: "bg-[#4A154B]" },
  { name: "Gmail", icon: Mail, color: "bg-[#EA4335]" },
  { name: "PostgreSQL", icon: Database, color: "bg-[#336791]" },
  { name: "AWS", icon: Cloud, color: "bg-[#FF9900]" },
  { name: "GitHub", icon: Github, color: "bg-foreground" },
  { name: "Calendar", icon: Calendar, color: "bg-[#4285F4]" },
  { name: "Stripe", icon: CreditCard, color: "bg-[#635BFF]" },
  { name: "Notion", icon: FileText, color: "bg-foreground" },
  { name: "Analytics", icon: BarChart3, color: "bg-[#F9AB00]" },
  { name: "Telegram", icon: Send, color: "bg-[#0088CC]" },
  { name: "Webhooks", icon: Webhook, color: "bg-primary" },
  { name: "OpenAI", icon: Bot, color: "bg-[#10A37F]" },
];

export function IntegrationsSection() {
  return (
    <section id="integracoes" className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Conecte com{" "}
            <span className="gradient-text">centenas</span> de ferramentas
          </h2>
          <p className="text-lg text-muted-foreground">
            Integrações nativas com os serviços mais populares do mercado. 
            E se não existir, crie a sua usando webhooks e APIs.
          </p>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 lg:gap-6 max-w-4xl mx-auto">
          {integrations.map((integration, index) => (
            <div
              key={integration.name}
              className="group flex flex-col items-center gap-3 p-4 lg:p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl ${integration.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <integration.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground text-center">
                {integration.name}
              </span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { value: "500+", label: "Integrações" },
            { value: "50M+", label: "Execuções/mês" },
            { value: "10k+", label: "Empresas" },
            { value: "99.9%", label: "Uptime" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
