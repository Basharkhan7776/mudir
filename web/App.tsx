import React from 'react';
import { Hero } from './components/Hero';
import { FeatureShowcase } from './components/FeatureShowcase';
import { Contact } from './components/Contact';

const App: React.FC = () => {
  return (
    <main className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar bg-white text-black selection:bg-black selection:text-white">
      <Hero />
      <FeatureShowcase />
      <Contact />
    </main>
  );
};

export default App;