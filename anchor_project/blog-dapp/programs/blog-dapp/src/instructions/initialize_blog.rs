use anchor_lang::prelude::*;

use crate::states::*;
use crate::errors::BlogError;


pub fn initialize_blog(ctx:Context<InitializeBlogContext>,title:String,content:String)->Result<()>{
  
  let blog=&mut ctx.accounts.blog;
  let blog_author_key=ctx.accounts.blog_author.key();

  require!(title.len()<=TITLE_LENGTH,BlogError::TitleTooLong);
  require!(content.len()<=CONTENT_LENGTH,BlogError::ContentTooLong);
  blog.blog_author=blog_author_key;
  blog.title=title;
  blog.content=content;
  blog.bump=ctx.bumps.blog;
  Ok(())
}

#[derive(Accounts)]
#[instruction(title:String)]
pub struct InitializeBlogContext<'info> {
    
    #[account(mut)]
    pub blog_author:Signer<'info>,
    #[account(init,payer=blog_author,space=8+Blog::INIT_SPACE,seeds=[BLOG_SEED.as_bytes(),
    title.as_bytes(),
    blog_author.key().as_ref()],bump)]
    pub blog:Account<'info,Blog>, 
    pub system_program:Program<'info,System>
}
