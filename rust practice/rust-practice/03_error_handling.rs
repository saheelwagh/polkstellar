// ============================================================================
// EXERCISE 3: ERROR HANDLING
// ============================================================================
// 
// Smart contracts MUST handle errors gracefully:
// - Insufficient funds? Return error, don't panic
// - Invalid address? Return error, don't crash
// - Unauthorized? Return error with message
//
// Rust uses Result<T, E> and Option<T> instead of exceptions
//
// Run: rustc 03_error_handling.rs -o 03_error_handling && ./03_error_handling
// ============================================================================

fn main() {
    println!("=== Exercise 3: Error Handling ===\n");
    
    exercise_3a();
    exercise_3b();
    exercise_3c();
    exercise_3d();
    
    println!("\n✅ All exercises complete!");
}

// ----------------------------------------------------------------------------
// EXERCISE 3A: Option<T> - Handling Missing Values
// ----------------------------------------------------------------------------
// Option represents a value that might not exist
// - Some(value) = value exists
// - None = value is missing
// ----------------------------------------------------------------------------

fn exercise_3a() {
    println!("--- 3A: Option<T> ---");
    
    // Simulated storage - like a smart contract's state
    let balances: Vec<(&str, u128)> = vec![
        ("GCLIENT123", 5000),
        ("GFREELANCER456", 1200),
    ];
    
    // TODO: Implement get_balance that returns Option<u128>
    // Return Some(balance) if address found, None if not
    
    // let balance1 = get_balance(&balances, "GCLIENT123");
    // let balance2 = get_balance(&balances, "GUNKNOWN");
    
    // TODO: Handle the Option properly
    // match balance1 {
    //     Some(b) => println!("GCLIENT123 balance: {}", b),
    //     None => println!("GCLIENT123 not found"),
    // }
    
    // TODO: Use if let for cleaner code
    // if let Some(b) = balance2 {
    //     println!("GUNKNOWN balance: {}", b);
    // } else {
    //     println!("GUNKNOWN not found");
    // }
    
    println!("(Implement get_balance to complete)");
}

// TODO: Implement this function
// fn get_balance(balances: &[(&str, u128)], address: &str) -> Option<u128> {
//     ...
// }

// ----------------------------------------------------------------------------
// EXERCISE 3B: Result<T, E> - Handling Operations That Can Fail
// ----------------------------------------------------------------------------
// Result represents success or failure
// - Ok(value) = operation succeeded
// - Err(error) = operation failed
// ----------------------------------------------------------------------------

fn exercise_3b() {
    println!("\n--- 3B: Result<T, E> ---");
    
    // TODO: Implement transfer that returns Result<(), String>
    // Should fail if:
    // - from_balance < amount (insufficient funds)
    // - amount == 0 (invalid amount)
    
    let mut client_balance: u128 = 5000;
    let mut freelancer_balance: u128 = 0;
    
    // Test successful transfer
    // match transfer(&mut client_balance, &mut freelancer_balance, 1000) {
    //     Ok(()) => println!("Transfer successful!"),
    //     Err(e) => println!("Transfer failed: {}", e),
    // }
    // println!("Client: {}, Freelancer: {}", client_balance, freelancer_balance);
    
    // Test failed transfer (insufficient funds)
    // match transfer(&mut client_balance, &mut freelancer_balance, 10000) {
    //     Ok(()) => println!("Transfer successful!"),
    //     Err(e) => println!("Transfer failed: {}", e),
    // }
    
    println!("(Implement transfer to complete)");
    
    // Suppress unused variable warnings for now
    let _ = client_balance;
    let _ = freelancer_balance;
}

// TODO: Implement this function
// fn transfer(from: &mut u128, to: &mut u128, amount: u128) -> Result<(), String> {
//     ...
// }

// ----------------------------------------------------------------------------
// EXERCISE 3C: The ? Operator - Propagating Errors
// ----------------------------------------------------------------------------
// The ? operator is syntactic sugar for error propagation
// It returns early if there's an error
// ----------------------------------------------------------------------------

fn exercise_3c() {
    println!("\n--- 3C: The ? Operator ---");
    
    // TODO: Implement release_milestone that uses ? to propagate errors
    // It should:
    // 1. Validate milestone exists (using validate_milestone)
    // 2. Check authorization (using check_authorization)
    // 3. Process payment (using process_payment)
    // Each step can fail, use ? to propagate
    
    // match release_milestone(1, "GCLIENT", 1000) {
    //     Ok(()) => println!("Milestone released!"),
    //     Err(e) => println!("Failed: {}", e),
    // }
    
    // match release_milestone(99, "GCLIENT", 1000) {
    //     Ok(()) => println!("Milestone released!"),
    //     Err(e) => println!("Failed: {}", e),
    // }
    
    println!("(Implement release_milestone with ? operator to complete)");
}

// Helper functions (already implemented)
fn validate_milestone(milestone_id: u32) -> Result<(), String> {
    if milestone_id > 0 && milestone_id <= 10 {
        Ok(())
    } else {
        Err(format!("Invalid milestone ID: {}", milestone_id))
    }
}

fn check_authorization(caller: &str) -> Result<(), String> {
    let authorized = vec!["GCLIENT", "GADMIN"];
    if authorized.contains(&caller) {
        Ok(())
    } else {
        Err(format!("Unauthorized caller: {}", caller))
    }
}

fn process_payment(amount: u128) -> Result<(), String> {
    if amount > 0 && amount <= 10000 {
        Ok(())
    } else {
        Err(format!("Invalid amount: {}", amount))
    }
}

// TODO: Implement this function using ? operator
// fn release_milestone(milestone_id: u32, caller: &str, amount: u128) -> Result<(), String> {
//     validate_milestone(milestone_id)?;
//     check_authorization(caller)?;
//     process_payment(amount)?;
//     Ok(())
// }

// ----------------------------------------------------------------------------
// EXERCISE 3D: Custom Error Types
// ----------------------------------------------------------------------------
// In real smart contracts, you define custom error enums
// ----------------------------------------------------------------------------

fn exercise_3d() {
    println!("\n--- 3D: Custom Error Types ---");
    
    // TODO: Define an EscrowError enum with variants:
    // - InsufficientFunds { required: u128, available: u128 }
    // - Unauthorized { caller: String }
    // - InvalidMilestone { id: u32 }
    // - AlreadyReleased
    
    // TODO: Implement a function that returns Result<(), EscrowError>
    
    // match do_release(1, "GCLIENT", 5000, 1000) {
    //     Ok(()) => println!("Success!"),
    //     Err(EscrowError::InsufficientFunds { required, available }) => {
    //         println!("Need {} but only have {}", required, available);
    //     }
    //     Err(EscrowError::Unauthorized { caller }) => {
    //         println!("{} is not authorized", caller);
    //     }
    //     Err(e) => println!("Other error: {:?}", e),
    // }
    
    println!("(Define EscrowError enum to complete)");
}

// TODO: Define custom error enum
// #[derive(Debug)]
// enum EscrowError {
//     InsufficientFunds { required: u128, available: u128 },
//     Unauthorized { caller: String },
//     InvalidMilestone { id: u32 },
//     AlreadyReleased,
// }


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
// SOLUTION 3A: Option<T>
// ============================================================================
//
// fn get_balance(balances: &[(&str, u128)], address: &str) -> Option<u128> {
//     for (addr, balance) in balances {
//         if *addr == address {
//             return Some(*balance);
//         }
//     }
//     None
// }
//
// // Alternative using iterator:
// fn get_balance_v2(balances: &[(&str, u128)], address: &str) -> Option<u128> {
//     balances.iter()
//         .find(|(addr, _)| *addr == address)
//         .map(|(_, balance)| *balance)
// }
//
// KEY INSIGHT: Option forces you to handle the "not found" case.
// In smart contracts, storage lookups often return Option.

// ============================================================================
// SOLUTION 3B: Result<T, E>
// ============================================================================
//
// fn transfer(from: &mut u128, to: &mut u128, amount: u128) -> Result<(), String> {
//     if amount == 0 {
//         return Err(String::from("Amount must be greater than 0"));
//     }
//     
//     if *from < amount {
//         return Err(format!("Insufficient funds: have {}, need {}", from, amount));
//     }
//     
//     *from -= amount;
//     *to += amount;
//     
//     Ok(())
// }
//
// KEY INSIGHT: Result makes error handling explicit.
// The caller MUST handle both Ok and Err cases.

// ============================================================================
// SOLUTION 3C: The ? Operator
// ============================================================================
//
// fn release_milestone(milestone_id: u32, caller: &str, amount: u128) -> Result<(), String> {
//     validate_milestone(milestone_id)?;  // Returns early if Err
//     check_authorization(caller)?;        // Returns early if Err
//     process_payment(amount)?;            // Returns early if Err
//     
//     println!("Processing milestone {} for {} USDC", milestone_id, amount);
//     Ok(())
// }
//
// // Without ? operator, it would look like this:
// fn release_milestone_verbose(milestone_id: u32, caller: &str, amount: u128) -> Result<(), String> {
//     match validate_milestone(milestone_id) {
//         Ok(()) => {},
//         Err(e) => return Err(e),
//     }
//     match check_authorization(caller) {
//         Ok(()) => {},
//         Err(e) => return Err(e),
//     }
//     match process_payment(amount) {
//         Ok(()) => {},
//         Err(e) => return Err(e),
//     }
//     Ok(())
// }
//
// KEY INSIGHT: ? is essential for clean smart contract code.
// It propagates errors without verbose match statements.

// ============================================================================
// SOLUTION 3D: Custom Error Types
// ============================================================================
//
// #[derive(Debug)]
// enum EscrowError {
//     InsufficientFunds { required: u128, available: u128 },
//     Unauthorized { caller: String },
//     InvalidMilestone { id: u32 },
//     AlreadyReleased,
// }
//
// fn do_release(
//     milestone_id: u32,
//     caller: &str,
//     available: u128,
//     required: u128
// ) -> Result<(), EscrowError> {
//     // Check milestone
//     if milestone_id == 0 || milestone_id > 10 {
//         return Err(EscrowError::InvalidMilestone { id: milestone_id });
//     }
//     
//     // Check authorization
//     if caller != "GCLIENT" && caller != "GADMIN" {
//         return Err(EscrowError::Unauthorized { caller: caller.to_string() });
//     }
//     
//     // Check funds
//     if available < required {
//         return Err(EscrowError::InsufficientFunds { required, available });
//     }
//     
//     Ok(())
// }
//
// KEY INSIGHT: Custom error enums are the standard in Soroban and Ink!
// They provide type-safe, descriptive errors that frontends can parse.
//
// In Soroban, you'd use:
// #[contracterror]
// pub enum Error {
//     InsufficientFunds = 1,
//     Unauthorized = 2,
// }
//
// In Ink!, you'd use:
// #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
// pub enum Error {
//     InsufficientFunds,
//     Unauthorized,
// }
