use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::BlogError;

pub fn remove_bookmarked_blog(ctx:Context<RemoveBookmarkedBlogContext>)->Result<()>{

    let blog=&mut ctx.accounts.blog;
     
     require!(blog.bookmarked.checked_sub(1).is_some(),BlogError::MinBookmarkReached);

     blog.bookmarked=blog.bookmarked-1;

    Ok(())
}



#[derive(Accounts)]
pub struct RemoveBookmarkedBlogContext<'info>{

    #[account(mut)]
    pub bookmark_author:Signer<'info>,
    #[account(mut,close=bookmark_author,has_one=bookmark_author)]
    pub bookmark:Account<'info,Bookmark>,
    #[account(mut)]
    pub blog:Account<'info,Blog>
}