import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, User, Wallet, Menu, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import freighterApi from '@stellar/freighter-api';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/client', label: 'Client', icon: Briefcase },
    { path: '/freelancer', label: 'Freelancer', icon: User },
  ];

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const { isConnected } = await freighterApi.isConnected();
      if (isConnected) {
        const { isAllowed } = await freighterApi.isAllowed();
        if (isAllowed) {
          const { address } = await freighterApi.getAddress();
          setWalletAddress(address);
          setIsWalletConnected(true);
        }
      }
    } catch (err) {
      console.log('Wallet not connected');
    }
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if Freighter is installed
      const { isConnected } = await freighterApi.isConnected();
      
      if (!isConnected) {
        setError('Please install Freighter wallet extension');
        window.open('https://www.freighter.app/', '_blank');
        setIsConnecting(false);
        return;
      }

      // Request permission
      await freighterApi.setAllowed();
      
      // Get address
      const { address } = await freighterApi.getAddress();
      
      if (address) {
        setWalletAddress(address);
        setIsWalletConnected(true);
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress('');
    setIsWalletConnected(false);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">GV</span>
                </div>
                <span className="text-xl font-bold text-white">GigVault</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {error && (
                <span className="text-red-400 text-sm hidden md:inline">{error}</span>
              )}
              {isWalletConnected ? (
                <button
                  onClick={handleDisconnect}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-50"
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wallet className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {isConnecting ? 'Connecting...' : 'Connect Stellar Wallet'}
                  </span>
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-gray-900">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors',
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              © 2024 GigVault. Trustless freelancing powered by blockchain.
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-gray-400">Stellar</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                <span className="text-gray-400">Polkadot</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
