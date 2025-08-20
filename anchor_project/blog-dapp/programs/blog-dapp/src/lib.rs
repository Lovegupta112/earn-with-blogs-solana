#![allow(unexpected_cfgs)]

use crate::instructions::*;
use anchor_lang::prelude::*;
pub mod states;
pub mod instructions;
pub mod errors;
pub mod events;

declare_id!("BmP9bJB3z33LfU23a2P6aybyZLnNFrZdBZfptgfihRiX");

//TODO: add event after successfull add,delete,edit ---

#[program]
pub mod blog_dapp {

    use super::*;

    pub fn initialize(ctx: Context<InitializeBlogContext>,title:String,content:String) -> Result<()> {
       initialize_blog(ctx, title, content)
    }
     pub fn update_blog(ctx:Context<EditBlogContext>,content:String)->Result<()>{
        edit_blog(ctx,content)
    }
     pub fn save_blog(ctx:Context<BookmarkBlogContext>)->Result<()>{
        bookmarked_blog(ctx)
    }
     pub fn delete_blog(ctx:Context<RemoveBlogContext>)->Result<()>{
        remove_blog(ctx)
    }

    pub fn tip_from_blog(ctx:Context<TipContext>,tip_value:u64)->Result<()>{
        tip(ctx,tip_value)
    }

    
     pub fn like_blog(ctx:Context<AddReactionContext>)->Result<()>{
        add_reaction(ctx, states::ReactionType::Like)
    }
    pub fn dislike_blog(ctx:Context<AddReactionContext>)->Result<()>{
        add_reaction(ctx, states::ReactionType::DisLike)
    }
    pub fn comment_blog(ctx:Context<AddCommentContext>,content:String)->Result<()>{
        add_comment(ctx, content)
    }
    pub fn remove_comment_blog(ctx:Context<RemoveCommentContext>)->Result<()>{
        remove_comment(ctx)
    }
   
   
    
}

