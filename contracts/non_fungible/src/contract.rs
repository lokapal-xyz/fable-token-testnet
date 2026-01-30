// SPDX-License-Identifier: MIT

use soroban_sdk::{contract, contractimpl, token, Address, Env, String};
use stellar_access::ownable::{self as ownable, Ownable};
use stellar_macros::{default_impl, only_owner};
// We alias the NFT Base to avoid the "undeclared type" error
use stellar_tokens::non_fungible::{Base as NftBase, NonFungibleToken};

#[soroban_sdk::contracttype]
pub enum DataKey {
    Deposit(Address),
    NftContract,
    AssetAddress,
}

#[contract]
pub struct FableToken;

#[contractimpl]
impl FableToken {
    pub fn __constructor(e: &Env, owner: Address) {
        let uri = String::from_str(e, "https://www.lokapal.xyz/images/fable-token.png");
        let name = String::from_str(e, "FableToken");
        let symbol = String::from_str(e, "FBL");
        NftBase::set_metadata(e, uri, name, symbol);
        ownable::set_owner(e, &owner);
    }

    /// STORY LOGIC: Initialize the asset used for deposits
    pub fn init(e: Env, owner: Address, asset_address: Address) {
        owner.require_auth(); 
        e.storage().instance().set(&DataKey::AssetAddress, &asset_address);
    }

    /// STORY LOGIC: User deposits to unlock story
    pub fn deposit(e: Env, user: Address, amount: i128) {
        user.require_auth();

        // 1 XLM = 10,000,000 stroops
        let required_amount: i128 = 10_000_000; 

        if amount < required_amount {
            panic!("The Ant says: 'That is not enough for the winter!' Need at least 1 XLM.");
        }

        let asset: Address = e.storage().instance().get(&DataKey::AssetAddress).expect("Not initialized");
        let client = token::Client::new(&e, &asset);

        client.transfer(&user, &e.current_contract_address(), &amount);
        e.storage().persistent().set(&DataKey::Deposit(user), &amount);
    }

    /// STORY LOGIC: Finish story, get money back, and mint NFT
    pub fn finish_and_redeem(e: Env, user: Address) {
        user.require_auth();

        let deposit_key = DataKey::Deposit(user.clone());
        let amount: i128 = e.storage().persistent().get(&deposit_key).expect("No deposit");

        // 1. Return tokens
        let asset: Address = e.storage().instance().get(&DataKey::AssetAddress).unwrap();
        let token_client = token::Client::new(&e, &asset);
        token_client.transfer(&e.current_contract_address(), &user, &amount);

        // 2. Mint NFT directly (using the aliased NftBase)
        NftBase::sequential_mint(&e, &user);

        // 3. Cleanup
        e.storage().persistent().remove(&deposit_key);
    }

    // Standard mint function if you still want to allow manual minting by owner
    #[only_owner]
    pub fn mint(e: &Env, to: Address) {
        NftBase::sequential_mint(e, &to);
    }
}

#[default_impl]
#[contractimpl]
impl NonFungibleToken for FableToken {
    type ContractType = NftBase;
}

#[default_impl]
#[contractimpl]
impl Ownable for FableToken {}