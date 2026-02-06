import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout';
import { DashboardPage, AlertsPage, TeamsPage, SettingsPage, DemoPage } from './pages';
import { TamboProvider } from '@tambo-ai/react';
import { dashboardComponents } from './lib/tambo-components';

function App() {
  return (
    <BrowserRouter>
      {/* Tambo Provider for Generative UI */}
      <TamboProvider 
        components={dashboardComponents} 
        apiKey={import.meta.env.VITE_TAMBO_API_KEY}
      >
        <MainLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/demo" element={<DemoPage />} />
          </Routes>
        </MainLayout>
      </TamboProvider>
    </BrowserRouter>
  );
}

export default App;
