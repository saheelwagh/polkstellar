import { useState, useEffect } from 'react';
import { 
  Plus, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Wallet,
  FileText,
  Send,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { cn, formatUSDC } from '../lib/utils';
import { mockProjects, mockClientStats, type Project, type Milestone } from '../lib/mock-data';
import { useWallet } from '../context/WalletContext';
import { createProject, fundMilestone, releaseMilestone, getProject, getProjectCount } from '../lib/escrow-client';

// Type for on-chain project data
interface OnChainProject {
  id: number;
  client: string;
  freelancer: string;
  milestones: Array<{
    amount: bigint | number;
    status: any; // Can be string, {tag: string}, or {Pending: null} etc.
  }>;
  total_funded: bigint | number;
  total_released: bigint | number;
  // Local metadata (not on-chain)
  title?: string;
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

export function ClientDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  
  // On-chain projects
  const [onChainProjects, setOnChainProjects] = useState<OnChainProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  
  // Form state
  const [projectTitle, setProjectTitle] = useState('');
  const [freelancerAddress, setFreelancerAddress] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [description, setDescription] = useState('');

  // Use shared wallet context
  const { isConnected, address } = useWallet();

  // Load on-chain projects
  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const count = await getProjectCount();
      console.log('Project count:', count);
      
      const projects: OnChainProject[] = [];
      for (let i = 1; i <= count; i++) {
        const project = await getProject(i);
        if (project) {
          projects.push({ ...project, id: i });
        }
      }
      setOnChainProjects(projects);
      console.log('Loaded projects:', projects);
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

  const handleCreateProject = async () => {
    if (!isConnected || !address) {
      setTxStatus('Please connect your wallet first');
      return;
    }

    if (!freelancerAddress || !totalBudget) {
      setTxStatus('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setTxStatus('Creating project on Stellar...');

    try {
      // For demo: split budget into 2 milestones (50% each)
      const budget = BigInt(totalBudget);
      const half = budget / 2n;
      const milestoneAmounts = [half, budget - half];
      
      console.log('Calling createProject with:', { address, freelancerAddress, milestoneAmounts: milestoneAmounts.map(String) });
      const result = await createProject(address, freelancerAddress, milestoneAmounts);
      console.log('createProject result:', result);
      
      if (result.success) {
        setTxStatus(`✅ Project created! ID: ${result.projectId}`);
        // Reload projects to show the new one
        loadProjects();
        setTimeout(() => {
          setShowCreateModal(false);
          setTxStatus(null);
          // Reset form
          setProjectTitle('');
          setFreelancerAddress('');
          setTotalBudget('');
          setDescription('');
        }, 2000);
      } else {
        setTxStatus(`❌ Error: ${result.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('handleCreateProject catch:', err);
      const errorMsg = err?.message || err?.toString() || JSON.stringify(err) || 'Unknown error';
      setTxStatus(`❌ Error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveMilestone = async (projectId: string, milestoneId: number) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setTxStatus('Releasing milestone funds...');

    try {
      const numericProjectId = typeof projectId === 'string' ? parseInt(projectId) : projectId;
      const result = await releaseMilestone(address, numericProjectId, milestoneId);
      
      if (result.success) {
        setTxStatus(`✅ Released ${result.amount} stroops to freelancer!`);
        loadProjects(); // Reload to see updated status
        setTimeout(() => setTxStatus(null), 3000);
      } else {
        setTxStatus(`❌ Error: ${result.error}`);
      }
    } catch (err: any) {
      setTxStatus(`❌ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for releasing milestone (for on-chain projects)
  const handleReleaseMilestone = async (projectId: number, milestoneIndex: number) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setTxStatus('Releasing milestone funds...');

    try {
      const result = await releaseMilestone(address, projectId, milestoneIndex);
      
      if (result.success) {
        setTxStatus(`✅ Released ${result.amount} stroops to freelancer!`);
        loadProjects(); // Reload to see updated status
        setTimeout(() => setTxStatus(null), 3000);
      } else {
        setTxStatus(`❌ Error: ${result.error}`);
      }
    } catch (err: any) {
      setTxStatus(`❌ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFundMilestone = async (projectId: number, milestoneIndex: number) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setTxStatus('Funding milestone...');

    try {
      const result = await fundMilestone(address, projectId, milestoneIndex);
      
      if (result.success) {
        setTxStatus(`✅ Funded ${result.amount} stroops!`);
        loadProjects(); // Reload to see updated status
        setTimeout(() => setTxStatus(null), 3000);
      } else {
        setTxStatus(`❌ Error: ${result.error}`);
      }
    } catch (err: any) {
      setTxStatus(`❌ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
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

      {/* Transaction Status */}
      {txStatus && (
        <div className={cn(
          "rounded-lg p-4 flex items-start space-x-3",
          txStatus.includes('✅') ? "bg-green-500/10 border border-green-500/30" :
          txStatus.includes('❌') ? "bg-red-500/10 border border-red-500/30" :
          "bg-blue-500/10 border border-blue-500/30"
        )}>
          {isLoading && <Loader2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 animate-spin" />}
          <p className="text-white">{txStatus}</p>
        </div>
      )}

      {/* Wallet Warning */}
      {!isConnected && (
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
          { label: 'Total Spent', value: isConnected ? '0 XLM' : '--', icon: DollarSign, color: 'text-green-500' },
          { label: 'In Escrow', value: isConnected ? '0 XLM' : '--', icon: Wallet, color: 'text-blue-500' },
          { label: 'Active Projects', value: isConnected ? '0' : '--', icon: Clock, color: 'text-yellow-500' },
          { label: 'Completed', value: isConnected ? '0' : '--', icon: CheckCircle2, color: 'text-gray-400' },
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
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No on-chain projects yet</p>
            <p className="text-gray-500 text-sm">Create your first project to get started</p>
          </div>
        )}
        
        {!loadingProjects && onChainProjects.map((project) => {
          const totalBudget = getTotalBudget(project.milestones);
          return (
            <div
              key={project.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 font-bold">#{project.id}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {project.title || `Escrow Project #${project.id}`}
                    </h3>
                    <p className="text-gray-400 text-xs">
                      Budget: {totalBudget} stroops • {project.milestones?.length || 0} milestones
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                  On-Chain
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500">Freelancer:</span>
                  <p className="text-gray-300 font-mono text-xs">
                    {project.freelancer?.slice(0, 8)}...{project.freelancer?.slice(-4)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Progress:</span>
                  <p className="text-gray-300">
                    {Number(project.total_funded || 0)} / {totalBudget} stroops funded
                  </p>
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
                              <button
                                onClick={() => handleFundMilestone(project.id, idx)}
                                disabled={isLoading}
                                className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-xs rounded transition-colors"
                              >
                                💰 Fund This Milestone
                              </button>
                            )}
                            {statusTag === 'Funded' && (
                              <span className="text-xs text-blue-400">⏳ Waiting for freelancer to submit work...</span>
                            )}
                            {statusTag === 'Submitted' && (
                              <button
                                onClick={() => handleReleaseMilestone(project.id, idx)}
                                disabled={isLoading}
                                className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white text-xs rounded transition-colors"
                              >
                                ✅ Approve & Release Funds
                              </button>
                            )}
                            {statusTag === 'Released' && (
                              <span className="text-xs text-purple-400">✓ Funds released to freelancer</span>
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

      {/* Mock Projects List (for reference) */}
      <div className="space-y-4 opacity-50">
        <h2 className="text-xl font-semibold text-white">Demo Projects (Mock Data)</h2>
        
        {isConnected && mockProjects.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No demo projects</p>
            <p className="text-gray-500 text-sm">Mock data section</p>
          </div>
        )}
        
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg my-8">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Create New Project</h2>
              <p className="text-gray-400 text-sm mt-1">Define your project and milestones</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Title</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g., Website Redesign"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Freelancer Address</label>
                <input
                  type="text"
                  value={freelancerAddress}
                  onChange={(e) => setFreelancerAddress(e.target.value)}
                  placeholder="G... (Stellar address)"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
                />
                <p className="text-gray-500 text-xs mt-1">For testing, you can use your own address</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Total Budget (XLM in stroops)</label>
                <input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder="10000000"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <p className="text-gray-500 text-xs mt-1">1 XLM = 10,000,000 stroops. Will be split into 2 milestones.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
            
            {/* Modal status */}
            {txStatus && (
              <div className="px-6 py-3 bg-gray-800/50">
                <p className={cn(
                  "text-sm",
                  txStatus.includes('✅') ? "text-green-400" :
                  txStatus.includes('❌') ? "text-red-400" :
                  "text-blue-400"
                )}>{txStatus}</p>
              </div>
            )}

            <div className="p-6 border-t border-gray-800 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setTxStatus(null);
                }}
                disabled={isLoading}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={isLoading || !isConnected}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isLoading ? 'Creating...' : 'Create Project'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
