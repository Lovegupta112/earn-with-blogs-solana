use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::BlogError;



pub fn remove_reaction(ctx:Context<RemoveReactionContext>)->Result<()>{

  let blog=&mut ctx.accounts.blog;
  let blog_reaction=&ctx.accounts.reaction;
  

  match blog_reaction.reaction {
    ReactionType::Like => {
       require!(blog.likes>0,BlogError::MinLikesReached);
       blog.likes -=1;
    }
    ReactionType::DisLike=>{
      require!(blog.dislikes>0,BlogError::MinDislikesReached);
      blog.dislikes-=1;
    }
  }
Ok(())
}


#[derive(Accounts)]
pub struct RemoveReactionContext<'info>{
  
  #[account(mut)]
  pub reaction_author:Signer<'info>,
  #[account(mut,has_one=reaction_author,close=reaction_author)]
  pub reaction:Account<'info,Reaction>,
  #[account(mut)]
  pub blog:Account<'info,Blog>
}