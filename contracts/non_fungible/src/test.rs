#![cfg(test)]

extern crate std;

use soroban_sdk::{ testutils::Address as _, Address, Env, String };

use crate::contract::{ FableToken, FableTokenClient };

#[test]
fn initial_state() {
    let env = Env::default();

    let contract_addr = env.register(FableToken, (Address::generate(&env),));
    let client = FableTokenClient::new(&env, &contract_addr);

    assert_eq!(client.name(), String::from_str(&env, "FableToken"));
}

// Add more tests bellow
