use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Event{
    pub issuer : Pubkey , 
    pub unique_key : u64 ,  
    #[max_len(100)]
    pub event_name : String ,
    #[max_len(200)]
    pub event_id : u64,
    pub batch_size : u32 ,
    #[max_len(128)]
    pub bit_map : Vec<u8> ,
    pub merkle_root : [u8 ; 32] ,
    pub issued_timestamp: i64,
    #[max_len(128)]
    pub metadata_uri: String, 
    #[max_len(128)]
    pub template_uri: String, 
    #[max_len(128)]
    pub merkle_proof_uri: String, 
    pub remaning_certs : u64 , 
    pub issued_cert : u64 , 
    pub bump : u8 
}