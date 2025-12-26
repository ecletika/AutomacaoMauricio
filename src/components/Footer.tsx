import { Zap, Twitter, Linkedin, Github, Youtube } from "lucide-react";

const footerLinks = {
  produto: [
    { label: "Recursos", href: "#" },
    { label: "Integrações", href: "#" },
    { label: "Preços", href: "#" },
    { label: "Changelog", href: "#" },
    { label: "Roadmap", href: "#" },
  ],
  comunidade: [
    { label: "Documentação", href: "#" },
    { label: "Tutoriais", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Discord", href: "#" },
    { label: "Templates", href: "#" },
  ],
  empresa: [
    { label: "Sobre nós", href: "#" },
    { label: "Carreiras", href: "#" },
    { label: "Contato", href: "#" },
    { label: "Parceiros", href: "#" },
    { label: "Imprensa", href: "#" },
  ],
  legal: [
    { label: "Privacidade", href: "#" },
    { label: "Termos de Uso", href: "#" },
    { label: "Cookies", href: "#" },
    { label: "Segurança", href: "#" },
    { label: "LGPD", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl gradient-cta flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">FlowSync</span>
            </a>
            <p className="text-background/60 mb-6 max-w-xs">
              A plataforma de automação que conecta suas ferramentas e 
              transforma processos manuais em workflows inteligentes.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-3">
              {footerLinks.produto.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-background/60 hover:text-background transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Comunidade</h4>
            <ul className="space-y-3">
              {footerLinks.comunidade.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-background/60 hover:text-background transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-background/60 hover:text-background transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-background/60 hover:text-background transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/60">
            © 2024 FlowSync. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2 text-sm text-background/60">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Todos os sistemas operacionais
          </div>
        </div>
      </div>
    </footer>
  );
}
