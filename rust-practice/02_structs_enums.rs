// ============================================================================
// EXERCISE 2: STRUCTS & ENUMS
// ============================================================================
// 
// These are the building blocks of smart contract state:
// - Structs define your data (Projects, Milestones, Users)
// - Enums define states (Pending, Approved, Disputed)
// - Pattern matching handles all possible cases
//
// Run: rustc 02_structs_enums.rs -o 02_structs_enums && ./02_structs_enums
// ============================================================================

fn main() {
    println!("=== Exercise 2: Structs & Enums ===\n");
    
    exercise_2a();
    exercise_2b();
    exercise_2c();
    exercise_2d();
    
    println!("\n✅ All exercises complete!");
}

// ----------------------------------------------------------------------------
// EXERCISE 2A: Define a Milestone Struct
// ----------------------------------------------------------------------------
// Create a struct to represent a milestone in our escrow system
// ----------------------------------------------------------------------------

fn exercise_2a() {
    println!("--- 2A: Milestone Struct ---");
    
    // TODO: Define a Milestone struct with these fields:
    // - id: u32
    // - title: String
    // - amount: u128
    // - is_completed: bool
    
    // TODO: Create a milestone instance
    // let milestone = Milestone {
    //     id: 1,
    //     title: String::from("Wireframes"),
    //     amount: 1000,
    //     is_completed: false,
    // };
    
    // TODO: Print milestone details
    // println!("Milestone {}: {} - {} USDC", milestone.id, milestone.title, milestone.amount);
    
    println!("(Define Milestone struct to complete)");
}

// TODO: Define Milestone struct here
// struct Milestone {
//     ...
// }

// ----------------------------------------------------------------------------
// EXERCISE 2B: Enum for Status
// ----------------------------------------------------------------------------
// Create an enum to represent milestone status with different states
// ----------------------------------------------------------------------------

// TODO: Define MilestoneStatus enum with these variants:
// - Pending
// - Submitted (contains a String for deliverable_hash)
// - Approved
// - Disputed (contains a String for reason)
// - Released

// enum MilestoneStatus {
//     ...
// }

fn exercise_2b() {
    println!("\n--- 2B: Status Enum ---");
    
    // TODO: Create different status values
    // let status1 = MilestoneStatus::Pending;
    // let status2 = MilestoneStatus::Submitted(String::from("ipfs://Qm123..."));
    // let status3 = MilestoneStatus::Disputed(String::from("Work incomplete"));
    
    // TODO: Implement a function to get status as string
    // println!("Status 1: {}", status_to_string(&status1));
    // println!("Status 2: {}", status_to_string(&status2));
    // println!("Status 3: {}", status_to_string(&status3));
    
    println!("(Define MilestoneStatus enum to complete)");
}

// TODO: Implement this function using match
// fn status_to_string(status: &MilestoneStatus) -> String {
//     match status {
//         ...
//     }
// }

// ----------------------------------------------------------------------------
// EXERCISE 2C: Pattern Matching
// ----------------------------------------------------------------------------
// Use pattern matching to handle different milestone states
// ----------------------------------------------------------------------------

fn exercise_2c() {
    println!("\n--- 2C: Pattern Matching ---");
    
    // TODO: Implement process_milestone that:
    // - If Pending: returns "Waiting for work"
    // - If Submitted(hash): returns "Review deliverable: {hash}"
    // - If Approved: returns "Ready for payment"
    // - If Disputed(reason): returns "Dispute: {reason}"
    // - If Released: returns "Payment complete"
    
    // Test with different statuses
    // let result = process_milestone(MilestoneStatus::Submitted(String::from("ipfs://abc")));
    // println!("{}", result);
    
    println!("(Implement process_milestone to complete)");
}

// TODO: Implement this function
// fn process_milestone(status: MilestoneStatus) -> String {
//     ...
// }

// ----------------------------------------------------------------------------
// EXERCISE 2D: Struct with Methods (impl block)
// ----------------------------------------------------------------------------
// Add methods to a Project struct - this is how smart contracts work!
// ----------------------------------------------------------------------------

fn exercise_2d() {
    println!("\n--- 2D: Struct Methods ---");
    
    // TODO: Define Project struct with:
    // - id: u64
    // - client: String
    // - freelancer: String
    // - total_budget: u128
    // - released_amount: u128
    // - milestones: Vec<u128> (amounts per milestone)
    
    // TODO: Implement these methods:
    // - new(id, client, freelancer, milestones) -> Project
    // - remaining_balance(&self) -> u128
    // - release_milestone(&mut self, milestone_idx: usize) -> Result<u128, String>
    // - is_complete(&self) -> bool
    
    // Test the implementation:
    // let mut project = Project::new(
    //     1,
    //     String::from("GCLIENT"),
    //     String::from("GFREELANCER"),
    //     vec![1000, 2000, 1500]
    // );
    // 
    // println!("Total budget: {}", project.total_budget);
    // println!("Remaining: {}", project.remaining_balance());
    // 
    // match project.release_milestone(0) {
    //     Ok(amount) => println!("Released: {}", amount),
    //     Err(e) => println!("Error: {}", e),
    // }
    // 
    // println!("Remaining after release: {}", project.remaining_balance());
    // println!("Is complete: {}", project.is_complete());
    
    println!("(Implement Project struct with methods to complete)");
}


// ============================================================================
// SOLUTIONS
// ============================================================================
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// ============================================================================
// SOLUTION 2A: Milestone Struct
// ============================================================================
//
// struct Milestone {
//     id: u32,
//     title: String,
//     amount: u128,
//     is_completed: bool,
// }
//
// fn exercise_2a() {
//     let milestone = Milestone {
//         id: 1,
//         title: String::from("Wireframes"),
//         amount: 1000,
//         is_completed: false,
//     };
//     
//     println!("Milestone {}: {} - {} USDC", milestone.id, milestone.title, milestone.amount);
// }

// ============================================================================
// SOLUTION 2B: Status Enum
// ============================================================================
//
// #[derive(Debug, Clone)]
// enum MilestoneStatus {
//     Pending,
//     Submitted(String),  // Contains deliverable hash
//     Approved,
//     Disputed(String),   // Contains dispute reason
//     Released,
// }
//
// fn status_to_string(status: &MilestoneStatus) -> String {
//     match status {
//         MilestoneStatus::Pending => String::from("Pending"),
//         MilestoneStatus::Submitted(hash) => format!("Submitted: {}", hash),
//         MilestoneStatus::Approved => String::from("Approved"),
//         MilestoneStatus::Disputed(reason) => format!("Disputed: {}", reason),
//         MilestoneStatus::Released => String::from("Released"),
//     }
// }
//
// KEY INSIGHT: Enums can hold data! This is perfect for states that need context.
// In Ink!/Soroban, you'll use enums for contract states constantly.

// ============================================================================
// SOLUTION 2C: Pattern Matching
// ============================================================================
//
// fn process_milestone(status: MilestoneStatus) -> String {
//     match status {
//         MilestoneStatus::Pending => String::from("Waiting for work"),
//         MilestoneStatus::Submitted(hash) => format!("Review deliverable: {}", hash),
//         MilestoneStatus::Approved => String::from("Ready for payment"),
//         MilestoneStatus::Disputed(reason) => format!("Dispute: {}", reason),
//         MilestoneStatus::Released => String::from("Payment complete"),
//     }
// }
//
// KEY INSIGHT: match is EXHAUSTIVE - you must handle all variants.
// The compiler will error if you miss a case. This prevents bugs!

// ============================================================================
// SOLUTION 2D: Struct Methods
// ============================================================================
//
// struct Project {
//     id: u64,
//     client: String,
//     freelancer: String,
//     total_budget: u128,
//     released_amount: u128,
//     milestones: Vec<u128>,
//     released_milestones: Vec<bool>,
// }
//
// impl Project {
//     fn new(id: u64, client: String, freelancer: String, milestones: Vec<u128>) -> Project {
//         let total_budget: u128 = milestones.iter().sum();
//         let milestone_count = milestones.len();
//         
//         Project {
//             id,
//             client,
//             freelancer,
//             total_budget,
//             released_amount: 0,
//             milestones,
//             released_milestones: vec![false; milestone_count],
//         }
//     }
//     
//     fn remaining_balance(&self) -> u128 {
//         self.total_budget - self.released_amount
//     }
//     
//     fn release_milestone(&mut self, milestone_idx: usize) -> Result<u128, String> {
//         if milestone_idx >= self.milestones.len() {
//             return Err(String::from("Invalid milestone index"));
//         }
//         
//         if self.released_milestones[milestone_idx] {
//             return Err(String::from("Milestone already released"));
//         }
//         
//         let amount = self.milestones[milestone_idx];
//         self.released_amount += amount;
//         self.released_milestones[milestone_idx] = true;
//         
//         Ok(amount)
//     }
//     
//     fn is_complete(&self) -> bool {
//         self.released_amount == self.total_budget
//     }
// }
//
// KEY INSIGHT: impl blocks add behavior to structs.
// - &self = read-only method
// - &mut self = method that modifies state
// This maps directly to smart contract functions!
