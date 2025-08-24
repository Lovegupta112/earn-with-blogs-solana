use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::BlogError;

// todo: hit event after bookmark ---

pub fn bookmarked_blog(ctx:Context<BookmarkBlogContext>)->Result<()>{

 let bookmark=&mut ctx.accounts.bookmark;
 let blog=&mut ctx.accounts.blog;

  require!(blog.bookmarked.checked_add(1).is_some(),BlogError::MaxBookmarkReached);

  bookmark.bookmark_author=ctx.accounts.bookmark_author.key();
  bookmark.related_blog=blog.key();
  bookmark.bump=ctx.bumps.bookmark;
  blog.bookmarked+=1;

  Ok(())
}

#[derive(Accounts)]
pub struct BookmarkBlogContext<'info>{

    #[account(mut)]
    pub bookmark_author:Signer<'info>,

    #[account(init,payer=bookmark_author,space=8+Bookmark::INIT_SPACE,seeds=[BOOKMARK_SEED.as_bytes(),bookmark_author.key().as_ref(),blog.key().as_ref()],bump)]
    pub bookmark:Account<'info,Bookmark>,

    #[account(mut)]
    pub blog:Account<'info,Blog>,
    pub system_program:Program<'info,System>
}