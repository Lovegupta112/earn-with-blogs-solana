use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash;
use crate::states::*;
use crate::errors::BlogError;

pub fn add_comment(ctx:Context<AddCommentContext>,content:String)->Result<()>{

    let comment=&mut ctx.accounts.comment;
    let comment_author=ctx.accounts.comment_author.key();
    let blog=&ctx.accounts.blog;

    require!(content.len()<=COMMENT_LENGTH,BlogError::CommentTooLong);

    comment.comment_author=comment_author;
    comment.related_blog=blog.key();
    comment.content=content;
    Ok(())
}

#[derive(Accounts)]
#[instruction(comment_content:String)]
pub struct AddCommentContext<'info>{

  #[account(mut)]
  pub comment_author:Signer<'info>,

  #[account(init,payer=comment_author,space=8+Comment::INIT_SPACE,seeds=[COMMENT_SEED.as_bytes(),{hash::hash(comment_content.as_bytes()).as_ref()},comment_author.key().as_ref(),blog.key().as_ref()],bump)]
  pub comment:Account<'info,Comment>,

  #[account(mut)]
  pub  blog:Account<'info,Blog>,

  pub system_program:Program<'info,System>

}


