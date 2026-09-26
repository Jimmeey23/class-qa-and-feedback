import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@project/components/ui/sonner';
import { getSettings } from '@/api/client';
import FormPage from './pages/FormPage';
import HubPage from './pages/HubPage';
import ReportPage from './pages/ReportPage';
import ConfigPage from './pages/ConfigPage';

export function applyThemeColor(hsl: string) {
  if (!hsl) return;
  document.documentElement.style.setProperty('--primary', hsl);
  document.documentElement.style.setProperty('--ring', hsl);
  localStorage.setItem('p57_primary', hsl);
}

export default function App() {
  useEffect(() => {
    // Apply cached theme immediately to avoid flash
    const cached = localStorage.getItem('p57_primary');
    if (cached) applyThemeColor(cached);
    // Then fetch latest from DB
    getSettings({}).then(s => {
      if (s.primaryColor) applyThemeColor(s.primaryColor);
    }).catch(() => {});
  }, []);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<FormPage />} />
        <Route path="/hub" element={<HubPage />} />
        <Route path="/report/:id" element={<ReportPage />} />
        <Route path="/config" element={<ConfigPage />} />
      </Routes>
    </BrowserRouter>
  );
}
