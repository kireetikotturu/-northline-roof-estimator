import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/ui/Navbar.jsx';
import Footer from '../components/ui/Footer.jsx';
import Hero from '../components/estimator/Hero.jsx';
import StepWizard from '../components/estimator/StepWizard.jsx';
import { fetchPublicConfig } from '../services/api.js';

export default function EstimatorPage() {
  const [business, setBusiness] = useState(null);
  const wizardRef = useRef(null);

  useEffect(() => {
    fetchPublicConfig()
      .then((data) => setBusiness(data.business))
      .catch(() => {});
  }, []);

  const scrollToWizard = () => {
    wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero business={business} onStart={scrollToWizard} />
        <StepWizard wizardRef={wizardRef} />
      </main>
      <Footer business={business} />
    </div>
  );
}
