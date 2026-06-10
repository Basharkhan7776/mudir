"use client";
import React from "react";
import { motion, Variants } from "framer-motion";
import { Github, Apple, Play, Download } from "lucide-react";
import { PhoneMockup } from "./PhoneMockup";

export const Hero: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="h-screen w-full snap-center flex flex-col md:flex-row items-center justify-center relative overflow-hidden bg-white px-6">
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center h-full pt-20 md:pt-0">
        {/* Left: Text Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center md:items-start text-center md:text-left z-10 order-2 md:order-1 pb-10 md:pb-0"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-8xl font-bold tracking-tighter leading-none mb-4 md:mb-6"
          >
            Mudir<span className="text-black">.</span>
            <br />
            <span className="text-3xl md:text-6xl font-normal block mt-2">
              Inventory Mastered.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base md:text-xl font-light max-w-md mb-8 md:mb-10 leading-relaxed"
          >
            Offline-first resource management for the modern professional.
            Minimalist. Secure. Yours.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-3 md:gap-4 justify-center md:justify-start"
          >
            {/* <button className="group flex items-center gap-2 md:gap-3 px-5 py-2 md:px-6 md:py-3 border border-black rounded-full hover:bg-black hover:text-white transition-all duration-300">
              <Apple
                size={18}
                className="md:w-5 md:h-5 group-hover:fill-white transition-colors"
              />
              <span className="font-medium text-sm md:text-base">
                App Store
              </span>
            </button>
            <button className="group flex items-center gap-2 md:gap-3 px-5 py-2 md:px-6 md:py-3 border border-black rounded-full hover:bg-black hover:text-white transition-all duration-300">
              <Play
                size={18}
                className="md:w-5 md:h-5 group-hover:fill-white transition-colors"
              />
              <span className="font-medium text-sm md:text-base">
                Google Play
              </span>
            </button> */}
            <a href="/Mudir-beta.apk" download>
              <button className="group flex items-center gap-2 md:gap-3 px-5 py-2 md:px-6 md:py-3 border border-black rounded-full hover:bg-black hover:text-white transition-all duration-300">
                <Download
                  size={18}
                  className="md:w-5 md:h-5 group-hover:fill-white transition-colors"
                />
                <span className="font-medium text-sm md:text-base">
                  Download
                </span>
              </button>
            </a>
            <a
              href="https://github.com/basharkhan7776/mudir"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="group flex items-center gap-2 md:gap-3 px-5 py-2 md:px-6 md:py-3 border border-black rounded-full hover:bg-black hover:text-white transition-all duration-300">
                <Github size={18} className="md:w-5 md:h-5" />
                <span className="font-medium text-sm md:text-base">GitHub</span>
              </button>
            </a>
          </motion.div>
        </motion.div>

        {/* Right: Phone Visual */}
        <div className="flex items-center justify-center order-1 md:order-2 w-full">
          <PhoneMockup feature="hero" />
        </div>
      </div>
    </section>
  );
};
