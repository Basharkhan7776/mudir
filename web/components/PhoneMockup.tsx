import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  WifiOff,
  ShieldCheck,
  HardDrive,
  Layers,
  Users,
  FileJson,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { div } from "framer-motion/client";

interface PhoneMockupProps {
  feature: string;
}

const ScreenContent: React.FC<{ feature: string }> = ({ feature }) => {
  // Abstract UI representations for different features
  const renderContent = () => {
    switch (feature) {
      case "hero":
        return (
          <div className="flex flex-col h-full p-5 pt-12 md:p-6 md:pt-14 space-y-4 md:space-y-6">
            <div className="flex justify-between items-end border-b border-black pb-4">
              <div className="text-xl md:text-2xl font-bold tracking-tighter">
                Mudir
              </div>
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-black"></div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="h-28 md:h-32 border border-black rounded-xl md:rounded-2xl flex flex-col justify-between p-3">
                <span className="text-[10px] md:text-xs">In Stock</span>
                <span className="text-2xl md:text-3xl font-bold">482</span>
              </div>
              <div className="h-28 md:h-32 bg-black text-white rounded-xl md:rounded-2xl flex flex-col justify-between p-3">
                <span className="text-[10px] md:text-xs">Value</span>
                <span className="text-2xl md:text-3xl font-bold">$9k</span>
              </div>
            </div>
            <div className="flex-1 border border-black rounded-xl md:rounded-2xl p-4 space-y-4">
              <div className="w-full h-2 bg-black/10 rounded-full"></div>
              <div className="w-2/3 h-2 bg-black/10 rounded-full"></div>
              <div className="w-full h-2 bg-black/10 rounded-full"></div>
              <div className="mt-8 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 border-b border-black/10"
                  >
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-md bg-black/5"></div>
                    <div className="w-20 md:w-24 h-2 bg-black/10 rounded"></div>
                    <div className="w-6 md:w-8 h-2 bg-black/10 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "collections":
        return (
          <div className="flex flex-col h-full p-5 pt-12 md:p-6 md:pt-14 space-y-4">
            <div className="text-lg md:text-xl font-bold mb-2 md:mb-4">
              Collections
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="aspect-square border border-black rounded-xl flex items-center justify-center relative overflow-hidden group"
                >
                  <Layers
                    size={20}
                    className="md:w-6 md:h-6"
                    strokeWidth={1.5}
                  />
                  <div className="absolute bottom-2 left-2 text-[10px] font-bold">
                    Cat {i}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case "ledger":
        return (
          <div className="flex flex-col h-full p-5 pt-12 md:p-6 md:pt-14 space-y-2">
            <div className="text-lg md:text-xl font-bold mb-2 md:mb-4">
              Ledger
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center justify-between p-3 border-b border-black"
              >
                <div className="flex items-center gap-3">
                  {i % 2 === 0 ? (
                    <ArrowDownLeft size={16} />
                  ) : (
                    <ArrowUpRight size={16} />
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs md:text-sm font-bold">
                      Item #{100 + i}
                    </span>
                    <span className="text-[10px]">10:4{i} AM</span>
                  </div>
                </div>
                <span className="font-mono text-xs md:text-sm">
                  {i % 2 === 0 ? "+20" : "-5"}
                </span>
              </motion.div>
            ))}
          </div>
        );
      case "offline":
        return (
          <div className="flex flex-col h-full items-center justify-center p-6 space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-black flex items-center justify-center"
            >
              <WifiOff
                size={32}
                className="md:w-10 md:h-10"
                strokeWidth={1.5}
              />
            </motion.div>
            <div className="text-center space-y-2">
              <div className="font-bold text-base md:text-lg">Offline Mode</div>
              <div className="text-xs max-w-[180px] md:max-w-[200px] mx-auto leading-relaxed">
                Changes stored locally. Sync pending.
              </div>
            </div>
            <div className="w-full bg-black/5 h-1 rounded-full mt-8 overflow-hidden">
              <motion.div
                className="h-full bg-black"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>
        );
      case "data":
        return (
          <div className="flex flex-col h-full p-5 pt-12 md:p-6 md:pt-14 justify-center space-y-4">
            <div className="border border-black p-5 md:p-6 rounded-xl flex items-center justify-between">
              <span className="font-bold text-sm md:text-base">
                Export JSON
              </span>
              <ArrowUpRight size={18} className="md:w-5 md:h-5" />
            </div>
            <div className="bg-black text-white p-5 md:p-6 rounded-xl flex items-center justify-between">
              <span className="font-bold text-sm md:text-base">
                Import Backup
              </span>
              <ArrowDownLeft size={18} className="md:w-5 md:h-5" />
            </div>
            <div className="flex justify-center py-6 md:py-8">
              <FileJson size={40} className="md:w-12 md:h-12" strokeWidth={1} />
            </div>
          </div>
        );
      case "orgs":
        return (
          <div className="flex flex-col h-full p-5 pt-12 md:p-6 md:pt-14 space-y-4">
            <div className="text-lg md:text-xl font-bold mb-2 md:mb-4">
              Organizations
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border border-black rounded-xl bg-black text-white">
                <Users size={18} className="md:w-5 md:h-5" />
                <div className="flex-1 font-bold text-sm md:text-base">
                  Acme Corp
                </div>
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="flex items-center gap-4 p-4 border border-black rounded-xl">
                <Users size={18} className="md:w-5 md:h-5" />
                <div className="flex-1 font-bold text-sm md:text-base">
                  Stark Ind.
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 border border-black rounded-xl">
                <Users size={18} className="md:w-5 md:h-5" />
                <div className="flex-1 font-bold text-sm md:text-base">
                  Wayne Ent.
                </div>
              </div>
            </div>
          </div>
        );
      case "security":
        return (
          <div className="flex flex-col h-full items-center justify-center p-6 space-y-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <ShieldCheck
                size={50}
                className="md:w-16 md:h-16"
                strokeWidth={1}
              />
              <span className="font-bold text-lg md:text-xl">Secured</span>
            </motion.div>
            <div className="w-full border-t border-black"></div>
            <div className="flex gap-4 items-center opacity-50">
              <HardDrive size={18} className="md:w-5 md:h-5" />
              <span className="text-xs md:text-sm">
                Local Encryption AES-256
              </span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      key={feature}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full w-full bg-white"
    >
      {renderContent()}
    </motion.div>
  );
};

export const PhoneMockup: React.FC<PhoneMockupProps> = ({ feature }) => {
  return (
    <motion.div
      className="relative mx-auto w-[260px] h-[520px] sm:w-[300px] sm:h-[600px] md:w-[350px] md:h-[700px] rounded-[35px] md:rounded-[50px] border-[6px] md:border-[8px] border-black bg-black shadow-2xl overflow-hidden"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      whileHover={{
        rotateY: 5,
        rotateX: -5,
        scale: 1.02,
        transition: { duration: 0.4 },
      }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Dynamic Island */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-24 md:h-7 md:w-28 bg-black z-20 rounded-b-xl md:rounded-b-2xl"></div>

      {/* Screen Area */}
      <div className="absolute inset-0.5 bg-white rounded-[29px] md:rounded-[42px] overflow-hidden z-10">
        <AnimatePresence mode="wait">
          <ScreenContent feature={feature} />
        </AnimatePresence>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 md:w-32 h-1 bg-black rounded-full z-30"></div>
      </div>

      {/* Reflections/Gloss */}
      <div className="absolute inset-0 pointer-events-none z-40 rounded-[35px] md:rounded-[50px] ring-1 ring-inset ring-white/10"></div>
    </motion.div>
  );
};
