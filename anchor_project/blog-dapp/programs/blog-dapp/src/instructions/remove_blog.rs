use anchor_lang::prelude::*;
use crate::states::*;

//TODO : check while deleting blog , have to close comment and reaction and bookmark account too 
pub fn remove_blog(_ctx:Context<RemoveBlogContext>)->Result<()>{
    Ok(())
}


#[derive(Accounts)]
pub struct RemoveBlogContext<'info>{

    #[account(mut)]
    pub blog_author:Signer<'info>,
    #[account(mut,close=blog_author,has_one=blog_author)]
    pub blog:Account<'info,Blog>

    
}