/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { TreatmentsSection } from './components/TreatmentsSection';
import { QuizSection } from './components/QuizSection';
import { BookingSection } from './components/BookingSection';
import { OpeningHoursSection } from './components/OpeningHoursSection';
import { GallerySection } from './components/GallerySection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactLocationSection } from './components/ContactLocationSection';
import { Footer } from './components/Footer';
import { FloatingActions } from './components/FloatingActions';
import { AdminModal } from './components/AdminModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { QuizModal } from './components/QuizModal';
import { PrivacyNoticeModal } from './components/PrivacyNoticeModal';

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<'bookings' | 'google-sheets' | 'quiz-leads' | 'block-slots'>('bookings');
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [bookingTreatmentId, setBookingTreatmentId] = useState<string | undefined>(undefined);
  const [bookingDurationMinutes, setBookingDurationMinutes] = useState<number | undefined>(undefined);

  const handleOpenAdmin = (tab: 'bookings' | 'google-sheets' | 'quiz-leads' | 'block-slots' = 'bookings') => {
    if (tab === 'google-sheets') {
      setIsGoogleSheetsOpen(true);
      return;
    }
    setAdminTab(tab);
    setIsAdminOpen(true);
  };

  const scrollToBooking = () => {
    const el = document.getElementById('booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTreatments = () => {
    const el = document.getElementById('treatments');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToQuiz = () => {
    const el = document.getElementById('quiz');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectTreatment = (treatmentId: string, durationMinutes?: number) => {
    setBookingTreatmentId(treatmentId);
    setBookingDurationMinutes(durationMinutes);
    setIsQuizModalOpen(false);
    scrollToBooking();
  };

  // Friendly auto-popup/slide-in after 20 seconds OR 50% scroll
  // Must not reappear once dismissed or completed
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isDismissed = localStorage.getItem('nthabi_quiz_dismissed');
    const isCompleted = localStorage.getItem('nthabi_quiz_completed');

    if (isDismissed === 'true' || isCompleted === 'true') {
      return;
    }

    let hasTriggered = false;

    const triggerModal = () => {
      if (!hasTriggered) {
        hasTriggered = true;
        setIsQuizModalOpen(true);
      }
    };

    // 1. Timer: 20 seconds
    const timer = setTimeout(() => {
      triggerModal();
    }, 20000);

    // 2. Scroll: 50% of the page
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0 && scrollY / totalHeight >= 0.5) {
        triggerModal();
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Open Google Sheets modal if #sheets or ?sheets in URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkHash = () => {
      if (window.location.hash === '#sheets' || window.location.search.includes('sheets')) {
        setIsGoogleSheetsOpen(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const handleDismissQuizModal = () => {
    setIsQuizModalOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nthabi_quiz_dismissed', 'true');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#24211E] selection:bg-[#E8D5CE] selection:text-[#1C2E24] flex flex-col font-sans">
      {/* Sticky Header */}
      <Navbar
        onOpenBooking={scrollToBooking}
        onOpenAdmin={handleOpenAdmin}
        onOpenQuiz={() => setIsQuizModalOpen(true)}
        onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        <HeroSection
          onBookNow={scrollToBooking}
          onViewTreatments={scrollToTreatments}
        />

        <AboutSection />

        <TreatmentsSection
          onSelectTreatment={handleSelectTreatment}
        />

        {/* Gamified "Find Your Perfect Treatment" Quiz Section */}
        <QuizSection
          onBookingSelect={handleSelectTreatment}
          onOpenPrivacyNotice={() => setIsPrivacyOpen(true)}
        />

        <BookingSection
          initialTreatmentId={bookingTreatmentId}
          initialDurationMinutes={bookingDurationMinutes}
        />

        <OpeningHoursSection />

        <GallerySection />

        <TestimonialsSection />

        <ContactLocationSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenAdmin={handleOpenAdmin}
        onBookNow={scrollToBooking}
        onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
      />

      {/* Persistent Floating Controls (Mobile Book bar + WhatsApp button) */}
      <FloatingActions onBookNow={scrollToBooking} />

      {/* Pop-up / Slide-in Quiz Modal */}
      <QuizModal
        isOpen={isQuizModalOpen}
        onClose={handleDismissQuizModal}
        onBookingSelect={handleSelectTreatment}
        onOpenPrivacyNotice={() => setIsPrivacyOpen(true)}
      />

      {/* POPIA Privacy Notice Modal */}
      <PrivacyNoticeModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Dedicated Google Sheets Live Sync Modal (No Password Required) */}
      <GoogleSheetsModal
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
      />

      {/* Password-protected Admin Portal Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        initialTab={adminTab}
      />
    </div>
  );
}
