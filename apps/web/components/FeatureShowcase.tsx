import React from 'react';
import { motion } from 'framer-motion';
import { PhoneMockup } from './PhoneMockup';

interface FeatureFrameProps {
  title: string;
  description: string;
  featureId: string;
  index: number;
}

const features = [
  {
    id: 'collections',
    title: 'Dynamic Collections',
    description: 'Mudir adapts to you. Build custom inventory structures and define parameters instantly without complex setups.',
  },
  {
    id: 'ledger',
    title: 'Intuitive Ledger',
    description: 'Track every movement. Credits, debits, and remarks displayed in a clean, chronological timeline for total clarity.',
  },
  {
    id: 'offline',
    title: 'Offline-First Core',
    description: 'No internet? No problem. Mudir stores your data locally on your device, ensuring it is always accessible at speed.',
  },
  {
    id: 'data',
    title: 'Total Data Ownership',
    description: 'Your data is yours. Export and Import your entire Mudir database via simple JSON files at any time.',
  },
  {
    id: 'orgs',
    title: 'Multi-Org Support',
    description: 'Seamlessly manage distinct suppliers, clients, or personal projects within a single, unified app environment.',
  },
  {
    id: 'security',
    title: 'Zero Cloud Risk',
    description: 'Enterprise-grade security on your local hardware. No servers, no leaks, just your business in your pocket.',
  },
];

const FeatureFrame: React.FC<FeatureFrameProps> = ({ title, description, featureId, index }) => {
  const isEven = index % 2 !== 0; // Alternating layout

  return (
    <section className="h-screen w-full snap-center bg-white flex items-center justify-center px-6 overflow-hidden relative">
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 items-center">
        
        {/* Text Side */}
        <motion.div 
            initial={{ opacity: 0, x: isEven ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: false, amount: 0.5 }}
            className={`flex flex-col space-y-4 md:space-y-6 z-10 ${isEven ? 'md:order-2' : 'md:order-1'}`}
        >
          <div className="text-xs md:text-sm font-bold tracking-widest uppercase border-b border-black w-fit pb-1">
            0{index + 1}
          </div>
          <h2 className="text-4xl md:text-7xl font-bold tracking-tight">{title}</h2>
          <p className="text-base md:text-xl font-light leading-relaxed max-w-lg">
            {description}
          </p>
        </motion.div>

        {/* Visual Side */}
        <motion.div 
             className={`flex justify-center items-center ${isEven ? 'md:order-1' : 'md:order-2'}`}
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8 }}
             viewport={{ once: false, amount: 0.5 }}
        >
          <PhoneMockup feature={featureId} />
        </motion.div>
      </div>
    </section>
  );
};

export const FeatureShowcase: React.FC = () => {
  return (
    <>
      {features.map((feature, idx) => (
        <FeatureFrame
          key={feature.id}
          index={idx}
          featureId={feature.id}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </>
  );
};