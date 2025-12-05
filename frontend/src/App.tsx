import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import { LandingPage } from './pages/LandingPage';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { ClientDashboard } from './pages/ClientDashboard';
import { FreelancerDashboard } from './pages/FreelancerDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page - no blockchain dependencies */}
        <Route path="/" element={<LandingPage />} />
        
        {/* App routes - wrapped with WalletProvider */}
        <Route path="/app" element={
          <WalletProvider>
            <AppLayout />
          </WalletProvider>
        }>
          <Route index element={<Dashboard />} />
          <Route path="client" element={<ClientDashboard />} />
          <Route path="freelancer" element={<FreelancerDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
