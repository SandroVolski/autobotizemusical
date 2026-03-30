import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const PhoneMockupSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const transitionRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !phoneRef.current || !transitionRef.current) return;

    const ctx = gsap.context(() => {
      // Transition line setup
      const animatedLine = transitionRef.current?.querySelector("#animated-line-phone");
      const glowNode = transitionRef.current?.querySelector("#glowing-node-phone");
      const innerNode = transitionRef.current?.querySelector("#inner-node-phone");
      const transText = transitionRef.current?.querySelector("#transition-text-phone");
      const musicNotes = transitionRef.current?.querySelectorAll(".music-note-phone");

      if (animatedLine) {
        gsap.set(animatedLine, { strokeDasharray: 200, strokeDashoffset: 200 });
      }
      if (glowNode && innerNode) {
        gsap.set([glowNode, innerNode], { attr: { cy: 0 }, opacity: 0 });
      }

      // Transition animation
      const tlTransition = gsap.timeline({
        scrollTrigger: {
          trigger: transitionRef.current,
          start: "top 60%",
          end: "bottom 40%",
          scrub: 1,
        },
      });

      if (transText) tlTransition.to(transText, { opacity: 1, duration: 0.1 });
      if (glowNode && innerNode) tlTransition.to([glowNode, innerNode], { opacity: 1, duration: 0.1 }, "<");
      if (animatedLine) tlTransition.to(animatedLine, { strokeDashoffset: 0, duration: 1, ease: "none" });
      if (glowNode && innerNode) tlTransition.to([glowNode, innerNode], { attr: { cy: 200 }, duration: 1, ease: "none" }, "<");
      if (musicNotes) tlTransition.to(musicNotes, { opacity: 1, y: -15, duration: 0.4, stagger: 0.3, ease: "back.out(1.5)" }, 0.2);
      if (transText) tlTransition.to(transText, { opacity: 0, duration: 0.1 });

      // Phone section pinned animation
      gsap.set(phoneRef.current, { y: 100, opacity: 0, scale: 0.95 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=3500",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Phone appears
      tl.to(phoneRef.current, { y: 0, scale: 1, opacity: 1, duration: 2, ease: "power2.out" })
        .to({}, { duration: 0.5 });

      // Messages appear one by one
      const msgs = sectionRef.current?.querySelectorAll(".chat-msg-phone");
      if (msgs) {
        const scrollToChat = (amount: number) => {
          if (chatRef.current) {
            gsap.to(chatRef.current, { scrollTop: amount, duration: 0.8, ease: "power2.out" });
          }
        };

        msgs.forEach((msg, i) => {
          tl.to(msg, { opacity: 1, y: 0, duration: 1, ease: "back.out(1.2)" });
          if (i === 2) tl.call(() => scrollToChat(60));
          if (i === 3) tl.call(() => scrollToChat(220));
          if (i === 4) tl.call(() => scrollToChat(400));
          if (i < (msgs.length - 1)) tl.to({}, { duration: 0.4 });
        });

        tl.to({}, { duration: 2 });
      }

      // Text animations
      const titleEl = sectionRef.current?.querySelector("#phone-text-title");
      const descEl = sectionRef.current?.querySelector("#phone-text-desc");
      const featList = sectionRef.current?.querySelectorAll("#phone-features-list > div");

      if (titleEl) {
        gsap.from(titleEl, {
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
          opacity: 0, x: -50, duration: 1, ease: "power3.out",
        });
      }
      if (descEl) {
        gsap.from(descEl, {
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
          opacity: 0, x: -50, duration: 1, delay: 0.2, ease: "power3.out",
        });
      }
      if (featList) {
        gsap.from(featList, {
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
          opacity: 0, y: 20, duration: 0.8, stagger: 0.2, delay: 0.4, ease: "power3.out",
        });
      }
    }, transitionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Transition Line */}
      <div ref={transitionRef} className="w-full flex flex-col items-center justify-center bg-black pt-12 pb-8 relative z-20">
        <div id="transition-text-phone" className="text-[#00FFAC] text-sm font-semibold tracking-widest uppercase mb-4 opacity-0 flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" style={{ animationDuration: "3s" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Conectando...
        </div>

        <svg width="120" height="200" viewBox="0 0 120 200" className="overflow-visible">
          <defs>
            <linearGradient id="line-gradient-phone" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8000FF" />
              <stop offset="100%" stopColor="#00FFAC" />
            </linearGradient>
            <filter id="glow-dot-phone" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <line x1="60" y1="0" x2="60" y2="200" stroke="#2a2d35" strokeWidth="2" strokeDasharray="6 6" />
          <line id="animated-line-phone" x1="60" y1="0" x2="60" y2="200" stroke="url(#line-gradient-phone)" strokeWidth="4" strokeLinecap="round" />
          <circle id="glowing-node-phone" cx="60" cy="0" r="6" fill="#00FFAC" filter="url(#glow-dot-phone)" className="opacity-0" />
          <circle id="inner-node-phone" cx="60" cy="0" r="2" fill="#ffffff" className="opacity-0" />
          <text className="music-note-phone opacity-0" x="20" y="50" fill="#00FFAC" fontSize="20">🎵</text>
          <text className="music-note-phone opacity-0" x="80" y="110" fill="#8000FF" fontSize="24">🎶</text>
          <text className="music-note-phone opacity-0" x="25" y="160" fill="#00FFAC" fontSize="18">🎵</text>
        </svg>
      </div>

      {/* Main Phone Section */}
      <section ref={sectionRef} className="h-screen w-full bg-black flex items-center justify-center overflow-hidden relative">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#8000FF]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10 h-full py-12 md:py-0">
          {/* Left: Text */}
          <div className="flex flex-col justify-center space-y-6 h-full md:h-auto">
            <div className="inline-block px-4 py-1.5 rounded-full bg-[#00FFAC]/10 border border-[#00FFAC]/20 text-[#00FFAC] text-sm font-semibold w-max mb-2">
              Comunicação Inteligente
            </div>
            <h2 id="phone-text-title" className="text-3xl md:text-5xl font-bold leading-tight text-white">
              Comunicação no <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8000FF] to-[#00FFAC]">Piloto Automático</span>
            </h2>
            <p id="phone-text-desc" className="text-gray-400 text-lg md:text-xl leading-relaxed">
              Esqueça as cobranças manuais e as faltas por esquecimento. Nosso sistema envia lembretes de aulas e avisos de mensalidade diretamente para seus alunos.
            </p>

            <div id="phone-features-list" className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#8000FF]/20 flex items-center justify-center text-[#8000FF]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-gray-300">Confirmações de aulas automáticas</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00FFAC]/20 flex items-center justify-center text-[#00FFAC]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-gray-300">Cobranças e envio de Pix integrados</span>
              </div>
            </div>
          </div>

          {/* Right: Phone Mockup */}
          <div className="flex justify-center items-center h-full">
            <div
              ref={phoneRef}
              className="w-full max-w-[320px] h-[600px] max-h-[85vh] bg-[#0b141a] rounded-[40px] border-[6px] border-[#2A2D35] relative shadow-[0_20px_60px_-15px_rgba(128,0,255,0.3)] flex flex-col overflow-hidden"
            >
              {/* Dynamic Island */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-30 flex items-center justify-between px-2 shadow-sm border border-gray-900">
                <div className="w-2 h-2 bg-[#111] rounded-full border border-gray-800" />
                <div className="w-1 h-1 bg-green-500 rounded-full shadow-[0_0_6px_#22c55e]" />
              </div>

              {/* Chat Header */}
              <div className="bg-[#202c33] pt-10 pb-2 px-3 flex items-center gap-2 z-20 relative shadow-md shrink-0">
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8000FF] to-[#00FFAC] p-[1.5px] shadow-sm shrink-0">
                  <div className="w-full h-full bg-[#12141A] rounded-full flex items-center justify-center text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden leading-tight">
                  <h3 className="font-semibold text-[14px] text-gray-100 truncate">Escola de Música</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">online</p>
                </div>
                <div className="flex items-center gap-4 text-gray-300 shrink-0 mr-1">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
              </div>

              {/* Chat Messages */}
              <div ref={chatRef} className="flex-1 px-3 py-4 flex flex-col gap-2 relative justify-start overflow-y-auto bg-[#0b141a]" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {/* Message 1 - School reminder */}
                <div className="chat-msg-phone opacity-0 translate-y-6 flex flex-col items-start max-w-[85%]">
                  <div className="bg-gradient-to-br from-[#8000FF] to-[#6000c0] text-white text-[13px] leading-relaxed p-2.5 px-3 rounded-2xl rounded-tl-none shadow-sm">
                    Olá, Lucas! 🎸 Passando para lembrar da sua aula de Guitarra amanhã às 15h com o Prof. Marcos.
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 ml-1 font-medium">14:30</span>
                </div>

                {/* Message 2 - Student reply */}
                <div className="chat-msg-phone opacity-0 translate-y-6 flex flex-col items-end max-w-[85%] self-end">
                  <div className="bg-[#202c33] text-gray-100 text-[13px] leading-relaxed p-2.5 px-3 rounded-2xl rounded-tr-none shadow-sm border border-gray-800/50">
                    Tudo certo! Estarei lá. 👍
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 mr-1 font-medium">14:45</span>
                </div>

                {/* Message 3 - School billing */}
                <div className="chat-msg-phone opacity-0 translate-y-6 flex flex-col items-start max-w-[85%] mt-1">
                  <div className="bg-gradient-to-br from-[#8000FF] to-[#6000c0] text-white text-[13px] leading-relaxed p-2.5 px-3 rounded-2xl rounded-tl-none shadow-sm">
                    Ótimo! Ah, lembrando que a sua mensalidade vence no dia 10. Para facilitar, segue a chave PIX:
                  </div>
                </div>

                {/* Message 4 - Pix card */}
                <div className="chat-msg-phone opacity-0 translate-y-6 flex flex-col items-start max-w-[90%]">
                  <div className="bg-[#1f2c34] border border-[#2a3942] p-2.5 rounded-2xl rounded-tl-none shadow-md w-full">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-[#00FFAC]/10 p-2.5 rounded-full text-[#00FFAC]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium leading-tight">Mensalidade</p>
                        <p className="text-[14px] font-bold text-[#00FFAC] tracking-tight">R$ 150,00</p>
                      </div>
                    </div>
                    <button className="w-full bg-[#00FFAC] text-[#0A0C10] text-[12px] font-bold py-2 rounded-xl flex items-center justify-center gap-2 shadow-sm">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      Copiar Chave Pix
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 ml-1 font-medium">14:45</span>
                </div>

                {/* Message 5 - Student confirmation */}
                <div className="chat-msg-phone opacity-0 translate-y-6 flex flex-col items-end max-w-[85%] self-end mt-1">
                  <div className="bg-[#202c33] text-gray-100 text-[13px] leading-relaxed p-2.5 px-3 rounded-2xl rounded-tr-none shadow-sm border border-[#2a3942]">
                    Feito! Pagamento realizado. ✅
                  </div>
                  <span className="text-[10px] text-[#00FFAC] mt-1 mr-1 flex items-center gap-1 font-medium">
                    Visto <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  </span>
                </div>

                <div className="h-8 w-full shrink-0" />
              </div>

              {/* Footer input */}
              <div className="bg-[#202c33] p-2 flex items-end gap-2 shrink-0 relative z-10 w-full pb-3">
                <div className="flex-1 bg-[#2a3942] rounded-[24px] flex items-center px-3 py-2 gap-2.5 min-h-[44px]">
                  <svg className="w-6 h-6 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div className="text-gray-400 text-[14px] flex-1 truncate">Mensagem</div>
                  <svg className="w-5 h-5 text-gray-400 shrink-0 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="w-[44px] h-[44px] rounded-full bg-[#00FFAC] flex items-center justify-center text-[#0A0C10] shrink-0 shadow-md">
                  <svg className="w-5 h-5 translate-x-[1px] translate-y-[1px]" fill="currentColor" viewBox="0 0 24 24"><path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
