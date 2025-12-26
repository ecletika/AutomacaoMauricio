import { Workflow, Plug, Code2, Server, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: Workflow,
    title: "Automação Visual",
    description: "Construa workflows complexos com uma interface drag-and-drop intuitiva. Sem necessidade de programação.",
  },
  {
    icon: Plug,
    title: "+500 Integrações",
    description: "Conecte-se a centenas de apps e serviços populares. De Google a APIs personalizadas.",
  },
  {
    icon: Code2,
    title: "Código Opcional",
    description: "Para casos avançados, adicione JavaScript ou Python customizado aos seus workflows.",
  },
  {
    icon: Server,
    title: "Self-Hosted",
    description: "Hospede na sua própria infraestrutura para máximo controle e segurança dos dados.",
  },
  {
    icon: Zap,
    title: "Execução em Tempo Real",
    description: "Triggers instantâneos e execuções em paralelo para automações ultra-rápidas.",
  },
  {
    icon: Shield,
    title: "Segurança Enterprise",
    description: "Criptografia de ponta a ponta, SSO, audit logs e compliance com LGPD/GDPR.",
  },
];

export function FeaturesSection() {
  return (
    <section id="produto" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Tudo que você precisa para{" "}
            <span className="gradient-text">automatizar</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Uma plataforma completa para criar, gerenciar e escalar suas automações 
            com facilidade e confiança.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 lg:p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
