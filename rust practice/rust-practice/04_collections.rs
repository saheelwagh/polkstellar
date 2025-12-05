// ============================================================================
// EXERCISE 4: COLLECTIONS & ITERATORS
// ============================================================================
// 
// Smart contracts use collections constantly:
// - Vec<T> for lists (milestones, transactions)
// - HashMap<K, V> for mappings (balances, projects)
// - Iterators for processing data efficiently
//
// Run: rustc 04_collections.rs -o 04_collections && ./04_collections
// ============================================================================

use std::collections::HashMap;

fn main() {
    println!("=== Exercise 4: Collections & Iterators ===\n");
    
    exercise_4a();
    exercise_4b();
    exercise_4c();
    
    println!("\n✅ All exercises complete!");
}

// ----------------------------------------------------------------------------
// EXERCISE 4A: Vec<T> - Dynamic Arrays
// ----------------------------------------------------------------------------

fn exercise_4a() {
    println!("--- 4A: Vec<T> ---");
    
    // TODO: Create a Vec of milestone amounts and add items
    let mut milestones: Vec<u128> = Vec::new();
    
    // TODO: Add milestones: 1000, 2000, 1500
    // milestones.push(1000);
    // milestones.push(2000);
    // milestones.push(1500);
    
    // TODO: Calculate total using iter().sum()
    // let total: u128 = milestones.iter().sum();
    // println!("Total budget: {}", total);
    
    // TODO: Access safely with .get()
    // if let Some(first) = milestones.get(0) {
    //     println!("First milestone: {}", first);
    // }
    
    // TODO: Iterate with enumerate
    // for (i, amount) in milestones.iter().enumerate() {
    //     println!("Milestone {}: {}", i + 1, amount);
    // }
    
    println!("(Complete Vec exercises)");
    let _ = milestones;
}

// ----------------------------------------------------------------------------
// EXERCISE 4B: HashMap<K, V> - Key-Value Storage
// ----------------------------------------------------------------------------

fn exercise_4b() {
    println!("\n--- 4B: HashMap<K, V> ---");
    
    // TODO: Create balance mapping and insert values
    let mut balances: HashMap<String, u128> = HashMap::new();
    
    // TODO: Insert: GCLIENT -> 10000, GFREELANCER -> 0
    // balances.insert(String::from("GCLIENT"), 10000);
    // balances.insert(String::from("GFREELANCER"), 0);
    
    // TODO: Get balance (returns Option)
    // if let Some(b) = balances.get("GCLIENT") {
    //     println!("Client: {}", b);
    // }
    
    // TODO: Update with entry API
    // balances.entry(String::from("GFREELANCER"))
    //     .and_modify(|b| *b += 1000);
    
    println!("(Complete HashMap exercises)");
    let _ = balances;
}

// ----------------------------------------------------------------------------
// EXERCISE 4C: Iterators - Transform & Filter
// ----------------------------------------------------------------------------

fn exercise_4c() {
    println!("\n--- 4C: Iterators ---");
    
    let milestones = vec![
        ("Wireframes", 1000u128, true),
        ("UI Design", 2000, false),
        ("Development", 3000, false),
    ];
    
    // TODO: Filter to get only unreleased milestones
    // let unreleased: Vec<_> = milestones.iter()
    //     .filter(|(_, _, released)| !released)
    //     .collect();
    // println!("Unreleased count: {}", unreleased.len());
    
    // TODO: Map to get just amounts
    // let amounts: Vec<u128> = milestones.iter()
    //     .map(|(_, amount, _)| *amount)
    //     .collect();
    
    // TODO: Sum unreleased amounts
    // let pending: u128 = milestones.iter()
    //     .filter(|(_, _, released)| !released)
    //     .map(|(_, amount, _)| amount)
    //     .sum();
    // println!("Pending amount: {}", pending);
    
    println!("(Complete iterator exercises)");
    let _ = milestones;
}

// ============================================================================
// SOLUTIONS
// ============================================================================
//
// SOLUTION 4A:
// let mut milestones: Vec<u128> = Vec::new();
// milestones.push(1000);
// milestones.push(2000);
// milestones.push(1500);
// let total: u128 = milestones.iter().sum();  // 4500
//
// SOLUTION 4B:
// balances.insert(String::from("GCLIENT"), 10000);
// let balance = balances.get("GCLIENT").unwrap_or(&0);
// balances.entry(String::from("NEW")).or_insert(0);
//
// SOLUTION 4C:
// let pending: u128 = milestones.iter()
//     .filter(|(_, _, released)| !released)
//     .map(|(_, amount, _)| amount)
//     .sum();  // 5000
//
// KEY INSIGHT: Iterators are lazy and chainable.
// In smart contracts, you'll use these patterns to process storage data.
