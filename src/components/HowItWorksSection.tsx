import { Plug, MousePointer2, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Plug,
    title: "Conecte seus serviços",
    description: "Autentique suas ferramentas favoritas em poucos cliques. Suportamos OAuth, API keys e webhooks.",
  },
  {
    number: "02",
    icon: MousePointer2,
    title: "Crie seu workflow visual",
    description: "Arraste e solte nós para construir sua lógica de automação. Adicione condições, loops e transformações.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Automatize processos",
    description: "Ative seu workflow e deixe a mágica acontecer. Monitore execuções e otimize em tempo real.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Como{" "}
            <span className="gradient-text">funciona</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Em três passos simples, você transforma processos manuais em automações poderosas.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative group"
            >
              {/* Connector line (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent -translate-x-1/2 z-0" />
              )}
              
              <div className="relative bg-card border border-border/50 rounded-2xl p-8 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                {/* Step number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl gradient-cta flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
