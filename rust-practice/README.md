# 🦀 Rust Practice Exercises for FreelanceEscrow

These exercises cover the Rust concepts you'll need for building Soroban and Ink! smart contracts.

## Exercise Structure

Each file contains:
1. **Concept explanation** - What you're learning
2. **TODO exercises** - Code to complete
3. **Hints** - If you get stuck
4. **Solutions** - At the bottom (try not to peek!)

## Recommended Order

| # | File | Concepts | Time |
|---|------|----------|------|
| 1 | `01_ownership.rs` | Ownership, borrowing, references | 20 min |
| 2 | `02_structs_enums.rs` | Structs, enums, pattern matching | 25 min |
| 3 | `03_error_handling.rs` | Result, Option, ? operator | 20 min |
| 4 | `04_collections.rs` | Vec, HashMap, iterators | 20 min |
| 5 | `05_traits.rs` | Traits, impl blocks, derive | 15 min |
| 6 | `06_smart_contract_patterns.rs` | Storage, events, access control | 25 min |

**Total practice time: ~2 hours**

## How to Run

```bash
# Run a specific exercise
cd rust-practice
rustc 01_ownership.rs -o 01_ownership && ./01_ownership

# Or use cargo (if you set up a project)
cargo run --bin 01_ownership
```

## Quick Rust Cheat Sheet

### Ownership Rules
- Each value has one owner
- When owner goes out of scope, value is dropped
- Use `&` for borrowing (read-only)
- Use `&mut` for mutable borrowing

### Common Patterns in Smart Contracts

```rust
// Storage map (like HashMap)
let mut balances: Map<Address, u128> = Map::new();

// Option handling
match maybe_value {
    Some(v) => use_value(v),
    None => handle_missing(),
}

// Result handling
fn transfer() -> Result<(), Error> {
    let balance = get_balance()?;  // ? propagates errors
    Ok(())
}

// Enum for states
enum Status {
    Pending,
    Approved,
    Rejected,
}
```

## Tips

1. **Compiler is your friend** - Read error messages carefully
2. **Clone when stuck** - Add `.clone()` to fix borrow errors (optimize later)
3. **Use `dbg!()` macro** - Quick debugging without println formatting
4. **Pattern match everything** - Rust loves exhaustive matching

Good luck! 🚀
