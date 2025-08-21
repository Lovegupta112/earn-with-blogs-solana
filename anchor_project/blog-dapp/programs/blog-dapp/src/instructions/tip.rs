use anchor_lang::{prelude::*, system_program};
use crate::states::*;
use crate::errors::BlogError;

//TODO: can user tip mulitple times ----


pub fn tip(ctx:Context<TipContext>,tip_amt:u64)->Result<()>{
    
    let tip=&mut ctx.accounts.tip;
    let tip_author=&mut ctx.accounts.tip_author;
    let blog=&mut ctx.accounts.blog;
    let program_id= ctx.accounts.system_program.to_account_info();

    //  require!(tip.total_tip.checked_add(tip_value).is_some(),BlogError::MaxBlogTipReached);
    
    let cpi_context=CpiContext::new(program_id,system_program::Transfer{
      from:tip_author.to_account_info(),
      to:blog.to_account_info()
    });

     system_program::transfer(cpi_context, tip_amt)?;

     tip.tip_author=tip_author.key();
     tip.related_blog=blog.key();
     tip.total_tip+=tip_amt;
    Ok(())
}

#[derive(Accounts)]
pub struct TipContext<'info>{
 
  #[account(mut)]
  pub tip_author:Signer<'info>,

  #[account(init,payer=tip_author,space=8+Tip::INIT_SPACE,seeds=[BOOKMARK_SEED.as_bytes(),tip_author.key().as_ref(),blog.key().as_ref()],bump)]
  pub tip:Account<'info,Tip>,

  #[account(mut)]
  pub blog:Account<'info,Blog>,

  pub system_program:Program<'info,System>
}