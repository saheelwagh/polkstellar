import { Wallet } from 'lucide-react';

export function PolkadotWallet() {
  // Fallback button for Polkadot wallet connection
  // Note: Full typeink integration will be added once wallet detection is working
  
  const handleConnectPolkadot = () => {
    console.log('Polkadot wallet connection initiated');
    // TODO: Implement typeink wallet connection
  };

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={handleConnectPolkadot}
        className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white transition-all text-base shadow-lg hover:shadow-purple-500/50 border border-purple-400/50"
        title="Connect Polkadot Wallet (SubWallet/Talisman/PolkadotJS)"
      >
        <Wallet className="w-5 h-5" />
        <span>Connect Polkadot Wallet</span>
      </button>
    </div>
  );
}
