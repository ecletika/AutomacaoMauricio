import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroWorkflow from "@/assets/hero-workflow.png";

export function HeroSection() {
  return (
    <section className="relative min-h-screen gradient-hero pt-20 lg:pt-24 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 py-16 lg:py-24">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6 animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Nova versão disponível
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-up delay-100">
              Automatize seus{" "}
              <span className="gradient-text">workflows</span>{" "}
              sem escrever código
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 animate-fade-up delay-200 max-w-xl mx-auto lg:mx-0">
              Conecte suas ferramentas favoritas, crie automações visuais e transforme 
              processos manuais em fluxos inteligentes em minutos.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-up delay-300">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                Crie automações agora
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="heroOutline" size="lg" className="w-full sm:w-auto">
                <Play className="w-5 h-5" />
                Ver como funciona
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-12 pt-8 border-t border-border/50 animate-fade-up delay-400">
              <p className="text-sm text-muted-foreground mb-4">
                Usado por equipes em empresas inovadoras
              </p>
              <div className="flex items-center justify-center lg:justify-start gap-8 opacity-60">
                <div className="text-foreground font-semibold">TechCorp</div>
                <div className="text-foreground font-semibold">StartupX</div>
                <div className="text-foreground font-semibold">DataFlow</div>
                <div className="text-foreground font-semibold hidden sm:block">CloudBase</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="flex-1 w-full max-w-2xl lg:max-w-none animate-scale-in delay-200">
            <div className="relative">
              <div className="absolute inset-0 gradient-cta opacity-20 blur-3xl rounded-3xl" />
              <img
                src={heroWorkflow}
                alt="Ilustração de workflows automatizados conectados"
                className="relative w-full h-auto rounded-2xl shadow-2xl animate-float"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
