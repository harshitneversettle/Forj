use anchor_lang::{prelude::*};

use crate::states::Event;

#[derive(Accounts)] 
#[instruction(unique_key : u64 )]
pub struct InitEvent<'info>{
    #[account(mut)]
    pub issuer : Signer<'info> ,

    #[account(
        init ,
        payer = issuer ,
        space = 8 + Event::INIT_SPACE ,
        seeds = [b"event" , issuer.key().as_ref() ,  &unique_key.to_le_bytes() ] ,
        bump 
    )]
    pub new_event : Account<'info , Event> ,
    pub system_program : Program<'info , System> ,
}

pub fn handler(ctx:Context<InitEvent> ,unique_key : u64 , event_name : String, event_id : u64 ,batch_size : u32 ,bit_map : Vec<u8> , merkle_root : [u8;32] , metadata_uri : String , template_uri : String , merkle_proof_uri : String )->Result<()>{
    let event = &mut ctx.accounts.new_event ;
    event.issuer = ctx.accounts.issuer.key() ;
    event.unique_key = unique_key ;
    event.event_name = event_name ;
    event.event_id = event_id ;
    event.batch_size = batch_size ;
    event.bit_map = bit_map ;
    event.merkle_root = merkle_root ;
    event.issued_timestamp = Clock::get()?.unix_timestamp ;
    event.metadata_uri = metadata_uri ;
    event.template_uri = template_uri ;
    event.merkle_proof_uri = merkle_proof_uri ;
    event.remaning_certs = batch_size as u64 ;
    event.issued_cert = 0 ;
    event.bump = ctx.bumps.new_event ;
    Ok(())
}