import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-cta opacity-95" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Comece gratuitamente
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Pronto para automatizar seu trabalho?
          </h2>
          
          <p className="text-lg sm:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Junte-se a milhares de equipes que já economizam horas toda semana com 
            automações inteligentes. Sem cartão de crédito necessário.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="xl" 
              className="w-full sm:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-xl hover:shadow-2xl"
            >
              Criar conta grátis
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="xl" 
              className="w-full sm:w-auto text-primary-foreground border-2 border-primary-foreground/30 hover:bg-primary-foreground/10 hover:border-primary-foreground/50"
            >
              Falar com vendas
            </Button>
          </div>

          {/* Trust text */}
          <p className="mt-8 text-sm text-primary-foreground/60">
            ✓ Teste grátis por 14 dias  ✓ Sem cartão de crédito  ✓ Cancele quando quiser
          </p>
        </div>
      </div>
    </section>
  );
}
