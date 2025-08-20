use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::BlogError;

//TODO: check if user like and dislike , does it increase both for same reaction account --

pub fn add_reaction(ctx:Context<AddReactionContext>,reaction:ReactionType)->Result<()>{

    let reaction_author=ctx.accounts.reaction_author.key();
    let blog_reaction=&mut ctx.accounts.reaction;
    let blog=&mut ctx.accounts.blog;

     blog_reaction.related_blog=blog.key();
     blog_reaction.reaction_author=reaction_author;
     blog_reaction.bump=ctx.bumps.reaction;
     
     blog_reaction.reaction=match reaction {
        ReactionType::Like =>{
            require!(blog.likes.checked_add(1).is_some(),BlogError::MaxLikesReached);
            blog.likes+=1;
            ReactionType::Like
        },
        ReactionType::DisLike=>{
           require!(blog.dislikes.checked_add(1).is_some(),BlogError::MaxDislikesReached);
           blog.dislikes+=1;
           ReactionType::DisLike
       }
    };
    Ok(())
}



#[derive(Accounts)]
pub struct AddReactionContext<'info>{

    #[account(mut)]
    pub reaction_author:Signer<'info>,

    #[account(init,payer=reaction_author,space=8+Reaction::INIT_SPACE,seeds=[REACTION_SEED.as_bytes(),reaction_author.key().as_ref(),blog.key().as_ref()],bump)]
    pub reaction:Account<'info,Reaction>,

    #[account(mut)]
    pub blog:Account<'info,Blog>,

    pub system_program:Program<'info,System>
}
