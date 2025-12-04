// ============================================================================
// EXERCISE 6: SMART CONTRACT PATTERNS
// ============================================================================
// 
// This exercise combines everything into patterns you'll use in
// Soroban and Ink! contracts for FreelanceEscrow.
//
// Run: rustc 06_smart_contract_patterns.rs -o 06_contract && ./06_contract
// ============================================================================

use std::collections::HashMap;

fn main() {
    println!("=== Exercise 6: Smart Contract Patterns ===\n");
    
    exercise_6a();
    exercise_6b();
    exercise_6c();
    
    println!("\n✅ All exercises complete!");
    println!("You're ready to build FreelanceEscrow! 🚀");
}

// ----------------------------------------------------------------------------
// EXERCISE 6A: Contract Storage Pattern
// ----------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq)]
enum MilestoneStatus {
    Pending,
    Submitted(String),  // deliverable hash
    Approved,
    Released,
}

#[derive(Debug, Clone)]
struct Project {
    id: u64,
    client: String,
    freelancer: String,
    milestones: Vec<u128>,
    statuses: Vec<MilestoneStatus>,
    total_funded: u128,
    total_released: u128,
}

// TODO: Implement these methods for Project
impl Project {
    // Constructor
    fn new(id: u64, client: String, freelancer: String, milestones: Vec<u128>) -> Self {
        let count = milestones.len();
        Project {
            id,
            client,
            freelancer,
            milestones,
            statuses: vec![MilestoneStatus::Pending; count],
            total_funded: 0,
            total_released: 0,
        }
    }
    
    // TODO: Implement fund() - add funds to project
    fn fund(&mut self, amount: u128) {
        // Add to total_funded
    }
    
    // TODO: Implement submit_deliverable() - freelancer submits work
    fn submit_deliverable(&mut self, milestone_idx: usize, hash: String) -> Result<(), String> {
        // Check bounds, check status is Pending, update to Submitted
        Err(String::from("Not implemented"))
    }
    
    // TODO: Implement approve() - client approves milestone
    fn approve(&mut self, milestone_idx: usize) -> Result<(), String> {
        // Check bounds, check status is Submitted, update to Approved
        Err(String::from("Not implemented"))
    }
    
    // TODO: Implement release() - release funds for approved milestone
    fn release(&mut self, milestone_idx: usize) -> Result<u128, String> {
        // Check Approved, update to Released, return amount
        Err(String::from("Not implemented"))
    }
    
    fn get_balance(&self) -> u128 {
        self.total_funded - self.total_released
    }
}

fn exercise_6a() {
    println!("--- 6A: Contract Storage ---");
    
    let mut project = Project::new(
        1,
        String::from("GCLIENT"),
        String::from("GFREELANCER"),
        vec![1000, 2000, 1500],
    );
    
    project.fund(4500);
    println!("Funded: {}", project.total_funded);
    println!("Balance: {}", project.get_balance());
    
    // TODO: Test the full flow after implementing methods
    // project.submit_deliverable(0, String::from("ipfs://Qm123"))?;
    // project.approve(0)?;
    // let released = project.release(0)?;
    // println!("Released: {}", released);
}

// ----------------------------------------------------------------------------
// EXERCISE 6B: Access Control Pattern
// ----------------------------------------------------------------------------

#[derive(Debug)]
enum Role {
    Client,
    Freelancer,
    Admin,
}

struct AccessControl {
    roles: HashMap<String, Role>,
}

impl AccessControl {
    fn new() -> Self {
        AccessControl { roles: HashMap::new() }
    }
    
    fn grant_role(&mut self, address: String, role: Role) {
        self.roles.insert(address, role);
    }
    
    // TODO: Implement require_role() - returns Result
    fn require_role(&self, address: &str, required: &Role) -> Result<(), String> {
        // Check if address has the required role
        // Return Ok(()) if yes, Err if no
        Err(String::from("Not implemented"))
    }
}

fn exercise_6b() {
    println!("\n--- 6B: Access Control ---");
    
    let mut acl = AccessControl::new();
    acl.grant_role(String::from("GCLIENT"), Role::Client);
    acl.grant_role(String::from("GADMIN"), Role::Admin);
    
    // TODO: Test access control
    // match acl.require_role("GCLIENT", &Role::Client) {
    //     Ok(()) => println!("GCLIENT authorized as Client"),
    //     Err(e) => println!("Error: {}", e),
    // }
    
    println!("(Implement require_role to complete)");
}

// ----------------------------------------------------------------------------
// EXERCISE 6C: Event Emission Pattern
// ----------------------------------------------------------------------------

#[derive(Debug)]
enum EscrowEvent {
    ProjectCreated { id: u64, client: String },
    MilestoneSubmitted { project_id: u64, milestone_idx: usize },
    MilestoneApproved { project_id: u64, milestone_idx: usize },
    FundsReleased { project_id: u64, amount: u128, to: String },
}

struct EventLog {
    events: Vec<EscrowEvent>,
}

impl EventLog {
    fn new() -> Self {
        EventLog { events: Vec::new() }
    }
    
    fn emit(&mut self, event: EscrowEvent) {
        println!("EVENT: {:?}", event);
        self.events.push(event);
    }
    
    fn get_events(&self) -> &[EscrowEvent] {
        &self.events
    }
}

fn exercise_6c() {
    println!("\n--- 6C: Event Emission ---");
    
    let mut log = EventLog::new();
    
    // Simulate contract flow with events
    log.emit(EscrowEvent::ProjectCreated {
        id: 1,
        client: String::from("GCLIENT"),
    });
    
    log.emit(EscrowEvent::MilestoneSubmitted {
        project_id: 1,
        milestone_idx: 0,
    });
    
    log.emit(EscrowEvent::FundsReleased {
        project_id: 1,
        amount: 1000,
        to: String::from("GFREELANCER"),
    });
    
    println!("\nTotal events: {}", log.get_events().len());
}

// ============================================================================
// SOLUTIONS
// ============================================================================
//
// SOLUTION 6A - Project methods:
//
// fn fund(&mut self, amount: u128) {
//     self.total_funded += amount;
// }
//
// fn submit_deliverable(&mut self, idx: usize, hash: String) -> Result<(), String> {
//     if idx >= self.milestones.len() {
//         return Err(String::from("Invalid milestone"));
//     }
//     if self.statuses[idx] != MilestoneStatus::Pending {
//         return Err(String::from("Not pending"));
//     }
//     self.statuses[idx] = MilestoneStatus::Submitted(hash);
//     Ok(())
// }
//
// fn approve(&mut self, idx: usize) -> Result<(), String> {
//     if idx >= self.milestones.len() {
//         return Err(String::from("Invalid milestone"));
//     }
//     match &self.statuses[idx] {
//         MilestoneStatus::Submitted(_) => {
//             self.statuses[idx] = MilestoneStatus::Approved;
//             Ok(())
//         }
//         _ => Err(String::from("Not submitted")),
//     }
// }
//
// fn release(&mut self, idx: usize) -> Result<u128, String> {
//     if self.statuses[idx] != MilestoneStatus::Approved {
//         return Err(String::from("Not approved"));
//     }
//     let amount = self.milestones[idx];
//     self.statuses[idx] = MilestoneStatus::Released;
//     self.total_released += amount;
//     Ok(amount)
// }
//
// SOLUTION 6B - Access Control:
//
// fn require_role(&self, address: &str, required: &Role) -> Result<(), String> {
//     match self.roles.get(address) {
//         Some(role) => {
//             let matches = match (role, required) {
//                 (Role::Admin, _) => true,  // Admin can do anything
//                 (Role::Client, Role::Client) => true,
//                 (Role::Freelancer, Role::Freelancer) => true,
//                 _ => false,
//             };
//             if matches { Ok(()) } 
//             else { Err(format!("Wrong role for {}", address)) }
//         }
//         None => Err(format!("No role for {}", address)),
//     }
// }
//
// KEY INSIGHTS:
// - These patterns map directly to Soroban/Ink! contracts
// - Storage structs become contract state
// - Access control prevents unauthorized calls
// - Events enable frontend to track changes
