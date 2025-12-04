// =============================================================================
// POLKADOT (INK!) BLOCKCHAIN SERVICE
// =============================================================================
//
// This file will contain all Polkadot blockchain interactions.
// The registry contract handles: project metadata, deliverable submissions, approvals.
//
// Required packages:
// pnpm install @polkadot/api @polkadot/api-contract @polkadot/extension-dapp
//
// Contract deployment:
// 1. Build: cargo contract build
// 2. Deploy: cargo contract upload --suri //Alice
// 3. Instantiate: cargo contract instantiate --suri //Alice --constructor new
// 4. Save contract address to .env as VITE_POLKADOT_CONTRACT_ADDRESS
// =============================================================================

// Placeholder types - will be replaced with actual contract types
export interface PolkadotProject {
  projectId: string;
  title: string;
  descriptionHash: string;
  milestoneCount: number;
  createdAt: number;
}

export interface DeliverableRecord {
  milestoneId: number;
  deliverableHash: string;
  submittedAt: number;
  approved: boolean;
}

// =============================================================================
// WALLET CONNECTION
// =============================================================================

export async function connectPolkadotWallet(): Promise<string | null> {
  // TODO: Implement Polkadot.js wallet connection
  //
  // import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
  //
  // const extensions = await web3Enable('GigVault');
  // if (extensions.length === 0) {
  //   throw new Error('Polkadot.js extension not installed');
  // }
  //
  // const accounts = await web3Accounts();
  // if (accounts.length === 0) {
  //   throw new Error('No accounts found');
  // }
  //
  // return accounts[0].address;
  
  console.log('connectPolkadotWallet: Not implemented');
  return null;
}

export async function isPolkadotConnected(): Promise<boolean> {
  // TODO: Check if Polkadot.js is connected
  return false;
}

// =============================================================================
// CONTRACT INTERACTIONS
// =============================================================================

export async function registerProject(
  projectId: string,
  title: string,
  descriptionHash: string,
  milestoneCount: number
): Promise<void> {
  // TODO: Register project metadata on Polkadot
  //
  // import { ApiPromise, WsProvider } from '@polkadot/api';
  // import { ContractPromise } from '@polkadot/api-contract';
  //
  // const wsProvider = new WsProvider('ws://127.0.0.1:9944');
  // const api = await ApiPromise.create({ provider: wsProvider });
  // const contract = new ContractPromise(api, abi, contractAddress);
  //
  // const tx = contract.tx.registerProject(
  //   { gasLimit: -1 },
  //   projectId, title, descriptionHash, milestoneCount
  // );
  // await tx.signAndSend(account);
  
  console.log('registerProject:', { projectId, title, descriptionHash, milestoneCount });
}

export async function submitDeliverable(
  projectId: string,
  milestoneId: number,
  deliverableHash: string
): Promise<void> {
  // TODO: Submit deliverable hash to Polkadot contract
  //
  // const contract = new ContractPromise(api, abi, contractAddress);
  // const tx = contract.tx.submitDeliverable(
  //   { gasLimit: -1 },
  //   projectId, milestoneId, deliverableHash
  // );
  // await tx.signAndSend(account);
  
  console.log('submitDeliverable:', { projectId, milestoneId, deliverableHash });
}

export async function markApproved(
  projectId: string,
  milestoneId: number
): Promise<void> {
  // TODO: Mark milestone as approved on Polkadot
  // This should be called BEFORE releasing funds on Stellar
  //
  // const contract = new ContractPromise(api, abi, contractAddress);
  // const tx = contract.tx.markApproved(
  //   { gasLimit: -1 },
  //   projectId, milestoneId
  // );
  // await tx.signAndSend(account);
  
  console.log('markApproved:', { projectId, milestoneId });
}

// =============================================================================
// READ OPERATIONS
// =============================================================================

export async function getProjectMetadata(projectId: string): Promise<PolkadotProject | null> {
  // TODO: Query project metadata from Polkadot
  //
  // const contract = new ContractPromise(api, abi, contractAddress);
  // const { result, output } = await contract.query.getProject(account, { gasLimit: -1 }, projectId);
  // return output?.toHuman();
  
  console.log('getProjectMetadata:', { projectId });
  return null;
}

export async function getDeliverable(
  projectId: string,
  milestoneId: number
): Promise<DeliverableRecord | null> {
  // TODO: Get deliverable record from Polkadot
  //
  // const contract = new ContractPromise(api, abi, contractAddress);
  // const { result, output } = await contract.query.getDeliverable(
  //   account, { gasLimit: -1 }, projectId, milestoneId
  // );
  // return output?.toHuman();
  
  console.log('getDeliverable:', { projectId, milestoneId });
  return null;
}

export async function getMilestoneStatus(
  projectId: string,
  milestoneId: number
): Promise<{ submitted: boolean; approved: boolean; deliverableHash?: string }> {
  // TODO: Get milestone status from Polkadot
  console.log('getMilestoneStatus:', { projectId, milestoneId });
  return { submitted: false, approved: false };
}
