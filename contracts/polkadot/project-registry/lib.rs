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

    // =========================================================================
    // TYPES
    // =========================================================================

    /// Status of a milestone in the registry
    #[derive(Debug, Clone, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
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
    #[derive(Debug, Clone, Default, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
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
    #[derive(Debug, Clone, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
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
        /// Project metadata by project ID
        projects: Mapping<u64, ProjectMeta>,
        /// Milestone records: (project_id, milestone_id) -> MilestoneRecord
        milestones: Mapping<(u64, u32), MilestoneRecord>,
        /// Contract owner/admin
        owner: AccountId,
        /// Total projects registered
        project_count: u64,
    }

    // =========================================================================
    // CONTRACT IMPLEMENTATION
    // =========================================================================

    impl ProjectRegistry {
        /// Constructor - initializes the contract
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                projects: Mapping::default(),
                milestones: Mapping::default(),
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
            if self.projects.contains(project_id) {
                return Err(Error::ProjectAlreadyExists);
            }

            let caller = self.env().caller();
            let now = self.env().block_timestamp();

            // Create project metadata
            let project = ProjectMeta {
                title,
                description_hash,
                client: caller,
                freelancer,
                milestone_count,
                created_at: now,
                is_active: true,
            };

            // Store project
            self.projects.insert(project_id, &project);
            self.project_count += 1;

            // Initialize milestone records
            for i in 0..milestone_count {
                self.milestones.insert((project_id, i), &MilestoneRecord::default());
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
            // Get project
            let project = self.projects.get(project_id)
                .ok_or(Error::ProjectNotFound)?;

            // Only freelancer can submit
            let caller = self.env().caller();
            if caller != project.freelancer {
                return Err(Error::NotFreelancer);
            }

            // Check milestone exists
            if milestone_id >= project.milestone_count {
                return Err(Error::InvalidMilestone);
            }

            // Get current milestone record
            let mut record = self.milestones.get((project_id, milestone_id))
                .unwrap_or_default();

            // Check not already submitted or approved
            if record.status == MilestoneStatus::Submitted || 
               record.status == MilestoneStatus::Approved {
                return Err(Error::AlreadySubmitted);
            }

            // Update record
            record.deliverable_hash = Some(deliverable_hash);
            record.submitted_at = Some(self.env().block_timestamp());
            record.status = MilestoneStatus::Submitted;

            self.milestones.insert((project_id, milestone_id), &record);

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
            // Get project
            let project = self.projects.get(project_id)
                .ok_or(Error::ProjectNotFound)?;

            // Only client can approve
            let caller = self.env().caller();
            if caller != project.client {
                return Err(Error::NotClient);
            }

            // Check milestone exists
            if milestone_id >= project.milestone_count {
                return Err(Error::InvalidMilestone);
            }

            // Get current milestone record
            let mut record = self.milestones.get((project_id, milestone_id))
                .unwrap_or_default();

            // Must have a deliverable to approve
            if record.deliverable_hash.is_none() {
                return Err(Error::NoDeliverable);
            }

            // Cannot approve if already approved
            if record.status == MilestoneStatus::Approved {
                return Err(Error::AlreadyApproved);
            }

            // Cannot approve if disputed
            if record.status == MilestoneStatus::Disputed {
                return Err(Error::IsDisputed);
            }

            // Update status
            record.status = MilestoneStatus::Approved;
            self.milestones.insert((project_id, milestone_id), &record);

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
            // Get project
            let project = self.projects.get(project_id)
                .ok_or(Error::ProjectNotFound)?;

            // Only client can raise dispute
            let caller = self.env().caller();
            if caller != project.client {
                return Err(Error::NotClient);
            }

            // Check milestone exists
            if milestone_id >= project.milestone_count {
                return Err(Error::InvalidMilestone);
            }

            // Get current milestone record
            let mut record = self.milestones.get((project_id, milestone_id))
                .unwrap_or_default();

            // Can only dispute if submitted (not pending, approved, or already disputed)
            if record.status != MilestoneStatus::Submitted {
                return Err(Error::CannotDispute);
            }

            // Update status
            record.status = MilestoneStatus::Disputed;
            record.dispute_reason = Some(reason.clone());
            record.disputed_at = Some(self.env().block_timestamp());
            self.milestones.insert((project_id, milestone_id), &record);

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

            // Get milestone record
            let mut record = self.milestones.get((project_id, milestone_id))
                .ok_or(Error::InvalidMilestone)?;

            // Must be disputed
            if record.status != MilestoneStatus::Disputed {
                return Err(Error::CannotDispute);
            }

            // Resolve
            if approve {
                record.status = MilestoneStatus::Approved;
                self.env().emit_event(MilestoneApproved {
                    project_id,
                    milestone_id,
                });
            } else {
                // Reset to pending - freelancer needs to resubmit
                record.status = MilestoneStatus::Pending;
                record.deliverable_hash = None;
                record.submitted_at = None;
            }
            record.dispute_reason = None;
            record.disputed_at = None;

            self.milestones.insert((project_id, milestone_id), &record);

            Ok(())
        }

        // ---------------------------------------------------------------------
        // READ FUNCTIONS
        // ---------------------------------------------------------------------

        /// Get project metadata
        #[ink(message)]
        pub fn get_project(&self, project_id: u64) -> Option<ProjectMeta> {
            self.projects.get(project_id)
        }

        /// Get milestone record
        #[ink(message)]
        pub fn get_milestone(
            &self,
            project_id: u64,
            milestone_id: u32,
        ) -> Option<MilestoneRecord> {
            self.milestones.get((project_id, milestone_id))
        }

        /// Get deliverable hash for a milestone
        #[ink(message)]
        pub fn get_deliverable(
            &self,
            project_id: u64,
            milestone_id: u32,
        ) -> Option<Hash> {
            self.milestones.get((project_id, milestone_id))
                .and_then(|r| r.deliverable_hash)
        }

        /// Check if a milestone is approved
        #[ink(message)]
        pub fn is_approved(&self, project_id: u64, milestone_id: u32) -> bool {
            self.milestones.get((project_id, milestone_id))
                .map(|r| r.status == MilestoneStatus::Approved)
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
