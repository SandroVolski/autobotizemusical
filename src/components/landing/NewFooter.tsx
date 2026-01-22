import { ChevronRightIcon, MailIcon, MessageIcon } from "./icons/LandingIcons";

const WHATSAPP_NUMBER = "5542998005326";

const Marquee = () => {
  const logos = ["AUTOBOTIZE", "HARMONIA", "AUTOMAÇÃO", "GESTÃO", "ORGANIZAÇÃO", "MELODIA", "MÚSICA", "CONEXÃO"];
  
  return (
    <div className="relative flex overflow-x-hidden border-y border-white/5 py-8 select-none mt-12">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {logos.map((logo, i) => (
          <div key={i} className="flex items-center">
            <span className="mx-12 text-6xl md:text-8xl font-black text-white/5 hover:text-[#8000FF] transition-colors duration-700 cursor-default uppercase italic tracking-tighter font-sans">
              {logo}
            </span>
            <div className="w-2 h-2 bg-[#8000FF] rotate-45 opacity-30" />
          </div>
        ))}
      </div>
      <div className="absolute top-8 animate-marquee2 whitespace-nowrap flex items-center">
        {logos.map((logo, i) => (
          <div key={i} className="flex items-center">
            <span className="mx-12 text-6xl md:text-8xl font-black text-white/5 hover:text-[#8000FF] transition-colors duration-700 cursor-default uppercase italic tracking-tighter font-sans">
              {logo}
            </span>
            <div className="w-2 h-2 bg-[#8000FF] rotate-45 opacity-30" />
          </div>
        ))}
      </div>
    </div>
  );
};

interface FooterLinkProps {
  children: React.ReactNode;
  href?: string;
}

const FooterLink: React.FC<FooterLinkProps> = ({ children, href = "#" }) => (
  <a href={href} className="group flex items-center gap-3 py-1.5 text-gray-500 hover:text-white transition-all duration-300">
    <ChevronRightIcon className="w-3 h-3 text-[#8000FF] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
    <span className="uppercase text-[11px] tracking-[0.2em] font-bold italic font-sans">{children}</span>
  </a>
);

export const NewFooter = () => {
  return (
    <footer className="bg-black text-white pt-16">
      <Marquee />
      
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8000FF] to-[#00F69C] flex items-center justify-center">
                <span className="text-white font-black text-xl">AZ</span>
              </div>
              <div>
                <h4 className="text-white font-black text-xl uppercase tracking-tight">Autobotize</h4>
                <p className="text-white/30 text-[10px] uppercase tracking-[0.3em]">Gestão Empresarial</p>
              </div>
            </div>

            <p className="text-white/40 text-sm leading-relaxed max-w-sm mb-8">
              Sincronizando a gestão administrativa com a paixão pela música. Automação completa para escolas que buscam o próximo nível de excelência sonora e operacional.
            </p>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 mb-2">E-mail</p>
                <a href="mailto:contato@autobotize.com" className="flex items-center gap-3 text-white/60 hover:text-[#8000FF] transition-colors group">
                  <MailIcon className="w-4 h-4" />
                  <span className="text-sm">contato@autobotize.com</span>
                </a>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 mb-2">WhatsApp</p>
                <a 
                  href={`https://wa.me/${WHATSAPP_NUMBER}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-white/60 hover:text-[#00F69C] transition-colors group"
                >
                  <MessageIcon className="w-4 h-4" />
                  <span className="text-sm">+55 42 99800-5326</span>
                </a>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-7 grid grid-cols-2 gap-8">
            <div>
              <h5 className="text-[10px] uppercase tracking-[0.5em] text-white/20 mb-6">Seções</h5>
              <nav className="flex flex-col">
                <FooterLink>Início</FooterLink>
                <FooterLink href="#recursos">Funcionalidades</FooterLink>
                <FooterLink>Avaliações</FooterLink>
                <FooterLink href="#pricing-section">Investimento</FooterLink>
              </nav>
            </div>

            <div>
              <h5 className="text-[10px] uppercase tracking-[0.5em] text-white/20 mb-6">Social</h5>
              <nav className="flex flex-col">
                <FooterLink href="https://instagram.com">Instagram</FooterLink>
                <FooterLink href="https://linkedin.com">LinkedIn</FooterLink>
                <FooterLink href="https://youtube.com">YouTube</FooterLink>
                <FooterLink>Comunidade</FooterLink>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <a href="#" className="text-white/20 hover:text-white/40 text-[10px] uppercase tracking-[0.3em] transition-colors">
            Política de Privacidade
          </a>

          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block" />

          <p className="text-white/20 text-[10px] uppercase tracking-[0.3em] text-center whitespace-pre-line">
            © 2026 Autobotize.{'\n'}Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
