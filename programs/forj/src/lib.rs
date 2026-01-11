use anchor_lang::prelude::*;

declare_id!("8DUw9b9nwoXH6FuqBUGy7dknzpDy1Ljh94rwKYNdEHRb");
pub mod instructions;
pub mod states;

pub mod errors;

use instructions::*;
use errors::* ;
#[program]
pub mod forj {
    use super::*;

    pub fn init_event(ctx: Context<InitEvent> ,unique_key : u64 , event_name : String, event_id : u64 ,batch_size : u32 ,bit_map : Vec<u8> ,merkle_root : [u8;32] , metadata_uri : String , template_uri : String , merkle_proof_uri : String) -> Result<()> {
        instructions::init_event::handler(ctx ,unique_key ,  event_name , event_id ,batch_size ,bit_map ,merkle_root , metadata_uri , template_uri , merkle_proof_uri) ;
        Ok(())
    }

    pub fn claim(ctx: Context<ClaimCert> ,unique_key : u64 , cert_id : u32) -> Result<()> {
        instructions::claim::handler(ctx ,cert_id) ;
        Ok(())
    }

}
