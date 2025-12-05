import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import { TypinkProvider, subwallet, talisman, polkadotjs } from 'typink';
import { LandingPage } from './pages/LandingPage';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { ClientDashboard } from './pages/ClientDashboard';
import { FreelancerDashboard } from './pages/FreelancerDashboard';
import { PolkadotTestPage } from './pages/PolkadotTestPage';

// Polkadot network configuration
const POLKADOT_NETWORKS = [
  {
    id: 'paseo',
    name: 'Paseo Testnet',
    rpcUrl: 'wss://testnet-passet-hub.polkadot.io',
    logo: 'https://polkadot.network/favicon.ico',
    providers: ['wss://testnet-passet-hub.polkadot.io'],
    symbol: 'PAS',
    decimals: 10,
  },
];

function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <TypinkProvider
          appName="PolkStellar"
          supportedNetworks={POLKADOT_NETWORKS}
          defaultNetworkId="paseo"
          wallets={[subwallet, talisman, polkadotjs]}
          cacheMetadata={true}
        >
          <Routes>
            {/* Landing page - no blockchain dependencies */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Test page - Polkadot button test (not in navigation) */}
            <Route path="/polkadot-test" element={<PolkadotTestPage />} />
            
            {/* App routes - wrapped with both Stellar and Polkadot providers */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="client" element={<ClientDashboard />} />
              <Route path="freelancer" element={<FreelancerDashboard />} />
            </Route>
          </Routes>
        </TypinkProvider>
      </WalletProvider>
    </BrowserRouter>
  );
}

export default App;
