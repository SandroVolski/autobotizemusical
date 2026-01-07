import { motion } from "framer-motion";

const logos = [
  "Escola de Música Sandro Volski",
  "Escola Harmonia",
  "Instituto Musical",
  "Academia de Música",
  "Centro Musical",
];

export const LogoCloud = () => {
  return (
    <section className="py-12 border-y border-border/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <p className="text-center text-muted-foreground text-sm mb-8">Empresas que confiam no Autobotize</p>

        {/* Infinite scroll animation */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

          <motion.div
            className="flex gap-12"
            animate={{ x: [0, -1000] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 20,
                ease: "linear",
              },
            }}
          >
            {[...logos, ...logos, ...logos].map((logo, index) => (
              <div key={index} className="flex-shrink-0 px-8 py-4 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-muted-foreground font-medium whitespace-nowrap">{logo}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
