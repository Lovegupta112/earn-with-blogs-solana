use anchor_lang::prelude::*;
use crate::states::*;

pub fn remove_blog(ctx:Context<RemoveBlogContext>)->Result<()>{
    Ok(())
}


#[derive(Accounts)]
pub struct RemoveBlogContext<'info>{

    #[account(mut)]
    pub blog_author:Signer<'info>,
    #[account(mut,close=blog_author,has_one=blog_author)]
    pub blog:Account<'info,Blog>
}