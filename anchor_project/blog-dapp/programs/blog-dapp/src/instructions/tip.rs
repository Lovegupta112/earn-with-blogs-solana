use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::BlogError;



pub fn tip(ctx:Context<TipContext>,tip_value:u64)->Result<()>{
    
    let tip=&mut ctx.accounts.tip;
    let blog_pkey=ctx.accounts.blog.key();

     require!(tip.total_tip.checked_add(tip_value).is_some(),BlogError::MaxBlogTipReached);

     tip.tip_author=ctx.accounts.tip_author.key();
     tip.related_blog=blog_pkey;
     tip.total_tip+=tip_value;
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