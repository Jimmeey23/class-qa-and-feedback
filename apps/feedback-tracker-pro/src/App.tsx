import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@project/components/ui/sonner';
import HubPage from './pages/HubPage';
import FormPage from './pages/FormPage';
import ReportPage from './pages/ReportPage';
import ConfigPage from './pages/ConfigPage';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Toaster richColors position="top-center" />
      <Routes>
        <Route path="/" element={<FormPage />} />
        <Route path="/hub" element={<HubPage />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/report/:id" element={<ReportPage />} />
      </Routes>
    </BrowserRouter>
  );
}
