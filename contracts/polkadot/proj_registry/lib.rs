#![cfg_attr(not(feature = "std"), no_std, no_main)]

//! # Project Registry Contract
//! 
//! This Ink! smart contract serves as the Polkadot-side registry for the 
//! FreelanceEscrow cross-chain system. It tracks:
//! - Project metadata (title, description hash)
//! - Milestone deliverables (submitted by freelancers)
//! - Approval status
//! - Disputes
//!
//! The Stellar escrow contract handles the actual funds, while this contract
//! provides an immutable record of work deliverables and approvals.

#[ink::contract]
mod project_registry {
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;
    use scale::{Decode, Encode};
    extern crate alloc;
    use alloc::vec;

    // =========================================================================
    // TYPES
    // =========================================================================

    /// Status of a milestone in the registry
    #[repr(u8)]
    #[derive(Debug, Clone, Copy, PartialEq, Eq)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum MilestoneStatus {
        /// Initial state - no deliverable submitted
        Pending,
        /// Freelancer has submitted a deliverable
        Submitted,
        /// Client has approved the deliverable
        Approved,
        /// Client has raised a dispute
        Disputed,
    }

    impl Default for MilestoneStatus {
        fn default() -> Self {
            MilestoneStatus::Pending
        }
    }

    /// Record of a milestone's deliverable and status
    #[derive(Debug, Clone, Default)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct MilestoneRecord {
        /// Hash of the deliverable (e.g., IPFS hash, git commit)
        pub deliverable_hash: Option<Hash>,
        /// Timestamp when deliverable was submitted
        pub submitted_at: Option<Timestamp>,
        /// Current status
        pub status: MilestoneStatus,
        /// Dispute reason if disputed
        pub dispute_reason: Option<String>,
        /// Timestamp when dispute was raised
        pub disputed_at: Option<Timestamp>,
    }

    /// Project metadata stored on Polkadot
    #[derive(Debug, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct ProjectMeta {
        /// Project title
        pub title: String,
        /// Hash of full description (stored off-chain)
        pub description_hash: Hash,
        /// Client address (who created the project)
        pub client: AccountId,
        /// Freelancer address
        pub freelancer: AccountId,
        /// Number of milestones
        pub milestone_count: u32,
        /// Creation timestamp
        pub created_at: Timestamp,
        /// Whether project is active
        pub is_active: bool,
    }

    // =========================================================================
    // ERRORS
    // =========================================================================

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// Project with this ID already exists
        ProjectAlreadyExists,
        /// Project not found
        ProjectNotFound,
        /// Milestone index out of bounds
        InvalidMilestone,
        /// Only client can perform this action
        NotClient,
        /// Only freelancer can perform this action
        NotFreelancer,
        /// Milestone already has a deliverable
        AlreadySubmitted,
        /// Cannot approve - no deliverable submitted
        NoDeliverable,
        /// Milestone already approved
        AlreadyApproved,
        /// Milestone is disputed
        IsDisputed,
        /// Cannot dispute - already approved or not submitted
        CannotDispute,
    }

    // =========================================================================
    // EVENTS
    // =========================================================================

    /// Emitted when a new project is registered
    #[ink(event)]
    pub struct ProjectRegistered {
        #[ink(topic)]
        project_id: u64,
        #[ink(topic)]
        client: AccountId,
        freelancer: AccountId,
        milestone_count: u32,
    }

    /// Emitted when a deliverable is submitted
    #[ink(event)]
    pub struct DeliverableSubmitted {
        #[ink(topic)]
        project_id: u64,
        milestone_id: u32,
        deliverable_hash: Hash,
    }

    /// Emitted when a milestone is approved
    #[ink(event)]
    pub struct MilestoneApproved {
        #[ink(topic)]
        project_id: u64,
        milestone_id: u32,
    }

    /// Emitted when a dispute is raised
    #[ink(event)]
    pub struct DisputeRaised {
        #[ink(topic)]
        project_id: u64,
        milestone_id: u32,
        reason: String,
    }

    // =========================================================================
    // CONTRACT STORAGE
    // =========================================================================

    #[ink(storage)]
    pub struct ProjectRegistry {
        /// Project titles by project ID
        #[ink(mapping)]
        project_titles: Mapping<u64, String>,
        /// Project descriptions by project ID
        #[ink(mapping)]
        project_descriptions: Mapping<u64, Hash>,
        /// Project clients by project ID
        #[ink(mapping)]
        project_clients: Mapping<u64, AccountId>,
        /// Project freelancers by project ID
        #[ink(mapping)]
        project_freelancers: Mapping<u64, AccountId>,
        /// Project milestone counts by project ID
        #[ink(mapping)]
        project_milestone_counts: Mapping<u64, u32>,
        /// Project creation timestamps by project ID
        #[ink(mapping)]
        project_created_at: Mapping<u64, Timestamp>,
        /// Project active status by project ID
        #[ink(mapping)]
        project_is_active: Mapping<u64, bool>,
        /// Deliverable hashes by (project_id, milestone_id)
        #[ink(mapping)]
        deliverable_hashes: Mapping<(u64, u32), Hash>,
        /// Submission timestamps by (project_id, milestone_id)
        #[ink(mapping)]
        submitted_at: Mapping<(u64, u32), Timestamp>,
        /// Milestone statuses by (project_id, milestone_id) - stored as u8
        #[ink(mapping)]
        milestone_statuses: Mapping<(u64, u32), u8>,
        /// Dispute reasons by (project_id, milestone_id)
        #[ink(mapping)]
        dispute_reasons: Mapping<(u64, u32), String>,
        /// Dispute timestamps by (project_id, milestone_id)
        #[ink(mapping)]
        disputed_at: Mapping<(u64, u32), Timestamp>,
        /// Contract owner/admin
        owner: AccountId,
        /// Total projects registered
        project_count: u64,
    }

    // =========================================================================
    // CONTRACT IMPLEMENTATION
    // =========================================================================

    impl ProjectRegistry {
        /// Convert MilestoneStatus to u8
        fn status_to_u8(status: MilestoneStatus) -> u8 {
            match status {
                MilestoneStatus::Pending => 0,
                MilestoneStatus::Submitted => 1,
                MilestoneStatus::Approved => 2,
                MilestoneStatus::Disputed => 3,
            }
        }

        /// Convert u8 to MilestoneStatus
        fn u8_to_status(value: u8) -> MilestoneStatus {
            match value {
                0 => MilestoneStatus::Pending,
                1 => MilestoneStatus::Submitted,
                2 => MilestoneStatus::Approved,
                3 => MilestoneStatus::Disputed,
                _ => MilestoneStatus::Pending,
            }
        }

        /// Constructor - initializes the contract
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                project_titles: Mapping::default(),
                project_descriptions: Mapping::default(),
                project_clients: Mapping::default(),
                project_freelancers: Mapping::default(),
                project_milestone_counts: Mapping::default(),
                project_created_at: Mapping::default(),
                project_is_active: Mapping::default(),
                deliverable_hashes: Mapping::default(),
                submitted_at: Mapping::default(),
                milestone_statuses: Mapping::default(),
                dispute_reasons: Mapping::default(),
                disputed_at: Mapping::default(),
                owner: Self::env().caller(),
                project_count: 0,
            }
        }

        // ---------------------------------------------------------------------
        // WRITE FUNCTIONS
        // ---------------------------------------------------------------------

        /// Register a new project
        /// 
        /// Called by the client when creating a project. The project_id should
        /// match the one created on the Stellar escrow contract.
        #[ink(message)]
        pub fn register_project(
            &mut self,
            project_id: u64,
            title: String,
            description_hash: Hash,
            freelancer: AccountId,
            milestone_count: u32,
        ) -> Result<(), Error> {
            // Check project doesn't already exist
            if self.project_titles.contains(project_id) {
                return Err(Error::ProjectAlreadyExists);
            }

            let caller = self.env().caller();
            let now = self.env().block_timestamp();

            // Store project metadata
            self.project_titles.insert(project_id, &title);
            self.project_descriptions.insert(project_id, &description_hash);
            self.project_clients.insert(project_id, &caller);
            self.project_freelancers.insert(project_id, &freelancer);
            self.project_milestone_counts.insert(project_id, &milestone_count);
            self.project_created_at.insert(project_id, &now);
            self.project_is_active.insert(project_id, &true);
            
            self.project_count += 1;

            // Initialize milestone records with Pending status
            for i in 0..milestone_count {
                self.milestone_statuses.insert((project_id, i), &Self::status_to_u8(MilestoneStatus::Pending));
            }

            // Emit event
            self.env().emit_event(ProjectRegistered {
                project_id,
                client: caller,
                freelancer,
                milestone_count,
            });

            Ok(())
        }

        /// Submit a deliverable for a milestone
        /// 
        /// Called by the freelancer when work is complete. The hash should
        /// point to the deliverable (IPFS, git commit, etc.)
        #[ink(message)]
        pub fn submit_deliverable(
            &mut self,
            project_id: u64,
            milestone_id: u32,
            deliverable_hash: Hash,
        ) -> Result<(), Error> {
            // Get project freelancer
            let freelancer = self.project_freelancers.get(project_id)
                .ok_or(Error::ProjectNotFound)?;

            // Only freelancer can submit
            let caller = self.env().caller();
            if caller != freelancer {
                return Err(Error::NotFreelancer);
            }

            // Check milestone exists
            let milestone_count = self.project_milestone_counts.get(project_id)
                .ok_or(Error::ProjectNotFound)?;
            if milestone_id >= milestone_count {
                return Err(Error::InvalidMilestone);
            }

            // Get current milestone status
            let status_u8 = self.milestone_statuses.get((project_id, milestone_id))
                .unwrap_or(Self::status_to_u8(MilestoneStatus::Pending));
            let status = Self::u8_to_status(status_u8);

            // Check not already submitted or approved
            if status == MilestoneStatus::Submitted || 
               status == MilestoneStatus::Approved {
                return Err(Error::AlreadySubmitted);
            }

            // Update milestone
            self.deliverable_hashes.insert((project_id, milestone_id), &deliverable_hash);
            self.submitted_at.insert((project_id, milestone_id), &self.env().block_timestamp());
            self.milestone_statuses.insert((project_id, milestone_id), &Self::status_to_u8(MilestoneStatus::Submitted));

            // Emit event
            self.env().emit_event(DeliverableSubmitted {
                project_id,
                milestone_id,
                deliverable_hash,
            });

            Ok(())
        }

        /// Approve a milestone
        /// 
        /// Called by the client after reviewing the deliverable. This should
        /// trigger a release on the Stellar escrow contract.
        #[ink(message)]
        pub fn approve_milestone(
            &mut self,
            project_id: u64,
            milestone_id: u32,
        ) -> Result<(), Error> {
            // Get project client
            let client = self.project_clients.get(project_id)
                .ok_or(Error::ProjectNotFound)?;

            // Only client can approve
            let caller = self.env().caller();
            if caller != client {
                return Err(Error::NotClient);
            }

            // Check milestone exists
            let milestone_count = self.project_milestone_counts.get(project_id)
                .ok_or(Error::ProjectNotFound)?;
            if milestone_id >= milestone_count {
                return Err(Error::InvalidMilestone);
            }

            // Get current milestone status
            let status_u8 = self.milestone_statuses.get((project_id, milestone_id))
                .unwrap_or(Self::status_to_u8(MilestoneStatus::Pending));
            let status = Self::u8_to_status(status_u8);

            // Must have a deliverable to approve
            if self.deliverable_hashes.get((project_id, milestone_id)).is_none() {
                return Err(Error::NoDeliverable);
            }

            // Cannot approve if already approved
            if status == MilestoneStatus::Approved {
                return Err(Error::AlreadyApproved);
            }

            // Cannot approve if disputed
            if status == MilestoneStatus::Disputed {
                return Err(Error::IsDisputed);
            }

            // Update status
            self.milestone_statuses.insert((project_id, milestone_id), &Self::status_to_u8(MilestoneStatus::Approved));

            // Emit event
            self.env().emit_event(MilestoneApproved {
                project_id,
                milestone_id,
            });

            Ok(())
        }

        /// Raise a dispute on a milestone
        /// 
        /// Called by the client if they're not satisfied with the deliverable.
        #[ink(message)]
        pub fn raise_dispute(
            &mut self,
            project_id: u64,
            milestone_id: u32,
            reason: String,
        ) -> Result<(), Error> {
            // Get project client
            let client = self.project_clients.get(project_id)
                .ok_or(Error::ProjectNotFound)?;

            // Only client can raise dispute
            let caller = self.env().caller();
            if caller != client {
                return Err(Error::NotClient);
            }

            // Check milestone exists
            let milestone_count = self.project_milestone_counts.get(project_id)
                .ok_or(Error::ProjectNotFound)?;
            if milestone_id >= milestone_count {
                return Err(Error::InvalidMilestone);
            }

            // Get current milestone status
            let status_u8 = self.milestone_statuses.get((project_id, milestone_id))
                .unwrap_or(Self::status_to_u8(MilestoneStatus::Pending));
            let status = Self::u8_to_status(status_u8);

            // Can only dispute if submitted (not pending, approved, or already disputed)
            if status != MilestoneStatus::Submitted {
                return Err(Error::CannotDispute);
            }

            // Update status
            self.milestone_statuses.insert((project_id, milestone_id), &Self::status_to_u8(MilestoneStatus::Disputed));
            self.dispute_reasons.insert((project_id, milestone_id), &reason);
            self.disputed_at.insert((project_id, milestone_id), &self.env().block_timestamp());

            // Emit event
            self.env().emit_event(DisputeRaised {
                project_id,
                milestone_id,
                reason,
            });

            Ok(())
        }

        /// Resolve a dispute (admin only)
        /// 
        /// Can set the milestone to either Approved or back to Pending
        #[ink(message)]
        pub fn resolve_dispute(
            &mut self,
            project_id: u64,
            milestone_id: u32,
            approve: bool,
        ) -> Result<(), Error> {
            // Only owner can resolve disputes
            let caller = self.env().caller();
            if caller != self.owner {
                return Err(Error::NotClient); // Reusing error for simplicity
            }

            // Get milestone status
            let status_u8 = self.milestone_statuses.get((project_id, milestone_id))
                .ok_or(Error::InvalidMilestone)?;
            let status = Self::u8_to_status(status_u8);

            // Must be disputed
            if status != MilestoneStatus::Disputed {
                return Err(Error::CannotDispute);
            }

            // Resolve
            if approve {
                self.milestone_statuses.insert((project_id, milestone_id), &Self::status_to_u8(MilestoneStatus::Approved));
                self.env().emit_event(MilestoneApproved {
                    project_id,
                    milestone_id,
                });
            } else {
                // Reset to pending - freelancer needs to resubmit
                self.milestone_statuses.insert((project_id, milestone_id), &Self::status_to_u8(MilestoneStatus::Pending));
                self.deliverable_hashes.remove((project_id, milestone_id));
                self.submitted_at.remove((project_id, milestone_id));
            }
            self.dispute_reasons.remove((project_id, milestone_id));
            self.disputed_at.remove((project_id, milestone_id));

            Ok(())
        }

        // ---------------------------------------------------------------------
        // READ FUNCTIONS
        // ---------------------------------------------------------------------

        /// Get project title
        #[ink(message)]
        pub fn get_project_title(&self, project_id: u64) -> Option<String> {
            self.project_titles.get(project_id)
        }

        /// Get project client
        #[ink(message)]
        pub fn get_project_client(&self, project_id: u64) -> Option<AccountId> {
            self.project_clients.get(project_id)
        }

        /// Get project freelancer
        #[ink(message)]
        pub fn get_project_freelancer(&self, project_id: u64) -> Option<AccountId> {
            self.project_freelancers.get(project_id)
        }

        /// Get project milestone count
        #[ink(message)]
        pub fn get_project_milestone_count(&self, project_id: u64) -> Option<u32> {
            self.project_milestone_counts.get(project_id)
        }

        /// Get milestone status
        #[ink(message)]
        pub fn get_milestone_status(&self, project_id: u64, milestone_id: u32) -> Option<u8> {
            self.milestone_statuses.get((project_id, milestone_id))
        }

        /// Get milestone deliverable hash
        #[ink(message)]
        pub fn get_milestone_deliverable(&self, project_id: u64, milestone_id: u32) -> Option<Hash> {
            self.deliverable_hashes.get((project_id, milestone_id))
        }

        /// Get milestone dispute reason
        #[ink(message)]
        pub fn get_milestone_dispute_reason(&self, project_id: u64, milestone_id: u32) -> Option<String> {
            self.dispute_reasons.get((project_id, milestone_id))
        }

        /// Get deliverable hash for a milestone
        #[ink(message)]
        pub fn get_deliverable(
            &self,
            project_id: u64,
            milestone_id: u32,
        ) -> Option<Hash> {
            self.deliverable_hashes.get((project_id, milestone_id))
        }

        /// Check if a milestone is approved
        #[ink(message)]
        pub fn is_approved(&self, project_id: u64, milestone_id: u32) -> bool {
            self.milestone_statuses.get((project_id, milestone_id))
                .map(|status_u8| Self::u8_to_status(status_u8) == MilestoneStatus::Approved)
                .unwrap_or(false)
        }

        /// Get total registered projects
        #[ink(message)]
        pub fn get_project_count(&self) -> u64 {
            self.project_count
        }

        /// Get contract owner
        #[ink(message)]
        pub fn get_owner(&self) -> AccountId {
            self.owner
        }
    }

    // =========================================================================
    // TESTS
    // =========================================================================

    #[cfg(test)]
    mod tests {
        use super::*;

        fn default_accounts() -> ink::env::test::DefaultAccounts<ink::env::DefaultEnvironment> {
            ink::env::test::default_accounts::<ink::env::DefaultEnvironment>()
        }

        fn set_caller(caller: AccountId) {
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(caller);
        }

        #[ink::test]
        fn test_register_project() {
            let accounts = default_accounts();
            set_caller(accounts.alice);

            let mut contract = ProjectRegistry::new();
            
            let result = contract.register_project(
                1,
                String::from("Test Project"),
                Hash::default(),
                accounts.bob,
                3,
            );
            
            assert!(result.is_ok());
            assert_eq!(contract.get_project_count(), 1);
            
            let project = contract.get_project(1).unwrap();
            assert_eq!(project.client, accounts.alice);
            assert_eq!(project.freelancer, accounts.bob);
            assert_eq!(project.milestone_count, 3);
        }

        #[ink::test]
        fn test_submit_deliverable() {
            let accounts = default_accounts();
            set_caller(accounts.alice);

            let mut contract = ProjectRegistry::new();
            
            // Register project as client (alice)
            contract.register_project(
                1,
                String::from("Test Project"),
                Hash::default(),
                accounts.bob,
                2,
            ).unwrap();

            // Submit deliverable as freelancer (bob)
            set_caller(accounts.bob);
            let hash = Hash::from([1u8; 32]);
            let result = contract.submit_deliverable(1, 0, hash);
            
            assert!(result.is_ok());
            
            let milestone = contract.get_milestone(1, 0).unwrap();
            assert_eq!(milestone.status, MilestoneStatus::Submitted);
            assert_eq!(milestone.deliverable_hash, Some(hash));
        }

        #[ink::test]
        fn test_approve_milestone() {
            let accounts = default_accounts();
            set_caller(accounts.alice);

            let mut contract = ProjectRegistry::new();
            
            // Register project
            contract.register_project(
                1,
                String::from("Test Project"),
                Hash::default(),
                accounts.bob,
                2,
            ).unwrap();

            // Submit deliverable as freelancer
            set_caller(accounts.bob);
            contract.submit_deliverable(1, 0, Hash::from([1u8; 32])).unwrap();

            // Approve as client
            set_caller(accounts.alice);
            let result = contract.approve_milestone(1, 0);
            
            assert!(result.is_ok());
            assert!(contract.is_approved(1, 0));
        }

        #[ink::test]
        fn test_raise_dispute() {
            let accounts = default_accounts();
            set_caller(accounts.alice);

            let mut contract = ProjectRegistry::new();
            
            // Register project
            contract.register_project(
                1,
                String::from("Test Project"),
                Hash::default(),
                accounts.bob,
                2,
            ).unwrap();

            // Submit deliverable as freelancer
            set_caller(accounts.bob);
            contract.submit_deliverable(1, 0, Hash::from([1u8; 32])).unwrap();

            // Raise dispute as client
            set_caller(accounts.alice);
            let result = contract.raise_dispute(1, 0, String::from("Work incomplete"));
            
            assert!(result.is_ok());
            
            let milestone = contract.get_milestone(1, 0).unwrap();
            assert_eq!(milestone.status, MilestoneStatus::Disputed);
            assert_eq!(milestone.dispute_reason, Some(String::from("Work incomplete")));
        }

        #[ink::test]
        fn test_only_freelancer_can_submit() {
            let accounts = default_accounts();
            set_caller(accounts.alice);

            let mut contract = ProjectRegistry::new();
            
            contract.register_project(
                1,
                String::from("Test Project"),
                Hash::default(),
                accounts.bob,
                2,
            ).unwrap();

            // Try to submit as client (should fail)
            let result = contract.submit_deliverable(1, 0, Hash::from([1u8; 32]));
            assert_eq!(result, Err(Error::NotFreelancer));
        }

        #[ink::test]
        fn test_only_client_can_approve() {
            let accounts = default_accounts();
            set_caller(accounts.alice);

            let mut contract = ProjectRegistry::new();
            
            contract.register_project(
                1,
                String::from("Test Project"),
                Hash::default(),
                accounts.bob,
                2,
            ).unwrap();

            // Submit as freelancer
            set_caller(accounts.bob);
            contract.submit_deliverable(1, 0, Hash::from([1u8; 32])).unwrap();

            // Try to approve as freelancer (should fail)
            let result = contract.approve_milestone(1, 0);
            assert_eq!(result, Err(Error::NotClient));
        }

        #[ink::test]
        fn test_cannot_approve_without_deliverable() {
            let accounts = default_accounts();
            set_caller(accounts.alice);

            let mut contract = ProjectRegistry::new();
            
            contract.register_project(
                1,
                String::from("Test Project"),
                Hash::default(),
                accounts.bob,
                2,
            ).unwrap();

            // Try to approve without deliverable
            let result = contract.approve_milestone(1, 0);
            assert_eq!(result, Err(Error::NoDeliverable));
        }

        #[ink::test]
        fn test_full_workflow() {
            let accounts = default_accounts();
            set_caller(accounts.alice);

            let mut contract = ProjectRegistry::new();
            
            // 1. Client registers project
            contract.register_project(
                1,
                String::from("Website Redesign"),
                Hash::default(),
                accounts.bob,
                3,
            ).unwrap();

            // 2. Freelancer submits milestone 0
            set_caller(accounts.bob);
            contract.submit_deliverable(1, 0, Hash::from([1u8; 32])).unwrap();

            // 3. Client approves milestone 0
            set_caller(accounts.alice);
            contract.approve_milestone(1, 0).unwrap();
            assert!(contract.is_approved(1, 0));

            // 4. Freelancer submits milestone 1
            set_caller(accounts.bob);
            contract.submit_deliverable(1, 1, Hash::from([2u8; 32])).unwrap();

            // 5. Client disputes milestone 1
            set_caller(accounts.alice);
            contract.raise_dispute(1, 1, String::from("Missing features")).unwrap();

            // 6. Admin resolves dispute (approves)
            set_caller(accounts.alice); // Alice is owner
            contract.resolve_dispute(1, 1, true).unwrap();
            assert!(contract.is_approved(1, 1));
        }
    }
}
