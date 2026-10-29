import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { YoloMetrics } from './components/YoloMetrics';
import { TechStack } from './components/TechStack';
import { Architecture } from './components/Architecture';
import { DocsHub } from './components/DocsHub';
import { DownloadSection } from './components/DownloadSection';
import { Footer } from './components/Footer';
import { DownloadApkModal } from './components/DownloadApkModal';
import { BackToTop } from './components/BackToTop';

export const App: React.FC = () => {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B120D] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-hud-green selection:text-black transition-colors duration-200">
      {/* Navigation Bar */}
      <Navbar onOpenDownloadModal={() => setDownloadModalOpen(true)} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero with live animated phone scanner HUD */}
        <Hero
          onOpenDownloadModal={() => setDownloadModalOpen(true)}
          onExploreFeatures={scrollToFeatures}
        />

        {/* Core App Features Grid */}
        <Features />

        {/* YOLO Training & Validation Results Showcase */}
        <YoloMetrics />

        {/* Dedicated Full-Stack Technology Stack Section */}
        <TechStack />

        {/* System Architecture & Interactive API Contract Explorer */}
        <Architecture />

        {/* Comprehensive Documentation & Engineering Hub */}
        <DocsHub />

        {/* Dedicated APK Download & Mobile Installation Portal */}
        <DownloadSection />
      </main>

      {/* Footer */}
      <Footer onOpenDownloadModal={() => setDownloadModalOpen(true)} />

      {/* APK Quick Download Modal */}
      <DownloadApkModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
      />

      {/* Floating Back to Top Button */}
      <BackToTop />
    </div>
  );
};

export default App;
