import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { QueueProvider } from './context/QueueContext';
import { TopBar } from './components/TopBar';
import { HomeScreen } from './screens/HomeScreen';
import { JoinScreen } from './screens/JoinScreen';
import { StatusScreen } from './screens/StatusScreen';
import { ReceptionScreen } from './screens/ReceptionScreen';
import { BarberScreen } from './screens/BarberScreen';
import { DisplayScreen } from './screens/DisplayScreen';
import { AdminScreen } from './screens/AdminScreen';

const AppLayout = () => {
  const location = useLocation();
  const isTvDisplay = location.pathname === '/display';

  return (
    <div className="min-h-screen bg-[#1F2937] text-gray-100 flex flex-col font-sans selection:bg-[#D4A017] selection:text-gray-950">
      {/* TopBar on non-TV screens, or as a collapsible switcher on TV display */}
      {!isTvDisplay && <TopBar />}
      {isTvDisplay && (
        <div className="bg-[#111827] px-4 py-2 border-b border-gray-800 flex items-center justify-between text-xs">
          <span className="text-gray-400">TV Display Mode</span>
          <a
            href="/"
            className="text-[#D4A017] hover:underline font-semibold"
          >
            ← Exit to Main App / Role Switcher
          </a>
        </div>
      )}

      {/* Main Screen Routes */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/join" element={<JoinScreen />} />
          <Route path="/status/:id" element={<StatusScreen />} />
          <Route path="/reception" element={<ReceptionScreen />} />
          <Route path="/barber" element={<BarberScreen />} />
          <Route path="/barber/:name" element={<BarberScreen />} />
          <Route path="/display" element={<DisplayScreen />} />
          <Route path="/admin" element={<AdminScreen />} />
          <Route path="*" element={<HomeScreen />} />
        </Routes>
      </main>
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <QueueProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </QueueProvider>
    </LanguageProvider>
  );
}

export default App;
