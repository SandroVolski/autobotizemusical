import { motion } from "framer-motion";
import { Music, Music2, Music3, Music4 } from "lucide-react";

const musicIcons = [Music, Music2, Music3, Music4];

export const FloatingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(6)].map((_, i) => {
        const Icon = musicIcons[i % musicIcons.length];
        return (
          <motion.div
            key={i}
            className="absolute text-primary/5"
            style={{
              left: `${10 + (i * 15)}%`,
              top: `${20 + (i * 10)}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              rotate: [0, 10, -10, 0],
              opacity: [0.03, 0.08, 0.03],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          >
            <Icon className="w-16 h-16 md:w-24 md:h-24" />
          </motion.div>
        );
      })}
    </div>
  );
};
