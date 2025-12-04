import { useState } from 'react';
import { 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Star,
  ChevronRight,
  Upload,
  ExternalLink,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { cn, formatUSDC } from '../lib/utils';
import { mockProjects, mockFreelancerStats, type Project, type Milestone } from '../lib/mock-data';

// =============================================================================
// BLOCKCHAIN CONNECTION POINTS:
// 
// STELLAR (Soroban) - Read operations:
// - getProjectsForFreelancer(): Query escrow contract for assigned projects
// - getEarnings(): Calculate total released funds
// - getPendingAmount(): Sum of approved but unreleased milestones
//
// POLKADOT (Ink!) - Write operations:
// - submitDeliverable(): Store deliverable hash (IPFS/Arweave link)
// - getDeliverables(): Fetch submitted work proofs
//
// Wallet connections needed:
// - Freighter (Stellar): For viewing balances and receiving funds
// - Polkadot.js (Polkadot): For signing deliverable submissions
// =============================================================================

export function FreelancerDashboard() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitMilestone, setSubmitMilestone] = useState<{ projectId: string; milestone: Milestone } | null>(null);

  // TODO: Replace with actual wallet connection state
  const isWalletConnected = false;

  const getMilestoneStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'released': return 'bg-green-500/20 text-green-400';
      case 'approved': return 'bg-blue-500/20 text-blue-400';
      case 'submitted': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleSubmitDeliverable = (projectId: string, milestoneId: number, deliverableHash: string) => {
    // =============================================================================
    // BLOCKCHAIN CONNECTION POINT - SUBMIT DELIVERABLE:
    //
    // Step 1: Upload file to IPFS/Arweave and get hash
    // const hash = await uploadToIPFS(file);
    //
    // Step 2: Submit hash to Polkadot contract
    // await polkadotContract.submitDeliverable(projectId, milestoneId, hash);
    //
    // This creates an immutable record of work submission
    // Client will see this and can approve/dispute
    // =============================================================================
    console.log(`Submit deliverable for milestone ${milestoneId}: ${deliverableHash}`);
    setShowSubmitModal(false);
    setSubmitMilestone(null);
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
      {!isWalletConnected && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-medium">Wallet not connected</p>
            <p className="text-yellow-400/70 text-sm">
              Connect your wallets to submit deliverables and receive payments.
            </p>
          </div>
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

      {/* Active Projects */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Your Projects</h2>
        
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
