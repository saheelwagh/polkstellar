import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Star,
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
    amount: bigint | number;
    status: any;
  }>;
  total_funded: bigint | number;
  total_released: bigint | number;
}

// Helper to extract status tag from various formats
// Status can be: "Pending", {Pending: null}, {tag: "Pending"}, or Array like ["Pending"] or [0]
const STATUS_MAP: Record<number, string> = {
  0: 'Pending',
  1: 'Funded',
  2: 'Submitted',
  3: 'Approved',
  4: 'Released',
};

function getStatusTag(status: any): string {
  if (!status) return 'Unknown';
  if (typeof status === 'string') return status;
  
  // Handle array format like [0] or ["Pending"]
  if (Array.isArray(status)) {
    const val = status[0];
    if (typeof val === 'number') return STATUS_MAP[val] || 'Unknown';
    if (typeof val === 'string') return val;
    // Could be nested object
    if (val && typeof val === 'object') {
      const keys = Object.keys(val);
      if (keys.length > 0) return keys[0];
    }
    return 'Unknown';
  }
  
  // Handle {tag: "Pending"} format
  if (status.tag) return status.tag;
  
  // Handle {Pending: null}, {Funded: null} format
  const keys = Object.keys(status);
  if (keys.length > 0) return keys[0];
  
  return 'Unknown';
}

// Helper to calculate total budget from milestones
function getTotalBudget(milestones: Array<{amount: bigint | number}>): number {
  if (!milestones) return 0;
  return milestones.reduce((sum, m) => sum + Number(m.amount || 0), 0);
}

export function FreelancerDashboard() {
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
        
        {!loadingProjects && onChainProjects.map((project) => {
          const totalBudget = getTotalBudget(project.milestones);
          return (
            <div
              key={project.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-green-500/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-400 font-bold">#{project.id}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Escrow Project #{project.id}</h3>
                    <p className="text-gray-400 text-xs">
                      Budget: {totalBudget} stroops • Client: {project.client?.slice(0, 6)}...{project.client?.slice(-4)}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                  On-Chain
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500">Your Earnings:</span>
                  <p className="text-green-400 font-medium">{Number(project.total_released || 0)} stroops</p>
                </div>
                <div>
                  <span className="text-gray-500">Pending:</span>
                  <p className="text-yellow-400 font-medium">{totalBudget - Number(project.total_released || 0)} stroops</p>
                </div>
              </div>
              
              {project.milestones && project.milestones.length > 0 && (
                <div className="pt-4 border-t border-gray-800">
                  <p className="text-gray-500 text-sm mb-2">Milestones:</p>
                  <div className="space-y-2">
                    {project.milestones.map((m, idx) => {
                      const statusTag = getStatusTag(m.status);
                      return (
                        <div key={idx} className="bg-gray-800/50 rounded-lg px-3 py-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 font-medium">Milestone {idx + 1}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-400 text-sm">{String(m.amount)} stroops</span>
                              <span className={cn(
                                'px-2 py-0.5 rounded text-xs font-medium',
                                statusTag === 'Pending' && 'bg-gray-500/20 text-gray-400',
                                statusTag === 'Funded' && 'bg-blue-500/20 text-blue-400',
                                statusTag === 'Submitted' && 'bg-yellow-500/20 text-yellow-400',
                                statusTag === 'Approved' && 'bg-green-500/20 text-green-400',
                                statusTag === 'Released' && 'bg-purple-500/20 text-purple-400',
                              )}>
                                {statusTag}
                              </span>
                            </div>
                          </div>
                          {/* Action buttons based on status */}
                          <div className="flex items-center space-x-2 mt-2">
                            {statusTag === 'Pending' && (
                              <span className="text-xs text-gray-400">⏳ Waiting for client to fund...</span>
                            )}
                            {statusTag === 'Funded' && (
                              <button
                                onClick={() => handleSubmitMilestoneOnChain(project.id, idx)}
                                disabled={txStatus !== null}
                                className="flex-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white text-xs rounded transition-colors"
                              >
                                📤 Submit Work (Mark as Done)
                              </button>
                            )}
                            {statusTag === 'Submitted' && (
                              <span className="text-xs text-yellow-400">⏳ Waiting for client approval...</span>
                            )}
                            {statusTag === 'Released' && (
                              <span className="text-xs text-green-400">✓ Payment received!</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>


    </div>
  );
}
