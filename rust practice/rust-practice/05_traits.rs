// ============================================================================
// EXERCISE 5: TRAITS & IMPL BLOCKS
// ============================================================================
// 
// Traits define shared behavior - essential for smart contracts:
// - #[derive(Debug, Clone)] - auto-implement common traits
// - Custom traits for contract interfaces
// - impl blocks for adding methods
//
// Run: rustc 05_traits.rs -o 05_traits && ./05_traits
// ============================================================================

fn main() {
    println!("=== Exercise 5: Traits ===\n");
    
    exercise_5a();
    exercise_5b();
    exercise_5c();
    
    println!("\n✅ All exercises complete!");
}

// ----------------------------------------------------------------------------
// EXERCISE 5A: Derive Macros
// ----------------------------------------------------------------------------

// TODO: Add derive macros to make this struct:
// - Printable with {:?} (Debug)
// - Clonable (Clone)
// - Comparable (PartialEq)

// #[derive(Debug, Clone, PartialEq)]
struct Milestone {
    id: u32,
    amount: u128,
    released: bool,
}

fn exercise_5a() {
    println!("--- 5A: Derive Macros ---");
    
    // TODO: Uncomment after adding derives
    // let m1 = Milestone { id: 1, amount: 1000, released: false };
    // let m2 = m1.clone();
    // 
    // println!("Milestone: {:?}", m1);  // Needs Debug
    // println!("Are equal: {}", m1 == m2);  // Needs PartialEq
    
    println!("(Add derive macros to Milestone)");
}

// ----------------------------------------------------------------------------
// EXERCISE 5B: Custom Traits
// ----------------------------------------------------------------------------

// TODO: Define a Payable trait with these methods:
// - fn get_amount(&self) -> u128
// - fn mark_paid(&mut self)
// - fn is_paid(&self) -> bool

// trait Payable {
//     fn get_amount(&self) -> u128;
//     fn mark_paid(&mut self);
//     fn is_paid(&self) -> bool;
// }

// TODO: Implement Payable for Milestone
// impl Payable for Milestone {
//     ...
// }

fn exercise_5b() {
    println!("\n--- 5B: Custom Traits ---");
    
    // TODO: Test the trait implementation
    // let mut m = Milestone { id: 1, amount: 1000, released: false };
    // println!("Amount: {}", m.get_amount());
    // println!("Is paid: {}", m.is_paid());
    // m.mark_paid();
    // println!("Is paid after: {}", m.is_paid());
    
    println!("(Implement Payable trait)");
}

// ----------------------------------------------------------------------------
// EXERCISE 5C: Generic Functions with Trait Bounds
// ----------------------------------------------------------------------------

// TODO: Implement a generic function that works with any Payable
// fn process_payment<T: Payable>(item: &mut T) -> u128 {
//     let amount = item.get_amount();
//     item.mark_paid();
//     amount
// }

fn exercise_5c() {
    println!("\n--- 5C: Trait Bounds ---");
    
    // TODO: Use the generic function
    // let mut m = Milestone { id: 1, amount: 500, released: false };
    // let paid = process_payment(&mut m);
    // println!("Processed payment: {}", paid);
    
    println!("(Implement generic function with trait bounds)");
}

// ============================================================================
// SOLUTIONS
// ============================================================================
//
// SOLUTION 5A:
// #[derive(Debug, Clone, PartialEq)]
// struct Milestone { id: u32, amount: u128, released: bool }
//
// SOLUTION 5B:
// trait Payable {
//     fn get_amount(&self) -> u128;
//     fn mark_paid(&mut self);
//     fn is_paid(&self) -> bool;
// }
//
// impl Payable for Milestone {
//     fn get_amount(&self) -> u128 { self.amount }
//     fn mark_paid(&mut self) { self.released = true; }
//     fn is_paid(&self) -> bool { self.released }
// }
//
// SOLUTION 5C:
// fn process_payment<T: Payable>(item: &mut T) -> u128 {
//     let amount = item.get_amount();
//     item.mark_paid();
//     amount
// }
//
// KEY INSIGHT: In Ink!/Soroban, traits define contract interfaces.
// #[ink::trait_definition] and similar macros build on this concept.
