use anchor_lang::{prelude::*};

use crate::states::Event;
use crate::errors::ErrorCode ;

#[derive(Accounts)] 
#[instruction(unique_key : u64 )]
pub struct ClaimCert<'info>{
    #[account(mut)]
    pub issuer : Signer<'info> ,

    #[account(
        mut ,
        seeds = [b"event" , issuer.key().as_ref() ,  &unique_key.to_le_bytes() ] ,
        bump 
    )]
    pub event : Account<'info , Event> ,
    pub system_program : Program<'info , System> ,
}

pub fn handler(ctx:Context<ClaimCert> , cert_id : u32 )->Result<()>{
    let event = &mut ctx.accounts.event ;
    let byte_index = (cert_id as u128).checked_div(8 as u128).ok_or(ErrorCode::MathOverflow)? as usize  ;
    let bit_index : u8 = (cert_id % 8) as u8 ;

    let mask = 1 << bit_index ;
    require!((event.bit_map[byte_index] & mask) == 0 , ErrorCode::AlreadyClaimed ) ;
    event.bit_map[byte_index] = event.bit_map[byte_index] | mask ;
    event.issued_cert = event.issued_cert.checked_add(1).ok_or(ErrorCode::MathOverflow)?;
    Ok(())
}