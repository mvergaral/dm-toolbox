import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { DbProvider } from './context/DbContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmationProvider } from './context/ConfirmationContext';

// Vistas
import Dashboard from './views/Dashboard';
import Campaigns from './views/Campaigns';
import CampaignDetail from './views/CampaignDetail';
import CombatTracker from './views/CombatTracker';
import CombatActive from './views/CombatActive';
import Characters from './views/Characters';
import Npcs from './views/Npcs';
import Monsters from './views/Monsters';
import Sessions from './views/Sessions';
import SessionDetail from './views/SessionDetail';
import MapView from './views/MapView';
import Settings from './views/Settings';
import RollTables from './views/RollTables';

function App() {
  return (
    <DbProvider>
      <SettingsProvider>
        <ToastProvider>
          <ConfirmationProvider>
            <HashRouter>
              <MainLayout>
                <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/campaign/:id" element={<CampaignDetail />} />
                <Route path="/campaign/:id/combat" element={<CombatTracker />} />
                <Route path="/campaign/:id/combat/:encounterId" element={<CombatActive />} />
                <Route path="/campaign/:id/characters" element={<Characters />} />
                <Route path="/campaign/:id/npcs" element={<Npcs />} />
                <Route path="/campaign/:id/monsters" element={<Monsters />} />
                <Route path="/campaign/:id/sessions" element={<Sessions />} />
                <Route path="/campaign/:id/sessions/:sessionId" element={<SessionDetail />} />
                <Route path="/campaign/:id/roll-tables" element={<RollTables />} />
                <Route path="/combat" element={<CombatTracker />} />
                <Route path="/maps" element={<MapView />} />
                <Route path="/tools/roll-tables" element={<RollTables />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
              </MainLayout>
            </HashRouter>
          </ConfirmationProvider>
        </ToastProvider>
      </SettingsProvider>
    </DbProvider>
  );
}

export default App;
