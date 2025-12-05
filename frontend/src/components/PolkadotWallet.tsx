import { Wallet, Loader2, LogOut } from 'lucide-react';
import { useTypink } from 'typink';
import { useState, useEffect } from 'react';

export function PolkadotWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    wallets,
    connectedWalletIds,
    connectedAccount,
    connectWallet,
    disconnect,
  } = useTypink();

  const isConnected = connectedWalletIds.length > 0;

  // Debug: Log available wallets
  useEffect(() => {
    if (wallets.length > 0) {
      console.log('Available wallets:', wallets.map((w) => ({ id: w.id, name: w.name, installed: w.installed })));
    }
  }, [wallets]);

  // Find SubWallet in available wallets (try multiple IDs)
  const subWallet = wallets.find((w) => 
    w.id === 'subwallet' || 
    w.id === 'SubWallet' || 
    w.name?.toLowerCase().includes('subwallet')
  );

  const handleConnectSubWallet = async () => {
    if (!subWallet) {
      setError('SubWallet not detected. Please install SubWallet extension.');
      return;
    }

    if (!subWallet.installed) {
      setError('SubWallet is not installed. Please install it from the official store.');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      console.log('Connecting to SubWallet...');
      await connectWallet(subWallet.id);
      console.log('Successfully connected to SubWallet');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to SubWallet';
      setError(errorMessage);
      console.error('SubWallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setError(null);
      console.log('Disconnecting from Polkadot wallet...');
      await disconnect();
      console.log('Successfully disconnected');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect';
      setError(errorMessage);
      console.error('Disconnect error:', err);
    }
  };

  return (
    <div className="flex items-center">
      {isConnected && connectedAccount ? (
        <button
          onClick={handleDisconnect}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white transition-all text-sm"
          title="Disconnect Polkadot Wallet"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="hidden sm:inline">
            {connectedAccount.address.slice(0, 4)}...{connectedAccount.address.slice(-4)}
          </span>
          <span className="sm:hidden">Polkadot</span>
          <LogOut className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={handleConnectSubWallet}
          disabled={isConnecting || !subWallet?.installed}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-purple-600/50 disabled:to-purple-700/50 text-white transition-all text-sm disabled:cursor-not-allowed"
          title={
            !subWallet?.installed
              ? 'SubWallet not detected. Please install SubWallet extension.'
              : 'Connect SubWallet'
          }
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">
                {!subWallet?.installed ? 'SubWallet' : 'Polkadot'}
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
