import { useState } from 'react';
import { 
  Plus, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Wallet,
  FileText,
  Send
} from 'lucide-react';
import { cn, formatUSDC } from '../lib/utils';
import { mockProjects, mockClientStats, type Project, type Milestone } from '../lib/mock-data';

// =============================================================================
// BLOCKCHAIN CONNECTION POINTS:
// 
// STELLAR (Soroban) - Money operations:
// - createProject(): Call escrow contract to create new project
// - fundProject(): Transfer USDC to escrow contract
// - releaseMilestone(): Release funds for approved milestone
// - refundProject(): Reclaim funds if project cancelled
//
// POLKADOT (Ink!) - Verification operations:
// - registerProject(): Store project metadata on-chain
// - markApproved(): Record approval on Polkadot before releasing on Stellar
//
// Wallet connections needed:
// - Freighter (Stellar): For signing USDC transactions
// - Polkadot.js (Polkadot): For signing registry transactions
// =============================================================================

export function ClientDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // TODO: Replace with actual wallet connection state
  const isWalletConnected = false;

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'funded': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'disputed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getMilestoneStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'released': return 'bg-green-500/20 text-green-400';
      case 'approved': return 'bg-blue-500/20 text-blue-400';
      case 'submitted': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleCreateProject = () => {
    // =============================================================================
    // BLOCKCHAIN CONNECTION POINT - CREATE PROJECT:
    // 
    // Step 1: Call Stellar contract to create escrow
    // const projectId = await stellarContract.createProject(freelancerAddress, milestones);
    //
    // Step 2: Register on Polkadot for metadata
    // await polkadotContract.registerProject(projectId, title, description);
    //
    // Step 3: Fund the escrow with USDC
    // await stellarContract.fundProject(projectId, totalAmount);
    // =============================================================================
    console.log('Create project - implement blockchain connection');
    setShowCreateModal(false);
  };

  const handleApproveMilestone = (projectId: string, milestoneId: number) => {
    // =============================================================================
    // BLOCKCHAIN CONNECTION POINT - APPROVE MILESTONE:
    //
    // Step 1: Record approval on Polkadot (creates immutable proof)
    // await polkadotContract.markApproved(projectId, milestoneId);
    //
    // Step 2: Release funds on Stellar
    // await stellarContract.releaseMilestone(projectId, milestoneId);
    //
    // The frontend should wait for both transactions to confirm
    // =============================================================================
    console.log(`Approve milestone ${milestoneId} for project ${projectId}`);
  };

  const handleFundProject = (projectId: string, amount: number) => {
    // =============================================================================
    // BLOCKCHAIN CONNECTION POINT - FUND PROJECT:
    //
    // await stellarContract.fundProject(projectId, amount);
    //
    // This transfers USDC from client wallet to escrow contract
    // User must have Freighter wallet connected and sufficient USDC balance
    // =============================================================================
    console.log(`Fund project ${projectId} with ${amount} USDC`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Client Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your projects and payments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Wallet Warning */}
      {!isWalletConnected && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-medium">Wallet not connected</p>
            <p className="text-yellow-400/70 text-sm">
              Connect your Stellar wallet to create projects and fund escrows.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Spent', value: formatUSDC(mockClientStats.totalSpent), icon: DollarSign, color: 'text-green-500' },
          { label: 'In Escrow', value: formatUSDC(mockClientStats.inEscrow), icon: Wallet, color: 'text-blue-500' },
          { label: 'Active Projects', value: mockClientStats.activeProjects, icon: Clock, color: 'text-yellow-500' },
          { label: 'Completed', value: mockClientStats.completedProjects, icon: CheckCircle2, color: 'text-gray-400' },
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

      {/* Projects List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Your Projects</h2>
        
        {mockProjects.map((project) => (
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
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                    <p className="text-gray-400 text-sm">Freelancer: {project.freelancer}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={cn('px-3 py-1 rounded-full text-xs font-medium border', getStatusColor(project.status))}>
                    {project.status.replace('_', ' ')}
                  </span>
                  <ChevronRight className={cn(
                    'w-5 h-5 text-gray-400 transition-transform',
                    selectedProject?.id === project.id && 'rotate-90'
                  )} />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white">
                    {formatUSDC(project.releasedAmount)} / {formatUSDC(project.totalBudget)}
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                    style={{ width: `${(project.releasedAmount / project.totalBudget) * 100}%` }}
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
                        {milestone.status === 'submitted' && (
                          <>
                            {milestone.deliverableHash && (
                              <span className="text-xs text-pink-400 bg-pink-500/10 px-2 py-1 rounded">
                                📎 Deliverable
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveMilestone(project.id, milestone.id);
                              }}
                              className="inline-flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approve & Release</span>
                            </button>
                          </>
                        )}
                        {milestone.status === 'released' && (
                          <span className="text-green-400 text-sm flex items-center space-x-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Released</span>
                          </span>
                        )}
                        {milestone.status === 'pending' && (
                          <span className="text-gray-500 text-sm">Awaiting submission</span>
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
                      <span>Escrow on Stellar</span>
                    </span>
                    <span className="flex items-center space-x-1 text-pink-400">
                      <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                      <span>Proofs on Polkadot</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Create New Project</h2>
              <p className="text-gray-400 text-sm mt-1">Define your project and milestones</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g., Website Redesign"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Freelancer Address</label>
                <input
                  type="text"
                  placeholder="G..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Total Budget (USDC)</label>
                <input
                  type="number"
                  placeholder="1000"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the project scope..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Chain info */}
              <div className="bg-gray-800/50 rounded-lg p-3 text-sm">
                <p className="text-gray-400">
                  <span className="text-blue-400">💰 Stellar:</span> Escrow will be created and funded
                </p>
                <p className="text-gray-400 mt-1">
                  <span className="text-pink-400">📋 Polkadot:</span> Project metadata will be registered
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-800 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Create & Fund</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
