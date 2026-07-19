import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LoadingScreen from './components/LoadingScreen';
import LandingPage from './pages/LandingPage';
import TopicPage from './pages/TopicPage';
import NotFound from './pages/NotFound';
import PageTransition from './components/PageTransition';
import APITest from './pages/APITest';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={
              <PageTransition>
                <LandingPage />
              </PageTransition>
            } />
            <Route path="/topic/:topicId" element={
              <PageTransition>
                <TopicPage />
              </PageTransition>
            } />
            <Route path="/test" element={<APITest />} />
            <Route path="*" element={
              <PageTransition>
                <NotFound />
              </PageTransition>
            } />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
      {/* Retained the Loading Screen Overlay for the premium aesthetic! */}
      {isLoading && (
        <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
      )}
    </>
  );
}

export default App;
