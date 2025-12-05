// ============================================================================
// EXERCISE 1: OWNERSHIP & BORROWING
// ============================================================================
// 
// These concepts are CRITICAL for smart contracts because:
// - You'll pass addresses and amounts between functions
// - Storage reads/writes involve ownership transfers
// - Incorrect borrowing = compilation errors
//
// Run: rustc 01_ownership.rs -o 01_ownership && ./01_ownership
// ============================================================================

fn main() {
    println!("=== Exercise 1: Ownership & Borrowing ===\n");
    
    // Run each exercise
    exercise_1a();
    exercise_1b();
    exercise_1c();
    exercise_1d();
    
    println!("\n✅ All exercises complete! Check solutions at bottom of file.");
}

// ----------------------------------------------------------------------------
// EXERCISE 1A: Basic Ownership
// ----------------------------------------------------------------------------
// Problem: This code won't compile. Fix it WITHOUT changing the println! lines.
// Hint: The string is "moved" when assigned to s2
// ----------------------------------------------------------------------------

fn exercise_1a() {
    println!("--- 1A: Basic Ownership ---");
    
    let s1 = String::from("freelancer_address");
    
    // TODO: Fix this line so both println! statements work
    // Currently s1 is MOVED to s2, making s1 invalid
    let s2 = s1.clone();  // <-- Fix this line
    
    // These should both print
    // println!("s1 = {}", s1);  // Uncomment after fixing
    // println!("s2 = {}", s2);  // Uncomment after fixing
    
    // TEMPORARY: Remove these once you fix the above
    println!("s2 = {}", s2);
    println!("(s1 print commented out - fix the code!)");
}

// ----------------------------------------------------------------------------
// EXERCISE 1B: Borrowing (References)
// ----------------------------------------------------------------------------
// Problem: Complete the function that calculates escrow fee
// The function should BORROW the amount, not take ownership
// ----------------------------------------------------------------------------

fn exercise_1b() {
    println!("\n--- 1B: Borrowing ---");
    
    let escrow_amount: u128 = 1000;
    
    // TODO: Implement calculate_fee to take a reference
    // It should return 5% of the amount
    let fee = calculate_fee(&escrow_amount);
    
    // escrow_amount should still be usable here
    println!("Amount: {}, Fee: {}", escrow_amount, fee);
}

// TODO: Fix this function signature and implementation
fn calculate_fee(amount: &u128) -> u128 {
    // Return 5% of amount
    amount * 5 / 100;  // 5% fee
}

// ----------------------------------------------------------------------------
// EXERCISE 1C: Mutable References
// ----------------------------------------------------------------------------
// Problem: Implement a function that releases funds from escrow
// The function needs to MODIFY the escrow balance
// ----------------------------------------------------------------------------

fn exercise_1c() {
    println!("\n--- 1C: Mutable References ---");
    
    let mut escrow_balance: u128 = 5000;
    let release_amount: u128 = 1000;
    
    println!("Before release: {}", escrow_balance);
    
    // TODO: Implement release_funds to modify escrow_balance
    release_funds(&mut escrow_balance, release_amount);
        escrow_balance = escrow_balance - release_amount;
    println!("After release: {}", escrow_balance);
    // Should print: After release: 4000
}

// TODO: Implement this function
fn release_funds(balance: &mut u128, amount: u128) {
    // Subtract amount from balance
    // <-- Add your code here
    balance = balance - amount;
}

// ----------------------------------------------------------------------------
// EXERCISE 1D: Ownership in Structs
// ----------------------------------------------------------------------------
// Problem: Create a Project struct and implement methods that handle ownership correctly
// ----------------------------------------------------------------------------

fn exercise_1d() {
    println!("\n--- 1D: Ownership in Structs ---");
    
    // TODO: Create a Project with these values
    // - client: "GCLIENT123"
    // - freelancer: "GFREELANCER456"  
    // - budget: 10000
    
    // let project = Project { ... };
    
    // TODO: Implement a method that returns the client address WITHOUT moving it
    // let client = project.get_client();
    // println!("Client: {}", client);
    
    // TODO: The project should still be usable after getting client
    // println!("Budget: {}", project.budget);
    
    println!("(Implement Project struct to complete this exercise)");
}
struct Project {
    client: String;
    freelancer: String;
    budget: u128;
}
impl Project {
    fn get_client(&self) -> &str {
        &self.client;
    }
}
let project = Project {
        client: String::from("GCLIENT123"),
        freelancer: String::from("GFREELANCER456"),
        budget: 10000,
   };
let client = project.get_client();

println!("Client: {}", client);
println!("Budget: {}", project.budget)

// TODO: Define the Project struct
// struct Project {
//     client: String,
//     freelancer: String,
//     budget: u128,
// }

// TODO: Implement methods for Project
// impl Project {
//     fn get_client(&self) -> &str {
//         // Return a reference to client
//     }
// }


// ============================================================================
// SOLUTIONS - Try to solve exercises before looking!
// ============================================================================
// 
// Scroll down for solutions...
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
// SOLUTION 1A: Basic Ownership
// ============================================================================
// 
// fn exercise_1a() {
//     let s1 = String::from("freelancer_address");
//     let s2 = s1.clone();  // Clone creates a deep copy
//     
//     println!("s1 = {}", s1);
//     println!("s2 = {}", s2);
// }
//
// KEY INSIGHT: .clone() creates a new String with its own heap allocation
// In smart contracts, you'll often clone addresses when passing to multiple functions

// ============================================================================
// SOLUTION 1B: Borrowing
// ============================================================================
//
// fn calculate_fee(amount: &u128) -> u128 {
//     amount * 5 / 100  // 5% fee
// }
//
// KEY INSIGHT: &u128 borrows the value, allowing the caller to keep ownership
// This is how you read storage values without consuming them

// ============================================================================
// SOLUTION 1C: Mutable References
// ============================================================================
//
// fn release_funds(balance: &mut u128, amount: u128) {
//     *balance -= amount;  // Dereference with * to modify the value
// }
//
// KEY INSIGHT: &mut allows modification. The * dereferences to access the actual value.
// In Soroban/Ink!, storage modifications work similarly

// ============================================================================
// SOLUTION 1D: Ownership in Structs
// ============================================================================
//
// struct Project {
//     client: String,
//     freelancer: String,
//     budget: u128,
// }
//
// impl Project {
//     fn get_client(&self) -> &str {
//         &self.client  // Return a string slice (borrowed)
//     }
// }
//
// fn exercise_1d() {
//     let project = Project {
//         client: String::from("GCLIENT123"),
//         freelancer: String::from("GFREELANCER456"),
//         budget: 10000,
//     };
//     
//     let client = project.get_client();
//     println!("Client: {}", client);
//     println!("Budget: {}", project.budget);  // Still works!
// }
//
// KEY INSIGHT: &self borrows the struct, &str borrows the string
// This pattern is used constantly in smart contracts for getters
