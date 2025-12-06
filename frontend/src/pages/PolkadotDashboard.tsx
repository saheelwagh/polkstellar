// =============================================================================
// POLKADOT DASHBOARD - Light Theme
// =============================================================================
// Separate from Stellar dashboard to avoid breaking existing functionality

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderPlus, 
  FileCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Wallet,
  ArrowLeft,
} from 'lucide-react';
import { useTypink } from 'typink';
import { usePolkadotContracts } from '../hooks/usePolkadotContracts';
import { PolkadotWallet } from '../components/PolkadotWallet';
import type { PolkadotProject, CreateProjectForm } from '../types/polkadot';

export function PolkadotDashboard() {
  // Get wallet state directly from useTypink for reactivity
  const { connectedAccount, connectedWalletIds, network, wallets } = useTypink();
  
  // Derive connection state directly for proper reactivity
  const isPolkadotConnected = connectedWalletIds.length > 0 && !!connectedAccount;
  const walletAddress = connectedAccount?.address || null;
  
  // Debug logging - runs on every state change
  useEffect(() => {
    console.log('=== POLKADOT CONNECTION DEBUG ===');
    console.log('connectedWalletIds:', connectedWalletIds);
    console.log('connectedAccount:', connectedAccount);
    console.log('connectedAccount?.address:', connectedAccount?.address);
    console.log('network:', network);
    console.log('wallets:', wallets.map(w => ({ id: w.id, name: w.name, installed: w.installed })));
    console.log('isPolkadotConnected:', isPolkadotConnected);
    console.log('walletAddress:', walletAddress);
    console.log('================================');
  }, [connectedWalletIds, connectedAccount, network, wallets, isPolkadotConnected, walletAddress]);
  
  const {
    isLoading,
    txState,
    resetTxState,
    registerProject,
    getMyProjects,
  } = usePolkadotContracts();

  const [projects, setProjects] = useState<PolkadotProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateProjectForm>({
    title: '',
    description: '',
    freelancerAddress: '',
    budget: '',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    milestoneCount: 3,
  });

  useEffect(() => {
    if (isPolkadotConnected) {
      loadProjects();
    }
  }, [isPolkadotConnected]);

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const myProjects = await getMyProjects();
      setProjects(myProjects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await registerProject(formData);
    if (result.success) {
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        freelancerAddress: '',
        budget: '',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        milestoneCount: 3,
      });
      loadProjects();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Created': return 'bg-blue-100 text-blue-800';
      case 'InProgress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Light Theme Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/app" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Stellar</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Polkadot</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Show connected address */}
              {isPolkadotConnected && walletAddress && (
                <div className="hidden sm:flex items-center space-x-2 bg-purple-100 px-3 py-1.5 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-purple-700 font-mono">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>
              )}
              <PolkadotWallet />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Connection Info - Always Visible */}
        <div className="mb-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Connection Debug Info</span>
          </h3>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-blue-900">Status:</span>
              <span className={isPolkadotConnected ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                {isPolkadotConnected ? '✓ CONNECTED' : '✗ NOT CONNECTED'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-blue-900">Wallet IDs:</span>
              <span className="text-gray-700">{connectedWalletIds.length > 0 ? connectedWalletIds.join(', ') : 'None'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-blue-900">Address:</span>
              <span className="text-gray-700 break-all">{walletAddress || 'Not connected'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-blue-900">Network:</span>
              <span className="text-gray-700">{network?.name || 'Unknown'} ({network?.id || 'N/A'})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-blue-900">Account Object:</span>
              <span className="text-gray-700">{connectedAccount ? 'Present' : 'Null'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-blue-900">Available Wallets:</span>
              <span className="text-gray-700">{wallets.length} detected</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-xs text-blue-700 mb-2">
              <strong>Test:</strong> Check console when you click the "Polkadot" button in the header
            </p>
            <PolkadotWallet />
          </div>
        </div>

        {/* Connected Status Banner */}
        {isPolkadotConnected && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-green-700 font-medium">
                Connected to Polkadot via SubWallet
              </span>
              <span className="text-green-600 text-sm font-mono">
                ({walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)})
              </span>
            </div>
          </div>
        )}

        {/* Connection Banner */}
        {!isPolkadotConnected && (
          <div className="mb-8 bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
            <Wallet className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Polkadot Wallet</h2>
            <p className="text-gray-600 mb-4">Connect SubWallet to manage your Polkadot projects.</p>
            <PolkadotWallet />
          </div>
        )}

        {/* Transaction Status */}
        {txState.status !== 'idle' && (
          <div className={`mb-6 p-4 rounded-lg border ${
            txState.status === 'error' ? 'bg-red-50 border-red-200' : 
            txState.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {txState.status === 'signing' && <Clock className="w-5 h-5 text-blue-500 animate-pulse" />}
                {(txState.status === 'broadcasting' || txState.status === 'confirming') && <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />}
                {txState.status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                {txState.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                <span className={`font-medium ${
                  txState.status === 'error' ? 'text-red-700' : 
                  txState.status === 'success' ? 'text-green-700' : 'text-blue-700'
                }`}>
                  {txState.status === 'signing' && 'Please sign the transaction...'}
                  {txState.status === 'broadcasting' && 'Broadcasting...'}
                  {txState.status === 'confirming' && 'Confirming...'}
                  {txState.status === 'success' && 'Transaction successful!'}
                  {txState.status === 'error' && (txState.error || 'Transaction failed')}
                </span>
              </div>
              {(txState.status === 'success' || txState.status === 'error') && (
                <button onClick={resetTxState} className="text-gray-500 hover:text-gray-700">✕</button>
              )}
            </div>
          </div>
        )}

        {isPolkadotConnected && (
          <>
            {/* Stats - Enhanced with hover effects and animations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Projects</p>
                    <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FolderPlus className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">In Progress</p>
                    <p className="text-3xl font-bold text-gray-900">{projects.filter(p => p.status === 'InProgress').length}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-gray-900">{projects.filter(p => p.status === 'Completed').length}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={loadProjects} 
                  disabled={isLoadingProjects} 
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingProjects ? 'animate-spin' : ''}`} />
                  <span className="font-medium">Refresh</span>
                </button>
                <button 
                  onClick={() => setShowCreateForm(true)} 
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span className="font-semibold">New Project</span>
                </button>
              </div>
            </div>

            {/* Create Form - Enhanced with animations */}
            {showCreateForm && (
              <div className="mb-8 bg-white rounded-xl border-2 border-purple-200 p-6 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Create New Project</h3>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FolderPlus className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Project Title *</label>
                      <input 
                        type="text" 
                        value={formData.title} 
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                        placeholder="Enter project name"
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Freelancer Address *</label>
                      <input 
                        type="text" 
                        value={formData.freelancerAddress} 
                        onChange={(e) => setFormData({ ...formData, freelancerAddress: e.target.value })} 
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors font-mono text-sm" 
                        placeholder="5... (Polkadot address)" 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                    <textarea 
                      value={formData.description} 
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                      rows={3} 
                      placeholder="Describe your project..."
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Budget (DOT) *</label>
                      <input 
                        type="number" 
                        value={formData.budget} 
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })} 
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                        min="0" 
                        step="0.1" 
                        placeholder="100.00"
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Deadline *</label>
                      <input 
                        type="date" 
                        value={formData.deadline.toISOString().split('T')[0]} 
                        onChange={(e) => setFormData({ ...formData, deadline: new Date(e.target.value) })} 
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Milestones *</label>
                      <input 
                        type="number" 
                        value={formData.milestoneCount} 
                        onChange={(e) => setFormData({ ...formData, milestoneCount: parseInt(e.target.value) })} 
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                        min="1" 
                        max="10" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                    <button 
                      type="button" 
                      onClick={() => setShowCreateForm(false)} 
                      className="px-5 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isLoading} 
                      className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-purple-400 disabled:to-purple-400 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
                      <span>{isLoading ? 'Creating...' : 'Create Project'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Projects List */}
            {isLoadingProjects ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <FolderPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
                <p className="text-gray-600 mb-4">Create your first project to get started.</p>
                <button onClick={() => setShowCreateForm(true)} className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                  <FolderPlus className="w-4 h-4" />
                  <span>Create Project</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div 
                    key={project.projectId} 
                    className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2 text-purple-600">
                            <FileCheck className="w-4 h-4" />
                            <span className="font-medium">{project.milestoneCount} milestones</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">Due {new Date(project.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Link 
                        to={`/polkadot/project/${project.projectId}`} 
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 hover:text-purple-700 rounded-lg font-semibold transition-all duration-200 group"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Info Banner - Enhanced */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 shadow-md">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <ExternalLink className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-purple-900 mb-2">Dual-Chain Architecture</h3>
              <p className="text-purple-700 leading-relaxed mb-4">
                <strong>Polkadot:</strong> Stores project metadata, deliverables, and milestone tracking<br/>
                <strong>Stellar:</strong> Handles financial transactions, escrow, and payments
              </p>
              <Link 
                to="/app" 
                className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go to Stellar Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-gray-500 text-sm text-center">Polkadot Dashboard - Project Metadata & Deliverables</p>
        </div>
      </footer>
    </div>
  );
}
