import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Star,
  ChevronRight,
  Upload,
  ExternalLink,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { cn, formatUSDC } from '../lib/utils';
import { mockProjects, mockFreelancerStats, type Project, type Milestone } from '../lib/mock-data';
import { useWallet } from '../context/WalletContext';
import { getProject, getProjectCount, submitMilestone as submitMilestoneToChain } from '../lib/escrow-client';

// =============================================================================
// BLOCKCHAIN CONNECTION POINTS:
// 
// STELLAR (Soroban) - All operations:
// - getProjectsForFreelancer(): Query escrow contract for assigned projects
// - getEarnings(): Calculate total released funds
// - submitMilestone(): Mark milestone as submitted (work done)
//
// Wallet: Freighter (Stellar) - same wallet for both client and freelancer
// =============================================================================

// Type for on-chain project data
interface OnChainProject {
  id: number;
  client: string;
  freelancer: string;
  milestones: Array<{
    amount: bigint;
    status: { tag: string };
  }>;
  total_funded: bigint;
  total_released: bigint;
}

export function FreelancerDashboard() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<{ projectId: number; milestoneIndex: number } | null>(null);
  
  // On-chain projects
  const [onChainProjects, setOnChainProjects] = useState<OnChainProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Use shared wallet context
  const { isConnected, address } = useWallet();

  // Load on-chain projects
  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const count = await getProjectCount();
      console.log('Freelancer - Project count:', count);
      
      const projects: OnChainProject[] = [];
      for (let i = 1; i <= count; i++) {
        const project = await getProject(i);
        if (project) {
          // Filter to show only projects where current user is freelancer
          // For now, show all projects (demo mode)
          projects.push({ ...project, id: i });
        }
      }
      setOnChainProjects(projects);
      console.log('Freelancer - Loaded projects:', projects);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Load projects on mount and when wallet connects
  useEffect(() => {
    if (isConnected) {
      loadProjects();
    }
  }, [isConnected]);

  const getMilestoneStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'released': return 'bg-green-500/20 text-green-400';
      case 'approved': return 'bg-blue-500/20 text-blue-400';
      case 'submitted': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Handle submitting a milestone on-chain
  const handleSubmitMilestoneOnChain = async (projectId: number, milestoneIndex: number) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    setTxStatus('Submitting milestone...');
    try {
      const result = await submitMilestoneToChain(address, projectId, milestoneIndex);
      
      if (result.success) {
        setTxStatus('✅ Milestone submitted successfully!');
        loadProjects(); // Reload to see updated status
        setTimeout(() => setTxStatus(null), 3000);
      } else {
        setTxStatus(`❌ Error: ${result.error}`);
      }
    } catch (err: any) {
      setTxStatus(`❌ Error: ${err.message}`);
    }
  };

  const handleWithdraw = () => {
    // =============================================================================
    // BLOCKCHAIN CONNECTION POINT - WITHDRAW:
    //
    // Released funds are already in the freelancer's Stellar wallet
    // This button could trigger a transfer to an external account
    // or just show the current balance
    //
    // const balance = await stellarContract.getBalance(freelancerAddress);
    // =============================================================================
    console.log('Withdraw funds');
  };

  const openSubmitModal = (projectId: string, milestone: Milestone) => {
    setSubmitMilestone({ projectId, milestone });
    setShowSubmitModal(true);
  };

  // Filter projects for this freelancer
  const freelancerProjects = mockProjects.filter(p => p.freelancer.includes('FREELANCER'));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Freelancer Dashboard</h1>
          <p className="text-gray-400 mt-1">Track your projects and earnings</p>
        </div>
        <button
          onClick={handleWithdraw}
          className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <DollarSign className="w-4 h-4" />
          <span>Withdraw Funds</span>
        </button>
      </div>

      {/* Wallet Warning */}
      {!isConnected && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-medium">Wallet not connected</p>
            <p className="text-yellow-400/70 text-sm">
              Connect your Freighter wallet to submit work and receive payments.
            </p>
          </div>
        </div>
      )}

      {/* Transaction Status */}
      {txStatus && (
        <div className={cn(
          "p-4 rounded-lg",
          txStatus.startsWith('✅') ? "bg-green-500/10 border border-green-500/30" :
          txStatus.startsWith('❌') ? "bg-red-500/10 border border-red-500/30" :
          "bg-blue-500/10 border border-blue-500/30"
        )}>
          <p className="text-white">{txStatus}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Earned', value: formatUSDC(mockFreelancerStats.totalEarned), icon: DollarSign, color: 'text-green-500' },
          { label: 'Pending Release', value: formatUSDC(mockFreelancerStats.pendingRelease), icon: Clock, color: 'text-yellow-500' },
          { label: 'Active Projects', value: mockFreelancerStats.activeProjects, icon: TrendingUp, color: 'text-blue-500' },
          { label: 'Completed', value: mockFreelancerStats.completedProjects, icon: CheckCircle2, color: 'text-gray-400' },
          { label: 'Rating', value: mockFreelancerStats.reputation.toFixed(1), icon: Star, color: 'text-yellow-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <stat.icon className={cn('w-4 h-4', stat.color)} />
              <span className="text-gray-400 text-sm">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Earnings Chart Placeholder */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Earnings Overview</h2>
        <div className="h-48 flex items-center justify-center border border-dashed border-gray-700 rounded-lg">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500">Earnings chart will appear here</p>
            <p className="text-gray-600 text-sm">Data from Stellar contract</p>
          </div>
        </div>
      </div>

      {/* On-Chain Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">On-Chain Projects</h2>
          <button
            onClick={loadProjects}
            disabled={loadingProjects}
            className="flex items-center space-x-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4', loadingProjects && 'animate-spin')} />
            <span>Refresh</span>
          </button>
        </div>
        
        {loadingProjects && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Loading projects from blockchain...</p>
          </div>
        )}
        
        {!loadingProjects && isConnected && onChainProjects.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400">No on-chain projects yet.</p>
            <p className="text-gray-500 text-sm mt-1">Projects assigned to you will appear here.</p>
          </div>
        )}
        
        {!loadingProjects && onChainProjects.map((project) => (
          <div
            key={project.id}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-blue-500/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-400 font-bold">#{project.id}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Project #{project.id}</h3>
                  <p className="text-gray-400 text-xs font-mono">
                    Client: {project.client?.slice(0, 8)}...{project.client?.slice(-4)}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                On-Chain
              </span>
            </div>
            
            {project.milestones && project.milestones.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-gray-500 text-sm mb-2">Milestones:</p>
                <div className="space-y-2">
                  {project.milestones.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                      <span className="text-gray-300 text-sm">Milestone {idx + 1}</span>
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-400 text-sm">{String(m.amount)} stroops</span>
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs',
                          m.status?.tag === 'Pending' && 'bg-gray-500/20 text-gray-400',
                          m.status?.tag === 'Funded' && 'bg-blue-500/20 text-blue-400',
                          m.status?.tag === 'Submitted' && 'bg-yellow-500/20 text-yellow-400',
                          m.status?.tag === 'Approved' && 'bg-green-500/20 text-green-400',
                          m.status?.tag === 'Released' && 'bg-purple-500/20 text-purple-400',
                        )}>
                          {m.status?.tag || 'Unknown'}
                        </span>
                        {/* Submit button for funded milestones */}
                        {m.status?.tag === 'Funded' && (
                          <button
                            onClick={() => handleSubmitMilestoneOnChain(project.id, idx)}
                            className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors"
                          >
                            Submit Work
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mock Projects (Demo) */}
      <div className="space-y-4 opacity-50">
        <h2 className="text-xl font-semibold text-white">Demo Projects (Mock Data)</h2>
        
        {freelancerProjects.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400">No active projects yet.</p>
            <p className="text-gray-500 text-sm mt-1">Projects assigned to you will appear here.</p>
          </div>
        ) : (
          freelancerProjects.map((project) => (
            <div
              key={project.id}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors"
            >
              {/* Project Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setSelectedProject(selectedProject?.id === project.id ? null : project)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                    <p className="text-gray-400 text-sm">Client: {project.client}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-white font-medium">{formatUSDC(project.totalBudget)}</p>
                      <p className="text-gray-400 text-sm">
                        {formatUSDC(project.releasedAmount)} earned
                      </p>
                    </div>
                    <ChevronRight className={cn(
                      'w-5 h-5 text-gray-400 transition-transform',
                      selectedProject?.id === project.id && 'rotate-90'
                    )} />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Milestones Completed</span>
                    <span className="text-white">
                      {project.milestones.filter(m => m.status === 'released').length} / {project.milestones.length}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all"
                      style={{ 
                        width: `${(project.milestones.filter(m => m.status === 'released').length / project.milestones.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Expanded Milestones */}
              {selectedProject?.id === project.id && (
                <div className="border-t border-gray-800 p-4 bg-gray-950/50">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Milestones</h4>
                  <div className="space-y-3">
                    {project.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-800"
                      >
                        <div className="flex items-center space-x-3">
                          <span className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                            getMilestoneStatusColor(milestone.status)
                          )}>
                            {milestone.id}
                          </span>
                          <div>
                            <p className="text-white font-medium">{milestone.title}</p>
                            <p className="text-gray-400 text-sm">{formatUSDC(milestone.amount)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {milestone.status === 'pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openSubmitModal(project.id, milestone);
                              }}
                              className="inline-flex items-center space-x-1 bg-pink-600 hover:bg-pink-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                            >
                              <Upload className="w-4 h-4" />
                              <span>Submit Work</span>
                            </button>
                          )}
                          {milestone.status === 'submitted' && (
                            <span className="text-yellow-400 text-sm flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>Awaiting Approval</span>
                            </span>
                          )}
                          {milestone.status === 'released' && (
                            <span className="text-green-400 text-sm flex items-center space-x-1">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Paid</span>
                            </span>
                          )}
                          {milestone.deliverableHash && (
                            <a
                              href={`https://ipfs.io/ipfs/${milestone.deliverableHash.replace('ipfs://', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-400 hover:text-pink-300"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chain indicators */}
                  <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1 text-blue-400">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>Payments on Stellar</span>
                      </span>
                      <span className="flex items-center space-x-1 text-pink-400">
                        <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                        <span>Submissions on Polkadot</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Submit Deliverable Modal */}
      {showSubmitModal && submitMilestone && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Submit Deliverable</h2>
              <p className="text-gray-400 text-sm mt-1">
                Milestone: {submitMilestone.milestone.title}
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deliverable Link or IPFS Hash
                </label>
                <input
                  type="text"
                  placeholder="ipfs://Qm... or https://..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 font-mono text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Any additional context for the client..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>

              {/* Chain info */}
              <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3 text-sm">
                <p className="text-pink-400">
                  <span className="font-medium">📋 Polkadot:</span> Your submission will be recorded on-chain as immutable proof of delivery.
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-800 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setSubmitMilestone(null);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitDeliverable(
                  submitMilestone.projectId,
                  submitMilestone.milestone.id,
                  'ipfs://QmExample...'
                )}
                className="inline-flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Submit to Polkadot</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
