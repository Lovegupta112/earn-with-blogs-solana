use anchor_lang::prelude::*;
use crate::states::*;

// todo: hit event after bookmark ---

pub fn bookmarked_blog(ctx:Context<BookmarkBlogContext>)->Result<()>{

 let bookmark=&mut ctx.accounts.bookmark;
 let blog_key=ctx.accounts.blog.key();

  bookmark.bookmark_author=ctx.accounts.bookmark_author.key();
  bookmark.related_blog=blog_key;
  bookmark.bump=ctx.bumps.bookmark;
  Ok(())
}

#[derive(Accounts)]
pub struct BookmarkBlogContext<'info>{

    #[account(mut)]
    pub bookmark_author:Signer<'info>,

    #[account(init,payer=bookmark_author,space=8+Bookmark::INIT_SPACE,seeds=[BOOKMARK_SEED.as_bytes(),bookmark_author.key().as_ref(),blog.key().as_ref()],bump)]
    pub bookmark:Account<'info,Bookmark>,

    pub blog:Account<'info,Blog>,
    pub system_program:Program<'info,System>
}